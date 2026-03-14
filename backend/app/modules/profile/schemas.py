from pydantic import BaseModel
from typing import Optional, List

class NewsArticleOut(BaseModel):
    title: str
    source: Optional[str] = None
    published_at: Optional[str] = None
    url: Optional[str] = None
    snippet: Optional[str] = None

class SocialLink(BaseModel):
    handle: Optional[str] = None
    channel_id: Optional[str] = None
    url: str

class SocialMediaOut(BaseModel):
    twitter: List[SocialLink] = []
    instagram: List[SocialLink] = []
    facebook: List[SocialLink] = []
    youtube: List[SocialLink] = []
    linkedin: List[SocialLink] = []
    website: List[str] = []


class VideoTranscriptOut(BaseModel):
    video_id: str
    url: str
    transcript: str


class SpeechInterviewOut(BaseModel):
    name: str
    quotes: List[str] = []
    videos: List[VideoTranscriptOut] = []


class TimelineEventOut(BaseModel):
    type: str
    event: str
    start: str
    end: Optional[str] = None


class TimelineOut(BaseModel):
    name: str
    description: Optional[str] = None
    total_events: int
    timeline: List[TimelineEventOut] = []


class WikiSectionOut(BaseModel):
    section: str
    text: str


class WikiOut(BaseModel):
    entity_id: str
    wikipedia_title: str
    intro_summary: str
    sections: List[WikiSectionOut] = []
    reference_urls: List[str] = []
