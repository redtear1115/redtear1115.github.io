---
title: "MarsDawn 連載（七）結束碼 0"
pubDate: "2026-11-18"
tags: ["marsdawn", "serial", "ai"]
draft: false
---
*MarsDawn 連載第七回。上一回：[（六）唯一的出口](https://southern-light.dev/blog/marsdawn-serial-06/)*

9 月 20 日凌晨，我在測 TestFlight 上的 1.0.1，準備拔掉網路線，看沒網路的時候，App 會不會誤以為人已經付過錢。

畫面上一直有東西自己打開、自己在跑。我打了一句：怎麼有某個東西一直在打開做測試呀。

是 agent 在背景跑整套測試。測試開出來的 App 連的是真正的 App Store 付款系統，沒有收據，文件就被鎖住，付費畫面跟著跳出來，App 還一直崩潰重開。我叫停，它又起了一輪。

翻日誌時，還有一句更安靜的。篩選條件沒有對上任何一個測試的時候，測試工具照樣結束，回報 0，代表成功，一句抱怨都沒有。看起來像通過了，其實一個都沒跑。

還有螢幕。Mac 螢幕睡著的時候，整套測試會卡在某個等畫面的步驟，十五分鐘都不結束。螢幕醒著，一分多鐘就跑完。那一晚至少三輪，每輪十五分鐘，換來的不是答案。

那天起，測試腳本每一輪都要印出實際跑了幾個，篩選過的至少一個，整套至少一百個，不夠就算失敗。中午加上螢幕睡著就拒絕開跑，把原因寫清楚。下午再加一個計時器，超過時間就強制停下，日誌寫明這次結果不算數。

沒有跑過的那一輪，不能拿來說程式沒問題。

先不說了，我得去確認下一輪開跑之前，螢幕是醒著的。

*這段 code 寫於 2026 年 9 月 20 日，文章整理於 2026 年 11 月。*

<!-- source: 出自已上線 marsdawn-exit-zero-ran-nothing（1.0.1 (6)、Ray 原話、StoreKit、結束碼 0、15 分鐘、至少三輪、至少 1／100 顆）。私有 repo git log：691028b 09-20 12:12 refuse to start while the display is asleep；3531157 13:22 bound every pass with a wall-clock watchdog。 -->

<!-- Co-authored-by: Claude <claude@southern-light.dev> -->

