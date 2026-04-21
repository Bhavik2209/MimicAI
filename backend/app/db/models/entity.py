"""Entity ORM model."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Entity(Base):
	"""Research entity mapped to public.entities."""

	__tablename__ = "entities"

	id: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		primary_key=True,
		server_default=text("gen_random_uuid()"),
	)
	wikidata_id: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
	name: Mapped[str] = mapped_column(Text, nullable=False)
	description: Mapped[str | None] = mapped_column(Text)
	image_url: Mapped[str | None] = mapped_column(Text)
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

	projects = relationship("Project", back_populates="entity")
	research_profile = relationship("ResearchProfile", back_populates="entity", uselist=False)
	research_sources = relationship("ResearchSource", back_populates="entity")
	chat_sessions = relationship("ChatSession", back_populates="entity")

