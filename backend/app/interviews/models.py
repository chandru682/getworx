import enum
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional, List, Dict, Any
from sqlalchemy import DateTime, Enum as SQLEnum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.applications.models import Application
    from app.auth.models import User
    from app.jobs.models import Job
    from app.companies.models import Company


class InterviewStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    ACCEPTED = "accepted"
    RESCHEDULED = "rescheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class InterviewMode(str, enum.Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    PHONE = "phone"


class InterviewDecision(str, enum.Enum):
    SELECTED = "selected"
    REJECTED = "rejected"
    HOLD = "hold"
    NEXT_ROUND = "next_round"


class Interview(Base):
    """Interview Model representing corporate interview rounds, schedules, feedback & decisions."""

    __tablename__ = "interviews"

    application_id: Mapped[int] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True
    )
    job_id: Mapped[int] = mapped_column(
        ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    company_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("companies.id", ondelete="SET NULL"), nullable=True, index=True
    )
    candidate_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    employer_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    recruiter_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # Details
    interview_type: Mapped[str] = mapped_column(String(100), default="Technical Round", nullable=False)
    interview_mode: Mapped[InterviewMode] = mapped_column(
        SQLEnum(InterviewMode), default=InterviewMode.ONLINE, nullable=False
    )
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=45, nullable=False)

    interviewer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    interviewer_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    meeting_link: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    venue: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    status: Mapped[InterviewStatus] = mapped_column(
        SQLEnum(InterviewStatus), default=InterviewStatus.SCHEDULED, nullable=False, index=True
    )
    reschedule_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    decline_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Feedback & Evaluation
    feedback_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    decision: Mapped[Optional[InterviewDecision]] = mapped_column(
        SQLEnum(InterviewDecision), nullable=True, index=True
    )
    decision_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    application = relationship("Application", foreign_keys=[application_id])
    job = relationship("Job", foreign_keys=[job_id])
    company = relationship("Company", foreign_keys=[company_id])
    candidate = relationship("User", foreign_keys=[candidate_id])
    employer = relationship("User", foreign_keys=[employer_id])
    recruiter = relationship("User", foreign_keys=[recruiter_id])
