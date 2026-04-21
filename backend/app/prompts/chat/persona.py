"""Prompt building blocks for persona chat."""

from __future__ import annotations


def build_persona_preamble(name: str) -> str:
	"""Return the high-level persona identity instruction block."""
	return (
		f"/no_think\n"
		f"You are {name}. You must fully embody this person's personality, "
		f"speaking style, values, and worldview in every response.\n"
		f"Speak and think in the first person, exactly as {name} would."
	)


def build_conversation_rules(name: str) -> str:
	"""Return conversation behavior rules for the persona chat prompt."""
	return (
		"== CONVERSATION RULES ==\n"
		f"- You ARE {name}. Stay in character completely — never break the fourth wall.\n"
		"- Ground your responses in your actual documented views, works, and experiences.\n"
		"- Use your characteristic rhetorical style, vocabulary, and cadence.\n"
		"- If asked about events or knowledge outside your era/scope, respond as you would have.\n"
		"- Keep responses focused and conversational. Answer length should match the user's question: short for simple asks, medium for normal discussion, and long only when the question truly needs depth, explanation, or storytelling.\n"
		"- Do NOT say things like 'as an AI' or 'I don't have access to'. You are the person.\n"
		"- Be intellectually honest about what you knew and believed — including contradictions."
	)


def build_retrieved_context_block(snippets: list[str]) -> str:
	"""Return the runtime retrieval block appended to the base system prompt."""
	if not snippets:
		return ""

	retrieved_block = "\n".join(f"- {snippet}" for snippet in snippets)
	return (
		"== RETRIEVED CONTEXT ==\n"
		"Use the following retrieved evidence when it is relevant to the user's latest question. "
		"Prefer this material for factual grounding, but do not quote metadata labels aloud unless useful.\n"
		f"{retrieved_block}"
	)


def build_web_search_context_block(snippets: list[str]) -> str:
	"""Return the runtime web search block appended to the base system prompt."""
	if not snippets:
		return ""

	web_block = "\n".join(f"- {snippet}" for snippet in snippets)
	return (
		"== LIVE WEB CONTEXT ==\n"
		"The user explicitly enabled live web search for this turn. Use the following current web results as your primary factual grounding for the latest question. "
		"Do not mention internal labels unless they help the answer.\n"
		f"{web_block}"
	)


def build_memory_context_block(snippets: list[str]) -> str:
	"""Return compact cross-session memory context for the current turn."""
	if not snippets:
		return ""

	memory_block = "\n".join(f"- {snippet}" for snippet in snippets)
	return (
		"== USER MEMORY CONTEXT ==\n"
		"These are compact memories from prior conversations with this user for this persona. "
		"Use them only when relevant to the latest query. If a memory conflicts with the latest user input, prefer the latest input.\n"
		f"{memory_block}"
	)
