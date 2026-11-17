import type { SHELL_QUERY_RESULT } from '../../../sanity.types';
import { sanityFetch } from '../fetch';
import { SHELL_QUERY } from '../queries';

export type Shell = SHELL_QUERY_RESULT;
export type ShellSettings = NonNullable<Shell['settings']>;
export type ShellNavigation = NonNullable<Shell['navigation']>;
export type ShellNavItem = NonNullable<ShellNavigation['headerLinks']>[number];
export type ShellLink = NonNullable<ShellNavigation['footerLinks']>[number];
export type ShellCta = NonNullable<ShellNavigation['headerCta']>;
export type ShellSocialLink = NonNullable<ShellSettings['socialLinks']>[number];

/** Header and footer content. Returns null instead of throwing so the shell always renders (SHELL-R23). */
export async function getShell(): Promise<Shell | null> {
  try {
    return await sanityFetch({ query: SHELL_QUERY, tags: ['siteSettings', 'navigation'] });
  } catch (error) {
    console.error('Failed to load the site shell from Sanity', error);
    return null;
  }
}
