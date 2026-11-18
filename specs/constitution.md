# Constitution — Wy'east Digital Studio website

**Status:** Approved · **Version:** 2.0.0

These principles override any individual spec, plan, or task. If a spec conflicts with the constitution, the constitution wins. Change it only through an amendment that the owner approves (see the end of this file).

## 1. Purpose

The site is the studio's primary **lead-generation** tool. It shows small businesses in the Pacific Northwest that Wy'east Digital Studio builds bespoke, highly accessible, search- and AI-discoverable websites, and the site itself must prove it. Every feature must support at least one of these:

1. Convert visitors into inquiries or booked calls.
2. Demonstrate craft, accessibility, and performance by example.
3. Be discoverable through search engines (SEO), generative engines (GEO), and answer engines (AEO).

## 2. Brand and voice

- Voice: **bespoke, crafted, Pacific Northwest, approachable, professional.** Write in plain language, avoid jargon, and keep a warm but confident tone.
- Visual design follows the Figma file. Figma is the source of truth for layout, spacing, and type, and the `Wy'east` design tokens are the source of truth for color and radius.
- Use only design tokens (`bg-background`, `text-primary`, `rounded-lg`, …). Raw hex, OKLCH, or arbitrary values in components are prohibited unless the plan justifies them.
- Light and dark themes are both first-class and must be verified in both modes. The default follows the OS preference (`prefers-color-scheme`), and a user toggle overrides it.
- **Mobile-first.** Base styles target the smallest viewport (375 px), and larger layouts are added with `sm:`/`md:`/`lg:`/`xl:` min-width breakpoints. Desktop-first `max-*` overrides need a justification in the plan. Specs and Figma reviews start at mobile.

## 3. Technology stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19, Server Components by default) |
| CMS | Sanity v6, embedded Studio at `/studio` |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) + shadcn/ui (`base-nova`, Base UI primitives) |
| Language | TypeScript, `strict` mode |
| Hosting | Vercel |
| Node | Version pinned in `.nvmrc` |

- **Read the bundled docs first.** Before using any Next.js API, read the relevant guide in `node_modules/next/dist/docs/`, since this version differs from older training data. Do the same with current Sanity docs for Sanity APIs.
- Use Server Components by default. Add `'use client'` only for interactivity, keep it as low in the tree as possible, and justify it in the plan.
- New runtime dependencies must be named and justified in a plan and approved. Prefer the platform and existing deps.

### 3.1 Component architecture (presentational components)

- **UI components are presentational ("dumb").** They receive data and callbacks through typed props and render them. They do not fetch data, run GROQ queries, read global state, or contain business logic.
- **Logic lives higher up**, in route files (`page.tsx`/`layout.tsx`), server-side data loaders, Server Actions, or small container components and hooks that pass plain props down.
- Prop types are derived from TypeGen query results (for example `NonNullable<HOME_QUERY_RESULT>['hero']`), so components and content stay in sync.
- Components must be renderable in isolation with fixture props, which makes them easy to test with Vitest.
- **Global client state:** use local `useState` or URL state first. If state has to be shared across distant client components, use **Zustand**, with one small, typed store per domain in `src/stores/`. Never use Zustand for server or CMS data, which comes from Server Components. Read stores in containers or hooks, not in presentational components.

## 4. Content model (Sanity)

- **Page builder for every page.** Every page, including Home, Services overview, About, Process, and Contact, is composed in Sanity from an ordered array of reusable section blocks. The block library, Studio validation, and design tokens keep pages on-brand; new layouts are added as new blocks, not as one-off templates. Collection item pages (for example a service detail page) may use structured fields when their content is uniform.
- Global settings (navigation, footer, contact details, SEO defaults, social links) live in singleton documents.
- Every routable document has an SEO object (title, description, OG image, `noindex`) and a unique slug.
- Every image field requires **alt text** (or an explicit "decorative" flag) through validation.
- **Visual Editing** (Presentation tool and draft mode) must work for every routable page.
- **Sanity TypeGen** generates types for the schema and all GROQ queries. Hand-written content types are prohibited. Queries live in one module and use `defineQuery`.

## 5. Accessibility: WCAG 2.2 AA required, AAA where practical

