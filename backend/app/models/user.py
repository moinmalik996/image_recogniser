from uuid import UUID


from sqlmodel import SQLModel, Field
from .base import BaseModel


class User(BaseModel, table=True):
    username: str = Field(index=True, nullable=False)
    email: str = Field(index=True, nullable=False, unique=True)
    hashed_password: str
    
    
class UserLogin(BaseModel):
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