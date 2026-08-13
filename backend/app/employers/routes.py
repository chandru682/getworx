from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user, require_employer
from app.employers.service import EmployerDashboardService
from app.employers.schemas import EmployerDashboardResponse
from app.database.session import get_db

router = APIRouter()

@router.get(
    "/dashboard",
    response_model=EmployerDashboardResponse,
    status_code=status.HTTP_200_OK,
    summary="Employer Hiring Command Center Dashboard",
    description="Aggregates real‑time hiring metrics, pipeline, performance charts, recent applications, active jobs, upcoming interviews, subscription usage and recruiter team stats for the logged‑in employer.",
)
async def get_dashboard(
    current_user = Depends(require_employer),
    db: AsyncSession = Depends(get_db),
):
    service = EmployerDashboardService()
    # The employer is linked to a company via the user record
    company_id = current_user.company_id
    dashboard = await service.get_dashboard(company_id, db)
    return dashboard
