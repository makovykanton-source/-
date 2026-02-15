import { AnomalyDetectorService } from "../../domain/services/anomaly-detector.service.js";
const detector = new AnomalyDetectorService();
export function detectAnomaly(joinsPerMinute, messagesPerMinute, webhooksCreatedPerMinute) {
    return detector.detect({ joinsPerMinute, messagesPerMinute, webhooksCreatedPerMinute });
}
