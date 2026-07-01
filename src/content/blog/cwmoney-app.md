---
title: "那天我把 CWMoney 用戶從十年前的記帳 app 救出來"
pubDate: "2026-05-18"
tags: ["futari", "ai", "architecture", "design-system", "performance", "database", "devlog", "notes"]
draft: false
---
friend test 之後最常聽到的回饋是——「我用 CWMoney / Spendee / Honeydue **十年**了，要我換 app？資料怎麼辦？」。然後我打開 CWMoney 的 export，看到一份 utf-16 編碼、欄位順序跟它 UI 完全不一樣、日期格式長得像 `2026/5/18 下午 3:42` 的 CSV——我懂了，這不是「換 app」的問題，是「**幫人類從十年前的 app 把回憶搶救出來**」的問題。

於是這天我把整套 CSV import 做完了，順便發了 v1.0.5 跟 v1.1.0 兩個版本——還跟自己的 PR review 吵了七輪。

## 先講 CSV import——分成四層做

這種「外部資料 → 我們的 schema」的功能，硬寫一個 `parseCWMoneyCSV()` 一定會悲劇。所以我直接拆成四層：

**Layer 1 — DB schema**：新增 `ImportBatches` 和 `ImportErrors` 兩張表。每次匯入開一個 batch、parse 失敗的 row 不丟掉、寫進 `ImportErrors`（含 row number、原始字串、錯誤原因）讓用戶事後修。這個設計的關鍵是——**parse 失敗不該讓整批匯入炸掉**，要讓用戶看到「100 筆裡 3 筆有問題，要不要先匯入 97 筆」。

**Layer 2 — parser + validator**：parser 純 client-side，CSV 不上傳到 server。理由很簡單——用戶的記帳資料是隱私，能在 browser 裡處理完就不要碰 server。validator 用 Zod schema 對每一 row 跑一次、失敗 row 寫進 batch error。

**Layer 3 — /migrate 落地頁**：Honeydue / Spendee / CWMoney 三個品牌各一頁。每頁講「怎麼 export」「會匯入哪些欄位」「不支援什麼」——不是技術文件，是**幫用戶降低焦慮的說明書**。

**Layer 4 — CWMoney → Futari Excel conversion template**：這個最 hack 但最實用。CWMoney 的 CSV 太亂——我做了一個 `.xlsx` template，裡面有 VLOOKUP + 預設 category mapping，用戶 paste 進去、template 幫你把欄位對好、再下載成 Futari 認得的格式。**對非工程師用戶，Excel 比 wizard 直觀**。

## 然後我踩了 middleware 的坑

template 做完——`public/cwmoney-template.xlsx`、放好、`/migrate/cwmoney` 點下載——**302 redirect 到 /sign-in**。

我看著 network tab，第一個反應是 Next.js bug。第二個反應是 Vercel CDN 出鬼。第三個反應——`grep middleware`，找到那個 catch-all 的 auth guard：**所有未登入 request 都 redirect 到 /sign-in**，包括 `public/` 底下的 static asset。

修法兩行——middleware matcher 加上 `/cwmoney-template.xlsx` 的 exclude。但教訓是——**catch-all middleware 是個誘人的反 pattern**，看起來很 elegant，但只要 `public/` 加一個檔案就要回來改它一次。我可能該重寫成 allowlist 而不是 catch-all，但今天先這樣。

## Perf：Noto Sans TC 在 landing 是 190KB 的純粹浪費

friend test 用戶說 landing「載入有點慢」——我跑了 Lighthouse baseline（順手 commit 起來，下次可以對比），看到一個刺眼的紅字：**Render-blocking resources: 1.2s, 主要是 Noto Sans TC 的 CSS, 190KB**。

我的 `app/layout.tsx` 全域載 Noto Sans TC——當初想說 dashboard 也要用、那就 root layout 載一次就好。**問題是 landing page 根本不用那個字體**，用 system font 就夠了。190KB 的 CSS 在那邊 block render，純粹是因為我懶得分。

解法很 boring 但有效——把 Noto Sans TC 移到 `app/(dashboard)/layout.tsx`、landing / sign-in / migrate 用 system font stack。Landing FCP 直接掉了將近 700ms。**最爽的 perf 優化永遠是「刪掉不該載的東西」**，不是 micro-optimize 已經載進來的東西。

## 然後是夾在中間的小東西——一個按鈕的 icon 我換了三次

Dashboard 上加了個 ✈ 按鈕 wire 到 new-trip sheet。理論上 5 分鐘的 task。

第一版用 Lucide 的 `Send`（paper plane）——感覺像「送 email」，不對。  
第二版換 top-down airliner silhouette——太抽象，看起來像不明飛行物。  
第三版換 Lucide `Plane`（angled airliner outline）——終於對了。

三個 commit 我嫌它煩——但其實這就是 dashboard icon 的真相。**dashboard 上每個 icon 都要在 16×16 像素裡承載「這是什麼」的訊號**，差一點就會被用戶 ignore 或誤觸。三次 commit 在這個尺度其實算少。

## 然後我跟自己的 PR review 吵了七輪

PR #548 是「dashboard + records 的 header/filter 統一」——我自己開的 PR，自己 review。

第一輪 6 個 follow-up（spacing / sizing）  
第二輪 5 個 follow-up  
第三輪 5 個 polish  
第四輪——把 split filter 從 chip group 改成 dual toggle  
第五輪——split toggle 加 ratio modes  
第六輪——split toggle 重新詮釋成「**burden dim**」（viewer × payer 雙軸）  
第七輪——6 個 polish item + 標一個「month chip 不見了」的 bug 留下次

第六輪改最大——我發現一開始的 「split filter」根本是錯的 mental model。Records 上的 split 不是「篩選哪些 split type」，是「我想看誰背負了多少」——這是 burden 維度，不是 split 維度。改完之後突然其他五輪的設計都 make sense 了。

教訓——**有些重構不是「我做錯了」，是「我問錯問題了」**。如果你的 follow-up 一直在 polish 同一個方向、總覺得不對勁——問題八成不在細節，在你對這個 feature 的 framing。

## CLAUDE.md 順手清掉一些謊

doc-keeper 跑了一輪，發現我的 CLAUDE.md 裡：

- balance 的正負號寫反了——`> 0` 寫成 `member_a 欠 member_b`，實際上是 `member_b 欠 member_a`。沒人發現是因為 agent 都靠 code 反推，反正最後 patch 是對的——但你不能讓 doc 騙人。
- currency unit precision 講得很模糊——「整數儲存」沒講哪幾個幣別、USD 是 *100 還是不是。把規則寫死：**TWD / CNY / JPY 整數無小數；USD *100 存整數**。
- v1.x 之前的 release notes 還在主檔——挪進 collapsible，主檔只留最近版本。

## 收尾

一天兩個版本、一套 csv import、一個 perf 大改、一個 icon 換三次、一輪七連 review、一份 doc 收斂——加起來看起來像很多，但其實主軸只有一條：**讓十年的舊用戶能無痛搬家**。為了這條主軸，後面所有事情才有意義。

至於那個「missing month chip」的 bug——我留給明天的我。如果他抱怨，我會請他翻這篇文章。

這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。
