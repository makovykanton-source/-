from __future__ import annotations

import logging

from aiogram import Bot
from aiogram.enums import ChatMemberStatus
from aiogram.exceptions import TelegramAPIError

logger = logging.getLogger(__name__)


class SubscriptionCheckError(Exception):
    """Raised when Telegram does not allow us to verify the subscription."""


async def is_user_subscribed(bot: Bot, channel_id: str, user_id: int) -> bool:
    """Check whether a Telegram user is subscribed to the channel."""

    try:
        member = await bot.get_chat_member(chat_id=channel_id, user_id=user_id)
    except TelegramAPIError as error:
        logger.exception(
            "Failed to check chat member status",
            extra={"channel_id": channel_id, "user_id": user_id},
        )
        raise SubscriptionCheckError from error

    return member.status in {
        ChatMemberStatus.CREATOR,
        ChatMemberStatus.ADMINISTRATOR,
        ChatMemberStatus.MEMBER,
        ChatMemberStatus.RESTRICTED,
    }
