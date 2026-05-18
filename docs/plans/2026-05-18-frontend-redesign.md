# LendAuto Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the frontend redesign per `docs/specs/2026-05-18-frontend-design-exploration.md` — reorder IA per user-fear priority, rewrite copy to "實戰質感" tone, add 3 new widgets (MarketDashboard, Architecture, RoiBlock) and 2 form islands, clean up cross-file copy violations.

**Architecture:** Astro 6 SSG; React 19 islands for interactive bits only; TailwindCSS 4 with `@theme` design tokens; mock data centralized in `web/src/lib/mock-data.ts` to enable zero-touch GCP swap-in later.

**Tech Stack:** Astro 6, React 19, TailwindCSS 4, TypeScript, WebGL (existing FluidRibbon)

**Working directory:** All paths are relative to repo root `C:\Users\Keith.Lee\Johannes\Bitfinex-lending-robot-Website`. The Astro project lives at `web/`.

**Testing convention:** No test runner installed. Each task ends with:
1. `cd web && npx astro check` — type/import errors
2. `cd web && npm run build` — production build passes
3. Spot-check visually via `cd web && npm run dev` (port 4321) when relevant

**Commit convention:** Conventional commits (`feat:` / `refactor:` / `chore:` / `fix:`). Each task = one commit. Co-author footer:
```
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## File Structure Overview

### Created files
| Path | Purpose |
|------|---------|
| `web/src/lib/mock-data.ts` | Centralized mock constants (market data, KPIs, ROI params) — future GCP swap point |
| `web/src/components/Sparkline.astro` | Pure-SVG inline sparkline utility, no chart library |
| `web/src/components/MarketDashboard.astro` | Bitfinex funding market 30-day overview (4 KPI cards + sparkline) |
| `web/src/components/Architecture.astro` | Trust section — SVG architecture diagram + 3 pillar cards + performance screenshot slot (replaces `Security.astro`) |
| `web/src/components/RoiBlock.astro` | Static-first ROI section — 3 scenario cards + breakeven headline |
| `web/src/components/WaitlistAndContact.astro` | 2-column container for waitlist + contact form islands |
| `web/src/components/islands/RoiCalculator.tsx` | Optional interactive ROI calculator (disclosure-expanded) |
| `web/src/components/islands/WaitlistForm.tsx` | Email waitlist form (UI-only, no backend) |
| `web/src/components/islands/ContactForm.tsx` | Name + email + message contact form (UI-only, no backend) |
| `web/public/screenshots/demo-performance-placeholder.png` | Placeholder image for static performance screenshot slot |

### Modified files
| Path | Change summary |
|------|----------------|
| `web/src/pages/index.astro` | Reorder sections per IA B; swap `Security` → `Architecture`; add 4 new components; update `<title>` |
| `web/src/components/Nav.astro` | Add `市場` nav item; change `立即開始` → `開始使用` |
| `web/src/components/Hero.astro` | Rewrite pill / headline / subhead per spec V1; replace KPI strip values |
| `web/src/components/Steps.astro` | Tighten headline + step 3 copy |
| `web/src/components/WhyHigher.astro` | Rewrite headline (remove `8% → 15-20%`); reword feature card descriptions |
| `web/src/components/Pricing.astro` | Add risk disclosure under cards |
| `web/src/components/CtaFooter.astro` | Replace CTA headline + subhead + button copy |
| `web/src/layouts/Layout.astro` | Replace default `description` prop |
| `web/src/components/StructuredData.astro` | Rewrite FAQ Q2 + Q4 + `orgSchema.description` + `serviceSchema.description` |
| `web/src/pages/llms.txt.ts` | Rewrite intro line that promises `8% → 15-20%` |

### Deleted files
| Path | Reason |
|------|--------|
| `web/src/components/Security.astro` | Replaced by `Architecture.astro` (same `#security` section id retained for back-compat) |

---

## Phase 0: Mock data foundation

### Task 1: Create `mock-data.ts`

**Files:**
- Create: `web/src/lib/mock-data.ts`

**Why:** Every later component imports from this. Centralized so the GCP phase later can swap a single file (`build-time fetcher` would generate this same export shape) without touching any component.

- [ ] **Step 1: Create the file with all mock constants**

Path: `web/src/lib/mock-data.ts`

```ts
/**
 * Centralized mock data for the LendAuto marketing site.
 *
 * Future GCP phase: this file will be replaced by a build-time generator
 * (Cloud Build pulling Bitfinex public API + LendAuto v2 stats endpoint).
 * The export *shape* below is the contract — keep field names stable.
 *
 * As-of date should reflect when the mock numbers were last sanity-checked.
 */

export const META = {
  asOf: '2026-05-18T00:00:00Z',
  source: 'Bitfinex Public API (mock during dev)',
} as const;

// ---------------------------------------------------------------------------
// Bitfinex funding market — pure market data (NOT LendAuto performance)
// ---------------------------------------------------------------------------

export const MARKET_DATA = {
  fusd30dAvgApr: 8.42,
  fust30dAvgApr: 6.18,

  // 30-day rolling extremes
  fusd30dHighApr: 38.40,
  fusd30dHighDate: '2026-04-22',
  fusd30dLowApr: 2.10,
  fusd30dLowDate: '2026-05-03',

  // Signed delta vs prior 30 days
  fusdVsPrevDelta: 0.30,
  fustVsPrevDelta: -0.10,

  // 30 daily-avg APR points for sparkline (oldest → newest)
  fusd30dDaily: [
    6.8, 7.1, 7.4, 8.0, 9.2, 12.4, 18.7, 38.4, 24.1, 14.2,
    10.3, 8.7, 7.9, 7.2, 6.9, 7.0, 7.3, 7.6, 8.1, 8.4,
    8.8, 9.3, 9.7, 10.2, 9.8, 9.1, 8.6, 8.2, 8.5, 8.42,
  ] as readonly number[],
} as const;

// ---------------------------------------------------------------------------
// Hero KPI strip
// ---------------------------------------------------------------------------

export const HERO_KPIS = {
  fusd30dAvgApr: MARKET_DATA.fusd30dAvgApr,
  rateRefreshSec: 30,
} as const;

// ---------------------------------------------------------------------------
// ROI calculator parameters
// ---------------------------------------------------------------------------

export const ROI_PARAMS = {
  apr: MARKET_DATA.fusd30dAvgApr / 100, // 0.0842
  proPriceTwd: 899,
  twdPerUsd: 30,
  proPriceUsd: 28, // displayed integer; 899 / 30 ≈ 29.97
  scenarios: [1000, 10000, 50000] as const,
} as const;

// ---------------------------------------------------------------------------
// Pure calculation helpers (used by RoiBlock + RoiCalculator island)
// ---------------------------------------------------------------------------

export function monthlyGross(capitalUsd: number, apr: number): number {
  return (capitalUsd * apr) / 12;
}

export function monthlyNet(capitalUsd: number, apr: number, monthlyFeeUsd: number): number {
  return monthlyGross(capitalUsd, apr) - monthlyFeeUsd;
}

export function breakevenCapital(apr: number, monthlyFeeUsd: number): number {
  return (monthlyFeeUsd * 12) / apr;
}
```

- [ ] **Step 2: Type-check**

Run: `cd web && npx astro check`
Expected: passes (no errors related to new file). May show pre-existing warnings — those are not new.

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/mock-data.ts
git commit -m "$(cat <<'EOF'
feat(web): add centralized mock-data module

Single source of truth for market numbers, hero KPIs, and ROI parameters.
Future GCP build-time fetcher will replace this file with a generated
version of the same shape — component layer needs zero changes.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 1: Utility component

### Task 2: Create `Sparkline.astro`

**Files:**
- Create: `web/src/components/Sparkline.astro`

**Why:** `MarketDashboard` needs a 30-point line chart. Pure SVG avoids pulling in a chart library (50-100kb saved).

- [ ] **Step 1: Create the file**

Path: `web/src/components/Sparkline.astro`

