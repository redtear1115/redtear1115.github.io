---
title: "Futari 開發日誌 2：從定期收入到加權分攤落地"
pubDate: "2026-05-14"
tags: ["futari", "devlog", "indie-dev"]
draft: false
---
### 2026-05-07 — 2026-05-11 · v0.9.0 → v0.14.2

---

v0.8.0 剛出，我沒有停下來。

下一個要做的是保險細節頁。我一直覺得保險在記帳工具裡是被忽略的一塊——你知道你每年繳多少保費，但你不知道這張保單現在值多少、還剩幾年、當初買的原因是什麼。v0.9.0 的目標是讓儲蓄險有一個真正有意義的詳情頁：合約期間進度條、保費繳了幾年還剩幾年、累計保費、預計滿期金額。SavingsHero 元件就是這個版本生的。

同時，v0.8.0 出來之後我做了一輪 design critique，整理出一批 P0 跟 P1 的視覺問題。底部 sheet 的圓角要統一到 24px，EditTextSheet 要從底部 fixed 改成有 keyboard push-up 行為，排版用的 `--fs-*` typography scale token 要從 inline style 搬進 CSS variable 再接 Tailwind utility class。這些事情瑣碎，但做完之後整個介面的一致性明顯好很多。

---

5/8 那天的 commit 量很大，因為有很多事情同時在跑。

一個是安全性。Supabase advisor 跑出來的 InitPlan 問題，RLS policy 有幾個設計不夠緊的地方，我補了 REVOKE PUBLIC、調整 RLS 讓它走 Index 而不是 Seq Scan。然後是孩子的 PII 加密——v0.10.0，把 ChildDetails 裡的姓名、身份證字號這類欄位全部 AES-256-GCM 加密，key 從 user's session 推導，伺服器端看不到明文。這個做起來不難，但要想清楚 key 推導的路徑，以及測試裡怎麼 mock crypto。

另一個是 i18n。v0.11.0、v0.11.1、v0.11.2 三個版本都在 5/8 出了。

我原本只有中文（繁體），這次加了簡體中文跟日文，後來又加了英文，共 4 語。架構是 server 端用 `getTranslations()`，dashboard layout 包一個 `<TranslationsProvider>`，client 端用 `useTranslations()`，locale 存在 cookie 裡讓 middleware 讀取。

翻譯字典整個展開來很嚇人——dashboard、records、settings、assets 全部頁面大約 80 個以上的 key，乘以 4 語。日文的翻譯我自己沒把握，但先放進去，之後有機會再找 native speaker review。date helper 也在這個版本改掉了，從自己寫的格式化函式換成 `Intl.DateTimeFormat`，讓日期顯示自然配合 locale。

v0.11.3 是 SEO 基礎：robots.txt、sitemap.xml、keyword-rich metadata、JSON-LD structured data。v0.11.4 是愛物清單的色點識別——每種愛物類型有自己的 primary color，list item 左側 accent stripe 的色調由 `color-mix()` 從主色推導出來，跟 detail page header 用同一個 hue family。

---

5/9 是很密集的一天，有很多功能同時 merge 進來。

CSV 匯出（#37）這個需求我掛在 backlog 很久了，原因在市場觀察裡有說——「資料會不會消失」是用戶的底層焦慮，Spendee 曾經刪過用戶資料，Honeydue 衰退的時候很多人在問怎麼把資料帶走。所以 CSV 匯出不只是功能，也是信任的一部分。實作上就是把 active 的 CashTransactions 轉成標準 CSV 格式，讓用戶下載。

信任宣示頁（#48）也在這天出了。一個靜態頁面，說清楚 Futari 怎麼對待你的資料——不會賣、不會消失、你可以隨時帶走。這個頁面不是法律文件，是一種承諾的展示。

定期支出（#18）的四個 PR 在 5/9 全部 merge：foundation schema 跟 cron、server actions 跟 DB queries、Settings 子頁跟 Dashboard pending stack、AddSheet 的「改一下」流程跟 Records 的快捷入口。RecurringExpenseRules 跟 RecurringIncomeRules 的邏輯 90% 一樣，我做了一次 dedupe 把共用邏輯抽出來，不然兩邊各自維護一份會很痛。

v0.12.0（陪伴×信任）、v0.13.0（定期支出）在 5/9 出了。v0.13.1 加了哲學卡——在 group setup 之前插入幾張卡片，說我們是誰、這個工具的立場是什麼。這個功能很小，但我很在意它，因為它說的是「進到 Futari 的東西就是兩個人共同的」這件事。

---

5/10，v0.14.0，月度回顧跟 PWA 離線支援同天落地。

月度回顧（#44）：月初 pg_cron 凍結上個月的雙人資料，存成 `MonthlyReviewSnapshots`，配一些系統生成的 `MonthlyReviewMessages`。離線的時候你還是看得到上個月的數字。這個設計跟離線策略的關係很緊：我不想讓整個 app 都離線可用（太複雜），但回顧資料是靜態快照，非常適合 cache。

PWA 離線瀏覽（#19）是 opt-in，用 Settings toggle 開啟。SW 的 precache 設定踩了幾個坑——`manifest.json` 不能放進 explicit precacheEntries（Next.js 自己管），`/offline` 要有 build-time revision 不然 workbox 會警告，sw.js 本身要設 `Cache-Control: no-store` 防止 CDN 快取到舊版。還有一個問題是 LINE/Instagram/Facebook 的內建 WebView 不支援某些 Web API，我加了一個偵測機制，在這些環境下顯示引導畫面要求用戶用外部瀏覽器開啟（#97）。

加權分攤（weighted split）是 v0.14.1 的主角。

在這之前，分攤模式只有三種：我全付、對方全付、各半。但有時候你們的收入比例不是 1:1，各半就不公平。加權分攤讓你設一個 group-level 的預設比例（比如 60:40），然後每筆帳可以繼承這個比例，也可以個別調整。

Schema 加了 `split_ratio_a` 欄位，balance 計算的 SQL 加了 weighted case，`SplitTypeSelector` 裡 half 的位置換成帶 slider 的 weighted 選項，`SplitGlyph` 的視覺也支援動態比例填色。Settings 頁加了 group 預設比例的 slider，snap 到 10% 增量。遞送路徑是 dashboard page → AddSheet → createTransaction / editTransaction → balance recalc，定期支出的流程也要同步接上去。

這個功能做起來改的地方很多，但改完之後覺得很值——這才是兩個人真實生活的樣子，不是每件事都五五開。

v0.14.2 在 5/11 落地，Records 的描述自動完成（從歷史紀錄推薦）跟統計圖表的點擊篩選在這個版本加回來（之前曾經 revert 過，因為跟其他功能有衝突，這次解決衝突後重新 merge）。

---

這四天，Futari 從一個記帳工具的骨架，長成了一個比較完整的產品。

回頭看，最花時間的不是寫 code，是想清楚「這個功能對兩個人一起生活有什麼意義」。定期收入是「不必再記住薪水」，加權分攤是「依比例分擔，不強迫對半」，月度回顧是「斷線了也記得這個月我們發生了什麼」——每個功能背後都有一個真實的場景在支撐著它。
