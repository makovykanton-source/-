export class AnomalyDetectorService {
    detect(v) {
        const score = v.joinsPerMinute * 2 + v.messagesPerMinute * 0.5 + v.webhooksCreatedPerMinute * 5;
        return { score, anomalous: score >= 40 };
    }
}
