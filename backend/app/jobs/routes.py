import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status

from app.auth.dependencies import get_current_user, get_current_user_optional, require_admin
from app.auth.models import User, UserRole
from app.core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.admin.schemas import AdminNoteCreate
from app.jobs.dependencies import get_job_service
from app.jobs.schemas import (
    JobCreate,
    JobDraftCreate,
    JobUpdate,
    JobResponse,
    PaginatedJobResponse,
)
from app.jobs.service import JobService
from app.schemas.health import ResponseEnvelope

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/jobs", tags=["Jobs Module"])
admin_router = APIRouter(prefix="/admin", tags=["Admin Module Jobs"])

@router.post(
    "",
    response_model=ResponseEnvelope[JobResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Publish a new active Job Posting (Enforces 3-tier access guard)",
)
async def publish_job(
    data: JobCreate,
    current_user: User = Depends(get_current_user),
    service: JobService = Depends(get_job_service),
):
    """Publish a new job. User must have Approved Company, Active Subscription, and Changed Password."""
    print(f"\n[BACKEND DEBUG] publish_job called by User: {current_user.email}, Role: {current_user.role}, ID: {current_user.id}\n", flush=True)
    logger.warning(f"[BACKEND DEBUG] publish_job called by User: {current_user.email}, Role: {current_user.role}, ID: {current_user.id}")
    job = await service.create_job(data, creator=current_user, is_draft=False)
    return ResponseEnvelope(
        success=True,
        message="Job published successfully.",
        data=JobResponse.model_validate(job),
    )

@router.post(
    "/draft",
    response_model=ResponseEnvelope[JobResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Save a partial Job Draft (Access check exempt)",
)
async def save_job_draft(
    data: JobDraftCreate,
    current_user: User = Depends(get_current_user),
    service: JobService = Depends(get_job_service),
):
    """Save a job posting draft. Exempt from strict active subscription/approval guards."""
    job = await service.create_job_draft(data, creator=current_user)
    return ResponseEnvelope(
        success=True,
        message="Job draft saved successfully.",
        data=JobResponse.model_validate(job),
    )

@router.get(
    "",
    response_model=ResponseEnvelope[PaginatedJobResponse],
    summary="GET /api/v1/jobs - Smart Job Listing endpoint for Candidate / Employer / Admin",
)
async def list_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=500),
    status: Optional[str] = Query(None, description="Filter jobs by status (active, draft, closed)"),
    search: Optional[str] = Query(None, description="Search jobs by title"),
    category: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    experience: Optional[str] = Query(None),
    work_mode: Optional[str] = Query(None),
    job_type: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    salary_min: Optional[int] = Query(None),
    salary_max: Optional[int] = Query(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    service: JobService = Depends(get_job_service),
):
    """Fetch paginated job listings directly from MySQL.
    If called by Employer/Recruiter, fetches employer company jobs.
    If called by Admin, fetches all jobs.
    Otherwise (Candidate / Public), fetches live published jobs.
    """
    if current_user and current_user.role in [UserRole.EMPLOYER, UserRole.RECRUITER]:
        items, total = await service.list_jobs(
            user=current_user,
            page=page,
            limit=limit,
            status=status,
            search=search
        )
    elif current_user and current_user.role == UserRole.ADMIN:
        items, total = await service.admin_list_all_jobs(
            page=page,
            limit=limit,
            status=status,
            search=search
        )
    else:
        items, total = await service.search_public_jobs(
            search=search,
            category=category,
            role=role,
            experience=experience,
            work_mode=work_mode,
            job_type=job_type,
            country=country,
            state=state,
            city=city,
            salary_min=salary_min,
            salary_max=salary_max,
            page=page,
            limit=limit
        )

    logger.info(f"Backend GET /api/v1/jobs - Total jobs returned: {total}")
    print(f"[Backend LOG] GET /api/v1/jobs - Total jobs returned: {total}")

    from sqlalchemy import select, func
    from app.applications.models import Application

    response_items = []
    for item in items:
        resp = JobResponse.model_validate(item)
        cnt_res = await service.session.execute(
            select(func.count(Application.id)).where(Application.job_id == item.id)
        )
        resp.applications_count = cnt_res.scalar() or 0
        response_items.append(resp)

    return ResponseEnvelope(
        success=True,
        message="Jobs list retrieved successfully.",
        data=PaginatedJobResponse(
            items=response_items,
            total=total,
            page=page,
            limit=limit
        ),
    )

@router.get(
    "/search",
    response_model=ResponseEnvelope[PaginatedJobResponse],
    summary="Search public active jobs for candidates",
)
async def search_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    experience: Optional[str] = Query(None),
    work_mode: Optional[str] = Query(None),
    job_type: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    salary_min: Optional[int] = Query(None),
    salary_max: Optional[int] = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    service: JobService = Depends(get_job_service),
):
    """Retrieve public job postings (only shows active jobs from approved companies with active subscriptions)."""
    items, total = await service.search_public_jobs(
        search=search,
        category=category,
        role=role,
        experience=experience,
        work_mode=work_mode,
        job_type=job_type,
        country=country,
        state=state,
        city=city,
        salary_min=salary_min,
        salary_max=salary_max,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        limit=limit
    )

    logger.info(f"Backend GET /api/v1/jobs/search - Total jobs returned: {total}")
    print(f"[Backend LOG] GET /api/v1/jobs/search - Total public jobs returned: {total}")

    return ResponseEnvelope(
        success=True,
        message="Public jobs list retrieved successfully.",
        data=PaginatedJobResponse(
            items=[JobResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            limit=limit
        )
    )


@router.get(
    "/{job_id}",
    response_model=ResponseEnvelope[JobResponse],
    summary="Get single Job posting details (public for candidates, managed for employers)",
)
async def get_job(
    job_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    service: JobService = Depends(get_job_service),
):
    """Retrieve details and screening questions for a specific job posting.
    - Candidates / unauthenticated: can read any active public job.
    - Employers / Recruiters: routed through employer access guard.
    """
    job = await service.get_job_by_id(job_id=job_id, user=current_user)
    return ResponseEnvelope(
        success=True,
        message="Job details retrieved successfully.",
        data=JobResponse.model_validate(job),
    )


@router.put(
    "/{job_id}",
    response_model=ResponseEnvelope[JobResponse],
    summary="Update an existing Job posting or draft",
)
async def update_job(
    job_id: int,
    data: JobUpdate,
    current_user: User = Depends(get_current_user),
    service: JobService = Depends(get_job_service),
):
    """Update details of a job posting. If status is updated to 'active', access control checks apply."""
    job = await service.update_job(job_id=job_id, data=data, user=current_user)
    return ResponseEnvelope(
        success=True,
        message="Job updated successfully.",
        data=JobResponse.model_validate(job),
    )


@router.delete(
    "/{job_id}",
    response_model=ResponseEnvelope[JobResponse],
    summary="Soft delete a Job posting",
)
async def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    service: JobService = Depends(get_job_service),
):
    """Soft delete a job posting from the system."""
    job = await service.delete_job(job_id=job_id, user=current_user)
    return ResponseEnvelope(
        success=True,
        message="Job deleted successfully.",
        data=JobResponse.model_validate(job),
    )


