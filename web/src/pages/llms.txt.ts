/**
 * llms.txt — proposed convention for LLM-friendly content discovery.
 *
 * 2026 status: ~10% adoption, no major LLM has officially committed to honoring it.
 * Cost to ship is near-zero so we publish anyway. Auto-generated from collections.
 *
 * Spec: https://llmstxt.org/
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site?.toString().replace(/\/$/, '') ?? 'https://lendauto.com';

  const guides = (await getCollection('guides', ({ data }) => !data.draft)).sort(
    (a, b) => (a.data.order ?? 999) - (b.data.order ?? 999)
  );

  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  const body = `# 穩穩控

> 自動化的 Bitfinex USD/USDT 放貸機器人。透過 API Key 連動，24 小時為使用者尋找最佳利率，每天結算配息直接入帳。非託管式架構，使用者資金始終在自己的 Bitfinex 帳號內。

穩穩控 是 Bitfinex margin funding 的自動報價工具。核心機制：Flash Return Rate 追蹤、Spike Catching、階梯式網格報價。目標是把手動掛單做不到的事（24 小時不間斷監控、毫秒級調整、多檔利率同時部署）自動化。報酬視市場利率波動而定。

## 產品資訊

- [首頁與產品介紹](${baseUrl}/): 包含 Hero、市場儀表板、安全機制、三步驟上手
- [關於我們與運作原理](${baseUrl}/about): 為什麼報酬更高 — FRR 追蹤、Spike Catching、毫秒級執行
- [定價方案與 ROI 試算](${baseUrl}/pricing): Starter (免費)、Pro (NT$899/月)、Elite (NT$2,999/月)
- [安全機制](${baseUrl}/#security): API 權限只開放貸、AES-256-GCM 加密、非託管式架構

## 教學文章
${guides.length === 0 ? '\n（教學文章準備中）\n' : guides.map((g) => `- [${g.data.title}](${baseUrl}/guides/${g.id}): ${g.data.description}`).join('\n')}

## 部落格
${posts.length === 0 ? '\n（部落格文章準備中）\n' : posts.map((p) => `- [${p.data.title}](${baseUrl}/blog/${p.id}): ${p.data.description}`).join('\n')}

## 重要連結

- [產品應用程式](https://app.lendauto.com): 註冊、登入、訂閱、Dashboard
- [聯絡信箱](mailto:hello@lendauto.com)
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
