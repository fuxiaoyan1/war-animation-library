# 伦敦上空的鹰：第五层近似 3D 地图层工艺

Battle of Britain London Layer 5 near-3D map workflow.

本文替代上一版“地图、气象与单位六层概览”。上一版的问题是把六层平均铺开，真正需要交接给另一个会话的“地图层”只写成了摘要。本文只聚焦当前动画六层工艺中的第五层：近似 3D 地图层。气象、单位、动线和证据只作为第五层的上下游接口出现。

本文件吸收了三类材料：

- 当前仓库实现：`BattleOfBritainTerrain3D`、`CampaignMapAnimation`、伦敦专项 Playwright、视觉证据脚本和更新说明。
- 归档会话：6 月 13 日起把“伦敦上空的鹰”做成空战范本的基线保护、成熟流程复用、地图/云层/配乐/单位多轮修正，以及 6 月 15 日 GitHub 提交助手已推送的文档版本。
- mempalace：`workflow`、`visual-rules`、`failure-modes` 中关于 MapLibre 真实地形、SVG wash 失败、旧 bundle 误导、国家填色压平地形、白昼色彩门禁、局部云朵可辨识和连续帧稳定的规则。

仓库级规则仍以 `AGENTS.md`、`animation-assistant`、`docs/tools/tactical-terrain-studio.md` 和成熟 Playwright 门禁为准。本文是伦敦案例沉淀出来的第五层可执行工艺，不是新的 P0 规则文件。

## 第五层目标

第五层不是“画一个更好看的英国地图”，而是生产一个能承载空战叙事的近似 3D 地图底板。

对 `伦敦上空的鹰` 来说，用户的目标已经明确过：跨海峡、跨国家空战地图主要看 3D 质感，不需要精细画山脉、高楼、海浪和云朵。成熟答案不是在 SVG 上画山纹、海浪、黑影或大雾，而是：

- 使用真实地形数据和 topo 纹理做底板；
- 通过 DEM hillshade、地形明暗、局部纹理、钢蓝海面、暖土地表和标签分离制造近似 3D 观感；
- 让地图始终低于飞机、航线、雷达链、狗斗效果和地名标签的视觉优先级；
- 让 MapLibre 地形和 SVG 战术层注册到同一套相机语义，避免地图层与战斗层分裂；
- 用浏览器最终截图和连续帧指标验收，不接受“DOM 有地形节点”作为合格证明。

Current accepted runtime target:

- renderer: `maplibre-real-terrain`
- terrain model: `real-dem-raster-terrain`
- camera mode: `svg-projection-registered-terrain`
- visual contract: `maplibre-real-terrain-no-polygon-color-blocks`
- terrain color model: `real-terrain-texture-runtime-relief-contours-no-polygon-blocks`
- latest evidence: `artifacts/london-air-terrain-gis-runtime-20260615-final-v6/metrics.browser.json`

## 与六层工艺的关系

另一个会话整合时应把本文当作“第五层地图层”合同，而不是重新拆成六段简写。

建议接口如下：

1. 第一层资料层给第五层提供战术片场：伦敦、肯特、泰晤士河口、海峡返航走廊、法国海岸、雷达链、RAF 扇区和德军来袭线。
2. 第二层地形/底图资产层给第五层提供 tile package：topo raster、Terrarium DEM、hillshade 可用性、瓦片 MIME 和来源/许可说明。
3. 第三层作战单位与气象素材层给第五层提供“覆盖约束”：飞机必须在地图上可读，云朵只能作为局部天气单位，不得变成全图调色层。
4. 第四层战术动线和镜头脚本层给第五层提供 `terrainView`、`mapView`、`registrationSamples`、`mapFocus` 和关键相机阶段。
5. 第五层近似 3D 地图层输出真实地形 underlay、透明 SVG tactical overlay、注册相机、色彩合同、层级合同和可测试 data attributes。
6. 第六层视觉证据和发布门禁层验收第五层：最终截图、tile HEAD、bundle 指纹、注册误差、色彩分位、纹理指标、连续帧稳定和用户截图复核。

