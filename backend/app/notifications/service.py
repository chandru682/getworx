"""
NotificationService — DB-persisted notifications + email dispatch for GetWorxs platform.

All application workflow events create real Notification records in MySQL and are
visible to the recipient through the /notifications API endpoints.
"""
from typing import List, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import logger
from app.notifications.models import Notification, NotificationType
from app.notifications.repository import NotificationRepository


class NotificationService:
    """Notification service for dispatching DB notifications and optional email for workflow events."""

    # ─────────────────────────────────────────────────────────────────
    # Core DB-persist helper
    # ─────────────────────────────────────────────────────────────────

    @staticmethod
    async def create_notification(
        session: AsyncSession,
        recipient_id: int,
        notification_type: NotificationType,
        title: str,
        message: str,
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
    ) -> Notification:
        """Persist a notification record for the given recipient."""
        repo = NotificationRepository(session)
        notification = await repo.create(
            recipient_id=recipient_id,
            notification_type=notification_type,
            title=title,
            message=message,
            entity_type=entity_type,
            entity_id=entity_id,
        )
        logger.info(
            f"[NOTIFICATION] Persisted '{notification_type.value}' → recipient_id={recipient_id} | {title}"
        )
        return notification

    # ─────────────────────────────────────────────────────────────────
    # Application workflow — 4 role-specific helpers
    # ─────────────────────────────────────────────────────────────────

    @staticmethod
    async def notify_candidate_application_submitted(
        session: AsyncSession,
        candidate_id: int,
        application_reference: str,
        job_title: str,
        application_id: int,
    ) -> None:
        """Notify candidate: 'Application submitted successfully.'"""
        await NotificationService.create_notification(
            session=session,
            recipient_id=candidate_id,
            notification_type=NotificationType.APPLICATION_SUBMITTED,
            title="Application Submitted",
            message="Application submitted successfully.",
            entity_type="application",
            entity_id=application_id,
        )

    @staticmethod
    async def notify_employer_new_application(
        session: AsyncSession,
        employer_id: int,
        candidate_name: str,
        job_title: str,
        application_id: int,
    ) -> None:
        """Notify employer: 'New application received.'"""
        await NotificationService.create_notification(
            session=session,
            recipient_id=employer_id,
            notification_type=NotificationType.APPLICATION_RECEIVED,
            title="New Application",
            message=f"New application received for {job_title}.",
            entity_type="application",
            entity_id=application_id,
        )

    @staticmethod
    async def notify_recruiter_application_assigned(
        session: AsyncSession,
        recruiter_id: int,
        candidate_name: str,
        job_title: str,
        application_id: int,
    ) -> None:
        """Notify recruiter: 'A new candidate has applied to your assigned job.'"""
        await NotificationService.create_notification(
            session=session,
            recipient_id=recruiter_id,
            notification_type=NotificationType.RECRUITER_APPLICATION_ASSIGNED,
            title="New Candidate",
            message="A new candidate has applied to your assigned job.",
            entity_type="application",
            entity_id=application_id,
        )

    @staticmethod
    async def notify_admins_new_application(
        session: AsyncSession,
        admin_user_ids: List[int],
        candidate_name: str,
        job_title: str,
        application_id: int,
    ) -> None:
        """Notify platform admins: 'New application received.'"""
        for admin_id in admin_user_ids:
            await NotificationService.create_notification(
                session=session,
                recipient_id=admin_id,
                notification_type=NotificationType.SYSTEM,
                title="New Platform Application",
                message=f"{candidate_name} applied for {job_title}.",
                entity_type="application",
                entity_id=application_id,
            )

    @staticmethod
    async def notify_interview_scheduled(
        session: AsyncSession,
        candidate_id: int,
        employer_id: Optional[int],
        recruiter_id: Optional[int],
        candidate_name: str,
        job_title: str,
        interview_type: str,
        scheduled_at_str: str,
        interview_id: int,
    ) -> None:
        """Notify Candidate, Employer, and Recruiter that an interview has been scheduled."""
        # Candidate notification
        await NotificationService.create_notification(
            session=session,
            recipient_id=candidate_id,
            notification_type=NotificationType.INTERVIEW_SCHEDULED,
            title="Interview Scheduled",
            message=f"An interview ({interview_type}) for '{job_title}' has been scheduled for {scheduled_at_str}.",
            entity_type="interview",
            entity_id=interview_id,
        )
        # Employer notification
        if employer_id:
            await NotificationService.create_notification(
                session=session,
                recipient_id=employer_id,
                notification_type=NotificationType.INTERVIEW_SCHEDULED,
                title="Interview Scheduled",
                message=f"Interview ({interview_type}) with {candidate_name} for '{job_title}' scheduled for {scheduled_at_str}.",
                entity_type="interview",
                entity_id=interview_id,
            )
        # Recruiter notification
        if recruiter_id:
            await NotificationService.create_notification(
                session=session,
                recipient_id=recruiter_id,
                notification_type=NotificationType.INTERVIEW_SCHEDULED,
                title="Interview Scheduled",
                message=f"Interview ({interview_type}) with {candidate_name} for '{job_title}' scheduled for {scheduled_at_str}.",
                entity_type="interview",
                entity_id=interview_id,
            )

    @staticmethod
    async def notify_interview_responded(
        session: AsyncSession,
        employer_id: Optional[int],
        recruiter_id: Optional[int],
        candidate_name: str,
        job_title: str,
        action: str,
        interview_id: int,
    ) -> None:
        """Notify Employer and Recruiter when candidate accepts, requests reschedule, or declines."""
        title = f"Interview {action.capitalize()}"
        msg = f"{candidate_name} has {action}ed the interview for '{job_title}'."
        if employer_id:
            await NotificationService.create_notification(
                session=session,
                recipient_id=employer_id,
                notification_type=NotificationType.SYSTEM,
                title=title,
                message=msg,
                entity_type="interview",
                entity_id=interview_id,
            )
        if recruiter_id:
            await NotificationService.create_notification(
                session=session,
                recipient_id=recruiter_id,
                notification_type=NotificationType.SYSTEM,
                title=title,
                message=msg,
                entity_type="interview",
                entity_id=interview_id,
            )

    @staticmethod
    async def notify_candidate_status_changed(
        session: AsyncSession,
        candidate_id: int,
        application_reference: str,
        new_status: str,
        application_id: int,
    ) -> None:
        """Notify candidate when their application status changes."""
        await NotificationService.create_notification(
            session=session,
            recipient_id=candidate_id,
            notification_type=NotificationType.APPLICATION_STATUS_CHANGE,
            title="Application Updated",
            message=f"Your application ({application_reference}) status has been updated to '{new_status}'.",
            entity_type="application",
            entity_id=application_id,
        )

    # ─────────────────────────────────────────────────────────────────
    # Legacy log-only stubs — kept for backward compatibility
    # ─────────────────────────────────────────────────────────────────

    @staticmethod
    async def send_application_submitted_notification(company_id: int, company_name: str, recipient_email: str) -> None:
        logger.info(f"[NOTIFICATION] New job application received for '{company_name}' (ID: {company_id}) by {recipient_email}.")

    @staticmethod
    async def send_candidate_application_received_notification(candidate_email: str, application_reference: str, job_title: str) -> None:
        logger.info(f"[NOTIFICATION] Candidate '{candidate_email}' received confirmation for application {application_reference} to job '{job_title}'.")

    @staticmethod
    async def send_application_status_changed_notification(candidate_email: str, application_reference: str, status: str) -> None:
        logger.info(f"[NOTIFICATION] Candidate '{candidate_email}' application {application_reference} status updated to '{status}'.")

    @staticmethod
    async def send_application_approved_notification(company_id: int, company_name: str, recipient_email: str) -> None:
        logger.info(f"[NOTIFICATION] Application Approved for '{company_name}' (ID: {company_id}) to {recipient_email}.")

    @staticmethod
    async def send_application_rejected_notification(company_id: int, company_name: str, recipient_email: str, reason: str) -> None:
        logger.info(f"[NOTIFICATION] Application Rejected for '{company_name}' (ID: {company_id}) to {recipient_email}. Reason: {reason}")

    @staticmethod
    async def send_request_changes_notification(company_id: int, company_name: str, recipient_email: str, comments: str) -> None:
        logger.info(f"[NOTIFICATION] Request Changes for '{company_name}' (ID: {company_id}) to {recipient_email}. Comments: {comments}")

    @staticmethod
    async def send_application_resubmitted_notification(company_id: int, company_name: str, recipient_email: str) -> None:
        logger.info(f"[NOTIFICATION] Application Resubmitted for '{company_name}' (ID: {company_id}) to {recipient_email}.")

    @staticmethod
    async def send_employer_invitation(
        recipient_email: str,
        recipient_name: str,
        invited_by_name: str | None,
        login_url: str,
        temporary_password: str,
        expiry,
    ) -> None:
        logger.info(
            f"[INVITE] Employer invitation sent to {recipient_email} (name: {recipient_name}). "
            f"Invited by: {invited_by_name}. Login URL: {login_url}. Temporary password expires at {expiry}. "
            f"Temporary password (plain-text for integration/testing): {temporary_password}"
        )

    @staticmethod
    async def send_invitation_email(
        recipient_email: str,
        recipient_name: str,
        company_name: str,
        login_url: str,
        temporary_password: str,
        expiry,
        invited_by_id: int | None = None,
    ) -> None:
        """Send recruiter invitation email with temporary credentials.

        Raises:
            Exception: Re-raises any SMTP / network exception so the caller can handle it.
        """
        logger.info(
            f"[INVITE] INFO: Invitation email triggered — dispatching to {recipient_email} "
            f"(name: {recipient_name}, company: {company_name}). "
            f"Login URL: {login_url}. Expires at: {expiry}."
        )

        if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = "Welcome to GetWorxs — Your Recruiter Account Invitation"
            msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
            msg["To"] = recipient_email

            html_content = f"""
            <div style="font-family: 'Arial', sans-serif; padding: 32px; color: #0f172a; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #6d28d9; font-size: 26px; margin: 0;">Welcome to GetWorxs!</h1>
                <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Global AI-Powered Recruitment Platform</p>
              </div>
              <p style="font-size: 15px; margin: 0 0 16px 0;">Hello <strong>{recipient_name}</strong>,</p>
              <p style="font-size: 14px; color: #334155; margin: 0 0 16px 0;">
                You have been invited to join <strong>{company_name}</strong> as a Recruiter on the GetWorxs platform.
              </p>
              <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 20px 24px; border-radius: 10px; margin: 20px 0;">
                <h3 style="font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 14px 0;">Your Login Credentials</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr><td style="padding: 6px 0; color: #64748b; width: 45%;">Company</td><td style="padding: 6px 0; font-weight: 700; color: #0f172a;">{company_name}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Registered Email</td><td style="padding: 6px 0; font-weight: 700; color: #0f172a;">{recipient_email}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Temporary Password</td><td style="padding: 6px 0;"><code style="background: #ffffff; padding: 5px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; font-weight: bold; color: #6d28d9;">{temporary_password}</code></td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Sign-In Link</td><td style="padding: 6px 0;"><a href="{login_url}" style="color: #6d28d9; font-weight: 700; text-decoration: none;">{login_url}</a></td></tr>
                </table>
              </div>
              <p style="color: #94a3b8; font-size: 12px; margin: 20px 0 0 0;">⏰ This temporary password expires in <strong>{expiry}</strong>.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
              <p style="text-align: center; color: #94a3b8; font-size: 11px; margin: 0;">GetWorxs Platform · AI-Powered Recruitment · <a href="{login_url}" style="color: #6d28d9; text-decoration: none;">getworxs.com</a></p>
            </div>
            """

            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                if settings.SMTP_TLS:
                    server.starttls()
                smtp_pass = (settings.SMTP_PASSWORD or "").replace(" ", "")
                smtp_user = settings.SMTP_USER or settings.EMAILS_FROM_EMAIL
                server.login(smtp_user, smtp_pass)
                server.sendmail(settings.EMAILS_FROM_EMAIL, [recipient_email], msg.as_string())

            logger.info(f"[INVITE] INFO: Invitation email sent successfully — {recipient_email} via {settings.SMTP_HOST}")
        else:
            logger.info(
                f"[INVITE] INFO: Invitation email sent successfully (dev/log-only mode) — "
                f"recipient={recipient_email}, company={company_name}, "
                f"temp_password={temporary_password}, login_url={login_url}, expiry={expiry}"
            )

    @staticmethod
    async def send_employer_welcome_email(
        recipient_email: str,
        temporary_password: str,
        login_url: str = "https://app.getworxs.com/login",
    ) -> None:
        """Send Welcome Email to newly approved Employer with generated temporary password."""
        subject = "Welcome to GetWorxs - Your Company Has Been Approved"
        logger.info(f"[WELCOME EMAIL] Triggered for {recipient_email}. Login URL: {login_url}.")

        plain_text_content = f"""Congratulations!

Your company has been approved successfully.

Employer Login Details:

Login URL:
{login_url}

Email:
{recipient_email}

Temporary Password:
{temporary_password}

For security reasons, you must change your password during your first login before accessing the Employer Dashboard.

Regards,
GetWorxs Team"""

        if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
            msg["To"] = recipient_email

            html_content = f"""
            <div style="font-family: 'Arial', sans-serif; padding: 32px; color: #0f172a; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 14px; background: #ffffff;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #6d28d9; font-size: 26px; margin: 0;">Welcome to GetWorxs!</h1>
                <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Your Company Has Been Approved</p>
              </div>
              <p style="font-size: 15px; margin: 0 0 16px 0;"><strong>Congratulations!</strong></p>
              <p style="font-size: 14px; color: #334155; margin: 0 0 16px 0;">Your company has been approved successfully.</p>
              <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 20px 24px; border-radius: 10px; margin: 20px 0;">
                <h3 style="font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 14px 0;">Employer Login Details</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr><td style="padding: 6px 0; color: #64748b; width: 40%;">Login URL</td><td style="padding: 6px 0;"><a href="{login_url}" style="color: #6d28d9; font-weight: 700; text-decoration: none;">{login_url}</a></td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Email</td><td style="padding: 6px 0; font-weight: 700; color: #0f172a;">{recipient_email}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b;">Temporary Password</td><td style="padding: 6px 0;"><code style="background: #ffffff; padding: 5px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; font-weight: bold; color: #6d28d9;">{temporary_password}</code></td></tr>
                </table>
              </div>
              <p style="font-size: 13px; color: #78350f; background: #fef9c3; border: 1px solid #fde68a; padding: 12px 16px; border-radius: 8px; margin: 16px 0;">🔒 For security reasons, you must change your password during your first login before accessing the Employer Dashboard.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
              <p style="color: #64748b; font-size: 13px; margin: 0;">Regards,<br><strong>GetWorxs Team</strong></p>
            </div>
            """

            msg.attach(MIMEText(plain_text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                if settings.SMTP_TLS:
                    server.starttls()
                smtp_pass = (settings.SMTP_PASSWORD or "").replace(" ", "")
                smtp_user = settings.SMTP_USER or settings.EMAILS_FROM_EMAIL
                server.login(smtp_user, smtp_pass)
                server.sendmail(settings.EMAILS_FROM_EMAIL, [recipient_email], msg.as_string())

            logger.info(f"[WELCOME EMAIL] Sent successfully to {recipient_email} via {settings.SMTP_HOST}")
        else:
            logger.info(
                f"[WELCOME EMAIL] Sent successfully (dev/log-only mode) — "
                f"recipient={recipient_email}, temp_password={temporary_password}, login_url={login_url}"
            )
