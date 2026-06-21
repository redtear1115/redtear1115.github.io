---
title: "我的聊天頁被自動評分打了 30/40——VanishWhisper 那天被一個 AI 評審刮了一頓"
pubDate: "2026-05-31"
tags: ["vanishwhisper", "devlog"]
draft: false
---
你有沒有過那種經驗——你自己用 app 用了一百次都沒事，因為你剛好站在它隱形的那一側？

5/29 那天我把 `/impeccable` 這個自動評審綁進 VanishWhisper，第一個被掃的就是 ChatSessionView。分數出來：**30/40，3 個 P1**。第一次喝錯邊的咖啡，差點噴出來。

評審指出的三個 P1 都很尷尬：

1. **新手不知道訊息會消失**——動畫教得了你，但只能教 message #2 之後，message #1 已經來不及了。
2. **錯誤訊息只有英文 Firestore code**——`permission-denied` 跳出來，沒人知道那是什麼意思，也沒 retry。
3. **圖片貼錯就送出去了**——直接從相簿選完就 fire，沒有預覽、沒有反悔。對一個「私訊+消失」的 app 來說，貼錯圖的情緒成本超高。

那天我整批做進來：先補 `PRODUCT.md` 跟 `DESIGN.md` 把產品基調寫清楚（不寫清楚，AI 評審只能從 CSS 變數猜你想幹嘛）。順手調 `--vw-text3`——原本對 bg 只有 2.85:1，WCAG AA 都過不了，所有 placeholder、timestamp 都在違約，拉到 `#9676BB` 變 5.23:1。

`.vw-btn-send` 那顆圓鈕視覺很小，但 tap target 該 44×44。我沒動視覺，塞了一個 `::before` 透明 pseudo 把 hit area 撐到 44——這個 pattern 寫進 DESIGN.md 整個 codebase 共用。

最有戲的是 error。新寫了 `errorMessage.ts`，把 Firestore code 翻成人話，回傳 `{ message, retryable }`——`permission-denied` 不可 retry。Retry button 用 closure 捕原 payload，按下去重發的是原本那則，不是手滑打到一半的草稿。順手補 draft persistence：每個 keystroke 寫 localStorage，送出成功才清掉。

圖片預覽我糾結滿久。多一步會慢，但讀完就消失的私訊 app，貼錯圖的情緒成本比兩秒摩擦高太多。File picker 改成挑完先預覽、Send / Cancel 在拇指區，搭 `URL.revokeObjectURL()` 收乾淨 blob。

跑第二輪 critique：**39/40，0 P1**。

教訓是——AI 評審不是來打你分數的，是來提醒你「你自己已經適應了的爛 UX，新使用者第一次碰會痛」。我用了一百次都沒事，因為我每次都是 A。

先不說了啦，我得去把這個 pattern 也搬去 Futari 看看。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*


---

<!-- source: vanishwhisper | last_sha: a55dff359120103a1b9a11768cc2a54741a7a616 -->
<!-- commits:
- d6b4f92cbada311352fcf1fbb492f5fdcbe2bdc8 2026-05-29 set up impeccable design context — PRODUCT.md / DESIGN.md / live config
- 0dd2d79aeb8b3c05ca8f275d16cd4743531a65bc 2026-05-29 design tokens — lift --vw-text3 to AA, add z-layer scale, 44px hit areas on primaries
- bbc354554b3b3b88d7889b2ec50dbf7d0103a386 2026-05-29 touch / viewport / voice sweep across home, profile, secondary, session row
- a9793fc5ac26be3f49ecdbf30053fdc0d3afeeed 2026-05-29 chat surface design pass — vanish onboarding / error retry / image preview / a11y semantics
- a55dff359120103a1b9a11768cc2a54741a7a616 2026-05-29 archive impeccable critique snapshots — chat surface 30 → 39
-->