`docs/tools/tactical-terrain-studio.md` 中的八个 contract 仍有价值，但在本次六层整合里不要照搬成第 5 层之外的完整新流程。伦敦第五层主要吸收其中的 `source-map-data-package`、`dem-terrain-layer`、`historical-tactical-basemap-layer`、`3d-oblique-camera-layer` 和 `visual-evidence-layer`；单位高度采样和完整 GIS 派生仍是后续增强项。

## 成熟基线

`伦敦上空的鹰` 当前是 1940-09-15 Battle of Britain Day 的单日小时级战术空战，不再是 1940-07-10 至 1940-09-15 的大战役压缩。

运行基线：

- wrapper: `src/components/BattleOfBritainAnimation.tsx`
- shared renderer: `CampaignMapAnimation`
- terrain underlay: `src/components/BattleOfBritainTerrain3D.tsx`
- data source brief: `docs/sources/battle-of-britain.md`
- terrain studio spec: `tools/tactical-terrain-studio/specs/battle-of-britain-terrain-studio.json`
- color workflow: `docs/tools/map-color-grading-workflow.md`
- smoke gates: `tests/battle-france-smoke.spec.ts`
- five-minute tactical pacing: `playbackDurationSeconds={300}`
- time counter: `timeCounterLabel="小时"`
- current music: `/audio/wikimedia-wagner-ride-valkyries.ogg`

当前第五层核心参数：

- map bounds: `[-1.75, 50.52, 2.12, 52.22]`
- terrain tiles: `/assets/maps/battle-of-britain-3d/terrarium/{z}/{x}-{y}.png`
- topo tiles: `/assets/maps/battle-of-britain-3d/topo/{z}/{x}-{y}.jpg`
- terrain exaggeration: `1.35`
- hillshade exaggeration: `0.72`
- topo raster opacity: `0.15`
- runtime GIS derivatives: `/assets/maps/battle-of-britain-3d/derived/battle-of-britain-contours-runtime.geojson`
- runtime relief texture: `/assets/maps/battle-of-britain-3d/derived/battle-of-britain-runtime-relief.png`
- runtime GIS manifest: `/assets/maps/battle-of-britain-3d/derived/manifest.json`
- registered camera pitch: `0`
- registered camera bearing: `0`
- MapLibre camera update threshold: `0.025-zoom`
- canvas color filter: `saturate(2) contrast(1.16) brightness(0.71) hue-rotate(16deg)`
- country fill when terrain active: transparent or none, boundary-only

注意：terrain studio spec 里保留过早期 pitched stage 参数，例如 pitch `55-57`、bearing `-18` 到 `-24`。那是生产合同和能力探索材料。当前最终运行版为了解决“地图层和战斗层分裂”，采用 `svg-projection-registered-terrain`，MapLibre pitch/bearing 固定为 `0/0`，用 topo/DEM/hillshade/调色制造近似 3D 质感。

## 第五层输入条件

第五层开工前必须具备以下输入。缺一项就不要直接写组件，因为后面很容易退回伪 3D 或大色块。

### 战术片场输入

伦敦地图层要服务的不是行政地图，而是以下空战空间：

- RAF Chain Home / 肯特雷达链；
- RAF Uxbridge / 11 Group 指挥；
- 11 群和 12 群起飞扇区；
- 德军从加来、布洛涅、格里内角方向越岸；
- 伦敦东南和南伦敦主接触区；
- 肯特海岸、邓杰内斯、泰晤士河口和海峡返航追击；
- 白天晴朗但存在局部云量线索的飞行天气。

对应资料以 `docs/sources/battle-of-britain.md` 为入口。地图层不能凭“英国地图好看”扩到大片空地，也不能把伦敦方向空战画成全国战略态势。

### 地形资产输入

运行资产包来自：

```bash
scripts/prepare-britain-air-terrain3d.mjs --max-zoom 11
```

运行输出：

- `public/assets/maps/battle-of-britain-3d/topo/{z}/{x}-{y}.jpg`
- `public/assets/maps/battle-of-britain-3d/terrarium/{z}/{x}-{y}.png`
- `public/assets/maps/battle-of-britain-3d/manifest.json`
- `public/assets/maps/battle-of-britain-3d/derived/battle-of-britain-contours-runtime.geojson`
- `public/assets/maps/battle-of-britain-3d/derived/battle-of-britain-runtime-relief.png`
- `public/assets/maps/battle-of-britain-3d/derived/manifest.json`

