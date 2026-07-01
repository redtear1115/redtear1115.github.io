---
title: "同一個 bug 我修了三次，前兩次都在打空氣"
pubDate: "2026-05-25"
tags: ["nextjs", "postmortem"]
draft: false
---
你有沒有過那種，明明已經「修好」了、還很有自信地寫了 commit message，結果隔了幾小時又回來修同一個地方的經驗？我這四天經歷了三次——同一個 bug，三張臉，前兩張我都打偏。

先講開心的部分，因為後面就不開心了。

週五半夜我做了一件很爽的事：把整套上線分析（conversion analytics）一口氣灌進 Futari。從 landing 的 CTA、migrate 漏斗的 file / preview / cta、sign-in 帶著 `from` 和 anon-id 穿過 OAuth、到 setup 完成、第一筆手動記帳、CSV 匯入、夫妻互邀——整條使用者旅程的每個關鍵節點都埋了事件。十幾個 commit 串成一條漏斗，`v1.2.0` 出。那種「終於看得到使用者卡在哪一步」的感覺，真的很療癒。

隔天早上一醒來，先修剛上線的東西——PostHog 改走 managed reverse proxy（不然 ad blocker 會把事件擋掉，埋了等於沒埋）、Sentry 的 org slug 跟 project slug 接好、打開 logs。這些都很順。`v1.2.1`、`v1.2.2`。我心情很好。

然後我去碰 records 頁的篩選器。然後我就再也沒有好心情了。

問題長這樣：使用者在 FilterSheet 選「只看我付的」，按下**套用**，列表——完全沒反應。URL 不變、清單不變，像對著牆壁喊話。

**第一次，我以為是 React 沒重新 render。** 我給列表加了一個 `filterKey` 強迫 remount（#745）。看起來好了一點，至少在我的測試裡。我很滿意地關掉。

**第二次，我以為是 App Router 的 transition 被插隊。** `handleApplyFilter` 先 `router.replace`、緊接著一個 urgent 的 `setFilterOpen(false)`——我推論那個 urgent 更新搶在導航前面，新的 `?fPayer` 還沒落地就被打斷了。於是我把導航包進 `startTransition`（#752），寫了一段很有說服力的 commit message。又關掉。

兩次我都覺得自己抓到了。兩次我都錯了。

**第三次，我才看見真正的鬼。**

根因跟 filter 的序列化一點關係都沒有——我逐層驗過：FilterSheet 吐出 `payer: 'mine'`、`applyFilterToParams` 寫進 `fPayer`、`parseFilterFromSearchParams` 讀得回來，全對。鬼藏在更下面的地方：**history stack**。

FilterSheet 的背景遮罩為了讓 Android／瀏覽器的「上一頁」能關掉 sheet，用了 `useEscapeToClose`——它在 sheet 打開時 push 一個同網址的合成 history entry，關閉時呼叫 `window.history.back()`。而我的 `handleApplyFilter` 在同一個 tick 裡做了 `router.replace()` 加 `setFilterOpen(false)`。於是順序變成：replace 先寫好新網址，sheet 的 `history.back()` 隨後執行，**落在 replace 之後，把它整個還原回去**。`?fPayer` 一寫進去就被彈回原狀。

這下尷尬了。回頭看，#745 的 remount 跟 #752 的 startTransition **兩個都是誤診**。更難堪的是——`startTransition` 根本是個 no-op，因為 Next 16 的 app-router-instance 內部早就把 `router.replace` 的 dispatch 包在 transition 裡了。我等於拿一層它自己已經穿好的雨衣，又幫它套了一件，然後說「看，我修好了」。

真正的修法是：**把導航延後到那個合成 back 的 `popstate` 真的落地之後**，讓 replace 套用在我們已經回到的那個 entry 上，而不是被它撤銷。這裡還有一個更陰的細節——`history.back()` 是非同步的，連 `requestAnimationFrame` 跟 `setTimeout(0)` 都會搶在 `popstate` 前面開跑。只有老老實實去**監聽 `popstate` 事件**才可靠。我抽了一個 `runAfterSheetCloseBack(fn)` helper，把 filter 套用走這條路，配上一個「延後到 popstate、只觸發一次」的合約測試。在真的瀏覽器、真的 SheetFrame 上驗過，這次才是真的。

那天後半段還有一串「同一個敵人換一張臉」的延伸戰：套用後的圖表沒吃到 payer filter、daily trend 沒套上完整的結構化篩選、amount range 的上下界寫反了（min > max 直接產生 `BETWEEN 500 AND 100`，把清單默默清空）。一個一個收完，`v1.2.3`。

學到的（昂貴的）一課：**當一個 bug 你修了第二次還在復發，先停下來，不要再修第三個你猜的根因。** 你前面每一次「看起來好了」，都只是把真正的鬼往後推一格。我前兩刀都砍在它的影子上，commit message 寫得理直氣壯，其實連戰場都站錯。`router.replace` 跟一個合成的 `history.back()` 在同一個 tick 裡搶誰先誰後——這種事，你不在真瀏覽器裡盯著 `popstate` 看，是永遠想不出來的。

先不說了，我得去檢查還有沒有別的 sheet 也在偷偷彈我的網址。

*這段 code 寫於 2026 年 5 月 23 至 25 日，文章整理於 2026 年 5 月 25 日。*
