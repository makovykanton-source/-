export interface BaselinePoint {
  ts: number;
  joins: number;
  messages: number;
  webhooks: number;
}

export interface BaselineModel {
  guildId: string;
  points: BaselinePoint[];
  updatedAt: number;
}

export interface BaselineEvaluation {
  joinZ: number;
  messageZ: number;
  webhookZ: number;
  score: number;
  anomalous: boolean;
}

const models = new Map<string, BaselineModel>();

export class BaselineEngine {
  push(guildId: string, point: BaselinePoint): BaselineModel {
    const existing = models.get(guildId) ?? {
      guildId,
      points: [],
      updatedAt: Date.now()
    };

    const next = {
      ...existing,
      points: [...existing.points, point].slice(-1000),
      updatedAt: Date.now()
    };

    models.set(guildId, next);
    return next;
  }

  evaluate(guildId: string, point: BaselinePoint): BaselineEvaluation {
    const model = this.push(guildId, point);
    const joins = model.points.map((x) => x.joins);
    const messages = model.points.map((x) => x.messages);
    const webhooks = model.points.map((x) => x.webhooks);

    const joinZ = this.z(point.joins, joins);
    const messageZ = this.z(point.messages, messages);
    const webhookZ = this.z(point.webhooks, webhooks);

    const score = Math.max(0, joinZ) * 8 + Math.max(0, messageZ) * 2 + Math.max(0, webhookZ) * 10;

    return {
      joinZ,
      messageZ,
      webhookZ,
      score,
      anomalous: score >= 25
    };
  }

  private z(value: number, sample: number[]): number {
    if (sample.length < 10) return 0;
    const mean = sample.reduce((a, b) => a + b, 0) / sample.length;
    const variance = sample.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0) / sample.length;
    const std = Math.sqrt(variance);
    if (std === 0) return 0;
    return (value - mean) / std;
  }

  snapshot(guildId: string): BaselineModel | null {
    return models.get(guildId) ?? null;
  }

  clear(guildId: string): void {
    models.delete(guildId);
  }

  clearAll(): void {
    models.clear();
  }

  import(guildId: string, points: BaselinePoint[]): BaselineModel {
    const model = {
      guildId,
      points: points.slice(-1000),
      updatedAt: Date.now()
    };
    models.set(guildId, model);
    return model;
  }

  export(guildId: string): string {
    const model = models.get(guildId);
    if (!model) return JSON.stringify({ guildId, points: [] });
    return JSON.stringify(model);
  }

  getWindow(guildId: string, fromTs: number, toTs: number): BaselinePoint[] {
    const model = models.get(guildId);
    if (!model) return [];
    return model.points.filter((p) => p.ts >= fromTs && p.ts <= toTs);
  }

  aggregateMinute(guildId: string, minuteTs: number): BaselinePoint {
    const from = minuteTs;
    const to = minuteTs + 60_000;
    const points = this.getWindow(guildId, from, to);

    return {
      ts: minuteTs,
      joins: points.reduce((a, b) => a + b.joins, 0),
      messages: points.reduce((a, b) => a + b.messages, 0),
      webhooks: points.reduce((a, b) => a + b.webhooks, 0)
    };
  }

  rollingScore(guildId: string, windows = 5): number {
    const model = models.get(guildId);
    if (!model) return 0;

    const recent = model.points.slice(-Math.max(1, windows));
    if (!recent.length) return 0;

    const total = recent.reduce((acc, p) => {
      return acc + p.joins * 1.5 + p.messages * 0.2 + p.webhooks * 3;
    }, 0);

    return Math.round((total / recent.length) * 100) / 100;
  }

  detectBurst(guildId: string, multiplier = 2): boolean {
    const model = models.get(guildId);
    if (!model || model.points.length < 20) return false;

    const recent = model.points.slice(-5);
    const prev = model.points.slice(-20, -5);

    const recentMean = recent.reduce((a, b) => a + b.messages + b.joins * 3 + b.webhooks * 5, 0) / recent.length;
    const prevMean = prev.reduce((a, b) => a + b.messages + b.joins * 3 + b.webhooks * 5, 0) / prev.length;

    return recentMean > prevMean * multiplier;
  }

  recommendMode(guildId: string): "normal" | "elevated" | "strict" {
    const score = this.rollingScore(guildId, 10);
    if (score < 15) return "normal";
    if (score < 40) return "elevated";
    return "strict";
  }
}
