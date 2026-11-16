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

Cache tags follow `<_type>` and `<_type>:<slug>` (see `src/sanity/fetch.ts`).

## Quality checks

- `npm run check` runs lint, typecheck, unit tests (Vitest), build, end-to-end and accessibility tests (Playwright + axe), and Lighthouse CI (score 100 required in every category, mobile and desktop). If port 3000 is busy, use `PORT=3100 npm run check`.
- `npm run ux:screens -- <feature> <routes...>` captures UX review screenshots (375, 768, 1280, and 1920 px, light and dark) from a running server into `specs/<feature>/review/screenshots/`.
- **GitHub Actions** (`.github/workflows/check.yml`) runs `npm run check` on every PR and on pushes to `main`. Add these repository secrets (Settings → Secrets and variables → Actions): `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN`, `SANITY_REVALIDATE_SECRET`. Then enable branch protection on `main` with the **check** status required.

## Launch Readiness Checklist

Before shipping a client project from this template, review the following:

- Update the site metadata in the environment variables and in the shared config for title, description, keywords, and social links.
- Review the robots rules to ensure the intended search and AI crawlers are allowed while suspicious or unknown agents remain blocked.
- Confirm the sitemap and social share images are appropriate for the launch brand.
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
