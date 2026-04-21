"""LangGraph pipeline for end-to-end entity research orchestration."""

import asyncio
from collections.abc import Iterable
from typing import Any, TypedDict

from langgraph.graph import END, StateGraph

from app.config import settings
from app.db.qdrant import upsert_vectors
from app.modules.acquisition.agents.conversation.service import fetch_entity_conversation
from app.modules.acquisition.agents.news.service import fetch_entity_news
from app.modules.acquisition.agents.openalex.service import fetch_openalex_profile
from app.modules.acquisition.agents.quotes.personality_service import generate_personality_profile
from app.modules.acquisition.agents.quotes.service import fetch_entity_quotes
from app.modules.acquisition.agents.social.service import fetch_social_profiles
from app.modules.acquisition.agents.timeline.service import fetch_entity_timeline
from app.modules.acquisition.agents.wiki.service import fetch_wiki_profile
from app.modules.entity.schemas import EntityCandidate
from app.modules.entity.utils import build_image_url, fetch_entity_data
from app.utils.embeddings_client import embed_texts

import logging
logger = logging.getLogger(__name__)


class ResearchState(TypedDict, total=False):
	"""State for research LangGraph pipeline."""

	entity_id: str
	basic_info: dict
	wiki: dict
	openalex: dict | None
	socials: dict
	quotes: dict
	conversation: dict
	timeline: dict
	news: list[dict]
	vector_store: dict
	personality: dict


def _chunk_text(text: str, chunk_size: int = 512, overlap: int = 40) -> list[str]:
	"""Create small overlapping chunks from plain text for embeddings."""
	words = [word for word in text.split() if word.strip()]
	if not words:
		return []

	chunks: list[str] = []
	step = max(1, chunk_size - overlap)
	for start in range(0, len(words), step):
		segment = words[start : start + chunk_size]
		if not segment:
			continue
		chunks.append(" ".join(segment))
		if start + chunk_size >= len(words):
			break
	return chunks


def _build_payloads_from_wiki(entity_id: str, wiki: dict) -> list[dict]:
	"""Convert wiki response into qdrant payload documents."""
	payloads: list[dict] = []
	title = wiki.get("wikipedia_title")

	intro = wiki.get("intro_summary", "")
	for idx, chunk in enumerate(_chunk_text(intro), start=1):
		payloads.append(
			{
				"entity_id": entity_id,
				"wikidata_id": entity_id,
				"source_type": "wiki",
				"content_type": "intro",
				"title": title,
				"content": chunk,
				"chunk_index": idx,
			}
		)

	sections = wiki.get("sections", [])
	for section in sections:
		section_title = section.get("section", "Section")
		text = section.get("text", "")
		for idx, chunk in enumerate(_chunk_text(text), start=1):
			payloads.append(
				{
					"entity_id": entity_id,
					"wikidata_id": entity_id,
					"source_type": "wiki",
					"content_type": "section",
					"title": section_title,
					"content": chunk,
					"chunk_index": idx,
				}
			)

	return payloads


