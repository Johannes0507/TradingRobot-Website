# LendAuto Frontend Redesign — Design Spec

**Date:** 2026-05-18
**Status:** Draft (pending user review)
**Author:** Brainstorm session via Claude Code
**Supersedes:** 2026-05-11 brainstorm notes (Q1 unanswered) — this doc represents the final converged decisions after Q1–Q5 are all answered.

---

## 1. Origin & purpose

LendAuto 的 v1 行銷網站（Astro 6）內容與設計大致完整，但 brainstorm 揭露了兩個關鍵 gap：

1. **目標受眾的首要疑慮（怕詐騙）尚未被資訊架構優先處理** —— 「安全機制」目前在第五個 section，導致風險迴避型新手在看到信任證據前可能已跳出。
2. **多處文案有「自證清白」或「過度承諾」的推銷感**（例：「像存股一樣每天配息」、「賺 15-20%」、「今晚就開始配息」），這對怕詐騙的受眾反而是反信任訊號。

本 spec 定義一次性的資訊架構（IA）重組 + 文案重寫 + 三個新元件，目標是讓**第一次到訪的台灣加密貨幣持有者，在前三屏（≤ 3 個 viewport scroll）內已可自行判斷「這不是詐騙、機會是真的、值得我繼續看」**。

---

## 2. Locked decisions (from Q1–Q5)

| 維度 | 結論 | 來源 |
|------|------|------|
| 受眾首要疑慮優先序 | D（怕詐騙） > C（訂閱費值不值得） > B（API key 被盜） > A（rate proof） | Q1 |
| 信任資產現況 | 完全沒有用戶數據、創辦人不露面、無第三方背書、Bitfinex 合作無實證 | Q2 |
| 信任建構策略 | 產品內部透明化（架構圖 + 靜態績效截圖）+ 教育內容深度 + 市場數據（非自家數據） | Q3 + Q5 |
| 文案語氣 | 實戰、冷靜、客觀數據說話；禁防禦性辯解、推銷話術、自證清白 | Q3 meta-feedback |
| ROI 處理 | Static-first ROI Block：三檔預設場景 + 盈虧平衡點 headline + 互動展開預設關閉 | Q4 |
| 視覺對標 | stripe.com | Q-visual |
| 資訊架構選擇 | 方案 B（按 Q1 疑慮順位重組） | Q-IA |

---

## 3. Constraints & rules (絕對不可違反)

### 3.1 文案規則（與 memory `feedback_copy_tone.md` 對齊）

- ❌ 禁止具體報酬承諾：刪除「2-5%」「8% vs 15-20%」「年化最高 X%」等任何 LendAuto 報酬數字
- ❌ 禁止自證型詞彙：「不是詐騙」「絕對安全」「合法合規」「Bitfinex 官方授權合作」（無實證）
- ❌ 禁止推銷急迫感：「立即」「立刻搶購」「限時」「最後機會」「今晚就」
- ❌ 禁止過度比喻：「像存股一樣」「USD 開始工作」「賺暴利」
- ✅ 客觀市場數據 OK：「過去 30 日 Bitfinex fUSD 平均利率 X.XX%」「市場 30 日波動範圍」（這些是市場事實，不是我們承諾）
- ✅ 技術機制描述 OK：「30 秒重新評估報價」「Spike Catching · 階梯式網格」（這些是 what，不是 outcome）
- ✅ 風險揭露要顯著（已存在於 footer，但應在 Pricing 區塊也提醒）

### 3.2 視覺規則（與 memory `project_design_direction.md` 對齊）

對標 stripe.com。每個 section 設計決策的判斷句：「Stripe 會怎麼做這個？」

- **配色**：tokens.css 已是 Stripe 系（`#635bff` brand、Inter、JetBrains Mono），不改
- **字體層級**：font-display（標題）+ font-sans（body）+ font-mono（數字、tech tag、code）
- **空間節奏**：sections 之間 `py-[140px]`、章節內 dense（既有節奏正確）
- **動畫**：克制；scroll-reveal subtle、hover micro 即可，不做 Linear 那種 scroll-bound 重動畫
- **既有 FluidRibbon Hero 動畫**：保留（已是 Stripe gradient mesh 路線的本地實作）

### 3.3 SEO 與資料規則（與 memory `project_seo_priority.md` 和 `feedback_backend_data_seo.md` 對齊）

- 任何要顯示給人類看的數字（市場利率、ROI 範例數字）必須在 first-paint HTML 內
- 後端整合（GCP / build-time fetcher / Bitfinex 公開 API）**本 spec 不實作，全部用 mock 常數**
- mock 常數定義一個檔案 `web/src/lib/mock-data.ts`，未來 GCP phase 把這個檔案改成 build-time generated 即可零改動 swap

