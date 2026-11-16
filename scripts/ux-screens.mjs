#!/usr/bin/env node
// Captures full-page screenshots of routes at key widths in light and dark mode.
// Usage: node scripts/ux-screens.mjs <feature> <route...>
// Requires a running server (e.g. `npm run build && npm run start`).

import { existsSync, mkdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const WIDTHS = [375, 768, 1280, 1920];
const SCHEMES = ['light', 'dark'];
const HEIGHT = 900;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_URL = process.env.UX_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;

const USAGE = 'Usage: node scripts/ux-screens.mjs <feature> <route...>\n' +
  'Example: node scripts/ux-screens.mjs 001-foundation / /studio';

function fail(message) {
  console.error(message);
  process.exit(1);
}

function routeSlug(route) {
  if (route === '/') return 'home';
  return route.replace(/\//g, '-').replace(/^-+/, '');
}

const [feature, ...routes] = process.argv.slice(2);

if (!feature || routes.length === 0) {
  fail(USAGE);
}

const featureDir = path.join(ROOT, 'specs', feature);
if (!existsSync(featureDir) || !statSync(featureDir).isDirectory()) {
  fail(`Feature "${feature}" not found: expected folder specs/${feature}/`);
}

const badRoute = routes.find((route) => !route.startsWith('/'));
if (badRoute !== undefined) {
  fail(`Invalid route "${badRoute}": routes must start with "/".\n${USAGE}`);
}

try {
  await fetch(BASE_URL, { signal: AbortSignal.timeout(5000) });
} catch {
  fail(
    `Base URL ${BASE_URL} is not reachable.\n` +
      'Start the app with `npm run build && npm run start`, or set UX_BASE_URL/PORT to a running server.',
  );
}

const outDir = path.join(featureDir, 'review', 'screenshots');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const written = [];

try {
  for (const route of routes) {
    for (const width of WIDTHS) {
      for (const colorScheme of SCHEMES) {
        const context = await browser.newContext({
          viewport: { width, height: HEIGHT },
          colorScheme,
          reducedMotion: 'reduce',
        });
        try {
          const page = await context.newPage();
          await page.goto(new URL(route, BASE_URL).toString(), { waitUntil: 'networkidle' });
          await page.evaluate(() => document.fonts.ready);
          const file = path.join(outDir, `${routeSlug(route)}__${width}__${colorScheme}.png`);
          await page.screenshot({ path: file, fullPage: true });
          written.push(file);
          console.log(path.relative(ROOT, file));
        } finally {
          await context.close();
        }
      }
    }
  }
} finally {
  await browser.close();
}

console.log(`Wrote ${written.length} screenshot(s).`);
