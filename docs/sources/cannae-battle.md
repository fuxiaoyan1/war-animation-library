# 坎尼会战动画资料

## 资料边界

本动画表现公元前 216 年 8 月 2 日坎尼会战的阵法级战术过程，不是布匿战争全史，也不是考古级战场测绘。坐标用于保持奥菲杜斯河、罗马营区、迦太基营区、两翼机动和后口闭合的相对关系；单位单元是战术教学抽象，不代表逐百人队或逐骑兵队的精确位置。

本轮制作只保留用户允许的“斜视战术镜头”设计点。旧坎尼失败稿的组件、脚本、资产链、专项门禁和动线口径不作为制作输入。

## 主要来源

- Polybius, `Histories`, Book 3，LacusCurtius 在线文本。用于核对坎尼双方部署、罗马步兵压上、迦太基中央后退、非洲步兵两翼转入、骑兵回卷和战后歼灭叙事：<https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Polybius/3*.html>
- World History Encyclopedia, `Battle of Cannae`。用于交叉核对坎尼日期、兵力概述、汉尼拔双重包围战术和战役影响：<https://www.worldhistory.org/Battle_of_Cannae/>
- Encyclopaedia Britannica, `Battle of Cannae`。用于交叉参考战役日期、交战双方和双重包围意义；当前命令行访问被 Cloudflare 拦截，本轮不把它作为可复跑下载证据：<https://www.britannica.com/event/Battle-of-Cannae>
- 战术图形与单位素材处理参考：项目已沉淀的垓下、碾庄制作流程，尤其是数据层建模、地图首屏主导、低字幕、单元显隐窗口、route/effect 绑定实际接触点和 Playwright 视觉证据流程。

## 五道动线设计证据

1. 单位尺度：动画使用 64 个罗马步兵主单元、30 个罗马崩溃残部单元、10 个罗马骑兵单元、约 66 个迦太基中央/非洲步兵单元、约 40 个迦太基/努米底亚骑兵与后封单元，以及汉尼拔、Paullus 两个小型指挥群。每个作战单元都有独立路径、朝向和显隐窗口，避免整片移动。
2. 地图/镜头包络：战场压缩在坎尼平原核心，北侧奥菲杜斯河、南侧罗马营区、两翼骑兵空间和后口封闭点同框。当前画布扩大到 `2700x1620`，用更大的战术舞台承载独立单位，避免靠缩小图标把部队压成雾状团块。页面使用成熟系列的地图首屏结构、斜视战术镜头、低字幕和事件跳转。
3. 双方独立路线：罗马步兵从南向北压上并逐步进入袋形区；迦太基中央从前凸后退为内凹；非洲步兵从左右两翼内折；迦太基骑兵沿外侧击败罗马骑兵后回卷封后，不穿越己方步兵或完整罗马方阵。
4. 合并接触复核：近战效果只在中央接触、骑兵接触、非洲步兵侧压和骑兵封后等双方当前可见单位之间出现。无人区域不爆特效。
5. 完整回放：Playwright 需要检查部署、中央诱敌、侧压、后封、压缩和终局；人工截图证据保存到 `artifacts/`，不嵌入会话。

## 3D 地图与斜视镜头

2026-06-13 的 `09:16` 候选继续作为优化基底，不再向更早失败稿回退。当前 `CannaeTerrain3D` 已对齐垓下、碾庄的成熟地图骨架：MapLibre GL JS 加载本地 Terrarium DEM，使用 `raster-dem` + `setTerrain({ source: "cannae-real-dem", exaggeration: 1 })`，并在同一 WebGL 地理相机上叠加历史战术地形、河流、阵型、路线、单位和接触效果。

- 地形瓦片：`public/assets/maps/cannae-real-terrain/terrarium/{z}/{x}-{y}.png`
- 前端证据属性：`data-renderer="maplibre-real-terrain"`、`data-terrain-model="real-dem-raster-terrain"`、`data-projection="webgl-gis-terrain"`、`data-terrain-source="/assets/maps/cannae-real-terrain/terrarium/{z}/{x}-{y}.png"`
- 斜视战术镜头继续保留：部署从罗马后侧/斜后方看双方入场，侧压、后封和压缩阶段回到罗马后端约 30-40 度的战术视角并切入近景；这个镜头是用户明确允许保留的旧坎尼设计点。
- 视觉证据保存到 `artifacts/cannae-restore-probe-20260613/0916-dem-balanced-assets-1/` 与 `artifacts/cannae-restore-probe-20260613/reference-structure-compare-2/`。其中 `metrics.pixel.json` 记录坎尼关键帧 `largeDarkComponentCount=0`，用于确认本轮没有大面积黑块/雾状连通块。

