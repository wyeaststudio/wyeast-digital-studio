# 001 — Foundation: Plan

**Status:** Approved · **Spec:** [spec.md](./spec.md)

## Approach

Build the foundation in four layers, each independently verifiable:

1. **Design system:** tokens in `globals.css` and fonts in the root layout.
2. **Theming:** `next-themes` provider plus a presentational toggle.
3. **Content tooling:** schemas folder, cached fetch helper, TypeGen, draft mode and Visual Editing, webhook revalidation.
4. **Quality toolchain:** Vitest, Playwright, axe, Lighthouse CI, UX screenshot script, GitHub Actions.

Docs consulted (bundled Next 16): `03-api-reference/04-functions/revalidateTag.md` (requires the `'max'` profile argument), `03-api-reference/04-functions/draft-mode.md` (`isEnabled` is readable inside `'use cache'`, and draft mode bypasses the cache), `02-guides/upgrading/version-16.md` (`middleware` → `proxy`, `cacheComponents` replaces `experimental.dynamicIO`), `01-getting-started/13-fonts.md`. `next-sanity@13.1.1` exports `./draft-mode`, `./visual-editing`, and `./webhook`.

## Constitution check

| Principle | How this plan complies |
| --- | --- |
| §2 Brand, mobile-first | Tokens are the only color and radius source. Reduced-motion and base styles are mobile-first. |
| §3 Stack | No new **runtime** dependencies. Everything comes from `next`, `next-sanity`, `sanity`, and `next-themes`. |
| §3.1 Presentational components | `ThemeToggle` takes `{ theme, onToggle }`. `ThemeToggleContainer` holds the `useTheme` logic. |
| §4 Content model | Schemas move to `src/sanity/schemas`. Queries use `defineQuery` in `src/sanity/queries.ts`. Types come from TypeGen. |
| §5 Accessibility | AAA contrast (FOUND-R1, R24), a 44 px toggle target, reduced motion (R9), and an axe helper (R18). |
| §6 Performance | `cacheComponents` (partial prerendering), self-hosted subset fonts with `display: swap` and fallback metrics, and Lighthouse CI at 100. |
| §8 Security | Webhook signature validation, a secret-validated draft-mode route, a read token used only on the server, and same-origin-only framing. |
| §10 Cost | 13 small tasks. Dev tooling is configured once and reused by every later feature. |

## Design tokens (`src/app/(web)/globals.css`)

Colors (OKLCH, with a hex comment) that change from the current file:

| Token | Light | Dark |
| --- | --- | --- |
| `--foreground` | #2E2924 (Figma) | unchanged #E5E2D9 |
| `--muted` | #D9D6CC (Figma) | unchanged |
| `--primary` | #434945 | #D1AF43 |
| `--ring` | #2A4D50 | #D1AF43 |
| `--accent` | #2A4D50 | #2A4D50 |
| `--muted-foreground` | #3D4042 | #CDCBC4 |
| `--destructive` | #733429 | #73352C |
| `--semantic-background` | #585756 | unchanged |
| `--primary-hover` (new) | #343936 | #D8BB60 |
| `--destructive-hover` (new) | #5C2A21 | #5D2B24 |

New `@theme inline` entries:

```css
--color-border-accent: var(--border-accent);   /* :root: #626D65 at 50%, .dark: same */
--font-serif: var(--font-playfair);
--font-heading: var(--font-playfair);
--font-sans: var(--font-montserrat-alt);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.10);
--shadow: 0 4px 16px 0 rgb(0 0 0 / 0.12);
--shadow-lg: 0 8px 32px -4px rgb(0 0 0 / 0.08);
--blur-backdrop: 24px;       /* → backdrop-blur-backdrop */
--spacing-navbar: 4rem;      /* 64px → h-navbar, pt-navbar */
```

