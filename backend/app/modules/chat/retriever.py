"""Qdrant-backed retrieval helpers for persona chat."""

from __future__ import annotations

import logging
from uuid import UUID

from qdrant_client.http import models
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.models.entity import Entity
from app.db.qdrant import query_vectors
from app.utils.embeddings_client import embed_text

logger = logging.getLogger(__name__)

_DEFAULT_LIMIT = 3
_DEFAULT_SCORE_THRESHOLD = 0.2
_MAX_EXCERPT_CHARS = 320
_MAX_TOTAL_CONTEXT_CHARS = 2400
_LOG_PREVIEW_CHARS = 140


def _cap(text: str, max_chars: int) -> str:
	"""Trim text to a safe prompt/citation length."""
	cleaned = " ".join(text.split())
	if len(cleaned) <= max_chars:
		return cleaned
	return cleaned[:max_chars].rsplit(" ", 1)[0] + "…"


def _entity_filter(entity: Entity) -> models.Filter:
	"""Scope retrieval to one entity across current and future payload formats."""
	values = [str(entity.id), entity.wikidata_id]
	conditions = [
		models.FieldCondition(key="entity_id", match=models.MatchValue(value=value))
		for value in values
	]
	conditions.extend(
		models.FieldCondition(key="wikidata_id", match=models.MatchValue(value=value))
		for value in values
	)
	return models.Filter(should=conditions)


def _extract_text(payload: dict | None) -> str:
	"""Pick the best payload field to use as retrieval text."""
	if not payload:
		return ""
	for key in ("content", "text", "chunk", "summary"):
		value = payload.get(key)
		if isinstance(value, str) and value.strip():
			return value.strip()
	return ""


def _format_snippet(payload: dict, excerpt: str) -> str:
	"""Render one retrieved payload as a compact prompt snippet."""
	title = payload.get("title")
	source_type = payload.get("source_type")
	content_type = payload.get("content_type")

	label_parts = [str(part).strip() for part in (source_type, content_type, title) if part]
	label = " | ".join(label_parts) if label_parts else "retrieved"
	return f"[{label}] {excerpt}"


async def retrieve_chat_context(
	db: AsyncSession,
	entity_id: UUID,
	query: str,
	query_vector: list[float] | None = None,
	limit: int = _DEFAULT_LIMIT,
) -> tuple[list[str], dict | None]:
	"""Retrieve top-k query-relevant snippets plus citation metadata."""
	cleaned_query = query.strip()
	if not cleaned_query:
		return [], None

	entity_result = await db.execute(select(Entity).where(Entity.id == entity_id))
	entity = entity_result.scalar_one_or_none()
	if entity is None:
		logger.warning("Skipping chat retrieval: entity %s not found", entity_id)
		return [], None

	vector = query_vector or await embed_text(cleaned_query, task_type="RETRIEVAL_QUERY")
	results = query_vectors(
		collection_name=settings.qdrant_collection,
		query_vector=vector,
		limit=limit,
		score_threshold=_DEFAULT_SCORE_THRESHOLD,
		query_filter=_entity_filter(entity),
	)

	snippets: list[str] = []
	sources: list[dict] = []
	seen_texts: set[str] = set()
	total_chars = 0

	for result in results:
		payload = result.payload or {}
		text = _extract_text(payload)
		if not text:
			continue

		normalized = " ".join(text.lower().split())
		if normalized in seen_texts:
			continue
		seen_texts.add(normalized)

		excerpt = _cap(text, _MAX_EXCERPT_CHARS)
		if total_chars + len(excerpt) > _MAX_TOTAL_CONTEXT_CHARS and snippets:
			break

		total_chars += len(excerpt)
		snippets.append(_format_snippet(payload, excerpt))
		sources.append(
			{
				"score": float(result.score) if result.score is not None else None,
				"source_type": payload.get("source_type"),
				"content_type": payload.get("content_type"),
				"title": payload.get("title"),
				"source_url": payload.get("source_url"),
				"chunk_index": payload.get("chunk_index"),
				"excerpt": excerpt,
			}
		)

	if not sources:
		logger.info(
			"Chat retrieval returned no results for entity=%s wikidata_id=%s query=%r",
			entity.id,
			entity.wikidata_id,
			cleaned_query[:120],
		)
		return [], None

	logger.info(
		"Chat retrieval returned %d result(s) for entity=%s wikidata_id=%s query=%r",
		len(sources),
		entity.id,
		entity.wikidata_id,
		cleaned_query[:120],
	)
	for index, source in enumerate(sources, start=1):
		logger.info(
			"RAG chunk %d score=%.4f source=%s/%s title=%r preview=%r",
			index,
			source["score"] or 0.0,
			source.get("source_type") or "unknown",
			source.get("content_type") or "unknown",
			source.get("title"),
			_cap(source["excerpt"], _LOG_PREVIEW_CHARS),
		)

	return snippets, {
		"query": cleaned_query,
		"entity_id": str(entity.id),
		"wikidata_id": entity.wikidata_id,
		"collection": settings.qdrant_collection,
		"results": sources,
	}
