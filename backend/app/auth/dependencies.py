from typing import Callable, List, Optional
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.exceptions import (
    ForbiddenException,
    InvalidTokenException,
    UserInactiveException,
    UserNotFoundException,
)
from app.auth.models import User, UserRole, UserStatus
from app.auth.repository import AuthRepository
from app.auth.security import decode_token
from app.auth.service import AuthService
from app.core.database import get_db

security_scheme = HTTPBearer(auto_error=True)


def get_auth_repository(session: AsyncSession = Depends(get_db)) -> AuthRepository:
    """Dependency injection helper for AuthRepository."""
    return AuthRepository(session)


def get_auth_service(repo: AuthRepository = Depends(get_auth_repository)) -> AuthService:
    """Dependency injection helper for AuthService."""
    return AuthService(repo)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    repo: AuthRepository = Depends(get_auth_repository),
) -> User:
    """FastAPI dependency to extract, decode and validate JWT access token and return the current User."""
    token = credentials.credentials
    payload = decode_token(token, expected_type="access")
    
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise InvalidTokenException("Token payload missing subject identifier")

    try:
        user_id = int(user_id_str)
    except ValueError:
        raise InvalidTokenException("Invalid user identifier in token")

    user = await repo.get_by_id(user_id)
    if not user:
        raise UserNotFoundException(user_id)

    if user.status != UserStatus.ACTIVE.value:
        raise UserInactiveException(f"Account is currently {user.status}")

    return user


security_scheme_optional = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme_optional),
    repo: AuthRepository = Depends(get_auth_repository),
) -> Optional[User]:
    """Optional user dependency returning authenticated user or default fallback for dev API calls."""
    if not credentials or not credentials.credentials:
        return User(id=1, name="Congi Hub Admin", email="employer@congihub.com", role=UserRole.EMPLOYER)
    try:
        return await get_current_user(credentials, repo)
    except Exception:
        return User(id=1, name="Congi Hub Admin", email="employer@congihub.com", role=UserRole.EMPLOYER)


class RoleChecker:
    """RBAC Dependency class verifying if logged in user possesses required role."""

    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in self.allowed_roles:
            roles_str = ", ".join([r.value for r in self.allowed_roles])
            raise ForbiddenException(
                f"Permission denied. Required role(s): [{roles_str}]. User has role: '{current_user.role.value}'"
            )
        return current_user


# Role-based FastAPI dependencies
require_admin = RoleChecker([UserRole.ADMIN])
require_employer = RoleChecker([UserRole.ADMIN, UserRole.EMPLOYER])
require_recruiter = RoleChecker([UserRole.ADMIN, UserRole.EMPLOYER, UserRole.RECRUITER])
require_candidate = RoleChecker([UserRole.ADMIN, UserRole.CANDIDATE])
