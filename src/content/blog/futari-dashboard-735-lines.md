---
title: "Futari 的 Dashboard.tsx 長到 735 行，那天我終於受不了"
pubDate: "2026-05-29"
tags: ["futari", "devlog", "release"]
draft: false
---
你有沒有過那種，打開一個檔案、滾輪滾到一半就決定「先把它關掉、明天再說」的感覺？

5/20 那天我打開 Futari 的 `Dashboard.tsx`——它已經長到 **735 行**。filter row、member toggle、transaction feed、skeleton——全部塞在同一個檔案裡，像一鍋燉到分不出料的咖哩。我每次只想改其中一塊，但每次都得先滑五百行才找得到位置。

那天的 release 是 v1.1.3，我本來只想 ship 一個小修——把 BottomNav 從 56px 加高到 64px，因為我自己在 Android 上點誤觸了三次。但手癢就是手癢，順手就把整個 Dashboard 拆了。

## 拆檔案的時候我才看到債

把那 735 行切成三個 sibling 檔案——`DashboardFeed.tsx`、`DashboardFilterRow.tsx`、`MemberDualToggle.tsx`——的過程，本來只是純結構搬家。但搬到一半我發現：很多 component 裡散著 `text-[13.5px]`、`text-[14.5px]` 這種奇怪的小數字。

這就是那種「上次趕 deadline 隨手敲的、結果沒人記得收回去」的債。設計系統明明已經有 `text-meta` (14px)、`text-body` (15px)，但這幾個元件全都繞過 token 直接寫死。

於是同一個 commit 之外又多了一條線——`refactor: replace decimal font sizes with text scale tokens`。13.5 → text-meta，14.5 → text-body。八個檔案掃過去，順便把 `MonthlyStatsBars` 裡寫死的 chart palette 抽到 `lib/chartPalette.ts`——下次如果我要在別處重用同一組顏色，至少不用再 copy paste。

## 順便補上 loading overlay

拆完之後 tab switch 還是會閃一下白底——因為我沒寫 `loading.tsx`。Next.js 的 App Router 有這個機制：在路由旁邊放一個 `loading.tsx`，切換時就會走那個 Suspense fallback，不會留一片空白。

assets / dashboard / settings 三條路徑下各補一個 loading overlay，加上原本就有的 records——四個 tab 全部覆蓋。從使用者視角看，就是「點下去之後馬上有東西亮起來」，不會懷疑自己是不是按錯了。

## 教訓：refactor 不是一次做完，是看到債就還一點

這一波 v1.1.3 → v1.1.5 拆完之後，我學到一件事：與其等到某天「決定花一整天清債」，不如每次碰到那個檔案時就還一點。

拆 Dashboard 的時候順手收 font size、收 palette、補 loading——這些都不是當天的目標，但都是當天才看得到的問題。Code review 自己的 PR 時最容易看到這些，因為你會被迫從外面看一次 diff。

先不說了，我得去看下一個 735 行的檔案在哪裡——希望沒有。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*


---

<!-- source: oikos | last_sha: 058aece1eeacf5d44cefb6607f12308785fc30f8 -->
<!-- commits:
- d7db6a84 2026-05-20T05:39:16Z chore: release v1.1.3
- f8c98adb 2026-05-20T11:43:42Z fix: increase BottomNav height to 64px for better touch target (#689)
- 99cc5469 2026-05-20T11:49:28Z feat: add loading overlay on tab switch (#690)
- 6c2de836 2026-05-20T14:55:08Z refactor: move MonthlyStatsBars palette to lib/chartPalette.ts (#693)
- 5a8d65d3 2026-05-20T14:56:02Z refactor: replace decimal font sizes with text scale tokens (#694)
- 058aece1 2026-05-20T14:57:41Z refactor: split Dashboard.tsx into sub-components (#696)
-->
