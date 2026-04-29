"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus, Sparkle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type KanbanColumnProps = {
  id: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  title: string;
  count: number;
  children: ReactNode;
  onAddTask?: () => void;
};

const statusStyles: Record<string, { dot: string }> = {
  TODO: { dot: "#5C5A56" },
  IN_PROGRESS: { dot: "#C9A84C" },
  IN_REVIEW: { dot: "#D4AF37" },
  DONE: { dot: "#4ADE80" }
};

export function KanbanColumn({ id, status, title, count, children, onAddTask }: KanbanColumnProps) {
  const style = statusStyles[status] ?? statusStyles.TODO;

  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { status, type: "column" }
  });

  return (
    <div
      className="flex w-[296px] shrink-0 flex-col rounded-[10px] border border-[var(--border-default)] border-t-[rgba(255,255,255,0.10)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]"
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <span
            className="block size-2 rounded-full"
            style={{ backgroundColor: style.dot }}
          />
          <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--ink-secondary)]">
            {title}
          </h3>
          <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-[var(--bg-sunken)] px-1.5 py-0.5 text-[11px] font-medium leading-none text-[var(--ink-tertiary)]">
            {count}
          </span>
        </div>
        {status === "IN_REVIEW" && (
          <Sparkle aria-hidden="true" className="size-3.5 text-[var(--gold-muted)]" weight="duotone" />
        )}
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[160px] flex-col gap-2 px-2 pb-2 transition-colors duration-200",
          isOver && "rounded-[10px] bg-[var(--gold-dim)] shadow-[var(--inset-gold)]"
        )}
      >
        {children}
      </div>

      <div className="px-2 pb-3">
        <button
          className="flex w-full items-center justify-center gap-1.5 rounded-[8px] border border-dashed border-[var(--border-default)] px-3 py-2 text-[13px] font-medium text-[var(--ink-tertiary)] transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[var(--border-gold-dim)] hover:bg-[var(--gold-dim)] hover:text-[var(--gold-core)]"
          onClick={onAddTask}
          type="button"
        >
          <Plus aria-hidden="true" className="size-3.5" weight="bold" />
          Add task
        </button>
      </div>
    </div>
  );
}
