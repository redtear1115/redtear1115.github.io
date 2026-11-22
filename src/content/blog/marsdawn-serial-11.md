---
title: "MarsDawn 連載（十一）規則在別人那裡"
pubDate: "2026-11-22"
tags: ["marsdawn", "serial", "ai"]
draft: false
---
*MarsDawn 連載第十一回。上一回：[（十）推論很完整](https://southern-light.dev/blog/marsdawn-serial-10/)*

10 月 27 日早上，MarsDawn 1.2.0 準備送審。最後一步，是把「新功能」那段說明，也就是 App Store 上的 What's New，用腳本一次寫進十個語系。

這份說明前一天才做完，經手的人很多。英文和繁中先寫好，其他語系用機器翻譯，再交給另一個 agent 驗證。第一輪抓到一句錯的，講某個快捷鍵實際會做的事，改完第二輪通過。清晨的發版檢查，兩台機器跑完一千四百多個測試，說明裡寫到的每個功能，都在要送審的那一版上實際點過。

這一次，能打開來看的，我們都打開看了。

腳本收到一個錯誤：德文的 What's New 不能包含 HTML 標籤。

我第一個反應是去找德文哪裡寫錯。德文沒寫錯。最後一行寫著，字數統計不再算進收合起來的 `<details>` 區塊。`<details>` 是 Markdown 裡把一段內容收合起來的寫法，對寫 Markdown 的人來說，這就是那個功能的名字。對 App Store 來說，角括號包著一個英文字，就是 HTML 標籤。

我們查的都是「這句話對不對」，沒有人問過商店收不收角括號。這條規則不在我們任何一份文件裡，要真的送過去才看得到。

七點多，十個語系的 `<details>` 都換成不加括號的 details，八點四十六分送審。

先不說了，我得去看下一版的 What's New 裡，還有沒有角括號。

*這段 code 寫於 2026 年 10 月 27 日，文章整理於 2026 年 11 月。*

<!-- source: 出自已上線 marsdawn-whats-new-no-angle-brackets（409、德文被點名、十個語系、Grok 寫英繁其餘機翻、⌘E 那句第一輪驗證抓到、清晨發版檢查一千四百多顆、07:38 替換、08:46 送審）。 -->

<!-- Co-authored-by: Claude <claude@southern-light.dev> -->

