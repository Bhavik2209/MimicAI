import asyncio
from typing import Any

from qdrant_client import models as qmodels

from app.db.qdrant import get_qdrant_client
from app.modules.analysis.agents.question_generator import generate_analysis_questions
from app.utils.embeddings_client import embed_texts


def _extract_chunk_text(payload: dict[str, Any] | None) -> str:
	if not payload:
		return ""
	for key in ("chunk_text", "text", "content", "body"):
		val = payload.get(key)
		if isinstance(val, str) and val.strip():
			return val.strip()
	return ""


def _build_filter(match_filter: dict[str, Any] | None) -> qmodels.Filter | None:
	if not match_filter:
		return None

	conditions: list[qmodels.FieldCondition] = []
	for key, value in match_filter.items():
		conditions.append(
			qmodels.FieldCondition(
				key=key,
				match=qmodels.MatchValue(value=value),
			)
		)

	if not conditions:
		return None
	return qmodels.Filter(must=conditions)


async def _search_question(
	*,
	collection_name: str,
	question: str,
	vector: list[float],
	top_k: int,
	match_filter: dict[str, Any] | None,
) -> dict[str, Any]:
	client = get_qdrant_client()
	query_filter = _build_filter(match_filter)

	hits = await asyncio.to_thread(
		client.search,
		collection_name=collection_name,
		query_vector=vector,
		limit=top_k,
		query_filter=query_filter,
		with_payload=True,
	)

	chunks: list[dict[str, Any]] = []
	for hit in hits:
		payload = hit.payload or {}
		text = _extract_chunk_text(payload)
		if not text:
			continue

		chunks.append(
			{
				"point_id": str(hit.id),
				"score": float(hit.score),
				"text": text,
				"source_url": payload.get("source_url") or payload.get("url"),
				"source_type": payload.get("source_type"),
				"payload": payload,
			}
		)

	return {"question": question, "chunks": chunks}


async def retrieve_analysis_chunks(
	*,
	entity_name: str,
	collection_name: str,
	context: str | None = None,
	top_k: int = 5,
	match_filter: dict[str, Any] | None = None,
) -> dict[str, Any]:
	"""
	1. Generate 3 personality + 3 controversy questions.
	2. Query vector DB for each question.
	3. Return retrieval results grouped by category.
	"""
	questions = await generate_analysis_questions(entity_name=entity_name, context=context)

	personality_questions = questions["personality_questions"]
	controversy_questions = questions["controversy_questions"]
	all_questions = personality_questions + controversy_questions

	vectors = await embed_texts(all_questions, task_type="RETRIEVAL_QUERY")

	tasks = [
		_search_question(
			collection_name=collection_name,
			question=question,
			vector=vector,
			top_k=top_k,
			match_filter=match_filter,
		)
		for question, vector in zip(all_questions, vectors)
	]
	results = await asyncio.gather(*tasks)

	personality_results = results[: len(personality_questions)]
	controversy_results = results[len(personality_questions) :]

	return {
		"entity_name": entity_name,
		"questions": questions,
		"retrieval": {
			"personality": personality_results,
			"controversy": controversy_results,
		},
	}


def _truncate(text: str, max_chars: int) -> str:
	if len(text) <= max_chars:
		return text
	return text[: max_chars - 3].rstrip() + "..."


def _format_chunk(
	chunk: dict[str, Any],
	*,
	seen_point_ids: set[str],
	max_chars_per_chunk: int,
) -> dict[str, Any] | None:
	point_id = str(chunk.get("point_id", ""))
	if point_id and point_id in seen_point_ids:
		return None

	text = str(chunk.get("text", "")).strip()
	if not text:
		return None

	if point_id:
		seen_point_ids.add(point_id)

	return {
		"snippet": _truncate(text, max_chars_per_chunk),
		"score": round(float(chunk.get("score", 0.0)), 4),
		"source_url": chunk.get("source_url"),
		"source_type": chunk.get("source_type"),
	}


def _format_category_section(
	category_name: str,
	question_results: list[dict[str, Any]],
	*,
	max_chunks_per_question: int,
	max_chars_per_chunk: int,
) -> dict[str, Any]:
	seen_point_ids: set[str] = set()
	items: list[dict[str, Any]] = []

	for result in question_results:
		question = result.get("question", "")
		raw_chunks = result.get("chunks", [])

		formatted_chunks: list[dict[str, Any]] = []
		for chunk in raw_chunks:
			formatted = _format_chunk(
				chunk,
				seen_point_ids=seen_point_ids,
				max_chars_per_chunk=max_chars_per_chunk,
			)
			if not formatted:
				continue

			formatted_chunks.append(formatted)

			if len(formatted_chunks) >= max_chunks_per_question:
				break

		items.append(
			{
				"question": question,
				"evidence": formatted_chunks,
			}
		)

	return {
		"title": category_name,
		"items": items,
	}


def format_analysis_sections(
	retrieval_result: dict[str, Any],
	*,
	max_chunks_per_question: int = 3,
	max_chars_per_chunk: int = 320,
) -> dict[str, Any]:
	"""
	Convert raw retrieval output into display-ready personality/controversy sections.
	"""
	retrieval = retrieval_result.get("retrieval", {})
	personality = retrieval.get("personality", [])
	controversy = retrieval.get("controversy", [])

	return {
		"entity_name": retrieval_result.get("entity_name"),
		"personality_section": _format_category_section(
			"Personality",
			personality,
			max_chunks_per_question=max_chunks_per_question,
			max_chars_per_chunk=max_chars_per_chunk,
		),
		"controversy_section": _format_category_section(
			"Controversies",
			controversy,
			max_chunks_per_question=max_chunks_per_question,
			max_chars_per_chunk=max_chars_per_chunk,
		),
	}
