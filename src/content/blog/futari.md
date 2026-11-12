---
title: "我替香檳色的車調好了對比，香檳色卻從來沒有出現在畫面上"
pubDate: "2026-11-12"
tags: ["futari", "devlog", "design"]
draft: false
---
Futari 是給兩個人一起記生活帳的家計簿，有 iPhone App 也有網頁版。裡面有一頁叫愛物，記兩個人共同照顧的東西，車子是其中一種，加油、保養、停車費都掛在它底下。

5 月 5 日晚上十點，我和 agent 替車子多加了幾個欄位：年份、品牌、型號、起始里程，還有顏色。顏色做成一排八個小圓點，白、黑、銀、深灰、酒紅、深藍、棕，還有香檳。每個圓點背後有兩樣東西，一個英文名字，像 `black`、`dark_gray`、`champagne`，和一個色碼，例如香檳是 `#C8A97A`。點下去，存進資料庫的是名字。

到了要把顏色畫出來的地方，程式直接把這個名字交給瀏覽器當顏色用。

瀏覽器本來就認得一些顏色名字。`black`、`white`、`silver`、`brown` 都在它的清單上，所以選這四種，車子的色條會出現，看起來一切正常。`dark_gray`、`dark_red`、`dark_blue`、`champagne` 不在清單上，瀏覽器不認得，那一行就當作沒寫，也不會報錯。

就算是認得的那四種，畫出來的也不是我們挑的顏色。我們的白是帶一點米色的 `#F0EDE8`，瀏覽器的 `white` 是純白；我們的棕是偏咖啡的 `#7A5C3E`，瀏覽器的 `brown` 偏紅。八個圓點裡，沒有一個在畫面上是對的，只是有四個看起來像對的。

隔天凌晨十二點五十五分，agent 又調了一輪車子的色帶。淺色的車，字和圖示容易看不清楚，它在淺色底上加一層很淡的暗色，圖示的線條也加深。程式註解裡寫著這是為了哪兩種顏色：白色 `#F0EDE8`，還有香檳 `#C8A97A`。

可是資料庫裡存的不是色碼。這段為香檳調的對比，拿到手的永遠是 `champagne` 這個字，瀏覽器不認得，香檳色的車從頭到尾沒有出現過香檳色。調整對比時參考的是圓點上的色碼，沒有人去看資料庫裡實際存了什麼。

十幾分鐘後，滿版的色帶改成左側一條細色條，問題跟著換了個地方，照樣藏著。早上十點半，我替 0.6.0 打上版號，這段程式也在裡面。

5 月 6 日中午，我想把那條細色條改成把整台車框起來的外框。改的時候我看出來，名字被直接當成顏色在用。提交說明把這件事記在我的回饋底下，寫得很直白：`black` 剛好是瀏覽器認得的顏色，所以看起來能動，`dark_gray`、`champagne` 不是，會默默畫成預設的樣子。

修法是我開口決定的：「把資料庫改成存色碼吧，搞不好之後還想改色盤。」選色那排圓點改存色碼；畫顏色前多一道轉換，空的給預設色，舊的名字查表換成色碼，已經是色碼的直接用；再寫一支轉換程式，把資料庫裡的舊名字一次換掉，跑幾次結果都一樣。這支先在開發環境跑過，正式資料庫等我說好再跑。下午一點零八分，這些和新的外框一起提交。

從加上顏色到看出問題，大概十五個小時。這段時間裡，四種顏色畫不出來，另外四種畫錯了色，畫面上沒有任何一處看起來壞掉。深灰、酒紅、深藍、香檳的車只是沒有自己的顏色，畫面看起來還是完整的。

我在意的是凌晨那一段。agent 很認真地替香檳色算對比，那一輪修改處理的，是一個畫面上從來沒出現過的顏色。那時只要打開一台香檳色的車，看一眼就好。

Futari 的程式碼在 [GitHub](https://github.com/redtear1115/oikos)，iPhone 和網頁版都在[作品集](https://southern-light.dev/works/)裡。

先不說了，我得去把車子的顏色改成香檳，再打開來看一次。

*這段 code 寫於 2026 年 5 月 5 日至 6 日，文章整理於 2026 年 11 月。*

<!-- source: oikos（FREEDOMPJ2025/futari），台北時間；改寫自原稿「保險忘了帶編輯筆、車色其實是字串騙局」，只寫車色那段 -->
<!-- 012a5d6 2026-05-05 22:02 car extended fields implementation plan；aedb534 22:03 migrate；05b74c9 22:17 color picker（CAR_COLORS 8 色 key＋hex，onClick setColor(c.key)），Co-Authored-By Claude Sonnet 4.6 -->
<!-- 6a09c2d 2026-05-06 00:55 unify car-color band；carColor.tsx 註解：pale colors (#F0EDE8 white, #C8A97A champagne)；swatch = color ?? FALLBACK_CAR_COLOR -->
<!-- 3454593 01:11、6fca8f1 01:12 改成左側 accent stripe -->
<!-- tag v0.6.0（68e9e5a 2026-05-06 10:36）含 05b74c9，不含 44fdedb；v0.7.0（2026-05-07 00:30）含修正 -->
<!-- 44fdedb 2026-05-06 13:08 ui(car): wrapping color border on AssetHero + store color as hex：User feedback 三點，含「把 db 改成存 hex 吧 搞不好之後還想要改色盤」；resolveCarColor；drizzle/0013_car_color_to_hex.sql idempotent，Applied to dev; prod waits for user GO -->
<!-- CSS named colors：white #FFFFFF、black #000000、silver #C0C0C0、brown #A52A2A；dark_gray／dark_red／dark_blue／champagne 非合法色名 -->
<!-- 改寫修正：原稿說「在線上跑了好一陣子」，實際從 05-05 22:17 到 05-06 13:08 約 15 小時（含 v0.6.0 tag）；保險編輯筆、底部儲存鍵、標題字體等段落不寫 -->

<!-- Ray 11/07 答：名字被當成顏色用，是他先發現的。 -->
<!-- Ray 11/07 核准。 -->
<!-- Co-authored-by: Claude <claude@southern-light.dev> -->