```astro
---
export interface Props {
  data: readonly number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  markHighLow?: boolean;
  ariaLabel?: string;
}

const {
  data,
  width = 800,
  height = 120,
  strokeWidth = 2,
  markHighLow = true,
  ariaLabel = 'sparkline',
} = Astro.props;

const min = Math.min(...data);
const max = Math.max(...data);
const range = max - min || 1;
const stepX = data.length > 1 ? width / (data.length - 1) : 0;

function toY(v: number): number {
  // 12px padding top/bottom so endpoints don't kiss the edges
  const pad = 12;
  const usable = height - pad * 2;
  return pad + (1 - (v - min) / range) * usable;
}

const points = data.map((v, i) => `${i * stepX},${toY(v)}`);
const polyline = points.join(' ');

// Build SVG path with smooth(ish) join — straight segments are fine for sparklines.
const path = points.reduce((acc, p, i) => acc + (i === 0 ? `M ${p}` : ` L ${p}`), '');

const highIdx = data.indexOf(max);
const lowIdx = data.indexOf(min);

const gradientId = `spark-${Math.random().toString(36).slice(2, 9)}`;
---

<svg
  viewBox={`0 0 ${width} ${height}`}
  width="100%"
  height={height}
  role="img"
  aria-label={ariaLabel}
  preserveAspectRatio="none"
>
  <defs>
    <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#635bff" />
      <stop offset="50%" stop-color="#fb7185" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
  </defs>

  <path
    d={path}
    fill="none"
    stroke={`url(#${gradientId})`}
    stroke-width={strokeWidth}
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  {
    markHighLow && (
      <>
        <circle cx={highIdx * stepX} cy={toY(max)} r="4" fill="#fb7185" />
        <circle cx={lowIdx * stepX} cy={toY(min)} r="4" fill="#635bff" />
      </>
    )
  }
</svg>
```

- [ ] **Step 2: Type-check**

Run: `cd web && npx astro check`
Expected: passes

- [ ] **Step 3: Commit**

```bash
git add web/src/components/Sparkline.astro
git commit -m "$(cat <<'EOF'
feat(web): add Sparkline.astro pure-SVG line chart utility

Used by MarketDashboard for 30-day funding rate. Pure SVG with brand
gradient stroke, optional high/low markers. No chart library dependency.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 2: New section components (in IA B order)

### Task 3: Create `MarketDashboard.astro`

**Files:**
- Create: `web/src/components/MarketDashboard.astro`

**Why:** Spec §5.3. First post-Hero section. Proves "Bitfinex funding market is a real opportunity, with public data" before any LendAuto-specific claim.

- [ ] **Step 1: Create the file**

Path: `web/src/components/MarketDashboard.astro`

```astro
---
import { MARKET_DATA, META } from '../lib/mock-data';
import Sparkline from './Sparkline.astro';

const fmtPct = (n: number) => `${n.toFixed(2)}%`;
const fmtDelta = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}`;
const fmtDate = (iso: string) => iso.slice(0, 10);

const cards = [
  {
    label: 'fUSD · 30 日平均',
    value: fmtPct(MARKET_DATA.fusd30dAvgApr),
    sub: `vs 前 30 日 ${fmtDelta(MARKET_DATA.fusdVsPrevDelta)}`,
  },
  {
    label: 'fUST · 30 日平均',
    value: fmtPct(MARKET_DATA.fust30dAvgApr),
    sub: `vs 前 30 日 ${fmtDelta(MARKET_DATA.fustVsPrevDelta)}`,
  },
  {
    label: 'fUSD · 30 日高點',
    value: fmtPct(MARKET_DATA.fusd30dHighApr),
    sub: `↗ ${fmtDate(MARKET_DATA.fusd30dHighDate)} · spike event`,
  },
  {
    label: 'fUSD · 30 日低點',
    value: fmtPct(MARKET_DATA.fusd30dLowApr),
    sub: `↘ ${fmtDate(MARKET_DATA.fusd30dLowDate)} · low-vol day`,
  },
];

const asOfLocal = new Date(META.asOf).toLocaleDateString('zh-TW');
---

<section id="market" class="py-[140px] bg-bg-soft relative">
  <div class="max-w-7xl mx-auto px-6 lg:px-12">
    <div class="max-w-2xl mb-12">
      <div class="text-xs font-mono font-semibold text-brand uppercase tracking-wider mb-4">
        Market Data
      </div>
      <h2
        class="text-4xl lg:text-5xl font-display font-bold text-ink leading-[1.1] tracking-tight mb-5"
      >
        Bitfinex Funding Market
      </h2>
      <p class="text-lg text-ink-soft">
        過去 30 日公開市場數據，來自 Bitfinex Public API。LendAuto 自動報價就跑在這個市場上。
      </p>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {
        cards.map((c) => (
          <div class="p-6 rounded-2xl bg-bg border border-line-soft">
            <div class="text-xs font-mono text-mute uppercase tracking-wider mb-3">{c.label}</div>
            <div class="text-3xl lg:text-4xl font-mono font-bold text-ink mb-2 tracking-tight">
              {c.value}
            </div>
            <div class="text-xs text-mute font-mono">{c.sub}</div>
          </div>
        ))
      }
    </div>

    <div class="p-6 rounded-2xl bg-bg border border-line-soft">
      <div class="flex items-baseline justify-between mb-4">
        <div class="text-xs font-mono text-mute uppercase tracking-wider">
          fUSD · 30 日利率走勢
        </div>
        <div class="text-xs font-mono text-mute">
          {fmtDate(MARKET_DATA.fusd30dLowDate)} — {fmtDate(MARKET_DATA.fusd30dHighDate)}
        </div>
      </div>
      <Sparkline
        data={MARKET_DATA.fusd30dDaily}
        height={140}
        ariaLabel="Bitfinex fUSD 過去 30 日每日平均年化利率"
      />
    </div>

    <p class="text-xs text-mute font-mono mt-6">
      資料來源：Bitfinex Public API（截至 {asOfLocal}）。本區塊全部數據與 LendAuto 自身績效無關。
    </p>
  </div>
</section>
```

- [ ] **Step 2: Type-check + build**

Run:
```
cd web && npx astro check
cd web && npm run build
```
Expected: both pass.

- [ ] **Step 3: Commit**

```bash
git add web/src/components/MarketDashboard.astro
git commit -m "$(cat <<'EOF'
feat(web): add MarketDashboard section

Bitfinex funding market 30-day overview: 4 KPI cards (fUSD/fUST avg,
high/low) + 30-point sparkline. Pure market data, no LendAuto claims.
Uses mock-data.ts which will be swapped at GCP integration phase.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Create `Architecture.astro` (replaces `Security.astro`)

**Files:**
- Create: `web/src/components/Architecture.astro`
- (`Security.astro` deletion happens in Task 16 alongside `index.astro` rewire — keep it around until then so the site keeps building)

**Why:** Spec §5.4. Trust-building section. Inline SVG architecture diagram + 3 pillar cards + static performance screenshot slot. Replaces `Security.astro` with expanded content while keeping `#security` anchor.

- [ ] **Step 1: Create the file**

Path: `web/src/components/Architecture.astro`

```astro
---
const pillars = [
  {
    n: '01',
    title: 'API 權限只勾 Funding',
    desc: '你在 Bitfinex 生成 API Key 時，只勾 Funding scope，不勾 Withdrawals 與 Trading。Bitfinex 端強制執行，LendAuto 後端即使有 key 也無法繞過。',
    tag: 'scope: funding_only',
  },
  {
    n: '02',
    title: 'AES-256-GCM 加密儲存',
    desc: 'API Key 在資料庫是密文，envelope encryption + per-tenant key。LendAuto 工程師也看不到明文。',
    tag: 'AES-256-GCM · envelope',
  },
  {
    n: '03',
    title: '資金永遠在你的 Bitfinex 帳號',
    desc: 'LendAuto 是掛單代理人，不是 custodian。我們不開錢包、不持有資產、不經手任何提款。',
    tag: 'custody: self',
  },
];
---

<section id="security" class="py-[140px] relative">
  <div class="max-w-7xl mx-auto px-6 lg:px-12">
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-20 items-start">
      <!-- Left: sticky headline -->
      <div class="lg:sticky lg:top-32">
        <div class="text-xs font-mono font-semibold text-brand uppercase tracking-wider mb-4">
          架構與安全
        </div>
        <h2
          class="text-4xl lg:text-5xl font-display font-bold text-ink leading-[1.1] tracking-tight mb-6"
        >
          你的錢，<br />我們從來<br />沒碰過。
        </h2>
        <p class="text-lg text-ink-soft mb-7">
          把自動化交給我們，把保管留給你自己。三個技術約束讓「我們即使想拿也拿不到」。
        </p>
      </div>

      <!-- Right: diagram + pillars + screenshot -->
      <div class="flex flex-col gap-10">
        <!-- Architecture diagram -->
        <div class="p-7 rounded-2xl bg-bg-soft border border-line-soft">
          <div class="text-xs font-mono text-mute uppercase tracking-wider mb-5">
            資料流架構
          </div>
          <svg viewBox="0 0 720 280" class="w-full h-auto" role="img" aria-label="LendAuto 系統架構圖">
            <!-- Boxes -->
            <g font-family="JetBrains Mono, monospace" font-size="13" fill="#1a1f36">
              <!-- User -->
              <rect x="20" y="50" width="160" height="80" rx="12" fill="#ffffff" stroke="#1a1f3614" />
              <text x="100" y="80" text-anchor="middle" font-weight="700">你的 Bitfinex</text>
              <text x="100" y="100" text-anchor="middle" font-weight="700">Account</text>
              <text x="100" y="118" text-anchor="middle" fill="#6b7280" font-size="11">資金 custody</text>

              <!-- LendAuto Server -->
              <rect x="280" y="50" width="160" height="80" rx="12" fill="#ffffff" stroke="#635bff40" />
              <text x="360" y="80" text-anchor="middle" font-weight="700" fill="#635bff">LendAuto</text>
              <text x="360" y="100" text-anchor="middle" font-weight="700" fill="#635bff">Server</text>
              <text x="360" y="118" text-anchor="middle" fill="#6b7280" font-size="11">掛單代理</text>

              <!-- Bitfinex API -->
              <rect x="540" y="50" width="160" height="80" rx="12" fill="#ffffff" stroke="#1a1f3614" />
              <text x="620" y="80" text-anchor="middle" font-weight="700">Bitfinex</text>
              <text x="620" y="100" text-anchor="middle" font-weight="700">Funding API</text>
              <text x="620" y="118" text-anchor="middle" fill="#6b7280" font-size="11">scope: funding</text>

              <!-- Encrypted key box -->
              <rect x="280" y="180" width="160" height="60" rx="12" fill="#f59e0b14" stroke="#f59e0b40" />
              <text x="360" y="205" text-anchor="middle" font-weight="700" fill="#f59e0b">加密的 API Key</text>
              <text x="360" y="225" text-anchor="middle" fill="#6b7280" font-size="11">AES-256-GCM · 只能掛 funding 單</text>

              <!-- Forbidden withdrawal -->
              <text x="100" y="200" text-anchor="middle" fill="#ef4444" font-weight="700">提款路徑</text>
              <text x="100" y="220" text-anchor="middle" fill="#ef4444" font-size="11">✗ 不存在</text>
            </g>

            <!-- Arrows -->
            <g stroke="#1a1f3640" stroke-width="2" fill="none">
              <!-- User <-> Server (top) -->
              <path d="M 180 90 L 280 90" marker-end="url(#arrow)" />
              <!-- Server <-> Bitfinex API (top) -->
              <path d="M 440 90 L 540 90" marker-end="url(#arrow)" />
              <!-- Server uses encrypted key -->
              <path d="M 360 130 L 360 180" stroke="#f59e0b80" />
            </g>

            <!-- No-path X arrow from user to "提款路徑" -->
            <g stroke="#ef4444" stroke-width="2" fill="none" stroke-dasharray="6 4">
              <path d="M 100 130 L 100 175" />
            </g>

            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#1a1f3680" />
              </marker>
            </defs>
          </svg>
          <p class="text-xs text-mute font-mono mt-4 leading-relaxed">
            紅色虛線：API Key 上根本沒有 Withdrawal 權限，這條路徑在 Bitfinex 平台層就被擋掉，LendAuto 端再怎麼想也無法觸發。
          </p>
        </div>

        <!-- 3 pillar cards -->
        <div class="flex flex-col gap-4">
          {
            pillars.map((p) => (
              <div class="p-7 rounded-2xl bg-bg border border-line-soft flex gap-5 items-start shadow-sm">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-ink to-ink-soft text-white flex items-center justify-center flex-shrink-0 font-mono font-bold">
                  {p.n}
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-display font-bold text-ink mb-2 tracking-tight">
                    {p.title}
                  </h3>
                  <p class="text-[15px] text-ink-soft leading-relaxed mb-3">{p.desc}</p>
                  <div class="inline-block px-2.5 py-1.5 rounded-md font-mono text-xs text-ink-soft bg-line-soft">
                    {p.tag}
                  </div>
                </div>
              </div>
            ))
          }
        </div>

        <!-- Static performance screenshot slot -->
        <div class="p-7 rounded-2xl bg-bg-soft border border-line-soft">
          <div class="text-xs font-mono text-mute uppercase tracking-wider mb-3">
            績效樣張
          </div>
          <h3 class="text-lg font-display font-bold text-ink mb-3 tracking-tight">
            LendAuto 在 demo 帳號跑 30 日的實際表現
          </h3>
          <img
            src="/screenshots/demo-performance-placeholder.png"
            alt="LendAuto demo account 30 日績效截圖（placeholder，待真實資料更新）"
            class="w-full rounded-xl border border-line-soft"
            loading="lazy"
            decoding="async"
            width="1200"
            height="600"
          />
          <p class="text-xs text-mute font-mono mt-4 leading-relaxed">
            截圖內容無美化、無修圖、無剪輯。累積一段時間後會增加更多時間範圍的截圖。
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Type-check + build**

Run:
```
cd web && npx astro check
cd web && npm run build
```
Expected: passes. The `<img>` references a file that does not yet exist — Astro/Vite will still build because it's a runtime URL, but the image will 404 in browser. Task 5 fixes that.

- [ ] **Step 3: Commit**

```bash
git add web/src/components/Architecture.astro
git commit -m "$(cat <<'EOF'
feat(web): add Architecture section component

Trust-building section: SVG architecture diagram (user → server →
Bitfinex API + 'no withdrawal path' X-line), 3 pillar cards
(funding-only scope, AES-256-GCM, self-custody), static performance
screenshot slot. Replaces Security section content (handover happens
in index.astro rewire task).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Add demo performance placeholder image

**Files:**
- Create: `web/public/screenshots/demo-performance-placeholder.png`

**Why:** Spec §5.4 + Task 4. The `<img>` in Architecture references this path; without the file the section shows a broken-image icon.

- [ ] **Step 1: Create the screenshots folder**

Run:
```
mkdir -p web/public/screenshots
```

- [ ] **Step 2: Generate the placeholder PNG via SVG → PNG**

The fastest reproducible way without external image tools is to render an SVG with `[PLACEHOLDER]` text and convert via Node's built-in libraries. Since this project has no Sharp/ImageMagick installed, instead:

Create `web/public/screenshots/demo-performance-placeholder.svg` with the placeholder content:

Path: `web/public/screenshots/demo-performance-placeholder.svg`

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" width="1200" height="600">
  <rect width="1200" height="600" fill="#fafafa" />
  <rect x="20" y="20" width="1160" height="560" fill="none" stroke="#1a1f3614" stroke-dasharray="12 8" stroke-width="2" rx="20" />
  <text x="600" y="280" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="48" font-weight="700" fill="#1a1f36" letter-spacing="4">
    [ PLACEHOLDER ]
  </text>
  <text x="600" y="340" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="20" fill="#6b7280">
    待 LendAuto demo 帳號累積 30 日資料後手動更新
  </text>
  <text x="600" y="380" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="14" fill="#9ca3af">
    1200 × 600 px · web/public/screenshots/demo-performance-placeholder.png
  </text>
</svg>
```

Then update Architecture.astro to point at the `.svg` instead of `.png` (browsers render SVG natively in `<img>`):

Modify: `web/src/components/Architecture.astro` (the `<img src>` attribute)

Find:
```astro
src="/screenshots/demo-performance-placeholder.png"
```

Replace with:
```astro
src="/screenshots/demo-performance-placeholder.svg"
```

- [ ] **Step 3: Visual verify**

Run: `cd web && npm run dev`
Open: `http://localhost:4321/screenshots/demo-performance-placeholder.svg`
Expected: see `[ PLACEHOLDER ]` text on cream background with dashed border.

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add web/public/screenshots/demo-performance-placeholder.svg web/src/components/Architecture.astro
git commit -m "$(cat <<'EOF'
feat(web): add placeholder screenshot for performance slot

SVG placeholder with [PLACEHOLDER] watermark + instruction text. User
replaces with real demo-account screenshot after 30-day data accumulates.
Architecture.astro now references the SVG path.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Create `RoiBlock.astro` (static portion)

**Files:**
- Create: `web/src/components/RoiBlock.astro`

**Why:** Spec §5.7. "Static-first" — 3 pre-computed scenario cards + breakeven point headline. No interaction yet (that's Task 7).

- [ ] **Step 1: Create the file**

Path: `web/src/components/RoiBlock.astro`

```astro
---
import {
  ROI_PARAMS,
  monthlyGross,
  monthlyNet,
  breakevenCapital,
} from '../lib/mock-data';
import RoiCalculator from './islands/RoiCalculator.tsx';

const { apr, proPriceUsd, proPriceTwd, scenarios } = ROI_PARAMS;
const aprPct = (apr * 100).toFixed(2);

const cards = scenarios.map((capital) => {
  const gross = monthlyGross(capital, apr);
  const net = monthlyNet(capital, apr, proPriceUsd);
  return {
    capital,
    gross,
    net,
    netPositive: net >= 0,
  };
});

const breakeven = breakevenCapital(apr, proPriceUsd);

const fmtUsd = (n: number) => {
  const rounded = Math.round(n);
  const sign = rounded < 0 ? '−' : '';
  return `${sign}$${Math.abs(rounded).toLocaleString('en-US')}`;
};
const fmtCapital = (n: number) => `$${n.toLocaleString('en-US')}`;
---

<section id="roi" class="py-[140px] relative">
  <div class="max-w-7xl mx-auto px-6 lg:px-12">
    <div class="max-w-2xl mb-12">
      <div class="text-xs font-mono font-semibold text-brand uppercase tracking-wider mb-4">
        ROI
      </div>
      <h2
        class="text-4xl lg:text-5xl font-display font-bold text-ink leading-[1.1] tracking-tight mb-5"
      >
        訂閱划得來嗎？
      </h2>
      <p class="text-lg text-ink-soft">
        用過去 30 日 Bitfinex fUSD 平均利率 <span class="font-mono font-semibold text-ink">{aprPct}%</span> 算給你看。
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
      {
        cards.map((c) => (
          <div class="p-7 rounded-2xl bg-bg border border-line-soft">
            <div class="text-xs font-mono text-mute uppercase tracking-wider mb-3">
              資金 {fmtCapital(c.capital)}
            </div>
            <div class="space-y-2 mb-4">
              <div class="flex justify-between text-sm">
                <span class="text-mute">月毛配息</span>
                <span class="font-mono text-ink">{fmtUsd(c.gross)}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-mute">Pro 訂閱</span>
                <span class="font-mono text-ink">−${ROI_PARAMS.proPriceUsd}</span>
              </div>
            </div>
            <div class="border-t border-line-soft pt-4">
              <div class="flex justify-between items-baseline">
                <span class="text-sm text-mute">月淨</span>
                <span class={`font-mono text-2xl font-bold tracking-tight ${c.netPositive ? 'text-success' : 'text-danger'}`}>
                  {fmtUsd(c.net)}
                </span>
              </div>
            </div>
          </div>
        ))
      }
    </div>

    <div class="p-7 rounded-2xl bg-bg-soft border border-line-soft mb-6">
      <div class="text-xs font-mono text-mute uppercase tracking-wider mb-2">
        盈虧平衡點
      </div>
      <div class="flex flex-wrap items-baseline gap-3">
        <span class="text-3xl lg:text-4xl font-mono font-bold text-ink tracking-tight">
          ≈ {fmtCapital(Math.round(breakeven))}
        </span>
        <span class="text-sm text-mute">
          資金達此金額時，Pro 訂閱費剛好被月配息覆蓋（以上述 30 日均利率計算）。
        </span>
      </div>
    </div>

    <RoiCalculator client:idle />

    <p class="text-xs text-mute font-mono mt-6 leading-relaxed">
      上述為過去 30 日市場均值試算，不代表未來表現。訂閱費 NT${proPriceTwd} ≈ USD ${proPriceUsd}（以 1 USD = {ROI_PARAMS.twdPerUsd} TWD 估）。不含 Bitfinex 平台費。
    </p>
  </div>
</section>
```

- [ ] **Step 2: Note about RoiCalculator import**

`RoiCalculator.tsx` is imported but doesn't exist yet — build will fail. Task 7 creates it. Until then, **temporarily comment out** the import and `<RoiCalculator ... />` usage:

Find in `RoiBlock.astro`:
```astro
import RoiCalculator from './islands/RoiCalculator.tsx';
```

Replace with:
```astro
// import RoiCalculator from './islands/RoiCalculator.tsx';  // TODO: re-enable after Task 7
```

Find:
```astro
    <RoiCalculator client:idle />
```

Replace with:
```astro
    <!-- <RoiCalculator client:idle /> TODO: re-enable after Task 7 -->
```

- [ ] **Step 3: Type-check + build**

Run:
```
cd web && npx astro check
cd web && npm run build
```
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add web/src/components/RoiBlock.astro
git commit -m "$(cat <<'EOF'
feat(web): add RoiBlock static-first ROI section

3 pre-computed scenario cards ($1k / $10k / $50k) + breakeven point as
visual anchor. Honest negative-net display for under-breakeven scenario.
Calculator island is temporarily commented out; restored in next task.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Create `RoiCalculator.tsx` island

**Files:**
- Create: `web/src/components/islands/RoiCalculator.tsx`
- Modify: `web/src/components/RoiBlock.astro` (re-enable import)

**Why:** Spec §5.7 optional disclosure. Lets users plug their own capital amount to recompute. Pure client-side math, no fetch.

- [ ] **Step 1: Create the island**

Path: `web/src/components/islands/RoiCalculator.tsx`

```tsx
import { useState } from 'react';

// NOTE: kept inline (not imported from mock-data.ts) to avoid pulling the
// entire mock-data module into the client bundle. Keep in sync with
// ROI_PARAMS.apr and ROI_PARAMS.proPriceUsd in web/src/lib/mock-data.ts.
const APR = 0.0842;
const PRO_FEE_USD = 28;

function monthlyGross(capital: number) {
  return (capital * APR) / 12;
}

function monthlyNet(capital: number) {
  return monthlyGross(capital) - PRO_FEE_USD;
}

function fmtUsd(n: number): string {
  const rounded = Math.round(n);
  const sign = rounded < 0 ? '−' : '';
  return `${sign}$${Math.abs(rounded).toLocaleString('en-US')}`;
}

export default function RoiCalculator() {
  const [open, setOpen] = useState(false);
  const [capital, setCapital] = useState<number>(5000);

  const gross = monthlyGross(capital);
  const net = monthlyNet(capital);
  const netPositive = net >= 0;

  return (
    <div className="rounded-2xl border border-line-soft bg-bg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-bg-soft transition-colors"
      >
        <span className="text-sm font-medium text-ink">想試你自己的數字？</span>
        <span
          className="text-mute font-mono text-xs transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="p-6 border-t border-line-soft grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-end">
          <div>
            <label
              htmlFor="roi-capital"
              className="block text-xs font-mono text-mute uppercase tracking-wider mb-2"
            >
              資金（USD）
            </label>
            <input
              id="roi-capital"
              type="number"
              min={0}
              step={100}
              value={Number.isFinite(capital) ? capital : 0}
              onChange={(e) => {
                const v = Number.parseFloat(e.target.value);
                setCapital(Number.isFinite(v) ? Math.max(0, v) : 0);
              }}
              className="w-full px-4 py-3 rounded-md bg-bg-soft border border-line-soft font-mono text-xl text-ink focus:outline-none focus:border-brand"
            />
          </div>

          <div className="text-right">
            <div className="text-xs font-mono text-mute uppercase tracking-wider mb-2">
              月淨配息
            </div>
            <div
              className={`font-mono text-3xl font-bold tracking-tight ${
                netPositive ? 'text-success' : 'text-danger'
              }`}
            >
              {fmtUsd(net)}
            </div>
            <div className="text-xs text-mute font-mono mt-1">
              毛 {fmtUsd(gross)} − 訂閱 ${PRO_FEE_USD}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Re-enable the import in RoiBlock.astro**

Modify: `web/src/components/RoiBlock.astro`

Find:
```astro
// import RoiCalculator from './islands/RoiCalculator.tsx';  // TODO: re-enable after Task 7
```

Replace with:
```astro
import RoiCalculator from './islands/RoiCalculator.tsx';
```

Find:
```astro
    <!-- <RoiCalculator client:idle /> TODO: re-enable after Task 7 -->
```

Replace with:
```astro
    <RoiCalculator client:idle />
```

- [ ] **Step 3: Type-check + build**

Run:
```
cd web && npx astro check
cd web && npm run build
```
Expected: passes.

- [ ] **Step 4: Visual verify**

Run: `cd web && npm run dev`
Add `RoiBlock` temporarily to `index.astro` if it's not yet wired (skip if it is). Browse to it, expand the calculator, change capital, confirm:
- Default capital 5000 → net should be ~$7
- Capital 50000 → net ≈ $323 (green)
- Capital 1000 → net ≈ −$21 (red)

Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add web/src/components/islands/RoiCalculator.tsx web/src/components/RoiBlock.astro
git commit -m "$(cat <<'EOF'
feat(web): add RoiCalculator island and wire into RoiBlock

Disclosure-collapsed by default. Pure client-side math reuses spec
constants (APR 8.42%, Pro fee USD 28). Re-enables import that was
parked in previous task.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Create `WaitlistForm.tsx` + `ContactForm.tsx` islands

**Files:**
- Create: `web/src/components/islands/WaitlistForm.tsx`
- Create: `web/src/components/islands/ContactForm.tsx`

**Why:** Spec §5.10. UI-only forms with input validation + success toast. No backend wiring — GCP phase will do that.

- [ ] **Step 1: Create `WaitlistForm.tsx`**

Path: `web/src/components/islands/WaitlistForm.tsx`

```tsx
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'lendauto.waitlist.subscribed';

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)) {
        setAlreadySubscribed(true);
      }
    } catch {
      // ignore localStorage errors (private mode, etc.)
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setStatus('error');
      setErrorMsg('請輸入有效的 email 地址');
      return;
    }
    setStatus('submitting');
    setErrorMsg('');
    // TODO: wire to Cloud Run Functions in GCP phase
    await new Promise((r) => setTimeout(r, 1200));
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    setStatus('success');
  };

  if (alreadySubscribed && status !== 'success') {
    return (
      <div className="p-5 rounded-xl bg-success/8 border border-success/20 text-sm text-success font-mono">
        你已經在候補名單中，有更新會通知你。
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="p-5 rounded-xl bg-success/8 border border-success/20 text-sm text-success font-mono">
        已記下你的 email。有重大更新會通知你，不發行銷信。
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <label htmlFor="waitlist-email" className="sr-only">
        Email
      </label>
      <input
        id="waitlist-email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === 'error') setStatus('idle');
        }}
        placeholder="your@email.com"
        autoComplete="email"
        required
        className="w-full px-4 py-3 rounded-md bg-bg border border-line-soft text-ink focus:outline-none focus:border-brand"
        aria-invalid={status === 'error'}
        aria-describedby="waitlist-status"
      />

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full px-5 py-3 rounded-md bg-ink text-white font-medium hover:bg-ink-soft transition-colors disabled:opacity-50"
      >
        {status === 'submitting' ? '處理中…' : '加入候補名單'}
      </button>

      <div id="waitlist-status" role="status" aria-live="polite" className="min-h-[1.25rem] text-xs font-mono">
        {status === 'error' && <span className="text-danger">{errorMsg}</span>}
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Create `ContactForm.tsx`**

