---
title: "換了裝置，名字全消失了——VanishWhisper 的加密 label 搬家"
pubDate: "2026-05-07"
tags: []
draft: false
---
以前換新手機之後，VanishWhisper 裡每個聊天都變回冷冰冰的 UID prefix——「你幫我取名叫 Alice 的那個人」變成 `a9f3c2…`，要你自己想起來那是誰。Sessions 搬過去了，名字沒有。這根本是在整自己。

---

這次修掉的就是這件事。

Labels（session 名稱、對方暱稱、釘選/封存狀態）一直是 device-local 的 IndexedDB 資料——這是刻意的設計，server 不該知道你把誰叫什麼。但「不讓 server 看」和「讓新裝置拿到」這兩件事不衝突，中間可以走加密的暫存通道。

實作上用的是 **hybrid encryption**：舊裝置生成一把一次性的 **AES-256-GCM** key，加密整包 labels JSON；再用新裝置的 **RSA-OAEP** public key 把 AES key 包起來——這樣 Firestore 看到的只有一堆 opaque bytes，只有持有對應 private key 的新裝置能解開。寫進 `Migrations/{newUID}` 這個一次性的 Firestore doc，新裝置 init 時 `tryConsumeLabelsPayload()` 偵測到就解密、寫進本機 IDB、刪掉 doc，done。

有一個值得記錄的 trade-off：Firestore rules 沒辦法驗證「只有你的前任裝置能 write 這個 doc」——server 上舊 UID 和新 UID 之間沒有任何 link。所以規則只驗 `FromUID == auth.uid` 加上收件人存在，邏輯上任何登入用戶都能往 `Migrations/{someUID}` 塞一個假的 payload。但最壞情況是什麼？對方塞進去的 labels，都是針對新裝置根本不在場的 session——不會渲染，只是幾筆惰性 IDB rows。接受這個 blast radius。

---

同一批 commits 裡還做了另一件事：把 `ChatSessionView.vue`（當時 1796 行）拆掉。`ChatMessageBubble.vue` 接走每條訊息的 UI，`useVanish.ts` 接走「讀了幾秒後自動消失」的計時邏輯，view 退到 1295 行——然後繼續拆，再拆，再拆。`importRsaPublicKey()` 也發現自己同時住在 `migration.ts` 和 `sessions.ts` 兩個地方（其中一個還繞過了 codec helper 直接用 `atob` loop），搬到 `codec.ts` 統一。

---

加密可以優雅，但「同一個 function 存在三份」這件事就很難看了。

*這段 code 寫於 2026 年 4 月，文章整理於 2026 年 5 月。*

---
<!-- source: vanishwhisper | last_sha: 2d68b23ab4a62133354dcd3f1aa100ac8c6bd6ac -->
<!-- commits:
121f03670b75152fb1d76430dfc4a5c2acbd5ff8 2026-04-29 ship encrypted labels across active hand-off migration
71e74465f4409415005869679eeabe957ae308f9 2026-05-01 split ChatSessionView into bubble component + vanish composable
cf782a57f32670fb2c205b3259174dbb15d1425d 2026-05-01 dedupe RSA pubkey helper + minor cleanups
b281edc72595fe8bc05cdf271d877cba9dc1f6dc 2026-05-01 extract ChatRenamePanel component + useDocumentDismiss composable
2d68b23ab4a62133354dcd3f1aa100ac8c6bd6ac 2026-05-01 frontend design pass — typography, atmosphere, brand assets
-->
