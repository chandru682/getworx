from datetime import datetime, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import logger
from app.core.database import async_engine
from app.middleware.exception_handler import register_exception_handlers
from app.schemas.health import HealthResponse, ResponseEnvelope


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown lifecycle management."""
    logger.info(f"🚀 Starting {settings.PROJECT_NAME} [{settings.ENVIRONMENT}]")
    yield
    logger.info("🛑 Shutting down database engine connection pool...")
    await async_engine.dispose()
    logger.info("👋 Application shutdown complete.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    description="Enterprise API engine for GetWorxs Global AI-Powered Recruitment Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware Configuration
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Register Global Exception Handlers
register_exception_handlers(app)

# Register Module API Routers
from app.auth.routes import router as auth_router
app.include_router(auth_router, prefix=settings.API_V1_STR)


# Health Check Endpoints
@app.get("/health", response_model=ResponseEnvelope[HealthResponse], tags=["Health"])
@app.get(f"{settings.API_V1_STR}/health", response_model=ResponseEnvelope[HealthResponse], tags=["Health"])
async def health_check():
    """System health check endpoint verifying API service availability."""
    return ResponseEnvelope(
        success=True,
        message="GetWorxs API engine operational",
        data=HealthResponse(
            status="healthy",
            environment=settings.ENVIRONMENT,
            timestamp=datetime.now(timezone.utc),
            version="1.0.0",
        )
    )