## 阵型与时间锚点

- `BCE-0216-08-02T06:30`：双方从营区方向展开。罗马重步兵居中且纵深厚，两翼骑兵护侧；迦太基中央前凸，两翼非洲重步兵保留机动。
- `BCE-0216-08-02T08:20`：中央接触。罗马重步兵压上，迦太基中央承受压力。
- `BCE-0216-08-02T10:10`：迦太基中央后退为内凹，罗马因追压进入袋形区域。
- `BCE-0216-08-02T11:30`：迦太基左翼重骑击败罗马左翼骑兵，开始外侧回卷。
- `BCE-0216-08-02T12:35`：非洲重步兵两翼内折，形成内层侧压；努米底亚骑兵继续牵制罗马右翼。
- `BCE-0216-08-02T13:50`：骑兵后口闭合，内层步兵和外层骑兵形成双层围歼。
- `BCE-0216-08-02T15:10`：罗马厚阵被压缩破碎。
- `BCE-0216-08-02T17:30`：终局收束。迦太基胜利方仍留在战场，罗马只保留破碎残部态势。

## 单位图标

坎尼单位通过成熟 `UnitIcon` 位图通道渲染，不使用坎尼自建图标生成器。当前本地演示资产：

- `public/assets/unit-icons/cannae-roman-legion.webp`
- `public/assets/unit-icons/cannae-roman-command.webp`
- `public/assets/unit-icons/cannae-roman-cavalry.webp`
- `public/assets/unit-icons/cannae-carthaginian-infantry.webp`
- `public/assets/unit-icons/cannae-iberian-gaul-infantry.webp`
- `public/assets/unit-icons/cannae-african-infantry.webp`
- `public/assets/unit-icons/cannae-carthaginian-command.webp`
- `public/assets/unit-icons/cannae-carthaginian-cavalry.webp`
- `public/assets/unit-icons/cannae-numidian-cavalry.webp`

这些资产保存在 `public/assets/unit-icons/source/cannae/`，当前作为本地私人演示素材使用。处理方式是成熟 `UnitIcon` 透明位图通道：裁切、透明 alpha mask、提亮、阵营轻调色、锐化、WebP 导出；不使用旧坎尼自建生成器、文件大小门禁、椭圆地影或盒图式背景。2026-06-12 修正过一次 alpha 污染问题：低透明整图背景会在地图尺度叠成方片/雾状，错误的 ImageMagick 合成还会把彩色图吃成黑剪影；当前导出要求角点全透明、文件保持 sRGB 彩色透明。

2026-06-13 继续做资产平衡修正：不使用生成器，只从 `public/assets/unit-icons/source/cannae/*.png` 的透明源图重新导出 WebP，保留 alpha 通道，调整 RGB 暗部、亮度、饱和度和锐化。目标是去掉骑兵/步兵在地图尺度上的黑团，同时避免过亮刺眼。证据记录在 `artifacts/cannae-restore-probe-20260613/unit-asset-stats-3-balanced.json`：运行 WebP 的 `edgeAlphaMax=0`；骑兵平均亮度约 `91-108`，近黑像素比例约 `0.04%-0.17%`；罗马军团和非洲步兵平均亮度约 `92-93`，近黑像素比例低于 `0.12%`。前端图片 URL 使用 `?v=20260613-asset-balanced-v2` 断开旧黑图缓存。

这些资产仍不是最终授权素材，也不是严格的坎尼时代考据级图像；公开发布前应替换为授权明确的罗马共和国、迦太基、努米底亚、伊比利亚/高卢、非洲步兵参考图或购买素材。

