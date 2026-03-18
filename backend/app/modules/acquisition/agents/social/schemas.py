"""Schemas for social media links extracted from Wikidata."""

from pydantic import BaseModel, Field


class SocialHandleLink(BaseModel):
    """A social profile represented by a handle and full URL."""

    handle: str
    url: str


class YouTubeChannelLink(BaseModel):
    """A YouTube channel represented by channel id and URL."""

    channel_id: str
    url: str


class SocialMediaProfile(BaseModel):
    """Social links grouped by platform for an entity."""

    twitter: list[SocialHandleLink] = Field(default_factory=list)
    instagram: list[SocialHandleLink] = Field(default_factory=list)
    facebook: list[SocialHandleLink] = Field(default_factory=list)
    youtube: list[YouTubeChannelLink] = Field(default_factory=list)
    linkedin: list[SocialHandleLink] = Field(default_factory=list)
    website: list[str] = Field(default_factory=list)
