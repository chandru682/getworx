import json
import random
import logging
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import User, UserRole
from app.core.errors import ForbiddenException, BadRequestException, NotFoundException
from app.jobs.models import Job, JobScreeningQuestion, JobStatus
from app.jobs.repository import JobRepository
from app.jobs.schemas import JobCreate, JobDraftCreate, JobUpdate
from app.subscriptions.service import SubscriptionService

logger = logging.getLogger(__name__)

class JobService:
    """Job Service containing core ATS business logic and 3-tier access control validation."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = JobRepository(session)
        self.sub_service = SubscriptionService(session)

    async def _verify_employer_access(self, user: User, is_publish: bool = True) -> int:
        """Validate role permission and 3-tier access control status for publishing."""
        # 1. Check Role Permission
        if user.role not in [UserRole.ADMIN, UserRole.EMPLOYER, UserRole.RECRUITER]:
            raise ForbiddenException("Access denied. Only employers or recruiters can manage job postings.")

        # Resolve Creator's Company
        company = await self.sub_service.get_company_by_id_or_user(user)
        if not company:
            raise BadRequestException("Your account is not associated with any registered company.")

        # 2. Check 3-Tier Access Guard (Required only when publishing, drafts are exempt)
        if is_publish and user.role != UserRole.ADMIN:
            access_status = await self.sub_service.get_employer_access_status(user)
            if not access_status.is_dashboard_unlocked:
                raise ForbiddenException(
                    f"Job publication locked. Access check failed: {access_status.message}"
                )

            # 3. Enforce Subscription Job Posting Quota Limit
            sub = await self.sub_service.repo.get_company_subscription(company.id)
            if sub and sub.plan:
                limit = sub.plan.job_posting_limit
                if limit != -1:  # -1 indicates Unlimited
                    from sqlalchemy import func, select
                    from app.jobs.models import Job, JobStatus
                    cnt_stmt = select(func.count(Job.id)).where(
                        Job.company_id == company.id,
                        Job.status == JobStatus.ACTIVE.value
                    )
                    active_jobs_count = (await self.session.execute(cnt_stmt)).scalar() or 0
                    if active_jobs_count >= limit:
                        raise ForbiddenException("You have reached your plan limit. Please upgrade your subscription to continue.")

        return company.id

    async def _generate_unique_job_code(self) -> str:
        """Generate unique internal job ID reference code."""
        prefix = "GW-JOB"
        for _ in range(10):
            suffix = str(random.randint(1000, 9999))
            code = f"{prefix}-{suffix}"
            if not await self.repo.get_by_internal_id(code):
                return code
        return f"{prefix}-{random.randint(10000, 99999)}"

    async def create_job(self, data: JobCreate, creator: User, is_draft: bool = False) -> Job:
        """Create and persist a new job posting or draft."""
        company_id = await self._verify_employer_access(creator, is_publish=not is_draft)

        # Generate unique code if not provided
        internal_id = data.internal_job_id.strip() if data.internal_job_id else ""
        if not internal_id:
            internal_id = await self._generate_unique_job_code()

        status = JobStatus.DRAFT.value if is_draft else JobStatus.ACTIVE.value

        # Build Job Model
        job = Job(
            title=data.title,
            department=data.department,
            role=data.role,
            employment_type=data.employment_type,
            experience_min=data.experience_min,
            experience_max=data.experience_max,
            work_mode=data.work_mode,
            city=data.city,
            state=data.state,
            country=data.country,
            salary_min=data.salary_min,
            salary_max=data.salary_max,
            salary_currency=data.salary_currency,
            show_salary=data.show_salary,
            openings=data.openings,
            priority=data.priority,
            deadline=data.deadline,
            education=data.education,
            skills_json=data.skills_json,
            certifications_json=data.certifications_json,
            languages_json=data.languages_json,
            industry_exp=data.industry_exp,
            notice_period=data.notice_period,
            current_location=data.current_location,
            relocation_pref=data.relocation_pref,
            about_company=data.about_company,
            summary=data.summary,
            responsibilities=data.responsibilities,
            required_skills=data.required_skills,
            preferred_skills=data.preferred_skills,
            benefits_json=data.benefits_json,
            working_hours=data.working_hours,
            hiring_manager_name=data.hiring_manager_name,
            hiring_manager_email=str(data.hiring_manager_email) if data.hiring_manager_email else None,
            assigned_recruiter_id=data.assigned_recruiter_id,
            visibility=data.visibility,
            internal_job_id=internal_id,
            auto_close_date=data.auto_close_date,
            prevent_duplicates=data.prevent_duplicates,
            email_notifications=data.email_notifications,
            status=status,
            created_by_id=creator.id,
            employer_id=creator.id,
            company_id=company_id
        )

        # Build & Add Screening Questions to parent relationship before persisting
        if data.screening_questions:
            for q in data.screening_questions:
                question = JobScreeningQuestion(
                    question_text=q.question_text,
                    question_type=q.question_type,
                    options_json=q.options_json,
                    is_mandatory=q.is_mandatory,
                    is_knockout=q.is_knockout,
                    preferred_answer=q.preferred_answer,
                    display_order=q.display_order,
                )
                job.screening_questions.append(question)

        created_job = await self.repo.create(job)

        # Commit and refresh
        await self.session.commit()
        refreshed = await self.repo.get_by_id(created_job.id)
        if not refreshed:
            raise NotFoundException("Job created but could not be loaded.")
        return refreshed


    async def create_job_draft(self, data: JobDraftCreate, creator: User) -> Job:
        """Save a partial job draft with minimal validations."""
        company_id = await self._verify_employer_access(creator, is_publish=False)

        internal_id = data.internal_job_id.strip() if data.internal_job_id else ""
        if not internal_id:
            internal_id = await self._generate_unique_job_code()

        job = Job(
            title=data.title or "Untitled Draft",
            department=data.department or "General",
            role=data.role or "Other",
            employment_type=data.employment_type or "Full Time",
            experience_min=data.experience_min or 0,
            experience_max=data.experience_max or 0,
            work_mode=data.work_mode or "Onsite",
            city=data.city,
            state=data.state,
            country=data.country or "India",
            salary_min=data.salary_min,
            salary_max=data.salary_max,
            salary_currency=data.salary_currency or "USD",
            show_salary=data.show_salary if data.show_salary is not None else True,
            openings=data.openings or 1,
            priority=data.priority or "Medium",
            deadline=data.deadline,
            education=data.education,
            skills_json=data.skills_json,
            certifications_json=data.certifications_json,
            languages_json=data.languages_json,
            industry_exp=data.industry_exp,
            notice_period=data.notice_period,
            current_location=data.current_location,
            relocation_pref=data.relocation_pref,
            about_company=data.about_company,
            summary=data.summary,
            responsibilities=data.responsibilities,
            required_skills=data.required_skills,
            preferred_skills=data.preferred_skills,
            benefits_json=data.benefits_json,
            working_hours=data.working_hours,
            hiring_manager_name=data.hiring_manager_name,
            hiring_manager_email=data.hiring_manager_email,
            assigned_recruiter_id=data.assigned_recruiter_id,
            visibility=data.visibility or "Public",
            internal_job_id=internal_id,
            auto_close_date=data.auto_close_date,
            prevent_duplicates=data.prevent_duplicates if data.prevent_duplicates is not None else True,
            email_notifications=data.email_notifications or "Instant",
            status=JobStatus.DRAFT.value,
            created_by_id=creator.id,
            employer_id=creator.id,
            company_id=company_id
        )

        if data.screening_questions:
            for q in data.screening_questions:
                question = JobScreeningQuestion(
                    question_text=q.question_text,
                    question_type=q.question_type,
                    options_json=q.options_json,
                    is_mandatory=q.is_mandatory,
                    is_knockout=q.is_knockout,
                    preferred_answer=q.preferred_answer,
                    display_order=q.display_order,
                )
                job.screening_questions.append(question)

        created_job = await self.repo.create(job)

        await self.session.commit()
        refreshed = await self.repo.get_by_id(created_job.id)
        if not refreshed:
            raise NotFoundException("Job draft created but could not be loaded.")
        return refreshed

    async def get_job_by_id(self, job_id: int, user: Optional[User]) -> Job:
        """Fetch job posting detail.
        - Candidates / unauthenticated: can view any active public job (no employer access check).
        - Employers / Recruiters / Admins: must pass the employer access guard.
        """
        # Candidates and unauthenticated users get direct read access to public jobs
        if user is None or user.role not in [UserRole.ADMIN, UserRole.EMPLOYER, UserRole.RECRUITER]:
            job = await self.repo.get_by_id(job_id)
            if not job:
                raise NotFoundException(f"Job with ID {job_id} not found.")
            return job

        # Employers / Recruiters / Admins: enforce access guard
        await self._verify_employer_access(user, is_publish=False)
        job = await self.repo.get_by_id(job_id)
        if not job:
            raise NotFoundException(f"Job with ID {job_id} not found.")
        return job

    async def list_jobs(
        self,
        user: User,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> Tuple[List[Job], int]:
        """Fetch paginated company jobs."""
        company_id = await self._verify_employer_access(user, is_publish=False)
        return await self.repo.list_company_jobs(
            company_id=company_id,
            page=page,
            limit=limit,
            status=status,
            search=search
        )

    async def update_job(self, job_id: int, data: JobUpdate, user: User) -> Job:
        """Update a job posting or draft."""
        await self._verify_employer_access(user, is_publish=False)
        job = await self.repo.get_by_id(job_id)
        if not job:
            raise NotFoundException(f"Job with ID {job_id} not found.")

        # Update fields
        for field, value in data.model_dump(exclude={"screening_questions"}, exclude_unset=True).items():
            setattr(job, field, value)

        # Update screening questions if provided
        if data.screening_questions is not None:
            job.screening_questions.clear()
            for q in data.screening_questions:
                question = JobScreeningQuestion(
                    question_text=q.question_text,
                    question_type=q.question_type,
                    options_json=q.options_json,
                    is_mandatory=q.is_mandatory,
                    is_knockout=q.is_knockout,
                    preferred_answer=q.preferred_answer,
                    display_order=q.display_order,
                )
                job.screening_questions.append(question)


        # Enforce 3-tier check if transitioning from draft to active
        if data.status == JobStatus.ACTIVE.value and job.status != JobStatus.ACTIVE.value:
            if user.role != UserRole.ADMIN:
                access_status = await self.sub_service.get_employer_access_status(user)
                if not access_status.is_dashboard_unlocked:
                    raise ForbiddenException(
                        f"Cannot publish job draft. Access check failed: {access_status.message}"
                    )
                # Enforce subscription job limit check
                sub = await self.sub_service.repo.get_company_subscription(job.company_id)
                if sub and sub.plan:
                    limit = sub.plan.job_posting_limit
                    if limit != -1:
                        from sqlalchemy import func, select
                        from app.jobs.models import Job as JobModel, JobStatus
                        cnt_stmt = select(func.count(JobModel.id)).where(
                            JobModel.company_id == job.company_id,
                            JobModel.status == JobStatus.ACTIVE.value
                        )
                        active_jobs_count = (await self.session.execute(cnt_stmt)).scalar() or 0
                        if active_jobs_count >= limit:
                            raise ForbiddenException("You have reached your plan limit. Please upgrade your subscription to continue.")

        await self.repo.update(job)
        await self.session.commit()
        res = await self.repo.get_by_id(job_id)
        if not res:
            raise NotFoundException("Job updated but could not be loaded.")
        return res

    async def delete_job(self, job_id: int, user: User) -> Job:
        """Soft delete a job posting."""
        await self._verify_employer_access(user, is_publish=False)
        job = await self.repo.get_by_id(job_id)
        if not job:
            raise NotFoundException(f"Job with ID {job_id} not found.")

        await self.repo.delete(job)
        await self.session.commit()

        res = await self.repo.get_by_id(job_id, include_deleted=True)
        if not res:
            raise NotFoundException("Job deleted but could not be loaded.")
        return res

    async def search_public_jobs(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        role: Optional[str] = None,
        experience: Optional[str] = None,
        work_mode: Optional[str] = None,
        job_type: Optional[str] = None,
        country: Optional[str] = None,
        state: Optional[str] = None,
        city: Optional[str] = None,
        salary_min: Optional[int] = None,
        salary_max: Optional[int] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        page: int = 1,
        limit: int = 20,
    ) -> Tuple[List[Job], int]:
        """Search public job postings matching the criteria (only shows active jobs from approved companies with active subscriptions)."""
        return await self.repo.search_public_jobs(
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
            limit=limit,
        )

    async def get_admin_job_stats(self) -> dict:
        """Get comprehensive job statistics for admins (Total, active, draft, closed, expired, jobs by company, and created today)."""
        return await self.repo.get_admin_job_stats()

    async def admin_list_all_jobs(
        self,
        page: int = 1,
        limit: int = 100,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[Job], int]:
        """Fetch all jobs across the platform (Admin only)."""
        return await self.repo.list_all_jobs_admin(
            page=page,
            limit=limit,
            status=status,
            search=search,
        )

