---
title: "我寫了一篇文章警告大家別忘記 await——然後我忘了 await"
pubDate: "2026-05-20"
tags: ["futari", "typescript", "nextjs", "design-system", "accessibility", "seo", "devlog"]
draft: false
---
前幾天我才寫了一篇短文，講「忘記 `await` 的 server action 會讓 balance 比真實資料早一步出去」——還煞有介事地下了個結論：「TypeScript 不會幫你抓忘記 await，丟掉 Promise 它覺得你是故意的。」結果這天 `grep` trip query——`listAllTrips`、`listActiveTrips`、`listTripRecords` **三個 function 全部忘了 await**。

我寫文章警告全世界別踩的坑，我自己踩了。而且踩了三次。在三個不同的 function 裡。

## 先講這個丟臉的 bug

trip query 是讀取路徑——`/trips` 頁列出所有旅行、active trip badge、trip detail 的 record list 都靠它。三個 query function 內部都 `await db.select()...` 沒問題——**問題在 wrapper**。我有一層 helper 包了 epoch 過濾，wrapper 寫成：

```ts
return queryTripsInEpoch(groupId, epochId);  // 少了 await
```

`queryTripsInEpoch` 回傳 `Promise<Trip[]>`，wrapper 沒 await 就 return——TypeScript 不抱怨，因為 return type 推導成 `Promise<Trip[]>` 剛好對。**型別是對的，行為是錯的。** Component 拿到一個還沒 resolve 的 Promise、`.map()` 一個 pending promise、畫面空白。

修法就是補三個 await。但真正的修法是——我**早該**在前一篇文章寫完就去 enable `@typescript-eslint/no-floating-promises`。我寫了教訓、沒執行教訓。這比 bug 本身更值得記下來——**知道一個 best practice 跟在 CI 裡強制它，中間隔著一個「我下次會記得」的謊言。**

## Design System——把剩下的 raw primitive 趕盡殺絕

前一天 Phase 0 做完 Button / TextInput / Sheet，這天是 adoption 收尾——把 codebase 裡**還在用 raw `<button>` / `<input>` 的地方全部 migrate**。FilterSheet 是最後一個釘子戶（它的 filter chip 結構特殊，當初想偷懶跳過）。

順手做了三件「token 化」的事：

**Decimal font size → text scale token**——我 codebase 裡有 `text-[13px]`、`text-[15px]`、`text-[17px]` 這種**奇數 px 的 arbitrary font size**散落各處。每一個都是某次「差一點點」的微調留下的。全部換成 text scale token（`text-sm` / `text-base` / 自訂 scale）——視覺上幾乎沒差，但**下次要全站改字級只動 token 一個地方**。

**Chart palette 搬家**——`MonthlyStatsBars` 的顏色之前 hardcode 在 component 裡，搬進 `lib/chartPalette.ts`。理由是 donut chart 跟 bar chart 應該共用同一個 source of truth——不然同一個 asset 在兩張圖會是兩個顏色，用戶會以為是 bug。

**Dashboard.tsx 拆 sub-component**——前一天我才把它的 state 收進 `useReducer`，這天把那個還是太大的 component 拆成幾個 sub-component。**先理順 state、再拆結構**——順序很重要，state 沒理清就拆，只會拆出一堆 props drilling。

## UX polish——魔鬼在 64 像素裡

這天有三個小到容易被忽略、但對 mobile-first PWA 超有感的修正：

**BottomNav 加高到 64px**——之前的 bottom nav 高度不夠，touch target 太小，手指粗一點就誤觸隔壁 tab。64px 是 iOS HIG 跟 Material 都推薦的 comfortable touch target 下限。**這種東西在 desktop dev 用滑鼠測永遠測不出來**——要真的拿手機點才會發現「我怎麼老是點錯」。

**Tab switch loading overlay**——切 tab 的時候如果 server component 還在 fetch，畫面會卡一下白屏。加一個 loading overlay 把這個「卡頓感」變成「明確的 loading 狀態」——**同樣的等待時間，有 loading indicator 的體感快一倍**，這是經典的 perceived performance。

**Realtime partner toast + AmountInput cursor fix**——伴侶在另一台手機記了一筆，你這邊跳一個 toast「對方剛記了一筆 NT$XXX」——這是 Futari 兩人協作的核心體感。AmountInput 的 cursor fix 是個煩人 bug——輸入金額時 cursor 會跳到開頭（因為我每次 keystroke 重新 format 數字、重設了 input value、cursor 跟著歸零）。修法是 format 之後手動把 cursor 設回原位。**金額輸入框是記帳 app 用最多次的元件，這個 bug 每天折磨用戶幾十次。**

## SEO 收尾——JSON-LD 不要長兩份

前一天鋪了一堆 JSON-LD，這天發現一個問題——**同一頁有兩份重疊的 schema**。我在 layout 放了一份 Organization schema、又在 page 放了一份，Google 看到會困惑（甚至可能判定 spam）。

修法是 dedup + 建 `@id` graph——讓多個 schema 用 `@id` 互相 reference 而不是各自重複宣告。`BreadcrumbList` reference `WebPage`、`WebPage` reference `Organization`——一個乾淨的 graph 而不是三坨各自為政的 JSON。順手修 en description 長度（超過 SERP truncation）、HowTo schema 加 anchor。

另外設計了一張新的 social share OG image（1200×630），還 localize 成 en / ja 版本——之前分享 Futari 連結到 Slack / Line，預覽圖是空白的（OG image 根本沒設）。**第一印象是那張 1200×630**——做了三天 SEO 結果分享出去是空白圖，等於白做。

## 一個關於 doc 的小堅持

這天還做了 research docs audit——把 `docs/superpowers/` 底下的競品分析、user feedback 分析過一遍，把過期的數字更新、把已經做掉的「待辦」標記掉。

沒人逼我做這個——但我前面寫過「doc 不更新比沒有 doc 更糟，因為 agent 會 confidently 相信錯的東西」。這次我**有**執行教訓了（跟 await 那個形成對比，給自己挽回一點面子）。

## 收尾

一個 await bug、design system 收尾、三個 UX polish、SEO dedup、doc audit——這天的主題其實是「**把前幾天鋪的東西收乾淨**」。鋪設容易收尾難，但收尾才是 codebase 不腐壞的關鍵。

至於那篇警告別忘記 await 的文章——我決定不刪，留著當紀念。畢竟能在三天內親自驗證自己文章的正確性，這種事不是天天有。

這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。
