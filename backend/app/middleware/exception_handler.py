from fastapi import Request, FastAPI, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.errors import AppException
from app.core.logging import logger


def register_exception_handlers(app: FastAPI) -> None:
    """Registers custom global exception handlers with standardized JSON responses."""

    @app.exception_handler(AppException)
    async def custom_app_exception_handler(request: Request, exc: AppException):
        logger.warning(
            f"AppException [{exc.code}] on {request.method} {request.url.path}: {exc.message}"
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "details": exc.details,
                },
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.warning(
            f"ValidationError on {request.method} {request.url.path}: {exc.errors()}"
        )
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=jsonable_encoder({
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Invalid input parameters",
                    "details": exc.errors(),
                },
            }),
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        logger.warning(
            f"HTTPException [{exc.status_code}] on {request.method} {request.url.path}: {exc.detail}"
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": "HTTP_ERROR",
                    "message": str(exc.detail),
                    "details": {},
                },
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        import traceback
        print("\n" + "="*50)
        print(f"UNHANDLED EXCEPTION on {request.method} {request.url.path}:")
        traceback.print_exc()
        print("="*50 + "\n")
        logger.error(
            f"Unhandled Server Error on {request.method} {request.url.path}: {exc}",
            exc_info=True,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected server error occurred. Please try again later.",
                    "details": {},
                },
            },
        )
