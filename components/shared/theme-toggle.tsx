"use client";

import { Moon, Sun, Planet } from "@phosphor-icons/react";
import { useTheme } from "@/components/shared/theme-provider";
import type { Theme } from "@/components/shared/theme-provider";

const iconMap: Record<Theme, typeof Sun> = {
  portalos: Planet,
  light: Sun,
  dark: Moon,
};

const labelMap: Record<Theme, string> = {
  portalos: "PortalOS theme",
  light: "Light theme",
  dark: "Dark theme",
};

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();
  const Icon = iconMap[theme];

  return (
    <button
      aria-label={labelMap[theme]}
      className="inline-flex size-9 items-center justify-center rounded-[4px] text-[var(--ink-tertiary)] transition-colors hover:bg-[var(--neutral-bg)] hover:text-[var(--ink-primary)]"
      onClick={cycleTheme}
      title={labelMap[theme]}
      type="button"
    >
      <Icon aria-hidden="true" className="size-5" weight="regular" />
    </button>
  );
}
