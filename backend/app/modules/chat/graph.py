"""LangGraph pipeline for persona chat turns."""

from __future__ import annotations

import logging
from typing import Any, TypedDict
from uuid import UUID

from fastapi import HTTPException, status
from langgraph.graph import END, StateGraph
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.chat import context_loader, memory_manager, retriever
from app.modules.chat import memory_provider
from app.modules.chat.web_search import search_web_context
from app.db.models.entity import Entity
from app.prompts.chat.persona import (
	build_memory_context_block,
	build_retrieved_context_block,
	build_web_search_context_block,
)
from app.config import settings
from app.utils.embeddings_client import embed_text
from app.utils.llm_client import chat_groq

logger = logging.getLogger(__name__)

HISTORY_LIMIT = max(1, settings.chat_history_limit)
TEMPERATURE = 0.65
MAX_TOKENS = 1200


def _cap_snippets_by_budget(snippets: list[str], max_chars: int) -> list[str]:
	"""Bound snippet blocks to a deterministic character budget."""
	if max_chars <= 0 or not snippets:
		return []

	kept: list[str] = []
	used = 0
	for snippet in snippets:
		text = " ".join((snippet or "").split())
		if not text:
			continue
		cost = len(text)
		if used + cost > max_chars and kept:
			break
		if cost > max_chars:
			text = text[:max_chars].rsplit(" ", 1)[0] + "..."
			cost = len(text)
		kept.append(text)
		used += cost

	return kept


class ChatState(TypedDict, total=False):
	"""State for one persona chat turn."""

	db: AsyncSession
	session_id: UUID
	user_content: str
	use_web_search: bool
	use_knowledge_base: bool
	session: Any
	entity_id: UUID
	entity_name: str
	query_vector: list[float]
	base_system_prompt: str
	kb_retrieved_snippets: list[str]
	web_retrieved_snippets: list[str]
	retrieved_snippets: list[str]
	memory_snippets: list[str]
	memory_source: str
	assistant_citations: dict | None
	system_prompt: str
	history: list[Any]
	llm_messages: list[dict[str, str]]
	assistant_text: str
	user_message_row: Any
	assistant_message_row: Any


def build_runtime_system_prompt(
	base_prompt: str,
	kb_snippets: list[str],
	web_snippets: list[str],
	memory_snippets: list[str],
) -> str:
	"""Append per-turn retrieved context without changing the cached base prompt."""
	kb_snippets = _cap_snippets_by_budget(
		kb_snippets,
		settings.retrieved_context_max_chars,
	)
	web_snippets = _cap_snippets_by_budget(
		web_snippets,
		settings.retrieved_context_max_chars,
	)
	memory_snippets = _cap_snippets_by_budget(
		memory_snippets,
		settings.memory_context_max_chars,
	)

	kb_context = build_retrieved_context_block(kb_snippets)
	web_context = build_web_search_context_block(web_snippets)
	memory_context = build_memory_context_block(memory_snippets)
	if not kb_context and not web_context and not memory_context:
		return base_prompt
	parts = [base_prompt]
	if memory_context:
		parts.append(memory_context)
	if kb_context:
		parts.append(kb_context)
	if web_context:
		parts.append(web_context)
	return "\n\n".join(parts)


def _merge_retrieval_sources(
	kb_snippets: list[str],
	web_snippets: list[str],
	kb_citations: dict | None,
	web_citations: dict | None,
	query: str,
) -> tuple[list[str], dict | None]:
	"""Merge KB and web retrieval outputs with lightweight dedupe."""
	seen_snippets: set[str] = set()
	merged_snippets: list[str] = []
	for snippet in [*kb_snippets, *web_snippets]:
		normalized = " ".join((snippet or "").split()).lower()
		if not normalized or normalized in seen_snippets:
			continue
		seen_snippets.add(normalized)
		merged_snippets.append(snippet)

	if kb_citations and not web_citations:
		return merged_snippets, kb_citations
	if web_citations and not kb_citations:
		return merged_snippets, web_citations
	if not kb_citations and not web_citations:
		return merged_snippets, None

	seen_items: set[str] = set()
	merged_results: list[dict[str, Any]] = []

	for source_name, citation in (("knowledge_base", kb_citations), ("web_search", web_citations)):
		for item in (citation or {}).get("results", []):
			if not isinstance(item, dict):
				continue
			identity = "|".join(
				[
					source_name,
					str(item.get("source_url") or item.get("url") or "").strip().lower(),
					str(item.get("title") or "").strip().lower(),
					str(item.get("excerpt") or "").strip().lower(),
				]
			)
			if identity in seen_items:
				continue
			seen_items.add(identity)
			merged_results.append({"source": source_name, **item})

	return merged_snippets, {
		"source": "hybrid",
		"query": query,
		"knowledge_base": kb_citations,
		"web_search": web_citations,
		"results": merged_results,
	}


