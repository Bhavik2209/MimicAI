from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from .schemas import NewsArticleOut, SocialMediaOut, SpeechInterviewOut, TimelineOut, WikiOut
from app.modules.research.agents.news import news_agent
from app.modules.research.agents.social_media import social_media_agent
from app.modules.research.agents.speech_interview import speech_interview_agent
from app.modules.research.agents.timeline import timeline_agent
from app.modules.research.agents.wiki import wiki_agent
from app.dependencies import get_db
from app.repos import entity_repo, research_source_repo

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("/{entity_name}/news", response_model=List[NewsArticleOut])
async def get_entity_news(entity_name: str):
    """
    Fetch relevant news articles for a given entity name using the News Agent.
    """
    if not entity_name:
        raise HTTPException(status_code=400, detail="Entity name is required.")
        
    try:
        articles = await news_agent(name=entity_name)
        return articles
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch news: {str(e)}")


@router.get("/{entity_id}/socials", response_model=SocialMediaOut)
async def get_entity_socials(entity_id: str):
    """
    Extract social media handles and links for a given Wikidata entity ID.
    """
    if not entity_id:
        raise HTTPException(status_code=400, detail="Entity ID (Wikidata QID) is required.")
        
    try:
        socials = await social_media_agent(qid=entity_id)
        return socials
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch social media profiles: {str(e)}")


@router.get("/{entity_id}/speech", response_model=SpeechInterviewOut)
async def get_entity_speech(entity_id: str, db: AsyncSession = Depends(get_db)):
    """
    Fetch speeches and interview transcripts for a given Wikidata entity ID.
    If entity doesn't exist, creates it from Wikidata data.
    Saves all data to the database and returns it.
    """
    if not entity_id:
        raise HTTPException(status_code=400, detail="Entity ID (Wikidata QID) is required.")

    try:
        data = await speech_interview_agent(qid=entity_id, db=db)

        entity = await entity_repo.get_entity_by_wikidata_id(entity_id, db)
        if entity:
            for video in data.get("videos", []):
                await research_source_repo.save_source(
                    entity.id, "youtube", video["url"], db, title=video.get("video_id")
                )
            name = data.get("name", "")
            if name:
                wikiquote_url = f"https://en.wikiquote.org/wiki/{name.replace(' ', '_')}"
                await research_source_repo.save_source(
                    entity.id, "wikiquote", wikiquote_url, db, title=name
                )

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch speech/interview data: {str(e)}")


@router.get("/{entity_id}/timeline", response_model=TimelineOut)
async def get_entity_timeline(entity_id: str, db: AsyncSession = Depends(get_db)):
    """
    Extract historical timeline events for a given Wikidata entity ID.
    """
    if not entity_id:
        raise HTTPException(status_code=400, detail="Entity ID (Wikidata QID) is required.")

    try:
        data = await timeline_agent(qid=entity_id, db=db)

        entity = await entity_repo.get_entity_by_wikidata_id(entity_id, db)
        if entity:
            wikidata_url = f"https://www.wikidata.org/wiki/{entity_id}"
            await research_source_repo.save_source(
                entity.id, "wikidata", wikidata_url, db, title=data.get("name")
            )

        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch timeline data: {str(e)}")


@router.get("/{entity_id}/wiki", response_model=WikiOut)
async def get_entity_wiki(entity_id: str, db: AsyncSession = Depends(get_db)):
    """
    Fetch Wikipedia content for a given Wikidata entity ID.
    Returns intro summary and full sections.
    """
    if not entity_id:
        raise HTTPException(status_code=400, detail="Entity ID (Wikidata QID) is required.")

    try:
        data = await wiki_agent(qid=entity_id)

        entity = await entity_repo.get_entity_by_wikidata_id(entity_id, db)
        if entity:
            title = data.get("wikipedia_title", "")
            if title:
                wiki_url = f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}"
                await research_source_repo.save_source(
                    entity.id, "wikipedia", wiki_url, db, title=title
                )

        return data
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch Wikipedia data: {str(e)}")
