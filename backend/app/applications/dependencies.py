from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.applications.service import ApplicationService
from app.core.database import get_db


def get_application_service(session: AsyncSession = Depends(get_db)) -> ApplicationService:
    return ApplicationService(session)
