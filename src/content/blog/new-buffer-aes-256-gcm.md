---
title: "從 `new Buffer()` 的陰影走出來：用 AES-256-GCM 保護家庭帳本的敏感欄位"
pubDate: "2026-05-07"
tags: ["security", "encryption", "futari"]
draft: false
---
一個記帳 app，不加密也沒人在乎——直到你意識到你把伴侶的消費明細明文存在資料庫裡，然後默默把那個念頭壓下去。

---

Futari 的 Phase 0 在技術上其實很無聊：scaffold Next.js、接 Supabase、裝 Drizzle、設好 Vitest。這種事我做過太多次，幾乎可以閉眼完成。但有一個小決定讓我多花了一點時間——加密。

具體需求很簡單：transaction 的備註欄位（`note`）寫進 DB 之前要加密，讀出來再解密。不需要搜尋，不需要 index，純粹「別讓人直接打開 Postgres 就看光光」。選 AES-256-GCM，理由也直白：有 authenticated encryption（auth tag），改過的 ciphertext 會在 decrypt 時噴錯，而不是安靜地吐出亂碼讓你誤以為一切正常。

實作本身沒什麼魔法——`randomBytes(12)` 產 IV、`createCipheriv`、把 `iv:authTag:encrypted` 拼成一串字串存進去。比較值得說的是 `getKey()` 的設計：key 從環境變數讀，但讀進來之後會先驗格式（`/^[0-9a-fA-F]{64}$/`）。這個 regex check 看起來很囉嗦，但省掉了「key 被截斷」或「key 混進空白字元」這類在部署時才爆的詭異 bug。

---

踩坑的地方在 auth tag tamper test。第一版的測試這樣寫：

```
const tampered = ciphertext.slice(0, -4) + 'xxxx'
```

想說直接改最後幾個字元就能觸發驗證錯誤——結果 `'xxxx'` 恰好是合法 hex，decrypt 沒有在 auth tag 那層爆，而是在 payload 解碼時才噴，測試雖然過了，但測的不是我以為在測的東西。後來補了一個明確的 auth tag 替換測試：把 IV 和 encrypted 保留、把 authTag 換成一個假的 `deadbeef...`，這樣才真的在驗證「auth tag 被動過手腳會爆」。

小事，但 `it('throws on tampered auth tag')` 這一行讓我睡得比較安穩。

---

Phase 0 最終交付：tech stack 站起來、schema 定義好、AES-256-GCM 工具有測試。接下來才是真正有趣的部分——但那是下一批 commits 的故事了。


---
<!-- source: oikos | last_sha: a823bfe274fd7a98d500662d7f1ef3e4a35c3d54 -->
