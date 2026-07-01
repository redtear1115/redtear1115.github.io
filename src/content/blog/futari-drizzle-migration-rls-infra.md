---
title: "Futari 的地基：從 Drizzle migration 到 RLS，一天搭完的 infra 紀錄"
pubDate: "2026-05-07"
tags: ["futari", "google-cloud", "security", "database", "devlog"]
draft: false
---
說真的，「先把 auth 搞定再說」這句話我講了多少次，然後就跳過去——直到 Futari 真正要送出第一個 commit 的那天。

一個記帳 app，兩個人用，聽起來很單純。但一旦要區分「誰能看誰的資料」，底層就必須老實。所以第一天的 infra，我沒有偷懶。

---

**Drizzle + Supabase，從 migration 開始**

先設定 Drizzle ORM，跑第一支 migration（`0000_curly_tarantula.sql`，連 migration 的名字都帶點詩意），建立 `lib/db/client.ts` 連線進 Supabase。這一步其實沒什麼懸念，Drizzle 的 config 很直白，但選 Drizzle 而不是 Prisma 的理由是：我想要 raw SQL migration，不想要 ORM 替我生不明所以的查詢。

**Google OAuth 加 middleware，一起上**

接著裝 Google OAuth 的 sign-in page 和 `/auth/callback/route.ts`。第一版的 callback 有點天真——沒有驗 `next` redirect 的來源、沒有處理 code 交換失敗。馬上補了一個 fix：validate redirect URL、guard missing code、明確處理 exchange error。Auth flow 這種東西，「先跑起來再說」的代價太高，所以寧願在 day 1 就把 edge case 補齊。

middleware 同一天進來，dashboard route group 加上 layout guard，確保沒登入就踢回去。

**Invite flow：最有趣的部分**

Futari 是兩個人的 app，所以需要 invite token 機制。`lib/invite.ts` 負責產生跟驗證 token，`actions/invite.ts` 處理接受邀請的 server action。

這裡有個坑——`acceptInvite` 最初的版本，先 SELECT 確認 group 沒滿、再 INSERT member，是兩步操作。問題在於：如果兩個人同時點 accept（不太可能，但理論上會發生），就可能超過 group 人數上限。解法是改成 conditional `WHERE` 的 atomic UPDATE，把「檢查 + 寫入」壓成一個 SQL 操作。順手補了 `memberB` 的 test case，確認這條路真的走得通。

**RLS：最後的護城河**

最後補上 Supabase RLS policies 和 user 建立時的 trigger（`handle_new_user`）。RLS 確保就算 client 端出包，資料庫層也只吐出「這個 user 應該看到的資料」。這是 Supabase 給的禮物，但你要自己動手寫 policy，它不會自動保護你。

---

PWA manifest 也在同一天進來（`manifest.json` + icon），icon purpose 第一版寫在同一個 entry 裡，發現 Chrome 不吃，拆成 `any` 跟 `maskable` 兩個 object 就過了——小問題，但沒踩過不會知道。

地基搭好了，接下來才是真正有趣的部分。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*

---

<!-- source: oikos | last_sha: b327a79e2bf8f82d7e34970ef12c69312fe4b792 -->
<!-- commits:
97112865 2026-05-02 feat: setup Drizzle config and initial migration
dc2aef77 2026-05-02 feat: add Google OAuth sign-in and callback route
e3414faa 2026-05-02 feat: add auth middleware and dashboard placeholder
4d435e75 2026-05-02 fix: validate next redirect, guard missing code, handle exchange error
b111f43e 2026-05-02 feat: group creation flow with balance initialization
29181d1f 2026-05-02 feat: invite flow with token validation and group-full guard
4f62c8e3 2026-05-02 fix: atomic acceptInvite with conditional WHERE, inline group check
ce08dba3 2026-05-02 feat: add PWA manifest and meta tags
890e4d63 2026-05-02 fix: split PWA icon purpose into separate any and maskable entries
b327a79e 2026-05-02 feat: add profiles trigger and RLS policies SQL
-->
