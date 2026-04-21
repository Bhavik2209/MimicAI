"""CRUD operations for chat sessions and messages (chat history persistence)."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.memory import ChatMessage, ChatSession

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Sessions
# ---------------------------------------------------------------------------


async def create_session(
	db: AsyncSession,
	user_id: UUID,
	project_id: UUID,
	entity_id: UUID,
	title: str | None = None,
) -> ChatSession:
	"""Insert a new chat session row and return the ORM object."""
	session = ChatSession(
		user_id=user_id,
		project_id=project_id,
		entity_id=entity_id,
		title=title,
	)
	db.add(session)
	await db.commit()
	await db.refresh(session)
	logger.info("Created chat session %s for entity %s", session.id, entity_id)
	return session


async def get_session(db: AsyncSession, session_id: UUID) -> ChatSession | None:
	"""Fetch one chat session by primary key."""
	result = await db.execute(
		select(ChatSession).where(ChatSession.id == session_id)
	)
	return result.scalar_one_or_none()


async def list_sessions(
	db: AsyncSession,
	entity_id: UUID,
	user_id: UUID | None = None,
) -> list[ChatSession]:
	"""Return all sessions for an entity, newest first."""
	stmt = select(ChatSession).where(ChatSession.entity_id == entity_id)
	if user_id is not None:
		stmt = stmt.where(ChatSession.user_id == user_id)
	stmt = stmt.order_by(ChatSession.updated_at.desc())
	result = await db.execute(stmt)
	return list(result.scalars().all())


async def touch_session(db: AsyncSession, session_id: UUID) -> None:
	"""Bump the updated_at timestamp on a session to reflect recent activity."""
	result = await db.execute(
		select(ChatSession).where(ChatSession.id == session_id)
	)
	session = result.scalar_one_or_none()
	if session is not None:
		session.updated_at = datetime.now(timezone.utc)
		await db.commit()


async def delete_session(db: AsyncSession, session_id: UUID) -> bool:
	"""Delete a session (cascades to messages). Returns True if it existed."""
	result = await db.execute(
		select(ChatSession).where(ChatSession.id == session_id)
	)
	session = result.scalar_one_or_none()
	if session is None:
		return False
	await db.execute(delete(ChatSession).where(ChatSession.id == session_id))
	await db.commit()
	logger.info("Deleted chat session %s", session_id)
	return True


async def update_session_title(
	db: AsyncSession,
	session_id: UUID,
	title: str,
) -> None:
	"""Set the human-readable title for a session."""
	result = await db.execute(
		select(ChatSession).where(ChatSession.id == session_id)
	)
	session = result.scalar_one_or_none()
	if session is not None:
		session.title = title
		await db.commit()


# ---------------------------------------------------------------------------
# Messages
# ---------------------------------------------------------------------------


async def save_message(
	db: AsyncSession,
	session_id: UUID,
	role: str,
	content: str,
	citations: dict | None = None,
) -> ChatMessage:
	"""Persist one chat message and return the ORM object."""
	msg = ChatMessage(
		session_id=session_id,
		role=role,
		content=content,
		citations=citations,
	)
	db.add(msg)
	await db.commit()
	await db.refresh(msg)
	return msg


async def get_history(
	db: AsyncSession,
	session_id: UUID,
	limit: int = 10,
) -> list[ChatMessage]:
	"""Return the last N messages for a session, ordered oldest → newest.

	Using a sub-query with DESC + limit, then reversing, ensures we get the
	most recent `limit` messages in chronological order for LLM context.
	"""
	# Fetch the most recent `limit` messages (newest first)
	stmt = (
		select(ChatMessage)
		.where(ChatMessage.session_id == session_id)
		.order_by(ChatMessage.created_at.desc())
		.limit(limit)
	)
	result = await db.execute(stmt)
	rows = list(result.scalars().all())
	# Reverse to get chronological order (oldest → newest)
	rows.reverse()
	return rows


async def get_all_messages(
	db: AsyncSession,
	session_id: UUID,
) -> list[ChatMessage]:
	"""Return ALL messages for a session in chronological order (for UI display)."""
	stmt = (
		select(ChatMessage)
		.where(ChatMessage.session_id == session_id)
		.order_by(ChatMessage.created_at.asc())
	)
	result = await db.execute(stmt)
	return list(result.scalars().all())


# ---------------------------------------------------------------------------
# Phase 2 stubs
# ---------------------------------------------------------------------------


async def get_user_preferences(db: AsyncSession, user_id: UUID) -> dict:
	"""[Phase 2] Return user-level memory/preferences to personalise responses.

	This is a stub. In Phase 2 this will query a dedicated user_memory table
	and return structured preferences that the context loader can inject.
	"""
	return {}
