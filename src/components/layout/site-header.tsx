import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { ThemeSwitchContainer } from '@/components/theme/theme-switch-container';
import { cn } from '@/lib/utils';
import { BrandMark } from './brand-logo';
import { DesktopNavContainer } from './desktop-nav-container';
import { MobileMenuContainer } from './mobile-menu-container';
import type { ShellProps } from './shell-props';
import { SiteLink } from './site-link';

export type SiteHeaderProps = Pick<ShellProps, 'siteName' | 'navItems' | 'cta'>;

/** The floating pill from the Figma `navbar-header`; HeaderVisibility provides the `header` landmark. */
export function SiteHeader({ siteName, navItems, cta }: SiteHeaderProps) {
  return (
    <div className="mx-auto flex h-navbar-mobile max-w-300 items-center justify-between gap-4 rounded-2xl border border-border-accent bg-background/(--header-surface-alpha) px-3 shadow backdrop-blur-backdrop lg:h-navbar lg:px-6">
      <Link
        href="/"
        aria-label={`${siteName}, home`}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-primary outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <BrandMark className="h-9 w-auto" />
      </Link>

      <div className="hidden items-center gap-4 lg:flex">
        <DesktopNavContainer items={navItems} />
        {cta && (
          <SiteLink href={cta.href} className={cn(buttonVariants({ variant: 'accent' }), 'h-11 px-4 text-sm')}>
            {cta.label}
          </SiteLink>
        )}
        <span aria-hidden="true" className="h-6 w-px bg-border-accent" />
        <ThemeSwitchContainer />
      </div>

      <MobileMenuContainer items={navItems} cta={cta} className="lg:hidden" />
    </div>
  );
}
