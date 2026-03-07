from fastapi import APIRouter, Depends, HTTPException
from typing import List
from uuid import UUID
from .schemas import ProjectCreate, ProjectUpdate, ProjectOut
from .service import create_project, list_projects, get_project, delete_project, update_project
from app.dependencies import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=ProjectOut)
async def create_project_route(
    payload: ProjectCreate,
    db: AsyncSession = Depends(get_db)
):
    return await create_project(payload, db)


@router.get("", response_model=List[ProjectOut])
async def list_projects_route(
    db: AsyncSession = Depends(get_db)
):
    return await list_projects(db)


@router.get("/{project_id}", response_model=ProjectOut)
async def get_project_route(
    project_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    project = await get_project(project_id, db)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.patch("/{project_id}", response_model=ProjectOut)
async def update_project_route(
    project_id: UUID,
    payload: ProjectUpdate,
    db: AsyncSession = Depends(get_db)
):
    project = await update_project(project_id, payload, db)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.delete("/{project_id}")
async def delete_project_route(
    project_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    success = await delete_project(project_id, db)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"status": "success"}