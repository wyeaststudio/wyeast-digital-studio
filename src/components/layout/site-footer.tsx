import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BrandLockup } from './brand-logo';
import type { ShellProps } from './shell-props';
import { SiteLink } from './site-link';
import { SOCIAL_LABELS, SocialIcon } from './social-icons';

export type SiteFooterProps = Pick<ShellProps, 'siteName' | 'footerLinks' | 'contact' | 'socialLinks'> & {
  year: number;
};

const linkClass =
  'inline-flex min-h-11 items-center rounded-md px-2 underline-offset-4 outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground';

export function SiteFooter({ siteName, footerLinks, contact, socialLinks, year }: SiteFooterProps) {
  const hasContact = contact.email || contact.phone || contact.serviceArea;

  return (
    <footer className="bg-primary text-primary-foreground shadow-up">
      <div className="mx-auto flex max-w-300 flex-col items-center gap-6 px-4 py-8 text-center text-sm lg:gap-8">
        <Link
          href="/"
          aria-label={`${siteName}, home`}
          className="rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-foreground"
        >
          <BrandLockup className="h-20 w-auto" />
        </Link>

        {(footerLinks.length > 0 || hasContact || socialLinks.length > 0) && (
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:gap-12">
            {footerLinks.length > 0 && (
              <nav aria-label="Footer">
                <ul className="flex flex-wrap justify-center gap-x-2">
                  {footerLinks.map((link) => (
                    <li key={link.key}>
                      <SiteLink href={link.href} className={linkClass}>
                        {link.label}
                      </SiteLink>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {hasContact && (
              <address className="flex flex-col items-center gap-x-4 not-italic sm:flex-row sm:flex-wrap sm:justify-center">
                {contact.email && (
                  <a href={contact.email.href} className={linkClass}>
                    {contact.email.label}
                  </a>
                )}
                {contact.phone && (
                  <a href={contact.phone.href} className={linkClass}>
                    {contact.phone.label}
                  </a>
                )}
                {contact.serviceArea && <span className="px-2 py-3">{contact.serviceArea}</span>}
              </address>
            )}

            {socialLinks.length > 0 && (
              <ul className="flex gap-1" aria-label="Social media">
                {socialLinks.map((link) => (
                  <li key={link.key}>
                    <a href={link.href} rel="noopener noreferrer" className={cn(linkClass, 'size-11 justify-center px-0')}>
                      <SocialIcon platform={link.platform} className="size-6" />
                      <span className="sr-only">
                        {siteName} on {SOCIAL_LABELS[link.platform]}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <p className="text-xs">
          © {year} {siteName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
