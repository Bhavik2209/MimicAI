import uuid
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.research_source import ResearchSource


async def save_source(
    entity_id: uuid.UUID,
    source_type: str,
    db: AsyncSession,
    title: str | None = None,
    url: str | None = None,
    published_at: datetime | None = None,
    metadata: dict | None = None,
) -> ResearchSource:
    source = ResearchSource(
        id=uuid.uuid4(),
        entity_id=entity_id,
        title=title,
        url=url,
        source_type=source_type,
        published_at=published_at,
        metadata_=metadata,
    )
    db.add(source)
    await db.commit()
    await db.refresh(source)
    return source


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
