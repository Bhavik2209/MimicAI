import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.project.schemas import ProjectCreate, ProjectUpdate, ProjectOut, EntityInfo
from app.repos import project_repo, entity_repo, research_profile_repo


async def create_project(
    payload: ProjectCreate,
    db: AsyncSession,
    user_id: uuid.UUID | None = None,
) -> ProjectOut:
    # Temporary: use a fixed user_id until auth is wired
    _user_id = user_id or uuid.UUID("00000000-0000-0000-0000-000000000001")
    project = await project_repo.create_project(
        user_id=_user_id,
        title=payload.title,
        description=payload.description,
        db=db,
    )
    return _to_out(project, entity=None, profile=None)


async def list_projects(db: AsyncSession, user_id: uuid.UUID | None = None) -> list[ProjectOut]:
    _user_id = user_id or uuid.UUID("00000000-0000-0000-0000-000000000001")
    projects = await project_repo.get_all_projects(_user_id, db)
    result = []
    for p in projects:
        entity = await entity_repo.get_entity_by_id(p.entity_id, db) if p.entity_id else None
        profile = (
            await research_profile_repo.get_profile(p.entity_id, db) if p.entity_id else None
        )
        result.append(_to_out(p, entity, profile))
    return result


async def get_project(project_id: uuid.UUID, db: AsyncSession) -> ProjectOut | None:
    project = await project_repo.get_project_by_id(project_id, db)
    if not project:
        return None
    entity = await entity_repo.get_entity_by_id(project.entity_id, db) if project.entity_id else None
    profile = (
        await research_profile_repo.get_profile(project.entity_id, db)
        if project.entity_id
        else None
    )
    return _to_out(project, entity, profile)


async def delete_project(project_id: uuid.UUID, db: AsyncSession) -> bool:
    return await project_repo.delete_project(project_id, db)


async def update_project(
    project_id: uuid.UUID, payload: ProjectUpdate, db: AsyncSession
) -> ProjectOut | None:
    project = await project_repo.update_project(
        project_id, db, title=payload.title, description=payload.description
    )
    if not project:
        return None
    entity = await entity_repo.get_entity_by_id(project.entity_id, db) if project.entity_id else None
    profile = (
        await research_profile_repo.get_profile(project.entity_id, db)
        if project.entity_id
        else None
    )
    return _to_out(project, entity, profile)


# ── helpers ──────────────────────────────────────────────────────────────────

def _to_out(project, entity, profile) -> ProjectOut:
    entity_info = None
    if entity:
        entity_info = EntityInfo(
            id=entity.id,
            name=entity.name,
            image_url=entity.image_url,
            wikidata_id=entity.wikidata_id,
        )
    return ProjectOut(
        id=project.id,
        title=project.title,
        description=project.description,
        entity=entity_info,
        research_status=profile.status if profile else None,
        research_progress=profile.progress if profile else None,
        created_at=project.created_at,
        updated_at=project.updated_at,
    )