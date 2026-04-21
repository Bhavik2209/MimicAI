"""Hybrid chat memory provider (Mem0 primary, local fallback).

This module keeps memory retrieval and write behavior isolated from the
LangGraph orchestration code so we can evolve providers without changing
router/service APIs.
"""

from __future__ import annotations

import asyncio
import importlib
import logging
from uuid import UUID

from qdrant_client.http import models
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.qdrant import query_vectors, upsert_vectors
from app.db.models.memory import ChatMessage, ChatSession
from app.utils.embeddings_client import embed_text

logger = logging.getLogger(__name__)

_MEM0_IMPORT_FAILED = False
_MEM0_CLIENT = None
_MIN_MEANINGFUL_CHARS = 12
_MAX_MEMORY_SNIPPET_CHARS = 220
_FALLBACK_SCAN_LIMIT = 24
_QDRANT_SCORE_THRESHOLD = 0.2
_QDRANT_PAYLOAD_INDEXES: tuple[str, ...] = (
    "user_id",
    "entity_id",
    "memory_type",
    "source_type",
)


def _provider_mode() -> str:
    mode = (settings.memory_provider_mode or "mem0_hybrid").strip().lower()
    if mode in {"local_only", "mem0_only", "mem0_hybrid"}:
        return mode
    return "mem0_hybrid"


def _cap(text: str, max_chars: int = _MAX_MEMORY_SNIPPET_CHARS) -> str:
    cleaned = " ".join((text or "").split())
    if len(cleaned) <= max_chars:
        return cleaned
    return cleaned[:max_chars].rsplit(" ", 1)[0] + "..."


def _is_meaningful_user_turn(content: str) -> bool:
    stripped = (content or "").strip()
    return len(stripped) >= _MIN_MEANINGFUL_CHARS


def _overlap_score(query: str, text: str) -> int:
    query_terms = {part.lower() for part in query.split() if len(part) >= 4}
    if not query_terms:
        return 0
    text_terms = {part.lower() for part in text.split() if len(part) >= 4}
    return len(query_terms.intersection(text_terms))


def _get_mem0_client():
    global _MEM0_IMPORT_FAILED
    global _MEM0_CLIENT

    if not settings.mem0_enabled or not settings.mem0_api_key:
        return None

    if _MEM0_CLIENT is not None:
        return _MEM0_CLIENT

    try:
        mem0_module = importlib.import_module("mem0")
        memory_client_cls = getattr(mem0_module, "MemoryClient")
    except Exception:
        if not _MEM0_IMPORT_FAILED:
            logger.warning("mem0 SDK not available. Install 'mem0ai' or disable MEM0_ENABLED.")
            _MEM0_IMPORT_FAILED = True
        return None

    try:
        _MEM0_CLIENT = memory_client_cls(api_key=settings.mem0_api_key)
        return _MEM0_CLIENT
    except Exception as exc:
        logger.warning("Failed to initialize mem0 client: %s", exc)
        return None


def _call_mem0_add(client, messages: list[dict[str, str]], user_id: str, entity_id: str) -> None:
    # SDK signatures can differ slightly by version, so try the richest call first.
    try:
        client.add(
            messages,
            user_id=user_id,
            agent_id=entity_id,
            metadata={"entity_id": entity_id, "source": "persona_chat"},
        )
        return
    except TypeError:
        pass

    try:
        client.add(
            messages,
            user_id=user_id,
            metadata={"entity_id": entity_id, "source": "persona_chat"},
        )
        return
    except TypeError:
        pass

    client.add(messages, user_id=user_id)


def _call_mem0_search(client, query: str, user_id: str, entity_id: str, limit: int) -> object:
    try:
        return client.search(
            query,
            filters={"user_id": user_id, "agent_id": entity_id},
            limit=limit,
        )
    except TypeError:
        pass

    try:
        return client.search(
            query,
            filters={"user_id": user_id, "entity_id": entity_id},
            limit=limit,
        )
    except TypeError:
        pass

    return client.search(query, filters={"user_id": user_id}, limit=limit)


