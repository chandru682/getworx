import asyncio
from sqlalchemy import text
from app.database.connection import async_engine
from app.database.base import Base, discover_models

async def fix_schema():
    print("=========================================================")
    print("SYNCING MYSQL DATABASE SCHEMA & MISSING USER COLUMNS")
    print("=========================================================")
    discover_models()
    
    async with async_engine.begin() as conn:
        await conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        
        # Ensure all tables in SQLAlchemy Base metadata are created
        await conn.run_sync(Base.metadata.create_all)
        
        # Check and add missing onboarding columns to `users` table
        columns_to_add = [
            ("company_name", "VARCHAR(255) NULL"),
            ("company_id", "INT NULL"),
            ("must_change_password", "BOOLEAN NOT NULL DEFAULT FALSE"),
            ("last_password_changed_at", "DATETIME NULL"),
            ("invited_by_id", "INT NULL"),
            ("invited_at", "DATETIME NULL"),
            ("temporary_password_expiry", "DATETIME NULL"),
        ]
        
        for col_name, col_def in columns_to_add:
            try:
                await conn.execute(text(f"ALTER TABLE `users` ADD COLUMN `{col_name}` {col_def};"))
                print(f"  [ADDED] Column `users`.`{col_name}` created successfully.")
            except Exception as e:
                err_str = str(e)
                if "Duplicate column name" in err_str or "1060" in err_str:
                    print(f"  [OK] Column `users`.`{col_name}` is already present.")
                else:
                    print(f"  [NOTICE] Column `users`.`{col_name}`: {e}")

        # Check and add missing/rename columns in `jobs` table
        try:
            await conn.execute(text("ALTER TABLE `jobs` ADD COLUMN `employer_id` INT NULL;"))
            await conn.execute(text("UPDATE `jobs` SET `employer_id` = `created_by_id` WHERE `employer_id` IS NULL;"))
            print("  [ADDED] Column `jobs`.`employer_id` created successfully.")
        except Exception as e:
            err_str = str(e)
            if "Duplicate column name" in err_str or "1060" in err_str:
                print("  [OK] Column `jobs`.`employer_id` is already present.")
            else:
                print(f"  [NOTICE] Column `jobs`.`employer_id`: {e}")

        try:
            await conn.execute(text("ALTER TABLE `jobs` RENAME COLUMN `current_location_pref` TO `current_location`;"))
            print("  [RENAMED] Column `jobs`.`current_location_pref` renamed to `current_location` successfully.")
        except Exception as e:
            err_str = str(e)
            if "Unknown column" in err_str or "1054" in err_str or "check that column/key exists" in err_str:
                try:
                    await conn.execute(text("ALTER TABLE `jobs` ADD COLUMN `current_location` VARCHAR(255) NULL;"))
                    print("  [ADDED] Column `jobs`.`current_location` created successfully.")
                except Exception as ex:
                    ex_str = str(ex)
                    if "Duplicate column name" in ex_str or "1060" in ex_str:
                        print("  [OK] Column `jobs`.`current_location` is already present.")
                    else:
                        print(f"  [NOTICE] Column `jobs`.`current_location`: {ex}")
            elif "Duplicate column name" in err_str or "1060" in err_str or "already exists" in err_str:
                print("  [OK] Column `jobs`.`current_location` is already present.")
            else:
                print(f"  [NOTICE] Renaming `jobs`.`current_location_pref`: {e}")

        # Check and add missing columns to `job_screening_questions` table
        sq_columns_to_add = [
            ("is_knockout", "BOOLEAN NOT NULL DEFAULT FALSE"),
            ("preferred_answer", "TEXT NULL"),
            ("display_order", "INT NOT NULL DEFAULT 0"),
        ]
        for col_name, col_def in sq_columns_to_add:
            try:
                await conn.execute(text(f"ALTER TABLE `job_screening_questions` ADD COLUMN `{col_name}` {col_def};"))
                print(f"  [ADDED] Column `job_screening_questions`.`{col_name}` created successfully.")
            except Exception as e:
                err_str = str(e)
                if "Duplicate column name" in err_str or "1060" in err_str:
                    print(f"  [OK] Column `job_screening_questions`.`{col_name}` is already present.")
                else:
                    print(f"  [NOTICE] Column `job_screening_questions`.`{col_name}`: {e}")

        await conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))

    print("\n[SUCCESS] MySQL schema synchronized cleanly!")

if __name__ == "__main__":
    asyncio.run(fix_schema())

