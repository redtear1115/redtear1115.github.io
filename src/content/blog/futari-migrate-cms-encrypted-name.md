---
title: "七個長得一模一樣的 page.tsx，我終於忍不住把它們換成一個動態路由"
pubDate: "2026-06-03"
tags: ["futari", "devlog"]
draft: false
---
你有沒有那種感覺：某個地方很明顯不對，但改起來工程有點大，所以你一直跟自己說「下次吧」——結果「下次」就在你要加第八個的時候到了？

我這週就碰到了啊。

---

**先講小的：child 全名加密**

Futari 的 asset 裡有一個 type 叫 child，讓使用者幫孩子建立記錄。這次要加「加密全名」這個欄位——可選、opt-in，不填就跳過。

涉及的地方比想像中多：`actions/asset.ts`、`ChildDetailClient`、`ChildSheetBody`、validators，再加上四份語系檔。另外順手修了 `encrypt-existing-pii.mjs` 讀錯環境變數的 bug——它一直讀 `POSTGRES_URL`，但專案慣例是 `DATABASE_URL`。這腳本不是常態跑的，所以沒人注意到，但發現了還是改一改啦。

這條線很乾淨，就是把加密欄位串好、驗證補上，release v1.3.1 出去。

---

**然後是那七個 page.tsx**

Futari 有個「從其他 app 匯入資料」的功能，支援 CWMoney、AndroMoney、Moneybook 等幾個來源。以前的做法是每個來源一個獨立 `page.tsx`——七個 file，結構 90% 相同，只有競品名稱跟比較資料不一樣。

加 Manebo 的時候我就不想再抄第八次了。趁這次一起重構：

把所有競品資料移進 `lib/migrate/sources.ts`——名稱、事實數字、比較欄位全部集中管理。locale file 只留翻譯字串，不再塞比較資料。然後七個獨立 page 全部刪掉，換成一個 `[source]/page.tsx` 動態路由，從 `MIGRATE_SOURCES` 派生出所有路徑跟型別。

刪七個、換一個，diff 是負的，功能更好——這種 commit 真的是我最喜歡的那種吧。

這次還加了一個 `futari_generic` parser，可以讀 ChatGPT 匯出的 CSV 格式，以及「簡單記帳」app 的 pilot。`MigrateChatgptWorkflow` 元件是用來跟使用者解釋「先請 ChatGPT 幫你轉格式、再匯入 Futari」這個工作流——算是把 LLM 當成中介轉換工具的一種使用情境，滿有意思的。

---

#852 跑完之後，以後要加新的競品來源，只要在 `sources.ts` 加一筆資料就好，其他的頁面、路由、sitemap 都會自己長出來。

先去看 v1.4.x 又改了什麼吧。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 6 月。*

---

<!-- source: oikos | last_sha: 1bdc306f80f58bc264919801fe16d68e66ace160 -->
<!-- commits:
6f38754c - fix(scripts): encrypt-existing-pii reads DATABASE_URL (the project convention) 2026-05-29
59b7f28d - feat(assets): #826 child — encrypted full name (optional, opt-in) 2026-05-29
9a77400b - chore: release v1.3.1 2026-05-29
0ae3f2ee - feat(seo): add /migrate/manebo page + structured data improvements (#843 #844 #845) 2026-05-30
7b83173f - docs: add migrate CMS architecture spec (#852) 2026-05-30
015a4b26 - docs: add migrate CMS architecture implementation plan (#852) 2026-05-30
3b87ab5d - feat(migrate): #839 P2a — futari_generic ChatGPT-CSV parser + 簡單記帳 pilot 2026-05-30
4e16e3e3 - feat: add lib/migrate/sources.ts — competitor facts + comparison rows (#852) 2026-05-30
92280867 - refactor: update MigrateBasePageCopy type — remove comparison, add optional fields (#852) 2026-05-30
1bdc306f - refactor: strip comparison data from all locale files — moved to sources.ts (#852) 2026-05-30
-->
