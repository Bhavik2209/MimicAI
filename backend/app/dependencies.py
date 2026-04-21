"""FastAPI dependency providers."""

from collections.abc import AsyncGenerator
from dataclasses import dataclass
from uuid import UUID

from fastapi import Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db.session import get_async_session


async def get_db() -> AsyncGenerator[AsyncSession, None]:
	"""Provide an async database session dependency."""
	async for session in get_async_session():
		yield session


@dataclass(frozen=True)
class AuthenticatedUser:
	"""User identity forwarded by the trusted frontend proxy."""

	user_id: UUID
	email: str


async def get_current_user(
	x_internal_api_key: str | None = Header(default=None),
	x_authenticated_user_id: str | None = Header(default=None),
	x_authenticated_user_email: str | None = Header(default=None),
) -> AuthenticatedUser:
	"""Return the authenticated user from trusted proxy headers."""
	if not settings.internal_api_key:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail="INTERNAL_API_KEY is not configured",
		)

	if x_internal_api_key != settings.internal_api_key:
		raise HTTPException(
			status_code=status.HTTP_403_FORBIDDEN,
			detail="Invalid internal API key",
		)

	if not x_authenticated_user_id or not x_authenticated_user_email:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Missing authenticated user headers",
		)

	try:
		user_id = UUID(x_authenticated_user_id)
	except ValueError as exc:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Invalid authenticated user id",
		) from exc

	return AuthenticatedUser(
		user_id=user_id,
		email=x_authenticated_user_email,
	)

