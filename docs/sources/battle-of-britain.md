# 伦敦上空的鹰资料说明

## 动画范围

本动画不再做 1940-07-10 至 1940-09-15 的不列颠空战全景压缩，而是聚焦 1940-09-15 “Battle of Britain Day”伦敦方向昼间空战。片名改为“伦敦上空的鹰”。

取舍原因：

- 用户反馈原全景版在长日历轴上出现“飞机又没了”，空战观感不成立。
- 9月15日是伦敦方向最大规模、最具象征性的昼间空战日，适合做短时、高密度、战术级动画。
- 单日小时级时间轴可以持续展示雷达发现、RAF 升空、轰炸机流、护航、拦截、队形破碎和回程追击。

## 主要资料

- Royal Air Force, Battle of Britain overview and chronology: <https://www.raf.mod.uk/what-we-do/our-history/battle-of-britain/>
- RAF Museum podcast transcript, 15 September 1940 / Battle of Britain Day: <https://www.rafmuseum.org.uk/documents/podcasts/transcripts/15_Sept_Podcast.pdf>
- Imperial War Museums, Battle of Britain overview and interpretation: <https://www.iwm.org.uk/history/what-was-the-battle-of-britain>

## 关键事实锚点

- 9月15日上午，雷达和观察哨报告大批敌机来袭。
- 上午攻击包括两波敌机，约 100 架和约 150 架从多佛至邓杰内斯方向越岸。
- RAF 11群在乌克斯布里奇指挥作战，多支喷火和飓风中队陆续升空。
- 12群大编队也南下增援，但到场时机与战术效果存在历史讨论；动画将其作为“增援加入”的战术层表现，不把它夸大成单独决定性因素。
- 午后 13:45 后出现第二次大规模来袭报告，约 150 架和后续约 100 架敌机再次越岸。
- 下午约一小时内，11群多数中队投入伦敦方向拦截。
- 白金汉宫方向的 Do 17 / Ray Holmes 拦截事件用于表现伦敦市区上空局部战术节点。
- 9月15日成为英国守住白昼防空能力的象征节点，但并非不列颠空战全部结束。

## 动画建模

