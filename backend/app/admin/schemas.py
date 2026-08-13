from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class AdminCandidateProfile(BaseModel):
    name: Optional[str] = None
    photo_url: Optional[str] = None
    phone: Optional[str] = None
    current_role: Optional[str] = None
    total_experience: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    highest_qualification: Optional[str] = None
    resume_url: Optional[str] = None
    skills_json: Optional[list] = None

    class Config:
        from_attributes = True


class AdminApplicationCandidateInfo(BaseModel):
    id: int
    email: str
    name: Optional[str] = None
    profile: Optional[AdminCandidateProfile] = None

    class Config:
        from_attributes = True


class AdminApplicationResponse(BaseModel):
    id: int
    application_reference: str
    candidate_id: int
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    job_id: int
    job_title: Optional[str] = None
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    employer_id: Optional[int] = None
    recruiter_id: Optional[int] = None
    resume_url: Optional[str] = None
    cover_letter: Optional[str] = None
    status: str
    applied_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginatedAdminApplicationResponse(BaseModel):
    items: List[AdminApplicationResponse]
    total: int
    page: int
    limit: int


class RecentActivityItem(BaseModel):
    id: int
    title: str
    message: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AdminStatsResponse(BaseModel):
    total_applications: int
    today_applications: int
    total_users: int
    total_companies: int
    total_jobs: int
    total_employers: int
    total_recruiters: int
    total_candidates: int
    pending_companies: int = 0
    active_jobs: int = 0
    mrr: float = 0.0
    arr: float = 0.0
    active_subscriptions: int = 0
    trial_subscriptions: int = 0
    expiring_subscriptions: int = 0
    expired_subscriptions: int = 0
    funnel: Dict[str, int] = {}
    subscription_distribution: Dict[str, int] = {}
    ai_usage: Dict[str, Any] = {}
    platform_health: Dict[str, str] = {}
    alerts_count: int = 0


class AdminCompanyResponse(BaseModel):
    id: int
    name: str
    legal_name: Optional[str] = None
    company_code: str
    industry: Optional[str] = None
    approval_status: str
    is_verified: bool
    owner_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    jobs_count: int = 0
    recruiters_count: int = 0
    applications_count: int = 0
    subscription_plan: str = "Free"
    created_at: datetime

    class Config:
        from_attributes = True


class PaginatedAdminCompanyResponse(BaseModel):
    items: List[AdminCompanyResponse]
    total: int
    page: int
    limit: int


class AdminCompanyActionRequest(BaseModel):
    action: str  # approve, reject, suspend, reactivate
    reason: Optional[str] = None


class AdminAuditLogItem(BaseModel):
    id: int
    user_name: str
    user_email: str
    user_role: str
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    ip_address: Optional[str] = None
    created_at: datetime


class PaginatedAdminAuditLogResponse(BaseModel):
    items: List[AdminAuditLogItem]
    total: int
    page: int
    limit: int


class AdminGlobalSearchResult(BaseModel):
    companies: List[Dict[str, Any]] = []
    candidates: List[Dict[str, Any]] = []
    recruiters: List[Dict[str, Any]] = []
    jobs: List[Dict[str, Any]] = []
    applications: List[Dict[str, Any]] = []
    payments: List[Dict[str, Any]] = []


# ── Super Admin Jobs Drill-Down Schemas ─────────────────────────────────────

class AdminCompanyJobSummary(BaseModel):
    id: int
    name: str
    logo_url: Optional[str] = None
    industry: str
    approval_status: str
    active_jobs: int = 0
    total_jobs: int = 0
    total_applications: int = 0
    recruiters_count: int = 0
    latest_job_title: Optional[str] = None
    latest_job_posted_at: Optional[datetime] = None
    last_activity: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaginatedAdminCompanyJobSummaryResponse(BaseModel):
    items: List[AdminCompanyJobSummary]
    total: int
    page: int
    limit: int


class AdminCompanyJobsHeader(BaseModel):
    company_id: int
    company_name: str
    logo_url: Optional[str] = None
    industry: Optional[str] = None
    active_jobs: int = 0
    closed_jobs: int = 0
    total_applications: int = 0
    total_recruiters: int = 0


class AdminCompanyJobItem(BaseModel):
    id: int
    title: str
    department: str
    location: str
    employment_type: str
    experience: str
    posted_date: Optional[datetime] = None
    closing_date: Optional[datetime] = None
    applications_count: int = 0
    status: str

    class Config:
        from_attributes = True


class PaginatedAdminCompanyJobsResponse(BaseModel):
    header: AdminCompanyJobsHeader
    items: List[AdminCompanyJobItem]
    total: int
    page: int
    limit: int


class ApplicantStatusBreakdown(BaseModel):
    total: int = 0
    new: int = 0
    viewed: int = 0
    shortlisted: int = 0
    interview: int = 0
    rejected: int = 0
    hired: int = 0


class AdminJobDetailResponse(BaseModel):
    id: int
    title: str
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    department: str
    role: str
    location: str
    salary: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: str = "INR"
    experience: str
    employment_type: str
    work_mode: str
    skills: List[str] = []
    description: Dict[str, Any] = {}
    screening_questions: List[Dict[str, Any]] = []
    posted_date: Optional[datetime] = None
    closing_date: Optional[datetime] = None
    status: str
    applicant_breakdown: ApplicantStatusBreakdown

    class Config:
        from_attributes = True


