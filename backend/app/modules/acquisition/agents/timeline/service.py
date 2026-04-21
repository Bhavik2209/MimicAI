"""Business logic for timeline extraction."""

from .schemas import TimelineProfile
from .utils import timeline_agent


async def fetch_entity_timeline(entity_id: str) -> TimelineProfile:
    """Fetch timeline for a Wikidata entity id."""
    payload = await timeline_agent(entity_id)
    return TimelineProfile.model_validate(payload)
