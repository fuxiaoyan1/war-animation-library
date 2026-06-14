# 战争动画藏书馆更新说明

更新时间：2026-06-13

## 坎尼会战与动画助手流程

2026-06-14 继续按 `animation-assistant` 和项目六层生产流程推进坎尼，不再把浏览器截图、DOM 指标和人工观察当作会话临时动作。

新增工具与流程：

- 新增 `npm run animation:visual-evidence`，底层为 `tools/tactical-terrain-studio/capture-runtime-visual-evidence.mjs`。
- `tools/tactical-terrain-studio/specs/cannae-terrain-studio.json` 现在声明运行时视觉证据抓取配置：坎尼 10 个关键帧、垓下/碾庄参考帧、截图文件名、单位选择器、最小参考单位数和复审阈值。
- `npm run animation:workflow -- --visual-evidence <dir>` 会读取 `metrics.dom.json`，把浏览器运行结果回流到 workflow。若单位过密、结果帧过密、资产复用或结尾队列表演，会重新打回第 4/5/6 层。
- `analyze-runtime-visual-evidence.mjs` 增加 `minReferenceUnitCount`，避免参考动画刚开场单位尚未进入时被误算成 3-5 个单位，从而把坎尼误判成几十倍超标。
- `docs/tools/animation-assistant-workflow.md` 增加 Runtime Visual Evidence Loop，明确截图只存 `artifacts/`，不嵌入会话。

坎尼本体修正：

- `CannaeTerrain3D` 的视觉 LOD 改为阶段化控制：逻辑单位仍独立运动和转向，运行时只降低地图尺度下的可视实例密度，避免早中段 150-180 个图标叠成雾状。
- 结果帧保留迦太基胜利方和罗马残部，不再用“少数傻子”式删减或胜利方消失来过关。
- 指挥群资产补入 `unitSets`：`roman-command-group` 和 `carthaginian-command-group` 映射到对应运行图标，使第 4 层资产-单位合同可达 `ready`。
- 坎尼专项测试的接触距离从“中心点距离”改为“可见图标边界距离”，避免宽骑兵图标为通过中心点测试被硬塞进敌方单位；同时保留双重包围、后封、胜利方保留和残部可见断言。
- 单位数量门禁从旧的高密度目标改成参考包络目标，避免测试反向鼓励雾状黑团。

关键证据：

- 运行时截图和 DOM 指标：`artifacts/cannae-visual-pass-20260614-lod-v7/`
- workflow 复审：`artifacts/animation-assistant-workflow/cannae-20260614-lod-v8-review/`
- v7 复审状态：`runtime-visual-review-ready`
- 六层 workflow 状态：`canProceedToImplementation=true`
- 5177 发布目录修正：常驻服务读取 `~/Library/Application Support/war-animation-lab-oss/dist`，源码构建后必须再执行 `npm run preview:local -- --port 5177 --skip-build`，否则会继续抓旧 JS。

## 伦敦上空的鹰

本次把 `伦敦上空的鹰` 按垓下、碾庄的成熟制作流程继续升级，目标是作为二战空战动画范本，而不是停留在通用航线示意。

主要变化：

