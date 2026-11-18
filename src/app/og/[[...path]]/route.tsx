import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { ARROW, MOUNTAIN } from '@/components/layout/brand-logo';
import { cardTitle, OG_PALETTE, OG_SIZE } from '@/lib/seo/og';
import { resolvePath } from '@/lib/seo/routes';
import { resolveSite } from '@/lib/seo/site';
import { getOgTitle, getSiteSeo } from '@/sanity/loaders/seo';

const FONT_DIR = join(process.cwd(), 'src/app/og/fonts');

// The URL is versioned by a hash of the title (see resolveOgImage), so long-lived caching is safe.
const CACHE_CONTROL = 'public, max-age=86400, s-maxage=31536000, immutable';

/**
 * Branded social card for a known, indexable page (SEO-R8, R9). Text comes only from published content for the
 * path; query strings are ignored.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ path?: string[] }> }): Promise<Response> {
  const { path = [] } = await params;
  const target = resolvePath(`/${path.join('/')}`);
  if (!target) return new Response('Not found', { status: 404 });

  const site = resolveSite(await getSiteSeo());
  const title = target.kind === 'home' ? site.homeTitle : await getOgTitle(target.type, target.slug);
  if (!title) return new Response('Not found', { status: 404 });

  const [playfair, montserrat] = await Promise.all([
    readFile(join(FONT_DIR, 'PlayfairDisplay-Regular.ttf')),
    readFile(join(FONT_DIR, 'MontserratAlternates-Medium.ttf')),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 80,
        backgroundColor: OG_PALETTE.background,
        color: OG_PALETTE.foreground,
      }}
    >
      <svg width={138} height={120} viewBox="44 14 46 40" fill={OG_PALETTE.foreground}>
        <path fillRule="evenodd" clipRule="evenodd" d={ARROW} />
        <path fillRule="evenodd" clipRule="evenodd" d={MOUNTAIN} />
      </svg>
      <div style={{ display: 'flex', fontFamily: 'Playfair Display', fontSize: 68, lineHeight: 1.15, maxWidth: 1000 }}>
        {cardTitle(title, site.siteName)}
      </div>
      <div style={{ display: 'flex', fontFamily: 'Montserrat Alternates', fontSize: 30 }}>{site.siteName}</div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Playfair Display', data: playfair, weight: 400, style: 'normal' },
        { name: 'Montserrat Alternates', data: montserrat, weight: 500, style: 'normal' },
      ],
      headers: { 'Cache-Control': CACHE_CONTROL },
    },
  );
}
