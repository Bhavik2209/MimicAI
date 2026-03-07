import httpx
from collections import Counter
from typing import Optional, Dict, Any, List
from app.config import settings

OPENALEX_BASE = settings.openalex_base_url
HEADERS = {
    "User-Agent": "MimicAI/1.0 (info@mimicai.example.com)"
}

async def safe_request(url: str, params: Optional[Dict[str, Any]] = None) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, headers=HEADERS, timeout=10.0)
        response.raise_for_status()
        return response.json()


async def get_author_by_orcid(orcid: str) -> Optional[dict]:
    url = f"{OPENALEX_BASE}/authors/orcid:{orcid}"
    try:
        return await safe_request(url)
    except httpx.HTTPStatusError:
        return None


async def search_author_by_name(name: str) -> list:
    url = f"{OPENALEX_BASE}/authors"
    params = {"search": name}
    data = await safe_request(url, params=params)
    return data.get("results", [])


def pick_best_author(candidates: list, target_name: str) -> Optional[dict]:
    target = target_name.lower()
    for author in candidates:
        if author.get("display_name", "").lower() == target:
            return author
    return candidates[0] if candidates else None


async def fetch_top_works(author_id: str) -> list:
    url = f"{OPENALEX_BASE}/works"
    params = {
        "filter": f"authorships.author.id:{author_id}",
        "sort": "cited_by_count:desc",
        "per-page": 20,
        "select": "id,title,publication_year,cited_by_count,authorships,primary_location"
    }
    data = await safe_request(url, params=params)
    return data.get("results", [])


def extract_coauthors(works: list, main_author_id: str, limit: int = 5) -> list:
    coauthor_counter = Counter()

    for w in works:
        for auth in w.get("authorships", []):
            author = auth.get("author", {})
            aid = author.get("id")
            name = author.get("display_name")

            if aid and aid != main_author_id:
                coauthor_counter[(aid, name)] += 1

    top = coauthor_counter.most_common(limit)

    return [
        {
            "openalex_id": aid,
            "name": name,
            "collaboration_count": count
        }
        for (aid, name), count in top
    ]


async def get_author_by_wikidata(wikidata_id: str) -> Optional[dict]:
    url = f"{OPENALEX_BASE}/authors/wikidata:{wikidata_id}"
    try:
        return await safe_request(url)
    except httpx.HTTPStatusError:
        return None


async def openalex_agent(resolved_name: str, orcid_ids: List[str], wikidata_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Agent that fetches academic research data for a given entity using the OpenAlex API.
    Uses Wikidata ID for lookup if available, then ORCID, otherwise falls back to exact name search.
    """
    author = None

    # 1. Wikidata lookup
    if wikidata_id:
        candidate = await get_author_by_wikidata(wikidata_id)
        if candidate:
            author = candidate

    # 2. ORCID lookup
    if not author:
        for orcid in orcid_ids:
            candidate = await get_author_by_orcid(orcid)
            if candidate:
                author = candidate
                break

    # 3. Name fallback
    if not author:
        candidates = await search_author_by_name(resolved_name)
        author = pick_best_author(candidates, resolved_name)

    if not author:
        return None

    author_id_full = author.get("id")
    if not author_id_full:
        return None
        
    author_id_short = author_id_full.split("/")[-1]

    summary_stats = author.get("summary_stats") or {}

    # -------- Institution --------
    institutions = author.get("last_known_institutions") or []
    primary_institution = None
    if institutions:
        inst = institutions[0]
        primary_institution = {
            "name": inst.get("display_name"),
            "country": inst.get("country_code"),
            "type": inst.get("type")
        }

    # -------- Topics --------
    topics = author.get("topics") or []
    top_topics = [
        {
            "name": (t.get("topic") or {}).get("display_name"),
            "field": (t.get("field") or {}).get("display_name")
        }
        for t in topics[:5]
    ]

    # -------- Works --------
    works = await fetch_top_works(author_id_short)

    top_works = []
    for w in works[:5]:
        venue = (w.get("primary_location") or {}).get("source") or {}
        top_works.append({
            "title": w.get("title"),
            "year": w.get("publication_year"),
            "citations": w.get("cited_by_count", 0),
            "venue": venue.get("display_name")
        })

    # -------- Coauthors --------
    coauthors = extract_coauthors(works, author_id_full, limit=5)

    return {
        "openalex_author_id": author_id_full,
        "name": author.get("display_name"),
        "metrics": {
            "works_count": author.get("works_count", 0),
            "cited_by_count": author.get("cited_by_count", 0),
            "h_index": summary_stats.get("h_index", 0)
        },
        "primary_institution": primary_institution,
        "top_topics": top_topics,
        "top_works": top_works,
        "top_coauthors": coauthors
    }
