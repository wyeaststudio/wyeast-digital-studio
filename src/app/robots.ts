import type { MetadataRoute } from 'next';

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'
).replace(/\/$/, '');
const majorCrawlers = [
  'Googlebot',
  'Googlebot-Image',
  'Google-Extended',
  'bingbot',
  'Slurp',
  'DuckDuckBot',
  'Baiduspider',
  'YandexBot',
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'Anthropic-AI',
  'OAI-SearchBot',
  'PerplexityBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: majorCrawlers,
        allow: '/',
        disallow: ['/studio', '/api/'],
      },
      {
        userAgent: '*',
        disallow: ['/studio', '/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
