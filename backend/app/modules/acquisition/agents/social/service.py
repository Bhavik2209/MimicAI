"""Business logic for social media profile acquisition."""

from .schemas import SocialMediaProfile
from .utils import social_media_agent


async def fetch_social_profiles(entity_id: str) -> SocialMediaProfile:
    """Fetch social media profile data for a Wikidata entity id."""
    payload = await social_media_agent(entity_id)
    return SocialMediaProfile.model_validate(payload)
