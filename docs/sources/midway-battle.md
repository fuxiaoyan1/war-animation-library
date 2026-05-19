# 中途岛海空战动画资料

## 资料边界

本动画是战术示意图，不是逐分钟航海定位解算。航母机动轨迹、沉没/重创点使用公开资料中的战役关系、时间节点和大致海域重绘，坐标用于保持画面可读性；实际舰位在不同资料中存在误差。

## 主要事实来源

- Naval History and Heritage Command, `Battle of Midway, 4-7 June 1942`: <https://www.history.navy.mil/browse-by-topic/wars-conflicts-and-operations/world-war-ii/1942/battle-of-midway.html>
- Naval History and Heritage Command photo collection, Midway images: <https://www.history.navy.mil/our-collections/photography/wars-and-events/world-war-ii/midway.html>
- Wikimedia Commons / U.S. Navy and U.S. government public-domain carrier photographs used as historical references and, for some carriers, direct marker sources:
- USS Enterprise (CV-6), high speed on 4 June 1942: <https://commons.wikimedia.org/wiki/File:USS_Enterprise_(CV-6)_at_high_speed_on_4_June_1942.jpg>
- USS Hornet (CV-8), underway at sea in May 1942: <https://commons.wikimedia.org/wiki/File:USS_Hornet_(CV-8)_underway_at_sea_in_May_1942.jpg>
- USS Yorktown (CV-5), underway at Midway, 4 June 1942: <https://commons.wikimedia.org/wiki/File:USS_Yorktown_(CV-5)_underway_at_Midway_1942.jpg>
- IJN Akagi photograph: <https://commons.wikimedia.org/wiki/File:Japanese_aircraft_carrier_Akagi_01.jpg>
- IJN Kaga photograph: <https://commons.wikimedia.org/wiki/File:Kaga_Ikari_1930.jpg>
- IJN Soryu underway: <https://commons.wikimedia.org/wiki/File:Japanese_aircraft_carrier_Soryu.jpg>
- IJN Hiryu speed trials: <https://commons.wikimedia.org/wiki/File:Japanese_aircraft_carrier_Hiryu.jpg>
- Model kit / walkaround images used only as local-demo marker art where archival photographs were too rectangular or low contrast at map scale:
- Modellbau-Koenig product images for Hasegawa Akagi, Kaga and Aoshima Hiryu candidates.
- Most-Models Academy USS Enterprise CV-6 and USS Yorktown CV-5 walkaround/product images.
- Model Shipyard USS Hornet CV-8 model side photograph.

## 建模取舍

- 参战航母单独建模：USS Enterprise、USS Hornet、USS Yorktown、IJN Akagi、Kaga、Soryu、Hiryu 均有独立图片资产和舰名标签。
- 航母机动吸收对马海战的舰队队列经验：不再把航母画成各自孤立散点，而是以编队中心线驱动位置，再用沿航向/横航向偏移排列队形。
- 美军按 TF16（Enterprise、Hornet）和 TF17（Yorktown）分组；日军按南云机动部队（Akagi、Kaga、Soryu）与 Hiryu 独立机动线分组，表现飞龙在三艘主力航母被重创后的分离和反击。
- 舰首方向由当前编队中心线航向判断，只做左右镜像，不随路线坡度旋转，避免地图缩放后出现图标摆动或船体倾斜。
- 航母位置按航迹点的具体时间分段插值；飞龙两次反击事件分别锁定 Yorktown 在 12:20 和 14:45 的受击位置，反击路线终点、事件爆炸点和约克城号图标必须重合。
- 战术视窗收紧到中途岛东北海域，重点突出日美航母机动、南云转向、飞龙北侧机动和约克城受击位置；中途岛本体保留为南侧参照点。
- 关键波次独立建模：友永队、陆基 B-26/TBF、B-17/VMSB-241、VT-8、VT-6、VT-3、VB-6/VS-6、VB-3、飞龙两轮反击、最终打击飞龙、I-168 雷击。
- 赤城、加贺、苍龙、飞龙、Yorktown 在战斗结束画面保留沉没/重创点，用对应航母图标加爆炸纹饰标注。
- Yorktown 区分 6月4日重创、6月6日 I-168 雷击和 6月7日沉没，避免画成持续主动作战的航母。
- 非作战空档压缩：6月4日傍晚至6月6日的残局间隔被压缩，保留 I-168 和 Yorktown 最终沉没节点。

## 资产处理

- 源图保留在 `public/assets/unit-icons/source/midway-*.jpg`。
- 模型/侧视候选源图保留在 `public/assets/unit-icons/source/midway-models/`。
- 地图图标输出为 `public/assets/unit-icons/midway-*.webp`，由 `scripts/generate-midway-carrier-assets.py` 统一裁切、抠背景、锐化和居中导出。
- 这些图标是航母照片/模型侧视图处理后的独立透明舰体标记，不使用通用航母图标或手绘简笔符号。
- 部分模型图未完成授权核验，只适合当前本地/private demo；公开或商业发布前应替换为可公开授权素材。

## 音频

- 背景配乐：`public/audio/wikimedia-liberty-bell.ogg`
- 曲目：`The Liberty Bell March`，U.S. Army Field Band。
- 来源：Wikimedia Commons 文件重定向 `https://commons.wikimedia.org/wiki/Special:Redirect/file/The_Liberty_Bell_March_-_U.S._Army_Field_Band.ogg`
- 用途：`中途岛海空战` 独立配乐，避免与其他战争动画重复。