@router.get(
    "/admin/stats",
    summary="Get job statistics for Platform Admin Dashboard",
)
async def get_admin_stats(
    current_user: Optional[User] = Depends(get_current_user_optional),
    service: JobService = Depends(get_job_service),
):
    """Get job status and company breakdown counts (Admin only)."""
    stats = await service.get_admin_job_stats()
    return ResponseEnvelope(
        success=True,
        message="Admin job statistics retrieved successfully.",
        data=stats
    )

@router.get(
    "/admin/all",
    response_model=ResponseEnvelope[PaginatedJobResponse],
    summary="List all job postings across the platform for admins",
)
@router.get(
    "/admin/jobs",
    response_model=ResponseEnvelope[PaginatedJobResponse],
    summary="List all job postings across the platform for admins",
)
async def admin_list_all(
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=200),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    service: JobService = Depends(get_job_service),
):
    """Retrieve all jobs across the platform (Admin only)."""
    items, total = await service.admin_list_all_jobs(
        page=page,
        limit=limit,
        status=status,
        search=search
    )

    from sqlalchemy import select, func
    from app.applications.models import Application

    response_items = []
    for item in items:
        resp = JobResponse.model_validate(item)
        cnt_res = await service.session.execute(
            select(func.count(Application.id)).where(Application.job_id == item.id)
        )
        resp.applications_count = cnt_res.scalar() or 0
        response_items.append(resp)

    logger.info(f"Backend GET /api/v1/jobs/admin/all - Total admin jobs returned: {total}")

    return ResponseEnvelope(
        success=True,
        message="Admin jobs list retrieved successfully.",
        data=PaginatedJobResponse(
            items=response_items,
            total=total,
            page=page,
            limit=limit
        )
    )

