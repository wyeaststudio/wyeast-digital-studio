import type { MetadataRoute } from 'next';
import { describe, expect, it } from 'vitest';
import { AI_TRAINING_AGENTS, buildRobots } from './robots';
import { absoluteUrl } from './site';

type Group = { userAgent?: string | string[]; allow?: string | string[]; disallow?: string | string[] };

const toList = (value: string | string[] | undefined): string[] => (value === undefined ? [] : [value].flat());

/** Specific-group-wins: the matching group is the one naming the agent, else `*`. Longest rule wins; allow wins ties. */
function isAllowed(robots: MetadataRoute.Robots, agent: string, path: string): boolean {
  const groups: Group[] = Array.isArray(robots.rules) ? robots.rules : [robots.rules];
  const name = agent.toLowerCase();
  const group =
    groups.find((g) => toList(g.userAgent).some((ua) => ua.toLowerCase() === name)) ??
    groups.find((g) => g.userAgent === '*');
  if (!group) return true;

  const matches = (rules: string[]) => rules.filter((rule) => rule !== '' && path.startsWith(rule)).map((r) => r.length);
  const allowed = Math.max(-1, ...matches(toList(group.allow)));
  const disallowed = Math.max(-1, ...matches(toList(group.disallow)));
  return allowed >= disallowed;
}

describe('AI_TRAINING_AGENTS [SEO-R16]', () => {
  it('has no duplicate agents, ignoring case', () => {
    const lower = AI_TRAINING_AGENTS.map((agent) => agent.toLowerCase());
    expect(new Set(lower).size).toBe(lower.length);
  });
});

describe('buildRobots [SEO-R5, SEO-R16]', () => {
  const robots = buildRobots({ indexable: true });

  it('blocks AI training crawlers from the whole site', () => {
    expect(isAllowed(robots, 'GPTBot', '/')).toBe(false);
    expect(isAllowed(robots, 'Google-Extended', '/')).toBe(false);
  });

  it('allows search engines and AI search or answer agents', () => {
    expect(isAllowed(robots, 'OAI-SearchBot', '/')).toBe(true);
    expect(isAllowed(robots, 'PerplexityBot', '/')).toBe(true);
    expect(isAllowed(robots, 'Googlebot', '/')).toBe(true);
  });

  it('disallows /studio and /api/ for everyone', () => {
    expect(isAllowed(robots, 'Googlebot', '/studio')).toBe(false);
    expect(isAllowed(robots, '*', '/studio')).toBe(false);
    expect(isAllowed(robots, 'Googlebot', '/api/revalidate')).toBe(false);
  });

  it('links the absolute sitemap URL', () => {
    expect(robots.sitemap).toBe(absoluteUrl('/sitemap.xml'));
    expect(robots.sitemap).toMatch(/^https?:\/\//);
  });
});

describe('buildRobots when the deployment is not indexable [SEO-R5]', () => {
  it('disallows all crawling and omits the sitemap', () => {
    const robots = buildRobots({ indexable: false });

    expect(isAllowed(robots, 'Googlebot', '/')).toBe(false);
    expect(isAllowed(robots, 'OAI-SearchBot', '/')).toBe(false);
    expect(robots.rules).toEqual({ userAgent: '*', disallow: '/' });
    expect(robots.sitemap).toBeUndefined();
  });
});
