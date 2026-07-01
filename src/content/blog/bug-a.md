---
title: "一個只有「對方」看得到的 bug，因為我永遠是那個 A"
pubDate: "2026-05-26"
tags: ["architecture", "database", "postmortem"]
draft: false
---
你有沒有寫過那種 bug——你自己用一百次都正常，因為你剛好站在它隱形的那一側？我這天抓到一隻，它在 prod 上活了不知道多久，而我完全沒發現，原因蠢到我想找個地洞鑽進去：**因為我永遠是那個 member A。**

先講背景。Futari 是兩人記帳，一筆 weighted（按比例分攤）的支出，DB 裡存一個欄位 `split_ratio_a`。重點來了——這個欄位的語意是「**member A 的比例**」。不是「記帳的人的比例」，是「A 的比例」。A 是誰？group 裡固定的那一方，跟「現在是誰在看畫面」沒關係。

而我的前端，從頭到尾，都把它當成「**看的人的比例**」在用。slider 的位置、「我 X% / 對方 Y%」的標籤、SplitGlyph 那條分攤長條、CompactRow 每一列的「我的份」chip、編輯表單上「對方欠你 NT$…」的預覽——全部都假設 `splitRatioA` 就是 viewer 自己的份。

當 viewer 剛好是 A 的時候，這兩個值**完全重合**。A 的份就是看的人的份，怎麼算都對。我開發、我自測、我 demo——我用的帳號永遠是 member A。所以這隻 bug 在我眼前，從來沒有露過臉。

它只在一種情況現形：**viewer 是 member B，而且去看一筆 weighted 的紀錄。** 這時角度整個反過來。B 看到的是 A 的數字，卻被貼上「我的份」的標籤。更糟的是 balance：計算吃進反掉的比例，算出來的金額是對方的份而不是你的份。最致命的是——B 如果去**編輯**那筆紀錄再存回去，那個反掉的角度就被寫死進 DB 了。錯誤從顯示層滲進了資料層。

我那天早上其實是先在做別的事：把 dashboard 的文案往「見證者」的語氣收（「欠」改成「待還」，少一點催債感）、`font-semibold` 全面換成 `font-medium`、settings 頁的 split-ratio slider 改成樂觀更新即時存檔、修一個日文 balance 文案方向反置（`partnerOwesYou` 講反了，#764）。都是溫和的打磨。然後我點開一筆同事用 B 帳號建的 weighted 紀錄——數字不對。

根因找到的瞬間，我有兩種情緒同時發作：一種是「找到了！」的爽，一種是「這也太蠢了」的尷尬。整個前端跟 DB 對同一個欄位有**兩種不同的語意理解**，中間沒有任何一個地方做轉換，而我因為永遠站在語意重合的那一側，所以從來沒被咬過。

修法不難理解，難在**徹底**。我開了一個 `lib/splitRatio.ts`，只放兩個函式：`toViewerShare`（DB → 畫面）和 `toMemberAShare`（畫面 → DB）。它們互為反函式（involution），命名本身就在文件化「這條邊界該往哪邊翻」。然後把**每一個** form ↔ wire 的接縫都補上轉換：AddSheet 的存檔與編輯載入、RecurringRuleSheet、settings 的 SplitRatioSection、CompactRow 的每列 chip。server 端的 `lib/balance.ts` 一個字都不動——schema 的語意本來就是對的，錯的是前端，修就修在前端。

這裡我學到最痛的一點：**第一次修不夠。** 我第一刀只補了 AddSheet 的編輯載入路徑，看起來好了。但「viewer share 撞上 member-A share」這個接縫不是只有一處——它散落在存檔、載入、定期規則、設定頁、列表 chip 每一個地方。漏掉任何一個，bug 就從那個洞繼續漏。所以第二刀我把剩下的邊界全部堵死，配上 0/50/75/90/99/100 各種比例、null/undefined fallback、還有「A 建 90%、B 打開 slider 該停在 10%」的 prod 情境重播，整套測試 1540 全綠才收手。

但最讓我背脊發涼的不是 code，是**資料**。那些已經被 B 帳號建立、或編輯過的 prod row，`split_ratio_a` 裡躺著反掉的值。我想寫一個自動 migration 把它們翻正——結果發現**辦不到**。因為這張表沒有 `created_by` 欄位，我無從判斷哪一筆是 A 建的（值是對的）、哪一筆是 B 建的（值反了）。兩種 row 長得一模一樣。所以這個 PR 只修 code，舊資料只能標記「需人工 review」。一個沒當初設計進去的欄位，讓一個本來十行 SQL 能掃完的事，變成不可能自動化。

學到的（又一次昂貴的）一課：**當一個欄位的語意是「相對於某個固定主體」，而 UI 是「相對於當前使用者」，這兩者之間一定要有一道明確的轉換邊界——而且要在每一個接縫上都做，不能只做你測得到的那一個。** 我之所以沒早點發現，正是因為我這個開發者剛好是 member A，是那個讓 bug 隱形的人。最危險的 bug 不是會炸的那種，是「在你的座位上永遠不會炸」的那種。

當天後面還順手加了 CashTransactions 跟 Settlements 的 composite index、把頭像的 `<img>` 換成 `next/image`、裝了 bundle analyzer 看 client bundle。出 v1.2.4、v1.2.5。

先不說了，我得去開一個 B 帳號，把每個畫面再走一遍——這次用「對方」的眼睛看。

*這段 code 寫於 2026 年 5 月 26 日，文章整理於同日深夜。*
