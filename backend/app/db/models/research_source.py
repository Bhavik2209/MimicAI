import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class ResearchSource(Base):
    __tablename__ = "research_sources"
    __table_args__ = (
        CheckConstraint(
            "source_type IN ('wikipedia', 'wikidata', 'wikiquote', 'youtube')",
            name="research_sources_source_type_check",
        ),
        UniqueConstraint("entity_id", "source_type", "url", name="research_sources_entity_source_url_key"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    entity_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("entities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source_type: Mapped[str] = mapped_column(
        String(16), nullable=False, index=True
    )  # "wikipedia" | "wikidata" | "wikiquote" | "youtube"
    url: Mapped[str] = mapped_column(Text, nullable=False)
    title: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
