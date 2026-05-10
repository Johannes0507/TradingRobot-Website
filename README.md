# LendAuto Website

Marketing website for **LendAuto** — an automated Bitfinex USD lending robot. SEO-first, AI Search friendly, built for performance.

> **Live:** _coming soon (deploys to Cloudflare Pages, see [`web/DEPLOY.md`](./web/DEPLOY.md))_

## Stack

- **Astro 6** (SSG) — content-first, ships ~0 JS for static pages
- **React 19 islands** — only for interactive bits (WebGL hero, copy buttons)
- **Tailwind v4** — design tokens via `@theme`, shareable with the v2 product app
- **TypeScript strict** + **MDX** content collections

## Project Structure

```
├── web/                 # ★ Astro 6 production site
│   ├── src/
│   │   ├── pages/        # Routes (index, /blog, /guides, llms.txt, rss.xml)
│   │   ├── components/   # .astro components + /islands (React)
│   │   ├── content/      # MDX guides + blog posts
│   │   ├── layouts/      # Base Layout (meta, OG, Schema.org)
│   │   ├── lib/          # CTA helpers, utilities
│   │   └── styles/       # tokens.css (shareable) + base.css
│   ├── public/           # robots.txt, favicons, static assets
│   └── DEPLOY.md         # Cloudflare Pages deployment guide
│
├── _legacy/             # Original CDN-React prototype (reference)
│   ├── LendAuto.html     # Full standalone HTML prototype
│   └── *.jsx             # React components used by prototype
│
├── docs/                # Design references and project documents
│   ├── images/           # Reference screenshots & UI mockups
│   ├── prompts/          # Project handover docs (gitignored)
│   └── frontend-video/   # Animation reference videos (gitignored)
│
└── backend/             # Reserved for marketing-site backend (currently empty;
                          # the actual product backend lives in
                          # Bitfinex-lending-robot-v2)
```

## Architecture Decisions

- **Subscription flow**: marketing site never owns auth/payment. CTAs jump to `app.lendauto.com` (the v2 product app). See `src/lib/cta.ts`.
- **AI Search friendly**: pure SSG output means GPTBot / ClaudeBot / PerplexityBot get full HTML — they don't run JS, so SPAs are invisible to them. Astro is purpose-built for this.
- **Design tokens** (`web/src/styles/tokens.css`) are deliberately a single CSS file — copy/symlink into v2 to keep the two products visually consistent.

## Development

```bash
cd web
npm install
npm run dev          # → http://localhost:4321
npm run build        # → web/dist (production static)
npm run preview      # serve the production build locally
```

## Content authoring

- **Blog post**: drop a `.md` or `.mdx` file into `web/src/content/blog/` with the schema in `web/src/content.config.ts`
- **Guide**: drop into `web/src/content/guides/` — uses richer schema (difficulty, readTime, order, topic)

## Deployment

See [`web/DEPLOY.md`](./web/DEPLOY.md) for Cloudflare Pages setup.
