import importlib
from datetime import datetime
from typing import Any, Dict, List
from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from app.core.logging import logger


class Base(DeclarativeBase):
    """Base Declarative Class for all SQLAlchemy ORM models in GetWorxs Platform.

    Provides core enterprise audit fields:
    - id: Primary Key (Auto-increment Integer)
    - status: Entity lifecycle status (default 'active')
    - created_at: Creation timestamp with server default
    - updated_at: Last update timestamp with automatic touch
    - deleted_at: Timestamp for soft delete operations
    """

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, index=True
    )

    status: Mapped[str] = mapped_column(
        String(32), default="active", nullable=False, index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None,
        index=True,
    )

    def to_dict(self) -> Dict[str, Any]:
        """Convert model instance attributes to a dictionary representation."""
        return {
            col.name: getattr(self, col.name)
            for col in self.__table__.columns
        }

    def __repr__(self) -> str:
        """String representation of the ORM entity."""
        return f"<{self.__class__.__name__}(id={self.id}, status='{self.status}')>"


def discover_models() -> List[str]:
    """Dynamically import model packages within the application to ensure

    automatic model registration with Base.metadata.
    
    Returns:
        List of loaded model module names.
    """
    loaded_modules: List[str] = []
    
    candidate_modules = [
        "app.companies.models",
        "app.auth.models",
        "app.employers.models",
        "app.recruiters.models",
        "app.candidates.models",
        "app.jobs.models",
        "app.applications.models",
        "app.interviews.models",
        "app.audit.models",
        "app.subscriptions.models",
        "app.notifications.models",
        "app.models",
    ]


    for mod_name in candidate_modules:
        try:
            importlib.import_module(mod_name)
            loaded_modules.append(mod_name)
            logger.debug(f"Successfully registered model module: {mod_name}")
        except ModuleNotFoundError:
            # Package or sub-module might not exist yet; safe to ignore
            continue
        except Exception as exc:
            logger.warning(f"Failed loading model module '{mod_name}': {exc}")

    return loaded_modules
