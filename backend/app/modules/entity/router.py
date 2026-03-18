"""HTTP routes for entity search."""

from fastapi import APIRouter

from .schemas import EntityCandidate, EntitySearchRequest
from .service import search_entities

router = APIRouter(prefix="/entity", tags=["entity"])


@router.post("/search")
async def entity_search_route(payload: EntitySearchRequest) -> list[EntityCandidate]:
	"""Search for human entity candidates on Wikidata."""
	return await search_entities(payload.name)

