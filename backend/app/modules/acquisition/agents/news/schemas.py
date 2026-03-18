"""Schemas for news article responses."""

from pydantic import BaseModel


class NewsArticle(BaseModel):
    """A single news article about an entity."""

    title: str
    source: str | None = None
    published_at: str | None = None
    url: str | None = None
