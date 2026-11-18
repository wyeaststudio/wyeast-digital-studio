'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState, type FocusEvent } from 'react';
import { cn } from '@/lib/utils';
import { isCurrentPath, itemIsCurrent } from './is-current-path';
import type { NavItem } from './shell-props';
import { SiteLink } from './site-link';

export const navLinkClass =
  'inline-flex h-11 items-center gap-1 rounded-lg px-3 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[current]:font-bold aria-expanded:bg-muted';

const subLinkClass =
  'flex min-h-11 items-center rounded-md px-3 text-sm text-popover-foreground outline-none hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-[current=page]:font-bold';

/** WAI-ARIA disclosure navigation: a button toggles a plain list of links (SHELL-R6). */
function Submenu({ item, currentPath }: { item: NavItem; currentPath: string }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const rootRef = useRef<HTMLLIElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const onBlur = (event: FocusEvent<HTMLLIElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  };

  return (
    <li
      ref={rootRef}
      className="relative"
      onBlur={onBlur}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          setOpen(false);
          buttonRef.current?.focus();
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        aria-current={itemIsCurrent(item, currentPath) ? 'true' : undefined}
        onClick={() => setOpen((value) => !value)}
        className={navLinkClass}
      >
        {item.label}
        <ChevronDown aria-hidden="true" className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      <ul
        id={listId}
        hidden={!open}
        className="absolute top-full left-1/2 z-10 mt-2 grid w-72 -translate-x-1/2 gap-1 rounded-lg bg-popover p-1 text-popover-foreground shadow ring-1 ring-border"
      >
        {item.href && (
          <li>
            <SiteLink
              href={item.href}
              aria-current={currentPath === item.href ? 'page' : undefined}
              onClick={() => setOpen(false)}
              className={subLinkClass}
            >
              {item.label} overview
            </SiteLink>
          </li>
        )}
        {item.children.map((child) => (
          <li key={child.key}>
            <SiteLink
              href={child.href}
              aria-current={isCurrentPath(child.href, currentPath) ? 'page' : undefined}
              onClick={() => setOpen(false)}
              className={subLinkClass}
            >
              {child.label}
            </SiteLink>
          </li>
        ))}
      </ul>
    </li>
  );
}

export interface DesktopNavProps {
  items: NavItem[];
  currentPath: string;
  className?: string;
}

export function DesktopNav({ items, currentPath, className }: DesktopNavProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Main" className={className}>
      <ul className="flex items-center gap-1">
        {items.map((item) =>
          item.children.length > 0 ? (
            <Submenu key={item.key} item={item} currentPath={currentPath} />
          ) : (
            <li key={item.key}>
              <SiteLink
                href={item.href!}
                aria-current={isCurrentPath(item.href, currentPath) ? 'page' : undefined}
                className={navLinkClass}
              >
                {item.label}
              </SiteLink>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}