2026-06-14 助手流程复审后，坎尼运行时单位显示改为“逻辑独立、视觉 LOD”：每个单位仍保留独立 route、heading、显隐窗口和接触绑定，但地图尺度只显示前沿、边缘、后封和结果所需的可读实例，避免早中段 150-180 个图标叠成雾状。关键帧运行时证据保存到 `artifacts/cannae-visual-pass-20260614-lod-v7/`，对应 workflow 复审目录为 `artifacts/animation-assistant-workflow/cannae-20260614-lod-v8-review/`。

v7 运行时复审结果：

- `runtime-visual-review-ready`，无运行时视觉警告。
- 垓下参考帧单位数 `90`，碾庄参考帧单位数 `82`。
- 坎尼关键帧单位数：部署 `84`，正面压入 `82`，骑兵清场 `76`，凹袋形成 `79`，两翼内折 `93`，后口封闭 `93`，压缩围歼 `108`，终局/结果 `87`。
- 结果帧保留迦太基胜利方 `68` 个可视单位、罗马残部 `19` 个可视单位，避免“胜利方消失”和“罗马整齐列队”两类失败。

2026-06-14 后续按用户要求继续以成片质量为目标推进，而不是只停在门禁通过。`artifacts/cannae-visual-pass-20260614-camera-units-v4/` 记录本轮截图和 DOM 指标，`artifacts/animation-assistant-workflow/cannae-20260614-camera-units-v4-review/` 记录 workflow 回流复审；复审状态再次为 `runtime-visual-review-ready`。

本轮修正重点：

- 后封、压缩、终局和结果镜头继续放大，保留罗马后端 30-40 度斜视战术视角，避免后半段核心战场只占画面中央小块。运行指标中结果帧单位包络从旧证据约 `xFill=0.48/yFill=0.50` 提升到 `xFill=0.61/yFill=0.64`，压缩帧提升到 `xFill=0.65/yFill=0.66`。
- 单位图标没有继续单纯放大。一次试验触发 `RUNTIME_AVERAGE_UNIT_BOX_TOO_LARGE` 后，最终把运行时缩放回调到成熟阈值内：关键帧平均单位框短边约 `44.1-47.0px`，压缩帧 marker load `0.212`，无密度警告。
- 部署段 route visual LOD 收紧，减少开场大纵队铺满画面的队列表演感；后半段仍保留独立 route、heading、显隐窗口和接触绑定。
- 阵型、路线和阴影层降噪，避免淡线、阴影和图标叠成雾状；接触线略增强，用于强调双方挤压碰撞而不是单纯队列行进。
- 终局帧继续保留迦太基胜利方 `68` 个可视单位和罗马破碎残部 `19` 个可视单位，后封/双翼/压缩路线仍在场，避免胜利方凭空消失。

这次还修正了一个证据流程问题：5177 常驻服务读取的是 `~/Library/Application Support/war-animation-lab-oss/dist`，不是仓库 `dist`。源码改完后必须 `npm run build` 并用 `npm run preview:local -- --port 5177 --skip-build` 发布，否则 Playwright/截图会继续抓旧 JS，导致视觉检查和用户所见不一致。

## 音频

- 背景声层：`public/audio/wikimedia-carnyx.ogg`
- 来源：Wikimedia Commons `File:Carnyx.ogg`，下载 URL：<https://upload.wikimedia.org/wikipedia/commons/e/e6/Carnyx.ogg>
- 用途：古代战场号角氛围层，当前文件较短，只能作为唯一性占位和时代声层；正式交付应替换为独立、高质量、时长足够的背景配乐。
- 战斗音效：古代近战事件使用项目已有 `public/audio/sfx/swords-clashing.mp3`，通过 `WarScore.playBattleCue("melee")` 触发。

## 验收重点

- 地图必须主导首屏，不能退回普通页面布局。
- 罗马和迦太基正面距离必须短，中央接触后才出现战斗效果。
- 单个作战单位必须独立移动，不能整块方阵平移。
- 迦太基中央要从前凸变内凹，罗马必须随之压入。
- 非洲步兵两翼必须内折参与侧压。
- 迦太基骑兵必须沿外侧机动并封后，不能穿越步兵或罗马方阵。
- 双层包围必须闭合，不能留大口子。
- 单位朝向随当前机动和敌方方向调整，不能背对作战对象。
- 终局胜利方留在战场，罗马残部破碎，不出现双方凭空消失或整齐列队。
