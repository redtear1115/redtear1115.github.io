---
title: "功能做好了，腳本還在讀一個不存在的 env 變數"
pubDate: "2026-06-02"
tags: ["futari", "devlog", "release"]
draft: false
---
你有沒有寫過那種，功能本體完全沒問題、但配套的腳本默默讀了一個錯的 env 變數，然後你渾然不知的故事？我最近就撞上一個——而且比較慘的是，腳本是我自己寫的。

背景是這樣：Futari 在這輪把子女欄位的全名加密（`Assets.name_encrypted`），走 AES-256-GCM，opt-in，使用者可以選擇要不要開。功能本體搭在 PR #835 的基礎上，改了 `ChildDetailClient`、`ChildSheetBody`、validators、四個 locale 檔，算是滿完整的一套——PR review 通過，合進去，v1.3.1 當天出版。

問題出在 `scripts/encrypt-existing-pii.mjs`，那支是用來處理「既有資料回填加密」的工具腳本。它跑起來讀 `POSTGRES_URL`，但整個 project 的慣例——從 `lib/db/client.ts` 到 `.env.local.example`——用的是 `DATABASE_URL`。

所以它靜靜地讀了一個空值，沒有噴錯，然後什麼都沒做。

這種 bug 超不好抓啊，因為它不炸、它不跳錯，它只是「什麼都沒發生」。我盯著 log 一頭霧水，懷疑是不是 DB 連線問題，懷疑是不是資料本來就已經加密了，最後才回頭看 env 的讀法——欸，`POSTGRES_URL`？這個 key 根本不存在。

改一行，把 `POSTGRES_URL` 換成 `DATABASE_URL`，腳本跑起來。

可遷移的教訓是：**工具腳本跟主 codebase 共用一套 env 命名慣例，這件事值得在 CLAUDE.md 或 .env.local.example 的頂部明確列出來**。功能 code 因為走正常 import 路徑，會自然跟著 `lib/db/client.ts` 的慣例；但獨立腳本是手寫的，很容易憑印象猜 key 名，猜錯了又不報錯，就會默默跑了一個空的回填。

v1.3.1 這版同時也把 migrate 引流頁擴充到台灣幾個主流 app——Moneybook、AndroMoney、Mobills——讓從這幾個 app 過來的用戶有自己的落地頁，不用再全部導到同一個通用頁面。這塊算是穩步推進啦，沒什麼特別的衝突。

先不說了，我得去把其他工具腳本的 env 讀法掃一遍——這次，趁它們還沒在 prod 上默默跑了一個空迴圈之前。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 6 月。*

---

<!-- source: oikos | last_sha: a98cd5551d81 -->
<!-- commits:
6f38754c6d14 2026-05-29 fix(scripts): encrypt-existing-pii reads DATABASE_URL
59b7f28d0626 2026-05-29 feat(assets): #826 child encrypted full name (optional, opt-in)
9a77400b21ff 2026-05-29 chore: release v1.3.1
a98cd5551d81 2026-05-30 feat(migrate): #839 P1 — Taiwan export-CSV migrate pages
-->

