"""HTTP routes for project module endpoints."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import AuthenticatedUser, get_current_user, get_db
from app.modules.project.schemas import (
	ProjectCreateRequest,
	ProjectDeleteResponse,
	ProjectResponse,
	ProjectUpdateRequest,
)
from app.modules.project.service import (
	create_user_project,
	delete_user_project,
	get_user_projects,
	update_user_project,
)

router = APIRouter(prefix="/project", tags=["project"])


@router.post("/create")
async def create_project_route(
	payload: ProjectCreateRequest,
	db: Annotated[AsyncSession, Depends(get_db)],
	current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
) -> ProjectResponse:
	"""Create a new project for one user."""
	return await create_user_project(db=db, current_user=current_user, payload=payload)


@router.get("")
async def list_projects_route(
	db: Annotated[AsyncSession, Depends(get_db)],
	current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
) -> list[ProjectResponse]:
	"""List all projects for one user."""
	return await get_user_projects(db=db, current_user=current_user)


@router.patch("/{project_id}")
async def update_project_route(
	project_id: UUID,
	payload: ProjectUpdateRequest,
	db: Annotated[AsyncSession, Depends(get_db)],
	current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
) -> ProjectResponse:
	"""Update one project by project id."""
	return await update_user_project(
		db=db,
		project_id=project_id,
		payload=payload,
		current_user=current_user,
	)


@router.delete("/{project_id}")
async def delete_project_route(
	project_id: UUID,
	db: Annotated[AsyncSession, Depends(get_db)],
	current_user: Annotated[AuthenticatedUser, Depends(get_current_user)],
) -> ProjectDeleteResponse:
	"""Delete one user project by project id."""
	return await delete_user_project(
		db=db,
		user_id=current_user.user_id,
		project_id=project_id,
	)
