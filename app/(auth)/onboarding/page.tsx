"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Globe,
  Palette,
  Sparkles,
  Upload,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Agency", icon: Building2 },
  { id: 2, label: "Branding", icon: Palette },
  { id: 3, label: "Team", icon: Users },
  { id: 4, label: "Client", icon: Globe },
  { id: 5, label: "Done", icon: Sparkles },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="flex min-h-[100dvh] items-start justify-center bg-[var(--bg-void)] px-4 py-12 md:items-center">
      <div className="w-full max-w-[600px] space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-display text-[40px] font-normal leading-[1.12] tracking-[-0.015em]">Set up PortalOS</h1>
          <p className="mt-3 text-[15px] leading-7 text-[var(--ink-secondary)]">
            It takes about 3 minutes. Everything can be changed later.
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-between gap-2">
          {steps.map((s, i) => (
            <div className="flex items-center gap-2" key={s.id}>
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-[8px] text-[12px] font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-200",
                  step > s.id
                    ? "bg-[var(--gold-500)] text-[#0A0A0B]"
                    : step === s.id
                      ? "bg-[var(--ink-primary)] text-[var(--bg-void)]"
                      : "bg-[var(--bg-sunken)] text-[var(--ink-tertiary)]"
                )}
              >
                {step > s.id ? <Check className="size-3.5" /> : s.id}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "hidden h-px w-8 md:block",
                    step > s.id ? "bg-[var(--gold-500)]" : "bg-[var(--border-default)]"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <Card>
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Tell us about your agency</CardTitle>
                <CardDescription>
                  This is how you&apos;ll appear to clients in their portal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="onb-agency-name">Agency name</Label>
                  <Input id="onb-agency-name" placeholder="Lumina Creative" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="onb-agency-slug">Portal URL</Label>
                  <div className="flex items-center gap-2">
                    <Input id="onb-agency-slug" placeholder="lumina" />
                    <span className="text-[14px] text-[var(--ink-tertiary)] shrink-0">.portalos.app</span>
                  </div>
                  <p className="text-[12px] text-[var(--ink-tertiary)]">
                    This is where your clients will access their portal.
                  </p>
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Brand your portal</CardTitle>
                <CardDescription>
                  Upload your logo and pick a brand color. This is applied to your entire client portal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Logo</Label>
                  <div className="flex size-20 items-center justify-center rounded-[10px] border border-dashed border-[var(--border-default)] bg-[var(--bg-sunken)]">
                    <Upload aria-hidden="true" className="size-6 text-[var(--ink-tertiary)]" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Brand color</Label>
                  <div className="flex flex-wrap gap-2">
                    {["#D4607A", "#C9981A", "#1E1208", "#5C4F42", "#8C6510", "#9C3350"].map((c) => (
                      <button
                        className="size-9 rounded-[8px] border-2 transition-[border-color,box-shadow,transform] duration-200 hover:scale-105"
                        key={c}
                        style={{
                          backgroundColor: c,
                          borderColor: c === "#D4607A" ? "var(--ink-primary)" : "transparent",
                        }}
                        type="button"
                      >
                        <span className="sr-only">{c}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-base)] p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                    Portal preview
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="h-3 w-32 rounded bg-[var(--gold-200)]" />
                    <div className="h-2 w-48 rounded bg-[var(--bg-sunken)]" />
                    <div className="h-2 w-40 rounded bg-[var(--bg-sunken)]" />
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Invite your team</CardTitle>
                <CardDescription>
                  Add team members now or skip — you can always invite more later.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor="onb-team-email">Email address</Label>
                    <Input id="onb-team-email" placeholder="colleague@agency.com" type="email" />
                  </div>
                  <div className="w-36 space-y-1.5">
                    <Label htmlFor="onb-team-role">Role</Label>
                    <Select
                      defaultValue="MEMBER"
                      id="onb-team-role"
                      options={[
                        { value: "MEMBER", label: "Member" },
                        { value: "ADMIN", label: "Admin" }
                      ]}
                    />
                  </div>
                  <Button variant="secondary">
                    <Users aria-hidden="true" className="size-4" />
                    Add
                  </Button>
                </div>
                <div className="rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
                  <p className="text-[13px] text-[var(--ink-tertiary)]">No team members added yet.</p>
                </div>
              </CardContent>
            </>
          )}

          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>Add your first client</CardTitle>
                <CardDescription>
                  Create a client record now. They won&apos;t receive anything until you send them a portal invite.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="onb-client-name">Company name</Label>
                  <Input id="onb-client-name" placeholder="Northstar Branding" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="onb-client-contact">Contact name</Label>
                  <Input id="onb-client-contact" placeholder="Iris Calloway" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="onb-client-email">Contact email</Label>
                  <Input id="onb-client-email" placeholder="iris@northstar-branding.com" type="email" />
                </div>
                <div className="flex items-center gap-2">
                  <input className="rounded-[6px] border-[var(--border-default)]" id="onb-send-invite" type="checkbox" />
                  <Label className="text-[13px] font-normal" htmlFor="onb-send-invite">
                    Send portal invitation now
                  </Label>
                </div>
              </CardContent>
            </>
          )}

          {step === 5 && (
            <>
              <CardHeader>
                <CardTitle className="text-center">You&apos;re all set!</CardTitle>
                <CardDescription className="text-center">
                  PortalOS is ready for your agency. Start creating projects and collaborating with your team.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-8">
                <div className="flex size-16 items-center justify-center rounded-[10px] bg-[var(--gold-100)]">
                  <Sparkles aria-hidden="true" className="size-8 text-[var(--gold-400)]" />
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Badge variant="active">Agency created</Badge>
                  <Badge variant="active">Branding set</Badge>
                  <Badge variant="active">2 team members</Badge>
                  <Badge variant="active">Client added</Badge>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <Button
            disabled={step === 1}
            onClick={() => setStep((s) => s - 1)}
            variant="ghost"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back
          </Button>

          {step < 5 ? (
            <Button onClick={() => setStep((s) => s + 1)}>
              {step === 3 ? "Skip for now" : "Continue"}
              {step !== 3 && <ArrowRight aria-hidden="true" className="size-4" />}
            </Button>
          ) : (
            <Button>
              Go to dashboard
              <ArrowRight aria-hidden="true" className="size-4" />
            </Button>
          )}
        </div>

        <p className="text-center text-[12px] text-[var(--ink-tertiary)]">
          Step {step} of 5 · All settings can be changed later in Settings
        </p>
      </div>
    </div>
  );
}
