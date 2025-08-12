from uuid import UUID
from sqlmodel import Field, Relationship
from .base import BaseModel
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .user import User

class Image(BaseModel, table=True):
    file_path: str = Field(nullable=False)
    user_id: UUID = Field(foreign_key="user.id", nullable=False)
    user: "User" = Relationship(back_populates="images")
