---
title: 新增一個引流頁面要改 800 行，所以我把架構重寫了
slug: migrate-use-case-data-driven
pubDate: 2026-05-30
tags: ["nextjs", "architecture", "refactoring", "seo", "i18n"]
draft: false
---

你有沒有過那種，某件事明明「不難」——就是新增一個頁面而已——但你坐下來一看，發現要改的東西多到讓你先去倒了一杯水再說？

我在做 Futari 的 `/migrate/*` 頁面時就是這樣。

---

## 新增一個頁面，要動多少地方

Futari 有一系列「從 OO 搬過來」的引流頁，告訴使用者怎麼從 Manebo、CWMoney、Honeydue 之類的競品遷移過來。每一個競品對應一個頁面，格式大致相同：Hero、遷移步驟說明、功能比較表、FAQ、最後 CTA。

聽起來很合理。問題是，當我要新增第四個 source 時，流程是這樣的：

- 開 `messages/zh-TW.ts`，寫這個 source 的所有中文 copy
- 開 `messages/zh-CN.ts`，寫簡體版
- 開 `messages/en.ts`，寫英文版
- 開 `messages/ja.ts`，寫日文版
- 更新 TypeScript 的 `MigrateSource` union type——5 個地方，少一個 build 就炸
- 新建 `app/[locale]/migrate/[new-source]/page.tsx`

每個 locale 檔裡，這個 source 的資料大概 200–300 行。四語合計 800–1200 行。而且絕大多數都是**結構完全相同的東西**——比較表的欄位、FAQ 的問題、每個 feature 的 yes/partial/no——只是語言不同。

我加完 Manebo 之後，坐在那裡看著自己寫的東西，心想：`/use-case/*` 也快要來了，那邊預計至少 5 個頁面，格式跟 migrate 八成一樣。我如果照這個模式繼續做，整個 i18n 資料夾會變成一個誰也不想碰的地方。

---

## 問題的根本在哪

仔細想一下，這 800 行裡面有多少是「真正需要翻譯的語言資訊」，又有多少是「語言無關的事實資料」？

比較表的那幾欄——`coupleSharing: yes`、`expenseSplitting: partial`、`csvExport: yes`——這些是**事實**，不是文案。Manebo 支不支援費用分攤，這件事跟你看的是中文還是日文沒有關係，結果都一樣。但我現在的做法，是把這個事實用四種語言各寫一遍，只是因為 i18n 檔案是唯一的資料來源。

這樣的結構有一個滿討厭的副作用：如果 Manebo 哪天改了功能，我得去四個地方更新，而且很可能忘記其中一個。

---

## 解法：把「事實」跟「文案」分開放

我設計了兩層分離：

第一層是 `lib/migrate/sources.ts`，只放**語言無關的事實**：

```ts
export const MIGRATE_SOURCES = {
  manebo: {
    slug: 'manebo',
    name: 'Manebo',
    csvExportPath: '設定 → 匯出',
    weaknessKey: 'no_couple_split',
    features: {
      coupleSharing: 'partial',
      expenseSplitting: 'no',
      csvExport: 'yes',
      free: 'partial',
      encryption: 'no',
    },
  },
  // 新增一筆只加這裡
}
```

第二層才是 i18n，只負責**真正需要翻譯的東西**：feature 的標籤名稱（「雙人帳本」/ "Couple Sharing"）、tone 的顯示文字（「✓ 預設模式」/ "Built-in"）、以及那個 `weaknessKey` 對應的一句話描述。

比較表的每一列，原本是手寫的，現在透過一個 `buildComparisonRows(def, t)` helper 自動組出來。結果是：新增一個 source，i18n 裡只需要加那個 source 特有的 weakness 短句翻譯，其他欄位自動生成。

`/use-case/*` 的架構是同一個概念，只是資料的 shape 不同——不是 feature matrix，而是 persona 定義：

```ts
export const USE_CASE_PERSONAS = {
  cohabitation: {
    slug: 'cohabitation',
    primaryKeyword: '同居記帳',
    painPointKeys: ['aa_split', 'who_paid_what', 'monthly_settle'],
    featuresHighlighted: ['expenseSplitting', 'realTimeSync'],
  },
}
```

Hero 的情境標題跟痛點描述仍然進 i18n（因為那個才是真的需要人寫的文案），但頁面的整體結構、要 highlight 哪些 feature、FAQ schema——全部從 `PersonaDef` 推導出來。

---

## 新增一個頁面現在要幾行

舊流程：800–1200 行 i18n + 5 個 type union 更新 + 1 個 page.tsx。

新流程：`sources.ts` 裡加一個物件（大概 15–20 行），i18n 裡加那個 source 特有的幾句話翻譯。`page.tsx` 完全不需要動——它是一個動態路由，從 `MIGRATE_SOURCES` 的 key 自動 `generateStaticParams`。

`/use-case/*` 的 5 個頁面，現在只需要加 5 個 `PersonaDef` 物件，加上各自的 hero copy 翻譯，不需要各自開一個 page.tsx。

---

## 一個意外的收穫

這樣改完之後，比較表的欄位**在所有頁面上保證一致**——因為只有一個地方定義它。原本偶爾會有某個頁面的比較表多一欄或少一欄，因為是手寫的，很難發現。

另外一件事我在寫 issue 時才想清楚：這個架構讓「非工程師也能貢獻內容」變得可能一點。以前要加一個 source，得懂整個 i18n 結構，還得知道 5 個 type union 在哪裡。現在，理論上只要填一個有型別保護的 TypeScript object，TypeScript 自己會告訴你漏填了什麼。

不確定這個「非工程師貢獻」的場景什麼時候會實際用到，但至少先不是障礙了。

---

先不說了，我得去把 `/use-case/buying-house` 跟 `/use-case/travel` 也補起來——那兩個還是 TODO 狀態，掛在 milestone 裡看著我。

*這個架構設計寫於 2026 年 5 月 30 日，文章整理於同日。*
