import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.config import settings
from app.db.base import Base
from app.db.session import engine
from app.db.qdrant import init_qdrant, close_qdrant, get_qdrant_client
import app.db.models  # noqa: F401 — registers all models with Base.metadata
from app.modules.project.router import router as project_router
from app.modules.entity.router import router as entity_router
from app.modules.profile.router import router as profile_router
from app.db.session import AsyncSessionLocal


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup if they do not exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Initialize Qdrant client
    init_qdrant()
    yield
    close_qdrant()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(project_router)
app.include_router(entity_router)
app.include_router(profile_router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.get("/health/db")
async def db_health_check():
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": str(e)}


@app.get("/health/qdrant")
async def qdrant_health_check():
    try:
        client = get_qdrant_client()
        result = await asyncio.to_thread(client.get_collections)
        return {"status": "ok", "qdrant": "connected", "collections": len(result.collections)}
    except Exception as e:
        return {"status": "error", "qdrant": str(e)}

