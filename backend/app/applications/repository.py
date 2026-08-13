from datetime import datetime
from typing import List, Optional, Tuple
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.applications.models import Application
from app.auth.models import User
from app.candidates.models import CandidateProfile
from app.jobs.models import Job


def _application_load_options():
    """Consistent eager-load options that include candidate_profile for all queries."""
    return [
        selectinload(Application.job).selectinload(Job.company),
        selectinload(Application.candidate).selectinload(User.candidate_profile),
        selectinload(Application.employer),
        selectinload(Application.recruiter),
        selectinload(Application.screening_answers),
    ]


class ApplicationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, application_id: int) -> Optional[Application]:
        stmt = (
            select(Application)
            .options(*_application_load_options())
            .where(Application.id == application_id, Application.deleted_at.is_(None))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_candidate_and_job(self, candidate_id: int, job_id: int) -> Optional[Application]:
        stmt = (
            select(Application)
            .where(
                Application.candidate_id == candidate_id,
                Application.job_id == job_id,
                Application.deleted_at.is_(None),
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, application: Application) -> Application:
        self.session.add(application)
        await self.session.flush()
        return await self.get_by_id(application.id)

    async def update(self, application: Application) -> Application:
        self.session.add(application)
        await self.session.flush()
        return await self.get_by_id(application.id)

    async def list_by_candidate(
        self,
        candidate_id: int,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[Application], int]:
        offset = (page - 1) * limit
        where_clause = [Application.candidate_id == candidate_id, Application.deleted_at.is_(None)]
        if status:
            where_clause.append(Application.status == status)

        stmt = (
            select(Application)
            .options(*_application_load_options())
            .where(and_(*where_clause))
        )
        if search:
            stmt = stmt.join(Application.job).where(Job.title.ilike(f"%{search}%"))

        count_stmt = select(func.count(Application.id)).where(and_(*where_clause))
        if search:
            count_stmt = count_stmt.join(Application.job).where(Job.title.ilike(f"%{search}%"))

        total_res = await self.session.execute(count_stmt)
        total = total_res.scalar() or 0

        stmt = stmt.order_by(Application.applied_at.desc()).offset(offset).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all()), total

    async def list_by_company(
        self,
        company_id: Optional[int] = None,
        employer_id: Optional[int] = None,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[Application], int]:
        offset = (page - 1) * limit
        from sqlalchemy import or_

        conditions = []
        if company_id:
            conditions.append(Application.company_id == company_id)
        if employer_id:
            conditions.append(Application.employer_id == employer_id)

        if not conditions:
            return [], 0

        where_clause = [or_(*conditions), Application.deleted_at.is_(None)]
        if status:
            where_clause.append(Application.status == status)

        stmt = (
            select(Application)
            .options(*_application_load_options())
            .where(and_(*where_clause))
        )
        if search:
            stmt = stmt.join(Application.job).where(Job.title.ilike(f"%{search}%"))

        count_stmt = select(func.count(Application.id)).where(and_(*where_clause))
        if search:
            count_stmt = count_stmt.join(Application.job).where(Job.title.ilike(f"%{search}%"))

        total_res = await self.session.execute(count_stmt)
        total = total_res.scalar() or 0

        stmt = stmt.order_by(Application.applied_at.desc()).offset(offset).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all()), total

    async def list_by_recruiter(
        self,
        recruiter_id: int,
        company_id: Optional[int] = None,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[Application], int]:
        offset = (page - 1) * limit
        from sqlalchemy import or_

        # If company_id is available, fetch ALL company applications (recruiter sees all company apps)
        # Otherwise fall back to applications specifically assigned to this recruiter
        if company_id:
            base_condition = Application.company_id == company_id
        else:
            base_condition = Application.recruiter_id == recruiter_id

        where_clause = [base_condition, Application.deleted_at.is_(None)]
        if status:
            where_clause.append(Application.status == status)

        stmt = (
            select(Application)
            .options(*_application_load_options())
            .where(and_(*where_clause))
        )
        if search:
            stmt = stmt.join(Application.job).where(Job.title.ilike(f"%{search}%"))

        count_stmt = select(func.count(Application.id)).where(and_(*where_clause))
        if search:
            count_stmt = count_stmt.join(Application.job).where(Job.title.ilike(f"%{search}%"))

        total_res = await self.session.execute(count_stmt)
        total = total_res.scalar() or 0

        stmt = stmt.order_by(Application.applied_at.desc()).offset(offset).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all()), total

    async def count_total(self) -> int:
        """Total application count for admin stats."""
        stmt = select(func.count(Application.id)).where(Application.deleted_at.is_(None))
        result = await self.session.execute(stmt)
        return result.scalar() or 0

    async def count_today(self) -> int:
        """Today's application count for admin stats."""
        from datetime import date, timezone
        today_start = datetime.combine(date.today(), datetime.min.time()).replace(tzinfo=timezone.utc)
        stmt = select(func.count(Application.id)).where(
            Application.applied_at >= today_start,
            Application.deleted_at.is_(None),
        )
        result = await self.session.execute(stmt)
        return result.scalar() or 0

    async def list_all(
        self,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[Application], int]:
        """Admin-only: list all applications across the platform."""
        offset = (page - 1) * limit
        where_clause = [Application.deleted_at.is_(None)]
        if status:
            where_clause.append(Application.status == status)

        stmt = (
            select(Application)
            .options(*_application_load_options())
            .where(and_(*where_clause))
        )
        if search:
            stmt = stmt.join(Application.job).where(Job.title.ilike(f"%{search}%"))

        count_stmt = select(func.count(Application.id)).where(and_(*where_clause))
        if search:
            count_stmt = count_stmt.join(Application.job).where(Job.title.ilike(f"%{search}%"))

        total_res = await self.session.execute(count_stmt)
        total = total_res.scalar() or 0

        stmt = stmt.order_by(Application.applied_at.desc()).offset(offset).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all()), total
