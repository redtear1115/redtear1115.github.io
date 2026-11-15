---
title: "徽章間距量到 16.00，加到主畫面的人還看得到下載按鈕"
pubDate: "2026-11-15"
tags: ["futari", "landing", "ai", "devlog"]
draft: false
---
Futari 是給兩個人一起記生活帳的家計簿，有 iPhone App、Android App，也有網頁版。網頁首頁主按鈕下面，本來只有 Google Play 那一顆官方徽章。用電腦打開首頁的人，看得到去 Google Play 的路，看不到去 App Store 的。

11 月 11 日晚上七點五十二分，工作單要補上 App Store 那一顆。電腦兩個並排，App Store 在左。iPhone 只顯示 App Store，Android 只顯示 Google Play。人如果已經在 App 裡，或是把網站加到主畫面、用獨立視窗打開，兩顆都不要出現，頁尾那兩行商店商標說明也一起藏。平台要在畫面畫出來之前就決定好。晚一點再藏，徽章會先閃一下才消失。

八點十二分，負責文案的 Aria 把四語的替代文字對過官方徽章上印的字。簡中和繁中只差一個字：徽章印「下载」和「下載」，沒有「在」。舊的下載網址當天連不上，她把新網址寫進工作單，請實作的人用同一批檔。

八點二十八分實作交出來。設計師 Daphne 看了電腦版截圖，改了高度、間距和商標句。高度跟著各語系的 Google Play：英文 54 像素，中文和日文 61 像素。間距改成兩個徽章看得到的黑色邊緣之間 16 像素；工作單原本寫 12 像素，量的是圖檔邊框，Play 那張圖自己帶了一圈透明，看起來比較擠。商標句改成 Apple 官方完整那一句英文，不翻譯。

八點三十七分第二輪交出來。四個語系量下來，三個正好 16.00，英文 16.03。Daphne 用深色像素粗量裁切圖，跟這個數字對得上。焦點框貼著徽章，沒有撐成整列那麼寬。392 個測試檔全過。

九點十六分，驗證的 agent 把「加到主畫面、獨立視窗」也打開來看。iPhone 加進去之後，App Store 徽章還在。Android 加進去之後，Google Play 徽章還在。頁尾兩行說明也還在。

工作單把 App 裡和加到主畫面寫在同一格，藏的方法寫的是沿用「人在原生 App 裡」那條標記。原生 App 打開網頁時會留下一個記號，加到主畫面不會留。實作照著那條標記藏，獨立視窗裡的人就還看得到徽章。實作的人在說明裡寫了：這一項沿用既有行為，沒有改。驗證的 agent 把它記成沒過，其餘項目都過了。

它建議另外做一個獨立標記，不要併進原生 App 那條路，因為那條路還管著「Android 上架了」的橫幅。九點二十五分補修進來，多了一份測試，專門查獨立視窗會不會把徽章藏起來。另一個 agent 連續抓了四十次畫面，該消失的徽章一次都沒露臉；把網頁自己的程式擋掉，第一眼也已經藏好。一般瀏覽器和原生 App 的畫面，跟補修前一樣。

隔天凌晨兩點四十四分合進主線。真的 iPhone 瀏覽器、真的加到主畫面，那天晚上沒有人實測。

Futari 的程式碼在 [GitHub](https://github.com/redtear1115/oikos)，入口在[作品集](https://southern-light.dev/works/)裡。

先不說了，我得去把 Futari 加到主畫面，看徽章會不會還在。

*這段 code 寫於 2026 年 11 月 11 日，文章整理於 2026 年 11 月。*

<!-- source: oikos（FREEDOMPJ2025/futari），時間均換成 Asia/Taipei。新進度接續 #179 停在 11 月 10 日 17:02 之後；此稿停在 11 月 12 日 02:44 合併，真機 Safari／真的加到主畫面未測，正文寫未測。 -->
<!-- issue #1930：2026-11-11 19:52 開立；19:53 規格：電腦並排、iPhone 只 App Store、Android 只 Play、App 內與已安裝 PWA 都不顯示、首次繪製前決定平台、間距 12px、高度約 54、商標短句。 -->
<!-- Aria 20:12：landing.appStoreBadgeAlt 四語對官方徽章（en Download on the App Store／ja App Store からダウンロード／zh-CN App Store 下载／zh-TW App Store 下載）；舊網域 tools.applemarketingtools.com 連不上。 -->
<!-- PR #1931：commits a07fb84／a3cdc5f／7daa5f7 20:28；Daphne 20:31 三點（高度跟 Play：en 54／ja、zh 61；可見黑色邊緣 16px；官方完整商標句）；8daed43 20:37 第 2 輪；Dev B 20:38 實測 en 16.03／ja 16.00／zh-CN 16.00／zh-TW 16.00，test:ci 392 files／5913；Daphne 20:39 OK；focus ring 20:42。 -->
<!-- Dev A 21:16 REFUTED @8daed43：已安裝 PWA 仍見徽章與兩行商標；規格同一格寫 PWA，方法寫沿用 data-native-shell；PR 內文已揭露「沿用既有行為，沒有改」。建議獨立 data-standalone，不要併進 native-shell（還管 Play 橫幅）。Ray／Daphne 對補修 vs 接受差異的明確回覆查不到，21:25 已依建議補修（11de932）。 -->
<!-- Dev C 21:53 CONFIRMED @11de932：40 幀採樣該藏可見幀數 0；擋 JS 第一幀已藏；test:ci 393 files／5924；反向拿掉 HIDDEN_IN_APP standalone 半邊測試會紅。 -->
<!-- 合併 2026-11-12 02:44（18:44Z）db806ef；issue 關閉留言：Ray 11/12 合併，真機 Safari、實際安裝 PWA 未測。 -->
<!-- 待 Ray 確認：(1) 結尾「加到主畫面看徽章會不會還在」為敘事收尾，未宣稱實測；(2) PWA 補修 vs 接受差異，GitHub 上看不到 Ray 原話，正文寫成中性「補修進來」。 -->

<!-- Co-authored-by: Claude <claude@southern-light.dev> -->

