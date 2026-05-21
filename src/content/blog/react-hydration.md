---
title: "我為了消滅一個閃爍，掉進了 React hydration 的兔子洞"
pubDate: "2026-05-21"
tags: ["futari", "react", "hydration", "ssr", "nextjs", "localstorage", "cookies", "sentry", "posthog", "observability", "release"]
draft: false
---
故事的起點是一個極其無辜的需求——「讓使用者收合的卡片，下次打開還是收合的」。BalanceHero 可以收起來、MonthlyStatsView 可以摺疊，使用者收好了，重新整理一下又全部展開——這很煩。我心想，這不就是一個 `localStorage.getItem` 的事嗎？

於是我寫了那個所有人都寫過的 useState lazy initializer：

```ts
const [collapsed, setCollapsed] = useState(() => localStorage.getItem('collapsed') === 'true');
```

然後我的 production console 開始噴 **React error #418**。歡迎來到 SSR 的世界——這裡你的直覺都是錯的。

## 第一個坑：localStorage 在 server 上根本不存在

問題其實 commit message 裡那個 Claude 幫我寫得很清楚（罕見地比我自己清醒）——**server 看不到 localStorage**。

所以發生了這件事：server 渲染的時候 `localStorage` 是 undefined、走 default value（展開）；client 第一次 render 的時候讀到 localStorage 裡存的值（收合）。**對任何曾經收合過卡片的使用者來說——server 給的樹是「展開」、client 第一次 render 是「收合」，兩棵樹對不起來。** React 看到 SSR HTML 跟 client 第一次 render 不一致，直接丟 hydration mismatch（#418）。

這就是 SSR 的殘酷之處——**任何「只有瀏覽器知道的狀態」（localStorage、window 尺寸、`Date.now()`、`Math.random()`），放進首次 render 都是地雷。** server 不知道、client 知道，兩邊一定吵架。

而最諷刺的是——我用 localStorage 的初衷是「避免 flash」（先前 #726 那版會先閃一下展開狀態再跳回收合）。**我為了消滅 flash 引入 localStorage，結果 localStorage 引發了 hydration mismatch——而 hydration mismatch 的後果之一，就是 React 把整棵樹丟掉重畫，造成更大的 flash。** 我繞了一圈回到原點，還多帶了一個 console error。

## 解法：把「server 讀得到」的偏好搬進 cookie

關鍵轉念是——這些 UI 偏好需要在「**server 渲染的那一刻就被知道**」。localStorage 做不到，但有個東西天生就會跟著 request 一起送到 server：**cookie**。

所以我把這些 SSR-readable 的 UI 偏好全搬進 cookie：

- **server component 讀 cookie**、把初始狀態當 prop 傳下去
- 因為 server 跟 client 第一次 render 讀的是同一個 cookie 值——**兩邊一致，沒有 mismatch、也沒有 flash**
- client 只在使用者 toggle 的時候**寫 cookie**

涵蓋三個地方：MonthlyStatsView 的收合、BalanceHero 的收合 + include-pending toggle、ContextStrip 的「對方已離開」dismiss + 旅行收合。共用邏輯收進一個 `lib/uiPrefsCookie.ts`，放 cookie 名稱 + read/write helper。

代價是——老用戶 localStorage 裡那批偏好會被**重置一次**（改從 cookie 讀），之後就正常持久化了。一次性的小痛，換掉一個永久的 console error，值得。

**心法是：UI 偏好分兩種——「server 渲染前就要知道的」（影響首次 HTML）放 cookie；「純 client、晚一點知道也無所謂的」才放 localStorage。** 我之前把這兩種混為一談，以為「持久化用戶偏好」就只有一種做法。

## 順手清掉的另一個 hydration 親戚：Esc 關閉

同一天還修了一個遠房親戚——`useEscapeToClose`。這個 hook 讓使用者按 Esc 關閉 sheet，背後是 `pushState` 推一個合成的 history entry、關閉時 `history.back()` 收掉。

問題出在 **keyed remount**——AssetSheet 的 body 在 TypePicker 換 type 的時候會整個 remount（因為 key 變了）。這時候舊 instance 還在 `open === true` 的狀態下被 unmount，cleanup 裡的 `history.back()` 就跟新 instance 的 `pushState` **打架**——掉了一個 history entry，導致使用者之後按「上一頁」不是關閉 sheet，而是直接離開頁面。

修法是用一個「render 時寫入的 ref」追蹤最新的 `open`，**只在 sheet 真的要關（`open` 變 false）的時候才收掉合成 entry**；key-change remount 時新 instance 自己再 push 一個。

這兩個 bug 本質一樣——**都是「元件生命週期的時機」跟「瀏覽器/平台狀態」對不上**。SSR 的 hydration、history API 的 race，都是同一類「你以為的執行順序，不是真實的執行順序」。

## 副線：Futari 終於長出眼睛了

這天還做了一件其實更重要、但沒什麼戲劇性的事——接上 **Sentry**（error tracking）跟 **PostHog**（analytics）。在這之前，Futari 在 production 出錯我**完全瞎**——靠用戶（也就是我老婆）跟我說「欸這個怪怪的」。React #418 這種 error 之所以被我抓到，根本是運氣。

接上 Sentry 之後，error 會主動回報；PostHog 讓我看得到「哪個功能真的有人用」。然後我立刻踩到第一個新手坑——**local dev 的事件跟 error 全送進了 production 的 project**。我在本機亂測的假資料污染了真實分析。

修法是把兩者都 gate 在 `NODE_ENV === 'production'` 才送出。**觀測性工具自己也需要被觀測——「我送出去的資料乾不乾淨」這件事，第一天就該想到。** 這顆 fix 進了 v1.1.8，也就是現在的 latest released。

## 收尾

這天兩個 release（v1.1.7 / v1.1.8）、一個 hydration 兔子洞、一個 history race、外加給 Futari 裝上第一雙眼睛。回頭看，所有 bug 的共同主題是——**我對「東西何時、在哪裡執行」的假設太樂觀了**。server 沒有 localStorage、cleanup 會跟 mount 賽跑、local dev 會偷偷連 prod。

唯一值得欣慰的是——以後這種 error 我不用等老婆跟我說了，Sentry 會先告訴我。雖然這也意味著，我再也沒有「我不知道它壞了」這個藉口。

這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。
