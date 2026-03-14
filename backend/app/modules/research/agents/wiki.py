"""
Wiki Agent - Fetch Wikipedia content for a Wikidata entity ID.
Uses Wikipedia's explaintext API to get plain text — no HTML parsing needed.
"""
import asyncio
import httpx
from typing import List, Dict, Any
from app.config import settings

HEADERS = {"User-Agent": "MimicAI/1.0 (https://github.com/Bhavik2209/MimicAI)"}


async def _safe_request(url: str, params: dict) -> dict:
    async with httpx.AsyncClient(timeout=15.0, headers=HEADERS) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()


async def _get_wikipedia_title(qid: str) -> str:
    """Resolve Wikidata QID → English Wikipedia article title."""
    data = await _safe_request(
        settings.wikidata_entity_url.format(qid), params={}
    )
    entity = data["entities"][qid]
    enwiki = entity.get("sitelinks", {}).get("enwiki")
    if not enwiki:
        raise ValueError(f"No English Wikipedia page found for {qid}")
    return enwiki["title"]


async def _fetch_intro(title: str) -> str:
    """Fetch the introduction paragraph as plain text."""
    data = await _safe_request(settings.wikipedia_api_url, {
        "action": "query",
        "titles": title,
        "format": "json",
        "prop": "extracts",
        "exintro": 1,
        "explaintext": 1,
        "redirects": 1,
    })
    pages = data.get("query", {}).get("pages", {})
    page = next(iter(pages.values()), {})
    return page.get("extract", "").strip()


async def _fetch_sections(title: str) -> List[Dict[str, str]]:
    """Fetch full article as plain text and split into sections."""
    data = await _safe_request(settings.wikipedia_api_url, {
        "action": "query",
        "titles": title,
        "format": "json",
        "prop": "extracts",
        "explaintext": 1,
        "exsectionformat": "wiki",
        "redirects": 1,
    })
    pages = data.get("query", {}).get("pages", {})
    page = next(iter(pages.values()), {})
    full_text = page.get("extract", "")

    sections = []
    current_section = "Introduction"
    buffer = []

    for line in full_text.splitlines():
        stripped = line.strip()
        if stripped.startswith("==") and stripped.endswith("=="):
            if buffer:
                sections.append({
                    "section": current_section,
                    "text": " ".join(buffer),
                })
                buffer = []
            current_section = stripped.strip("= ").strip()
        elif stripped:
            buffer.append(stripped)

    if buffer:
        sections.append({"section": current_section, "text": " ".join(buffer)})

    return sections


async def wiki_agent(qid: str) -> Dict[str, Any]:
    """
    Fetch Wikipedia content for a Wikidata entity ID.
    Returns intro and full sections.
    """
    title = await _get_wikipedia_title(qid)
    intro, sections = await asyncio.gather(
        _fetch_intro(title),
        _fetch_sections(title),
    )

    return {
        "entity_id": qid,
        "wikipedia_title": title,
        "intro_summary": intro,
        "sections": sections,
        # Reference URLs intentionally disabled for now.
        # "reference_urls": references,
    }
