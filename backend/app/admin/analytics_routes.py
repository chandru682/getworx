"""Super Admin Analytics & Business Intelligence Router."""
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.auth.models import User
from app.auth.dependencies import get_current_user_optional, require_admin
from app.schemas.health import ResponseEnvelope
from app.admin.schemas import ReportGenerateRequest
from app.admin.analytics_service import AdminAnalyticsService

analytics_router = APIRouter(prefix="/analytics", tags=["Super Admin Analytics"])
reports_router = APIRouter(prefix="/reports", tags=["Super Admin Reports"])


# ── 1. EXECUTIVE OVERVIEW KPIS ──
@analytics_router.get(
    "/overview",
    summary="GET /api/v1/admin/analytics/overview - Executive BI KPI cards with trend comparison",
)
async def get_analytics_overview(
    date_range: str = Query("30d"),
    company_id: Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    service = AdminAnalyticsService(session)
    kpis = await service.get_executive_kpis(date_range=date_range, company_id=company_id, category=category, location=location)
    return ResponseEnvelope(success=True, message="Executive BI overview KPIs retrieved successfully.", data=kpis)


# ── 2. PLATFORM GROWTH ──
@analytics_router.get(
    "/growth",
    summary="GET /api/v1/admin/analytics/growth - Time series platform growth trend data",
)
async def get_analytics_growth(
    date_range: str = Query("30d"),
    metric: str = Query("applications"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    service = AdminAnalyticsService(session)
    growth_data = await service.get_platform_growth(date_range=date_range, metric=metric)
    return ResponseEnvelope(success=True, message="Platform growth trend data retrieved successfully.", data=growth_data)


# ── 3. RECRUITMENT FUNNEL ──
@analytics_router.get(
    "/funnel",
    summary="GET /api/v1/admin/analytics/funnel - Multi-stage recruitment funnel conversion rates",
)
async def get_analytics_funnel(
    date_range: str = Query("30d"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    service = AdminAnalyticsService(session)
    funnel_data = await service.get_recruitment_funnel(date_range=date_range)
    return ResponseEnvelope(success=True, message="Recruitment conversion funnel retrieved successfully.", data=funnel_data)


# ── 4. APPLICATIONS ANALYTICS ──
@analytics_router.get(
    "/applications",
    summary="GET /api/v1/admin/analytics/applications - Application volume trend & averages",
)
async def get_analytics_applications(
    date_range: str = Query("30d"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    service = AdminAnalyticsService(session)
    app_data = await service.get_application_analytics(date_range=date_range)
    return ResponseEnvelope(success=True, message="Application analytics retrieved successfully.", data=app_data)


# ── 5. JOB ANALYTICS ──
@analytics_router.get(
    "/jobs",
    summary="GET /api/v1/admin/analytics/jobs - Job status breakdown & category/location distributions",
)
async def get_analytics_jobs(
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    service = AdminAnalyticsService(session)
    jobs_data = await service.get_job_analytics()
    return ResponseEnvelope(success=True, message="Job analytics retrieved successfully.", data=jobs_data)


# ── 6. COMPANY PERFORMANCE ──
@analytics_router.get(
    "/companies",
    summary="GET /api/v1/admin/analytics/companies - Company hiring performance & hiring rate table",
)
async def get_analytics_companies(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    service = AdminAnalyticsService(session)
    items, total = await service.get_company_performance(search=search, page=page, limit=limit)
    return ResponseEnvelope(success=True, message="Company performance metrics retrieved successfully.", data={"items": items, "total": total, "page": page, "limit": limit})


# ── 7. REVENUE ANALYTICS ──
@analytics_router.get(
    "/revenue",
    summary="GET /api/v1/admin/analytics/revenue - MRR, ARR, and subscription revenue distribution",
)
async def get_analytics_revenue(
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    service = AdminAnalyticsService(session)
    rev_data = await service.get_revenue_analytics()
    return ResponseEnvelope(success=True, message="Revenue & subscription analytics retrieved successfully.", data=rev_data)


# ── 8. CANDIDATE ANALYTICS ──
@analytics_router.get(
    "/candidates",
    summary="GET /api/v1/admin/analytics/candidates - Candidate verification, profile completion & skills distribution",
)
async def get_analytics_candidates(
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    service = AdminAnalyticsService(session)
    cand_data = await service.get_candidate_analytics()
    return ResponseEnvelope(success=True, message="Candidate analytics retrieved successfully.", data=cand_data)


# ── 9. RECRUITER ANALYTICS ──
@analytics_router.get(
    "/recruiters",
    summary="GET /api/v1/admin/analytics/recruiters - Recruiter activity & recruiter performance table",
)
async def get_analytics_recruiters(
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    service = AdminAnalyticsService(session)
    rec_data = await service.get_recruiter_analytics()
    return ResponseEnvelope(success=True, message="Recruiter analytics retrieved successfully.", data=rec_data)


# ── 10. HIRING PERFORMANCE ──
@analytics_router.get(
    "/hiring-performance",
    summary="GET /api/v1/admin/analytics/hiring-performance - Time to hire & stage conversion rates",
)
async def get_analytics_hiring_performance(
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    service = AdminAnalyticsService(session)
    hiring_data = await service.get_hiring_performance()
    return ResponseEnvelope(success=True, message="Hiring performance metrics retrieved successfully.", data=hiring_data)


# ── 11. TOP PERFORMERS ──
@analytics_router.get(
    "/top-performers",
    summary="GET /api/v1/admin/analytics/top-performers - Top Companies, Recruiters, and Jobs",
)
async def get_analytics_top_performers(
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    service = AdminAnalyticsService(session)
    top_data = await service.get_top_performers()
    return ResponseEnvelope(success=True, message="Top performers retrieved successfully.", data=top_data)


# ── 12. REPORTS GENERATION & MANAGEMENT ──
@reports_router.get(
    "",
    summary="GET /api/v1/admin/reports - List generated reports history",
)
async def get_admin_reports(
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    service = AdminAnalyticsService(session)
    reports = await service.get_saved_reports()
    return ResponseEnvelope(success=True, message="Saved reports history retrieved successfully.", data=reports)


@reports_router.post(
    "/generate",
    summary="POST /api/v1/admin/reports/generate - Generate downloadable platform report",
)
async def generate_admin_report(
    body: ReportGenerateRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    service = AdminAnalyticsService(session)
    author_name = current_user.name if (current_user and current_user.name) else "Super Admin"
    report_entry = await service.generate_report(body.model_dump(), user_name=author_name)
    return ResponseEnvelope(success=True, message="Report generated successfully.", data=report_entry)


@reports_router.delete(
    "/{report_id}",
    summary="DELETE /api/v1/admin/reports/{report_id} - Delete generated report",
)
async def delete_admin_report(
    report_id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    service = AdminAnalyticsService(session)
    success = await service.delete_saved_report(report_id)
    if not success:
        raise HTTPException(status_code=404, detail="Report record not found")
    return ResponseEnvelope(success=True, message="Report deleted successfully.", data={"id": report_id})
