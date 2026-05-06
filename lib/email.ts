import { getResend, getDefaultFromEmail } from "@/lib/resend";
import { logger } from "@/lib/logger";

const APP_URL = process.env.APP_URL ?? "https://portalos.tech";

export function buildClientUrl(
  agencySlug: string,
  clientSlug: string,
  path = "",
  opts?: { plan?: string | null }
): string {
  const base = APP_URL.replace(/\/$/, "");

  if (opts?.plan === "GROWTH" && agencySlug) {
    const url = new URL(base);
    return `${url.protocol}//${agencySlug}.${url.host}/portal/${clientSlug}${path}`;
  }

  return `${base}/portal/${clientSlug}${path}`;
}

export function buildClientAuthUrl(
  clientSlug: string,
  token: string,
  email: string,
  opts?: { plan?: string | null; agencySlug?: string | null }
): string {
  const base = APP_URL.replace(/\/$/, "");

  if (opts?.plan === "GROWTH" && opts?.agencySlug) {
    const url = new URL(base);
    return `${url.protocol}//${opts.agencySlug}.${url.host}/portal/${clientSlug}/auth?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
  }

  return `${base}/portal/${clientSlug}/auth?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
}

export function buildAcceptInviteUrl(token: string, email: string): string {
  return `${APP_URL.replace(/\/$/, "")}/accept-invite?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
}

type AgencyBrand = {
  name: string;
  brandColor?: string | null;
};

function brandCss(brandColor?: string | null) {
  const c = brandColor ?? "#8C7340";
  return {
    accent: c,
    accentDim: `${c}1A`,
    text: "#FAF8F2",
    muted: "#B8B2A0",
    bg: "#0A0A0A",
  };
}

function wrapHtml(brand: AgencyBrand, content: string): string {
  const css = brandCss(brand.brandColor);
  return `
    <div style="font-family: Georgia, serif; background: ${css.bg}; color: ${css.text}; padding: 40px; max-width: 480px; margin: 0 auto; border-radius: 12px;">
      <p style="font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase; color: ${css.accent}; margin-bottom: 24px;">${brand.name}</p>
      ${content}
    </div>
  `.trim();
}

function brandButton(brand: AgencyBrand, href: string, label: string): string {
  const css = brandCss(brand.brandColor);
  return `<a href="${href}" style="display: inline-block; background: ${css.accent}; color: #000; padding: 12px 32px; text-decoration: none; font-size: 14px; letter-spacing: 0.05em; border-radius: 8px;">${label}</a>`;
}

export function renderClientWelcomeEmail(args: {
  agency: AgencyBrand;
  contactName: string;
  companyName: string;
  magicLinkUrl: string;
}): string {
  return wrapHtml(args.agency, `
    <h1 style="font-size: 28px; font-weight: 400; margin-bottom: 16px;">Your portal is ready</h1>
    <p style="color: ${brandCss(args.agency.brandColor).muted}; margin-bottom: 8px;">Hi ${args.contactName}, your dedicated project portal for <strong>${args.companyName}</strong> has been set up.</p>
    <p style="color: ${brandCss(args.agency.brandColor).muted}; margin-bottom: 32px;">Sign in below to track progress, review deliverables, and stay aligned with the team.</p>
    ${brandButton(args.agency, args.magicLinkUrl, "Access your portal")}
  `);
}

export function renderMagicLinkEmail(args: {
  agency: AgencyBrand;
  companyName: string;
  magicLinkUrl: string;
}): string {
  return wrapHtml(args.agency, `
    <h1 style="font-size: 28px; font-weight: 400; margin-bottom: 16px;">Sign in to your portal</h1>
    <p style="color: ${brandCss(args.agency.brandColor).muted}; margin-bottom: 32px;">Click the button below to sign in to ${args.companyName}. This link expires in 7 days.</p>
    ${brandButton(args.agency, args.magicLinkUrl, "Sign in")}
  `);
}

export function renderClientTeammateInviteEmail(args: {
  agency: AgencyBrand;
  companyName: string;
  role: string;
  inviteUrl: string;
}): string {
  return wrapHtml(args.agency, `
    <h1 style="font-size: 28px; font-weight: 400; margin-bottom: 16px;">You've been invited</h1>
    <p style="color: ${brandCss(args.agency.brandColor).muted}; margin-bottom: 8px;">You've been invited to join <strong>${args.companyName}</strong> as a <strong>${args.role.toLowerCase().replace(/_/g, " ")}</strong>.</p>
    <p style="color: ${brandCss(args.agency.brandColor).muted}; margin-bottom: 32px;">This invitation expires in 7 days.</p>
    ${brandButton(args.agency, args.inviteUrl, "Accept Invitation")}
  `);
}

export function renderTeamInvitationEmail(args: {
  agency: AgencyBrand;
  inviterName: string;
  role: string;
  inviteUrl: string;
}): string {
  return wrapHtml(args.agency, `
    <h1 style="font-size: 28px; font-weight: 400; margin-bottom: 16px;">You've been invited</h1>
    <p style="color: ${brandCss(args.agency.brandColor).muted}; margin-bottom: 8px;">${args.inviterName} invited you to join as <strong>${args.role.toLowerCase()}</strong>.</p>
    <p style="color: ${brandCss(args.agency.brandColor).muted}; margin-bottom: 32px;">This invitation expires in 7 days.</p>
    ${brandButton(args.agency, args.inviteUrl, "Accept Invitation")}
  `);
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const resend = getResend();
    await resend.emails.send({
      from: getDefaultFromEmail(),
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    logger.error("Failed to send email", { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
}
