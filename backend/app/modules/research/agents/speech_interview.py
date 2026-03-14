import re
import asyncio
import httpx
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from youtube_transcript_api import YouTubeTranscriptApi
from app.config import settings
from app.modules.entity.utils import fetch_entity_data

HEADERS = {"User-Agent": "MimicAI/1.0"}


async def _safe_request(url: str, params: dict = None) -> dict:
    """Make HTTP request with error handling."""
    async with httpx.AsyncClient(verify=True, timeout=10.0) as client:
        response = await client.get(url, params=params, headers=HEADERS)
        response.raise_for_status()
        return response.json()


async def _get_name(qid: str) -> str:
    """Fetch entity name from Wikidata."""
    entity = await fetch_entity_data(qid)
    return entity["labels"]["en"]["value"]


async def _fetch_quotes(name: str) -> List[str]:
    """Fetch quotes from Wikiquote."""
    params = {
        "action": "parse",
        "format": "json",
        "page": name,
        "prop": "text",
    }
    try:
        # Add better headers to avoid 403
        async with httpx.AsyncClient(headers={
            "User-Agent": "MimicAI/1.0 (https://github.com/Bhavik2209/MimicAI; contact@example.com)",
            "Accept": "application/json",
        }, timeout=10.0) as client:
            response = await client.get(settings.wikiquote_api_url, params=params)
            if response.status_code == 403:
                print(f"  Wikiquote blocked (403) - skipping quotes")
                return []

            data = response.json()
            html = data.get("parse", {}).get("text", {}).get("*", "")
            quotes = re.findall(r"<li>(.*?)</li>", html)

            cleaned = []
            for q in quotes:
                text = re.sub("<.*?>", "", q).strip()
                if len(text.split()) >= 8:
                    cleaned.append(text)
            return cleaned[:30]
    except Exception as e:
        print(f"  Quotes fetch error (non-critical): {e}")
        return []  # Return empty list instead of failing


async def _search_youtube(query: str) -> List[str]:
    """Search YouTube for videos."""
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": 20,
        "key": settings.youtube_api_key,
    }
    try:
        data = await _safe_request(settings.youtube_search_url, params)
        return [
            item["id"]["videoId"]
            for item in data.get("items", [])
            if item.get("id", {}).get("videoId")
        ]
    except Exception as e:
        print(f"  YouTube search error: {e}")
        return []


def _parse_duration(duration: str) -> int:
    """Parse ISO 8601 duration string to seconds."""
    minutes = int(m.group(1)) if (m := re.search(r"(\d+)M", duration)) else 0
    seconds = int(s.group(1)) if (s := re.search(r"(\d+)S", duration)) else 0
    return minutes * 60 + seconds


async def _filter_videos_by_duration(video_ids: List[str]) -> List[str]:
    """Filter videos by duration (2-30 minutes)."""
    if not video_ids:
        return []

    unique_ids = list(dict.fromkeys(video_ids))
    params = {
        "part": "contentDetails",
        "id": ",".join(unique_ids),
        "key": settings.youtube_api_key,
    }
    try:
        data = await _safe_request(settings.youtube_video_url, params)
        filtered = []
        for item in data.get("items", []):
            duration_secs = _parse_duration(item["contentDetails"]["duration"])
            if 120 <= duration_secs <= 1800:
                filtered.append(item["id"])
        return filtered[:10]
    except Exception as e:
        print(f"  Duration filter error: {e}")
        return []


async def _fetch_transcript(video_id: str) -> Optional[str]:
    """Fetch transcript using youtube-transcript-api package."""
    def _sync_fetch() -> Optional[str]:
        api = YouTubeTranscriptApi()
        try:
            transcript = api.fetch(video_id, languages=["en", "en-US", "en-GB"])
            text = " ".join(snippet.text for snippet in transcript)
            return text if len(text) >= 200 else None
        except Exception:
            return None

    try:
        return await asyncio.to_thread(_sync_fetch)
    except Exception as e:
        print(f"  Transcript error for {video_id}: {e}")
        return None


async def speech_interview_agent(qid: str, db: AsyncSession) -> Dict[str, Any]:
    """
    Simple agent: fetch name, quotes, search YouTube, get transcripts.
    """
    name = await _get_name(qid)
    print(f"[speech] name={name}")

    # Get quotes (optional - if it fails, just continue)
    quotes = await _fetch_quotes(name)
    print(f"[speech] quotes={len(quotes)}")

    # Search YouTube
    video_ids = []
    for query in [f"{name} interview", f"{name} speech", f"{name} talk"]:
        ids = await _search_youtube(query)
        print(f"[speech] youtube '{query}' -> {len(ids)} results")
        video_ids.extend(ids)

    print(f"[speech] total video_ids={len(video_ids)}")

    # Filter by duration
    filtered_ids = await _filter_videos_by_duration(video_ids)
    print(f"[speech] after duration filter={len(filtered_ids)} ids: {filtered_ids}")

    # Get transcripts
    transcripts = []
    for vid in filtered_ids:
        transcript = await _fetch_transcript(vid)
        print(f"[speech] transcript for {vid}: {'ok' if transcript else 'None'}")
        if transcript:
            transcripts.append({
                "video_id": vid,
                "url": f"https://youtube.com/watch?v={vid}",
                "transcript": transcript,
            })
        if len(transcripts) >= 5:
            break

    return {
        "name": name,
        "quotes": quotes,
        "videos": transcripts,
    }
