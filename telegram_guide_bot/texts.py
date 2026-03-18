from __future__ import annotations

LAWYER_INFO = (
    "👩‍⚖️ <b>Юрист: Татьяна Сыроватка</b>\n"
    "Telegram: @yourist_Tatiana_Syrovatka\n"
    "Телефон: +79620005662\n"
    "Сайты:\n"
    "• https://sta-legal.ru/\n"
    "• https://stavdolgi.ru/"
)

START_TEXT = (
    "Здравствуйте! Я — <b>Сыроватка и партнеры</b>.\n\n"
    "Чтобы забрать гайд, подпишитесь на мой Telegram-канал.\n\n"
    f"{LAWYER_INFO}"
)

NOT_SUBSCRIBED_TEXT = (
    "Вы не подписаны на канал.\n\n"
    "Подпишитесь и нажмите «Проверить снова».\n\n"
    f"{LAWYER_INFO}"
)

SUCCESS_TEXT = (
    "Спасибо за подписку! Вот ваш гайд:\n\n"
    f"{LAWYER_INFO}"
)

CONTACTS_TEXT = LAWYER_INFO

SUBSCRIPTION_ERROR_TEXT = (
    "Не удалось проверить подписку прямо сейчас.\n"
    "Убедитесь, что бот добавлен в канал как администратор, и попробуйте снова позже.\n\n"
    f"{LAWYER_INFO}"
)
