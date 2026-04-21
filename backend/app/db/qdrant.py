"""Qdrant VectorDB client and helper operations."""

from __future__ import annotations

import logging
from uuid import uuid4

from qdrant_client import QdrantClient
from qdrant_client.http import models

from app.config import settings

logger = logging.getLogger(__name__)

_client: QdrantClient | None = None
_known_collections: set[str] = set()
_known_payload_indexes: set[tuple[str, str]] = set()

_DEFAULT_PAYLOAD_INDEXES: tuple[str, ...] = (
    "entity_id",
    "wikidata_id",
    "source_type",
    "content_type",
)


def init_qdrant() -> QdrantClient:
    """Initialize and cache the Qdrant client."""
    global _client

    if _client is not None:
        return _client

    if not settings.qdrant_url:
        raise ValueError("QDRANT_URL is not configured")

    _client = QdrantClient(
        url=settings.qdrant_url,
        api_key=settings.qdrant_api_key or None,
        timeout=30.0,
    )
    logger.info("Qdrant client initialized")
    return _client


def get_qdrant_client() -> QdrantClient:
    """Get the initialized Qdrant client."""
    return init_qdrant()


def close_qdrant() -> None:
    """Close Qdrant client and reset cache."""
    global _client
    if _client is not None:
        _client.close()
        _client = None
        _known_collections.clear()
        _known_payload_indexes.clear()
        logger.info("Qdrant client closed")


def ensure_collection(
    collection_name: str,
    vector_size: int | None = None,
    distance: models.Distance = models.Distance.COSINE,
) -> None:
    """Create collection if it does not already exist."""
    client = get_qdrant_client()
    size = vector_size or settings.qdrant_vector_size

    if collection_name in _known_collections:
        ensure_payload_indexes(collection_name)
        return

    if client.collection_exists(collection_name=collection_name):
        _known_collections.add(collection_name)
        ensure_payload_indexes(collection_name)
        return

    client.create_collection(
        collection_name=collection_name,
        vectors_config=models.VectorParams(size=size, distance=distance),
    )
    _known_collections.add(collection_name)
    ensure_payload_indexes(collection_name)
    logger.info("Created Qdrant collection '%s'", collection_name)


def ensure_payload_indexes(
    collection_name: str,
    fields: tuple[str, ...] = _DEFAULT_PAYLOAD_INDEXES,
) -> None:
    """Ensure payload indexes exist for fields used in filters."""
    client = get_qdrant_client()
    for field_name in fields:
        cache_key = (collection_name, field_name)
        if cache_key in _known_payload_indexes:
            continue
        try:
            client.create_payload_index(
                collection_name=collection_name,
                field_name=field_name,
                field_schema=models.PayloadSchemaType.KEYWORD,
                wait=True,
            )
            _known_payload_indexes.add(cache_key)
        except Exception as exc:
            # Indexes may already exist depending on Qdrant version/deployment.
            message = str(exc).lower()
            if "already" in message and "exist" in message:
                _known_payload_indexes.add(cache_key)
            logger.debug(
                "Skipping payload index creation for '%s' in '%s': %s",
                field_name,
                collection_name,
                exc,
            )


def upsert_vectors(
    collection_name: str,
    vectors: list[list[float]],
    payloads: list[dict],
    ids: list[str] | None = None,
) -> list[str]:
    """Upsert vectors with payloads into a collection and return point ids."""
    if len(vectors) != len(payloads):
        raise ValueError("vectors and payloads must have the same length")

    ensure_collection(collection_name)
    point_ids = ids or [str(uuid4()) for _ in vectors]

    if len(point_ids) != len(vectors):
        raise ValueError("ids and vectors must have the same length")

    points = [
        models.PointStruct(id=point_id, vector=vector, payload=payload)
        for point_id, vector, payload in zip(point_ids, vectors, payloads)
    ]

    get_qdrant_client().upsert(collection_name=collection_name, points=points)
    return point_ids


def query_vectors(
    collection_name: str,
    query_vector: list[float],
    limit: int = 5,
    score_threshold: float | None = None,
    query_filter: models.Filter | None = None,
) -> list[models.ScoredPoint]:
    """Search similar vectors from a collection."""
    ensure_collection(collection_name)
    client = get_qdrant_client()

    # qdrant-client >= 1.17 uses query_points instead of search in some builds.
    if hasattr(client, "query_points"):
        response = client.query_points(
            collection_name=collection_name,
            query=query_vector,
            limit=limit,
            score_threshold=score_threshold,
            query_filter=query_filter,
        )
        return list(getattr(response, "points", []) or [])

    return client.search(
        collection_name=collection_name,
        query_vector=query_vector,
        limit=limit,
        score_threshold=score_threshold,
        query_filter=query_filter,
    )


def delete_points(collection_name: str, point_ids: list[str]) -> None:
    """Delete vector points by ids from a collection."""
    if not point_ids:
        return
    get_qdrant_client().delete(
        collection_name=collection_name,
        points_selector=models.PointIdsList(points=point_ids),
    )
