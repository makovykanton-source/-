from __future__ import annotations

import asyncio
import logging
import sys

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.types import BotCommand
from dotenv import load_dotenv

from telegram_guide_bot.config import Settings
from telegram_guide_bot.handlers.common import register_handlers


def configure_logging() -> None:
    """Configure application-wide logging."""

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        stream=sys.stdout,
    )


async def set_main_menu(bot: Bot) -> None:
    """Register commands displayed in the Telegram UI."""

    await bot.set_my_commands(
        [
            BotCommand(command="start", description="Запустить бота"),
        ]
    )


async def main() -> None:
    """Start Telegram bot polling."""

    load_dotenv()
    configure_logging()
    settings = Settings.from_env()

    bot = Bot(
        token=settings.bot_token,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dispatcher = Dispatcher()
    dispatcher.include_router(register_handlers(settings))

    await set_main_menu(bot)
    logging.getLogger(__name__).info("Telegram bot started")
    await dispatcher.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