async def persist_chat_turn(
	db: AsyncSession,
	session: Any,
	user_content: str,
	assistant_content: str,
	assistant_citations: dict | None,
) -> dict[str, Any]:
	"""Persist user/assistant messages and update session metadata."""
	user_msg_row = await memory_manager.save_message(
		db=db,
		session_id=session.id,
		role="user",
		content=user_content,
	)
	assistant_msg_row = await memory_manager.save_message(
		db=db,
		session_id=session.id,
		role="assistant",
		content=assistant_content,
		citations=assistant_citations,
	)

	memory_write_source = await memory_provider.store_turn_memory(
		user_id=session.user_id,
		entity_id=session.entity_id,
		user_content=user_content,
		assistant_content=assistant_content,
	)

	if session.title is None:
		auto_title = user_content[:60].rstrip()
		if len(user_content) > 60:
			auto_title += "…"
		await memory_manager.update_session_title(
			db=db,
			session_id=session.id,
			title=auto_title,
		)

	await memory_manager.touch_session(db=db, session_id=session.id)

	return {
		"user_message_row": user_msg_row,
		"assistant_message_row": assistant_msg_row,
		"memory_source": memory_write_source,
	}


async def _load_session_node(state: ChatState) -> ChatState:
	db = state["db"]
	session_id = state["session_id"]
	session = await memory_manager.get_session(db=db, session_id=session_id)
	if session is None:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail=f"Session {session_id} not found.",
		)

	entity_name = ""
	entity_result = await db.execute(
		select(Entity.name).where(Entity.id == session.entity_id)
	)
	resolved_name = entity_result.scalar_one_or_none()
	if isinstance(resolved_name, str):
		entity_name = resolved_name

	return {
		"session": session,
		"entity_id": session.entity_id,
		"entity_name": entity_name,
	}


async def _load_base_prompt_node(state: ChatState) -> ChatState:
	return {
		"base_system_prompt": await context_loader.build_system_prompt(
			db=state["db"],
			entity_id=state["entity_id"],
		)
	}


async def _load_query_vector_node(state: ChatState) -> ChatState:
	cleaned_query = (state.get("user_content") or "").strip()
	if not cleaned_query:
		return {"query_vector": []}

	try:
		return {
			"query_vector": await embed_text(
				cleaned_query,
				task_type="RETRIEVAL_QUERY",
			)
		}
	except Exception as exc:
		logger.warning("Query embedding failed, continuing without precomputed vector: %s", exc)
		return {"query_vector": []}


async def _retrieve_context_node(state: ChatState) -> ChatState:
	try:
		kb_snippets: list[str] = []
		kb_citations: dict | None = None
		web_snippets: list[str] = []
		web_citations: dict | None = None

		if state.get("use_knowledge_base", True):
			kb_snippets, kb_citations = await retriever.retrieve_chat_context(
				db=state["db"],
				entity_id=state["entity_id"],
				query=state["user_content"],
				query_vector=state.get("query_vector") or None,
			)

		if state.get("use_web_search"):
			web_snippets, web_citations = await search_web_context(
				query=state["user_content"],
				entity_name=state.get("entity_name"),
			)

		retrieved_snippets, assistant_citations = _merge_retrieval_sources(
			kb_snippets=kb_snippets,
			web_snippets=web_snippets,
			kb_citations=kb_citations,
			web_citations=web_citations,
			query=state["user_content"],
		)
	except Exception as exc:
		logger.warning(
			"Chat context lookup failed for entity %s (web_search=%s, knowledge_base=%s): %s",
			state["entity_id"],
			state.get("use_web_search", False),
			state.get("use_knowledge_base", True),
			exc,
		)
		retrieved_snippets, assistant_citations = [], None

	return {
		"kb_retrieved_snippets": kb_snippets,
		"web_retrieved_snippets": web_snippets,
		"retrieved_snippets": retrieved_snippets,
		"assistant_citations": assistant_citations,
	}


async def _load_history_node(state: ChatState) -> ChatState:
	return {
		"history": await memory_manager.get_history(
			db=state["db"],
			session_id=state["session_id"],
			limit=HISTORY_LIMIT,
		)
	}


async def _load_memory_node(state: ChatState) -> ChatState:
	snippets, source = await memory_provider.retrieve_memory_context(
		db=state["db"],
		user_id=state["session"].user_id,
		entity_id=state["entity_id"],
		query=state["user_content"],
		current_session_id=state["session_id"],
		query_vector=state.get("query_vector") or None,
	)
	return {
		"memory_snippets": snippets,
		"memory_source": source,
	}


def _build_runtime_prompt_node(state: ChatState) -> ChatState:
	return {
		"system_prompt": build_runtime_system_prompt(
			state["base_system_prompt"],
			state.get("kb_retrieved_snippets", []),
			state.get("web_retrieved_snippets", []),
			state.get("memory_snippets", []),
		)
	}


