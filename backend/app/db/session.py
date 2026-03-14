from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.config import settings

# PgBouncer (Supabase connection pooler) compatibility:
# - Disable prepared statement caching (PgBouncer doesn't handle it well)
engine = create_async_engine(
    settings.database_url,
    echo=False,
    future=True,
    execution_options={
        "compiled_cache": None,  # Disable prepared statement cache
    }
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)
