"""Schemas for personality analysis output."""

from pydantic import BaseModel, Field


class PersonalityTrait(BaseModel):
    """A personality trait inferred from retrieved evidence."""

    trait: str
    confidence: float
    evidence: list[str] = Field(default_factory=list)


class PersonalityAnalysis(BaseModel):
    """Structured personality profile for a target entity."""

    entity_id: str | None = None
    name: str | None = None
    questions: list[str] = Field(default_factory=list)
    summary: str | None = None
    traits: list[PersonalityTrait] = Field(default_factory=list)
    communication_style: str | None = None
    decision_style: str | None = None
    risk_flags: list[str] = Field(default_factory=list)
