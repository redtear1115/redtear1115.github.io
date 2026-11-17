---
title: "MarsDawn 連載（六）唯一的出口"
pubDate: "2026-11-17"
tags: ["marsdawn", "serial", "ai"]
draft: false
---
*MarsDawn 連載第六回。上一回：[（五）測試住進了我家](https://southern-light.dev/blog/marsdawn-serial-05/)*

MarsDawn 要收費：試用 14 天，之後 4.99 美元一次買斷。試用結束那天，文件會被鎖住，畫面蓋起來，不能讀也不能改。這是我定的。

可是試用期間打的字，總要讓人帶走。所以鎖住之後只留一個出口：另存新檔。

9 月 19 日早上十一點半，選單補上了「另存新檔」。二十分鐘後，負責驗收的 agent 回報：在鎖住的視窗裡按另存，存出來的檔案是 0 bytes。原本那份還在，38 bytes，一個字都沒少。畫面上沒有任何錯誤。

凌晨的設計文件其實提醒過這個危險：鎖住時如果讓編輯器回報「內容是空的」，存檔就會把空白寫出去。早上的程式也照著防了。存檔先問編輯器，編輯器說「沒有答案」，就改用文件自己保管的那份文字。還附了測試，測試是綠的。

可是測試用的是假資料，假資料回答的是「沒有答案」。真正的視窗一打開就被鎖住，編輯器從來沒被填進文字，它回答的是「有，內容是空的」。程式只防了第一種回答。

這一回的測試，住在一個跟真實世界不一樣的世界裡。

新的測試接上真的視窗，直接量存出來的檔案有幾個 bytes，先在還沒修的程式上跑出那個空白檔，再動手修。中午重驗兩次，兩次都是 38 bytes。

先不說了，我得去把另存再按一次，看 bytes 還在不在。

*這段 code 寫於 2026 年 9 月 19 日，文章整理於 2026 年 11 月。*

<!-- source: 出自已上線 marsdawn-save-as-wrote-nothing（11:49 回報、0／38 bytes、假資料「沒有答案」、中午重驗兩次）。私有 repo git log：9c0b83a 09-19 11:30 Add Save As... to the File menu；695ef1f 11:52 Tests for what Save As... writes, committed before the fix。 -->

<!-- Co-authored-by: Claude <claude@southern-light.dev> -->

