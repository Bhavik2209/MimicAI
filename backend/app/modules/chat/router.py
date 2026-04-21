"""HTTP routes for the persona chat feature."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import AuthenticatedUser, get_current_user, get_db
from app.modules.chat import service
from app.modules.chat.schemas import (
	ChatMessageResponse,
	ChatSessionResponse,
	CreateSessionRequest,
	RenameSessionRequest,
	SendMessageRequest,
	SendMessageResponse,
)

router = APIRouter(prefix="/chat", tags=["chat"])

DbDep = Annotated[AsyncSession, Depends(get_db)]
CurrentUserDep = Annotated[AuthenticatedUser, Depends(get_current_user)]


# ---------------------------------------------------------------------------
# Sessions  (entity-scoped — keyed by Wikidata ID, same as the research routes)
# ---------------------------------------------------------------------------


@router.post(
	"/{wikidata_id}/sessions",
	response_model=ChatSessionResponse,
	status_code=201,
	summary="Create a new persona chat session",
)
async def create_session(
	wikidata_id: str,
	body: CreateSessionRequest,
	db: DbDep,
	current_user: CurrentUserDep,
) -> ChatSessionResponse:
	"""Create a new chat session for the given entity.

	``wikidata_id`` is the Wikidata entity identifier (e.g. ``Q9695``),
	the same identifier used by the research pipeline.
	The entity must have been researched first so that personality data exists.

	Requires ``project_id`` in the request body. The session
	title will be auto-generated from the first message if not provided.
	"""
	return await service.create_session(
		db=db,
		wikidata_id=wikidata_id,
		current_user=current_user,
		project_id=body.project_id,
		title=body.title,
	)


@router.get(
	"/{wikidata_id}/sessions",
	response_model=list[ChatSessionResponse],
	summary="List persona chat sessions for an entity",
)
async def list_sessions(
	wikidata_id: str,
	db: DbDep,
	current_user: CurrentUserDep,
) -> list[ChatSessionResponse]:
	"""Return all chat sessions for a Wikidata entity, newest first.

	Sessions are scoped to the authenticated user.
	"""
	return await service.list_sessions(
		db=db,
		wikidata_id=wikidata_id,
		current_user=current_user,
	)


@router.delete(
	"/sessions/{session_id}",
	status_code=204,
	summary="Delete a chat session",
)
async def delete_session(
	session_id: UUID,
	db: DbDep,
	current_user: CurrentUserDep,
) -> None:
	"""Delete a chat session and all its messages (cascade)."""
	await service.delete_session(
		db=db,
		session_id=session_id,
		current_user=current_user,
	)


@router.patch(
	"/sessions/{session_id}",
	response_model=ChatSessionResponse,
	summary="Rename a chat session",
)
async def rename_session(
	session_id: UUID,
	body: RenameSessionRequest,
	db: DbDep,
	current_user: CurrentUserDep,
) -> ChatSessionResponse:
	"""Update the title of an existing chat session."""
	return await service.rename_session(
		db=db,
		session_id=session_id,
		title=body.title,
		current_user=current_user,
	)


# ---------------------------------------------------------------------------
# Messages  (session-scoped — session already carries the entity binding)
# ---------------------------------------------------------------------------


@router.get(
	"/sessions/{session_id}/messages",
	response_model=list[ChatMessageResponse],
	summary="Get all messages in a session",
)
async def get_messages(
	session_id: UUID,
	db: DbDep,
	current_user: CurrentUserDep,
) -> list[ChatMessageResponse]:
	"""Return all messages for a session in chronological order."""
	return await service.get_session_messages(
		db=db,
		session_id=session_id,
		current_user=current_user,
	)


@router.post(
	"/sessions/{session_id}/messages",
	response_model=SendMessageResponse,
	summary="Send a message to the persona",
)
async def send_message(
	session_id: UUID,
	body: SendMessageRequest,
	db: DbDep,
	current_user: CurrentUserDep,
) -> SendMessageResponse:
	"""Send a user message to the persona and receive a contextual response.

	The LLM (Groq / Qwen3-32b) is given:

	- The entity's full personality profile (from quote analysis)
	- Factual knowledge (Wikipedia + conversation transcripts)
	- Query-specific retrieved snippets from the vector store
	- The recent chat history for conversational continuity

	Both the user message and the assistant response are persisted to the DB.
	Assistant messages may include structured ``citations`` metadata based on
	the retrieved Qdrant sources used for grounding.
	The entity identity is resolved automatically from the session record.
	"""
	return await service.send_message(
		db=db,
		session_id=session_id,
		user_content=body.content,
		use_web_search=body.use_web_search,
		use_knowledge_base=body.use_knowledge_base,
		current_user=current_user,
	)


@router.post(
	"/sessions/{session_id}/messages/stream",
	summary="Stream a persona response token-by-token (SSE)",
)
async def send_message_stream(
	session_id: UUID,
	body: SendMessageRequest,
	db: DbDep,
	current_user: CurrentUserDep,
) -> StreamingResponse:
	"""Stream the persona response as Server-Sent Events.

	Each SSE event is a JSON object with one of three shapes::

	    {"token": "word"}              — arrives per token during generation
	    {"done": true, "user_message": {...}, "assistant_message": {...}}
	    {"error": "reason"}            — if something goes wrong

	Both messages are persisted to the database **after** the stream ends.
	The ``done`` event contains the real DB IDs and timestamps so the frontend
	can swap out its optimistic messages with the canonical persisted versions.
	"""
	return StreamingResponse(
		service.send_message_stream(
			db=db,
			session_id=session_id,
			user_content=body.content,
			use_web_search=body.use_web_search,
			use_knowledge_base=body.use_knowledge_base,
			current_user=current_user,
		),
		media_type="text/event-stream",
		headers={
			"Cache-Control": "no-cache",
			"Connection": "keep-alive",
			# Prevent nginx / any proxy from buffering SSE chunks
			"X-Accel-Buffering": "no",
		},
	)
