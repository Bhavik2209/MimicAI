"""System prompt builder for persona chat.

Assembles a rich system prompt by pulling the entity's personality profile
and factual knowledge from the aggregated research profile stored in Postgres.

Per-turn retrieval lives in ``app.modules.chat.retriever`` so the cached base
persona prompt remains stable across user queries.
"""

from __future__ import annotations

import logging
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.entity import Entity
from app.db.models.profile import ResearchProfile
from app.prompts.chat.persona import build_conversation_rules, build_persona_preamble

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# In-memory system prompt cache
# ---------------------------------------------------------------------------
# The personality profile and knowledge base for an entity almost never change
# (only after a new research run).  Caching the assembled prompt here means
# each chat turn skips 2 DB queries + JSON parsing + string assembly.
#
# Key: str(entity_id UUID)
# Value: fully assembled system prompt string
#
# To bust the cache after a research run, call invalidate_prompt_cache().
# ---------------------------------------------------------------------------
_prompt_cache: dict[str, str] = {}

# Max characters to include from wiki intro and section text
_WIKI_INTRO_CAP = 2500
_WIKI_SECTIONS_CAP = 1500
_TRANSCRIPT_CAP = 1200


def _cap(text: str | None, max_chars: int) -> str:
	"""Truncate a string to max_chars, adding ellipsis if trimmed."""
	if not text:
		return ""
	text = text.strip()
	if len(text) <= max_chars:
		return text
	return text[:max_chars].rsplit(" ", 1)[0] + "…"


def _format_list(items: list, key: str | None = None) -> str:
	"""Format a list of strings or dicts into a bullet list."""
	lines: list[str] = []
	for item in items:
		if isinstance(item, str) and item.strip():
			lines.append(f"  • {item.strip()}")
		elif isinstance(item, dict):
			value = item.get(key, "") if key else str(item)
			if value:
				lines.append(f"  • {value}")
	return "\n".join(lines)


def _build_personality_section(analysis: dict) -> str:
	"""Convert QuotesAnalysis dict into a formatted prompt section."""
	lines: list[str] = []

	executive = analysis.get("executive_summary", "")
	if executive:
		lines.append(f"Executive Summary:\n{executive.strip()}\n")

	profile = analysis.get("personality_profile", {})
	if isinstance(profile, dict):
		traits = profile.get("core_character_traits", [])
		if traits:
			lines.append("Core Character Traits:")
			for t in traits:
				if isinstance(t, dict):
					trait = t.get("trait", "")
					evidence = t.get("evidence", "")
					if trait:
						lines.append(f"  • {trait}" + (f' — "{evidence}"' if evidence else ""))
			lines.append("")

		for field, label in [
			("cognitive_style", "Cognitive Style"),
			("emotional_register", "Emotional Register"),
			("self_concept", "Self-Concept"),
		]:
			val = profile.get(field, "")
			if val:
				lines.append(f"{label}: {val.strip()}")

	dna = analysis.get("rhetorical_dna", {})
	if isinstance(dna, dict):
		moves = dna.get("signature_moves", [])
		if moves:
			lines.append("\nSignature Rhetorical Moves:")
			lines.append(_format_list(moves))
		energy = dna.get("sentence_energy", "")
		if energy:
			lines.append(f"\nSentence Energy: {energy.strip()}")
		abstractions = dna.get("favourite_abstractions", [])
		if abstractions:
			lines.append(f"Favourite Abstractions: {', '.join(str(a) for a in abstractions)}")

	worldview = analysis.get("worldview", {})
	if isinstance(worldview, dict):
		beliefs = worldview.get("core_beliefs", [])
		if beliefs:
			lines.append("\nCore Beliefs:")
			lines.append(_format_list(beliefs))
		themes = worldview.get("recurring_themes", [])
		if themes:
			lines.append(f"Recurring Themes: {', '.join(str(t) for t in themes)}")
		tension = worldview.get("internal_tensions")
		if tension:
			lines.append(f"Internal Tension: {tension.strip()}")

	return "\n".join(lines).strip()


