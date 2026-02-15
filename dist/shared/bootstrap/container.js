import { Container } from "../../core/types/container.js";
import { TrustScoreService } from "../../modules/trust-score/trust-score.service.js";
import { EventBus } from "../../domain/events/event-bus.js";
export function buildContainer() {
    const c = new Container();
    c.register("EventBus", new EventBus());
    c.register("TrustScoreService", new TrustScoreService());
    return c;
}
