"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  ChatCircleText,
  CheckSquareOffset,
  FileText,
  DotsThree,
  SquaresFour,
  Upload
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KanbanBoard } from "@/components/agency/kanban-board";
import { BriefEditor } from "@/components/agency/brief-editor";
import { DeliverablesView } from "@/components/agency/deliverables-view";
import { CommentsView } from "@/components/agency/comments-view";
import { cn } from "@/lib/utils";
import type { TaskCardData } from "@/components/agency/task-card";

type CommentAuthor = {
  id: string;
  name: string | null;
  image: string | null;
};

type CommentData = {
  id: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
  authorUser: CommentAuthor | null;
  authorClientUser: CommentAuthor | null;
};

type DeliverableData = {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileSize: number;
  fileType: string;
  version: number;
  status: string;
  uploadedBy: {
    id: string;
    name: string | null;
  };
  createdAt: string;
};

type BriefData = {
  id: string;
  title: string;
  content: Record<string, unknown>;
  status: string;
  generatedByAi: boolean;
};

type ProjectWorkspaceProject = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  client: {
    id: string;
    companyName: string;
    logoUrl: string | null;
  };
  tasks: TaskCardData[];
  deliverables: DeliverableData[];
  comments: CommentData[];
  brief: BriefData | null;
  createdBy: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

type TabId = "board" | "brief" | "deliverables" | "comments";

type TabDef = {
  id: TabId;
  label: string;
  icon: typeof SquaresFour;
};

const tabs: TabDef[] = [
  { id: "board", label: "Board", icon: SquaresFour },
  { id: "brief", label: "Brief", icon: FileText },
  { id: "deliverables", label: "Deliverables", icon: Upload },
  { id: "comments", label: "Comments", icon: ChatCircleText }
];

const statusBadgeVariant: Record<string, "active" | "review" | "draft" | "archived" | undefined> = {
  ACTIVE: "active",
  IN_REVIEW: "review",
  DRAFT: "draft",
  COMPLETE: "active",
  ARCHIVED: "archived"
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  IN_REVIEW: "In Review",
  DRAFT: "Draft",
  COMPLETE: "Complete",
  ARCHIVED: "Archived"
};

type ProjectWorkspaceTabsProps = {
  project: ProjectWorkspaceProject;
};

export function ProjectWorkspaceTabs({ project }: ProjectWorkspaceTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("board");

  const assignees = [
    { id: project.createdBy.id, name: project.createdBy.name }
  ];

  return (
    <div className="space-y-8">
      <div className="lux-panel p-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 space-y-4">
          <Link
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink-secondary)]"
            href="/app/projects"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" weight="bold" />
            Back to projects
          </Link>

          <div>
            <h1 className="font-display text-[40px] font-normal leading-[1.12] tracking-[-0.015em] text-[var(--ink-primary)]">
              {project.name}
            </h1>
            {project.description && (
              <p className="mt-2 text-[15px] leading-7 text-[var(--ink-secondary)]">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-1.5">
              <div className="flex size-5 items-center justify-center rounded-[5px] bg-[var(--bg-elevated)] text-[10px] font-medium text-[var(--ink-secondary)]">
                {project.client.companyName.charAt(0)}
              </div>
              <span className="text-[13px] font-medium text-[var(--ink-secondary)]">
                {project.client.companyName}
              </span>
            </div>

            <Badge variant={statusBadgeVariant[project.status] ?? "draft"}>
              {statusLabels[project.status] ?? project.status}
            </Badge>

            {project.dueDate && (
              <span className="inline-flex items-center gap-1.5 text-[13px] text-[var(--ink-tertiary)]">
                <Calendar aria-hidden="true" className="size-3.5" />
                Due {new Date(project.dueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2 text-right md:block">
            <p className="font-mono text-[18px] leading-none text-[var(--gold-mid)]">{project.tasks.length}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">Tasks</p>
          </div>
          <Button size="sm" variant="secondary">
            <CheckSquareOffset aria-hidden="true" className="size-4" />
            Share
          </Button>
          <Button size="icon" variant="ghost">
            <DotsThree aria-hidden="true" className="size-4" weight="bold" />
            <span className="sr-only">More actions</span>
          </Button>
        </div>
      </div>

        <div className="mt-6 lux-divider" />

        <nav aria-label="Project sections" className="mt-4 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                className={cn(
                  "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-[8px] border px-3 text-[13px] font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  isActive
                    ? "border-[var(--border-gold-dim)] bg-[var(--gold-dim)] text-[var(--gold-core)] shadow-[var(--inset-gold)]"
                    : "border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--ink-tertiary)] hover:border-[var(--border-subtle)] hover:text-[var(--ink-secondary)]"
                )}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <Icon aria-hidden="true" className="size-4" weight={isActive ? "duotone" : "regular"} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div className="min-h-[calc(100dvh-400px)]">
        {activeTab === "board" && (
          <KanbanBoard
            assignees={assignees}
            projectId={project.id}
            tasks={project.tasks}
          />
        )}

        {activeTab === "brief" && (
          <BriefEditor
            brief={project.brief}
            clientName={project.client.companyName}
            projectId={project.id}
            projectName={project.name}
          />
        )}

        {activeTab === "deliverables" && (
          <DeliverablesView
            deliverables={project.deliverables}
            projectId={project.id}
          />
        )}

        {activeTab === "comments" && (
          <CommentsView
            comments={project.comments}
            projectId={project.id}
          />
        )}
      </div>
    </div>
  );
}
