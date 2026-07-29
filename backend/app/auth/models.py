import enum
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Index,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base_model import Base


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    EMPLOYER = "EMPLOYER"
    RECRUITER = "RECRUITER"
    CANDIDATE = "CANDIDATE"


class UserStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


class User(Base):
    """User DB Model representing Platform Administrators, Employers, Recruiters, and Candidates."""

    __tablename__ = "users"

    name: Mapped[str] = mapped_column(String(128), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole), default=UserRole.CANDIDATE, nullable=False, index=True
    )
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    # Relationships
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )
    reset_tokens: Mapped[list["PasswordResetToken"]] = relationship(
        "PasswordResetToken", back_populates="user", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_users_email_role", "email", "role"),
    )


class RefreshToken(Base):
    """RefreshToken DB Model to track active sessions, revocation, and refresh tokens."""

    __tablename__ = "refresh_tokens"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    token: Mapped[str] = mapped_column(String(512), unique=True, index=True, nullable=False)
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="refresh_tokens")


class PasswordResetToken(Base):
    """PasswordResetToken DB Model to track secure email password reset tokens."""

    __tablename__ = "password_reset_tokens"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    token: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    is_used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="reset_tokens")
