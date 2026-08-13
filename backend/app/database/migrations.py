"""Alembic Database Migration Manager & Integration Utilities.

===============================================================================
MIGRATION WORKFLOW & PRODUCTION BEST PRACTICES
===============================================================================

1. LOCAL DEVELOPMENT WORKFLOW:
   - When modifying ORM models in `app/<module>/models.py`, ensure the model
     inherits from `app.database.base.Base`.
   - Run automatic migration generation command via CLI:
       $ alembic revision --autogenerate -m "Add table_name or column_name"
   - Inspect the generated migration file inside `alembic/versions/`.
   - Apply the pending migration locally:
       $ alembic upgrade head

2. PRODUCTION DEPLOYMENT WORKFLOW:
   - Always run zero-downtime database migrations prior to deploying new container versions.
   - Run programmatic migration application during container startup or init-container execution:
       $ python -c "from app.database.migrations import run_migrations; run_migrations()"
   - Alternatively execute via Alembic CLI directly:
       $ alembic upgrade head

3. ROLLBACK WORKFLOW:
   - To downgrade to the previous database revision in emergency situations:
       $ alembic downgrade -1
   - To inspect current migration revision state:
       $ alembic current

===============================================================================
"""

import os
from typing import Dict, Any
from alembic import command
from alembic.config import Config
from app.core.config import settings
from app.core.logging import logger


def get_alembic_config() -> Config:
    """Construct an Alembic Config object pointing to alembic.ini and current settings.

    Returns:
        Config: Configured Alembic Config object.
    """
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    alembic_ini_path = os.path.join(base_dir, "alembic.ini")
    
    if not os.path.exists(alembic_ini_path):
        logger.warning(f"alembic.ini not found at path: {alembic_ini_path}. Falling back to default.")

    config = Config(alembic_ini_path if os.path.exists(alembic_ini_path) else None)
    config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
    config.set_main_option("script_location", os.path.join(base_dir, "alembic"))
    return config


def run_migrations(target_revision: str = "head") -> None:
    """Programmatically execute database schema migrations up to target_revision.

    Used during application boot / CI-CD pipeline setup to ensure database state is current.

    Args:
        target_revision (str): Alembic revision target (default: 'head').
    """
    logger.info(f"Starting database migration execution target='{target_revision}'...")
    try:
        config = get_alembic_config()
        command.upgrade(config, target_revision)
        logger.info("Database schema migrations completed successfully.")
    except Exception as exc:
        logger.critical(f"Database migration failure: {exc}")
        raise RuntimeError(f"Database migration failed: {exc}") from exc


def get_current_revision() -> None:
    """Print the current active Alembic database migration revision to logs."""
    try:
        config = get_alembic_config()
        command.current(config)
    except Exception as exc:
        logger.error(f"Failed retrieving current database migration revision: {exc}")


def generate_migration(message: str, autogenerate: bool = True) -> None:
    """Generate a new Alembic migration script.

    Args:
        message (str): Revision migration message summary.
        autogenerate (bool): Perform automatic diff detection on Base metadata.
    """
    try:
        config = get_alembic_config()
        command.revision(config, message=message, autogenerate=autogenerate)
        logger.info(f"Generated new migration revision with message: '{message}'")
    except Exception as exc:
        logger.error(f"Failed creating migration revision: {exc}")
        raise
