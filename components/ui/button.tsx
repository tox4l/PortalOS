import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-[10px] font-sans text-[0.8125rem] font-medium tracking-[0.01em] transition-[background-color,border-color,color,box-shadow,transform] duration-[200ms] ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:shadow-[var(--glow-gold-xs)] disabled:pointer-events-none disabled:opacity-35 active:scale-[0.985]",
  {
    variants: {
      variant: {
        primary:
          "border border-transparent bg-[var(--gold-core)] text-white shadow-[0_2px_8px_rgba(180,130,50,0.25)] hover:bg-[var(--gold-mid)] hover:shadow-[0_4px_16px_rgba(180,130,50,0.30)]",
        secondary:
          "border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--ink-primary)] shadow-[var(--shadow-xs)] hover:border-[var(--border-gold-dim)] hover:bg-[var(--gold-wash)] hover:shadow-[var(--shadow-sm)]",
        ghost:
          "border border-transparent bg-transparent text-[var(--ink-secondary)] hover:bg-[var(--neutral-bg)] hover:text-[var(--ink-primary)]",
        destructive:
          "border border-[var(--danger-border)] bg-transparent text-[var(--danger-text)] hover:bg-[var(--danger-bg)]"
      },
      size: {
        sm: "min-h-8 px-3 text-[0.75rem] rounded-[5px]",
        md: "min-h-10 px-4",
        lg: "min-h-12 px-6 text-[0.875rem] rounded-[7px]",
        icon: "size-10 p-0"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