---

## 4. Information architecture (方案 B)

`web/src/pages/index.astro` 新順序：

```
Nav                          (既有，scroll-aware 增強)
Hero                         (改寫文案，保留 FluidRibbon 與 KPI strip)
🆕 MarketDashboard           (新 widget — 取代 #2 原計畫的「累積金額看板」)
🆕 Architecture              (擴展自原 Security，加 SVG 架構圖 + 靜態績效截圖區)
Steps                        (既有，視覺微調 + 文案微調)
WhyHigher                    (既有，文案大幅改寫 — 移除 15-20% 報酬承諾)
🆕 RoiBlock                  (新 — Static-first 三檔場景 + 盈虧平衡點 headline)
Pricing                      (既有，CTA 文案降溫)
CtaFooter                    (既有，文案降溫 + footer 不動)
🆕 WaitlistAndContact        (新 island section — Email 候補 + 聯絡表單)
```

順序邏輯：
1. **Hero** — 第一印象（定調 + FluidRibbon 視覺鉤）
2. **MarketDashboard** — 立刻用市場事實回答 D 與 A：「機會本身是市場事實」
3. **Architecture** — 處理 B（API key 被盜）並二壓 D：「就算我們倒了，你的錢也不在我們這」
4. **Steps** — 教育（運作流程）
5. **WhyHigher** — 教育（為何能比手動更優，講機制不講數字）
6. **RoiBlock** — 處理 C：「訂閱費值不值得」用市場利率算給你看
7. **Pricing** — 在所有疑慮被處理後才談錢
8. **CtaFooter** — 行動
9. **WaitlistAndContact** — 漏網之魚的收口（沒準備好買的人留下 email；有疑問的人聯絡）

---

## 5. Section-by-section spec

### 5.1 Nav (既有，最小變動)

**File:** `web/src/components/Nav.astro`

**Changes:**
- 新增 nav item：`市場` → `#market`（指向 MarketDashboard）
- 移除「立即開始」→ 改「開始使用」（去掉 ⏰ 急迫感詞）
- 已有 `bg-bg/80 backdrop-blur-md`，scroll 過時 backdrop 加深一點點即可（CSS-only via `@supports` + IntersectionObserver one-line）

**Final nav items:** 產品 / 市場 / 原理 / 安全 / 定價 / 教學

### 5.2 Hero (改寫文案，保留視覺)

**File:** `web/src/components/Hero.astro`

**Visuals: 不動**（FluidRibbon、grid mask、layout 都保留）

**文案重寫 — 三個候選版本（請使用者挑或自己改）：**

| 元素 | 現有 | V1 候選 | V2 候選 | V3 候選 |
|------|------|---------|---------|---------|
| Pill | `Bitfinex 官方授權合作` | `fUSD / fUST 自動報價` | `Bitfinex margin funding 機器人` | `Non-custodial · Bring-your-own Bitfinex 帳號` |
| Headline | 你的加密貨幣，也可以像存股一樣每天配息 | 把 Bitfinex funding 報價，交給機器人 24×60×60 秒盯 | Bitfinex funding 全自動，每 30 秒重新評估報價 | 你不需要每天看 funding rate，機器人會 |
| Subhead | LendAuto 是 Bitfinex 平台的自動放貸機器人 —— 24 小時為你尋找最佳利率，每天結算配息直接入帳。 | fUSD 與 fUST 雙幣對的 funding 自動化工具，根據資金量分層報價，每日結算入帳。 | 持續監控 fUSD / fUST funding market，多檔利率階梯部署，自動追逐 Flash Return Rate 變動。 | 自動化的 Bitfinex margin funding 報價工具。你保有資金 custody，我們只代為掛單。 |
| CTA primary | `立即開始 →` | `開始使用 →` | `開始使用 →` | `開始使用 →` |
| CTA secondary | `查看設定教學` | `先看設定教學` | `先看設定教學` | `先看設定教學` |

**KPI strip（保留結構，數字重做）：**

| 現有 | 現有 issue | 新版 |
|------|-----------|------|
| `2-5% 年化報酬率` | 報酬承諾，禁 | `{30D_FUSD_APR}%` 標籤「過去 30 日 fUSD 平均利率」+ 小字「Bitfinex 公開資料」 |
| `24/7 不間斷監控` | 不改 | `24/7` 標籤「自動報價監控」 |
| `0 需要看盤的時間` | 不改 | `30s` 標籤「報價重新評估週期」（更技術更具體） |

**Mock data**（`mock-data.ts`）：
```ts
export const HERO_KPIS = {
  fusd30dAvgApr: 8.42,  // mock; replace with Bitfinex public API at build time
  rateRefreshSec: 30,
};
```