Path: `web/src/components/islands/ContactForm.tsx`

```tsx
import { useState } from 'react';

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatus('error');
      setErrorMsg('請填寫名字');
      return;
    }
    if (!isValidEmail(email)) {
      setStatus('error');
      setErrorMsg('請輸入有效的 email 地址');
      return;
    }
    if (message.trim().length < 5) {
      setStatus('error');
      setErrorMsg('訊息至少 5 個字');
      return;
    }
    setStatus('submitting');
    setErrorMsg('');
    // TODO: wire to Cloud Run Functions in GCP phase
    await new Promise((r) => setTimeout(r, 1200));
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div className="p-5 rounded-xl bg-success/8 border border-success/20 text-sm text-success font-mono">
        已收到你的訊息，工作時段 24 小時內回覆。
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <label htmlFor="contact-name" className="sr-only">名字</label>
      <input
        id="contact-name"
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (status === 'error') setStatus('idle');
        }}
        placeholder="名字"
        autoComplete="name"
        required
        className="w-full px-4 py-3 rounded-md bg-bg border border-line-soft text-ink focus:outline-none focus:border-brand"
        aria-invalid={status === 'error'}
        aria-describedby="contact-status"
      />

      <label htmlFor="contact-email" className="sr-only">Email</label>
      <input
        id="contact-email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === 'error') setStatus('idle');
        }}
        placeholder="your@email.com"
        autoComplete="email"
        required
        className="w-full px-4 py-3 rounded-md bg-bg border border-line-soft text-ink focus:outline-none focus:border-brand"
        aria-invalid={status === 'error'}
        aria-describedby="contact-status"
      />

      <label htmlFor="contact-message" className="sr-only">想問什麼？</label>
      <textarea
        id="contact-message"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          if (status === 'error') setStatus('idle');
        }}
        placeholder="想問什麼？"
        rows={4}
        required
        className="w-full px-4 py-3 rounded-md bg-bg border border-line-soft text-ink focus:outline-none focus:border-brand resize-none"
        aria-invalid={status === 'error'}
        aria-describedby="contact-status"
      />

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full px-5 py-3 rounded-md bg-ink text-white font-medium hover:bg-ink-soft transition-colors disabled:opacity-50"
      >
        {status === 'submitting' ? '處理中…' : '送出'}
      </button>

      <div id="contact-status" role="status" aria-live="polite" className="min-h-[1.25rem] text-xs font-mono">
        {status === 'error' && <span className="text-danger">{errorMsg}</span>}
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `cd web && npx astro check`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add web/src/components/islands/WaitlistForm.tsx web/src/components/islands/ContactForm.tsx
git commit -m "$(cat <<'EOF'
feat(web): add Waitlist + Contact form islands (UI-only)

Email validation, aria-live status messages, success state with idempotency
via localStorage for waitlist. Submit handlers are placeholders with
TODO comments — GCP phase will wire to Cloud Run Functions.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Create `WaitlistAndContact.astro` container

**Files:**
- Create: `web/src/components/WaitlistAndContact.astro`

**Why:** Spec §5.10. Two-column layout that wraps the two form islands.

- [ ] **Step 1: Create the file**

Path: `web/src/components/WaitlistAndContact.astro`

```astro
---
import WaitlistForm from './islands/WaitlistForm.tsx';
import ContactForm from './islands/ContactForm.tsx';
---

