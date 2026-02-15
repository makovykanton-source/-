export class TrustScoreService {
    calculate(signal) {
        let score = 100;
        score -= Math.max(0, 30 - Math.min(signal.ageDays, 30));
        score -= signal.punishmentHistory * 8;
        score -= signal.suspiciousActions24h * 5;
        score -= signal.sharedIpRisk * 10;
        if (signal.isWhitelisted)
            score += 15;
        return Math.max(0, Math.min(100, score));
    }
    riskBand(score) {
        if (score >= 75)
            return "trusted";
        if (score >= 45)
            return "watch";
        return "danger";
    }
}
