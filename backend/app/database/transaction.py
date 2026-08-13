"""Transaction Management Utilities & Atomic Execution Helpers.

Provides context managers and function decorators to handle explicit transaction boundaries,
nested transactions (savepoints), automatic commit, and failure rollbacks across service layers.
"""

import functools
from contextlib import asynccontextmanager, contextmanager
from typing import AsyncGenerator, Callable, Generator, TypeVar, Any
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from app.core.logging import logger
from app.database.connection import DatabaseConnectionError

F = TypeVar("F", bound=Callable[..., Any])


@asynccontextmanager
async def async_atomic(
    session: AsyncSession, nested: bool = False
) -> AsyncGenerator[AsyncSession, None]:
    """Async context manager ensuring atomic execution of database operations.

    Args:
        session (AsyncSession): Active asynchronous database session.
        nested (bool): If True, creates a SAVEPOINT transaction block allowing sub-transaction rollback.

    Usage:
        async with async_atomic(session):
            await session.add(user)
            await session.add(profile)
    """
    if nested:
        transaction = await session.begin_nested()
    else:
        # Check if transaction is already active on session
        transaction = None if session.in_transaction() else await session.begin()

    try:
        yield session
        if nested and transaction:
            await transaction.commit()
        elif not nested and session.in_transaction():
            await session.commit()
    except Exception as exc:
        if nested and transaction:
            await transaction.rollback()
        elif session.in_transaction():
            await session.rollback()
        logger.error(f"Atomic transaction block failed; rolled back. Error: {exc}")
        raise


@contextmanager
def sync_atomic(
    session: Session, nested: bool = False
) -> Generator[Session, None, None]:
    """Sync context manager ensuring atomic execution of database operations.

    Args:
        session (Session): Active synchronous database session.
        nested (bool): If True, creates a SAVEPOINT transaction block.

    Usage:
        with sync_atomic(session):
            session.add(user)
    """
    if nested:
        transaction = session.begin_nested()
    else:
        transaction = None if session.in_transaction() else session.begin()

    try:
        yield session
        if nested and transaction:
            transaction.commit()
        elif not nested and session.in_transaction():
            session.commit()
    except Exception as exc:
        if nested and transaction:
            transaction.rollback()
        elif session.in_transaction():
            session.rollback()
        logger.error(f"Sync atomic transaction block failed; rolled back. Error: {exc}")
        raise


def transactional(func: F) -> F:
    """Async decorator that wraps function execution inside an atomic database transaction.

    Automatically extracts an `AsyncSession` parameter named `session` or `db` from function args/kwargs.

    Usage:
        @transactional
        async def create_user_profile(user_data: dict, db: AsyncSession):
            ...
    """
    @functools.wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> Any:
        session: AsyncSession | None = kwargs.get("db") or kwargs.get("session")

        if not session:
            for arg in args:
                if isinstance(arg, AsyncSession):
                    session = arg
                    break

        if session:
            async with async_atomic(session):
                return await func(*args, **kwargs)
        else:
            logger.warning(
                f"@transactional decorator applied to {func.__name__}, "
                "but no AsyncSession was passed in args or kwargs."
            )
            return await func(*args, **kwargs)

    return wrapper  # type: ignore


def sync_transactional(func: F) -> F:
    """Sync decorator that wraps function execution inside an atomic database transaction.

    Usage:
        @sync_transactional
        def perform_admin_task(db: Session):
            ...
    """
    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        session: Session | None = kwargs.get("db") or kwargs.get("session")

        if not session:
            for arg in args:
                if isinstance(arg, Session):
                    session = arg
                    break

        if session:
            with sync_atomic(session):
                return func(*args, **kwargs)
        else:
            return func(*args, **kwargs)

    return wrapper  # type: ignore
