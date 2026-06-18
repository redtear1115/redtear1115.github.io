---
title: "VanishWhisper 的聊天頁被打 30/40，我硬著頭皮拉到 39"
pubDate: "2026-05-30"
tags: ["vanishwhisper", "devlog", "a11y", "design-system"]
draft: false
---
你有沒有那種，自己用了一百次都覺得 OK、結果被工具一掃才知道對色盲使用者根本是空白的經驗？我這禮拜在 VanishWhisper 上踩到一個——只是這次「工具」是我自己跑的 `/impeccable` critique，它直接打了我聊天頁 **30/40，三個 P1**。滿慘的。

第一輪 critique 點出的傷其實很基本：`--vw-text3` (#6B4D8A) 在 bg 上 2.85:1、在 surface2 上 2.53:1，整個 WCAG AA 都過不了——但這個顏色被我用在所有 placeholder、timestamp、eyebrow label。等於是「整個 hint 系統都暗到看不見」啊。

修法蠻直球的：hue 守在 264°（同一族紫），亮度拉到 #9676BB，就過了 5.23:1 / 4.64:1。順便把散在檔案各處的魔術 z-index 收進 6-slot scale（`--vw-z-dropdown` / `sticky` / `modal-backdrop` / `modal` / `toast` / `tooltip`），未來新的 popover 直接挑 slot，不用再翻舊 code 找最大值。

接著是 hit area。`.vw-btn-send` 那種圓形小按鈕視覺只有 36px，但 PRODUCT.md 承諾的是 44×44。視覺不想改，怎麼辦？用 `::before` 撒一個透明的 pseudo 出去，負 inset 把可點區拉到 44——chrome 沒動、手指有救。這個 pattern 後來掃了 7 個按鈕，連 `100vh` 都換成 `100dvh`，跟著 iOS 的 URL bar 縮放。

最有戲的是聊天頁本身。`vanish` 行為是這個 app 的核心，但第一次開聊天的人**根本不知道訊息會消失**——動畫教得很美，但訊息已經沒了。所以多了一個 first-time tooltip，先講「會消失喔」再讓他發。錯誤處理也整個重寫：新 `errorMessage.ts` 用 Firebase code 當 key 翻 SDK 錯誤，回傳 `{ message, retryable }`，error banner 配 `role="alert"` + 一顆 Retry 按鈕，closure 抓住原本 payload，使用者在錯誤窗口裡繼續打字也不會打到自己。圖片不再自動送出（手滑送錯私訊真的會死人），先 preview，記得 `URL.revokeObjectURL` 配對 cleanup。

第二輪 critique 跑下去——**39/40，0 個 P1**。爽。

先不說了啦，我得去開 `/impeccable critique` 掃下一個頁面了，希望這次不要又是 30 開頭。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*


---

<!-- source: redtear1115/vanishwhisper | last_sha: a55dff359120103a1b9a11768cc2a54741a7a616 -->
<!-- commits:
  - d6b4f92cba 2026-05-29T13:31:53Z set up impeccable design context — PRODUCT.md / DESIGN.md / live config
  - 0dd2d79aeb 2026-05-29T13:32:07Z design tokens — lift --vw-text3 to AA, add z-layer scale, 44px hit areas on primaries
  - bbc354554b 2026-05-29T13:32:23Z touch / viewport / voice sweep across home, profile, secondary, session row
  - a9793fc5ac 2026-05-29T13:32:47Z chat surface design pass — vanish onboarding / error retry / image preview / a11y semantic
  - a55dff3591 2026-05-29T13:33:01Z archive impeccable critique snapshots — chat surface 30 → 39
-->
