---
title: "幫我盯存檔的那支小程式，有三天都守著一個已經搬走的檔案"
pubDate: "2026-11-02"
tags: ["ai", "indie-dev", "postmortem"]
draft: false
---
NBA MyGM × DnD 是我做的文字跑團遊戲，沒有畫面，程式也少得可憐。玩家當一支 NBA 球隊的總經理，從某個年代接手，選秀、交易、跟老闆周旋；Claude Code 當地下城主，每個重大決定都擲一顆二十面骰，加上總經理的屬性修正，跟難度值比大小。規則寫在幾份 Markdown 裡，球隊現在的狀態也存在 Markdown 裡，一局一個存檔資料夾。

這種玩法最怕地下城主忘記寫檔。劇情演得很熱鬧，回合結束時狀態檔沒更新，下次開新對話，Claude 從檔案讀回來的就是舊的世界。費城那一局，1998-99 年的自由市場一口氣骰了三筆簽約，其中 Hersey Hawkins 那顆骰出自然 1，談判當場破局。這種結果沒寫進檔案，下一次開局就跟沒發生過一樣。

6 月 7 日晚上九點五十一分，我加了一支小程式，讓 Claude Code 在每個回合結束時自動跑一次。它的工作很單純：找到最近動過的存檔，看狀態檔多久沒更新，超過 480 秒（八分鐘）就在下一回合塞一句提醒，請書記補寫。七分鐘後接上設定。那天晚上它盯的是兩個檔案，存檔裡 current 資料夾下的 STATE.md，以及一份給玩家看的 DASHBOARD.md。

同一個晚上我還整理了存檔結構。原本一局的狀態拆成七份檔案，陣容、薪資帽、聯盟、年度任務各一份，Claude 每次開局都要讀一輪，我嫌慢，十點十一分把它們併成一份 STATE.md，放在 current 底下。小程式本來就是照這個位置寫的，兩邊對得上。

隔天，6 月 8 日晚上八點零七分，我又併了一次。這次把 DASHBOARD.md 和記總經理屬性的那份也收進 STATE.md，順便拿掉 current 這一層，讓 STATE.md 直接放在存檔資料夾底下。規則檔跟著改了，Claude 照新位置讀寫，遊戲玩起來沒有任何異樣。

小程式沒有跟著改。它還在找 current 底下的 STATE.md 和 DASHBOARD.md，從那一刻起，這兩個路徑都不存在。

它也沒有報錯。當初寫它的時候，我加了一行：要看的檔案不存在，就直接結束。用意是剛開新局、存檔還沒建好時別亂叫。結果變成路徑指錯、找不到檔案、安靜結束、回報成功。Claude Code 看它乖乖跑完，就繼續下一回合。從外面看，它跟正常上班的時候一模一樣，因為狀態檔有乖乖更新時，它本來就不出聲。

那幾天我開了兩局新的，6 月 8 日接費城，6 月 9 日接金州勇士，玩得很勤。小程式每回合都跑，每次都對著空的路徑看一眼，然後什麼都沒說。

6 月 11 日晚上十點多我才發現，這次修得比較徹底。路徑改成新的位置；另外寫了一支檢查程式，STATE.md 開頭有一段固定格式的資料，每回合結束都驗一次格式對不對；新鮮度也不再只看狀態檔幾分鐘沒動，改成跟最新那一季的日誌比，狀態檔比日誌舊就提醒。規則裡也寫明，Claude 開局第一件事就是跑這個檢查，格式錯了先停下來修，不准帶著錯的存檔往下玩。

那一行「檔案不存在就結束」，新版裡其實還在，只是換了寫法：STATE.md 在才驗，不在就跳過。哪天存檔結構再搬一次家，它大概還是會安安靜靜守著舊地址。

這支小程式檢查得很認真，問題出在它把「找不到要檢查的東西」當成「沒事」。負責提醒的程式，大部分時間本來就該安靜，所以它壞掉的時候也是安靜的，兩種情況從外面分不出來。要讓它可靠，找不到檔案這件事本身就得講出來，至少在已經有存檔的時候。

6 月 14 日這個專案公開到 GitHub 上，那行跳過到現在都沒改。

其他作品在[作品集](https://southern-light.dev/works/)。

先不說了，我得去把那行跳過改成會出聲的版本。

*這段 code 寫於 2026 年 6 月 7 日到 11 日，文章整理於 2026 年 10 月。*

<!-- source: nba-dnd-dm（public repo redtear1115/nba-dnd-dm） | last_sha: bdcbb2a -->
<!-- commits（台北時間）:
804716d 2026-06-07 21:15 init commit（存檔結構：DASHBOARD.md、gm.md、current/my-team.md 等七份狀態檔）
e882aa4 2026-06-07 21:51 feat: add Stop hook validation script for file update reminders（scripts/validate-turn.sh：STATE="$SAVES_DIR/$LATEST/current/STATE.md"、DASHBOARD.md；[ ! -f "$FILE" ] && return；480 秒）
4bd31f4 2026-06-07 21:58 feat: configure Stop hook for turn-end file validation
a51c315 2026-06-07 22:11 refactor: add cold-start Section ZERO and trim CLAUDE.md to ~4KB（CLAUDE.md 改讀 current/STATE.md，七檔合一）
559f2e5 2026-06-08 20:07 change structure（DASHBOARD.md、gm.md 併入 STATE.md，路徑改為 saves/<run>/STATE.md，拿掉 current/）
e65f122 2026-06-11 22:24 update rules（validate-turn.sh 改路徑、加 validate-state.js schema 校驗、state-schema.md、check-clear.sh；CLAUDE.md 開局第 4 步跑校驗；新版仍是 if [ -f "$STATE" ] 才驗）
78bc4e2 2026-06-14 17:16 chore: prepare repo for public release
bdcbb2a 2026-06-14 17:18 fix: use $CLAUDE_PROJECT_DIR in hook paths（空 commit，無檔案變更）
存檔（saves/ 未進版控，本機讀取）：2026-06-07-bkn、2026-06-08-phi、2026-06-09-gsw；Hawkins 骰點見 saves/2026-06-08-phi/log/1998-99.md:33
-->
<!-- 改寫補充：原稿說加 hook 和拆掉 current/ 是「同一個晚上、不到一小時」，commit 顯示 6/7 晚上只把七檔併成 current/STATE.md（hook 照這個位置寫，當時是對的），拿掉 current/ 和 DASHBOARD.md 是隔天 6/8 20:07；失效期間是 6/8 晚上到 6/11 晚上，不是 6/7 到 6/11。原稿說 6/11 那筆 commit「刪掉 saves/2026-06-07-174406/」：saves/ 不進版控，查不到，拿掉。原稿「那幾天漏寫了幾次檔，自己手動補」查不到，拿掉。原稿稱修好後的守衛會「大喊」，實際新版仍在檔案不存在時跳過，照實寫。原稿 tags 的 react 與內容無關，拿掉。 -->

