import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.chat_session import ChatSession


async def create_session(
    user_id: uuid.UUID,
    project_id: uuid.UUID,
    entity_id: uuid.UUID,
    db: AsyncSession,
    title: str | None = None,
) -> ChatSession:
    session = ChatSession(
        id=uuid.uuid4(),
        user_id=user_id,
        project_id=project_id,
        entity_id=entity_id,
        title=title,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def get_sessions_by_project(
    project_id: uuid.UUID, db: AsyncSession
) -> list[ChatSession]:
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.project_id == project_id)
        .order_by(ChatSession.updated_at.desc())
    )
    return list(result.scalars().all())


async def get_session_by_id(
    session_id: uuid.UUID, db: AsyncSession
) -> ChatSession | None:
    result = await db.execute(select(ChatSession).where(ChatSession.id == session_id))
    return result.scalar_one_or_none()
