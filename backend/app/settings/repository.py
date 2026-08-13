import json
from typing import List, Optional, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.settings.models import PlatformSetting


class PlatformSettingsRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all_settings(self) -> List[PlatformSetting]:
        stmt = select(PlatformSetting).order_by(PlatformSetting.category, PlatformSetting.key)
        return list((await self.session.execute(stmt)).scalars().all())

    async def get_settings_by_category(self, category: str) -> List[PlatformSetting]:
        stmt = select(PlatformSetting).where(PlatformSetting.category == category)
        return list((await self.session.execute(stmt)).scalars().all())

    async def get_setting_by_key(self, key: str) -> Optional[PlatformSetting]:
        stmt = select(PlatformSetting).where(PlatformSetting.key == key)
        return (await self.session.execute(stmt)).scalar_one_or_none()

    async def upsert_setting(self, key: str, value: Any, category: str = "general", is_secret: bool = False) -> PlatformSetting:
        setting = await self.get_setting_by_key(key)
        str_val = json.dumps(value) if not isinstance(value, str) else value
        if setting:
            setting.value = str_val
            setting.category = category
            setting.is_secret = is_secret
        else:
            setting = PlatformSetting(
                key=key,
                value=str_val,
                category=category,
                is_secret=is_secret
            )
            self.session.add(setting)
        await self.session.flush()
        return setting
