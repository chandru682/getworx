from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.audit.models import AuditLog


class AuditService:
    """Enterprise Audit Trail service for logging security and business workflow events."""

    def __init__(self, session: Optional[AsyncSession] = None):
        self.session = session

    async def log_event(
        self,
        action: str,
        module: str,
        actor_id: Optional[int] = None,
        actor_email: Optional[str] = None,
        target_entity: Optional[str] = None,
        target_id: Optional[str | int] = None,
        details: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Optional[AuditLog]:
        """Record an audit trail event in system logs and MySQL database if session provided."""
        log_msg = (
            f"[AUDIT LOG] [{module.upper()}] Action: {action} | "
            f"Actor: {actor_email or actor_id or 'System'} | "
            f"Target: {target_entity}#{target_id} | Details: {details or 'N/A'}"
        )
        logger.info(log_msg)

        if self.session:
            try:
                audit_entry = AuditLog(
                    action=action,
                    module=module,
                    actor_id=actor_id,
                    actor_email=actor_email,
                    target_entity=target_entity,
                    target_id=str(target_id) if target_id is not None else None,
                    details=details,
                    ip_address=ip_address,
                    status="active",
                )
                self.session.add(audit_entry)
                await self.session.flush()
                return audit_entry
            except Exception as exc:
                logger.warning(f"[AUDIT LOG] Could not persist audit entry to DB: {exc}")
                return None
        return None
