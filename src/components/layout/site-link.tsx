import Link from 'next/link';
import type { ComponentProps } from 'react';

type SiteLinkProps = Omit<ComponentProps<'a'>, 'href'> & { href: string };

/** CMS paths navigate on click without speculatively fetching unpublished destinations. */
export function SiteLink({ href, ...props }: SiteLinkProps) {
  if (href.startsWith('/')) return <Link href={href} prefetch={false} {...props} />;
  return <a href={href} rel="noopener noreferrer" {...props} />;
}