def _build_knowledge_section(acquisition: dict) -> str:
	"""Extract factual knowledge from wiki + conversation data."""
	lines: list[str] = []

	wiki = acquisition.get("wiki", {})
	if isinstance(wiki, dict):
		intro = _cap(wiki.get("intro_summary", ""), _WIKI_INTRO_CAP)
		if intro:
			lines.append(f"Wikipedia Background:\n{intro}")

		sections = wiki.get("sections", [])
		if isinstance(sections, list):
			section_parts: list[str] = []
			for section in sections[:6]:
				if not isinstance(section, dict):
					continue
				title = section.get("section", "")
				text = section.get("text", "")
				if title and text:
					snippet = _cap(text, 300)
					section_parts.append(f"[{title}] {snippet}")
			if section_parts:
				combined = "\n".join(section_parts)
				lines.append(f"\nKey Background Topics:\n{_cap(combined, _WIKI_SECTIONS_CAP)}")

	conversation = acquisition.get("conversation", {})
	if isinstance(conversation, dict):
		videos = conversation.get("videos", [])
		transcript_snippets: list[str] = []
		for video in videos[:3]:
			transcript = video.get("transcript", "")
			if transcript:
				transcript_snippets.append(_cap(transcript, 400))
		if transcript_snippets:
			combined_transcripts = "\n---\n".join(transcript_snippets)
			lines.append(
				f"\nSpoken Word Excerpts (interviews/talks):\n{_cap(combined_transcripts, _TRANSCRIPT_CAP)}"
			)

	return "\n\n".join(lines).strip()


async def build_system_prompt(db: AsyncSession, entity_id: UUID) -> str:
	"""Construct the full persona system prompt for a given entity.

	Pulls (on cache miss):
	  1. Entity name + description from the entities table
	  2. Personality profile (QuotesAnalysis) from research_profiles.aggregated_profile
	  3. Factual knowledge from wiki intro + conversation transcripts

	Results are cached in _prompt_cache by entity_id for the lifetime of the
	process.  Call invalidate_prompt_cache(entity_id) after a new research run
	to force a rebuild.

	Phase 2: User memory can also be injected here if we add persistent
	preference modeling later.
	"""
	cache_key = str(entity_id)
	if cache_key in _prompt_cache:
		logger.debug("System prompt cache HIT for entity %s", entity_id)
		return _prompt_cache[cache_key]

	logger.debug("System prompt cache MISS for entity %s — building from DB", entity_id)

	# ---- 1. Entity basic info ------------------------------------------------
	entity_result = await db.execute(select(Entity).where(Entity.id == entity_id))
	entity = entity_result.scalar_one_or_none()
	name = entity.name if entity else "Unknown"
	description = entity.description if entity else ""

	# ---- 2. Aggregated research profile -------------------------------------
	profile_result = await db.execute(
		select(ResearchProfile).where(ResearchProfile.entity_id == entity_id)
	)
	research = profile_result.scalar_one_or_none()
	aggregated: dict = {}
	if research and isinstance(research.aggregated_profile, dict):
		aggregated = research.aggregated_profile

	acquisition: dict = aggregated.get("acquisition", {})
	quotes_data: dict = acquisition.get("quotes", {})
	analysis: dict = quotes_data.get("analysis", {}) if isinstance(quotes_data, dict) else {}

	# Also check the top-level personality key from graph state
	if not analysis:
		personality_state = aggregated.get("personality", {})
		if isinstance(personality_state, dict) and personality_state.get("executive_summary"):
			analysis = personality_state

	personality_section = _build_personality_section(analysis) if analysis else ""
	knowledge_section = _build_knowledge_section(acquisition)

	# ---- 3. Assemble the system prompt --------------------------------------
	parts: list[str] = []

	parts.append(build_persona_preamble(name))

	if description:
		parts.append(f"== IDENTITY ==\n{description.strip()}")

	if personality_section:
		parts.append(f"== PERSONALITY PROFILE ==\n{personality_section}")

	if knowledge_section:
		parts.append(f"== KNOWLEDGE BASE ==\n{knowledge_section}")

	parts.append(build_conversation_rules(name))

	system_prompt = "\n\n".join(filter(None, parts))
	logger.debug("Built system prompt for %s (%d chars) — caching", name, len(system_prompt))
	_prompt_cache[cache_key] = system_prompt
	return system_prompt


def invalidate_prompt_cache(entity_id: UUID | str | None = None) -> None:
	"""Bust the system prompt cache after a research run.

	Call this from the research pipeline whenever a new research run completes
	for an entity so the next chat turn rebuilds the prompt from fresh DB data.

	Args:
	    entity_id: Remove only this entity's cached prompt.  Pass None (or
	               omit) to clear the entire cache (e.g. on server startup).
	"""
	if entity_id is None:
		_prompt_cache.clear()
		logger.info("System prompt cache cleared (all entities)")
	else:
		key = str(entity_id)
		if key in _prompt_cache:
			del _prompt_cache[key]
			logger.info("System prompt cache invalidated for entity %s", entity_id)
		else:
			logger.debug("invalidate_prompt_cache called for %s but no entry existed", entity_id)
