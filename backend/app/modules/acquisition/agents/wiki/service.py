"""Business logic for wiki acquisition."""

from .schemas import WikiProfile
from .utils import wiki_agent


async def fetch_wiki_profile(entity_id: str) -> WikiProfile:
    """Fetch and normalize wiki payload for one entity."""
    payload = await wiki_agent(entity_id)
    return WikiProfile.model_validate(payload)
