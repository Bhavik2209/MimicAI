"""Business logic for quote extraction."""
import json
import logging
import re
from typing import Any

from app.modules.entity.utils import fetch_entity_data
from app.utils.llm_client import generate_text
from .schemas import QuoteItem, QuotesAnalysis, QuotesProfile
from .utils import fetch_quotes

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

_BANNED_PHRASES = {
    "quote analysis for",
    "based on available sources",
    "direct statements attributed to",
}

# Qwen on Groq: 6K tokens/min, 500K/day, 60 req/min, 1K req/day.
# Budget: reserve ~1 200 tokens for the fixed prompt + schema, leaving
# ~4 800 tokens for quotes + response.  Avg quote ≈ 40 tokens → max 20 quotes.
# ---------------------------------------------------------------------------
# Constants — revised for Qwen3-32b on Groq
# ---------------------------------------------------------------------------

_MAX_QUOTES_FOR_LLM = 18
_TOKEN_BUDGET_FOR_QUOTES = 900
_MAX_OUTPUT_TOKENS = 1_600   # Qwen3-32b is concise; 1600 is enough for the richer schema

# ---------------------------------------------------------------------------
# Prompts — revised for Qwen3-32b + personality focus
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """\
/no_think
You are a psychological and rhetorical profiler with deep expertise in intellectual history.
Given a set of real quotes attributed to a named individual, produce a nuanced personality
and communication analysis grounded strictly in the provided text.

Hard rules:
- Return ONLY a valid JSON object. No markdown fences, no preamble, no explanation.
- Every claim must be traceable to the quotes. No speculation beyond the text.
- Use exact quote fragments (≤10 words) as inline evidence inside analysis strings.
- Never write generic filler: "based on sources", "it is evident", "clearly shows", etc.
- Personality insights must be specific to this individual — not generic descriptions.
"""

_SCHEMA_COMMENT = """\
Return exactly this JSON structure (every field required unless marked optional):
{
  "executive_summary": "<110-140 word synthesis of who this person is as a thinker and communicator>",

  "personality_profile": {
    "core_character_traits": [
      {"trait": "<trait name>", "evidence": "<exact quote fragment that reveals it>"}
    ],
    "cognitive_style": "<how they think: systematic/intuitive/dialectical/etc — 40-60w>",
    "emotional_register": "<dominant emotional quality of their speech — 30-50w>",
    "self_concept": "<how they position themselves in relation to the world — 30-50w>"
  },

  "rhetorical_dna": {
    "signature_moves": ["<specific rhetorical technique they habitually use>"],
    "sentence_energy": "<short/punchy or long/layered — describe their rhythm — 20-40w>",
    "favourite_abstractions": ["<concept they return to repeatedly>"]
  },

  "worldview": {
    "core_beliefs": ["<belief stated as a proposition, grounded in a quote>"],
    "recurring_themes": ["<theme>"],
    "internal_tensions": "<contradiction or paradox visible across quotes, or null>"
  },

  "quote_clusters": [
    {
      "label": "<thematic label>",
      "summary": "<2-3 sentence synthesis of what these quotes reveal>",
      "personality_insight": "<1-2 sentences on what this cluster reveals about the person>",
      "representative_quotes": ["<exact quote>"]
    }
  ],

  "influence_and_legacy": "<60-80w on what the voice and ideas suggest about lasting impact>",
  "analyst_caveats": ["<limitation or gap in this quote set>"]
}
"""

def _strip_think_blocks(text: str) -> str:
    """Remove Qwen3 <think>...</think> blocks that appear despite /no_think."""
    return re.sub(r"<think>[\s\S]*?</think>", "", text).strip()




