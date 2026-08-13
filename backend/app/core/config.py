import os
from typing import Any, List, Optional, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "GetWorxs Platform API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "getworxs_super_secret_jwt_key_change_in_production_environment_32bytes"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database Configuration (MySQL 8)
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_DATABASE: str = "getworxs_db"
    MYSQL_USERNAME: str = "root"
    MYSQL_PASSWORD: str = "root"
    
    # Aliases for backward compatibility
    @property
    def MYSQL_SERVER(self) -> str:
        return self.MYSQL_HOST

    @property
    def MYSQL_USER(self) -> str:
        return self.MYSQL_USERNAME

    @property
    def MYSQL_DB(self) -> str:
        return self.MYSQL_DATABASE

    # Database Connection URLs
    DATABASE_URL: str = ""
    ASYNC_DATABASE_URL: str = ""

    # Database Connection Pooling Settings
    DB_POOL_PRE_PING: bool = True
    DB_POOL_RECYCLE: int = 3600
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_ECHO: bool = False

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:5176",
        "http://127.0.0.1:5176",
    ]

    # JWT Authentication
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    # Onboarding / Temporary password settings (hours)
    # Configurable: recommended between 24 and 48
    TEMP_PASSWORD_EXPIRY_HOURS: int = 24

    # SMTP Email Dispatch Settings
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_TLS: bool = True
    EMAILS_FROM_EMAIL: str = "noreply@getworxs.com"
    EMAILS_FROM_NAME: str = "GetWorxs Platform"


    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    def model_post_init(self, __context: Any) -> None:
        """Construct connection URLs if not explicitly passed via environment."""
        if not self.DATABASE_URL:
            self.DATABASE_URL = f"mysql+pymysql://{self.MYSQL_USERNAME}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}"
        if not self.ASYNC_DATABASE_URL:
            self.ASYNC_DATABASE_URL = f"mysql+aiomysql://{self.MYSQL_USERNAME}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}"


settings = Settings()
