import { AnomalyDetectorService } from "../../domain/services/anomaly-detector.service.js";

const detector = new AnomalyDetectorService();

export function detectAnomaly(joinsPerMinute: number, messagesPerMinute: number, webhooksCreatedPerMinute: number) {
  return detector.detect({ joinsPerMinute, messagesPerMinute, webhooksCreatedPerMinute });
}
