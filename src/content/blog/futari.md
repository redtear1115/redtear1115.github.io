---
title: "保險忘了帶編輯筆、車色其實是字串騙局——Futari 那一輪小修小補"
pubDate: "2026-05-19"
tags: ["devlog", "futari", "release"]
draft: false
---
說來尷尬——我自己在 Futari 上新增了一張保險，填完才發現「咦怎麼沒有編輯按鈕」。翻 code 才想起來，當初 scaffold 保險 detail page 時，TYPE_OPTIONS 還沒把它 expose 出來，所以連 edit pencil 都沒接上。後來 Phase 1 解鎖保險新增，這顆釘子就尷尬地浮出水面——能建立、不能修改，活像一隻沒帶後悔藥的寵物。

修法很無聊，照 `HouseDetailClient` 抄一遍：吃進 `assetSheetInitial`、加個 `editOpen` state、`onEditClick` 接到 header、底部 render 一個 `<AssetSheet>` modal。但這提醒我一件事——當 detail page 是 type 一個個長出來時，「forgot to wire X」是預設的 bug 形狀，不是例外。

---

順著這條線又補兩件事：長表單滾到底找不到儲存按鈕（保險 ~14 欄，捲回上面實在很煩），於是 form 底部塞了一顆 primary accent 大按鈕——新增模式「新增愛物」、編輯模式「儲存變更」。再來，detail title 字體不統一——使用者直接說「車子的名字元件比較好看」，因為 gas car 用 serif、其他類型卻是 sans，於是全部收斂到 serif。

最有趣的踩坑是車色。原本 DB 存 `'black'`、`'dark_gray'`、`'champagne'` 這種 key，然後**直接拿去當 CSS color value 用**。問題是 `'black'` 剛好是合法的 CSS named color，跑起來會動；`'dark_gray'` 不是，瀏覽器 silently fall back 成預設色——一個 bug 偽裝成 feature 在線上跑了好一陣子。修的時候把 schema 改成存 hex（也方便未來換色盤），加了個 `resolveCarColor()` 防禦性 helper 處理 null / legacy key / 已經是 hex 三種狀態，再寫一支 idempotent migration 把舊資料一次帶過去。Hero card 也從左側 5px 細條換成「環繞」邊框，把車整個框起來。

收尾順手刷一波 spec 文件狀態——文件如果不維護，三天後就連自己都騙到。

---

本來只想修保險那顆編輯筆，結果一路修到 DB schema。side project 的副作用就是這樣——拉一條線出來，後面跟著一整把毛線球。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*

---

<!-- source: oikos | last_sha: 6ba574138a7ea1081f7bcd219cf8b8ca590936d1 -->
<!-- commits:
  - c0f8583d: docs(aibutsu): note 愛物 onboarding tip as Phase 2.5 candidate
  - 458d70dd: fix(insurance): add edit pencil to InsuranceDetailClient
  - c941f1e4: ui(assets): bottom save button + unify detail-page name across types
  - e0aa2842: ui(assets): align AibutsuHeader subtitle structure with AssetHero
  - 44fdedb1: ui(car): wrapping color border on AssetHero + store color as hex
  - 8d8bcd97: docs(specs): refresh status after Slice 4 / Slice 5 backend ship
  - a36b3dc0: feat(income): IncomeSheet UI component — slide-up sheet, mint palette, category chips, policy picker, numpad
  - 9be5dd26: fix(income): unify IncomeSheet header — 儲存 always right slot, delete moves to scrollable area
  - 6ba57413: refactor(income): align IncomeSheet code quality with AddSheet patterns
-->
