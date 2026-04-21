"""Utility helpers for Wikidata requests and claim extraction."""

import asyncio
import logging
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

import httpx

from app.config import settings

WIKIDATA_SEARCH_URL = settings.wikidata_search_url
WIKIDATA_ENTITY_URL = settings.wikidata_entity_url

ALLOWED_INSTANCE_SET = {"Q5"}

ACADEMIC_OCCUPATION_SET = {
	"Q169470",  # physicist
	"Q593644",  # chemist
	"Q121594",  # biologist
	"Q170790",  # mathematician
	"Q1622272",  # academic
	"Q1650915",  # researcher
	"Q36180",  # writer
	"Q901",  # scientist
}

logger = logging.getLogger(__name__)

WIKIMEDIA_HEADERS = {
	"User-Agent": "MimicAI/1.0 (+https://github.com/Bhavik2209/MimicAI)",
}


def _parse_retry_after_seconds(response: httpx.Response) -> float | None:
	"""Parse Retry-After header as seconds (int or HTTP date)."""
	retry_after = response.headers.get("Retry-After")
	if not retry_after:
		return None

	if retry_after.isdigit():
		return max(0.0, float(retry_after))

	try:
		retry_at = parsedate_to_datetime(retry_after)
		if retry_at.tzinfo is None:
			retry_at = retry_at.replace(tzinfo=timezone.utc)
		delta = (retry_at - datetime.now(timezone.utc)).total_seconds()
		return max(0.0, delta)
	except Exception:
		return None


async def safe_request(url: str, params: dict | None = None) -> dict:
	"""Execute a safe HTTP GET request to Wikidata API."""
	max_attempts = 4
	base_backoff_seconds = 1.0

	async with httpx.AsyncClient(timeout=12.0, headers=WIKIMEDIA_HEADERS) as client:
		for attempt in range(1, max_attempts + 1):
			try:
				response = await client.get(url, params=params)
				response.raise_for_status()
				return response.json()
			except httpx.HTTPStatusError as exc:
				status_code = exc.response.status_code
				retryable = status_code in {429, 500, 502, 503, 504}
				if not retryable or attempt == max_attempts:
					raise

				retry_after = _parse_retry_after_seconds(exc.response)
				backoff = retry_after if retry_after is not None else base_backoff_seconds * (2 ** (attempt - 1))
				logger.warning(
					"Wikidata request throttled/failed (status=%s). Retrying in %.1fs (attempt %s/%s)",
					status_code,
					backoff,
					attempt,
					max_attempts,
				)
				await asyncio.sleep(backoff)
			except httpx.RequestError:
				if attempt == max_attempts:
					raise
				await asyncio.sleep(base_backoff_seconds * (2 ** (attempt - 1)))

	# This is unreachable because we either return or raise above.
	raise RuntimeError("Wikidata request retry loop exhausted")


async def wikidata_search(query: str) -> list:
	"""Search Wikidata for entities matching a query string."""
	params = {
		"action": "wbsearchentities",
		"format": "json",
		"language": "en",
		"search": query,
		"limit": 10,
	}
	data = await safe_request(WIKIDATA_SEARCH_URL, params)
	return data.get("search", [])


async def fetch_entity_data(qid: str) -> dict:
	"""Fetch full entity payload for a Wikidata QID."""
	data = await safe_request(WIKIDATA_ENTITY_URL.format(qid))
	return data["entities"][qid]


def extract_claim(entity: dict, prop: str) -> list:
	"""Extract claim values for a given property from a Wikidata entity."""
	claims = entity.get("claims", {}).get(prop, [])
	values = []
	for claim in claims:
		mainsnak = claim.get("mainsnak", {})
		datavalue = mainsnak.get("datavalue")
		if not datavalue:
			continue
		value = datavalue["value"]
		if isinstance(value, dict) and "id" in value:
			values.append(value["id"])
		else:
			values.append(value)
	return values


def extract_external_identifier(entity: dict, prop: str) -> list[str]:
	"""Extract external identifier string values from entity claims."""
	values: list[str] = []
	claims = entity.get("claims", {}).get(prop, [])
	for claim in claims:
		mainsnak = claim.get("mainsnak", {})
		datavalue = mainsnak.get("datavalue")
		if not datavalue:
			continue
		value = datavalue.get("value")
		if isinstance(value, str):
			values.append(value)
	return values


async def fetch_labels(qids: list[str]) -> dict[str, str | None]:
	"""Batch-fetch English labels for a list of QIDs."""
	if not qids:
		return {}

	params = {
		"action": "wbgetentities",
		"format": "json",
		"ids": "|".join(qids),
		"languages": "en",
		"props": "labels",
	}

	data = await safe_request(WIKIDATA_SEARCH_URL, params)

	label_map: dict[str, str | None] = {}
	for qid, entity in data.get("entities", {}).items():
		label_map[qid] = entity.get("labels", {}).get("en", {}).get("value")

	return label_map


def build_image_url(entity: dict) -> str | None:
	"""Build Wikimedia image URL from entity image claim (P18)."""
	image_names = extract_claim(entity, "P18")
	if image_names:
		return f"https://commons.wikimedia.org/wiki/Special:FilePath/{image_names[0]}"
	return None


def classify_entity_type(description: str) -> str:
	"""Classify entity type using basic description keyword checks."""
	desc = description.lower()
	keywords = [
		"actor",
		"physicist",
		"film actor",
		"producer",
		"director",
		"professor",
		"scientist",
		"politician",
	]
	if any(keyword in desc for keyword in keywords):
		return "human"
	return "other"

