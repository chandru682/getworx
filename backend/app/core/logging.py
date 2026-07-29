import logging
import sys
from app.core.config import settings


def setup_logging() -> logging.Logger:
    """Configures system-wide logging formatting and log levels."""
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO

    logging_format = (
        "[%(asctime)s] [%(levelname)s] [%(name)s:%(lineno)d] - %(message)s"
    )

    logging.basicConfig(
        level=log_level,
        format=logging_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
        ],
    )

    # Silence verbose third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.DEBUG else logging.WARNING
    )

    logger = logging.getLogger("getworxs")
    logger.setLevel(log_level)
    return logger


logger = setup_logging()
