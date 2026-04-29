import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatRelativeDate(date: Date): string {
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diffInDays = Math.round((date.getTime() - Date.now()) / 86_400_000);
  return formatter.format(diffInDays, "day");
}
