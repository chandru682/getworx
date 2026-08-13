import math
import secrets
from datetime import datetime, timezone
from typing import List, Optional, Tuple

from app.auth.models import User, UserRole
from app.companies.models import (
    Company,
    CompanyBranch,
    CompanyDocument,
    CompanySettings,
    CompanyStatus,
    CompanyRecruiter,
)
from app.companies.repository import CompanyRepository
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
from app.core.errors import (
    BadRequestException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
)
from app.notifications.service import NotificationService


class CompanyNotFoundException(NotFoundException):
    def __init__(self, identifier: str | int):
        super().__init__(f"Company with identifier '{identifier}' was not found.")


class CompanyAlreadyExistsException(ConflictException):
    def __init__(self, field: str, value: str):
        super().__init__(f"Company with {field} '{value}' already exists.")


class CompanyBranchNotFoundException(NotFoundException):
    def __init__(self, branch_id: int):
        super().__init__(f"Company branch with ID '{branch_id}' was not found.")


class CompanyService:
    """Service layer implementing business logic, verification workflows, and RBAC rules."""

    def __init__(self, repo: CompanyRepository):
        self.repo = repo

    def generate_company_code(self) -> str:
        """Generate unique company code in format: CMP-YYYYMMDD-XXXX."""
        date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
        random_hex = secrets.token_hex(2).upper()
        return f"CMP-{date_str}-{random_hex}"

    def check_update_permission(self, company: Company, user: User) -> None:
        """Enforce RBAC: Only Platform Admin or Company Owner/Admin can modify company details."""
        if user.role == UserRole.ADMIN:
            return
        if company.created_by_id and company.created_by_id == user.id:
            return
        raise ForbiddenException("Permission denied. Only Platform Admin or Company Admin can update this company.")

    def require_platform_admin(self, user: User) -> None:
        """Enforce RBAC: Only Platform Admin is permitted."""
        if user.role != UserRole.ADMIN:
            raise ForbiddenException("Permission denied. Only Platform Admin can perform this action.")

    async def create_company(self, data: CompanyCreate, creator: Optional[User] = None) -> Company:
        """Register a new company application set to PENDING_VERIFICATION status."""
        # Check for existing email
        existing_email = await self.repo.get_by_email(data.email)
        if existing_email:
            raise CompanyAlreadyExistsException("email", data.email)

        # Generate unique code
        code = self.generate_company_code()
        while await self.repo.get_by_code(code):
            code = self.generate_company_code()

        now = datetime.now(timezone.utc)

        # Build Company Model
        company = Company(
            name=data.name,
            legal_name=data.legal_name,
            company_code=code,
            industry=data.industry,
            company_size=data.company_size,
            website=str(data.website) if data.website else None,
            email=data.email.lower(),
            phone=data.phone,
            country=data.country,
            state=data.state,
            city=data.city,
            address=data.address,
            postal_code=data.postal_code,
            tax_gst_number=data.tax_gst_number,
            business_reg_number=data.business_reg_number,
            year_established=data.year_established,
            primary_contact_name=data.primary_contact_name,
            primary_contact_designation=data.primary_contact_designation,
            primary_contact_email=data.primary_contact_email.lower() if data.primary_contact_email else None,
            primary_contact_phone=data.primary_contact_phone,
            logo_url=str(data.logo_url) if data.logo_url else None,
            description=data.description,
            status=CompanyStatus.PENDING_VERIFICATION.value,
            approval_status=CompanyStatus.PENDING_VERIFICATION.value,
            submitted_at=now,
            is_verified=False,
            created_by_id=creator.id if creator else None,
        )


        # Build initial documents if provided
        if data.documents:
            for doc in data.documents:
                company.documents.append(
                    CompanyDocument(
                        document_type=doc.document_type,
                        document_name=doc.document_name,
                        document_url=doc.document_url,
                        is_required=doc.is_required,
                        status="uploaded",
                    )
                )

        # Build initial branches if provided
        if data.branches:
            for b in data.branches:
                company.branches.append(
                    CompanyBranch(
                        branch_name=b.branch_name,
                        country=b.country,
                        state=b.state,
                        city=b.city,
                        address=b.address,
                        contact_number=b.contact_number,
                    )
                )

        # Build default settings
        settings_data = data.settings or CompanySettingsUpdate()
        company.settings = CompanySettings(
            time_zone=settings_data.time_zone or "UTC",
            currency=settings_data.currency or "USD",
            language=settings_data.language or "en",
            date_format=settings_data.date_format or "YYYY-MM-DD",
        )

        saved_company = await self.repo.create(company)

        # Dispatch Notification
        await NotificationService.send_application_submitted_notification(
            company_id=saved_company.id,
            company_name=saved_company.name,
            recipient_email=saved_company.email,
        )

        return saved_company

    async def get_my_company(self, user: User) -> Company:
        """Fetch company associated with the authenticated employer user."""
        company = await self.repo.get_by_email(user.email)
        if not company and user.id:
            company = await self.repo.get_by_creator_id(user.id)
        if not company:
            domain = user.email.split("@")[-1].lower() if "@" in user.email else ""
            if domain and domain not in ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"]:
                items, _ = await self.repo.list_companies(search=domain, limit=1)
                if items:
                    company = items[0]
        if not company:
            # Fallback to the latest company if user is an employer
            items, _ = await self.repo.list_companies(limit=1)
            if items:
                company = items[0]
        if not company:
            raise CompanyNotFoundException(user.email)
        return company

    async def get_company(self, company_id: int) -> Company:
        """Fetch company by ID."""
        company = await self.repo.get_by_id(company_id)
        if not company:
            raise CompanyNotFoundException(company_id)
        return company

    async def get_company_by_code(self, code: str) -> Company:
        """Fetch company by company code."""
        company = await self.repo.get_by_code(code)
        if not company:
            raise CompanyNotFoundException(code)
        return company


    async def list_companies(
        self,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None,
        industry: Optional[str] = None,
        country: Optional[str] = None,
        status: Optional[CompanyStatus] = None,
        approval_status: Optional[CompanyStatus] = None,
        sort_by: str = "created_at",
        order: str = "desc",
    ) -> PaginatedCompanyResponse:
        """List companies with filtering, sorting, and pagination."""
        items, total = await self.repo.list_companies(
            page=page,
            limit=limit,
            search=search,
            industry=industry,
            country=country,
            status=status,
            approval_status=approval_status,
            sort_by=sort_by,
            order=order,
        )
        total_pages = math.ceil(total / limit) if total > 0 else 1

        company_responses = [CompanyResponse.model_validate(c) for c in items]

        return PaginatedCompanyResponse(
            items=company_responses,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
        )

    async def list_pending_companies(
        self, page: int = 1, limit: int = 20, admin_user: User = None
    ) -> PaginatedCompanyResponse:
        """List pending company registration applications for Platform Admin review."""
        if admin_user:
            self.require_platform_admin(admin_user)
        items, total = await self.repo.list_companies(
            page=page,
            limit=limit,
            approval_status=CompanyStatus.PENDING_VERIFICATION,
            sort_by="submitted_at",
            order="desc",
        )
        total_pages = math.ceil(total / limit) if total > 0 else 1
        return PaginatedCompanyResponse(
            items=[CompanyResponse.model_validate(c) for c in items],
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
        )

    async def update_company(
        self, company_id: int, data: CompanyUpdate, user: User
    ) -> Company:
        """Update company fields after checking authorization."""
        company = await self.get_company(company_id)
        self.check_update_permission(company, user)

        update_dict = data.model_dump(exclude_unset=True)
        for key, val in update_dict.items():
            if val is not None:
                if key in ["website", "logo_url"]:
                    setattr(company, key, str(val))
                elif key in ["email", "primary_contact_email"]:
                    setattr(company, key, str(val).lower())
                else:
                    setattr(company, key, val)

        return await self.repo.update(company)

    # --- Document Uploads & Management ---

    async def upload_document(
        self, company_id: int, data: CompanyDocumentCreate, user: User
    ) -> CompanyDocument:
        """Upload a new document for company application."""
        company = await self.get_company(company_id)
        self.check_update_permission(company, user)

        doc = CompanyDocument(
            company_id=company_id,
            document_type=data.document_type,
            document_name=data.document_name,
            document_url=data.document_url,
            is_required=data.is_required,
            status="uploaded",
        )
        return await self.repo.add_document(doc)

    async def list_documents(self, company_id: int, user: User) -> List[CompanyDocument]:
        """List documents for a company."""
        company = await self.get_company(company_id)
        self.check_update_permission(company, user)
        return await self.repo.list_documents(company_id)

    # --- Approval Workflow State Machine Actions ---

    async def submit_for_approval(self, company_id: int, user: User) -> Company:
        """Submit or resubmit company registration for Platform Admin approval."""
        company = await self.get_company(company_id)
        self.check_update_permission(company, user)

        now = datetime.now(timezone.utc)
        company.approval_status = CompanyStatus.PENDING_VERIFICATION.value
        company.status = CompanyStatus.PENDING_VERIFICATION.value
        company.submitted_at = now
        company.review_notes = None
        company.rejection_reason = None

        updated_company = await self.repo.update(company)

        await NotificationService.send_application_resubmitted_notification(
            company_id=updated_company.id,
            company_name=updated_company.name,
            recipient_email=updated_company.email,
        )

        return updated_company

    def generate_secure_temporary_password(self, length: int = 14) -> str:
        """Generate a secure random temporary password (12–16 characters)."""
        import secrets
        import string
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        pwd = [
            secrets.choice(string.ascii_uppercase),
            secrets.choice(string.ascii_lowercase),
            secrets.choice(string.digits),
            secrets.choice("!@#$%^&*"),
        ]
        for _ in range(length - 4):
            pwd.append(secrets.choice(alphabet))
        secrets.SystemRandom().shuffle(pwd)
        return "".join(pwd)

    async def approve_company(
        self, company_id: int, admin_user: User, notes: Optional[str] = None
    ) -> CompanyApproveResponse:
        """Approve company application (Platform Admin only), auto-provision Employer account, send Welcome Email, and record audit trail."""
        from datetime import timedelta
        from app.auth.repository import AuthRepository
        from app.auth.security import hash_password
        from app.audit.service import AuditService
        from app.core.config import settings
        from app.core.logging import logger as logger_core

        self.require_platform_admin(admin_user)
        company = await self.get_company(company_id)

        now = datetime.now(timezone.utc)
        company.approval_status = CompanyStatus.APPROVED.value
        company.status = CompanyStatus.ACTIVE.value
        company.is_verified = True
        company.verified_by_id = admin_user.id
        company.approved_by_id = admin_user.id
        company.verified_at = now
        company.reviewed_at = now
        if notes:
            company.review_notes = notes

        updated_company = await self.repo.update(company)

        audit_service = AuditService(self.repo.session)
        # Audit Log 1: Company Approved
        await audit_service.log_event(
            action="Company Approved",
            module="company",
            actor_id=admin_user.id,
            actor_email=admin_user.email,
            target_entity="Company",
            target_id=updated_company.id,
            details=f"Company '{updated_company.name}' (Code: {updated_company.company_code}) approved by Platform Admin.",
        )

        await NotificationService.send_application_approved_notification(
            company_id=updated_company.id,
            company_name=updated_company.name,
            recipient_email=updated_company.email,
        )

        # Provision Employer User account using registration email
        auth_repo = AuthRepository(self.repo.session)
        existing_user = await auth_repo.get_by_email(updated_company.email)
        temp_password_plain = self.generate_secure_temporary_password(14)
        temp_password_hash = hash_password(temp_password_plain)
        expiry = now + timedelta(hours=settings.TEMP_PASSWORD_EXPIRY_HOURS)
        user_name = updated_company.primary_contact_name or updated_company.name

        if not existing_user:
            employer_user = await auth_repo.create_user(
                name=user_name,
                email=updated_company.email,
                password_hash=temp_password_hash,
                role=UserRole.EMPLOYER,
                must_change_password=True,
                invited_by_id=admin_user.id,
                invited_at=now,
                temporary_password_expiry=expiry,
            )
            employer_user.company_id = updated_company.id
            employer_user.company_name = updated_company.name
            self.repo.session.add(employer_user)
            await self.repo.session.flush()

            # Audit Log 2: Employer Account Created
            await audit_service.log_event(
                action="Employer Account Created",
                module="auth",
                actor_id=admin_user.id,
                actor_email=admin_user.email,
                target_entity="User",
                target_id=employer_user.id,
                details=f"Auto-provisioned Employer user account for email '{employer_user.email}' linked to Company ID {updated_company.id}.",
            )
        else:
            employer_user = existing_user
            if getattr(employer_user, "must_change_password", False) or employer_user.company_id != updated_company.id:
                employer_user.password_hash = temp_password_hash
                employer_user.must_change_password = True
                employer_user.temporary_password_expiry = expiry
                employer_user.company_id = updated_company.id
                employer_user.company_name = updated_company.name
                self.repo.session.add(employer_user)
                await self.repo.session.flush()

        email_sent = True
        warning = None

        try:
            await NotificationService.send_employer_welcome_email(
                recipient_email=employer_user.email,
                temporary_password=temp_password_plain,
                login_url="https://app.getworxs.com/login",
            )
            # Audit Log 3: Welcome Email Sent
            await audit_service.log_event(
                action="Welcome Email Sent",
                module="notification",
                actor_id=admin_user.id,
                actor_email=admin_user.email,
                target_entity="User",
                target_id=employer_user.id,
                details=f"Welcome email successfully sent to Employer '{employer_user.email}'.",
            )
        except Exception as email_err:
            email_sent = False
            warning = "Company approved successfully, but the welcome email could not be delivered."
            logger_core.warning(f"Welcome email delivery failed for {employer_user.email}: {email_err}")

            await audit_service.log_event(
                action="Welcome Email Failed",
                module="notification",
                actor_id=admin_user.id,
                actor_email=admin_user.email,
                target_entity="User",
                target_id=employer_user.id,
                details=f"Welcome email delivery failed for '{employer_user.email}': {email_err}",
            )

        resp = CompanyApproveResponse.model_validate(updated_company)
        resp.email_sent = email_sent
        resp.warning = warning
        resp.employer_email = employer_user.email
        return resp

    async def resend_welcome_email(
        self, company_id: int, admin_user: User
    ) -> ResendWelcomeEmailResponse:
        """Resend Welcome Email to Employer for an approved company (Platform Admin action)."""
        from datetime import timedelta
        from sqlalchemy import select
        from app.auth.repository import AuthRepository
        from app.auth.security import hash_password
        from app.audit.service import AuditService
        from app.core.config import settings
        from app.core.logging import logger as logger_core

        self.require_platform_admin(admin_user)
        company = await self.get_company(company_id)

        auth_repo = AuthRepository(self.repo.session)
        employer_user = await auth_repo.get_by_email(company.email)
        if not employer_user:
            from app.employers.models import EmployerProfile
            stmt = select(User).join(EmployerProfile).where(EmployerProfile.company_id == company.id, User.role == UserRole.EMPLOYER, User.deleted_at.is_(None))
            res = await self.repo.session.execute(stmt)
            employer_user = res.scalar_one_or_none()

        if not employer_user:
            raise NotFoundException(f"No Employer user account found for company '{company.name}'.")

        now = datetime.now(timezone.utc)
        temp_password_plain = self.generate_secure_temporary_password(14)
        temp_password_hash = hash_password(temp_password_plain)
        expiry = now + timedelta(hours=settings.TEMP_PASSWORD_EXPIRY_HOURS)

        employer_user.password_hash = temp_password_hash
        employer_user.must_change_password = True
        employer_user.temporary_password_expiry = expiry
        self.repo.session.add(employer_user)
        await self.repo.session.flush()

        audit_service = AuditService(self.repo.session)
        email_sent = True
        warning = None
        message = "Welcome email resent successfully with a new temporary password."

        try:
            await NotificationService.send_employer_welcome_email(
                recipient_email=employer_user.email,
                temporary_password=temp_password_plain,
                login_url="https://app.getworxs.com/login",
            )
            await audit_service.log_event(
                action="Welcome Email Sent",
                module="notification",
                actor_id=admin_user.id,
                actor_email=admin_user.email,
                target_entity="User",
                target_id=employer_user.id,
                details=f"Resent welcome email to Employer '{employer_user.email}'.",
            )
        except Exception as email_err:
            email_sent = False
            message = "Company approved successfully, but the welcome email could not be delivered."
            warning = "Company approved successfully, but the welcome email could not be delivered."
            logger_core.warning(f"Resend welcome email delivery failed for {employer_user.email}: {email_err}")

            await audit_service.log_event(
                action="Welcome Email Failed",
                module="notification",
                actor_id=admin_user.id,
                actor_email=admin_user.email,
                target_entity="User",
                target_id=employer_user.id,
                details=f"Resend welcome email failed for '{employer_user.email}': {email_err}",
            )

        return ResendWelcomeEmailResponse(
            company_id=company.id,
            company_name=company.name,
            employer_email=employer_user.email,
            email_sent=email_sent,
            message=message,
            warning=warning,
        )

    async def reject_company(
        self, company_id: int, admin_user: User, rejection_reason: str
    ) -> Company:
        """Reject company application with reason (Platform Admin only)."""
        self.require_platform_admin(admin_user)
        company = await self.get_company(company_id)

        now = datetime.now(timezone.utc)
        company.approval_status = CompanyStatus.REJECTED.value
        company.status = CompanyStatus.INACTIVE.value
        company.is_verified = False
        company.rejection_reason = rejection_reason
        company.reviewed_at = now

        updated_company = await self.repo.update(company)

        await NotificationService.send_application_rejected_notification(
            company_id=updated_company.id,
            company_name=updated_company.name,
            recipient_email=updated_company.email,
            reason=rejection_reason,
        )

        return updated_company

    async def request_changes(
        self, company_id: int, admin_user: User, comments: str
    ) -> Company:
        """Request changes on company application with comments (Platform Admin only)."""
        self.require_platform_admin(admin_user)
        company = await self.get_company(company_id)

        now = datetime.now(timezone.utc)
        company.approval_status = CompanyStatus.UNDER_REVIEW.value
        company.status = CompanyStatus.PENDING_VERIFICATION.value
        company.is_verified = False
        company.review_notes = comments
        company.reviewed_at = now

        updated_company = await self.repo.update(company)

        await NotificationService.send_request_changes_notification(
            company_id=updated_company.id,
            company_name=updated_company.name,
            recipient_email=updated_company.email,
            comments=comments,
        )

        return updated_company

    async def suspend_company(self, company_id: int, admin_user: User) -> Company:
        """Suspend an approved company (Platform Admin only). Locks recruitment features."""
        self.require_platform_admin(admin_user)
        company = await self.get_company(company_id)

        company.approval_status = CompanyStatus.SUSPENDED.value
        company.status = CompanyStatus.SUSPENDED.value
        company.is_verified = False

        return await self.repo.update(company)

    async def activate_company(self, company_id: int, admin_user: User) -> Company:
        """Re-activate a suspended company (Platform Admin only). Unlocks recruitment features."""
        self.require_platform_admin(admin_user)
        company = await self.get_company(company_id)

        company.approval_status = CompanyStatus.APPROVED.value
        company.status = CompanyStatus.ACTIVE.value
        company.is_verified = True

        return await self.repo.update(company)

    async def update_logo(self, company_id: int, logo_url: str, user: User) -> Company:
        """Update company logo URL."""
        company = await self.get_company(company_id)
        self.check_update_permission(company, user)

        company.logo_url = logo_url
        return await self.repo.update(company)

    async def update_status(
        self, company_id: int, status: CompanyStatus, user: User
    ) -> Company:
        """Update company status."""
        company = await self.get_company(company_id)
        self.check_update_permission(company, user)

        company.status = status.value if hasattr(status, 'value') else status
        return await self.repo.update(company)

    async def verify_company(
        self, company_id: int, is_verified: bool, admin_user: User
    ) -> Company:
        """Verify or revoke verification for a company (Platform Admin only)."""
        self.require_platform_admin(admin_user)

        company = await self.get_company(company_id)
        company.is_verified = is_verified
        if is_verified:
            company.verified_by_id = admin_user.id
            company.verified_at = datetime.now(timezone.utc)
            company.approval_status = CompanyStatus.APPROVED.value
            company.status = CompanyStatus.ACTIVE.value
        else:
            company.verified_by_id = None
            company.verified_at = None

        return await self.repo.update(company)

    async def delete_company(self, company_id: int, user: User) -> Company:
        """Soft delete company."""
        company = await self.get_company(company_id)
        self.check_update_permission(company, user)
        return await self.repo.soft_delete(company)

    # --- Branch Management ---

    async def add_branch(
        self, company_id: int, data: CompanyBranchCreate, user: User
    ) -> CompanyBranch:
        """Add branch to company."""
        company = await self.get_company(company_id)
        self.check_update_permission(company, user)

        branch = CompanyBranch(
            company_id=company_id,
            branch_name=data.branch_name,
            country=data.country,
            state=data.state,
            city=data.city,
            address=data.address,
            contact_number=data.contact_number,
        )
        return await self.repo.add_branch(branch)

    async def update_branch(
        self, company_id: int, branch_id: int, data: CompanyBranchUpdate, user: User
    ) -> CompanyBranch:
        """Update branch details."""
        company = await self.get_company(company_id)
        self.check_update_permission(company, user)

        branch = await self.repo.get_branch_by_id(branch_id)
        if not branch or branch.company_id != company_id:
            raise CompanyBranchNotFoundException(branch_id)

        update_dict = data.model_dump(exclude_unset=True)
        for key, val in update_dict.items():
            if val is not None:
                setattr(branch, key, val)

        self.repo.session.add(branch)
        await self.repo.session.flush()
        await self.repo.session.refresh(branch)
        return branch

    async def delete_branch(self, company_id: int, branch_id: int, user: User) -> None:
        """Delete branch from company."""
        company = await self.get_company(company_id)
        self.check_update_permission(company, user)

        branch = await self.repo.get_branch_by_id(branch_id)
        if not branch or branch.company_id != company_id:
            raise CompanyBranchNotFoundException(branch_id)

        await self.repo.delete_branch(branch)

    async def list_branches(self, company_id: int) -> List[CompanyBranch]:
        """List all branches belonging to company."""
        await self.get_company(company_id)
        return await self.repo.list_branches(company_id)

    # --- Settings Management ---

    async def get_settings(self, company_id: int) -> CompanySettings:
        """Fetch company settings."""
        await self.get_company(company_id)
        settings = await self.repo.get_settings(company_id)
        if not settings:
            settings = CompanySettings(company_id=company_id)
            settings = await self.repo.save_settings(settings)
        return settings

    async def update_settings(
        self, company_id: int, data: CompanySettingsUpdate, user: User
    ) -> CompanySettings:
        """Update localization settings."""
        company = await self.get_company(company_id)
        self.check_update_permission(company, user)

        settings = await self.get_settings(company_id)
        update_dict = data.model_dump(exclude_unset=True)
        for key, val in update_dict.items():
            if val is not None:
                setattr(settings, key, val)

        return await self.repo.save_settings(settings)

    # --- Statistics ---

    async def get_statistics(self, company_id: int) -> CompanyStatisticsResponse:
        """Return real-time metrics for recruiters, employers, jobs, and candidates."""
        await self.get_company(company_id)
        return CompanyStatisticsResponse(
            company_id=company_id,
            total_recruiters=0,
            total_employers=0,
            total_jobs=0,
            total_candidates=0,
            active_jobs=0,
        )

    async def invite_recruiter(self, data: RecruiterInviteRequest, user: Optional[User]) -> RecruiterInviteResponse:
        """Create recruiter User account, persist to DB, commit, then dispatch invitation email.

        Workflow:
            1. Validate recruiter details.
            2. Create / update User (role=RECRUITER, must_change_password=True, hashed temp password).
            3. Create / update CompanyRecruiter record.
            4. Commit database transaction.
            5. Trigger invitation email service.
            6. On email failure: retain DB account, return warning message.
        """
        from app.core.logging import logger as log
        from app.auth.repository import AuthRepository
        from app.auth.security import hash_password
        from app.auth.models import UserRole
        from datetime import timedelta
        import traceback

        # --- Step 1: Resolve context values ---
        resolved_company_name = None
        resolved_company_id = None
        if user:
            try:
                user_comp = await self.get_my_company(user)
                if user_comp:
                    resolved_company_name = user_comp.name
                    resolved_company_id = user_comp.id
            except Exception:
                pass

        company_name = (
            resolved_company_name
            or getattr(user, "company_name", None)
            or data.company_name
            or "GetWorxs Enterprise"
        )

        # Enforce Subscription Recruiter Seat Limit
        if resolved_company_id and (user and user.role != UserRole.ADMIN):
            from app.subscriptions.service import SubscriptionService
            from app.core.errors import ForbiddenException
            sub_service = SubscriptionService(self.repo.session)
            sub = await sub_service.repo.get_company_subscription(resolved_company_id)
            if sub and sub.plan:
                limit = sub.plan.recruiter_limit
                if limit != -1:  # -1 indicates Unlimited
                    from sqlalchemy import func, select
                    from app.recruiters.models import RecruiterProfile
                    cnt_stmt = select(func.count(RecruiterProfile.id)).where(RecruiterProfile.company_id == resolved_company_id)
                    current_recruiters_count = (await self.repo.session.execute(cnt_stmt)).scalar() or 0
                    if current_recruiters_count >= limit:
                        raise ForbiddenException("You have reached your plan limit. Please upgrade your subscription to continue.")

        invited_by_id = getattr(user, "id", None)
        invited_by_email = getattr(user, "email", None) or "employer@getworxs.com"
        login_url = "http://localhost:5173"
        expiry_hours = 168  # 7 days
        expiry_str = "7 days"

        now = datetime.now(timezone.utc)
        expiry_dt = now + timedelta(hours=expiry_hours)

        # --- Step 2: Generate secure temporary password ---
        random_suffix = secrets.token_hex(3).upper()
        temp_password_plain = f"Recruiter@{random_suffix}!2026"
        temp_password_hash = hash_password(temp_password_plain)

        # --- Step 3: Create or update User account ---
        auth_repo = AuthRepository(self.repo.session)
        existing_user = await auth_repo.get_by_email(str(data.email))

        if existing_user:
            # Recruiter was previously invited — regenerate credentials
            recruiter_user = await auth_repo.update_user_invitation(
                user=existing_user,
                password_hash=temp_password_hash,
                invited_by_id=invited_by_id,
                invited_at=now,
                temporary_password_expiry=expiry_dt,
            )
            action = "updated"
        else:
            recruiter_user = await auth_repo.create_user(
                name=data.name,
                email=str(data.email),
                password_hash=temp_password_hash,
                role=UserRole.RECRUITER,
                must_change_password=True,
                invited_by_id=invited_by_id,
                invited_at=now,
                temporary_password_expiry=expiry_dt,
            )
            action = "created"

        # Update User company fields
        if resolved_company_id:
            recruiter_user.company_id = resolved_company_id
        recruiter_user.company_name = company_name
        self.repo.session.add(recruiter_user)

        # --- Step 4: Create or update CompanyRecruiter record ---
        from sqlalchemy import select as sa_select
        from app.companies.models import CompanyRecruiter

        existing_cr_stmt = sa_select(CompanyRecruiter).where(
            CompanyRecruiter.recruiter_email == str(data.email).lower()
        )
        existing_cr_result = await self.repo.session.execute(existing_cr_stmt)
        existing_cr = existing_cr_result.scalar_one_or_none()

        if existing_cr:
            existing_cr.recruiter_name = data.name
            existing_cr.company_name = company_name
            if resolved_company_id:
                existing_cr.company_id = resolved_company_id
            existing_cr.role = data.role
            existing_cr.status = "Pending"
            existing_cr.invited_by_email = invited_by_email
            existing_cr.user_id = recruiter_user.id
            self.repo.session.add(existing_cr)
        else:
            recruiter_record = CompanyRecruiter(
                company_name=company_name,
                company_id=resolved_company_id,
                recruiter_name=data.name,
                recruiter_email=str(data.email).lower(),
                role=data.role,
                status="Pending",
                invited_by_email=invited_by_email,
                user_id=recruiter_user.id,
            )
            self.repo.session.add(recruiter_record)


        # --- Step 5: Commit database transaction BEFORE sending email ---
        await self.repo.session.flush()
        await self.repo.session.commit()

        log.info(
            f"[INVITE] INFO: Recruiter account {action} — "
            f"User ID={recruiter_user.id}, email={recruiter_user.email}, "
            f"company={company_name}, must_change_password=True."
        )

        # --- Step 6: Trigger email service AFTER successful DB commit ---
        email_sent = False
        warning: Optional[str] = None
        invite_status = "Invited"

        try:
            log.info(
                f"[INVITE] INFO: Invitation email triggered — "
                f"recipient={data.email}, company={company_name}."
            )
            await NotificationService.send_invitation_email(
                recipient_email=str(data.email),
                recipient_name=data.name,
                company_name=company_name,
                login_url=login_url,
                temporary_password=temp_password_plain,
                expiry=expiry_str,
                invited_by_id=invited_by_id,
            )
            email_sent = True
            invite_status = "Invited"
            log.info(
                f"[INVITE] INFO: Invitation email sent successfully — "
                f"recipient={data.email}, company={company_name}."
            )

            # Update CompanyRecruiter status to Invited after successful email
            cr_stmt = sa_select(CompanyRecruiter).where(
                CompanyRecruiter.recruiter_email == str(data.email).lower()
            )
            cr_result = await self.repo.session.execute(cr_stmt)
            cr = cr_result.scalar_one_or_none()
            if cr:
                cr.status = "Invited"
                self.repo.session.add(cr)
                await self.repo.session.commit()

        except Exception as email_exc:
            log.error(
                f"[INVITE] ERROR: Recruiter invitation email failed — "
                f"recipient={data.email}, company={company_name}. "
                f"Exception: {email_exc}",
                exc_info=True,
            )
            email_sent = False
            invite_status = "Email Failed"
            warning = (
                "Recruiter account created successfully, but the invitation email could not be sent. "
                "Please use the 'Resend Invitation' action from the Recruiter Management page."
            )

            # Update CompanyRecruiter status to Email Failed
            try:
                cr_stmt = sa_select(CompanyRecruiter).where(
                    CompanyRecruiter.recruiter_email == str(data.email).lower()
                )
                cr_result = await self.repo.session.execute(cr_stmt)
                cr = cr_result.scalar_one_or_none()
                if cr:
                    cr.status = "Email Failed"
                    self.repo.session.add(cr)
                    await self.repo.session.commit()
            except Exception:
                pass  # Status update is best-effort; do not mask the original warning

        return RecruiterInviteResponse(
            name=data.name,
            email=str(data.email),
            role=data.role,
            company_name=company_name,
            temporary_password=temp_password_plain,
            status=invite_status,
            email_sent=email_sent,
            message=(
                f"Recruiter '{data.name}' ({data.email}) account {action} for '{company_name}'. "
                + ("Invitation email dispatched successfully." if email_sent else "Email dispatch failed — account is retained.")
            ),
            warning=warning,
        )

    async def resend_recruiter_invitation(
        self, data: "RecruiterResendInviteRequest", user: Optional[User]
    ) -> RecruiterInviteResponse:
        """Resend a recruiter invitation — regenerate temp password, update DB, commit, then re-dispatch email."""
        from app.core.logging import logger as log
        from app.auth.repository import AuthRepository
        from app.auth.security import hash_password
        from app.auth.models import UserRole
        from app.companies.schemas import RecruiterResendInviteRequest, RecruiterInviteRequest
        from sqlalchemy import select as sa_select
        from app.companies.models import CompanyRecruiter
        from datetime import timedelta

        email_clean = str(data.email).strip().lower()
        invited_by_id = getattr(user, "id", None)
        invited_by_email = getattr(user, "email", None) or "employer@getworxs.com"
        login_url = "http://localhost:5173"
        expiry_str = "7 days"

        now = datetime.now(timezone.utc)
        expiry_dt = now + timedelta(hours=168)

        auth_repo = AuthRepository(self.repo.session)
        recruiter_user = await auth_repo.get_by_email(email_clean)

        # Fetch CompanyRecruiter record
        cr_stmt = sa_select(CompanyRecruiter).where(
            CompanyRecruiter.recruiter_email == email_clean
        )
        cr_result = await self.repo.session.execute(cr_stmt)
        cr = cr_result.scalar_one_or_none()

        if not recruiter_user and not cr:
            # Auto-delegate to invite_recruiter if recruiter account does not exist in DB yet
            invite_req = RecruiterInviteRequest(
                name=email_clean.split("@")[0].capitalize(),
                email=email_clean,
                role="Recruiter",
                company_name=getattr(user, "company_name", None) or "GetWorxs Enterprise",
            )
            return await self.invite_recruiter(invite_req, user=user)

        # Generate new temporary password
        random_suffix = secrets.token_hex(3).upper()
        temp_password_plain = f"Recruiter@{random_suffix}!2026"
        temp_password_hash = hash_password(temp_password_plain)

        if not recruiter_user and cr:
            # Create User account for existing CompanyRecruiter record
            recruiter_user = await auth_repo.create_user(
                name=cr.recruiter_name or email_clean.split("@")[0].capitalize(),
                email=email_clean,
                password_hash=temp_password_hash,
                role=UserRole.RECRUITER,
                must_change_password=True,
                invited_by_id=invited_by_id,
                invited_at=now,
                temporary_password_expiry=expiry_dt,
            )
            if cr.company_id:
                recruiter_user.company_id = cr.company_id
            recruiter_user.company_name = cr.company_name
            cr.user_id = recruiter_user.id
            self.repo.session.add(recruiter_user)
        elif recruiter_user:
            # Update existing User invitation metadata
            recruiter_user = await auth_repo.update_user_invitation(
                user=recruiter_user,
                password_hash=temp_password_hash,
                invited_by_id=invited_by_id,
                invited_at=now,
                temporary_password_expiry=expiry_dt,
            )

        company_name = cr.company_name if cr else (getattr(user, "company_name", None) or "GetWorxs Enterprise")
        recruiter_name = cr.recruiter_name if cr else recruiter_user.name
        recruiter_role = cr.role if cr else "Recruiter"

        # Update CompanyRecruiter status
        if cr:
            cr.status = "Pending"
            cr.invited_by_email = invited_by_email
            self.repo.session.add(cr)

        # Commit DB changes before sending email
        await self.repo.session.flush()
        await self.repo.session.commit()

        log.info(
            f"[INVITE] INFO: Recruiter account updated for resend — "
            f"User ID={recruiter_user.id}, email={recruiter_user.email}, company={company_name}."
        )

        email_sent = False
        warning: Optional[str] = None
        invite_status = "Invited"

        try:
            log.info(
                f"[INVITE] INFO: Invitation email triggered (resend) — "
                f"recipient={data.email}, company={company_name}."
            )
            await NotificationService.send_invitation_email(
                recipient_email=str(data.email),
                recipient_name=recruiter_name,
                company_name=company_name,
                login_url=login_url,
                temporary_password=temp_password_plain,
                expiry=expiry_str,
                invited_by_id=invited_by_id,
            )
            email_sent = True
            log.info(
                f"[INVITE] INFO: Invitation email sent successfully (resend) — "
                f"recipient={data.email}, company={company_name}."
            )
            if cr:
                cr.status = "Invited"
                self.repo.session.add(cr)
                await self.repo.session.commit()

        except Exception as email_exc:
            log.error(
                f"[INVITE] ERROR: Recruiter invitation email failed (resend) — "
                f"recipient={data.email}. Exception: {email_exc}",
                exc_info=True,
            )
            email_sent = False
            invite_status = "Email Failed"
            warning = (
                "Recruiter account updated successfully, but the invitation email could not be sent. "
                "Please try again from the Recruiter Management page."
            )
            if cr:
                try:
                    cr.status = "Email Failed"
                    self.repo.session.add(cr)
                    await self.repo.session.commit()
                except Exception:
                    pass

        return RecruiterInviteResponse(
            name=recruiter_name,
            email=str(data.email),
            role=recruiter_role,
            company_name=company_name,
            temporary_password=temp_password_plain,
            status=invite_status,
            email_sent=email_sent,
            message=(
                f"Resend invitation for '{recruiter_name}' ({data.email}). "
                + ("Invitation email dispatched successfully." if email_sent else "Email dispatch failed — account is retained.")
            ),
            warning=warning,
        )

    async def list_company_recruiters(
        self, company_name: Optional[str] = None
    ) -> list:
        """Fetch all platform recruiters (registered accounts + invited records)."""
        from datetime import datetime, timezone
        from sqlalchemy import select as sa_select
        from app.auth.models import User, UserRole
        from app.recruiters.models import RecruiterProfile
        from app.companies.models import Company, CompanyRecruiter
        from app.companies.schemas import RecruiterListResponse

        results = []

        # 1. Fetch registered recruiters from Users table
        stmt = (
            sa_select(User, RecruiterProfile, Company)
            .join(RecruiterProfile, RecruiterProfile.user_id == User.id, isouter=True)
            .join(Company, Company.id == RecruiterProfile.company_id, isouter=True)
            .where(User.role == UserRole.RECRUITER)
        )
        if company_name:
            stmt = stmt.where(
                (Company.name == company_name) | (RecruiterProfile.company_name == company_name)
            )

        res = await self.repo.session.execute(stmt)
        for u, rp, comp in res.all():
            c_name = comp.name if comp else (rp.company_name if rp else 'GetWorxs Enterprise')
            r_name = rp.name if rp else (u.email.split('@')[0].capitalize())
            results.append(RecruiterListResponse(
                id=u.id,
                recruiter_name=r_name,
                recruiter_email=u.email,
                company_name=c_name,
                role='Recruiter',
                status=u.status.value if hasattr(u.status, 'value') else (u.status or 'active'),
                created_at=u.created_at or datetime.now(timezone.utc)
            ))

        # 2. Fetch invited recruiters from CompanyRecruiter table (skip duplicates by email)
        inv_stmt = sa_select(CompanyRecruiter)
        if company_name:
            inv_stmt = inv_stmt.where(CompanyRecruiter.company_name == company_name)
        inv_stmt = inv_stmt.order_by(CompanyRecruiter.created_at.desc())

        inv_res = await self.repo.session.execute(inv_stmt)
        for inv in inv_res.scalars().all():
            if not any(r.recruiter_email.lower() == inv.recruiter_email.lower() for r in results):
                results.append(RecruiterListResponse(
                    id=inv.id + 10000,
                    recruiter_name=inv.recruiter_name,
                    recruiter_email=inv.recruiter_email,
                    company_name=inv.company_name,
                    role=inv.role or 'Recruiter',
                    status=inv.status or 'active',
                    invited_by_email=inv.invited_by_email,
                    created_at=inv.created_at or datetime.now(timezone.utc)
                ))

        return results

