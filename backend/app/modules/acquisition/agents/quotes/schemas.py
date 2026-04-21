"""Schemas for quote extraction responses."""

from typing import Literal

from pydantic import BaseModel, Field


class QuoteItem(BaseModel):
    """One quote extracted from API Ninjas or Wikiquote."""

    quote: str
    section: Literal["own", "about"]
    attribution: str | None = None
    date: str | None = None


class CharacterTrait(BaseModel):
    trait: str
    evidence: str  # exact quote fragment


class PersonalityProfile(BaseModel):
    core_character_traits: list[CharacterTrait] = Field(default_factory=list)
    cognitive_style: str
    emotional_register: str
    self_concept: str


class RhetoricalDNA(BaseModel):
    signature_moves: list[str] = Field(default_factory=list)
    sentence_energy: str
    favourite_abstractions: list[str] = Field(default_factory=list)


class Worldview(BaseModel):
    core_beliefs: list[str] = Field(default_factory=list)
    recurring_themes: list[str] = Field(default_factory=list)
    internal_tensions: str | None = None


class QuoteCluster(BaseModel):
    label: str
    summary: str
    personality_insight: str
    representative_quotes: list[str] = Field(default_factory=list)


class QuotesAnalysis(BaseModel):
    executive_summary: str
    personality_profile: PersonalityProfile
    rhetorical_dna: RhetoricalDNA
    worldview: Worldview
    quote_clusters: list[QuoteCluster] = Field(default_factory=list)
    influence_and_legacy: str
    analyst_caveats: list[str] = Field(default_factory=list)


class QuotesProfile(BaseModel):
    """Quotes collected for a Wikidata entity."""

    entity_id: str
    name: str | None = None
    analysis: QuotesAnalysis
