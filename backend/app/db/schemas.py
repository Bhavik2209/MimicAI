"""Pydantic schemas aligned with NeonDB ORM models."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ORMBaseSchema(BaseModel):
    """Base schema configured for ORM object parsing."""

    model_config = {"from_attributes": True}


class UserRead(ORMBaseSchema):
    id: UUID
    email: str
    created_at: datetime


class EntityCreate(BaseModel):
    wikidata_id: str
    name: str
    description: str | None = None
    image_url: str | None = None


class EntityRead(ORMBaseSchema):
    id: UUID
    wikidata_id: str
    name: str
    description: str | None = None
    image_url: str | None = None
    created_at: datetime
    updated_at: datetime


class ProjectCreate(BaseModel):
    user_id: UUID
    title: str
    description: str | None = None
    entity_id: UUID | None = None


class ProjectRead(ORMBaseSchema):
    id: UUID
    user_id: UUID
    title: str
    description: str | None = None
    entity_id: UUID | None = None
    created_at: datetime
    updated_at: datetime


class ResearchProfileRead(ORMBaseSchema):
    id: UUID
    entity_id: UUID
    summary: str | None = None
    last_research_update: datetime | None = None
    aggregated_profile: dict | None = None
    status: str
    created_at: datetime
    updated_at: datetime


class ResearchSourceCreate(BaseModel):
    entity_id: UUID
    source_type: str
    url: str
    title: str | None = None


class ResearchSourceRead(ORMBaseSchema):
    id: UUID
    entity_id: UUID
    source_type: str
    url: str
    title: str | None = None
    created_at: datetime


class ChatSessionRead(ORMBaseSchema):
    id: UUID
    user_id: UUID
    project_id: UUID
    entity_id: UUID
    title: str | None = None
    created_at: datetime
    updated_at: datetime


class ChatMessageCreate(BaseModel):
    session_id: UUID
    role: str
    content: str
    citations: dict | None = None


class ChatMessageRead(ORMBaseSchema):
    id: UUID
    session_id: UUID
    role: str
    content: str
    citations: dict | None = None
    created_at: datetime
