from typing import Tuple
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlalchemy.exc import SQLAlchemyError, OperationalError, DatabaseError

from app.core.config import settings
from app.core.logging import logger


class DatabaseConnectionError(Exception):
    """Custom exception raised when database engine connection fails."""
    pass


class DatabaseUnavailableError(DatabaseConnectionError):
    """Custom exception raised when database engine cannot be reached."""
    pass


# Production-ready Sync SQLAlchemy Engine (used by Alembic migrations, admin tasks, scripts)
engine: Engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=settings.DB_POOL_PRE_PING,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    echo=settings.DB_ECHO,
    future=True,
)

# Production-ready Async SQLAlchemy Engine (used by FastAPI async request handlers)
async_engine: AsyncEngine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    pool_pre_ping=settings.DB_POOL_PRE_PING,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    echo=settings.DB_ECHO,
    future=True,
)


def check_sync_connection() -> bool:
    """Verify synchronous MySQL database connectivity with a lightweight ping query.

    Returns:
        bool: True if database responds cleanly.

    Raises:
        DatabaseUnavailableError: If connection times out or fails to connect.
    """
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            return result.scalar() == 1
    except OperationalError as exc:
        logger.error(f"Sync database connection unavailable: {exc}")
        raise DatabaseUnavailableError(f"Database unavailable at {settings.MYSQL_HOST}:{settings.MYSQL_PORT}") from exc
    except SQLAlchemyError as exc:
        logger.error(f"Sync database operational error: {exc}")
        raise DatabaseConnectionError(f"Database connection failure: {exc}") from exc


async def check_async_connection() -> bool:
    """Verify asynchronous MySQL database connectivity with a lightweight ping query.

    Returns:
        bool: True if async database responds cleanly.

    Raises:
        DatabaseUnavailableError: If connection times out or fails to connect.
    """
    try:
        async with async_engine.connect() as connection:
            result = await connection.execute(text("SELECT 1"))
            return result.scalar() == 1
    except OperationalError as exc:
        logger.error(f"Async database connection unavailable: {exc}")
        raise DatabaseUnavailableError(f"Database unavailable at {settings.MYSQL_HOST}:{settings.MYSQL_PORT}") from exc
    except SQLAlchemyError as exc:
        logger.error(f"Async database operational error: {exc}")
        raise DatabaseConnectionError(f"Async database connection failure: {exc}") from exc


async def dispose_engines() -> None:
    """Safely dispose of connection pools upon application shutdown."""
    logger.info("Disposing synchronous and asynchronous database engines...")
    engine.dispose()
    await async_engine.dispose()
    logger.info("Database engine pools disposed successfully.")
