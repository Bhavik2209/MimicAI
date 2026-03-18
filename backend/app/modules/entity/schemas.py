"""API schemas for entity module routes."""

from pydantic import BaseModel, Field


class EntitySearchRequest(BaseModel):
	"""Input payload for entity search."""

	name: str


class EntityCandidate(BaseModel):
	"""Candidate returned from Wikidata search."""

	wikidata_id: str
	name: str
	description: str | None = None
	image_url: str | None = None


class LabelItem(BaseModel):
	"""Wikidata QID to label mapping for resolved attributes."""

	id: str
	label: str | None = None


class EntityConfirmRequest(BaseModel):
	"""Input payload to confirm a selected candidate."""

	wikidata_id: str


class EntityConfirmResponse(BaseModel):
	"""Resolved entity payload used by confirm endpoint."""

	wikidata_id: str
	resolved_name: str | None = None
	description: str | None = None
	instance_of: list[LabelItem] = Field(default_factory=list)
	occupation: list[LabelItem] = Field(default_factory=list)
	birth_date: str | None = None
	death_date: str | None = None
	is_living: bool = True
	nationality: list[LabelItem] = Field(default_factory=list)
	image_url: str | None = None
	openalex_candidate: bool = False
	orcid_ids: list[str] = Field(default_factory=list)
	status: str = "confirmed"