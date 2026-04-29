"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChatCircleText,
  CheckCircle,
  DownloadSimple,
  Eye,
  FileText,
  FolderSimpleDashed,
  HourglassMedium,
  UploadSimple,
  XCircle
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommentInput } from "@/components/client/comment-input";
import { ApprovalModal } from "@/components/client/approval-modal";
import { cn } from "@/lib/utils";

type DeliverableData = {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileSize: number;
  fileType: string;
  version: number;
  status: string;
  createdAt: string;
  uploadedBy: { id: string; name: string | null };
};

type CommentData = {
  id: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
  authorUser: { id: string; name: string | null; image: string | null } | null;
  authorClientUser: { id: string; name: string | null } | null;
};

type ClientProject = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  brief: {
    id: string;
    title: string;
    content: Record<string, unknown>;
    status: string;
    generatedByAi: boolean;
  } | null;
  deliverables: DeliverableData[];
  comments: CommentData[];
};

type TabId = "brief" | "deliverables" | "comments";

type ClientProjectViewProps = {
  clientSlug: string;
  project: ClientProject;
};

const tabs: { id: TabId; label: string; icon: Icon }[] = [
  { id: "brief", label: "Brief", icon: FileText },
  { id: "deliverables", label: "Deliverables", icon: UploadSimple },
  { id: "comments", label: "Comments", icon: ChatCircleText }
];

const deliverableStatusBadge: Record<string, "active" | "review" | "approved" | "draft" | "overdue"> = {
  DRAFT: "draft",
  PENDING_REVIEW: "review",
  AWAITING_APPROVAL: "review",
  APPROVED: "approved",
  REJECTED: "overdue"
};

const deliverableStatusLabels: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Awaiting approval",
  AWAITING_APPROVAL: "Awaiting approval",
  APPROVED: "Approved",
  REJECTED: "Changes requested"
};

const statusBadgeVariant: Record<string, "active" | "review" | "draft" | "archived"> = {
  ACTIVE: "active",
  IN_REVIEW: "review",
  DRAFT: "draft",
  COMPLETE: "active",
  ARCHIVED: "archived"
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  IN_REVIEW: "In review",
  DRAFT: "Draft",
  COMPLETE: "Complete",
  ARCHIVED: "Archived"
};

function extractText(node: Record<string, unknown>): string {
  if (typeof node.text === "string") return node.text;
  const content = Array.isArray(node.content) ? (node.content as Record<string, unknown>[]) : [];
  return content.map(extractText).join("");
}

function renderBriefNode(node: Record<string, unknown>, index: number): ReactNode {
  if (node.type === "heading") {
    const attrs = (node.attrs as Record<string, number> | undefined) ?? {};
    const level = attrs.level ?? 2;
    const text = extractText(node);

    if (level === 1) {
      return (
        <h1 className="mt-8 font-display text-[32px] font-normal leading-tight text-[var(--ink-primary)]" key={index}>
          {text}
        </h1>
      );
    }

    if (level === 3) {
      return (
        <h3 className="mt-7 font-display text-[22px] font-normal leading-tight text-[var(--ink-primary)]" key={index}>
          {text}
        </h3>
      );
    }

    return (
      <h2 className="mt-8 font-display text-[26px] font-normal leading-tight text-[var(--ink-primary)]" key={index}>
        {text}
      </h2>
    );
  }

  if (node.type === "paragraph") {
    const text = extractText(node);
    if (!text.trim()) return <div className="h-3" key={index} />;

    return (
      <p className="mt-3 max-w-[760px] text-[15px] leading-7 text-[var(--ink-secondary)]" key={index}>
        {text}
      </p>
    );
  }

  if (node.type === "bulletList") {
    const items = Array.isArray(node.content) ? (node.content as Record<string, unknown>[]) : [];

    return (
      <ul className="mt-4 grid gap-2" key={index}>
        {items.map((item, itemIndex) => (
          <li className="flex gap-3 text-[15px] leading-7 text-[var(--ink-secondary)]" key={itemIndex}>
            <span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-[var(--gold-core)]" />
            <span>{extractText(item)}</span>
          </li>
        ))}
      </ul>
    );
  }

  return null;
}

