import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface StatusPageProps {
  title: string;
  children: ReactNode;
  actions: ReactNode;
  className?: string;
}

/** Shared layout for the 404 and error pages. Top padding clears the floating header. */
export function StatusPage({ title, children, actions, className }: StatusPageProps) {
  return (
    <div className={cn('mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 pt-36 pb-24 text-center', className)}>
      <h1 className="text-4xl font-bold">{title}</h1>
      <div className="space-y-3 text-lg text-muted-foreground">{children}</div>
      <div className="flex flex-wrap justify-center gap-3">{actions}</div>
    </div>
  );
}