### 5.3 MarketDashboard 🆕

**File:** `web/src/components/MarketDashboard.astro`
**Section id:** `market`
**Role:** 立刻證明「Bitfinex funding 市場是真實且有規模的機會」，**完全不是 LendAuto 自家數據**。

**Layout:**

```
┌──────────────────────────────────────────────────────────────────────┐
│ MARKET DATA                                                          │
│ Bitfinex Funding Market                                              │
│ 過去 30 日公開市場數據（資料來源：Bitfinex Public API）              │
│                                                                      │
│ ┌───────────────┬───────────────┬───────────────┬───────────────┐    │
│ │ fUSD 30d avg  │ fUST 30d avg  │ 30d high      │ 30d low       │    │
│ │ 8.42% APR     │ 6.18% APR     │ 38.4% APR     │ 2.1% APR      │    │
│ │ ───────────   │ ───────────   │ ↗ 2025-04-22  │ ↘ 2025-05-03  │    │
│ │ vs prev: +0.3 │ vs prev: -0.1 │ spike event   │ low-vol day   │    │
│ └───────────────┴───────────────┴───────────────┴───────────────┘    │
│                                                                      │
│ ┌─────────────────────── 30-day rate sparkline ────────────────────┐ │
│ │                          ╱╲                                      │ │
│ │   ──╱╲──╱╲──╱╲╱─╲──╱╲──╱─ ─╲──╱╲╱─╲╱╲──╱╲                       │ │
│ │  低-────────────────────────────────────────高                   │ │
│ │  2025-04-18                            2025-05-18                │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│ 註：本區塊全部數據來自 Bitfinex 公開 API，與 LendAuto 績效無關。     │
│ Build-time 拉取，每日更新。                                          │
└──────────────────────────────────────────────────────────────────────┘
```

**Stripe 對標元素：** Stripe 的 "Reach revenue" 區塊用 actual graph + 客戶 logo wall — 我們沒有客戶 logo，但有更可信的東西：原始市場數據。Sparkline 用純 SVG（不用 chart library，省 bundle）。

**Mock data:**
```ts
export const MARKET_DATA = {
  fusd30dAvgApr: 8.42,
  fust30dAvgApr: 6.18,
  fusd30dHighApr: 38.40,
  fusd30dHighDate: '2025-04-22',
  fusd30dLowApr: 2.10,
  fusd30dLowDate: '2025-05-03',
  fusdVsPrevDelta: 0.30,   // signed delta vs 前 30 日
  fustVsPrevDelta: -0.10,
  // 30 個日均利率數據點（給 sparkline 用）
  fusd30dDaily: [/* 30 floats */],
  asOf: '2026-05-18T00:00:00Z',
};
```

**Visual treatment:**
- 4-card grid 沿用 Pricing 卡片的圓角與 border treatment（一致性）
- 數字 font-mono、大型字（`text-4xl`），label 小 caps
- Sparkline：純 SVG `<path>`，顏色用 brand→coral 漸層（stroke），高低點用 dot 標出
- 註腳用 `text-mute font-mono text-xs`，明示資料來源
- 整體無動畫（資料密度本身已是視覺重點）

**SEO 注意：** 所有數字必須在 SSG 階段就 inline 到 HTML（不能 client fetch）。當前用常數，未來改 build-time fetcher 即可。

### 5.4 Architecture 🆕（取代並擴展原 Security）

**File:** `web/src/components/Architecture.astro`（重命名/取代 `Security.astro`）
**Section id:** `security`（保留錨點以免外部連結壞掉）

**結構：** 左 sticky 標題 + 右大型 SVG 架構圖 + 三個 pillar 文字卡片 + 靜態績效截圖 slot

**SVG 架構圖內容（左到右資料流）：**

```
  ┌──────────┐      ┌──────────┐      ┌──────────────┐
  │  你的     │──────│ LendAuto │──────│  Bitfinex    │
  │ Bitfinex │      │  Server  │      │  Funding API │
  │  Account │      │          │      │              │
  └────┬─────┘      └──────────┘      └──────────────┘
       │              ▲      ▲
       │              │      │
       │      ┌───────┴──┐   │
       │      │ AES-256  │   │
       │      │ encrypted│   │
       │      │ API key  │   │
       │      │ (funding │   │
       │      │  only)   │   │
       │      └──────────┘   │
       ▼                     │
  ┌──────────┐               │
  │ 提款權限 │  ✗ no path ───┘
  │ 永遠在你 │
  └──────────┘
```

