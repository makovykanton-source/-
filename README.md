# Discord Shield — Production-ready Discord Security Bot

Production-ready backend-платформа для Discord Security Bot с web-панелью управления, REST API, WebSocket live-логами, PostgreSQL, Redis и worker-процессами.

---

## 1) Что это за проект

Проект состоит из 3 основных сервисов:

1. **API-сервис** (Fastify)
   - OAuth2 + JWT авторизация
   - REST API для панели
   - WebSocket/live интеграция
2. **Discord Bot-сервис**
   - подписка на Discord события
   - запуск модулей защиты
3. **Worker-сервис**
   - выполнение тяжелых задач из очередей (BullMQ)
   - backup, moderation, analytics

Также используются:
- **PostgreSQL** — постоянное хранение данных
- **Redis** — cache, rate-limit и очередь задач
- **Prometheus** — метрики

---

## 2) Требования перед установкой

Установите:

- **Node.js 20+** (рекомендуется 20 LTS)
- **npm 10+**
- **discord.js 14.25+** (в `package.json`)
- **Docker + Docker Compose** (если запускаете контейнерами)
- **PostgreSQL 16+** (если запускаете локально без Docker)
- **Redis 7+** (если запускаете локально без Docker)

Проверка версий:

```bash
node -v
npm -v
docker -v
docker compose version
```

> В репозитории есть `.nvmrc`, можно быстро переключиться на нужную версию Node.

---

## 3) Установка проекта (локально)

### Шаг 1. Клонируйте репозиторий

```bash
git clone <your-repo-url>
cd <repo-folder>
```

### Шаг 2. Установите зависимости

```bash
npm install
```

### Шаг 3. Создайте env-файл

```bash
cp .env.example .env
```

### Шаг 4. Заполните `.env`

Обязательно задайте корректные значения:

- `DISCORD_TOKEN`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `DATABASE_URL`
- `REDIS_URL`
- `CORS_ALLOWED_ORIGINS`
- `WS_ALLOWED_ORIGINS`

---

## 4) Что и где настраивать

### 4.1 Discord Developer Portal

1. Создайте приложение в Discord Developer Portal.
2. Создайте Bot и скопируйте токен в `DISCORD_TOKEN`.
3. В OAuth2 настройках:
   - добавьте `redirect URI` (совпадает с `DISCORD_REDIRECT_URI`)
   - используйте scopes: `identify`, `guilds`, при необходимости `bot`.
4. Включите нужные intents для бота (в зависимости от политики сервера):
   - Guild Members
   - Message Content
   - Guild Moderation

### 4.2 JWT/Secrets

- Используйте длинные случайные ключи (минимум 32 символа):
  - `JWT_ACCESS_SECRET`
  - `JWT_REFRESH_SECRET`
- Не храните секреты в git.
- В проде храните секреты в Vault/Secrets Manager.

### 4.3 База данных

В `DATABASE_URL` укажите вашу БД PostgreSQL.
Пример:

```env
DATABASE_URL=postgresql://shield:shield_password@localhost:5432/discord_shield
```

### 4.4 Redis

В `REDIS_URL` укажите Redis endpoint.
Пример:

```env
REDIS_URL=redis://localhost:6379
```

### 4.5 CORS и WS Origins

Ограничьте доступ только вашей панелью:

```env
CORS_ALLOWED_ORIGINS=https://dashboard.example.com
WS_ALLOWED_ORIGINS=https://dashboard.example.com
```

---

## 5) Миграции и запуск

### Шаг 1. Проверка типов

```bash
npm run check
```

### Шаг 2. Сборка

```bash
npm run build
```

### Шаг 3. Применение схемы БД

```bash
npm run migrate
```

### Шаг 4. Запуск API

```bash
npm run start
```

### Шаг 5. Запуск бота

```bash
npm run bot
```

### Шаг 6. Запуск worker

```bash
npm run worker
```

Для разработки (hot reload):

```bash
npm run dev
```

---

## 6) Запуск через Docker Compose

### Шаг 1. Подготовка env

```bash
cp .env.example .env
# отредактируйте .env
```

### Шаг 2. Поднимите сервисы

```bash
docker compose up --build
```

Поднимутся:
- `api`
- `bot`
- `worker`
- `postgres`
- `redis`
- `prometheus`

---

## 7) Основные API маршруты

- `GET /health`
- `GET /health/deep`
- `GET /metrics`
- `GET /api/v1/auth/discord/login`
- `GET /api/v1/guilds/:guildId/security/config`
- `PUT /api/v1/guilds/:guildId/security/config`
- `GET /api/v1/guilds/:guildId/events`
- `GET /api/v1/guilds/:guildId/whitelist`
- `GET /api/v1/guilds/:guildId/dashboard/overview`
- `GET /api/v1/guilds/:guildId/policies`
- `PUT /api/v1/guilds/:guildId/policies`
- `POST /api/v1/guilds/:guildId/recovery/restore`
- `POST /api/v1/guilds/:guildId/live/test-event`

