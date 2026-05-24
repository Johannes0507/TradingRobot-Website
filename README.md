# LendAuto Website

Marketing website for **LendAuto** — automated Bitfinex margin funding quoting tool. SEO-first, AI Search friendly, built for performance.

> **Status:** Pre-launch. GCP deployment (Firebase Hosting + Cloud Run Functions + Cloud Scheduler) deferred — current focus is frontend.

## Stack

- **Astro 6** (SSG) — content-first, ships ~0 JS for static pages
- **React 19 islands** — only for interactive bits (WebGL mesh, holographic card tilt, sticky-scroll, copy buttons)
- **Tailwind v4** — design tokens via `@theme`, shareable with the v2 product app
- **TypeScript strict** + **MDX** content collections

## Project Structure

```
├── web/                 # ★ Astro 6 production site
│   ├── src/
│   │   ├── pages/        # Routes (index, /blog, /guides, llms.txt, rss.xml)
│   │   ├── components/   # .astro section components
│   │   │   ├── islands/   #   React 19 islands (LumenMesh, HeroPanel, StickyScrollStage, forms, RoiCalculator)
│   │   │   └── mdx/       #   MDX-only components (Step, Mockup, Callout, mockups/)
│   │   ├── content/      # MDX guides + blog posts
│   │   ├── layouts/      # Base Layout (meta, OG, Schema.org)
│   │   ├── lib/          # CTA helpers + mock-data.ts (GCP swap point)
│   │   └── styles/       # tokens.css (shareable) + base.css
│   ├── public/           # robots.txt, favicons, screenshots/, static assets
│   └── DEPLOY.md         # (legacy Cloudflare guide; will be rewritten for GCP)
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
- **Mock-data swap point** (`web/src/lib/mock-data.ts`): every market/KPI/ROI number on the homepage flows through this single module. The GCP phase later replaces it with a build-time generator producing the same export shape; components don't change. See `docs/specs/2026-05-18-frontend-design-exploration.md` §6.1.
- **Image-led guides**: `/guides/*` use custom SVG mockups of the relevant Bitfinex / LendAuto screens (not real screenshots — legal safety + maintainability). Built with `Step` + `Mockup` MDX components and per-screen mockup files under `components/mdx/mockups/`.
- **Visual reference**: stripe.com is the canonical visual target. Anti-patterns documented in `docs/specs/2026-05-18-frontend-design-exploration.md` §3.
- **Design tokens — v2 Lumen palette** (`tokens.css`): ink `#0a2540` deep navy, brand `#635bff` Stripe iconic purple, mint `#14d9a8`, warm coral/amber retained. Brand colour is reserved for interactive elements only (icons, mesh, links, focus rings) — eyebrows / headlines / step labels stay in ink/mute per the Stripe restraint convention.
- **Hero animation stack**: `LumenMesh.tsx` WebGL displaced-plane mesh gradient as the background; `HeroPanel.tsx` single holographic card with 3D mouse tilt + cursor-following specular glare. Ported from `docs/reference/Stripe Website v2/`.

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

GCP integration (Firebase Hosting + Cloud Run Functions + Cloud Scheduler) is planned but not yet wired. The site builds to static HTML via `npm run build`. See `docs/specs/2026-05-18-frontend-design-exploration.md` §7 for the deferred GCP scope.

The legacy `web/DEPLOY.md` documents Cloudflare Pages — kept for reference, will be rewritten for GCP when that phase starts.
