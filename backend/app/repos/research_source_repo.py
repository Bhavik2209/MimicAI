import uuid
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.research_source import ResearchSource


async def save_source(
    entity_id: uuid.UUID,
    source_type: str,
    url: str,
    db: AsyncSession,
    title: str | None = None,
) -> None:
    """Upsert a source URL — silently skips if (entity_id, source_type, url) already exists."""
    stmt = (
        pg_insert(ResearchSource)
        .values(id=uuid.uuid4(), entity_id=entity_id, source_type=source_type, url=url, title=title)
        .on_conflict_do_nothing(constraint="research_sources_entity_source_url_key")
    )
    await db.execute(stmt)
    await db.commit()


async def get_sources_by_entity(
    entity_id: uuid.UUID, db: AsyncSession
) -> list[ResearchSource]:
    result = await db.execute(
        select(ResearchSource)
        .where(ResearchSource.entity_id == entity_id)
        .order_by(ResearchSource.created_at.desc())
    )
    return list(result.scalars().all())


async def get_sources_by_type(
    entity_id: uuid.UUID, source_type: str, db: AsyncSession
) -> list[ResearchSource]:
    result = await db.execute(
        select(ResearchSource)
        .where(
            ResearchSource.entity_id == entity_id,
            ResearchSource.source_type == source_type,
        )
        .order_by(ResearchSource.created_at.desc())
    )
    return list(result.scalars().all())
