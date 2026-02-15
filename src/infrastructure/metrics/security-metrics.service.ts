import { Counter, Gauge, Histogram, Registry } from "prom-client";

export class SecurityMetricsService {
  private readonly registry = new Registry();

  readonly threatsTotal = new Counter({
    name: "discord_shield_security_threats_total",
    help: "Total detected threats by type and severity",
    labelNames: ["threat_type", "severity", "guild_id"],
    registers: [this.registry]
  });

  readonly actionsTotal = new Counter({
    name: "discord_shield_security_actions_total",
    help: "Total executed mitigation actions",
    labelNames: ["action", "status", "guild_id"],
    registers: [this.registry]
  });

  readonly decisionDuration = new Histogram({
    name: "discord_shield_security_decision_duration_seconds",
    help: "Decision runtime for security checks",
    labelNames: ["pipeline", "guild_id"],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.2, 0.5, 1],
    registers: [this.registry]
  });

  readonly queueLagGauge = new Gauge({
    name: "discord_shield_queue_lag",
    help: "Queue lag by queue name",
    labelNames: ["queue"],
    registers: [this.registry]
  });

  readonly websocketClientsGauge = new Gauge({
    name: "discord_shield_ws_clients",
    help: "Connected WebSocket clients",
    labelNames: ["channel"],
    registers: [this.registry]
  });

  recordThreat(guildId: string, threatType: string, severity: string): void {
    this.threatsTotal.inc({ guild_id: guildId, threat_type: threatType, severity: severity }, 1);
  }

  recordAction(guildId: string, action: string, ok: boolean): void {
    this.actionsTotal.inc({ guild_id: guildId, action, status: ok ? "ok" : "error" }, 1);
  }

  startDecisionTimer(pipeline: string, guildId: string): () => void {
    return this.decisionDuration.startTimer({ pipeline, guild_id: guildId });
  }

  setQueueLag(queue: string, lag: number): void {
    this.queueLagGauge.set({ queue }, lag);
  }

  setWebSocketClients(channel: string, count: number): void {
    this.websocketClientsGauge.set({ channel }, count);
  }

  async render(): Promise<string> {
    return this.registry.metrics();
  }

  resetForTests(): void {
    this.registry.resetMetrics();
  }

  registerThreatSampleMatrix(guildId: string): void {
    const types = [
      "ANTI_NUKE",
      "ANTI_RAID",
      "ANTI_SPAM",
      "ANTI_LINK",
      "ANTI_WEBHOOK",
      "ROLE_ESCALATION",
      "PERMISSION_INTEGRITY",
      "ANOMALY"
    ];

    const levels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

    for (const type of types) {
      for (const level of levels) {
        this.recordThreat(guildId, type, level);
      }
    }
  }

  bootstrapQueues(): void {
    const queues = ["moderation-actions", "backup-jobs", "analytics-events"];
    for (const queue of queues) {
      this.setQueueLag(queue, 0);
    }
  }

  bootstrapChannels(): void {
    const channels = ["threat.log", "threat.metric", "module.state.changed"];
    for (const channel of channels) {
      this.setWebSocketClients(channel, 0);
    }
  }

  measureSync<T>(pipeline: string, guildId: string, fn: () => T): T {
    const stop = this.startDecisionTimer(pipeline, guildId);
    try {
      return fn();
    } finally {
      stop();
    }
  }

  async measureAsync<T>(pipeline: string, guildId: string, fn: () => Promise<T>): Promise<T> {
    const stop = this.startDecisionTimer(pipeline, guildId);
    try {
      return await fn();
    } finally {
      stop();
    }
  }
}
