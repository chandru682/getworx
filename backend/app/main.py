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
    logger.info(f" Starting {settings.PROJECT_NAME} [{settings.ENVIRONMENT}]")
    try:
        from app.database.base import Base, discover_models
        from app.database.connection import engine
        discover_models()
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified / created successfully.")

        # Seed Platform Settings Defaults
        try:
            from app.database.session import get_async_db_context
            from app.settings.service import PlatformSettingsService
            async with get_async_db_context() as db:
                settings_svc = PlatformSettingsService(db)
                await settings_svc.initialize_default_settings()
            logger.info("Platform default settings initialized successfully.")
        except Exception as s_exc:
            logger.warning(f"Settings startup initialization warning: {s_exc}")
    except Exception as exc:
        logger.warning(f"Database initialization warning: {exc}")
    yield
    logger.info(" Shutting down database engine connection pool...")
    await async_engine.dispose()
    logger.info(" Application shutdown complete.")


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
cors_origins = [str(origin) for origin in settings.CORS_ORIGINS] if settings.CORS_ORIGINS else []
cors_origins.extend(["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register Global Exception Handlers
register_exception_handlers(app)

# Discover models to ensure all ORM relationships are registered
from app.database.base import discover_models
discover_models()

# Register Module API Routers
from app.auth.routes import router as auth_router

from app.applications.routes import router as applications_router
from app.candidates.routes import router as candidates_router
from app.companies.routes import router as companies_router
from app.subscriptions.routes import router as subscriptions_router
from app.jobs.routes import router as jobs_router, admin_router as admin_jobs_router
from app.notifications.routes import router as notifications_router
from app.interviews.routes import router as interviews_router
from app.admin.routes import router as admin_router
from app.settings.routes import router as settings_router
from app.demo_requests.routes import router as demo_router, admin_demo_router
from app.employers.routes import router as employer_dashboard_router

app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(applications_router, prefix=settings.API_V1_STR)
app.include_router(candidates_router, prefix=settings.API_V1_STR)
app.include_router(companies_router, prefix=settings.API_V1_STR)
app.include_router(subscriptions_router, prefix=settings.API_V1_STR)
app.include_router(jobs_router, prefix=settings.API_V1_STR)
app.include_router(admin_jobs_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(interviews_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)
app.include_router(demo_router, prefix=settings.API_V1_STR)
app.include_router(admin_demo_router, prefix=settings.API_V1_STR)
from app.admin.analytics_routes import analytics_router, reports_router
from app.admin.payment_routes import payment_router, invoice_router

app.include_router(analytics_router, prefix=f"{settings.API_V1_STR}/admin")
app.include_router(reports_router, prefix=f"{settings.API_V1_STR}/admin")
app.include_router(payment_router, prefix=f"{settings.API_V1_STR}/admin")
app.include_router(invoice_router, prefix=f"{settings.API_V1_STR}/admin")
# Register Employer Dashboard router
app.include_router(employer_dashboard_router, prefix=settings.API_V1_STR)

from app.candidates.talent_routes import talent_router
app.include_router(talent_router, prefix=settings.API_V1_STR)

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
