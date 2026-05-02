"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ChatCircleText, Eye, Lock, ThumbsUp } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createCommentAction } from "@/actions/comments";
import { useAblyChannel } from "@/hooks/use-ably";
import { cn } from "@/lib/utils";

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
  parentId?: string | null;
};

type CommentsViewProps = {
  projectId: string;
  comments: CommentData[];
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

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function CommentsView({ projectId, comments: initialComments }: CommentsViewProps) {
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [showInternalOnly, setShowInternalOnly] = useState(false);
  const [input, setInput] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [reactions, setReactions] = useState<Record<string, { approve: number; seen: number }>>({});
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelName = `project:${projectId}`;

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  useAblyChannel(channelName, "comment.created", useCallback((message) => {
    const data = message.data as CommentData;
    if (data) {
      setComments((prev) => [data, ...prev]);
    }
  }, []));

  const handleSubmit = useCallback(async () => {
    if (!input.trim()) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.set("body", input.trim());
    formData.set("projectId", projectId);
    formData.set("isInternal", String(isInternal));

    const result = await createCommentAction({ success: false }, formData);

    if (result.success) {
      setInput("");
    }

    setSubmitting(false);
  }, [input, isInternal, projectId]);

  const filteredComments = showInternalOnly
    ? comments.filter((c) => c.isInternal)
    : comments;

  const topLevelComments = filteredComments.filter((comment) => !comment.parentId);
  const repliesByParent = filteredComments.reduce<Record<string, CommentData[]>>((map, comment) => {
    if (!comment.parentId) {
      return map;
    }

    map[comment.parentId] = [...(map[comment.parentId] ?? []), comment];
    return map;
  }, {});

  const bumpReaction = useCallback((commentId: string, type: "approve" | "seen") => {
    setReactions((current) => {
      const existing = current[commentId] ?? { approve: 0, seen: 0 };
      return {
        ...current,
        [commentId]: {
          ...existing,
          [type]: existing[type] + 1
        }
      };
    });
  }, []);

  if (comments.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-surface)]">
          <ChatCircleText aria-hidden="true" className="size-5 text-[var(--ink-tertiary)]" />
        </div>
        <p className="font-display text-xl font-medium text-[var(--ink-primary)]">
          No comments yet
        </p>
        <p className="text-[14px] text-[var(--ink-tertiary)]">
          Start the conversation about this project.
        </p>

        <div className="mt-4 w-full max-w-lg">
          <div className="flex gap-2">
            <input
              className="min-h-11 flex-1 rounded-[8px] border border-[var(--border-hairline)] bg-[var(--bg-sunken)] px-4 font-sans text-[15px] text-[var(--ink-primary)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--border-gold)] focus:shadow-[var(--glow-gold-xs)]"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Write a comment..."
              value={input}
            />
            <Button disabled={submitting || !input.trim()} onClick={handleSubmit} size="sm">
              Post
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          className={cn(
            "inline-flex items-center gap-2 rounded-[8px] border px-3 py-1.5 text-[13px] font-medium transition-colors duration-150",
            showInternalOnly
              ? "border-[var(--border-gold)] bg-[var(--gold-100)] text-[var(--gold-400)]"
              : "border-[var(--border-hairline)] text-[var(--ink-secondary)] hover:bg-[var(--gold-wash)]"
          )}
          onClick={() => setShowInternalOnly((v) => !v)}
          type="button"
        >
          <Lock aria-hidden="true" className="size-3.5" />
          {showInternalOnly ? "Internal only" : "All comments"}
        </button>
      </div>

      <div className="space-y-3">
        {topLevelComments.map((comment) => {
          const author = comment.authorUser ?? comment.authorClientUser;
          const isTeam = Boolean(comment.authorUser);
          const reactionCounts = reactions[comment.id] ?? { approve: 0, seen: 0 };
          const replies = repliesByParent[comment.id] ?? [];

          return (
            <div
              className={cn(
                "rounded-[10px] border p-4",
                comment.isInternal
                  ? "border-[var(--border-gold)] bg-[var(--gold-100)]"
                  : "border-[var(--border-default)] bg-[var(--bg-base)] shadow-[var(--shadow-sm)]"
              )}
              key={comment.id}
            >
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-[var(--bg-elevated)] text-[11px] font-medium text-[var(--ink-secondary)]">
                  {getInitials(author?.name ?? null)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-[var(--ink-primary)]">
                      {author?.name ?? "Unknown"}
                    </span>
                    {isTeam && (
                      <span className="text-[11px] font-medium text-[var(--ink-tertiary)]">
                        Team
                      </span>
                    )}
                    {comment.isInternal && (
                      <Badge className="ml-auto" variant="review">Internal</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-[14px] leading-relaxed whitespace-pre-wrap text-[var(--ink-secondary)]">
                    {comment.body}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <p className="mr-2 text-[11px] uppercase tracking-[0.05em] text-[var(--ink-tertiary)]">
                      {formatTimeAgo(comment.createdAt)}
                    </p>
                    <button
                      className="inline-flex items-center gap-1 rounded-[6px] border border-[var(--border-default)] px-2 py-1 text-[11px] text-[var(--ink-tertiary)] transition-colors hover:border-[var(--border-gold-dim)] hover:text-[var(--gold-core)]"
                      onClick={() => bumpReaction(comment.id, "approve")}
                      type="button"
                    >
                      <ThumbsUp aria-hidden="true" className="size-3.5" />
                      {reactionCounts.approve}
                    </button>
                    <button
                      className="inline-flex items-center gap-1 rounded-[6px] border border-[var(--border-default)] px-2 py-1 text-[11px] text-[var(--ink-tertiary)] transition-colors hover:border-[var(--border-gold-dim)] hover:text-[var(--gold-core)]"
                      onClick={() => bumpReaction(comment.id, "seen")}
                      type="button"
                    >
                      <Eye aria-hidden="true" className="size-3.5" />
                      {reactionCounts.seen}
                    </button>
                  </div>

                  {replies.length > 0 && (
                    <div className="mt-4 space-y-3 border-l border-[var(--border-default)] pl-4">
                      {replies.map((reply) => {
                        const replyAuthor = reply.authorUser ?? reply.authorClientUser;
                        return (
                          <div className="rounded-[8px] bg-[var(--bg-sunken)] p-3" key={reply.id}>
                            <p className="text-[13px] font-medium text-[var(--ink-primary)]">
                              {replyAuthor?.name ?? "Unknown"}
                            </p>
                            <p className="mt-1 whitespace-pre-wrap text-[13px] leading-6 text-[var(--ink-secondary)]">
                              {reply.body}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-2" ref={bottomRef}>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--bg-elevated)] text-[13px] font-medium text-[var(--ink-secondary)]">
          SK
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <textarea
            className="min-h-[60px] w-full rounded-[8px] border border-[var(--border-hairline)] bg-[var(--bg-sunken)] px-4 py-3 font-sans text-[15px] text-[var(--ink-primary)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--border-gold)] focus:shadow-[var(--glow-gold-xs)]"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Write a comment... (Enter to send, Shift+Enter for new line)"
            rows={2}
            value={input}
          />
          <div className="flex items-center justify-between">
            <button
              className={cn(
                "inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors",
                isInternal
                  ? "text-[var(--gold-400)]"
                  : "text-[var(--ink-tertiary)] hover:text-[var(--ink-secondary)]"
              )}
              onClick={() => setIsInternal((v) => !v)}
              type="button"
            >
              <Lock aria-hidden="true" className="size-3" />
              Internal
            </button>
            <Button disabled={submitting || !input.trim()} onClick={handleSubmit} size="sm">
              Post comment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
