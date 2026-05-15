---
title: "從設計文件到 AES-256-GCM：Oikos 的第一批 commits 都在解決「信任問題」"
pubDate: "2026-05-06"
tags: ["security", "encryption", "futari"]
draft: false
---
說真的，大部分 side project 死在同一個地方：第一個 commit 之後的第三天。

Futari 是我在做的家庭帳本 app，目標很簡單——兩個人共同記帳、即時同步、不要再傳 LINE 截圖。但在寫第一行 feature code 之前，我給自己挖了一個（應該說是標準的）坑：先把架構設計文件、資料庫 schema、加密工具一口氣搞定。

---

scaffold 的第一步是 Next.js + Supabase + Drizzle + Vitest 的組合。選 Drizzle 是因為 Prisma 的型別推導在 server action 裡一直讓我有種「你認識這個型別嗎？我不認識」的疏離感——Drizzle 直接 infer 出 TypeScript type，schema 即 source of truth，不需要跑 codegen。

Supabase client 分成 `server.ts` 和 `client.ts` 兩個 helper，這個分法在 Next.js App Router 裡幾乎是 mandatory 的——server component 拿 cookies、client component 用 browser session。但在這裡踩了第一個坑：server context 裡呼叫 `setAll` 會 crash，因為 `cookies()` 在 read-only context 下是唯讀的（middleware 以外的地方幾乎都是）。修法是在 `setAll` 裡加一個 try/catch 靜默吞掉 refresh 失敗——不理想，但現實就是這樣。

---

然後是 AES-256-GCM 加密工具。Futari 設計上打算把敏感資料（至少是備註欄位）在 client 端加密後再存進 Supabase。用 Web Crypto API 實作 `encrypt` / `decrypt`，key 用 hex string 序列化存在 local context。這裡的坑是 `getKey` 沒有驗證 hex 格式——傳進奇數長度的字串會在 `hexToBuffer` 裡噴出一個完全不知所云的錯誤，而不是一句「你的 key 格式有問題」。加一行 regex 驗證，加一個 auth tag 被竄改的測試 case，這個 bug 就算是提前埋進歷史。

整個 foundation 建好之後，我才允許自己開始寫第一個 database query。有時候這種「先把地基弄對」的強迫症是浪費時間，但帳本 app 如果 crypto 實作有洞，信任就沒了——而沒有信任的帳本，跟 LINE 截圖沒什麼差別。

---

<!-- source: oikos | last_sha: a823bfe274fd7a98d500662d7f1ef3e4a35c3d54 -->
<!-- commits:
c0f3949425 docs: add Oikos architecture design spec
2506488058 docs(oikos): use PascalCase table names throughout schema
a8a0a9f7fc docs: add Phase 0 implementation plan
8cb9c84f7e chore: scaffold Next.js + Supabase + Drizzle + Vitest
59b84ff144 feat: define Drizzle schema for all tables
47f287e6c0 fix: remove unused boolean and unique imports from schema
427cc2938a feat: add Supabase server and browser client helpers
3d0690f059 fix: handle setAll in read-only server contexts to prevent session refresh crash
564562539f feat: add AES-256-GCM crypto utilities with tests
a823bfe274 fix: validate hex format in getKey, add auth tag tamper test
-->