已记录的资产规模：

- manifest `downloaded=1034`
- manifest `failed=0`
- approximate size: about `53M`

来源角色：

- Esri World Topographic Map local cache: 只作为 topo raster 纹理参考，不作为最终标注主层。
- AWS Terrain Tiles Terrarium / SRTM-GMTED: 作为 MapLibre real DEM terrain 和 hillshade 来源。

边界：

- 当前运行演示需要这些 committed runtime tiles，不需要本机 QGIS/GDAL。
- 2026-06-15 验证版已经用本机 GDAL 从 committed Terrarium tiles 派生 DEM、hillshade、slope 和 contour QA 包，并把轻量 runtime contours 接入 MapLibre；这证明工具链可跑通，但仍不是最终公开级专业 GIS 版本。
- 后续若要做公开级专业地图，需要 QGIS/GDAL/QGIS 交叉校验 DEM 派生、历史战术底图和来源/许可链；这不阻塞当前运行级验收。

### 镜头输入

第五层不自己决定剧情镜头，它消费第四层给出的 camera/stage 数据。

当前伦敦三段：

- `britainAirRadar`: 雷达链和早期预警；
- `britainAirCombat`: 伦敦东南和肯特主战区；
- `britainAirReturn`: 肯特海岸和海峡返航追击。

第五层还需要：

- `terrainView.center`
- `terrainView.projectionScale`
- `mapView.scale`
- `mapView.x`
- `mapView.y`
- `registrationSamples`
- `mapWidth`
- `mapHeight`

这些输入用于把 MapLibre center/zoom 注册到 SVG battle camera，而不是让底图自己移动。

## 第五层制作步骤

### 1. 先冻结基线和确认当前预览

归档会话里最重要的流程信号是：用户要求把伦敦做成空战典型范本，并且明确反对“自搞一套”和“半吊子复用”。因此第五层改动前必须先保存伦敦基线，确认当前分支和预览不是旧产物。

最低动作：

- 记录当前 branch、HEAD 和伦敦相关 diff；
- build 完成后再发布本地预览；
- 不要在 `npm run build` 仍写 dist 时运行 `preview:local --skip-build`；
- 检查 5177 当前服务的 JS/CSS bundle 指纹。

旧 bundle 曾导致页面根本没有加载 `BattleOfBritainTerrain3D` 和本地瓦片，但 DOM/源码审查容易误判“已经修了”。第五层验收必须以当前发布预览为准。

### 2. 废弃 SVG wash/sheen 伪 3D

伦敦早期尝试过 `mapSurfaceFeatures`、SVG wash、sheen、veil 和装饰性 surface layers。用户截图判定这条路线不达标。mempalace 也记录为失败模式：它不接近真实地图生产质量，而且容易形成大雾、黑块和战术层遮挡。

第五层禁止把以下东西当成最终 3D 地图：

- SVG wash / sheen / veil；
- 手写椭圆、阴影块、伪山纹；
- 大面积 multiply/soft-light 伪层；
- 大面积 MapLibre polygon fill 色块；
- 全图天气罩；
- 半透明国家面填色覆盖真实地形；
- DOM 上有 terrain 节点但截图仍看不出地形纹理。

可以保留的只有真实地形 underlay 加透明 tactical overlay。

### 3. 建 MapLibre 真实地形 underlay

`BattleOfBritainTerrain3D` 的 MapLibre style 只保留必要底层：

- background sea color: `#365d72`
- topo raster layer: `battle-of-britain-topo-base`
- DEM hillshade layer: `battle-of-britain-dem-hillshade`
- real DEM terrain: `battle-of-britain-real-dem`
- runtime relief texture layer: `battle-of-britain-gis-relief-texture`
- runtime GIS contour source: `battle-of-britain-runtime-contours`
- runtime contour layers: `battle-of-britain-gis-subsea-contours`、`battle-of-britain-gis-land-contours`、`battle-of-britain-gis-coastline-contour`

