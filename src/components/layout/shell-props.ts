import { stegaClean } from 'next-sanity';
import type { SocialPlatform } from '@/sanity/schemas/objects/social-link';
import type { Shell } from '@/sanity/loaders/shell';
import { isValidHref } from '@/sanity/validation';

export interface NavLink {
  key: string;
  label: string;
  href: string;
}

export interface NavItem {
  key: string;
  label: string;
  href: string | null;
  children: NavLink[];
}

export interface SocialLink {
  key: string;
  platform: SocialPlatform;
  href: string;
}

export interface Contact {
  email: { label: string; href: string } | null;
  phone: { label: string; href: string } | null;
  serviceArea: string | null;
}

export interface ShellProps {
  siteName: string;
  navItems: NavItem[];
  cta: NavLink | null;
  footerLinks: NavLink[];
  contact: Contact;
  socialLinks: SocialLink[];
}

export const DEFAULT_SITE_NAME = "Wy'east Digital Studio";

// Labels keep their stega encoding for click-to-edit; attribute values must be clean.
const cleanHref = (href: string | null | undefined) => {
  const clean = stegaClean(href);
  return isValidHref(clean) ? clean : null;
};

function toLink(link: { _key?: string; label: string | null; href: string | null }, key: string): NavLink | null {
  const href = cleanHref(link.href);
  return link.label && href ? { key: link._key ?? key, label: link.label, href } : null;
}

const isPresent = <T,>(value: T | null): value is T => value !== null;

/** Maps the shell query result to validated props; missing content yields an empty but working shell (SHELL-R23). */
export function toShellProps(shell: Shell | null): ShellProps {
  const settings = shell?.settings;
  const navigation = shell?.navigation;

  const navItems = (navigation?.headerLinks ?? [])
    .map((item): NavItem | null => {
      const children = (item.children ?? []).map((child, i) => toLink(child, `${item._key}-${i}`)).filter(isPresent);
      const href = cleanHref(item.href);
      return item.label && (href || children.length > 0)
        ? { key: item._key, label: item.label, href, children }
        : null;
    })
    .filter(isPresent);

  return {
    siteName: stegaClean(settings?.siteName) || DEFAULT_SITE_NAME,
    navItems,
    cta: navigation?.headerCta ? toLink(navigation.headerCta, 'cta') : null,
    footerLinks: (navigation?.footerLinks ?? []).map((link, i) => toLink(link, `footer-${i}`)).filter(isPresent),
    contact: {
      email: settings?.email ? { label: settings.email, href: `mailto:${stegaClean(settings.email)}` } : null,
      phone: settings?.phone
        ? { label: settings.phone, href: `tel:${stegaClean(settings.phone).replace(/[^\d+]/g, '')}` }
        : null,
      serviceArea: settings?.serviceArea || null,
    },
    socialLinks: (settings?.socialLinks ?? [])
      .map((link): SocialLink | null => {
        const href = cleanHref(link.url);
        const platform = stegaClean(link.platform);
        return platform && href ? { key: link._key, platform, href } : null;
      })
      .filter(isPresent),
  };
}