- 保留当前版本基线到 `artifacts/london-air-baseline-20260613/`，包括 HEAD、分支、状态、相关文件快照和全工作区 diff。
- 首屏保持地图优先，并把镜头从泛伦敦视角改为伦敦、肯特、泰晤士河口和海峡返航走廊的战术空域视角。
- 新增泰晤士空中走廊、伦敦防空核心、肯特雷达链、轰炸机流走廊、RAF 拦截屏、海峡返航追击、11群扇区升空线、12群大编队南下线、雷达至乌克斯布里奇指挥矢量和扇区控制标记。
- 主要航线新增 `positionAnchor` / `positionAnchors`，让轰炸机流、RAF 拦截、返航追击和大编队增援绑定到明确战术空域，避免航线像漂浮装饰。
- RAF 单位从通用 `ww2Fighter` 改为 `britainSpitfire` / `britainHurricane`；德军从通用 `ww2Bomber` / `ww2Fighter` 改为 `luftwaffeDo17`、`luftwaffeHe111`、`luftwaffeBf109`、`luftwaffeBf110`。
- 新增 `scripts/build-britain-air-unit-icons.mjs`，从真实飞机照片裁切、透明化和缩放生成运行用 PNG 机型图标。生产分割模型按 `tools/models/segmentation/model-manifest.json` 校验，并放在被 Git 忽略的 `engine-cache/models/segmentation/isnet-general-use.onnx`，不再把 ONNX 大模型作为普通仓库文件提交。
- 新增 `scripts/run-comfyui-air-source-pass.py` 和 `npm run assets:britain-air:comfy` / `npm run assets:britain-air:comfy-flight` / `npm run assets:britain-air:comfy:apply` 调用入口，接入 `/Users/asukarei/Documents/我心飞翔/tools/ComfyUI` 现有 SD1.5 + ControlNet Canny + BiRefNet 服务，默认只生成候选，不复制或下载第二套 SD/ComfyUI 模型。源图不是理想飞行态时，使用 `--flight-state` 让 ComfyUI 按机型数据生成/修正飞行态，不把前置抠图完美度当作资产生产终点。
- 不展示图片到会话；素材源图、图标 contact sheet 和后续浏览器截图证据均保存到 `artifacts/`。

用户截图反馈后的继续修正：

- 地图“大黑块”：`battleOfBritain` 的伦敦防空核心、轰炸机流走廊等战术地形全部按 `line` / `contour` 表达；`.battle-of-britain` 作用域内隐藏战术地形裙边/墙面并强制 surface/highlight `fill: none`；现代空战显式关闭古地图装饰层，并调亮底图/降低暗角，避免 SVG 默认填充或暗色底图形成大块遮挡。
- 作战单位抠图：重新生成六类飞机 PNG，运行资产来自真实飞机照片裁切，并用每类机型专属 alpha matte 抠图；边缘和四角透明只是底线，新增外接盒占比、外接盒内部填充率和行列覆盖门禁，避免“边角透明但主体仍像矩形照片卡”。伦敦空战飞机椭圆阴影已隐藏。
- 作战单位实际引用：用户截图继续显示照片条后，先查运行页是否真正使用新作战单位。DOM 复核确认伦敦页已引用 `britainSpitfire`、`britainHurricane`、`luftwaffeBf109`、`luftwaffeBf110`、`luftwaffeDo17`、`luftwaffeHe111`，不是退回 `ww2Fighter` / `ww2Bomber`；但固定同名 PNG 路径曾配合 `Cache-Control: public, max-age=31536000, immutable`，用户浏览器可能继续显示旧图。现已把伦敦六类飞机 href 改为 `?v=20260613-cutout-v2`，并让本地预览服务对 `assets/unit-icons/` 返回 `no-cache`。
- 作战单位 alpha 根因：上一版脚本把 `photo_mask` 与 ISNet 分割结果取并集，导致照片背景差异被重新并进 alpha，出现“边角透明但主体内部仍像照片条”。正式脚本改为“真实照片 RGB + ISNet 分割与机型包络相交 alpha”，He 111 仅局部启用 photo assist 补足漏分割主体，不再把背景条作为透明主体保留。
- 作战单位比例/质感：伦敦同片内飞机 marker 不再统一塞进同宽框，按 Bf 109、喷火/飓风、Bf 110、Do 17/He 111 建立可见大小层级；ComfyUI 候选和 Playwright PNG 检查新增亮度/纹理约束，防止真实照片或重绘后退化成黑剪影、平灰图块或无金属/蒙皮质感的贴纸。
- 运镜关注：伦敦空战不再用单一 `britainAirLondon` 镜头，改为 `britainAirRadar`、`britainAirCombat`、`britainAirReturn` 三段战术视窗；雷达开场和 13:45 预警跟随雷达链，13:45 前预卷到雷达视角，上午/下午狗斗跟随伦敦东南主战区，回程阶段跟随肯特海岸/海峡追击。

## 新增/强化门禁

