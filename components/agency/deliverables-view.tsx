"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  File,
  FileImage,
  FileText,
  FileVideo,
  FileArchive,
  Download,
  Trash2,
  Send,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  createDeliverableAction,
  requestApprovalAction,
  deleteDeliverableAction
} from "@/actions/deliverables";
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
  uploadedBy: {
    id: string;
    name: string | null;
  };
  createdAt: string;
};

type DeliverablesViewProps = {
  projectId: string;
  deliverables: DeliverableData[];
};

const statusBadgeVariant: Record<string, "active" | "review" | "draft" | "archived" | undefined> = {
  DRAFT: "draft",
  PENDING_REVIEW: "review",
  APPROVED: "active",
  REJECTED: "archived"
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Changes requested"
};

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return FileImage;
  if (fileType.startsWith("video/")) return FileVideo;
  if (fileType === "application/pdf") return FileText;
  if (fileType.startsWith("application/zip") || fileType.includes("rar") || fileType.includes("7z"))
    return FileArchive;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "video/mp4",
  "video/webm",
  "application/zip",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  "application/vnd.adobe.illustrator",
  "application/postscript",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain"
];

const MAX_SIZE = 500 * 1024 * 1024; // 500 MB

export function DeliverablesView({ projectId, deliverables }: DeliverablesViewProps) {
  const [items, setItems] = useState(deliverables);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setUploading(true);
      const fileArray = Array.from(files);

      for (const file of fileArray) {
        if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(ai|psd|eps|docx|xlsx)$/i)) {
          continue;
        }
        if (file.size > MAX_SIZE) continue;

        const formData = new FormData();
        formData.set("title", file.name);
        formData.set("fileName", file.name);
        formData.set("fileSize", String(file.size));
        formData.set("fileType", file.type || "application/octet-stream");
        formData.set("projectId", projectId);

        await createDeliverableAction({ success: false }, formData);
      }

      setUploading(false);
    },
    [projectId]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDelete = useCallback(async (id: string) => {
    const result = await deleteDeliverableAction(id);
    if (!result.success) {
      toast.error("Something went wrong", { description: result.error ?? "Delete failed." });
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    setDeleteConfirm(null);
    toast.success("Deleted");
  }, []);

  const handleRequestApproval = useCallback(async (id: string) => {
    const result = await requestApprovalAction(id);
    if (!result.success) {
      toast.error("Something went wrong", { description: result.error ?? "Approval request failed." });
      return;
    }

    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, status: "PENDING_REVIEW" } : item))
    );
    toast.success("Approval requested", { description: "Client portal updated." });
  }, []);

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div
        className={cn(
          "relative rounded-[10px] border-2 border-dashed p-8 text-center transition-[background-color,border-color,box-shadow,transform] duration-200",
          dragOver
            ? "border-[var(--border-gold)] bg-[var(--gold-100)]"
            : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          accept={ALLOWED_TYPES.join(",")}
          className="absolute inset-0 cursor-pointer opacity-0"
          multiple
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
          ref={fileInputRef}
          type="file"
        />

        <div className="flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-base)]">
            <Upload aria-hidden="true" className="size-5 text-[var(--ink-tertiary)]" />
          </div>
          <div>
            <p className="text-[14px] font-medium text-[var(--ink-primary)]">
              {uploading
                ? "Uploading..."
                : "Drag and drop files, or click to browse"}
            </p>
            <p className="mt-1 text-[13px] text-[var(--ink-tertiary)]">
              Images, PDFs, videos, documents — up to 500 MB each
            </p>
          </div>
        </div>
      </div>

      {/* Deliverables list */}
      {items.length === 0 ? (
        <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-surface)]">
            <Upload aria-hidden="true" className="size-5 text-[var(--ink-tertiary)]" />
          </div>
          <p className="font-display text-xl font-medium text-[var(--ink-primary)]">
            No deliverables yet
          </p>
          <p className="text-[14px] text-[var(--ink-tertiary)]">
            Upload the first deliverable for this project.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((d) => {
            const Icon = getFileIcon(d.fileType);
            return (
              <div
                className="rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-base)] p-4 shadow-[var(--shadow-sm)] transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-[var(--border-subtle)] hover:shadow-[var(--shadow-md)]"
                key={d.id}
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--bg-elevated)]">
                    <Icon aria-hidden="true" className="size-5 text-[var(--ink-tertiary)]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[14px] font-medium text-[var(--ink-primary)]">
                        {d.title}
                      </p>
                      <span className="shrink-0 font-mono text-[12px] text-[var(--gold-mid)]">
                        v{d.version}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      <span className="text-[12px] text-[var(--ink-tertiary)]">
                        {d.fileName}
                      </span>
                      <span className="text-[12px] text-[var(--ink-tertiary)]">
                        {formatFileSize(d.fileSize)}
                      </span>
                      <Badge variant={statusBadgeVariant[d.status] ?? "draft"}>
                        {statusLabels[d.status] ?? d.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      title="Download"
                      variant="ghost"
                    >
                      <Download aria-hidden="true" className="size-4" />
                      <span className="sr-only">Download</span>
                    </Button>

                    {d.status === "DRAFT" && (
                      <Button
                        onClick={() => handleRequestApproval(d.id)}
                        size="icon"
                        title="Request approval"
                        variant="ghost"
                      >
                        <Send aria-hidden="true" className="size-4" />
                        <span className="sr-only">Request approval</span>
                      </Button>
                    )}

                    <Button
                      onClick={() => setDeleteConfirm(d.id)}
                      size="icon"
                      title="Delete"
                      variant="ghost"
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>

                <div className="mt-4 border-t border-[var(--border-default)] pt-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--ink-tertiary)]">
                    Version history
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Array.from({ length: d.version }).map((_, index) => {
                      const version = d.version - index;
                      return (
                        <span
                          className="inline-flex items-center gap-1 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-sunken)] px-2 py-1 font-mono text-[11px] text-[var(--ink-tertiary)]"
                          key={version}
                        >
                          v{version}
                          {version === d.version ? " current" : ""}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      <Dialog onOpenChange={() => setDeleteConfirm(null)} open={Boolean(deleteConfirm)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete deliverable</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The file will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDeleteConfirm(null)} size="md" variant="secondary">
              Cancel
            </Button>
            <Button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              size="md"
              variant="destructive"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
