"""Utility helpers for speech and interview extraction from YouTube."""

import asyncio
import logging
from typing import Any

import httpx
import isodate

from app.config import settings

logger = logging.getLogger(__name__)

HEADERS = {"User-Agent": "MimicAI/1.0"}


async def safe_request(url: str, params: dict | None = None) -> dict:
    """Execute a safe HTTP GET request with consistent headers/timeouts."""
    async with httpx.AsyncClient(verify=True, timeout=30.0) as client:
        response = await client.get(url, params=params, headers=HEADERS)
        response.raise_for_status()
        return response.json()


async def search_youtube_videos(query: str, max_results: int = 15) -> list[dict[str, str]]:
    """Search YouTube and return video ids with titles."""
    params = {
        "part": "snippet",
        "q": query,
        "key": settings.youtube_api_key,
        "maxResults": max_results,
        "type": "video",
        "relevanceLanguage": "en",
    }

    try:
        data = await safe_request(settings.youtube_search_url, params)
    except Exception as exc:
        logger.warning("YouTube search failed for '%s': %s", query, exc)
        return []

    return [
        {
            "video_id": item["id"]["videoId"],
            "title": item["snippet"].get("title", item["id"]["videoId"]),
        }
        for item in data.get("items", [])
        if item.get("id", {}).get("videoId")
    ]


async def get_video_details(video_ids: list[str]) -> list[dict[str, Any]]:
    """Get YouTube content details for a batch of video ids."""
    if not video_ids:
        return []

    params = {
        "part": "contentDetails",
        "id": ",".join(video_ids),
        "key": settings.youtube_api_key,
    }

    try:
        data = await safe_request(settings.youtube_video_url, params)
    except Exception as exc:
        logger.warning("YouTube details request failed: %s", exc)
        return []

    return data.get("items", [])


def is_valid_duration(duration_str: str, min_min: int = 5, max_min: int = 15) -> bool:
    """Validate a YouTube ISO duration against min/max minutes."""
    try:
        seconds = isodate.parse_duration(duration_str).total_seconds()
        return min_min * 60 <= seconds <= max_min * 60
    except Exception:
        return False


async def fetch_transcript(video_id: str) -> str | None:
    """Fetch transcript for a video using youtube-transcript.io."""
    if not settings.youtube_transcript_api_key:
        logger.warning("youtube_transcript_api_key is missing. Cannot fetch transcript.")
        return None

    url = "https://www.youtube-transcript.io/api/transcripts"
    headers = {
        "Authorization": f"Basic {settings.youtube_transcript_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "ids": [video_id],
        "languages": ["en"],
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            
            # The exact response schema isn't fully specified, so we heuristically extract text.
            if isinstance(data, list) and data:
                item = data[0]
                if isinstance(item, dict):
                    if "transcript" in item or "text" in item:
                        return item.get("transcript") or item.get("text")
                    # Handle typical list of transcript segments [{text:...}, {text:...}]
                    return " ".join(i.get("text", "") for i in data if isinstance(i, dict) and "text" in i).strip()
            elif isinstance(data, dict):
                # Search for video_id mapping
                if video_id in data:
                    item = data[video_id]
                    if isinstance(item, list):
                        parts = [i.get("text") for i in item if isinstance(i, dict) and "text" in i]
                        if parts:
                            return " ".join(parts).strip()
                    elif isinstance(item, dict):
                        return item.get("transcript") or item.get("text")
                # Fallback to key 'transcripts'
                transcripts = data.get("transcripts", [])
                if isinstance(transcripts, list) and transcripts:
                    item = transcripts[0]
                    if isinstance(item, dict):
                        return item.get("transcript") or item.get("text")
                return str(data)
                
            return str(data)
    except Exception as exc:
        logger.warning("youtube-transcript.io external fetch failed for %s: %s", video_id, exc)
        return None


async def search_and_fetch_transcripts(
    query: str,
    min_min: int = 5,
    max_min: int = 15,
    max_results: int = 15,
) -> list[dict[str, Any]]:
    """Reference flow: search, filter by duration, then fetch transcripts."""
    videos = await search_youtube_videos(query=query, max_results=max_results)
    if not videos:
        return []

    details = await get_video_details([video["video_id"] for video in videos])

    valid_ids = {
        item["id"]
        for item in details
        if is_valid_duration(item.get("contentDetails", {}).get("duration", ""), min_min, max_min)
    }

    results: list[dict[str, Any]] = []
    for video in videos:
        video_id = video["video_id"]
        if video_id not in valid_ids:
            continue

        transcript = await fetch_transcript(video_id)
        if transcript:
            results.append(
                {
                    "title": video.get("title", video_id),
                    "video_id": video_id,
                    "url": f"https://youtu.be/{video_id}",
                    "transcript": transcript,
                }
            )

    return results


async def collect_conversation_videos(name: str, max_videos: int = 3) -> list[dict[str, Any]]:
    """Collect interview/speech videos with transcripts for an entity name."""
    if not settings.youtube_api_key:
        logger.warning("YOUTUBE_API_KEY is missing; returning no conversation videos")
        return []

    queries = [f"{name} interview", f"{name} speech", f"{name} talk"]
    all_results: list[dict[str, Any]] = []

    for query in queries:
        query_results = await search_and_fetch_transcripts(query=query)
        logger.info("conversation query='%s' transcript_videos=%d", query, len(query_results))
        all_results.extend(query_results)

    deduped: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    for video in all_results:
        video_id = str(video.get("video_id", ""))
        if not video_id or video_id in seen_ids:
            continue
        seen_ids.add(video_id)
        deduped.append(video)
        if len(deduped) >= max_videos:
            break

    logger.info("conversation final_videos_with_transcripts=%d", len(deduped))
    return deduped