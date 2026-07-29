from typing import AsyncGenerator
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.logging import logger

# Async Engine (Production API usage)
async_engine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=10,
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Sync Engine (Alembic / Migrations usage)
sync_engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
)

SyncSessionLocal = sessionmaker(
    bind=sync_engine,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency injection helper to yield an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as exc:
            await session.rollback()
            logger.error(f"Database session error: {exc}")
            raise
        finally:
            await session.close()
