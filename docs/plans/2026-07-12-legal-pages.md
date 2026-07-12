# 法務頁（/privacy + /terms）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 `/privacy` 隱私政策與 `/terms` 服務條款頁（涵蓋整個穩穩控服務），並把 footer、llms.txt、兩個表單的隱私政策接線補齊。

**Architecture:** 新增 `legal` content collection（Markdown 存法務全文，與排版分離）+ 共用 `LegalArticle.astro` 排版殼 + 兩支薄殼頁。設計文件：`docs/specs/2026-07-12-legal-pages-design.md`（KEI-21）。

**Tech Stack:** Astro 6（content layer glob loader）、Tailwind v4、React islands（表單）。

**測試方式注意：** 本 repo 的 `web/` 沒有單元測試框架（無 vitest/playwright）。驗證一律用 `npm run check`（astro check）、`npm run build`、以及對 `dist/` 產物的 grep 斷言。所有指令都在 `web/` 目錄下執行。

---

### Task 1: `legal` content collection 定義

**Files:**
- Modify: `web/src/content.config.ts`

- [ ] **Step 1: 在 content.config.ts 加入 legal collection**

在 `const guides = defineCollection({...});` 之後、`export const collections` 之前插入：

```ts
const legal = defineCollection({
  // .md only (not .mdx) — legal text stays plain markdown, no custom components.
  loader: glob({ pattern: '**/*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** Revision date shown as「最後更新」. Deliberately not pubDate/updatedDate: legal docs have no publish workflow, only revisions. */
    lastUpdated: z.coerce.date(),
  }),
});
```

並把最後一行改成：

```ts
export const collections = { blog, guides, legal };
```

同時把檔案頂部註解的 `Two collections:` 段落更新為三個（加一行 `*   - legal/  : legal documents (privacy policy, terms of service)`）。

- [ ] **Step 2: 驗證 astro check 通過**

Run: `cd web && npm run check`
Expected: 0 errors（空 collection 是合法的，此時還沒有 .md 檔）

- [ ] **Step 3: Commit**

```bash
git add web/src/content.config.ts
git commit -m "feat(web): add legal content collection (KEI-21)"
```

---

### Task 2: privacy.md 隱私政策全文

**Files:**
- Create: `web/src/content/legal/privacy.md`

- [ ] **Step 1: 建立 privacy.md，內容如下（全文照貼）**

```markdown
---
title: 隱私政策
description: 穩穩控如何蒐集、利用與保護你的個人資料。依個人資料保護法第 8 條應告知事項撰寫。
lastUpdated: 2026-07-12
---

## 適用範圍

本隱私政策說明「穩穩控」（下稱本服務）如何蒐集、處理及利用你的個人資料。適用範圍包含本網站（lendauto.com）與產品應用程式（app.lendauto.com）。

本服務目前由開發團隊以服務名義營運；如日後成立法人主體，將更新本政策並標示變更。

## 我們蒐集哪些資料

**在本網站：**

- **候補名單**：你的 email 地址。
- **聯絡表單**：你的名字、email 地址與訊息內容。

**在產品應用程式：**

- **帳號資料**：註冊 email 與登入憑證。
- **Bitfinex API Key**：僅要求放貸（funding）所需權限，以 AES-256-GCM 加密保存。本服務採非託管式架構，無法動用或提領你的資金 — 資產始終留在你自己的 Bitfinex 帳戶。
- **服務運作紀錄**：放貸掛單與收益等策略運作所需的資料。

## 蒐集目的與利用方式

- 候補名單 email：僅用於重大更新與新方案通知。不發行銷信。
- 聯絡表單：僅用於回覆你的詢問。
- 帳號與 API Key：僅用於提供自動放貸服務本身。

我們**不出售**你的個人資料，也**不會**將其提供給第三方作行銷用途。僅在法律要求（如司法機關依法調取）時揭露。

## Cookie 與追蹤技術

本網站**不使用追蹤 cookie，也沒有任何第三方分析工具**。

唯一的本機儲存是瀏覽器 localStorage 中的一個旗標，用來記住你已加入候補名單、避免重複顯示表單。它不含個人資料、不跨站追蹤，你可隨時透過瀏覽器清除。

## 保存期間與地區

個人資料於服務存續期間保存於 Google Cloud Platform 基礎設施。當你要求刪除、或資料已無保存必要時，我們會刪除或去識別化。

## 你的權利

依個人資料保護法第 3 條，你可以隨時：

- 查詢或請求閱覽你的個人資料
- 請求製給複製本
- 請求補充或更正
- 請求停止蒐集、處理或利用
- 請求刪除

行使方式：來信 [hello@lendauto.com](mailto:hello@lendauto.com)，我們會在合理期間內處理。

## 不提供資料的影響

所有資料的提供都出於你的自由選擇。不提供 email 只會讓你收不到更新通知；不提供 API Key 則無法使用自動放貸功能，除此之外不影響你的任何權益。

## 政策更新

本政策可能因法規或服務內容變動而更新。重大變更會在本頁標示最後更新日期，並於合理期間前在網站上公告。持續使用本服務即表示你了解並同意更新後的政策。
```

