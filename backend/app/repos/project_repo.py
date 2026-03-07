import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.project import Project


async def create_project(
    user_id: uuid.UUID,
    title: str,
    description: str | None,
    db: AsyncSession,
    entity_id: uuid.UUID | None = None,
) -> Project:
    project = Project(
        id=uuid.uuid4(),
        user_id=user_id,
        title=title,
        description=description,
        entity_id=entity_id,
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


async def get_all_projects(user_id: uuid.UUID, db: AsyncSession) -> list[Project]:
    result = await db.execute(
        select(Project).where(Project.user_id == user_id).order_by(Project.created_at.desc())
    )
    return list(result.scalars().all())


async def get_project_by_id(project_id: uuid.UUID, db: AsyncSession) -> Project | None:
    result = await db.execute(select(Project).where(Project.id == project_id))
    return result.scalar_one_or_none()


async def delete_project(project_id: uuid.UUID, db: AsyncSession) -> bool:
    project = await get_project_by_id(project_id, db)
    if not project:
        return False
    await db.delete(project)
    await db.commit()
    return True


async def update_project_entity(
    project_id: uuid.UUID, entity_id: uuid.UUID, db: AsyncSession
) -> Project | None:
    project = await get_project_by_id(project_id, db)
    if not project:
        return None
    project.entity_id = entity_id
    await db.commit()
    await db.refresh(project)
    return project


async def update_project(
    project_id: uuid.UUID,
    db: AsyncSession,
    title: str | None = None,
    description: str | None = None,
) -> Project | None:
    project = await get_project_by_id(project_id, db)
    if not project:
        return None
    if title is not None:
        project.title = title
    if description is not None:
        project.description = description
    await db.commit()
    await db.refresh(project)
    return project
