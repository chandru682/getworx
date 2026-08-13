from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.auth.models import User


class CandidateProfile(Base):
    """Candidate profile entity referencing users.id via foreign key."""

    __tablename__ = "candidate_profiles"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    photo_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    dob: Mapped[str | None] = mapped_column(String(32), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(32), nullable=True)
    country: Mapped[str | None] = mapped_column(String(64), nullable=True)
    state: Mapped[str | None] = mapped_column(String(64), nullable=True)
    city: Mapped[str | None] = mapped_column(String(64), nullable=True)
    current_role: Mapped[str | None] = mapped_column(String(128), nullable=True)
    total_experience: Mapped[str | None] = mapped_column(String(64), nullable=True)
    preferred_job_role: Mapped[str | None] = mapped_column(String(128), nullable=True)
    preferred_location: Mapped[str | None] = mapped_column(String(128), nullable=True)
    expected_salary: Mapped[str | None] = mapped_column(String(64), nullable=True)
    highest_qualification: Mapped[str | None] = mapped_column(String(128), nullable=True)
    university: Mapped[str | None] = mapped_column(String(128), nullable=True)
    graduation_year: Mapped[str | None] = mapped_column(String(16), nullable=True)
    resume_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    portfolio_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    skills_json: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    languages_json: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    certifications_json: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    profile_completion_percentage: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    profile_last_updated: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    notice_period: Mapped[str | None] = mapped_column(String(64), nullable=True, default="30 Days")

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="candidate_profile", foreign_keys=[user_id])


class SavedCandidate(Base):
    """Saved / Bookmarked candidates by companies or recruiters."""

    __tablename__ = "saved_candidates"

    company_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_profile_id: Mapped[int] = mapped_column(ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    notes: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])
    candidate_profile: Mapped["CandidateProfile"] = relationship("CandidateProfile", foreign_keys=[candidate_profile_id])


class CandidateUnlock(Base):
    """Contact details and resume unlock records for candidates by company/recruiter."""

    __tablename__ = "candidate_unlocks"

    company_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_profile_id: Mapped[int] = mapped_column(ForeignKey("candidate_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    unlocked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])
    candidate_profile: Mapped["CandidateProfile"] = relationship("CandidateProfile", foreign_keys=[candidate_profile_id])

