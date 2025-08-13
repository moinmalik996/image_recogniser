

from uuid import UUID
from datetime import datetime
from sqlmodel import Field, Relationship
from .base import BaseModel
from typing import TYPE_CHECKING, Optional
if TYPE_CHECKING:
    from .user import User

class Image(BaseModel, table=True):
    file_path: str = Field(nullable=False)
    user_id: UUID = Field(foreign_key="user.id", nullable=False)
    user: "User" = Relationship(back_populates="images")

# Pydantic-only model for API responses
class ImageRead(BaseModel):
    id: UUID
    created_at: datetime
    updated_at: datetime
    file_path: str
    user_id: UUID
    presigned_url: Optional[str] = None
