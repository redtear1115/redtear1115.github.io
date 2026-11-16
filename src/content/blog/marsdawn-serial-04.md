---
title: "MarsDawn 連載（四）拿掉檢查，還是綠的"
pubDate: "2026-11-16"
tags: ["marsdawn", "serial", "ai"]
draft: false
---
*MarsDawn 連載第四回。上一回：[（三）每一份都標上它從哪裡來](https://southern-light.dev/blog/marsdawn-serial-03/)*

MarsDawn 的預覽，其實是一個小小的網頁。Markdown 先轉成網頁再畫出來，所以它跟瀏覽器一樣，看到文件裡有一張網路上的圖片，就會自己連出去抓。

一份別人傳來的文件，打開就自己連上網，這不是我要的。9 月 17 日凌晨一點半，遠端圖片先擋了下來，變成一個安靜的佔位框，要看得自己按。

傍晚才發現擋得不夠。預覽的網頁，還有在 Finder 裡按空白鍵看到的快速預覽，自己就會發出別的網路請求，跟圖片無關。六點四十六分改成每次載入之前，就先把封鎖掛上。

這裡藏著一個時間差。前後兩次載入搶在一起，舊的那次結果晚一點才到，就可能把新的封鎖蓋掉。我為這個時間差寫了測試，測試是綠的。

然後把真正做檢查的那幾行拿掉，測試還是綠的。

它從頭到尾沒測到它說它在測的事。綠燈只是一句摘要，而這句摘要在說謊。

六點五十九分，測試改成故意卡住「允許」那條路，讓「封鎖」先跑完，再看有沒有人把結果蓋回去。這次拿掉檢查，它就紅了。

第一盞說謊的綠燈，出現在 MarsDawn 出生的第一天。後面還有好幾盞。

先不說了，我得去把下一盞綠燈的檢查也拿掉試試。

*這段 code 寫於 2026 年 9 月 17 日，文章整理於 2026 年 11 月。*

<!-- source: 私有 repo git log：73ec9af 09-17 01:33 Block remote images until the user loads them；e3af5a4 18:46 Block network loads in the Markdown web views；54a3007 18:59 Make the remote-images race test catch stale loads。「我為那個競態寫了測試。把檢查拿掉，測試還是綠的」出自已上線 marsdawn-waking-up-inside。 -->

<!-- Co-authored-by: Claude <claude@southern-light.dev> -->

