from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class PlatformSettingResponse(BaseModel):
    key: str
    value: Optional[str] = None
    category: str
    is_secret: bool = False
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SettingsCategoryOverviewResponse(BaseModel):
    category: str
    settings: Dict[str, Any]


class SettingsUpdateBulkRequest(BaseModel):
    category: str
    settings: Dict[str, Any]


class SettingsValidateRequest(BaseModel):
    category: str
    settings: Dict[str, Any]


class SettingsValidateResponse(BaseModel):
    is_valid: bool
    message: str
    details: Optional[Dict[str, Any]] = None


# Module specific schemas for validation
class GeneralSettingsSchema(BaseModel):
    platform_name: str = Field(default="GetWorxs Enterprise")
    support_email: str = Field(default="support@getworxs.com")
    admin_timezone: str = Field(default="Asia/Kolkata")
    maintenance_mode: bool = Field(default=False)
    registration_open: bool = Field(default=True)


class SMTPSettingsSchema(BaseModel):
    host: str = Field(default="smtp.mailtrap.io")
    port: int = Field(default=587)
    username: str = Field(default="")
    password: Optional[str] = Field(default="")
    from_email: str = Field(default="noreply@getworxs.com")
    from_name: str = Field(default="GetWorxs System")
    use_tls: bool = Field(default=True)


class EmailTemplatesSchema(BaseModel):
    welcome_subject: str = Field(default="Welcome to GetWorxs Enterprise Platform")
    welcome_body: str = Field(default="Hello {{name}}, welcome to your recruiter portal!")
    job_alert_subject: str = Field(default="New Job Matching Your Profile")
    job_alert_body: str = Field(default="Hi {{name}}, check out this new opportunity: {{job_title}}.")


class NotificationRulesSchema(BaseModel):
    digest_frequency: str = Field(default="Daily")
    alert_threshold_error: int = Field(default=10)
    alert_threshold_warning: int = Field(default=50)
    enable_slack_alerts: bool = Field(default=False)


class PaymentRazorpaySchema(BaseModel):
    razorpay_key_id: str = Field(default="rzp_test_mockkey123")
    razorpay_key_secret: Optional[str] = Field(default="secret_mockkey456")
    currency: str = Field(default="INR")
    tax_percentage: float = Field(default=18.0)


class SecuritySettingsSchema(BaseModel):
    enforce_2fa: bool = Field(default=False)
    session_timeout_minutes: int = Field(default=60)
    ip_allowlist: str = Field(default="")
    failed_login_limit: int = Field(default=5)
    audit_log_retention_days: int = Field(default=90)


class AIConfigurationSchema(BaseModel):
    ai_provider: str = Field(default="OpenAI")
    api_key: Optional[str] = Field(default="")
    rate_limits: int = Field(default=1000)
    cost_alerts: float = Field(default=500.0)


class StorageFilesSchema(BaseModel):
    max_file_size_mb: int = Field(default=25)
    allowed_types: str = Field(default="pdf,docx,png,jpeg")
    storage_quota_gb: int = Field(default=500)
