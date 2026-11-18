import { buildLlmsTxt } from '@/lib/seo/llms-txt';
import { resolveSite } from '@/lib/seo/site';
import { getRoutableDocs, getSiteSeo } from '@/sanity/loaders/seo';

export async function GET(): Promise<Response> {
  const [settings, docs] = await Promise.all([getSiteSeo(), getRoutableDocs()]);
  return new Response(buildLlmsTxt({ site: resolveSite(settings), docs }), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
