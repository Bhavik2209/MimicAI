from qdrant_client import QdrantClient
from loguru import logger
from app.config import settings

_client: QdrantClient | None = None


def init_qdrant() -> None:
    global _client
    _client = QdrantClient(
        url=settings.qdrant_url,
        api_key=settings.qdrant_api_key,
    )
    logger.info("Qdrant client initialized")


def get_qdrant_client() -> QdrantClient:
    if _client is None:
        raise RuntimeError("Qdrant client not initialized. Call init_qdrant() first.")
    return _client


def close_qdrant() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None
        logger.info("Qdrant client closed")
