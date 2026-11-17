'use client';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { isCurrentPath, itemIsCurrent } from './is-current-path';
import type { NavItem } from './shell-props';
import { SiteLink } from './site-link';

export const navLinkClass =
  'inline-flex h-11 items-center rounded-lg px-3 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[current]:font-bold';

const subLinkClass =
  'flex min-h-11 items-center rounded-md px-3 text-sm text-popover-foreground outline-none hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-[current=page]:font-bold';

export interface DesktopNavProps {
  items: NavItem[];
  currentPath: string;
  className?: string;
}

export function DesktopNav({ items, currentPath, className }: DesktopNavProps) {
  if (items.length === 0) return null;

  return (
    <NavigationMenu aria-label="Main" align="center" className={cn('flex-none', className)}>
      <NavigationMenuList className="gap-1">
        {items.map((item) => (
          <NavigationMenuItem key={item.key}>
            {item.children.length > 0 ? (
              <>
                <NavigationMenuTrigger
                  aria-current={itemIsCurrent(item, currentPath) ? 'true' : undefined}
                  className={cn(navLinkClass, 'bg-transparent data-popup-open:bg-muted')}
                >
                  {item.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-64 gap-1 p-1">
                    {item.href && (
                      <li>
                        <NavigationMenuLink
                          render={<SiteLink href={item.href} />}
                          active={currentPath === item.href}
                          className={subLinkClass}
                        >
                          {item.label} overview
                        </NavigationMenuLink>
                      </li>
                    )}
                    {item.children.map((child) => (
                      <li key={child.key}>
                        <NavigationMenuLink
                          render={<SiteLink href={child.href} />}
                          active={isCurrentPath(child.href, currentPath)}
                          className={subLinkClass}
                        >
                          {child.label}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink
                render={<SiteLink href={item.href!} />}
                active={isCurrentPath(item.href, currentPath)}
                className={navLinkClass}
              >
                {item.label}
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
