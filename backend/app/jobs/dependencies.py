from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.jobs.service import JobService

def get_job_service(session: AsyncSession = Depends(get_db)) -> JobService:
    """Dependency injection helper for retrieving JobService."""
    return JobService(session)
