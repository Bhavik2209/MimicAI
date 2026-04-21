"""Business logic for user module routes."""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.user import User
from app.modules.user.schemas import UserCreateRequest, UserResponse
from app.repos.user_repo import (
    create_user,
    get_user_by_email,
    get_user_by_id,
    update_user_email,
)


async def create_user_record(db: AsyncSession, payload: UserCreateRequest) -> UserResponse:
    """Create one user after unique id/email checks."""
    if await get_user_by_id(db, payload.id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User id already exists",
        )

    if await get_user_by_email(db, payload.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists",
        )

    user = await create_user(
        db=db,
        user_id=payload.id,
        email=str(payload.email),
        created_at=payload.created_at,
    )
    return UserResponse.model_validate(user)


async def sync_authenticated_user(
    db: AsyncSession,
    *,
    user_id: UUID,
    email: str,
) -> User:
    """Ensure the authenticated Neon user exists in public.users."""
    user = await get_user_by_id(db, user_id)
    if user is not None:
        if user.email != email:
            user = await update_user_email(db, user, email=email)
        return user

    existing_by_email = await get_user_by_email(db, email)
    if existing_by_email is not None and existing_by_email.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A different user already exists with this email",
        )

    return await create_user(
        db=db,
        user_id=user_id,
        email=email,
        created_at=datetime.now(timezone.utc),
    )
