"""HTTP routes for user module endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.modules.user.schemas import UserCreateRequest, UserResponse
from app.modules.user.service import create_user_record

router = APIRouter(prefix="/user", tags=["user"])


@router.post("/create")
async def create_user_route(
    payload: UserCreateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserResponse:
    """Create a new user row in users table."""
    return await create_user_record(db=db, payload=payload)