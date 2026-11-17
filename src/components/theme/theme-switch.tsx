'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

export type ThemeChoice = 'light' | 'system' | 'dark';

const OPTIONS = [
  { value: 'light', label: 'Light theme', Icon: Sun },
  { value: 'system', label: 'System theme', Icon: Monitor },
  { value: 'dark', label: 'Dark theme', Icon: Moon },
] as const;

export interface ThemeSwitchProps {
  /** Undefined until the theme is known after hydration. */
  value?: ThemeChoice;
  onChange: (value: ThemeChoice) => void;
  className?: string;
}

export function ThemeSwitch({ value, onChange, className }: ThemeSwitchProps) {
  return (
    <ToggleGroup
      aria-label="Theme"
      value={value ? [value] : []}
      // Re-pressing the selected option would empty the group; keep the current choice instead.
      onValueChange={([next]) => next && onChange(next as ThemeChoice)}
      // Same markup before hydration so the switch reserves its space without layout shift.
      disabled={!value}
      spacing={0.5}
      className={cn('rounded-xl bg-muted p-0.5', className)}
    >
      {OPTIONS.map(({ value: option, label, Icon }) => (
        <ToggleGroupItem
          key={option}
          value={option}
          aria-label={label}
          className="size-11 rounded-lg text-foreground hover:bg-card aria-pressed:bg-background aria-pressed:shadow-sm disabled:opacity-100 [&_svg:not([class*='size-'])]:size-5"
        >
          <Icon aria-hidden="true" />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
