import { buildLlmsTxt } from '@/lib/seo/llms-txt';
import { resolveSite } from '@/lib/seo/site';
import { getRoutableDocs, getSiteSeo } from '@/sanity/loaders/seo';
import { getHomePage } from '@/sanity/loaders/pages';

export async function GET(): Promise<Response> {
  const [settings, docs, home] = await Promise.all([
    getSiteSeo(), getRoutableDocs(), getHomePage({ publishedOnly: true }),
  ]);
  return new Response(buildLlmsTxt({ site: resolveSite(settings), docs, homeNoindex: home?.seo?.noindex === true }), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
