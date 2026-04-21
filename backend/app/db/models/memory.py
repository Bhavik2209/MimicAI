"""Chat memory ORM models."""

import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

NOW_SQL = text("now()")


class ChatSession(Base):
	"""Chat session mapped to public.chat_sessions."""

	__tablename__ = "chat_sessions"

	id: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		primary_key=True,
		server_default=text("gen_random_uuid()"),
	)
	user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
	project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
	entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("entities.id"), nullable=False)
	title: Mapped[str | None] = mapped_column(Text)
	created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=NOW_SQL, nullable=False)
	updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=NOW_SQL, nullable=False)

	user = relationship("User", back_populates="chat_sessions")
	project = relationship("Project", back_populates="chat_sessions")
	entity = relationship("Entity", back_populates="chat_sessions")
	messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")


class ChatMessage(Base):
	"""Chat message mapped to public.chat_messages."""

	__tablename__ = "chat_messages"

	__table_args__ = (
		CheckConstraint(
			"role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text])",
			name="chat_messages_role_check",
		),
	)

	id: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		primary_key=True,
		server_default=text("gen_random_uuid()"),
	)
	session_id: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		ForeignKey("chat_sessions.id"),
		nullable=False,
	)
	role: Mapped[str] = mapped_column(Text, nullable=False)
	content: Mapped[str] = mapped_column(Text, nullable=False)
	citations: Mapped[dict | None] = mapped_column(JSONB)
	created_at: Mapped[datetime] = mapped_column(
		DateTime(timezone=True),
		server_default=NOW_SQL,
		nullable=False,
	)

	session = relationship("ChatSession", back_populates="messages")

