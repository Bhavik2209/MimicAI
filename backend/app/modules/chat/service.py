"""Orchestration service for persona chat.

Entity resolution flow
----------------------
1. Frontend knows the **Wikidata ID** (e.g. "Q9695") — same as research routes.
2. ``create_session`` resolves wikidata_id → internal ``entities.id`` UUID and
   stores it in ``chat_sessions.entity_id``.
3. Every subsequent message call fetches the session, reads ``session.entity_id``
   (internal UUID), and passes it to the context loader + DB queries.

This means no entity identifier is ever passed in the message-send call — the
session record is the source of truth for which entity is being simulated.
"""

from __future__ import annotations

import logging
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import AuthenticatedUser
from app.db.models.entity import Entity
from app.modules.chat import graph, memory_manager
from app.modules.chat.schemas import (
	ChatMessageResponse,
	ChatSessionResponse,
	SendMessageResponse,
)
from app.modules.user.service import sync_authenticated_user

logger = logging.getLogger(__name__)

def _to_message_response(msg) -> ChatMessageResponse:
	return ChatMessageResponse(
		id=msg.id,
		session_id=msg.session_id,
		role=msg.role,
		content=msg.content,
		citations=msg.citations,
		created_at=msg.created_at,
	)


def _to_session_response(session) -> ChatSessionResponse:
	return ChatSessionResponse(
		id=session.id,
		user_id=session.user_id,
		project_id=session.project_id,
		entity_id=session.entity_id,
		title=session.title,
		created_at=session.created_at,
		updated_at=session.updated_at,
	)


async def _safe_rollback(db: AsyncSession) -> None:
	"""Rollback the current transaction after a recoverable DB failure."""
	try:
		await db.rollback()
	except Exception:
		logger.exception("Failed to rollback chat DB session")


async def _resolve_entity(db: AsyncSession, wikidata_id: str) -> Entity:
	"""Resolve a Wikidata ID to the internal Entity row.

	Raises 404 if the entity has not been researched yet (i.e. doesn't exist
	in the entities table), with a helpful error message.
	"""
	try:
		result = await db.execute(
			select(Entity).where(Entity.wikidata_id == wikidata_id)
		)
		entity = result.scalar_one_or_none()
	except SQLAlchemyError as exc:
		await _safe_rollback(db)
		raise HTTPException(
			status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
			detail="Entity lookup is temporarily unavailable. Please try again.",
		) from exc
	if entity is None:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail=(
				f"Entity '{wikidata_id}' not found. "
				"Run the research pipeline first to generate the personality profile."
			),
		)
	return entity


async def _get_session_or_raise(db: AsyncSession, session_id: UUID):
	"""Fetch one chat session with graceful DB error handling."""
	try:
		session = await memory_manager.get_session(db=db, session_id=session_id)
	except SQLAlchemyError as exc:
		await _safe_rollback(db)
		raise HTTPException(
			status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
			detail="Chat session lookup is temporarily unavailable. Please try again.",
		) from exc
	if session is None:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail=f"Session {session_id} not found.",
		)
	return session


async def _get_owned_session_or_raise(
	db: AsyncSession,
	session_id: UUID,
	current_user: AuthenticatedUser,
):
	"""Fetch one chat session and ensure it belongs to the current user."""
	session = await _get_session_or_raise(db=db, session_id=session_id)
	if session.user_id != current_user.user_id:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail=f"Session {session_id} not found.",
		)
	return session


# ---------------------------------------------------------------------------
# Session management
# ---------------------------------------------------------------------------


