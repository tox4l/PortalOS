import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] text-[14px] font-medium tracking-[0.02em] transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] disabled:pointer-events-none disabled:opacity-[0.35] active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "border border-transparent bg-[var(--gold-500)] text-[#0A0A0B] shadow-[var(--shadow-gold-sm)] hover:bg-[var(--gold-600)] hover:shadow-[var(--shadow-gold-md)]",
        secondary:
          "border border-[var(--border-medium)] bg-transparent text-[var(--ink-primary)] hover:border-[var(--border-strong)] hover:bg-[rgba(255,255,255,0.04)]",
        ghost:
          "border border-transparent bg-transparent text-[var(--ink-secondary)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--ink-primary)]",
        destructive:
          "border border-[rgba(235,87,87,0.30)] bg-transparent text-[var(--status-danger-text)] hover:bg-[var(--status-danger-bg)]"
      },
      size: {
        sm: "min-h-9 px-3 text-[13px]",
        md: "min-h-11 px-4",
        lg: "min-h-12 px-6 text-[15px]",
        icon: "size-11 p-0"
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
