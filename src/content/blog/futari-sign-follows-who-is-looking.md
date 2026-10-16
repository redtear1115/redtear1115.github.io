---
title: "正數是對方欠我，這個方向先定死"
pubDate: "2026-05-07"
tags: ["futari", "architecture"]
draft: false
---
兩個人看同一筆帳，正負會對調。我登入時正數是對方欠我，對方登入就是反過來。這個方向如果留到畫面才翻，總有一頁會忘。

Phase 1 的規格寫完，我差點把算法直接放進 Server Action。那樣每測一次加減，都要把 Next.js 整包拉起來。我改成三個純函式：`lib/categories.ts`、`lib/balance.ts`、`lib/settlement.ts`。只吃資料、吐資料。沒有資料庫，也沒有對外請求。測試跟檔案同一天出現。

`balance.ts` 把視角定死。正數，對方欠我。負數，我欠對方。畫面拿算好的結果去畫。帳本把方向畫反，兩個人會為一個符號吵起來。這種錯我不打算留到上線再看。

`settlement.ts` 做快速結清的金額。不能超過還欠的數字，旁邊放幾個常見面額。我把測試案例看過一輪，幾乎都是剛好的整數。有零頭的欠款，案例裡沒有。

同一天登入也拐了一下。登入頁的 `next` 沒有跟著 OAuth 走完，登完一律回首頁，原本要去的那頁不見了。我把 `next` 先放進 session，callback 再讀出來。不修的話，每次對畫面都得再登一次，才回到剛才那頁。

[futari.southern-light.dev](https://futari.southern-light.dev)

先不說了啦，我得去補那個有零頭的結清案例。

*這段 code 寫於 2026 年 5 月 2 日，文章整理於 2026 年 10 月 16 日。*

## 同主題的文章

- [帳本只留兩個位子](https://southern-light.dev/blog/futari-only-the-split/)
- [兩個人同時按接受，群組可能會滿出來](https://southern-light.dev/blog/futari-accept-invite-was-two-steps/)

<!--
改寫自 issue 19。viewer-flipped（正數＝對方欠我）是純函式層。GroupBalance 儲存的是 member_a 欠 member_b，兩層符號不同，正文沒有併成同一個。草稿裡的 $237.5 與「金額只存台幣整數」衝突，這裡只保留「測試幾乎都是整數、零頭沒寫」。
last_sha: 7f730adfdf91ec05891e876d8a637503836f9315
commits: 07b4e8a4 move dashboard; c8d00f79 preserve next; 01a73847 redirect /setup; 11469144 phase 1 spec; 3fe4d604 phase 1a plan; 54d48e20 design tokens; 0de81d2a 9-category; 97037e44 balance math; 7f730adf settlement chips
-->

