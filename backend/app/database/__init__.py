"""GetWorxs Enterprise Database Architecture Package.

Provides centralized access to Declarative Base, database connection engine instances,
session management dependencies, health probes, transaction managers,
Alembic migration utilities, and database seeder.
"""

from app.database.base import Base, discover_models
from app.database.connection import (
    DatabaseConnectionError,
    DatabaseUnavailableError,
    async_engine,
    check_async_connection,
    check_sync_connection,
    dispose_engines,
    engine,
)
from app.database.health import (
    DatabaseHealthStatus,
    check_database_health,
    check_sync_database_health,
)
from app.database.session import (
    AsyncSessionLocal,
    SessionLocal,
    get_async_db_context,
    get_db,
    get_sync_db,
    get_sync_db_context,
)
from app.database.transaction import (
    async_atomic,
    sync_atomic,
    sync_transactional,
    transactional,
)
from app.database.migrations import (
    generate_migration,
    get_current_revision,
    run_migrations,
)
def seed_database():
    from app.database.seed import seed_database as _seed_database
    return _seed_database()


__all__ = [
    # Base Declarative Model & Utilities
    "Base",
    "discover_models",
    # Connection Engines & Diagnostics
    "engine",
    "async_engine",
    "check_sync_connection",
    "check_async_connection",
    "dispose_engines",
    "DatabaseConnectionError",
    "DatabaseUnavailableError",
    # Health Diagnostics
    "check_database_health",
    "check_sync_database_health",
    "DatabaseHealthStatus",
    # Session Management & FastAPI Dependency Injection
    "SessionLocal",
    "AsyncSessionLocal",
    "get_db",
    "get_sync_db",
    "get_async_db_context",
    "get_sync_db_context",
    # Transaction Management & Atomic Helpers
    "async_atomic",
    "sync_atomic",
    "transactional",
    "sync_transactional",
    # Migrations
    "run_migrations",
    "get_current_revision",
    "generate_migration",
    # Seeder
    "seed_database",
]
