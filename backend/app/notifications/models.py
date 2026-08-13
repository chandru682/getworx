import enum
from typing import TYPE_CHECKING, Optional
from sqlalchemy import Boolean, DateTime, Enum as SQLEnum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.auth.models import User


class NotificationType(str, enum.Enum):
    # Application events — candidate
    APPLICATION_SUBMITTED           = "application_submitted"
    APPLICATION_STATUS_CHANGE       = "application_status_change"
    # Application events — employer
    APPLICATION_RECEIVED            = "application_received"
    # Application events — recruiter
    RECRUITER_APPLICATION_ASSIGNED  = "recruiter_application_assigned"
    # Application events — admin
    ADMIN_NEW_APPLICATION           = "admin_new_application"
    # Interview events
    INTERVIEW_SCHEDULED             = "interview_scheduled"
    INTERVIEW_UPDATED               = "interview_updated"
    # Legacy / misc
    RECRUITER_ASSIGNED              = "recruiter_assigned"
    SYSTEM                          = "system"


class Notification(Base):
    """Persistent notification record for all platform actors."""

    __tablename__ = "notifications"

    recipient_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type: Mapped[NotificationType] = mapped_column(
        SQLEnum(NotificationType), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    # Optional link-back to the triggering entity
    entity_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # e.g. "application"
    entity_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Relationships
    recipient = relationship("User", foreign_keys=[recipient_id])
