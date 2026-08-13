from typing import Optional

from fastapi import APIRouter, Depends, Query, status

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.core.database import get_db
from app.notifications.repository import NotificationRepository
from app.notifications.schemas import (
    NotificationResponse,
    PaginatedNotificationResponse,
    UnreadCountResponse,
)
from app.schemas.health import ResponseEnvelope
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get(
    "",
    response_model=ResponseEnvelope[PaginatedNotificationResponse],
    summary="List current user's notifications",
)
async def list_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    unread_only: bool = Query(False),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    repo = NotificationRepository(session)
    items, total = await repo.list_by_recipient(
        recipient_id=current_user.id,
        page=page,
        limit=limit,
        unread_only=unread_only,
    )
    unread_count = await repo.count_unread(current_user.id)
    return ResponseEnvelope(
        success=True,
        message="Notifications retrieved successfully.",
        data=PaginatedNotificationResponse(
            items=[NotificationResponse.model_validate(n) for n in items],
            total=total,
            page=page,
            limit=limit,
            unread_count=unread_count,
        ),
    )


@router.get(
    "/unread-count",
    response_model=ResponseEnvelope[UnreadCountResponse],
    summary="Get unread notification count for current user",
)
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    repo = NotificationRepository(session)
    count = await repo.count_unread(current_user.id)
    return ResponseEnvelope(
        success=True,
        message="Unread count retrieved.",
        data=UnreadCountResponse(count=count),
    )


@router.put(
    "/{notification_id}/read",
    response_model=ResponseEnvelope[None],
    summary="Mark a notification as read",
)
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    repo = NotificationRepository(session)
    updated = await repo.mark_read(notification_id, current_user.id)
    await session.commit()
    return ResponseEnvelope(
        success=updated,
        message="Notification marked as read." if updated else "Notification not found or not owned by you.",
    )


@router.put(
    "/read-all",
    response_model=ResponseEnvelope[None],
    summary="Mark all notifications as read",
)
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    repo = NotificationRepository(session)
    count = await repo.mark_all_read(current_user.id)
    await session.commit()
    return ResponseEnvelope(
        success=True,
        message=f"{count} notification(s) marked as read.",
    )
