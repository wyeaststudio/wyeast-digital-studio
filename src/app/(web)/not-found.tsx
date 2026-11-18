import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteLink } from '@/components/layout/site-link';
import { StatusPage } from '@/components/layout/status-page';
import { toShellProps } from '@/components/layout/shell-props';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getShell } from '@/sanity/loaders/shell';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

const actionClass = 'h-11 px-5 text-base';

export default async function NotFound() {
  const { cta } = toShellProps(await getShell());

  return (
    <StatusPage
      title="Page not found"
      actions={
        <>
          <Link href="/" className={cn(buttonVariants(), actionClass)}>
            Go to the home page
          </Link>
          {cta && (
            <SiteLink href={cta.href} className={cn(buttonVariants({ variant: 'outline' }), actionClass)}>
              {cta.label}
            </SiteLink>
          )}
        </>
      }
    >
      <p>We couldn&apos;t find the page you were looking for. It may have moved, or the link may be out of date.</p>
    </StatusPage>
  );
}
