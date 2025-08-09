from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: Optional[str]  = "My FastAPI Project"
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_HOST: Optional[str] = "localhost"
    DB_PORT: Optional[int] = 5432
    DB_NAME: Optional[str] = None
    
    SECRET_KEY: Optional[str]
    JWT_ALGORITHM: Optional[str]
    ACCESS_TOKEN_EXPIRE_MINUTES: Optional[int]

    
    @property
    def DATABASE_URL(self) -> str:
        if not all([self.DB_USER, self.DB_PASSWORD, self.DB_NAME]):
            raise ValueError("Database credentials are not properly set")
        return (
            f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )
        
    class Config:
        env_file = ".env"
        
@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()