async def retrieve_memory_context(
    db: AsyncSession,
    user_id: UUID,
    entity_id: UUID,
    query: str,
    current_session_id: UUID,
    query_vector: list[float] | None = None,
) -> tuple[list[str], str]:
    """Retrieve memory snippets (Mem0 first, local fallback on failure/empty)."""
    mode = _provider_mode()
    use_mem0 = mode in {"mem0_only", "mem0_hybrid"}
    use_local_fallback = mode in {"local_only", "mem0_hybrid"}

    if use_mem0:
        snippets = await _retrieve_mem0_snippets(query=query, user_id=user_id, entity_id=entity_id)
        if snippets:
            return snippets, "mem0"

    qdrant_snippets = await _retrieve_qdrant_memory_snippets(
        query=query,
        user_id=user_id,
        entity_id=entity_id,
        query_vector=query_vector,
    )
    if qdrant_snippets:
        return qdrant_snippets, "qdrant_fallback"

    if not use_local_fallback:
        return [], "none"

    fallback = await _retrieve_local_fallback_snippets(
        db=db,
        user_id=user_id,
        entity_id=entity_id,
        query=query,
        current_session_id=current_session_id,
    )
    if fallback:
        return fallback, "local_fallback"

    return [], "none"


async def store_turn_memory(
    user_id: UUID,
    entity_id: UUID,
    user_content: str,
    assistant_content: str,
) -> str:
    """Write meaningful turns to Mem0 and Qdrant chat-memory collection."""
    if not _is_meaningful_user_turn(user_content):
        return "skipped_short_turn"

    qdrant_ok = await _store_qdrant_memory(
        user_id=user_id,
        entity_id=entity_id,
        user_content=user_content,
    )

    if _provider_mode() == "local_only":
        return "qdrant" if qdrant_ok else "disabled"

    client = _get_mem0_client()
    if client is None:
        return "qdrant" if qdrant_ok else "disabled"

    messages = [
        {"role": "user", "content": user_content.strip()},
        {"role": "assistant", "content": _cap(assistant_content, 400)},
    ]

    try:
        await asyncio.wait_for(
            asyncio.to_thread(
                _call_mem0_add,
                client,
                messages,
                str(user_id),
                str(entity_id),
            ),
            timeout=max(0.2, settings.mem0_timeout_ms / 1000.0),
        )
        return "mem0+qdrant" if qdrant_ok else "mem0"
    except TimeoutError:
        logger.info(
            "mem0 add timed out for user=%s entity=%s; continuing with qdrant memory",
            user_id,
            entity_id,
        )
        return "qdrant_only" if qdrant_ok else "timeout"
    except Exception as exc:
        logger.warning("mem0 add failed for user=%s entity=%s: %s", user_id, entity_id, exc)
        return "qdrant_only" if qdrant_ok else "error"


def _qdrant_memory_filter(user_id: UUID, entity_id: UUID) -> models.Filter:
    return models.Filter(
        must=[
            models.FieldCondition(
                key="user_id",
                match=models.MatchValue(value=str(user_id)),
            ),
            models.FieldCondition(
                key="entity_id",
                match=models.MatchValue(value=str(entity_id)),
            ),
        ]
    )


async def _store_qdrant_memory(
    user_id: UUID,
    entity_id: UUID,
    user_content: str,
) -> bool:
    if not settings.qdrant_chat_memory_enabled:
        return False

    text = (user_content or "").strip()
    if not text:
        return False

    try:
        vector = await embed_text(text, task_type="RETRIEVAL_DOCUMENT")
        collection = settings.qdrant_chat_memory_collection
        upsert_vectors(
            collection_name=collection,
            vectors=[vector],
            payloads=[
                {
                    "user_id": str(user_id),
                    "entity_id": str(entity_id),
                    "content": _cap(text, 800),
                    "memory_type": "user_turn",
                    "source_type": "chat_memory",
                }
            ],
        )
        return True
    except Exception as exc:
        logger.warning("Qdrant chat-memory upsert failed for user=%s entity=%s: %s", user_id, entity_id, exc)
        return False


