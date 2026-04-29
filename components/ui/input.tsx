import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    className={cn(
      "min-h-11 w-full rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-sunken)] px-4 text-[15px] text-[var(--ink-primary)] transition-[border-color,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--border-gold)] focus:shadow-[0_0_0_3px_rgba(212,175,55,0.12)] disabled:cursor-not-allowed disabled:opacity-[0.35]",
      className
    )}
    ref={ref}
    {...props}
  />
));

Input.displayName = "Input";

export { Input };
