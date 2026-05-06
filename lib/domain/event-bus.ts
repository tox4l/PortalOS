/**
 * Lightweight Domain Event Bus for PortalOS DDD architecture.
 *
 * Enables cross-context communication without direct coupling.
 * Handlers are registered per event type and invoked asynchronously.
 *
 * This is intentionally minimal -- no external dependencies, no queues.
 * For production, replace with a proper message broker (RabbitMQ, Redis Streams, etc.).
 */

import { DomainEvent } from "./domain-event";

type EventHandler<T extends DomainEvent> = (event: T) => Promise<void>;

interface HandlerEntry {
  handler: EventHandler<DomainEvent>;
  contextName: string;
}

class DomainEventBusImpl {
  private handlers = new Map<string, HandlerEntry[]>();
  private _instanceId: string;

  constructor() {
    this._instanceId = crypto.randomUUID().slice(0, 8);
  }

  get instanceId(): string {
    return this._instanceId;
  }

  /**
   * Register a handler for a specific event type.
   * @param eventType - The DomainEvent subclass constructor
   * @param handler - Async handler function
   * @param contextName - Human-readable name of the consuming bounded context
   */
  register<T extends DomainEvent>(
    eventType: new (...args: never[]) => T,
    handler: EventHandler<T>,
    contextName: string,
  ): void {
    const key = eventType.name;
    const entries = this.handlers.get(key) ?? [];
    entries.push({ handler: handler as EventHandler<DomainEvent>, contextName });
    this.handlers.set(key, entries);
  }

  /**
   * Publish an event to all registered handlers.
   * All handlers run -- a failure in one does not block others.
   */
  async publish(event: DomainEvent): Promise<void> {
    const key = event.constructor.name;
    const entries = this.handlers.get(key);
    if (!entries || entries.length === 0) return;

    const results = await Promise.allSettled(
      entries.map((entry) => entry.handler(event)),
    );

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "rejected") {
        const entry = entries[i];
        console.error(
          `[EventBus:${this._instanceId}] Handler '${entry?.contextName ?? "unknown"}' failed for ${key}:`,
          result.reason,
        );
      }
    }
  }

  /**
   * Remove all handlers for a given event type.
   */
  unregister(eventType: new (...args: never[]) => DomainEvent): void {
    this.handlers.delete(eventType.name);
  }

  /**
   * Remove all handlers.
   */
  clear(): void {
    this.handlers.clear();
  }
}

// Singleton event bus instance
export const domainEventBus = new DomainEventBusImpl();

// Re-export type for external usage
export type { EventHandler };
