---
title: "Wildcard 終於不像「灰色 stone-100 盒子大集合」了——一場野地改造"
pubDate: "2026-05-22"
tags: ["wildcard", "devlog"]
draft: false
---
說真的，Wildcard 野地對戰是個讓你出門撿石頭、撿樹枝、撿樹葉，拍照拿來打剪刀石頭布的遊戲——結果整個介面長得像一份報稅表單。到處都是 `bg-stone-100`、`text-stone-400`，每張卡片都一個樣（灰、灰、還是灰）。一個叫你去野地探險的 app，UI 卻冷得像主機房——這就很尷尬啦。

所以這次我把五個頁面整個翻過一遍，從 Home、Deck、Battle、Result 到 Leaderboard，全部換上一套「**fieldbook（野地手帳）**」的視覺語言。紙感暖色、手寫字體（Caveat）、燈籠按鈕、葉子裝飾——重點是，每張卡片現在都靠 `pickStoneVariant(cardId)` 拿到一個 **deterministic 的石頭外觀**。同一張卡每次 render 都長一樣，但每張卡彼此都不同——這很重要啊，因為亂數每次重畫就跳一次，使用者會以為自己眼花。

技術上其實沒動到核心邏輯——Firestore 的 `updateDoc`、鍵盤處理那些全留著，這次純粹是 view 層的事。比較好玩的是 Leaderboard 的 tab 切換：我沒寫任何 JS state，純靠 `data-tab` 這個 attribute 掛在 `PageFrame` 上，剩下交給 CSS selector 決定哪個 section 顯示。為了讓它過得去，我還順手把 `PageFrame` 改成會 pass-through 任意 props——這樣頁面才掛得上 `data-*` 吧。

收尾那個 commit 最有 sense——我把建構期用的 design plan 檔砍了，只留 `docs/mockups/` 當設計的 source of truth。畢竟鷹架蓋完房子就該拆啦，留在 git history 裡只會讓下一個人困惑。

對手的照片到不了 client，所以 Result 頁我用 `MysteryPebble` 一排小石頭頂著——看不到對手出什麼，但至少不是一片空白的尷尬。

*這段 code 寫於 2026 年 5 月 2 日，文章整理於 2026 年 5 月。*

---

<!-- source: wildcard | last_sha: 0803057df48c1c192792a5e40aeb14f14999de6d -->
<!-- commits:
- e29c634e 2026-05-02T01:42:40Z feat(home): redesign with masthead, nameplate, lantern + ink action stack
- e5a98c46 2026-05-02T01:45:19Z feat(deck): redesign with light-points capacity, stone-framed grid, paper edit sheet
- 06fe89e4 2026-05-02T01:47:46Z feat(battle): redesign with stone slots, pebble row, growing cairn, lantern submit
- a424155c 2026-05-02T01:49:47Z feat(result): three-state redesign with verdict hero, gold/silver/bronze medal
- 229387a6 2026-05-02T01:51:23Z feat(leaderboard): redesign with tabs, metal-bordered top 3, me row, bottom CTA
- 9254e150 2026-05-02T01:52:43Z chore(polish): sweep stale stone-* and generic colors to fieldbook palette
- 0803057d 2026-05-02T01:55:48Z chore: remove fieldbook plan file (kept mockups as design reference)
-->

