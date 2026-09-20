import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: str = "*"
    FRONTEND_URL: str = ""
    AWS_APP_RUNNER_URL: str = ""
    JWT_SECRET: str = "cognitrace_super_secret_jwt_key_2026"
    
    # Whisper configuration
    WHISPER_MODEL_SIZE: str = "tiny"
    WHISPER_DEVICE: str = "cpu"
    WHISPER_COMPUTE_TYPE: str = "int8"
    WHISPER_MODEL_DIR: str = "/opt/models/whisper"
    HF_HUB_OFFLINE: bool = False

    # Database & Redis Settings
    POSTGRES_URI: str = "postgresql://postgres:postgres@localhost:5432/cognitrace"
    POSTGRES_MAX_POOL: int = 20
    REDIS_URL: str = "redis://localhost:6379/0"

    # Storage Adapter & AWS DynamoDB Settings (loaded dynamically from .env)
    STORAGE_PROVIDER: str = "local"
    S3_BUCKET_NAME: str = "cognitrace-audio-uploads"
    AWS_REGION: str = "us-east-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    DYNAMODB_TABLE_NAME: str = "CogniTrace"
    LOCAL_STORAGE_DIR: str = "data/uploads"

    # Gemini AI Settings
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> list[str]:
        origins = []
        if self.CORS_ORIGINS and self.CORS_ORIGINS != "*":
            origins.extend([o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()])
        if self.FRONTEND_URL:
            origins.append(self.FRONTEND_URL.strip())
        if self.AWS_APP_RUNNER_URL:
            origins.append(self.AWS_APP_RUNNER_URL.strip())
        
        if not origins:
            return ["*"]
        return list(set(origins))


settings = Settings()