**標題與副標（改寫）：**
- 標題：`你的錢，我們從來沒碰過。`（保留原句，這句很好）
- 副標：把自動化交給我們，把保管留給你自己。三個技術約束讓「我們即使想拿也拿不到」。
- 移除原 trust badge「非託管式（Non-custodial）架構」改成可驗證的具體性 — 放進 pillar 卡片內展開講

**三個 pillar 卡片（保留 0X 編號設計，內容微調）：**

| # | 標題 | 描述 | code tag |
|---|------|------|----------|
| 01 | API 權限只勾 Funding | 你在 Bitfinex 生成 API Key 時只勾 Funding scope，未勾 Withdrawals/Trading。Bitfinex 系統強制執行，連 LendAuto 後端也無法繞過。 | `scope: funding_only` |
| 02 | AES-256-GCM 加密儲存 | API Key 在資料庫是密文，envelope encryption + per-tenant key。連 LendAuto 工程師都看不到明文。 | `AES-256-GCM · envelope` |
| 03 | 資金永遠在你的 Bitfinex 帳號 | LendAuto 是「掛單代理人」，不是 custodian。我們不開錢包、不持有資產、不經手任何提款。 | `custody: self` |

**靜態績效截圖 slot：**

```
┌──────────────────────────────────────────────────────────────────────┐
│ 績效樣張                                                              │
│ 過去 30 日，LendAuto 在 demo 帳號的實際表現                          │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ [PLACEHOLDER IMAGE]                                              │ │
│ │ 1200×600px screenshot 區塊                                       │ │
│ │ TODO: 待 demo account 累積 30 日資料後手動更新此圖               │ │
│ │ TODO: 之後固定每月一張新截圖                                     │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│ 截圖日期：YYYY-MM-DD · 帳號類型：demo · 起始資金 USD X,XXX           │
└──────────────────────────────────────────────────────────────────────┘
```

**Mock asset:** `web/public/screenshots/demo-performance-placeholder.png`（先放一個明顯標 PLACEHOLDER 的圖，使用者後續用真實截圖替換）

**配套說明卡（在截圖下方）：** 「截圖內容無美化、無修圖、無剪輯。我們累積一段時間後會增加更多時間範圍的截圖。」

### 5.5 Steps (既有，微調)

**File:** `web/src/components/Steps.astro`

**Layout：** 不動
**Step 文案微調：**

| # | 標題 | 描述（現有 → 新） |
|---|------|------|
| 1 | 連接 Bitfinex 帳號 | （現有 OK）透過 API Key 綁定，3 分鐘完成。權限只開放貸，不開提款。 |
| 2 | 選擇放貸策略 | （現有 OK）新手模板一鍵套用；進階者可自訂階梯層數與利率區間。 |
| 3 | 機器人自動執行 | 把「關掉電腦也能賺」改為「策略部署後，bot 持續監控市場並自動調整訂單。」（移除「賺」字暗示） |

**Section headline 微調：**
- 現有：「設定簡單到不像在操作自動化系統」
- 新：「三步驟，從 Bitfinex API 設定到開始報價」（更技術更具體）
- 副標保留：「我們把設定流程拆成三步，每步不超過 2 分鐘。不需要讀任何部落客教學文。」

### 5.6 WhyHigher (既有，文案大幅改寫)

**File:** `web/src/components/WhyHigher.astro`

**Headline 改寫（核心問題區）：**
- 現有：`手動掛單賺 8%，交給機器人賺 15-20%` — **禁，必改**
- 新（候選 V1）：`手動掛 1-2 次，bot 每 30 秒重新評估` — 講頻率不講報酬
- 新（候選 V2）：`手動跟不上 Flash Return Rate 變動，bot 可以` — 講機制不講報酬
- 新（候選 V3）：`三件事 bot 做得到、手動做不到` — 講能力不講報酬

**Subhead：**
- 現有：`三個技術核心，把手動放貸做不到的事做到極致。`
- 新：`三個技術差異，把手動放貸的盲點補起來。`（去「極致」這種推銷詞）

**Feature 卡片描述微調（移除推銷詞）：**

| # | 標題 | 描述（保持機制描述，移除「搶不到的暴利」這種） |
|---|------|------|
| 1 | 智能追蹤市場利率 | 自動跟隨 Bitfinex Flash Return Rate 浮動，市場利率變動時即時更新報價。 |
| 2 | 預埋高利率訂單，市場波動時自動成交 | 階梯式部署多檔高利率訂單。當市場資金短缺、利率瞬時抬升時，預埋單會被自動成交。（移除「賺到一般人搶不到的暴利」） |
| 3 | 毫秒級執行 | Go 語言寫的引擎，24 小時不停偵測、不停調倉。（移除「搶在別人前面」「你在睡覺時它也在工作」這種文學化暗示報酬） |

