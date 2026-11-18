import type { MetadataRoute } from 'next';
import { absoluteUrl } from './site';

/**
 * Crawlers used only to train AI models. Blocking them is the owner's policy (SEO-R16).
 * Search engines and AI search or answer agents (OAI-SearchBot, ChatGPT-User, PerplexityBot,
 * Claude-SearchBot, Claude-User, and so on) match no group here, so they fall through to `*`
 * and stay allowed. Blocking Google-Extended does not affect Google Search or AI Overviews.
 */
export const AI_TRAINING_AGENTS = [
  'GPTBot',
  'Google-Extended',
  'Applebot-Extended',
  'ClaudeBot',
  'anthropic-ai',
  'CCBot',
  'Bytespider',
  'meta-externalagent',
  'cohere-training-data-crawler',
] as const;

export function buildRobots({ indexable }: { indexable: boolean }): MetadataRoute.Robots {
  if (!indexable) return { rules: { userAgent: '*', disallow: '/' } };

  return {
    rules: [
      { userAgent: [...AI_TRAINING_AGENTS], disallow: '/' },
      { userAgent: '*', allow: '/', disallow: ['/studio', '/api/'] },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
