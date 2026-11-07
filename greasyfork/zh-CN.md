# GeoGuessr 强化结算

猜完以后，在**结算地图**上就能对照：**真实位置**、**你的标点**和**街景长什么样**——不用单独开 Google 地图。

支持 **经典模式**、**每日挑战**、**决斗**、**团队决斗** 的回合结束页与全场总结。

## 你能用到的功能

- **标点预览** — 鼠标悬停在你的猜测或绿点上，看街景缩略图，以及离最近街景覆盖有多远。
- **页内街景** — 点标点，地图旁打开分屏街景。
- **按轮回看** — 经典模式终局里，点左侧回合列表，地图会聚焦到该轮的猜测与答案。
- **街景覆盖层** — 打开蓝色覆盖，复盘时看哪些路段本来能走街景。
- **移动轨迹** — 在街景里走动时，猜测地图上会画出你的路线。
- **历史街景** — 同一地点有多期影像时，用底部下拉切换拍摄时间。
- **街景小工具** — 截图、复制链接、在 Google 地图打开、前后跳转、拍照模式（隐藏 UI 干净截图）。
- **决斗专属** — 回合面板、地图缩放，以及决斗结算上的同款街景按钮。
- **保存到 Map-Making** — 可选：一键存点到 [map-making.app](https://map-making.app)（首次需自备 API 密钥）。

## 地图与图层按钮

结算地图上方可切换路网 / 卫星 / 地形，并使用脚本添加的其他地图开关。

## Map-Making（可选）

1. 先从标点打开街景。
2. 点 **保存**（上传图标）。
3. 首次使用粘贴 API 密钥 — 在 [map-making.app/keys](https://map-making.app/keys) 申请。

## 玩家常用技巧

- 回合结束 → 先悬停标点再看全屏街景。
- 绿点 = 出题点；你的点 = 你锁定的猜测。
- 决斗总结 → 用地图上的列表按钮切换回合。
- 拍照模式 → 街景里点相机图标，**Esc** 退出。

## 致谢

部分思路与实现参考社区作品：[Guess Peek](https://greasyfork.org/scripts/483541-guess-peek-geoguessr)、[GeoGuessr Path Logger](https://greasyfork.org/scripts/460683-geoguessr-path-logger)、[Save to Mapmaking](https://github.com/miraclewhips/geoguessr-userscripts/raw/refs/heads/master/geoguessr-save-to-mapmaking.user.js)。
