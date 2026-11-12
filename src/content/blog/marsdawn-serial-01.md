---
title: "MarsDawn 連載（一）我只是想看一份 plan"
pubDate: "2026-11-12"
tags: ["marsdawn", "serial", "ai"]
draft: false
---
*MarsDawn 連載第一回。*

那陣子我讓 agent 照 superpowers 的流程做事。它動手寫程式之前，會先交兩份文件：一份 spec，寫要做成什麼樣子；一份 plan，寫打算怎麼一步一步做。兩份都是 Markdown，我看過、點頭，它才往下走。

麻煩在這兩份文件放的位置。agent 每接一件事，就開一個 worktree。可以把它想成同一個專案複製出來的另一個工作資料夾，好幾件事同時做，彼此不會打架。文件就寫在那個資料夾裡。

我要看，就得先切到那個 worktree，再打指令叫 VS Code 打開整個資料夾。等它開起來，左邊一整排檔案樹，我在裡面找到那份 plan，再另外開預覽，才看得到排好的樣子。

一份還好。可是 agent 同時在做三件事，就有三個 worktree、三組文件。來回切個幾次，我就不知道自己現在站在哪個資料夾裡，手上這份是哪一件事的 plan。

我只是想看一份文件。我不寫程式，用不到整個編輯器。

我想要的東西很小：agent 寫完，文件就出現在我面前，排好版，順便告訴我它是哪個 worktree 的。

這個小東西後來有了名字，叫 [MarsDawn](https://marsdawn.southern-light.dev)，一個 Mac 上的 Markdown 編輯器，左邊寫、右邊看預覽。

先不說了，我得去把它做出來。

*這段故事發生於 2026 年 9 月，文章整理於 2026 年 11 月。*

<!-- source: 第 1 回情境為 Ray 2026-11-11 口述：看 superpowers 產出的 plan、spec，要切到 worktree 再開 VS Code，切幾次就迷失在 worktree 裡。 -->

<!-- Co-authored-by: Claude <claude@southern-light.dev> -->