async def create_session(
	db: AsyncSession,
	wikidata_id: str,
	current_user: AuthenticatedUser,
	project_id: UUID,
	title: str | None,
) -> ChatSessionResponse:
	"""Resolve entity by Wikidata ID, then create a new chat session.

	The internal entity UUID is stored on the session so all future message
	calls can identify which entity's personality to simulate without needing
	the caller to pass any entity identifier again.
	"""
	entity = await _resolve_entity(db, wikidata_id)
	await sync_authenticated_user(
		db=db,
		user_id=current_user.user_id,
		email=current_user.email,
	)
	session = await memory_manager.create_session(
		db=db,
		user_id=current_user.user_id,
		project_id=project_id,
		entity_id=entity.id,
		title=title,
	)
	return _to_session_response(session)


async def list_sessions(
	db: AsyncSession,
	wikidata_id: str,
	current_user: AuthenticatedUser,
) -> list[ChatSessionResponse]:
	"""List sessions for an entity, resolving wikidata_id → internal UUID first."""
	entity = await _resolve_entity(db, wikidata_id)
	await sync_authenticated_user(
		db=db,
		user_id=current_user.user_id,
		email=current_user.email,
	)
	sessions = await memory_manager.list_sessions(
		db=db,
		entity_id=entity.id,
		user_id=current_user.user_id,
	)
	return [_to_session_response(s) for s in sessions]


async def get_session_messages(
	db: AsyncSession,
	session_id: UUID,
	current_user: AuthenticatedUser,
) -> list[ChatMessageResponse]:
	"""Return all messages for a session in display (chronological) order."""
	await _get_owned_session_or_raise(
		db=db,
		session_id=session_id,
		current_user=current_user,
	)
	msgs = await memory_manager.get_all_messages(db=db, session_id=session_id)
	return [_to_message_response(m) for m in msgs]


async def delete_session(
	db: AsyncSession,
	session_id: UUID,
	current_user: AuthenticatedUser,
) -> None:
	"""Delete a session and all its messages."""
	await _get_owned_session_or_raise(
		db=db,
		session_id=session_id,
		current_user=current_user,
	)
	deleted = await memory_manager.delete_session(db=db, session_id=session_id)
	if not deleted:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail=f"Session {session_id} not found.",
		)


async def rename_session(
	db: AsyncSession,
	session_id: UUID,
	title: str,
	current_user: AuthenticatedUser,
) -> ChatSessionResponse:
	"""Update the title of a chat session. Returns the updated session."""
	await _get_owned_session_or_raise(
		db=db,
		session_id=session_id,
		current_user=current_user,
	)
	await memory_manager.update_session_title(db=db, session_id=session_id, title=title.strip())
	# Re-fetch to get fresh updated_at
	session = await _get_owned_session_or_raise(
		db=db,
		session_id=session_id,
		current_user=current_user,
	)
	return _to_session_response(session)


# ---------------------------------------------------------------------------
# Messaging — core chat pipeline
# ---------------------------------------------------------------------------


async def send_message(
	db: AsyncSession,
	session_id: UUID,
	user_content: str,
	use_web_search: bool,
	use_knowledge_base: bool,
	current_user: AuthenticatedUser,
) -> SendMessageResponse:
	"""Send a user message and get a persona response.

	Runs the LangGraph chat pipeline to:
	  1. Load session context
	  2. Load cached persona prompt
	  3. Retrieve query-specific vector context
	  4. Build chat messages
	  5. Generate the reply
	  6. Persist both turns
	"""
	try:
		await _get_owned_session_or_raise(
			db=db,
			session_id=session_id,
			current_user=current_user,
		)
		state = await graph.run_chat_turn(
			db=db,
			session_id=session_id,
			user_content=user_content,
			use_web_search=use_web_search,
			use_knowledge_base=use_knowledge_base,
		)
	except HTTPException:
		raise
	except SQLAlchemyError as exc:
		await _safe_rollback(db)
		logger.exception("Chat graph DB failure for session %s", session_id)
		raise HTTPException(
			status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
			detail="Chat processing is temporarily unavailable. Please try again.",
		) from exc
	except Exception as exc:
		logger.exception("Chat graph execution failed for session %s", session_id)
		raise HTTPException(
			status_code=status.HTTP_502_BAD_GATEWAY,
			detail="Persona inference failed — please try again.",
		) from exc

	return SendMessageResponse(
		user_message=_to_message_response(state["user_message_row"]),
		assistant_message=_to_message_response(state["assistant_message_row"]),
	)


