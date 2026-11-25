---
title: "MarsDawn 連載第二季（二）八十一個檔案"
pubDate: "2026-11-25"
tags: ["marsdawn", "serial", "ios", "ai"]
draft: false
---
*MarsDawn 連載第二季〈把它放進口袋〉第二回。上一回：[（一）開會之間的十分鐘](https://southern-light.dev/blog/marsdawn-pocket-01/)*

9 月 27 日上午十一點十七分，新的決定寫進了產品文件：iPhone、iPad，加上 Apple 十月要開賣的折疊機，共用同一個 App。

動手之前，agent 先做了一次試做。它想知道 Mac 版的東西有多少搬得過去。

答案是一張清單。Mac 版一共八十一個檔案，二十八個可以原封不動拿來用，三十五個要照手機的做法重寫，十八個只有 Mac 才用得到。清單後面它自己加了一句：這是讀程式分出來的，沒有一個一個實際編譯過。

能直接搬的那二十八個，是最要緊的那一塊：把 Markdown 變成排好版的頁面，連同圖表、數學式和程式碼的上色。這一塊從第一天起就寫成 Mac 和手機都能用，當時只是想著以後也許用得到。

中午十二點五十五分，手機版的第一個提交進來，只有一個空殼。下午四點十九分，它已經能打開檔案、畫出預覽、列出文件的大綱、換主題、記得最近開過哪些檔。五點三十九分，修掉第一個問題：點了大綱裡的標題，頁面有時不會捲過去。

從決定到能用，不到六個小時。

跟九月十七日那一天很像。那天晚上我覺得自己是天才，後來花了兩個星期收拾。這一次我沒有那麼想。

先不說了，我得去看看那三十五個要重寫的檔案。

*這段 code 寫於 2026 年 9 月 27 日，文章整理於 2026 年 11 月。*

<!-- source: 私有 repo git log（台北時間）：a29266a 09-27 11:17 PRODUCT, free-trial-plan: record the iOS decisions；43bdc86 12:55 S0 iOS foundation target；4904e66 16:19 S1 viewer core (open, render, outline, theme, recents)；f67ce1a 17:39 fix a dropped outline-tap scroll。PRODUCT.md Feasibility：81 files，28 carry over、35 need a port、18 Mac-only（classified by reading, not by compiling each one）；kit 的 preview pipeline 原樣可用。「這一次我沒有那麼想」為代寫感受，待 Ray 確認。 -->

<!-- Co-authored-by: Claude <claude@southern-light.dev> -->

