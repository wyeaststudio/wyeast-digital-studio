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
  'Applebot',
  'msnbot',
  'BingPreview',
  'bingbot',
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'Anthropic-AI',
  'OAI-SearchBot',
  'PerplexityBot',
  'Bytespider',
  'CCBot',
  'SemrushBot',
  'AhrefsBot',
  'MJ12bot',
  'PetalBot',
  'Qwantbot',
  'Sogou web spider',
  'ExaBot',
  'cohere-ai',
  'cohere-training-data-crawler',
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
