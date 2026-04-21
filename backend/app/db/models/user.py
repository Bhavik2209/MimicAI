"""User ORM model."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
	"""Application user mapped to public.users."""

	__tablename__ = "users"

	id: Mapped[uuid.UUID] = mapped_column(
		UUID(as_uuid=True),
		primary_key=True,
		server_default=text("gen_random_uuid()"),
	)
	email: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
	created_at: Mapped[datetime] = mapped_column(
		DateTime(timezone=True),
		server_default=text("now()"),
		nullable=False,
	)

	projects = relationship("Project", back_populates="user")
	chat_sessions = relationship("ChatSession", back_populates="user")

