"use server";

export type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function createSafeAction<T>(
  handler: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await handler();
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    return { success: false, error: message };
  }
}
