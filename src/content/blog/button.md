---
title: "那天我終於受不了——把 Button 寫了第八次的那一天"
pubDate: "2026-05-19"
tags: ["futari", "design-system", "primitives", "design-tokens", "tailwind", "refactor", "seo", "json-ld", "csv-import", "useReducer", "release"]
draft: false
---
`grep -r "rounded-full px-4 py-2 bg-" app/` ——20 個 match。每一個都是某個 sheet / wizard / setting 裡某顆 button，每一個都有自己微妙不一樣的 padding、border-radius、hover state。**我在 codebase 裡寫了八種 Button 而每一種都堅持自己才是「對的」**。

這天我決定不忍了——花了一整天做 Phase 0 的 design system。然後順手把 SEO 補完、CSV import 延伸到 OFX/QIF、開了個 `/settings/import` wizard——一天兩個 release（v1.1.1 / v1.1.2）。

## Design System Phase 0：先做 token，再做 primitive

我以前做 design system 都從 component 開始——直接寫一個 `<Button>`、之後再想 token 的事。**這次反過來**——先把 token 定下來再寫 component，理由是：你的 component API 會被 token 結構長期約束，token 改不動之後 component 也跟著鎖死。

第一個 PR 是純 token——`control-height` / `sheet-spacing` / `focus-ring` 三組 CSS variable。`control-height` 解決「button 跟 input 高度永遠對不齊」的痼疾、`sheet-spacing` 統一所有 sheet 的 padding scale、`focus-ring` 是 a11y 必要——之前各家 button focus state 各搞各的（甚至有人完全沒做）。

然後是 `Button` primitive——4 variant × 3 size，外加 `aria-busy` loading state（這個我特別開一個 PR 修——之前 loading 的時候 button 的 accessible name 會被 spinner 覆蓋，screen reader 變啞巴）。`TextInput` 帶 addon slot 跟 error state。`Sheet` 拆成 `SheetHeader` / `SheetBody` / `SheetFooter`——`SheetFooter` 內建 safe-area inset，這個東西在 iOS PWA 上沒做你的 button 會被 home indicator 切一半。

接著一波 migration——`InstallGuide` 當 pilot、確認 API 順手之後 AddSheet / IncomeSheet / SettlementSheet / RecurringRuleSheet 全部換過去。**5 個 PR 一字排開、每個都是「換 primitive、沒有 behavior change」**。

副作用——hardcode 的 `#fff` / `bg-white` 全部換成 surface token（PR #620）、Tailwind 裡 recurring 的 arbitrary value 搬進 `@theme inline`（PR #621）。**CSS 大掃除做完，dark mode 一夕之間變可能**。

## SEO 攻勢——從「能被搜到」到「值得被搜到」

Friend test 收尾的時候我意識到一件事——**Futari 在 Google 上根本搜不到**。「夫妻記帳 app」第一頁沒我、「伴侶記帳」也沒有、「CWMoney 匯出」更是夢。SEO 這件事我以前覺得是 marketing 的問題、跟我沒關係——直到我發現 organic search 是這種 niche app 唯一的免費 acquisition channel。

一輪做完幾件事：

**JSON-LD 結構化資料**——`/migrate/*` 加 `BreadcrumbList`（讓 Google SERP 顯示麵包屑）、4 語版本的 FAQ schema（每個 migrate 頁帶 5-8 個常見問題、Google 會直接展開在搜尋結果裡，這是 organic CTR 大殺器）。

**hreflang + sitemap + robots**——sitemap 把 4 語 URL 全列出來、hreflang 標好對應關係、robots.txt **disallow `/sign-in`**（這頁對 SEO 沒幫助、被 index 反而稀釋 landing 的權重）、**allow `/migrate/*`**（要被 index 的是這幾頁）。順手寫一個 test 鎖 hreflang 行為——避免下次某人改 layout 不小心把 hreflang 弄壞。

**Meta description + H1**——landing body 文案塞進「伴侶／夫妻記帳」這種長尾關鍵字（同時還要不違反我自己的品牌文案準則——不能用「追蹤」、不能用「管理」、不能放感嘆號——SEO 跟 brand voice 同時滿足，意外有趣的限制式）。Meta description 4 語對齊、og:description 同步。

**`/migrate/*` 內容延伸**——FAQ block、comparison table、long-tail SEO copy。Landing 也加 `/migrate/*` 的 internal link，把 link juice 往轉換頁集中。

最後一個小到不行但卻是「沒做網站就上線不了」的事——Google Search Console verification meta tag。這東西忘了加，你連自己 site 在 GSC 上看不到 indexing 進度。**v1.1.2 整版就是為了這顆 meta tag** ——說起來有點羞恥但這就是真實。

## CSV import 延伸到 OFX / QIF

延續前一天的 CSV import——再往下做 OFX 和 QIF parser。為什麼這兩個？因為**銀行 export 大多不是 CSV，是 OFX 或 QIF**——尤其 QIF 是 1980 年代 Quicken 訂的格式，老銀行至今還在用（對，包括台灣某些大行）。

順手做了個 `/settings/import` wizard——之前的 `/migrate/*` 是給「未登入的潛在用戶」看的、`/settings/import` 是給「已經是用戶但想匯入第二批舊資料」的人用的。**同樣是 CSV import，但 entry point 不同、UX 不同**。中間的 parser layer 用 `lib/csvImport` 統一——避免兩條路徑各長一份 parser。

## 副線——一堆順手的小重構

這天我可能改了 30 個檔案以上的純重構，沒有 feature 變化但 codebase 變健康：

- `Dashboard.tsx` 從一堆零散 `useState` 改成 `useReducer`——state transition 寫清楚之後，bug 也少了
- `useWizardSteps` hook 抽出來——`/migrate/*` 跟 `/settings/import` 兩邊重複的步驟邏輯共用
- `RecurringRuleSheet` income / expense 兩份合成一份（之前 80% 重複）
- Sheet components `next/dynamic` lazy-load——首屏不需要的 sheet 不要進 main bundle
- SVG icon 移掉沒必要的 `"use client"`——server component 化、bundle 變小
- 刪掉 `OfflineBanner` 跟 `PastEpochBanner` 兩個 dead code（兩個 banner 我做了之後從沒 enable 過）
- `useTranslations()` 加一個 test 鎖 stable-reference 行為——之前不小心改成每 render 新 ref、整個 dashboard 跟著 re-render

## 一個我笑了一下的小事

`refactor: remove unnecessary "use client" from SVG icon components`——這個 PR title 我自己看了笑出來。SVG icon 怎麼會有 `"use client"`？因為**過去某個 Claude session 套了一個 template 直接複製貼上 `"use client"`，從此每個 icon 都帶著這個 directive**——它不會壞、只是讓那 30 個 icon 永遠跑在 client side。

教訓——**agentic 時代要小心 template 的傳染**。一個錯誤 pattern 寫進去、agent 之後會以為這就是這個 codebase 的「對的方式」、然後複製到第 31 個檔案。每次大重構順手清這種東西，比寫新 feature 重要。

## 收尾

design system 從零起步、SEO 一次補齊、CSV import 延伸到 OFX/QIF、外加 30 個小重構——這天我覺得 Futari 從「能跑」變成「能長期跑」。

至於我那八個版本的 Button——大部分明天就刪掉，剩下兩個我打算先留著嚇唬一下未來的我。

這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。
