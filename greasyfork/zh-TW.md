# GeoGuessr 強化結算

猜完之後，在**結算地圖**上就能對照：**真實位置**、**你的圖釘**和**街景長什麼樣**——不必另外開 Google 地圖。

適用 **經典模式**、**每日挑戰**、**決鬥**、**團隊決鬥** 的回合結束與全場總結畫面。

## 你能用到的功能

- **圖釘預覽** — 游標停在猜測點或綠色正解點上，可看街景縮圖與離最近街景覆蓋的距離。
- **頁內街景** — 點圖釘，地圖旁開啟分屏街景。
- **依回合檢視** — 經典模式終局時，點左側回合列表，地圖會聚焦該回合的猜測與答案。
- **街景覆蓋層** — 開啟藍色覆蓋，複盤時看哪些路段本來能走街景。
- **移動軌跡** — 在街景裡移動時，猜測地圖上會畫出你的路線。
- **歷史街景** — 同一地點有多期影像時，用底部下拉切換拍攝時間。
- **街景小工具** — 截圖、複製連結、在 Google 地圖開啟、前後跳轉、拍照模式（隱藏 UI 乾淨截圖）。
- **決鬥專屬** — 回合面板、地圖縮放，以及決鬥結算上的同款街景按鈕。
- **儲存至 Map-Making** — 選用：一鍵存點到 [map-making.app](https://map-making.app)（首次需自備 API 金鑰）。

## 地圖與圖層按鈕

結算地圖上方可切換道路／衛星／地形，並使用腳本加入的其他地圖開關。

## Map-Making（選用）

1. 先從圖釘開啟街景。
2. 點 **儲存**（上傳圖示）。
3. 首次使用貼上 API 金鑰 — 至 [map-making.app/keys](https://map-making.app/keys) 申請。

## 玩家常用技巧

- 回合結束 → 先游標停在圖釘上再開全屏街景。
- 綠點 = 出題點；你的點 = 你鎖定的猜測。
- 決鬥總結 → 用地圖上的列表按鈕切換回合。
- 拍照模式 → 街景裡點相機圖示，**Esc** 離開。

## 致謝

部分構想與實作參考社群作品：[Guess Peek](https://greasyfork.org/scripts/483541-guess-peek-geoguessr)、[GeoGuessr Path Logger](https://greasyfork.org/scripts/460683-geoguessr-path-logger)、[Save to Mapmaking](https://github.com/miraclewhips/geoguessr-userscripts/raw/refs/heads/master/geoguessr-save-to-mapmaking.user.js)。
