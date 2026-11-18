import { vercelStegaCombine } from '@vercel/stega';

/** Appends invisible stega metadata, the way draft-mode strings arrive when Visual Editing is on. */
export function withStega(value: string): string {
  return vercelStegaCombine(value, { origin: 'sanity.io', href: '/studio/intent/edit/id=doc' }, false);
}