function getFileKind(fileType: string) {
  if (fileType.startsWith("image/")) return "Image";
  if (fileType === "application/pdf") return "PDF";
  if (fileType.startsWith("video/")) return "Video";
  if (fileType.includes("zip") || fileType.includes("compressed")) return "Archive";
  if (fileType.includes("photoshop") || fileType.includes("illustrator") || fileType === "application/octet-stream") {
    return "Design";
  }

  return "File";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function EmptyState({
  copy,
  icon: IconComponent,
  title
}: {
  copy: string;
  icon: Icon;
  title: string;
}) {
  return (
    <div className="lux-panel flex min-h-[300px] flex-col items-center justify-center border-dashed p-10 text-center">
      <div className="flex size-14 items-center justify-center rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-base)]">
        <IconComponent aria-hidden="true" className="size-7 text-[var(--ink-tertiary)]" weight="duotone" />
      </div>
      <p className="mt-5 font-display text-[24px] font-normal text-[var(--ink-primary)]">{title}</p>
      <p className="mt-2 max-w-[420px] text-[14px] leading-6 text-[var(--ink-secondary)]">{copy}</p>
    </div>
  );
}

export function ClientProjectView({ project, clientSlug }: ClientProjectViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("brief");
  const [deliverables, setDeliverables] = useState(project.deliverables);
  const [approvalTarget, setApprovalTarget] = useState<DeliverableData | null>(null);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve");

  const clientFacingComments = useMemo(
    () => project.comments.filter((comment) => !comment.isInternal),
    [project.comments]
  );
  const pendingDeliverables = deliverables.filter(
    (deliverable) => deliverable.status === "PENDING_REVIEW" || deliverable.status === "AWAITING_APPROVAL"
  ).length;

  const briefContent = project.brief?.content?.content;

  return (
    <div className="space-y-8">
      <section className="lux-panel p-6 md:p-8">
        <Link
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--ink-tertiary)] transition-colors hover:text-[var(--ink-secondary)]"
          href={`/portal/${clientSlug}`}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to projects
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={statusBadgeVariant[project.status] ?? "draft"}>
                {statusLabels[project.status] ?? project.status}
              </Badge>
              {project.dueDate && (
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                  Due{" "}
                  {new Date(project.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              )}
            </div>

            <h1 className="mt-4 max-w-[780px] font-display text-[40px] font-normal leading-[1.08] tracking-[-0.015em] text-[var(--ink-primary)] md:text-[56px]">
              {project.name}
            </h1>
            {project.description && (
              <p className="mt-4 max-w-[680px] text-[16px] leading-7 text-[var(--ink-secondary)]">
                {project.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 self-end">
            <div className="rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-base)] p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                Files
              </p>
              <p className="mt-3 font-mono text-[32px] leading-none text-[var(--ink-primary)]">
                {deliverables.length}
              </p>
            </div>
            <div className="rounded-[10px] border border-[var(--border-gold-dim)] bg-[var(--gold-dim)] p-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--gold-core)]">
                Review
              </p>
              <p className="mt-3 font-mono text-[32px] leading-none text-[var(--gold-mid)]">
                {pendingDeliverables}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="lux-panel bg-[var(--bg-base)] p-1">
        <nav aria-label="Project sections" className="grid grid-cols-1 gap-1 sm:grid-cols-3">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex min-h-12 items-center justify-center gap-2 rounded-[8px] px-3 text-[13px] font-medium transition-[background-color,color,box-shadow] duration-200",
                  isActive
                    ? "bg-[var(--gold-dim)] text-[var(--gold-core)] shadow-[var(--inset-gold)]"
                    : "text-[var(--ink-tertiary)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--ink-secondary)]"
                )}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <IconComponent aria-hidden="true" className="size-4" weight={isActive ? "fill" : "regular"} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === "brief" && (
        <section className="lux-panel p-6 md:p-8">
          {project.brief ? (
            <>
              <div className="flex flex-col gap-4 border-b border-[var(--border-default)] pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--gold-core)]">
                    Creative brief
                  </p>
                  <h2 className="mt-3 font-display text-[32px] font-normal leading-tight text-[var(--ink-primary)]">
                    {project.brief.title}
                  </h2>
                </div>
                <Badge variant={project.brief.status === "APPROVED" ? "approved" : "review"}>
                  {project.brief.status === "DRAFT"
                    ? "Draft"
                    : project.brief.status === "SENT"
                      ? "Shared"
                      : "Approved"}
                </Badge>
              </div>

              <div className="pt-2">
                {Array.isArray(briefContent)
                  ? (briefContent as Record<string, unknown>[]).map(renderBriefNode)
                  : null}
              </div>
            </>
          ) : (
            <EmptyState
              copy="Your agency team will share the creative brief here once it is ready for review."
              icon={FileText}
              title="No brief available yet"
            />
          )}
        </section>
      )}

      {activeTab === "deliverables" && (
        <section className="space-y-4">
          {deliverables.length === 0 ? (
            <EmptyState
              copy="Files shared by your agency team will appear here, with approval controls when review is needed."
              icon={FolderSimpleDashed}
              title="No deliverables yet"
            />
          ) : (
            deliverables.map((deliverable) => {
              const awaitingReview =
                deliverable.status === "PENDING_REVIEW" || deliverable.status === "AWAITING_APPROVAL";

              return (
                <article
                  className={cn(
                    "lux-panel lux-panel-interactive p-5",
                    awaitingReview && "border-[var(--border-gold-dim)] shadow-[var(--inset-gold)]"
                  )}
                  key={deliverable.id}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-4">
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-base)] font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                        {getFileKind(deliverable.fileType)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-[24px] font-normal leading-tight text-[var(--ink-primary)]">
                            {deliverable.title}
                          </h3>
                          <Badge variant={deliverableStatusBadge[deliverable.status] ?? "draft"}>
                            {deliverableStatusLabels[deliverable.status] ?? deliverable.status}
                          </Badge>
                        </div>
                        {deliverable.description && (
                          <p className="mt-2 max-w-[720px] text-[14px] leading-6 text-[var(--ink-secondary)]">
                            {deliverable.description}
                          </p>
                        )}
                        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--ink-tertiary)]">
                          {deliverable.fileName} / {formatFileSize(deliverable.fileSize)} / v{deliverable.version} /{" "}
                          {new Date(deliverable.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric"
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Button size="sm" type="button" variant="secondary">
                        <Eye aria-hidden="true" className="size-4" />
                        Preview
                      </Button>
                      <Button size="sm" type="button" variant="ghost">
                        <DownloadSimple aria-hidden="true" className="size-4" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {awaitingReview && (
                    <div className="mt-5 flex flex-col gap-3 border-t border-[var(--border-default)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3 text-[14px] text-[var(--ink-secondary)]">
                        <HourglassMedium aria-hidden="true" className="size-5 text-[var(--gold-core)]" weight="duotone" />
                        Waiting on your approval.
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          onClick={() => {
                            setApprovalTarget(deliverable);
                            setApprovalAction("reject");
                          }}
                          size="sm"
                          type="button"
                          variant="secondary"
                        >
                          <XCircle aria-hidden="true" className="size-4" />
                          Request changes
                        </Button>
                        <Button
                          onClick={() => {
                            setApprovalTarget(deliverable);
                            setApprovalAction("approve");
                          }}
                          size="sm"
                          type="button"
                        >
                          <CheckCircle aria-hidden="true" className="size-4" weight="fill" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>
      )}

      {activeTab === "comments" && (
        <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="lux-panel p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--gold-core)]">
              Client thread
            </p>
            <h2 className="mt-3 font-display text-[28px] font-normal leading-tight text-[var(--ink-primary)]">
              Keep decisions visible.
            </h2>
            <p className="mt-3 text-[14px] leading-6 text-[var(--ink-secondary)]">
              Only client-facing comments appear here. Internal agency notes stay private.
            </p>
            <div className="mt-5">
              <CommentInput clientSlug={clientSlug} projectId={project.id} />
            </div>
          </div>

          {clientFacingComments.length === 0 ? (
            <EmptyState
              copy="Start the conversation with your agency team and keep every decision in one place."
              icon={ChatCircleText}
              title="No comments yet"
            />
          ) : (
            <div className="space-y-4">
              {clientFacingComments.map((comment) => {
                const author = comment.authorUser?.name ?? comment.authorClientUser?.name ?? "Unknown";

                return (
                  <article
                    className="lux-panel p-5"
                    key={comment.id}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-base)] font-mono text-[12px] text-[var(--ink-primary)]">
                        {getInitials(author)}
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-[var(--ink-primary)]">{author}</p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                          {new Date(comment.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-[14px] leading-7 text-[var(--ink-secondary)]">{comment.body}</p>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {approvalTarget && (
        <ApprovalModal
          action={approvalAction}
          clientSlug={clientSlug}
          deliverableId={approvalTarget.id}
          deliverableTitle={approvalTarget.title}
          onClose={() => setApprovalTarget(null)}
          onResolved={(status) => {
            setDeliverables((current) =>
              current.map((deliverable) =>
                deliverable.id === approvalTarget.id ? { ...deliverable, status } : deliverable
              )
            );
          }}
        />
      )}
    </div>
  );
}
