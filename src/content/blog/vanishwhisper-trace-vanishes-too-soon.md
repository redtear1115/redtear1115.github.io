---
title: "訊息該消失，這次對話不該在 Threads 裡一起消失"
pubDate: "2026-10-03"
tags: ["vanishwhisper", "retrospective"]
draft: false
---
有人從 Threads 裡點開 VanishWhisper 的連結。訊息該消失，這次我同意。連這個人自己也消失了，這次我不同意。

Threads、Instagram、Facebook、LINE、微信、TikTok、X，這些 app 用自己的 webview 開外面的連結。寫進那個 webview 的 IndexedDB——RSA 私鑰、所有對話、所有聯絡人——只活在那個沙盒裡。下次用 Safari 或 Chrome 開同一個網址，拿不回來。

一個以消失為賣點的產品，很容易把這種事看成符合設定。黑色幽默而已。不對。該消失的是說完的話，不是這次對話進行到一半，人被瀏覽器吃掉。

---

我差點用一個很省事的判斷：使用者代理字串裡沒有 Safari 的記號，就當成 in-app browser。這樣會把已經裝成 PWA 的人全部誤傷。所以名單是正列那些已知的 app，再用 `navigator.standalone` 和 `display-mode: standalone` 把 PWA 排除。

橫幅釘在畫面最上面，第一個畫面就看得到，附一顆複製連結的按鈕。讓人貼到真正的瀏覽器，比跟每個 app 的「在外部開啟」選單搏鬥快。

**不留痕跡是訊息的承諾，不是這次連線可以隨便丟。**

## 收尾

消失要發生在說完之後。發生在人還沒說完、只是從社群 app 點進來的時候，產品是在對自己的承諾下手。

先不說了，我得去用幾個還沒收進名單的 app 再點一次那條連結。

*這件事發生於 2026 年 5 月，文章整理於 2026 年 10 月。*

