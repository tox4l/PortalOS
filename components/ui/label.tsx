import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    className={cn(
      "block text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--ink-tertiary)]",
      className
    )}
    ref={ref}
    {...props}
  />
));

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
