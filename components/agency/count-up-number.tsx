"use client";

import { useEffect, useMemo, useState } from "react";

type CountUpNumberProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  compact?: boolean;
  className?: string;
};

export function CountUpNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  compact = false,
  className
}: CountUpNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const duration = 750;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(value * eased);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const formatted = useMemo(() => {
    if (compact) {
      return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals
      }).format(displayValue);
    }

    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals
    }).format(displayValue);
  }, [compact, decimals, displayValue]);

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
