---
title: "我的 type scale 裡塞了 11、13、15 三個奇數——直到我受不了把它們全砍了"
pubDate: "2026-06-10"
tags: ["futari", "devlog"]
draft: false
---
你有沒有過那種，打開自己的 `globals.css`，看到 `text-micro` (11px)、`text-xs` (12px) 並排躺在那，然後突然一陣反胃的經驗？兩個 token，差 1px，幹一模一樣的事——這種東西我居然養了好幾個月。

Futari 的字級表本來有三個奇數層卡在偶數鄰居中間：`text-micro` (11) 貼著 `text-xs` (12)、`text-label` (13) 貼著 `text-sm` (14)、`text-body` (15) 貼著 `text-base` (16)。每一個都是我隨手敲出來的 custom token，跟 Tailwind 原生的偶數層只差 1px——差到肉眼幾乎分不出來，但每次寫元件我都要先猶豫「這裡到底要用哪個」。

5/31 那天我終於手癢，把奇數層整坨往偶數鄰居合併、token 直接刪掉。聽起來很爽，做起來是 **95 個檔案**。`text-micro → text-xs` 改了 97 處 dashboard 加大概 10 處 marketing route，`text-label`、`text-body` 各自一串。連 chart 軸標籤那種寫死的 `fontSize: 9 / 11 / 13` 也順手抓出來,全部 round 到最近的偶數。

真正的教訓不在「砍 token」這個動作，而在**為什麼當初會長出來**——因為我每次缺一個尺寸就 inline 一個新數字，從來沒回頭問「現有 token 裡有沒有夠近的」。所以這次我把規矩寫死進 `DESIGN.md`：The Even-Px Rule（字級一律偶數）、The Existing-Token-First Rule（token 蓋得到的值不准 inline，要發明新 token 先問）。規範不寫下來，下個月的我一定又手癢。

當然啦，刪到一半我才發現有兩個地方是故意留奇數的——`p-[3px]` 的 segment track inset 跟 thumb 對齊綁死了，動了會歪。所以教訓還有一條：**全域 replace 之前，先想清楚哪些「不一致」其實是功能性常數**，不是每個奇數都是罪。

先不說了，我得去把那兩個 `#fff` 也換成 token 了——對，FuelRow 裡那兩個，我假裝沒看到很久了啦。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 6 月。*
