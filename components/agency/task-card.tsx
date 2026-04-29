"use client";

import { useDraggable } from "@dnd-kit/core";
import { Calendar, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

type TaskCardAssignee = {
  id: string;
  name: string | null;
  image: string | null;
};

type TaskCardData = {
  id: string;
  title: string;
  status: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  assignee: TaskCardAssignee | null;
  _count?: { comments: number };
};

type TaskCardProps = {
  task: TaskCardData;
  onClick?: () => void;
};

const priorityConfig: Record<string, { color: string; label: string; border: string }> = {
  LOW: { color: "#555555", label: "Low", border: "rgba(255,255,255,0.04)" },
  MEDIUM: { color: "#C9A84C", label: "Medium", border: "rgba(201,168,76,0.24)" },
  HIGH: { color: "#E8CB6A", label: "High", border: "rgba(232,203,106,0.38)" },
  URGENT: { color: "#F87171", label: "Urgent", border: "rgba(248,113,113,0.45)" }
};

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDueDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / 86_400_000);

  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return `${days}d left`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const priority = priorityConfig[task.priority] ?? priorityConfig.MEDIUM;
  const dueLabel = formatDueDate(task.dueDate);
  const isOverdue = dueLabel?.includes("overdue");
  const commentCount = task._count?.comments ?? 0;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task, type: "task" }
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : undefined
      }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      className={cn(
        "relative w-full cursor-grab overflow-hidden rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-base)] p-4 text-left shadow-[var(--shadow-sm)] transition-[box-shadow,transform,border-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] focus-visible:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] active:cursor-grabbing",
        isDragging &&
          "kanban-card-dragging z-50 cursor-grabbing border-[var(--border-gold)]"
      )}
      style={{ ...style, borderLeftColor: priority.border, borderLeftWidth: 2 }}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <span className="absolute inset-x-0 top-0 h-px opacity-70" style={{ backgroundColor: priority.border }} />
        <span className="mt-1.5 block h-2 w-2 shrink-0 rounded-[2px]" style={{ backgroundColor: priority.color }} title={priority.label} />
        <span className="text-[14px] font-medium leading-snug text-[var(--ink-primary)]">
          {task.title}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {dueLabel && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-medium leading-none",
                isOverdue ? "text-[var(--status-danger-text)]" : "text-[var(--ink-tertiary)]"
              )}
            >
              <Calendar aria-hidden="true" className="size-3" />
              {dueLabel}
            </span>
          )}
          {commentCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium leading-none text-[var(--ink-tertiary)]">
              <MessageSquare aria-hidden="true" className="size-3" />
              {commentCount}
            </span>
          )}
        </div>

        {task.assignee && (
          <div
            className="flex size-6 items-center justify-center rounded-[6px] bg-[var(--bg-elevated)] text-[10px] font-medium text-[var(--ink-secondary)]"
            title={task.assignee.name ?? "Assignee"}
          >
            {getInitials(task.assignee.name)}
          </div>
        )}
      </div>
    </button>
  );
}

export type { TaskCardData };
