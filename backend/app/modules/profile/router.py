"""HTTP routes for profile-related endpoints."""

from fastapi import APIRouter

from app.modules.acquisition.agents.news.schemas import NewsArticle
from app.modules.acquisition.agents.news.service import fetch_entity_news
from app.modules.acquisition.agents.openalex.schemas import OpenAlexProfile
from app.modules.acquisition.agents.openalex.service import fetch_openalex_profile
from app.modules.acquisition.agents.quotes.schemas import QuotesProfile
from app.modules.acquisition.agents.quotes.service import fetch_entity_quotes
from app.modules.acquisition.agents.social.schemas import SocialMediaProfile
from app.modules.acquisition.agents.social.service import fetch_social_profiles
from app.modules.acquisition.agents.conversation.schemas import ConversationProfile
from app.modules.acquisition.agents.conversation.service import fetch_entity_conversation
from app.modules.acquisition.agents.timeline.schemas import TimelineProfile
from app.modules.acquisition.agents.timeline.service import fetch_entity_timeline
from app.modules.acquisition.agents.wiki.schemas import WikiProfile
from app.modules.acquisition.agents.wiki.service import fetch_wiki_profile
from app.modules.analysis.agents.personality.schemas import PersonalityAnalysis
from app.modules.analysis.service import run_personality_analysis

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


@router.get("/{entity_id}/quotes")
async def get_entity_quotes(entity_id: str) -> QuotesProfile:
    """Fetch quotes for a Wikidata entity id."""
    return await fetch_entity_quotes(entity_id)


@router.get("/{entity_id}/conversation")
async def get_entity_conversation(entity_id: str) -> ConversationProfile:
    """Fetch speech/interview transcript videos for a Wikidata entity id."""
    return await fetch_entity_conversation(entity_id)


@router.get("/{entity_id}/timeline")
async def get_entity_timeline(entity_id: str) -> TimelineProfile:
    """Fetch timeline events for a Wikidata entity id."""
    return await fetch_entity_timeline(entity_id)


@router.get("/{entity_id}/wiki")
async def get_entity_wiki(entity_id: str) -> WikiProfile:
    """Fetch Wikipedia summary and sections for a Wikidata entity id."""
    return await fetch_wiki_profile(entity_id)


@router.get("/{entity_id}/personality")
async def get_entity_personality(entity_id: str) -> PersonalityAnalysis:
    """Run personality analysis using generated questions and vector evidence."""
    return await run_personality_analysis(entity_id)