### 5.7 RoiBlock 🆕

**File:** `web/src/components/RoiBlock.astro` + `web/src/components/islands/RoiCalculator.tsx`（可選互動部分）

**Section id:** `roi`

**Static-first 設計（Q4 確認）：**

```
┌──────────────────────────────────────────────────────────────────────┐
│ ROI                                                                  │
│ 訂閱划得來嗎？                                                       │
│ 用過去 30 日 Bitfinex fUSD 平均利率 {8.42}% 算給你看                 │
│                                                                      │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐             │
│ │ 資金 $1,000    │ │ 資金 $10,000   │ │ 資金 $50,000   │             │
│ │                │ │                │ │                │             │
│ │ 月毛配息  $7   │ │ 月毛配息  $70  │ │ 月毛配息  $351 │             │
│ │ Pro 訂閱 −$28  │ │ Pro 訂閱 −$28  │ │ Pro 訂閱 −$28  │             │
│ │ ─────────────  │ │ ─────────────  │ │ ─────────────  │             │
│ │ 月淨 −$21 🔴   │ │ 月淨  $42 🟢   │ │ 月淨 $323 🟢   │             │
│ └────────────────┘ └────────────────┘ └────────────────┘             │
│                                                                      │
│ Pro 盈虧平衡：資金約 $3,990 USD 起（以上述 30 日均利率計算）         │
│                                                                      │
│ ▸ 想試你自己的數字？（點開試算器）                                   │
│                                                                      │
│ 註：上述為過去 30 日市場均值試算，不代表未來表現；訂閱費 NT$899 ≈   │
│ USD $28（以 1 USD = 30 TWD 估）；不含 Bitfinex 平台費。              │
└──────────────────────────────────────────────────────────────────────┘
```

**計算公式：**
- `月毛配息 = 資金 × (年化APR / 12)`
- `月淨 = 月毛 − Pro月費(USD)`
- `盈虧平衡資金 = Pro月費 × 12 / 年化APR`
- 使用 mock 8.42% APR、Pro USD $28

**互動展開（島嶼，預設摺起）：**
- 點 disclosure 後展開：輸入「資金 USD」「希望使用的方案」 → 即時更新一個結果卡
- React island（Pricing 已有複雜 hover transitions，但這個是純表單，React 比較適合）
- 純前端計算，無 fetch

**Mock data:**
```ts
export const ROI_PARAMS = {
  fusd30dAvgApr: 8.42,  // 與 MARKET_DATA 共享
  proPriceTwd: 899,
  twdPerUsd: 30,        // mock 匯率
  proPriceUsd: 28,      // 899 / 30 ≈ 29.97，取整顯示 28
  scenarios: [1000, 10000, 50000],  // 三檔資金預設
};
```

**Visual：** 卡片用 Pricing 同款圓角與陰影。盈虧平衡點 line 用 `text-2xl font-mono font-bold text-ink`，是整個區塊的視覺 anchor。

**Stripe 對標：** Stripe 的 fees calculator 預設帶入 `$10,000 monthly volume` 並直接顯示「Fee: $290」— 我們同樣讓「盈虧平衡 = $3,990」這個結論不需點即可讀到。

### 5.8 Pricing (既有，CTA 文案調整)

**File:** `web/src/components/Pricing.astro`

**Layout、價格、卡片設計：全部不動**

**Headline 微調：**
- 現有：`月訂閱，台幣付款`（OK）
- Subhead 現有：`不用先換成 USDT、不用懂鏈上轉帳。信用卡或超商代碼，跟訂 Netflix 一樣簡單。`
  - 「跟訂 Netflix 一樣簡單」可保留（是事實類比，不是推銷）

**CTA 微調：**
- `免費開始` → 保留
- `訂閱 Pro` → 保留
- `聯絡我們` → 保留
- 都已是中性詞

**新增 risk disclosure（卡片下方小字）：**
> 投資有風險。bot 表現受市場波動影響，過往績效不代表未來表現。

### 5.9 CtaFooter (既有，文案降溫)

**File:** `web/src/components/CtaFooter.astro`

**Visuals：** 保留 glow orbs

**文案改寫：**

| 元素 | 現有 | 新 |
|------|------|------|
| Headline | 準備好讓你的 USD 開始工作了嗎？ | 三分鐘設定，後續完全自動 |
| Subhead | 現在加入，享 **首月免費**。設定不到 5 分鐘，今晚就開始配息。 | Starter 永久免費，可先用免費版熟悉，覺得適合再升級 Pro。 |
| Primary CTA | `立即開始 →` | `開始使用 →` |
| Secondary CTA | `先看設定教學` | `先看設定教學` |

