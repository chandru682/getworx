from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.admin.schemas import (
    AdminApplicationResponse,
    AdminStatsResponse,
    PaginatedAdminApplicationResponse,
    RecentActivityItem,
    AdminCompanyActionRequest,
    PaginatedAdminCompanyResponse,
    AdminGlobalSearchResult,
)
from app.admin.service import AdminService
from app.auth.dependencies import require_admin
from app.auth.models import User
from app.core.database import get_db
from app.schemas.health import ResponseEnvelope

router = APIRouter(prefix="/admin", tags=["Admin Module"])


def _map_application(app) -> AdminApplicationResponse:
    """Map an Application ORM object to AdminApplicationResponse."""
    candidate_name = None
    candidate_email = None

    if app.candidate:
        candidate_email = app.candidate.email
        if app.candidate.candidate_profile:
            candidate_name = app.candidate.candidate_profile.name
        if not candidate_name:
            candidate_name = app.candidate.email.split("@")[0]

    return AdminApplicationResponse(
        id=app.id,
        application_reference=app.application_reference,
        candidate_id=app.candidate_id,
        candidate_name=candidate_name,
        candidate_email=candidate_email,
        job_id=app.job_id,
        job_title=app.job.title if app.job else None,
        company_id=app.company_id,
        company_name=app.company_name,
        employer_id=app.employer_id,
        recruiter_id=app.recruiter_id,
        resume_url=app.resume_url,
        cover_letter=app.cover_letter,
        status=app.status.value if hasattr(app.status, "value") else str(app.status),
        applied_at=app.applied_at,
        updated_at=app.updated_at,
    )


@router.get(
    "/stats",
    response_model=ResponseEnvelope[AdminStatsResponse],
    summary="Get platform-wide statistics",
)
async def get_platform_stats(
    current_user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
):
    service = AdminService(session)
    stats = await service.get_platform_stats()
    return ResponseEnvelope(
        success=True,
        message="Platform statistics retrieved successfully.",
        data=stats,
    )


@router.get(
    "/public-stats",
    summary="Get public platform statistics from DB",
)
async def get_public_platform_stats(
    session: AsyncSession = Depends(get_db),
):
    service = AdminService(session)
    stats = await service.get_platform_stats()
    return ResponseEnvelope(
        success=True,
        message="Public statistics retrieved.",
        data={
            "live_jobs": stats.total_jobs or 0,
            "hiring_companies": stats.total_companies or 0,
            "registered_candidates": stats.total_candidates or 0,
            "countries": 28
        }
    )


@router.get(
    "/applications",
    response_model=ResponseEnvelope[PaginatedAdminApplicationResponse],
    summary="List all applications across the platform (Admin only)",
)
async def list_admin_applications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
):
    service = AdminService(session)
    items, total = await service.get_all_applications(
        page=page,
        limit=limit,
        status=status,
        search=search,
    )
    return ResponseEnvelope(
        success=True,
        message="Admin applications retrieved successfully.",
        data=PaginatedAdminApplicationResponse(
            items=[_map_application(app) for app in items],
            total=total,
            page=page,
            limit=limit,
        ),
    )


@router.get(
    "/recent-activity",
    response_model=ResponseEnvelope[List[RecentActivityItem]],
    summary="Get recent platform activity feed (Admin only)",
)
async def get_recent_activity(
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
):
    service = AdminService(session)
    activity = await service.get_recent_activity(limit=limit)
    return ResponseEnvelope(
        success=True,
        message="Recent activity retrieved successfully.",
        data=activity,
    )


@router.get(
    "/companies",
    response_model=ResponseEnvelope[PaginatedAdminCompanyResponse],
    summary="List all registered companies (Admin only)",
)
async def list_admin_companies(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
):
    from app.admin.schemas import PaginatedAdminCompanyResponse
    service = AdminService(session)
    items, total = await service.get_all_companies(page=page, limit=limit, status=status, search=search)
    return ResponseEnvelope(
        success=True,
        message="Admin companies retrieved successfully.",
        data=PaginatedAdminCompanyResponse(items=items, total=total, page=page, limit=limit),
    )


@router.post(
    "/companies/{company_id}/status",
    summary="Approve, reject or suspend a company (Admin only)",
)
async def update_company_status_endpoint(
    company_id: int,
    body: AdminCompanyActionRequest,
    current_user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
):
    service = AdminService(session)
    success = await service.update_company_status(company_id=company_id, action=body.action, reason=body.reason)
    return ResponseEnvelope(
        success=success,
        message=f"Company status updated to {body.action}" if success else "Company not found",
        data={"company_id": company_id, "action": body.action},
    )


@router.get(
    "/search",
    response_model=ResponseEnvelope[AdminGlobalSearchResult],
    summary="Global platform search across companies, users, jobs (Admin only)",
)
async def global_platform_search(
    q: str = Query("", min_length=0),
    current_user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
):
    from app.admin.schemas import AdminGlobalSearchResult
    service = AdminService(session)
    result = await service.global_search(query=q)
    return ResponseEnvelope(
        success=True,
        message="Search completed",
        data=result,
    )