# Dedicated Admin Router Endpoint GET /api/v1/admin/jobs
@admin_router.get(
    "/jobs",
    response_model=ResponseEnvelope[PaginatedJobResponse],
    summary="GET /api/v1/admin/jobs - List all job postings across the platform for admins",
)
async def admin_jobs_endpoint(
    page: int = Query(1, ge=1),
    limit: int = Query(500, ge=1, le=500),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    service: JobService = Depends(get_job_service),
):
    """Retrieve all jobs across the platform directly from MySQL (Admin)."""
    items, total = await service.admin_list_all_jobs(
        page=page,
        limit=limit,
        status=status,
        search=search
    )

    from sqlalchemy import select, func
    from app.applications.models import Application

    response_items = []
    for item in items:
        resp = JobResponse.model_validate(item)
        cnt_res = await service.session.execute(
            select(func.count(Application.id)).where(Application.job_id == item.id)
        )
        resp.applications_count = cnt_res.scalar() or 0
        response_items.append(resp)

    logger.info(f"Backend GET /api/v1/admin/jobs - Total admin jobs returned: {total}")

    return ResponseEnvelope(
        success=True,
        message="Admin jobs list retrieved successfully.",
        data=PaginatedJobResponse(
            items=response_items,
            total=total,
            page=page,
            limit=limit
        )
    )


# ── Super Admin Drill-Down APIs (Company -> Jobs -> Applicants -> Candidate) ──

@admin_router.get(
    "/jobs/companies",
    summary="GET /api/v1/admin/jobs/companies - List companies with job stats for Admin Jobs landing page",
)
async def get_admin_jobs_companies(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    active_filter: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    from app.admin.service import AdminService
    service = AdminService(session)
    items, total = await service.get_companies_with_jobs(
        page=page, limit=limit, search=search, industry=industry, status=status, active_filter=active_filter
    )
    return ResponseEnvelope(
        success=True,
        message="Admin company job summaries retrieved successfully.",
        data={"items": items, "total": total, "page": page, "limit": limit},
    )


@admin_router.get(
    "/companies/{company_id}/jobs",
    summary="GET /api/v1/admin/companies/{company_id}/jobs - List jobs for specific company with header metrics",
)
async def get_admin_company_jobs(
    company_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    from app.admin.service import AdminService
    service = AdminService(session)
    result = await service.get_company_jobs(
        company_id=company_id, page=page, limit=limit, status=status, search=search
    )
    if not result:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Company not found")

    return ResponseEnvelope(
        success=True,
        message="Company jobs retrieved successfully.",
        data=result,
    )


@admin_router.get(
    "/jobs/{job_id}",
    summary="GET /api/v1/admin/jobs/{job_id} - Get single job details with applicant status breakdown",
)
async def get_admin_job_detail(
    job_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    from app.admin.service import AdminService
    service = AdminService(session)
    job_detail = await service.get_job_details_admin(job_id=job_id)
    if not job_detail:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Job posting not found")

    return ResponseEnvelope(
        success=True,
        message="Job details retrieved successfully.",
        data=job_detail,
    )


@admin_router.get(
    "/jobs/{job_id}/applications",
    summary="GET /api/v1/admin/jobs/{job_id}/applications - List candidates who applied to specific job",
)
async def get_admin_job_applications(
    job_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    from app.admin.service import AdminService
    service = AdminService(session)
    items, total = await service.get_job_applications_admin(
        job_id=job_id, page=page, limit=limit, status=status, search=search
    )
    return ResponseEnvelope(
        success=True,
        message="Job applicants retrieved successfully.",
        data={"items": items, "total": total, "page": page, "limit": limit},
    )


@admin_router.get(
    "/applications/{application_id}",
    summary="GET /api/v1/admin/applications/{application_id} - Get comprehensive candidate application detail",
)
async def get_admin_application_detail(
    application_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    from app.admin.service import AdminService
    service = AdminService(session)
    app_detail = await service.get_application_detail_admin(application_id=application_id)
    if not app_detail:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Application detail not found")

    return ResponseEnvelope(
        success=True,
        message="Candidate application details retrieved successfully.",
        data=app_detail,
    )


@admin_router.post(
    "/applications/{application_id}/notes",
    summary="POST /api/v1/admin/applications/{application_id}/notes - Add admin note to candidate application",
)
async def add_admin_application_note_endpoint(
    application_id: int,
    body: AdminNoteCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    from app.admin.service import AdminService
    service = AdminService(session)
    author_name = current_user.name if (current_user and current_user.name) else "Super Admin"
    updated_notes = await service.add_admin_application_note(
        application_id=application_id, note=body.note, author_name=author_name
    )
    if updated_notes is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Application not found")

    return ResponseEnvelope(
        success=True,
        message="Admin note added successfully.",
        data={"notes": updated_notes},
    )



