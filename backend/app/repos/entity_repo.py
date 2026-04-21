"""Data access layer for entity persistence."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.entity import Entity


async def get_entity_by_id(db: AsyncSession, entity_id: UUID) -> Entity | None:
	"""Return one entity by UUID id."""
	return await db.get(Entity, entity_id)


async def get_entity_by_wikidata_id(db: AsyncSession, wikidata_id: str) -> Entity | None:
	"""Return one entity by Wikidata identifier."""
	result = await db.execute(select(Entity).where(Entity.wikidata_id == wikidata_id))
	return result.scalar_one_or_none()


async def create_entity(
	db: AsyncSession,
	entity_id: UUID,
	wikidata_id: str,
	name: str,
	description: str | None,
	image_url: str | None,
) -> Entity:
	"""Insert an entity row and return persisted record."""
	entity = Entity(
		id=entity_id,
		wikidata_id=wikidata_id,
		name=name,
		description=description,
		image_url=image_url,
	)
	db.add(entity)
	await db.commit()
	await db.refresh(entity)
	return entity
