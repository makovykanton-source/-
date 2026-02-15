import client from "prom-client";
client.collectDefaultMetrics();
export const threatCounter = new client.Counter({
    name: "discord_shield_threats_total",
    help: "Total detected threats",
    labelNames: ["threat_type", "severity"]
});
export async function getMetrics() {
    return client.register.metrics();
}
