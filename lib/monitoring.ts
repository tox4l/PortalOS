import { logger } from "@/lib/logger";

interface ErrorContext {
  userId?: string;
  agencyId?: string;
  action?: string;
  path?: string;
  [key: string]: unknown;
}

export function captureError(
  error: unknown,
  context?: ErrorContext
): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  logger.error(message, {
    stack: stack?.split("\n").slice(0, 5).join("\n"),
    ...context,
  });
}

export function captureServerActionError(
  action: string,
  error: unknown,
  userId?: string,
  agencyId?: string
): void {
  captureError(error, { action, userId, agencyId });
}
