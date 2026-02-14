import WebSocket, { WebSocketServer } from "ws";
import { logger } from "../../core/logging/logger.js";

interface ThreatLogMessage {
  guildId: string;
  threatType: string;
  severity: string;
  summary: string;
  ts: string;
}

export class LogStreamGateway {
  private wss: WebSocketServer;

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.wss.on("connection", (socket) => {
      socket.on("message", (raw) => {
        logger.debug({ raw: raw.toString() }, "WS control message received");
      });
    });
  }

  publish(msg: ThreatLogMessage): void {
    const payload = JSON.stringify({ event: "threat.log", data: msg });
    for (const client of this.wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }
}
