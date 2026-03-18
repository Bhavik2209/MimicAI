"""FastAPI application entrypoint for backend API routes."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.modules.entity.router import router as entity_router
from app.modules.profile.router import router as profile_router

app = FastAPI(title="Mimic AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(entity_router)
app.include_router(profile_router)

