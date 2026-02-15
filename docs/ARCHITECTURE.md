# Architecture Notes

- DDD-like boundaries with strict separation by layers.
- Event bus for local domain events, queue for durable async processing.
- API and Bot separated to avoid Discord gateway backpressure impacting panel UX.
- Worker tier consumes moderation/backup/anomaly jobs.
