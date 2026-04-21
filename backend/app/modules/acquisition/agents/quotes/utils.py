"""Utility helpers for quote extraction from API Ninjas + Wikiquote."""
import logging
import re
import httpx
from bs4 import BeautifulSoup
from app.config import settings
import asyncio

logger = logging.getLogger(__name__)


# ─── API Ninjas (own quotes) ───────────────────────────────────────────────

async def fetch_own_quotes(name: str, max_quotes: int = 5) -> list[dict]:
    """
    Fetch the person's own direct quotes from API Ninjas.
    API returns 1 quote per call — we loop to collect more.
    """
    headers = {"X-Api-Key": settings.api_ninjas_key}
    params = {"author": name}  # no limit param — not supported, causes 400

    results = []
    seen = set()  # avoid duplicates across calls

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            for _ in range(max_quotes):
                response = await client.get(
                    "https://api.api-ninjas.com/v1/quotes",
                    headers=headers,
                    params=params,
                )
                response.raise_for_status()
                data = response.json()

                if not data:
                    break  # no more quotes available

                quote = data[0].get("quote", "").strip()

                if not quote or quote in seen:
                    break  # duplicate or empty — stop early

                seen.add(quote)
                results.append({
                    "quote": quote,
                    "section": "own",
                    "attribution": None,
                    "date": None,
                })

    except Exception as exc:
        logger.warning("API Ninjas quotes fetch failed for %s: %s", name, exc)

    logger.debug("API Ninjas returned %d quotes for %s", len(results), name)
    return results

# ─── Wikiquote (about section) ─────────────────────────────────────────────

def _extract_citation(li_tag) -> dict:
    """Extract attribution text and date from a citation <li>."""
    text = li_tag.get_text(separator=" ").strip()
    text = re.sub(r"\s+", " ", text)

    full_date_match = re.search(
        r"(January|February|March|April|May|June|July|August|September"
        r"|October|November|December)\s+\d{1,2},?\s+\d{4}",
        text,
    )
    date_match = re.search(r"\b(19|20)\d{2}\b", text)

    date = full_date_match.group(0) if full_date_match else (
        date_match.group(0) if date_match else None
    )
    return {"attribution": text, "date": date}


async def fetch_about_quotes(name: str, max_quotes: int = 30) -> list[dict]:
    """
    Fetch what others said about this person from Wikiquote's 'About' section.

    Returns:
        [{"quote": "...", "section": "about", "attribution": "...", "date": "..."}]
    """
    params = {
        "action": "parse",
        "format": "json",
        "page": name,
        "prop": "text",
    }
    headers = {
        "User-Agent": "MimicAI/1.0 (contact@example.com)",
        "Accept": "application/json",
    }

    try:
        async with httpx.AsyncClient(headers=headers, timeout=10.0) as client:
            response = await client.get(settings.wikiquote_api_url, params=params)
            if response.status_code == 403:
                logger.warning("Wikiquote blocked (403) for: %s", name)
                return []
            response.raise_for_status()
            data = response.json()
    except Exception as exc:
        logger.warning("Wikiquote fetch failed for %s: %s", name, exc)
        return []

    html = data.get("parse", {}).get("text", {}).get("*", "")
    if not html:
        return []

    soup = BeautifulSoup(html, "html.parser")

    # Find heading names that are "about" sections
    about_headings = {
        h.get_text(strip=True).lower()
        for h in soup.find_all(["h2", "h3"])
        if re.search(r"\babout\b", h.get_text(strip=True), re.IGNORECASE)
    }

    def _get_section(li_tag) -> str:
        for sibling in li_tag.find_all_previous(["h2", "h3"]):
            return "about" if sibling.get_text(strip=True).lower() in about_headings else "own"
        return "own"

    results = []

    for li in soup.find_all("li"):
        if li.find_parent(id=re.compile(r"toc|catlinks|mw-")):
            continue
        if li.find_parent("li"):
            continue

        # Only keep "About" section items from Wikiquote
        if _get_section(li) != "about":
            continue

        li_clone = BeautifulSoup(str(li), "html.parser").find("li")
        for nested_ul in li_clone.find_all("ul"):
            nested_ul.decompose()

        quote_text = re.sub(r"\s+", " ", li_clone.get_text(separator=" ").strip())

        if len(quote_text.split()) < 8:
            continue

        citation_lis = li.find_all("li")
        attribution, date = None, None
        if citation_lis:
            citation_data = _extract_citation(citation_lis[0])
            attribution = citation_data["attribution"]
            date = citation_data["date"]

        results.append({
            "quote": quote_text,
            "section": "about",
            "attribution": attribution,
            "date": date,
        })

    logger.debug("Wikiquote 'about' returned %d quotes for %s", len(results), name)
    return results[:max_quotes]


# ─── Combined entry point ──────────────────────────────────────────────────

async def fetch_quotes(name: str, max_quotes: int = 50) -> list[dict]:
    """
    Fetch quotes from both sources and merge.

    Returns combined list:
    - section='own'   → person's direct quotes (API Ninjas)
    - section='about' → what others said (Wikiquote)
    """
    own, about = await asyncio.gather(
        fetch_own_quotes(name, max_quotes=max_quotes // 2),
        fetch_about_quotes(name, max_quotes=max_quotes // 2),
    )
    return own + about
