---
title: "Futari 的 iOS 版終於上架了——然後我在同一個深夜 merge 了 35 條 PR"
pubDate: "2026-09-14"
tags: ["futari", "devlog", "capacitor", "accessibility"]
draft: false
---
`1.5.1 (1)`，2026-06-11 上傳，2026-09-09 過期。
`1.5.5 (3)`，2026-09-11 上傳，今天通過。

中間隔了三個月又四天，而那三個月我幾乎沒碰它。白天的力氣都給了公司那套系統，回到家剩下的通常只夠躺著——side project 最真實的成本從來不是技術難度，是下班之後還有沒有電。

等我終於重新坐下來要送審，才發現那三個月裡有三件事一直是壞的，而且都壞得很安靜。

[Futari · 雙人記帳，現在在 App Store 上](https://apps.apple.com/tw/app/futari-%E9%9B%99%E4%BA%BA%E8%A8%98%E5%B8%B3/id6779264784)。4.8 MB——因為它是 Capacitor 薄殼，`server.url` 指著線上網站，整個 app 裡沒有一行打包進去的 JS。

## 我沒在看它的那三個月，有三件事一直是壞的

第一件：**TestFlight 的 build 會過期**。上傳後 90 天，不是「不能給測試者裝」而已，是連送審都不能用。我 6 月 11 日傳了 `1.5.1 (1)` 卡位，想說 metadata 慢慢填，結果 9 月 10 日打算送審時打開 App Store Connect，那個版本底下一個可用的 build 都沒有。

第二件：iOS 從 7 月 12 日升上 Capacitor 8 之後，**從來沒有成功編譯過**。薄殼平常不需要重 build iOS，我又整整兩個月沒打開 Xcode，所以這件事一路潛伏到我要重新 archive 才炸出來：

```text
Failed to resolve dependencies Dependencies could not be resolved because
'apple-sign-in' depends on 'capacitor-swift-pm' 7.0.0..<8.0.0 and
'push-notifications' depends on 'capacitor-swift-pm' 8.0.0..<9.0.0.
```

`@capacitor-community/apple-sign-in` 最新版停在 7.1.0，宣告 `capacitor-swift-pm` 要 `>=7.0.0 <8.0.0`；Capacitor CLI 產出的 `CapApp-SPM/Package.swift` 則 pin `exact: "8.3.4"`。兩個範圍完全不相交，`xcodebuild` 連 `-list` 都跑不起來。用 `patch-package` 把上游那一行的版本範圍放寬到 `<9.0.0` 就解決了——一行 diff，但你得先有機會看到這個錯誤才知道要改哪裡。

第三件最陰險：`App.entitlements` 從建檔起就沒有 `com.apple.developer.applesignin`。意思是**原生 Apple 登入在我傳過的每一個 build 上都從來沒有可用過**。沒有 crash、沒有紅字，只是那顆按鈕按下去不會彈出 Apple 的 sheet。Guideline 4.8 明寫有第三方登入就得有 Apple 登入，所以這格沒補回去，送幾次都是白送。補上 entitlement、重傳成 `1.5.5 (3)`。

退件確實來了一次，但不是因為這個——Apple 掛在 Guideline 2.1 底下，要我錄一段示範影片，講清楚 app 的特色跟支援哪些登入方式。看起來這比較像新 app 的慣例，第一次送審被要求補件說明的好像不少。錄完、寫清楚、回覆，就過了。

三件事的共同點：它們都不會在日常開發裡發出任何聲音。薄殼架構的好處是網站改完 Vercel 一部署就生效，壞處是原生那一側可以安安靜靜地腐爛兩個月，而且腐爛的時候你正忙著別的事，不會有任何東西提醒你。現在這件事交給 CI 了——動到 `ios/**` 或 `patches/**` 的 PR 會跑一次不簽章的 archive，另外每月 cron 兜底。

## 上架當天晚上，我沒有慶祝，我在 merge

說真的，我本來以為今天會是輕鬆的一天。

結果從 22:00 到隔天 01:26，這三個半小時裡進 `main` 的東西是：**35 條 PR、52 張 issue 關掉、240 個檔案、+9202 / -1957**。早上才發了 v1.5.13，晚上這一批已經在排 v1.5.14 了。

這些 issue 不是使用者報的，是一輪 design critique sweep 掃出來的——一次把 landing、記帳 sheet、設定頁、旅行頁、月回顧、onboarding 全部對著 `DESIGN.md` 逐條比對。掃完的結果就是上面那五十幾張。一張一張做太慢，所以中途我把流程本身寫成了一個 skill（`ship-issue`），讓協調者只在三個關卡找我：確認 intent、選方案、驗收 PR，中間交給 executor 跟 verifier 跑。它的硬性約束只有一條——**做到開好 PR 就停，不 merge**。merge 這件事我要自己按。

## 25 個地方在請求一個根本沒載入的字重

今晚最讓我意外的一張是 #1167。

`app/fonts` 只載了 400 和 500 兩個字重，但程式碼裡有 25 個地方在要 600，另外還有 10 個寫成 `sel ? 600 : 500`、4 個寫成 `600 : 400`，`ActiveTripBanner` 甚至在要 300。瀏覽器遇到沒載入的字重不會報錯，它會**自己合成一個**——把既有的字面拉粗或拉細。結果就是整個 app 有一大半的「粗體」是假的，而且假得很微妙：筆畫粗細不均、邊緣糊掉，但單獨看又說不上哪裡怪。

修法是把那 25 個站點壓回 500（`font-semibold` → `font-medium`），`sel ? 600 : 500` 的十處直接固定成 500——選取態原本就有底色、框線跟顏色三重區別，不差那個字重。然後在 `body` 上加 `font-synthesis-weight: none`，讓以後再漏就直接看得出來。刻意不用 `font-synthesis` 的 shorthand，因為 Fraunces 沒有 italic face，migrate 跟 use-case 那些斜體 serif 還得靠合成 oblique 活著。

最後補了一支 `tests/font-weight-loaded.test.ts`：解析 `app/fonts` 實際載了哪些字重，然後掃 `app/`、`components/`、`lib/` 有沒有人在要別的。這種 bug 靠眼睛是抓不到的。

## 剩下的大半個晚上都在 a11y

點擊區、焦點、播報，三件事輪流出現在今晚每一張 issue 裡。

`.oik-switch` 的軌道是 44×26，橫向夠了但縱向只有 26px。修法不是把它變大——外觀不能動——而是掛一個置中、高度 `var(--control-md)` 的透明 `::before`，上下各外擴 9px，看起來一模一樣但手指按得到。

焦點那組更麻煩一點：sheet 關掉之後焦點會掉回 `body`，鍵盤使用者等於被丟到頁面最上面重來；關閉的 sheet 還留在 tab order 裡，Tab 會走進一個看不見的東西。所以 focus trap 從「單一 trap」改成 stack、`ConfirmModal` portal 到 `body`、關閉時整個移出 DOM，關掉之後焦點送回原本那顆觸發鍵。還有 `LeaveGroupFlow` 換步驟時要移焦點、radio 要吃方向鍵、錯誤要用 `role="alert"` 播報出來而不是只是變紅。

順手也修了兩個 open redirect（#1214，security review 撈出來的，不是這次引入的）：iOS 原生 Apple 登入的 `?next=` 沒驗證就直接拼接，`next=@evil.com/x` 會把人導去 evil.com；Android deep link 那條只比對 scheme 就 first-match replace。現在兩條都走 `lib/auth/nativeRedirect.ts`，`next` 比照 `/auth/callback` 的規則並要求同源，deep link 必須長成 `<scheme>://login-callback/auth/callback?…`，不合就忽略——注意是忽略，不是中止，不然使用者進行到一半的登入會被一條亂打的 deep link 打斷。

## 82 個錯誤碼，和一條在 main 上紅燈的 guard

今晚範圍最大的一張其實是 #1156，77 個檔案。

`actions/` 底下的 server action 一直是直接 `throw new Error('找不到家計簿')` 這種寫法，而 `describeError` 拿到之後原樣渲染 `e.message`。意思是**只要出錯，英文、日文、簡中的使用者都會看到一句繁體中文**。介面四語做得再齊，一失敗就破功。

改法是讓 action 丟代碼而不是句子：新增 `lib/action-errors.ts` 的 `actionError(code, params)`，代碼就是新的 `errors.actions` 命名空間的 key——82 個 key、四種語言，而且 `ActionErrorCode` 是從 zh-TW 推導出來的，漏翻一個就 tsc 不過。參數用 `code?row=3` 這種形式跟著走。`describeError` 從此對任何不認識的東西都回 fallback，再也不會吐 `e.message`。

有個地方差點被這次改動弄壞：`AddSheet` 跟 `IncomeSheet` 判斷 race 的方式是去比對渲染出來的訊息有沒有包含「待確認…」。訊息一旦開始翻譯，這個比對就會安靜地失效——改成比對代碼才活下來。

然後我加了一條 guard test，禁止 `actions/` 裡的 throw 出現中日韓字面。

**那條 guard 當晚就抓到人了，抓到的是我自己。** #1210 在 month summary loader 新增了一個 `throw new Error('找不到家計簿')`，#1213 把它改成 `actionError`——但我 merge #1213 的時候，用的是那個修正之前的舊 head。兩條 PR 各自都是綠的，合進 `main` 之後 guard 紅燈。同一晚 #1216 也一樣，一個我自己拍板的 hover 底線改動是 merge 之後才 push 上去的。

所以隔天早上多了一條 `fix: 補回 #1213 與 #1216 merge 時遺漏的兩個修正`，兩個檔案、各一行。35 條 PR 平行開著的時候，「這條 PR 是綠的」跟「我 merge 進去的那個 commit 是綠的」不是同一件事——`ship-issue` 的 §8 現在多了一句「merge 後比對 head」，就是為了這個。

## 收尾

今天這篇本來應該只有一句話：Futari 的 iOS 版上架了。三個月的擱置，兩個晚上的實作，一次要錄影片的退件，一個從建檔起就缺的 entitlement。

但上架那一刻其實什麼都沒改變。使用者看到的還是同一個網站，因為殼是薄的；而我在慶祝的同一個深夜，發現自己有 25 個地方在用假粗體、一整套只有繁中的錯誤訊息，還有一條被我自己 merge 錯 head 的 guard。上架不是終點線，它只是第一次有陌生人會按下那顆下載鍵。

先不說了，我得去看 Android 那邊的封閉測試湊到幾個人了——Google 對個人開發者的門檻是 12 名測試者連續跑 14 天，上次看是 9 個。iOS 這關過了，另一半卡的不是程式，是找人。

*這一晚的 commit 落在 2026 年 9 月 14 日深夜到 15 日凌晨，文章整理於同日清晨。*

---

<!-- source: oikos | last_sha: afa3205 -->
<!-- commits:
afa3205 (2026-09-15) Merge pull request #1247 from redtear1115/fix/1242-focus-announce-followups
8c48d18 (2026-09-14) fix(i18n): server action errors throw codes, describeError localizes them (#1156)
1d5eac7 (2026-09-14) fix: 補回 #1213 與 #1216 merge 時遺漏的兩個修正
a11521a (2026-09-15) fix(design): 字重收斂到 400/500，關閉合成粗體 (#1167)
ce664a3 (2026-09-15) fix(a11y): Switch 以透明 ::before 擴張點擊區至 44px，外觀不變 (#1227)
5fbcd72 (2026-09-14) fix(sign-in): 原生登入回跳改用當下 origin，並補上兩個 open redirect (#1214)
aa102ed (2026-09-14) chore(skills): 新增 ship-issue 協調者 skill（由 #1177 試跑歸納）
7ac8cce (2026-09-11) chore(ios): bump build number to 1.5.5 (3) (#986)
7557109 (2026-09-11) fix(ios): 還原 Sign in with Apple 的 entitlement —— 原生登入從未在任何 TestFlight build 可用 (#985)
-->

