---
title: "把 1205 行的 ChatSessionView 拆成人類看得懂的形狀"
pubDate: "2026-05-13"
tags: ["vanishwhisper", "refactoring", "design-system", "accessibility", "devlog"]
draft: false
---
VanishWhisper 的 ChatSessionView 不知不覺長到 1205 行——我那種「之後一定會重構」的之後，永遠是還沒到。每次想加一個小功能都要先深呼吸三次，怕碰錯一行就連帶吹掉貼圖面板、燈箱、刪除確認 banner 三個東西。

---

這次終於動刀，做了四個平行的 extraction。`<DeleteBanner>` 把雙向刪除確認的 UI 抽出來——一個 component、一個 state prop、三個 events（cancel / agree / reject），parent 接回原本的 Firestore handler 就好。`<StickerPicker>` 只抽浮動的貼圖面板，trigger button 留在 input bar 視覺位置原處；open state 也留在 view，讓現有的 `useDocumentDismiss` 繼續統一管理所有 transient popover（貼圖、reaction、header menu）的關閉時機——一個 dismissal handler 管全部，比每個 popover 各自重寫一份省事太多。

兩個 composable 也順便拆出去：`useImageLightbox()` 接管全螢幕 overlay 的開關、body scroll lock、Esc 關閉，自己掛 keydown listener 並在 unmount 清掉；`useChatScroll()` 收編 `stickToBottom`、`isNearBottom`、auto-scroll watch 三件套，順便 expose `forceStick()` 取代原本散在三處手動改 boolean 的爛 code。

---

順手做了 design polish 的小掃。最值得提的是 `prefers-reduced-motion` 直接寫在 theme.css 全域 kill 掉 animation，但 transition 故意留著——hover 的微互動是觸覺回饋，不是 motion，不會觸發前庭反應（這個界線分得很細，但 a11y 該分就要分）。另外幫聊天頁加了個由下往上的紫色 radial 配 6% 冷色底，鏡像 body 的「moonlight」變成「candlelight from where you're typing」——進入對話像走進更私密的室內空間，不需要任何視覺花招。

ChatSessionView 從 1205 行縮到 1037 行，砍掉 168 行（-14%），行為一行都沒變。下次再讓它長到一千兩百行之前，請有人提醒我。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*

---

<!-- source: vanishwhisper | last_sha: 41d781b526f7a6841ff0be752f32e1549184d9df -->
<!-- commits:
- 223abd4e9534a1eab78630da0bbeda7f40cd45cf (2026-05-01) extract delete-banner / sticker-picker / scroll / lightbox out of ChatSessionView
- 41d781b526f7a6841ff0be752f32e1549184d9df (2026-05-01) design polish — reduced-motion / hero card / chat atmosphere / empty state
-->
