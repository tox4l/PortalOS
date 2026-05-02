import { Resend } from "resend";
import { getOptionalEnv, requireEnv } from "@/lib/env";

let resendClient: Resend | null = null;

export function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(requireEnv("RESEND_API_KEY"));
  }

  return resendClient;
}

export function getDefaultFromEmail(): string {
  return getOptionalEnv("RESEND_FROM_EMAIL") ?? "PortalOS <hello@portalos.tech>";
}
