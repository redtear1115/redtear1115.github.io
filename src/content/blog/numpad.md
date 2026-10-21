---
title: "我做了一組數字鍵盤，半小時後把它刪了"
pubDate: "2026-05-12"
tags: ["futari", "devlog"]
draft: false
---
Futari 是給兩個人一起記生活帳的家計簿，多半在手機上用：剛結完帳，站在店門口掏出手機記一筆。所以記帳那個畫面我想得特別細，從底部滑上來一張卡片，最上面是大大的金額，下面是說明、類別、怎麼分、日期。

5 月 3 日凌晨十二點多，agent 照我的意思把這張卡片做完，金額下面還附了一組自己畫的數字鍵盤：1 到 9、0、00，加一顆刪除鍵，四排、每排三顆，底色配合整個 App 的米色調，數字也用了專門的字體。我那時還挺得意的。

然後我拿手機從頭到尾點一遍。

點到金額就停住了。手機本來就有數字鍵盤，每天輸入密碼、轉帳都在用，刪除鍵在哪、按錯怎麼改，手指早就記得。我那組鍵盤再好看，也是要大家重新學一次的鍵盤。在電腦上開網頁版更尷尬，明明有實體鍵盤，卻得拿滑鼠一顆一顆點。

十二點五十一分，那組鍵盤被整個刪掉，從加進去到刪掉大約半小時。金額改成一般的輸入框，跟手機說這裡只收數字，手機就會自己跳出系統的數字鍵盤；在電腦上就直接打字。大大的金額還在原來的位置，輸入框藏在它裡面，畫面看起來幾乎沒變。卡片滑上來的動畫大約三分之一秒，我讓游標等動畫跑完才停進金額欄，鍵盤跟著升起來，不會跟卡片搶畫面。

同一輪還抓到幾個小毛病，例如下方的導覽列會跟著內容一起捲走、在電腦上點卡片外面的空白關不掉卡片，同一次一起修掉了。那幾個是做錯，數字鍵盤不一樣，它做得很認真，只是根本不需要做。

用 agent 開發，做出一個東西的成本很低，低到我會忘了先問：這個東西是不是本來就有了？系統鍵盤沒有任何問題，是我想讓畫面多一點自己的樣子。好在它只活了半小時。

想看看現在記一筆帳要按幾下，可以到[作品集](https://southern-light.dev/works/)找 Futari，用手機開開看。

先不說了，我得去店門口記一筆，順便數數從卡片滑上來到存好，總共按了幾下。

*這段 code 寫於 2026 年 5 月 3 日，文章整理於 2026 年 10 月。*

<!-- source: oikos | last_sha: 796822886f17a632cd9e2168d3aa2a1d3374eb95 -->
<!-- commits:
- d86851c feat(dashboard): warm empty state with Futari mark
- b7eaf01 feat(dashboard): recent transaction list with compact rows
- 9ad6c12 feat(add-sheet): bottom sheet shell with amount hero + payer toggle
- 084ccdb feat(add-sheet): full form body — desc/category/split/date + numpad + mini calendar
- f294c3e feat(settings): minimal settings page with logout
- ee00285 docs(sql): document Phase 1e realtime publication command
- d7e49d4 fix(phase-1a): apply final-review fixes
- 7968228 fix(phase-1a): viewport-fixed nav/sheet, native numeric keyboard
-->

