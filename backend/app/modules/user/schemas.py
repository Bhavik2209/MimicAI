"""API schemas for user module routes."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class UserCreateRequest(BaseModel):
    """Input payload to create a user row."""

    id: UUID
    email: EmailStr
    created_at: datetime


class UserResponse(BaseModel):
    """User response payload."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    created_at: datetime