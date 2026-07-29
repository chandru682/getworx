from datetime import datetime
from typing import Generic, Optional, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class HealthResponse(BaseModel):
    status: str
    environment: str
    timestamp: datetime
    version: str = "1.0.0"


class ResponseEnvelope(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: Optional[str] = None