<section id="connect" class="py-[100px] bg-bg-soft relative">
  <div class="max-w-7xl mx-auto px-6 lg:px-12">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
      <!-- Waitlist -->
      <div class="p-8 rounded-2xl bg-bg border border-line-soft">
        <div class="text-xs font-mono font-semibold text-brand uppercase tracking-wider mb-3">
          候補名單
        </div>
        <h3 class="text-2xl font-display font-bold text-ink mb-3 tracking-tight">
          還沒準備好開始？
        </h3>
        <p class="text-sm text-ink-soft leading-relaxed mb-6">
          留 Email，我們會在有重大更新或推出年費方案時通知你。不發行銷信。
        </p>
        <WaitlistForm client:idle />
      </div>

      <!-- Contact -->
      <div class="p-8 rounded-2xl bg-bg border border-line-soft">
        <div class="text-xs font-mono font-semibold text-brand uppercase tracking-wider mb-3">
          聯絡
        </div>
        <h3 class="text-2xl font-display font-bold text-ink mb-3 tracking-tight">
          有問題想先問？
        </h3>
        <p class="text-sm text-ink-soft leading-relaxed mb-6">
          直接寫信給我們，工作時段 24 小時內回覆。
        </p>
        <ContactForm client:idle />
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Type-check + build**

