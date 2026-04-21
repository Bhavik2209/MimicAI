"""Async embedding helpers backed by Hugging Face Inference Providers."""

import asyncio
import re
import time
from collections import OrderedDict
from typing import Literal

from huggingface_hub import InferenceClient

from app.config import settings

EmbeddingTaskType = Literal[
	"RETRIEVAL_DOCUMENT",
	"RETRIEVAL_QUERY",
	"SEMANTIC_SIMILARITY",
	"CLASSIFICATION",
	"CLUSTERING",
]

_EMBED_BATCH_LIMIT = 100
_EMBED_MAX_RETRIES = 2
_DEFAULT_RETRY_SECONDS = 10.0
_EMBED_CACHE_TTL_SECONDS = 120.0
_EMBED_CACHE_MAX_ENTRIES = 512
_hf_client: InferenceClient | None = None
_embed_cache: OrderedDict[tuple[str, str], tuple[float, list[float]]] = OrderedDict()


def _get_hf_client() -> InferenceClient:
	"""Create and cache Hugging Face Inference client."""
	global _hf_client
	if _hf_client is None:
		if not settings.huggingface_api_key:
			raise ValueError("HUGGINGFACE_API_KEY is not configured")
		_hf_client = InferenceClient(
			api_key=settings.huggingface_api_key,
			provider=settings.huggingface_provider,
		)
	return _hf_client


def _parse_retry_seconds(message: str) -> float:
	"""Extract retry delay from API error payload text."""
	if retry_in := re.search(r"Please retry in (\d+(?:\.\d+)?)s", message):
		return float(retry_in.group(1))
	if retry_delay := re.search(r"'retryDelay': '(\d+)s'", message):
		return float(retry_delay.group(1))
	if estimated := re.search(r"estimated_time['\"]?\s*[:=]\s*(\d+(?:\.\d+)?)", message):
		return float(estimated.group(1))
	return _DEFAULT_RETRY_SECONDS


def _is_retryable_quota_error(message: str) -> bool:
	"""Check whether error indicates temporary quota/rate exhaustion."""
	return (
		"429" in message
		or "Too Many Requests" in message
		or "estimated_time" in message
		or "503" in message
		or "rate limit" in message.lower()
	)


def _is_vector(values: object) -> bool:
	return isinstance(values, list) and bool(values) and all(isinstance(v, (int, float)) for v in values)


def _to_python_list(value: object) -> object:
	"""Convert array-like objects (for example numpy arrays) to plain Python lists."""
	if hasattr(value, "tolist"):
		try:
			return value.tolist()  # type: ignore[no-any-return]
		except Exception:
			return value
	return value


def _mean_pool(token_vectors: list[list[float]]) -> list[float]:
	"""Mean-pool token embeddings into a single sentence vector."""
	if not token_vectors:
		return []
	dim = len(token_vectors[0])
	if dim == 0:
		return []
	acc = [0.0] * dim
	for row in token_vectors:
		if len(row) != dim:
			continue
		for i, value in enumerate(row):
			acc[i] += float(value)
	count = max(1, len(token_vectors))
	return [value / count for value in acc]


def _normalize_embeddings(raw: object, expected_count: int) -> list[list[float]]:
	"""Normalize Hugging Face response into list[list[float]]."""
	raw = _to_python_list(raw)
	if expected_count <= 0:
		return []

	if _is_vector(raw):
		return [list(raw)]

	if not isinstance(raw, list) or not raw:
		return []

	first = raw[0]
	if _is_vector(first):
		# Either batch embeddings (N x D) or token embeddings for one input (T x D).
		if len(raw) == expected_count:
			return [list(item) for item in raw if _is_vector(item)]
		if expected_count == 1:
			return [_mean_pool([item for item in raw if _is_vector(item)])]
		return [list(item) for item in raw[:expected_count] if _is_vector(item)]

	if isinstance(first, list):
		# 3D output: N x T x D -> mean-pool tokens per input.
		vectors: list[list[float]] = []
		for item in raw[:expected_count]:
			if isinstance(item, list):
				tokens = [row for row in item if _is_vector(row)]
				vectors.append(_mean_pool(tokens))
		return vectors

	return []


