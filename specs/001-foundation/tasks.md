# 001 — Foundation: Tasks

**Status:** Approved · **Plan:** [plan.md](./plan.md)

Run the tasks in order. Each is small and independently verifiable, and each lists the requirements it covers and how to verify it. While working, run only the task's own check. Run the full Definition of Done (constitution §9) once T10 is in place. Tasks marked _(lightweight model)_ are routine generation that can go to a cheaper model (constitution §10).

## Phase A — Test harness first (so later tasks can verify themselves)

- [x] **T1 — Vitest setup** _(lightweight model)_
  Install `vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom` (dev). Add `vitest.config.ts` (jsdom, `@/` alias, setup file importing jest-dom) and the `test`, `test:watch`, and `typecheck` scripts. Add a trivial test for `cn()` in `src/lib/utils.test.ts`.
  _Covers:_ FOUND-R16 · _Verify:_ `npm run test && npm run typecheck`

- [x] **T2 — Playwright and axe helper** _(lightweight model)_
  Install `@playwright/test @axe-core/playwright` (dev). Add `playwright.config.ts` (webServer: `npm run build && npm run start`, projects: chromium, firefox, webkit, mobile-chromium 375 px) and `e2e/helpers/axe.ts` (`expectNoA11yViolations(page)` with WCAG 2.0/2.1/2.2 A and AA tags). Add `e2e/home.spec.ts`, which visits `/` and runs axe in light and dark mode. Add the `test:e2e` script and git-ignore `test-results/` and `playwright-report/`.
  _Covers:_ FOUND-R17, R18 · _Verify:_ `npm run test:e2e` (axe may fail until T3 fixes the colors, which is expected; note it in the task log)
  - Task log: `PORT=3100 npm run test:e2e -- --project=chromium` → 2 failed, both expected. Only axe violation in light and dark mode: `color-contrast` (serious) on `.bg-primary` (the `/studio` link), 4.16:1 (#e5e2d9 on #626d65), needs 4.5:1. Port 3000 was held by an unrelated stale `next-server` from another project, so the run used 3100.

## Phase B — Design system

- [ ] **T3 — Tokens: AAA colors, Figma extras, contrast test**
  Update `globals.css` with the color table from the plan (OKLCH plus a hex comment). Add `--border-accent`, the shadow scale, `--blur-backdrop`, `--spacing-navbar`, and the reduced-motion block. Add `src/app/(web)/tokens.test.ts`, which parses `globals.css` and asserts ≥ 7:1 for every foreground/surface pair in both themes and that the new `@theme` tokens exist.
  _Covers:_ FOUND-R1, R2, R5, R9, R24 · _Verify:_ `npm run test -- tokens` and `npm run test:e2e -- home` (axe passes)

- [ ] **T4 — Fonts**
  Create `src/app/fonts.ts` (Playfair Display and Montserrat Alternates) and apply the variables in `(web)/layout.tsx`, removing Geist. Map `--font-sans`, `--font-serif`, and `--font-heading` in `@theme`, and remove the `--font-mono` Geist reference. Add base styles: `h1–h6 { font-family: var(--font-heading) }`. Add the e2e font assertions and the no-Google-request check.
  _Covers:_ FOUND-R3, R4 · _Verify:_ `npm run test:e2e -- fonts`

## Phase C — Theming

- [ ] **T5 — Theme provider and toggle**
  Create `theme-provider.tsx`, the presentational `theme-toggle.tsx`, and `theme-toggle-container.tsx`. Wrap the body in the provider in `(web)/layout.tsx`. Temporarily place `ThemeToggleContainer` on the placeholder home page (the header in spec 002 will take it over). Add Vitest tests for the toggle (label, Enter and Space, placeholder, 44 px) and e2e tests for theming (system preference, persistence, no flash, reduced motion).
  _Covers:_ FOUND-R6, R7, R8, R9 · _Verify:_ `npm run test -- theme-toggle` and `npm run test:e2e -- theme`

## Phase D — Sanity tooling

- [ ] **T6 — Schemas folder**
  Move the `page` type to `src/sanity/schemas/documents/page.ts` (`defineType`/`defineField`) with an `index.ts` that exports `schemaTypes`, and update `sanity.config.ts` to use it.
  _Covers:_ FOUND-R10 · _Verify:_ `npm run build`, and `/studio` loads in `npm run dev`

- [ ] **T7 — Env, client, TypeGen**
  Extend `env.ts` (`readToken` and `revalidateSecret`, asserted only where they're used) and add both to `env.example`. Set `useCdn: false` and the stega `studioUrl: '/studio'` in `client.ts`. Create `sanity.cli.ts` with the typegen config (check the v6 options in the Sanity docs). Add `src/sanity/queries.ts` with one sample `defineQuery`, the `typegen` script, a git-ignore entry for `sanity/extract.json`, and commit the generated `sanity.types.ts`.
  _Covers:_ FOUND-R11, R15 · _Verify:_ `npm run typegen && npm run typecheck`

- [ ] **T8 — `cacheComponents` and `sanityFetch`**
  Enable `cacheComponents: true` in `next.config.ts`. Move `opengraph-image.tsx` and `twitter-image.tsx` from the edge runtime to Node. Create `src/sanity/fetch.ts` (draft-aware, `'use cache'` + `cacheTag` + `cacheLife('max')`) and document the tag convention. Fix any Suspense or build errors that `cacheComponents` causes.
  _Covers:_ FOUND-R12 (data path), R23 (tags) · _Verify:_ `npm run build` (no edge warning) and `npm run test:e2e -- home`

- [ ] **T9 — Draft mode, Visual Editing, framing**
  Add the `api/draft-mode/enable` route (`defineEnableDraftMode`) and the `disable` route. Render `<VisualEditing />` in `(web)/layout.tsx` in a Suspense boundary when draft mode is on. Add `presentationTool` to `sanity.config.ts`. Change the headers to `X-Frame-Options: SAMEORIGIN` and `frame-ancestors 'self'`. Add a Vitest test (the enable route rejects requests without a secret) and an e2e test of the headers.
  _Covers:_ FOUND-R12, R13, R14 · _Verify:_ `npm run test -- draft-mode`, `npm run test:e2e -- headers`, then manually open the Presentation tool in `/studio` (needs `SANITY_API_READ_TOKEN`)

- [ ] **T10 — Webhook revalidation**
  Add `src/app/api/revalidate/route.ts` (`parseBody` with signature validation → `revalidateTag(tag, 'max')`). Add Vitest tests for the 401 response and the tag calls. Document the webhook setup (filter, projection, secret) in the README.
  _Covers:_ FOUND-R23 · _Verify:_ `npm run test -- revalidate`

## Phase E — Quality pipeline

- [ ] **T11 — Lighthouse CI and the `check` script** _(lightweight model)_
  Install `@lhci/cli` (dev). Add `lighthouserc.json` (start server, `/`, desktop and mobile, 3 runs, minScore 1 for all four categories, results to `.lighthouseci/` which is git-ignored). Add the `test:lh` and `check` scripts. Fix any audit below 100.
  _Covers:_ FOUND-R19, R20 · _Verify:_ `npm run check` passes

- [ ] **T12 — UX screenshot script** _(lightweight model)_
  Write `scripts/ux-screens.mjs <feature> <route...>`. It uses Playwright to capture full-page PNGs at 375, 768, 1280, and 1920 px in light and dark mode into `specs/<feature>/review/screenshots/`.
  _Covers:_ FOUND-R21 · _Verify:_ `npm run ux:screens -- 001-foundation /` produces 8 PNGs

- [ ] **T13 — GitHub Actions** _(lightweight model)_
  Add `.github/workflows/check.yml` (on: pull_request and push to main; Node from `.nvmrc`; `npm ci`; `npx playwright install --with-deps`; `npm run check`; Sanity variables from repo secrets; upload Playwright and LHCI reports on failure). Document the required repo secrets in the README.
  _Covers:_ FOUND-R22 · _Verify:_ open a PR and the check runs. The owner enables "require status check" in branch protection.

## UX review

- [ ] AI review agent: run `npm run ux:screens -- 001-foundation /`, compare the screenshots to the spec checklist and the Figma frame `10:13`, and write `review/findings.md`
- [ ] Fix blocking findings
- [ ] Owner sign-off, then mark spec 001 **Done** and update the roadmap

## Owner actions (outside the codebase)

- [ ] Create a Sanity **Viewer** API token and set `SANITY_API_READ_TOKEN` in `.env.local` and Vercel
- [ ] Generate `SANITY_REVALIDATE_SECRET`, then create the Sanity webhook (documented in T10) pointing to `https://<domain>/api/revalidate`
- [ ] Add the Sanity variables as GitHub repo secrets (T13) and enable branch protection
- [ ] Update the Figma primary, accent, muted-foreground, and destructive colors to the AAA values