Run:
```
cd web && npx astro check
cd web && npm run build
```
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add web/src/components/WaitlistAndContact.astro
git commit -m "$(cat <<'EOF'
feat(web): add WaitlistAndContact section container

2-column grid wrapping WaitlistForm + ContactForm islands. Section id
'connect' for anchor linking.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 3: Existing component edits

### Task 10: Update `Nav.astro`

**Files:**
- Modify: `web/src/components/Nav.astro`

**Why:** Spec §5.1. Add `市場` nav item; tone down `立即開始` CTA.

- [ ] **Step 1: Edit the navItems array and CTA**

Modify: `web/src/components/Nav.astro`

Find (lines 4–10):
```astro
const navItems = [
  { label: '產品', href: '#product' },
  { label: '原理', href: '#why' },
  { label: '安全', href: '#security' },
  { label: '定價', href: '#pricing' },
  { label: '教學', href: '/guides' },
];
```

Replace with:
```astro
const navItems = [
  { label: '產品', href: '#product' },
  { label: '市場', href: '#market' },
  { label: '原理', href: '#why' },
  { label: '安全', href: '#security' },
  { label: '定價', href: '#pricing' },
  { label: '教學', href: '/guides' },
];
```

Find:
```astro
        立即開始 →
```

Replace with:
```astro
        開始使用 →
```

- [ ] **Step 2: Type-check**

Run: `cd web && npx astro check`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add web/src/components/Nav.astro
git commit -m "$(cat <<'EOF'
refactor(web): update Nav — add Market link, soften CTA copy

Adds '市場' anchor pointing to new MarketDashboard section.
Renames CTA from '立即開始' to '開始使用' (drops sales urgency
language per copy-tone rules).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Rewrite `Hero.astro` (V1 copy)

**Files:**
- Modify: `web/src/components/Hero.astro`

**Why:** Spec §5.2 V1. Strip unverified Bitfinex partnership pill, rewrite headline + subhead, swap KPI strip values to market data.

- [ ] **Step 1: Add mock-data import + replace content**

Replace the entire file content:

Path: `web/src/components/Hero.astro`