def _build_llm_messages_node(state: ChatState) -> ChatState:
	llm_messages: list[dict[str, str]] = [
		{"role": "system", "content": state["system_prompt"]}
	]
	for msg in state.get("history", []):
		if msg.role in ("user", "assistant"):
			llm_messages.append({"role": msg.role, "content": msg.content})
	llm_messages.append({"role": "user", "content": state["user_content"]})
	return {"llm_messages": llm_messages}


async def _generate_response_node(state: ChatState) -> ChatState:
	assistant_text = await chat_groq(
		messages=state["llm_messages"],
		temperature=TEMPERATURE,
		max_output_tokens=MAX_TOKENS,
	)
	return {"assistant_text": assistant_text}


async def _persist_messages_node(state: ChatState) -> ChatState:
	return await persist_chat_turn(
		db=state["db"],
		session=state["session"],
		user_content=state["user_content"],
		assistant_content=state["assistant_text"],
		assistant_citations=state.get("assistant_citations"),
	)


def build_prepare_graph():
	"""Build and compile the setup graph used by both normal and streaming chat."""
	graph = StateGraph(ChatState)

	graph.add_node("load_session", _load_session_node)
	graph.add_node("load_query_vector", _load_query_vector_node)
	graph.add_node("load_base_prompt", _load_base_prompt_node)
	graph.add_node("retrieve_context", _retrieve_context_node)
	graph.add_node("load_history", _load_history_node)
	graph.add_node("load_memory", _load_memory_node)
	graph.add_node("build_runtime_prompt", _build_runtime_prompt_node)
	graph.add_node("build_llm_messages", _build_llm_messages_node)

	graph.set_entry_point("load_session")
	graph.add_edge("load_session", "load_query_vector")
	graph.add_edge("load_query_vector", "load_base_prompt")
	graph.add_edge("load_query_vector", "retrieve_context")
	graph.add_edge("load_query_vector", "load_history")
	graph.add_edge("load_query_vector", "load_memory")
	graph.add_edge(["load_base_prompt", "retrieve_context", "load_memory"], "build_runtime_prompt")
	graph.add_edge(["build_runtime_prompt", "load_history"], "build_llm_messages")
	graph.add_edge("build_llm_messages", END)

	return graph.compile()


def build_reply_graph():
	"""Build and compile the full chat graph including generation and persistence."""
	graph = StateGraph(ChatState)

	graph.add_node("load_session", _load_session_node)
	graph.add_node("load_query_vector", _load_query_vector_node)
	graph.add_node("load_base_prompt", _load_base_prompt_node)
	graph.add_node("retrieve_context", _retrieve_context_node)
	graph.add_node("load_history", _load_history_node)
	graph.add_node("load_memory", _load_memory_node)
	graph.add_node("build_runtime_prompt", _build_runtime_prompt_node)
	graph.add_node("build_llm_messages", _build_llm_messages_node)
	graph.add_node("generate_response", _generate_response_node)
	graph.add_node("persist_messages", _persist_messages_node)

	graph.set_entry_point("load_session")
	graph.add_edge("load_session", "load_query_vector")
	graph.add_edge("load_query_vector", "load_base_prompt")
	graph.add_edge("load_query_vector", "retrieve_context")
	graph.add_edge("load_query_vector", "load_history")
	graph.add_edge("load_query_vector", "load_memory")
	graph.add_edge(["load_base_prompt", "retrieve_context", "load_memory"], "build_runtime_prompt")
	graph.add_edge(["build_runtime_prompt", "load_history"], "build_llm_messages")
	graph.add_edge("build_llm_messages", "generate_response")
	graph.add_edge("generate_response", "persist_messages")
	graph.add_edge("persist_messages", END)

	return graph.compile()


prepare_graph = build_prepare_graph()
reply_graph = build_reply_graph()


async def prepare_chat_turn(
	db: AsyncSession,
	session_id: UUID,
	user_content: str,
	use_web_search: bool = False,
	use_knowledge_base: bool = True,
) -> ChatState:
	"""Run the shared preparation graph and return its state."""
	return await prepare_graph.ainvoke(
		{
			"db": db,
			"session_id": session_id,
			"user_content": user_content,
			"use_web_search": use_web_search,
			"use_knowledge_base": use_knowledge_base,
		}
	)


async def run_chat_turn(
	db: AsyncSession,
	session_id: UUID,
	user_content: str,
	use_web_search: bool = False,
	use_knowledge_base: bool = True,
) -> ChatState:
	"""Run the full chat graph and return the completed state."""
	return await reply_graph.ainvoke(
		{
			"db": db,
			"session_id": session_id,
			"user_content": user_content,
			"use_web_search": use_web_search,
			"use_knowledge_base": use_knowledge_base,
		}
	)
