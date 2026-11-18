# Roadmap

**Status:** Approved

Features are built in this order. Each one goes through the spec → plan → tasks → implement → UX review flow described in [README.md](./README.md).

| # | Feature | Depends on | Status |
| --- | --- | --- | --- |
| 001 | **Foundation**: testing toolchain (Vitest, Playwright, axe, Lighthouse CI), fonts, theme toggle, TypeGen, Sanity Visual Editing and draft mode, the `.dark` class wired through `next-themes` | — | In progress |
| 002 | **Site shell**: header and navigation, footer, skip link, the `siteSettings`/`navigation` singletons, and 404 and error pages | 001 | Done (UX review checks deferred by owner, 2026-11-17) |
| 003 | **SEO, GEO, and AEO system**: SEO object, metadata from Sanity, JSON-LD builders, sitemap from content, `llms.txt`, and FAQ block | 001 | Implemented; UX review pending |
| 004 | **Page builder**: section block library (hero, trust bar, feature grid, CTA banner, process steps, FAQ, rich text, testimonials), the `page` type, and the Home page singleton | 002, 003 | In progress (spec, plan, and tasks approved) |
| 005 | **Home page**: final home copy and the licensed hero photo on the page builder (the Home page singleton and seeded sections arrive in 004), plus the booking section once 009 is ready | 004, 009 | [Spec drafted](./005-home-page/spec.md); awaiting approval; all implementation waits for 009 (owner, 2026-11-18) |
| 006 | **Services**: overview and service detail pages | 004 | Not started |
| 007 | **Process page** (no Figma design yet) | 004 | Not started |
| 008 | **About page** | 004 | Not started |
| 009 | **Contact**: inquiry form with email notification, Google Workspace booking embed, spam protection, and privacy notice | 002, 003 | Not started |
| 010 | **Accessibility and audit request**: a page detailing the studio's accessibility service, with a form to request an audit of an existing website (reuses the 009 form infrastructure) | 004, 009 | Not started |
| 011 | **Launch readiness**: final Lighthouse and axe audit, CSP review, analytics and consent, Vercel production setup, replace placeholder copy (FAQ answers, business description, home title) | all | Not started |
