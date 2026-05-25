---
title: "把 /battle 從「能跑」升級成「會挑兵」——順便給 Wildcard 寫了一本野外手冊"
pubDate: "2026-05-18"
tags: ["wildcard", "devlog"]
draft: false
---
之前 Wildcard 的 /battle 流程，老實說是個直線：點開、拍照、出牌、結算。沒有「我手上有什麼牌」這件事——每場對戰都從零開始，像每天早上忘記昨晚自己存了什麼進冰箱（然後又買一次牛奶）。這次把 deck 接進來，順便發現一堆藏在 IndexedDB 角落裡的孤兒。

---

第一刀是把 `/deck` 路由接上首頁入口，再把 `/battle` 整個翻過來——改成 **5-slot lineup picker**，從你的 deck 裡挑五張上場。這聽起來像 UI 改動，但其實牽動了整條資料流：deck 裡的卡片是用 hash 去重的（同一顆石頭不能拍兩次騙人），所以挑兵時得從 Firestore 拉、跟本地 IndexedDB 的縮圖對齊。順手把那個 collectionGroup 的 single-field index 砍掉——Firestore 對單欄查詢會自動建 index，多寫一份只是付兩份錢。

接著踩到兩個有點丟臉的 bug。一個是 Battle 頁面塞了一個 hidden `<input type="file" capture>` 來呼相機，用完忘了清，DOM 裡躺著一堆殭屍 input（每次離開頁面又留一個——像 macOS 的 .DS_Store）。另一個更慘：使用者刪卡的時候，Firestore doc 砍了，但 IndexedDB 裡的圖還在，越用越肥。修法是 app 啟動時做一次 **reconcile**——拉一遍 deck，把 IndexedDB 裡沒對應 doc 的影像條目掃掉，順便容忍 hash collision 時給一句「這顆石頭已經有人收了，要不要從相簿選一張？」的友善提示。

---

最有趣的決策反而是設計面：開始寫一套叫 **fieldbook** 的設計系統——把整個 app 想像成一本野地觀察手冊，配色、字型、動畫都從那邊長出來。先落地 design tokens（fonts / palette / animations）跟五頁的 mockups，原本想做完整 plan 文件，後來覺得 mockups 自己就是 plan（誰會回去讀 markdown）。

---

下次打開 Wildcard，挑五顆石頭再出門。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*

---

<!-- source: wildcard | last_sha: 640cf58fe0 -->
<!-- commits:
- 6ef63d4fcb feat: wire /deck route and Home entry
- 6d08db181a feat: rebuild /battle as 5-slot lineup picker with deck integration
- f9e3c996b8 fix: cleanup transient camera input element in Battle
- 5813be3ca8 feat: reconcile orphan IndexedDB images on app start
- 894954e2de fix: surface friendly hash-taken message; allow gallery selection
- 28a0971547 fix: remove redundant single-field index for items collectionGroup
- be24b88db7 docs(mockups): fieldbook design system mockups for all 5 pages
- 931ab2c166 docs(plan): fieldbook design system implementation plan
- 640cf58fe0 feat(design): add fieldbook design tokens (fonts, palette, animations)
-->

