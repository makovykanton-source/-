import { Server } from "ws";
import { logger } from "../../core/logging/logger.js";

interface ThreatLogMessage {
  guildId: string;
  threatType: string;
  severity: string;
  summary: string;
  ts: string;
}

export class LogStreamGateway {
  private wss: Server;

  constructor(port: number) {
    this.wss = new Server({ port });
    this.wss.on("connection", (socket) => {
      socket.on("message", (raw) => {
        logger.debug({ raw: raw.toString() }, "WS control message received");
      });
    });
  }

  publish(msg: ThreatLogMessage): void {
    const payload = JSON.stringify({ event: "threat.log", data: msg });
    for (const client of this.wss.clients) {
      if (client.readyState === client.OPEN) {
        client.send(payload);
      }
    }
  }
}
