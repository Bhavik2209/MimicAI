"""FastAPI application entrypoint for backend API routes."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.modules.entity.router import router as entity_router

app = FastAPI(title="Mimic AI Backend")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(entity_router)


@app.get("/health")
async def health_check() -> dict[str, str]:
	"""Liveness endpoint for API health checks."""
	return {"status": "ok"}

