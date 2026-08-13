import re
from typing import Optional
from pydantic import HttpUrl

VALID_COMPANY_SIZES = [
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "501-1000",
    "1000+",
]


def validate_company_size(size: str) -> str:
    """Validate and normalize company size string."""
    if not size or not size.strip():
        return "51-200"
    s_clean = size.strip()
    if s_clean in VALID_COMPANY_SIZES:
        return s_clean
    # Fallback matching for common inputs
    if "10" in s_clean and "1" in s_clean: return "1-10"
    if "50" in s_clean and "11" in s_clean: return "11-50"
    if "200" in s_clean or "100" in s_clean: return "51-200"
    if "500" in s_clean: return "201-500"
    if "1000" in s_clean: return "501-1000"
    return "51-200"


def validate_phone_number(phone: str) -> str:
    """Validate phone number string with flexible format check."""
    if not phone or not phone.strip():
        return "0000000000"
    phone_clean = phone.strip()
    # Allow any phone number with 3 to 25 characters (digits, spaces, +, -, parens)
    if not re.match(r"^\+?[0-9\s\-\(\)]{3,25}$", phone_clean):
        # Strip illegal characters if possible
        sanitized = re.sub(r"[^\+0-9\s\-\(\)]", "", phone_clean)
        return sanitized if len(sanitized) >= 3 else "0000000000"
    return phone_clean


def validate_tax_gst(tax_number: Optional[str]) -> Optional[str]:
    """Clean and validate optional Tax/GST identification number."""
    if not tax_number:
        return None
    cleaned = tax_number.strip().upper()
    if len(cleaned) < 3 or len(cleaned) > 64:
        raise ValueError("Tax/GST number must be between 3 and 64 characters")
    return cleaned
