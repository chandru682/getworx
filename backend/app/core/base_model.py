from datetime import datetime
from typing import Any
from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Base model class with common enterprise audit fields:

    id, created_at, updated_at, deleted_at (soft delete), status
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

    def to_dict(self) -> dict[str, Any]:
        """Convert model instance attributes to a dictionary."""
        return {
            c.name: getattr(self, c.name)
            for c in self.__table__.columns
        }
