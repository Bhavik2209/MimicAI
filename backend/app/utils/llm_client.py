"""Async LLM helpers supporting multiple providers (Gemini, Groq)."""

import asyncio
import logging
import os
from collections.abc import AsyncGenerator
from typing import Literal

from google import genai
from google.genai import types
import requests
from groq import AsyncGroq, Groq

from app.config import settings

logger = logging.getLogger(__name__)

Role = Literal["system", "user", "assistant"]
ChatMessage = dict[str, str]

_gemini_client: genai.Client | None = None
_groq_client: Groq | None = None
_groq_async_client: AsyncGroq | None = None


def _get_groq_client() -> Groq:
	"""Create and cache Groq client."""
	global _groq_client
	if _groq_client is None:
		# Try settings then direct environment variable
		key = settings.groq_api_key or os.getenv("GROQ_API_KEY")
		if not key:
			has_settings = bool(settings.groq_api_key)
			has_env = "GROQ_API_KEY" in os.environ
			raise ValueError(f"GROQ_API_KEY is not configured. (Settings: {has_settings}, Env: {has_env})")
		_groq_client = Groq(api_key=key)
	return _groq_client


def estimate_tokens(text: str) -> int:
	"""Rough token estimation: ~1 token per 4 characters for English."""
	return max(1, len(text) // 4)


def _get_gemini_client() -> genai.Client:
	"""Create and cache Gemini client."""
	global _gemini_client
	if _gemini_client is None:
		if not settings.gemini_api_key:
			raise ValueError("GEMINI_API_KEY is not configured")
		_gemini_client = genai.Client(api_key=settings.gemini_api_key)
	return _gemini_client


def _extract_response_text(response: object) -> str:
	"""Extract text from Gemini response object across SDK variants."""
	text = getattr(response, "text", None)
	if text:
		return text

	candidates = getattr(response, "candidates", None) or []
	chunks: list[str] = []
	for candidate in candidates:
		content = getattr(candidate, "content", None)
		if content is None:
			continue
		parts = getattr(content, "parts", None) or []
		for part in parts:
			part_text = getattr(part, "text", None)
			if part_text:
				chunks.append(part_text)

	return "\n".join(chunks).strip()


def _generate_text_gemini_sync(
	prompt: str,
	system_instruction: str | None,
	temperature: float,
	max_output_tokens: int,
) -> str:
	"""Synchronous Gemini LLM call."""
	if not prompt.strip():
		raise ValueError("Prompt cannot be empty")

	config = types.GenerateContentConfig(
		temperature=temperature,
		max_output_tokens=max_output_tokens,
		system_instruction=system_instruction or None,
	)

	response = _get_gemini_client().models.generate_content(
		model=settings.llm_model,
		contents=prompt,
		config=config,
	)
	text = _extract_response_text(response)
	if not text:
		raise ValueError("Gemini returned an empty response")
	return text


def _generate_text_groq_sync(
	prompt: str,
	system_instruction: str | None,
	temperature: float,
	max_output_tokens: int,
	top_p: float = 0.95,
	reasoning_effort: str = "default",
) -> str:
	"""Synchronous Groq LLM call using the groq library."""
	if not prompt.strip():
		raise ValueError("Prompt cannot be empty")

	client = _get_groq_client()

	messages = []
	if system_instruction:
		messages.append({"role": "system", "content": system_instruction})
	messages.append({"role": "user", "content": prompt})

	# Use model-specific parameters if it's a Qwen model
	model = settings.groq_model
	is_qwen = "qwen" in model.lower()

	kwargs = {
		"model": model,
		"messages": messages,
		"temperature": temperature,
		"max_completion_tokens": max_output_tokens,
		"top_p": top_p,
		"stream": False,
	}

	if is_qwen:
		kwargs["reasoning_effort"] = reasoning_effort

	completion = client.chat.completions.create(**kwargs)
	text = completion.choices[0].message.content or ""
	
	if not text.strip():
		raise ValueError("Groq returned an empty response")
	return text.strip()


def _to_gemini_contents(messages: list[ChatMessage]) -> tuple[str | None, list[types.Content]]:
	"""Convert simple chat messages to Gemini contents and system instruction."""
	system_chunks: list[str] = []
	contents: list[types.Content] = []

	for message in messages:
		role = message.get("role", "user")
		content = message.get("content", "")
		if not content.strip():
			continue

		if role == "system":
			system_chunks.append(content)
			continue

		gemini_role = "model" if role == "assistant" else "user"
		contents.append(
			types.Content(
				role=gemini_role,
				parts=[types.Part.from_text(text=content)],
			)
		)

	system_instruction = "\n".join(system_chunks).strip() or None
	return system_instruction, contents


def _chat_gemini_sync(
	messages: list[ChatMessage],
	temperature: float,
	max_output_tokens: int,
) -> str:
	"""Synchronous chat-style generation using Gemini."""
	system_instruction, contents = _to_gemini_contents(messages)
	if not contents:
		raise ValueError("At least one non-system message is required")

	config = types.GenerateContentConfig(
		temperature=temperature,
		max_output_tokens=max_output_tokens,
		system_instruction=system_instruction,
	)

	response = _get_gemini_client().models.generate_content(
		model=settings.llm_model,
		contents=contents,
		config=config,
	)
	text = _extract_response_text(response)
	if not text:
		raise ValueError("Gemini returned an empty response")
	return text


async def generate_text_gemini(
	prompt: str,
	system_instruction: str | None = None,
	temperature: float = 0.2,
	max_output_tokens: int = 2048,
	system_prompt: str | None = None,
) -> str:
	"""Generate text from a single prompt using Gemini."""
	sys_inst = system_instruction or system_prompt
	return await asyncio.to_thread(
		_generate_text_gemini_sync,
		prompt,
		sys_inst,
		temperature,
		max_output_tokens,
	)


async def generate_text_groq(
	prompt: str,
	system_instruction: str | None = None,
	temperature: float = 0.2,
	max_output_tokens: int = 2048,
	top_p: float = 0.95,
	reasoning_effort: str = "default",
	system_prompt: str | None = None,
) -> str:
	"""Generate text from a single prompt using Groq."""
	sys_inst = system_instruction or system_prompt
	return await asyncio.to_thread(
		_generate_text_groq_sync,
		prompt,
		sys_inst,
		temperature,
		max_output_tokens,
		top_p,
		reasoning_effort,
	)


async def generate_text(
	prompt: str,
	system_instruction: str | None = None,
	temperature: float = 0.2,
	max_output_tokens: int = 2048,
	provider: Literal["gemini", "groq"] = "gemini",
	top_p: float = 0.95,
	reasoning_effort: str = "default",
	system_prompt: str | None = None,
) -> str:
	"""Generate text from a single prompt using specified provider."""
	sys_inst = system_instruction or system_prompt
	if provider == "groq":
		return await generate_text_groq(
			prompt=prompt,
			system_instruction=sys_inst,
			temperature=temperature,
			max_output_tokens=max_output_tokens,
			top_p=top_p,
			reasoning_effort=reasoning_effort,
		)
	return await generate_text_gemini(
		prompt=prompt,
		system_instruction=sys_inst,
		temperature=temperature,
		max_output_tokens=max_output_tokens
	)


def _chat_groq_sync(
	messages: list[ChatMessage],
	temperature: float,
	max_output_tokens: int,
	top_p: float = 0.95,
	reasoning_effort: str = "default",
) -> str:
	"""Synchronous multi-turn chat using Groq (supports system/user/assistant history)."""
	if not messages:
		raise ValueError("At least one message is required")

	client = _get_groq_client()
	model = settings.groq_model
	is_qwen = "qwen" in model.lower()

	# Build the messages list — filter out any empty content
	groq_messages = [
		{"role": m.get("role", "user"), "content": m.get("content", "")}
		for m in messages
		if m.get("content", "").strip()
	]
	if not groq_messages:
		raise ValueError("All messages were empty")

	kwargs: dict = {
		"model": model,
		"messages": groq_messages,
		"temperature": temperature,
		"max_completion_tokens": max_output_tokens,
		"top_p": top_p,
		"stream": False,
	}
	if is_qwen:
		kwargs["reasoning_effort"] = reasoning_effort

	completion = client.chat.completions.create(**kwargs)
	text = completion.choices[0].message.content or ""
	if not text.strip():
		raise ValueError("Groq returned an empty response")
	return text.strip()


async def chat_groq(
	messages: list[ChatMessage],
	temperature: float = 0.6,
	max_output_tokens: int = 1500,
	top_p: float = 0.95,
	reasoning_effort: str = "default",
) -> str:
	"""Async multi-turn chat using Groq/Qwen — intended for persona chat."""
	return await asyncio.to_thread(
		_chat_groq_sync,
		messages,
		temperature,
		max_output_tokens,
		top_p,
		reasoning_effort,
	)


async def chat(
	messages: list[ChatMessage],
	temperature: float = 0.2,
	max_output_tokens: int = 2048,
	provider: Literal["gemini", "groq"] = "gemini",
) -> str:
	"""Generate a response from chat messages using the specified provider."""
	if provider == "groq":
		return await chat_groq(messages, temperature=temperature, max_output_tokens=max_output_tokens)
	return await asyncio.to_thread(_chat_gemini_sync, messages, temperature, max_output_tokens)


def _get_groq_async_client() -> AsyncGroq:
	"""Create and cache a singleton AsyncGroq client."""
	global _groq_async_client
	if _groq_async_client is None:
		key = settings.groq_api_key or os.getenv("GROQ_API_KEY")
		if not key:
			raise ValueError("GROQ_API_KEY is not configured")
		_groq_async_client = AsyncGroq(api_key=key)
	return _groq_async_client


async def chat_groq_stream(
	messages: list[ChatMessage],
	temperature: float = 0.65,
	max_output_tokens: int = 1200,
	top_p: float = 0.95,
	reasoning_effort: str = "default",
) -> AsyncGenerator[str, None]:
	"""Async generator that streams tokens from Groq/Qwen in real time.

	Yields individual decoded text tokens as they arrive from the API so
	callers can forward them immediately via SSE.

	Also strips <think>...</think> reasoning blocks (buffered, handles tags
	split across chunk boundaries) so the user only sees clean output.
	"""
	client = _get_groq_async_client()
	model = settings.groq_model
	is_qwen = "qwen" in model.lower()

	groq_messages = [
		{"role": m.get("role", "user"), "content": m.get("content", "")}
		for m in messages
		if m.get("content", "").strip()
	]
	if not groq_messages:
		return

	kwargs: dict = {
		"model": model,
		"messages": groq_messages,
		"temperature": temperature,
		"max_completion_tokens": max_output_tokens,
		"top_p": top_p,
		"stream": True,
	}
	if is_qwen:
		kwargs["reasoning_effort"] = reasoning_effort

	stream = await client.chat.completions.create(**kwargs)

	# Buffered think-tag stripper
	# We accumulate text and strip anything between <think> and </think>
	# even when the tags are split across multiple chunks.
	buf = ""
	in_think = False

	async for chunk in stream:
		delta = chunk.choices[0].delta.content or ""
		if not delta:
			continue

		buf += delta

		# Process the buffer — yield clean text, skip think sections
		while True:
			if in_think:
				end_idx = buf.find("</think>")
				if end_idx == -1:
					# Still inside think block; discard everything buffered so far
					buf = ""
					break
				# Found closing tag — discard the think content, keep the rest
				buf = buf[end_idx + len("</think>"):]
				in_think = False
			else:
				start_idx = buf.find("<think>")
				if start_idx == -1:
					# No think block in buffer — yield and clear
					if buf:
						yield buf
					buf = ""
					break
				# Found an opening tag — yield content before it, then enter think mode
				if start_idx > 0:
					yield buf[:start_idx]
				buf = buf[start_idx + len("<think>"):]
				in_think = True

	# Yield any remaining clean text
	if buf and not in_think:
		yield buf

