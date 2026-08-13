import enum
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class DemoRequestStatus(str, enum.Enum):
    NEW = "NEW"
    CONTACTED = "CONTACTED"
    DEMO_SCHEDULED = "DEMO_SCHEDULED"
    DEMO_COMPLETED = "DEMO_COMPLETED"
    INTERESTED = "INTERESTED"
    NEGOTIATION = "NEGOTIATION"
    PURCHASED = "PURCHASED"
    NOT_INTERESTED = "NOT_INTERESTED"


class DemoScheduleStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    COMPLETED = "COMPLETED"
    RESCHEDULED = "RESCHEDULED"
    CANCELLED = "CANCELLED"


class QuotationStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SENT = "SENT"
    ACCEPTED = "ACCEPTED"
    EXPIRED = "EXPIRED"
    REJECTED = "REJECTED"


class DemoRequest(Base):
    """B2B Demo Request table for prospective employer evaluation leads."""

    __tablename__ = "demo_requests"

    company_name: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    contact_person: Mapped[str] = mapped_column(String(128), nullable=False)
    official_email: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    mobile_number: Mapped[str] = mapped_column(String(32), nullable=False)
    
    company_size: Mapped[str] = mapped_column(String(64), nullable=False, default="1-10 employees")
    industry: Mapped[str] = mapped_column(String(128), nullable=False, default="Technology & Software")
    number_of_recruiters: Mapped[str] = mapped_column(String(32), nullable=False, default="1-5 recruiters")
    expected_hiring_volume: Mapped[str] = mapped_column(String(64), nullable=False, default="1-10 hires/month")
    hiring_requirements: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    preferred_demo_date: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    preferred_demo_time: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    additional_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    status: Mapped[DemoRequestStatus] = mapped_column(
        SQLEnum(DemoRequestStatus), default=DemoRequestStatus.NEW, nullable=False, index=True
    )
    assigned_sales_rep: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, default="Unassigned")
    assigned_rep_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    company_id: Mapped[Optional[int]] = mapped_column(ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now(), nullable=False)

    schedules: Mapped[List["DemoSchedule"]] = relationship("DemoSchedule", back_populates="demo_request", cascade="all, delete-orphan")
    notes: Mapped[List["DemoNote"]] = relationship("DemoNote", back_populates="demo_request", cascade="all, delete-orphan")
    followups: Mapped[List["SalesFollowup"]] = relationship("SalesFollowup", back_populates="demo_request", cascade="all, delete-orphan")
    quotations: Mapped[List["Quotation"]] = relationship("Quotation", back_populates="demo_request", cascade="all, delete-orphan")


class DemoSchedule(Base):
    """Calendar meeting schedule record for product demo session."""

    __tablename__ = "demo_schedules"

    demo_request_id: Mapped[int] = mapped_column(ForeignKey("demo_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    meeting_link: Mapped[str] = mapped_column(String(255), nullable=False)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    sales_rep_name: Mapped[str] = mapped_column(String(128), nullable=False)
    instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    status: Mapped[DemoScheduleStatus] = mapped_column(
        SQLEnum(DemoScheduleStatus), default=DemoScheduleStatus.SCHEDULED, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)

    demo_request: Mapped["DemoRequest"] = relationship("DemoRequest", back_populates="schedules")


class DemoNote(Base):
    """Internal sales notes logged by Super Admin or Sales Representatives."""

    __tablename__ = "demo_notes"

    demo_request_id: Mapped[int] = mapped_column(ForeignKey("demo_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    author_name: Mapped[str] = mapped_column(String(128), nullable=False, default="Super Admin")
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)

    demo_request: Mapped["DemoRequest"] = relationship("DemoRequest", back_populates="notes")


class SalesFollowup(Base):
    """Sales follow-up logs and reminders."""

    __tablename__ = "sales_followups"

    demo_request_id: Mapped[int] = mapped_column(ForeignKey("demo_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    followup_type: Mapped[str] = mapped_column(String(64), nullable=False, default="Email / Call")
    followup_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="PENDING")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)

    demo_request: Mapped["DemoRequest"] = relationship("DemoRequest", back_populates="followups")


class Quotation(Base):
    """B2B Custom Pricing Quotation created for interested employer leads."""

    __tablename__ = "quotations"

    demo_request_id: Mapped[int] = mapped_column(ForeignKey("demo_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    quotation_number: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    plan_code: Mapped[str] = mapped_column(String(64), nullable=False)
    plan_name: Mapped[str] = mapped_column(String(128), nullable=False)
    price_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="USD", nullable=False)
    
    job_limit: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    recruiter_limit: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    ai_credits: Mapped[int] = mapped_column(Integer, nullable=False, default=1000)
    features_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    
    status: Mapped[QuotationStatus] = mapped_column(
        SQLEnum(QuotationStatus), default=QuotationStatus.SENT, nullable=False
    )
    valid_until: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    payment_link: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)

    demo_request: Mapped["DemoRequest"] = relationship("DemoRequest", back_populates="quotations")
