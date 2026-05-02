"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react";
import { createProjectAction, type CreateProjectState } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const initialState: CreateProjectState = {
  success: false
};

const demoClients = [
  { id: "demo-northstar", name: "Northstar Branding" },
  { id: "demo-forge", name: "Forge Studio" },
  { id: "demo-vessel", name: "Vessel Co." }
];

export function ProjectCreateForm() {
  const [state, action, isPending] = useActionState(createProjectAction, initialState);

  return (
    <form action={action} className="space-y-6">
      {state.success ? (
        <div className="rounded-[8px] border border-[rgba(74,222,128,0.2)] bg-[var(--status-success-bg)] px-4 py-3 text-sm leading-6 text-[var(--status-success-text)]">
          <div className="flex gap-3">
            <CheckCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" weight="fill" />
            <p>
              Project created: <span className="font-medium">{state.data?.name}</span>
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
          <Label htmlFor="name">Project name</Label>
          <Input id="name" name="name" placeholder="Brand Identity Refresh" required />
        </label>

        <label className="block">
          <Label htmlFor="clientId">Client</Label>
          <Select
            className="mt-2"
            id="clientId"
            name="clientId"
            options={demoClients.map((client) => ({ value: client.id, label: client.name }))}
            placeholder="Choose a client"
            required
          />
          <span className="mt-2 block text-[12px] leading-5 text-[var(--ink-tertiary)]">
            Demo options are placeholders until client data is loaded from Prisma.
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <label className="block">
          <Label htmlFor="dueDate">Due date</Label>
          <Input id="dueDate" name="dueDate" required type="date" />
        </label>

        <label className="block">
          <Label htmlFor="status">Starting status</Label>
          <Select
            className="mt-2"
            defaultValue="ACTIVE"
            id="status"
            name="status"
            options={[
              { value: "ACTIVE", label: "Active" },
              { value: "DRAFT", label: "Draft" }
            ]}
          />
        </label>
      </div>

      <label className="block">
        <Label htmlFor="description">Description</Label>
        <textarea
          className="mt-1.5 min-h-32 w-full rounded-[5px] border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3.5 py-3 font-sans text-[0.875rem] leading-6 text-[var(--ink-primary)] transition-[border-color,box-shadow] duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--border-gold)] focus:shadow-[var(--glow-gold-xs)]"
          id="description"
          name="description"
          placeholder="A concise brief for the work, scope, and expected client outcome."
          required
        />
      </label>

      <div className="flex flex-col gap-3 border-t border-[var(--border-default)] pt-6 sm:flex-row sm:justify-end">
        <Button asChild type="button" variant="secondary">
          <Link href="/app/projects">Cancel</Link>
        </Button>
        <Button disabled={isPending} type="submit">
          {isPending ? "Creating project" : "Create project"}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </form>
  );
}
