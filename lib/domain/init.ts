/**
 * Domain Layer Initialization for PortalOS.
 *
 * Registers cross-context event handlers (e.g., notification subscriptions).
 * Call this once during application startup (e.g., in the root layout).
 */

import { registerNotificationHandlers } from "@/lib/domain/services/notification-publisher";

let initialized = false;

/**
 * Initialize the domain layer.
 * Safe to call multiple times -- only runs once.
 */
export function initDomainLayer(): void {
  if (initialized) return;
  initialized = true;

  registerNotificationHandlers();
}