**Footer：** 不動。底部 risk disclaimer 已在，保留。

### 5.10 WaitlistAndContact 🆕

**File:**
- `web/src/components/WaitlistAndContact.astro`（容器 + slot）
- `web/src/components/islands/WaitlistForm.tsx`（島嶼 — Email 提交，純 UI，handler 待 GCP phase）
- `web/src/components/islands/ContactForm.tsx`（島嶼 — Name + Email + Message，純 UI，handler 待 GCP phase）

**Section id:** `connect`

**Layout：** 兩欄並排，桌機左右、手機上下

```
┌────────────────────────────────┐ ┌────────────────────────────────┐
│ 還沒準備好開始？               │ │ 有問題想先問？                 │
│                                │ │                                │
│ 留 Email，我們會在 Pro 版本    │ │ 直接寫信給我們，工作時段 24    │
│ 有重大更新或推出年費方案時通知 │ │ 小時內回覆。                   │
│ 你。不發行銷信。               │ │                                │
│                                │ │ ┌──────────────────────────┐   │
│ ┌──────────────────────────┐   │ │ │ 名字                     │   │
│ │ Email                    │   │ │ └──────────────────────────┘   │
│ └──────────────────────────┘   │ │ ┌──────────────────────────┐   │
│ [ 加入候補名單 ]               │ │ │ Email                    │   │
│                                │ │ └──────────────────────────┘   │
│                                │ │ ┌──────────────────────────┐   │
│                                │ │ │ 想問什麼？               │   │
│                                │ │ │                          │   │
│                                │ │ │                          │   │
│                                │ │ └──────────────────────────┘   │
│                                │ │ [ 送出 ]                       │
└────────────────────────────────┘ └────────────────────────────────┘
```

**互動行為：**
- 兩個 form 都先做純 UI：input 驗證（email 格式、空欄）、submit 後顯示成功 toast、實際不發送
- 加註解：`// TODO: wire to Cloud Run Functions in GCP phase`
- 確保 form 有 `aria-live` 區塊處理錯誤訊息（可及性）

**Mock 行為：**
- Submit → 1.2s simulated delay → 顯示「已記下你的 email / 已收到，會儘快回覆」
- localStorage 記一個 flag `lendauto.waitlist.subscribed` 避免重複提示

---

## 6. 共用基礎建設

### 6.1 Mock data 集中檔

**新檔：** `web/src/lib/mock-data.ts`

```ts
/**
 * 集中所有 mock data，未來 GCP phase 把這個檔案改成 build-time
 * generated（Cloud Build 拉 Bitfinex API + LendAuto v2 stats endpoint）。
 * 元件層完全不需要改。
 */

export const MARKET_DATA = { /* 見 5.3 */ };
export const HERO_KPIS = { /* 見 5.2 */ };
export const ROI_PARAMS = { /* 見 5.7 */ };

export const META = {
  asOf: '2026-05-18T00:00:00Z',
  source: 'Bitfinex Public API (mock during dev)',
};
```

### 6.2 Sparkline component

**新檔：** `web/src/components/Sparkline.astro`（伺服端渲染純 SVG）

Props：
- `data: number[]` — 數值
- `width: number`
- `height: number`
- `strokeGradientId?: string`
- `markHighLow?: boolean` — 在最高/最低點打點

不使用任何 chart library。

### 6.3 Token 補充

`tokens.css` 不動。若需要再補 `--color-warn-soft` 之類的弱版背景色用於 risk disclosure，到時 inline 即可。

---

## 7. Out of scope（本 spec 明確不做）

- ❌ GCP infrastructure（Firebase Hosting / Cloud Build / Cloud Run Functions / Cloud Scheduler）
- ❌ 真實 Bitfinex API 拉取（全用 mock 常數）
- ❌ Waitlist / Contact form 後端串接（純 UI，加 TODO 註解）
- ❌ Bitfinex v2 backend 的 `/api/public/stats` endpoint（屬於 v2 repo）
- ❌ 創辦人介紹頁 / Team section / 公司故事頁（Q3 不選 A）
- ❌ 用戶評價/推薦/媒體 logo wall（Q2 沒這些資產）
- ❌ Live demo dashboard（Q5 選 B，只做架構圖 + 靜態績效截圖）
- ❌ Reddit/Discord 社群整合
- ❌ i18n（網站維持繁中為主）

---

## 8. Success criteria

實作完成後，下列為手動驗收清單：

