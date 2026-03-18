"""Business logic for news aggregation."""

import logging

from .schemas import NewsArticle
from .utils import news_agent

logger = logging.getLogger(__name__)


async def fetch_entity_news(name: str, max_articles: int = 30) -> list[NewsArticle]:
    """Fetch news articles for a given entity name."""
    logger.info(f"Fetching news for entity: {name}")
    raw_articles = await news_agent(name, max_articles=max_articles)
    logger.info(f"Received {len(raw_articles)} articles from agent")

    results = [
        NewsArticle(
            title=article["title"],
            source=article.get("source"),
            published_at=article.get("published_at"),
            url=article.get("url"),
        )
        for article in raw_articles
    ]
    logger.info(f"Returning {len(results)} formatted article objects")
    return results
