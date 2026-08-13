from typing import Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.auth.dependencies import require_admin
from app.auth.models import User
from app.schemas.health import ResponseEnvelope
from app.settings.schemas import (
    SettingsUpdateBulkRequest,
    SettingsValidateRequest,
    SettingsValidateResponse,
)
from app.settings.service import PlatformSettingsService

router = APIRouter(prefix="/settings", tags=["Platform Settings"])


@router.get(
    "/all",
    response_model=ResponseEnvelope[Dict[str, Dict[str, Any]]],
    summary="Get all platform settings grouped by category (Super Admin Only)"
)
async def get_all_settings(
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Retrieve system settings catalog grouped by category."""
    service = PlatformSettingsService(db)
    grouped = await service.get_all_settings_grouped()
    return ResponseEnvelope(
        success=True,
        data=grouped,
        message="Platform settings retrieved successfully"
    )


@router.get(
    "/category/{category}",
    response_model=ResponseEnvelope[Dict[str, Any]],
    summary="Get category settings (Super Admin Only)"
)
async def get_category_settings(
    category: str,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Retrieve settings for a specific category."""
    service = PlatformSettingsService(db)
    grouped = await service.get_all_settings_grouped()
    category_kvs = grouped.get(category, {})
    return ResponseEnvelope(
        success=True,
        data=category_kvs,
        message=f"Settings for category '{category}' retrieved"
    )


@router.post(
    "/update",
    response_model=ResponseEnvelope[Dict[str, Dict[str, Any]]],
    summary="Update category settings (Super Admin Only)"
)
async def update_settings(
    payload: SettingsUpdateBulkRequest,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Update setting values for a given category."""
    service = PlatformSettingsService(db)
    updated_all = await service.update_category_settings(payload.category, payload.settings)
    return ResponseEnvelope(
        success=True,
        data=updated_all,
        message=f"Platform settings for '{payload.category}' updated successfully"
    )


@router.post(
    "/validate",
    response_model=ResponseEnvelope[SettingsValidateResponse],
    summary="Validate category configuration (Super Admin Only)"
)
async def validate_settings(
    payload: SettingsValidateRequest,
    db: AsyncSession = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Validate settings syntax and test integration parameters."""
    service = PlatformSettingsService(db)
    res = await service.validate_category_settings(payload.category, payload.settings)
    return ResponseEnvelope(
        success=res.is_valid,
        data=res,
        message=res.message
    )
