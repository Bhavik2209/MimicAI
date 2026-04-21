"""Tavily-backed live web search helpers for persona chat."""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
import logging
import re
from typing import Any

import requests

from app.config import settings

logger = logging.getLogger(__name__)

_TAVILY_SEARCH_URL = "https://api.tavily.com/search"
_DEFAULT_MAX_RESULTS = 3
_REQUEST_TIMEOUT_SECONDS = 12
_MAX_EXCERPT_CHARS = 180
_MAX_TOTAL_CONTEXT_CHARS = 700

_RELATIVE_DATE_PATTERNS: tuple[tuple[re.Pattern[str], int], ...] = (
	(re.compile(r"\bday\s+before\s+yesterday\b", re.IGNORECASE), -2),
	(re.compile(r"\byesterday\b", re.IGNORECASE), -1),
	(re.compile(r"\blast\s+night\b", re.IGNORECASE), -1),
	(re.compile(r"\btoday\b", re.IGNORECASE), 0),
	(re.compile(r"\btonight\b", re.IGNORECASE), 0),
	(re.compile(r"\bthis\s+morning\b", re.IGNORECASE), 0),
)


def _cap(text: str, max_chars: int) -> str:
	"""Trim text to a prompt-safe length."""
	cleaned = " ".join(text.split())
	if len(cleaned) <= max_chars:
		return cleaned
	return cleaned[:max_chars].rsplit(" ", 1)[0] + "…"


def _build_result_snippet(result: dict[str, Any], excerpt: str) -> str:
	"""Convert one Tavily result into a compact prompt snippet."""
	title = (result.get("title") or "Untitled result").strip()
	url = (result.get("url") or "").strip()
	label = title if not url else f"{title} | {url}"
	return f"[web] {label} — {excerpt}"


def _infer_topic(query: str) -> str:
	"""Choose a Tavily topic with a lightweight heuristic."""
	lowered = query.lower()
	news_terms = (
		"latest",
		"today",
		"current",
		"news",
		"recent",
		"breaking",
		"update",
		"updates",
	)
	if any(term in lowered for term in news_terms):
		return "news"
	return "general"


def _normalize_relative_date(query: str, now_utc: datetime | None = None) -> str | None:
	"""Map relative date terms to an explicit YYYY-MM-DD date when possible."""
	now = now_utc or datetime.now(timezone.utc)
	for pattern, offset_days in _RELATIVE_DATE_PATTERNS:
		if pattern.search(query):
			return (now + timedelta(days=offset_days)).date().isoformat()
	return None


def _build_enriched_query(
	query: str,
	entity_name: str | None,
	now_utc: datetime | None = None,
) -> tuple[str, dict[str, str]]:
	"""Add entity + explicit date context for better current-events web retrieval."""
	cleaned_query = " ".join((query or "").split())
	cleaned_entity = " ".join((entity_name or "").split())

	parts: list[str] = []
	if cleaned_entity and cleaned_entity.lower() not in cleaned_query.lower():
		parts.append(cleaned_entity)
	parts.append(cleaned_query)
	enriched_query = " ".join(part for part in parts if part)

	date_filters: dict[str, str] = {}
	normalized_date = _normalize_relative_date(cleaned_query, now_utc=now_utc)
	if normalized_date:
		if normalized_date not in enriched_query:
			enriched_query = f"{enriched_query} on {normalized_date}"
		# Constrain the search window when the user asks relative-date questions.
		date_filters = {
			"start_date": normalized_date,
			"end_date": normalized_date,
		}

	return enriched_query, date_filters


def _search_tavily_sync(query: str, entity_name: str | None = None) -> dict[str, Any]:
	"""Run one Tavily search request synchronously."""
	if not settings.tavily_api_key:
		raise RuntimeError("TAVILY_API_KEY is not configured")

	search_query, date_filters = _build_enriched_query(
		query=query,
		entity_name=entity_name,
	)
	request_payload: dict[str, Any] = {
		"query": search_query,
		"topic": _infer_topic(search_query),
		"search_depth": "basic",
		"max_results": _DEFAULT_MAX_RESULTS,
		"include_answer": False,
		"include_raw_content": False,
	}
	request_payload.update(date_filters)

	response = requests.post(
		_TAVILY_SEARCH_URL,
		headers={
			"Authorization": f"Bearer {settings.tavily_api_key}",
			"Content-Type": "application/json",
		},
		json=request_payload,
		timeout=_REQUEST_TIMEOUT_SECONDS,
	)
	response.raise_for_status()
	payload = response.json()
	payload["_resolved_query"] = search_query
	payload["_date_filters"] = date_filters
	return payload


def _iter_unique_results(results: list[Any]) -> list[dict[str, Any]]:
	"""Return only dict results with unique URLs (keeping first occurrence)."""
	unique: list[dict[str, Any]] = []
	seen_urls: set[str] = set()

	for result in results:
		if not isinstance(result, dict):
			continue

		url = str(result.get("url") or "").strip()
		if url and url in seen_urls:
			continue
		if url:
			seen_urls.add(url)

		unique.append(result)

	return unique


def _build_web_snippets_and_sources(
	results: list[Any],
) -> tuple[list[str], list[dict[str, Any]]]:
	"""Convert Tavily results to prompt snippets and citation metadata."""
	snippets: list[str] = []
	sources: list[dict[str, Any]] = []
	total_chars = 0

	for result in _iter_unique_results(results):
		content = str(result.get("content") or "").strip()
		if not content:
			continue

		excerpt = _cap(content, _MAX_EXCERPT_CHARS)
		if total_chars + len(excerpt) > _MAX_TOTAL_CONTEXT_CHARS and snippets:
			break

		total_chars += len(excerpt)
		url = str(result.get("url") or "").strip()
		snippets.append(_build_result_snippet(result, excerpt))
		sources.append(
			{
				"title": result.get("title"),
				"url": url or None,
				"excerpt": excerpt,
				"score": result.get("score"),
				"favicon": result.get("favicon"),
				"published_date": result.get("published_date"),
			}
		)

	return snippets, sources


async def search_web_context(
	query: str,
	entity_name: str | None = None,
) -> tuple[list[str], dict | None]:
	"""Return prompt snippets and citation metadata for live web search."""
	cleaned_query = query.strip()
	if not cleaned_query:
		return [], None

	payload = await asyncio.to_thread(
		_search_tavily_sync,
		cleaned_query,
		entity_name,
	)
	results = payload.get("results") or []
	resolved_query = str(payload.get("_resolved_query") or cleaned_query)
	date_filters = payload.get("_date_filters") or {}

	snippets, sources = _build_web_snippets_and_sources(results)

	if not sources:
		return [], None

	logger.info(
		"Tavily returned %d result(s) for query=%r resolved_query=%r",
		len(sources),
		cleaned_query[:120],
		resolved_query[:160],
	)
	return snippets, {
		"source": "web_search",
		"provider": "tavily",
		"query": cleaned_query,
		"resolved_query": resolved_query,
		"date_filters": date_filters,
		"topic": payload.get("auto_parameters", {}).get("topic") or _infer_topic(cleaned_query),
		"response_time": payload.get("response_time"),
		"request_id": payload.get("request_id"),
		"results": sources,
	}