1. **首屏到 MarketDashboard 之間沒有任何 LendAuto 報酬承諾數字** — 只有 Bitfinex 市場數據
2. **Hero 沒有任何「Bitfinex 官方授權合作」「保證」「保證收益」等無實證或推銷詞**
3. **WhyHigher 移除了 8% / 15-20% 等具體 LendAuto 報酬數字**
4. **RoiBlock 預設場景的負數情境（$1000 卡片）有真實顯示為負**，誠實展示不適用情境
5. **Architecture 區塊有 SVG 架構圖（不是裝飾性圖標）**，且圖中明確標示「提款權限路徑不存在」這個 invariant
6. **靜態績效截圖 slot 有 placeholder 圖且註解清楚標示「待 demo 帳號累積資料後手動更新」**
7. **所有顯示給人類的數字都在 first-paint HTML 內**（用 Lighthouse 跟 view-source 確認）
8. **Mobile（< 768px）所有區塊可讀、無橫向 scroll、CTA 可點**
9. **Lighthouse SEO ≥ 95、Performance ≥ 90、Accessibility ≥ 90**（既有水準）
10. **所有 form 有 aria-live 錯誤訊息區塊**

---

## 9. Open questions / judgment calls（請使用者裁決）

Spec 撰寫時做了幾個 judgment call，請使用者確認或推翻：

1. **Hero 文案三個候選版本 V1 / V2 / V3 哪個？** 預設用 V1（最直白）。
2. **MarketDashboard 是否要顯示 fUST 還是只顯示 fUSD？** 預設顯示兩者（fUSD 為主、fUST 為副），台灣用戶部分用 USDT 較多，fUST 數據對他們更貼。
3. **靜態績效截圖 slot 第一版要不要先空著（先放 placeholder 圖）？** 預設先放明顯標示 PLACEHOLDER 的圖，標註「等 demo 帳號累積 30 日資料」。使用者可選擇暫時不放（hide section）但會留個空 padding gap，較不建議。
4. **Pricing 卡片下方的 risk disclosure 要不要做？** 預設要做（受眾風險意識重要、且和 footer 既有 disclaimer 一致）。
5. **WaitlistAndContact 是放在 CtaFooter 上方還是下方？** 預設放在 CtaFooter 下方、footer 上方。理由：CTA → 「還沒準備好？兩個漏斗給你」→ footer。

---

## 10. 變更影響檢視（既有檔案）

| 檔案 | 變更類型 |
|------|---------|
| `web/src/pages/index.astro` | 改 — 重組 section 順序、新增 4 個 import |
| `web/src/components/Nav.astro` | 改 — 新增 nav item「市場」、改 CTA 字 |
| `web/src/components/Hero.astro` | 改 — 文案重寫、pill 換、KPI 換 |
| `web/src/components/Steps.astro` | 改 — 部分文案微調 |
| `web/src/components/WhyHigher.astro` | 改 — 大幅文案改寫（headline 必改） |
| `web/src/components/Security.astro` | 改名 → `Architecture.astro`，內容大幅擴充 |
| `web/src/components/Pricing.astro` | 改 — 卡片下方加 risk note |
| `web/src/components/CtaFooter.astro` | 改 — headline / subhead / CTA 文案降溫 |
| `web/src/components/MarketDashboard.astro` | 新 |
| `web/src/components/Architecture.astro` | 新（取代 Security.astro） |
| `web/src/components/RoiBlock.astro` | 新 |
| `web/src/components/WaitlistAndContact.astro` | 新 |
| `web/src/components/Sparkline.astro` | 新 |
| `web/src/components/islands/RoiCalculator.tsx` | 新 |
| `web/src/components/islands/WaitlistForm.tsx` | 新 |
| `web/src/components/islands/ContactForm.tsx` | 新 |
| `web/src/lib/mock-data.ts` | 新 |
| `web/public/screenshots/demo-performance-placeholder.png` | 新 asset |
| `web/src/layouts/Layout.astro` | 改 — 預設 `description` 移除「像存股一樣每天配息」 |
| `web/src/pages/index.astro` 的 `<title>` | 改 — 同上理由 |
| `web/src/components/StructuredData.astro` | 改 — FAQ Q2 答案有 8% / 15-20% 禁忌數字、FAQ Q4 有「三層防護確保資金安全」自證型詞、`orgSchema.description` 有「被動配息收入」邊緣推銷詞、`serviceSchema.description` 移除「24 小時追蹤」這類包裝詞 |
| `web/src/pages/llms.txt.ts` | 改 — intro 第二段「把 8% 提升至 15-20%」必移；其餘改成「自動報價、Spike Catching、階梯網格」這種 mechanism-only 描述 |

---

## 11. 跨檔案文案一致性清理（與主 redesign 同 PR）

實施 redesign 同時，下列檔案要做最小化文案修正以維持「實戰質感」一致：

