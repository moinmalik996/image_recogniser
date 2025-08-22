from enum import Enum
from uuid import UUID
from datetime import datetime
from sqlmodel import Field, Relationship
from .base import BaseModel
from typing import TYPE_CHECKING, Optional
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Column

if TYPE_CHECKING:
    from .user import User

class JobAnalysisStatus(str, Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    DONE = "done"
    FAILED = "failed"

class Image(BaseModel, table=True):
    file_path: str = Field(nullable=False)
    user_id: UUID = Field(foreign_key="user.id", nullable=False)
    user: "User" = Relationship(back_populates="images")
    analysis: "ImageAnalysis" = Relationship(back_populates="image")

# Pydantic-only model for API responses
class ImageRead(BaseModel):
    id: UUID
    created_at: datetime
    updated_at: datetime
    file_path: str
    user_id: UUID
    presigned_url: Optional[str] = None


class ImageAnalysis(BaseModel, table=True):
    image_id: UUID = Field(foreign_key="image.id", unique=True, nullable=False)
    image: "Image" = Relationship(back_populates="analysis")
    s3_key: str = Field(nullable=False)
    status: JobAnalysisStatus = Field(default=JobAnalysisStatus.UPLOADED)
    results: Optional[dict] = Field(
        default=None,
        sa_column=Column(JSONB)
    )
