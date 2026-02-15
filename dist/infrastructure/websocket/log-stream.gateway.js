import WebSocket, { WebSocketServer } from "ws";
import { logger } from "../../core/logging/logger.js";
export class LogStreamGateway {
    wss;
    constructor(port) {
        this.wss = new WebSocketServer({ port });
        this.wss.on("connection", (socket) => {
            socket.on("message", (raw) => {
                logger.debug({ raw: raw.toString() }, "WS control message received");
            });
        });
    }
    publish(msg) {
        const payload = JSON.stringify({ event: "threat.log", data: msg });
        for (const client of this.wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        }
    }
}
