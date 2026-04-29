"use client";

import { useState } from "react";
import { CheckCircle, SealWarning, XCircle } from "@phosphor-icons/react";
import { toast } from "sonner";
import { approveClientDeliverableAction, requestClientChangesAction } from "@/actions/deliverables";
import { Button } from "@/components/ui/button";

type ApprovalModalProps = {
  action: "approve" | "reject";
  clientSlug: string;
  deliverableId: string;
  deliverableTitle: string;
  onClose: () => void;
  onResolved?: (status: "APPROVED" | "REJECTED") => void;
};

export function ApprovalModal({
  action,
  clientSlug,
  deliverableId,
  deliverableTitle,
  onClose,
  onResolved
}: ApprovalModalProps) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isRejecting = action === "reject";
  const canSubmit = !pending && (!isRejecting || comment.trim().length >= 3);

  const handleConfirm = async () => {
    if (!canSubmit) return;

    setPending(true);
    setError(null);

    const result = isRejecting
      ? await requestClientChangesAction({ deliverableId, clientSlug, comment })
      : await approveClientDeliverableAction({ deliverableId, clientSlug });

    setPending(false);

    if (!result.success) {
      const message = result.error ?? "Something went wrong.";
      setError(message);
      toast.error("Something went wrong", { description: message });
      return;
    }

    setSubmitted(true);

    if (isRejecting) {
      onResolved?.("REJECTED");
      toast.success("Feedback sent", { description: "Changes requested." });
    } else {
      onResolved?.("APPROVED");
      toast.success("Approved", { description: "Agency notified." });
    }

    window.setTimeout(() => onClose(), 850);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-overlay)] p-4 backdrop-blur-[8px]">
      <div className="w-full max-w-[480px] rounded-[10px] border border-[var(--border-gold-dim)] border-t-[rgba(255,255,255,0.12)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-xl)]">
        {submitted ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-[10px] border border-[var(--border-gold)] bg-[var(--gold-dim)] shadow-[var(--inset-gold)]">
              <CheckCircle aria-hidden="true" className="size-8 text-[var(--gold-core)]" weight="fill" />
            </div>
            <p className="mt-5 font-display text-[30px] font-normal text-[var(--ink-primary)]">
              {isRejecting ? "Feedback sent" : "Approved"}
            </p>
            <p className="mt-2 max-w-[360px] text-[14px] leading-6 text-[var(--ink-secondary)]">
              {isRejecting
                ? "Your revision notes have been sent to the agency."
                : "The agency team has been notified and the approval is recorded."}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-base)]">
                {isRejecting ? (
                  <XCircle aria-hidden="true" className="size-6 text-[var(--status-danger-text)]" weight="duotone" />
                ) : (
                  <CheckCircle aria-hidden="true" className="size-6 text-[var(--gold-core)]" weight="duotone" />
                )}
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--gold-core)]">
                  {isRejecting ? "Request changes" : "Client approval"}
                </p>
                <h2 className="mt-2 font-display text-[28px] font-normal leading-tight text-[var(--ink-primary)]">
                  {isRejecting ? "Send revision notes" : "Approve deliverable"}
                </h2>
                <p className="mt-2 text-[14px] leading-6 text-[var(--ink-secondary)]">
                  {isRejecting
                    ? `Tell the agency what needs to change in "${deliverableTitle}".`
                    : `Approve "${deliverableTitle}" and notify the agency team immediately.`}
                </p>
              </div>
            </div>

            {isRejecting && (
              <div className="mt-6">
                <label
                  className="mb-2 block text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--ink-tertiary)]"
                  htmlFor="rejection-reason"
                >
                  Revision note
                </label>
                <textarea
                  className="min-h-[128px] w-full resize-none rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-sunken)] px-4 py-3 text-[14px] leading-6 text-[var(--ink-primary)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--border-gold-hot)] focus:shadow-[var(--glow-gold-xs)]"
                  id="rejection-reason"
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Describe the specific change needed..."
                  value={comment}
                />
              </div>
            )}

            {((isRejecting && comment.trim().length > 0 && comment.trim().length < 3) || error) && (
              <p className="mt-3 flex items-center gap-2 text-[12px] text-[var(--status-danger-text)]">
                <SealWarning aria-hidden="true" className="size-4" weight="fill" />
                {error ?? "Please provide a little more detail."}
              </p>
            )}

            <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button onClick={onClose} type="button" variant="ghost">
                Cancel
              </Button>
              <Button disabled={!canSubmit} onClick={handleConfirm} type="button">
                {pending ? "Sending..." : isRejecting ? "Send feedback" : "Approve"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