def _build_payloads_from_quotes(entity_id: str, quotes: dict) -> list[dict]:
	"""Convert structured quotes analysis into qdrant payload documents."""
	payloads: list[dict] = []
	analysis = quotes.get("analysis", {}) if isinstance(quotes, dict) else {}
	if not isinstance(analysis, dict):
		return payloads

	def _append_payload(content_type: str, title: str, content: str, idx: int) -> None:
		if not isinstance(content, str) or not content.strip():
			return
		payloads.append(
			{
				"entity_id": entity_id,
				"wikidata_id": entity_id,
				"source_type": "quotes",
				"content_type": content_type,
				"title": title,
				"content": content.strip(),
				"chunk_index": idx,
			}
		)

	_append_payload("quote_summary", "Executive Summary", analysis.get("executive_summary", ""), 1)
	
	# New Personality Profile fields
	profile = analysis.get("personality_profile", {})
	if isinstance(profile, dict):
		for idx, trait in enumerate(profile.get("core_character_traits", []), start=1):
			if isinstance(trait, dict):
				_append_payload("personality_trait", f"Character Trait: {trait.get('trait')}", trait.get("evidence", ""), idx)
		_append_payload("cognitive_style", "Cognitive Style", profile.get("cognitive_style", ""), 1)
		_append_payload("emotional_register", "Emotional Register", profile.get("emotional_register", ""), 1)
		_append_payload("self_concept", "Self Concept", profile.get("self_concept", ""), 1)

	# New Rhetorical DNA fields
	dna = analysis.get("rhetorical_dna", {})
	if isinstance(dna, dict):
		for idx, move in enumerate(dna.get("signature_moves", []), start=1):
			_append_payload("rhetorical_move", f"Signature Move {idx}", move, idx)
		_append_payload("sentence_energy", "Sentence Energy", dna.get("sentence_energy", ""), 1)
		for idx, abs_concept in enumerate(dna.get("favourite_abstractions", []), start=1):
			_append_payload("abstraction", f"Key Abstraction {idx}", abs_concept, idx)

	# Worldview
	worldview = analysis.get("worldview", {})
	if isinstance(worldview, dict):
		for idx, belief in enumerate(worldview.get("core_beliefs", []), start=1):
			_append_payload("worldview_belief", f"Core Belief {idx}", belief, idx)
		for idx, theme in enumerate(worldview.get("recurring_themes", []), start=1):
			_append_payload("worldview_theme", f"Recurring Theme {idx}", theme, idx)
		_append_payload("worldview_tension", "Internal Tension", worldview.get("internal_tensions", ""), 1)

	# Quote Clusters
	for idx, cluster in enumerate(analysis.get("quote_clusters", []), start=1):
		if not isinstance(cluster, dict):
			continue
		cluster_label = cluster.get("label") or f"Cluster {idx}"
		_append_payload("quote_cluster_summary", f"Cluster: {cluster_label}", cluster.get("summary", ""), idx)
		_append_payload("quote_cluster_insight", f"{cluster_label} Insight", cluster.get("personality_insight", ""), idx)

	return payloads


def _build_payloads_from_conversation(entity_id: str, conversation: dict) -> list[dict]:
	"""Convert conversation response into qdrant payload documents."""
	payloads: list[dict] = []
	videos = conversation.get("videos", [])

	for video in videos:
		transcript = video.get("transcript", "")
		url = video.get("url")
		video_id = video.get("video_id")
		for idx, chunk in enumerate(_chunk_text(transcript), start=1):
			payloads.append(
				{
					"entity_id": entity_id,
					"wikidata_id": entity_id,
					"source_type": "conversation",
					"content_type": "transcript_chunk",
					"title": video_id,
					"source_url": url,
					"content": chunk,
					"chunk_index": idx,
				}
			)

	return payloads


async def _initialize_node(state: ResearchState) -> ResearchState:
	"""Resolve base entity information for final response header."""
	entity_id = state["entity_id"]
	try:
		entity = await fetch_entity_data(entity_id)
	except Exception:
		logger.exception("Failed to fetch base entity data for %s; continuing with fallback info", entity_id)
		fallback = EntityCandidate(
			wikidata_id=entity_id,
			name=entity_id,
			description="Entity metadata temporarily unavailable due to upstream throttling.",
			image_url=None,
		)
		return {"basic_info": fallback.model_dump()}

	basic_info = EntityCandidate(
		wikidata_id=entity_id,
		name=entity.get("labels", {}).get("en", {}).get("value") or entity_id,
		description=entity.get("descriptions", {}).get("en", {}).get("value"),
		image_url=build_image_url(entity),
	)
	return {"basic_info": basic_info.model_dump()}


async def _safe_fetch(coro, default_factory=dict):
	"""Execute a fetcher coroutine safely, returning a default on failure."""
	try:
		return await coro
	except Exception as e:
		logger.error(f"Agent fetch failed: {str(e)}")
		return default_factory() if callable(default_factory) else default_factory


