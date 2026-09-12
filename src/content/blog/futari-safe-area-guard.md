---
title: "一道抓不到自己的守衛：iOS 瀏海底下的 sticky header"
pubDate: "2026-09-12"
tags: ["futari", "capacitor", "testing", "postmortem"]
draft: false
---
## 前言

帳號進入刪除倒數之後，畫面最上面會出現一條橫幅，上面那顆「取消刪除」是使用者把資料救回來的唯一入口。這週發現它在有瀏海的 iPhone 上按不到。整條橫幅被狀態列蓋在底下，時鐘正好壓在按鈕上。

修它本身不難。難的是我為了防止它再發生而寫的那道測試守衛，兩天後被發現有一個盲區，而且那個盲區正好是被我自己的修法製造出來的。

## 環境

* Next.js 16.2.4 + React 19.2.4（App Router）
* Tailwind CSS 4
* Capacitor 8.3.4，iOS 原生殼
* Vitest 4.1.5 + Testing Library 16.3.2
* 重現機種：有瀏海的 iPhone，`env(safe-area-inset-top)` 回 47px

## 誰該付那段 inset

這個站原本的慣例是「頁面自己的 header 吃掉 inset」。問題出在那條橫幅是由 dashboard layout 注入在 `{children}` 之上的。它一出現，它才是螢幕最頂端的元素，但它沒有繼承那個慣例，結果 inset 被下面的 header 付掉了，橫幅自己貼著螢幕頂端。同一個位置上的「殼層有新版本」通知也一樣。

規則收斂成一句話：**螢幕上最頂端的那個元素付 inset，它之後的一切從零開始。**

```css
:root {
  --safe-top: env(safe-area-inset-top, 0px);
}

.shell-top-strip {
  padding-top: max(var(--safe-top), 0.75rem);
}

.shell-top-strip ~ * {
  --safe-top: 0px;
}
```

關鍵在 `~ *` 那條。CSS custom property 會繼承，所以這一條同時蓋掉「第二條 strip」跟 `{children}` 裡的頁面 header，inset 只付一次、不會疊出兩段留白。頁面 header 全部改讀 `var(--safe-top)`，不再直接呼叫 `env()`。

## 眼睛看不到的東西，只能用測試守

這個 bug 在瀏覽器裡重現不出來，網址列會幫你把那 47px 擋掉。要看到它得進原生殼，而原生殼不會進 CI。

所以規則本身改用測試守：把 `globals.css` 裡那條 selector **讀出來**（不是在測試裡重抄一遍，重抄的話 CSS 改名字它不會壞），再對真實 render 的 DOM 跑「兩條 strip 都在／只有橫幅／只有通知／都沒有」四種組合，每一種都檢查 inset 恰好被付一次。

```tsx
const COLLAPSE_SELECTOR = '.shell-top-strip ~ *'

function paysInset(el: Element): boolean {
  return el.closest(COLLAPSE_SELECTOR) === null
}
```

外加一條白名單：除了那幾個 sticky header，其他 dashboard header 都不准偷偷把 `env()` 加回來。

## 守衛只看得到它問過的問題

兩天後，另一個位置出事：顯示「你正在看過去章節」的提示條是 `sticky top-0`，整條大約 35px，而瀏海 inset 是 47px。使用者一往下捲，它就 pin 進狀態列裡，連同「離開過去章節」的出口一起消失在時鐘後面。

那道守衛完全沒反應。原因很直接。白名單是以「誰呼叫了 `env()`」為軸建的，它只抓得到「多付了 inset」的 header。提示條從來沒呼叫過 `env()`，所以它一輩子都在守衛的視線外。

守衛要補上反方向的掃描：從 **版面位置** 出發，不是從 API 呼叫出發。每一個 `sticky top-0` / `fixed top-0`，要嘛處理 inset，要嘛列在白名單並寫明理由。

修那三個 sticky header 的時候有個細節值得記一下。其中兩個原本寫死 `pt-12`，也就是 48px，剛好比 iPhone 的 47px 多 1px，所以在現有機種上看起來完全正常。那是巧合不是設計。改成 `pt-[max(env(safe-area-inset-top),48px)]` 之後，換一個 inset 更深的機種也不會退化。

## 守衛自己的盲區

