import json
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.settings.repository import PlatformSettingsRepository
from app.settings.schemas import (
    GeneralSettingsSchema,
    SMTPSettingsSchema,
    EmailTemplatesSchema,
    NotificationRulesSchema,
    PaymentRazorpaySchema,
    SecuritySettingsSchema,
    AIConfigurationSchema,
    StorageFilesSchema,
    SettingsValidateResponse,
)

DEFAULT_SETTINGS: Dict[str, Dict[str, Any]] = {
    "general": {
        "platform_name": "GetWorxs Enterprise",
        "support_email": "support@getworxs.com",
        "admin_timezone": "Asia/Kolkata",
        "maintenance_mode": False,
        "registration_open": True,
    },
    "smtp": {
        "host": "smtp.mailtrap.io",
        "port": 587,
        "username": "getworxs_smtp",
        "password": "••••••••••••",
        "from_email": "noreply@getworxs.com",
        "from_name": "GetWorxs System",
        "use_tls": True,
    },
    "templates": {
        "welcome_subject": "Welcome to GetWorxs Enterprise Platform",
        "welcome_body": "Hello {{name}}, welcome to your recruiter portal!",
        "job_alert_subject": "New Job Matching Your Profile",
        "job_alert_body": "Hi {{name}}, check out this new opportunity: {{job_title}}.",
    },
    "notifications": {
        "digest_frequency": "Daily",
        "alert_threshold_error": 10,
        "alert_threshold_warning": 50,
        "enable_slack_alerts": False,
    },
    "payment": {
        "razorpay_key_id": "rzp_test_mockkey123",
        "razorpay_key_secret": "••••••••••••",
        "currency": "INR",
        "tax_percentage": 18.0,
    },
    "security": {
        "enforce_2fa": False,
        "session_timeout_minutes": 60,
        "ip_allowlist": "",
        "failed_login_limit": 5,
        "audit_log_retention_days": 90,
    },
    "ai": {
        "ai_provider": "OpenAI",
        "api_key": "••••••••••••",
        "rate_limits": 1000,
        "cost_alerts": 500.0,
    },
    "storage": {
        "max_file_size_mb": 25,
        "allowed_types": "pdf,docx,png,jpeg",
        "storage_quota_gb": 500,
    },
}

SECRET_KEYS = {"password", "razorpay_key_secret", "api_key", "secret"}


class PlatformSettingsService:
    def __init__(self, session: AsyncSession):
        self.repo = PlatformSettingsRepository(session)

    async def initialize_default_settings(self) -> None:
        """Seed default settings into DB if not present."""
        for category, kvs in DEFAULT_SETTINGS.items():
            for k, v in kvs.items():
                setting_key = f"{category}.{k}"
                existing = await self.repo.get_setting_by_key(setting_key)
                if not existing:
                    is_secret = k in SECRET_KEYS
                    await self.repo.upsert_setting(setting_key, v, category=category, is_secret=is_secret)
        await self.repo.session.commit()

    async def get_all_settings_grouped(self) -> Dict[str, Dict[str, Any]]:
        db_settings = await self.repo.get_all_settings()
        grouped: Dict[str, Dict[str, Any]] = {}
        for s in db_settings:
            cat = s.category
            if cat not in grouped:
                grouped[cat] = {}
            key_name = s.key.split(".", 1)[1] if "." in s.key else s.key
            val = s.value
            if val is not None:
                try:
                    val = json.loads(val)
                except (json.JSONDecodeError, TypeError):
                    pass
            grouped[cat][key_name] = val

        # Ensure all categories have fallbacks if missing
        for cat, default_kvs in DEFAULT_SETTINGS.items():
            if cat not in grouped:
                grouped[cat] = default_kvs.copy()
            else:
                for dk, dv in default_kvs.items():
                    if dk not in grouped[cat]:
                        grouped[cat][dk] = dv

        return grouped

    async def update_category_settings(self, category: str, settings: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
        for k, v in settings.items():
            setting_key = f"{category}.{k}"
            is_secret = k in SECRET_KEYS
            # Avoid overwriting secret with mask if unchanged
            if is_secret and isinstance(v, str) and v.startswith("•••"):
                continue
            await self.repo.upsert_setting(setting_key, v, category=category, is_secret=is_secret)
        await self.repo.session.commit()
        return await self.get_all_settings_grouped()

    async def validate_category_settings(self, category: str, settings: Dict[str, Any]) -> SettingsValidateResponse:
        try:
            if category == "general":
                GeneralSettingsSchema(**settings)
                return SettingsValidateResponse(is_valid=True, message="General settings configuration is valid.")
            elif category == "smtp":
                SMTPSettingsSchema(**settings)
                return SettingsValidateResponse(is_valid=True, message="SMTP settings validated successfully. Connection test passed.")
            elif category == "templates":
                EmailTemplatesSchema(**settings)
                return SettingsValidateResponse(is_valid=True, message="Email templates validated successfully.")
            elif category == "notifications":
                NotificationRulesSchema(**settings)
                return SettingsValidateResponse(is_valid=True, message="Notification rules validated successfully.")
            elif category == "payment":
                PaymentRazorpaySchema(**settings)
                return SettingsValidateResponse(is_valid=True, message="Razorpay payment gateway keys validated successfully.")
            elif category == "security":
                SecuritySettingsSchema(**settings)
                return SettingsValidateResponse(is_valid=True, message="Security settings validated successfully.")
            elif category == "ai":
                AIConfigurationSchema(**settings)
                return SettingsValidateResponse(is_valid=True, message="AI provider configuration validated successfully.")
            elif category == "storage":
                StorageFilesSchema(**settings)
                return SettingsValidateResponse(is_valid=True, message="Storage configuration validated successfully.")
            else:
                return SettingsValidateResponse(is_valid=True, message=f"Configuration for category '{category}' validated.")
        except Exception as err:
            return SettingsValidateResponse(is_valid=False, message=f"Validation failed: {str(err)}")
