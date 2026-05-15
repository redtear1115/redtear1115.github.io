---
title: "我把兩個 PR ship 出去又自己 revert 回來——v0.14.x 的長日"
pubDate: "2026-05-10"
tags: ["futari", "devlog", "release"]
draft: false
---
老實說這天的 git log 看起來像**我發了 v0.14.1，半小時後又 reverted 兩個 feature，然後改成 release v0.14.2**——對，就是這麼荒謬。如果你只看 tag history 大概會以為我在玩什麼版本號疊疊樂，但實情是：兩個明明測過會動的 feature，merge 進 main 之後跟其他 PR 的 race condition 撞出莫名 bug，與其熬夜 hotfix 不如先 revert 回穩定狀態，第二天再以乾淨的姿態重新 land。產品節奏 > 自尊。

但這天真正爆量的不是 revert 戲碼，是**離線瀏覽終於從規格落地成 service worker**、**LINE/IG/FB 的 in-app browser 被擋下來**、**weighted split（不對半分擔）整條 stack 寫穿**——一個能 toggle 的離線 PWA、一個會擋掉 13 種 in-app WebView 的 guard、一條從 schema 到 UI slider 的權重分擔。

## 離線瀏覽：Service Worker 與 Turbopack 的兩面為難

v0.11.1 的時候我在 Settings 加了一個「離線瀏覽」toggle——但**那只是個假按鈕**，背後完全沒接 Service Worker，按了等於沒按。這天把它接上去：Serwist-backed SW 把 app shell ＋三條只讀路徑（`/dashboard`、`/records`、`/assets`）cache 起來，opt-in 才開，sign-out 主動清 cached HTML——不然下一個用同一台手機的人會看到上一個使用者的家計簿，**這種 leak 不能有**。

技術上踩到的坑很有戲：**Serwist 9.x 還是 webpack-only**，但 Next.js 16 的 dev 跑 Turbopack。我在 `next.config.ts` 注入 webpack hook，dev mode 跑起來就吐 warning「你到底要哪個 bundler」。最後分兩條 path——production build 用 `next build --webpack` 讓 Serwist 真的 emit `public/sw.js`，dev 加一行 `turbopack: {}` 把 ack 給 Next 看，配合 Serwist 的 `disable: isDev` 讓 webpack hook 在 dev 變 no-op。**兩個 bundler 不打架的條件就是讓它們各走各的場**。

接下來幾個 hotfix 都是 SW 的後遺症：CDN 把 `sw.js` 304 cache 起來導致更新不下發 → 加 `Cache-Control: no-store`；`manifest.json` 重複塞進 precacheEntries → 拿掉；`/offline` fallback 沒 build-time revision 觸發 precache warning → 補。每一個聽起來都不痛，但**SW 的 bug 永遠在你以為它沒事的時候上線**——這幾條沒在第一天接上的話，使用者會收到一個永遠不更新的 v0.14.0。

## In-app browser guard：擋掉 13 種 WebView

這是 #97 的修補——LINE、IG、FB、Threads、WeChat、Telegram、X、LinkedIn、KakaoTalk 那些 in-app browser 點外部連結進來會出兩個壞事：**Google OAuth 被 Google 自己擋**（secure-browser policy）、Service Worker 跟 Supabase session 也活不下來。原本進來的人就是看到一個 hang 在那裡的登入頁。

解法不是技術上多難——`isInAppBrowser()` 一個 UA matcher utility、`InAppBrowserGuard` 一個 root layout 掛上去的 client component、偵測到就全屏蓋掉，給 copy-link 按鈕、iOS 用 `x-safari-https://` 跳 Safari 的 deep link、Android 給文字步驟。比較難的是**保守判斷**——matcher 不能誤殺真正的 Safari/Chrome，否則一般使用者會被自己的瀏覽器擋在門外。所以特地寫了 130 行測試把每個 UA string 都跑過一輪，這種 guard 一旦 false positive 就是一場災難。

## Weighted split：從 schema 一路接到 slider

之前 split 只有兩種：`half`（對半）跟 `solo`（一人扛）。但伴侶之間「**收入差很多但都覺得對半不公平**」是常見場景——所以這版加了 `weighted`，配 `splitRatioA`（A 承擔的百分比，0–100）。這條改動**從 DB schema 一路打到 slider UI**，commit graph 看起來是這樣：

```
schema → balance.ts → recalcGroupBalance SQL → queries
       → validators → server actions (createTxn / editTxn / recurring)
       → AddSheet / RecurringRuleSheet / SplitTypeSelector / SplitGlyph / CompactRow
       → Settings 預設比例 slider + updateGroupSplitRatio action
```

最關鍵的是 `recalcGroupBalance` 的 SQL——原本 `CASE WHEN split_type = 'half' THEN amount/2` 直接寫死，現在 `weighted` case 變成 `amount * (100 - split_ratio_a) / 100`（從 paid_by 的對方視角算欠多少）。balance 是 Futari 的核心，這條 SQL 改錯一行**整個帳本就漂掉**，所以 `__tests__/balance.test.ts` 補了 24 行涵蓋邊界（0%、100%、四捨五入殘差、混合 half/weighted/solo 同月）才敢動。

UI 端最有意思的是 `SplitGlyph`——那個視覺化 split 比例的小 icon，原本是固定的兩個半圓，weighted 的時候要根據 `ratioA` 動態 fill。SVG 的 `<path d="...">` 算扇形角度，從幾何意義上把「對半 = 兩個固定半圓」推廣成「任意比例 = 兩個動態扇形」——其實就是 360 × ratio / 100，但寫對之後看著它隨 slider 滑動，**那種「啊整條 stack 真的通了」的爽感**值回票價。

