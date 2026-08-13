from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from typing import List

from app.employers.schemas import (
    EmployerDashboardResponse,
    EmployerDashboardMetrics,
    TrendMetric,
    PipelineFunnel,
    PerformanceChartData,
    AttentionItems,
    RecentApplicationDto,
    ActiveJobDto,
    UpcomingInterviewDto,
    SubscriptionUsageDto,
    RecruiterTeamStatsDto,
)

from app.jobs.models import Job, JobStatus
from app.applications.models import Application, ApplicationStatus
from app.interviews.models import Interview, InterviewStatus
from app.subscriptions.models import CompanySubscription as Subscription, SubscriptionPlan
from app.recruiters.models import RecruiterProfile as Recruiter
from app.companies.models import Company
from app.candidates.models import CandidateProfile as Candidate
from app.database.session import get_db

class EmployerDashboardService:
    async def get_dashboard(self, company_id: int, db: AsyncSession) -> EmployerDashboardResponse:
        # Metrics
        active_jobs_cnt = await db.scalar(
            select(func.count()).select_from(Job).where(
                Job.company_id == company_id,
                Job.status == JobStatus.ACTIVE,
            )
        )
        # New applications last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        new_apps_cnt = await db.scalar(
            select(func.count()).select_from(Application).where(
                Application.company_id == company_id,
                Application.created_at >= thirty_days_ago,
            )
        )
        shortlisted_cnt = await db.scalar(
            select(func.count()).select_from(Application).where(
                Application.company_id == company_id,
                Application.status == ApplicationStatus.SHORTLISTED,
            )
        )
        interviews_cnt = await db.scalar(
            select(func.count()).select_from(Interview).where(
                Interview.company_id == company_id,
                Interview.status == InterviewStatus.SCHEDULED,
            )
        )

        # Simple trend placeholders (percentage change compared to previous period)
        def _trend(current: int) -> TrendMetric:
            # For demo, calculate % change vs previous 30 days range
            prev_start = thirty_days_ago - timedelta(days=30)
            prev_end = thirty_days_ago
            # Example: count in previous period
            # Using same model based on metric name – simplified
            # This is a stub; real implementation would vary per metric
            return TrendMetric(count=current, trend_percentage=0.0, is_positive=True)

        metrics = EmployerDashboardMetrics(
            active_jobs=_trend(active_jobs_cnt),
            new_applications=_trend(new_apps_cnt),
            shortlisted=_trend(shortlisted_cnt),
            interviews=_trend(interviews_cnt),
        )

        # Funnel counts
        applied = await db.scalar(
            select(func.count()).select_from(Application).where(Application.company_id == company_id)
        )
        viewed = await db.scalar(
            select(func.count()).select_from(Application).where(
                Application.company_id == company_id,
                Application.status == ApplicationStatus.VIEWED,
            )
        )
        shortlisted = shortlisted_cnt
        interview = interviews_cnt
        offer = await db.scalar(
            select(func.count()).select_from(Application).where(
                Application.company_id == company_id,
                Application.status == ApplicationStatus.INTERVIEW_SCHEDULED,
            )
        )
        hired = await db.scalar(
            select(func.count()).select_from(Application).where(
                Application.company_id == company_id,
                Application.status == ApplicationStatus.HIRED,
            )
        )
        pipeline = PipelineFunnel(
            applied=applied,
            viewed=viewed,
            shortlisted=shortlisted,
            interview=interview,
            offer=offer,
            hired=hired,
        )

        # Performance chart – last 30 days daily aggregation
        chart_data: List[PerformanceChartData] = []
        for i in range(30):
            day = datetime.utcnow().date() - timedelta(days=i)
            day_start = datetime.combine(day, datetime.min.time())
            day_end = datetime.combine(day, datetime.max.time())
            apps = await db.scalar(
                select(func.count()).select_from(Application).where(
                    Application.company_id == company_id,
                    Application.created_at >= day_start,
                    Application.created_at <= day_end,
                )
            )
            short = await db.scalar(
                select(func.count()).select_from(Application).where(
                    Application.company_id == company_id,
                    Application.status == ApplicationStatus.SHORTLISTED,
                    Application.updated_at >= day_start,
                    Application.updated_at <= day_end,
                )
            )
            inter = await db.scalar(
                select(func.count()).select_from(Interview).where(
                    Interview.company_id == company_id,
                    Interview.scheduled_at >= day_start,
                    Interview.scheduled_at <= day_end,
                )
            )
            # Offers and hires omitted for brevity – set to 0
            chart_data.append(
                PerformanceChartData(
                    date=day.isoformat(),
                    applications=apps or 0,
                    shortlists=short or 0,
                    interviews=inter or 0,
                    offers=0,
                    hires=0,
                )
            )
        chart_data.reverse()  # chronological order

        # Attention items (simple counts)
        attention = AttentionItems(
            new_applications=new_apps_cnt,
            interviews_today=await db.scalar(
                select(func.count()).select_from(Interview).where(
                    Interview.company_id == company_id,
                    Interview.scheduled_at >= datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0),
                    Interview.scheduled_at <= datetime.utcnow(),
                )
            ),
            jobs_closing_soon=await db.scalar(
                select(func.count()).select_from(Job).where(
                    Job.company_id == company_id,
                    Job.closing_date != None,
                    Job.closing_date <= datetime.utcnow() + timedelta(days=3),
                )
            ),
            candidates_waiting_feedback=await db.scalar(
                select(func.count()).select_from(Application).where(
                    Application.company_id == company_id,
                    Application.status == ApplicationStatus.INTERVIEW_COMPLETED,
                )
            ),
            subscription_days_left=await db.scalar(
                select(func.date_part('day', Subscription.end_date - datetime.utcnow())).where(
                    Subscription.company_id == company_id,
                )
            ) or 0,
        )

        # Recent applications (limit 5)
        recent_apps_rows = await db.execute(
            select(Application, Candidate)
            .join(Candidate, Candidate.id == Application.candidate_id)
            .where(Application.company_id == company_id)
            .order_by(desc(Application.created_at))
            .limit(5)
        )
        recent_apps: List[RecentApplicationDto] = []
        for app, cand in recent_apps_rows:
            recent_apps.append(
                RecentApplicationDto(
                    id=app.id,
                    candidate_name=cand.name,
                    job_title=app.job.title if app.job else "",
                    experience=cand.experience_years or 0,
                    skills=cand.skills.split(",") if cand.skills else [],
                    match_score=app.match_score or 0,
                    applied_date=app.created_at,
                    status=app.status.value,
                )
            )

        # Active jobs (limit 5)
        active_jobs_rows = await db.execute(
            select(Job).where(
                Job.company_id == company_id,
                Job.status == JobStatus.ACTIVE,
            ).order_by(desc(Job.created_at)).limit(5)
        )
        active_jobs: List[ActiveJobDto] = []
        for job in active_jobs_rows.scalars():
            applications_cnt = await db.scalar(
                select(func.count()).select_from(Application).where(Application.job_id == job.id)
            )
            shortlisted_cnt = await db.scalar(
                select(func.count()).select_from(Application).where(
                    Application.job_id == job.id,
                    Application.status == ApplicationStatus.SHORTLISTED,
                )
            )
            interviews_cnt = await db.scalar(
                select(func.count()).select_from(Interview).where(Interview.job_id == job.id)
            )
            active_jobs.append(
                ActiveJobDto(
                    id=job.id,
                    title=job.title,
                    location=job.location or "",
                    employment_type=job.employment_type.value if hasattr(job, "employment_type") else "",
                    applications_count=applications_cnt or 0,
                    shortlisted_count=shortlisted_cnt or 0,
                    interviews_count=interviews_cnt or 0,
                    posted_date=job.created_at,
                    closing_date=job.closing_date,
                    status=job.status.value,
                )
            )

        # Upcoming interviews (limit 5)
        upcoming_rows = await db.execute(
            select(Interview, Candidate, Job)
            .join(Candidate, Candidate.id == Interview.candidate_id)
            .join(Job, Job.id == Interview.job_id)
            .where(
                Interview.company_id == company_id,
                Interview.scheduled_at >= datetime.utcnow(),
            )
            .order_by(Interview.scheduled_at)
            .limit(5)
        )
        upcoming: List[UpcomingInterviewDto] = []
        for interview, cand, job in upcoming_rows:
            upcoming.append(
                UpcomingInterviewDto(
                    id=interview.id,
                    candidate_name=cand.name,
                    job_title=job.title,
                    interview_type=interview.type.value if hasattr(interview, "type") else "",
                    date=interview.scheduled_at.date().isoformat(),
                    time=interview.scheduled_at.time().strftime("%I:%M %p"),
                    interviewer_name=interview.interviewer_name or "",
                    status=interview.status.value,
                )
            )

        # Subscription usage
        sub_row = await db.scalar(
            select(Subscription).where(Subscription.company_id == company_id)
        )
        plan = await db.scalar(
            select(SubscriptionPlan).where(SubscriptionPlan.id == sub_row.plan_id)
        ) if sub_row else None
        subscription = SubscriptionUsageDto(
            plan_name=plan.name if plan else "Free",
            jobs_used=active_jobs_cnt or 0,
            jobs_limit=plan.job_limit if plan else 0,
            recruiters_used=await db.scalar(
                select(func.count()).select_from(Recruiter).where(Recruiter.company_id == company_id)
            ) or 0,
            recruiters_limit=plan.recruiter_limit if plan else 0,
            ai_credits_used=sub_row.ai_credits_used if sub_row else 0,
            ai_credits_limit=plan.ai_credits_limit if plan else 0,
        )

        # Recruiter team stats (limit 5)
        team_rows = await db.execute(
            select(Recruiter).where(Recruiter.company_id == company_id).limit(5)
        )
        recruiter_team: List[RecruiterTeamStatsDto] = []
        for rec in team_rows.scalars():
            apps_handled = await db.scalar(
                select(func.count()).select_from(Application).where(Application.recruiter_id == rec.id)
            ) or 0
            inter_handled = await db.scalar(
                select(func.count()).select_from(Interview).where(Interview.recruiter_id == rec.id)
            ) or 0
            jobs_assigned = await db.scalar(
                select(func.count()).select_from(Job).where(Job.recruiter_id == rec.id)
            ) or 0
            recruiter_team.append(
                RecruiterTeamStatsDto(
                    id=rec.id,
                    name=rec.name,
                    role="Recruiter",
                    applications_handled=apps_handled,
                    interviews_scheduled=inter_handled,
                    jobs_assigned=jobs_assigned,
                )
            )

        # Employer and company name
        company = await db.get(Company, company_id)
        employer_name = company.owner_name if hasattr(company, "owner_name") else ""
        company_name = company.name

        return EmployerDashboardResponse(
            employer_name=employer_name,
            company_name=company_name,
            metrics=metrics,
            pipeline=pipeline,
            performance_chart=chart_data,
            attention_required=attention,
            recent_applications=recent_apps,
            active_jobs=active_jobs,
            upcoming_interviews=upcoming,
            subscription_usage=subscription,
            recruiter_team=recruiter_team,
        )
