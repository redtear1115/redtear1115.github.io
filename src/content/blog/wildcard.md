---
title: "在 wildcard 蓋一座牌組系統前，我先蓋了三把鏟子"
pubDate: "2026-05-14"
tags: ["wildcard", "firebase", "testing", "gamedev", "devlog"]
draft: false
---
牌組系統的 spec 寫到一半，我才意識到 wildcard 還是一個沒有任何測試的專案——所以這個 feature 的第一個 commit，不是 createCard，而是 `npm i -D vitest jsdom fake-indexeddb`。是的，在我打算讓使用者用相機把照片變成卡片之前，我得先說服 jsdom 接受 `File.arrayBuffer`（它不接受，要 polyfill），還要哄 IndexedDB 在 node 環境裡假裝自己存在。基本工沒做，後面什麼 transaction 都別談。

---

這次的目標是 wildcard 的核心 — 個人牌組，上限 20 張、拍照建卡、自動去重。我先把 spec 跟 implementation plan 兩份文件寫進 `docs/superpowers/`，17 個 task 用 TDD 順序排好：lib utils 先、Firestore CRUD 跟著、security rules 再來、UI 收尾。這種「先把不會跑的東西想清楚」的階段我以前最容易跳過——然後在 Firestore rules 寫到第三版的時候才開始懷疑人生。

接著補三把鏟子。**SHA-256 hash util**：把整張 File 餵進 `crypto.subtle.digest`，回傳 hex string，之後拿去當 imageHashes 集合的 doc id，全平台同一張圖只進得了 Firestore 一次。**image resize**：用 OffscreenCanvas 把長邊壓到指定 max-dim，原圖太大會直接讓使用者流量哭。**imageDb wrapper**：薄薄一層包 IndexedDB，把圖檔 binary 留在裝置端，Firestore 只存 metadata 跟 hash——這樣每張卡 doc 也才幾百 byte。

---

寫到一半發生一個很 stupid 的小事：vitest 起來之後，hash test 直接炸——`File.arrayBuffer is not a function`。查了一下 jsdom 25 才把這個塞進去（之前要自己 polyfill），於是第二個 commit 變成 `polyfill File.arrayBuffer for jsdom 25 in test setup`。所以 hash util 本人乾乾淨淨地一個 commit 進來，但旁邊跟著一個專門幫測試環境圓謊的 commit——這種 commit 寫 message 的時候總有一點不甘心。

---

下一步是 Firestore CRUD 跟 createCard 的 transaction，那才是真正會卡關的地方。鏟子先磨好，再開始挖洞。

*這段 code 寫於 2026 年 4 月，文章整理於 2026 年 5 月。*

---

<!-- source: wildcard | last_sha: 026f0db2da6cd04d1812c2c07af541c82c47b076 -->
<!-- commits:
- e9539578 2026-04-27T11:25:48Z docs: simplify README for non-developers
- 31ac3982 2026-04-29T03:25:38Z delete non-using skill files
- 62c28d8b 2026-05-01T16:46:30Z add skill lock
- c4846b5c 2026-05-01T17:12:24Z docs: 牌組系統 design spec
- cae2b64f 2026-05-01T17:18:21Z docs: 牌組系統 implementation plan
- 0ad6dfb8 2026-05-01T17:22:08Z chore: add vitest with jsdom and fake-indexeddb
- a28445ef 2026-05-01T17:25:55Z feat: add SHA-256 hash util for File
- a44e3059 2026-05-01T17:28:37Z chore: polyfill File.arrayBuffer for jsdom 25 in test setup
- bd0a155f 2026-05-01T17:33:08Z feat: add image resize util (max-dim, OffscreenCanvas)
- 026f0db2 2026-05-01T17:40:11Z feat: add IndexedDB wrapper for card images
-->