- Every page meets **WCAG 2.2 AA**. Also meet these AAA criteria wherever feasible: 1.4.6 (contrast 7:1 for body text), 2.4.9 (link purpose from the link alone), 2.4.13 (focus appearance), 2.5.5 (target size 44×44 px), and 3.1.5 (reading level, using plain language).
- Use semantic HTML first and ARIA only when needed. Each page has one `h1` and a logical heading order, landmarks, and a skip link.
- Everything works with only a keyboard and a visible focus indicator.
- Honor `prefers-reduced-motion`. Animation is never required to understand content.
- Forms have labels, descriptions, and inline errors, and they announce errors to screen readers.
- Automated axe checks are necessary but **not sufficient**. The UX review includes manual keyboard and screen-reader checks.

## 6. Performance

- **Lighthouse 100** in Performance, Accessibility, Best Practices, and SEO on mobile and desktop for every page template.
- **Core Web Vitals "Good"** at the 75th percentile: LCP ≤ 2.5 s (target ≤ 2.0 s), INP ≤ 200 ms, CLS ≤ 0.1.
- Use `next/image` with Sanity image URLs sized for each image. The LCP image gets priority loading and every image has explicit dimensions.
- Use `next/font` with subsetting and no layout shift.
- Third-party embeds (for example the booking widget) load lazily and must not hurt the Lighthouse score on any page.

## 7. SEO, GEO, and AEO

- Each page has its own title and description, a canonical URL, Open Graph and Twitter metadata, and entries in the sitemap and robots rules.
- Use structured data (JSON-LD) where it applies: `Organization`/`ProfessionalService` with a PNW service area, `WebSite`, `BreadcrumbList`, `Service`, `FAQPage`, and `Person`.
- Write content to be answerable. Pages include clear question-led headings, short direct answers, and FAQs, which help with AEO and GEO.
- Publish `llms.txt` and keep the existing crawler allowlist in `robots.ts` intentional.
- All indexable content is server-rendered.

## 8. Security and privacy

- Never commit secrets. Every environment variable is documented in `env.example`.
- Validate form input on the server, and protect forms against spam (honeypot plus rate limiting or a CAPTCHA, decided per spec).
- Keep the existing security headers and CSP. Any new third-party origin requires a CSP change in the same task.
- Collect no more personal data than needed, and publish a privacy notice if forms collect personal data.

## 9. Quality gates (Definition of Done)

A task is done only when **all** of these pass:

1. `npm run lint` and `tsc --noEmit` pass with no errors.
2. **Vitest** unit and component tests pass for new logic.
3. **Playwright** end-to-end tests cover the feature's acceptance criteria.
4. **axe** (via `@axe-core/playwright`) reports zero violations on affected pages, in light and dark mode.
5. **Lighthouse CI** meets the budgets in §6.
6. `npm run build` passes.
7. Tests reference the requirement IDs they verify.

A **feature** is done when all its tasks are done and it has passed the **UX review**:

- An AI review agent captures screenshots at 375, 768, 1280, and 1920 px in light and dark mode, then compares them to the spec's UX checklist and the Figma frames.
- Findings are recorded in `specs/NNN-feature/review/`. Blocking findings are fixed.
- **The owner signs off.**

## 10. Cost-effective delivery

- Keep tasks **small and well scoped**: each touches as few files as practical and can be verified on its own, so AI work stays cheap and reviewable.
- Reuse existing components, schema types, and test helpers before adding new ones. Never generate something that already exists.
- Run the **smallest validation that covers the change** while working (for example one test file). Run the full Definition of Done suite once, when the task is complete.
- Delegate routine code generation to lighter, cheaper AI models. Use heavier models only for planning, complex debugging, or review.
- Don't over-engineer. Build only what the approved spec requires; any extra ideas go in the spec's Open questions.

## 11. Code conventions

- File and folder names are kebab-case, components are PascalCase, and exports are named. Use the `@/` alias.
- `src/components/ui`: shadcn primitives (generated, edited minimally). `src/components/sections`: page and builder sections (presentational). `src/sanity/schemas`: schema types. `src/sanity/queries.ts`: GROQ queries. `src/stores`: Zustand stores.
- Comment only where code needs clarification.
- Use Conventional Commits that reference the feature (for example `feat(contact): add inquiry form [CONTACT-R2]`).

## Amendments

Propose amendments by editing this file in a PR or task with the reason stated. Bump the version (major for removing or redefining a principle, minor for adding one, patch for wording). The owner must approve each amendment.

### Amendment log

- **2.0.0 (2026-11-18):** §4 replaces the hybrid model (fixed templates for core pages, page builder for landing pages) with the page builder for every page. Reason: owner decision Q-A in [004 Page builder](./004-page-builder/spec.md).
