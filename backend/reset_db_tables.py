import asyncio
from sqlalchemy import text
from app.database.connection import async_engine

async def clear_tables():
    print("=========================================================")
    print("CLEARING RECRUITER & COMPANY TEST DATA TABLES (MySQL)")
    print("=========================================================")
    async with async_engine.begin() as conn:
        await conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        
        tables_to_clear = [
            "company_recruiters",
            "company_subscriptions",
            "payment_transactions",
            "company_documents",
            "company_branches",
            "company_settings",
            "companies"
        ]
        
        for table in tables_to_clear:
            try:
                await conn.execute(text(f"TRUNCATE TABLE `{table}`;"))
                print(f"  [CLEARED] Table `{table}` truncated successfully.")
            except Exception as e:
                print(f"  [NOTICE] Table `{table}`: {e}")
                
        await conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
    
    print("\n[SUCCESS] Test data tables cleared! Database schema and structure remain intact.")

if __name__ == "__main__":
    asyncio.run(clear_tables())