### 11.1 `Layout.astro` 預設 description
- **現有：** `LendAuto — 你的加密貨幣，也可以像存股一樣每天配息。Bitfinex 自動放貸機器人，安全、透明、每日配息。`
- **新：** `LendAuto — Bitfinex margin funding 自動報價工具。非託管式架構，API 權限只開放貸。`

### 11.2 `index.astro` 的 `<title>`
- **現有：** `LendAuto — 你的加密貨幣，也可以像存股一樣每天配息`
- **新：** `LendAuto — Bitfinex Margin Funding 自動報價`（SEO 仍含「Bitfinex」「margin funding」核心字）

### 11.3 `StructuredData.astro` FAQ 改寫

| Q | 現有答案問題 | 新答案 |
|---|------|-------|
| Q1（資金安全）| OK | 保留 |
| Q2（為什麼比手動高）| **8% → 15-20% 禁忌** | 「三個機制差異：(1) bot 24 小時自動跟隨 Flash Return Rate 變動，手動掛單通常每天只動 1-2 次；(2) 階梯式預埋多檔高利率訂單，在市場波動時自動成交；(3) 毫秒級執行。報酬高低取決於市場利率波動，bot 主要改善的是「不錯過機會」而非保證任何特定報酬。」 |
| Q3（付款）| OK | 保留 |
| Q4（API Key 安全）| 「三層防護確保資金安全」自證型 | 「API Key 在資料庫以 AES-256-GCM 加密儲存，連工程師都看不到明文。Bitfinex 端 API 權限只勾 Funding，不勾 Withdrawal/Trading，平台層強制限制提款路徑。資金始終在你的 Bitfinex 帳號，LendAuto 不開錢包、不持有資產。」 |

### 11.4 `StructuredData.astro` `orgSchema.description`
- 現有：`...幫助加密貨幣持有者透過自動追單與策略網格，每日獲得被動配息收入。`
- 新：`LendAuto 是 Bitfinex margin funding 平台的自動報價工具。透過 Flash Return Rate 追蹤、Spike Catching、階梯網格策略，自動化原本需要手動操作的 funding 訂單管理。非託管式架構。`

### 11.5 `StructuredData.astro` `serviceSchema.description`
- 現有：`自動化的 Bitfinex USD/USDT 放貸機器人。24 小時追蹤市場利率，自動掛單、自動配息。非託管式架構，使用者資金始終在自己的 Bitfinex 帳號。`
- 新：保持類似（這段已相對中性），微調為：`Bitfinex fUSD / fUST funding market 的自動報價代理工具。30 秒級重新評估市場利率、階梯式報價部署。Non-custodial — 使用者保有 Bitfinex 帳號 custody。`

### 11.6 `llms.txt.ts` intro
- **現有第二段：** `LendAuto 是面向加密貨幣持有者的被動收入工具。核心價值：把手動掛單能賺到的 8% 年化報酬，透過自動追單、Spike Catching、預埋階梯網格策略，提升至 15-20%。`
- **新第二段：** `LendAuto 是 Bitfinex margin funding 的自動報價工具。核心機制：Flash Return Rate 追蹤、Spike Catching、階梯式網格報價。目標是把手動掛單做不到的事（24 小時不間斷監控、毫秒級調整、多檔利率同時部署）自動化。報酬視市場利率波動而定。`

### 11.7 既有 `/guides` 與 `/blog` 文章
- 本 spec 不掃描內容檔案。若內文有 8% / 15-20% 相似宣告，由使用者後續單獨清理（建議 issue 紀錄）。

---

## 12. 不確定 / 待使用者確認的事實宣告

寫 spec 時用了幾個「來自既有元件或假設」的具體數字，建議使用者驗證或修正：

| 宣告 | 出處 | 風險 |
|------|------|------|
| 30 秒級報價重新評估週期 | 我自己在 brainstorm 中提出，無原始文件依據 | 若實際是 60s / 5s / event-driven，必須修正全部相關文案 |
| Go 1.26 · WebSocket | 既有 `WhyHigher.astro` 既有 tech tag | 若引擎用其他語言或版本需修正 |
| Pro 月費 NT$899 ≈ USD $28（以 1 USD = 30 TWD 估）| 我自己估算 | 2026-05 實際匯率可能 30.5-32，影響 RoiBlock 顯示與盈虧平衡點 |
| 30 日 fUSD 平均 APR 8.42% | mock 值 | 上線前需 Bitfinex 公開 API 實值校正 |
| 30 日 fUST 平均 APR 6.18% | mock 值 | 同上 |
| 30 日 high / low APR | mock 值（38.4%、2.1%）| 同上 |

---

**下一步：** 此 spec 經使用者審後，invoke `writing-plans` skill 產出 file-level granularity 的實作計畫，依計畫實作。