- [ ] **Step 2: 驗證 schema 合法**

Run: `cd web && npm run check`
Expected: 0 errors（frontmatter 通過 legal schema 驗證）

- [ ] **Step 3: Commit**

```bash
git add web/src/content/legal/privacy.md
git commit -m "feat(web): privacy policy content (KEI-21)"
```

---

### Task 3: terms.md 服務條款全文

**Files:**
- Create: `web/src/content/legal/terms.md`

- [ ] **Step 1: 建立 terms.md，內容如下（全文照貼）**

```markdown
---
title: 服務條款
description: 使用穩穩控服務的約定事項：服務內容、訂閱與退款、風險聲明、準據法。
lastUpdated: 2026-07-12
---

## 條款的接受與提供方

本服務條款（下稱本條款）是你與「穩穩控」（下稱本服務）之間的約定。註冊、訂閱或以任何方式使用本服務，即表示你已閱讀、了解並同意本條款。

本服務目前由開發團隊以服務名義營運；如日後成立法人主體，本條款將更新提供方名稱並公告。

## 服務說明

本服務是 Bitfinex margin funding（放貸）的自動報價工具：透過你授權的 API Key，24 小時監控放貸市場利率並自動掛單、調倉。

本服務採**非託管式架構**：你的資產始終留在你自己的 Bitfinex 帳戶內，本服務僅透過 API 代你掛放貸單，無法提領或轉移你的資金。

本服務**不是**交易所、不是存款機構，也**不提供投資建議**。

## 帳號與 API Key

- 你應妥善保管帳號憑證與 API Key，並對帳號下的所有活動負責。
- 建立 API Key 時，應僅授權放貸（funding）所需權限，**不應**開啟提領（withdrawal）權限。本服務的任何功能都不需要提領權限。
- 你必須是 Bitfinex 的有效使用者並遵守其服務條款。Bitfinex 平台本身的可用性、規則變動與風險由該平台承擔與規範，非本服務所能控制。

## 訂閱、付款與退款

- 本服務提供免費方案與付費訂閱方案，各方案內容與價格以[定價頁](/pricing)為準。
- 付費方案按月訂閱。你可以**隨時取消**，取消後服務提供至當期期末，**已收取的款項不予退還**。
- 價格如有調整，將於生效前在網站公告；調整不影響已付款的當期。

## 風險聲明與免責

- **投資有風險**。放貸收益隨市場利率波動，本服務**不保證任何收益**，過往績效不代表未來表現。
- 本服務提供的所有數據（含收益估算、市場利率）僅供參考，不構成投資建議。你的所有投資決策由你自行負責。
- 放貸市場本身的風險（含借款方違約、平台強制平倉機制、極端行情下的損失分攤）由 Bitfinex 平台規則規範，詳見其官方說明。
- 在法律允許的最大範圍內，本服務對因市場波動、Bitfinex 平台中斷、不可抗力事件所生的損失不負賠償責任。**但因本服務故意或重大過失**造成的損害，不在免責範圍內。

## 服務變更與終止

- 本服務得因維護、安全或功能調整而暫停或變更部分功能，重大變更會事先公告。
- 你可以隨時停止使用並刪除帳號。
- 如你違反本條款（含濫用 API、危害系統安全），本服務得暫停或終止你的使用權。

## 準據法與管轄

本條款之解釋與適用，以中華民國（台灣）法律為準據法。因本條款所生之爭議，雙方同意以台灣台北地方法院為第一審管轄法院；如法律有消費者保護之專屬管轄規定，從其規定。

## 條款更新

本條款可能不定期更新。重大變更會在本頁標示最後更新日期，並於合理期間前在網站上公告。變更生效後繼續使用本服務，即表示你同意更新後的條款。
```

