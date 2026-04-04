# AI Discord Server Manager — Target Architecture

## 1) Product boundaries

The platform is split into three product surfaces:

1. **Discord Bot Runtime**
   - Discord Gateway connectivity (sharded)
   - Event normalization and policy-safe data capture
   - Lightweight command handlers and action dispatch
2. **SaaS Core Backend**
   - Multi-tenant API for dashboard and integrations
   - Analytics pipelines, recommendation engine, and automation orchestration
   - Billing, feature flags, and usage enforcement
3. **Web Dashboard**
   - Owner-facing analytics and insights UI
   - Recommendation task center and automation setup flows

---

## 2) Runtime components

## Edge & Ingestion layer

- **bot-gateway service (Node.js / discord.js)**
  - Handles Discord shard lifecycle and events.
  - Publishes normalized events to queue.
  - Avoids heavy compute in event loop.
- **ingestion-api service (NestJS)**
  - Receives events from bot runtime and trusted webhooks.
  - Performs schema validation and idempotency checks.
  - Writes durable tasks to queue.

## Core application layer

- **core-api service (NestJS)**
  - OAuth2 auth, RBAC, settings, recommendations API.
  - Read models for dashboard queries.
  - Subscription plan checks and rate limiting.
- **analytics-worker**
  - Computes hourly/daily aggregates.
  - Derives features for churn/toxicity/server-death models.
  - Calculates health score versioned by formula.
- **automation-worker**
  - Runs welcome/reactivation workflows.
  - Enforces cool-down windows and per-guild guardrails.
- **insight-engine worker**
  - Translates metrics/features into insights.
  - Produces recommendation tasks with expected impact.

## Intelligence layer

- **ml-service (Python/FastAPI)**
  - Hosts model inference for churn/toxicity risks.
  - Supports rolling model versions and shadow evaluation.
- **llm-orchestrator (inside insight-engine)**
  - Uses OpenAI API to summarize and explain root causes.
  - Grounds prompts on structured metrics to avoid hallucination.

## Presentation layer

- **web app (Next.js App Router)**
  - Analytics charts, health timeline, segment distribution.
  - “What to do next” cards as executable tasks.
  - Automation templates and impact simulation.

---

## 3) Data architecture

## Primary stores

- **PostgreSQL**
  - Tenancy entities: `guilds`, `memberships`, `plans`, `usage_ledger`.
  - Analytics read models: `guild_daily_metrics`, `channel_activity_daily`, `health_scores`.
  - Product data: `insights`, `recommendations`, `automations`, `audit_log`.
- **Redis**
  - Queue backend (BullMQ).
  - Hot cache for dashboard widgets.
  - Rate-limit counters and distributed locks.
- **Object storage (S3-compatible)**
  - Short-retention raw event archives.
  - Model datasets and feature snapshots.

## Queue topology (BullMQ)

- `events.ingest`
- `metrics.aggregate.hourly`
- `features.build.daily`
- `predict.churn`
- `predict.toxicity`
- `insights.generate`
- `automation.execute`
- `notifications.dispatch`

All jobs use idempotency keys and dead-letter queue handling.

---

## 4) Domain model and scoring

## User segmentation

- `new_user`
- `core_user`
- `lurker`
- `risky_user`

Segmentation is recomputed daily from behavioral features.

## Predictive outputs

- `churn_probability` (0..1)
- `toxicity_probability` (0..1)
- `server_decline_probability` (0..1)

## Server Health Score (0..100)

Weighted composition (versioned):

- Engagement — 30%
- Retention — 25%
- Community Quality — 20%
- Structure Efficiency — 15%
- Growth Stability — 10%

Each term is normalized and capped to prevent outlier distortion.

---

## 5) Security and compliance

- OAuth2 + JWT rotation with short-lived access tokens.
- Discord action scoping by guild-level RBAC.
- PII minimization and retention TTL controls.
- Signed internal job payloads for worker trust.
- Audit trail for all automation actions.

---

## 6) Observability and SLOs

- OpenTelemetry traces across API, workers, and bot runtime.
- Prometheus metrics:
  - queue lag
  - job success rate
  - insight generation latency
  - Discord API error budgets
- SLO examples:
  - P95 dashboard API latency < 300ms
  - 99% automation jobs executed within 2 minutes
  - event ingestion durability > 99.9%

---

## 7) Scaling strategy

- Shard bot runtime by guild volume.
- Partition queue workloads by `guild_id` hash.
- Use CQRS read models for dashboard-heavy queries.
- Add Kafka only when BullMQ throughput becomes limiting.
- Support regional deployments with tenant affinity if needed.
