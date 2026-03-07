import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.chat_message import ChatMessage


async def save_message(
    session_id: uuid.UUID,
    role: str,
    content: str,
    db: AsyncSession,
    citations: list | None = None,
) -> ChatMessage:
    message = ChatMessage(
        id=uuid.uuid4(),
        session_id=session_id,
        role=role,
        content=content,
        citations=citations,
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message


async def get_messages_by_session(
    session_id: uuid.UUID, db: AsyncSession, limit: int = 20
) -> list[ChatMessage]:
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
        .limit(limit)
    )
    return list(result.scalars().all())
