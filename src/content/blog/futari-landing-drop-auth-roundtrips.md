---
title: "我的落地頁每個 request 都打兩次 auth，只為了決定一個按鈕連去哪"
pubDate: "2026-06-10"
tags: ["futari", "devlog", "release"]
draft: false
---
你有沒有過那種，回頭看自己半年前寫的「合理設計」，突然意識到它每天在幫你燒效能、而你完全沒感覺？我這次盯著 Futari 落地頁的 critical path 看，發現一件很蠢的事——**每個 request 都打了兩次 Supabase Auth round-trip，只為了決定首頁那個 CTA 按鈕要連去 `/sign-in` 還是 `/dashboard`**。

兩次。一次在 `proxy.ts`（edge 層每個 request 都 `supabase.auth.getUser()`），一次在 `page.tsx` 的 server component（`getCurrentUser()`）。兩次都不是為了擋權限——純粹是想知道「這個人登入了沒」，好決定按鈕文字後面那個 href。一個行銷頁，公開的，卻在每次載入時恭恭敬敬地跟 Supabase 問兩次安。

修法是把這個判斷**整個搬到 client**。proxy 只對受保護路徑才驗 auth，公開的行銷路由（`/`、`/sign-in`、`/terms`、`/use-case/*` 那一串）直接跳過 edge→Supabase 的握手；未登入導去 sign-in 的 gating 對受保護路徑完全不變。首頁 SSR 一律先 render 登出版的 CTA（連 `/sign-in`），再用一個 `LandingPrimaryCta` client component 掛載後讀本地 session（`getSession`，cookie-local，零 round-trip），登入的人才把連結換成 `/dashboard`。label 不變，所以只有 href 會閃一下——這個我接受。

順手還清了兩塊死重：root layout 那條 `fonts.googleapis.com` preconnect 是純擺設（字型早走 `next/font/google` 自我託管在同源，runtime 根本不連 Google），還有 PostHog 關掉 `disable_surveys`，省下約 25 KiB 的 `surveys.js`。

但最值得寫下來的其實是一個**「我決定不修」**的結論。bundle 裡有個 30 KiB 的 polyfill，追到最後 root cause 是 Next.js 自己 hard-require 的 `polyfill-module.js`，注入每頁主 chunk、不受 browserslist 控制。要拔掉得去 patch `node_modules`——跨版本超脆弱。所以我把根因寫進文件、**選擇不動它**。

教訓：**效能優化最難的不是找到肥肉，是判斷哪塊肥肉動了會害你**。能省的 25 KiB 大方省，會讓你每次升 Next 都提心吊膽的 30 KiB，文件化它然後放生——這也是工程判斷的一部分啦。這批東西最後收進 v1.5.0。

先不說了，我得去盯那個 href 閃動到底有沒有閃到讓人不舒服——說「接受」是一回事，自己用起來礙不礙眼是另一回事啊。

*這段 code 寫於 2026 年 6 月，文章整理於 2026 年 6 月。*