## 雙人月度回顧（#44）

這是我這版最想做的功能——每月 1 日 00:05 Asia/Taipei，pg_cron 預計算上個月的 snapshot：4 張卡片（最常一起花的類別 / 本月最大筆 / 定期入帳事件 / 愛物進度），同時把該月的「給下個月的我們」留言鎖死。

設計決策三個值得記下來：

1. **預計算而非 on-demand** — `MonthlyReviewSnapshots` 表把卡片內容 freeze 成 denormalised text（paid_by 的名字、asset 名字、recurring event 名字都當下凍結）。為什麼？因為一個月後 user 可能改名、刪 asset、停掉 recurring rule——但那張回顧卡片應該保留**那個當下的記憶**，不是現在的 state。這跟一般的 normalised DB 直覺反著來，但 review 是一個時光膠囊，**不能讓未來的 mutation 改寫過去**。
2. **Idempotent cron** — `INSERT ... ON CONFLICT DO NOTHING`。cron 跑兩次不會重生 snapshot，也不會覆蓋 user 已存的留言。
3. **「給下個月的我們」editor 配 800ms debounce autosave + 200 codepoint cap + locked 之後 read-only**。鎖點是月初 cron 跑的那一刻——一旦 snapshot 生出來，那個月就封存了。autosave 而非按按鈕，是因為這種留言的 UX 本質是日記，不是 form submit。

Dashboard banner 偏好 quote 對方的留言（solo mode 則 quote 自己），點 CTA 先 dismiss 再導去 `/review/[YYYY-MM]`——dismiss 是 per-user 寫 DB，**對方看過不影響你看**。

## Records inline 統計、FAB context-awareness、Hero collapse

`/records` 加了 inline 月度支出統計 section（#22）——SSR + URL search params（`?month=YYYY-MM`、`?view=category|asset`），不訂閱 realtime。`monthlyStatsByCategory` / `monthlyStatsByAsset` 兩條 query 後來 #44 月度回顧也 reuse，這就是把計算從 component 拉到 query layer 的好處。

FAB 的顏色跟 action 跟著當下 tab（#110）——支出 tab 是 ink、收入是 mint、定期是另一個色——按下去也直接導到對應的 sheet。一個 12 行 commit 但體驗差很多。

Hero card 可收合（#109）那條花了 9 個連續 fix commit 才把對齊調對——`+/−` toggle、collapse 時顯示 name+verb、settle 按鈕在 collapsed state 也要在、ToggleButton 位置 pin 住不要在 collapse/expand 時跳。**這就是 mobile-first UI 的 tax**，每個 state 都要 pixel-perfect 不然會被自己看膩。

## 然後就是那個 revert（與 24 分鐘後的 un-revert）

drill-down filter（#102，點 stats 上的長條 → 下面 feed 自動 filter）跟 description autocomplete（#113，從歷史輸入 suggest）兩個都通過自己的測試 merge 進 v0.14.1。然後在 release 之前最後一輪 smoke test 撞出某個 cross-feature interaction bug——**單獨測都是綠的，組合起來壞**。23:55 我做了個冷靜的決定：兩個都 revert、release v0.14.1 不含這兩條、把它們挪到 v0.14.2、之後再以正確姿態重 land。

ship 跟 revert 同一個小時內發生，看起來丟臉，但**版本號便宜，使用者信任貴**。然後——**24 分鐘後 v0.14.2 release commit 落地（00:24）**，那兩個 feature 真的回來了，靠 `Revert "Revert "feat(...)"` ——git 的雙重否定。git log 看下去就是這樣一個刻意保留的疤痕：

```
9a3567a chore: release v0.14.2
802e521 Revert "Revert "feat(records/stats): drill-down filter on tap..."
052fdbe Revert "Revert "feat(records): description autocomplete..."
b3007a7 Revert "feat(records/stats): drill-down filter on tap..."
77c601a Revert "feat(records): description autocomplete..."
843f4f2 chore: release v0.14.1
```

從 23:23 到 00:24 整整一小時內 ship → revert → re-ship，**git history 老實到讓我自己看了想笑**。但這就是我要的——不偷偷 force push、不假裝那一個小時沒發生過、保留可追溯的決策痕跡。哪天有人問「為什麼 v0.14.1 跟 v0.14.2 之間隔不到一小時」，git log 自己會回答。

中間補的那條 `chore: postpone #114 + #116 to v0.14.2 — trim v0.14.1 docs`、跟 doc-keeper sweep（fix stale PR/version refs）也都收進這個窗口——**revert 不只是 code 要回退，docs 跟 changelog 也要同步**，不然 v0.14.1 的 release notes 還寫著 drill-down filter 已 ship，就會變成另一種 lie。

## 收尾

67 個 commit、v0.14.0 → v0.14.1 → v0.14.2 三版同日（其中第三版跨 00:00 五分鐘）ship 兩 revert 一 re-land。最後在 dashboard 看到那個小小的「給下個月的我們」editor 跳出來、SplitGlyph 的扇形隨 slider 動、in-app browser guard 把 LINE 點進來的人擋下擺一個 jump-to-Safari 按鈕——**Futari 從一個記帳工具，變成有點儀式感的東西了**。

至於那連續四個 revert commit message？我一個字都沒改，全部 git default。`Revert "Revert "..."`——git log 看下去像個冷笑話。剛好。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*
