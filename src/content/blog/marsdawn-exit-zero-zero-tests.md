---
title: "結束碼是 0，跑過的測試卻是 0 顆"
pubDate: "2026-09-30"
tags: ["marsdawn", "testing", "devlog"]
draft: false
---
9 月 20 日，測試流程裡出現一件安靜到會害人的事：用過濾條件只跑某一顆測試時，如果名字寫錯、對不上任何一顆，測試工具會結束碼 0、一句話也不抱怨，看起來就像「單獨跑也過了」。實際上一顆都沒跑。

這是 [MarsDawn](https://marsdawn.southern-light.dev) 開發的第四天。前三天分別踩過會說謊的測試、[測試洗掉正式 app 的設定](https://southern-light.dev/blog/marsdawn-tests-borrowed-real-app-identity/)，以及[每一道檢查都說沒問題、存出來卻是空白檔](https://southern-light.dev/blog/marsdawn-every-check-passed-blank-file/)。這天的主線比較不起眼：程式大致沒出錯，出錯的是我們讀結果的方式。

那天另一個現象更浪費時間。整套測試在螢幕睡著的時候跑，會卡死在某個等畫面的步驟上，十五分鐘還不結束，只好人工砍掉；同一套程式、螢幕醒著，大概一分多鐘就過。卡死的位置每次不一定相同，所以「睡著時拿到的結果」既不能證明有問題，也不能證明沒問題。那一晚至少有三輪，每一輪都花掉十五分鐘，換來的不是答案。

寫程式的 agent 把兩件事一起寫進了包住整套測試的檢查程式。第一件事：每一輪都印出實際跑了幾顆測試，少於下限就直接算失敗——篩選過的至少一顆，整套至少一百顆。結束碼和「測試失敗」那行先決定勝負，數量只負責多添一個失敗理由，絕不拿來洗成通過。第二件事：螢幕睡著就拒絕開跑，並講清楚原因；真的要硬跑，結果日誌裡會留下警告，讓後面的人知道這輪不能當證據。

後來截圖腳本也補了一刀：螢幕睡著時去截圖，系統原本只回「無法建立影像」，看不出是螢幕的問題。現在會先問螢幕醒著沒有，睡著就停下來，把原因講完。

這件事之後，我會問自己：看到結束碼 0 的時候，有沒有也看過「跑了幾顆」？這次名字對不上的過濾條件，0 顆測試、結束碼卻是 0。拿到一個失敗或卡住的結果時，有沒有先問它在講程式，或者其實在講當時的環境？這次螢幕睡著，同一套程式醒來就過。

agent 說「單獨跑也過了」的時候，那句話有沒有附上實際跑過的數量？沒有數量的通過，跟[第一天](https://southern-light.dev/blog/marsdawn-one-day-security-holes/)那顆拿掉關鍵程式還照樣綠燈的測試，距離其實很近。

先不說了啦，我得去確認下一輪測試開跑前，螢幕是醒著的。

*這段 code 寫於 2026 年 9 月 20 日，文章整理於 2026 年 10 月 1 日。*

---

<!-- source: mars-dawn | last_sha: 8f26028037 -->
<!-- commits:
7903f19116 2026-09-20T11:17:21+08:00 tools/test.sh: fail a run that ran too few tests, and never trust the last summary
3e575bc522 2026-09-20T11:42:12+08:00 Merge pull request #123 from redtear1115/test-count-guard
4cf7dcfd5d 2026-09-20T11:45:00+08:00 Say when the display is asleep instead of failing as 'could not create image'
691028bcd5 2026-09-20T12:12:28+08:00 tools/test.sh: refuse to start while the display is asleep (#114)
8f26028037 2026-09-20T12:15:07+08:00 Merge pull request #124 from redtear1115/display-asleep-guard
-->

