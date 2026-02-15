export interface BehaviorVector {
  joinsPerMinute: number;
  messagesPerMinute: number;
  webhooksCreatedPerMinute: number;
}

export class AnomalyDetectorService {
  detect(v: BehaviorVector): { score: number; anomalous: boolean } {
    const score = v.joinsPerMinute * 2 + v.messagesPerMinute * 0.5 + v.webhooksCreatedPerMinute * 5;
    return { score, anomalous: score >= 40 };
  }
}
