"use client";

import { useState } from "react";
import { Send } from "lucide-react";
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
    <form className="flex items-start gap-3" onSubmit={handleSubmit}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--bg-elevated)] text-[12px] font-medium text-[var(--ink-primary)]">
        IC
      </div>
      <div className="relative flex-1">
        <textarea
          className="min-h-[52px] w-full resize-none rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-sunken)] px-4 py-3 pr-12 text-[14px] leading-6 text-[var(--ink-primary)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--border-gold)] focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)]"
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
          className="absolute bottom-3 right-3 flex size-8 items-center justify-center rounded-[8px] text-[var(--ink-tertiary)] transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--gold-400)]"
          disabled={pending || !body.trim()}
          type="submit"
        >
          <Send aria-hidden="true" className="size-4" />
        </button>
      </div>
    </form>
  );
}
