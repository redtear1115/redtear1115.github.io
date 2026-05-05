---
title: "我幾乎沒寫任何 code，但這個 side project 的每個架構決策都是我的"
pubDate: "2026-05-04"
tags: []
draft: false
---
我是後端工程師，最近做了第一個前端 side project——[VanishWhisper](https://vanishwhisper.web.app)，一個端對端加密的閱後即焚聊天 app。整個開發過程我幾乎沒有親手打過任何 code，commit message 也是 Claude 寫的，測試也是，我頂多負責在手機上戳一戳看有沒有壞掉。

但這不代表我只是在旁邊看。

---

## AI 是實作手，不是架構師

開始之前我就決定好幾件事：不要任何 backend、不要 identity provider、私鑰絕對不能離開瀏覽器。這些限制塑造了整個系統。

Claude 一開始的本能是「我們需要一個登入頁面」，然後「登入完要有註冊流程」。我喊停了。因為我的問題根本不是「讓用戶登入」，而是「讓 Firestore security rules 有一個可以驗證的 identity，同時完全不知道用戶是誰」。Firebase Anonymous Auth 剛好夠用，不多不少。

**AI 很擅長把常見問題解決得很完整，但它不知道你的問題不是那個常見問題。** 你要自己知道。

---

## 被 Claude 嚇到

app 基本功能全部做完，我也實際用了幾天、跟朋友傳了幾封訊息之後，才想到要加「換裝置」的功能。

然後我才意識到——我他媽完全不知道這個 app 的加密是怎麼運作的。

我知道有 E2E 加密，知道私鑰在瀏覽器裡，但實作細節我從來沒看懂過，全是 Claude 寫的。我理所當然地以為換裝置就是要把 RSA private key 搬過去，跟 Claude 說了這個方向。

Claude 的解法完全不一樣。架構裡每個 session 本來就有一把 AES key，分別用兩個人的 RSA public key 包起來。換裝置時，舊裝置把 AES key 解出來，立刻用新裝置的 public key 重新包一次，寫回 Firestore。新裝置就能正常解密，private key 從頭到尾沒有離開過任何地方。

我看完這個解法，坐在那邊想了一分鐘。我用了自己做的東西好幾天，完全不知道它底層是怎麼運作的，然後 Claude 用一個比我預想的更漂亮的方式解決了問題。

這個感覺很奇妙，有點荒謬，但也有點爽。

---

## 真正的價值在取捨

前端框架選 Vue 是因為聽說好上手，TypeScript 是 Claude 建議的，Firestore 是因為免費又不需要 backend。選型沒有什麼深思熟慮。

AI coding 把實作成本壓得很低，低到「會不會寫 Vue」根本不重要。但**知道要不要做某個功能、Claude 給的方案是不是你真正需要的、什麼時候要說不**——這些沒辦法外包。

我在這個 project 裡做最多的事，是說「不」。

---

如果你也想試試看，歡迎來玩：[vanishwhisper.web.app](https://vanishwhisper.web.app) — 不用註冊，打開就能用，訊息讀完自動消失。有興趣的話可以把連結丟給朋友，跟他開一個 session 試試看。
