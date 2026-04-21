"""Schemas for research orchestration endpoint."""

from pydantic import BaseModel, Field

from app.modules.analysis.agents.personality.schemas import PersonalityAnalysis
from app.modules.entity.schemas import EntityCandidate


class ResearchVectorStoreInfo(BaseModel):
	"""Vector store write summary for this research run."""

	collection: str
	stored_points: int = 0
	source_counts: dict[str, int] = Field(default_factory=dict)


class ResearchAcquisitionBundle(BaseModel):
	"""All raw acquisition responses collected for the entity."""

	wiki: dict = Field(default_factory=dict)
	openalex: dict | None = None
	socials: dict = Field(default_factory=dict)
	quotes: dict = Field(default_factory=dict)
	conversation: dict = Field(default_factory=dict)
	timeline: dict = Field(default_factory=dict)
	news: list[dict] = Field(default_factory=list)
	resources: list[dict] = Field(default_factory=list)


class ResearchAnalysisBundle(BaseModel):
	"""All analysis responses generated after vector ingestion."""

	personality: PersonalityAnalysis | None = None


class ResearchResponse(BaseModel):
	"""Final merged response for /research/{entity_id}."""

	basic_info: EntityCandidate
	acquisition: ResearchAcquisitionBundle
	vector_store: ResearchVectorStoreInfo
	analysis: ResearchAnalysisBundle
	status: str = "completed"

