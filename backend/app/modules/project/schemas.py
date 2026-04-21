"""API schemas for project module routes."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ProjectCreateRequest(BaseModel):
	"""Input payload to create a project for a user."""

	title: str
	description: str | None = None
	entity_id: str | None = None


class ProjectDeleteRequest(BaseModel):
	"""Input payload to delete one project for a user."""
	pass


class ProjectUpdateRequest(BaseModel):
	"""Input payload to update one existing project."""

	title: str
	description: str | None = None


class ProjectResponse(BaseModel):
	"""Project response schema."""

	model_config = ConfigDict(from_attributes=True)

	id: UUID
	user_id: UUID
	title: str
	description: str | None = None
	entity_id: UUID | None = None
	entity_name: str | None = None
	entity_image_url: str | None = None
	entity_wikidata_id: str | None = None
	created_at: datetime
	updated_at: datetime


class ProjectDeleteResponse(BaseModel):
	"""Delete project operation result."""

	status: str = "deleted"
	project_id: UUID