def _build_user_prompt(name: str, quote_rows: list[str]) -> str:
    quotes_block = "\n".join(quote_rows)
    return (
        f"Person: {name}\n\n"
        f"{_SCHEMA_COMMENT}\n"
        f"Quotes to analyse:\n{quotes_block}"
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _estimate_tokens(text: str) -> int:
    """Rough estimate: 1 token ≈ 4 chars (conservative for English)."""
    return max(1, len(text) // 4)


def _trim_quotes_to_budget(
    quotes: list[dict],
    max_count: int = _MAX_QUOTES_FOR_LLM,
    token_budget: int = _TOKEN_BUDGET_FOR_QUOTES,
) -> list[str]:
    """
    Select quotes greedily up to max_count and token_budget.
    Prefers longer, meatier quotes by sorting descending on length first.
    """
    candidates = [
        (item.get("quote", ""), item.get("section", "unknown"))
        for item in quotes
        if isinstance(item.get("quote"), str) and item["quote"].strip()
    ]
    # Sort by length descending — longer quotes are usually more substantive
    candidates.sort(key=lambda x: len(x[0]), reverse=True)

    rows: list[str] = []
    used_tokens = 0
    for idx, (quote_text, section) in enumerate(candidates[:max_count], start=1):
        row = f"{idx}. [{section}] {quote_text}"
        cost = _estimate_tokens(row)
        if used_tokens + cost > token_budget:
            break
        rows.append(row)
        used_tokens += cost

    return rows


def _extract_json_object(text: str) -> dict[str, Any]:
    """Extract a JSON object from raw LLM output, stripping markdown fences."""
    # Strip ```json ... ``` fences if present
    text = re.sub(r"```(?:json)?\s*", "", text).strip().rstrip("`").strip()
    try:
        payload = json.loads(text)
        return payload if isinstance(payload, dict) else {}
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", text)
        if not match:
            return {}
        try:
            payload = json.loads(match.group(0))
            return payload if isinstance(payload, dict) else {}
        except json.JSONDecodeError:
            return {}


def _contains_banned_phrase(text: str) -> bool:
    lowered = text.lower()
    return any(phrase in lowered for phrase in _BANNED_PHRASES)


def _empty_quotes_analysis() -> QuotesAnalysis:
    return QuotesAnalysis(
        executive_summary="Analysis unavailable for this entity.",
        personality_profile={
            "core_character_traits": [],
            "cognitive_style": "No data available.",
            "emotional_register": "No data available.",
            "self_concept": "No data available.",
        },
        rhetorical_dna={
            "signature_moves": [],
            "sentence_energy": "No data available.",
            "favourite_abstractions": [],
        },
        worldview={
            "core_beliefs": [],
            "recurring_themes": [],
            "internal_tensions": None,
        },
        quote_clusters=[],
        influence_and_legacy="No data available.",
        analyst_caveats=["Insufficient quote data to generate analysis."],
    )


# ---------------------------------------------------------------------------
# Core LLM call
# ---------------------------------------------------------------------------

async def _analyze_quotes_with_llm(name: str, quotes: list[dict]) -> QuotesAnalysis:
    quote_rows = _trim_quotes_to_budget(quotes)
    if not quote_rows:
        return _empty_quotes_analysis()

    user_prompt = _build_user_prompt(name, quote_rows)
    estimated_input = _estimate_tokens(_SYSTEM_PROMPT + user_prompt)
    logger.debug(
        "Qwen3-32b prompt for %s: ~%d input tokens, %d quotes",
        name, estimated_input, len(quote_rows),
    )

    try:
        llm_text = await generate_text(
            system_prompt=_SYSTEM_PROMPT,
            prompt=user_prompt,
            temperature=0.3,       # lower = better schema adherence on Qwen3
            max_output_tokens=_MAX_OUTPUT_TOKENS,
            provider="groq",
            top_p=0.9,
        )
        payload = _extract_json_object(llm_text)
        if not payload:
            logger.warning("Empty payload from Qwen3-32b for %s", name)
            return _empty_quotes_analysis()

        summary = payload.get("executive_summary", "")
        if _contains_banned_phrase(summary):
            logger.warning("Banned phrase in analysis for %s — discarding", name)
            return _empty_quotes_analysis()

        return QuotesAnalysis.model_validate(payload)

    except Exception:
        logger.exception("Qwen3-32b quote analysis failed for %s", name)
        return _empty_quotes_analysis()

# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

async def fetch_entity_quotes(entity_id: str) -> QuotesProfile:
    """Fetch Wikiquote quotes for a Wikidata entity id and return a rich profile."""
    name: str | None = None
    try:
        entity = await fetch_entity_data(entity_id)
        name = entity.get("labels", {}).get("en", {}).get("value")
    except Exception:
        logger.exception("Failed to fetch entity data for %s", entity_id)

    if not name:
        return QuotesProfile(
            entity_id=entity_id,
            name=None,
            analysis=_empty_quotes_analysis(),
        )

    quotes = await fetch_quotes(name=name, max_quotes=30)
    normalized_quotes = [QuoteItem.model_validate(item).model_dump() for item in quotes]
    analysis = await _analyze_quotes_with_llm(name=name, quotes=normalized_quotes)

    return QuotesProfile(entity_id=entity_id, name=name, analysis=analysis)