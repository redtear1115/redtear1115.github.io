---
title: "一個用石頭打架的遊戲，卻用 emoji 當牌面——Wildcard 的「野地」長出來了"
pubDate: "2026-05-20"
tags: ["wildcard", "devlog"]
draft: false
---
說真的，一個叫你出門撿石頭、撿樹枝、撿樹葉拍照對戰的遊戲，牌面卻是 🪨📄✂️ 這種系統內建 emoji，每台手機 render 出來還長得不一樣——這事我自己都看不下去。Wildcard 野地對戰的核心明明是「實物」，UI 卻像隨手 demo 出來的。所以我把整套畫面打掉，蓋了一個叫 **fieldbook（野地手帳）** 的 design system。

第一塊地基是 **Atmosphere**：五層疊起來的固定背景——林冠暗角、灑落的陽光、紙張噪點、蕨葉樹枝、石頭碎礫，全部 `pointer-events: none`、`z-index` 各自分層，掛在 `App.jsx` 上，於是每一頁都站在同一個世界裡。接著是一整排 **primitive**：手繪 SVG 的 `TypeIcon`（取代 emoji，而且直接對齊 `lib/battle.js` 的 type）、紙感的 `InkButton`、會閃爍的 `LanternButton`、五種有機石頭變體的 `StoneCard`，還有一座會隨戰局長高的 `Cairn`（疊石堆）。

最得意的一個小決定是 `pickStoneVariant`——同一張牌不能這次是砂岩、下次變玄武岩。所以我用 `cardId` 做了一個 deterministic 的 hash 取 1..5，**同一張卡永遠是同一塊石頭**。不是 `Math.random()`，是純函式。

踩到的坑反而很哲學：對手的照片，client 根本拿不到——Firestore 只讓 type 和 score 過來（這是當初的安全設計）。那對手那一格要畫什麼？我就乾脆做了 `MysteryPebble`，一顆匿名的石頭。後端的限制，被我畫成了一個 UI primitive——這大概是寫前端最爽的時刻：藏不住的東西，就讓它變成風格。

結論是，這批 commit 一行遊戲邏輯都沒改，但 Wildcard 終於看起來像它自己了——一個會叫你蹲在地上找石頭的東西。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*

---

<!-- source: wildcard | last_sha: d28d15b8f800e7b20610e11676a3c8c22c76901d -->
<!-- commits:
- a061d0ef95 feat(atmosphere): add fieldbook background layers as global component
- 8d40a01808 feat(primitive): TypeIcon SVG to replace emoji (rock/paper/scissors)
- ce4d75a243 feat(primitive): LanternButton + InkButton with paper/lantern styling
- 56af7f8771 feat(primitive): StoneCard with 5 organic stone variants
- 8f3802fb50 feat(primitive): Cairn (with state) + LightPoint
- fbf53fb2f6 feat(primitive): ScoreChip, MysteryPebble, ScoreMedal
- d28d15b8f8 feat(primitive): PageFrame + TopBar shared layout helpers
-->
