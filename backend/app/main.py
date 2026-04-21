"""FastAPI application entrypoint for backend API routes."""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.base import Base
from app.db.qdrant import close_qdrant, get_qdrant_client, init_qdrant
from app.db.session import engine
import app.db.models  # noqa: F401
from app.modules.chat.router import router as chat_router
from app.modules.entity.router import router as entity_router
from app.modules.profile.router import router as profile_router
from app.modules.project.router import router as project_router
from app.modules.research.router import router as research_router
from app.modules.user.router import router as user_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

app = FastAPI(title="Mimic AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(entity_router)
app.include_router(profile_router)
app.include_router(project_router)
app.include_router(research_router)
app.include_router(user_router)


@app.on_event("startup")
async def startup_event() -> None:
    """Initialize external clients on service startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    try:
        init_qdrant()
    except Exception as exc:
        logging.getLogger(__name__).warning("Qdrant init skipped: %s", exc)


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Close external clients on service shutdown."""
    close_qdrant()
    await engine.dispose()


@app.get("/health/qdrant")
async def qdrant_health() -> dict[str, str]:
    """Health check endpoint for Qdrant connectivity."""
    try:
        get_qdrant_client().get_collections()
        return {"status": "ok", "qdrant": "connected"}
    except Exception as exc:
        return {"status": "error", "qdrant": str(exc)}