当前地形参数：

```text
terrainExaggeration = 1.35
hillshadeExaggeration = 0.72
topoRasterOpacity = 0.15
minCachedTileZoom = 6
cachedTerrainTileZoom = 11
cachedTopoTileZoom = 11
```

topo raster paint 当前只做弱纹理：

```text
raster-brightness-max = 0.4
raster-brightness-min = 0.02
raster-contrast = 0.96
raster-opacity = 0.15
raster-saturation = 0.24
```

这么做的原因是：第三方 topo 自带英文标注、黑碎线和青绿海面，如果让它主导画面，会压过本项目地名、航线和飞机。伦敦最终经验是把 topo raster 降为纹理参考，把地名可读性交给项目自有 SVG label plate。

2026-06-15 验证版新增了 GDAL 派生的轻量坡面纹理与等高线/海岸线运行图层。它不是为了把动画变成 GIS 软件，而是把第五层地图的地形丰富度从“只有 raster/hillshade 感觉”推进到可验收的 GIS 派生信号：

- QA 包：`artifacts/london-air-terrain-gis-20260615/`
- DEM: `1472 x 1024`, EPSG:3857, elevation min/max about `-367m / 340m`, missing tiles `0`
- full contours: `5788` features at `25m`
- runtime contours: `3137` features at `50m`, stored under `public/assets/maps/battle-of-britain-3d/derived/`
- runtime relief texture: `1472 x 1024` transparent PNG derived from hillshade/slope, stored under `public/assets/maps/battle-of-britain-3d/derived/`
- derived manifest purpose: `runtime-fifth-layer-gis-derivatives-validation`

这个版本的验收口径是“工具链可跑通，并且视觉效果好于原版”，不是最终专业 GIS 交付。最终专业 GIS 版目标样图保存在 `artifacts/london-air-professional-gis-target-sample-20260615/battle-of-britain-professional-gis-target-sample.png`，它展示了后续应追求的 DEM hillshade、slope texture、0/50/100m contours、海陆分层、标签 plate 和战术 AOI 同屏效果。当前 runtime 只接入其中不打乱动画的底层地形信号。

### 4. 把 MapLibre 注册到 SVG 战术相机

第五层最核心的实现不是“加载 MapLibre”，而是 `svg-projection-registered-terrain`。

错误做法：

- MapLibre 自己用 pitch/bearing/center 做一套看起来很 3D 的地图；
- SVG 航线、飞机、雷达链按另一套 projection/camera 移动；
- 云朵在第三套背景坐标里漂；
- 用户一看就觉得地图层和战斗层分裂。

当前正确做法：

- MapLibre center 取自 `terrainView.center`，并 clamp 到伦敦/海峡 bounds 附近；
- MapLibre zoom 从 `terrainView.projectionScale`、容器 viewScale 和 `mapView.scale` 推导；
- pitch/bearing 固定为 `0/0`；
- MapLibre `jumpTo` 只在 center/zoom/pitch/bearing 超过阈值时触发；
- registration samples 同时计算 MapLibre projected 点和 SVG projected 点的屏幕误差；
- data attributes 暴露 `data-registration-max-error`、`data-registration-mean-error` 和 sample count。

门禁目标：

- `registrationSampleCount >= 6`
- `registrationMaxError < 24`
- `registrationMeanError < 12`

历史证据里 `artifacts/london-air-map-registered-weather-v4-20260614/` 曾记录注册最大误差约 `0.2-2.86px`。当前门禁给了较宽上限，是为了容忍浏览器尺寸/像素比差异，但实际产品应尽量维持个位数误差。

### 5. 透明 SVG tactical overlay

MapLibre 是底板，SVG 是战术层。两者不能互相抢职责。

当前层级顺序：

1. `.map-stage`
2. `.battle-of-britain-terrain-3d` MapLibre underlay, `z-index: 1`
3. `svg.battle-map.has-terrain-underlay`, `z-index: 3`, transparent background
4. SVG country boundaries, rivers, tactical areas, routes, effects, labels
5. local cloud units inside the same `.camera-layer`, above terrain and below routes/aircraft
6. aircraft markers, route halos, dogfight effects and labels above the map

