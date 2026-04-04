# Monorepo Blueprint (Bot + API + Web + Intelligence)

## Proposed tree

```text
apps/
  api/                  # Core SaaS API (NestJS)
  bot/                  # Discord bot runtime (discord.js)
  web/                  # Next.js dashboard
  worker-analytics/     # Metrics, features, health score jobs
  worker-automation/    # Welcome/reactivation/action executor
  ml-service/           # Python service for model inference
packages/
  config/               # Shared runtime config and env schemas
  types/                # Shared DTO/event/types contracts
  ui/                   # Shared dashboard UI components
  eslint-config/        # Shared lint config
  tsconfig/             # Shared TS base configs
docs/
  AI_SERVER_MANAGER_ARCHITECTURE.md
  MVP_ROADMAP.md
  MONOREPO_BLUEPRINT.md
```

## App responsibilities

## `apps/bot`

- Gateway connection and shard orchestration.
- Event normalization and publish to queue.
- Minimal command surface (health/debug/admin-safe).

## `apps/api`

- Auth, guild settings, recommendations, insights APIs.
- Reads aggregated models for fast dashboard responses.
- Enforces billing limits and entitlement checks.

## `apps/web`

- Activity and health dashboards.
- Recommendation task center.
- Automation builder and experiment monitor.

## `apps/worker-analytics`

- Aggregation pipelines (hourly/daily).
- Feature engineering for prediction.
- Health score recomputation and history.

## `apps/worker-automation`

- Trigger evaluation and action dispatch.
- Rule guardrails and anti-spam controls.
- Outcome logging for causal analysis.

## `apps/ml-service`

- Online inference endpoints.
- Model registry integrations.
- Shadow inference and drift metrics.

---

## Shared packages

## `packages/types`

- Canonical event contracts (`GuildEventV1`).
- Shared API DTOs and enum definitions.
- Prevents schema drift between bot/api/workers.

## `packages/config`

- zod env schemas.
- Strongly-typed config loader.
- Secret contract checks at startup.

## `packages/ui`

- Shared dashboard components and chart wrappers.
- Enforces visual consistency and faster page delivery.

---

## Delivery workflow

- Monorepo workspace manager: npm workspaces (MVP), optional migration to pnpm/turbo.
- CI matrix by app/package path changes.
- Contract tests on `packages/types` gates before deploy.
- Staged deploy order:
  1. shared packages
  2. api/workers
  3. bot
  4. web

---

## Non-functional defaults

- API P95 latency target under 300ms for dashboard endpoints.
- Queue retry policy with exponential backoff and jitter.
- Per-guild concurrency caps for automation workers.
- Full audit coverage for automated actions and admin changes.
