from __future__ import annotations

from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup

from telegram_guide_bot.config import CHANNEL_URL, GUIDE_URL


def start_keyboard() -> InlineKeyboardMarkup:
    """Keyboard for the /start command."""

    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Проверить подписку", callback_data="check_subscription")],
            [InlineKeyboardButton(text="Контакты", callback_data="contacts")],
        ]
    )


def not_subscribed_keyboard() -> InlineKeyboardMarkup:
    """Keyboard shown to users without an active channel subscription."""

    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Подписаться", url=CHANNEL_URL)],
            [InlineKeyboardButton(text="Проверить снова", callback_data="check_subscription")],
            [InlineKeyboardButton(text="Контакты", callback_data="contacts")],
        ]
    )


def guide_keyboard() -> InlineKeyboardMarkup:
    """Keyboard with a guide download link and contact shortcut."""

    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Открыть PDF-гайд", url=GUIDE_URL)],
            [InlineKeyboardButton(text="Контакты", callback_data="contacts")],
        ]
    )
