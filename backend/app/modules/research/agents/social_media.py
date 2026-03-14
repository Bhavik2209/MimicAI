from typing import Dict, Any, List
from app.modules.entity.utils import fetch_entity_data, extract_claim

async def social_media_agent(qid: str) -> Dict[str, List[Any]]:
    """
    Extracts social media handles and website links for a given Wikidata entity.
    """
    try:
        entity = await fetch_entity_data(qid)
    except Exception:
        return {
            "twitter": [],
            "instagram": [],
            "facebook": [],
            "youtube": [],
            "linkedin": [],
            "website": []
        }

    # Extract claims using the shared Wikidata utility
    twitter_ids = extract_claim(entity, "P2002")
    instagram_ids = extract_claim(entity, "P2003")
    facebook_ids = extract_claim(entity, "P2013")
    youtube_ids = extract_claim(entity, "P2397")
    linkedin_ids = extract_claim(entity, "P6634")
    websites = extract_claim(entity, "P856")

    result = {
        "twitter": [
            {
                "handle": handle,
                "url": f"https://twitter.com/{handle}"
            }
            for handle in twitter_ids
        ],
        "instagram": [
            {
                "handle": handle,
                "url": f"https://instagram.com/{handle}"
            }
            for handle in instagram_ids
        ],
        "facebook": [
            {
                "handle": handle,
                "url": f"https://facebook.com/{handle}"
            }
            for handle in facebook_ids
        ],
        "youtube": [
            {
                "channel_id": channel,
                "url": f"https://youtube.com/channel/{channel}"
            }
            for channel in youtube_ids
        ],
        "linkedin": [
            {
                "handle": handle,
                "url": f"https://linkedin.com/in/{handle}"
            }
            for handle in linkedin_ids
        ],
        "website": websites
    }

    return result
