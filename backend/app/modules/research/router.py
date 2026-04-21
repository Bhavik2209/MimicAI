"""HTTP routes for full entity research orchestration."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.modules.research.schemas import ResearchResponse
from app.modules.research.service import run_entity_research

router = APIRouter(prefix="/research", tags=["research"])


@router.get("/{entity_id}")
async def run_research_route(
	entity_id: str,
	db: Annotated[AsyncSession, Depends(get_db)],
) -> ResearchResponse:
	"""Run all acquisition + analysis agents for one entity."""
	return await run_entity_research(db=db, entity_id=entity_id)