- [ ] **Step 2: 驗證 schema 合法**

Run: `cd web && npm run check`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add web/src/content/legal/terms.md
git commit -m "feat(web): terms of service content (KEI-21)"
```

---

### Task 4: LegalArticle.astro 共用排版殼

**Files:**
- Create: `web/src/components/LegalArticle.astro`

- [ ] **Step 1: 建立元件，內容如下**

設計對齊 `about.astro` 的 header（eyebrow + display 標題 + subtle radial mesh）與 `guides/[...slug].astro` 的 prose 樣式（class 改名 `legal-prose` 避免互相污染）。不用品牌色於標題/eyebrow（brand-restraint 慣例；連結可用 brand，與 guide-prose 一致）。

```astro
---
/**
 * LegalArticle — shared shell for legal documents (/privacy, /terms).
 * Header mirrors about.astro; prose styles mirror guide-prose but scoped
 * to .legal-prose (h2 downsized for the narrower column). Narrow column (max-w-3xl) for long-form readability.
 */
interface Props {
  title: string;
  lastUpdated: Date;
}

const { title, lastUpdated } = Astro.props;
const updatedLabel = lastUpdated.toISOString().slice(0, 10);
---

<section class="pt-16 lg:pt-24 pb-10 lg:pb-14 relative overflow-hidden">
  <!-- Subtle radial mesh, consistent with /about and /guides -->
  <div
    class="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] pointer-events-none opacity-60"
    style="background: radial-gradient(ellipse, rgb(99 91 255 / 0.10) 0%, transparent 70%);"
  >
  </div>

  <div class="relative max-w-7xl mx-auto px-6 lg:px-12">
    <header class="max-w-3xl">
      <div class="eyebrow text-xs font-mono font-semibold text-mute uppercase tracking-wider mb-4">
        法務
      </div>
      <h1
        class="text-5xl lg:text-6xl font-display font-bold text-ink tracking-tight leading-[1.05] mb-5"
      >
        {title}
      </h1>
      <p class="text-sm font-mono text-mute">最後更新：{updatedLabel}</p>
    </header>
  </div>
</section>

<section class="pb-[64px] lg:pb-[96px]">
  <div class="max-w-7xl mx-auto px-6 lg:px-12">
    <article class="legal-prose max-w-3xl">
      <slot />
    </article>
  </div>
</section>

<style is:global>
  /* Scoped to .legal-prose so it doesn't pollute other pages. */
  .legal-prose {
    color: var(--color-ink-soft);
    line-height: 1.7;
    font-size: 16px;
  }

  .legal-prose > * + * {
    margin-top: 1.2em;
  }

  .legal-prose h2 {
    margin: 3rem 0 1rem;
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-ink);
    letter-spacing: -0.02em;
    line-height: 1.2;
    scroll-margin-top: 8rem;
  }

  .legal-prose p {
    color: var(--color-ink-soft);
  }

  .legal-prose strong {
    color: var(--color-ink);
    font-weight: 700;
  }

  .legal-prose a {
    color: var(--color-brand);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 2px;
    transition: color 150ms ease;
  }

  .legal-prose a:hover {
    color: color-mix(in srgb, var(--color-brand) 75%, black);
  }

  .legal-prose ul {
    margin: 1rem 0;
    padding-left: 1.5rem;
    list-style: disc;
  }

  .legal-prose li {
    margin: 0.4em 0;
  }

  .legal-prose li::marker {
    color: var(--color-mute);
  }
