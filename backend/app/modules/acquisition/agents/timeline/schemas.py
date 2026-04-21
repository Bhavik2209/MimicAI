"""Schemas for timeline extraction responses."""

from pydantic import BaseModel, Field


class TimelineEvent(BaseModel):
    """A single timeline event extracted from Wikidata SPARQL queries."""

    category: str
    type: str
    label: str
    start: str
    end: str = ""


class TimelineProfile(BaseModel):
    """Timeline payload for a resolved Wikidata entity."""

    entity_id: str
    name: str
    description: str = ""
    total_events: int = 0
    timeline: list[TimelineEvent] = Field(default_factory=list)
