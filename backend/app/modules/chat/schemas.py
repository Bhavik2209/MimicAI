"""Pydantic schemas for persona chat sessions and messages."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Request bodies
# ---------------------------------------------------------------------------


class CreateSessionRequest(BaseModel):
	"""Payload for creating a new chat session."""

	project_id: UUID
	title: str | None = None


class SendMessageRequest(BaseModel):
	"""Payload for sending a user message to a persona session."""

	content: str = Field(..., min_length=1, max_length=8000)
	use_web_search: bool = False
	use_knowledge_base: bool = True


class RenameSessionRequest(BaseModel):
	"""Payload for renaming a chat session."""

	title: str = Field(..., min_length=1, max_length=120)


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------


class ChatMessageResponse(BaseModel):
	"""Single persisted chat message returned to the client."""

	id: UUID
	session_id: UUID
	role: str
	content: str
	citations: dict | None = None
	created_at: datetime

	model_config = {"from_attributes": True}


class ChatSessionResponse(BaseModel):
	"""Chat session metadata returned to the client."""

	id: UUID
	user_id: UUID
	project_id: UUID
	entity_id: UUID
	title: str | None = None
	created_at: datetime
	updated_at: datetime

	model_config = {"from_attributes": True}


class SendMessageResponse(BaseModel):
	"""Response after sending a message — includes both turns."""

	user_message: ChatMessageResponse
	assistant_message: ChatMessageResponse