关键 CSS 合同：

```css
.battle-of-britain .battle-map.has-terrain-underlay .map-base,
.battle-of-britain .battle-map.has-terrain-underlay .map-texture {
  opacity: 0;
}

.battle-of-britain .battle-map.has-terrain-underlay .country {
  fill: transparent;
  stroke: rgba(202, 218, 204, 0.24);
}

.battle-of-britain .battle-of-britain-terrain-3d canvas {
  filter: saturate(2) contrast(1.16) brightness(0.71) hue-rotate(16deg);
  mix-blend-mode: normal;
}
```

国家层必须 boundary-only。旧失败模式表明，只要 SVG 国家层继续半透明铺色，真实 DEM/hillshade 会被压成平面色块。

### 6. 禁止 polygon color blocks

6 月 15 日前后曾尝试 `typed-regional-palette-v2`，用六个 MapLibre 低透明度地形角色 fill 层区分海峡、航路带、英格兰丘陵、泰晤士低地、法国白垩海岸和法国内陆。用户截图判定它形成大色块，最终废弃。

当前禁止重新引入以下 layer IDs：

- `battle-of-britain-channel-color`
- `battle-of-britain-channel-lane-color`
- `battle-of-britain-england-downs-color`
- `battle-of-britain-thames-lowland-color`
- `battle-of-britain-france-chalk-color`
- `battle-of-britain-france-inland-color`
- `battle-of-britain-palette-boundaries`

如果要表达地形差异，优先使用：

- topo/DEM/hillshade 的真实纹理；
- map-stage 最终截图色彩评分；
- 项目自有地名标签、边界和战术空域线；
- 局部天气单位；
- 小尺度点线面，不要恢复全图大色块。

### 7. 地图调色先定角色，再调数值

伦敦第五层已经证明，单纯“调暗一点”或“调亮一点”会来回失败：

- 地图太亮：变浅、发白、像平面底图；
- 地图太暗：用户截图会读成黑天夜航；
- 海太绿：英吉利海峡读成青绿色底图软件；
- 均值合格但低亮分位不合格：大面积深蓝仍像夜景；
- topo 太强：第三方英文标注和黑碎线盖过项目标签。

当前色彩目标：

- 白昼钢蓝；
- 浓郁但不是夜战；
- 高对比但不产生黑块；
- 有地形/金属质感；
- 飞机、航线、雷达线和地名第一眼可读。

当前参考指标来自 `artifacts/london-air-cloud-stronger-20260615-final-v2/metrics.browser.json`：

- `brightnessScore100` about `60.22-63.56`
- saturation about `51.06-90.91`
- steel-blue ratio about `0.306-0.584`
- green ratio about `0.070-0.103`
- low daylight ratio about `0.036-0.058`
- night blue ratio about `0.0059-0.0105`

2026-06-15 GIS 派生层接入后，默认 Playwright 视口 `1280 x 720` 会比 1440 证据视口更容易把海面采到青绿边界。最终运行 filter 从 `14deg` 收敛到 `16deg`，把默认视口开场 `cyanGreenSeaRatio` 从约 `0.203` 降到约 `0.183`，同时保持亮度约 `61.36`、对比约 `29.98`、钢蓝比例约 `0.608`。这属于视口稳定性修正，不是恢复 polygon 色块或全图调色罩。

门禁必须采最终 `map-stage` 截图，而不是 raw MapLibre canvas。最终画面包含 MapLibre、SVG overlay、标签、云朵、路线、飞机和 CSS filter，raw canvas 只能证明底图有纹理，不能证明产品观感合格。

### 8. 标签和前景分离

第五层不能把地名可读性寄托给 topo raster。当前合格做法：

- topo labels suppressed: `data-topo-labels-suppressed="true"`
- project-owned labels draw in SVG;
- `.map-point-label-plate` 使用半透明深色底板；
- label text 使用高亮填充、重描边和 `paint-order: stroke`；
- 伦敦专项门禁要求至少 8 个关键地名 label plates 可见。

路线和飞机：