- `campaign data quality gates` 要求 `battleOfBritain` 的非隐藏空中单位路线不再使用 `ww2Fighter` / `ww2Bomber`，并且必须显式声明真实机型图标，不能靠组件默认 `unitIcon` 兜底。
- `campaign data quality gates` 要求每条非隐藏空中单位路线绑定到已存在的战术空域锚点。
- `battle of britain shows radar directed compact air formations` 检查喷火、飓风、Bf 109、Bf 110、Do 17、He 111 六类 PNG 实图素材、按机型配置的紧凑 marker 尺寸、透明边缘/透明四角、战术空域叠层、低影响字幕、地图交互、空战缠斗特效和无舰炮式 `salvo`。
- 伦敦专项 smoke 增加雷达/混战镜头几何断言：`camera-layer` 必须在雷达、混战节点切到对应 `data-map-focus`；开场、10:55 雷达、11:30 混战、13:45 预警、14:45 高峰的当前事件点必须落在地图核心区；雷达航迹、雷达指挥矢量和狗斗圈必须位于主战区核心。
- 伦敦专项 smoke 增加黑块回归断言：大面积可见战术地形 path 不得是默认黑色填充，页面实际 SVG 渲染也不得出现大面积暗色块；伦敦页不得挂古地图装饰层。
- 伦敦专项 smoke 增加抠图回归断言：六类飞机 PNG 除边缘/四角透明外，还必须满足 alpha 外接盒、外接盒内部填充率和最大行/列覆盖率约束；Do 17 作为长机身轰炸机允许 `maxBBoxFillRatio=0.6`，但不豁免边缘/四角、行列覆盖、marker 尺寸和截图视觉门禁；页面上飞机 marker 的椭圆阴影不可见。
- 伦敦专项 smoke 增加比例/质感回归断言：PNG 可见区域亮度均值和标准差必须保留真实材质层次；页面 marker 要求 Bf 110 宽于喷火约 20% 以上，Do 17 宽于喷火约 35% 以上，He 111 为本片最大飞机 marker 且仍低于紧凑上限。
- 伦敦专项 smoke 增加实际引用回归断言：六类飞机 DOM `href` 必须带 `?v=20260613-cutout-v2`，防止同名 PNG 被浏览器旧缓存掩盖；本地静态服务对 `assets/unit-icons/` 不再使用 immutable 长缓存。
- 真实飞机图像来源、加工脚本、生产模型校验和与磁盘清理记录在 `docs/sources/battle-of-britain.md` 与 `docs/sources/unit-icons.md`。

## 已验证

- `git diff --check`
- `npm exec tsc -- -b`
- `npm run build`
- `npm run preview:local -- --skip-build`
- `FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "campaign data quality gates"`
- `FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "battle of britain shows radar directed compact air formations"`
- `FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "gaixia ambush uses terrain map ten-sided formations and pipa score"`
- `FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "nianzhuang battle shows Huang Baitao pocket relief blocking trenches and final pursuit"`
- `node /Users/asukarei/.codex/skills/animation-assistant/scripts/check-animation-project.mjs /Users/asukarei/Desktop/war-animation-lab-oss`

首轮浏览器截图证据已保存到 `artifacts/london-air-baseline-20260613/browser-evidence/`：

- `01-opening-radar.png`
- `02-morning-dogfight.png`
- `03-afternoon-dogfight.png`
- `metrics.json`

`metrics.json` 记录本轮无 console/pageerror，地图舞台约 `1412 x 867`，9 项战术空域叠层均渲染，Britain/Luftwaffe 飞机 marker 均为紧凑实图 PNG 资产。

用户截图反馈后的过程诊断目录已经清理，避免磁盘继续堆积。最终复核浏览器证据保存到 `artifacts/london-air-fix-20260613-visual-final/`：

- `01-opening-radar.png`
- `02-radar-contact.png`
- `03-morning-dogfight.png`
- `04-afternoon-warning.png`
- `05-afternoon-peak.png`
- `metrics.browser.json`
- `metrics.pixel.json`

`visual-final/metrics.browser.json` 记录：

