import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartPrep API (FastAPI)"
    DEBUG: bool = True
    SECRET_KEY: str = "django-insecure-change-this-in-production"
    ALLOWED_HOSTS: str = "*"
    
    # Database URL
    DATABASE_URL: str = ""

    # JWT Settings
    JWT_SECRET_KEY: str = "django-insecure-change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_LIFETIME_MINUTES: int = 60
    JWT_REFRESH_TOKEN_LIFETIME_DAYS: int = 7

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    # AI API Keys
    NVIDIA_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    QDRANT_API_KEY: str = ""
    QDRANT_URL: str = ""

    model_config = SettingsConfigDict(
        env_file=ENV_FILE if ENV_FILE.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
