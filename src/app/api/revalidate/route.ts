import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

type WebhookPayload = { _type?: string; slug?: string | null };

// Sanity webhook: filter `!(_id in path("drafts.**"))`, projection `{_type, "slug": slug.current}`.
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ message: 'Revalidation is not configured' }, { status: 500 });
  }

  const { isValidSignature, body } = await parseBody<WebhookPayload>(request, secret);
  if (!isValidSignature) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
  }
  if (!body?._type) {
    return NextResponse.json({ message: 'Missing _type' }, { status: 400 });
  }

  const tags = body.slug ? [body._type, `${body._type}:${body.slug}`] : [body._type];
  for (const tag of tags) revalidateTag(tag, 'max');

  return NextResponse.json({ revalidated: true, tags });
}
