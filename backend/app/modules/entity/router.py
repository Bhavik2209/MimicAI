"""HTTP routes for entity search."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db

from .schemas import EntityCandidate, EntityCreateRequest, EntityCreateResponse, EntitySearchRequest
from .service import create_entity_record, search_entities

router = APIRouter(prefix="/entity", tags=["entity"])


@router.post("/search")
async def entity_search_route(payload: EntitySearchRequest) -> list[EntityCandidate]:
	"""Search for human entity candidates on Wikidata."""
	return await search_entities(payload.name)


@router.post("/{entity_id}/create")
async def create_entity_route(
	entity_id: str,
	payload: EntityCreateRequest,
	db: Annotated[AsyncSession, Depends(get_db)],
) -> EntityCreateResponse:
	"""Create one entity row in entities table."""
	return await create_entity_record(db=db, entity_id=entity_id, payload=payload)

