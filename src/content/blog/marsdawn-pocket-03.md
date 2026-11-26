---
title: "MarsDawn 連載第二季（三）手機上只讓人讀"
pubDate: "2026-11-26"
tags: ["marsdawn", "serial", "ios", "ai"]
draft: false
---
*MarsDawn 連載第二季〈把它放進口袋〉第三回。上一回：[（二）八十一個檔案](https://southern-light.dev/blog/marsdawn-pocket-02/)*

做手機版，最先要回答的問題是：要不要讓人在手機上改文件。

我的決定是不要。窄的螢幕只讓人讀，不能改。

理由寫在產品文件裡。agent 的檔案住在專案的資料夾裡，手機碰得到它們的路只有一條，就是系統的「檔案」App。在那麼窄的入口上做一個完整的編輯器，做出來也不會好用。而且我在會議之間那十分鐘要做的事，本來就只有讀。

接著是怎麼分寬窄。規則只有一條：看螢幕現在有多寬，不看它是哪一台機器。iPhone 是窄的，折疊機合起來是窄的，iPad 分一半給別的 App 的時候也是窄的。iPad 整個畫面、折疊機打開，才算寬。寬的時候，大綱會排在頁面旁邊，以後也只在寬的時候，才開放改個幾行。

然後是價錢。Mac 版是試用十四天，之後 4.99 美元買斷。手機版用同一筆：在哪一邊買過，另一邊就能用，試用的天數兩邊一起算。有人提過兩邊都能用的話，要不要賣 5.99。我說不要，維持 4.99。

最後是鎖。試用到期之後，Mac 版是把文件蓋起來。手機版更嚴一點：內容根本不載入，畫面後面什麼都沒有。當天晚上十一點零二分，這道鎖做好了。

那時候我沒有想到，十天後出問題的，就是這道鎖。

先不說了，我得去看那道鎖後面，是不是真的什麼都沒有。

*這段 code 寫於 2026 年 9 月 27 日，文章整理於 2026 年 11 月。*

<!-- source: PRODUCT.md iOS 段（owner, 2026-09-27）：Layout follows size class, never the device model；compact width read-only，regular width review-first with light editing（editing 在 iOS 1.1）；agent's files live in repositories that iOS reaches only through Files providers；Universal Purchase、unlock stays $4.99（$5.99 considered and declined）；trial clock shared；iOS content is never loaded, not just covered。3c8f286 09-27 23:02 S2: licensing on iOS。「會議之間只有讀」呼應 Ray 11/13 口述。 -->

<!-- Co-authored-by: Claude <claude@southern-light.dev> -->

