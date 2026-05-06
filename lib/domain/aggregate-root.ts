/**
 * Aggregate Root base class for PortalOS DDD architecture.
 *
 * Aggregate roots are the consistency boundary for domain operations.
 * They protect invariants, raise domain events, and version-track changes.
 */

import { DomainEvent } from "./domain-event";
import { domainEventBus } from "./event-bus";

export abstract class AggregateRoot {
  private _domainEvents: DomainEvent[] = [];
  private _version: number = 0;

  constructor(public readonly id: string) {}

  get version(): number {
    return this._version;
  }

  /**
   * Record a domain event and increment the aggregate version.
   */
  protected applyEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
    this._version++;
  }

  /**
   * Get all uncommitted domain events.
   */
  public getUncommittedEvents(): readonly DomainEvent[] {
    return this._domainEvents;
  }

  /**
   * Publish all uncommitted events to the event bus and clear the queue.
   */
  public async commitEvents(): Promise<void> {
    for (const event of this._domainEvents) {
      await domainEventBus.publish(event);
    }
    this._domainEvents = [];
  }

  /**
   * Clear uncommitted events without publishing (e.g., after persistence rollback).
   */
  public discardEvents(): void {
    this._domainEvents = [];
  }
}
