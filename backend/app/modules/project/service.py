"""Business logic for project module routes."""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.entity import Entity
from app.dependencies import AuthenticatedUser
from app.modules.project.schemas import (
	ProjectCreateRequest,
	ProjectDeleteResponse,
	ProjectResponse,
	ProjectUpdateRequest,
)
from app.modules.user.service import sync_authenticated_user
from app.repos.project_repo import (
	create_project,
	delete_project,
	get_project_by_user_and_id,
	list_projects_by_user,
	update_project,
)


def _to_project_response(project) -> ProjectResponse:
	"""Map ORM project row to API response including related entity details."""
	entity = getattr(project, "entity", None)
	return ProjectResponse.model_validate(
		{
			"id": project.id,
			"user_id": project.user_id,
			"title": project.title,
			"description": project.description,
			"entity_id": project.entity_id,
			"entity_name": entity.name if entity else None,
			"entity_image_url": entity.image_url if entity else None,
			"entity_wikidata_id": entity.wikidata_id if entity else None,
			"created_at": project.created_at,
			"updated_at": project.updated_at,
		}
	)


async def _ensure_entity_exists(db: AsyncSession, entity_id: UUID) -> None:
	"""Raise 404 if the entity does not exist."""
	entity = await db.get(Entity, entity_id)
	if entity is None:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Entity not found",
		)


async def _safe_rollback(db: AsyncSession) -> None:
	"""Rollback the current transaction after a recoverable DB failure."""
	try:
		await db.rollback()
	except Exception:
		pass


async def _resolve_entity_id(db: AsyncSession, entity_ref: str | None) -> UUID | None:
	"""Resolve entity reference from UUID string or Wikidata id."""
	if entity_ref is None:
		return None

	value = entity_ref.strip()
	if not value:
		return None

	try:
		entity_uuid = UUID(value)
		await _ensure_entity_exists(db, entity_uuid)
		return entity_uuid
	except ValueError:
		pass

	try:
		result = await db.execute(select(Entity).where(Entity.wikidata_id == value))
		entity = result.scalar_one_or_none()
	except SQLAlchemyError as exc:
		await _safe_rollback(db)
		raise HTTPException(
			status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
			detail="Entity lookup is temporarily unavailable. Please try again.",
		) from exc
	if entity is None:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Entity not found",
		)
	return entity.id


async def create_user_project(
	db: AsyncSession,
	current_user: AuthenticatedUser,
	payload: ProjectCreateRequest,
) -> ProjectResponse:
	"""Create one project for a user after validation checks."""
	await sync_authenticated_user(
		db=db,
		user_id=current_user.user_id,
		email=current_user.email,
	)
	resolved_entity_id = await _resolve_entity_id(db, payload.entity_id)

	project = await create_project(
		db=db,
		user_id=current_user.user_id,
		title=payload.title,
		description=payload.description,
		entity_id=resolved_entity_id,
	)
	return _to_project_response(project)


async def get_user_projects(
	db: AsyncSession,
	current_user: AuthenticatedUser,
) -> list[ProjectResponse]:
	"""List all projects for a user."""
	await sync_authenticated_user(
		db=db,
		user_id=current_user.user_id,
		email=current_user.email,
	)
	projects = await list_projects_by_user(db, current_user.user_id)
	return [_to_project_response(project) for project in projects]


async def delete_user_project(
	db: AsyncSession,
	user_id: UUID,
	project_id: UUID,
) -> ProjectDeleteResponse:
	"""Delete one project owned by a user."""
	project = await get_project_by_user_and_id(
		db=db,
		user_id=user_id,
		project_id=project_id,
	)
	if project is None:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Project not found for this user",
		)

	await delete_project(project, db)
	return ProjectDeleteResponse(project_id=project_id)


async def update_user_project(
	db: AsyncSession,
	project_id: UUID,
	payload: ProjectUpdateRequest,
	current_user: AuthenticatedUser,
) -> ProjectResponse:
	"""Update one project owned by a user."""
	await sync_authenticated_user(
		db=db,
		user_id=current_user.user_id,
		email=current_user.email,
	)

	project = await get_project_by_user_and_id(
		db=db,
		user_id=current_user.user_id,
		project_id=project_id,
	)
	if project is None:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Project not found for this user",
		)

	updated_project = await update_project(
		project,
		db,
		title=payload.title,
		description=payload.description,
	)
	return _to_project_response(updated_project)
