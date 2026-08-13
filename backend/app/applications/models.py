import enum
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional
from sqlalchemy import DateTime, Enum as SQLEnum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.auth.models import User
    from app.jobs.models import Job


class ApplicationStatus(str, enum.Enum):
    APPLIED = "Applied"
    VIEWED = "Viewed"
    SHORTLISTED = "Shortlisted"
    INTERVIEW_SCHEDULED = "Interview Scheduled"
    INTERVIEW_COMPLETED = "Interview Completed"
    SELECTED = "Selected"
    OFFER_SENT = "Offer Sent"
    HIRED = "Hired"
    REJECTED = "Rejected"
    WITHDRAWN = "Withdrawn"


class Application(Base):
    """Candidate Job Application record linking candidate, job, company, employer, and recruiter."""

    __tablename__ = "applications"

    candidate_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    job_id: Mapped[int] = mapped_column(
        ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    company_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("companies.id", ondelete="SET NULL"), nullable=True, index=True
    )
    employer_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    recruiter_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    resume_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    cover_letter: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[ApplicationStatus] = mapped_column(
        SQLEnum(ApplicationStatus), default=ApplicationStatus.APPLIED, nullable=False, index=True
    )
    applied_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False
    )
    status_history_json: Mapped[Optional[list[dict]]] = mapped_column(JSON, nullable=True)
    notes_json: Mapped[Optional[list[str]]] = mapped_column(JSON, nullable=True)
    application_reference: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)

    candidate = relationship("User", foreign_keys=[candidate_id])
    job = relationship("Job")
    employer = relationship("User", foreign_keys=[employer_id])
    recruiter = relationship("User", foreign_keys=[recruiter_id])
    screening_answers = relationship("ApplicationAnswer", back_populates="application", cascade="all, delete-orphan")

    @property
    def job_title(self) -> Optional[str]:
        return self.job.title if self.job else None

    @property
    def company_name(self) -> Optional[str]:
        return self.job.company.name if self.job and self.job.company else None

    @property
    def candidate_name(self) -> Optional[str]:
        if self.candidate:
            if self.candidate.candidate_profile and self.candidate.candidate_profile.name:
                return self.candidate.candidate_profile.name
            return self.candidate.name or self.candidate.email.split("@")[0]
        return None

    @property
    def candidate_email(self) -> Optional[str]:
        return self.candidate.email if self.candidate else None

    @property
    def candidate_phone(self) -> Optional[str]:
        if self.candidate and self.candidate.candidate_profile:
            return self.candidate.candidate_profile.phone
        return None

    @property
    def candidate_profile(self):
        if self.candidate and self.candidate.candidate_profile:
            return self.candidate.candidate_profile
        return None


class ApplicationAnswer(Base):
    """Answers submitted by candidate to job screening questions."""
    __tablename__ = "application_answers"

    application_id: Mapped[int] = mapped_column(
        ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True
    )
    question_id: Mapped[int] = mapped_column(
        ForeignKey("job_screening_questions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    candidate_answer: Mapped[str] = mapped_column(Text, nullable=False)

    # Relationships
    application = relationship("Application", back_populates="screening_answers")
    question = relationship("JobScreeningQuestion")

    @property
    def question_text(self) -> str:
        return self.question.question_text if self.question else ""

    @property
    def question_type(self) -> str:
        return self.question.question_type if self.question else "paragraph"
