import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full border px-[10px] py-[3px] text-[11px] font-medium leading-[1.4] tracking-[0.05em] uppercase",
  {
    variants: {
      variant: {
        active: "border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]",
        review:
          "border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.12)] text-[var(--gold-600)]",
        draft:
          "border-[var(--border-default)] bg-[rgba(255,255,255,0.04)] text-[var(--ink-tertiary)]",
        approved:
          "border-[var(--border-gold)] bg-[rgba(212,175,55,0.10)] text-[var(--gold-500)] shadow-[var(--shadow-gold-sm)]",
        overdue: "border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]",
        archived:
          "border-[var(--border-default)] bg-transparent text-[var(--ink-ghost)]"
      }
    },
    defaultVariants: {
      variant: "draft"
    }
  }
);

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
