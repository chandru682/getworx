import enum
from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class CompanyStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_VERIFICATION = "pending_verification"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUSPENDED = "suspended"
    ACTIVE = "active"
    INACTIVE = "inactive"


class Company(Base):
    """Company DB Model representing hiring organizations and enterprises."""

    __tablename__ = "companies"

    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    legal_name: Mapped[str] = mapped_column(String(255), nullable=False)
    company_code: Mapped[str] = mapped_column(
        String(64), unique=True, index=True, nullable=False
    )
    industry: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    company_size: Mapped[str] = mapped_column(String(64), nullable=False)
    website: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(64), nullable=False)
    country: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(128), nullable=False)
    city: Mapped[str] = mapped_column(String(128), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    postal_code: Mapped[str] = mapped_column(String(32), nullable=False)
    tax_gst_number: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    business_reg_number: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    year_established: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Primary Contact Information
    primary_contact_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    primary_contact_designation: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    primary_contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    primary_contact_phone: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    logo_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Approval Workflow Metadata
    approval_status: Mapped[str] = mapped_column(
        String(64), default=CompanyStatus.PENDING_VERIFICATION.value, nullable=False, index=True
    )
    submitted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    approved_by_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    review_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Verification Metadata
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verified_by_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    verified_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Owner / Creator FK
    created_by_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # Relationships
    branches: Mapped[List["CompanyBranch"]] = relationship(
        "CompanyBranch", back_populates="company", cascade="all, delete-orphan"
    )
    documents: Mapped[List["CompanyDocument"]] = relationship(
        "CompanyDocument", back_populates="company", cascade="all, delete-orphan"
    )
    settings: Mapped[Optional["CompanySettings"]] = relationship(
        "CompanySettings", back_populates="company", uselist=False, cascade="all, delete-orphan"
    )
    verified_by: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[verified_by_id]
    )
    approved_by: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[approved_by_id]
    )
    created_by: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[created_by_id]
    )

    __table_args__ = (
        Index("idx_company_name_industry", "name", "industry"),
        Index("idx_company_country_status", "country", "status"),
        Index("idx_company_approval_status", "approval_status"),
    )


class CompanyDocument(Base):
    """Company Document Upload DB Model."""

    __tablename__ = "company_documents"

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    document_type: Mapped[str] = mapped_column(String(64), nullable=False)
    document_name: Mapped[str] = mapped_column(String(255), nullable=False)
    document_url: Mapped[str] = mapped_column(String(512), nullable=False)
    is_required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="uploaded", nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    company: Mapped["Company"] = relationship("Company", back_populates="documents")


class CompanyBranch(Base):
    """Company Branch DB Model for multi-branch corporate locations."""

    __tablename__ = "company_branches"

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    branch_name: Mapped[str] = mapped_column(String(255), nullable=False)
    country: Mapped[str] = mapped_column(String(128), nullable=False)
    state: Mapped[str] = mapped_column(String(128), nullable=False)
    city: Mapped[str] = mapped_column(String(128), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    contact_number: Mapped[str] = mapped_column(String(64), nullable=False)

    company: Mapped["Company"] = relationship("Company", back_populates="branches")


class CompanySettings(Base):
    """Company Settings DB Model for storing localization & regional preferences."""

    __tablename__ = "company_settings"

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    time_zone: Mapped[str] = mapped_column(String(64), default="UTC", nullable=False)
    currency: Mapped[str] = mapped_column(String(16), default="USD", nullable=False)
    language: Mapped[str] = mapped_column(String(16), default="en", nullable=False)
    date_format: Mapped[str] = mapped_column(
        String(32), default="YYYY-MM-DD", nullable=False
    )

    company: Mapped["Company"] = relationship("Company", back_populates="settings")


class CompanyRecruiter(Base):
    """Company Recruiter DB Model storing invited recruiters associated with company name."""

    __tablename__ = "company_recruiters"

    company_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    company_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True
    )
    user_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    recruiter_name: Mapped[str] = mapped_column(String(255), nullable=False)
    recruiter_email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(64), default="Recruiter", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="Pending", nullable=False)
    invited_by_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


