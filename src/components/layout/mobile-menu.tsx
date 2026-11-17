'use client';

import { Menu, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { isCurrentPath, itemIsCurrent } from './is-current-path';
import type { NavItem, NavLink } from './shell-props';
import { SiteLink } from './site-link';

const linkClass =
  'flex min-h-11 items-center rounded-lg px-3 text-base text-popover-foreground outline-none hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-[current=page]:font-bold';

export interface MobileMenuProps {
  items: NavItem[];
  cta: NavLink | null;
  currentPath: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The theme switch, injected so this component stays presentational. */
  themeSwitch?: ReactNode;
  className?: string;
}

export function MobileMenu({ items, cta, currentPath, open, onOpenChange, themeSwitch, className }: MobileMenuProps) {
  const close = () => onOpenChange(false);
  const current = (href: string) => (isCurrentPath(href, currentPath) ? 'page' : undefined);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger
        render={<Button variant="ghost" aria-label="Open menu" className={cn('size-11', className)} />}
      >
        <Menu aria-hidden="true" className="size-6" />
      </SheetTrigger>
      <SheetContent side="right" showCloseButton={false} className="w-full gap-6 overflow-y-auto p-4 sm:max-w-sm">
        <div className="flex items-center justify-between">
          <SheetTitle className="text-lg font-bold">Menu</SheetTitle>
          <SheetClose render={<Button variant="ghost" aria-label="Close menu" className="size-11" />}>
            <X aria-hidden="true" className="size-6" />
          </SheetClose>
        </div>

        {items.length > 0 && (
          <nav aria-label="Main">
            <ul className="grid gap-1">
              {items.map((item) => (
                <li key={item.key}>
                  {item.children.length > 0 ? (
                    <>
                      {item.href ? (
                        <SiteLink href={item.href} aria-current={current(item.href)} onClick={close} className={linkClass}>
                          {item.label}
                        </SiteLink>
                      ) : (
                        <p
                          className={cn(
                            'flex min-h-11 items-center px-3 text-base text-popover-foreground',
                            itemIsCurrent(item, currentPath) && 'font-bold',
                          )}
                        >
                          {item.label}
                        </p>
                      )}
                      <ul className="ml-3 grid gap-1 border-l border-border pl-2">
                        {item.children.map((child) => (
                          <li key={child.key}>
                            <SiteLink
                              href={child.href}
                              aria-current={current(child.href)}
                              onClick={close}
                              className={cn(linkClass, 'text-sm')}
                            >
                              {child.label}
                            </SiteLink>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <SiteLink href={item.href!} aria-current={current(item.href!)} onClick={close} className={linkClass}>
                      {item.label}
                    </SiteLink>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        )}

        {cta && (
          <SiteLink
            href={cta.href}
            onClick={close}
            className={cn(buttonVariants({ variant: 'accent' }), 'h-11 w-full px-4 text-base')}
          >
            {cta.label}
          </SiteLink>
        )}

        {themeSwitch && <div className="mt-auto flex justify-center">{themeSwitch}</div>}
      </SheetContent>
    </Sheet>
  );
}