- `campaignStart`: `1940-09-15T10:30`
- `campaignEnd`: `1940-09-15T18:00`
- `timeStepDays`: `1 / 24`
- 德军路线分为上午第一波、上午第二波、下午主波、下午后续波、返航破碎队形和傍晚小规模牵制。
- RAF 路线分为 11群上午升空、12群上午南下、白金汉宫方向局部拦截、回程追击、午间整补巡逻、11群下午全力投入、12群下午大编队加入和海峡追击。
- 12:45-14:05 增加 `midday-raf-refuel-patrol`，用于衔接上午追击和13:45第二次预警，避免伦敦动画出现长空白段。
- 伦敦参照大周行动的表现口径：地图不再铺得过大，首屏使用 `britainAirLondonClose` 紧盯伦敦、肯特和泰晤士河口；上午/下午德军来袭线补足去程、伦敦附近接触和返航段，RAF 航线补足侧前拦截、增援加入和追击段，避免机群到点就消失。
- 2026-05-23 复核后，上午回程追击节点收紧到 `12:00`，下午高峰节点收紧到 `14:45`，下午返航破碎节点收紧到 `15:10`。这些事件时间按路线插值与 RAF/德军实际交汇窗口对齐，避免“两军多次交汇但没有战斗事件”。
- 德军上午/下午来袭线继续延伸到肯特/邓杰内斯返航方向，RAF 追击线从接触点接上返航走廊；测试用敌我路线同窗距离断言锁定上午混战、上午回程追击、下午高峰、队形破碎和海峡追击。
- 2026-05-23 再修“擦肩而过”问题：新增 `morning-raf-dogfight-weave`、`morning-luftwaffe-cover-break`、`afternoon-raf-dogfight-weave`、`afternoon-luftwaffe-cover-split` 四条短时缠斗航迹，并给上午/下午接触窗口接入 `dogfightEffects`。空战不用舰炮式 `salvo`/集火线，改用缠斗圈、盘旋弧、短曳光和闪点表示拦截、护航被拉散与回程追击。
- 2026-05-24 修复“德机停在维多利亚/南伦敦拦截区”：上午、下午德军大编队先把伦敦/南伦敦作为中间航路点，再经邓杰内斯走廊返航到加来、布洛涅或格里内角；白金汉宫方向脱队 Do 17 和拦截飓风在 `11:52` 事件完成后退场。`dogfightEffects` 绑定 `routeIds`，测试检查效果中点必须有双方飞机仍在单位可见窗口内并靠近中心，避免没有飞机也在缠斗。
- 2026-05-24 继续修复“邓杰内斯德机停留、RAF 返航路线缺失”：邓杰内斯只作为过岸/脱离走廊，不能作为大编队最终停车点；11群、12群、午间巡逻、上午/下午追击和缠斗线都补成回比金山、肯利或达克斯福德的完整返场航路。伦敦数据门禁要求非隐藏空中单位的 `unitVisibleUntil <= end`，飞机可见期间必须仍在沿航线运动。
- `morning-radar-plots` 从 10:30 开始，保证开场不是空白地图；10:30 的“短暂平静”是作战室待命和雷达警戒，不触发爆炸音。
- 事件音效只覆盖实际飞行/交战节点：雷达接触、升空用飞机声，混战/追击用飞机+扫射；13:45 预警和18:00结果节点静音，不能在无飞机/无攻击阶段播放爆炸。
- 背景配乐从 `directory-audio-military-exercise.mp3` 临时改为 `wikimedia-rule-britannia.ogg`，避免继续使用德法战役背景。该曲与特拉法尔加仍有复用，后续应补独立英国空战配乐。
- 空战飞机仍是短时可见单位，不能长期驻留；但所有主要航迹 `visibleUntil` 保留到片尾，用密集航迹表达大规模空战。
- 关键战术点如布伦奇利空域、南伦敦拦截区、白金汉宫方向、维多利亚站、达克斯福德和南安普敦使用 `revealAt` 延迟显示，避免剧透。
- 2026-06-13 按垓下/碾庄成熟流程改进为“空战典型范本”：首屏继续地图优先，新增泰晤士空中走廊、伦敦防空核心、肯特雷达链、轰炸机流走廊、RAF 拦截屏、海峡返航追击、11群扇区升空线、12群大编队南下线、雷达至乌克斯布里奇指挥矢量和扇区控制标记。主要航线用 `positionAnchor` / `positionAnchors` 绑定这些战术空域，不再只靠孤立航线漂浮。
- 2026-06-13 单位资产从通用 `ww2Fighter` / `ww2Bomber` 改为真实图片加工的机型级位图：RAF 使用 `britainSpitfire` 和 `britainHurricane`，德军使用 `luftwaffeBf109`、`luftwaffeBf110`、`luftwaffeDo17`、`luftwaffeHe111`。这些图标由 `scripts/build-britain-air-unit-icons.mjs` 从 `public/assets/unit-icons/source/britain-air/` 的真实飞机照片裁切、透明化和缩放生成，运行产物为 `public/assets/unit-icons/britain-*.png` 与 `public/assets/unit-icons/luftwaffe-*.png`。
- 2026-06-13 回归门禁新增：伦敦空战路线不得再使用通用 `ww2Fighter` / `ww2Bomber`；每条非隐藏空中单位路线必须显式声明真实机型图标并绑定有效战术空域锚点，不允许靠组件默认 `unitIcon` 兜底；Playwright 专项检查喷火、飓风、Bf 109、Bf 110、Do 17、He 111 的 PNG 实图素材、紧凑显示尺寸、战术空域叠层和无舰炮式 `salvo`。
- 2026-06-13 用户截图复核后继续修正三项问题：伦敦战术地形只允许线/轮廓表达并在 `.battle-of-britain` 作用域内强制 `fill: none`，现代空战显式关闭古地图装饰层，并调亮伦敦空战底图/降低暗角，避免大黑块或大面积暗底抢主体；飞机运行 PNG 改为从真实照片裁切，RGB 内容仍来自源照片，透明轮廓由项目本地 ISNet 分割与机型包络相交生成，He 111 只在分割漏主体时局部启用 photo assist，不能再用“照片差异 alpha 并集”把背景条带回主体；镜头阶段改为 `britainAirRadar`、`britainAirCombat`、`britainAirReturn`，开场和 13:45 预警跟随雷达链，13:45 前预卷到雷达视角，11:30/14:45 跟随伦敦东南主战区，12:00/15:20 跟随肯特海岸返航追击，不再把大量画面留给上方空地。
- 2026-06-13 回归门禁继续强化：`battle of britain shows radar directed compact air formations` 断言 `camera-layer` 的 `data-map-focus` 在雷达/混战节点正确切换，当前事件点、雷达航迹、雷达指挥矢量和狗斗圈落在地图核心区；`expectNoDarkTacticalTerrainBlocks` 检查伦敦战术地形无大面积黑色填充；`expectNoLargeDarkRenderedBlocks` 扫描页面实际 SVG 渲染的大面积暗色块；`expectTransparentAircraftPng` 同时检查边角/边缘透明、外接盒占比、外接盒内部填充率和行列覆盖率，防止“边角透明但仍像矩形照片卡”的假阳性。
- 2026-06-13 后续用户截图确认“作战单位没有被使用/仍是照片条”后，实际排查结论分为两层：一是页面 DOM 已引用六类新机型 PNG，但固定 `/assets/unit-icons/*.png` 路径配合本地静态服务 `Cache-Control: public, max-age=31536000, immutable`，会让用户浏览器继续显示旧图；二是上一版生成脚本用 `photo_mask` 与 ISNet mask 取并集，导致照片背景差异被重新并入 alpha，Hurricane、Spitfire、Bf 110 等在外接盒内形成长条。修复为六类伦敦飞机图标统一加 `?v=20260613-cutout-v2`，本地静态服务对 `assets/unit-icons/` 改为 `no-cache`，并把正式 alpha 改为 ISNet 分割与机型包络相交。
- 真实根因记录：此前文档和测试声称已经消除黑块，但实际 `src/styles.css` 缺少伦敦专属 `.battle-of-britain` 作用域样式，且 `CampaignMapAnimation` 的 `fortified-line-layer` 三层 `polyline` 没有显式 `fill="none"`，浏览器按 SVG 默认黑色填充把防空/工事线闭合成大块。后续只看 path/polygon 或只看 CSS 文档都会漏掉该类问题，必须覆盖 `polyline` 和截图像素连通域。

