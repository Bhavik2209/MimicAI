"""Data access layer for project persistence."""

from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models.memory import ChatSession
from app.db.models.project import Project


async def create_project(
	db: AsyncSession,
	user_id: UUID,
	title: str,
	description: str | None,
	entity_id: UUID | None,
) -> Project:
	"""Insert a project row and return the persisted record.
	
	If a project already exists for this user+entity, returns the existing project instead.
	"""
	project = Project(
		user_id=user_id,
		title=title,
		description=description,
		entity_id=entity_id,
	)
	db.add(project)
	try:
		await db.commit()
		result = await db.execute(
			select(Project)
			.options(selectinload(Project.entity))
			.where(Project.id == project.id)
		)
		return result.scalar_one()
	except IntegrityError:
		# Duplicate user+entity: another concurrent request created the same project.
		await db.rollback()
		result = await db.execute(
			select(Project)
			.options(selectinload(Project.entity))
			.where(Project.user_id == user_id, Project.entity_id == entity_id)
		)
		existing = result.scalar_one_or_none()
		if existing is None:
			raise
		return existing


async def list_projects_by_user(db: AsyncSession, user_id: UUID) -> list[Project]:
	"""Return all projects owned by a user, newest first."""
	result = await db.execute(
		select(Project)
		.options(selectinload(Project.entity))
		.where(Project.user_id == user_id)
		.order_by(Project.created_at.desc())
	)
	return list(result.scalars().all())


async def get_project_by_user_and_id(
	db: AsyncSession,
	user_id: UUID,
	project_id: UUID,
) -> Project | None:
	"""Return one project if it belongs to the provided user."""
	result = await db.execute(
		select(Project).where(
			Project.id == project_id,
			Project.user_id == user_id,
		)
	)
	return result.scalar_one_or_none()


async def update_project(
	project: Project,
	db: AsyncSession,
	*,
	title: str,
	description: str | None,
) -> Project:
	"""Update one project row and return the refreshed record."""
	project.title = title
	project.description = description
	await db.commit()
	result = await db.execute(
		select(Project)
		.options(selectinload(Project.entity))
		.where(Project.id == project.id)
	)
	return result.scalar_one()


async def delete_project(project: Project, db: AsyncSession) -> None:
	"""Delete a project row."""
	await db.execute(delete(ChatSession).where(ChatSession.project_id == project.id))
	await db.delete(project)
	await db.commit()