- routes stay above terrain and clouds；
- route stroke width 可读但不过粗；
- aircraft keep drop-shadow separation；
- weather units stay below visible routes and aircraft；
- no generic `ww2Fighter` / `ww2Bomber` fallback。

### 9. 气象只作为第五层接口，不是地图调色层

用户最新反馈“云朵太少太浅”已经形成新规则：云朵位于飞机下方，本身偏暗灰白，不会影响飞机；如果不细看根本看不到，气象单位工作就是失败。

但这不改变第五层主原则：云朵不是全图天气罩，不参与地图调色。

当前气象接口：

- runtime assets:
  - `public/assets/weather/battle-of-britain/morning-cloud-bank.png`
  - `public/assets/weather/battle-of-britain/afternoon-cloud-breaks.png`
- renderer: SVG `MapOverlayElement` / `image.map-overlay-image`
- placement: same `.camera-layer` as routes and aircraft
- layer order: above terrain, below routes/aircraft
- animation: progress-linked local movement, no infinite CSS drift
- opacity: about `0.34-0.42`
- visible cloud count: opening/morning `5`, afternoon `4`, channel pursuit `3`
- total coverage: about `0.066-0.098`
- largest single cloud: about `0.034-0.037`
- dense-stage `cloudRectMaxDelta=0`
- third-hour return playback cloud rect max delta about `0.78px`

上一版 `2-3` 个淡云、总覆盖约 `0.034-0.047` 已经被用户截图判定为不合格，不要再把它当合格下限。

### 10. 连续帧稳定

地图层抖动不能靠静态截图判断。伦敦归档会话和 mempalace 都记录了抖动根因：

- `.map-stage` 外框可能稳定；
- `.camera-layer` transform 可能稳定；
- 真实抖感来自 cinematic specks、heavy blur、SVG 国家路径每帧重算或 MapLibre 细小 camera 重同步；
- 云朵无限 CSS drift 或狗斗/接触圈无限动画也会造成密集阶段闪屏。

当前规则：

- Battle of Britain 隐藏非战术 decorative specks；
- `.cinematic-focus-glow` 和 `.cinematic-front-haze` 不用 blur filter；
- dogfight/contact/front-line circles 不使用无限动画；
- MapLibre `jumpTo` 加阈值；
- 连续帧检查 `stageRectMaxDelta`、`terrainCanvasRectMaxDelta`、`uniqueCameraTransforms`、`uniqueMapCenters`、`uniqueMapZooms` 和 cloud rect delta。

稳定目标：

- `uniqueCameraTransforms=1`
- `uniqueMapCenters=1`
- `uniqueMapZooms=1`
- `stageRectMaxDelta=0`
- `terrainCanvasRectMaxDelta=0`
- dense-stage `cloudRectMaxDelta=0`
- third-hour return `cloudRectMaxDelta < 1.2px`

## 第五层输出合同

完成第五层后，运行时必须暴露以下可验收 contract：

```text
data-renderer="maplibre-real-terrain"
data-terrain-model="real-dem-raster-terrain"
data-tactical-renderer="maplibre-underlay-svg-tactical-overlay"
data-camera-mode="svg-projection-registered-terrain"
data-map-registration="svg-projection"
data-projection="registered-web-mercator-hillshade"
data-terrain-source="/assets/maps/battle-of-britain-3d/terrarium/{z}/{x}-{y}.png"
data-topo-source="/assets/maps/battle-of-britain-3d/topo/{z}/{x}-{y}.jpg"
data-terrain-exaggeration="1.35"
data-hillshade-exaggeration="0.72"
data-gis-derivatives="dem-hillshade-slope-runtime-contours-relief-texture"
data-gis-derivatives-manifest="/assets/maps/battle-of-britain-3d/derived/manifest.json"
data-runtime-contour-source="/assets/maps/battle-of-britain-3d/derived/battle-of-britain-contours-runtime.geojson"
data-runtime-contour-layer-ids="battle-of-britain-gis-subsea-contours,battle-of-britain-gis-land-contours,battle-of-britain-gis-coastline-contour"
data-runtime-relief-source="/assets/maps/battle-of-britain-3d/derived/battle-of-britain-runtime-relief.png"
data-runtime-relief-layer-id="battle-of-britain-gis-relief-texture"
data-visible-basemap="local-cached-world-topographic-map"
data-visual-surface-contract="maplibre-real-terrain-no-polygon-color-blocks"
data-terrain-color-model="real-terrain-texture-runtime-relief-contours-no-polygon-blocks"
data-terrain-color-zones="none"
data-terrain-color-layer-ids=""
data-cloud-animation="progress-linked-local-weather-units"
data-cloud-renderer="svg-camera-layer-comfy-weather-png"
data-maplibre-fill-veil="removed"
data-camera-update-threshold="0.025-zoom"
data-topo-labels-suppressed="true"
data-topo-raster-opacity="0.15"
```