覆核的時候被指出：兩個 filter 都是對**整個檔案字串**發問的：「這個檔案裡有沒有 `sticky top-0`」、「這個檔案裡有沒有 `env(safe-area-inset-top)`」。

而我上一步的修法正好是「每個會 pin 的檔案都加上 `env()`」。

也就是說，那五個檔案在 merge 之後全部變成盲區，之後不管再長出什麼 pinned 元素都會直接過關。`RecordsList.tsx` 最危險：300 多行、已經有一個 sticky L1 header，下一個進來的直接繼承通行證。

我當下沒有修，只補了一段註解把這件事記下來。不是偷懶，是因為它不是一行改得完的：`RecordsList` 的 sticky wrapper 自己不付 inset，inset 是由它裡面的子元素付的。這是乾淨寫法：wrapper 負責 pin 跟鋪底色，底色要能一路鋪到瀏海底下；子元素負責 padding，把內容推出瀏海。如果改成逐字串檢查，這個正確的形狀會被報成「未處理」。我做了一個 prototype 去驗，它確實就卡在那個 wrapper 上。

真正需要的是第二個豁免類別，不是把 regex 寫得更嚴。

## 逐元素判定，跟兩類豁免

改完之後，掃描的單位從「一個檔案」變成「一個被釘住的元素」，只看那一串 class 有沒有付 inset。於是「沒付 inset 但沒錯」分成兩類，每一類都要自己寫理由：

```ts
/** 類別一：它會 pin，但永遠碰不到狀態列。
 *  它的 containing block 是某個內層 scroller，top-0 是那個盒子的上緣。 */
const NOT_UNDER_THE_STATUS_BAR: Exemption[] = [/* ... */]

/** 類別二：它碰得到狀態列，但 inset 由裡面的子元素付。 */
const INSET_PAID_BY_A_CHILD: Exemption[] = [/* ... */]
```

抓 class 字串那段我踩了一個坑，值得單獨講。直覺寫法是拿一段 regex 去掃整個檔案、把引號兩兩配對。**不要這樣做。** 程式碼裡任何一個單獨的 apostrophe —— 註解裡的 `don't` 就夠了 —— 會讓它後面所有的配對錯開一位。結果不是噴錯，是從那一行之後整個檔案靜默漏掉。

改成從 regex 命中的位置往前後擴展到最近的引號，就不依賴前文了：

```ts
function enclosingLiteral(source: string, from: number, to: number) {
  let start = from
  while (start > 0 && !QUOTE.test(source[start - 1])) start--
  let end = to
  while (end < source.length && !QUOTE.test(source[end])) end++
  return { text: source.slice(start, end), start }
}
```

另外加了兩條看起來多餘、但我認為值得的：

一是 tripwire，掃描器至少要找到東西：

```ts
it('finds the pinned elements at all', () => {
  expect(pinned.length).toBeGreaterThanOrEqual(EXEMPTIONS.length + 1)
})
```

沒有這條的話，哪天 regex 被改壞了，底下每一個 assertion 都會拿到空集合、然後全部通過。整份測試檔會變成綠燈的裝飾品。

二是防呆，豁免項如果已經對不上任何實際元素就報紅，逼人回來更新或刪掉。一份沒人會再讀的白名單，遲早會蓋住真的問題。

## 小結

我的結論是：這種只在原生殼重現的版面 bug，守衛要從**版面位置**出發（誰會被釘在最上面），不要從 **API 呼叫**出發（誰呼叫了 `env()`）。後者只抓得到你已經想到的那一半。

什麼情況下我會改變主意 —— 如果你的 app 只跑瀏覽器、沒有原生殼，這整篇可以跳過，網址列會幫你擋掉全部。

還沒解的兩件事：

提示條捲到頂的時候 inset 會被付兩次（它上面永遠有另一個 header），深色條會多長 37px。把殼層 strip 改成常駐置頂可以一次解掉，但 sticky 元素之間不會互相讓位，那條路要去量 strip 的動態高度，我還沒想好怎麼寫才不會更糟。

另一個是理論上的：如果之後引入 `clsx` 之類的 class helper，`clsx('sticky', 'top-0')` 這種寫法 regex 抓不到，因為它跨了兩個字串。目前這個 repo 沒用任何 class helper，所以不痛。我把它寫進 regex 的註解裡了 —— 這種洞的失敗模式是靜默，它不會自己開口說話。
