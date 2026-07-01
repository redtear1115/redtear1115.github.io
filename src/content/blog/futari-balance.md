---
title: "Futari 的餘額不再撒謊：把 balance 從「另存一欄」改成「每筆交易後重算」"
pubDate: "2026-05-09"
tags: ["futari", "architecture", "database", "devlog"]
draft: false
---
寫情侶帳本最荒謬的事，就是你以為「兩人之間誰欠誰多少」是一個欄位——你 INSERT 一筆 transaction，順手 UPDATE 一下 group balance，搞定。然後某天你 soft-delete 一筆舊帳，UPDATE 漏掉了，畫面上的數字就開始撒謊——而最尷尬的是，撒謊對象是你另一半。

---

這次在 Futari 的 Phase 1a，我把 balance 整個拆掉重做。核心決定只有一句話：**balance 不該是一個獨立欄位，它應該是 transactions 的 deterministic 投影**。

實作上，我做了一個 `recalcGroupBalance` helper（單一 file，乾乾淨淨，就是把該 group 沒被 soft-delete 的 transactions 全部加總一遍）。然後 `createTransaction` 和 `softDeleteTransaction` 兩個 server action，每個都把「寫入交易」和「呼叫 recalc」包在同一個 db transaction 裡——要嘛全部成功、要嘛全部回滾。寫起來很無聊，但這就是重點：無聊代表沒有「中間狀態」這種鬼東西可以坑你。

對，每次都全表掃一次重算的確比 incremental update 慢一點點。但「兩個人的帳本」這個 scope 下，一個 group 最多就幾百筆 transaction——讓 Postgres 加總幾百個整數，跟讓我半夜 debug「為什麼前端顯示 -120 但實際應該 -150」相比，CPU 時間真的太便宜了。

---

順手做的小事比想像中花時間：dashboard 從 SSR 餵資料下來，要把 group + member profiles 包成一個 `MemberContextValue`，再用 `ViewerProvider` 包整棵 client tree——這樣 BalanceHero、BrandHeader、那些 avatar overlap 的小細節，才不用每個 component 自己 fetch 一次 viewer 是誰。一開始我懶得做這層 context，結果三個 component 各自跟 server 要 viewer id，醜到我自己看不下去。

最後的踩坑是那個看似無害的 `listRecentTransactions` query——分頁我一開始用 `created_at` 當 cursor，跑兩天後發現同秒兩筆會掉資料，後來改成 `(created_at, id)` composite tuple cursor 才穩。schema 設計時多想三十秒，事後就少 debug 三十分鐘。

---

說到底，atomic recalc 不是什麼炫炮 pattern，它只是「我懶得相信自己每次寫 code 都記得 update 那個 cached 欄位」的具體化。後端工程師的座右銘大概就是：能讓 db 幫你算的事，不要自己算。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*

---

<!-- source: oikos | last_sha: f4ff75a7fbad3c5e11ee68a0d351e200a0d209fc -->
<!-- commits:
- b9d9dfa5 2026-05-02T15:49:56Z feat(ui): FutariMark, Avatar, CategoryChip primitives
- 59a2c6f5 2026-05-02T15:52:37Z feat(nav): bottom nav shell with 4 tabs + center FAB
- de3b0eaf 2026-05-02T15:55:17Z feat(db): recalcGroupBalance helper
- 7b292ddb 2026-05-02T15:57:26Z feat(actions): createTransaction with atomic balance recalc
- 74626053 2026-05-02T15:59:06Z feat(actions): softDeleteTransaction with atomic balance recalc
- 9b77aa0c 2026-05-02T16:00:36Z feat(db): listRecentTransactions query
- f4ff75a7 2026-05-02T16:04:21Z feat(dashboard): server fetch, member context, brand header, balance hero
-->
