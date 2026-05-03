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
        <h1 className="mt-10 font-display text-[38px] font-normal leading-[1.15] tracking-[-0.02em] text-[var(--ink-primary)]" key={index}>
          {text}
        </h1>
      );
    }

    if (level === 3) {
      return (
        <h3 className="mt-8 font-display text-[24px] font-normal leading-[1.3] tracking-[-0.01em] text-[var(--ink-primary)]" key={index}>
          {text}
        </h3>
      );
    }

    return (
      <h2 className="mt-9 font-display text-[30px] font-normal leading-[1.2] tracking-[-0.015em] text-[var(--ink-primary)]" key={index}>
        {text}
      </h2>
    );
  }

  if (node.type === "paragraph") {
    const text = extractText(node);
    if (!text.trim()) return <div className="h-3" key={index} />;

    return (
      <p className="mt-4 max-w-[760px] text-[16px] leading-[1.75] text-[var(--ink-secondary)]" key={index}>
        {text}
      </p>
    );
  }

  if (node.type === "bulletList") {
    const items = Array.isArray(node.content) ? (node.content as Record<string, unknown>[]) : [];

    return (
      <ul className="mt-5 grid gap-2.5" key={index}>
        {items.map((item, itemIndex) => (
          <li className="flex gap-3 text-[16px] leading-[1.7] text-[var(--ink-secondary)]" key={itemIndex}>
            <span className="mt-[9px] size-2 shrink-0 rounded-full bg-[var(--gold-mid)]" />
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
    <div className="surface-panel flex min-h-[320px] flex-col items-center justify-center p-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-[14px] border border-[var(--border-gold-dim)] bg-[var(--gold-wash)]">
        <IconComponent aria-hidden="true" className="size-8 text-[var(--gold-muted)]" weight="duotone" />
      </div>
      <p className="mt-6 font-display text-[28px] font-normal leading-[1.2] text-[var(--ink-primary)]">{title}</p>
      <p className="mt-3 max-w-[440px] text-[15px] leading-[1.6] text-[var(--ink-secondary)]">{copy}</p>
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
    <div className="space-y-10">
      <section className="surface-panel p-7 md:p-10">
        <Link
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--ink-tertiary)] transition-colors duration-[180ms] ease-[var(--ease-out)] hover:text-[var(--gold-core)]"
          href={`/portal/${clientSlug}`}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to projects
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={statusBadgeVariant[project.status] ?? "draft"}>
                {statusLabels[project.status] ?? project.status}
              </Badge>
              {project.dueDate && (
                <span className="font-sans text-[12px] uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">
                  Due{" "}
                  {new Date(project.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              )}
            </div>

            <h1 className="mt-5 max-w-[780px] font-display text-[clamp(2.25rem,5vw,4rem)] font-normal leading-[1.08] tracking-[-0.025em] text-[var(--ink-primary)]">
              {project.name}
            </h1>
            {project.description && (
              <p className="mt-5 max-w-[680px] text-[17px] leading-[1.7] text-[var(--ink-secondary)]">
                {project.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 self-end">
            <div className="surface-panel p-5">
              <p className="font-sans text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--ink-tertiary)]">
                Files
              </p>
              <p className="mt-3 font-display text-[40px] leading-none text-[var(--ink-primary)]">
                {deliverables.length}
              </p>
            </div>
            <div className="surface-panel border-[var(--border-gold-dim)] bg-[var(--gold-wash)] p-5">
              <p className="font-sans text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--gold-core)]">
                Review
              </p>
              <p className="mt-3 font-display text-[40px] leading-none text-[var(--gold-mid)]">
                {pendingDeliverables}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="surface-panel bg-[var(--bg-base)] p-1.5">
        <nav aria-label="Project sections" className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex min-h-14 items-center justify-center gap-2.5 rounded-[10px] px-4 text-[14px] font-medium transition-[background-color,color,box-shadow] duration-[200ms] ease-[var(--ease-out)]",
                  isActive
                    ? "bg-[var(--gold-dim)] text-[var(--gold-core)] shadow-[var(--inset-gold)]"
                    : "text-[var(--ink-tertiary)] hover:bg-[var(--gold-dim)] hover:text-[var(--gold-core)]"
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
        <section className="surface-panel p-7 md:p-10">
          {project.brief ? (
            <>
              <div className="flex flex-col gap-5 border-b border-[var(--border-hairline)] pb-7 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--gold-core)]">
                    Creative brief
                  </p>
                  <h2 className="mt-4 font-display text-[36px] font-normal leading-[1.15] tracking-[-0.02em] text-[var(--ink-primary)]">
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
        <section className="space-y-5">
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
                    "surface-panel surface-panel-interactive p-6",
                    awaitingReview && "border-[var(--border-gold)] shadow-[var(--inset-gold)] bg-[var(--gold-wash)]"
                  )}
                  key={deliverable.id}
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-5">
                      <div className="flex size-16 shrink-0 items-center justify-center rounded-[12px] border border-[var(--border-gold-dim)] bg-[var(--gold-wash)] font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--gold-core)]">
                        {getFileKind(deliverable.fileType)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-display text-[26px] font-normal leading-[1.2] tracking-[-0.01em] text-[var(--ink-primary)]">
                            {deliverable.title}
                          </h3>
                          <Badge variant={deliverableStatusBadge[deliverable.status] ?? "draft"}>
                            {deliverableStatusLabels[deliverable.status] ?? deliverable.status}
                          </Badge>
                        </div>
                        {deliverable.description && (
                          <p className="mt-3 max-w-[720px] text-[15px] leading-[1.6] text-[var(--ink-secondary)]">
                            {deliverable.description}
                          </p>
                        )}
                        <p className="mt-4 font-sans text-[11px] uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
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
                      <Button
                        size="sm"
                        type="button"
                        variant="ghost"
                        onClick={() => window.open(`/api/deliverables/${deliverable.id}/download`, "_blank")}
                      >
                        <DownloadSimple aria-hidden="true" className="size-4" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {awaitingReview && (
                    <div className="mt-6 flex flex-col gap-4 border-t border-[var(--border-gold-dim)] pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3 text-[15px] font-medium text-[var(--gold-core)]">
                        <HourglassMedium aria-hidden="true" className="size-5" weight="duotone" />
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
        <section className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
          <div className="surface-panel p-6">
            <p className="font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-[var(--gold-core)]">
              Client thread
            </p>
            <h2 className="mt-4 font-display text-[32px] font-normal leading-[1.2] tracking-[-0.02em] text-[var(--ink-primary)]">
              Keep decisions visible.
            </h2>
            <p className="mt-4 text-[15px] leading-[1.6] text-[var(--ink-secondary)]">
              Only client-facing comments appear here. Internal agency notes stay private.
            </p>
            <div className="mt-6">
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
            <div className="space-y-5">
              {clientFacingComments.map((comment) => {
                const author = comment.authorUser?.name ?? comment.authorClientUser?.name ?? "Unknown";

                return (
                  <article
                    className="surface-panel p-6"
                    key={comment.id}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-[10px] border border-[var(--border-gold-dim)] bg-[var(--gold-wash)] font-sans text-[13px] font-semibold text-[var(--gold-core)]">
                        {getInitials(author)}
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold text-[var(--ink-primary)]">{author}</p>
                        <p className="mt-0.5 font-sans text-[11px] uppercase tracking-[0.1em] text-[var(--ink-tertiary)]">
                          {new Date(comment.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="mt-5 text-[15px] leading-[1.7] text-[var(--ink-secondary)]">{comment.body}</p>
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
