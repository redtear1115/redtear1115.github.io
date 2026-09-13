---
title: "我只是想確認一個數字，結果撈出一個躺了四個月、一次都沒送出去的事件"
pubDate: "2026-09-11"
tags: ["futari", "observability", "nextjs", "postmortem"]
draft: false
---
說真的，我本來只是想確認一個數字。

回溯 120 天的資料顯示：25 個人建立了群組，只有 6 個人按過「複製邀請連結」或「分享」，剩下 18 個人——72%——連試都沒試就按了「稍後再邀請」。如果這個數字是真的，那代表邀請這一步在產品上是失敗的。

所以我打算把它從 autocapture 反推改成具名事件，好好追蹤。結果埋到一半，發現有個四個月前就加進去的事件，在 PostHog 裡一次都沒有出現過。

## 那個 72% 是怎麼算出來的

先講它的來歷：那個數字是靠 autocapture 的 `$el_text` 反推的。也就是說，它比對的是按鈕上的**中文字串**。

這個做法能用，但它有兩個問題。文案改一個字它就斷掉，而且它只涵蓋 zh-TW 的使用者，其他三個語系完全不在統計裡。拿來一次性看個大概可以，拿來當長期追蹤的基礎不行。

## 真相：init 還沒跑完，事件就被丟掉了

要換成具名事件，第一步是去看現有的幾個事件長什麼樣。然後就發現 `invite_link_opened` 從加進去之後，PostHog 裡一筆都沒有。

根因在 React 的 effect 執行順序。`PostHogProvider` 的 `posthog.init()` 寫在 `useEffect` 裡，而 effect 是**由子到父**執行的——子元件 on-mount 呼叫的 `track()` 會比父層的 `init()` 早跑到。

而 `posthog.capture()` 打在一個還沒初始化的 instance 上，會靜默丟棄。不噴錯、不警告、不回傳任何東西。

這是這整篇的主題：**埋點這一層的失敗，本質上就是安靜的。** 沒有使用者會回報「我剛剛那個動作沒有被記錄到」，也沒有 error boundary 會接到它。它只會讓你在四個月後看著一個空的圖表，然後以為使用者沒做那件事。

## 排隊，然後由 provider 顯式 flush

修法是在 `track()` 裡加一個記憶體內的 queue，`init()` 跑完之前事件一律入列：

```ts
export function track(event: string, properties?: Record<string, unknown>): void {
  if (!POSTHOG_ENABLED) return

  if (!initialized) {
    queue.push({ event, properties })
    if (queue.length > MAX_QUEUE_SIZE) queue.shift()
    return
  }

  posthog.capture(event, properties)
}
```

上限 50 筆，滿了丟最舊的。設上限不是因為預期會塞爆，而是為了把最壞情況關起來：如果 `init()` 永遠不會成功（例如擋追蹤的外掛把 proxy 請求砍掉），這個 queue 就會無限長大。50 筆把它鎖在一個對記憶體無所謂的數字上。

沒有設 timeout 或過期。queue 的壽命等於這個分頁的壽命，而上限已經把最壞情況框住了，加一個計時器只是多一個會壞的零件。

比較值得講的是 flush 怎麼觸發。我**沒有**讓 `track.ts` 自己去偵測 PostHog 好了沒——不 polling `__loaded`，也不掛 init 的 `loaded` callback——而是由 `PostHogProvider` 顯式呼叫 `flushQueue()`。理由是順序保證：自己偵測的話，「什麼時候 flush」變成一個你控制不了的時間點；顯式呼叫的話，它就是程式碼裡的某一行，你看得到它在哪、在什麼之後。

## flush 的位置比 flush 本身難

這是整張票我花最久的地方。

`flushQueue()` 必須跑在 `posthog.init()` 之後，這很直覺。但它還必須跑在 `posthog.register({ platform, is_native })` 之後——這條就不直覺了。

`register()` 註冊的是 super properties，會自動掛在**之後**每一個事件上。如果先 flush 再 register，那些排隊的事件會順利送出去，但身上少了 `platform` 這個維度。

而那比事件完全消失更糟。事件消失的時候，圖表是空的，你會注意到；事件送出去但缺一個維度的時候，圖表是滿的、看起來一切正常，只是你之後所有按平台切的分析都會少一塊，而且你不知道少在哪。**它看起來像修好了。**

