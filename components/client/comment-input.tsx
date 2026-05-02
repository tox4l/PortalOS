"use client";

import { useState } from "react";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import { toast } from "sonner";
import { createClientCommentAction } from "@/actions/comments";

type CommentInputProps = {
  projectId: string;
  clientSlug: string;
};

export function CommentInput({ clientSlug, projectId }: CommentInputProps) {
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setPending(true);
    const result = await createClientCommentAction({
      body: body.trim(),
      clientSlug,
      projectId
    });
    setPending(false);
    if (!result.success) {
      toast.error("Something went wrong", { description: result.error ?? "Comment could not be sent." });
      return;
    }

    setBody("");
    toast.success("Comment sent");
  };

  return (
    <form className="flex items-start gap-4" onSubmit={handleSubmit}>
      <div className="flex size-11 shrink-0 items-center justify-center rounded-[10px] border border-[var(--border-gold-dim)] bg-[var(--gold-wash)] font-sans text-[13px] font-semibold text-[var(--gold-core)]">
        IC
      </div>
      <div className="relative flex-1">
        <textarea
          className="min-h-[56px] w-full resize-none rounded-[10px] border border-[var(--border-hairline)] bg-[var(--bg-base)] px-4 py-3.5 pr-12 text-[15px] leading-6 text-[var(--ink-primary)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--border-gold)] focus:bg-[var(--bg-surface)] focus:shadow-[var(--glow-gold-xs)] transition-[border-color,box-shadow,background-color] duration-[200ms] ease-[var(--ease-out)]"
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Write a message..."
          rows={1}
          value={body}
        />
        <button
          aria-label="Send message"
          className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-[8px] text-[var(--ink-tertiary)] transition-all duration-[180ms] ease-[var(--ease-out)] hover:bg-[var(--gold-dim)] hover:text-[var(--gold-core)]"
          disabled={pending || !body.trim()}
          type="submit"
        >
          <PaperPlaneTilt aria-hidden="true" className="size-4" />
        </button>
      </div>
    </form>
  );
}
