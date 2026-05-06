import { z } from "zod";
import { auth } from "@/lib/auth";
import { checkPermission, type PermissionAction } from "@/lib/permissions";
import { checkRateLimit } from "@/lib/action-rate-limit";
import { captureServerActionError } from "@/lib/monitoring";

export type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export interface ActionContext {
  userId: string;
  agencyId: string;
  role: string;
}

interface ActionConfig<TInput, TOutput> {
  /** Permission required to execute this action (e.g. "project:write") */
  permission?: PermissionAction;
  /** Rate limit config — applied per user */
  rateLimit?: { windowMs: number; maxRequests: number };
  /** Zod schema for input validation */
  schema?: z.ZodSchema<TInput>;
  /** The actual handler, receives validated input and resolved context */
  handler: (input: TInput, ctx: ActionContext) => Promise<TOutput>;
  /** Human-readable name for error reporting */
  name?: string;
}

/**
 * Create a server action with built-in auth, permission check,
 * rate limiting, and input validation.
 *
 * Eliminates the duplicated auth-block pattern that appeared 12+ times.
 */
export function createAction<TInput = void, TOutput = unknown>(
  config: ActionConfig<TInput, TOutput>
) {
  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    try {
      const session = await auth();
      if (!session?.user?.id || !session.user.agencyId) {
        return { success: false, error: "You must be signed in." };
      }

      if (config.permission) {
        const allowed = await checkPermission(session.user.id, config.permission);
        if (!allowed) {
          return { success: false, error: "You do not have permission." };
        }
      }

      const ctx: ActionContext = {
        userId: session.user.id,
        agencyId: session.user.agencyId,
        role: session.user.role ?? "MEMBER",
      };

      if (config.rateLimit) {
        try {
          await checkRateLimit(config.name ?? "action", config.rateLimit);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Too many requests.";
          return { success: false, error: msg };
        }
      }

      let validatedInput: TInput;
      if (config.schema) {
        const result = config.schema.safeParse(input);
        if (!result.success) {
          return {
            success: false,
            error: result.error.issues[0]?.message ?? "Invalid input.",
          };
        }
        validatedInput = result.data;
      } else {
        validatedInput = input;
      }

      const data = await config.handler(validatedInput, ctx);
      return { success: true, data };
    } catch (error) {
      if (config.name) {
        captureServerActionError(config.name, error);
      }
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      return { success: false, error: message };
    }
  };
}

/**
 * Create a FormData-based server action (standard Next.js Server Action pattern).
 * Parses FormData with Zod before passing to the handler.
 */
export function createFormAction<TOutput = unknown>(
  config: Omit<ActionConfig<Record<string, unknown>, TOutput>, "schema"> & {
    schema?: z.ZodSchema<Record<string, unknown>>;
  }
) {
  return async (
    _prevState: ActionResult<TOutput>,
    formData: FormData
  ): Promise<ActionResult<TOutput>> => {
    const input: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      input[key] = value;
    });

    const action = createAction<Record<string, unknown>, TOutput>({
      ...config,
      schema: config.schema,
    });

    return action(input);
  };
}

/**
 * Legacy wrapper — kept for gradual migration of existing actions.
 */
export async function createSafeAction<T>(
  handler: () => Promise<T>,
  actionName?: string
): Promise<ActionResult<T>> {
  try {
    const data = await handler();
    return { success: true, data };
  } catch (error) {
    if (actionName) {
      captureServerActionError(actionName, error);
    }
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
    return { success: false, error: message };
  }
}
