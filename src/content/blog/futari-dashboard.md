---
title: "我做了一個記帳 app，它卻只會告訴你又花了多少"
pubDate: "2026-05-21"
tags: ["futari", "retrospective"]
draft: false
---
Futari 是給兩個人一起過日子用的家計簿。房租、餐費、小孩的花費一起記，家裡一起照顧的房子、車、寵物、植物也收在同一本帳裡。它想讓兩個人一起看見自己的生活，而不只是一起看見帳單。

可是有一陣子，打開首頁，你只會看到一個數字一直往下掉。

那時候的首頁只算支出。今天吃了麻辣鍋、昨天繳了電費、週末帶貓去看醫生，每一筆都把那個數字再往下推一點。它很準，但每次打開都像在提醒你：你又窮了一點。

一起生活的帳，不只有錢出去。薪水會進來，對方轉給你的房租分攤會進來，久違的退款也會進來。這些錢一直都在，只是首頁沒有地方放它們。

所以我讓首頁多了一個「進帳」模式。切過去，最上面那張大卡片換成這個月進來了多少，右下角的加號也從記一筆支出，變成記一筆進帳。記錄頁則多了「全部、支出、進帳」三個分頁，同一份清單換個角度看，不必另外開一個頁面。進帳那幾列帶一點薄荷綠的光，一眼就分得出來。

我最喜歡的是同步那一段。另一半在她的手機上補記了一筆薪水，我這邊的數字會自己跳，不用往下拉重新整理。兩個人共用一本帳，本來就該是這種感覺：她記，我就看得到。

最難寫的反而是一筆都沒有的時候。剛打開進帳模式的人，帳上什麼都沒有，總不能丟一個空白畫面，或寫一句「目前收入：0」。那句話怎麼寫都傷人。最後我放了一小片星空和光暈，意思是：這裡還空著，等你們把第一筆放進來。

做完才發現，改的其實不是功能，是首頁對兩個人說話的語氣。以前它只會報壞消息，現在它也願意說：這個月，你們也有東西進來。

如果你們家也是兩個人一起負擔生活，可以到[作品集](https://southern-light.dev/works/)找 Futari 試試看。

先不說了，我得去看看其他畫面上，還有哪一個數字只會報壞消息。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 10 月。*

<!-- source: oikos | last_sha: 5d52b1761ae3a88d819121644096a68b8f7f591a -->
<!-- commits:
5eab5039 feat(income): Dashboard mode toggle + income hero card — wire ModeToggle, IncomeHero, IncomeSheet open from FAB
4c421864 feat(income): Records tab bar 全部/支出/進帳 + income row mint glow styling
90b3924d fix(records): extend CompactRow to accept kind=income, remove stale cast
d2fa53b8 feat(income): realtime income events — subscribe IncomeTransactions, refresh on insert/update
2a943248 feat(income): constellation+halo empty state for income mode
e488ad1c docs(specs): add aibutsu onboarding hint spec (Phase 2.5)
5d52b176 feat(insurance): vehicleId FK on InsuranceDetails — insurance↔vehicle bidirectional link, UI on both detail pages
-->

