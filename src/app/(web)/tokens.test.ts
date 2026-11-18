import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { OG_PALETTE } from '@/lib/seo/og';

const css = readFileSync(join(__dirname, 'globals.css'), 'utf8');

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  const body = css.slice(start, css.indexOf('\n}', start));
  return Object.fromEntries(
    [...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
  );
}

type Rgb = [number, number, number];

function oklchToLinearRgb(value: string): Rgb {
  const match = value.match(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)/);
  if (!match) throw new Error(`Not an oklch() color: ${value}`);
  const [L, C, H] = match.slice(1).map(Number);
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clamp = (x: number) => Math.min(1, Math.max(0, x));
  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

const encode = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);
const decode = (x: number) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);

/** Alpha-composites `top` over `bottom` in gamma-encoded sRGB, as browsers do. */
function blend(top: Rgb, bottom: Rgb, alpha: number): Rgb {
  return top.map((t, i) => decode(alpha * encode(t) + (1 - alpha) * encode(bottom[i]))) as Rgb;
}

const luminance = ([r, g, b]: Rgb) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function contrastRgb(x: Rgb, y: Rgb): number {
  const [hi, lo] = [luminance(x), luminance(y)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
}

function contrast(a: string, b: string): number {
  return contrastRgb(oklchToLinearRgb(a), oklchToLinearRgb(b));
}

// Sidebar tokens are excluded: the site has no sidebar (owner decision, T3).
const TEXT_PAIRS: [fg: string, bg: string][] = [
  ['foreground', 'background'],
  ['card-foreground', 'card'],
  ['popover-foreground', 'popover'],
  ['primary-foreground', 'primary'],
  ['primary-foreground', 'primary-hover'],
  ['secondary-foreground', 'secondary'],
  ['muted-foreground', 'muted'],
  ['muted-foreground', 'background'],
  ['muted-foreground', 'card'],
  ['accent-foreground', 'accent'],
  ['accent-foreground', 'accent-hover'],
  ['destructive-foreground', 'destructive'],
  ['destructive-foreground', 'destructive-hover'],
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

  it.each([
    ['primary-foreground', 'primary'],
    ['ring', 'card'],
  ])('section focus %s on %s is at least 3:1 [PB-R10]', (fg, bg) => {
    expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(3);
  });

  it.each([
    ['black', [0, 0, 0]],
    ['white', [1, 1, 1]],
  ] as const)('hero text stays at least 7:1 over a %s photo at the weakest scrim stop [PB-R13]', (_name, photo) => {
    const surface = blend(oklchToLinearRgb(tokens.background), [...photo], 0.9);
    expect(contrastRgb(oklchToLinearRgb(tokens.foreground), surface)).toBeGreaterThanOrEqual(7);
  });
});

const HEADER_ALPHA = Number(block(':root')['header-surface-alpha'].replace('%', '')) / 100;
// Any of these can scroll beneath the translucent header.
const BACKDROPS = ['background', 'card', 'muted', 'secondary', 'primary', 'accent', 'foreground', 'semantic-background'];

describe.each([
  ['light', block(':root')],
  ['dark', block('.dark')],
])('%s header surface [SHELL-R10]', (_theme, tokens) => {
  it.each(BACKDROPS)('foreground stays at least 7:1 over %s', (backdrop) => {
    const surface = blend(oklchToLinearRgb(tokens.background), oklchToLinearRgb(tokens[backdrop]), HEADER_ALPHA);
    expect(contrastRgb(oklchToLinearRgb(tokens.foreground), surface)).toBeGreaterThanOrEqual(7);
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

function toHex(value: string): string {
  return `#${oklchToLinearRgb(value)
    .map((channel) => Math.round(encode(channel) * 255).toString(16).padStart(2, '0'))
    .join('')}`.toUpperCase();
}

describe('social card palette [SEO-R8]', () => {
  it('matches the light-theme primary surface tokens', () => {
    const light = block(':root');
    const near = (a: string, b: string) =>
      [1, 3, 5].every((i) => Math.abs(parseInt(a.slice(i, i + 2), 16) - parseInt(b.slice(i, i + 2), 16)) <= 1);
    expect(near(OG_PALETTE.background.toUpperCase(), toHex(light.primary))).toBe(true);
    expect(near(OG_PALETTE.foreground.toUpperCase(), toHex(light['primary-foreground']))).toBe(true);
  });
});
