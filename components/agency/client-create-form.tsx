"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
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
        <div className="rounded-[8px] border border-[rgba(74,222,128,0.2)] bg-[var(--status-success-bg)] px-4 py-3 text-sm leading-6 text-[var(--status-success-text)]">
          <div className="flex gap-3">
            <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>
              Client created. Portal slug: <span className="font-medium">{state.data?.portalSlug}</span>
            </p>
          </div>
        </div>
      ) : null}

      {!state.success && state.error ? (
        <div className="rounded-[8px] border border-[rgba(235,87,87,0.25)] bg-[var(--status-danger-bg)] px-4 py-3 text-sm leading-6 text-[var(--status-danger-text)]">
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
          <span className="mt-2 block text-[12px] leading-5 text-[var(--ink-tertiary)]">
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
          <span className="mt-2 block text-[12px] leading-5 text-[var(--ink-tertiary)]">
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
          className="mt-2 min-h-32 w-full rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-sunken)] px-4 py-3 text-[15px] leading-7 text-[var(--ink-primary)] transition-[border-color,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--border-gold)] focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)]"
          defaultValue="Welcome to your project portal. Everything we need to review, approve, and launch together will live here."
          id="welcomeMessage"
          name="welcomeMessage"
          required
        />
      </label>

      <div className="flex flex-col gap-3 border-t border-[var(--border-default)] pt-6 sm:flex-row sm:justify-end">
        <Button asChild type="button" variant="secondary">
          <Link href="/app/clients">Cancel</Link>
        </Button>
        <Button disabled={isPending} type="submit">
          {isPending ? "Creating client" : "Create client"}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </form>
  );
}
