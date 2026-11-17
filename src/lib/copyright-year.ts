import { cacheLife } from 'next/cache';

/** Cached for a day so `new Date()` is allowed under cacheComponents and the year rolls over without a redeploy (SHELL-R18). */
export async function getCopyrightYear(): Promise<number> {
  'use cache';
  cacheLife('days');
  return new Date().getFullYear();
}
