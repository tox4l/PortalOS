"use client";

import { useState, useRef, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

type AiBriefModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  clientName: string;
  onContentGenerated: (content: string) => void;
};

export function AiBriefModal({
  open,
  onOpenChange,
  projectName,
  clientName,
  onContentGenerated
}: AiBriefModalProps) {
  const [goals, setGoals] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("");
  const [keyMessages, setKeyMessages] = useState("");
  const [generating, setGenerating] = useState(false);
  const [streamed, setStreamed] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setStreamed("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/generate-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          clientName: clientName || undefined,
          goals: goals || undefined,
          audience: audience || undefined,
          tone: tone || undefined,
          keyMessages: keyMessages || undefined
        }),
        signal: controller.signal
      });

      if (!res.ok || !res.body) {
        throw new Error("Failed to generate");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        full += text;
        setStreamed(full);
      }

      onContentGenerated(full);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setStreamed("Something went wrong. Please try again.");
      }
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  }, [projectName, clientName, goals, audience, tone, keyMessages, onContentGenerated]);

  const handleClose = () => {
    if (generating) {
      abortRef.current?.abort();
    }
    setStreamed("");
    setGenerating(false);
    onOpenChange(false);
  };

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Generate brief with AI</DialogTitle>
          <DialogDescription>
            Provide context and GPT-4o will write a detailed creative brief for{" "}
            <span className="font-medium text-[var(--ink-primary)]">{projectName}</span>
            {clientName ? ` (${clientName})` : ""}.
          </DialogDescription>
        </DialogHeader>

        {streamed ? (
          <div className="mt-4 max-h-[340px] overflow-y-auto rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
            <div className="prose prose-sm text-[14px] leading-relaxed whitespace-pre-wrap text-[var(--ink-secondary)]">
              {streamed}
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ai-goals">Project goals</Label>
              <Input
                id="ai-goals"
                onChange={(e) => setGoals(e.target.value)}
                placeholder="e.g. Rebrand the company for a younger demographic"
                value={goals}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ai-audience">Target audience</Label>
              <Input
                id="ai-audience"
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Gen Z professionals aged 22-35"
                value={audience}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ai-tone">Tone</Label>
                <Input
                  id="ai-tone"
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="e.g. Bold, irreverent"
                  value={tone}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ai-messages">Key messages</Label>
                <Input
                  id="ai-messages"
                  onChange={(e) => setKeyMessages(e.target.value)}
                  placeholder="e.g. Sustainability matters"
                  value={keyMessages}
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            disabled={generating}
            onClick={handleClose}
            size="md"
            type="button"
            variant="secondary"
          >
            {streamed ? "Done" : "Cancel"}
          </Button>

          {!streamed && (
            <Button disabled={generating} onClick={handleGenerate} size="md" type="button">
              {generating ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Writing
                </>
              ) : (
                <>
                  <Sparkles aria-hidden="true" className="size-4" />
                  Generate brief
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
