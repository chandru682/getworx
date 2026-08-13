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


class SubscriptionStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"


class SubscriptionPlan(Base):
    """Subscription Plan catalog model (Starter, Professional, Enterprise)."""

    __tablename__ = "subscription_plans"

    plan_code: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    price_usd: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)
    price_inr: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0.0)
    duration_days: Mapped[int] = mapped_column(Integer, nullable=False, default=30)
    
    # Plan Limits
    job_posting_limit: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    recruiter_limit: Mapped[int] = mapped_column(Integer, nullable=False, default=2)
    resume_views_limit: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    ai_credits: Mapped[int] = mapped_column(Integer, nullable=False, default=500)
    
    # Feature Flags & Description List (stored as JSON string)
    features_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    badge: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    subscriptions: Mapped[List["CompanySubscription"]] = relationship(
        "CompanySubscription", back_populates="plan", cascade="all, delete-orphan"
    )


class CompanySubscription(Base):
    """Active or historical company subscription record."""

    __tablename__ = "company_subscriptions"

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    plan_id: Mapped[int] = mapped_column(
        ForeignKey("subscription_plans.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[SubscriptionStatus] = mapped_column(
        SQLEnum(SubscriptionStatus), default=SubscriptionStatus.PENDING, nullable=False, index=True
    )
    
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    auto_renew: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Usage counters
    jobs_posted_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    recruiters_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    resume_views_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    ai_credits_used: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    transaction_ref: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)

    # Relationships
    plan: Mapped["SubscriptionPlan"] = relationship("SubscriptionPlan", back_populates="subscriptions")
    payments: Mapped[List["PaymentTransaction"]] = relationship(
        "PaymentTransaction", back_populates="subscription", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_company_sub_status_end", "company_id", "status", "end_date"),
    )


class PaymentTransaction(Base):
    """Payment ledger record for subscription purchases and renewals."""

    __tablename__ = "payment_transactions"

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    subscription_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("company_subscriptions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    plan_id: Mapped[int] = mapped_column(
        ForeignKey("subscription_plans.id", ondelete="CASCADE"), nullable=False
    )
    
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="USD", nullable=False)
    payment_method: Mapped[str] = mapped_column(String(64), nullable=False, default="Credit Card")
    payment_status: Mapped[PaymentStatus] = mapped_column(
        SQLEnum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False
    )
    transaction_id: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=False)

    subscription: Mapped[Optional["CompanySubscription"]] = relationship(
        "CompanySubscription", back_populates="payments"
    )


class SubscriptionHistory(Base):
    """Audit log of subscription changes, plan assignments, upgrades, downgrades, renewals, suspensions, and cancellations."""

    __tablename__ = "subscription_history"

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    subscription_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("company_subscriptions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    action: Mapped[str] = mapped_column(String(64), nullable=False)  # ASSIGN, UPGRADE, DOWNGRADE, RENEW, SUSPEND, CANCEL
    previous_plan_code: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    new_plan_code: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    performed_by_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), nullable=False)

