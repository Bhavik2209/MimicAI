"""Schemas for speech/interview conversation extraction."""

from pydantic import BaseModel, Field


class ConversationVideo(BaseModel):
    """A YouTube video transcript item for conversations."""

    title: str | None = None
    video_id: str
    url: str
    transcript: str


class ConversationProfile(BaseModel):
    """Speech and interview transcripts for an entity."""

    entity_id: str
    name: str | None = None
    videos: list[ConversationVideo] = Field(default_factory=list)
