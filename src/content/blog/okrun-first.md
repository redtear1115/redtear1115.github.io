---
title: "從「我要用最先進的工具組」到「OK...，run first」"
pubDate: "2026-05-07"
tags: []
draft: false
---
一個新 side project 的 initial commit 永遠是最令人興奮的——所有架構都還是完美的，還沒踩任何坑。然後第二個 commit 就把你拉回現實。

Nebula 是一個以 Firebase + Expo 為底的手機 app，目標是讓不同角色的家庭成員（Owner 和 Guest）可以共同管理一塊 board 上的記錄。initial commit 建起了基礎：匿名 auth、Firestore 資料結構、Cloud Functions 處理 createBoard / joinBoard / regeneratePasscode，型別定義也都先進場。看起來很穩——直到 phase 0 來了。

phase 0 的主要任務是「對齊 stack、準備 MVP P0」，但實際上就是一場大掃除。第一個決策是把 Expo 從 53 升到 55（同時把 React Native 從 0.79 拉到 0.82、React 從 18 升 19、expo-router 從 4 跳到 6）。升版本本來就不該是 side project 的開場白，但如果第一天不升，三個月後你就是在翻一座技術債的山。同時，NativeWind v4 進來替換樣式方案，原本規劃的 Gluestack v3、Drizzle、MMKV、Zustand、TanStack Query、React Hook Form + Zod 全部砍掉——備註寫得很坦然：「P1 if needed; not pre-built.」這種取捨才是真正的 MVP 心態。

Firestore schema 也動了。原本用  表示 board 的存活週期，現在改成  TTL field，讓 Firestore 自己在 30 天後刪資料——省掉一個 cron job，也省掉自己忘記寫 cron job。Cloud Functions 從 v1 升到 v2，region 明確指定 asia-east1，同時加了  function 讓 CRUD 動作可以自動重置 TTL。Guest 的權限設計也很有意思：Firestore rule 裡的 update predicate 改成看 ，讓 Guest 可以編輯任何 record——這是刻意信任團隊共同照護的設計，不是漏洞。

然後 Expo 55 的 dependency 衝突來了，一個獨立 commit 解決它，順帶加上了 （負責根據 record 型別決定要渲染什麼元件）。最後，board 的 guests 列表功能進場：tab layout、、、、、、 這些 component 全部一口氣加進來，Firestore rules 也跟著調整。

把「我要裝一堆套件」這句話換成「先做完最核心的功能」，大概是每個 side project 都得重新學一次的功課。

*這段 code 寫於 2026 年 4 月，文章整理於 2026 年 5 月。*

---

<!-- source: nebula | last_sha: e07111a495cd5b8a815c20a233d538068c8e1c4b -->
<!-- commits:
47d9b5abf600c889ce6480044a5a3853d1caf373 2026-04-28 initial commit
50034cd0054a1e7897b43f9133f2c50929d91e0e 2026-04-28 phase 0: align stack with CLAUDE.md, prep for MVP P0
b670f579aee59580b99ea68a85340c655e894c48 2026-04-28 add functions/package-lock.json
8ac28f2b8d61c9d6f86f7a64a88c22ffc4ed76cd 2026-04-28 solve expo 55 pkg dependency problem
e07111a495cd5b8a815c20a233d538068c8e1c4b 2026-04-30 list board's guests
-->
