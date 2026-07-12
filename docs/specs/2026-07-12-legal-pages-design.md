# 法務頁設計：/privacy 隱私政策 + /terms 服務條款

- **日期**：2026-07-12
- **Issue**：[KEI-21](https://linear.app/keith-5201314/issue/KEI-21/)（Urgent — 對外網站正式上線 milestone）
- **狀態**：設計已核可，待實作

## 背景與目標

首頁與 `/about` 都有收 email 的表單（候補 + 聯絡），依個資法 §8 告知義務，隱私政策實務上必要。footer 原有 `/terms`、`/privacy` 連結於 c56a37e 因頁面不存在（避免 404）移除，本次補齊頁面後加回。

**目標**：兩個公開、可爬、標準路徑的法務頁，內容涵蓋整個穩穩控服務（行銷站 + app.lendauto.com），app 之後的註冊/結帳流程以連結指向這裡（單一正本，業界標準做法）。

## 已定案的決策

| 決策 | 結論 |
|---|---|
| 涵蓋範圍 | 整個服務（網站表單 + app 訂閱/API Key），一套正本 |
| 法律主體 | 尚無公司 — 以「穩穩控（下稱本服務）」自稱，條款預留更新機制，公司設立後補實體名稱 |
| 準據法/管轄 | 中華民國法律、台灣法院 |
| 隱私範圍 | 照「實際會做的事」寫：收 email 用於通知、表單資料用於回覆、不出售資料、無追蹤 cookie、僅 localStorage 訂閱旗標 |
| 退款政策 | SaaS 標準：隨時可取消、當期服務至期末、已收款項不退（正式收費前可再調） |
| 實作方式 | 方案 B — `legal` content collection（Markdown）+ 薄殼頁，法務文字與排版分離 |

## 架構

```
web/src/
  content.config.ts               ← 加 legal collection（title, lastUpdated）
  content/legal/
    privacy.md                    ← 隱私政策全文（純 Markdown）
    terms.md                      ← 服務條款全文
  components/LegalArticle.astro   ← 共用排版殼：eyebrow + h1 + 最後更新日期 + prose
  pages/
    privacy.astro                 ← 薄殼 render legal/privacy → /privacy
    terms.astro                   ← 薄殼 render legal/terms → /terms
```

- 視覺沿用 `about.astro` header 模式（eyebrow + display 標題 + subtle radial mesh）
- 內文窄欄 `max-w-3xl`、`text-ink-soft`，標題 `font-display`
- **不用品牌色**（brand-restraint 慣例）
- 各章節 h2 帶 id 錨點，供 app 深連結（如 `/terms#refund`）

## 內容大綱

### privacy.md（對齊個資法 §8 六項告知）

1. 前言：蒐集者「穩穩控（下稱本服務）」、適用範圍（本網站 + app.lendauto.com）
2. 蒐集的資料：候補 email／聯絡表單（姓名、email、訊息）／app 帳號資料與 Bitfinex API Key（唯讀+放貸權限、AES-256-GCM 加密保存）
3. 目的與利用：通知、回覆、提供服務；不出售、不供第三方行銷
4. Cookie 與追蹤：無追蹤 cookie、無第三方分析；僅 localStorage「已訂閱」旗標
5. 保存期間與地區：服務存續期間、GCP 基礎設施
6. 當事人權利（個資法 §3）：查詢/更正/刪除/停止利用 → hello@lendauto.com
7. 不提供的影響：僅收不到通知
8. 政策更新機制 + 最後更新日期

### terms.md

1. 提供方與同意：穩穩控（下稱本服務）；使用即同意；公司設立後更新主體名稱
2. 服務說明：Bitfinex margin funding 自動報價工具、非託管（資金留在使用者 Bitfinex 帳戶）
3. 帳號與 API Key：使用者保管責任、僅授權放貸權限
4. 訂閱與付款：方案、月訂閱、隨時可取消、當期至期末、已收款不退；價格變更預告
5. 風險聲明與免責：不保證收益、非投資建議、市場風險自負；合理範圍免責（重大過失除外，避免消保法顯失公平而無效）
6. 服務變更與終止
7. 準據法與管轄：中華民國法律、台灣法院
8. 條款更新機制 + 最後更新日期

免責用詞與 footer 現有「投資有風險。本服務不保證收益，過往績效不代表未來表現。」一致，不創第二套說法。

## 站內接線（三處）

1. **`web/src/components/CtaFooter.astro`**：「公司」欄加回「服務條款 /terms」「隱私政策 /privacy」
2. **`web/src/pages/llms.txt.ts`**：「重要連結」段加兩條
3. **表單同意提示**：`WaitlistForm.tsx`、`ContactForm.tsx` 送出鈕下方加小字「送出即表示你同意〈隱私政策〉」連結 `/privacy`（滿足 §8 蒐集當下可得知悉）

## 範圍外（明確不做）

- 表單接後端（仍為 stub，另案）
- app 端的同意勾選框（app repo 的事）
- GDPR/歐盟合規（未針對歐盟提供服務）
- 律師審閱（正式收費上線前應辦，非本次）
- KEI-33 風險揭露頁（Platform issue；本設計的 collection 架構已為其預留擴充空間）

## 驗證

- `npm run build` 通過，`dist/` 產出兩頁
- footer / llms.txt / 兩表單的連結無 404 回歸
- 手動視覺確認與 /about 排版一致

## 法規依據（2026-07 查證）

- 個資法 §8 告知六項（[全國法規資料庫](https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=I0050021&flno=8)）
- 個資法 2025-11-11 修正公布、個資會籌備中（[pdpc.gov.tw](https://www.pdpc.gov.tw/)）— 監管趨嚴，現在補課正是時候
- 消保法定型化契約：顯失公平條款無效 → 免責寫合理範圍
