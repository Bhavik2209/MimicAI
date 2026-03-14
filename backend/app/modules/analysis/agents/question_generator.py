import asyncio
import json
import re
from typing import Any

from google import genai

from app.config import settings


_client: genai.Client | None = None


class QuestionGenerationError(Exception):
    """Raised when the model response cannot be converted to the expected schema."""


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def _extract_json_block(raw: str) -> dict[str, Any]:
    """Extract and parse JSON from plain text or fenced code output."""
    if not raw:
        raise QuestionGenerationError("Empty model response")

    cleaned = raw.strip()

    # Handle markdown fenced blocks if the model wraps JSON in ```json ... ```.
    match = re.search(r"```(?:json)?\s*(\{.*\})\s*```", cleaned, flags=re.DOTALL)
    if match:
        cleaned = match.group(1).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise QuestionGenerationError("Invalid JSON returned by model") from exc


def _normalize_questions(payload: dict[str, Any]) -> dict[str, list[str]]:
    """Normalize model output and guarantee exactly 3 questions per category."""
    personality = payload.get("personality_questions", [])
    controversies = payload.get("controversy_questions", [])

    if not isinstance(personality, list) or not isinstance(controversies, list):
        raise QuestionGenerationError("Question fields must be lists")

    personality_clean = [str(q).strip() for q in personality if str(q).strip()]
    controversies_clean = [str(q).strip() for q in controversies if str(q).strip()]

    if len(personality_clean) < 3 or len(controversies_clean) < 3:
        raise QuestionGenerationError("Model did not return at least 3 questions per category")

    return {
        "personality_questions": personality_clean[:3],
        "controversy_questions": controversies_clean[:3],
    }


def _generate_questions_sync(entity_name: str, context: str | None = None) -> dict[str, list[str]]:
    context_block = context.strip() if context else "No additional context provided."

    prompt = f"""
You are helping build a biography analysis system.
Generate targeted retrieval questions for the person: {entity_name}

Context:
{context_block}

Return ONLY valid JSON with this exact schema:
{{
  "personality_questions": ["q1", "q2", "q3"],
  "controversy_questions": ["q1", "q2", "q3"]
}}

Rules:
- Exactly 3 questions in personality_questions.
- Exactly 3 questions in controversy_questions.
- Questions must be specific and retrieval-friendly.
- Avoid yes/no questions.
- Mention the person's name where useful for retrieval precision.
""".strip()

    response = _get_client().models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )

    payload = _extract_json_block(response.text or "")
    return _normalize_questions(payload)


async def generate_analysis_questions(
    entity_name: str,
    context: str | None = None,
) -> dict[str, list[str]]:
    """
    Generate structured questions for personality and controversies.

    Returns:
    {
        "personality_questions": [str, str, str],
        "controversy_questions": [str, str, str]
    }
    """
    return await asyncio.to_thread(_generate_questions_sync, entity_name, context)
