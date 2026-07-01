---
title: "Wildcard 的計分器只記敵人不記自己——一個 trigger 寫錯位置的代價"
pubDate: "2026-05-26"
tags: ["wildcard", "firebase", "devlog"]
draft: false
---
你有沒有過那種感覺——明明打贏了，排行榜卻一臉茫然地看著你，就像你什麼都沒做過？

我以為是演算法壞掉了。老實說，這個猜測在當下相當合理啦——計分邏輯本來就不算簡單，寫這段的那天我也不是特別清醒。Wildcard 裡有一種模式叫「系統對戰」（system battle），你打贏了 AI，理應拿到分數，排行榜卻紋風不動。Firestore 裡的對戰紀錄寫得好好的，分數欄就是不動——這種感覺有點像你明明按了送出，螢幕卻假裝沒看到你。

---

## 先誤診了一圈

我的第一反應是去翻計分函式本身。邏輯有沒有 off-by-one？勝負判斷有沒有反過來？翻了半天，邏輯看起來是對的啊——單元測試也沒爆。

然後我去翻 Firestore 的資料結構，懷疑是不是 field 名稱對不上。也沒有。

一直到我去看 Cloud Function 的 trigger 設定，才突然意識到問題在哪裡。

trigger 掛在 `onDocumentUpdated` 上。

乍看沒問題吧？文件有變動就觸發，這不就是標準做法嗎。

但問題在於系統對戰的生命週期——它是「一次性寫入」的。對戰建立的當下，status 直接就是 `done`。從來沒有「先建立一個 pending 的對戰、然後再更新成 done」這個流程。所以 update 事件永遠等不到，計分 function 永遠不會跑，玩家的分數就這樣消失在虛空裡。

`onDocumentUpdated`——只在文件「被更新」的時候 fire。

`onDocumentWritten`——建立和更新都接。

我把 trigger 換成 `onDocumentWritten`，問題就解了啊。說出來只要一行，找到的時候大概愣了三秒。

---

## 但還沒完

換 trigger 這件事帶出一個新風險：如果一場已經 `done` 的對戰，之後因為任何原因又被寫了一次，分數會重複累加。這種事聽起來不會發生，但我也不想賭。

所以加了一道 guard——進 function 的第一件事就是檢查這場對戰是不是已經 `done`，是的話直接 `return`，不重算。

然後我意識到，之前漏算的那些對戰——那些打贏了卻沒拿到分的場次——都還在 Firestore 裡。所以又寫了一支 `rebuild-scores.js`，跑一遍現有的 battles，把缺的分數全部補回去。

`cleanupBattles` 那邊也順手調整了：之前會把 done 的對戰刪掉，但重建腳本需要完整資料，所以先停掉這個刪除行為。等季節制的架構上線之後再來處理資料清理——就先留個 TODO 吧，反正我知道在哪。

---

## 順帶的門面工程

這批 commits 裡夾了一些跟計分無關的事。OG image 跟 apple-touch-icon 的 SVG source 補上了，然後寫了一支用 `sharp`（底層是 libvips）把 SVG 轉 PNG 的腳本——以前都是手工轉，終於可以自動化了。

排行榜的配色也改了。「你」那一列本來混在一堆獎牌色裡，現在被拉出來做成一盞暖橘色的小燈籠，四周有兩隻螢火蟲繞著它飛——大約每隔 24 秒繞一圈，軌跡是不對稱的橢圓，飄的感覺挺自然的。有加 `prefers-reduced-motion` 的判斷，動畫會自動關掉（是認真的，別笑）。

---

## 教訓是什麼

每次選 trigger 型別之前，先想清楚這個 document 的生命週期長什麼樣。

不是每個東西都會「先生再改」。有些資料從建立的那一刻就是最終態——對戰結果、訂單確認、一次性的事件紀錄。這種情況下掛 `onDocumentUpdated` 就是在等一個永遠不會來的事件。

這個邏輯可以往外推一步啦：你在設計 trigger、webhook、event listener 的時候，要先問「這個事件真的會照我以為的順序發生嗎？還是某些情況下，我等的那個時機根本不存在？」先想清楚生命週期，再選接口。

先不說了，我得去看看還有多少對戰的分數是壞的。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*

---

<!-- source: wildcard | last_sha: 515cddb77eef44803cd0f118e7351627e06377ca -->
<!-- commits:
f15b9e06 feat(brand): label AppLogo as composite image for assistive tech
5ee7947e feat(brand): add OG image SVG source (1200x630)
5691abec feat(brand): add Apple touch icon SVG source (180x180)
f40fe6d3 feat(brand): add image generation script and emit PNG outputs
857efe1e fix(brand): shrink OG wordmark to fit within 1200px canvas
087acbd4 docs(spec): note OG wordmark font-size adjusted from 160 to 130
f714ccb1 feat(brand): wire title, description, og: meta, and apple-touch-icon
f767711c fix(scoring): score human player in system battles
1240582f docs(spec): use absolute URLs for og:image/twitter:image
515cddb7 feat(leaderboard): firefly visit + branch-brown field, hush dim, dark-border hover
-->

