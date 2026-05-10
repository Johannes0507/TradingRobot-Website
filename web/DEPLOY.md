# Cloudflare Pages 部署指南

LendAuto Website 是純 SSG（靜態網站），**不需要 Cloudflare Adapter** —— 只要把 `dist/` 推上 Cloudflare Pages 即可。

> 為什麼選 Cloudflare：Cloudflare 2025 年收購 Astro，是一級支援平台，CDN 效能、邊緣快取、免費額度都對行銷站友善。

---

## 一、首次設定（5 分鐘）

### 1. 登入 Cloudflare → Pages

開 [dash.cloudflare.com](https://dash.cloudflare.com) → 左側 **Workers & Pages** → **Create** → **Pages** 標籤 → **Connect to Git**。

### 2. 連接 GitHub

授權 Cloudflare 存取 `Johannes0507/TradingRobot-Website` repo。

### 3. 設定 Build

| 欄位 | 值 |
|------|------|
| **Production branch** | `main` |
| **Framework preset** | `Astro` |
| **Build command** | `cd web && npm install && npm run build` |
| **Build output directory** | `web/dist` |
| **Root directory** | _（留空）_ |
| **Environment variables (Production)** | `PUBLIC_APP_BASE_URL=https://app.lendauto.com` |

### 4. 點 **Save and Deploy**

第一次 build 約 2-3 分鐘。完成後會給你 `*.pages.dev` 預覽網址。

---

## 二、綁定自訂網域

Pages 專案頁 → **Custom domains** → **Set up a custom domain** → 輸入 `lendauto.com`。

Cloudflare 會自動幫你設 DNS（如果網域已在 Cloudflare），SSL 證書自動申請。

> 如果網域**不在 Cloudflare**：先把網域 NS 改到 Cloudflare（建議），或自行加 CNAME 指向 `*.pages.dev`。

---

## 三、後續部署

之後 push 到 `main` 會自動觸發 build & deploy，PR 也會有 preview URL。

```bash
git push origin main
# Cloudflare Pages 會在約 1-2 分鐘內完成部署
```

---

## 四、環境變數

| 變數 | 用途 | 預設值 |
|------|------|--------|
| `PUBLIC_APP_BASE_URL` | 訂閱 / 登入 CTA 跳轉的目標 domain | `https://app.lendauto.com` |

開發時建立 `.env`：

```
PUBLIC_APP_BASE_URL=http://localhost:5173
```

---

## 五、為什麼不需要 Cloudflare Adapter？

`@astrojs/cloudflare` 只在以下情況需要：

- 你需要 SSR（每次請求動態渲染）
- 你需要 Cloudflare Functions / Workers
- 你需要 Server Endpoints（不是 build-time 產生的）

我們**全部都是 SSG**（build 時產生靜態 HTML），所以根本沒有 server runtime，不需要 adapter。
這是最便宜、最快、最 SEO 友善的部署方式。

---

## 六、本機測試 production build

部署前可以本機先驗證：

```bash
cd web
npm run build
npm run preview  # 模擬 production
# → http://localhost:4321
```
