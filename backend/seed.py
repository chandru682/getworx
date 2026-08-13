"""
GetWorxs Root Seeder Command Entry Point
========================================
Run command:
  python seed.py
  python seed.py --reset
"""

import argparse
import asyncio
from app.database.seed import seed_database

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GetWorxs Production Test Data Seeder")
    parser.add_argument("--reset", action="store_true", help="Truncate and reset existing test data before seeding")
    args = parser.parse_args()

    asyncio.run(seed_database(reset=args.reset))
