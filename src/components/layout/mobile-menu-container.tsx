'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ThemeSwitchContainer } from '@/components/theme/theme-switch-container';
import { MobileMenu, type MobileMenuProps } from './mobile-menu';

type MobileMenuContainerProps = Pick<MobileMenuProps, 'items' | 'cta' | 'className'>;

export function MobileMenuContainer(props: MobileMenuContainerProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);

  // Close the sheet after navigation (e.g. browser back) without an effect.
  if (open && openedAt !== pathname) {
    setOpen(false);
    setOpenedAt(pathname);
  }

  return (
    <MobileMenu
      {...props}
      currentPath={pathname}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setOpenedAt(pathname);
      }}
      themeSwitch={<ThemeSwitchContainer />}
    />
  );
}
