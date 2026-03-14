import uuid
from datetime import datetime, timezone
from sqlalchemy import Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class ResearchProfile(Base):
    __tablename__ = "research_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    entity_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("entities.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    personality_profile: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    timeline: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    controversies: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    quotes: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    last_research_update: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
