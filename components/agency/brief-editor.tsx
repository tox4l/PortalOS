"use client";

import { useState, useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  Sparkles,
  Strikethrough,
  Table as TableIcon,
  Underline as UnderlineIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AiBriefModal } from "@/components/agency/ai-brief-modal";
import { saveBriefAction, sendBriefAction } from "@/actions/briefs";
import { cn } from "@/lib/utils";

type BriefEditorProps = {
  projectId: string;
  projectName: string;
  clientName: string;
  brief: {
    id: string;
    title: string;
    content: Record<string, unknown>;
    status: string;
    generatedByAi: boolean;
  } | null;
};

const statusBadgeVariant: Record<string, "active" | "review" | "draft" | undefined> = {
  DRAFT: "draft",
  SENT: "review",
  APPROVED: "active"
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent to client",
  APPROVED: "Approved"
};

type ToolbarButtonProps = {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
};

function ToolbarButton({ active, onClick, children, title }: ToolbarButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-[8px] text-[var(--ink-tertiary)] transition-colors duration-150",
        active
          ? "bg-[var(--gold-100)] text-[var(--gold-400)]"
          : "hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--ink-secondary)]"
      )}
      onClick={onClick}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}

export function BriefEditor({ projectId, projectName, clientName, brief }: BriefEditorProps) {
  const [title, setTitle] = useState(brief?.title ?? "");
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(brief?.status ?? "DRAFT");
  const [briefId, setBriefId] = useState<string | null>(brief?.id ?? null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] }
      }),
      Placeholder.configure({
        placeholder: "Write the creative brief here. Include background, objectives, audience, key messages, deliverables, and timeline. Or generate a first draft with AI."
      }),
      Highlight,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader
    ],
    content: brief?.content as never ?? null,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[320px] px-6 py-5 text-[15px] leading-relaxed text-[var(--ink-primary)] focus:outline-none [&_h1]:font-display [&_h1]:text-3xl [&_h1]:font-normal [&_h1]:tracking-[-0.01em] [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-normal [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-medium [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--gold-300)] [&_blockquote]:pl-4 [&_blockquote]:text-[var(--ink-secondary)] [&_blockquote]:italic [&_table]:w-full [&_th]:border [&_th]:border-[var(--border-default)] [&_th]:bg-[var(--bg-sunken)] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-[12px] [&_th]:font-medium [&_td]:border [&_td]:border-[var(--border-default)] [&_td]:px-3 [&_td]:py-2 [&_td]:text-[14px]"
      }
    }
  });

  useEffect(() => {
    if (editor && brief?.content) {
      editor.commands.setContent(brief.content as never);
    }
  }, [editor, brief?.content]);

  const handleAiContent = useCallback(
    (content: string) => {
      if (editor) {
        editor.commands.setContent(
          content
            .split("\n\n")
            .map((block) => {
              if (block.startsWith("# ")) return block;
              if (block.startsWith("## ")) return block;
              if (block.startsWith("### ")) return block;
              if (block.startsWith("- ") || block.startsWith("* ")) return block;
              return `<p>${block.replace(/\n/g, "<br/>")}</p>`;
            })
            .join("")
        );
      }
      setAiModalOpen(false);
    },
    [editor]
  );

  const handleSave = useCallback(async () => {
    if (!editor) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("projectId", projectId);
      formData.set("title", title || projectName);
      formData.set("content", JSON.stringify(editor.getJSON()));

      const result = await saveBriefAction({ success: false }, formData);
      if (result.success && result.data) {
        setBriefId(result.data.briefId);
      }
    } finally {
      setSaving(false);
    }
  }, [editor, projectId, projectName, title]);

  const handleSendToClient = useCallback(async () => {
    if (!briefId) {
      await handleSave();
    }
    if (!briefId) return;

    const result = await sendBriefAction(briefId);
    if (result.success) {
      setStatus("SENT");
    }
  }, [briefId, handleSave]);

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Brief header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <input
            className="min-w-[200px] border-b border-transparent bg-transparent font-display text-2xl font-normal leading-tight text-[var(--ink-primary)] transition-colors hover:border-[var(--border-default)] focus:border-[var(--border-gold)] focus:outline-none"
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief title"
            value={title}
          />
          <Badge variant={statusBadgeVariant[status] ?? "draft"}>
            {statusLabels[status] ?? status}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            disabled={saving}
            onClick={handleSave}
            size="sm"
            variant="secondary"
          >
            {saving ? "Saving..." : "Save draft"}
          </Button>
          <Button
            disabled={status === "SENT" || status === "APPROVED"}
            onClick={() => setAiModalOpen(true)}
            size="sm"
            variant="secondary"
          >
            <Sparkles aria-hidden="true" className="size-3.5" />
            AI
          </Button>
          <Button
            disabled={status === "APPROVED"}
            onClick={handleSendToClient}
            size="sm"
          >
            {status === "SENT" ? "Resend" : "Send to client"}
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-1.5">
        <ToolbarButton
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <Heading1 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          <Heading3 className="size-4" />
        </ToolbarButton>

        <span className="mx-1 block h-5 w-px bg-[var(--border-default)]" />

        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <UnderlineIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          title="Highlight"
        >
          <span className="inline-flex size-4 items-center justify-center rounded-[3px] bg-[var(--gold-100)] text-[11px] font-medium text-[var(--gold-400)]">
            H
          </span>
        </ToolbarButton>

        <span className="mx-1 block h-5 w-px bg-[var(--border-default)]" />

        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        >
          <Quote className="size-4" />
        </ToolbarButton>

        <span className="mx-1 block h-5 w-px bg-[var(--border-default)]" />

        <ToolbarButton
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          title="Insert table"
        >
          <TableIcon className="size-4" />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div className="rounded-[10px] border border-[var(--border-default)] border-t-[rgba(255,255,255,0.10)] bg-[var(--bg-base)] shadow-[var(--shadow-sm)]">
        <EditorContent editor={editor} />
      </div>

      <AiBriefModal
        clientName={clientName}
        onContentGenerated={handleAiContent}
        onOpenChange={setAiModalOpen}
        open={aiModalOpen}
        projectName={projectName}
      />
    </div>
  );
}
