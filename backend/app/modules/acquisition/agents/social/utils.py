"""Utility helpers for social media extraction from Wikidata entities."""

from app.modules.entity.utils import extract_claim, fetch_entity_data


async def social_media_agent(qid: str) -> dict[str, list]:
    """Extract social handles and website links for a Wikidata entity."""
    try:
        entity = await fetch_entity_data(qid)
    except Exception:
        return {
            "twitter": [],
            "instagram": [],
            "facebook": [],
            "youtube": [],
            "linkedin": [],
            "website": [],
        }

    twitter_ids = extract_claim(entity, "P2002")
    instagram_ids = extract_claim(entity, "P2003")
    facebook_ids = extract_claim(entity, "P2013")
    youtube_ids = extract_claim(entity, "P2397")
    linkedin_ids = extract_claim(entity, "P6634")
    websites = extract_claim(entity, "P856")

    return {
        "twitter": [
            {"handle": handle, "url": f"https://twitter.com/{handle}"}
            for handle in twitter_ids
        ],
        "instagram": [
            {"handle": handle, "url": f"https://instagram.com/{handle}"}
            for handle in instagram_ids
        ],
        "facebook": [
            {"handle": handle, "url": f"https://facebook.com/{handle}"}
            for handle in facebook_ids
        ],
        "youtube": [
            {"channel_id": channel, "url": f"https://youtube.com/channel/{channel}"}
            for channel in youtube_ids
        ],
        "linkedin": [
            {"handle": handle, "url": f"https://linkedin.com/in/{handle}"}
            for handle in linkedin_ids
        ],
        "website": [site for site in websites if isinstance(site, str)],
    }
