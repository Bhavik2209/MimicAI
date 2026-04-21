"""Schemas for wiki agent responses."""

from pydantic import BaseModel, Field


class WikiSection(BaseModel):
    """One plain-text section from Wikipedia article."""

    section: str
    text: str


class WikiProfile(BaseModel):
    """Wikipedia profile payload for a Wikidata entity."""

    entity_id: str
    wikipedia_title: str
    intro_summary: str
    sections: list[WikiSection] = Field(default_factory=list)
