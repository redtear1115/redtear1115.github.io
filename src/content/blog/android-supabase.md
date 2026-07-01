---
title: "當了一日 Android 工程師，結果兇手是 Supabase 後台的兩個星號"
pubDate: "2026-05-31"
tags: ["capacitor", "supabase", "security", "postmortem"]
draft: false
---
你有沒有過那種，code 一行都沒錯、測試全綠、release 也發了，結果功能照樣炸——而真正的兇手躺在一個你三天沒打開的後台設定頁裡？

這就是我這兩天的故事。我把 Futari 從 PWA 包成 Android app，順便當了一日 Android 工程師。過程比我想的精彩，主要是因為我一路誤判到底。

## 先講前情：5/30 晚上的衝動

Futari 本來就是個 PWA，跑得好好的。但「能在 Google Play 上架」這件事一直在我心裡癢——5/30 晚上手癢就開幹了。用 Capacitor 把它包成 Android 殼，思路很單純：app 本身只是個薄殼，`server.url` 直接指向 prod，WebView 載線上的網站就好。

```ts
server: {
  url: 'https://futari.southern-light.dev',
}
```

裝 Capacitor、加 Android platform、換成 Futari 的品牌 icon、設 release signing……一路到登入。登入這塊比較麻煩，因為 Google 禁止在嵌入式 WebView 裡跑 OAuth（那個惡名昭彰的 `disallowed_useragent`）。所以我用 `@capacitor/browser` 跳出系統瀏覽器做授權，授權完再用 custom scheme deep link 回 app。寫完、測一下、發了 v1.4.0。爽。

那天晚上我覺得自己是天才。

## 然後它開始怪怪的

隔天我在 app 裡按登入，流程是這樣的：按 CTA → sign-in → 跳出瀏覽器授權 → 然後它彈回 landing，要我再按一次 CTA、再登入一次，才進得了 dashboard。

感覺超怪——外面那層原生殼好像根本沒登入到。我跟 Claude 一起看，第一個發現是 deep link 回跳的 URL 路徑接重複了，變成 `/auth/callback/auth/callback`，這個 404 很合理會把人踢回首頁嘛。

於是我改了 code，把多接的那段拿掉，順手修了個會累積 listener 的小 bug，跑完整套 release 流程——bump 版本、CHANGELOG、tag、PR、deploy——發了 v1.4.1。

理論很漂亮。我又覺得自己是天才了（你看出問題了吧）。

## 當一日 Android 工程師

要驗證就得實機跑。我手邊有台 Lenovo 平板，於是開始了我的 Android Studio 初體驗，這段算是全文最歡樂的部分。

第一關：要開「開發者選項」，網路都說「對著版本號碼點七下」。我對著「Android 版本」猛點七下，結果跳出一隻 Android 14 的小圖案在那邊轉——那是彩蛋，不是開發者選項啦。原來要點的是「版本號碼（Build number）」，不是「Android 版本」，欸，差一個欄位。

第二關：平板不是手機，我想用 WiFi 無線偵錯。Android Studio 給我一個 QR code，我拿平板掃，它叫我「儲存網路」，然後那個網路怎麼樣都連不上。卡了一陣才搞懂——那個 QR 不是 WiFi，是 ADB 配對封包，要從「無線偵錯」裡面的專用掃描器掃，不是用相機。後來改用配對碼才連上。

第三關：Android Studio 一打開就跳一堆「建議升級 AGP」「migrate 到 Gradle Daemon」的提示。還好我忍住沒亂點——那資料夾是 Capacitor 生成的，手賤升級大概會炸。

折騰完，APK 裝上去了，重測登入……還是彈回 landing。

天才當場變兇手。

## 真相：兩個 project、兩個星號

我那個 code fix 根本沒解到問題。冷靜下來想，我注意到一件事：web 跟 Android 送給 Supabase 的 `redirect_to` 是不一樣的。

- Web：`https://futari.southern-light.dev/auth/callback`
- Android：`dev.southernlight.futari://login-callback/auth/callback`

Android 必須用 custom scheme 才能 deep link 回 app，這沒問題。問題是——Supabase 會拿這個 `redirect_to` 去比對後台的 Redirect URLs 白名單，**不匹配的話它不會報錯，而是靜默 fallback 到 Site URL**，也就是我的 landing 頁。

打開後台一看，custom scheme 那筆只設了精確值 `dev.southernlight.futari://login-callback`，後面少了路徑。我的 redirect_to 後面還拖著 `/auth/callback`，當然不匹配。難怪每次都被丟回首頁。

我想說那加個 `/*` 不就好了。結果還是炸。

這裡是最後一個雷：Supabase 的 glob，`*` **不跨 `/`**，只匹配單一路徑段。我的路徑是 `login-callback/auth/callback`，後面有兩段，`/*` 只吃得到 `auth`，吃不下 `/auth/callback`。要用 `/**`（兩個星號）才跨得過去。

```
dev.southernlight.futari://login-callback/**
```

dev 跟 prod 兩個 Supabase project 都補上 `/**`，重測——授權完，deep link 觸發，主 app 直接進 dashboard。成了。

## 我學到的三件事

第一，**OAuth 跟 deep link 這種跨好幾個組件的問題，先抓證據再動 code**。我一開始憑「路徑看起來重複了」就推論、就改、就發版，整套 release 白跑。後來是撈了 prod 的 auth log、實機接了 DevTools 確認 `window.Capacitor` 真的存在，才把方向釘死。猜得再漂亮都不算數。

第二，**最陰的 bug 是靜默 fallback**。它不給你錯誤訊息，症狀（彈回 landing）長得像 code bug，根因卻在一個沒人會想到要看的 config 頁。這種 bug 你不去質疑「我假設它會報錯」這件事，就永遠在 code 裡鬼打牆。

第三，**glob 的 `*` 跟 `**` 真的有差啊**。這種藏在文件小字裡的規則，踩到才會痛。

我把這整段寫成了一份 spec 釘進 repo，免得下次換 Supabase 環境的人——很可能就是未來的我——再踩一次同一個雷。

先不說了，我得去把那隻 Android 14 的彩蛋小人再點出來看一次，畢竟它是這兩天唯一一個一次就成功的東西。

*這段 code 寫於 2026 年 5 月 30 到 31 日，文章整理於 5 月 31 日晚上。*
