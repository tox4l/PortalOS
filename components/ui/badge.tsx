import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full border px-2.5 py-0.5 font-sans text-[0.6875rem] font-medium leading-[1.5] tracking-[0.05em] uppercase",
  {
    variants: {
      variant: {
        active: "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success-text)]",
        review: "border-[var(--warning-border)] bg-[var(--warning-bg)] text-[var(--warning-text)]",
        draft: "border-[var(--border-hairline)] bg-[var(--neutral-bg)] text-[var(--ink-tertiary)]",
        approved: "border-[var(--border-gold-dim)] bg-[var(--gold-dim)] text-[var(--gold-core)]",
        overdue: "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)]",
        archived: "border-[var(--border-hairline)] bg-transparent text-[var(--ink-tertiary)]"
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
