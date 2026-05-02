import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    className={cn(
      "min-h-10 w-full rounded-[6px] border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3.5 py-2 text-[0.875rem] text-[var(--ink-primary)] font-sans transition-[border-color,box-shadow,background-color] duration-[200ms] ease-[cubic-bezier(0.16,1,0.3,1)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--border-gold)] focus:shadow-[var(--glow-gold-xs)] focus:bg-[var(--bg-base)] disabled:cursor-not-allowed disabled:opacity-35",
      className
    )}
    ref={ref}
    {...props}
  />
));

Input.displayName = "Input";

export { Input };
