import asyncio
from app.database.base import Base, discover_models
discover_models()
from app.core.database import async_engine
from sqlalchemy import text


async def sync_schema():
    async with async_engine.begin() as conn:
        print("Creating missing tables in MySQL...")
        await conn.run_sync(Base.metadata.create_all)
        try:
            await conn.execute(text("ALTER TABLE candidate_profiles ADD COLUMN notice_period VARCHAR(64) NULL DEFAULT '30 Days'"))
            print("Added notice_period column to candidate_profiles.")
        except Exception as e:
            print("Column notice_period notice:", e)


if __name__ == "__main__":
    asyncio.run(sync_schema())
