---
title: "Wildcard 野地對戰：用石頭樹葉打架，Vision API 幫你出牌"
pubDate: "2026-05-07"
tags: ["wildcard", "google-cloud", "game"]
draft: false
---
一開始的 commit message 叫做「racing car 1」——沒有 1 之前的版本，沒有任何說明，只有一輛不知道要開去哪的車。這就是 Wildcard 野地對戰的誕生。

---

## 這在做什麼

Wildcard 是一個現實版剪刀石頭布：你出門找一塊石頭、一根樹枝、一片樹葉，拍照，AI 判斷你出的牌，然後和人（或系統）對決。規則簡單到荒謬，但實作起來比想像中麻煩很多。

最早的版本把 Google Cloud Vision API 直接在前端呼叫——是的，API key 就這樣飄在 browser 裡。這大概撐了不到半小時，就把 `analyzeImage` 搬進 Cloud Function 了。架在 `asia-east1`，加上 Firestore security rules 擋掉未授權呼叫，才算是一個能見人的狀態。

---

## 戰鬥邏輯有多脆弱

初版的勝負判斷是直接寫在前端的，`aWins` / `bWins` 兩個欄位手動加減。問題是兩個玩家同時寫入的話，race condition 就出來了——這在 Firestore 沒有用 transaction 的情況下幾乎是必然的。後來加了 `onBattleComplete` 這個 Firestore trigger，改由後端統一結算分數，前端只負責顯示。

Battle loading animation 是同一天加的——因為 Vision API 要跑一下，如果畫面直接卡死，使用者根本不知道發生什麼事。有時候修正確性和修體驗是同一件事。

---

## 排行榜與身份問題

暱稱格式定為 `nickname#xxxx`，用 mono 字體顯示 suffix，視覺上和 Discord 很像。這個決策主要是為了讓同名玩家能共存，不用強迫取唯一 username。

排行榜同時加入了對戰歷史，每筆記錄存 `battleId`，這樣從排行榜點進去還能看到當時的對戰細節。`cleanupBattles` 是一個排程 Cloud Function，每天 04:00 刪掉超過七天的 pending 對戰——但 done 的對戰保留，因為重建排行榜需要歷史資料。

另外 Vite config 加了 code splitting，把 firebase 和 react 拆成獨立 chunk，首屏載入快一點。這種優化通常會被拖到很後面，但這次在 day 1 就順手做了。

---

踩坑清單可以繼續列下去，但核心邏輯大概就是：API key 別放前端，勝負判斷別讓兩個 client 搶著寫，暱稱加個 suffix 省掉一堆 unique constraint 的麻煩。

*這段 code 寫於 2026 年 4 月，文章整理於 2026 年 5 月。*

---

<!-- source: wildcard | last_sha: 9ee8b0335aa8be1dbbd7f7bf2813f5a95da4d594 -->
<!-- commits:
cf14187047f1 2026-04-25 initial commit
65437a4720e6 2026-04-25 racing car 1
ed0f277e7cd2 2026-04-25 feat: move Vision API to Cloud Function, add security rules, region asia-east1
8421d0f1124e 2026-04-25 feat: battle loading animation, fix win/loss logic, aWins bWins
d83f40340c95 2026-04-25 feat: battle history in leaderboard, opponent nickname, saveBattleId
dd5cca45d9fb 2026-04-25 perf: code splitting for firebase and react chunks
e76a20b263e9 2026-04-26 feat: nickname#xxxx display, scheduled battle cleanup, README rewrite
14fa43bd9479 2026-04-26 chore: gitignore .firebase/ deploy cache
ea0fabb3859f 2026-04-26 chore: remove unused template files
9ee8b0335aa8 2026-04-26 chore: remove unused components and assets
-->