這個順序要求連帶改了 provider 裡一段原本沒問題的程式碼。原本寫的是「`detectPlatform()` 回 null 就整個 effect return」，這樣的話平台偵測失敗的那些 page load，`flushQueue()` 根本跑不到。改成條件式，讓 flush 無論如何都會執行：

```tsx
const platform = detectPlatform()
if (platform) {
  posthog.register({ platform, is_native: isNativeApp(platform) })
}

flushQueue()
```

差別只是一個 early return 變成一個 if 區塊。但前者會讓修好的東西在某些情況下又壞掉，而且一樣是安靜地壞。

## 順手拆掉一個循環 import

改完之後跑出一個循環：`providers.tsx` 現在需要 `track.ts` 的 `flushQueue()`，而 `track.ts` 一直都需要 `providers.tsx` 的 `POSTHOG_ENABLED`。

實務上這個循環是安全的——雙方都只在函式體內取用對方的 export，模組頂層沒有同步求值。build 過、測試過。

但我還是把它拆了。因為這是 analytics 層，而這一層的失敗本質上就是靜默的，而這張票修的正好是一個躺了四個月沒人發現的靜默丟棄。在這個位置留一個「目前安全，但 bundler 或載入順序一改就可能 TDZ」的循環，跟這張票的用意是相反的。

做法是把常數抽到 `lib/analytics/enabled.ts`，一個零 import 的葉模組，結構上不可能參與循環。三個 importer 一起改指向新位置，**不留 re-export**。re-export 會讓「正本在哪」變模糊，而且 `export { X } from` 不建立 local binding，providers 自己還是得 import 一次，等於沒解決。

## 一個布林值會把兩群人壓成一群

回到原本要埋的五個事件。其中 `invite_skipped` 帶一個 `attempted` 屬性，我把它寫成三態而不是布林：

```ts
attempted: 'none' | 'failed' | 'sent'
```

為什麼不用 `true` / `false`？因為「從來沒試過」跟「試了但 clipboard 壞掉」是完全不同的兩群人。一個是不想邀請，一個是**想邀請但被我們自己的產品擋住了**。壓成同一個 `false`，得到的結論會是「72% 的人不想邀請伴侶」，而其中有一部分，其實是我們弄壞的。這個差別不該靠事後跨事件 join 去還原，它應該在資料產生的當下就沒有歧義。

而 `'failed'` 這個值不是假設出來的。寫 `invite_copy_failed` 的時候才發現 `handleCopy` 根本沒有 try/catch——Clipboard API 在非安全 context、或者權限被拒的時候會 reject，原本的寫法會變成一個 unhandled promise rejection：沒有 toast、沒有錯誤提示、畫面什麼都不會動。使用者按了「複製」，然後什麼事都沒發生，他不會知道是失敗了還是成功了。又是一個安靜的失敗，而且如果不修它，那些人就會被統計成「連試都沒試」。

（`'sent'` 只表示東西離開了畫面：複製了、分享了、QR 顯示了。它不表示對方真的收到。）

## 收尾

我的結論是：**不要用 autocapture 反推漏斗。** 它依賴 UI 文字，而 UI 文字是會改的、而且是分語系的。要長期追蹤就埋具名事件，當下多花半小時，之後省掉「這個數字還能不能信」的反覆懷疑。

什麼情況下我會改變主意：如果只是想在改版前後看一眼大概的量體、看完就丟，autocapture 快得多，不用為了一次性的問題去動程式碼。

還沒解的是 `invite_created` 的語意錯置。它是在**建立群組**的當下送出的，不是在真的送出邀請的時候。改它的語意會造成歷史資料斷層——舊資料跟新資料代表不同的事情，但名字一樣，這比現在的錯置更難處理。我還在想是要改名重埋、還是留著它並在旁邊補一個正確的。

最後提醒自己一件事：這次能發現那個四個月的丟棄，純粹是因為我剛好去翻了現有事件。沒有任何東西通知我。我到現在還是沒有一個機制，能在「某個事件突然不再進來」的時候告訴我。

先不說了，我得去把另外四個事件也一個一個打開來看，確認它們真的有在送。

*這段 code 寫於 2026 年 9 月 13 日，文章整理於同一天。*