</style>
```

- [ ] **Step 2: 驗證 astro check 通過**

Run: `cd web && npm run check`
Expected: 0 errors（元件尚未被引用也合法）

- [ ] **Step 3: Commit**

```bash
git add web/src/components/LegalArticle.astro
git commit -m "feat(web): LegalArticle shared shell for legal pages (KEI-21)"
```

---

### Task 5: /privacy 與 /terms 薄殼頁

**Files:**
- Create: `web/src/pages/privacy.astro`
- Create: `web/src/pages/terms.astro`

- [ ] **Step 1: 建立 privacy.astro**

```astro
---
import { getEntry, render } from 'astro:content';
import Layout from '../layouts/Layout.astro';
import Nav from '../components/Nav.astro';
import CtaFooter from '../components/CtaFooter.astro';
import LegalArticle from '../components/LegalArticle.astro';

const entry = await getEntry('legal', 'privacy');
if (!entry) throw new Error('content/legal/privacy.md is missing');
const { Content } = await render(entry);
---

<Layout title={`${entry.data.title} — 穩穩控`} description={entry.data.description}>
  <Nav />
  <main id="main" class="pt-[68px]">
    <LegalArticle title={entry.data.title} lastUpdated={entry.data.lastUpdated}>
      <Content />
    </LegalArticle>
  </main>
  <CtaFooter />
</Layout>
```

- [ ] **Step 2: 建立 terms.astro（同構，只換 entry id 與錯誤訊息）**

```astro
---
import { getEntry, render } from 'astro:content';
import Layout from '../layouts/Layout.astro';
import Nav from '../components/Nav.astro';
import CtaFooter from '../components/CtaFooter.astro';
import LegalArticle from '../components/LegalArticle.astro';

const entry = await getEntry('legal', 'terms');
if (!entry) throw new Error('content/legal/terms.md is missing');
const { Content } = await render(entry);
---

<Layout title={`${entry.data.title} — 穩穩控`} description={entry.data.description}>
  <Nav />
  <main id="main" class="pt-[68px]">
    <LegalArticle title={entry.data.title} lastUpdated={entry.data.lastUpdated}>
      <Content />
    </LegalArticle>
  </main>
  <CtaFooter />
</Layout>
```

- [ ] **Step 3: Build 並驗證產物**

Run: `cd web && npm run build`
Expected: build 成功。

Run: `ls web/dist/privacy/index.html web/dist/terms/index.html`
Expected: 兩個檔案都存在。

Run: `grep -c "最後更新" web/dist/privacy/index.html`
Expected: `1`（以上）

- [ ] **Step 4: Commit**

```bash
git add web/src/pages/privacy.astro web/src/pages/terms.astro
git commit -m "feat(web): /privacy + /terms pages (KEI-21)"
```

---

### Task 6: footer 與 llms.txt 連結加回

**Files:**
- Modify: `web/src/components/CtaFooter.astro:20-26`（「公司」欄 links 陣列）
- Modify: `web/src/pages/llms.txt.ts:42-45`（「重要連結」段）

- [ ] **Step 1: CtaFooter「公司」欄加回兩條連結**

把：

```js
  {
    heading: '公司',
    links: [
      { label: '關於我們', href: '/about' },
      { label: '聯絡我們', href: 'mailto:hello@lendauto.com' },
    ],
  },
```

改成：

```js
  {
    heading: '公司',
    links: [
      { label: '關於我們', href: '/about' },
      { label: '聯絡我們', href: 'mailto:hello@lendauto.com' },
      { label: '服務條款', href: '/terms' },
      { label: '隱私政策', href: '/privacy' },
    ],
  },
