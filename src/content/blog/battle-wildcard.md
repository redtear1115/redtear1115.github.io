---
title: "原本每一場對戰都要當場拍五張照片，那天凌晨，我讓撿回來的東西留了下來"
pubDate: "2026-11-05"
tags: ["wildcard", "gamedev", "devlog"]
draft: false
---
Wildcard 是我自己在做的一款叫人出門撿東西的對戰遊戲。拍下一顆石頭、一片葉子或一根樹枝，系統認出那是哪一種，再拿去跟別人比。石頭、葉子、樹枝互相剋，跟剪刀石頭布一樣。

一開始的對戰頁很直。點進去，畫面上有五個空格，每一格都要拍一張照片，或從相簿挑一張。照片送去辨識，認出是石頭、葉子還是樹枝，格子就填上。五格填滿，出戰，結算。

打完這一場，那五張照片就沒了。下一場再點進來，又是五個空格。

[出牌必須是一張真的照片](https://southern-light.dev/blog/wildcard-the-photo-is-the-move/)那篇寫過，我想要的是「你得先拿到一個真的東西」。這個規則本身沒問題，問題在「每一場」。一顆在河邊撿到的好石頭，用一次就丟，下次要再打，得再去找一顆。玩的人沒有理由記得自己拍過什麼。

5 月 2 日凌晨一點多，我開始補牌組。

拍下來的東西變成一張卡，留在自己的牌組裡，最多二十張。照片存在自己的手機上，伺服器只記這張卡是哪一種、幾分，還有照片的指紋。同一張照片的指紋，全遊戲只能用一次，[一個東西只能變成一張卡](https://southern-light.dev/blog/wildcard-one-object-one-card/)那篇講的就是這條規則。

兩點零二分，建卡、改名、刪卡的程式寫好。兩點十六分，牌組那一頁做好。兩點十九分，對戰頁整個翻過來重寫。五個格子還在，點下去會先問「這個位置出什麼？」，可以從牌組挑一張，也可以拍一張新的；拍新的那一張會先進牌組，再上場。

從這一刻起，一場對戰不必在撿到東西的那個地方打。白天出門拍的，晚上回家還能用。

翻過來的時候，掉了一樣東西。舊的對戰頁有「拍照」和「相簿」兩個選項，新的「拍新卡」只開相機。在手機上點下去，就直接進拍照畫面，相簿裡的照片選不到。白天在外面拍的那一堆，進不了牌組。

兩點二十九分補回來了。拿掉強制開相機的那一行，對戰頁和牌組頁都一樣，點下去可以拍，也可以從相簿挑。同一次修改裡，指紋撞到時跳出來的訊息，從一串程式內部的代號，改成「這張照片已被使用過」。

刪卡也是那天晚上的事。刪一張卡要清兩個地方：伺服器上的那筆紀錄，和手機裡的那張照片。兩點十四分寫刪卡的時候，先刪伺服器，再刪照片；照片沒刪成功也不報錯，程式裡留了一句註解：之後再對帳。

十分鐘後，兩點二十四分，對帳寫好了。每次打開遊戲，拿伺服器上自己的卡片清單，跟手機裡的照片比一遍，清單上沒有的照片就刪掉。換一台手機刪了卡，或刪到一半網路斷了，留在這台手機上的照片，下次打開時會被清掉。

兩點三十二分，最後一筆是刪掉一個多餘的資料庫索引。那天凌晨的工作到這裡為止，從一點五十三分算起，大約四十分鐘。

那篇寫「出的牌該是剛拍到的那片葉子」。這一晚之後，「剛」這個字鬆了一點。葉子還是要真的去拍，只是拍下來那一刻和出牌那一刻，中間可以隔一整天。我覺得這樣比較像在收集東西，口袋裡帶回來的，回家倒在桌上，挑幾個出來玩。

同一天早上九點多，我開始替 Wildcard 做一套新的畫面風格，叫野地手帳。那是另一個故事，牌面上的 emoji 就是在那之後被換掉的。

其他作品在[作品集](https://southern-light.dev/works/)。

先不說了，我得去相簿裡翻一下，看還有哪幾片葉子拍了沒進牌組。

*這段 code 寫於 2026 年 5 月 2 日，文章整理於 2026 年 10 月。*

<!-- source: wildcard（私有 repo） | last_sha: 640cf58 -->
<!-- commits（台北時間）:
d225ba1 2026-05-02 01:53 refactor: revert imageDb to spec impl; polyfill Blob for jsdom
3c3ee97 2026-05-02 02:02 feat: add Firestore card CRUD (createCard tx, delete, update, subscribe)（imageHashes 為全域 collection）
fce28ab 2026-05-02 02:11 feat: add useCreateCard hook (hash, vision, roll, tx, IndexedDB)
dd6e0c8 2026-05-02 02:14 feat: add CardEditSheet (rename, delete, large preview)（doDelete：先 deleteCard，再 try deleteCardImage，catch 註解「reconcile later」）
0d3a5fb 2026-05-02 02:16 feat: add /deck page
6ef63d4 2026-05-02 02:17 feat: wire /deck route and Home entry
6d08db1 2026-05-02 02:19 feat: rebuild /battle as 5-slot lineup picker with deck integration（Battle.jsx +141／−219；舊版 camera／gallery 兩個 input 與 inputMode 切換；新版 SlotPicker「這個位置出什麼？」「從牌組選」「拍新卡」；useMyDeck isFull = 20 張；Co-Authored-By: Claude Opus 4.7）
f9e3c99 2026-05-02 02:23 fix: cleanup transient camera input element in Battle
5813be3 2026-05-02 02:24 feat: reconcile orphan IndexedDB images on app start（App 啟動時比對 Firestore 卡片 id 與 IndexedDB 影像 id，刪掉孤兒）
894954e 2026-05-02 02:29 fix: surface friendly hash-taken message; allow gallery selection（'hash-taken-precheck' → 「這張照片已被使用過」；Battle、Deck 拿掉 capture="environment"）
28a0971 2026-05-02 02:32 fix: remove redundant single-field index for items collectionGroup
640cf58 2026-05-02 09:33 feat(design): add fieldbook design tokens (fonts, palette, animations)
-->
<!-- 改寫補充：原稿「刪卡時 Firestore 砍了、IndexedDB 的圖還在、越用越肥」不符：刪卡一開始就會刪照片，失敗才留給對帳，對帳是十分鐘後補上的設計，並沒有累積成問題的紀錄。原稿提示語「這顆石頭已經有人收了，要不要從相簿選一張？」不符，實際是「這張照片已被使用過」；「從相簿選」是另一個修正（拿掉強制開相機）。原稿 Battle 殭屍 input 那段、Firestore 索引那段依一篇一個故事只帶過或拿掉；fieldbook 設計系統（09:33 起）與已發佈的 emoji 那篇同題，只留一句。#42（牌組系統、jsdom Blob）是同一晚 01:53～02:16 的事，事實併入本篇。 -->

