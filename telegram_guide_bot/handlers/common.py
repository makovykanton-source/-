from __future__ import annotations

import logging

from aiogram import F, Router
from aiogram.filters import CommandStart
from aiogram.types import CallbackQuery, Message

from telegram_guide_bot.config import Settings
from telegram_guide_bot.keyboards import guide_keyboard, not_subscribed_keyboard, start_keyboard
from telegram_guide_bot.services.subscription import SubscriptionCheckError, is_user_subscribed
from telegram_guide_bot.texts import CONTACTS_TEXT, NOT_SUBSCRIBED_TEXT, START_TEXT, SUBSCRIPTION_ERROR_TEXT, SUCCESS_TEXT

logger = logging.getLogger(__name__)


def register_handlers(settings: Settings) -> Router:
    """Create router with all bot handlers."""

    router = Router()

    @router.message(CommandStart())
    async def start_handler(message: Message) -> None:
        """Send the welcome text and the first action buttons."""

        await message.answer(START_TEXT, reply_markup=start_keyboard())

    @router.callback_query(F.data == "check_subscription")
    async def check_subscription_handler(callback: CallbackQuery) -> None:
        """Verify that the user is subscribed to the configured channel."""

        user = callback.from_user
        message = callback.message

        if message is None:
            await callback.answer("Сообщение недоступно.", show_alert=True)
            return

        try:
            subscribed = await is_user_subscribed(
                bot=callback.bot,
                channel_id=settings.channel_id,
                user_id=user.id,
            )
        except SubscriptionCheckError:
            await message.answer(
                SUBSCRIPTION_ERROR_TEXT,
                reply_markup=not_subscribed_keyboard(),
            )
            await callback.answer("Ошибка проверки подписки", show_alert=True)
            return

        if subscribed:
            await message.answer(SUCCESS_TEXT, reply_markup=guide_keyboard())
            await callback.answer("Подписка подтверждена ✅")
            logger.info("Subscription confirmed", extra={"user_id": user.id})
            return

        await message.answer(
            NOT_SUBSCRIBED_TEXT,
            reply_markup=not_subscribed_keyboard(),
        )
        await callback.answer("Подписка не найдена")
        logger.info("Subscription missing", extra={"user_id": user.id})

    @router.callback_query(F.data == "contacts")
    async def contacts_handler(callback: CallbackQuery) -> None:
        """Send lawyer contact information on demand."""

        message = callback.message
        if message is not None:
            await message.answer(CONTACTS_TEXT)
        await callback.answer()

    return router
