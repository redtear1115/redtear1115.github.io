---
title: "加密完了，然後呢？——把 Futari 那兩根讓我心虛的明文欄位真的砍掉"
pubDate: "2026-06-10"
tags: ["futari", "security", "devlog"]
draft: false
---
你有沒有過那種「功能都做完了，但總覺得少了一步」的感覺？

Futari 的車牌跟地址加密去年底就上了，AES-256-GCM、backfill、double-write，整套流程我在前幾篇文章裡都寫過了。但加密上完之後，`CarDetails` 跟 `HouseDetails` 這兩張表裡還是擺著 `plate` 和 `address`——兩根明文欄位，靜靜躺在那，像是你換好鎖之後備用鑰匙還掛在門邊。

「反正 UI 不顯示了吧？」我是這樣安慰自己的。

但讀的人只要能跑 SQL，那根欄位就在那。

---

所以我決定把它砍掉——但這件事比我想的麻煩一點啊。

**不能直接砍**。先得確認所有讀取路徑都已經切過來了。我把 UI 層全部掃了一遍：車輛詳情頁的 hero subtitle、PickerAsset、FuelLog header、保險的車輛 dropdown、房屋列表卡……每一個還在直接 render 明文值的地方，都先改成 tap-to-reveal 或直接移除。這是 Sub-PR A，純 refactor，不動 schema。

Sub-PR A merge 完、確認 backfill 在 dev 跟 prod 都跑過（`plate=0, address=0`，也就是沒有任何一筆還沒加密）——這才輪到真正的 migration。

migration 0053，標記 `DESTRUCTIVE`：

```sql
ALTER TABLE "CarDetails" DROP COLUMN "plate";
ALTER TABLE "HouseDetails" DROP COLUMN "address";
```

就這樣。兩行。但那兩行背後是幾個月的準備啦。

edit form 也在這一批一起改——`plate` 和 `address` 欄位從「直接寫入明文」改成 trinary 語意：`undefined` 表示不動、`null` 表示清除、`string` 表示更新。form 開啟時預設空白，如果後端有加密值就顯示「先前已加密」加一個清除按鈕，跟其他 PII 欄位一致。

---

同一天還順手修了遷移功能的兩個 regression。

Futari 有一個從別的記帳 app 匯入的功能，5/30 的 CMS 架構改動讓兩件事悄悄壞掉了：一是 `MigrateChatgptWorkflow` 元件被加進去但忘了實際 render，所以使用者看不到截圖工作流；二是 `futari_generic` 的 CSV 欄位簽章被誤刪了，導致匯入時偵測失敗。這兩個 bug 靜靜躺在那，直到我補齊 5 個新的遷移來源（記帳城市、CashMan、1Money、iCost、隨手記）的時候才發現——因為要測新 parser，結果發現舊的也壞了。

欸，有時候就是這樣，在修新東西的時候才注意到角落裡有根舊的釘子。

先不說了，我得去確認 migration 0053 有沒有乖乖套上 prod 啦。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 6 月。*
