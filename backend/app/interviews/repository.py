from datetime import datetime
from typing import List, Optional, Tuple
from sqlalchemy import and_, func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.interviews.models import Interview
from app.applications.models import Application
from app.auth.models import User
from app.jobs.models import Job


def _interview_load_options():
    return [
        selectinload(Interview.application),
        selectinload(Interview.job),
        selectinload(Interview.company),
        selectinload(Interview.candidate).selectinload(User.candidate_profile),
        selectinload(Interview.employer),
        selectinload(Interview.recruiter),
    ]


class InterviewRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, interview_id: int) -> Optional[Interview]:
        stmt = (
            select(Interview)
            .options(*_interview_load_options())
            .where(Interview.id == interview_id, Interview.deleted_at.is_(None))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, interview: Interview) -> Interview:
        self.session.add(interview)
        await self.session.flush()
        return await self.get_by_id(interview.id)

    async def update(self, interview: Interview) -> Interview:
        self.session.add(interview)
        await self.session.flush()
        return await self.get_by_id(interview.id)

    async def list_by_candidate(
        self,
        candidate_id: int,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None
    ) -> Tuple[List[Interview], int]:
        offset = (page - 1) * limit
        where_clause = [Interview.candidate_id == candidate_id, Interview.deleted_at.is_(None)]
        if status:
            where_clause.append(Interview.status == status)

        count_stmt = select(func.count(Interview.id)).where(and_(*where_clause))
        total_res = await self.session.execute(count_stmt)
        total = total_res.scalar() or 0

        stmt = (
            select(Interview)
            .options(*_interview_load_options())
            .where(and_(*where_clause))
            .order_by(Interview.scheduled_at.asc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all()), total

    async def list_by_employer(
        self,
        company_id: Optional[int] = None,
        employer_id: Optional[int] = None,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None
    ) -> Tuple[List[Interview], int]:
        offset = (page - 1) * limit

        conditions = []
        if company_id:
            conditions.append(Interview.company_id == company_id)
        if employer_id:
            conditions.append(Interview.employer_id == employer_id)

        if not conditions:
            return [], 0

        where_clause = [or_(*conditions), Interview.deleted_at.is_(None)]
        if status:
            where_clause.append(Interview.status == status)

        count_stmt = select(func.count(Interview.id)).where(and_(*where_clause))
        total_res = await self.session.execute(count_stmt)
        total = total_res.scalar() or 0

        stmt = (
            select(Interview)
            .options(*_interview_load_options())
            .where(and_(*where_clause))
            .order_by(Interview.scheduled_at.asc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all()), total

    async def list_by_recruiter(
        self,
        recruiter_id: int,
        company_id: Optional[int] = None,
        page: int = 1,
        limit: int = 20,
        status: Optional[str] = None
    ) -> Tuple[List[Interview], int]:
        offset = (page - 1) * limit

        conditions = [Interview.recruiter_id == recruiter_id]
        if company_id:
            conditions.append(Interview.company_id == company_id)

        where_clause = [or_(*conditions), Interview.deleted_at.is_(None)]
        if status:
            where_clause.append(Interview.status == status)

        count_stmt = select(func.count(Interview.id)).where(and_(*where_clause))
        total_res = await self.session.execute(count_stmt)
        total = total_res.scalar() or 0

        stmt = (
            select(Interview)
            .options(*_interview_load_options())
            .where(and_(*where_clause))
            .order_by(Interview.scheduled_at.asc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all()), total
