"""Project ORM model."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Project(Base):
	"""User project mapped to public.projects."""

	__tablename__ = "projects"

	__table_args__ = (
		UniqueConstraint("user_id", "entity_id", name="projects_user_entity_key"),
	)

	id: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		primary_key=True,
		server_default=text("gen_random_uuid()"),
	)
	user_id: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		ForeignKey("users.id"),
		nullable=False,
	)
	title: Mapped[str] = mapped_column(Text, nullable=False)
	description: Mapped[str | None] = mapped_column(Text)
	created_at: Mapped[datetime] = mapped_column(
		DateTime(timezone=True),
		server_default=text("now()"),
		nullable=False,
	)
	updated_at: Mapped[datetime] = mapped_column(
		DateTime(timezone=True),
		server_default=text("now()"),
		nullable=False,
	)
	entity_id: Mapped[uuid.UUID | None] = mapped_column(
		UUID(as_uuid=True),
		ForeignKey("entities.id"),
		nullable=True,
	)

	user = relationship("User", back_populates="projects")
	entity = relationship("Entity", back_populates="projects")
	chat_sessions = relationship("ChatSession", back_populates="project", cascade="all, delete-orphan")

