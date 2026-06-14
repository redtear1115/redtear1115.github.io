---
title: "游標亂跳、JSON-LD 重複、await 又忘記——Futari 那一輪「對齊」雜事"
pubDate: "2026-05-29"
tags: ["devlog", "futari", "release"]
draft: false
---
每次我以為自己已經把 Futari 的「日常瑣事」收乾淨了，打開一看——一個輸入框打到一半游標跳到最後、首頁的 JSON-LD schema 印了兩次、然後 listAllTrips 連 await 都沒加。一句話：每次自以為穩，每次都有新洞。

這輪的主線其實是把「對方剛剛動了」這件事做成 realtime——新做了一個 **PartnerActivityToast**，掛在 dashboard layout 上，subscribe 到 Supabase realtime；對方一插入 expense / income，就在頂端跳 3 秒提示。filter 按 paidBy / recipientId 篩，soft-delete 的 insert 直接 ignore（不然刪一筆也跳 toast 那畫面太智障）。四個語系一起補，reduced-motion 媒體查詢也順手加上——畢竟我不希望某個對動效敏感的使用者，每次對方記一筆飲料就被閃一下。

順手修了 **AmountInput** 的老問題：千分位重格式化會把 caret 噴到字串最後面。改成 reformat 之後用 `setSelectionRange` 把游標 push 回原本的相對位置，中段編輯終於不會打到一半變成「我在末尾繼續加數字」的鬼樣子。

DS 收斂也推進了一截——四個 AssetSheet 的 raw `<input>` 全換成 **TextInput** primitive，單位（NT$ / kg / cm）改用 `rightAddon` 塞進去；FilterSheet 的外殼也改用 SheetFrame + SheetBody + Button ghost，跟 AddSheet / SettlementSheet 對齊。同一輪還把 site-wide 的 WebSite + Organization JSON-LD 從 landing page 搬到 `app/[locale]/layout.tsx`，這樣每個語系 canonical URL 的 schema 語言才會跟內容一致——不然 Google 看到的 Futari 一直只有一種口音。

插曲：我前陣子才寫過一篇文章警告大家「query function 別忘記 await」，結果這輪 grep 一掃，`listAllTrips` / `listActiveTrips` / `listTripRecords` 三個一字排開漏好漏滿。修一行 commit，沒臉寫 PR description，直接 push。

dashboard 的 L3 filter i18n 也跟 records 對齊了——payer toggle 重用 `t.common.{me,partner}`，split toggle 改叫 `dashboard.burden{Me,Partner}`（「算我的 / 算對方的」），不再借用 splitType 那組「全付」字眼誤導使用者。

結論：所謂發版，大概就是每隔兩三天把「我以為對齊但其實沒對齊」的東西再對齊一次。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*

---

<!-- source: oikos | last_sha: 5c56560566078f46031ebc5b88c832665e5e5f5d -->
<!-- commits:
- 298fa647 2026-05-20T01:08:59Z fix: deduplicate JSON-LD schemas (#669)
- e1065e1c 2026-05-20T01:19:51Z feat: realtime partner toast + AmountInput cursor fix (#671)
- a15fbb92 2026-05-20T01:24:41Z refactor: DS adoption — TextInput, Button, FilterSheet (#670)
- ab532115 2026-05-20T04:37:38Z fix: add missing await to listAllTrips, listActiveTrips, listTripRecords
- 5c565605 2026-05-20T02:03:36Z fix: align dashboard L3 filter i18n with records (#679)
-->