def _request_single_embedding(text: str) -> list[float]:
	"""Request one embedding vector for one text via Inference Providers."""
	raw = _get_hf_client().feature_extraction(
		text,
		model=settings.embedding_model,
	)
	normalized = _normalize_embeddings(raw, expected_count=1)
	if not normalized or not normalized[0]:
		raise ValueError("Embedding API returned an empty vector")
	return normalized[0]


def _get_cached_embedding(text: str, task_type: EmbeddingTaskType) -> list[float] | None:
	"""Return cached embedding when still fresh for this (task_type, text) key."""
	key = (task_type, text)
	item = _embed_cache.get(key)
	if item is None:
		return None

	timestamp, vector = item
	if (time.time() - timestamp) > _EMBED_CACHE_TTL_SECONDS:
		_embed_cache.pop(key, None)
		return None

	# Keep hot keys near the end for LRU-like eviction.
	_embed_cache.move_to_end(key)
	return list(vector)


def _set_cached_embedding(text: str, task_type: EmbeddingTaskType, vector: list[float]) -> None:
	"""Store one embedding in a small bounded in-memory cache."""
	key = (task_type, text)
	_embed_cache[key] = (time.time(), list(vector))
	_embed_cache.move_to_end(key)
	while len(_embed_cache) > _EMBED_CACHE_MAX_ENTRIES:
		_embed_cache.popitem(last=False)


def _embed_once(texts: list[str], task_type: EmbeddingTaskType) -> list[list[float]]:
	"""Run one embedding batch and normalize output shape."""
	_ = task_type
	vectors = [_request_single_embedding(text) for text in texts]
	if len(vectors) != len(texts):
		raise ValueError("Embedding API returned unexpected vector count")
	return vectors


def _embed_sync(texts: list[str], task_type: EmbeddingTaskType) -> list[list[float]]:
	"""Synchronous embed call used inside a worker thread."""
	cleaned = [text.strip() for text in texts if text and text.strip()]
	if not cleaned:
		return []

	last_exc: Exception | None = None
	for attempt in range(_EMBED_MAX_RETRIES + 1):
		try:
			return _embed_once(cleaned, task_type)
		except Exception as exc:
			last_exc = exc
			if attempt >= _EMBED_MAX_RETRIES:
				break

			message = str(exc)
			if not _is_retryable_quota_error(message):
				break

			time.sleep(_parse_retry_seconds(message))

	if last_exc is not None:
		raise last_exc
	return []


async def embed_texts(
	texts: list[str],
	task_type: EmbeddingTaskType = "RETRIEVAL_DOCUMENT",
) -> list[list[float]]:
	"""Embed a batch of texts. Returns one vector per non-empty input text."""
	cleaned = [text.strip() for text in texts if text and text.strip()]
	if not cleaned:
		return []

	vectors: list[list[float]] = []
	for start in range(0, len(cleaned), _EMBED_BATCH_LIMIT):
		batch = cleaned[start : start + _EMBED_BATCH_LIMIT]
		batch_vectors = await asyncio.to_thread(_embed_sync, batch, task_type)
		vectors.extend(batch_vectors)

	return vectors


async def embed_text(
	text: str,
	task_type: EmbeddingTaskType = "RETRIEVAL_DOCUMENT",
) -> list[float]:
	"""Embed a single text and return one embedding vector."""
	cleaned = (text or "").strip()
	if not cleaned:
		raise ValueError("No embedding generated for input text")

	cached = _get_cached_embedding(cleaned, task_type)
	if cached is not None:
		return cached

	vectors = await embed_texts([cleaned], task_type)
	if not vectors:
		raise ValueError("No embedding generated for input text")
	vector = vectors[0]
	_set_cached_embedding(cleaned, task_type, vector)
	return vector

