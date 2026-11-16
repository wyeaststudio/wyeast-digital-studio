import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(join(__dirname, 'globals.css'), 'utf8');

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  const body = css.slice(start, css.indexOf('\n}', start));
  return Object.fromEntries(
    [...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
  );
}

function oklchToLuminance(value: string): number {
  const match = value.match(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)/);
  if (!match) throw new Error(`Not an oklch() color: ${value}`);
  const [L, C, H] = match.slice(1).map(Number);
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clamp = (x: number) => Math.min(1, Math.max(0, x));
  const r = clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const g = clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  const bl = clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);
  return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [oklchToLuminance(a), oklchToLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Sidebar tokens are excluded: the site has no sidebar (owner decision, T3).
const TEXT_PAIRS: [fg: string, bg: string][] = [
  ['foreground', 'background'],
  ['card-foreground', 'card'],
  ['popover-foreground', 'popover'],
  ['primary-foreground', 'primary'],
  ['secondary-foreground', 'secondary'],
  ['muted-foreground', 'muted'],
  ['muted-foreground', 'background'],
  ['muted-foreground', 'card'],
  ['accent-foreground', 'accent'],
  ['destructive-foreground', 'destructive'],
  ['semantic-foreground', 'semantic-background'],
];

describe.each([
  ['light', block(':root')],
  ['dark', block('.dark')],
])('%s theme contrast [FOUND-R1, FOUND-R24]', (_theme, tokens) => {
  it.each(TEXT_PAIRS)('%s on %s is at least 7:1 (AAA)', (fg, bg) => {
    expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(7);
  });

  it('focus ring is at least 3:1 against the background (WCAG 2.4.13)', () => {
    expect(contrast(tokens.ring, tokens.background)).toBeGreaterThanOrEqual(3);
  });
});

describe('Figma extra tokens [FOUND-R2, FOUND-R9]', () => {
  it.each([
    '--color-border-accent: var(--border-accent)',
    '--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1)',
    '--shadow: 0 4px 16px 0 rgb(0 0 0 / 0.12)',
    '--shadow-lg: 0 8px 32px -4px rgb(0 0 0 / 0.08)',
    '--blur-backdrop: 24px',
    '--spacing-navbar: 4rem',
  ])('defines %s', (declaration) => {
    expect(css).toContain(declaration);
  });

  it('defines border-accent in both themes', () => {
    expect(block(':root')['border-accent']).toMatch(/\/ 50%\)$/);
    expect(block('.dark')['border-accent']).toMatch(/\/ 50%\)$/);
  });

  it('disables motion for prefers-reduced-motion', () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*transition-duration: 0\.01ms !important/);
  });
});
