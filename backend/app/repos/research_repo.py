"""Data access layer for research orchestration persistence."""

from datetime import datetime, timezone

from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.entity import Entity
from app.db.models.profile import ResearchProfile
from app.db.models.research import ResearchSource


async def get_entity_by_wikidata_id(db: AsyncSession, wikidata_id: str) -> Entity | None:
	"""Return one entity by Wikidata identifier."""
	result = await db.execute(select(Entity).where(Entity.wikidata_id == wikidata_id))
	return result.scalar_one_or_none()


async def get_cached_research_profile_by_wikidata_id(
	db: AsyncSession,
	wikidata_id: str,
) -> dict | None:
	"""Return cached aggregated research profile for one Wikidata id, if present."""
	entity = await get_entity_by_wikidata_id(db, wikidata_id)
	if entity is None:
		return None

	result = await db.execute(
		select(ResearchProfile.aggregated_profile).where(ResearchProfile.entity_id == entity.id)
	)
	cached = result.scalar_one_or_none()
	if isinstance(cached, dict):
		return cached
	return None


async def get_or_create_entity(
	db: AsyncSession,
	wikidata_id: str,
	name: str,
	description: str | None,
	image_url: str | None,
) -> Entity:
	"""Get existing entity by Wikidata id or create a new one."""
	entity = await get_entity_by_wikidata_id(db, wikidata_id)
	if entity is not None:
		# Keep core profile fields fresh in case source data improved.
		entity.name = name
		entity.description = description
		entity.image_url = image_url
		entity.updated_at = datetime.now(timezone.utc)
		await db.commit()
		await db.refresh(entity)
		return entity

	entity = Entity(
		wikidata_id=wikidata_id,
		name=name,
		description=description,
		image_url=image_url,
	)
	db.add(entity)
	try:
		await db.commit()
		await db.refresh(entity)
		return entity
	except IntegrityError:
		# Another concurrent request may have created the same wikidata row.
		await db.rollback()
		existing = await get_entity_by_wikidata_id(db, wikidata_id)
		if existing is None:
			raise

		existing.name = name
		existing.description = description
		existing.image_url = image_url
		existing.updated_at = datetime.now(timezone.utc)
		await db.commit()
		await db.refresh(existing)
		return existing


async def upsert_research_profile(
	db: AsyncSession,
	entity_db_id,
	aggregated_profile: dict,
	summary: str | None,
	status: str,
) -> ResearchProfile:
	"""Insert or update one aggregated research profile for an entity."""
	result = await db.execute(
		select(ResearchProfile).where(ResearchProfile.entity_id == entity_db_id)
	)
	profile = result.scalar_one_or_none()
	now = datetime.now(timezone.utc)

	if profile is None:
		profile = ResearchProfile(
			entity_id=entity_db_id,
			summary=summary,
			last_research_update=now,
			aggregated_profile=aggregated_profile,
			status=status,
		)
		db.add(profile)
		try:
			await db.commit()
			await db.refresh(profile)
			return profile
		except IntegrityError:
			# Concurrent insert race: fall back to update path.
			await db.rollback()
			result = await db.execute(
				select(ResearchProfile).where(ResearchProfile.entity_id == entity_db_id)
			)
			profile = result.scalar_one_or_none()
			if profile is None:
				raise

			profile.summary = summary
			profile.last_research_update = now
			profile.aggregated_profile = aggregated_profile
			profile.status = status
			profile.updated_at = now
	else:
		profile.summary = summary
		profile.last_research_update = now
		profile.aggregated_profile = aggregated_profile
		profile.status = status
		profile.updated_at = now

	await db.commit()
	await db.refresh(profile)
	return profile


async def replace_youtube_sources(
	db: AsyncSession,
	entity_db_id,
	videos: list[dict],
) -> list[ResearchSource]:
	"""Replace stored YouTube source links for an entity with latest set.

	This handles legacy schemas with restrictive uniqueness constraints by
	skipping conflicting rows instead of failing the entire research flow.
	"""
	await db.execute(
		delete(ResearchSource).where(
			ResearchSource.entity_id == entity_db_id,
			ResearchSource.source_type == "youtube",
		)
	)

	seen_urls: set[str] = set()
	rows: list[ResearchSource] = []
	for idx, video in enumerate(videos, start=1):
		url = (video.get("url") or "").strip()
		if not url or url in seen_urls:
			continue
		seen_urls.add(url)
		title = video.get("video_id") or f"YouTube Video {idx}"

		try:
			async with db.begin_nested():
				row = ResearchSource(
					entity_id=entity_db_id,
					source_type="youtube",
					url=url,
					title=title,
				)
				db.add(row)
				await db.flush()
				rows.append(row)
		except IntegrityError:
			# Keep research pipeline resilient when DB uniqueness constraints are stricter
			# than expected (for example old schemas with single-row limits).
			continue

	await db.commit()
	for row in rows:
		await db.refresh(row)
	return rows


async def list_research_sources(
	db: AsyncSession,
	entity_db_id,
	source_type: str | None = None,
) -> list[ResearchSource]:
	"""Return stored research source links for one entity."""
	stmt = select(ResearchSource).where(ResearchSource.entity_id == entity_db_id)
	if source_type:
		stmt = stmt.where(ResearchSource.source_type == source_type)
	stmt = stmt.order_by(ResearchSource.created_at.desc())
	result = await db.execute(stmt)
	return list(result.scalars().all())
