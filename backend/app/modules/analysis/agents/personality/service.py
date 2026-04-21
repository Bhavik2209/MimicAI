"""Service for personality analysis based on vector retrieval and LLM synthesis."""

import json
import re

from qdrant_client.http import models

from app.config import settings
from app.db.qdrant import query_vectors
from app.modules.entity.utils import fetch_entity_data
from app.utils.embeddings_client import embed_text
from app.utils.llm_client import generate_text

from .schemas import PersonalityAnalysis


def _extract_json(text: str) -> dict:
    """Extract JSON object from LLM output."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", text)
        if not match:
            return {}
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            return {}


async def _generate_questions(name: str) -> list[str]:
    """Generate exactly three personality analysis questions."""
    prompt = (
        f"3 questions for {name}. JSON: "
        '{"questions":["question1","question2","question3"]}'
    )
    response = await generate_text(prompt=prompt, temperature=0.2, max_output_tokens=300)
    payload = _extract_json(response)
    questions = payload.get("questions", []) if isinstance(payload, dict) else []
    cleaned = [q.strip() for q in questions if isinstance(q, str) and q.strip()]
    return cleaned[:3]


def _entity_filter(entity_id: str) -> models.Filter:
    """Build Qdrant filter to scope retrieval to one entity."""
    return models.Filter(
        should=[
            models.FieldCondition(key="entity_id", match=models.MatchValue(value=entity_id)),
            models.FieldCondition(key="wikidata_id", match=models.MatchValue(value=entity_id)),
        ]
    )


def _extract_text_payload(payload: dict | None) -> str:
    """Extract the best text field from vector payload."""
    if not payload:
        return ""
    for key in ("text", "chunk", "content", "summary"):
        value = payload.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return ""


async def _retrieve_context(entity_id: str, questions: list[str]) -> list[str]:
    """Retrieve context snippets from Qdrant for all generated questions."""
    snippets: list[str] = []
    seen: set[str] = set()

    for question in questions:
        try:
            vector = await embed_text(question, task_type="RETRIEVAL_QUERY")
            results = query_vectors(
                collection_name=settings.qdrant_collection,
                query_vector=vector,
                limit=4,
                query_filter=_entity_filter(entity_id),
            )
        except Exception:
            continue
        for result in results:
            text = _extract_text_payload(result.payload)
            if text and text not in seen:
                seen.add(text)
                snippets.append(text)

    return snippets


async def analyze_personality(entity_id: str) -> PersonalityAnalysis:
    """Run the full personality analysis pipeline."""
    entity = await fetch_entity_data(entity_id)
    name = entity.get("labels", {}).get("en", {}).get("value", entity_id)

    questions = await _generate_questions(name)
    if len(questions) < 3:
        questions = [
            f"How does {name} communicate under pressure?",
            f"What recurring personality traits are attributed to {name}?",
            f"How does {name} make strategic decisions?",
        ]

    snippets = await _retrieve_context(entity_id, questions)
    context_block = "\n".join(f"- {item}" for item in snippets[:10])

    synthesis_prompt = (
        f"Personality analysis for {name}. Use only evidence.\\n"
        "JSON: {\"summary\":\"str\",\"traits\":[{\"trait\":\"str\",\"evidence\":[\"str\"]}],"
        "\"communication_style\":\"str\",\"decision_style\":\"str\",\"risk_flags\":[\"str\"]}\\n"
        f"Evidence:\\n{context_block}"
    )

    synthesis_text = await generate_text(
        prompt=synthesis_prompt,
        temperature=0.2,
        max_output_tokens=1400,
    )
    synthesis_payload = _extract_json(synthesis_text)

    result_payload = {
        "entity_id": entity_id,
        "name": name,
        "questions": questions,
        "summary": synthesis_payload.get("summary", "Insufficient evidence for a strong personality profile."),
        "traits": synthesis_payload.get("traits", []),
        "communication_style": synthesis_payload.get("communication_style"),
        "decision_style": synthesis_payload.get("decision_style"),
        "risk_flags": synthesis_payload.get("risk_flags", []),
    }

    return PersonalityAnalysis.model_validate(result_payload)
