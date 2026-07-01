---
title: "把「房子」這個 type 從佔位符變成會講話的人：Futari 第七種愛物落地"
pubDate: "2026-05-15"
tags: ["futari", "architecture", "design-system", "devlog"]
draft: false
---
老實說——TypePicker 裡那塊「房子」tile 已經在那邊冷板凳坐了快兩個版本，按下去長一個跟車子幾乎一樣的 form，存下去之後 detail page 一片白——對，**就是那種「功能是有，但你按了會懷疑自己是不是按錯」的 type**。第七種愛物（物品）都先它一步落地了，房子還在當佔位符——這次決定把它從 placeholder 升級成會講話的人。

---

順序很故意：先 **query** → **validator** → **server action** → **action 的 test** → **header tint** → **AssetSheet 的 tab + form fields** → **HouseDetailClient** → **detail page 接 branch**。從 DB 一路爬到 UI，**每層都有對應的 commit**——這個拆法是給未來的我看的，下次要加第 8 種 type 的時候直接照這 8 步走，不用再每次重想。

`validateHouseInput` 跟 `createHouse / editHouse` 兩條 server action 走的是跟其他愛物一樣的 contract——validator 吐 typed result、action 包 transaction、touch `Assets` base table + 1:1 detail row。重點在 **invariant 沒被打破**：base + per-type detail 這條 schema 從 v0.6.0 就鋪好的，這次只是把房子這格填滿——`HouseDetailClient` 跟 `CarDetailClient` 兩個檔案**互不認識**，這條約束（前一版重構 AssetSheet 時建立的）這次再次驗收通過。

中間順手做了兩件無關但戳到我的事——`AssetIcon` 給保險加了 **shield+check** 變體（之前用泛用 icon、看起來像通知設定），empty state 文案塞進「保單」兩個字。**Polish commits 跟主線一起 ship 的 rhythm，是 side project 不會卡住的關鍵**——大功能 PR 想分一刀切還在猶豫，icon swap 兩個檔案進去就走。

---

最有趣的是 `AibutsuHeader` 那條 **house tint**。每個愛物 type 在 detail page 頂部有一條淡彩——車是灰藍、寵物是奶油黃、植物是綠——這次給房子一條溫和的木色。沒人會 code review 這條 commit，但少了它房子 detail page 看起來像是別的 app 的頁面跑錯地方。**type 系統的氣質一致性，全靠這種 1 行的 tint commit 撐著**。

要不要也順手做點 onboarding hint？想了一下，**不要**——這 type 上線當天就跑來 dogfood 的只有我自己。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*

---

<!-- source: oikos | last_sha: 9593464dcea2d32248b42f00360c4ac11c76503d -->
<!-- commits:
1098cb3aadbf851b8f0abeeb7e4b529eb4eb2830 2026-05-06T02:36:31Z feat(ui): AssetIcon insurance variant (shield+check)
53dbaecc1b09c1c53a8c74471ddb9e436a2223eb 2026-05-06T02:36:41Z ui(assets): empty-state copy includes 保單
212b8acc043a02c68582af55c6458707631d9342 2026-05-06T00:10:39Z feat(house): add getHouseDetails query
43151db80eb93c0386d37516c1a23afe48be3954 2026-05-06T00:23:20Z feat(house): add validateHouseInput + tests
cd9bedcb56c9811636768941e388975e0f1d1c8c 2026-05-06T00:25:55Z feat(house): add createHouse + editHouse server actions
7e10343b9d00cac88ecbf551b18adb6de8a4db09 2026-05-06T00:27:19Z test(house): add createHouse + editHouse action tests
d297530475d139b77013878640b5fc77c19f0ed4 2026-05-06T00:28:16Z feat(house): add house tint to AibutsuHeader
c948a2f734614d87ae0a7cdd07c6e2435909db5e 2026-05-06T00:38:33Z feat(house): add house tab + form fields to AssetSheet
1d95a79bddfd4044a9312b02a980e865a7ab477b 2026-05-06T00:40:34Z feat(house): add HouseDetailClient page component
9593464dcea2d32248b42f00360c4ac11c76503d 2026-05-06T00:41:36Z feat(house): wire up house branch in asset detail page
-->
