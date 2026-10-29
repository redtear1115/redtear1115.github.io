---
title: "按下「收到錢了」，欠款反而變多，那一晚我一筆舊資料都沒改"
pubDate: "2026-10-29"
tags: ["futari", "database", "devlog"]
draft: false
---
Futari 是給兩個人一起記生活帳的家計簿，有 iPhone App 也有網頁版。兩個人各自記下自己付了什麼、這筆怎麼分，首頁最上面是一個數字：現在誰欠誰多少。

這個數字是 Futari 最重要的一格，也是我最怕它出錯的一格。5 月 2 日傍晚，還沒寫任何程式之前，我先寫了一份架構文件，關於這個數字只有一行：每次寫入後全量重算。

意思是資料庫裡雖然存著一格「目前餘額」，這格卻從來不拿來加減。每新增一筆帳、刪掉一筆帳，程式就把這本帳本裡所有還沒刪掉的帳，連同所有還款紀錄，從頭算一遍，再把結果寫回那一格。同一份文件還有另一條：帳不能直接修改，「編輯」其實是把舊的那筆標成刪除、再新增一筆，兩個動作包在同一次資料庫操作裡。這樣一來，會動到餘額的動作只剩新增和刪除，兩種都會觸發重算。

另一種做法是新增一筆，就在那格加上這筆的金額，刪掉就減回去。這樣算得比較快，可是只要有一條路忘了加減，或是方向寫反，那格數字就會跟帳對不上，而且會一直錯下去，之後每一次都只是在錯的數字上繼續加減。帳本是兩個人一起看的，數字對不上的時候，對面那個人第一個懷疑的大概是我。

那天晚上十一點五十五分，重算的程式寫好；兩分鐘後，新增帳接上重算；再兩分鐘，刪除帳也接上。寫入和重算放在同一次資料庫操作裡，一起成功，或是一起退回，畫面上不會出現「帳寫進去了，餘額還沒變」的中間狀態。

過了午夜，開始做還款。兩個人之間欠了錢，總有一天要還，Futari 裡叫結清，按下「收到錢了」，就記下一筆還款。凌晨兩點零五分，還款的新增和刪除寫好，同樣接上重算；兩點二十一分，首頁那張餘額卡可以點開，直接在裡面記一筆還款。

兩點三十九分，一筆修正進來，說明的第一句是：結清讓餘額往錯的方向跑，還了錢，欠款沒有歸零，反而變得更多。

原因是還款的正負號寫反了。Futari 的正負號有兩層，畫面上一律以正在看的人為準，這件事我在[定方向那篇](https://southern-light.dev/blog/futari-sign-follows-who-is-looking/)寫過；資料庫裡存的那格則固定以 A 為準，正數代表 B 欠 A。B 還給 A 一百塊，餘額應該減一百，程式卻加了一百。帳是對的，還款紀錄也是對的，出錯的只有算式裡的兩個符號。

修法就是把符號對調。畫面上試算用的那支函式，和資料庫裡重算的那段，各改一處，再補幾條測試，其中一條寫著：B 欠 A 一百，B 還 A 一百，餘額要回到零。

那筆修正說明的最後一段，是我後來最常想起的一段：資料庫裡已經存在的還款紀錄不用改寫，它們記的是真實發生過的轉帳；下一次有人新增或編輯任何一筆帳，重算就會用修好的算式，把餘額算回該有的樣子。

如果當初選的是加加減減，這一晚會麻煩很多。每一本試過還款的帳本，那格餘額裡都摻進了算反的金額，得一本一本找出來，算出差了多少，再補回去。全量重算讓這件事變得很單純：餘額只是帳算出來的結果，帳沒有錯，改好算式，下一次重算就對了。

代價也寫在同一段裡。修好之後，那格餘額不會自己變對，要等下一次有人記帳或改帳，才會重新算過。另一個代價是速度，每記一筆就從頭算一遍，帳越多算得越久。我當時的判斷是兩個人的帳本頂多幾百筆，資料庫加總幾百個數字不費力，這個範圍沒有量過，帳本要是長成別的規模，這句話就得重看。

Futari 在[作品集](https://southern-light.dev/works/)裡，iPhone 和網頁都能直接試，程式碼放在 [GitHub](https://github.com/redtear1115/oikos)。

先不說了，我得去把那晚的測試帳本翻出來，看那格餘額是哪一次重算才變回來的。

*這段 code 寫於 2026 年 5 月 2 日到 3 日，文章整理於 2026 年 10 月。*

<!-- source: oikos | last_sha: b8b0691 -->
<!-- commits（台北時間）:
c0f3949 2026-05-02 19:44 docs: add Oikos architecture design spec（「欠款計算：全局計算，維護 GroupBalance cache，每次寫入後全量重算」；「不支援 update：編輯 = soft delete 舊紀錄 + insert 新紀錄，同一 DB transaction」；balance 正數 = member_b 欠 member_a）
de3b0ea 2026-05-02 23:55 feat(db): recalcGroupBalance helper（CashTransactions 減 Settlements，deleted_at IS NULL）
7b292dd 2026-05-02 23:57 feat(actions): createTransaction with atomic balance recalc
7462605 2026-05-02 23:59 feat(actions): softDeleteTransaction with atomic balance recalc
9b046f9 2026-05-03 02:05 feat(actions): createSettlement + softDeleteSettlement (atomic + recalc)
2b92dcf 2026-05-03 02:21 feat(balance): clickable card with inline SettlementForm expansion
b8b0691 2026-05-03 02:39 fix(balance): correct settlement sign convention（"settling (收到錢了) moved balance the wrong way"；改 lib/balance.ts settlementDelta 與 lib/db/queries/balance.ts SQL；"Existing settlement records in the DB don't need rewriting… The next mutation (or any edit) will trigger recalcGroupBalance with the corrected math"）
-->
<!-- 改寫補充：原稿開頭「刪掉舊帳之後，畫面上的欠款還停在刪掉之前」「我起先把餘額當成欄位加加減減」與 commit 不符：5/2 19:44 的架構文件一開始就定了全量重算，從沒有過增量版本；改用同晚 02:39 的還款正負號 bug 當故事。原稿「cursor 跑了兩天才發現同一秒掉一筆」也不符：複合 cursor 是 5/3 01:19 首次寫分頁就用了（6285e79），且依一篇一個故事拿掉；ViewerProvider 一段同樣拿掉。「幾百筆」沿用原稿的範圍判斷，沒有量測。修正說明裡的 "User reported" 沒寫是誰發現，正文不寫。 -->

