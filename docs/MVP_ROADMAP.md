# AI Discord Server Manager — MVP Roadmap

## Phase 0 — Foundation (Week 1-2)

## Objectives

- Establish secure multi-tenant baseline.
- Integrate bot + auth + core persistence.

## Deliverables

- Discord OAuth2 login and guild linking.
- Bot installation flow + permissions validator.
- Event ingestion for joins/leaves/messages/reactions.
- Baseline dashboard shell (health endpoint + guild overview).
- Telemetry starter pack (logs, metrics, traces).

## Exit criteria

- 10 test guilds ingest events reliably for 72 hours.
- No P0 auth/security issues in smoke audit.

---

## Phase 1 — Analytics MVP (Week 3-5)

## Objectives

- Replace raw logs with actionable activity analytics.

## Deliverables

- Activity graphs: DAU/WAU, channel activity trend, join/leave trend.
- Dead channel detector (rule-based thresholds).
- Segment v1: `new_user`, `core_user`, `lurker`.
- Insight cards generated from metrics + deterministic templates.

## Exit criteria

- At least 3 useful insights per guild/week with owner feedback score >= 3/5.

---

## Phase 2 — Prediction MVP (Week 6-9)

## Objectives

- Introduce risk prediction and server health scoring.

## Deliverables

- Churn model v1 (member-level probability).
- Toxicity model v1 (member and channel risk signal).
- Server decline model v1.
- Health score v1 with trend and confidence.
- Recommendation tasks prioritized by expected impact.

## Exit criteria

- Model offline AUC thresholds:
  - churn >= 0.72
  - toxicity >= 0.75
- Owner acceptance rate of recommendations >= 25%.

---

## Phase 3 — Automation MVP (Week 10-12)

## Objectives

- Convert recommendations into measurable interventions.

## Deliverables

- Smart welcome workflow with templates.
- Reactivation workflow for inactive members.
- Suggestion nudges (where to engage next).
- Safety controls: max sends/day, quiet hours, opt-out support.
- A/B testing framework for automation outcomes.

## Exit criteria

- +8% relative uplift in 7-day activation for cohort with welcome automation.

---

## Phase 4 — Commercial hardening (Week 13-16)

## Objectives

- Prepare for paid growth and higher reliability requirements.

## Deliverables

- Stripe billing integration + plans + usage caps.
- Team roles for dashboard (`owner`, `admin`, `analyst`).
- Data retention controls and export/delete endpoints.
- SLO dashboards and on-call alerting.

## Exit criteria

- First paid cohort onboarded.
- Incident response playbook validated in game day.

---

## MVP backlog (epics and initial stories)

## Epic A — Tenant and auth

- Story A1: Discord OAuth2 callback + account linking.
- Story A2: Guild selection and installation UX.
- Story A3: Guild-scoped RBAC middleware.

## Epic B — Data ingestion

- Story B1: Bot event normalization contract.
- Story B2: Event idempotency and dedup.
- Story B3: Retry + dead-letter handling.

## Epic C — Analytics and insights

- Story C1: Daily aggregate jobs.
- Story C2: Dead channel heuristic service.
- Story C3: Insight cards API.

## Epic D — Prediction

- Story D1: Feature store tables.
- Story D2: Churn inference job.
- Story D3: Toxicity inference job.
- Story D4: Health score service.

## Epic E — Recommendations

- Story E1: Recommendation ranking strategy.
- Story E2: Task board UI with assignee and status.
- Story E3: Impact tracking pipeline.

## Epic F — Automations

- Story F1: Welcome flow designer.
- Story F2: Reactivation flow templates.
- Story F3: Automation audit log.

## Epic G — Commercialization

- Story G1: Usage metering ledger.
- Story G2: Billing webhook processor.
- Story G3: Feature flag by plan.
