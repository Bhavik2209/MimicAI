"""Business logic for speech/interview conversation extraction."""

from app.modules.entity.utils import fetch_entity_data

from .schemas import ConversationProfile, ConversationVideo
from .utils import collect_conversation_videos


async def fetch_entity_conversation(entity_id: str) -> ConversationProfile:
    """Fetch transcript conversation videos for a Wikidata entity id."""
    name: str | None = None

    try:
        entity = await fetch_entity_data(entity_id)
        name = entity.get("labels", {}).get("en", {}).get("value")
    except Exception:
        name = None

    if not name:
        return ConversationProfile(entity_id=entity_id, name=None, videos=[])

    raw_videos = await collect_conversation_videos(name=name, max_videos=3)
    videos = [ConversationVideo.model_validate(item) for item in raw_videos]
    return ConversationProfile(entity_id=entity_id, name=name, videos=videos)
