from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.models import User, UserRole
from app.companies.repository import CompanyRepository
from app.companies.service import CompanyService
from app.core.database import get_db
from app.core.errors import ForbiddenException


def get_company_repository(
    session: AsyncSession = Depends(get_db),
) -> CompanyRepository:
    """FastAPI Dependency for CompanyRepository."""
    return CompanyRepository(session)


def get_company_service(
    repo: CompanyRepository = Depends(get_company_repository),
) -> CompanyService:
    """FastAPI Dependency for CompanyService."""
    return CompanyService(repo)


def require_company_manage_access(current_user: User = Depends(get_current_user)) -> User:
    """RBAC Dependency: Ensures user is either a Platform Admin or Employer/Recruiter managing a company."""
    if current_user.role not in [UserRole.ADMIN, UserRole.EMPLOYER, UserRole.RECRUITER]:
        raise ForbiddenException("Permission denied. Only Platform Admin, Employer, or Recruiter can manage company resources.")
    return current_user
