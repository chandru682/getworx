from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status

from app.auth.dependencies import get_current_user, get_current_user_optional, require_admin
from app.auth.models import User
from app.companies.dependencies import (
    get_company_service,
    require_company_manage_access,
)
from app.companies.models import CompanyStatus
from app.companies.schemas import (
    CompanyApproveRequest,
    CompanyApproveResponse,
    CompanyBranchCreate,
    CompanyBranchResponse,
    CompanyBranchUpdate,
    CompanyCreate,
    CompanyDocumentCreate,
    CompanyDocumentResponse,
    CompanyLogoUpdate,
    CompanyRejectRequest,
    CompanyRequestChangesRequest,
    CompanyResponse,
    CompanySettingsResponse,
    CompanySettingsUpdate,
    CompanyStatisticsResponse,
    CompanyStatusUpdate,
    CompanyUpdate,
    CompanyVerificationUpdate,
    PaginatedCompanyResponse,
    RecruiterInviteRequest,
    RecruiterInviteResponse,
    RecruiterResendInviteRequest,
    RecruiterListResponse,
    ResendWelcomeEmailResponse,
)
from app.companies.service import CompanyService
from app.schemas.health import ResponseEnvelope

router = APIRouter(prefix="/companies", tags=["Companies Module"])


@router.post(
    "/invite-recruiter",
    response_model=ResponseEnvelope[RecruiterInviteResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Invite Recruiter and Dispatch Temporary Password via Email",
)
@router.post(
    "/invite-recruiter/",
    response_model=ResponseEnvelope[RecruiterInviteResponse],
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
async def invite_recruiter(
    data: RecruiterInviteRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    service: CompanyService = Depends(get_company_service),
):
    """Generate temporary password, create recruiter account, and email invitation to a new recruiter."""
    result = await service.invite_recruiter(data, user=current_user)
    # Determine response message: warning takes precedence if email failed
    response_message = result.warning or "Recruiter invitation sent successfully with temporary password."
    return ResponseEnvelope(
        success=True,
        message=response_message,
        data=result,
    )


@router.post(
    "/resend-recruiter-invite",
    response_model=ResponseEnvelope[RecruiterInviteResponse],
    status_code=status.HTTP_200_OK,
    summary="Resend Recruiter Invitation Email",
)
@router.post(
    "/resend-recruiter-invite/",
    response_model=ResponseEnvelope[RecruiterInviteResponse],
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
)
async def resend_recruiter_invite(
    data: RecruiterResendInviteRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    service: CompanyService = Depends(get_company_service),
):
    """Resend invitation email to a recruiter whose invitation failed or expired."""
    result = await service.resend_recruiter_invitation(data, user=current_user)
    response_message = result.warning or "Recruiter invitation resent successfully."
    return ResponseEnvelope(
        success=True,
        message=response_message,
        data=result,
    )


@router.get(
    "/recruiters",
    response_model=ResponseEnvelope[List[RecruiterListResponse]],
    status_code=status.HTTP_200_OK,
    summary="List Recruiters for Employer's Company or All Platform Recruiters",
)
async def list_company_recruiters(
    company_name: Optional[str] = Query(None, description="Company name to filter recruiters by (optional)"),
    service: CompanyService = Depends(get_company_service),
):
    """Fetch invited recruiters (filtered by company_name if provided, or all if omitted)."""
    recruiters = await service.list_company_recruiters(company_name=company_name)
    return ResponseEnvelope(
        success=True,
        message="Company recruiters retrieved successfully.",
        data=[RecruiterListResponse.model_validate(r) for r in recruiters],
    )




@router.post(
    "",
    response_model=ResponseEnvelope[CompanyResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new Company Application",
)
@router.post(
    "/registration",
    response_model=ResponseEnvelope[CompanyResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Submit Company Registration Application",
)
async def create_company(
    data: CompanyCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    service: CompanyService = Depends(get_company_service),
):
    """Register a new enterprise company application. Default status = PENDING_VERIFICATION."""
    company = await service.create_company(data, creator=current_user)
    return ResponseEnvelope(
        success=True,
        message="Company registration submitted successfully. Application is pending verification.",
        data=CompanyResponse.model_validate(company),
    )



@router.get(
    "/pending",
    response_model=ResponseEnvelope[PaginatedCompanyResponse],
    summary="List Pending Companies for Review (RBAC: Platform Admin)",
)
async def list_pending_companies(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    admin_user: User = Depends(require_admin),
    service: CompanyService = Depends(get_company_service),
):
    result = await service.list_pending_companies(page=page, limit=limit, admin_user=admin_user)
    return ResponseEnvelope(
        success=True,
        message="Pending companies retrieved successfully",
        data=result,
    )


@router.get(
    "/my-company",
    response_model=ResponseEnvelope[CompanyResponse],
    summary="Get Logged-in Employer's Company Profile",
)
async def get_my_company(
    current_user: User = Depends(get_current_user),
    service: CompanyService = Depends(get_company_service),
):
    """Fetch company profile details for the authenticated employer."""
    company = await service.get_my_company(current_user)
    return ResponseEnvelope(
        success=True,
        message="Employer company retrieved successfully",
        data=CompanyResponse.model_validate(company),
    )


@router.get(
    "",
    response_model=ResponseEnvelope[PaginatedCompanyResponse],
    summary="List Companies with Search & Pagination",
)
async def list_companies(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search name, legal name, code, description"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    country: Optional[str] = Query(None, description="Filter by country"),
    company_status: Optional[CompanyStatus] = Query(None, alias="status", description="Filter by status"),
    approval_status: Optional[CompanyStatus] = Query(None, description="Filter by approval status"),
    sort_by: str = Query("created_at", description="Field to sort by"),
    order: str = Query("desc", description="Sort order (asc or desc)"),
    service: CompanyService = Depends(get_company_service),
):
    """Search and filter companies with paginated response."""
    result = await service.list_companies(
        page=page,
        limit=limit,
        search=search,
        industry=industry,
        country=country,
        status=company_status,
        approval_status=approval_status,
        sort_by=sort_by,
        order=order,
    )
    return ResponseEnvelope(
        success=True,
        message="Companies retrieved successfully",
        data=result,
    )


@router.get(
    "/{company_id}",
    response_model=ResponseEnvelope[CompanyResponse],
    summary="Get Company Profile by ID",
)
async def get_company(
    company_id: int,
    service: CompanyService = Depends(get_company_service),
):
    """Fetch company profile details by ID."""
    company = await service.get_company(company_id)
    return ResponseEnvelope(
        success=True,
        message="Company profile retrieved successfully",
        data=CompanyResponse.model_validate(company),
    )


@router.get(
    "/code/{code}",
    response_model=ResponseEnvelope[CompanyResponse],
    summary="Get Company Profile by Code",
)
async def get_company_by_code(
    code: str,
    service: CompanyService = Depends(get_company_service),
):
    """Fetch company profile details by unique company code."""
    company = await service.get_company_by_code(code)
    return ResponseEnvelope(
        success=True,
        message="Company profile retrieved successfully",
        data=CompanyResponse.model_validate(company),
    )


# --- Documents Management Endpoints ---

@router.post(
    "/{company_id}/documents",
    response_model=ResponseEnvelope[CompanyDocumentResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Upload Required Document",
)
async def upload_document(
    company_id: int,
    data: CompanyDocumentCreate,
    current_user: User = Depends(get_current_user),
    service: CompanyService = Depends(get_company_service),
):
    """Upload verification document (Company Registration, GST/Tax, Business License, Logo)."""
    doc = await service.upload_document(company_id, data, user=current_user)
    return ResponseEnvelope(
        success=True,
        message="Document uploaded successfully",
        data=CompanyDocumentResponse.model_validate(doc),
    )


@router.get(
    "/{company_id}/documents",
    response_model=ResponseEnvelope[List[CompanyDocumentResponse]],
    summary="List Uploaded Company Documents",
)
async def list_documents(
    company_id: int,
    current_user: User = Depends(get_current_user),
    service: CompanyService = Depends(get_company_service),
):
    """Fetch all uploaded verification documents for a company."""
    docs = await service.list_documents(company_id, user=current_user)
    return ResponseEnvelope(
        success=True,
        message="Company documents retrieved successfully",
        data=[CompanyDocumentResponse.model_validate(d) for d in docs],
    )


# --- Approval Workflow Action Endpoints ---

@router.post(
    "/{company_id}/submit",
    response_model=ResponseEnvelope[CompanyResponse],
    summary="Submit / Resubmit Application for Approval",
)
async def submit_company_application(
    company_id: int,
    current_user: User = Depends(get_current_user),
    service: CompanyService = Depends(get_company_service),
):
    """Submit or resubmit company registration application to Platform Admin for verification."""
    company = await service.submit_for_approval(company_id, user=current_user)
    return ResponseEnvelope(
        success=True,
        message="Company registration submitted for verification",
        data=CompanyResponse.model_validate(company),
    )


@router.post(
    "/{company_id}/approve",
    response_model=ResponseEnvelope[CompanyApproveResponse],
    summary="Approve Company Application (RBAC: Platform Admin)",
)
async def approve_company(
    company_id: int,
    payload: Optional[CompanyApproveRequest] = None,
    admin_user: User = Depends(require_admin),
    service: CompanyService = Depends(get_company_service),
):
    """Approve company application, auto-provision Employer account, and dispatch Welcome Email (Platform Admin only)."""
    notes = payload.notes if payload else None
    result = await service.approve_company(company_id, admin_user=admin_user, notes=notes)
    response_message = result.warning or "Company approved successfully. Employer account created and welcome email sent."
    return ResponseEnvelope(
        success=True,
        message=response_message,
        data=result,
    )


@router.post(
    "/{company_id}/resend-welcome-email",
    response_model=ResponseEnvelope[ResendWelcomeEmailResponse],
    summary="Resend Welcome Email to Employer (RBAC: Platform Admin)",
)
async def resend_welcome_email(
    company_id: int,
    admin_user: User = Depends(require_admin),
    service: CompanyService = Depends(get_company_service),
):
    """Resend Welcome Email with a new temporary password to the Employer account (Platform Admin only)."""
    result = await service.resend_welcome_email(company_id, admin_user=admin_user)
    response_message = result.warning or result.message
    return ResponseEnvelope(
        success=True,
        message=response_message,
        data=result,
    )


@router.post(
    "/{company_id}/reject",
    response_model=ResponseEnvelope[CompanyResponse],
    summary="Reject Company Application (RBAC: Platform Admin)",
)
async def reject_company(
    company_id: int,
    payload: CompanyRejectRequest,
    admin_user: User = Depends(require_admin),
    service: CompanyService = Depends(get_company_service),
):
    """Reject company registration application with rejection reason (Platform Admin only)."""
    company = await service.reject_company(
        company_id, admin_user=admin_user, rejection_reason=payload.rejection_reason
    )
    return ResponseEnvelope(
        success=True,
        message="Company application has been rejected.",
        data=CompanyResponse.model_validate(company),
    )


@router.post(
    "/{company_id}/request-changes",
    response_model=ResponseEnvelope[CompanyResponse],
    summary="Request Changes on Company Application (RBAC: Platform Admin)",
)
async def request_changes(
    company_id: int,
    payload: CompanyRequestChangesRequest,
    admin_user: User = Depends(require_admin),
    service: CompanyService = Depends(get_company_service),
):
    """Request changes on company application with admin feedback comments (Platform Admin only)."""
    company = await service.request_changes(
        company_id, admin_user=admin_user, comments=payload.comments
    )
    return ResponseEnvelope(
        success=True,
        message="Changes requested for company application.",
        data=CompanyResponse.model_validate(company),
    )


@router.post(
    "/{company_id}/suspend",
    response_model=ResponseEnvelope[CompanyResponse],
    summary="Suspend Company (RBAC: Platform Admin)",
)
async def suspend_company(
    company_id: int,
    admin_user: User = Depends(require_admin),
    service: CompanyService = Depends(get_company_service),
):
    """Suspend an active company account (Platform Admin only)."""
    company = await service.suspend_company(company_id, admin_user=admin_user)
    return ResponseEnvelope(
        success=True,
        message="Company account suspended.",
        data=CompanyResponse.model_validate(company),
    )


@router.post(
    "/{company_id}/activate",
    response_model=ResponseEnvelope[CompanyResponse],
    summary="Activate Company (RBAC: Platform Admin)",
)
async def activate_company(
    company_id: int,
    admin_user: User = Depends(require_admin),
    service: CompanyService = Depends(get_company_service),
):
    """Activate or re-activate a company account (Platform Admin only)."""
    company = await service.activate_company(company_id, admin_user=admin_user)
    return ResponseEnvelope(
        success=True,
        message="Company account activated.",
        data=CompanyResponse.model_validate(company),
    )



@router.put(
    "/{company_id}",
    response_model=ResponseEnvelope[CompanyResponse],
    summary="Update Company Profile (RBAC: Admin / Company Admin)",
)
async def update_company(
    company_id: int,
    data: CompanyUpdate,
    current_user: User = Depends(get_current_user),
    service: CompanyService = Depends(get_company_service),
):
    """Update company details (Restricted to Platform Admin or Company Owner/Admin)."""
    company = await service.update_company(company_id, data, user=current_user)
    return ResponseEnvelope(
        success=True,
        message="Company profile updated successfully",
        data=CompanyResponse.model_validate(company),
    )


@router.patch(
    "/{company_id}/logo",
    response_model=ResponseEnvelope[CompanyResponse],
    summary="Upload/Change Company Logo",
)
async def update_company_logo(
    company_id: int,
    data: CompanyLogoUpdate,
    current_user: User = Depends(get_current_user),
    service: CompanyService = Depends(get_company_service),
):
    """Update company logo URL."""
    company = await service.update_logo(company_id, logo_url=data.logo_url, user=current_user)
    return ResponseEnvelope(
        success=True,
        message="Company logo updated successfully",
        data=CompanyResponse.model_validate(company),
    )


@router.patch(
    "/{company_id}/status",
    response_model=ResponseEnvelope[CompanyResponse],
    summary="Update Company Status",
)
async def update_company_status(
    company_id: int,
    data: CompanyStatusUpdate,
    current_user: User = Depends(get_current_user),
    service: CompanyService = Depends(get_company_service),
):
    """Update company status (Active, Inactive, Suspended, Pending Verification)."""
    company = await service.update_status(company_id, status=data.status, user=current_user)
    return ResponseEnvelope(
        success=True,
        message=f"Company status updated to '{data.status.value}'",
        data=CompanyResponse.model_validate(company),
    )


@router.patch(
    "/{company_id}/verify",
    response_model=ResponseEnvelope[CompanyResponse],
    summary="Verify Company (RBAC: Platform Admin)",
)
async def verify_company(
    company_id: int,
    data: CompanyVerificationUpdate,
    admin_user: User = Depends(require_admin),
    service: CompanyService = Depends(get_company_service),
):
    """Verify or revoke verification for a company (Platform Admin only)."""
    company = await service.verify_company(
        company_id, is_verified=data.is_verified, admin_user=admin_user
    )
    return ResponseEnvelope(
        success=True,
        message=f"Company verification set to {data.is_verified}",
        data=CompanyResponse.model_validate(company),
    )


@router.delete(
    "/{company_id}",
    response_model=ResponseEnvelope[dict],
    summary="Soft Delete Company",
)
async def delete_company(
    company_id: int,
    current_user: User = Depends(get_current_user),
    service: CompanyService = Depends(get_company_service),
):
    """Soft delete company record."""
    await service.delete_company(company_id, user=current_user)
    return ResponseEnvelope(
        success=True,
        message="Company record soft deleted successfully",
        data={"company_id": company_id},
    )


@router.get(
    "/{company_id}/statistics",
    response_model=ResponseEnvelope[CompanyStatisticsResponse],
    summary="Get Company Statistics",
)
async def get_company_statistics(
    company_id: int,
    service: CompanyService = Depends(get_company_service),
):
    """Retrieve real-time metrics for recruiters, employers, jobs, and candidates."""
    stats = await service.get_statistics(company_id)
    return ResponseEnvelope(
        success=True,
        message="Company statistics retrieved successfully",
        data=stats,
    )


# --- Branch Management Endpoints ---

@router.post(
    "/{company_id}/branches",
    response_model=ResponseEnvelope[CompanyBranchResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Add Company Branch",
)
async def add_branch(
    company_id: int,
    data: CompanyBranchCreate,
    current_user: User = Depends(get_current_user),
    service: CompanyService = Depends(get_company_service),
):
    """Add a new branch location for a company."""
    branch = await service.add_branch(company_id, data, user=current_user)
    return ResponseEnvelope(
        success=True,
        message="Company branch added successfully",
        data=CompanyBranchResponse.model_validate(branch),
    )


@router.get(
    "/{company_id}/branches",
    response_model=ResponseEnvelope[List[CompanyBranchResponse]],
    summary="List Company Branches",
)
async def list_branches(
    company_id: int,
    service: CompanyService = Depends(get_company_service),
):
    """List all branches belonging to a company."""
    branches = await service.list_branches(company_id)
    return ResponseEnvelope(
        success=True,
        message="Company branches retrieved successfully",
        data=[CompanyBranchResponse.model_validate(b) for b in branches],
    )


@router.put(
    "/{company_id}/branches/{branch_id}",
    response_model=ResponseEnvelope[CompanyBranchResponse],
    summary="Update Company Branch",
)
async def update_branch(
    company_id: int,
    branch_id: int,
    data: CompanyBranchUpdate,
    current_user: User = Depends(get_current_user),
    service: CompanyService = Depends(get_company_service),
):
    """Update details of a company branch."""
    branch = await service.update_branch(company_id, branch_id, data, user=current_user)
    return ResponseEnvelope(
        success=True,
        message="Company branch updated successfully",
        data=CompanyBranchResponse.model_validate(branch),
    )


@router.delete(
    "/{company_id}/branches/{branch_id}",
    response_model=ResponseEnvelope[dict],
    summary="Delete Company Branch",
)
async def delete_branch(
    company_id: int,
    branch_id: int,
    current_user: User = Depends(get_current_user),
    service: CompanyService = Depends(get_company_service),
):
    """Delete a company branch."""
    await service.delete_branch(company_id, branch_id, user=current_user)
    return ResponseEnvelope(
        success=True,
        message="Company branch deleted successfully",
        data={"company_id": company_id, "branch_id": branch_id},
    )


# --- Settings Management Endpoints ---

@router.get(
    "/{company_id}/settings",
    response_model=ResponseEnvelope[CompanySettingsResponse],
    summary="Get Company Settings",
)
async def get_settings(
    company_id: int,
    service: CompanyService = Depends(get_company_service),
):
    """Fetch company localization settings."""
    settings_obj = await service.get_settings(company_id)
    return ResponseEnvelope(
        success=True,
        message="Company settings retrieved successfully",
        data=CompanySettingsResponse.model_validate(settings_obj),
    )


@router.put(
    "/{company_id}/settings",
    response_model=ResponseEnvelope[CompanySettingsResponse],
    summary="Update Company Settings",
)
async def update_settings(
    company_id: int,
    data: CompanySettingsUpdate,
    current_user: User = Depends(get_current_user),
    service: CompanyService = Depends(get_company_service),
):
    """Update company localization preferences (Time Zone, Currency, Language, Date Format)."""
    settings_obj = await service.update_settings(company_id, data, user=current_user)
    return ResponseEnvelope(
        success=True,
        message="Company settings updated successfully",
        data=CompanySettingsResponse.model_validate(settings_obj),
    )

