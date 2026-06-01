---
title: "Wildcard 一直頂著 Vite 的預設 favicon 出門——直到我幫它長出一張壞笑臉"
pubDate: "2026-05-25"
tags: ["wildcard", "devlog"]
draft: false
---
你有沒有過那種，一個東西做得滿認真的，但分享出去的連結預覽圖卻是別人的——那種尷尬？

Wildcard 到這個階段，牌組系統做好了，Vision API 幫你出牌也跑通了，玩家可以在「石頭、樹葉、樹枝」的野地牌桌上對決了。但你把連結丟進 Discord 的時候，跳出來的 og image 是什麼？Vite 的閃電 logo。藍底白閃，乾淨俐落，跟這個遊戲一毛錢關係也沒有啊。commit message 打錯字都比這個有面子——至少錯的是自己的字。

所以這批 commit 我做了一件純粹「臉面」的事：從零刻一套品牌資產出來。

---

核心是一個叫 **Mark** 的東西。構想很簡單：把剪刀石頭布的三元素——石頭、樹葉、樹枝——拼成一張臉。左眼是石頭，右眼是一片斜 -12° 的葉子，嘴巴是一根斜切的樹枝。

第一眼看到的，是自然三元素的拼貼——呼應遊戲本身的剝削感（你永遠不知道對手要出什麼）。
第二眼才讀出來：**這是張壞笑的臉**。

這個雙層解讀就是整個 mark 的靈魂。你得先讓眼睛「喔，三個形狀」，然後大腦才後知後覺「啊，原來是一張臉」——那個延遲，那個「欸，等等」的瞬間，才是設計真正發力的地方。

我跟自己吵這件事吵了不少時間啦。太刻意的話，雙層感會消失，變成純粹的插畫；太隱晦的話，人家只看到三個形狀，臉讀不出來。最後那個 -12° 的葉子傾角、嘴巴的斜切角度，大概各自改了四五個版本才收定。

---

技術上我刻意把 Mark 做成元件而不是一張死圖。`Mark.jsx` 吃 light/dark theme，`AppLogo.jsx` 再把 Mark 包成 lockup（橫排、直排都有），純 SVG、沿用現有那套田野日誌色票的 CSS variables。

細節層是我比較滿意的地方：石紋、青苔斑、葉脈、樹皮的雙色疊筆——這些在 32px 以上的時候看得見，但縮到 16px 變成 favicon 的時候，它們會自動退化成輪廓，輪廓依然認得出來。說「自動退化」其實是有點誤導的說法——我是在不同尺寸下各測了一輪，確認那個閾值大概在哪裡，才決定細節的複雜度。

順手也把 OG image（1200×630）跟 Apple touch icon 的 SVG source 補上，再寫了一支用 **sharp** 的 script 把 SVG 烤成 PNG 備用。

---

翻車的地方在 OG wordmark。

第一版我把 wordmark 字體設成 160px，塞進 1200px 的畫布——然後預覽圖打開來，文字被裁掉一截，看起來像被門夾到，只剩半個字。我以為是 SVG viewport 的問題，改了半天 viewBox，不是。我以為是 sharp render 的時候邊界沒算好，又查了一輪文件，不是。

最後才發現問題就是字體太大了吧——1200px 的畫布，160px 的字，左右各加 padding 之後根本放不下，就默默溢出去了。縮到 96px 立刻收好，乾乾淨淨。這種問題你說它蠢嗎——確實。但你在盯著設計稿的時候，真的很難立刻注意到「這個字比我想的大很多」，因為你的眼睛已經習慣那個比例了。

---

另一件我想記一下的事：每個元件我都先寫 test 再寫實作。`Mark.test.jsx`、`AppLogo.test.jsx` 都有。

這件事不是因為什麼工程紀律啊，純粹是——logo 也是 component，會 render 壞掉就該被測出來。萬一哪天 theme 切換的 prop 邏輯改壞了，或是 SVG path 裡有個 typo，你想知道的方式是「測試紅掉」，不是「分享連結出去然後看到一片白」。

先寫 test、確認測試紅了、再補實作讓它過——這個節奏在品牌元件上跑起來滿順的啊。

---

一個遊戲的第一印象，原來不在牌桌上，在那 16px 的小方格裡。反正先不說了，還有一堆牌組邏輯等著我回頭盯。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*

---

<!-- source: wildcard | last_sha: fe6336916e6e10cd555a309f271d13a9486a1846 -->
<!-- commits:
7986c2bd docs(spec): consolidate fieldbook design system into single spec, remove HTML mockups
c81d40ca fix(deck): reset busy state when switching cards in CardEditSheet
ef48ec63 docs: remove implementation plans directory
9616d54e docs: add brand assets design spec (favicon/og-image/app logo)
2a006464 docs: add implementation plan for brand assets
616b58a1 feat(brand): replace favicon with trio smirk mark
21ac4cbf feat(brand): add Mark component with light/dark themes
fe633691 feat(brand): add AppLogo lockup component (horizontal/stacked, light/dark)
-->

