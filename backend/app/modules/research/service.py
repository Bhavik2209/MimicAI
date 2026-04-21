"""Service layer for research orchestration route."""

import logging

from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.chat.context_loader import invalidate_prompt_cache
from app.modules.research.graph import graph
from app.modules.research.schemas import (
	ResearchAcquisitionBundle,
	ResearchAnalysisBundle,
	ResearchResponse,
	ResearchVectorStoreInfo,
)
from app.repos.research_repo import (
	get_entity_by_wikidata_id,
	get_cached_research_profile_by_wikidata_id,
	get_or_create_entity,
	list_research_sources,
	replace_youtube_sources,
	upsert_research_profile,
)

logger = logging.getLogger(__name__)


def _serialize_source_rows(rows: list) -> list[dict]:
	"""Convert ResearchSource ORM rows to response dictionaries."""
	return [
		{
			"source_type": row.source_type,
			"title": row.title,
			"url": row.url,
		}
		for row in rows
	]


async def _safe_rollback(db: AsyncSession) -> None:
	"""Rollback the session after a recoverable DB error."""
	try:
		await db.rollback()
	except Exception:
		logger.exception("Failed to rollback research DB session")


async def run_entity_research(db: AsyncSession, entity_id: str) -> ResearchResponse:
	"""Execute full research workflow for an entity using LangGraph state."""
	try:
		cached_profile = await get_cached_research_profile_by_wikidata_id(db=db, wikidata_id=entity_id)
	except SQLAlchemyError:
		logger.exception("Research cache read failed for %s; continuing without cache", entity_id)
		await _safe_rollback(db)
		cached_profile = None
	except Exception:
		logger.exception("Unexpected cache read failure for %s; continuing without cache", entity_id)
		await _safe_rollback(db)
		cached_profile = None
	if cached_profile is not None:
		try:
			entity = await get_entity_by_wikidata_id(db=db, wikidata_id=entity_id)
		except SQLAlchemyError:
			logger.exception("Entity lookup failed for cached profile %s; returning cached profile without resources", entity_id)
			await _safe_rollback(db)
			entity = None
		except Exception:
			logger.exception("Unexpected entity lookup failure for cached profile %s", entity_id)
			await _safe_rollback(db)
			entity = None
		resources: list[dict] = []
		if entity is not None:
			try:
				sources = await list_research_sources(db=db, entity_db_id=entity.id, source_type="youtube")
				resources = _serialize_source_rows(sources)
			except Exception:
				logger.exception("Failed to load cached research sources for %s", entity_id)
				await _safe_rollback(db)
				resources = []

		acquisition = cached_profile.get("acquisition")
		if isinstance(acquisition, dict):
			acquisition["resources"] = resources
		else:
			cached_profile["acquisition"] = {"resources": resources}

		return ResearchResponse.model_validate(cached_profile)

	try:
		state = await graph.ainvoke({"entity_id": entity_id})
	except Exception as exc:
		logger.exception("Research graph execution failed for %s", entity_id)
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail="Research pipeline failed. Please try again.",
		) from exc
	basic_info = state["basic_info"]

	# 1) Ensure entity exists before downstream persistence.
	try:
		entity = await get_or_create_entity(
			db=db,
			wikidata_id=entity_id,
			name=basic_info.get("name") or entity_id,
			description=basic_info.get("description"),
			image_url=basic_info.get("image_url"),
		)
	except SQLAlchemyError:
		logger.exception("Entity upsert failed for %s; returning non-persisted research response", entity_id)
		await _safe_rollback(db)
		entity = None
	except Exception:
		logger.exception("Unexpected entity upsert failure for %s; returning non-persisted research response", entity_id)
		await _safe_rollback(db)
		entity = None

	response = ResearchResponse(
		basic_info=basic_info,
		acquisition=ResearchAcquisitionBundle(
			wiki=state.get("wiki", {}),
			openalex=state.get("openalex"),
			socials=state.get("socials", {}),
			quotes=state.get("quotes", {}),
			conversation=state.get("conversation", {}),
			timeline=state.get("timeline", {}),
			news=state.get("news", []),
			resources=[],
		),
		vector_store=ResearchVectorStoreInfo(**state.get("vector_store", {})),
		analysis=ResearchAnalysisBundle(
			personality=None,
		),
		status="completed",
	)

	# 2) Persist full aggregated response into research_profiles.
	if entity is None:
		return response

	try:
		source_rows = await replace_youtube_sources(
			db=db,
			entity_db_id=entity.id,
			videos=state.get("conversation", {}).get("videos", []),
		)
		response.acquisition.resources = _serialize_source_rows(source_rows)
	except Exception:
		logger.exception("Failed to persist research sources for %s; continuing without stored resources", entity_id)
		await _safe_rollback(db)
		response.acquisition.resources = []

	response_payload = response.model_dump()
	try:
		await upsert_research_profile(
			db=db,
			entity_db_id=entity.id,
			aggregated_profile=response_payload,
			summary=state.get("wiki", {}).get("intro_summary"),
			status=response.status,
		)
		# Bust the system prompt cache so the next chat turn uses the fresh data
		invalidate_prompt_cache(entity.id)
	except Exception:
		logger.exception("Failed to persist research profile for %s; returning live response", entity_id)
		await _safe_rollback(db)
		# If another concurrent request persisted successfully, return that cached profile
		# instead of failing this request late in the pipeline.
		try:
			cached_after_failure = await get_cached_research_profile_by_wikidata_id(
				db=db,
				wikidata_id=entity_id,
			)
		except Exception:
			logger.exception("Failed to re-read cached research profile after persist error for %s", entity_id)
			await _safe_rollback(db)
			cached_after_failure = None
		if cached_after_failure is not None:
			cached_acquisition = cached_after_failure.get("acquisition")
			if isinstance(cached_acquisition, dict):
				cached_acquisition["resources"] = response.acquisition.resources
			return ResearchResponse.model_validate(cached_after_failure)
		return response

	return response

