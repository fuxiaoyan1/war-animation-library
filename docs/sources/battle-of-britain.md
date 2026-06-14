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

## 不确定性和简化

- 具体每个中队起飞、接敌、脱离的分钟级时间有资料差异。动画按 RAF Museum 叙述中的主要时间段和规模关系做可视化压缩。
- 飞机数量不逐架复原，使用编队图标表达比例和角色：德军轰炸机多、护航战斗机伴随，RAF 以多批中队从不同机场加入。
- 伦敦上空的单机事件只作为局部节点，主叙事仍是大规模体系空战。