```astro
---
import FluidRibbon from './islands/FluidRibbon.tsx';
import { subscribeUrl } from '../lib/cta';
import { HERO_KPIS } from '../lib/mock-data';

const fmtPct = (n: number) => `${n.toFixed(2)}%`;
---

<section class="relative pt-[140px] pb-[100px] overflow-hidden">
  <!-- Fluid Ribbon — nebula-swirl WebGL silk, right 45% of viewport -->
  <div class="absolute top-0 right-0 w-[45%] h-full overflow-hidden pointer-events-none z-0">
    <FluidRibbon client:only="react" />
  </div>

  <!-- Grid lines overlay (radial mask for vignette) -->
  <div
    class="absolute inset-0 pointer-events-none"
    style="
      background-image: linear-gradient(rgb(15 23 42 / 0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgb(15 23 42 / 0.04) 1px, transparent 1px);
      background-size: 72px 72px;
      mask-image: radial-gradient(ellipse at center, #000 40%, transparent 75%);
      -webkit-mask-image: radial-gradient(ellipse at center, #000 40%, transparent 75%);
    "
  >
  </div>

  <!-- Content -->
  <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
    <div class="max-w-2xl">
      <!-- Announcement pill — descriptive, not affiliation claim -->
      <div
        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill border border-line bg-bg/80 backdrop-blur-sm text-sm text-ink-soft mb-8"
      >
        <span class="w-2 h-2 rounded-full bg-success"></span>
        <span class="font-mono">fUSD / fUST 自動報價</span>
      </div>

      <!-- Headline -->
      <h1
        class="text-5xl lg:text-7xl font-display font-bold text-ink leading-[1.1] tracking-tight mb-6"
      >
        把 Bitfinex funding 報價，<br />
        交給機器人
        <span
          class="bg-gradient-to-r from-brand via-coral to-amber bg-clip-text text-transparent"
          >24×60×60 秒</span
        >盯
      </h1>

      <!-- Subhead -->
      <p class="text-lg lg:text-xl text-ink-soft leading-relaxed mb-10 max-w-xl">
        fUSD 與 fUST 雙幣對的 funding 自動化工具，根據資金量分層報價，每日結算入帳。
      </p>

      <!-- CTAs -->
      <div class="flex flex-wrap gap-3">
        <a
          href={subscribeUrl({ source: 'hero' })}
          class="inline-flex items-center justify-center px-6 py-3 rounded-md bg-ink text-white font-medium hover:bg-ink-soft transition-colors"
        >
          開始使用 →
        </a>
        <a
          href="/guides/bitfinex-api-setup"
          class="inline-flex items-center justify-center px-6 py-3 rounded-md border border-line bg-bg text-ink font-medium hover:bg-bg-soft transition-colors"
        >
          先看設定教學
        </a>
      </div>

      <!-- KPI strip -->
      <div class="mt-16 grid grid-cols-3 gap-6 max-w-lg">
        <div>
          <div class="text-3xl font-display font-bold text-ink font-mono">{fmtPct(HERO_KPIS.fusd30dAvgApr)}</div>
          <div class="text-sm text-mute mt-1">
            過去 30 日<br />
            fUSD 平均利率
          </div>
        </div>
        <div>
          <div class="text-3xl font-display font-bold text-ink font-mono">24/7</div>
          <div class="text-sm text-mute mt-1">
            自動<br />
            報價監控
          </div>
        </div>
        <div>
          <div class="text-3xl font-display font-bold text-ink font-mono">{HERO_KPIS.rateRefreshSec}s</div>
          <div class="text-sm text-mute mt-1">
            報價<br />
            重新評估週期
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Type-check + build**

Run:
```
cd web && npx astro check
cd web && npm run build
```
Expected: passes.

- [ ] **Step 3: Visual verify**

Run: `cd web && npm run dev`
Browse to `/`. Confirm:
- Pill reads "fUSD / fUST 自動報價" (not "Bitfinex 官方授權合作")
- Headline reads "把 Bitfinex funding 報價，交給機器人 24×60×60 秒盯"
- KPI strip middle column shows `8.42%` not `2-5%`
- CTAs read "開始使用" and "先看設定教學"

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add web/src/components/Hero.astro
git commit -m "$(cat <<'EOF'
refactor(web): rewrite Hero copy per design spec V1

- Remove unverifiable 'Bitfinex 官方授權合作' pill, replace with
  descriptive 'fUSD / fUST 自動報價'
- Rewrite headline to drop '像存股一樣每天配息' (over-promising) in
  favor of mechanism-anchored '把 Bitfinex funding 報價交給機器人
  24×60×60 秒盯'
- Swap KPI strip's vague '2-5% 年化報酬率' for market-anchored 'fUSD
  30d avg APR' from mock-data, change refresh cadence to '30s'
- Soften both CTAs

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: Update `Steps.astro`

**Files:**
- Modify: `web/src/components/Steps.astro`

**Why:** Spec §5.5. Tighten headline + step 3 copy.

- [ ] **Step 1: Edit headline + step 3 desc**

Modify: `web/src/components/Steps.astro`

Find:
```astro
  {
    n: 3,
    title: '機器人自動執行',
    desc: '關掉電腦也能賺。利率變動時自動追單，市場波動時自動捕捉。',
    tint: 'from-amber to-amber/70',
  },
```

Replace with:
```astro
  {
    n: 3,
    title: '機器人自動執行',
    desc: '策略部署後，bot 持續監控市場並自動調整訂單。利率變動時自動追單，市場波動時觸發預埋階梯。',
    tint: 'from-amber to-amber/70',
  },
```

Find:
```astro
      <h2 class="text-4xl lg:text-5xl font-display font-bold text-ink leading-[1.1] tracking-tight mb-5">
        設定簡單到<br />不像在操作自動化系統
      </h2>
```

Replace with:
```astro
      <h2 class="text-4xl lg:text-5xl font-display font-bold text-ink leading-[1.1] tracking-tight mb-5">
        三步驟，<br />從 Bitfinex API 設定到開始報價
      </h2>
```

- [ ] **Step 2: Type-check**

Run: `cd web && npx astro check`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add web/src/components/Steps.astro
git commit -m "$(cat <<'EOF'
refactor(web): tighten Steps copy

Step 3 description swaps '關掉電腦也能賺' (income promise) for
mechanism-focused 'bot 持續監控市場並自動調整訂單'. Section headline
swaps 'simple-than-you-think' framing for a literal 'three steps to
start quoting' label.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 13: Rewrite `WhyHigher.astro`

**Files:**
- Modify: `web/src/components/WhyHigher.astro`

**Why:** Spec §5.6. The `8% → 15-20%` headline is the single biggest copy violation. Plus feature card descriptions need mechanism-only framing.

- [ ] **Step 1: Replace headline + feature descriptions**

Replace the entire `features` array and the headline block:

Modify: `web/src/components/WhyHigher.astro`

Find (the features array at top):
```astro
const features = [
  {
    title: '智能追蹤市場利率',
    desc: '自動跟隨 Bitfinex Flash Return Rate 浮動，利率變高時立刻調整，不錯過任何成交機會。',
    tech: 'FRR Delta Var · FRR Delta Fix',
    tint: 'brand',
  },
  {
    title: '預埋高利率，爆發時自動捕捉',
    desc: '市場劇烈波動、資金短缺時，預設的高利率訂單會自動成交，賺到一般人搶不到的暴利。',
    tech: 'Spike Catching · 階梯式網格',
    tint: 'coral',
  },
  {
    title: '毫秒級執行，搶在別人前面',
    desc: 'Go 語言寫的交易引擎，24 小時不停偵測、不停調倉。你在睡覺時它也在工作。',
    tech: 'Go 1.26 · WebSocket 即時連線',
    tint: 'teal',
  },
];
```

Replace with:
```astro
const features = [
  {
    title: '智能追蹤市場利率',
    desc: '自動跟隨 Bitfinex Flash Return Rate 浮動，市場利率變動時即時更新報價。',
    tech: 'FRR Delta Var · FRR Delta Fix',
    tint: 'brand',
  },
  {
    title: '預埋高利率訂單，市場波動時自動成交',
    desc: '階梯式部署多檔高利率訂單。當市場資金短缺、利率瞬時抬升時，預埋單會被自動成交。',
    tech: 'Spike Catching · 階梯式網格',
    tint: 'coral',
  },
  {
    title: '毫秒級執行',
    desc: 'Go 語言寫的引擎，24 小時不停偵測、不停調倉。',
    tech: 'Go 1.26 · WebSocket 即時連線',
    tint: 'teal',
  },
];
```

Find the headline block:
```astro
      <h2 class="text-4xl lg:text-5xl font-display font-bold text-ink leading-[1.1] tracking-tight mb-5">
        手動掛單賺 <span class="line-through text-mute-soft">8%</span>，<br />
        交給機器人 <span class="bg-gradient-to-r from-brand via-coral to-amber bg-clip-text text-transparent">賺 15-20%</span>
      </h2>
      <p class="text-lg text-ink-soft">
        三個技術核心，把手動放貸做不到的事做到極致。
      </p>
```

Replace with:
```astro
      <h2 class="text-4xl lg:text-5xl font-display font-bold text-ink leading-[1.1] tracking-tight mb-5">
        手動掛 1-2 次，<br />
        bot 每
        <span class="bg-gradient-to-r from-brand via-coral to-amber bg-clip-text text-transparent">30 秒</span>
        重新評估
      </h2>
      <p class="text-lg text-ink-soft">
        三個技術差異，把手動放貸的盲點補起來。
      </p>
```

- [ ] **Step 2: Type-check + build**

Run:
```
cd web && npx astro check
cd web && npm run build
```
Expected: passes.

- [ ] **Step 3: Visual verify**

Run: `cd web && npm run dev`
Browse to `/#why`. Confirm:
- Headline reads "手動掛 1-2 次，bot 每 30 秒重新評估"
- No `8%` or `15-20%` numbers anywhere
- Feature 2 title is "預埋高利率訂單，市場波動時自動成交" (not the older "賺暴利" framing)
- Feature 3 description doesn't include "你在睡覺時它也在工作"

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add web/src/components/WhyHigher.astro
git commit -m "$(cat <<'EOF'
refactor(web): rewrite WhyHigher to remove return-rate claims

The '8% → 15-20%' headline was the single biggest copy violation. Replace
with mechanism-anchored frequency comparison: '手動掛 1-2 次, bot 每 30
秒重新評估'. Feature descriptions reworked to describe HOW the bot works,
not WHAT returns it gets.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 14: Update `Pricing.astro` (risk disclosure)

**Files:**
- Modify: `web/src/components/Pricing.astro`

**Why:** Spec §5.8. Cards untouched. Add small risk note below the grid.

- [ ] **Step 1: Add risk disclosure paragraph after the pricing grid**

Modify: `web/src/components/Pricing.astro`

Find:
```astro
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
```

… and locate the closing `</div>` of that grid (the one immediately before `</section>` at the bottom of the file). After that closing `</div>` and before `</section>`, insert:

```astro
    <p class="text-xs text-mute font-mono mt-8 text-center max-w-2xl mx-auto leading-relaxed">
      投資有風險。bot 表現受市場利率波動影響，過往績效不代表未來表現。
    </p>
```

The full updated tail of the file should look like:

