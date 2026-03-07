from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime


class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class EntityInfo(BaseModel):
    id: UUID
    name: str
    image_url: Optional[str] = None
    wikidata_id: Optional[str] = None

    class Config:
        from_attributes = True


class ProjectOut(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    entity: Optional[EntityInfo] = None
    research_status: Optional[str] = None
    research_progress: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True