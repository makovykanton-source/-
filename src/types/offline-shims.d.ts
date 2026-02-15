declare const process: {
  env: Record<string, string | undefined>;
  exit(code?: number): never;
  on(event: string, listener: (...args: any[]) => void): void;
};

declare module "node:*" {
  const value: any;
  export default value;
}

declare module "node:url" {
  export function fileURLToPath(url: string | URL): string;
}

declare module "@fastify/*" {
  const value: any;
  export default value;
}

declare module "fastify" {
  export type FastifyInstance = any;
  export type FastifyReply = any;
  export type FastifyRequest = any;
  const fastify: any;
  export default fastify;
}

declare module "zod" {
  export const z: any;
}

declare namespace z {
  type infer<T> = any;
}

declare module "bullmq" {
  export const Queue: any;
  export const Worker: any;
  export type Job<T = any> = any;
}

declare module "discord.js" {
  export const Client: any;
  export const GatewayIntentBits: any;
  export const AuditLogEvent: any;
  export const PermissionsBitField: any;
  export const Events: any;
  export const Partials: any;
  export const ChannelType: any;
  export type Guild = any;
  export type TextChannel = any;
  export type Client = any;
  export type NonThreadGuildBasedChannel = any;
}

declare module "prom-client" {
  const value: any;
  export default value;
  export const Counter: any;
  export const Gauge: any;
  export const Histogram: any;
  export const Registry: any;
}

declare module "pg" {
  export const Pool: any;
}

declare module "ioredis" {
  const Redis: any;
  export default Redis;
}

declare module "ws" {
  const WebSocket: any;
  export default WebSocket;
  export const WebSocketServer: any;
  export type WebSocketServer = any;
}

declare module "pino" {
  const pino: any;
  export default pino;
}

declare module "dotenv" {
  export const config: any;
}

declare module "uuid" {
  export const v4: any;
}
