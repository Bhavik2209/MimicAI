from fastapi import APIRouter, Depends
from typing import List
from .schemas import (
    EntitySearchRequest, 
    EntityCandidate, 
    EntityConfirmRequest,
    EntityConfirmResponse
)
from .service import search_entities, resolve_entity_identity
from app.dependencies import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/entities", tags=["entities"])


@router.post("/search", response_model=List[EntityCandidate])
async def entity_search_route(payload: EntitySearchRequest):
    """
    Search for humans on Wikidata.
    Returns at most 3 candidates.
    """
    candidates = await search_entities(payload.name)
    return candidates


@router.post("/confirm", response_model=EntityConfirmResponse)
async def entity_confirm_route(payload: EntityConfirmRequest):
    """
    Get detailed identity information for a specific Wikidata QID.
    Typically called after the user selects a candidate from search.
    """
    return await resolve_entity_identity(payload.wikidata_id)


