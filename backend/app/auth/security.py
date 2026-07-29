import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import bcrypt
from jose import JWTError, jwt

from app.auth.exceptions import InvalidTokenException, TokenExpiredException
from app.core.config import settings


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    # Truncate to 72 bytes if necessary per bcrypt specification
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a stored bcrypt hash."""
    plain_bytes = plain_password.encode("utf-8")[:72]
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(plain_bytes, hashed_bytes)


def create_access_token(subject: str | int, role: str, extra_claims: Optional[Dict[str, Any]] = None) -> str:
    """Creates a signed JWT Access Token with expiration."""
    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.now(timezone.utc) + expires_delta

    to_encode = {
        "sub": str(subject),
        "role": role,
        "type": "access",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    if extra_claims:
        to_encode.update(extra_claims)

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(subject: str | int, role: str) -> tuple[str, datetime]:
    """Creates a signed JWT Refresh Token with extended expiration date."""
    expires_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    expires_at = datetime.now(timezone.utc) + expires_delta

    to_encode = {
        "sub": str(subject),
        "role": role,
        "type": "refresh",
        "exp": expires_at,
        "iat": datetime.now(timezone.utc),
        "jti": secrets.token_hex(16),
    }

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt, expires_at


def decode_token(token: str, expected_type: str = "access") -> Dict[str, Any]:
    """Decodes and validates a JWT token string."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_type = payload.get("type")
        if token_type != expected_type:
            raise InvalidTokenException(f"Expected {expected_type} token, got {token_type}")
        return payload
    except JWTError as e:
        if "Signature has expired" in str(e):
            raise TokenExpiredException()
        raise InvalidTokenException(f"Token validation failed: {str(e)}")


def generate_reset_token() -> str:
    """Generates a secure 32-byte URL-safe random reset token string."""
    return secrets.token_urlsafe(32)
