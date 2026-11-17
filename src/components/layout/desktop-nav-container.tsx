'use client';

import { usePathname } from 'next/navigation';
import { DesktopNav, type DesktopNavProps } from './desktop-nav';

export function DesktopNavContainer(props: Omit<DesktopNavProps, 'currentPath'>) {
  return <DesktopNav {...props} currentPath={usePathname()} />;
}
