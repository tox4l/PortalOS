"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent
} from "@dnd-kit/core";
import { FunnelSimple, X } from "@phosphor-icons/react";
import { KanbanColumn } from "@/components/agency/kanban-column";
import { TaskCard, type TaskCardData } from "@/components/agency/task-card";
import { TaskDialog } from "@/components/agency/task-dialog";
import { Select } from "@/components/ui/select";
import { updateTaskStatusAction } from "@/actions/tasks";
import { cn } from "@/lib/utils";

type KanbanBoardAssignee = {
  id: string;
  name: string | null;
};

type KanbanBoardProps = {
  projectId: string;
  tasks: TaskCardData[];
  assignees: KanbanBoardAssignee[];
};

const columns = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "IN_REVIEW", title: "In Review" },
  { id: "DONE", title: "Done" }
] as const;

type ColumnStatus = (typeof columns)[number]["id"];

export function KanbanBoard({ projectId, tasks, assignees }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<ColumnStatus>("TODO");
  const [editingTask, setEditingTask] = useState<TaskCardData | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
      if (assigneeFilter !== "ALL" && t.assignee?.id !== assigneeFilter) return false;
      return true;
    });
  }, [tasks, priorityFilter, assigneeFilter]);

  const tasksByStatus = useMemo(() => {
    const map: Record<string, TaskCardData[]> = {
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: []
    };
    for (const task of filteredTasks) {
      map[task.status]?.push(task);
    }
    for (const key of Object.keys(map)) {
      map[key]?.sort((a, b) => {
        const pOrder: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return (pOrder[a.priority] ?? 2) - (pOrder[b.priority] ?? 2);
      });
    }
    return map;
  }, [filteredTasks]);

  const activeTask = useMemo(
    () => tasks.find((t) => t.id === activeId) ?? null,
    [tasks, activeId]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;

      if (!over) return;

      const taskId = String(active.id);
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      let newStatus: ColumnStatus | null = null;

      const overId = String(over.id);

      if (columns.some((c) => c.id === overId)) {
        newStatus = overId as ColumnStatus;
      } else {
        const overTask = tasks.find((t) => t.id === overId);
        if (overTask && columns.some((c) => c.id === overTask.status)) {
          newStatus = overTask.status as ColumnStatus;
        }
      }

      if (!newStatus || newStatus === task.status) return;

      const newPosition = (tasksByStatus[newStatus]?.length ?? 0) + 1;

      await updateTaskStatusAction({ taskId, status: newStatus as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE", position: newPosition });
    },
    [tasks, tasksByStatus]
  );

  const handleAddTask = useCallback((status: ColumnStatus) => {
    setEditingTask(null);
    setDefaultStatus(status);
    setDialogOpen(true);
  }, []);

  const handleEditTask = useCallback((task: TaskCardData) => {
    setEditingTask(task);
    setDialogOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <button
          className={cn(
            "inline-flex items-center gap-2 rounded-[8px] border px-3 py-2 text-[13px] font-medium transition-colors duration-200",
            filterOpen
              ? "border-[var(--border-gold)] bg-[var(--gold-100)] text-[var(--gold-400)]"
              : "border-[var(--border-default)] text-[var(--ink-secondary)] hover:bg-[var(--neutral-bg)]"
          )}
          onClick={() => setFilterOpen((v) => !v)}
          type="button"
        >
          <FunnelSimple aria-hidden="true" className="size-3.5" weight="bold" />
          Filters
          {(priorityFilter !== "ALL" || assigneeFilter !== "ALL") && (
            <span className="inline-flex size-4 items-center justify-center rounded-full bg-[var(--gold-500)] text-[10px] text-[var(--bg-surface)]">
              {[priorityFilter, assigneeFilter].filter((f) => f !== "ALL").length}
            </span>
          )}
        </button>

        {filterOpen && (
          <div className="flex items-center gap-3">
            <Select
              className="min-h-9 bg-[var(--bg-base)] text-[13px]"
              onValueChange={setPriorityFilter}
              options={[
                { value: "ALL", label: "All priorities" },
                { value: "LOW", label: "Low" },
                { value: "MEDIUM", label: "Medium" },
                { value: "HIGH", label: "High" },
                { value: "URGENT", label: "Urgent" }
              ]}
              value={priorityFilter}
            />

            <Select
              className="min-h-9 bg-[var(--bg-base)] text-[13px]"
              onValueChange={setAssigneeFilter}
              options={[
                { value: "ALL", label: "All assignees" },
                ...assignees.map((a) => ({ value: a.id, label: a.name ?? a.id }))
              ]}
              value={assigneeFilter}
            />

            {(priorityFilter !== "ALL" || assigneeFilter !== "ALL") && (
              <button
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink-secondary)]"
                onClick={() => {
                  setPriorityFilter("ALL");
                  setAssigneeFilter("ALL");
                }}
                type="button"
              >
                <X aria-hidden="true" className="size-3.5" weight="bold" />
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Board */}
      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <KanbanColumn
              count={tasksByStatus[col.id]?.length ?? 0}
              id={col.id}
              key={col.id}
              onAddTask={() => handleAddTask(col.id)}
              status={col.id}
              title={col.title}
            >
              {tasksByStatus[col.id]?.map((task) => (
                <TaskCard
                  key={task.id}
                  onClick={() => handleEditTask(task)}
                  task={task}
                />
              ))}
            </KanbanColumn>
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="kanban-card-dragging w-[280px] rounded-[10px] border border-[var(--border-gold)] bg-[var(--bg-base)] p-4 opacity-95">
              <span className="text-[14px] font-medium leading-snug text-[var(--ink-primary)]">
                {activeTask.title}
              </span>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TaskDialog
        assignees={assignees}
        defaultStatus={defaultStatus}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        projectId={projectId}
        task={
          editingTask
            ? {
                id: editingTask.id,
                title: editingTask.title,
                description: null,
                priority: editingTask.priority,
                status: editingTask.status,
                dueDate: editingTask.dueDate,
                assigneeId: editingTask.assignee?.id ?? null
              }
            : null
        }
      />
    </div>
  );
}
