import uuid
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.research_profile import ResearchProfile

# Valid section names mapped to model attributes
_SECTION_MAP = {
    "summary": "summary",
    "personality_profile": "personality_profile",
    "timeline": "timeline",
    "controversies": "controversies",
    "quotes": "quotes",
}


async def create_profile(entity_id: uuid.UUID, db: AsyncSession) -> ResearchProfile:
    """Create an empty research profile for the given entity."""
    profile = ResearchProfile(
        id=uuid.uuid4(),
        entity_id=entity_id,
    )
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


async def get_profile(entity_id: uuid.UUID, db: AsyncSession) -> ResearchProfile | None:
    result = await db.execute(
        select(ResearchProfile).where(ResearchProfile.entity_id == entity_id)
    )
    return result.scalar_one_or_none()


async def update_profile_section(
    entity_id: uuid.UUID, section: str, data: dict | str, db: AsyncSession
) -> ResearchProfile | None:
    """
    Write the result of one analysis agent into the appropriate column.
    `section` must be one of: summary, personality_profile, timeline,
    controversies, quotes.
    """
    profile = await get_profile(entity_id, db)
    if not profile:
        return None
    attr = _SECTION_MAP.get(section)
    if attr is None:
        raise ValueError(f"Unknown profile section: {section!r}")
    setattr(profile, attr, data)
    profile.last_research_update = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(profile)
    return profile


async def get_profile_section(
    entity_id: uuid.UUID, section: str, db: AsyncSession
) -> dict | str | None:
    profile = await get_profile(entity_id, db)
    if not profile:
        return None
    attr = _SECTION_MAP.get(section)
    if attr is None:
        raise ValueError(f"Unknown profile section: {section!r}")
    return getattr(profile, attr)
