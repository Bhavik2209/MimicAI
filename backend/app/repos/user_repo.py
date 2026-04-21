"""Data access layer for user persistence."""

from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.user import User


async def get_user_by_id(db: AsyncSession, user_id: UUID) -> User | None:
	"""Return one user by id."""
	result = await db.execute(select(User).where(User.id == user_id))
	return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
	"""Return one user by email."""
	result = await db.execute(select(User).where(User.email == email))
	return result.scalar_one_or_none()


async def create_user(
	db: AsyncSession,
	user_id: UUID,
	email: str,
	created_at: datetime,
) -> User:
	"""Insert a user row and return the persisted record."""
	user = User(
		id=user_id,
		email=email,
		created_at=created_at,
	)
	db.add(user)
	await db.commit()
	await db.refresh(user)
	return user


async def update_user_email(
	db: AsyncSession,
	user: User,
	*,
	email: str,
) -> User:
	"""Update a user's email and return the refreshed record."""
	user.email = email
	await db.commit()
	await db.refresh(user)
	return user
