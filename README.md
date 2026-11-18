This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Sanity setup

1. Copy `env.example` to `.env.local` and fill in the values. `.env.local` is git-ignored, so never commit tokens.
2. **Draft mode / Visual Editing:** in [sanity.io/manage](https://sanity.io/manage) → API → Tokens, create a **Viewer** token and set it as `SANITY_API_READ_TOKEN` in `.env.local` and in Vercel. Then open `/studio` → Presentation.
3. **Publish webhook** (content updates without a redeploy): generate a random secret (`openssl rand -hex 32`) and set it as `SANITY_REVALIDATE_SECRET`. Then go to sanity.io/manage → API → Webhooks → Create:
   - URL: `https://<your-domain>/api/revalidate` · Method: `POST` · Trigger on: create, update, delete
   - Filter: `!(_id in path("drafts.**"))`
   - Projection: `{_type, "slug": slug.current}`
   - Secret: the same value as `SANITY_REVALIDATE_SECRET`
4. **Types:** after changing schemas or GROQ queries, run `npm run typegen` and commit the updated `sanity.types.ts`.
5. **Site shell content:** the header and footer come from the `siteSettings` and `navigation` singletons (Studio → "Site settings" and "Navigation"). To create them in a new dataset, run `npx sanity documents create sanity/seed/shell.json --missing` (`--missing` never overwrites existing documents). Without them, the site still renders a minimal header and footer.
6. **SEO and FAQ content:** `sanity/seed/seo.json` holds six FAQ documents and the "SEO and business" values for `siteSettings` (home title, default description, business description, Portland, OR, and areas served). Run `npx sanity documents create sanity/seed/seo.json --missing` to create missing documents without overwriting existing content. `--missing` skips `siteSettings` if it already exists; enter its SEO values in Studio → "Site settings" → "SEO and business". Do not apply the full seed with `--replace`: it overwrites both site settings (including social links) and all six FAQs, discarding any edited questions and answers. All of this copy is **placeholder** content (answers start with "Placeholder:") and must be replaced before launch (roadmap 011).
7. **Page-builder content (004):** after the FAQ seed, run `npx sanity documents create sanity/seed/pages.json --missing`, then `npx sanity exec scripts/seed-hero-image.ts --with-user-token` using a Sanity account with write access. This creates the Home page singleton (six Figma sections), the noindex `page-builder-demo` page (all eight blocks), and a clearly labelled example testimonial. The image script uploads `sanity/seed/hero-placeholder.jpg` only if a hero needs an image and never replaces an existing image. Re-running either command preserves existing editor content. Home and published Page documents render through the page builder at `/` and `/{slug}`. The 2400 × 1350 decorative gradient and example testimonial are **placeholders** to replace before launch (011); the home hero must use an owner-supplied licensed photo. Home service-card links target planned 006 routes, which are not implemented yet.

Cache tags follow `<_type>` and `<_type>:<slug>` (see `src/sanity/fetch.ts`). Local production builds reuse fetched content from `.next/cache`; if you change content without the webhook, run `rm -rf .next/cache` before `npm run build`.

## Quality checks

- `npm run check` runs lint, typecheck, unit tests (Vitest), build, end-to-end and accessibility tests (Playwright + axe), and Lighthouse CI (score 100 required in every category, mobile and desktop). If port 3000 is busy, use `PORT=3100 npm run check`.
- `npm run ux:screens -- <feature> <routes...>` captures UX review screenshots (375, 768, 1280, and 1920 px, light and dark) from a running server into `specs/<feature>/review/screenshots/`.
- **GitHub Actions** (`.github/workflows/check.yml`) runs `npm run check` on every PR and on pushes to `main`. Add these repository secrets (Settings → Secrets and variables → Actions): `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN`, `SANITY_REVALIDATE_SECRET`. Then enable branch protection on `main` with the **check** status required.

## Launch Readiness Checklist

Before shipping a client project from this template, review the following:

- Set `NEXT_PUBLIC_SITE_URL` to the production origin, and fill Studio → "Site settings" → "SEO and business" (home title, descriptions, location, social links). Replace all placeholder copy.
- Review `AI_TRAINING_AGENTS` in `src/lib/seo/robots.ts`: AI training crawlers are blocked; search engines and AI search and answer agents are allowed.
- Confirm the sitemap and social share images are appropriate for the launch brand.
- Replace the page-builder hero gradient with a licensed photo, review all Figma home copy, and remove or replace the example testimonial before launch. Keep the demo page noindex.
- Verify accessibility basics such as semantic headings, keyboard focus visibility, and skip links.
- Ensure HTTPS, CSP, and security headers are enabled in the production environment.
- Review analytics, consent, and any forms or APIs before public launch.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