运行资产必须在仓库内：

- `public/assets/maps/battle-of-britain-3d/`
- `public/assets/weather/battle-of-britain/`
- `public/assets/unit-icons/`
- `public/audio/`
- `package-lock.json`

生成工具链可以不在仓库内，但必须在文档里说明边界。

## 验收门禁

最低静态和文档门禁：

```bash
git diff --check
node agents/skills/github-submit-assistant/scripts/check-doc-governance.mjs .
node tools/check-git-asset-boundary.mjs
```

生产和浏览器门禁：

```bash
npm exec tsc -- -b
npm run build
npm run preview:local -- --skip-build
FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "battle of britain shows radar directed compact air formations"
FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "campaign data quality gates"
node /Users/asukarei/.codex/skills/animation-assistant/scripts/check-animation-project.mjs /Users/asukarei/Desktop/war-animation-lab-oss-london-air-map
```

如果第五层影响 shared renderer、相机、地图交互、全局 CSS 或成熟门禁，还要跑：

```bash
FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "gaixia ambush uses terrain map ten-sided formations and pipa score"
FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "nianzhuang battle shows Huang Baitao pocket relief blocking trenches and final pursuit"
```

第五层 Playwright 需要覆盖：

- terrain node visible；
- terrain loaded；
- topo tile HEAD `image/jpeg`；
- DEM tile HEAD `image/png`；
- runtime contours HEAD JSON / non-SPA；
- runtime relief texture HEAD `image/png`；
- runtime GIS manifest `purpose=runtime-fifth-layer-gis-derivatives-validation`；
- MapLibre canvas coverage `> 0.92`；
- country fill transparent / none；
- banned MapLibre polygon layers absent；
- registration sample count and max/mean error；
- raw canvas texture `luminanceStdDev > 9`、`edgeMean > 5`；
- runtime contour layer IDs and relief texture layer ID all present in loaded MapLibre style；
- rendered map-stage daylight color gate；
- no large filled tactical shapes；
- no large dark rendered blocks；
- no generic aircraft markers；
- labels have at least 8 visible plates；
- weather units are in camera-layer；
- weather below routes/aircraft；
- cloud total coverage current baseline `> 0.065` and `< 0.22`；
- dense-stage continuous frame stability。

## 失败模式表

