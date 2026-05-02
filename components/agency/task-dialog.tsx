"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createTaskAction, updateTaskAction } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

type TaskDialogAssignee = {
  id: string;
  name: string | null;
};

type TaskDialogTask = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  assigneeId: string | null;
};

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  defaultStatus?: string;
  task?: TaskDialogTask | null;
  assignees?: TaskDialogAssignee[];
  trigger?: ReactNode;
};

export function TaskDialog({
  open,
  onOpenChange,
  projectId,
  defaultStatus = "TODO",
  task,
  assignees = []
}: TaskDialogProps) {
  const router = useRouter();
  const isEdit = Boolean(task);
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState(task?.priority ?? "MEDIUM");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId ?? "");

  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? "");
      setDescription(task?.description ?? "");
      setPriority(task?.priority ?? "MEDIUM");
      setDueDate(task?.dueDate ?? "");
      setAssigneeId(task?.assigneeId ?? "");
    }
  }, [open, task]);

  const createActionWithProject = createTaskAction.bind(null);
  const updateActionWithProject = updateTaskAction.bind(null);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the task details below."
              : "Add a task to the project board."}
          </DialogDescription>
        </DialogHeader>

        <form
          action={async (formData) => {
            formData.set("projectId", projectId);
            formData.set("status", task?.status ?? defaultStatus);
            if (isEdit) formData.set("taskId", task!.id);

            if (isEdit) {
              await updateActionWithProject(null as never, formData);
            } else {
              await createActionWithProject(null as never, formData);
            }
            router.refresh();
            onOpenChange(false);
          }}
          className="mt-6 space-y-5"
        >
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              name="title"
              placeholder="Task title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-description">Description</Label>
            <textarea
              className="min-h-[80px] w-full rounded-[5px] border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3.5 py-3 font-sans text-[0.875rem] leading-6 text-[var(--ink-primary)] transition-[border-color,box-shadow] duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--border-gold)] focus:shadow-[var(--glow-gold-xs)]"
              id="task-description"
              name="description"
              placeholder="Optional description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                id="task-priority"
                name="priority"
                onValueChange={setPriority}
                options={[
                  { value: "LOW", label: "Low" },
                  { value: "MEDIUM", label: "Medium" },
                  { value: "HIGH", label: "High" },
                  { value: "URGENT", label: "Urgent" }
                ]}
                value={priority}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-due-date">Due date</Label>
              <Input
                id="task-due-date"
                name="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {assignees.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="task-assignee">Assignee</Label>
              <input name="assigneeId" type="hidden" value={assigneeId === "UNASSIGNED" ? "" : assigneeId} />
              <Select
                id="task-assignee"
                onValueChange={setAssigneeId}
                options={[
                  { value: "UNASSIGNED", label: "Unassigned" },
                  ...assignees.map((a) => ({ value: a.id, label: a.name ?? a.id }))
                ]}
                value={assigneeId || "UNASSIGNED"}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              size="md"
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
            <Button size="md" type="submit" variant="primary">
              {isEdit ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
