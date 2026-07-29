import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "GetWorxs Platform API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "getworxs_super_secret_jwt_key_change_in_production_environment_32bytes"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database Configuration (MySQL 8)
    MYSQL_SERVER: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = "password"
    MYSQL_DB: str = "getworxs_db"
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/getworxs_db"
    ASYNC_DATABASE_URL: str = "mysql+aiomysql://root:password@localhost:3306/getworxs_db"

    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    # JWT Authentication
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
