from datetime import datetime, timezone
from typing import List, Optional, Tuple
from sqlalchemy import (
    and_,
    func,
    or_,
    select,
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.companies.models import (
    Company,
    CompanyBranch,
    CompanyDocument,
    CompanySettings,
    CompanyStatus,
)


class CompanyRepository:
    """SQLAlchemy 2.x Repository for managing Company entities, Branches, Settings, and Documents."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, company: Company) -> Company:
        """Persist a new company record."""
        self.session.add(company)
        await self.session.flush()
        return await self.get_by_id(company.id)

    async def get_by_id(
        self, company_id: int, include_deleted: bool = False
    ) -> Optional[Company]:
        """Fetch company by ID with preloaded branches, documents, and settings."""
        stmt = (
            select(Company)
            .options(
                selectinload(Company.branches),
                selectinload(Company.documents),
                selectinload(Company.settings),
            )
            .where(Company.id == company_id)
        )
        if not include_deleted:
            stmt = stmt.where(Company.deleted_at.is_(None))
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_code(self, code: str) -> Optional[Company]:
        """Fetch company by unique company_code."""
        stmt = (
            select(Company)
            .options(
                selectinload(Company.branches),
                selectinload(Company.documents),
                selectinload(Company.settings),
            )
            .where(and_(Company.company_code == code, Company.deleted_at.is_(None)))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[Company]:
        """Fetch company by registered email."""
        stmt = select(Company).options(
            selectinload(Company.branches),
            selectinload(Company.documents),
            selectinload(Company.settings),
        ).where(
            and_(Company.email == email.lower(), Company.deleted_at.is_(None))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_creator_id(self, user_id: int) -> Optional[Company]:
        """Fetch company created by a specific user ID."""
        stmt = select(Company).options(
            selectinload(Company.branches),
            selectinload(Company.documents),
            selectinload(Company.settings),
        ).where(
            and_(Company.created_by_id == user_id, Company.deleted_at.is_(None))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()


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
    ) -> Tuple[List[Company], int]:
        """List companies with dynamic search filtering, sorting, and pagination."""
        query = select(Company).options(
            selectinload(Company.branches),
            selectinload(Company.documents),
            selectinload(Company.settings),
        ).where(Company.deleted_at.is_(None))

        # Search Filters
        if search:
            search_pattern = f"%{search.strip()}%"
            query = query.where(
                or_(
                    Company.name.ilike(search_pattern),
                    Company.legal_name.ilike(search_pattern),
                    Company.company_code.ilike(search_pattern),
                    Company.description.ilike(search_pattern),
                )
            )

        if industry:
            query = query.where(Company.industry.ilike(f"%{industry.strip()}%"))

        if country:
            query = query.where(Company.country.ilike(f"%{country.strip()}%"))

        if status:
            query = query.where(Company.status == status.value if hasattr(status, 'value') else status)

        if approval_status:
            query = query.where(Company.approval_status == approval_status.value if hasattr(approval_status, 'value') else approval_status)

        # Count Total Matches
        count_stmt = select(func.count()).select_from(query.subquery())
        total_result = await self.session.execute(count_stmt)
        total = total_result.scalar_one()

        # Sorting
        sort_column = getattr(Company, sort_by, Company.created_at)
        if order.lower() == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())

        # Pagination Offset
        offset = (page - 1) * limit
        query = query.offset(offset).limit(limit)

        result = await self.session.execute(query)
        items = list(result.scalars().all())
        return items, total

    async def update(self, company: Company) -> Company:
        """Update an existing company entity and return preloaded entity."""
        self.session.add(company)
        await self.session.flush()
        await self.session.commit()
        await self.session.refresh(company, attribute_names=["branches", "documents", "settings"])
        res = await self.get_by_id(company.id)
        return res or company

    async def soft_delete(self, company: Company) -> Company:
        """Mark company as soft deleted."""
        company.deleted_at = datetime.now(timezone.utc)
        company.status = CompanyStatus.INACTIVE.value
        await self.session.flush()
        return company

    # --- Document Repository Operations ---

    async def add_document(self, document: CompanyDocument) -> CompanyDocument:
        """Persist a new company document."""
        self.session.add(document)
        await self.session.flush()
        await self.session.refresh(document)
        return document

    async def list_documents(self, company_id: int) -> List[CompanyDocument]:
        """List documents belonging to a specific company."""
        stmt = select(CompanyDocument).where(CompanyDocument.company_id == company_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    # --- Branch Repository Operations ---

    async def add_branch(self, branch: CompanyBranch) -> CompanyBranch:
        """Add branch to company."""
        self.session.add(branch)
        await self.session.flush()
        await self.session.refresh(branch)
        return branch

    async def get_branch_by_id(self, branch_id: int) -> Optional[CompanyBranch]:
        """Fetch company branch by branch ID."""
        stmt = select(CompanyBranch).where(CompanyBranch.id == branch_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_branches(self, company_id: int) -> List[CompanyBranch]:
        """List all branches belonging to a specific company."""
        stmt = select(CompanyBranch).where(CompanyBranch.company_id == company_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def delete_branch(self, branch: CompanyBranch) -> None:
        """Delete branch record."""
        await self.session.delete(branch)
        await self.session.flush()

    # --- Settings Repository Operations ---

    async def get_settings(self, company_id: int) -> Optional[CompanySettings]:
        """Fetch company settings by company ID."""
        stmt = select(CompanySettings).where(CompanySettings.company_id == company_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def save_settings(self, settings: CompanySettings) -> CompanySettings:
        """Create or update company settings."""
        self.session.add(settings)
        await self.session.flush()
        await self.session.refresh(settings)
        return settings

