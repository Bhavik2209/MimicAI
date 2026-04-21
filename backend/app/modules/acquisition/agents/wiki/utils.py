"""Wiki Agent - Fetch Wikipedia content for a Wikidata entity ID."""

import asyncio
import logging
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

import httpx

from app.config import settings

HEADERS = {"User-Agent": "MimicAI/1.0 (https://github.com/Bhavik2209/MimicAI)"}
logger = logging.getLogger(__name__)


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


async def _safe_request(url: str, params: dict) -> dict:
    """Execute a safe GET request with common headers and timeout."""
    max_attempts = 4
    base_backoff_seconds = 1.0

    async with httpx.AsyncClient(timeout=15.0, headers=HEADERS) as client:
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
                    "Wiki agent request throttled/failed (status=%s). Retrying in %.1fs (attempt %s/%s)",
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
    raise RuntimeError("Wiki request retry loop exhausted")


async def _get_wikipedia_title(entity_id: str) -> str:
    """Resolve Wikidata QID to English Wikipedia title."""
    data = await _safe_request(settings.wikidata_entity_url.format(entity_id), params={})
    entity = data.get("entities", {}).get(entity_id, {})
    enwiki = entity.get("sitelinks", {}).get("enwiki")
    if not enwiki:
        raise ValueError(f"No English Wikipedia page found for {entity_id}")
    return enwiki["title"]


async def _fetch_intro(title: str) -> str:
    """Fetch introduction paragraph as plain text."""
    data = await _safe_request(
        settings.wikipedia_api_url,
        {
            "action": "query",
            "titles": title,
            "format": "json",
            "prop": "extracts",
            "exintro": 1,
            "explaintext": 1,
            "redirects": 1,
        },
    )
    pages = data.get("query", {}).get("pages", {})
    page = next(iter(pages.values()), {})
    return page.get("extract", "").strip()


async def _fetch_sections(title: str) -> list[dict[str, str]]:
    """Fetch full article as plain text and split by wiki-style sections."""
    data = await _safe_request(
        settings.wikipedia_api_url,
        {
            "action": "query",
            "titles": title,
            "format": "json",
            "prop": "extracts",
            "explaintext": 1,
            "exsectionformat": "wiki",
            "redirects": 1,
        },
    )
    pages = data.get("query", {}).get("pages", {})
    page = next(iter(pages.values()), {})
    full_text = page.get("extract", "")

    sections: list[dict[str, str]] = []
    current_section = "Introduction"
    buffer: list[str] = []

    for line in full_text.splitlines():
        stripped = line.strip()
        if stripped.startswith("==") and stripped.endswith("=="):
            if buffer:
                sections.append({"section": current_section, "text": " ".join(buffer)})
                buffer = []
            current_section = stripped.strip("= ").strip()
        elif stripped:
            buffer.append(stripped)

    if buffer:
        sections.append({"section": current_section, "text": " ".join(buffer)})

    return sections


async def wiki_agent(entity_id: str) -> dict:
    """Fetch wiki intro and sections for a Wikidata entity ID."""
    title = await _get_wikipedia_title(entity_id)
    intro, sections = await asyncio.gather(_fetch_intro(title), _fetch_sections(title))

    return {
        "entity_id": entity_id,
        "wikipedia_title": title,
        "intro_summary": intro,
        "sections": sections,
    }
