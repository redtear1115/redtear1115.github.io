---
title: "VanishWhisper：兩年前的 Firebase 空殼，現在有了完整的 E2E 加密和消失訊息"
pubDate: "2026-05-06"
tags: []
draft: false
---
兩年前我在 Firestore 建了個 repo，然後什麼都沒發生——直到最近。

---

VanishWhisper 的核心想法很簡單：訊息讀完就消失。但「讀完就消失」這件事，如果你想做對，其實不簡單。

整個加密架構長這樣：每個 user 在第一次登入時，瀏覽器會在本機產生一組 RSA keypair，公鑰存進 Firestore，私鑰只活在 IndexedDB 裡。當兩個人建立對話（session），系統會產生一把 AES-256-GCM 的 session key，用對方的 RSA 公鑰 wrap 起來再存進 Firestore。換言之，就算我把整個 database dump 出來，也看不到任何人說了什麼——因為 private key 從來沒離開過你的裝置。

然後是 vanish 機制。每則訊息有兩個 recipient-only 欄位：`ReadAt`（收件方第一次看到這則訊息時才寫入）和 `DeletedAt`（可以是系統自動觸發，也可以是傳送方主動 unsend）。Firestore rules 設計成傳送方只能寫 `DeletedAt`，不能回頭改 `ReadAt`——這樣才能確保「已讀」這件事的誠信不被破壞。

---

踩坑紀錄：realtime session list 的部分，因為 Firestore 不支援 OR query，同一個 session document 裡的兩個 participant 欄位，必須分成兩個 `onSnapshot` 各自監聽，然後在 client 端 merge 再排序。這個「兩個 listener merge 一個 list」的模式，寫的時候沒什麼，但 debug 的時候非常有趣（不是好的那種有趣）。

另外，per-user local labels 存在 IndexedDB，不上雲——所以你幫對方取的暱稱，對方永遠不知道。我覺得這個設計決策意外地很有哲學感。

---

一個加密 chat app，從 Firebase 空殼沉睡兩年，然後在某個週日下午一口氣把 E2E 加密、vanish 邏輯、UI 全部刷完——這就是 side project 的正確開法。

*這段 code 寫於 2023 年 12 月，文章整理於 2026 年 5 月。*

---

<!-- source: vanishwhisper | last_sha: fbd5d87f -->
<!-- commits:
89ad8077 initial commit (2023-12-28)
9bddd881 add hosting configs (2023-12-28)
9626dc46 scaffold vue+ts toolchain, anonymous auth + rsa keypair (2026-04-27)
ca962bbe phase 1 step 2: invitation flow + per-session aes key wrapping (2026-04-27)
2f29f900 phase 1 step 3: realtime session list on home view (2026-04-27)
86303d14 phase 1 step 4: end-to-end encrypted 1-on-1 chat (2026-04-27)
e00c07cf phase 1 step 5: read & vanish (2026-04-27)
65601dfc phase 2 steps 1+2: sender unsend + emoji reactions (2026-04-27)
10709c3f ui redesign + per-user local labels + chat empty state (2026-04-27)
fbd5d87f labels augment ids; secondary mint accents; no self-react (2026-04-27)
-->