| Symptom | Root cause | Correct fix | Gate |
| --- | --- | --- | --- |
| DOM 有 `battle-of-britain-terrain-3d`，肉眼仍看不出 3D | 5177 仍跑旧 bundle，或国家面填色压住 terrain | 重新 build/publish，核对 bundle 指纹，国家层 boundary-only | served bundle fingerprint, tile HEAD, country fill transparency, screenshots |
| 地图像 SVG 雾罩或海报底色 | SVG wash/sheen/veil 或 MapLibre 大色块代替真实地形 | 废弃伪层，只保留 topo raster + DEM + hillshade | `data-visual-surface-contract`, banned layer IDs |
| 地图层和战斗层分裂 | MapLibre 自己一套 pitch/bearing/camera，SVG 另一套 projection | `svg-projection-registered-terrain`, pitch/bearing `0/0`, registration samples | registration max/mean error |
| 地图太亮、太浅 | 只追求不黑，topo/raster 亮度过高 | 白昼钢蓝目标带，最终截图色彩评分 | brightness/saturation/steel-blue/green ratios |
| 地图像黑天 | 均值门禁漏掉低亮分位和深蓝大面积 | 增加 `luminanceP10`、`luminanceP25`、`lowDaylightRatio`、`nightBlueRatio` | daylightColorGate |
| 海面发绿 | 底图默认 topo 颜色或 sepia/green bias | canvas filter 收敛为冷调钢蓝，降低 topo opacity | steel-blue ratio, green ratio |
| 地名看不清 | 依赖第三方 topo 黑字或无 label plate | 项目自有 SVG label + halo + plate | label plate count and stroke width |
| 黑块遮地图 | `.battle-of-britain` scoped CSS 缺失或 SVG `polyline` 默认 fill | scoped `fill:none`，polyline 显式 fill none，截图连通域 | `expectNoLargeDarkRenderedBlocks` |
| 云朵像全图雾毯 | 天气当背景层或调色层 | 云朵作为局部 weather unit，放入 camera-layer | cloud coverage max/total, layer order |
| 云朵看不见 | 只满足 DOM/layer/jitter，覆盖率和 opacity 太低 | 提高灰白云体对比，增加关键区域实例 | visible cloud count, coverage, user screenshot |
| 密集阶段抖动 | CSS infinite drift、blur、MapLibre 细小重同步、SVG 重算 | 进度驱动小位移，禁无限动画，jumpTo threshold，缓存稳定路径 | continuous-frame probes |
| 测试误判云层级 | 开场雷达阶段无可见飞机，querySelector 取到错误节点 | 在混战节点筛选可见 route/aircraft | cloud follow camera zoom gate |

## GitHub 演示与本机工具链边界

当前分支可以上传并运行演示，因为运行所需资产已经进入仓库：

- Vite/React/TypeScript source；
- `package-lock.json`；
- MapLibre runtime dependency；
- London map tiles under `public/assets/maps/battle-of-britain-3d/`；
- London aircraft PNGs under `public/assets/unit-icons/`；
- London weather PNGs under `public/assets/weather/battle-of-britain/`；
- London audio under `public/audio/`。

不应作为普通 Git blob 上传的本机生产工具链：

- `/Users/asukarei/Documents/我心飞翔/tools/ComfyUI`
- Stable Diffusion checkpoint
- ControlNet / BiRefNet model files
- ISNet / segmentation model cache
- Playwright browser cache
- `node_modules/`
- generated `artifacts/`
- prototype `vendor/` and `tiles/`
- QGIS/GDAL local installations
- large engine workspace caches

影响判断：

- GitHub Pages 或拉分支本地运行当前演示，不需要 ComfyUI、QGIS、GDAL 或分割模型。
- 只要 committed runtime assets 存在，`npm install` + `npm run build` 应保留当前视觉效果。
- 重新生成飞机图标、云朵 PNG、DEM package、专业 GIS 派生层或新的地形证据，才需要上述本机工具链和网络/source 访问。
- 所以“工具链不能完整上传”不会影响 GitHub 上当前演示动画效果，但会影响别人复现资产生产过程。

## 给整合会话的落地建议

整合时不要再写“一层一句话”。对第五层至少要落以下表单：

- Map envelope: bounds, key tactical anchors, camera stages.
- Runtime tile package: topo path, DEM path, manifest status, MIME checks.
- Rendering architecture: MapLibre underlay, transparent SVG overlay, z-order.
- Registration contract: center/zoom derivation, pitch/bearing policy, sample error thresholds.
- Color contract: target palette, CSS filter, topo opacity, hillshade values, final screenshot metrics.
- Foreground separation: country boundary-only, labels, routes, aircraft and cloud layer order.
- Banned patterns: SVG wash/sheen, polygon color blocks, full-map cloud veil, semi-transparent country fills.
- Evidence package: artifact path, screenshots, metrics, bundle fingerprint and Playwright gates.
- Toolchain boundary: runtime assets committed, generation engines documented but not uploaded.

如果未来把伦敦第五层推广到其他战役，不要机械复制数值。应复制的是工艺：真实底图/DEM、注册相机、前景可读性、最终截图门禁、用户截图优先和失败模式表。数值要按战役类型重定，例如古代阵法、山地会战、海战、沙漠战和夜战都不能套伦敦白昼钢蓝指标。
