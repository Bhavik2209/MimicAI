"""Utility helpers for OpenAlex data acquisition."""

from collections import Counter
from typing import Any

import httpx

from app.config import settings

OPENALEX_BASE = settings.openalex_base_url
HEADERS = {"User-Agent": "MimicAI/1.0 (info@mimicai.example.com)"}


async def safe_request(url: str, params: dict[str, Any] | None = None) -> dict:
    """Execute a safe HTTP GET request to OpenAlex API."""
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, headers=HEADERS, timeout=10.0)
        response.raise_for_status()
        return response.json()


async def get_author_by_orcid(orcid: str) -> dict | None:
    """Lookup an author in OpenAlex by ORCID."""
    url = f"{OPENALEX_BASE}/authors/orcid:{orcid}"
    try:
        return await safe_request(url)
    except httpx.HTTPStatusError:
        return None


async def get_author_by_wikidata(wikidata_id: str) -> dict | None:
    """Lookup an author in OpenAlex by Wikidata ID."""
    url = f"{OPENALEX_BASE}/authors/wikidata:{wikidata_id}"
    try:
        return await safe_request(url)
    except httpx.HTTPStatusError:
        return None


async def search_author_by_name(name: str) -> list[dict]:
    """Search OpenAlex authors by display name."""
    url = f"{OPENALEX_BASE}/authors"
    data = await safe_request(url, params={"search": name})
    return data.get("results", [])


def pick_best_author(candidates: list[dict], target_name: str) -> dict | None:
    """Pick an exact display-name match first, else first candidate."""
    target = target_name.lower()
    for author in candidates:
        if author.get("display_name", "").lower() == target:
            return author
    return candidates[0] if candidates else None


async def fetch_top_works(author_id: str) -> list[dict]:
    """Fetch top cited works for an OpenAlex author ID."""
    url = f"{OPENALEX_BASE}/works"
    params = {
        "filter": f"authorships.author.id:{author_id}",
        "sort": "cited_by_count:desc",
        "per-page": 20,
        "select": "id,title,publication_year,cited_by_count,authorships,primary_location",
    }
    data = await safe_request(url, params=params)
    return data.get("results", [])


def extract_coauthors(works: list[dict], main_author_id: str, limit: int = 5) -> list[dict]:
    """Build top coauthor list from returned works."""
    coauthor_counter: Counter[tuple[str, str | None]] = Counter()

    for work in works:
        for auth in work.get("authorships", []):
            author = auth.get("author", {})
            author_id = author.get("id")
            name = author.get("display_name")

            if author_id and author_id != main_author_id:
                coauthor_counter[(author_id, name)] += 1

    top = coauthor_counter.most_common(limit)
    return [
        {
            "openalex_id": author_id,
            "name": name,
            "collaboration_count": count,
        }
        for (author_id, name), count in top
    ]


async def resolve_author(
    resolved_name: str,
    orcid_ids: list[str],
    wikidata_id: str | None = None,
) -> dict | None:
    """Resolve an OpenAlex author using wikidata, ORCID, then name fallback."""
    if wikidata_id:
        candidate = await get_author_by_wikidata(wikidata_id)
        if candidate:
            return candidate

    for orcid in orcid_ids:
        candidate = await get_author_by_orcid(orcid)
        if candidate:
            return candidate

    candidates = await search_author_by_name(resolved_name)
    return pick_best_author(candidates, resolved_name)


def get_primary_institution(author: dict) -> dict[str, Any] | None:
    """Extract primary institution details from author payload."""
    institutions = author.get("last_known_institutions") or []
    if not institutions:
        return None

    inst = institutions[0]
    return {
        "name": inst.get("display_name"),
        "country": inst.get("country_code"),
        "type": inst.get("type"),
    }


def get_top_topics(author: dict) -> list[dict[str, Any]]:
    """Extract top topics from author payload."""
    topics = author.get("topics") or []
    return [
        {
            "name": (topic.get("topic") or {}).get("display_name"),
            "field": (topic.get("field") or {}).get("display_name"),
        }
        for topic in topics[:5]
    ]


def get_top_works(works: list[dict]) -> list[dict[str, Any]]:
    """Extract top work metadata from works payload."""
    top_works: list[dict[str, Any]] = []
    for work in works[:5]:
        venue = (work.get("primary_location") or {}).get("source") or {}
        top_works.append(
            {
                "title": work.get("title"),
                "year": work.get("publication_year"),
                "citations": work.get("cited_by_count", 0),
                "venue": venue.get("display_name"),
            }
        )
    return top_works


async def openalex_agent(
    resolved_name: str,
    orcid_ids: list[str],
    wikidata_id: str | None = None,
) -> dict[str, Any] | None:
    """Fetch research profile data from OpenAlex for an entity."""
    author = await resolve_author(resolved_name, orcid_ids, wikidata_id)

    if not author:
        return None

    author_id_full = author.get("id")
    if not author_id_full:
        return None

    author_id_short = author_id_full.split("/")[-1]
    summary_stats = author.get("summary_stats") or {}

    works = await fetch_top_works(author_id_short)
    coauthors = extract_coauthors(works, author_id_full, limit=5)

    return {
        "openalex_author_id": author_id_full,
        "name": author.get("display_name"),
        "metrics": {
            "works_count": author.get("works_count", 0),
            "cited_by_count": author.get("cited_by_count", 0),
            "h_index": summary_stats.get("h_index", 0),
        },
        "primary_institution": get_primary_institution(author),
        "top_topics": get_top_topics(author),
        "top_works": get_top_works(works),
        "top_coauthors": coauthors,
    }