## 飞机素材来源与加工

- Spitfire：`public/assets/unit-icons/source/britain-air/602sqdn-spit1.jpg`，Wikimedia Commons `File:602sqdn-spit1.jpg`，图注为 602 中队 Supermarine Spitfire Mk Ia，作者记录为 RAF Official, 1940。用于生成 `public/assets/unit-icons/britain-spitfire.png`。
- Hurricane：`public/assets/unit-icons/source/britain-air/hawker-hurricane-xii-canada-side.jpg`，Hawker Hurricane XII 侧视照片候选，较适合生成透明地图小图标。本地工作副本已降采样到约 2200px 长边，用于生成 `public/assets/unit-icons/britain-hurricane.png`。
- Bf 109：`public/assets/unit-icons/source/britain-air/messerschmitt-bf109e3.jpg`，Bf 109 E-3 侧视照片候选，较适合生成透明地图小图标。本地工作副本已降采样到约 2200px 长边，用于生成 `public/assets/unit-icons/luftwaffe-bf109.png`。
- Bf 110：`public/assets/unit-icons/source/britain-air/messerschmitt-bf110b-1940-side.jpg`，Bf 110 B 1940 侧视照片候选，较适合生成透明地图小图标。用于生成 `public/assets/unit-icons/luftwaffe-bf110.png`。
- Do 17：`public/assets/unit-icons/source/britain-air/dornier-do17z-1942.jpg`，Wikimedia Commons `File:Dornier Do 17 Z (1942).jpg`，SA-kuva / Finnish wartime archive photo。用于生成 `public/assets/unit-icons/luftwaffe-do17.png`。
- He 111：`public/assets/unit-icons/source/britain-air/heinkel-he111-battle-of-britain.jpg`，He 111 Battle of Britain 参考图候选，较适合生成透明地图小图标。用于生成 `public/assets/unit-icons/luftwaffe-he111.png`。
- 本轮为节省磁盘，已删除未进入运行管线的候选源图、U2Net 备用模型、pip 下载缓存和中间诊断截图，只保留六张实际源图、当前生产证据和版本快照。ISNet 生产模型不作为普通 Git 文件提交；仓库保留 `tools/models/segmentation/model-manifest.json`，实际模型应放在被忽略的 `engine-cache/models/segmentation/isnet-general-use.onnx`，大小 `178648008`，MD5 `fc16ebd8b0c10d971d3513d564d01e29`，SHA256 `60920e99c45464f2ba57bee2ad08c919a52bbf852739e96947fbb4358c0d964a`。
- ComfyUI/SD 调用模式已建立在 `scripts/run-comfyui-air-source-pass.py`：它调用 `/Users/asukarei/Documents/我心飞翔/tools/ComfyUI` 的既有服务、`v1-5-pruned-emaonly.safetensors`、`control_v11p_sd15_canny_fp16.safetensors` 和 `birefnet.safetensors`，不在本仓库复制或下载第二套 SD/ComfyUI 模型。默认只把源图重绘/飞行态候选保存到 `artifacts/london-air-comfy-source-pass-20260613/`；只有显式传 `--apply` 且 alpha/card/亮度纹理门禁通过时才会覆盖运行 PNG。脚本把本轮 `war_london_air_source_*` 临时输入和原始输出复制到本项目 `artifacts/` 后，会从外部 ComfyUI `input/` / `output/` 目录清理，避免把我心飞翔工具目录当成本项目缓存。若源图不是理想飞行态，可使用 `npm run assets:britain-air:comfy-flight` / `--flight-state` 让 ComfyUI 按机型数据生成或修正收起落架、无展架/跑道残留的飞行态，再进入 BiRefNet 抠图和运行态验收；不要把前置抠图完美度当作资产生产终点。
- 伦敦空战单位图标验收新增比例和质感要求：同一动画内按机型控制相对大小，Bf 109 最小，喷火/飓风略大，Bf 110 明显更宽，Do 17 / He 111 作为轰炸机最大但仍不能压住航迹；图标必须保留机身金属/蒙皮、座舱、发动机舱、翼面和面板线的质感，不能变成黑剪影、平灰图块或统一大小的贴纸。
- 本轮视觉证据保存在 `artifacts/london-air-segmentation-production-20260613/`、`artifacts/london-air-fix-20260613-visual-final/`、`artifacts/london-air-cache-cutout-fix-20260613/` 和版本快照 `artifacts/london-air-version-snapshots/20260613-before-segmentation-pipeline/`。早期 baseline 与 `visual-final` 目录只作为改动前和过程快照，最终验收以 `london-air-cache-cutout-fix-20260613` 为准。
- `artifacts/london-air-cache-cutout-fix-20260613/metrics.browser.json` 记录六类飞机实际浏览器请求均带 `?v=20260613-cutout-v2` 且响应 `Cache-Control: no-cache`，`genericAircraftMarkers=0`，关键节点无 console/pageerror；六类运行 PNG 指纹前缀为 Hurricane `14e4ef81e5bf`、Spitfire `f0f356a28d14`、Bf 109 `c7c9c71ded56`、Bf 110 `7f61d1e762bc`、Do 17 `e2adb4e3e52d`、He 111 `de3c4faedcda`。六类 PNG 的亮度均值/标准差分别约为 Hurricane `141.0/70.9`、Spitfire `151.5/79.1`、Bf 109 `146.9/86.9`、Bf 110 `101.6/68.3`、Do 17 `156.3/56.4`、He 111 `149.1/66.3`，不再是黑剪影或洗白平板。
- `artifacts/london-air-cache-cutout-fix-20260613/` 保存了 `01-opening-radar` 到 `06-channel-pursuit` 六个关键节点截图；`artifacts/london-air-screenshot-pixel-audit-20260613.py` 仍对 `visual-final` 五张截图复核 `darkComponents=[]`，用于黑块历史问题回归。按用户要求，截图只保存在 `artifacts/`，不在会话中展示图片。
- 2026-06-14 根据用户反馈“侧视飞机图标太薄，看不清”，伦敦空战运行 PNG 改为 ComfyUI 辅助的俯视/近俯视图标。`scripts/run-comfyui-air-source-pass.py --view top-down` 会先用源图调色、翼展/机长、翼型、发动机数和阵营标识生成本地俯视控制参考，再让 `/Users/asukarei/Documents/我心飞翔/tools/ComfyUI` 的 SD1.5 + ControlNet + BiRefNet 做金属/蒙皮/座舱/面板/迷彩细节加工，最终 alpha 由俯视控制参考约束，避免侧视照片条重新进入运行图标。正式应用证据保存在 `artifacts/london-air-comfy-topdown-apply-20260614/`。后续参考图修订把运行版本参数改为 `?v=20260614-reference-v1`。当前六类运行 PNG 指纹前缀为 Hurricane `29e0c15a6629`、Spitfire `f68b5518fb84`、Bf 109 `1d93829a6da5`、Bf 110 `12e3d9d097a9`、Do 17 `b55e852675f9`、He 111 `2b5aacdd31f2`。
- 2026-06-14 浏览器复核证据保存在 `artifacts/london-air-topdown-browser-20260614/`。`metrics.browser.json` 记录六类飞机实际 HTTP 响应均为 `200 image/png` 且 `Cache-Control: no-cache`；当时的雷达接触、上午混战、下午高峰等节点 DOM href 均为 `?v=20260614-topdown-v1`；`genericAircraftMarkers=0`，各阶段 `darkBlocks=[]`，无 console/pageerror。参考图修订后的运行版本为 `?v=20260614-reference-v1`，需在下一轮浏览器证据中复核。六张关键节点截图只保存在 artifacts，不在会话中展示。
- 2026-06-14 根据用户要求“Spitfire、Hurricane、Bf109、Bf110 参考 He111 优化，尤其尾翼和机身统一性”，将 He 111 成品转化为伦敦飞机单位质量带并纳入 `tests/battle-france-smoke.spec.ts` 和 `scripts/probe-london-air-visual-evidence.mjs`：亮度均值 `80-150`、亮度标准差 `46-88`、饱和度均值 `45-95`、上下翼平衡 `>0.82`、尾翼连接占比 `0.028-0.1`、尾翼根部到后机身 RGB 距离 `<32`。Bf 109 另在生成脚本中设置更严的 `<22` 目标，并做尾翼局部色彩融合，避免尾翼像独立色块贴在机身后部。新运行版本为 `?v=20260614-he111-standard-v1`；浏览器证据保存在 `artifacts/london-air-he111-standard-browser-20260614/`，记录 `consoleErrors=[]`、`pageErrors=[]`、六类飞机 HTTP `Cache-Control=no-cache`、`genericAircraftMarkers=0`、各阶段 `darkBlocks=[]`。当前六类运行 PNG 指纹前缀为 Hurricane `1c6151863cde`、Spitfire `8c9ddfd8f59f`、Bf 109 `b97be414206c`、Bf 110 `7340f19b99a9`、Do 17 `b31d0fc93a51`、He 111 `778853b2ce26`；Bf 109 的 `tailRootRearFuselageRgbDistance` 为约 `13.4`。
- 2026-06-14 修复用户反馈的播放画面抖动：连续帧探针显示伦敦开场和 11:05 镜头切换期间 `map-stage` 外框、`camera-layer` 手动 transform 均稳定，主要抖感来自非战术 cinematic 装饰层的漂浮 specks、重 blur 光晕/雾层，以及播放期大 SVG 底图每帧重算的额外压力。修复为：`CampaignMapAnimation` 缓存稳定投影下的国家路径，伦敦专属样式隐藏装饰性漂浮 specks，并让 `.cinematic-focus-glow` / `.cinematic-front-haze` 不使用 blur filter。回归门禁新增 `expectBattleOfBritainNoDecorativeCinematicJitter`，要求伦敦页 `visibleDecorativeSpecks=0`、`focusGlowFilter=none`、`frontHazeFilter=none`。证据保存到 `artifacts/london-air-jitter-fix-20260614/`，其中 `jitter-fix-samples.json` 记录 `consoleErrors=[]`、`pageErrors=[]`、过渡窗口 `sampleCount=260`、`stageX/Y/W/H delta=0`、`uniqueCameraTransforms=1`、`routeJump.max≈5.01px/50ms` 且无大跳、`eventJump.max=0`。截图只保存在 artifacts，不在会话中展示。
- 2026-06-14 修复截图中顶部标志仍显示“第 1 周”的口径错误：伦敦空战是 1940-09-15 单日小时级战斗，`BattleOfBritainAnimation` 必须显式传 `timeCounterLabel="小时"`，不能沿用 `CampaignMapAnimation` 的长战役默认“周”。伦敦专项 smoke 断言 `.day-counter` 包含“小时”且不包含“周”。
- 2026-06-14 用户复核后废弃 `mapSurfaceFeatures` 的 SVG wash/sheen 地图质感方案，改为真实 MapLibre 底图链：`scripts/prepare-britain-air-terrain3d.mjs --max-zoom 11` 下载跨海峡范围的 Esri World Topographic Map 本地 raster cache 与 AWS Terrain Tiles Terrarium DEM cache，运行时由 `BattleOfBritainTerrain3D` 加载 topo raster、real-dem terrain、hillshade、低透明度海峡/陆地 tone，并用 `mapTerrainLayer` 作为 `CampaignMapAnimation` 的底层 3D 地图。SVG 战术层只保留航迹、雷达链、战术空域和飞机，不再承担伪 3D 底图职责。
- 同轮新增并修正 ComfyUI 位图天气资产链：`scripts/run-comfyui-britain-weather-assets.py` 复用 `/Users/asukarei/Documents/我心飞翔/tools/ComfyUI` 现有 SD1.5 服务生成云体 RGB，项目脚本只做边缘背景亮度估计、云体 alpha 抽取、边缘淡出、密度归一和暗调色彩后处理，不再用手写椭圆或 distribution mask 画云团。正式运行资产为 `public/assets/weather/battle-of-britain/morning-cloud-bank.png` 与 `afternoon-cloud-breaks.png`，版本参数 `?v=20260614-comfy-weather-v4`。证据 `artifacts/london-air-comfy-weather-20260614-v11/manifest.json` 记录 `failures={}`；上午云层 `alphaRatio≈0.046`、`opaqueRatio≈0.116`，下午云层 `alphaRatio≈0.037`、`opaqueRatio≈0.224`，两者 `edgeVisibleRatio=0`，用于保证云层是 ComfyUI 天气素材而不是矩形雾毯或程序化中位图。
- 地图层六层合同已登记到 `tools/tactical-terrain-studio/specs/battle-of-britain-terrain-studio.json`，并可通过 `npm run terrain:pipeline -- --spec tools/tactical-terrain-studio/specs/battle-of-britain-terrain-studio.json --out artifacts/tactical-terrain-studio/battle-of-britain` 生成报告。当前 pipeline 状态为 `needs-review`，无 blockers；它承认后续公开级地图仍需 QGIS/GDAL 交叉校验 DEM/地形派生层、补历史战术底图层和完整来源/许可说明。运行级验收仍以浏览器证据、伦敦专项 Playwright 和人工截图检查为准。
- 2026-06-14 用户截图复核后确认一次地图层验收漏洞：`127.0.0.1:5177` 当时仍发布旧 bundle，导致页面没有加载 `BattleOfBritainTerrain3D` 和本地地形瓦片；即便新 bundle 加载，SVG 国家层若继续半透明铺色，也会把 MapLibre 地形压成平面色块。修复为重新发布当前 worktree 构建，伦敦 `has-terrain-underlay` 状态下国家层只保留边界线，MapLibre topo/DEM/hillshade 提高到主底图；伦敦专项 smoke 和 `scripts/probe-london-air-visual-evidence.mjs` 记录运行 bundle 指纹、地形瓦片 HEAD、国家填充透明、canvas 纹理变化和截图证据，防止“有节点但看不出 3D 质感”再次误过。
- 2026-06-14 继续按用户反馈修正三项地图/天气问题：底图亮度压低并保持较高饱和与对比；`BattleOfBritainTerrain3D` 改为 `svg-projection-registered-terrain`，MapLibre center/zoom 从 SVG `terrainView` 和 `mapView` 推导，地形 canvas 与战斗层同相机移动缩放；天气 PNG 不再放在独立背景或 MapLibre 图层，而是作为 `MapOverlayElement type="image"` 渲染在同一个 SVG `camera-layer` 中，位于地形之上、航线/飞机之下。浏览器证据保存在 `artifacts/london-air-map-registered-weather-v4-20260614/`，记录运行 bundle `/assets/index-CU8WXWoz.js`、天气版本 `20260614-comfy-weather-v4`、`consoleErrors=[]`、`pageErrors=[]`、地形注册最大误差约 `0.2-2.86px`、关键帧 `darkBlocks=[]`、`genericAircraftMarkers=0`。

## 不确定性和简化

- 具体每个中队起飞、接敌、脱离的分钟级时间有资料差异。动画按 RAF Museum 叙述中的主要时间段和规模关系做可视化压缩。
- 飞机数量不逐架复原，使用编队图标表达比例和角色：德军轰炸机多、护航战斗机伴随，RAF 以多批中队从不同机场加入。
- 伦敦上空的单机事件只作为局部节点，主叙事仍是大规模体系空战。
- 地形、海况和天气资料用于画面质感与战术能见度提示，不逐项复原云朵、浪形、楼群或山脊细节；跨海峡空战的可读飞机编队、雷达链和航迹仍是第一视觉层。
