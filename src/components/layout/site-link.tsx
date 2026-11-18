import Link from 'next/link';
import type { ComponentProps } from 'react';

type SiteLinkProps = Omit<ComponentProps<'a'>, 'href'> & { href: string };

/** Internal paths use next/link; external URLs open in the same tab without leaking the opener or referrer. */
export function SiteLink({ href, ...props }: SiteLinkProps) {
  if (href.startsWith('/')) return <Link href={href} {...props} />;
  return <a href={href} rel="noopener noreferrer" {...props} />;
}
