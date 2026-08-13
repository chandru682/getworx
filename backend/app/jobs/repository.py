import logging
from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy import and_, func, select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.jobs.models import Job, JobScreeningQuestion

logger = logging.getLogger(__name__)

class JobRepository:
    """SQLAlchemy 2.x Repository for managing Job postings and JobScreeningQuestions."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, job: Job) -> Job:
        """Persist a new job posting."""
        self.session.add(job)
        await self.session.flush()
        return await self.get_by_id(job.id)

    async def get_by_id(self, job_id: int, include_deleted: bool = False) -> Optional[Job]:
        """Fetch job details by ID with preloaded screening questions and company."""
        stmt = (
            select(Job)
            .options(selectinload(Job.screening_questions), selectinload(Job.company))
            .where(Job.id == job_id)
        )
        if not include_deleted:
            stmt = stmt.where(Job.deleted_at.is_(None))
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_internal_id(self, internal_job_id: str) -> Optional[Job]:
        """Fetch job details by unique internal_job_id."""
        stmt = (
            select(Job)
            .options(selectinload(Job.screening_questions), selectinload(Job.company))
            .where(and_(Job.internal_job_id == internal_job_id, Job.deleted_at.is_(None)))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_company_jobs(
        self,
        company_id: int,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> Tuple[List[Job], int]:
        """Fetch paginated job listings for a specific company."""
        offset = (page - 1) * limit
        
        # Build Filter Statement
        where_clause = [Job.company_id == company_id, Job.deleted_at.is_(None)]
        if status:
            where_clause.append(Job.status == status)
        if search:
            where_clause.append(Job.title.ilike(f"%{search}%"))

        # Query Total Count
        count_stmt = select(func.count(Job.id)).where(and_(*where_clause))
        count_res = await self.session.execute(count_stmt)
        total = count_res.scalar() or 0

        # Query Paginated Items
        stmt = (
            select(Job)
            .options(selectinload(Job.screening_questions), selectinload(Job.company))
            .where(and_(*where_clause))
            .order_by(Job.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        items = list(result.scalars().all())

        return items, total

    async def update(self, job: Job) -> Job:
        """Update an existing job posting and return preloaded entity."""
        self.session.add(job)
        await self.session.flush()
        res = await self.get_by_id(job.id)
        return res or job

    async def delete(self, job: Job) -> Job:
        """Soft delete a job posting."""
        job.deleted_at = datetime.now(timezone.utc)
        self.session.add(job)
        await self.session.flush()
        return job

    async def clear_screening_questions(self, job_id: int) -> None:
        """Clear all screening questions for a specific job."""
        stmt = delete(JobScreeningQuestion).where(JobScreeningQuestion.job_id == job_id)
        await self.session.execute(stmt)
        await self.session.flush()

    async def add_screening_question(self, question: JobScreeningQuestion) -> JobScreeningQuestion:
        """Add a screening question to a job."""
        self.session.add(question)
        await self.session.flush()
        return question

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
        from app.companies.models import Company, CompanyStatus
        from app.subscriptions.models import CompanySubscription, SubscriptionStatus
        from sqlalchemy import exists

        now_time = datetime.now(timezone.utc)
        
        # Build base select statement joining Company
        stmt = (
            select(Job)
            .join(Company, Job.company_id == Company.id)
            .options(selectinload(Job.screening_questions), selectinload(Job.company))
        )

        # Check active subscription exists using EXISTS subquery
        sub_exists = exists().where(
            and_(
                CompanySubscription.company_id == Company.id,
                func.lower(CompanySubscription.status) == "active",
                CompanySubscription.end_date >= now_time
            )
        )

        # Filters
        where_clauses = [
            Job.deleted_at.is_(None),
            func.lower(Job.status).in_(["active", "published"]),  # active or published status means live
            func.lower(Company.approval_status) == "approved",
            sub_exists,
            (Job.deadline.is_(None) | (Job.deadline >= now_time))
        ]

        if search:
            search_pattern = f"%{search}%"
            where_clauses.append(
                (Job.title.ilike(search_pattern)) | 
                (Job.summary.ilike(search_pattern)) |
                (Job.department.ilike(search_pattern)) |
                (Job.role.ilike(search_pattern))
            )
        if category:
            where_clauses.append(Job.department.ilike(f"%{category}%"))
        if role:
            where_clauses.append(Job.role.ilike(f"%{role}%"))

        if work_mode:
            if ',' in work_mode:
                modes = [m.strip() for m in work_mode.split(',') if m.strip()]
                where_clauses.append(Job.work_mode.in_(modes))
            else:
                where_clauses.append(Job.work_mode.ilike(work_mode))
        
        if job_type:
            if ',' in job_type:
                types = [t.strip() for t in job_type.split(',') if t.strip()]
                where_clauses.append(Job.employment_type.in_(types))
            else:
                where_clauses.append(Job.employment_type.ilike(job_type))

        if country and country != "All Countries":
            where_clauses.append(Job.country.ilike(country))
        if state and state != "All States / Provinces":
            where_clauses.append(Job.state.ilike(state))
        if city and city != "All Cities":
            where_clauses.append(Job.city.ilike(city))

        if salary_min is not None:
            where_clauses.append(Job.salary_min >= salary_min)
        if salary_max is not None:
            where_clauses.append(Job.salary_max <= salary_max)

        # Apply where clauses
        stmt = stmt.where(and_(*where_clauses))

        # Count total
        count_stmt = (
            select(func.count(Job.id))
            .join(Company, Job.company_id == Company.id)
            .where(and_(*where_clauses))
        )
        count_res = await self.session.execute(count_stmt)
        total = count_res.scalar() or 0

        # Apply sorting
        sort_column = getattr(Job, sort_by, Job.created_at)
        if sort_order == "asc":
            stmt = stmt.order_by(sort_column.asc())
        else:
            stmt = stmt.order_by(sort_column.desc())

        # Pagination
        offset = (page - 1) * limit
        stmt = stmt.offset(offset).limit(limit)

        result = await self.session.execute(stmt)
        items = list(result.scalars().all())

        logger.info(f"SQL Query executed for search_public_jobs: {stmt}")
        logger.info(f"Total public jobs returned: {total}")

        return items, total

    async def get_admin_job_stats(self) -> dict:
        from app.companies.models import Company
        from datetime import datetime, timezone

        now_time = datetime.now(timezone.utc)
        start_of_today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

        # Status counts
        total_stmt = select(func.count(Job.id)).where(Job.deleted_at.is_(None))
        published_stmt = select(func.count(Job.id)).where(and_(Job.status == "active", Job.deleted_at.is_(None)))
        draft_stmt = select(func.count(Job.id)).where(and_(Job.status == "draft", Job.deleted_at.is_(None)))
        closed_stmt = select(func.count(Job.id)).where(and_(Job.status == "closed", Job.deleted_at.is_(None)))
        expired_stmt = select(func.count(Job.id)).where(and_(Job.status == "expired", Job.deleted_at.is_(None)))
        created_today_stmt = select(func.count(Job.id)).where(and_(Job.created_at >= start_of_today, Job.deleted_at.is_(None)))

        total = (await self.session.execute(total_stmt)).scalar() or 0
        published = (await self.session.execute(published_stmt)).scalar() or 0
        draft = (await self.session.execute(draft_stmt)).scalar() or 0
        closed = (await self.session.execute(closed_stmt)).scalar() or 0
        expired = (await self.session.execute(expired_stmt)).scalar() or 0
        created_today = (await self.session.execute(created_today_stmt)).scalar() or 0

        # Expired due to deadline passed
        expired_deadline_stmt = select(func.count(Job.id)).where(
            and_(
                Job.deleted_at.is_(None),
                Job.deadline.is_not(None),
                Job.deadline < now_time
            )
        )
        expired_deadline_count = (await self.session.execute(expired_deadline_stmt)).scalar() or 0
        total_expired = max(expired, expired_deadline_count)

        # Jobs by Company
        company_stmt = (
            select(Company.name, func.count(Job.id))
            .join(Job, Job.company_id == Company.id)
            .where(Job.deleted_at.is_(None))
            .group_by(Company.name)
        )
        company_res = await self.session.execute(company_stmt)
        jobs_by_company = {row[0]: row[1] for row in company_res.fetchall()}

        return {
            "total_jobs": total,
            "published_jobs": published,
            "draft_jobs": draft,
            "closed_jobs": closed,
            "expired_jobs": total_expired,
            "jobs_created_today": created_today,
            "jobs_by_company": jobs_by_company
        }

    async def list_all_jobs_admin(
        self,
        page: int = 1,
        limit: int = 100,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[Job], int]:
        from app.companies.models import Company
        offset = (page - 1) * limit
        where_clause = [Job.deleted_at.is_(None)]
        if status and status != 'all':
            where_clause.append(Job.status == status)
        if search:
            where_clause.append(
                (Job.title.ilike(f"%{search}%")) |
                (Job.internal_job_id.ilike(f"%{search}%"))
            )

        count_stmt = select(func.count(Job.id)).where(and_(*where_clause))
        count_res = await self.session.execute(count_stmt)
        total = count_res.scalar() or 0

        stmt = (
            select(Job)
            .join(Company, Job.company_id == Company.id, isouter=True)
            .options(selectinload(Job.screening_questions), selectinload(Job.company))
            .where(and_(*where_clause))
            .order_by(Job.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        items = list(result.scalars().all())

        logger.info(f"SQL Query executed for list_all_jobs_admin: {stmt}")
        logger.info(f"Total admin jobs returned: {total}")

        return items, total
