from contextlib import asynccontextmanager, contextmanager
from typing import AsyncGenerator, Generator
from sqlalchemy.exc import DBAPIError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from sqlalchemy.orm import Session, sessionmaker

from app.core.logging import logger
from app.database.connection import (
    DatabaseConnectionError,
    DatabaseUnavailableError,
    async_engine,
    engine,
)

# Synchronous session factory (for migrations, seeders, sync routines)
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)

# Asynchronous session factory (for FastAPI endpoints & async service handlers)
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI Dependency Injection generator yielding an AsyncSession.

    Flow:
    1. Creates a isolated AsyncSession from AsyncSessionLocal factory.
    2. Yields session to FastAPI route handler / dependency tree.
    3. On successful request execution, automatically commits transaction.
    4. On error, logs error and triggers automatic transaction rollback.
    5. In all cases (finally block), guarantees session cleanup and closure.

    Usage:
        @app.get("/users")
        async def read_users(db: AsyncSession = Depends(get_db)):
            ...
    """
    session: AsyncSession = AsyncSessionLocal()
    try:
        yield session
        await session.commit()
    except (SQLAlchemyError, DBAPIError) as exc:
        await session.rollback()
        logger.error(f"Database session transaction failed; rolled back. Cause: {exc}")
        raise DatabaseConnectionError(f"Database operation failed: {exc}") from exc
    except Exception as exc:
        await session.rollback()
        logger.error(f"Unhandled exception during DB session lifecycle; rolled back. Cause: {exc}")
        raise
    finally:
        await session.close()


def get_sync_db() -> Generator[Session, None, None]:
    """FastAPI Dependency Injection generator yielding a synchronous Session.

    Usage:
        @app.get("/sync-endpoint")
        def sync_endpoint(db: Session = Depends(get_sync_db)):
            ...
    """
    session: Session = SessionLocal()
    try:
        yield session
        session.commit()
    except (SQLAlchemyError, DBAPIError) as exc:
        session.rollback()
        logger.error(f"Sync DB session transaction failed; rolled back. Cause: {exc}")
        raise DatabaseConnectionError(f"Sync database operation failed: {exc}") from exc
    except Exception as exc:
        session.rollback()
        logger.error(f"Unhandled exception during sync DB session lifecycle; rolled back. Cause: {exc}")
        raise
    finally:
        session.close()


@asynccontextmanager
async def get_async_db_context() -> AsyncGenerator[AsyncSession, None]:
    """Context manager for standalone async background tasks, CLI scripts, and seeders.

    Usage:
        async with get_async_db_context() as db:
            result = await db.execute(...)
    """
    session: AsyncSession = AsyncSessionLocal()
    try:
        yield session
        await session.commit()
    except Exception as exc:
        await session.rollback()
        logger.error(f"Async DB context transaction failed; rolled back. Cause: {exc}")
        raise
    finally:
        await session.close()


@contextmanager
def get_sync_db_context() -> Generator[Session, None, None]:
    """Context manager for standalone synchronous CLI tasks and migration helpers.

    Usage:
        with get_sync_db_context() as db:
            db.execute(...)
    """
    session: Session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception as exc:
        session.rollback()
        logger.error(f"Sync DB context transaction failed; rolled back. Cause: {exc}")
        raise
    finally:
        session.close()
