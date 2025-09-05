from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Security
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    # Read from env var DATABASE_URL when provided; default to local SQLite for dev
    DATABASE_URL: str = "sqlite:///./finesse.db"
    
    # AI
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: Optional[str] = "gemini-1.5-flash"

    model_config = SettingsConfigDict(env_file=".env", extra='ignore')

settings = Settings()