"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { CaretDown, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

export function Select({
  value,
  defaultValue,
  onValueChange,
  options,
  placeholder = "Select an option",
  name,
  id,
  disabled,
  required,
  className
}: SelectProps) {
  return (
    <SelectPrimitive.Root
      defaultValue={defaultValue}
      disabled={disabled}
      name={name}
      onValueChange={onValueChange}
      required={required}
      value={value}
    >
      <SelectPrimitive.Trigger
        className={cn(
          "flex min-h-11 w-full items-center justify-between gap-3 rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-sunken)] px-4 text-left text-[15px] text-[var(--ink-primary)] transition-[border-color,box-shadow,background-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] placeholder:text-[var(--ink-tertiary)] focus:border-[var(--border-gold-hot)] focus:shadow-[var(--glow-gold-xs)] disabled:cursor-not-allowed disabled:opacity-[0.35]",
          className
        )}
        id={id}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <CaretDown aria-hidden="true" className="size-4 shrink-0 text-[var(--ink-tertiary)]" weight="bold" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="z-50 overflow-hidden rounded-[8px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-1 shadow-[var(--shadow-lg)]"
          position="popper"
          sideOffset={6}
        >
          <SelectPrimitive.Viewport className="min-w-[var(--radix-select-trigger-width)]">
            {options.map((option) => (
              <SelectPrimitive.Item
                className="relative flex min-h-9 cursor-default select-none items-center rounded-[6px] px-2 pr-8 text-[14px] text-[var(--ink-secondary)] outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-[var(--neutral-bg)] data-[highlighted]:text-[var(--ink-primary)] data-[state=checked]:bg-[var(--gold-dim)] data-[state=checked]:text-[var(--gold-mid)]"
                disabled={option.disabled}
                key={option.value}
                value={option.value}
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2 inline-flex items-center justify-center">
                  <Check aria-hidden="true" className="size-4" weight="bold" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
