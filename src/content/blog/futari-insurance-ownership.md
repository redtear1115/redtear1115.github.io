---
title: "我家的車險，曾經可以掛在你家的休旅車上"
pubDate: "2026-05-23"
tags: ["futari", "security", "retrospective"]
draft: false
---
Futari 是給兩個人一起過日子用的家計簿。帳之外，它也記家裡一起照顧的「愛物」：房子、車、孩子、寵物、植物，還有每年都要續的保單。一份車險掛在哪台車上，兩個人都看得到，續約的日子也不會只有一個人記得。

有一天我發現，這份車險可以掛在任何一台車上，連別人家的車也可以。

新增保險的時候，畫面會讓你從自己家的車裡挑一台。可是系統在背後存的時候，只看你送來的是哪一台車的編號，不會確認那台車是不是你家的。一台不存在的車、一台已經刪掉的車，甚至別的家庭帳本裡的車，它都照單全收，資料庫也不會抱怨。

我自己用了很久都沒遇過，因為我只會選自己家的車。從畫面上點，永遠點不到別人家。這種問題就是這樣，你一直站在它看不見的那一邊。直到有一天我換個方向想：如果有人送來的編號不是從畫面上點出來的呢？

答案是：什麼事都不會發生。資料會靜靜地躺在那裡。我家的車險，關聯著一台根本不屬於我們的休旅車。

修法的觀念很簡單：存之前，先確認這台車是你們家的。它要真的存在、真的是一台車、沒被刪掉，而且屬於現在這本帳。四個條件都對了才寫進去，少一個就直接擋下來。

我在意的不是那筆資料髒不髒。Futari 跟兩個人說，這本帳只屬於你們。如果一份保單可以悄悄連到別人家的東西上，這句話就不是真的了，只是剛好還沒有人試過。

先不說了，我得去看其他掛在愛物上的東西，還有哪一樣沒問過「這是你們家的嗎」。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 10 月。*

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

