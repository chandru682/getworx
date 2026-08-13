from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class SubscriptionPlanResponse(BaseModel):
    id: int
    plan_code: str
    name: str
    description: Optional[str] = None
    price_usd: float
    price_inr: float
    duration_days: int
    job_posting_limit: int
    recruiter_limit: int
    resume_views_limit: int
    ai_credits: int
    features: List[str] = []
    badge: Optional[str] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class CompanySubscriptionResponse(BaseModel):
    id: int
    company_id: int
    plan_id: int
    status: str
    start_date: datetime
    end_date: datetime
    auto_renew: bool
    jobs_posted_count: int
    recruiters_count: int
    resume_views_count: int
    ai_credits_used: int
    transaction_ref: Optional[str] = None
    plan: Optional[SubscriptionPlanResponse] = None

    model_config = ConfigDict(from_attributes=True)


class SubscribePlanRequest(BaseModel):
    plan_code: str = Field(..., description="Starter, Professional, or Enterprise")
    payment_method: str = Field("Credit Card", description="Credit Card, UPI, Corporate NetBanking, Invoice")
    currency: str = Field("USD", description="USD or INR")
    card_number_last4: Optional[str] = Field("4242", description="Card snippet or transaction details")


class EmployerAccessStatusResponse(BaseModel):
    user_id: int
    email: str
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    company_status: str  # draft, pending_verification, approved, active, etc.
    must_change_password: bool
    last_password_changed_at: Optional[datetime] = None
    subscription_status: str  # NONE, ACTIVE, EXPIRED, CANCELLED
    is_dashboard_unlocked: bool
    message: str
    active_subscription: Optional[CompanySubscriptionResponse] = None
    allowed_features: List[str] = []


class AdminSubscriptionItemResponse(BaseModel):
    subscription_id: int
    company_id: int
    company_name: str
    employer_name: str
    employer_email: str
    plan_code: str
    plan_name: str
    status: str  # Active, Expired, Trial, Suspended, Cancelled
    start_date: datetime
    end_date: datetime
    remaining_days: int
    jobs_used: int
    job_limit: int  # -1 means Unlimited
    recruiters_used: int
    recruiter_limit: int  # -1 means Unlimited
    ai_credits_used: int
    ai_credits_limit: int
    payment_status: str
    last_payment_date: Optional[datetime] = None
    last_payment_amount: Optional[float] = 0.0

    model_config = ConfigDict(from_attributes=True)


class AdminSubscriptionsOverviewResponse(BaseModel):
    active_subscriptions: int
    trial_companies: int
    expiring_7_days: int
    expired_subscriptions: int
    monthly_revenue: float
    subscriptions: List[AdminSubscriptionItemResponse]


class AdminAssignPlanRequest(BaseModel):
    company_id: int
    plan_code: str = Field(..., description="starter, professional, or enterprise")
    notes: Optional[str] = None


class AdminRenewPlanRequest(BaseModel):
    company_id: int
    days: int = Field(30, ge=1, le=365)
    notes: Optional[str] = None


class AdminActionPlanRequest(BaseModel):
    company_id: int
    reason: Optional[str] = None


class SubscriptionHistoryItemResponse(BaseModel):
    id: int
    company_id: int
    subscription_id: Optional[int] = None
    action: str
    previous_plan_code: Optional[str] = None
    new_plan_code: Optional[str] = None
    performed_by: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