- `consoleErrors=[]`，`pageErrors=[]`。
- 五个采样节点 `largeDarkRenderedBlocks=[]`，`filledFortifiedPolylines=[]`，`ancientMapOrnaments=0`，`visibleAircraftShadows=0`，`genericAircraftMarkers=0`。
- 当前事件相对地图位置：开场雷达约 `(0.222, 0.173)`，雷达接触约 `(0.635, 0.536)`，上午混战约 `(0.487, 0.435)`，13:45 预警约 `(0.509, 0.413)`，下午高峰约 `(0.551, 0.334)`；雷达节点焦点为 `britainAirRadar`，上午/下午主战区焦点为 `britainAirCombat`。
- 六类飞机 PNG 的 `edgeVisibleRatio=0`、`cornerAlphaMax=0`，`bboxFillRatio` 为 Spitfire `0.345`、Hurricane `0.464`、Bf 109 `0.335`、Bf 110 `0.431`、Do 17 `0.571`、He 111 `0.404`。

磁盘清理同步记录：

- 删除重复/备用模型 `tools/models/segmentation/u2net-rembg.onnx`。当前只保留 ISNet 生产模型 manifest，实际模型文件在本地 `engine-cache/models/segmentation/isnet-general-use.onnx`，大小 `178648008`，MD5 `fc16ebd8b0c10d971d3513d564d01e29`，SHA256 `60920e99c45464f2ba57bee2ad08c919a52bbf852739e96947fbb4358c0d964a`。
- 清空本轮 pip 下载缓存；卸载失败尝试链路中的 `transparent-background` 及其专属依赖后，只保留 `rembg`、`onnxruntime`、`PyMatting` 等当前脚本所需运行库。
- 删除伦敦空战中间诊断截图和未进入运行管线的候选飞机源图；`public/assets/unit-icons/source/britain-air/` 只保留六张实际生产源图，Hurricane/Bf 109 工作副本降采样后重跑通过，Do 17 因降采样触发抠图门禁而保留原图。
- 新增 `scripts/run-comfyui-air-source-pass.py`，调用 `/Users/asukarei/Documents/我心飞翔/tools/ComfyUI` 已有 SD1.5 + ControlNet Canny + BiRefNet 运行栈，从源图和机型数据生成飞机图标重绘/飞行态候选，不复制、不下载第二套 ComfyUI/SD 模型。默认候选证据保存到 `artifacts/london-air-comfy-source-pass-20260613/`；未加 `--apply` 时不会覆盖当前运行图标。
- 新增 `docs/tools/britain-air-comfyui-style-pass.md`，记录源图候选、`--flight-state` 飞行态生成/修正、正式应用、外部 ComfyUI 临时文件清理、候选 contact sheet 和正式应用后的构建/Playwright/浏览器证据步骤。

`visual-final/metrics.pixel.json` 记录五张截图均 `darkComponents=[]`，没有大面积黑色连通块；这是本轮人工视觉检查的落盘证据，不再只以 DOM 数值门禁宣称修复。按用户要求，截图只保存在 `artifacts/`，不在会话中展示。

用户继续反馈“作战单位没有被使用/仍是照片条”后的最终复核证据保存到 `artifacts/london-air-cache-cutout-fix-20260613/`：

- `metrics.browser.json` 记录六类飞机请求全部为 `?v=20260613-cutout-v2`，响应 `Cache-Control: no-cache`，页面 `genericAircraftMarkers=0`，无 console/pageerror。
- 六类运行 PNG 指纹前缀为 Hurricane `14e4ef81e5bf`、Spitfire `f0f356a28d14`、Bf 109 `c7c9c71ded56`、Bf 110 `7f61d1e762bc`、Do 17 `e2adb4e3e52d`、He 111 `de3c4faedcda`。
- `01-opening-radar.png` 到 `06-channel-pursuit.png` 为本轮浏览器视觉检查截图；不在会话中展示。

用户继续反馈“侧视飞机图标太薄、地图上看不清”后的俯视图标迭代：

