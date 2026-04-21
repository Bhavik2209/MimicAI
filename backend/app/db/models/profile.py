"""Research profile ORM model."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ResearchProfile(Base):
	"""Aggregated research profile mapped to public.research_profiles."""

	__tablename__ = "research_profiles"

	id: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		primary_key=True,
		server_default=text("gen_random_uuid()"),
	)
	entity_id: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		ForeignKey("entities.id"),
		nullable=False,
		unique=True,
	)
	summary: Mapped[str | None] = mapped_column(Text)
	last_research_update: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
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
	aggregated_profile: Mapped[dict | None] = mapped_column(JSONB)
	status: Mapped[str] = mapped_column(Text, nullable=False, server_default=text("'pending'"))

	entity = relationship("Entity", back_populates="research_profile")

