from __future__ import annotations

import os
from dataclasses import dataclass


GUIDE_URL = "https://example.com/guide.pdf"
CHANNEL_URL = "https://t.me/syrovatka_t"


@dataclass(slots=True)
class Settings:
    """Runtime settings loaded from environment variables."""

    bot_token: str
    channel_id: str

    @classmethod
    def from_env(cls) -> "Settings":
        bot_token = os.getenv("BOT_TOKEN", "").strip()
        channel_id = os.getenv("CHANNEL_ID", "").strip()

        if not bot_token:
            raise ValueError("Environment variable BOT_TOKEN is required.")

        if not channel_id:
            raise ValueError("Environment variable CHANNEL_ID is required.")

        return cls(bot_token=bot_token, channel_id=channel_id)
