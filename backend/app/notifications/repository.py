from typing import List, Optional, Tuple
from sqlalchemy import and_, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.notifications.models import Notification, NotificationType


class NotificationRepository:
    """Database persistence layer for Notification records."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(
        self,
        recipient_id: int,
        notification_type: NotificationType,
        title: str,
        message: str,
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
    ) -> Notification:
        """Persist a new notification record."""
        notification = Notification(
            recipient_id=recipient_id,
            type=notification_type,
            title=title,
            message=message,
            is_read=False,
            entity_type=entity_type,
            entity_id=entity_id,
        )
        self.session.add(notification)
        await self.session.flush()
        return notification

    async def list_by_recipient(
        self,
        recipient_id: int,
        page: int = 1,
        limit: int = 20,
        unread_only: bool = False,
    ) -> Tuple[List[Notification], int]:
        """List notifications for a specific recipient with pagination."""
        offset = (page - 1) * limit
        where_clause = [
            Notification.recipient_id == recipient_id,
            Notification.deleted_at.is_(None),
        ]
        if unread_only:
            where_clause.append(Notification.is_read.is_(False))

        count_stmt = select(func.count(Notification.id)).where(and_(*where_clause))
        total_res = await self.session.execute(count_stmt)
        total = total_res.scalar() or 0

        stmt = (
            select(Notification)
            .where(and_(*where_clause))
            .order_by(Notification.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all()), total

    async def count_unread(self, recipient_id: int) -> int:
        """Return the count of unread notifications for a recipient."""
        stmt = select(func.count(Notification.id)).where(
            Notification.recipient_id == recipient_id,
            Notification.is_read.is_(False),
            Notification.deleted_at.is_(None),
        )
        result = await self.session.execute(stmt)
        return result.scalar() or 0

    async def mark_read(self, notification_id: int, recipient_id: int) -> bool:
        """Mark a single notification as read (RBAC: only if owned by recipient)."""
        stmt = (
            update(Notification)
            .where(
                Notification.id == notification_id,
                Notification.recipient_id == recipient_id,
            )
            .values(is_read=True)
        )
        result = await self.session.execute(stmt)
        return result.rowcount > 0

    async def mark_all_read(self, recipient_id: int) -> int:
        """Mark all unread notifications as read for a recipient."""
        stmt = (
            update(Notification)
            .where(
                Notification.recipient_id == recipient_id,
                Notification.is_read.is_(False),
            )
            .values(is_read=True)
        )
        result = await self.session.execute(stmt)
        return result.rowcount

    async def get_recent_admin(self, limit: int = 20) -> List[Notification]:
        """Retrieve recent admin-targeted notifications for activity feed."""
        stmt = (
            select(Notification)
            .where(
                Notification.type == NotificationType.ADMIN_NEW_APPLICATION,
                Notification.deleted_at.is_(None),
            )
            .order_by(Notification.created_at.desc())
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
