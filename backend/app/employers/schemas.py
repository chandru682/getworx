from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TrendMetric(BaseModel):
    count: int
    trend_percentage: float
    is_positive: bool

class EmployerDashboardMetrics(BaseModel):
    active_jobs: TrendMetric
    new_applications: TrendMetric
    shortlisted: TrendMetric
    interviews: TrendMetric

class PipelineFunnel(BaseModel):
    applied: int
    viewed: int
    shortlisted: int
    interview: int
    offer: int
    hired: int

class PerformanceChartData(BaseModel):
    date: str
    applications: int
    shortlists: int
    interviews: int
    offers: int
    hires: int

class AttentionItems(BaseModel):
    new_applications: int
    interviews_today: int
    jobs_closing_soon: int
    candidates_waiting_feedback: int
    subscription_days_left: int

class RecentApplicationDto(BaseModel):
    id: int
    candidate_name: str
    job_title: str
    experience: str
    skills: List[str]
    match_score: int
    applied_date: datetime
    status: str

class ActiveJobDto(BaseModel):
    id: int
    title: str
    location: str
    employment_type: str
    applications_count: int
    shortlisted_count: int
    interviews_count: int
    posted_date: datetime
    closing_date: Optional[datetime]
    status: str

class UpcomingInterviewDto(BaseModel):
    id: int
    candidate_name: str
    job_title: str
    interview_type: str
    date: str  # YYYY-MM-DD
    time: str  # HH:MM AM/PM
    interviewer_name: str
    status: str

class SubscriptionUsageDto(BaseModel):
    plan_name: str
    jobs_used: int
    jobs_limit: int
    recruiters_used: int
    recruiters_limit: int
    ai_credits_used: int
    ai_credits_limit: int

class RecruiterTeamStatsDto(BaseModel):
    id: int
    name: str
    role: str
    applications_handled: int
    interviews_scheduled: int
    jobs_assigned: int

class EmployerDashboardResponse(BaseModel):
    employer_name: str
    company_name: str
    metrics: EmployerDashboardMetrics
    pipeline: PipelineFunnel
    performance_chart: List[PerformanceChartData]
    attention_required: AttentionItems
    recent_applications: List[RecentApplicationDto]
    active_jobs: List[ActiveJobDto]
    upcoming_interviews: List[UpcomingInterviewDto]
    subscription_usage: SubscriptionUsageDto
    recruiter_team: List[RecruiterTeamStatsDto]