(The spec's acceptance criterion for R2 is met by `backdrop-blur-backdrop` and `h-navbar`, which are cleaner than arbitrary-value syntax.) The existing `--font-mono: var(--font-geist-mono)` reference is removed because Geist is dropped.

Figma text style → Tailwind mapping (R4); no custom utilities are needed:

| Figma style | Classes |
| --- | --- |
| Text-xs/Medium | `text-xs font-medium` |
| Text-sm/Regular, Medium | `text-sm`, `text-sm font-medium` |
| Text-base/Regular | `text-base` |
| Text-lg/Bold (serif) | `font-heading text-lg font-bold` (line height 28 = Tailwind default) |
| Text-xl/Bold (serif) | `font-heading text-xl font-bold` |
| Text-4xl/Regular (serif) | `font-heading text-4xl` |

Reduced motion (R9), added in `@layer base`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Fonts (`src/app/fonts.ts`)

`next/font/google` downloads the fonts at build time and self-hosts them (R3):

- `Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' })`, a variable font that covers 400 and 700
- `Montserrat_Alternates({ subsets: ['latin'], weight: ['400','500','700'], variable: '--font-montserrat-alt', display: 'swap' })`

Both are applied on `<html>` in `src/app/(web)/layout.tsx`, replacing Geist.

## Theming

| File | Server/Client | Purpose |
| --- | --- | --- |
| `src/components/theme/theme-provider.tsx` | Client | Wraps `next-themes` `ThemeProvider` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange` |
| `src/components/theme/theme-toggle.tsx` | Client (presentational) | Props `{ resolvedTheme?: 'light' \| 'dark'; onToggle: () => void }`. A `Button` with size 44 px, a sun or moon icon, and `aria-label` "Switch to dark/light theme". While `resolvedTheme` is undefined during hydration it renders a disabled placeholder of the same size, so there's no layout shift. |
| `src/components/theme/theme-toggle-container.tsx` | Client | Calls `useTheme()` and passes props to `ThemeToggle` |

No flash of the wrong theme (R7): `next-themes` injects an inline script before paint, which the CSP already allows (`'unsafe-inline'`).

## Sanity

### Structure

```
sanity.cli.ts                     # new: projectId/dataset + typegen config
sanity.config.ts                  # uses schemaTypes, adds presentationTool
sanity.types.ts                   # generated, committed (Q4)
src/sanity/
  env.ts                          # + readToken (server-only), revalidateSecret
  client.ts                       # base client (useCdn: false; stega config)
  fetch.ts                        # sanityFetch(): 'use cache' + cacheTag + draft-aware
  queries.ts                      # defineQuery() queries (sample: SETTINGS_PROBE_QUERY)
  schemas/index.ts                # export const schemaTypes = [page]
  schemas/documents/page.ts       # moved from sanity.config.ts (defineType/defineField)
```

### `sanityFetch` (R12, R23)

```ts
export async function sanityFetch<Q extends string>({ query, params = {}, tags }: {...}) {
  'use cache'
  const { isEnabled } = await draftMode()
  if (isEnabled) {
    return client.withConfig({ token: readToken, perspective: 'drafts', stega: true, useCdn: false })
      .fetch(query, params)              // draft mode bypasses the cache automatically
  }
  cacheTag(...tags)
  cacheLife('max')
  return client.fetch(query, params, { perspective: 'published' })
}
```

The exact signature follows the TypeGen query-result overloads, so results are fully typed.

### Draft mode and Visual Editing (R12–R14)

| File | Purpose |
| --- | --- |
| `src/app/api/draft-mode/enable/route.ts` | `defineEnableDraftMode({ client: client.withConfig({ token: readToken }) })` from `next-sanity/draft-mode`, which validates the preview-URL secret |
| `src/app/api/draft-mode/disable/route.ts` | `(await draftMode()).disable()`, then redirects to `/` |
| `src/app/(web)/layout.tsx` | When `(await draftMode()).isEnabled`, renders `<VisualEditing />` from `next-sanity/visual-editing` inside `<Suspense>` |
| `sanity.config.ts` | `presentationTool({ previewUrl: { previewMode: { enable: '/api/draft-mode/enable' } } })` |
| `next.config.ts` | Sets `X-Frame-Options: SAMEORIGIN`, `frame-ancestors 'self'`, and `cacheComponents: true` |

### Webhook revalidation (R23)

`src/app/api/revalidate/route.ts` (POST):

1. Calls `parseBody(req, SANITY_REVALIDATE_SECRET)` from `next-sanity/webhook`, and returns 401 if the signature is invalid.
2. Reads the body `{ _type, slug }` and calls `revalidateTag(_type, 'max')`, plus `revalidateTag(\`${_type}:${slug}\`, 'max')` when there is a slug.
3. Returns 200 with the tags it revalidated.

Tag convention (documented in `fetch.ts`): `<_type>` for collections and singletons, `<_type>:<slug>` for individual documents.

You configure the Sanity webhook in sanity.io/manage: filter `!(_id in path("drafts.**"))`, projection `{_type, "slug": slug.current}`, with the secret above.

### TypeGen (R11)

`sanity.cli.ts` sets the typegen config: the schema is extracted to `sanity/extract.json` (git-ignored), queries are read from `src/sanity/**/*.ts`, and types are written to `sanity.types.ts`, with `overloadClientMethods: true` so `client.fetch` is typed. The script is `"typegen": "sanity schema extract --path=sanity/extract.json && sanity typegen generate"`. Before writing the config, check the exact v6 options in the Sanity docs.

### Missing-env behavior (R15)

`env.ts` keeps `assertValue` and adds `readToken` (`SANITY_API_READ_TOKEN`) and `revalidateSecret` (`SANITY_REVALIDATE_SECRET`). These two are asserted only when they are used, so a public build without draft mode still works.

## `cacheComponents` migration impact

With `cacheComponents: true`, uncached request-time APIs must sit inside `<Suspense>`. Existing routes to check:

- `opengraph-image.tsx` / `twitter-image.tsx` use the **edge runtime**, which is not compatible with `cacheComponents`. Switch them to the default Node runtime. They stay statically generated, so the build warning goes away too.
- `robots.ts` and `sitemap.ts` are static, so no change is needed.
- `studio/[[...tool]]` is a client app that is already marked dynamic, so verify it builds.

## Dependencies (all dev)

| Package | Why |
| --- | --- |
| `vitest`, `@vitejs/plugin-react`, `jsdom` | Unit and component tests (R16) |
| `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` | Component assertions |
| `@playwright/test` | E2E tests and the UX screenshot script (R17, R21) |
| `@axe-core/playwright` | Automated accessibility checks (R18) |
| `@lhci/cli` | Lighthouse CI (R19) |

**No runtime dependencies.** `next-themes` and `next-sanity` are already installed, and the Presentation tool ships with `sanity`.

## Environment variables (add to `env.example`)

| Variable | Scope | Purpose |
| --- | --- | --- |
| `SANITY_API_READ_TOKEN` | Server | Draft content and preview-secret validation |
| `SANITY_REVALIDATE_SECRET` | Server | Webhook signature |

## Scripts (`package.json`)

```json
"typecheck": "tsc --noEmit",
"typegen": "sanity schema extract --path=sanity/extract.json && sanity typegen generate",
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test",
"test:lh": "lhci autorun",
"ux:screens": "node scripts/ux-screens.mjs",
"check": "npm run lint && npm run typecheck && npm run test && npm run build && npm run test:e2e && npm run test:lh"
```

## Testing strategy

| Requirement | Test |
| --- | --- |
| R1, R24 | `src/app/(web)/tokens.test.ts`: parses `globals.css`, converts OKLCH to sRGB, and asserts every foreground/surface pair is ≥ 7:1 in both themes |
| R2, R4 | Vitest: asserts the `@theme` contains the new tokens. Playwright: computed `box-shadow` and `font-family` on fixtures. |
| R3 | Playwright: `getComputedStyle(h1).fontFamily` includes Playfair and body includes Montserrat Alternates, and no network request to `fonts.g*` |
| R6, R7 | Playwright: `colorScheme` emulation, a toggle click, reload persistence, and `html` already having the class at DOMContentLoaded |
| R8 | Vitest: label, click → `onToggle`, Enter/Space, placeholder while unresolved, size ≥ 44 px |
| R9 | Playwright: `reducedMotion: 'reduce'` → computed durations ≈ 0 |
| R13 | Vitest: the enable route without a secret returns 401 |
| R14 | Playwright: response headers contain SAMEORIGIN and `frame-ancestors 'self'` |
| R18 | `e2e/helpers/axe.ts` `expectNoA11yViolations(page)`, run on `/` in both themes |
| R19 | `lighthouserc.json`: `startServerCommand: "npm run start"`, URLs `/`, presets desktop and mobile, and `assert` minScore 1 for all four categories |
| R20 | `npm run check` passes locally |
| R21 | `scripts/ux-screens.mjs <feature> <routes...>` produces 8 PNGs per route |
| R22 | `.github/workflows/check.yml`: Node from `.nvmrc`, `npm ci`, Playwright browsers, `npm run check`. Sanity variables come from repo secrets. |
| R23 | Vitest: the revalidate route returns 401 for a bad signature, and with a valid signature it calls `revalidateTag` with `'max'` |
| R10–R12 | Manual: the Studio loads and Presentation overlays appear (part of the UX review) |

## Risks and alternatives

- **The AAA colors change the look of the brand.** Primary is noticeably darker. Figma should be updated to match, and the UX review will flag any differences.
- **`cacheComponents` is newer.** If `next-sanity` integration problems come up, fall back to `fetch` with `next.tags` (an alternative that was considered). The change is limited to `fetch.ts`.
- **Montserrat Alternates for body text** may hurt readability, which matters for the AAA plain-language goal. The owner chose to keep it; the UX review will check readability at 375 px.
- **Lighthouse 100 under CI variance:** Lighthouse runs 3 times and uses the median (`numberOfRuns: 3`).
- **The webhook must be configured manually** in sanity.io/manage. That's documented in the README during T12.
