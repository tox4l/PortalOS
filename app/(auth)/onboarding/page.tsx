"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building,
  Check,
  Globe,
  Palette,
  Sparkle,
  Upload,
  Users,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createAgencyAction } from "@/actions/onboarding";
import { saveBrandingAction } from "@/actions/onboarding";
import { inviteTeamMemberAction } from "@/actions/team";
import { createClientAction } from "@/actions/clients";
import { completeOnboardingAction } from "@/actions/onboarding";

const brandColors = [
  { hex: "#000000", name: "Obsidian", description: "The moodiest agencies" },
  { hex: "#2A5A45", name: "Forest", description: "Eco / architectural clients" },
  { hex: "#8C7340", name: "Gold", description: "The PortalOS default" },
  { hex: "#5A2A2A", name: "Bordeaux", description: "Luxury / fashion agencies" },
  { hex: "#1A1F2E", name: "Ink", description: "Financial / corporate agencies" },
  { hex: "#E8E4D8", name: "Bone", description: "For light client portals" },
];

const steps = [
  { id: 1, label: "Agency", icon: Building },
  { id: 2, label: "Branding", icon: Palette },
  { id: 3, label: "Team", icon: Users },
  { id: 4, label: "Client", icon: Globe },
  { id: 5, label: "Done", icon: Sparkle },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [brandColor, setBrandColor] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [agencyName, setAgencyName] = useState("");
  const [agencySlug, setAgencySlug] = useState("");
  const [teamEmail, setTeamEmail] = useState("");
  const [teamRole, setTeamRole] = useState("MEMBER");
  const [teamMembers, setTeamMembers] = useState<{ email: string; role: string }[]>([]);
  const [clientCompany, setClientCompany] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [sendInvite, setSendInvite] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const canContinueStep2 = step !== 2 || brandColor !== null;

  async function handleStep1Submit() {
    setSubmitting(true);
    setStepError(null);
    const formData = new FormData();
    formData.set("name", agencyName);
    formData.set("slug", agencySlug);
    const result = await createAgencyAction({ success: false }, formData);
    setSubmitting(false);
    if (result.success && result.data) {
      setAgencyId(result.data.agencyId);
      setStep(2);
    } else {
      setStepError(result.error ?? "Something went wrong.");
    }
  }

  async function handleStep2Submit() {
    if (!brandColor || !agencyId) return;
    setSubmitting(true);
    setStepError(null);
    const formData = new FormData();
    formData.set("brandColor", brandColor);
    const result = await saveBrandingAction(agencyId, { success: false }, formData);
    setSubmitting(false);
    if (result.success) {
      setStep(3);
    } else {
      setStepError(result.error ?? "Something went wrong.");
    }
  }

  async function handleStep3Submit(skip: boolean) {
    if (skip) {
      setStep(4);
      return;
    }
    setSubmitting(true);
    setStepError(null);
    let hadError = false;
    for (const member of teamMembers) {
      const formData = new FormData();
      formData.set("email", member.email);
      formData.set("role", member.role);
      const result = await inviteTeamMemberAction({ success: false }, formData);
      if (!result.success && result.error) {
        setStepError(result.error);
        hadError = true;
        break;
      }
    }
    setSubmitting(false);
    if (!hadError) {
      setStep(4);
    }
  }

  async function handleStep4Submit() {
    setSubmitting(true);
    setStepError(null);
    const formData = new FormData();
    formData.set("companyName", clientCompany);
    formData.set("contactName", clientContact);
    formData.set("contactEmail", clientEmail);
    formData.set("portalSlug", agencySlug ? `${agencySlug}-client` : "client-portal");
    formData.set("welcomeMessage", `Welcome to your dedicated project hub, ${clientCompany}. We're excited to collaborate with you.`);
    const result = await createClientAction({ success: false }, formData);
    setSubmitting(false);
    if (result.success) {
      setStep(5);
    } else {
      setStepError(result.error ?? "Something went wrong.");
    }
  }

  async function handleGoToDashboard() {
    setCompleting(true);
    setStepError(null);
    if (agencyId) {
      await completeOnboardingAction(agencyId);
    }
    await new Promise((resolve) => setTimeout(resolve, 900));
    router.push("/app/dashboard");
  }

  function handleContinue() {
    if (step === 1) {
      handleStep1Submit();
    } else if (step === 2) {
      handleStep2Submit();
    } else if (step === 3) {
      handleStep3Submit(false);
    } else if (step === 4) {
      handleStep4Submit();
    } else if (step === 5) {
      handleGoToDashboard();
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-start justify-center bg-[var(--bg-void)] px-4 py-16 md:items-center">
      <div className="w-full max-w-[600px] space-y-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-display text-[40px] font-normal leading-[1.12] tracking-[-0.015em] text-[var(--ink-primary)]">
            Set up PortalOS
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-[var(--ink-secondary)]">
            About three minutes. Everything can be changed later.
          </p>
        </div>

        {/* Step indicator */}
        <div className="mx-auto flex max-w-[440px] items-center justify-between">
          {steps.map((s, i) => (
            <div className="flex items-center gap-0" key={s.id}>
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] font-medium transition-all duration-200",
                  step > s.id
                    ? "border border-[var(--border-gold)] bg-transparent text-[var(--gold-core)]"
                    : step === s.id
                      ? "bg-[var(--gold-core)] text-[var(--bg-surface)] shadow-[var(--glow-gold-sm)]"
                      : "border border-[var(--border-hairline)] bg-transparent text-[var(--ink-tertiary)]"
                )}
              >
                {step > s.id ? (
                  <Check aria-hidden="true" className="size-3.5" weight="bold" />
                ) : (
                  s.id
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "h-px w-12 transition-colors duration-180 md:w-16",
                    step > s.id + 1 || (step > s.id && s.id < step)
                      ? "bg-[var(--border-gold)]"
                      : "bg-[var(--border-hairline)]"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step error */}
        {stepError && (
          <div className="rounded-[8px] border border-red-500/20 bg-red-500/10 p-4 text-center">
            <p className="text-[13px] leading-5 text-red-400">{stepError}</p>
          </div>
        )}

        {/* Step content */}
        <div className="surface-panel">
          {step === 1 && (
            <div className="p-6 md:p-8">
              <h2 className="font-display text-[28px] font-normal leading-tight text-[var(--ink-primary)]">
                Tell us about your agency
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-[var(--ink-secondary)]">
                This is how you will appear to clients in their portal.
              </p>
              <div className="mt-8 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="onb-agency-name">Agency name</Label>
                  <Input id="onb-agency-name" placeholder="Lumina Creative" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onb-agency-slug">Portal URL</Label>
                  <div className="flex items-center gap-2">
                    <Input id="onb-agency-slug" placeholder="lumina" value={agencySlug} onChange={(e) => setAgencySlug(e.target.value)} />
                    <span className="shrink-0 text-[14px] text-[var(--ink-tertiary)]">
                      .portalos.tech
                    </span>
                  </div>
                  <p className="text-[12px] leading-5 text-[var(--ink-tertiary)]">
                    This is where your clients will access their portal.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-6 md:p-8">
              <h2 className="font-display text-[28px] font-normal leading-tight text-[var(--ink-primary)]">
                Brand your portal
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-[var(--ink-secondary)]">
                Upload your logo and pick a brand color. Applied to your entire client portal.
              </p>
              <div className="mt-8 space-y-6">
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex size-20 items-center justify-center rounded-[10px] border border-dashed border-[var(--border-subtle)] bg-[var(--bg-sunken)] transition-colors hover:border-[var(--border-gold-dim)] cursor-pointer">
                    <Upload aria-hidden="true" className="size-6 text-[var(--ink-tertiary)]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Brand color</Label>
                  <div className="flex flex-wrap gap-3">
                    {brandColors.map((c) => {
                      const isActive = brandColor === c.hex;
                      return (
                        <button
                          aria-label={`Brand color: ${c.name}`}
                          aria-pressed={isActive}
                          className={cn(
                            "relative size-14 rounded-[6px] transition-all duration-200",
                            "border border-[var(--border-hairline)]",
                            isActive
                              ? "ring-2 ring-[var(--gold-core)] ring-offset-4 ring-offset-[var(--bg-surface)]"
                              : "hover:border-[var(--border-visible)]"
                          )}
                          key={c.hex}
                          onClick={() => setBrandColor(c.hex)}
                          style={{ backgroundColor: c.hex }}
                          type="button"
                        >
                          {c.hex === "#000000" && (
                            <span className="absolute inset-0 rounded-[5px] border border-[var(--border-visible)]" />
                          )}
                          <span className="sr-only">{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  {brandColor ? (
                    <p className="text-[13px] leading-5 text-[var(--gold-core)] font-medium">
                      {brandColors.find((c) => c.hex === brandColor)?.name}:{" "}
                      {brandColors.find((c) => c.hex === brandColor)?.description}
                    </p>
                  ) : (
                    <p className="text-[12px] leading-5 text-[var(--ink-tertiary)]">
                      Select a brand color to continue
                    </p>
                  )}
                </div>
                <div className="rounded-[10px] border border-[var(--border-hairline)] bg-[var(--bg-base)] p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                    Portal preview
                  </p>
                  <div className="mt-4 space-y-3">
                    <div
                      className="h-3 w-32 rounded"
                      style={{
                        backgroundColor: brandColor
                          ? brandColor === "#E8E4D8"
                            ? "#B0ACA4"
                            : brandColor
                          : "var(--gold-core)",
                        opacity: brandColor ? 1 : 0.4,
                      }}
                    />
                    <div className="h-2 w-48 rounded bg-[var(--bg-sunken)]" />
                    <div className="h-2 w-40 rounded bg-[var(--bg-sunken)]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="p-6 md:p-8">
              <h2 className="font-display text-[28px] font-normal leading-tight text-[var(--ink-primary)]">
                Invite your team
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-[var(--ink-secondary)]">
                Add team members now or skip. You can always invite more later.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="onb-team-email">Email address</Label>
                    <Input id="onb-team-email" placeholder="colleague@agency.com" type="email" value={teamEmail} onChange={(e) => setTeamEmail(e.target.value)} />
                  </div>
                  <div className="w-36 space-y-2">
                    <Label htmlFor="onb-team-role">Role</Label>
                    <Select
                      id="onb-team-role"
                      onValueChange={setTeamRole}
                      options={[
                        { value: "MEMBER", label: "Member" },
                        { value: "ADMIN", label: "Admin" },
                      ]}
                      value={teamRole}
                    />
                  </div>
                  <Button
                    disabled={!teamEmail.trim()}
                    onClick={() => {
                      if (!teamEmail.trim()) return;
                      setTeamMembers((prev) => [...prev, { email: teamEmail.trim(), role: teamRole }]);
                      setTeamEmail("");
                      setTeamRole("MEMBER");
                    }}
                    variant="secondary"
                  >
                    <Users aria-hidden="true" className="size-4" />
                    Add
                  </Button>
                </div>
                <div className="rounded-[10px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4">
                  {teamMembers.length === 0 ? (
                    <p className="text-[13px] italic text-[var(--ink-tertiary)]">
                      No team members added yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {teamMembers.map((member, i) => (
                        <div className="flex items-center justify-between text-[14px]" key={i}>
                          <span className="text-[var(--ink-primary)]">{member.email}</span>
                          <span className="text-[var(--ink-tertiary)]">{member.role === "ADMIN" ? "Admin" : "Member"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="p-6 md:p-8">
              <h2 className="font-display text-[28px] font-normal leading-tight text-[var(--ink-primary)]">
                Add your first client
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-[var(--ink-secondary)]">
                Create a client record now. They will not receive anything until you send a portal
                invite.
              </p>
              <div className="mt-8 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="onb-client-name">Company name</Label>
                  <Input id="onb-client-name" placeholder="Northstar Branding" value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onb-client-contact">Contact name</Label>
                  <Input id="onb-client-contact" placeholder="Iris Calloway" value={clientContact} onChange={(e) => setClientContact(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="onb-client-email">Contact email</Label>
                  <Input id="onb-client-email" placeholder="iris@northstar-branding.com" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    checked={sendInvite}
                    className="size-4 appearance-none rounded-[4px] border border-[var(--border-visible)] bg-[var(--bg-surface)] transition-[border-color,background-color] duration-200 checked:border-[var(--gold-core)] checked:bg-[var(--gold-core)] cursor-pointer"
                    id="onb-send-invite"
                    onChange={(e) => setSendInvite(e.target.checked)}
                    type="checkbox"
                  />
                  <Label className="text-[13px] font-normal" htmlFor="onb-send-invite">
                    Send portal invitation now
                  </Label>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="p-6 py-12 text-center md:p-8">
              {completing ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="flex size-16 items-center justify-center rounded-[10px] bg-[var(--gold-dim)]">
                    <div className="size-6 animate-spin rounded-full border-2 border-[var(--gold-core)] border-t-transparent" />
                  </div>
                  <div>
                    <h2 className="font-display text-[28px] font-normal leading-tight text-[var(--ink-primary)]">
                      Preparing your workspace
                    </h2>
                    <p className="mt-2 text-[14px] leading-6 text-[var(--ink-secondary)]">
                      Setting up your projects, portal, and team access.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex size-16 items-center justify-center rounded-[10px] bg-[var(--gold-dim)] mx-auto">
                    <Sparkle aria-hidden="true" className="size-8 text-[var(--gold-core)]" weight="duotone" />
                  </div>
                  <h2 className="mt-6 font-display text-[28px] font-normal leading-tight text-[var(--ink-primary)]">
                    You are all set
                  </h2>
                  <p className="mt-2 max-w-[420px] mx-auto text-[14px] leading-6 text-[var(--ink-secondary)]">
                    PortalOS is ready for your agency. Start creating projects and collaborating with
                    your team.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                    <Badge variant="active">Agency created</Badge>
                    <Badge variant="active">Branding set</Badge>
                    <Badge variant="active">Team ready</Badge>
                    <Badge variant="active">Client added</Badge>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <Button
            disabled={completing || submitting}
            onClick={() => {
              if (step === 1) {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push("/app/dashboard");
                }
              } else {
                setStep((s) => s - 1);
                setStepError(null);
              }
            }}
            variant="ghost"
          >
            <ArrowLeft aria-hidden="true" className="size-4" weight="bold" />
            Back
          </Button>

          {step < 5 ? (
            <Button
              disabled={!canContinueStep2 || submitting}
              onClick={handleContinue}
            >
              {submitting ? "Saving..." : step === 3 ? "Skip for now" : "Continue"}
              {!submitting && step !== 3 && <ArrowRight aria-hidden="true" className="size-4" weight="bold" />}
            </Button>
          ) : (
            <Button disabled={completing} onClick={handleContinue}>
              {completing ? "Preparing..." : "Go to dashboard"}
              <ArrowRight aria-hidden="true" className="size-4" weight="bold" />
            </Button>
          )}

          {/* Skip button for team step */}
          {step === 3 && teamMembers.length > 0 && (
            <Button
              disabled={submitting}
              onClick={() => handleStep3Submit(true)}
              variant="ghost"
              size="sm"
            >
              Skip
            </Button>
          )}
        </div>

        <p className="text-center text-[12px] text-[var(--ink-tertiary)]">
          Step {step} of 5 · All settings can be changed later
        </p>
      </div>
    </div>
  );
}
