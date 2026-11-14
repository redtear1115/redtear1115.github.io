---
title: "MarsDawn 連載（三）每一份都標上它從哪裡來"
pubDate: "2026-11-14"
tags: ["marsdawn", "serial", "ai"]
draft: false
---
*MarsDawn 連載第三回。上一回：[（二）一天](https://southern-light.dev/blog/marsdawn-serial-02/)*

9 月 17 日晚上十一點十七分，MarsDawn 有了側邊欄。

側邊欄裡是一棵檔案樹。我把一個資料夾交給它，裡面的檔案就一層一層列出來，點一下，文件就在同一個視窗開成一個分頁，排好版。agent 在資料夾裡新寫了一份檔案，大約一秒就出現在樹上，我不用自己重新整理。

可是這還不夠。第 1 回讓我迷路的是 worktree。好幾個 worktree 裡都有一份 plan，路徑看起來一模一樣，分不出誰是誰。

所以那天晚上十一點十分，先寫下一條規則，七分鐘後做出檔案樹。隔天凌晨一點五十二分，側邊欄最上面多了一行字，寫著這些檔案來自哪個專案、哪個分支，如果是 worktree，就標上 worktree。兩個視窗開著同一個路徑的檔案，也看得出一個在主線，一個在 agent 自己的工作資料夾裡。

它只讀，什麼都不改。不能切分支，不能比對差異，也不能幫我提交。它只負責告訴我：手上這份，是從哪裡來的。

這就是我最初想要的全部。一天，做到了。

只是那天傍晚，其實已經有一盞綠燈騙過我一次。我當下沒放在心上，還覺得自己是天才。

先不說了，我得去把傍晚那盞綠燈再看一次。

*這段 code 寫於 2026 年 9 月 17 日至 18 日，文章整理於 2026 年 11 月。*

<!-- source: 私有 repo git log：8a8562f 09-17 23:10 Record the sidebar's git checkout indicator；993188b 23:17 Add a sidebar with a Files folder tree；b968f5b 09-18 01:52 Show which branch or worktree the sidebar is listing。PRODUCT.md：files an agent writes appear within about a second；names the checkout because agents work in worktrees and two windows can show the same relative path from different branches；reads .git only, no status/staging/diffs/branch switching；檔案點一下開成同視窗分頁。 -->

<!-- Co-authored-by: Claude <claude@southern-light.dev> -->

