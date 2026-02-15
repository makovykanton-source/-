export class EventBus {
    handlers = new Map();
    subscribe(eventName, handler) {
        const handlers = this.handlers.get(eventName) ?? [];
        handlers.push(handler);
        this.handlers.set(eventName, handlers);
    }
    async publish(eventName, event) {
        const handlers = this.handlers.get(eventName) ?? [];
        await Promise.all(handlers.map((handler) => handler(event)));
    }
}
