import enum
from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

class JobStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    CLOSED = "closed"
    EXPIRED = "expired"
    SUSPENDED = "suspended"

class Job(Base):
    """Job Model representing enterprise job postings and ATS requirements."""
    __tablename__ = "jobs"

    # Step 1: Job Details
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    department: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(128), nullable=False)
    employment_type: Mapped[str] = mapped_column(String(100), nullable=False)
    experience_min: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    experience_max: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    work_mode: Mapped[str] = mapped_column(String(50), default="Onsite", nullable=False)  # Onsite, Hybrid, Remote
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    country: Mapped[str] = mapped_column(String(100), default="India", nullable=False)
    salary_min: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    salary_max: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    salary_currency: Mapped[str] = mapped_column(String(10), default="USD", nullable=False)
    show_salary: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    openings: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    priority: Mapped[str] = mapped_column(String(50), default="Medium", nullable=False)  # Urgent, High, Medium, Low
    deadline: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Step 2: Preferred Candidate
    education: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    skills_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON list of skills
    certifications_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON list of certs
    languages_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON list of languages
    industry_exp: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    notice_period: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    current_location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    relocation_pref: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Step 3: Job Description
    about_company: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    responsibilities: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    required_skills: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    preferred_skills: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    benefits_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON list of benefits
    working_hours: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Step 5: Advanced Options
    hiring_manager_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    hiring_manager_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    assigned_recruiter_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    visibility: Mapped[str] = mapped_column(String(50), default="Public", nullable=False)  # Public, Internal, Private
    internal_job_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    auto_close_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    prevent_duplicates: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    email_notifications: Mapped[str] = mapped_column(String(50), default="Instant", nullable=False)

    # System Status & Relations
    status: Mapped[str] = mapped_column(String(50), default="draft", nullable=False, index=True)
    created_by_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    employer_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    company_id: Mapped[Optional[int]] = mapped_column(ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    creator = relationship("User", foreign_keys=[created_by_id])
    recruiter = relationship("User", foreign_keys=[assigned_recruiter_id])
    company = relationship("Company")
    screening_questions = relationship("JobScreeningQuestion", back_populates="job", cascade="all, delete-orphan")


class JobScreeningQuestion(Base):
    """JobScreeningQuestion representing customized question prompts for candidate applications."""
    __tablename__ = "job_screening_questions"

    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[str] = mapped_column(String(50), default="paragraph", nullable=False)  # yes_no, multiple_choice, paragraph, file_upload
    options_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON list of options for multiple choice
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_knockout: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    preferred_answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    job = relationship("Job", back_populates="screening_questions")
