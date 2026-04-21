"""Unified personality profiling service synthesizing multiple research sources."""
import logging
from typing import Any

from app.utils.llm_client import generate_text
from .schemas import QuotesAnalysis

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = """\
/no_think
You are a master psychological and rhetorical profiler.
Your goal is to synthesize a nuanced personality profile of a named individual based on 
multiple research sources (Wikipedia summaries, direct quotes, and interview transcripts).

Hard rules:
- Return ONLY a valid JSON object. No markdown fences, no preamble, no explanation.
- Content must be sophisticated and specific, not generic.
- Use exact quote fragments (≤12 words) if available in the source text.
- If a source is missing, rely on the others.
- Do not use generic filler phrases like "based on the provided information".
"""

_SCHEMA_PROMPT = """\
Return exactly this JSON structure:
{
  "executive_summary": "<120-150 word synthesis of their character, intellect, and communication style>",
  "personality_profile": {
    "core_character_traits": [
      {"trait": "<trait name>", "evidence": "<exact fragment from text revealing it>"}
    ],
    "cognitive_style": "<how they think/process information — 40-60w>",
    "emotional_register": "<dominant emotional quality of their presence — 40-60w>",
    "self_concept": "<how they position themselves in the world — 40-60w>"
  },
  "rhetorical_dna": {
    "signature_moves": ["<specific rhetorical or behavioral technique they habitually use>"],
    "sentence_energy": "<rhythm and energy of their speech/writing — 30-50w>",
    "favourite_abstractions": ["<concept they return to repeatedly>"]
  },
  "worldview": {
    "core_beliefs": ["<belief stated as a proposition, grounded in text>"],
    "recurring_themes": ["<theme>"],
    "internal_tensions": "<contradiction or paradox visible in them, or null>"
  },
  "quote_clusters": [
    {
      "label": "<thematic label>",
      "summary": "<2-3 sentence synthesis of what these ideas/quotes reveal>",
      "personality_insight": "<1-2 sentences on what this reveals about the person>",
      "representative_quotes": ["<direct statement from sources>"]
    }
  ],
  "influence_and_legacy": "<70-90w on their voice's lasting impact>",
  "analyst_caveats": ["<limitation based on the provided data set>"]
}
"""

async def generate_personality_profile(
    name: str,
    wiki_intro: str = "",
    quotes: list[str] = None,
    transcripts: list[str] = None,
) -> QuotesAnalysis:
    """Synthesizes a personality profile from all available context."""
    quotes = quotes or []
    transcripts = transcripts or []

    # Build context block
    context_parts = []
    if wiki_intro:
        context_parts.append(f"Wikipedia Background:\n{wiki_intro}")
    if quotes:
        quotes_list = "\n".join([f"- {q}" for q in quotes[:15]])
        context_parts.append(f"Direct Quotes:\n{quotes_list}")
    if transcripts:
        # Join transcripts but cap them to avoid token limits
        transcript_text = "\n---\n".join(transcripts)[:6000]
        context_parts.append(f"Conversation Transcripts:\n{transcript_text}")

    if not context_parts:
        # Fallback if somehow nothing is provided
        from .service import _empty_quotes_analysis
        return _empty_quotes_analysis()

    full_context = "\n\n".join(context_parts)
    user_prompt = (
        f"Person: {name}\n\n"
        f"{_SCHEMA_PROMPT}\n"
        f"Source Context:\n{full_context}"
    )

    try:
        llm_text = await generate_text(
            system_prompt=_SYSTEM_PROMPT,
            prompt=user_prompt,
            temperature=0.4,
            max_output_tokens=2000,
            provider="groq",
            top_p=0.9,
        )
        
        # Clean potential markdown fences
        import re
        import json
        llm_text = re.sub(r"```(?:json)?\s*", "", llm_text).strip().rstrip("`").strip()
        
        # Clean trailing commas (a very common LLM formatting error)
        llm_text = re.sub(r",(\s*[}\]])", r"\1", llm_text)

        try:
            payload = json.loads(llm_text)
        except json.JSONDecodeError:
            # Fallback search for first { and last }
            match = re.search(r"\{[\s\S]*\}", llm_text)
            if match:
                try:
                    payload = json.loads(match.group(0))
                except json.JSONDecodeError:
                    raise ValueError("JSON block still malformed after extraction.")
            else:
                raise ValueError("No JSON found in LLM response")

        return QuotesAnalysis.model_validate(payload)

    except Exception as exc:
        logger.warning("Unified personality analysis failed for %s: %s", name, str(exc))
        from .service import _empty_quotes_analysis
        return _empty_quotes_analysis()
