---
title: "帳本的靈魂不在 UI，在那三個純函式"
pubDate: "2026-05-07"
tags: ["futari", "feature"]
draft: false
---
一開始的問題很具體：兩個人共用帳本，誰欠誰多少錢？——聽起來很簡單，直到你開始寫 code，才發現「觀點」才是最麻煩的事。

Futari 的帳本邏輯，我本來想直接塞進 Server Action 裡順手算一下就好。但 Phase 1 的 spec 寫完之後（對，先寫 spec，這是被以前踩坑逼出來的習慣），我意識到這樣做等於把業務邏輯跟 Next.js 框架的命運綁在一起——測試就只能啟動整個 runtime，修一個算式就要跑 CI，完全不值得。

所以這次乖乖抽出了三個純函式 module：`lib/categories.ts`、`lib/balance.ts`、`lib/settlement.ts`。每一個都只吃資料、吐資料，沒有 side effect，沒有 DB call，沒有 fetch。對應的 `__tests__/` 也一起長出來——這種「lib 和 test 同步出現」的節奏，寫起來會有一種莫名的安心感。

---

`balance.ts` 是裡面最燒腦的一個。Futari 的設計是「以當前登入者為視角」——也就是正數代表「對方欠我」，負數代表「我欠對方」。這個 viewer-flipped perspective 如果沒有在純函式層就處理乾淨，UI 要反過來翻譯的話，遲早會在某個 edge case 出錯然後讓人吵架（帳本 app 引發真實吵架，這個 bug 等級太高了）。

`settlement.ts` 負責「快速結清」的 chip 選項——就是那種「直接轉 $300 平帳」的按鈕。數學不難，但要讓 chip 的金額選項合理（不能比欠款還多、要有幾個常見面額），需要一點小心思。測試寫完之後我盯著 case 看了一下，發現我下意識列了很多「剛好整數」的情境，大概是潛意識還沒準備好面對 $237.5 這種數字。

---

OAuth redirect 也在這批順手修了一個很蠢的 bug：sign-in 頁沒有把 `next` param 帶過 OAuth flow，導致登入完之後跳回首頁而不是原本要去的頁面。修法是在 sign-in 把 `next` 塞進 session，callback 再讀出來——兩行，但如果沒修，每次 debug 都要多繞一圈，煩死人。

先把數學層寫對、寫乾淨，UI 才有資格長出來。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*

---

<!-- source: oikos | last_sha: 7f730adfdf91ec05891e876d8a637503836f9315 -->
<!-- commits:
07b4e8a4e5ff193aa9bc2c5eb4bd85868d169041 2026-05-02 fix: move dashboard page
c8d00f79723e90c8195923a9aa11ab8aacfc36e3 2026-05-02 fix: preserve next param through OAuth sign-in redirect
01a7384722200de17c018355d880a9da303a57f5 2026-05-02 fix: redirect /setup to /dashboard when user already has group
11469144b62c0b0ed54d07b8be9498fdc98be667 2026-05-02 docs: phase 1 design spec - Futari core ledger UX
3fe4d6048519ddb411033b3e8725c8bc38b5a9d4 2026-05-02 plan: phase 1a foundation - Futari core ledger vertical slice
54d48e20c35d8e247a046ea8ab68adbca0f5a1e1 2026-05-02 feat(brand): apply Futari design tokens, fonts, manifest
0de81d2aee7fc75a120a39e519da64b2cb53721d 2026-05-02 feat(lib): add 9-category module with display tokens
97037e44fbf2f9e205712cb275f92f78a0573cc7 2026-05-02 feat(lib): pure balance math with viewer-flipped perspective
7f730adfdf91ec05891e876d8a637503836f9315 2026-05-02 feat(lib): settlement quick-pick chip math
-->