class AdminJobApplicantItem(BaseModel):
    id: int  # application_id
    application_reference: str
    candidate_id: int
    candidate_name: str
    candidate_email: str
    experience: Optional[str] = None
    skills: List[str] = []
    applied_date: datetime
    ats_score: int = 80
    status: str
    recruiter_name: Optional[str] = None
    resume_url: Optional[str] = None

    class Config:
        from_attributes = True


class PaginatedAdminJobApplicantsResponse(BaseModel):
    items: List[AdminJobApplicantItem]
    total: int
    page: int
    limit: int


class AdminCandidateApplicationDetail(BaseModel):
    id: int
    application_reference: str
    job_id: int
    job_title: str
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    candidate: Dict[str, Any] = {}
    resume_url: Optional[str] = None
    cover_letter: Optional[str] = None
    screening_answers: List[Dict[str, Any]] = []
    skills: List[str] = []
    education: List[Dict[str, Any]] = []
    experience: List[Dict[str, Any]] = []
    ats_score: int = 85
    application_timeline: List[Dict[str, Any]] = []
    application_status: str
    recruiter_assigned: Optional[Dict[str, Any]] = None
    interview_history: List[Dict[str, Any]] = []
    admin_notes: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True


class AdminNoteCreate(BaseModel):
    note: str


# ── Reports & Analytics Schemas ──

class KPICardMetric(BaseModel):
    value: Union[int, float, str]
    previous_value: Union[int, float, str] = 0
    percentage_change: float = 0.0
    trend: str = "neutral"  # "up" | "down" | "neutral"
    label: str


class ExecutiveKPIsResponse(BaseModel):
    total_companies: KPICardMetric
    total_candidates: KPICardMetric
    active_employers: KPICardMetric
    active_recruiters: KPICardMetric
    active_jobs: KPICardMetric
    total_applications: KPICardMetric
    total_interviews: KPICardMetric
    total_hires: KPICardMetric
    mrr: KPICardMetric
    active_subscriptions: KPICardMetric


class GrowthDataPoint(BaseModel):
    date: str
    value: int
    metric_name: str


class RecruitmentFunnelStage(BaseModel):
    stage: str
    count: int
    conversion_percentage: float
    previous_stage_count: int = 0


class CategoryBreakdownItem(BaseModel):
    label: str
    count: int
    percentage: float = 0.0


class CompanyPerformanceItem(BaseModel):
    company_id: int
    company_name: str
    logo_url: Optional[str] = None
    plan_name: str = "Starter"
    jobs_posted: int = 0
    active_jobs: int = 0
    applications: int = 0
    shortlisted: int = 0
    interviews: int = 0
    offers: int = 0
    hires: int = 0
    hiring_rate: float = 0.0


class RecruiterPerformanceItem(BaseModel):
    recruiter_id: int
    recruiter_name: str
    company_name: str
    jobs_count: int = 0
    applications_reviewed: int = 0
    shortlisted_count: int = 0
    interviews_count: int = 0
    hires_count: int = 0


class ReportGenerateRequest(BaseModel):
    report_type: str  # "company", "candidate", "job", "application", "recruiter", "revenue", "subscription", "funnel", "platform"
    date_range: str = "30d"  # "today", "7d", "30d", "3m", "6m", "1y", "custom"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    company_id: Optional[int] = None
    category: Optional[str] = None
    location: Optional[str] = None
    format: str = "csv"  # "csv", "excel", "pdf"


class ReportItemResponse(BaseModel):
    id: str
    report_name: str
    report_type: str
    generated_by: str
    date: str
    format: str
    status: str = "Completed"
    file_url: Optional[str] = None
    size_bytes: int = 0


# ── Financial Payments & Invoice Schemas ──

class FinancialKPIsResponse(BaseModel):
    total_revenue: KPICardMetric
    mrr: KPICardMetric
    pending_payments: KPICardMetric
    refunds: KPICardMetric


class RevenueTrendDataPoint(BaseModel):
    date: str
    revenue: float
    transaction_count: int


class PlanRevenueItem(BaseModel):
    plan_name: str
    active_subscriptions: int
    revenue: float
    percentage_of_total: float


class PaymentHealthItem(BaseModel):
    status: str
    transaction_count: int
    total_amount: float


class SubscriptionOverviewSummary(BaseModel):
    active: int
    expiring_soon: int
    expired: int
    cancelled: int
    total: int


class TopPayingCompanyItem(BaseModel):
    company_id: int
    company_name: str
    logo_url: Optional[str] = None
    plan_name: str
    total_revenue: float
    last_payment_date: str
    subscription_status: str


class AdminTransactionItem(BaseModel):
    id: int
    invoice_number: str
    company_id: int
    company_name: str
    plan_name: str
    amount: float
    currency: str = "INR"
    payment_method: str
    date: str
    status: str


class AdminInvoiceDetail(BaseModel):
    payment_id: int
    invoice_number: str
    company_id: int
    company_name: str
    company_address: str
    tax_number: Optional[str] = None
    plan_name: str
    billing_period_start: str
    billing_period_end: str
    subtotal: float
    tax_percentage: float = 18.0
    tax_amount: float
    discount_amount: float = 0.0
    total_amount: float
    payment_method: str
    payment_date: str
    payment_status: str
    transaction_id: str