```

- [ ] **Step 2: llms.txt「重要連結」段加兩條**

把：

```ts
## 重要連結

- [產品應用程式](https://app.lendauto.com): 註冊、登入、訂閱、Dashboard
- [聯絡信箱](mailto:hello@lendauto.com)
```

改成：

```ts
## 重要連結

- [產品應用程式](https://app.lendauto.com): 註冊、登入、訂閱、Dashboard
- [聯絡信箱](mailto:hello@lendauto.com)
- [服務條款](${baseUrl}/terms)
- [隱私政策](${baseUrl}/privacy)
```

- [ ] **Step 3: Build 並驗證無 404 回歸**

Run: `cd web && npm run build`
Expected: 成功。

Run: `grep -c 'href="/privacy"' web/dist/index.html && grep -c 'href="/terms"' web/dist/index.html`
Expected: 各 ≥1（首頁 footer 有渲染出連結）

Run: `grep -c "/terms" web/dist/llms.txt && grep -c "/privacy" web/dist/llms.txt`
Expected: 各 ≥1

- [ ] **Step 4: Commit**

```bash
git add web/src/components/CtaFooter.astro web/src/pages/llms.txt.ts
git commit -m "feat(web): restore legal links in footer + llms.txt (KEI-21)"
```

---

### Task 7: 表單同意提示（個資法 §8 蒐集當下告知）

**Files:**
- Modify: `web/src/components/islands/WaitlistForm.tsx`（submit button 之後）
- Modify: `web/src/components/islands/ContactForm.tsx`（submit button 之後）

- [ ] **Step 1: WaitlistForm 加同意提示**

在 `</button>` 與 `<div id="waitlist-status" ...>` 之間插入：

```tsx
      <p className="text-xs text-mute leading-relaxed">
        送出即表示你同意
        <a href="/privacy" className="underline underline-offset-2 hover:text-ink transition-colors">
          〈隱私政策〉
        </a>
        。
      </p>
```

- [ ] **Step 2: ContactForm 加同意提示**

在 `</button>` 與 `<div id="contact-status" ...>` 之間插入（內容完全相同）：

```tsx
      <p className="text-xs text-mute leading-relaxed">
        送出即表示你同意
        <a href="/privacy" className="underline underline-offset-2 hover:text-ink transition-colors">
          〈隱私政策〉
        </a>
        。
      </p>
```

- [ ] **Step 3: Build 並驗證**

Run: `cd web && npm run build`
Expected: 成功。

Run: `grep -c "送出即表示你同意" web/dist/index.html`
Expected: ≥1（首頁含 WaitlistAndContact 區塊，SSR 產出提示文字）

- [ ] **Step 4: Commit**

```bash
git add web/src/components/islands/WaitlistForm.tsx web/src/components/islands/ContactForm.tsx
git commit -m "feat(web): consent notice on waitlist + contact forms (KEI-21)"
```

---

### Task 8: 全站驗證收尾

**Files:** 無新檔案（驗證 only）

- [ ] **Step 1: 完整 check + build**

Run: `cd web && npm run check && npm run build`
Expected: 0 errors、build 成功。

- [ ] **Step 2: 驗證 sitemap 收錄兩頁**

Run: `grep -o "lendauto.com/privacy\|lendauto.com/terms" web/dist/sitemap-0.xml`
Expected: 兩個 URL 都出現。（若 sitemap 檔名不同，先 `ls web/dist/sitemap*` 找到實際檔名再 grep。）

- [ ] **Step 3: 手動視覺確認（dev server）**

Run: `cd web && npm run dev`
開 `http://localhost:4321/privacy` 與 `/terms`：header 樣式與 /about 一致、內文窄欄可讀、footer 連結可點、表單下方有同意提示。

- [ ] **Step 4: 確認工作區乾淨（除既有的 README 刪除與 docs/reference 外無未提交變更）**

Run: `git status --short`
Expected: 只剩 ` D README.md` 與 `?? docs/reference/`（本 plan 範圍外的既有狀態）。
