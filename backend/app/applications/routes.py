from typing import Optional

from fastapi import APIRouter, Depends, Query, status

from app.applications.dependencies import get_application_service
from app.applications.schemas import (
    ApplicationAddNoteRequest,
    ApplicationCreateRequest,
    ApplicationResponse,
    ApplicationStatusUpdateRequest,
    PaginatedApplicationResponse,
    AssignRecruiterRequest,
)
from app.applications.service import ApplicationService
from app.auth.dependencies import get_current_user, require_candidate, require_employer, require_recruiter, require_admin
from app.auth.models import User, UserRole
from app.core.errors import ForbiddenException, NotFoundException
from app.schemas.health import ResponseEnvelope

router = APIRouter(prefix="/applications", tags=["Applications Module"])

@router.post(
    "",
    response_model=ResponseEnvelope[ApplicationResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Submit a job application",
)
async def apply_for_job(
    data: ApplicationCreateRequest,
    current_user: User = Depends(require_candidate),
    service: ApplicationService = Depends(get_application_service),
):
    application = await service.apply_for_job(current_user, data)
    return ResponseEnvelope(
        success=True,
        message="Application submitted successfully.",
        data=ApplicationResponse.model_validate(application),
    )


@router.get(
    "",
    response_model=ResponseEnvelope[PaginatedApplicationResponse],
    summary="List candidate job applications",
)
async def list_candidate_applications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(require_candidate),
    service: ApplicationService = Depends(get_application_service),
):
    items, total = await service.get_candidate_applications(
        candidate=current_user,
        page=page,
        limit=limit,
        status=status,
        search=search,
    )
    return ResponseEnvelope(
        success=True,
        message="Candidate applications retrieved successfully.",
        data=PaginatedApplicationResponse(
            items=[ApplicationResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            limit=limit,
        ),
    )


@router.get(
    "/company",
    response_model=ResponseEnvelope[PaginatedApplicationResponse],
    summary="List company applications for employer users",
)
async def list_company_applications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(require_employer),
    service: ApplicationService = Depends(get_application_service),
):
    company_id = current_user.company_id
    if company_id is None:
        from sqlalchemy import select
        from app.companies.models import Company
        res = await service.session.execute(select(Company.id).where(Company.created_by_id == current_user.id))
        comp_id = res.scalar_one_or_none()
        if comp_id:
            company_id = comp_id

    items, total = await service.get_company_applications(
        company_id=company_id,
        employer_id=current_user.id,
        page=page,
        limit=limit,
        status=status,
        search=search,
    )
    return ResponseEnvelope(
        success=True,
        message="Company applications retrieved successfully.",
        data=PaginatedApplicationResponse(
            items=[ApplicationResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            limit=limit,
        ),
    )


@router.get(
    "/recruiter",
    response_model=ResponseEnvelope[PaginatedApplicationResponse],
    summary="List recruiter-assigned applications",
)
async def list_recruiter_applications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(require_recruiter),
    service: ApplicationService = Depends(get_application_service),
):
    items, total = await service.get_recruiter_applications(
        recruiter=current_user,
        page=page,
        limit=limit,
        status=status,
        search=search,
    )
    return ResponseEnvelope(
        success=True,
        message="Recruiter applications retrieved successfully.",
        data=PaginatedApplicationResponse(
            items=[ApplicationResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            limit=limit,
        ),
    )


@router.get(
    "/{application_id}",
    response_model=ResponseEnvelope[ApplicationResponse],
    summary="Get job application details",
)
async def get_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    service: ApplicationService = Depends(get_application_service),
):
    application = await service.repo.get_by_id(application_id)
    if not application:
        raise NotFoundException(f"Application with ID {application_id} not found.")

    if current_user.role == UserRole.CANDIDATE and application.candidate_id != current_user.id:
        raise ForbiddenException("Access denied to this application.")

    if current_user.role == UserRole.EMPLOYER and application.company_id != current_user.company_id:
        raise ForbiddenException("Access denied to this application.")

    if current_user.role == UserRole.RECRUITER and application.recruiter_id != current_user.id:
        raise ForbiddenException("Access denied to this application.")

    return ResponseEnvelope(
        success=True,
        message="Application details retrieved successfully.",
        data=ApplicationResponse.model_validate(application),
    )


@router.put(
    "/{application_id}/status",
    response_model=ResponseEnvelope[ApplicationResponse],
    summary="Update application status",
)
async def update_application_status(
    application_id: int,
    data: ApplicationStatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    service: ApplicationService = Depends(get_application_service),
):
    updated_application = await service.update_application_status(
        application_id=application_id,
        updater=current_user,
        request=data,
    )
    return ResponseEnvelope(
        success=True,
        message="Application status updated successfully.",
        data=ApplicationResponse.model_validate(updated_application),
    )


@router.post(
    "/{application_id}/notes",
    response_model=ResponseEnvelope[ApplicationResponse],
    summary="Add a note to an application",
)
async def add_application_note(
    application_id: int,
    data: ApplicationAddNoteRequest,
    current_user: User = Depends(get_current_user),
    service: ApplicationService = Depends(get_application_service),
):
    updated_application = await service.add_application_note(
        application_id=application_id,
        updater=current_user,
        note=data.note,
    )
    return ResponseEnvelope(
        success=True,
        message="Application note added successfully.",
        data=ApplicationResponse.model_validate(updated_application),
    )


@router.put(
    "/{application_id}/assign-recruiter",
    response_model=ResponseEnvelope[ApplicationResponse],
    summary="Assign a recruiter to an application (Employer/Admin only)",
)
async def assign_recruiter_to_application(
    application_id: int,
    data: AssignRecruiterRequest,
    current_user: User = Depends(get_current_user),
    service: ApplicationService = Depends(get_application_service),
):
    if current_user.role not in [UserRole.EMPLOYER, UserRole.ADMIN]:
        raise ForbiddenException("Only employers or admins can assign recruiters.")

    updated_application = await service.assign_recruiter(
        application_id=application_id,
        assigner=current_user,
        recruiter_id=data.recruiter_id,
    )
    return ResponseEnvelope(
        success=True,
        message="Recruiter assigned successfully.",
        data=ApplicationResponse.model_validate(updated_application),
    )


@router.get(
    "/admin/all",
    response_model=ResponseEnvelope[PaginatedApplicationResponse],
    summary="List all applications (Admin only) - using AdminService instead if preferred, this is a proxy",
)
async def list_admin_applications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(require_admin),
    service: ApplicationService = Depends(get_application_service),
):
    items, total = await service.repo.list_all(
        page=page,
        limit=limit,
        status=status,
        search=search,
    )
    return ResponseEnvelope(
        success=True,
        message="Admin applications retrieved successfully.",
        data=PaginatedApplicationResponse(
            items=[ApplicationResponse.model_validate(item) for item in items],
            total=total,
            page=page,
            limit=limit,
        ),
    )
