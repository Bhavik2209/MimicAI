"""Utility helpers for NewsData.io API requests."""

import httpx
import logging

from app.config import settings

logger = logging.getLogger(__name__)

BASE_URL = settings.news_api_url
API_KEY = settings.news_api_key
HEADERS = {"User-Agent": "MimicAI/1.0"}

logger.info(f"News API configured - URL: {BASE_URL}, Key present: {bool(API_KEY)}")


async def safe_request(url: str, params: dict | None = None) -> dict:
    """Execute a safe HTTP GET request to NewsData API."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=HEADERS, timeout=15.0)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error {e.response.status_code}: {e.response.text}")
        raise
    except httpx.RequestError as e:
        logger.error(f"Request failed: {e}")
        raise


def is_relevant(article: dict, name: str, min_score: int = 2) -> bool:
    """Score article by name prominence; return True if score >= min_score."""
    name_lower = name.lower()
    name_parts = name_lower.split()

    title = (article.get("title") or "").lower()
    snippet = (article.get("snippet") or "").lower()

    score = 0

    if name_lower in title:
        score += 3

    if name_lower in snippet:
        score += 2

    snippet_mentions = snippet.count(name_lower)
    score += min(snippet_mentions, 2)

    for part in name_parts:
        if len(part) > 3 and part in title:
            score += 1

    return score >= min_score


async def news_agent(
    name: str, max_articles: int = 30, min_relevance_score: int = 2
) -> list[dict]:
    """Fetch and filter news articles related to name from NewsData.io."""
    if not API_KEY:
        logger.error("NEWS_API_KEY not configured in environment")
        return []

    all_articles = []
    seen_titles = set()
    next_page = None
    pages_fetched = 0
    MAX_PAGES = 10

    while len(all_articles) < max_articles and pages_fetched < MAX_PAGES:
        params = {
            "apikey": API_KEY,
            "q": f'"{name}"',
            "language": "en",
            "size": 10,
        }
        if next_page:
            params["page"] = next_page

        try:
            data = await safe_request(BASE_URL, params=params)
        except Exception as e:
            logger.error(f"Failed to fetch news for '{name}': {e}")
            break

        articles = data.get("results", [])
        pages_fetched += 1

        if not articles:
            logger.info(f"No articles found for '{name}'")
            break

        logger.info(f"Fetched {len(articles)} articles, processing...")
        process_article_batch(
            articles, name, all_articles, seen_titles, min_relevance_score
        )

        next_page = data.get("nextPage")
        if not next_page:
            break

    logger.info(f"Final result: {len(all_articles)} relevant articles for '{name}'")
    return all_articles[:max_articles]


def process_article_batch(
    articles: list,
    name: str,
    all_articles: list,
    seen_titles: set,
    min_relevance_score: int,
) -> None:
    """Extract and filter articles from batch."""
    for article in articles:
        title = article.get("title")
        if not title or title in seen_titles:
            continue

        cleaned = {
            "title": title,
            "source": article.get("source_id"),
            "published_at": article.get("pubDate"),
            "url": article.get("link"),
        }

        if is_relevant(cleaned, name, min_score=min_relevance_score):
            seen_titles.add(title)
            all_articles.append(cleaned)
