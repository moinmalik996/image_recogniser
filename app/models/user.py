from uuid import UUID
from typing import TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from .base import BaseModel


if TYPE_CHECKING:
    from .image import Image

class User(BaseModel, table=True):
    username: str = Field(index=True, nullable=False)
    email: str = Field(index=True, nullable=False, unique=True)
    hashed_password: str
    images: list["Image"] = Relationship(back_populates="user")
    
    
class UserLogin(SQLModel):
    email: str
    password: str
    
    
class UserCreate(SQLModel):
    email: str
    password: str
    username: str | None = None

class UserRead(SQLModel):
    id: UUID
    email: str
    username: str | None = None
    
class Token(SQLModel):
    access_token: str
    token_type: str