async def _retrieve_qdrant_memory_snippets(
    query: str,
    user_id: UUID,
    entity_id: UUID,
    query_vector: list[float] | None = None,
) -> list[str]:
    if not settings.qdrant_chat_memory_enabled:
        return []

    cleaned_query = (query or "").strip()
    if not cleaned_query:
        return []

    try:
        vector = query_vector or await embed_text(cleaned_query, task_type="RETRIEVAL_QUERY")
        collection = settings.qdrant_chat_memory_collection
        points = query_vectors(
            collection_name=collection,
            query_vector=vector,
            limit=settings.mem0_max_results,
            score_threshold=_QDRANT_SCORE_THRESHOLD,
            query_filter=_qdrant_memory_filter(user_id=user_id, entity_id=entity_id),
        )
    except Exception as exc:
        logger.warning("Qdrant chat-memory search failed for user=%s entity=%s: %s", user_id, entity_id, exc)
        return []

    snippets: list[str] = []
    for point in points:
        payload = point.payload or {}
        content = payload.get("content")
        if isinstance(content, str) and content.strip():
            snippets.append(_cap(content))

    return snippets[: settings.mem0_max_results]


async def _retrieve_mem0_snippets(
    query: str,
    user_id: UUID,
    entity_id: UUID,
) -> list[str]:
    cleaned_query = (query or "").strip()
    if not cleaned_query:
        return []

    client = _get_mem0_client()
    if client is None:
        return []

    try:
        raw = await asyncio.wait_for(
            asyncio.to_thread(
                _call_mem0_search,
                client,
                cleaned_query,
                str(user_id),
                str(entity_id),
                settings.mem0_max_results,
            ),
            timeout=max(0.2, settings.mem0_timeout_ms / 1000.0),
        )
    except TimeoutError:
        logger.info(
            "mem0 search timed out for user=%s entity=%s; falling back to qdrant/local",
            user_id,
            entity_id,
        )
        return []
    except Exception as exc:
        logger.warning("mem0 search failed for user=%s entity=%s: %s", user_id, entity_id, exc)
        return []

    results = raw.get("results", []) if isinstance(raw, dict) else []
    snippets: list[str] = []
    for item in results:
        if not isinstance(item, dict):
            continue
        memory_text = item.get("memory")
        if isinstance(memory_text, str) and memory_text.strip():
            snippets.append(_cap(memory_text))

    return snippets[: settings.mem0_max_results]


async def _retrieve_local_fallback_snippets(
    db: AsyncSession,
    user_id: UUID,
    entity_id: UUID,
    query: str,
    current_session_id: UUID,
) -> list[str]:
    stmt = (
        select(ChatMessage)
        .join(ChatSession, ChatSession.id == ChatMessage.session_id)
        .where(
            ChatSession.user_id == user_id,
            ChatSession.entity_id == entity_id,
            ChatMessage.role == "user",
            ChatMessage.session_id != current_session_id,
        )
        .order_by(ChatMessage.created_at.desc())
        .limit(_FALLBACK_SCAN_LIMIT)
    )

    result = await db.execute(stmt)
    rows = list(result.scalars().all())
    if not rows:
        return []

    scored: list[tuple[int, str]] = []
    for row in rows:
        content = (row.content or "").strip()
        if not content:
            continue
        scored.append((_overlap_score(query, content), content))

    scored.sort(key=lambda item: item[0], reverse=True)

    snippets: list[str] = []
    for _, text in scored:
        snippets.append(f"User previously said: {_cap(text)}")
        if len(snippets) >= settings.mem0_max_results:
            break

    return snippets
