"""Database Health & Diagnostic Probes for GetWorxs Platform.

Provides health checks, latency measurements, and connection pool status
reporting for system diagnostics, readiness probes, and monitoring endpoints.
"""

import time
from enum import Enum
from typing import Any, Dict
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.logging import logger
from app.database.connection import async_engine, engine


class DatabaseHealthStatus(str, Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"


async def check_database_health() -> Dict[str, Any]:
    """Execute diagnostic health check on the asynchronous database engine.

    Measures query latency, checks connection pool metrics, and queries MySQL server version.

    Returns:
        Dict containing detailed health metrics, latency_ms, status, and connection info.
    """
    start_time = time.perf_counter()
    health_data: Dict[str, Any] = {
        "status": DatabaseHealthStatus.UNHEALTHY.value,
        "database": settings.MYSQL_DATABASE,
        "host": settings.MYSQL_HOST,
        "port": settings.MYSQL_PORT,
        "latency_ms": 0.0,
        "version": None,
        "pool": {},
        "error": None,
    }

    try:
        async with async_engine.connect() as connection:
            result = await connection.execute(text("SELECT VERSION()"))
            mysql_version = result.scalar()
            latency = (time.perf_counter() - start_time) * 1000

            # Gather pool statistics if available
            pool = async_engine.pool
            pool_stats = {
                "size": pool.size(),
                "checkedin": pool.checkedin(),
                "overflow": pool.overflow(),
                "checkedout": pool.checkedout(),
            }

            health_data.update({
                "status": DatabaseHealthStatus.HEALTHY.value,
                "latency_ms": round(latency, 2),
                "version": mysql_version,
                "pool": pool_stats,
            })
    except SQLAlchemyError as exc:
        latency = (time.perf_counter() - start_time) * 1000
        health_data.update({
            "status": DatabaseHealthStatus.UNHEALTHY.value,
            "latency_ms": round(latency, 2),
            "error": str(exc),
        })
        logger.error(f"Database health check failed: {exc}")
    except Exception as exc:
        latency = (time.perf_counter() - start_time) * 1000
        health_data.update({
            "status": DatabaseHealthStatus.UNHEALTHY.value,
            "latency_ms": round(latency, 2),
            "error": f"Unexpected health check error: {exc}",
        })
        logger.error(f"Unexpected database health check failure: {exc}")

    return health_data


def check_sync_database_health() -> Dict[str, Any]:
    """Execute diagnostic health check on the synchronous database engine.

    Returns:
        Dict containing synchronous health metrics.
    """
    start_time = time.perf_counter()
    health_data: Dict[str, Any] = {
        "status": DatabaseHealthStatus.UNHEALTHY.value,
        "database": settings.MYSQL_DATABASE,
        "host": settings.MYSQL_HOST,
        "port": settings.MYSQL_PORT,
        "latency_ms": 0.0,
        "version": None,
        "error": None,
    }

    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT VERSION()"))
            mysql_version = result.scalar()
            latency = (time.perf_counter() - start_time) * 1000

            health_data.update({
                "status": DatabaseHealthStatus.HEALTHY.value,
                "latency_ms": round(latency, 2),
                "version": mysql_version,
            })
    except Exception as exc:
        latency = (time.perf_counter() - start_time) * 1000
        health_data.update({
            "status": DatabaseHealthStatus.UNHEALTHY.value,
            "latency_ms": round(latency, 2),
            "error": str(exc),
        })
        logger.error(f"Sync database health check failed: {exc}")

    return health_data
