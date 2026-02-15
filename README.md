# Discord Shield — Production-ready Security Bot + Web Control Plane

Этот репозиторий содержит **масштабируемую backend-архитектуру** для Discord Security Bot, интегрируемую с панелью управления в стиле вашего скриншота (тёмный SOC-like dashboard с live-метриками, блоком Recent Threats и управлением модулями защиты).

## 1) Цели архитектуры

- Bot + API + Workers как отдельные сервисы.
- PostgreSQL для консистентного state.
- Redis для cache, distributed rate-limits, queue backend.
- WebSocket поток для live threat logs.
- Event-driven pipeline для security detection → response → audit.
- Подготовка к sharding и горизонтальному масштабированию.
- Zero-trust security model для панели и автоматических модулей.

---

## 2) Полная структура проекта


> Расширенная и фактическая структура всех файлов вынесена в `docs/PROJECT_STRUCTURE.md`.

```text
.
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── ops/
│   └── prometheus.yml
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── SECURITY_AUDIT.md
│   └── THREAT_MODEL.md
└── src/
    ├── main.ts
    ├── core/
    │   ├── config/env.ts
    │   ├── errors/
    │   ├── logging/logger.ts
    │   ├── security/
    │   └── types/container.ts
    ├── domain/
    │   ├── entities/security-event.ts
    │   ├── events/event-bus.ts
    │   ├── repositories/
    │   ├── services/
    │   └── value-objects/
    ├── application/
    │   ├── commands/
    │   ├── dto/
    │   ├── ports/
    │   ├── queries/
    │   └── use-cases/
    ├── infrastructure/
    │   ├── auth/discord-oauth.service.ts
    │   ├── cache/redis.ts
    │   ├── db/
    │   │   ├── migrate.ts
    │   │   ├── postgres.ts
    │   │   ├── migrations/
    │   │   └── sql/schema.sql
    │   ├── discord/
    │   ├── http/
    │   ├── metrics/
    │   ├── queue/queues.ts
    │   ├── repositories/
    │   └── websocket/log-stream.gateway.ts
    ├── api/
    │   ├── middleware/require-guild-admin.ts
    │   ├── routes/security.routes.ts
    │   ├── controllers/
    │   └── server.ts
    ├── bot/main.ts
    ├── workers/main.ts
    ├── modules/
    │   ├── anti-link/
    │   ├── anti-nuke/anti-nuke.handler.ts
    │   ├── anti-raid/
    │   ├── anti-spam/
    │   ├── anti-webhook/
    │   ├── anomaly/
    │   ├── backup/
    │   ├── lockdown/
    │   ├── role-integrity/
    │   └── trust-score/trust-score.service.ts
    └── shared/
```

---

## 3) Архитектурные слои

- **Core**: конфиг, логирование, base types, security primitives.
- **Domain**: сущности угроз, доменные события, инварианты.
- **Application**: use-cases, orchestration, commands/queries.
- **Infrastructure**: БД, Redis, Discord adapters, WS, queue processors.
- **Modules**: anti-nuke / anti-raid / anti-spam / anti-link и др.

### Event-driven поток

1. Discord event поступает в `bot/main.ts`.
2. Security module оценивает риск и генерирует `SecurityEvent`.
3. Событие уходит в queue + audit log.
4. Worker исполняет action (ban/kick/strip/lockdown).
5. API/WS мгновенно публикует updated telemetry в dashboard.

---

## 4) Реализованные защитные контуры

- Anti-nuke: лимиты destructive действий + автонаказание.
- Anti-raid: эвристики массового входа + auto lockdown.
- Anti-spam: rate/message burst filtering.
- Anti-link: blocklist + suspicious URL patterns.
- Anti-webhook: детект всплеска webhook create/spam.
- Role escalation protection: контроль опасных permission grant.
- Permission integrity monitoring: drift от baseline roles.
- Trust score: динамический риск профиля пользователя.
- Anomaly detection: поведенческие выбросы по guild telemetry.
- Backup & recovery: периодические snapshots critical server config.

---

## 5) Web-панель и API контракт

### OAuth2 + JWT flow

1. Frontend редиректит пользователя в Discord OAuth2.
2. API обменивает `code` на Discord токен и guild list.
3. API выпускает `access + refresh` JWT.
4. Frontend использует Bearer access token.
5. Refresh хранится в httpOnly cookie или secure storage BFF.

### Основные endpoints

- `GET /health`
- `GET /api/v1/guilds/:guildId/security/config`
- `PUT /api/v1/guilds/:guildId/security/config`
- `GET /api/v1/guilds/:guildId/events?cursor=...`
- `GET /api/v1/guilds/:guildId/whitelist`
- `POST /api/v1/guilds/:guildId/whitelist`
- `DELETE /api/v1/guilds/:guildId/whitelist/:userId`
- `GET /api/v1/guilds/:guildId/analytics/overview`

### WebSocket

- Channel: `threat.log`
- Payload: guildId, threatType, severity, summary, timestamp.
- Рекомендуется auth через short-lived WS token + origin pinning.

---

## 6) Схема БД

См. `src/infrastructure/db/sql/schema.sql`:

- `guilds`, `users`, `guild_user_roles`
- `guild_security_configs`
- `security_events`
- `audit_logs`
- `backups`
- `refresh_tokens`

Индексы:

- Лента событий по guild/time.
- Фильтрация по типу угроз.
- Audit trail по guild/time.
- Trust score access path.

---

## 7) Масштабирование

### Discord sharding

- Запуск нескольких bot инстансов с `SHARD_COUNT/SHARD_ID`.
- Sticky assignment shard → guild partitions.
- Shared Redis pub/sub для cross-shard сигналов.

### Horizontal scaling

- API без session state (JWT/stateless), scale через N replicas.
- Workers масштабируются отдельно по queue lag.
- Rate-limit store централизован в Redis.

### Очереди

- BullMQ queues:
  - `moderation-actions`
  - `backup-jobs`
  - `analytics-events`

### Health/Monitoring

- `/health` для liveness.
- Prometheus scrape (`ops/prometheus.yml`).
- Дополнительно рекомендуются Grafana + Alertmanager.

---

## 8) Безопасность (production guidance)

- Secrets только через vault/secret manager.
- Хэширование refresh token перед хранением.
- SQL injection mitigation: только parameterized queries.
- CORS allowlist, deny by default.
- Distributed rate-limit на вход API + sensitive routes.
- RBAC проверка `MANAGE_GUILD` в middleware.
- Audit logging всех security-sensitive действий.
- Zero-trust: даже администратор может быть subject для anti-nuke policy.

---

## 9) Запуск

```bash
npm install
npm run check
npm run build
npm run dev
```

Docker:

```bash
docker compose up --build
```

---

## 10) Что доработать перед полным продом

- Vault integration (HashiCorp Vault / AWS Secrets Manager).
- Реальный adapter для Discord moderation действий в worker.
- Idempotency keys + exactly-once guard для punish actions.
- SIEM export (например, OpenSearch/Splunk).
- Canary deployments и chaos-testing anti-raid pipeline.
