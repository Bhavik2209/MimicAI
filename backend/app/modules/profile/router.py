"""HTTP routes for profile-related endpoints."""

from fastapi import APIRouter

from app.modules.acquisition.agents.news.schemas import NewsArticle
from app.modules.acquisition.agents.news.service import fetch_entity_news
from app.modules.acquisition.agents.openalex.schemas import OpenAlexProfile
from app.modules.acquisition.agents.openalex.service import fetch_openalex_profile
from app.modules.acquisition.agents.social.schemas import SocialMediaProfile
from app.modules.acquisition.agents.social.service import fetch_social_profiles

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/{entity_name}/news")
async def get_entity_news(entity_name: str) -> list[NewsArticle]:
    """Fetch up to 5 news articles for a given entity name."""
    return await fetch_entity_news(entity_name, max_articles=5)


@router.get("/{entity_id}/openalex")
async def get_entity_openalex(entity_id: str) -> OpenAlexProfile | None:
    """Fetch OpenAlex academic profile using a Wikidata entity id."""
    return await fetch_openalex_profile(entity_id)


@router.get("/{entity_id}/socials")
async def get_entity_socials(entity_id: str) -> SocialMediaProfile:
    """Fetch social media links for a Wikidata entity id."""
    return await fetch_social_profiles(entity_id)
