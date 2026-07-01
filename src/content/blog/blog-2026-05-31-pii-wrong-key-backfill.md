---
title: 我在 prod 加密了 PII，然後用了錯的 key
slug: pii-wrong-key-backfill
pubDate: 2026-05-31
tags: ["security", "postmortem"]
draft: false
---

你有沒有過那種，覺得自己做了一件很負責任的事——替 prod 資料庫裡的敏感資料全部加密——然後過了一段時間，才發現你加密得很用力，但是用了錯的 key？

我這天遇到的就是這個。不只是「加密失敗」，是**加密成功了，但在 prod 上永遠解不開**。沉默地爛在那裡，誰都不知道。

---

## 事情是這樣開始的

幾個禮拜前，我做了一輪 PII 加密——把 `CarDetails.plate`（車牌）跟 `HouseDetails.address`（住址）這類敏感欄位從明文換成 AES-256-GCM 加密存放。加密本身沒什麼問題，我也寫了一支 `encrypt-existing-pii.mjs` backfill script，把存量的舊資料也一起翻過來。

Script 跑了，測試通過，一切看起來很正常。

然後到了5/31早上，我發現 `revealCarPlate`（揭露車牌的 server action）在 prod 上一直跳錯——`Unsupported state or unable to authenticate data`。

這個錯訊我認識。AES-GCM 驗證失敗，解密拿到的不是它加密時用的 key。

*等等。*

---

## 誤診第一輪：以為是 runtime 環境問題

第一個反應：Vercel 的環境變數是不是沒設對？我去 Dashboard 確認——`ENCRYPTION_KEY` 有設，但因為是 Sensitive 變數，值是遮起來的，我根本看不到它是什麼。

確認不了，只能加 instrumentation。加了一個 Sentry `captureException` 來捕捉真正的錯誤訊息——commit `be1508080`——然後重新部署，等 log。

Log 回來了，還是同樣的錯。不是 undefined key，因為 Sensitive 變數如果不存在 Vercel 根本不會讓它注入 runtime。是**key 有值，但是錯的值**。

---

## 真相：我拿 dev key 打了 prod 資料

仔細翻一遍，我才想起來：那支 backfill script——`encrypt-existing-pii.mjs`——是在我本機跑的，而本機的 `.env.local` 裡放的是 dev 環境的 `ENCRYPTION_KEY`，不是 prod 的。

腦袋裡浮現一個很不舒服的畫面：**我用 dev key 把 prod 資料庫裡的車牌跟住址全部重新加密了一遍**。

Prod runtime 拿到這些值，用自己的 prod key 去解，當然失敗——因為這些資料根本不是它加密的。

確認一下影響範圍：`plate_encrypted` 6 筆，`address_encrypted` 1 筆，合計 7 筆資料在 prod 上永久解不開。其他欄位——child name、national-id、NHI——都是透過正常 app 路徑寫入的，用的是 prod runtime key，沒問題。

只有 backfill 補進去的那批，全死。

---

## 修法：prod key 不能離開 runtime

正常思路：從 Vercel 把 prod key 拉下來，用正確的 key 重新 re-key 一遍，跑一支 local script 就好。

問題是：Vercel 的 Sensitive 變數你**拉不下來**。`vercel env pull` 對 Sensitive 變數會跳過——這是刻意設計的，避免 key 落地。

所以我沒辦法在本機解 prod 資料。

唯一的辦法是：**讓 re-key 在 runtime 裡面跑**——在一個有 prod key 的部署環境裡執行修復，key 永遠不離開 Vercel 的 runtime。

我寫了兩樣東西：

第一，`scripts/rekey-mismatched-pii.mjs`——這是邏輯層，一次處理所有加密 PII 欄位。對每一筆值，先試 prod key（已經正確的就跳過），不行就試 dev key，解開之後用 prod key 重新加密回去。這讓整個操作是 idempotent 的——跑第二次不會壞已經修好的資料。

第二，一個 admin endpoint `POST /api/admin/rekey-pii`——這是執行層。因為 prod key 在 Vercel runtime 裡，我需要一個 HTTP endpoint 讓我可以從外部觸發 re-key，但 key 只在 server 端跑，不外洩。這個 endpoint 設計上有幾道防線：用 `REKEY_ADMIN_TOKEN` 做 header 驗證（timing-safe compare）；起跑前先做 pre-flight，確認 prod key 可以解開一筆正常的 app-written 資料（name/NHI 那類），如果解不開就整個 abort，不寫任何東西；`dryRun` 預設 `true`，要真的寫入得明確傳 `{"dryRun": false}`。

---

## 執行：proxy 也來插一腳

Endpoint 寫好，部署上 preview，打了一次——307 redirect 到 `/sign-in`。

欸，對。這個 app 有一個 proxy middleware，所有 `/api` 路徑如果沒有 session cookie 就會擋下來。Server-to-server 的 curl call 當然沒有 cookie，所以直接被踢走了，handler 根本沒跑到。

多一步：把 `/api/admin/rekey-pii` 加進 proxy 的 public allowlist，讓它繞過 auth-wall（反正 route 本身有 token 驗證）。這個 bypass commit `6f9fa10` 做了之後，才真的打通。

先 dry run 確認 7 筆全部被識別出來，`totalBroken` 回傳 `0`（0 筆連兩個 key 都解不開）。確認沒問題，再打一次 `{"dryRun": false}`——7 筆，全部 re-key 成功。

在 app 裡打開車牌，解密正常。

---

## 收尾：清掉所有一次性的東西

Re-key 跑完之後，這個 endpoint 和 proxy bypass 就不能繼續留著了——一個可以重寫 prod PII 的 admin route 如果留在 main，那才是真的安全漏洞。

Commit `380c10c` 把兩樣東西一起砍掉，只留下 `scripts/rekey-mismatched-pii.mjs` 當作事後的備查記錄，就跟原本的 `encrypt-existing-pii.mjs` 並排放著——一個是造成問題的，一個是收拾問題的。

---

## 學到什麼

這次最昂貴的教訓其實很簡單：**任何會碰 prod 資料的 script，跑之前先確認你的 shell 環境裡用的是哪一個 key。**

比這個更深一層的教訓是：**加密 backfill 是一個不可逆的破壞性操作**。跑完你看不出來它錯了——資料還在，欄位有值，app 也沒噴錯。只有在你第一次真正嘗試解密的時候，才會炸。這種「延遲爆炸」是最難抓的一類 prod bug，因為它靜靜等著你，不主動舉手。

我其實有做 pre-flight——script 開頭會隨機取一筆加密值解密，確認成功才繼續。但我用 `.env.local` 的 key 去驗，而那些「用來測試」的加密值，也是我用 `.env.local` 的 key 寫進去的——pre-flight 自己 check 自己，當然過了。**護城河只擋了陌生的 key，沒擋我自己人。** 真正需要驗的，是「這個 key 能不能解開一筆 app-written 的 prod 資料」，也就是那種透過正常 app 路徑、用 prod runtime key 加密的值——那類資料在本機根本拿不到。

---

先不說了，我得去把 Vercel 的 `REKEY_ADMIN_TOKEN` env var 也從 preview scope 刪掉——cleanup checklist 上還有這一條沒打勾。

*這段 code 寫於 2026 年 5 月 31 日，文章整理於同日。*
