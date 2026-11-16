'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ResolvedTheme = 'light' | 'dark';

export interface ThemeToggleProps {
  resolvedTheme?: ResolvedTheme;
  onToggle: () => void;
}

export function ThemeToggle({ resolvedTheme, onToggle }: ThemeToggleProps) {
  // The theme is unknown until hydration; reserve the same space to avoid layout shift.
  if (!resolvedTheme) {
    return <span aria-hidden="true" data-testid="theme-toggle-placeholder" className="inline-block size-11" />;
  }

  const nextTheme: ResolvedTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
  const Icon = nextTheme === 'dark' ? Moon : Sun;

  return (
    <Button
      variant="ghost"
      onClick={onToggle}
      aria-label={`Switch to ${nextTheme} theme`}
      className="size-11 [&_svg:not([class*='size-'])]:size-5"
    >
      <Icon aria-hidden="true" />
    </Button>
  );
}