---

## 8) Где менять конфигурацию безопасности

### 8.1 ENV-конфиги

- `src/core/config/env.ts`
- `src/core/config/tokens.ts`

### 8.2 Политики защиты

- API endpoint: `PUT /api/v1/guilds/:guildId/policies`
- Репозиторий политики: `src/infrastructure/repositories/pg-policy.repository.ts`

### 8.3 Модули защиты

- Anti-nuke: `src/modules/anti-nuke/*`
- Anti-raid: `src/modules/anti-raid/*`
- Anti-spam: `src/modules/anti-spam/*`
- Anti-link: `src/modules/anti-link/*`
- Anti-webhook: `src/modules/anti-webhook/*`
- Lockdown: `src/modules/lockdown/*`
- Anomaly: `src/modules/anomaly/*`

---

## 9) Структура проекта

Подробная структура вынесена в:

- `docs/PROJECT_STRUCTURE.md`

Архитектурные документы:

- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/THREAT_MODEL.md`
- `docs/SECURITY_AUDIT.md`

---

## 10) Частые проблемы и решение

### Проблема: `Cannot find type definition file for 'node'`

Решение:

1. Проверьте версию Node (должна быть 20+).
2. Выполните чистую установку зависимостей:

```bash
rm -rf node_modules package-lock.json
npm install
npm run check
```

### Проблема: `tsx: not found`

Решение:

```bash
npm install
npm run dev
```

### Проблема: `ws does not provide an export named 'Server'`

Проверьте, что в коде используется `WebSocketServer` из `ws`.

### Проблема: ошибки `EBADENGINE`

Вы запускаете неподдерживаемую версию Node/npm.
Используйте Node 20+ и npm 10+.

---

## 11) Production checklist

Перед продом проверьте:

- [ ] Все секреты вынесены из `.env` в секрет-хранилище
- [ ] Включен TLS на ingress/reverse proxy
- [ ] CORS/WS origins ограничены доменом панели
- [ ] Настроены backup и restore тесты
- [ ] Включен мониторинг Prometheus + алерты
- [ ] Включен audit logging чувствительных действий
- [ ] Проверены rate-limit правила
- [ ] Проверен sharding plan для Discord бота

---

## 12) Быстрый старт (коротко)

```bash
cp .env.example .env
npm install
npm run check
npm run build
npm run migrate
npm run start
```

(бот и worker запускаются отдельными процессами: `npm run bot`, `npm run worker`)

### Проблема: `GatewayIntentBits` / `Partials` не найдены

Обычно это признак старой версии `discord.js` в окружении.

Решение:

```bash
npm install
npm ls discord.js
```

Убедитесь, что установлена ветка `14.x` (рекомендуется `14.25+`).


### Проблема: установился `discord.js@13.x` вместо `14.x`

Это обычно происходит из-за старого lock-файла, кэша или внутреннего registry, который отдает устаревшую версию.

Сделайте так:

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm ls discord.js
```

Должно быть: `discord.js@14.25.x` (или выше в ветке 14).

В проекте добавлены `overrides` и проверка `npm run verify:deps`, поэтому postinstall теперь явно валидирует major-версию.


## 13) Нужен ли прокси и как его подключить

Коротко:

- Если сервер имеет прямой доступ в интернет (npm registry, Discord API, OAuth endpoints) — **прокси не нужен**.
- Если в вашей сети исходящий трафик ограничен — используйте HTTP/HTTPS proxy.

### Когда прокси точно нужен

- `npm install` падает из-за сетевых ограничений.
- API/Bot не могут достучаться до `discord.com`.
- Ваша компания требует egress только через proxy gateway.

### Где настраивать

В `.env` (и уже добавлено в `.env.example`):

```env
HTTP_PROXY=http://proxy.company.local:8080
HTTPS_PROXY=http://proxy.company.local:8080
NO_PROXY=localhost,127.0.0.1,::1,postgres,redis
```

### Что ставить в параметры

1. **HTTP_PROXY** — адрес прокси для HTTP.
2. **HTTPS_PROXY** — адрес прокси для HTTPS (обычно тот же).
3. **NO_PROXY** — список хостов/сервисов, которые не должны идти через прокси:
   - локальные адреса (`localhost`, `127.0.0.1`)
   - внутренние контейнеры (`postgres`, `redis`)

### Практическая проверка

```bash
# посмотреть активные proxy env
env | rg -i 'proxy|no_proxy'

# проверить доступ к npm registry
curl -I https://registry.npmjs.org/
```

Если видите `403`/`CONNECT tunnel failed` — это почти всегда политика прокси/файрвола, а не ошибка кода.

### Важно

- Не указывайте логин/пароль прокси в git.
- Для production храните чувствительные proxy credentials в secret manager.