```astro
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
      { /* ... existing plan.map() unchanged ... */ }
    </div>

    <p class="text-xs text-mute font-mono mt-8 text-center max-w-2xl mx-auto leading-relaxed">
      投資有風險。bot 表現受市場利率波動影響，過往績效不代表未來表現。
    </p>
  </div>
</section>
```

- [ ] **Step 2: Type-check**

Run: `cd web && npx astro check`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add web/src/components/Pricing.astro
git commit -m "$(cat <<'EOF'
feat(web): add risk disclosure under Pricing grid

Small footnote acknowledging bot performance is rate-dependent and past
performance is not predictive. Mirrors the disclaimer in the global footer
but surfaced where pricing decisions happen.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 15: Rewrite `CtaFooter.astro`

**Files:**
- Modify: `web/src/components/CtaFooter.astro`

**Why:** Spec §5.9. Current copy is the most sales-y in the codebase ("USD 開始工作", "今晚就開始配息").

- [ ] **Step 1: Replace the headline, subhead, and CTAs**

Modify: `web/src/components/CtaFooter.astro`

Find:
```astro
        <h2 class="text-4xl lg:text-5xl font-display font-bold leading-[1.1] tracking-tight mb-5">
          準備好讓你的 USD<br />開始工作了嗎？
        </h2>
        <p class="text-lg opacity-75 max-w-xl mx-auto mb-9">
          現在加入，享 <strong class="text-white">首月免費</strong>。
          設定不到 5 分鐘，今晚就開始配息。
        </p>
```

Replace with:
```astro
        <h2 class="text-4xl lg:text-5xl font-display font-bold leading-[1.1] tracking-tight mb-5">
          三分鐘設定，<br />後續完全自動
        </h2>
        <p class="text-lg opacity-75 max-w-xl mx-auto mb-9">
          Starter 永久免費，可先用免費版熟悉，覺得適合再升級 Pro。
        </p>
```

Find:
```astro
          <a
            href={subscribeUrl({ source: 'cta-footer' })}
            class="inline-flex items-center px-7 py-3.5 rounded-pill bg-white text-ink font-semibold hover:bg-bg-soft transition-colors"
          >
            立即開始 →
          </a>
```

Replace with:
```astro
          <a
            href={subscribeUrl({ source: 'cta-footer' })}
            class="inline-flex items-center px-7 py-3.5 rounded-pill bg-white text-ink font-semibold hover:bg-bg-soft transition-colors"
          >
            開始使用 →
          </a>
```

- [ ] **Step 2: Update the footer tagline**

Find:
```astro
        <p class="text-sm text-mute leading-relaxed">
          Bitfinex 自動放貸機器人。<br />讓你的加密貨幣每天配息。
        </p>
```

Replace with:
```astro
        <p class="text-sm text-mute leading-relaxed">
          Bitfinex margin funding<br />自動報價工具。
        </p>
```

- [ ] **Step 3: Type-check + build**

Run:
```
cd web && npx astro check
cd web && npm run build
```
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add web/src/components/CtaFooter.astro
git commit -m "$(cat <<'EOF'
refactor(web): rewrite CtaFooter copy to remove sales urgency

- Headline: '讓你的 USD 開始工作' → '三分鐘設定, 後續完全自動'
- Subhead: '今晚就開始配息' → 'Starter 永久免費' (reframes as
  low-commitment trial, not return promise)
- Primary CTA: '立即開始' → '開始使用'
- Footer tagline: '讓你的加密貨幣每天配息' → 'Bitfinex margin funding
  自動報價工具' (mechanism, not outcome)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 16: Delete `Security.astro`

**Files:**
- Delete: `web/src/components/Security.astro`

**Why:** Replaced by `Architecture.astro` (Task 4). The `index.astro` rewire in Task 20 will already swap the import. Once nothing references it, delete.

- [ ] **Step 1: Confirm no other files import it**

Run: `grep -r "Security" web/src --include="*.astro" --include="*.tsx" --include="*.ts"`
Expected: zero results (other than potentially the file itself). If the `index.astro` rewire (Task 20) is not yet done, this task should be deferred until after Task 20.

If `index.astro` still imports `Security`, **stop and complete Task 20 first**.

- [ ] **Step 2: Delete the file**

Run:
```
rm web/src/components/Security.astro
```

- [ ] **Step 3: Type-check + build**

Run:
```
cd web && npx astro check
cd web && npm run build
```
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git rm web/src/components/Security.astro
git commit -m "$(cat <<'EOF'
chore(web): remove Security.astro

Replaced by Architecture.astro which retains the same #security anchor
for back-compat. All references in index.astro have been migrated.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 4: Cross-file copy cleanup

### Task 17: Update `Layout.astro` default description

**Files:**
- Modify: `web/src/layouts/Layout.astro`

**Why:** Spec §11.1. Default OG / meta description currently says "像存股一樣每天配息".

- [ ] **Step 1: Edit the default description prop**

Modify: `web/src/layouts/Layout.astro`

Find:
```astro
  description = 'LendAuto — 你的加密貨幣，也可以像存股一樣每天配息。Bitfinex 自動放貸機器人，安全、透明、每日配息。',
```

Replace with:
```astro
  description = 'LendAuto — Bitfinex margin funding 自動報價工具。非託管式架構，API 權限只開放貸。',
```

- [ ] **Step 2: Type-check + build**

Run:
```
cd web && npx astro check
cd web && npm run build
```
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add web/src/layouts/Layout.astro
git commit -m "$(cat <<'EOF'
refactor(web): replace default meta description

The '像存股一樣每天配息' framing was a copy violation per the redesign
tone rules. Replace with a mechanism + safety descriptor that aligns
with Hero V1 copy.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 18: Update `StructuredData.astro`

**Files:**
- Modify: `web/src/components/StructuredData.astro`

**Why:** Spec §11.3–11.5. FAQ Q2 contains the same `8% → 15-20%` claim. Q4 has the self-justifying "三層防護確保資金安全". `orgSchema` and `serviceSchema` descriptions need toning.

- [ ] **Step 1: Update `orgSchema.description`**

Modify: `web/src/components/StructuredData.astro`

Find:
```astro
  description:
    'LendAuto 是 Bitfinex 平台的自動化 USD 放貸機器人，幫助加密貨幣持有者透過自動追單與策略網格，每日獲得被動配息收入。',
```

Replace with:
```astro
  description:
    'LendAuto 是 Bitfinex margin funding 平台的自動報價工具。透過 Flash Return Rate 追蹤、Spike Catching、階梯網格策略，自動化原本需要手動操作的 funding 訂單管理。非託管式架構。',
```

- [ ] **Step 2: Update `serviceSchema.description`**

Find:
```astro
  description:
    '自動化的 Bitfinex USD/USDT 放貸機器人。24 小時追蹤市場利率，自動掛單、自動配息。非託管式架構，使用者資金始終在自己的 Bitfinex 帳號。',
```

Replace with:
```astro
  description:
    'Bitfinex fUSD / fUST funding market 的自動報價代理工具。30 秒級重新評估市場利率、階梯式報價部署。Non-custodial — 使用者保有 Bitfinex 帳號 custody。',
```

- [ ] **Step 3: Rewrite FAQ Q2**

Find:
```astro
    {
      '@type': 'Question',
      name: '為什麼用 LendAuto 報酬會比手動高？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '三個原因：(1) 24 小時自動追蹤市場利率變動，不錯過機會；(2) 預埋高利率訂單，市場波動時自動成交；(3) 毫秒級執行速度，搶在其他人前面。手動掛單通常年化 8%，LendAuto 用戶平均 15-20%。',
      },
    },
```

Replace with:
```astro
    {
      '@type': 'Question',
      name: '為什麼用 LendAuto 報酬會比手動高？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '三個機制差異：(1) bot 24 小時自動跟隨 Flash Return Rate 變動，手動掛單通常每天只動 1-2 次；(2) 階梯式預埋多檔高利率訂單，在市場波動時自動成交；(3) 毫秒級執行。報酬高低取決於市場利率波動，bot 主要改善的是「不錯過機會」，而非保證任何特定報酬。',
      },
    },
```

- [ ] **Step 4: Rewrite FAQ Q4**

Find:
```astro
    {
      '@type': 'Question',
      name: 'API Key 安全嗎？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '我們用 AES-256-GCM 加密儲存，連工程師都看不到明文。加上 API 權限限制（只開 Funding）與非託管架構，三層防護確保資金安全。',
      },
    },
```

Replace with:
```astro
    {
      '@type': 'Question',
      name: 'API Key 安全嗎？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'API Key 在資料庫以 AES-256-GCM 加密儲存，連工程師都看不到明文。Bitfinex 端 API 權限只勾 Funding，不勾 Withdrawal/Trading，平台層強制限制提款路徑。資金始終在你的 Bitfinex 帳號，LendAuto 不開錢包、不持有資產。',
      },
    },
```

- [ ] **Step 5: Type-check + build**

Run:
```
cd web && npx astro check
cd web && npm run build
```
Expected: passes.

- [ ] **Step 6: Commit**

