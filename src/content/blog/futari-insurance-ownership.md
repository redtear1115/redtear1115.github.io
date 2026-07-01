---
title: "保單可以掛在別人家的車上——直到我把那個洞補起來"
pubDate: "2026-05-23"
tags: ["futari", "security", "devlog"]
draft: false
---
你有沒有寫過那種 bug——你自己用一百次都正常，因為你剛好站在它隱形的那一側？

Futari 的保險 server action 原本是這樣運作的：你傳一個 `vehicleId` 進來，它就乖乖寫進 `InsuranceDetails`。傳什麼？它不問。傳一台不存在的車、一台已經被軟刪除的車、甚至隔壁家庭群組的車——它一律照單全收。換句話說，我家的車險可以理直氣壯地關聯到你家的休旅車（而且資料庫毫無怨言）。

我自己用的時候完全不會碰到這個問題啊，因為我只傳自己家的車進去。這種 bug 就是要等到你開始想「如果有個人傳錯 id 會怎樣」的時候才會冒出來——然後你就會發現「會怎樣」的答案是「什麼事都不會發生，資料靜靜躺在那邊」。

---

這次的修法其實只有一個概念：**寫之前先確認這台車是你的**。

我在 `createInsurance` 跟 `editInsurance` 兩條路徑上，都加了同一段守門邏輯——拿 `vehicleId` 去查 assets，條件是 `id 相符` 而且 `groupId === 當前 group`。查回來還要再過三關：要存在、`type` 必須是 `car`、`deletedAt` 必須是空。任何一關沒過，直接 `throw '無效的關聯車輛'`，連 transaction 都不讓它進去。

三關都通才算你的車。這個邏輯我覺得滿合理的——不是信任 id 本身，而是信任「這個 group 擁有這個 id」這件事。

順手我也把 `vehicleId` 收進 **validator** 裡。以前 server action 寫的是 `input.vehicleId ?? null`——直接吃使用者的原始輸入，我也不知道當初我在想什麼啦。現在改成 `validated.vehicleId`，validator 會先 trim、空字串轉 null，再交給 db。原則很單純：**沒被 validate 過的東西，不准碰 db**。

---

有趣的是同一批 commit 裡，我還在做完全相反的事——降低門檻。

Futari 新增了愛物（aibutsu）詳情頁的引導卡 `AibutsuHintCard`，寵物、小孩、植物、房子各一套配色跟提示文案（「飼料 · 看診 · 洗澡美容」之類），底下一顆「記第一筆 →」的按鈕。給第一次開頁面的使用者一個方向感，不用對著空白發呆。

我甚至先寫了會 fail 的 test 才動手刻 component——TDD，對吧，很正，很有原則。然後第一版 component 寫完，測試也過了，我很開心，按鈕的 `onClick` 完全罷工。

找了一下才發現：我忘了加 `'use client'`。

這件事說起來滿慘的。Next.js 不會提醒你「欸你在 server component 裡放了事件處理器喔」，它只是讓按鈕看起來好好的、然後完全不動。我甚至測試都過了——因為我的測試是 unit test，根本不在乎 server / client 的邊界，它只在乎 component render 出來的 DOM 長什麼樣子。

加一行 `'use client'`，按鈕活了。TDD 很美，但 Next.js 的 server component 邊界是另一層你要自己記住的東西，沒有工具會替你擔心這件事啊。

---

一邊把陌生人的車擋在門外，一邊牽著新使用者的手記第一筆——大概這就是寫家庭記帳 app 的日常吧。先不說了，我得去想下一個洞在哪裡了。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*

---

<!-- source: oikos | last_sha: 7bf72ea5f6025719afeaa32b808f9a6fc3b6d99b -->
<!-- commits:
b0f2f2f fix(insurance): validate vehicleId is group-owned car before writing
9939acd test(aibutsu): add failing tests for AibutsuHintCard
2b8bf46 test(aibutsu): add failing tests for AibutsuHintCard
5609957 fix(tests): remove phantom AibutsuHintCard test (component does not exist)
291f5aa test(aibutsu): add explicit vitest imports to AibutsuHintCard test
b4bfafd feat(aibutsu): add AibutsuHintCard component with per-type config
6569849 fix(aibutsu): add 'use client' to AibutsuHintCard
07d716e feat(aibutsu): wire onboarding hint into PetDetailClient
567e593 feat(aibutsu): wire onboarding hint into ChildDetailClient
7bf72ea feat(aibutsu): wire onboarding hint into PlantDetailClient
-->

