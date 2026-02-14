export type DomainEventHandler<T> = (event: T) => Promise<void>;

export class EventBus {
  private handlers = new Map<string, DomainEventHandler<unknown>[]>();

  subscribe<T>(eventName: string, handler: DomainEventHandler<T>): void {
    const handlers = this.handlers.get(eventName) ?? [];
    handlers.push(handler as DomainEventHandler<unknown>);
    this.handlers.set(eventName, handlers);
  }

  async publish<T>(eventName: string, event: T): Promise<void> {
    const handlers = this.handlers.get(eventName) ?? [];
    await Promise.all(handlers.map((handler) => handler(event)));
  }
}