- `scripts/run-comfyui-air-source-pass.py` 新增 `--view top-down`：先按机型数据和源图色彩生成俯视控制参考，再调用既有 ComfyUI SD1.5 + ControlNet + BiRefNet 做金属/蒙皮/座舱/面板/迷彩质感加工，最终 alpha 由俯视控制参考约束，避免侧视照片条回流。
- 正式应用命令为 `npm run assets:britain-air:comfy -- --view top-down --apply --steps 20 --cfg 8.0 --denoise 0.74 --control-strength 0.5 --control-end-percent 0.68 --output-dir artifacts/london-air-comfy-topdown-apply-20260614`。
- 六类运行 PNG 已覆盖为俯视/近俯视图标，后续参考图修订后的运行版本参数更新为 `?v=20260614-reference-v1`。当前指纹前缀：Hurricane `29e0c15a6629`、Spitfire `f68b5518fb84`、Bf 109 `1d93829a6da5`、Bf 110 `12e3d9d097a9`、Do 17 `b55e852675f9`、He 111 `2b5aacdd31f2`。
- `UnitIcon` 中伦敦飞机 marker 改为俯视比例：单发战斗机约 `46-50 x 40-44`，Bf 110 / Do 17 / He 111 更大但仍控制在地图编队可读范围内。
- 伦敦专项测试同步从侧视“横向长度层级”改为俯视“高度/面积层级”，并放宽俯视翼面合理的 `bboxFillRatio` / column coverage，同时继续限制黑块、洗白、照片卡、透明边缘和旧缓存。
- 2026-06-14 复建生产预览后重新跑浏览器视觉取证，证据目录为 `artifacts/london-air-topdown-browser-20260614/`：六张关键节点截图覆盖开场雷达、雷达接触、上午混战、下午预警、下午高峰和海峡追击；`metrics.browser.json` 记录 `consoleErrors=[]`、`pageErrors=[]`、六类飞机 HTTP `Cache-Control=no-cache`、`genericAircraftMarkers=0`、各阶段 `darkBlocks=[]`。后续参考图修订把运行版本提升到 `?v=20260614-reference-v1`，避免浏览器继续读取旧 PNG。

用户继续要求“Spitfire、Hurricane、Bf109、Bf110 参考 He111 优化”后的 He 111 标准化迭代：

- `scripts/run-comfyui-air-source-pass.py` 增加 He 111-derived 质量带和 Bf 109 尾翼色彩融合：亮度均值 `80-150`、亮度标准差 `46-88`、饱和度均值 `45-95`、上下翼平衡 `>0.82`、尾翼连接占比 `0.028-0.1`，并新增 `tailRootRearFuselageRgbDistance`，避免尾翼和后机身颜色断裂但仍通过简单 alpha/连接门禁。
- Bf 109 的尾翼根部到后机身 RGB 距离从约 `36.1` 降到约 `13.4`，运行 PNG 指纹更新为 `b97be414206c`；其他五型同步保持在 He 111 质量带内，当前指纹为 Hurricane `1c6151863cde`、Spitfire `8c9ddfd8f59f`、Bf 110 `7340f19b99a9`、Do 17 `b31d0fc93a51`、He 111 `778853b2ce26`。
- `UnitIcon` 运行版本参数提升到 `?v=20260614-he111-standard-v1`；伦敦专项 Playwright 和浏览器证据脚本都检查六类飞机的新版本、`Cache-Control=no-cache`、无通用飞机 fallback、无大黑块，以及 He 111 质量带全项通过。
- 新浏览器视觉证据保存到 `artifacts/london-air-he111-standard-browser-20260614/`：六个关键帧截图覆盖开场雷达、雷达接触、上午混战、下午预警、下午高峰和海峡追击；`metrics.browser.json` 记录 `consoleErrors=[]`、`pageErrors=[]`、`genericAircraftMarkers=0`、各阶段 `darkBlocks=[]`，六类 PNG HTTP 响应均为 `200 image/png` 且 `Cache-Control=no-cache`。

用户反馈“画面经常抖动”后的播放稳定性修复：