# ---------------------------------------------------------------------------
# Streaming pipeline (SSE)
# ---------------------------------------------------------------------------


def _msg_to_dict(msg) -> dict:
	"""Serialise a ChatMessage ORM row to a plain dict for JSON SSE events."""
	return {
		"id": str(msg.id),
		"session_id": str(msg.session_id),
		"role": msg.role,
		"content": msg.content,
		"citations": msg.citations,
		"created_at": msg.created_at.isoformat(),
	}


async def send_message_stream(
	db: AsyncSession,
	session_id: UUID,
	user_content: str,
	use_web_search: bool,
	use_knowledge_base: bool,
	current_user: AuthenticatedUser,
):
	"""Async generator for SSE streaming of a persona chat response.

	Yields SSE-formatted strings:
	  ``data: {"token": "..."}``      — one per token as it arrives
	  ``data: {"done": true, ...}``   — final event with persisted message data
	  ``data: {"error": "..."}``      — on failure at any stage

	The frontend consumes these via the Fetch ReadableStream API.
	Messages are persisted to the DB *after* the full stream completes.
	"""
	import json
	from app.utils.llm_client import chat_groq_stream as _stream

	try:
		await _get_owned_session_or_raise(
			db=db,
			session_id=session_id,
			current_user=current_user,
		)
		state = await graph.prepare_chat_turn(
			db=db,
			session_id=session_id,
			user_content=user_content,
			use_web_search=use_web_search,
			use_knowledge_base=use_knowledge_base,
		)
	except HTTPException as exc:
		yield f"data: {json.dumps({'error': exc.detail})}\n\n"
		return
	except SQLAlchemyError:
		await _safe_rollback(db)
		yield f"data: {json.dumps({'error': 'Chat processing is temporarily unavailable. Please try again.'})}\n\n"
		return
	except Exception as exc:
		logger.exception("Chat prepare graph failed for session %s", session_id)
		yield f"data: {json.dumps({'error': 'Failed to prepare persona context'})}\n\n"
		return

	session = state["session"]
	llm_messages = state["llm_messages"]

	# Stream tokens from Groq ---------------------------------------------
	full_text = ""
	try:
		async for token in _stream(
			messages=llm_messages,
			temperature=graph.TEMPERATURE,
			max_output_tokens=graph.MAX_TOKENS,
		):
			full_text += token
			yield f"data: {json.dumps({'token': token})}\n\n"
	except Exception as exc:
		logger.error("Groq stream failed for session %s: %s", session_id, exc)
		yield f"data: {json.dumps({'error': 'Inference failed — please try again'})}\n\n"
		return

	if not full_text.strip():
		yield f"data: {json.dumps({'error': 'Model returned an empty response'})}\n\n"
		return

	try:
		persisted = await graph.persist_chat_turn(
			db=db,
			session=session,
			user_content=user_content,
			assistant_content=full_text.strip(),
			assistant_citations=state.get("assistant_citations"),
		)
	except SQLAlchemyError:
		await _safe_rollback(db)
		yield f"data: {json.dumps({'error': 'Failed to save chat messages'})}\n\n"
		return
	except Exception:
		logger.exception("Chat stream persistence failed for session %s", session_id)
		yield f"data: {json.dumps({'error': 'Failed to save chat messages'})}\n\n"
		return

	# 8. Final done event — includes real DB IDs so frontend can update ---
	yield f"data: {json.dumps({'done': True, 'user_message': _msg_to_dict(persisted['user_message_row']), 'assistant_message': _msg_to_dict(persisted['assistant_message_row'])})}\n\n"
