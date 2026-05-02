"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react";
import { createClientAction, type CreateClientState } from "@/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CreateClientState = {
  success: false
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ClientCreateForm() {
  const [state, action, isPending] = useActionState(createClientAction, initialState);
  const [companyName, setCompanyName] = useState("");
  const suggestedSlug = useMemo(() => slugify(companyName), [companyName]);

  return (
    <form action={action} className="space-y-6">
      {state.success ? (
        <div className="rounded-[5px] border border-[var(--success-border)] bg-[var(--success-bg)] px-4 py-3 font-sans text-[0.875rem] leading-6 text-[var(--success-text)]">
          <div className="flex gap-3">
            <CheckCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" weight="fill" />
            <p>
              Client created. Portal slug: <span className="font-medium">{state.data?.portalSlug}</span>
            </p>
          </div>
        </div>
      ) : null}

      {!state.success && state.error ? (
        <div className="rounded-[5px] border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 font-sans text-[0.875rem] leading-6 text-[var(--danger-text)]">
          {state.error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <label className="block">
          <Label htmlFor="companyName">Client company</Label>
          <Input
            id="companyName"
            name="companyName"
            onChange={(event) => setCompanyName(event.target.value)}
            placeholder="Northstar Branding"
            required
            value={companyName}
          />
          <span className="mt-1.5 block font-sans text-[0.75rem] leading-5 text-[var(--ink-tertiary)]">
            The company name shown in their portal.
          </span>
        </label>

        <label className="block">
          <Label htmlFor="portalSlug">Portal slug</Label>
          <Input
            defaultValue={suggestedSlug}
            id="portalSlug"
            key={suggestedSlug}
            name="portalSlug"
            placeholder="northstar-branding"
            required
          />
          <span className="mt-1.5 block font-sans text-[0.75rem] leading-5 text-[var(--ink-tertiary)]">
            Lowercase letters, numbers, and hyphens.
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <label className="block">
          <Label htmlFor="contactName">Primary contact</Label>
          <Input id="contactName" name="contactName" placeholder="Iris Calloway" required />
        </label>

        <label className="block">
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            placeholder="iris@northstar.example"
            required
            type="email"
          />
        </label>
      </div>

      <label className="block">
        <Label htmlFor="welcomeMessage">Welcome message</Label>
        <textarea
          className="mt-1.5 min-h-28 w-full rounded-[5px] border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3.5 py-3 font-sans text-[0.875rem] leading-6 text-[var(--ink-primary)] transition-[border-color,box-shadow] duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--border-gold)] focus:shadow-[var(--glow-gold-xs)]"
          defaultValue="Welcome to your project portal. Everything we need to review, approve, and launch together will live here."
          id="welcomeMessage"
          name="welcomeMessage"
          required
        />
      </label>

      <div className="flex flex-col gap-3 border-t border-[var(--border-hairline)] pt-6 sm:flex-row sm:justify-end">
        <Button asChild type="button" variant="secondary">
          <Link href="/app/clients">Cancel</Link>
        </Button>
        <Button disabled={isPending} type="submit">
          {isPending ? "Creating client" : "Create client"}
          <ArrowRight aria-hidden="true" className="size-4" weight="bold" />
        </Button>
      </div>
    </form>
  );
}
