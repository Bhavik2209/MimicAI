import httpx
from typing import List, Dict, Any
from app.config import settings

BASE_URL = settings.news_api_url
API_KEY = settings.news_api_key
HEADERS = {"User-Agent": "MimicAI/1.0"}

async def safe_request(url: str, params: dict = None) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, headers=HEADERS, timeout=15.0)
        response.raise_for_status()
        return response.json()

def is_relevant(article: dict, name: str, min_score: int = 2) -> bool:
    """
    Score the article based on how prominently the name appears.
    Returns True only if score >= min_score.
    """
    name_lower = name.lower()
    name_parts = name_lower.split()

    title = (article.get("title") or "").lower()
    snippet = (article.get("snippet") or "").lower()

    score = 0

    # Full name in title = strong signal (+3)
    if name_lower in title:
        score += 3

    # Full name in snippet (+2)
    if name_lower in snippet:
        score += 2

    # Count full name occurrences in snippet (each extra +1, capped at 2)
    snippet_mentions = snippet.count(name_lower)
    score += min(snippet_mentions, 2)

    # Partial name parts in title (+1 each)
    for part in name_parts:
        if len(part) > 3 and part in title:
            score += 1

    return score >= min_score

async def news_agent(name: str, max_articles: int = 30, min_relevance_score: int = 2) -> List[Dict[str, Any]]:
    """
    Fetches news articles related to the given name using the NewsData.io API.
    Filters the results based on relevance scoring.
    """
    all_articles = []
    seen_titles = set()
    next_page = None
    pages_fetched = 0
    MAX_PAGES = 10  # safety cap

    while len(all_articles) < max_articles and pages_fetched < MAX_PAGES:
        params = {
            "apikey": API_KEY,
            "q": f'"{name}"',
            "language": "en",
            "size": 10
        }
        if next_page:
            params["page"] = next_page

        try:
            data = await safe_request(BASE_URL, params=params)
        except httpx.HTTPError:
            break

        articles = data.get("results", [])
        pages_fetched += 1

        if not articles:
            break

        for article in articles:
            title = article.get("title")
            if not title or title in seen_titles:
                continue

            cleaned = {
                "title": title,
                "source": article.get("source_id"),
                "published_at": article.get("pubDate"),
                "url": article.get("link"),
                "snippet": article.get("description")
            }

            # Only add if article is actually about the person
            if is_relevant(cleaned, name, min_score=min_relevance_score):
                seen_titles.add(title)
                all_articles.append(cleaned)

        next_page = data.get("nextPage")
        if not next_page:
            break

    return all_articles[:max_articles]
