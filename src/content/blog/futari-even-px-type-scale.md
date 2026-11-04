---
title: "我把 11、13、15 這三種字級刪掉，當天晚上自己又用了回去"
pubDate: "2026-11-04"
tags: ["futari", "devlog", "design"]
draft: false
---
Futari 是給兩個人一起記生活帳的家計簿，有 iPhone App 也有網頁版。畫面上字很多，金額、日期、分類、誰付的，每一行都有大小之分，所以我有一張字級表，替每一種大小取個名字，寫畫面的時候只叫名字，不直接寫幾個像素。

5 月 6 日晚上，這張表多了三個名字，分別是 11、13、15 像素。問題是旁邊早就有 12、14、16 了，兩兩只差 1 像素，肉眼幾乎分不出來。每次寫一個新畫面，我和幫我寫程式的 agent 都得先猶豫一下：這裡用 11 還是 12？

這樣過了將近四個禮拜。5 月 31 日下午，我請 agent 整理畫面上散落的樣式，三點多整理到記帳和設定週期支出那幾張面板，發現同樣是欄位標題，有的用 11，有的用 12，大小差一點點，放在一起看就是不齊。

三點半，三個奇數全刪。11 併到 12，13 併到 14，15 併到 16，字級表上那三個名字直接拿掉。改起來是 95 個檔案，光是 11 改成 12 就有一百多處。圖表軸上那種直接寫死的 9、11、13 也一起抓出來，往上取最近的偶數。

刪到一半，有兩個地方決定不動。一個是切換開關裡那圈 3 像素的內距，裡面的小圓鈕要剛好對齊，改成 4 就歪了；一個是小標籤上下各 1 像素的留白。這兩個奇數有它的用處，跟那三個只差 1 像素的名字不一樣。

三點三十三分，我把規矩寫進專案的設計文件，也寫進 agent 每次開工都會先讀的那份說明：字級一律偶數；畫面上要用的大小，先從表上既有的名字裡找；表上沒有的，不准自己發明，先停下來問我。三點五十一分，整批合進主線，檢查和打包都過了。

那天晚上九點十九分，我自己改了加油紀錄那兩個畫面的顏色，把寫死的色碼換成表上的名字。改顏色的同時，有四處字級被改成了 11 和 13 的舊名字，也就是下午才刪掉的那兩個。

沒有任何東西跳出來。程式照樣打包成功，畫面照樣打得開。一個不存在的名字，不會讓程式出錯，那幾行字就是拿不到任何大小，只好沿用外面那一層的字級，結果比設計的還大。這筆修改跟著當晚的 1.4.3 版一起出去，誰都沒發現。

一直到 9 月 21 日，agent 在整理愛物頁的樣式時，才翻出這四處用的是早就刪掉的名字。修正說明寫得很直白：這兩個名字被移除之後不產生任何樣式，元素靜默繼承父層字級，所以油耗說明比設計大。從 5 月 31 日晚上到 9 月 21 日，加油紀錄上的油耗、km/L 和里程那幾行，大了將近四個月。

下午才寫下「表上沒有的不准用」，那份說明 agent 每次開工都會讀。晚上我自己動手改，沒有先打開它，用的是手指記得的舊名字。規矩寫得很清楚，讀它的只有 agent，我自己反而沒讀。

刪掉的名字被寫回去，程式自己不會說，要等有人整理到那一區才看得到。這次等了將近四個月。

Futari 在[作品集](https://southern-light.dev/works/)裡，網頁和 iPhone 都能試，程式碼放在 [GitHub](https://github.com/redtear1115/oikos)。

先不說了，我得去加油紀錄看看，油耗那一行現在是不是終於跟旁邊的字一樣大了。

*這段 code 寫於 2026 年 5 月 31 日，文章整理於 2026 年 10 月。*

<!-- source: oikos | last_sha: 30f5f83 -->
<!-- commits（台北時間）:
66e0425 2026-05-06 21:32 feat(tokens): add --fs-* typography scale to globals.css (P3-1)（text-micro 11／text-label 13／text-body 15 首次出現）
68dd201 2026-05-31 14:58 refactor: unify design tokens — Switch, RecurringRuleSheet, ContextStrip
69621cf 2026-05-31 15:08 refactor: unify field-label tracking to 0.6px + border-hairline token（RecurringRuleSheet text-micro → text-xs，「matches AddSheet / IncomeSheet」）
8f0da09 2026-05-31 15:30 refactor: collapse type scale to even-px, drop 11/13/15 tiers（text-micro → text-xs 97 dashboard + ~10 marketing、text-label → text-sm 39、text-body → text-base 23；inline 9→10、11→12、13→14、15→16；保留 p-[3px] ×4、py-[1px] ×3；「95 files … tsc + production build pass」）
203159f 2026-05-31 15:33 docs: codify even-px + existing-token-first + no-inline rules（DESIGN.md + CLAUDE.md：「不得自行新增字級…先停下來問使用者」）
f286f77 2026-05-31 15:51 Merge PR: refactor/frontend-design-tokens
7c611f0 2026-05-31 21:19 fix(tokens): replace hardcoded hex with design tokens in FuelRow + NewFuelLog（作者 Ray，無 Co-Authored-By；FuelRow 1 處、NewFuelLog 3 處改用已刪除的 text-micro／text-label）
22a3b61 2026-05-31 21:47 chore: release v1.4.3（7c611f0 在內；91c0357 22:12 merge）
30f5f83 2026-09-21 10:37 fix(aibutsu): 油耗文字換掉已移除的 text-micro／text-label（「這兩個 class 在 #876 從字級表移除後不產生任何 CSS，元素靜默繼承父層字級，所以油耗說明比設計大」；Co-Authored-By: Claude Opus 5）
-->
<!-- 改寫補充：原稿「這種東西我養了好幾個月」不符：奇數字級 5/6 才加，到 5/31 不到四週。原稿結尾「得去把 FuelRow 裡那兩個 #fff 換成 token」不符：當晚 21:19 換的是 #E8E4D8、#8A7B5A、#3A2419 等色碼，而且正是這筆把刪掉的字級名字寫了回去，改用這件事當故事。「11 改成 12 有一百多處」＝97 + 約 10。 -->

