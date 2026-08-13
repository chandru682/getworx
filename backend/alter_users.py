import pymysql
import os
from urllib.parse import urlparse
from app.core.config import settings

url = urlparse(settings.DATABASE_URL.replace("mysql+pymysql://", "mysql://"))
conn = pymysql.connect(
    host=url.hostname or "localhost",
    user=url.username or "root",
    password=url.password or "password",
    database=url.path[1:],
    port=url.port or 3306
)
cursor = conn.cursor()
try:
    cursor.execute("ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER NOT NULL DEFAULT 0")
    print("Added failed_login_attempts")
except Exception as e:
    print(e)

try:
    cursor.execute("ALTER TABLE users ADD COLUMN locked_until DATETIME(6)")
    print("Added locked_until")
except Exception as e:
    print(e)
conn.commit()
conn.close()