```bash
git add web/src/components/StructuredData.astro
git commit -m "$(cat <<'EOF'
refactor(web): rewrite StructuredData copy to match tone rules

- orgSchema.description: drop '被動配息收入' framing, describe as
  mechanism + non-custodial
- serviceSchema.description: tighten to mechanism + Non-custodial label
- FAQ Q2: remove '8% → 15-20%' return-rate claim, reframe as 'bot
  improves not-missing-opportunities, not guaranteed returns'
- FAQ Q4: replace '三層防護確保資金安全' self-justification with
  concrete factual description of the security architecture

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 19: Update `llms.txt.ts` intro

**Files:**
- Modify: `web/src/pages/llms.txt.ts`

**Why:** Spec §11.6. The intro line that promises "8% → 15-20%" must go.

- [ ] **Step 1: Replace the intro paragraph**

Modify: `web/src/pages/llms.txt.ts`

Find:
```ts
LendAuto 是面向加密貨幣持有者的被動收入工具。核心價值：把手動掛單能賺到的 8% 年化報酬，透過自動追單、Spike Catching、預埋階梯網格策略，提升至 15-20%。
```

Replace with:
```ts
LendAuto 是 Bitfinex margin funding 的自動報價工具。核心機制：Flash Return Rate 追蹤、Spike Catching、階梯式網格報價。目標是把手動掛單做不到的事（24 小時不間斷監控、毫秒級調整、多檔利率同時部署）自動化。報酬視市場利率波動而定。
```

- [ ] **Step 2: Type-check + build**

Run:
```
cd web && npx astro check
cd web && npm run build
```
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add web/src/pages/llms.txt.ts
git commit -m "$(cat <<'EOF'
refactor(web): rewrite llms.txt intro to remove return claims

Drop '把 8% 提升至 15-20%' from the LLM-discovery file. New intro
describes mechanism + acknowledges 報酬視市場利率波動而定. LLM
citations should match site copy.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 5: Page assembly + verification

### Task 20: Reorder `index.astro` per IA B

**Files:**
- Modify: `web/src/pages/index.astro`

**Why:** Spec §4. Final reordering: Hero → MarketDashboard → Architecture → Steps → WhyHigher → RoiBlock → Pricing → CtaFooter → WaitlistAndContact. Also update `<title>`.

- [ ] **Step 1: Replace entire file**

Path: `web/src/pages/index.astro`

```astro
---
import Layout from '../layouts/Layout.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
import MarketDashboard from '../components/MarketDashboard.astro';
import Architecture from '../components/Architecture.astro';
import Steps from '../components/Steps.astro';
import WhyHigher from '../components/WhyHigher.astro';
import RoiBlock from '../components/RoiBlock.astro';
import Pricing from '../components/Pricing.astro';
import CtaFooter from '../components/CtaFooter.astro';
import WaitlistAndContact from '../components/WaitlistAndContact.astro';
import StructuredData from '../components/StructuredData.astro';
---

<Layout title="LendAuto — Bitfinex Margin Funding 自動報價">
  <StructuredData slot="head" />
  <Nav />
  <main>
    <Hero />
    <MarketDashboard />
    <Architecture />
    <Steps />
    <WhyHigher />
    <RoiBlock />
    <Pricing />
    <CtaFooter />
    <WaitlistAndContact />
  </main>
</Layout>
```

- [ ] **Step 2: Type-check + build**

Run:
```
cd web && npx astro check
cd web && npm run build
```
Expected: passes. If `Security` import error appears, that's because Task 16 (deletion) hasn't run yet — that's fine, just remove the import here in this same task.

- [ ] **Step 3: Visual verify**

Run: `cd web && npm run dev`
Browse to `/`. Confirm section order top-to-bottom:
1. Nav
2. Hero (with FluidRibbon)
3. Market Data section (4 cards + sparkline)
4. Architecture (sticky left + SVG diagram + 3 pillars + placeholder screenshot)
5. Steps (three steps)
6. WhyHigher (three features)
7. ROI (three scenarios + breakeven + disclosure)
8. Pricing (three plans + risk note)
9. CtaFooter (gradient card)
10. WaitlistAndContact (two forms)
11. Footer

Click each nav item, confirm anchors work (`#market`, `#security`, `#why`, `#pricing`).

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add web/src/pages/index.astro
git commit -m "$(cat <<'EOF'
feat(web): rewire index.astro to IA B order + new components

Final section order per spec: Hero → MarketDashboard → Architecture →
Steps → WhyHigher → RoiBlock → Pricing → CtaFooter → WaitlistAndContact.
Page <title> swapped from '像存股一樣每天配息' to 'Bitfinex Margin Funding 自動報價'.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 21: Final verification pass

**Files:** none

**Why:** Spec §8 success criteria.

- [ ] **Step 1: Astro check**

Run: `cd web && npx astro check`
Expected: 0 errors, 0 warnings (excluding any pre-existing unrelated warnings).

- [ ] **Step 2: Production build**

Run: `cd web && npm run build`
Expected: completes successfully. Note the bundle size and confirm islands are properly chunked (FluidRibbon, RoiCalculator, WaitlistForm, ContactForm should each be small standalone chunks).

- [ ] **Step 3: Grep for forbidden tokens**

Run: `grep -nE "(15-20%|存股|被動收入|今晚就|搶不到的暴利|讓你的 USD)" web/src/**/*.astro web/src/**/*.ts web/src/**/*.tsx web/src/**/*.css`
Expected: zero matches.

If matches appear in *content/blog/* `.mdx` files, those are out of spec scope — note in followup but don't fail this task.

- [ ] **Step 4: Dev server smoke test**

Run: `cd web && npm run dev`

Manually walk through:
- [ ] Hero renders, FluidRibbon animates
- [ ] Nav anchors jump correctly
- [ ] MarketDashboard cards display numbers
- [ ] Sparkline renders (gradient stroke, high/low dots visible)
- [ ] Architecture SVG diagram renders correctly (boxes, arrows, red dashed line)
- [ ] Placeholder screenshot loads (not 404)
- [ ] RoiBlock: $1k card shows red negative, $10k green, $50k green
- [ ] RoiCalculator disclosure expands; typing changes the net display
- [ ] WaitlistForm: typing invalid email shows error; valid email + submit shows success state
- [ ] ContactForm: missing name/email/short-message shows errors; full submit shows success
- [ ] Pricing risk note visible
- [ ] CtaFooter copy reads "三分鐘設定，後續完全自動"
- [ ] Mobile (resize to ~375px width): all sections readable, no horizontal scroll

Stop dev server.

- [ ] **Step 5: Commit a no-op marker (optional)** — if this verification surfaced any small fixes, commit them. Otherwise skip.

```bash
# example fix-up commit if needed
git add <fixed-files>
git commit -m "fix(web): tweaks from final verification pass"
```

---

## Self-Review

Run through the spec section by section and confirm:

- ✅ Spec §3.1 copy rules: enforced via Tasks 11, 12, 13, 15, 17, 18, 19 (Hero, Steps, WhyHigher, CtaFooter, Layout, StructuredData, llms.txt)
- ✅ Spec §3.2 visual rules: Tasks 3, 4, 6, 7, 9 use brand tokens consistently
- ✅ Spec §3.3 SEO/data rules: mock-data.ts in Task 1; all numbers SSG-rendered (no client fetch)
- ✅ Spec §4 IA B order: Task 20 reorders per spec exactly
- ✅ Spec §5.1 Nav: Task 10
- ✅ Spec §5.2 Hero V1: Task 11
- ✅ Spec §5.3 MarketDashboard: Tasks 2 + 3
- ✅ Spec §5.4 Architecture: Tasks 4 + 5
- ✅ Spec §5.5 Steps: Task 12
- ✅ Spec §5.6 WhyHigher: Task 13
- ✅ Spec §5.7 RoiBlock: Tasks 6 + 7
- ✅ Spec §5.8 Pricing: Task 14
- ✅ Spec §5.9 CtaFooter: Task 15
- ✅ Spec §5.10 WaitlistAndContact: Tasks 8 + 9
- ✅ Spec §6.1 mock-data.ts: Task 1
- ✅ Spec §6.2 Sparkline: Task 2
- ✅ Spec §10 modified files all covered
- ✅ Spec §11 cross-file cleanup: Tasks 17–19

**No placeholders / TBDs** — every code block contains the final code an engineer pastes.

**Type consistency check:**
- `mock-data.ts` exports `MARKET_DATA`, `HERO_KPIS`, `ROI_PARAMS`, `META`, plus three helper fns. All consumers (`Hero`, `MarketDashboard`, `RoiBlock`) import correctly.
- `monthlyGross`, `monthlyNet`, `breakevenCapital` signatures match between mock-data.ts (Task 1) and RoiBlock.astro (Task 6).
- `RoiCalculator.tsx` redeclares `APR` and `PRO_FEE_USD` locally rather than importing from mock-data — this is acceptable for an island (avoids pulling the whole module into the client bundle), but the values must stay in sync. If `mock-data.ts` `apr` or `proPriceUsd` changes, RoiCalculator must update too. **Add note in Task 7 reminding maintainer.**
- Section ids: `#market` (new), `#security` (kept on Architecture for back-compat), `#why`, `#product`, `#pricing`, `#roi` (new), `#connect` (new). All anchors used in Nav.astro exist in some section.

---

**Plan complete and saved to `docs/plans/2026-05-18-frontend-redesign.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
