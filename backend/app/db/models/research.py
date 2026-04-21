"""Research source ORM model."""

import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ResearchSource(Base):
	"""Source links used for research mapped to public.research_sources."""

	__tablename__ = "research_sources"

	__table_args__ = (
		UniqueConstraint("entity_id", "source_type", "url", name="research_sources_entity_source_url_key"),
		CheckConstraint(
			"source_type = ANY (ARRAY['youtube'::text])",
			name="research_sources_source_type_check",
		),
	)

	id: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		primary_key=True,
		server_default=text("gen_random_uuid()"),
	)
	entity_id: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		ForeignKey("entities.id"),
		nullable=False,
	)
	source_type: Mapped[str] = mapped_column(Text, nullable=False)
	url: Mapped[str] = mapped_column(Text, nullable=False)
	title: Mapped[str | None] = mapped_column(Text)
	created_at: Mapped[datetime] = mapped_column(
		DateTime(timezone=True),
		server_default=text("now()"),
		nullable=False,
	)

	entity = relationship("Entity", back_populates="research_sources")

