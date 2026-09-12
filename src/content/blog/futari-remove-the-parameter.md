---
title: "前任伴侶還記得那串 group id——所以我把那個參數整個刪掉"
pubDate: "2026-09-14"
tags: ["futari", "security", "database", "postmortem"]
draft: false
---
你有沒有看過那種函式簽章——它長得完全正常，正常到你看十次都不會覺得有問題？

```ts
export async function createInvite(groupId: string): Promise<string>
```

它會替 `groupId` 這個帳本鑄一張七天有效的邀請連結。整條路徑上唯一的檢查是 `requireViewer()`，確認你登入了。

沒有任何一行檢查你是不是那個帳本的成員。

## 為什麼「id 猜不到」不是防護

第一反應通常是：group id 是 UUID，外人猜不到吧。

但這個情境裡的攻擊者不是外人，是前任伴侶——一個曾經在這個帳本裡、後來離開的人。而 group UUID 對他來說從來不是秘密，它出現在每一次 dashboard render 的 RSC payload 裡。他在還是成員的時候，那串 id 就躺在他自己的瀏覽器裡。

所以實際的攻擊路徑是：他離開、帳本回到單人狀態，然後他拿著記下來的 group id 呼叫 `createInvite(那個 id)`，鑄一張邀請給自己，再自己接受。

他就回到帳本裡了。拿回當前章節的帳本讀寫，以及全部愛物資料的 PII 解密權限——那裡面有住家地址、證件號碼、車牌這一類的東西。而受害者這邊沒有任何「把人踢出去」的路徑可以走。

順帶一提，RLS 在這裡不構成補償控制。連線用的 pooled role 是 table owner，而且 `GroupInvites` 這張表根本沒有 INSERT policy。指望資料庫那一層會擋下來，是想像出來的安全感。

## 兩種修法，我選了看起來比較激烈的那種

第一種是加檢查，一行就好：

```ts
const { user } = await requireViewer()
await requireGroupMember(groupId, user.id)   // 新增
```

這能修好這個 bug。我沒有這樣做。

第二種是把參數拿掉，改成從 viewer 反查：

```ts
export async function createInvite(): Promise<string> {
  const { user, group } = await requireViewerGroup()
  // ...
}
```

差別在於，第二種讓「caller 傳進來的 group id」這件事在**結構上無法表達**。不是「傳進來了但我們有檢查」，是根本沒有那個參數可以傳。

我選第二種的理由是它對未來的 caller 說了不同的話。一個共用的 `requireGroupMember(groupId)` guard 存在的時候，它會持續引誘下一個人繼續傳 id、然後信任那個 guard 會處理。而漏掉一行 guard 是很容易發生的事——這個 bug 本身就是這樣來的。反查則沒有東西好漏。

這個慣例不是這次才發明的，`toggleGuardianBeta` 已經是這樣寫了，這次只是把它套到另一個地方。改完之後三個 callsite 都變簡單了，因為它們本來傳的就是自己的 group；有兩個元件的 prop 跟 hook 因此變成死碼，一併刪掉。**一個好的權限修法應該讓程式碼變少**，如果它讓程式碼變多，通常是修在錯的層。

## 另一邊也補一層

鑄造端修好了，應該沒事了吧？

還沒。接受端有一個獨立的問題：`validateInviteAcceptance` 從來沒有「鑄造這張邀請的人，現在還是不是成員」這個概念。也就是說，一張偽造的邀請、或者一張在鑄造者成員資格失效之後才被使用的邀請，跟一張正常邀請在它眼裡是一模一樣的。

新增了一個 `inviter_not_member` 錯誤碼。這一條關掉的是一整類情況，不是單一個實例——就算鑄造端哪天又被誰改回去，接受端還會擋一次。

寫的時候有個小地方值得記：這個判定我寫成「鑄造者仍佔著兩個成員 slot 其中之一」，而不是 `inviterId !== memberA`。後者在今天是對的，但如果哪天 group 的人數檢查被重排或放寬，它就會靜靜地變成錯的。前者表達的是語意本身。

## 同一天的第二個，形狀一模一樣

同一天還修了另一個洞。`editFuelLog` 只用 id 去查那筆要被編輯的加油記錄，沒有任何 group 條件：

```ts
const existingLog = await db.query.fuelLogs.findFirst({
  where: eq(fuelLogs.id, fuelLogId),   // 就這樣
})
```

它**有**做所有權檢查，但檢查的是攻擊者新傳進來的 `assetId`，不是那筆正在被編輯的記錄。

所以拿著別人的 `fuelLogId` 可以覆寫對方的加油記錄、軟刪掉對方關聯的交易，還能把替代交易插進自己的 group 卻帶著對方的 `fuelLogId`（跨 group 的 FK 汙染）。而且只會重算攻擊者自己的 balance，受害者那邊的 balance cache 就這樣變成髒的。

同一個檔案裡的 `softDeleteFuelLog` 跟 `getFuelLogById` 都有這個檢查。所以這是漏掉，不是設計。照同一個形狀，在任何寫入之前先把 `existingLog.assetId` 解析到 `assets.groupId = group.id`。

順手也修了那段 doc comment。它宣稱「若 asset 不屬於 viewer 的 group 則 throw」——在修好之前，那句話只對新傳進來的 asset 成立，對被編輯的那一列不成立。**註解描述的是作者以為的行為，不是實際行為**，這種註解比沒有註解更危險。

## 收尾

我的結論是：權限漏洞優先考慮**把不可信的輸入從簽章裡刪掉**，而不是在簽章裡多加一道驗證。驗證要靠每個 caller 都記得，刪掉不用。

什麼情況下我會改變主意：如果那個 id 真的必須由 caller 決定——例如管理員替別的群組做事、或者一個 caller 會處理多個 group 的批次 endpoint——那參數就是必要的，這時候該做的是把 guard 寫進同一個函式的第一行，而不是散在各個 callsite。

兩個 bug 的共通點是同一個：**所有權檢查驗錯了對象。** 一個驗了新傳入的 group id 而不是操作者的身分，一個驗了新傳入的 asset 而不是被改的那一列。兩次都有「有做檢查」的外觀，兩次檢查的都不是會受害的那個東西。

我還沒有一個系統性的方法可以把這類東西掃出來。目前能做的只有：每次寫到「用 id 查一筆既有資料然後改它」的時候，停下來問一次「我驗的是哪一筆的所有權」。

先不說了，我得去把其他幾支 `edit*` 開頭的 server action 都翻一遍，我有預感不只這一支。

*這段 code 寫於 2026 年 9 月 14 日，文章整理於同一天。*
