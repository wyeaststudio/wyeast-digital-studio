import type { NavItem } from './shell-props';

function pathOf(href: string): string | null {
  if (!href.startsWith('/')) return null;
  const path = href.split(/[?#]/)[0].replace(/\/+$/, '');
  return path || '/';
}

/** True when `href` is the current page or a parent section of it. */
export function isCurrentPath(href: string | null, currentPath: string): boolean {
  const path = href ? pathOf(href) : null;
  if (!path) return false;
  const current = currentPath.replace(/\/+$/, '') || '/';
  if (path === '/') return current === '/';
  return current === path || current.startsWith(`${path}/`);
}

/** A nav item is current when its own link or any child link is. */
export function itemIsCurrent(item: NavItem, currentPath: string): boolean {
  return isCurrentPath(item.href, currentPath) || item.children.some((child) => isCurrentPath(child.href, currentPath));
}
