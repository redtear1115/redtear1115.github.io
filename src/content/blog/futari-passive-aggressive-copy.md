---
title: "原來我的 app 一直在對單身使用者說「等你們一起」"
pubDate: "2026-05-25"
tags: ["futari", "devlog", "ux", "a11y"]
draft: false
---
說來有點丟臉——Futari 是給兩個人一起記帳的 app，但如果你還沒邀請到伴侶，打開首頁映入眼簾的是一條 banner，上面寫著「等你們一起」。

每次開 app，你的自家產品就在那邊提醒你：「你現在只有一個人喔。」

這不是貼心啦，這叫 passive-aggressive。所以這批 commit 第一件事，就是把全站的「等待語氣」整批換掉——zh-TW、zh-CN 兩個 locale 一起改，語氣從「等你們」改成主動邀請。順手連 `保險管理` 也改成更像人話的 `保險方案`。技術難度零，但承認「自己的 app 一直在情緒勒索單身使用者」這件事，還真的有點痛。

---

## a11y 補課

改完文案，接著是一輪積欠已久的 accessibility 補課。

先說 BottomNav。之前四個 tab 對 screen reader 來說，根本是四顆一模一樣的按鈕，它完全不知道你現在在哪一頁——你現在點的是「首頁」還是「帳戶」？不曉得啦。這次補上 `aria-current="page"` 跟各自的 `aria-label`，再把整排 nav 包進一個有具名 label 的 `<nav>` landmark 裡。現在 VoiceOver 總算能報出「你在哪、你能去哪」了吧。

再來是 CategoryPicker。記帳的分類選擇器，你點了「餐飲」之後，它應該要讓使用者知道「這顆是按下去的狀態」啊。之前完全沒有，這次補上 `aria-pressed`，讓鍵盤使用者也能感知選中狀態。

---

## FAB 通靈事件終於落幕

iPhone Pro Max 底部有一條 home gesture 的橫線，要讓 FAB 不要被它蓋住，你得留點 offset。

我之前的解法是寫死 `34px`。

在某些機型上有效。在 dynamic island 機種上就沒事，在其他幾款上卻還是會被推進手勢區。我試過改成 `40px`、改成 `36px`，每次都像在通靈。這次換成正確作法：`env(safe-area-inset-bottom)`，讓瀏覽器自己算底部安全區要留多少，我再也不用猜各家機型的邊界了吧。

---

## 兩個順手做的小事

**Error page 加上 digest。** 之前使用者回報「畫面白掉了」，我大概只能說「嗯嗯你截圖給我看」，然後大海撈針。現在 error page 會直接顯示 `error.digest`，使用者貼那串 ref 過來，我就能直接對到 server log，省了大半的來回。

**六個 sheet 改成 lazy import。** App 裡有幾個 bottom sheet，之前用 eager import，代表使用者進首頁時就把那些 JS bytes 一起塞進來了——但那些 sheet 預設都是關著的啊。換成 `dynamic(() => import(...), { ssr: false })` 之後，只有真的要開的時候才載入，首屏少掉一塊沒人在用的重量。

---

## 小結

這批 commit 本質上是一場「把自己半年前欠下的小債一次清掉」的大掃除。技術含量不高，但我修得挺爽的。

最有感的反而還是那句文案——技術 bug 修起來就是修起來了，但承認 app 一直在對單身使用者說「等你們一起」，才是真的有點痛。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*

---

<!-- source: oikos | last_sha: deaa19fc89ff211bdc7c17e831eb19cb30641708 -->
<!-- commits:
19e7db17cb343cf97ae49a3760bcf1f732f7629e feat(seo): add HowTo JSON-LD to /migrate/* pages
bda9ba7de699a9678036f98652def7e615925f64 chore(ux): round 1 audit fixes — copy, ARIA, safe-area, error digest
deaa19fc89ff211bdc7c17e831eb19cb30641708 refactor: audit #670 perf — lazy-load remaining sheets
-->

