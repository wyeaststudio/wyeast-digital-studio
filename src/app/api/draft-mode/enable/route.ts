import { defineEnableDraftMode } from 'next-sanity/draft-mode';
import { client } from '@/sanity/client';

// Built per request so a missing token fails only this route, not the whole build.
export async function GET(request: Request) {
  const token = process.env.SANITY_API_READ_TOKEN;
  if (!token) {
    return new Response('Draft mode is not configured', { status: 500 });
  }
  const { GET: enable } = defineEnableDraftMode({ client: client.withConfig({ token }) });
  return enable(request);
}