- 先用 Playwright 连续帧探针复核，证据目录为 `artifacts/london-air-jitter-probe-20260614/`、`artifacts/london-air-jitter-probe-20260614-playback/` 和 `artifacts/london-air-jitter-probe-20260614-transition/`。静止事件帧和开场播放段显示 `camera-layer` transform 稳定，`map-stage` 外框没有布局位移；11:05 镜头切换窗口暴露出非战术 cinematic 装饰层和活动事件视觉层会放大抖感。
- 修复一：`CampaignMapAnimation` 对稳定投影下的国家路径做 `useMemo` 缓存，减少播放期间大 SVG 底图每帧重算，降低卡顿型抖感。
- 修复二：伦敦专属样式隐藏 `.cinematic-map-effects circle:not(.cinematic-focus-glow)` 的装饰性漂浮 specks，并让 `.cinematic-focus-glow` / `.cinematic-front-haze` 不再使用 heavy blur filter；保留真实战术运动层、飞机航迹和狗斗效果。
- 伦敦专项 smoke 新增 `expectBattleOfBritainNoDecorativeCinematicJitter`，检查 `visibleDecorativeSpecks=0`、`focusGlowFilter=none`、`frontHazeFilter=none`，防止后续把非战术漂浮层重新叠回地图。
- 伦敦顶部时间标志从默认“第 N 周”改为“第 N 小时”，符合 1940-09-15 单日小时级空战口径；专项 smoke 增加 `.day-counter` 包含“小时”且不包含“周”的断言，避免短时战术动画继续套长战役周粒度。
- 修复后证据保存在 `artifacts/london-air-jitter-fix-20260614/`：`jitter-fix-samples.json` 记录 `consoleErrors=[]`、`pageErrors=[]`、`sampleCount=260`、`uniqueCameraTransforms=1`、`stageX/Y/W/H delta=0`、`routeJump.max≈5.01px/50ms` 且无大跳、`eventJump.max=0`；截图只保存在 artifacts，不在会话中展示。

用户继续要求“跨海峡、跨国家空战地图主要看 3D 质感，不要精细画山脉、高楼、海浪、云朵”后的地图底板迭代：

