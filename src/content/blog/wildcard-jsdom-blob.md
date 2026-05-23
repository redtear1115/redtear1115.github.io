---
title: "從一張卡開始：Wildcard 的牌組系統，跟 jsdom 的 Blob 吵了一架"
pubDate: "2026-05-16"
tags: []
draft: false
---
老實說，一個對戰遊戲沒有「自己的牌組」就只是個用相機拍石頭的玩具——這件事我其實心裡有數，只是一直假裝沒看到。直到 `/battle` 每次都得重新拍照才能出牌，我才認真坐下來把 deck system 補起來。

第一刀其實砍在 IndexedDB。我原本為了「方便」把 image 存成 ArrayBuffer 再 round-trip 回 Blob——聽起來合理，跑起來也沒事，直到 test 環境 jsdom 的 Blob 撞上 fake-indexeddb v6 的 structuredClone，整個炸開。最後 revert 成 spec 寫法（直接存 Blob），然後在 test-setup 把 jsdom 的 Blob 換成 Node 原生的——這種 _「環境跟 spec 對不上」_ 的 bug，永遠是用一杯咖啡的時間 debug、用半天時間懷疑人生。

接著才是真正的 deck system。Firestore 那層我寫了一組 `cards.js`：`createCard` 用 transaction 一次完成 hash 去重 + 寫卡 + 更新 `imageHashes`（避免同一張卡被 roll 兩次屬性，這在 PvP 遊戲裡會被罵爆）；`subscribeMyDeck` 走 onSnapshot 餵 `useMyDeck` hook，順便回 `count` 跟 `isFull`，讓 UI 不用自己算。Firestore rules 也補了 cards 跟 imageHashes 的讀寫限制——畢竟卡是身分的延伸，不能讓別人偷改你的「樹葉.jpg」變成核彈。

前端拆得很碎是故意的：`CardImage` 從 IndexedDB 撈 blob → object URL（這層 cache 真的香）；`CardGrid` 只負責排版；`CardEditSheet` 處理改名跟刪除；`SlotPicker` 同時要 cover「從 menu 開」跟「從 battle 出牌」兩種 mode——後者用了一個小 `mode` prop 切換，省去複製一份組件的痛苦。最後拼出 `/deck` 頁面，從 Home 接進來。

中間最好笑的踩坑：`useCreateCard` 一開始算 hash → 呼 Vision API → roll 屬性 → 寫 Firestore → 寫 IndexedDB，全部串成 promise chain，第一次測就遇到 hash 撞到的時候 IndexedDB 已經寫一半了。後來把 IndexedDB 挪到 transaction 成功之後才寫——其實就是「最容易回滾的留到最後」這個老掉牙原則，但寫 side project 的時候我總是會忘記。

deck 上線那刻 `/battle` 終於不用每次重拍——這個遊戲總算開始像個遊戲了（雖然還是會輸給自己拍的剪刀）。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*

---

<!-- source: wildcard | last_sha: 0d3a5fb49a0559a98db52cd3531dd04e2af45fbf -->
<!-- commits:
- d225ba1bd8 refactor: revert imageDb to spec impl; polyfill Blob for jsdom
- 3c3ee97e52 feat: add Firestore card CRUD (createCard tx, delete, update, subscribe)
- f3711d9be3 feat: add firestore rules for cards and imageHashes
- 57448fcd0e feat: add useMyDeck hook (subscribe + count + isFull)
- fce28ab60a feat: add useCreateCard hook (hash, vision, roll, tx, IndexedDB)
- b1eef6db31 feat: add CardImage component (IndexedDB blob → object URL)
- f476442606 feat: add CardGrid component
- dd6e0c8fee feat: add CardEditSheet (rename, delete, large preview)
- f0962491c5 feat: add SlotPicker (menu + deck pick modes)
- 0d3a5fb49a feat: add /deck page
-->
