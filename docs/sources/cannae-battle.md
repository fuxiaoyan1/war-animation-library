# 坎尼会战资料与阵法动画口径 / Battle of Cannae Sources and Animation Scope

本文件记录 `坎尼会战：双重合围` 专题动画的资料来源、可视化口径和不确定性边界。动画代码位于 `src/components/CannaeFormationAnimation.tsx`，数据位于 `src/data/cannaeBattle.ts`。

This file records the sources, visualization scope, and uncertainty limits for the standalone `Battle of Cannae: Double Envelopment` animation. The animation component is in `src/components/CannaeFormationAnimation.tsx`; the data model is in `src/data/cannaeBattle.ts`.

## 核心来源 / Core Sources

- Polybius, `Histories`, Book 3：用于校准汉尼拔部署、罗马中央压入、迦太基骑兵优势、非洲重步兵内折和包围结构。<https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Polybius/3*.html>
- Livy, `Ab Urbe Condita`, Book 22, Perseus Digital Library：用于交叉核对罗马军部署、会战序列和坎尼战场叙事。<https://www.perseus.tufts.edu/hopper/text?doc=Liv.+22.44>
- Encyclopaedia Britannica, `Battle of Cannae`：用于校准日期、参战方、指挥官和“双重包围”的现代摘要口径。<https://www.britannica.com/event/Battle-of-Cannae>
- World History Encyclopedia, `Battle of Cannae`：用于交叉核对汉尼拔中军由前凸到后退、骑兵清翼和合围叙事。<https://www.worldhistory.org/Battle_of_Cannae/>
- Wikimedia Commons, `Maps of the Battle of Cannae`：仅作现代示意图和构图参考，不作为事实本身。<https://commons.wikimedia.org/wiki/Category:Maps_of_the_Battle_of_Cannae>

English summary: the animation relies primarily on Polybius and Livy for the ancient battle narrative, with Britannica and World History Encyclopedia as secondary cross-checks. Wikimedia Commons maps are used only as composition leads, not as primary evidence.

## 当前动画事件口径 / Current Animation Scope

- `deployment`：罗马中央步兵以纵深集团展开；迦太基中军呈前凸月形，两侧为非洲重步兵，两翼为骑兵。
- `romanAdvance`：罗马中央集团向前压迫，画面优先聚焦步兵接触面。
- `centerYields`：迦太基中军边战边退，由凸形转为凹口，罗马集团被吸入。
- `cavalryClears`：迦太基骑兵在两翼取得优势，罗马步兵两侧失去屏护。
- `africanWingsTurn`：非洲重步兵从两侧向内折转，形成侧向夹击。
- `encirclement`：骑兵从后方闭合，非洲重步兵与中军共同压缩罗马集团。
- `collapse`：罗马密集集团失去展开和机动空间，战术结构崩溃。

English summary: the animation is organized as seven tactical phases from deployment through collapse, emphasizing Roman depth, the yielding Carthaginian center, cavalry wing clearance, African infantry inward turns, and the closing double envelopment.

## 可视化取舍 / Visualization Choices

- 本动画是战术沙盘，不是精确考古测绘。单位块、曲线、闭合环和镜头框用于解释阵法结构。
  This is a tactical board, not an archaeological reconstruction. Unit blocks, curves, rings, and camera focus boxes explain formation logic.
- 奥菲杜斯河、营地方向、尘土纹理用于提示战场环境；具体朝向在现代复原中有差异。
  The Aufidus river, camp directions, and dust texture are environmental cues; exact tactical orientation differs among modern reconstructions.
- `romanCompression`、`centerCurvature`、`wingClosure`、`cavalrySweep` 是动画化指标，便于测试关键战术关系，不代表史料中的精确量化数据。
  `romanCompression`, `centerCurvature`, `wingClosure`, and `cavalrySweep` are animation metrics used for testable tactical relationships, not exact historical measurements.
- 动画不展示血腥细节，重点表现阵形结构、机动空间丧失和多方向压力。
  The animation avoids graphic violence and focuses on formation structure, loss of maneuver space, and pressure from multiple directions.

## 不确定性 / Uncertainty

- 古代来源对兵力数字、阵列细节、战场精确朝向和微地形描述并不完整。
  Ancient sources do not fully settle troop numbers, exact formation details, battlefield orientation, or micro-terrain.
- 不同现代地图对罗马进攻方向、河流相对位置和阵形比例存在差异。
  Modern maps differ on Roman attack direction, relative river placement, and formation proportions.
- 本项目把“中军由凸转凹”和“两翼内折”作为来源支持的战术结构，把具体几何曲线和单位块坐标标为示意重建。
  The project treats the center's convex-to-concave movement and the inward turn of the wings as source-backed tactical structure, while exact curves and unit coordinates are schematic.

## 许可与免责声明 / Licensing and Disclaimer

本动画不复制第三方地图图片或视频；SVG 沙盘由项目代码绘制。外部链接仅用于资料核查和来源透明。项目总免责声明见根目录 `DISCLAIMER.md`，网站级来源入口见 `SOURCE_INDEX.md`。

This animation does not copy third-party map images or videos; the SVG board is drawn by project code. External links are used for source verification and transparency. See the root `DISCLAIMER.md` for the project-level disclaimer and `SOURCE_INDEX.md` for the website-level source index.