- 用户截图复核后，上一版 `mapSurfaceFeatures` / SVG wash-sheen 方案被判定不达标，本轮废弃该路径，改成真实 MapLibre 地形底图：`scripts/prepare-britain-air-terrain3d.mjs --max-zoom 11` 下载跨海峡范围 Esri World Topographic Map raster cache 和 AWS Terrain Tiles Terrarium DEM cache，运行目录为 `public/assets/maps/battle-of-britain-3d/`，`manifest.json` 记录 `downloaded=1034`、`failed=0`，体量约 53M。
- `CampaignMapAnimation` 新增 `mapTerrainLayer` 扩展点；`BattleOfBritainAnimation` 通过 `BattleOfBritainTerrain3D` 接入 MapLibre topo raster、real DEM terrain、hillshade、低透明度海峡/陆地 tone 和斜视阶段镜头。SVG 层改为透明 tactical overlay，飞机、航线、雷达链和狗斗效果保持在地形与天气层之上。
- 云层和天气变化不再用 CSS/SVG 形状表达，而是作为 ComfyUI 位图天气资产生产：`scripts/run-comfyui-britain-weather-assets.py` 复用 `/Users/asukarei/Documents/我心飞翔/tools/ComfyUI` 既有 SD1.5 服务生成云体 RGB，项目脚本只做边缘背景亮度估计、云体 alpha 抽取、边缘淡出、密度归一和暗调色彩后处理，不再用手写椭圆或 distribution mask 画云团。正式资产为 `public/assets/weather/battle-of-britain/morning-cloud-bank.png` 与 `afternoon-cloud-breaks.png`，版本参数 `?v=20260614-comfy-weather-v4`。
- 天气资产证据保存在 `artifacts/london-air-comfy-weather-20260614-v11/`：`manifest.json` 记录 `failures={}`；上午云层 `alphaRatio≈0.046`、`opaqueRatio≈0.116`，下午云层 `alphaRatio≈0.037`、`opaqueRatio≈0.224`，两者 `edgeVisibleRatio=0`。这组指标用于防止云层退化成矩形雾毯、程序化中位图或把航迹、飞机盖住。
- 伦敦专项 smoke 改为 `expectBattleOfBritainTerrain3DMap` 与 `expectBattleOfBritainWeatherAssets`：检查 `data-renderer="maplibre-real-terrain"`、DEM/topo source、MapLibre canvas 覆盖、terrain loaded、云层在地形之上但在飞机之下、天气 PNG 的版本化 src、HTTP `image/png` 响应、alpha/opaque/边缘透明范围和无通用飞机 fallback。
- 地图六层合同新增 `tools/tactical-terrain-studio/specs/battle-of-britain-terrain-studio.json`，并已运行 `npm run terrain:pipeline -- --spec tools/tactical-terrain-studio/specs/battle-of-britain-terrain-studio.json --out artifacts/tactical-terrain-studio/battle-of-britain`。当前报告状态是 `needs-review`，无 blockers；它明确后续公开级地图仍需补 QGIS/GDAL DEM 派生层、历史战术底图层、来源/许可信息和密集单位 LOD 复审，不把本轮运行级地图升级伪装成完整专业 GIS 终版。
- `scripts/probe-london-air-visual-evidence.mjs` 同步从 `mapSurface` 指标改为 `terrain3D` / `weatherPngMetrics` 指标，记录 MapLibre renderer、terrain loaded、terrain/cloud/aircraft DOM 顺序、云层 href、天气 PNG HEAD 响应和 alpha 统计，并继续保存六个关键帧截图到 `artifacts/`，不在会话中展示图片。
- 用户随后截图显示“没看出来”后，复核确认不是资料层缺失，而是当前 5177 发布目录仍在跑旧 bundle，且新地形 underlay 里 SVG 国家填色仍可能以半透明平面色压住 MapLibre 纹理。修复为重新发布当前 worktree 构建、静态服务补 `.jpg` 为 `image/jpeg`、伦敦地形 underlay 下国家层改为边界-only，并提高 topo/DEM/hillshade 的可见质感。伦敦专项 smoke 与视觉证据脚本新增运行 bundle 指纹、地形瓦片 HEAD、国家填充透明和 canvas 纹理指标，避免“DOM 有地形但肉眼仍是平面图”误过。
- 用户继续反馈“地图太亮、地图层和战斗层分裂、云层没看到”后，地形层改为 `svg-projection-registered-terrain`：MapLibre center/zoom 由 SVG `terrainView`、容器缩放和 `mapView` 计算，`pitch=0`、`bearing=0`，并输出注册误差指标；天气 PNG 改为同 `camera-layer` 的 SVG image overlay，跟随战斗层移动缩放，位于地形之上、航线/飞机之下。视觉证据保存到 `artifacts/london-air-map-registered-weather-v4-20260614/`，记录运行 bundle `/assets/index-CU8WXWoz.js`、天气版本 `20260614-comfy-weather-v4`、`consoleErrors=[]`、`pageErrors=[]`、关键帧 `darkBlocks=[]`、`genericAircraftMarkers=0`，地形亮度均值约 `149-169`，饱和度约 `21.8-97.3`，注册最大误差约 `0.2-2.86px`。

真实故障根因同步记录：

- 黑块不是单纯“底图太暗”，而是伦敦作用域样式缺失叠加 `fortified-line-layer` 的 SVG `polyline` 默认黑色填充；修复必须同时有 `.battle-of-britain` scoped CSS、`polyline fill="none"` 和截图像素连通域复核。
- 飞机资产不能用几何示意或整张照片卡。当前运行 PNG 的颜色来自真实照片，透明轮廓由 ISNet 分割与机型包络相交控制，并由版本化 DOM href、HTTP no-cache、Playwright 和浏览器截图共同复核。
- 若用户截图仍显示旧照片条，优先查“页面实际 href / HTTP 缓存 / 发布目录指纹 / 浏览器请求”，不要先归咎于门禁阈值。
- 运镜不能只断言焦点名称，必须检查当前事件、雷达指挥线、狗斗圈和飞机编队相对地图核心的位置，防止画面停在大片空地上。
- 播放画面抖动不能只看静态截图。先采样连续帧，分别检查 `map-stage` 外框、`camera-layer` transform、投影切换窗口、单位位置/旋转和 CSS 动画层；伦敦这次的抖感来自非战术 cinematic 漂浮/blur 层和底图重算压力，而不是自动镜头复位。