async def _acquisition_node(state: ResearchState) -> ResearchState:
	"""Run all acquisition agents in parallel with resilience."""
	entity_id = state["entity_id"]
	name = state["basic_info"]["name"]

	wiki_task = _safe_fetch(fetch_wiki_profile(entity_id))
	openalex_task = _safe_fetch(fetch_openalex_profile(entity_id), default_factory=None)
	socials_task = _safe_fetch(fetch_social_profiles(entity_id))
	quotes_task = _safe_fetch(fetch_entity_quotes(entity_id))
	conversation_task = _safe_fetch(fetch_entity_conversation(entity_id))
	timeline_task = _safe_fetch(fetch_entity_timeline(entity_id))
	news_task = _safe_fetch(fetch_entity_news(name, max_articles=5), default_factory=list)

	wiki, openalex, socials, quotes, conversation, timeline, news = await asyncio.gather(
		wiki_task, openalex_task, socials_task, quotes_task, conversation_task, timeline_task, news_task
	)

	def _safe_dump(obj):
		if obj is None:
			return None
		if hasattr(obj, "model_dump"):
			return obj.model_dump()
		return obj

	return {
		"wiki": _safe_dump(wiki),
		"openalex": _safe_dump(openalex),
		"socials": _safe_dump(socials),
		"quotes": _safe_dump(quotes),
		"conversation": _safe_dump(conversation),
		"timeline": _safe_dump(timeline),
		"news": [_safe_dump(article) for article in news],
	}


def _count_by_source(payloads: Iterable[dict]) -> dict[str, int]:
	"""Aggregate source counts for vector store summary."""
	counts: dict[str, int] = {}
	for payload in payloads:
		source = payload.get("source_type", "unknown")
		counts[source] = counts.get(source, 0) + 1
	return counts


async def _vector_store_node(state: ResearchState) -> ResearchState:
	"""Embed and upsert wiki/quotes/conversation documents into Qdrant."""
	entity_id = state["entity_id"]

	payloads: list[dict] = []
	payloads.extend(_build_payloads_from_wiki(entity_id, state["wiki"]))
	payloads.extend(_build_payloads_from_quotes(entity_id, state["quotes"]))
	payloads.extend(_build_payloads_from_conversation(entity_id, state["conversation"]))

	payloads = [
		payload
		for payload in payloads
		if isinstance(payload.get("content"), str) and payload.get("content", "").strip()
	]
	contents = [payload["content"] for payload in payloads]

	stored_points = 0
	if contents:
		vectors = await embed_texts(contents, task_type="RETRIEVAL_DOCUMENT")
		upsert_vectors(
			collection_name=settings.qdrant_collection,
			vectors=vectors,
			payloads=payloads,
		)
		stored_points = len(vectors)

	return {
		"vector_store": {
			"collection": settings.qdrant_collection,
			"stored_points": stored_points,
			"source_counts": _count_by_source(payloads),
		}
	}


async def _analysis_node(state: ResearchState) -> ResearchState:
	"""Run multi-source personality analysis using all acquisition data."""
	entity_id = state.get("entity_id")
	basic_info = state.get("basic_info") or {}
	name = basic_info.get("name")
	
	if not name:
		return {"personality": {}}

	# Extract context from wiki intro and conversation transcripts
	wiki = state.get("wiki") or {}
	wiki_intro = wiki.get("intro_summary", "")
	
	# Extract plain quotes if available
	quotes = state.get("quotes") or {}
	quotes_list = quotes.get("quotes") or []
	quote_texts = []
	for q in quotes_list:
		if isinstance(q, str):
			quote_texts.append(q)
		elif isinstance(q, dict) and q.get("quote"):
			quote_texts.append(q["quote"])

	# Extract conversation transcripts
	conversation = state.get("conversation") or {}
	transcripts = []
	for video in conversation.get("videos") or []:
		if video.get("transcript"):
			transcripts.append(video["transcript"])

	try:
		personality = await generate_personality_profile(
			name=name,
			wiki_intro=wiki_intro,
			quotes=quote_texts,
			transcripts=transcripts
		)
		return {"personality": personality.model_dump()}
	except Exception:
		from app.modules.acquisition.agents.quotes.service import _empty_quotes_analysis
		return {"personality": _empty_quotes_analysis().model_dump()}


def build_graph():
	"""Build and compile research LangGraph pipeline."""
	graph = StateGraph(ResearchState)

	graph.add_node("initialize", _initialize_node)
	graph.add_node("acquisition", _acquisition_node)
	graph.add_node("vector_store", _vector_store_node)
	graph.add_node("analysis", _analysis_node)

	graph.set_entry_point("initialize")
	graph.add_edge("initialize", "acquisition")
	graph.add_edge("acquisition", "vector_store")
	graph.add_edge("vector_store", "analysis")
	graph.add_edge("analysis", END)

	return graph.compile()


graph = build_graph()

