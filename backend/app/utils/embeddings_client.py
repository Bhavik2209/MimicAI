import asyncio
from typing import List
from google import genai
from google.genai import types
from app.config import settings

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def _embed_sync(texts: List[str], task_type: str) -> List[List[float]]:
    result = _get_client().models.embed_content(
        model=settings.embedding_model,
        contents=texts,
        config=types.EmbedContentConfig(task_type=task_type),
    )
    return [e.values for e in result.embeddings]


async def embed_texts(
    texts: List[str],
    task_type: str = "RETRIEVAL_DOCUMENT",
) -> List[List[float]]:
    """Embed a batch of texts. Returns a list of embedding vectors."""
    return await asyncio.to_thread(_embed_sync, texts, task_type)


async def embed_text(
    text: str,
    task_type: str = "RETRIEVAL_DOCUMENT",
) -> List[float]:
    """Embed a single text. Returns one embedding vector."""
    vectors = await embed_texts([text], task_type)
    return vectors[0]
