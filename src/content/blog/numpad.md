---
title: "我自己刻了一個 numpad，然後一週後把它砍掉"
pubDate: "2026-05-12"
tags: ["futari", "devlog", "refactor", "feature"]
draft: false
---
Futari 的記帳 sheet 一開始長這樣：底部彈出一張卡，金額是大大的 NT$ hero，下面是我親手刻的九宮格 numpad——每顆按鈕都有 active state、有 haptic 感、還能長按連刪。我那時還挺得意的（畢竟 designer mode 全開）。

然後我把它拿到手機上跑 E2E。

問題一：numpad 是漂亮，但**手機本來就有原生數字鍵盤**，user 已經肌肉記憶了——切換、刪除、長按全都會。我做了一個「比系統還難用的系統」。換成 `<input inputMode="numeric" pattern="[0-9]*">`，sheet 開啟 350ms 後 auto-focus（等 slide-up 動畫跑完），手機跳原生鍵盤、桌機可以直接打字。`Numpad.tsx` 直接 `git rm`。心情複雜但沒有挽留。

---

順便修了第二個尷尬的 bug：底部 nav bar 是 `absolute` 定位在 content box 裡——意思是**它會跟著內容捲走**。Empty state 還好（畫面短、撐不滿），一旦塞進交易紀錄，nav 就消失在螢幕外了。改成 `fixed` viewport-anchored，配 `max-w-md` 置中，桌機看就是一個漂浮在視窗中央的 mobile frame——我本來就要這個 vibe。HomeIndicator 也跟著套同一個模式。

第三個小坑：backdrop 之前只蓋住 sheet 上方，桌機在 `max-w-md` 外的空白區點擊不會關 sheet。改成 `fixed inset-0`，z-index 重新排：backdrop 90、sheet 100、error toast 110。FAB 在 sheet 開啟時用 `hideFab` prop 藏起來——不然按鈕會浮在 sheet 中間，超出戲。

---

至於 server side，順手補了一個 guard：`createTransaction` 要拒絕 category=`settle` 的請求。UI 那邊本來就用 `PICKABLE_CATEGORIES` 過濾掉了，但 server 完全沒檢查——典型「前端做了所以後端就沒做」的反模式。validator 加一行就解決，但這種洞放著遲早會痛。

教訓：自製 UI 元件之前，先問一句「系統原生的有什麼問題嗎？」——通常答案是「沒有，是你想刷存在感」。

*這段 code 寫於 2026 年 5 月，文章整理於 2026 年 5 月。*

---

<!-- source: oikos | last_sha: 796822886f17a632cd9e2168d3aa2a1d3374eb95 -->
<!-- commits:
- d86851c feat(dashboard): warm empty state with Futari mark
- b7eaf01 feat(dashboard): recent transaction list with compact rows
- 9ad6c12 feat(add-sheet): bottom sheet shell with amount hero + payer toggle
- 084ccdb feat(add-sheet): full form body — desc/category/split/date + numpad + mini calendar
- f294c3e feat(settings): minimal settings page with logout
- ee00285 docs(sql): document Phase 1e realtime publication command
- d7e49d4 fix(phase-1a): apply final-review fixes
- 7968228 fix(phase-1a): viewport-fixed nav/sheet, native numeric keyboard
-->
