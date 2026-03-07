import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.entity import Entity


async def get_entity_by_id(entity_id: uuid.UUID, db: AsyncSession) -> Entity | None:
    result = await db.execute(select(Entity).where(Entity.id == entity_id))
    return result.scalar_one_or_none()


async def get_entity_by_wikidata_id(wikidata_id: str, db: AsyncSession) -> Entity | None:
    result = await db.execute(select(Entity).where(Entity.wikidata_id == wikidata_id))
    return result.scalar_one_or_none()


async def create_entity(
    wikidata_id: str,
    name: str,
    description: str | None,
    image_url: str | None,
    db: AsyncSession,
) -> Entity:
    entity = Entity(
        id=uuid.uuid4(),
        wikidata_id=wikidata_id,
        name=name,
        description=description,
        image_url=image_url,
    )
    db.add(entity)
    await db.commit()
    await db.refresh(entity)
    return entity
