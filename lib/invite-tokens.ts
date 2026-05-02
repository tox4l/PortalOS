export async function generateInviteToken(): Promise<{ raw: string; hashed: string }> {
  const raw = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
  const encoded = new TextEncoder().encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashed = Buffer.from(hashBuffer).toString("hex");
  return { raw, hashed };
}

export async function hashToken(raw: string): Promise<string> {
  const encoded = new TextEncoder().encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Buffer.from(hashBuffer).toString("hex");
}

export function inviteExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d;
}
