"""Async SQLAlchemy engine and session management."""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings

if not settings.database_url:
	raise ValueError("DATABASE_URL is not configured")

engine = create_async_engine(
	settings.database_url,
	future=True,
	echo=False,
	pool_pre_ping=True,
	pool_recycle=300,
	pool_use_lifo=True,
)

AsyncSessionLocal = async_sessionmaker(
	bind=engine,
	class_=AsyncSession,
	expire_on_commit=False,
	autoflush=False,
	autocommit=False,
)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
	"""Yield a database session for request-scoped usage."""
	async with AsyncSessionLocal() as session:
		yield session

