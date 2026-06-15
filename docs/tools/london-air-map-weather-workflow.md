# 伦敦空战地图、气象与单位工艺

Battle of Britain London map, weather, and unit production workflow.

本文件总结 `伦敦上空的鹰` 已经验证过的地图、气象和作战单位制作工艺，供另一个会话整合到当前动画六层生产流程中。它不是新的仓库级规则；仓库级规则仍以 `AGENTS.md`、`animation-assistant`、`docs/tools/tactical-terrain-studio.md` 和成熟 Playwright 门禁为准。

This file summarizes the verified London air-combat production process for map, weather, and unit assets. It is intended as an integration note for the six-layer animation workflow, not as a replacement for repository-level rules.

## 成熟基线 / Accepted Baseline

- 动画范围：1940-09-15 Battle of Britain Day，伦敦、肯特、泰晤士河口和英吉利海峡返航走廊，单日小时级战术空战。
- Runtime scope: the current film is a one-day, hour-level tactical air battle around London, Kent, the Thames Estuary, and the Channel return corridor.
- 运行基线：`src/components/BattleOfBritainAnimation.tsx` 复用 `CampaignMapAnimation`，使用 `playbackDurationSeconds={300}`、`timeCounterLabel="小时"`、`BattleOfBritainTerrain3D`、真实飞机单位图标、局部 ComfyUI 云朵和 Wagner `Ride of the Valkyries` 配乐。
- Runtime contract: shared renderer, five-minute playback, hour counter, registered MapLibre terrain underlay, real aircraft unit icons, local ComfyUI cloud units, and a distinct London score.
- 最新视觉证据：`artifacts/london-air-cloud-stronger-20260615-final-v2/metrics.browser.json`。
- Latest evidence: `consoleErrors=[]`, `pageErrors=[]`, six `daylightColorGate` samples pass, no generic aircraft markers, and no large dark rendered blocks.

Current quantified targets:

- Map color: `real-terrain-texture-no-polygon-blocks`, topo raster opacity `0.15`, project-owned labels with label plates, no large MapLibre polygon color blocks.
- Cloud units: 10 configured local cloud instances; opening/morning visible clouds `5`, afternoon `4`, channel pursuit `3`; total in-frame coverage about `0.066-0.098`; largest single cloud about `0.034-0.037`; opacity `0.34-0.42`.
- Stability: dense-stage `cloudRectMaxDelta=0`; third-hour return playback cloud rect movement about `0.78px`, under the `1.2px` smoothness gate.
- Assets: six aircraft families use runtime PNGs under `public/assets/unit-icons/` with versioned DOM hrefs and no generic `ww2Fighter` / `ww2Bomber` fallback.

## 六层映射 / Six-Layer Mapping

### 1. 地图资料层 / Map Source Data Package

输入不是“做一个英国地图”，而是先收束战术片场：RAF 雷达链、乌克斯布里奇指挥、11 群与 12 群起飞扇区、德军越岸走廊、伦敦东南接触区、肯特海岸返航追击和局部天气窗口。

The source package defines the tactical theater before any rendering: radar chain, Uxbridge control, RAF sector departures, Luftwaffe approach corridors, southeast-London contact geometry, Kent return pursuit, and weather cues.

Required records:

- `docs/sources/battle-of-britain.md`: historical anchors, weather notes, aircraft asset provenance, map/weather decisions, uncertainty.
- `docs/sources/audio.md`: current London score source and license note.
- `docs/sources/unit-icons.md`: unit image source and asset terms.
- `SOURCE_INDEX.md`: website-level source index. No new website class is added by this workflow note.

Weather interpretation:

- 1940-09-15 was modeled as daylight flying weather with local cloud patches, not as a full overcast scene.
- 云朵只能作为局部气象提示和空战空间参照，不能改成全图阴天罩。

### 2. DEM、地形与历史底图层 / Terrain And Basemap Package

当前伦敦方案废弃了 SVG wash/sheen 伪 3D 和大面积 MapLibre fill 色块，采用本地运行资产：

- `public/assets/maps/battle-of-britain-3d/`
- `scripts/prepare-britain-air-terrain3d.mjs`
- Esri World Topographic Map raster cache as texture reference.
- AWS Terrarium DEM cache for real terrain and hillshade.

The visible product layer is a registered terrain underlay plus transparent tactical SVG overlays. Country fills stay boundary-only when terrain is active; third-party topo labels are suppressed so project-owned labels remain readable.

Accepted terrain contract:

- `data-visual-surface-contract="maplibre-real-terrain-no-polygon-color-blocks"`
- `data-terrain-color-model="real-terrain-texture-no-polygon-blocks"`
- `data-topo-raster-opacity="0.15"`
- `data-topo-labels-suppressed="true"`

Rejected terrain patterns:

- full-map cloud/weather veils;
- six large `typed-regional-palette-v2` polygon fills;
- semi-opaque SVG country fills that flatten the MapLibre terrain;
- procedural-looking cloud ellipses or distribution masks as final weather art.

### 3. 3D/斜视镜头层 / Camera And Registration Layer

伦敦地图的核心不是单独的 MapLibre 背景，而是 `svg-projection-registered-terrain`：MapLibre center/zoom 从 SVG `terrainView`、`mapView` 和当前战术相机推导，让地形 canvas 与航迹、飞机、雷达链和云朵共享同一镜头语义。

The key implementation is projection registration. The MapLibre underlay follows the SVG battle camera rather than acting as an independent background map.

Camera stages:

- `britainAirRadar`: radar chain and early warning.
- `britainAirCombat`: southeast London and Kent combat core.
- `britainAirReturn`: Kent coast and Channel pursuit.

Verification must record:

- served bundle fingerprint, not only source files;
- terrain tile HEAD / MIME checks;
- registration sample error;
- country fill transparency;
- rendered screenshot color metrics;
- continuous-frame stability for dense route phases and the third-hour return window.

### 4. 作战单位资产、尺度与贴地图层 / Unit Assets, Scale, And Terrain Placement

伦敦飞机单位证明了第 4 层不能只靠“透明 PNG 存在”。合格资产需要真实参考、候选生成、ComfyUI/ControlNet/BiRefNet 或分割链、后处理、同片质量带、运行 href/cache 验证和实际地图尺寸人工复核。

The aircraft unit layer is a concrete case for the generic unit-asset workflow: real references, candidate generation, segmentation/cutout, post-processing, same-animation quality bands, runtime href/cache verification, and visual review at map scale.

Runtime aircraft families:

- RAF: `britainSpitfire`, `britainHurricane`
- Luftwaffe: `luftwaffeBf109`, `luftwaffeBf110`, `luftwaffeDo17`, `luftwaffeHe111`

Current accepted pattern:

- top-down or near-top-down game-unit silhouettes instead of unreadably thin side-view strips;
- real-photo/source-derived geometry with visible metal/fabric texture;
- He 111-derived quality band for luminance, saturation, wing balance, tail join, and tail-to-fuselage color continuity;
- versioned hrefs and local `Cache-Control: no-cache` to prevent stale browser assets;
- explicit route `unitIcon` values, no renderer fallback.

Reference docs:

- `docs/tools/unit-icon-production-workflow.md`
- `docs/tools/britain-air-comfyui-style-pass.md`
- `scripts/run-comfyui-air-source-pass.py`
- `tools/models/segmentation/model-manifest.json`

### 5. 战术动线预检层 / Tactical Movement Preflight

伦敦空战不是陆战或海战单位长期驻留地图。每条空中路线必须表达出击、接触、拦截、追击、返航或离场，单位可见窗口短，航迹可以保留作为作战记忆。

London air combat uses sortie lifecycle semantics: aircraft move through departure, contact, interception, pursuit, return, or exit. Aircraft do not loiter at London or Dungeness, while their tracks can remain as operational memory.

Preflight rules:

- air routes use `routeKind="air"`;
- non-hidden air routes declare real aircraft icons and tactical `positionAnchor` / `positionAnchors`;
- `unitVisibleUntil` keeps aircraft moving during their visible windows;
- `visibleUntil` may retain trails after aircraft exit;
- dogfight effects bind to live route windows and visible aircraft;
- route handoffs must not pop into existence or leave units parked at Dungeness, Victoria, or London.

### 6. 视觉证据与发布准入层 / Visual Evidence And Release Gate

所有截图和 metrics 保存到 `artifacts/`，默认不嵌入会话。单次人工肉眼看过不够，必须保存当前发布预览的证据；旧 bundle 或浏览器缓存曾经多次误导伦敦评审。

Screenshots and metrics belong in `artifacts/`. The accepted page must be the current deployed preview, not a stale `dist` or cached asset state.

Minimum release gates:

```bash
git diff --check
node agents/skills/github-submit-assistant/scripts/check-doc-governance.mjs .
npm exec tsc -- -b
npm run build
npm run preview:local -- --skip-build
FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "battle of britain shows radar directed compact air formations"
FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "campaign data quality gates"
node /Users/asukarei/.codex/skills/animation-assistant/scripts/check-animation-project.mjs /Users/asukarei/Desktop/war-animation-lab-oss-london-air-map
node tools/check-git-asset-boundary.mjs
```

Reference gates for mature-series safety should include Gaixia and Nianzhuang when the shared renderer, visual gates, or terrain/unit workflow changed.

## 气象单位工艺 / Weather Unit Workflow

伦敦当前气象单位不是全图天气层，而是本地化的 ComfyUI PNG 作战/气象单位。

London weather is modeled as localized ComfyUI bitmap weather units, not a full-map color grade.

Production chain:

- `scripts/run-comfyui-britain-weather-assets.py` calls the existing local ComfyUI service.
- Generated RGB cloud material is copied into project artifacts.
- The project script performs edge-background luminance estimation, cloud alpha extraction, edge fade, density normalization, and gray-white color grading.
- Runtime assets are committed under `public/assets/weather/battle-of-britain/`.
- `mapOverlays` place multiple cloud instances in the same SVG `camera-layer` as routes and aircraft.

Runtime placement contract:

- above terrain and below routes/aircraft;
- pointer events disabled;
- versioned image hrefs such as `?v=20260614-comfy-weather-v4`;
- no infinite CSS drift;
- progress-linked small movement only;
- explicit size, opacity, reveal window, and drift per cloud unit.

Current visible-cloud acceptance:

- Below `3-5%` total coverage and `2-3` pale clouds was rejected by user screenshots as too subtle.
- Current target is local but visible: about `6.6-9.8%` total coverage, several phase-visible clouds, and opacity up to `0.42`.
- Do not compensate with a full-map veil. If viewers must inspect closely to notice the clouds, the weather unit pass has failed.

## 失败模式 / Failure Modes To Preserve

- Stale preview bundle: `127.0.0.1:5177` previously served an old bundle, hiding new terrain and weather code. Always verify served JS/CSS fingerprints.
- Old browser asset cache: fixed PNG filenames plus immutable cache made users see old aircraft. Use versioned hrefs and no-cache headers for regenerated assets.
- SVG black blocks: missing `.battle-of-britain` scoped styles and SVG `polyline` default fill created large black tactical shapes. Tests must cover rendered pixels and polylines, not only paths.
- Full-map weather veil: cloud/weather as a background or color layer washed out terrain and competed with the battle. Use local cloud units.
- Polygon color blocks: `typed-regional-palette-v2` fill layers created map color slabs. Current contract bans those MapLibre layer IDs.
- Pale clouds: `2-3` subtle clouds with total coverage about `0.034-0.047` were not legible enough. The current baseline is stronger gray-white clouds under aircraft.
- CSS shimmer: infinite drift/flash layers and heavy blur caused perceived jitter. Weather, dogfight, and focus layers must be progress-linked or static during dense review windows.
- False DOM ordering tests: checking the first aircraft during the opening radar stage can fail before aircraft are visible. Layering assertions must run at a combat node and filter visible in-stage nodes.

## GitHub 运行资产与本机工具链边界

GitHub runtime and local production toolchain are intentionally different.

当前分支可以上传并运行演示，因为运行所需资产已经进入仓库：

- Vite/React/TypeScript application source.
- `package-lock.json` dependency graph.
- MapLibre/Three dependencies installed by `npm install`.
- London runtime map tiles under `public/assets/maps/battle-of-britain-3d/`.
- London runtime aircraft PNGs under `public/assets/unit-icons/`.
- London runtime cloud PNGs under `public/assets/weather/battle-of-britain/`.
- London runtime audio under `public/audio/`.

The full local production toolchain is not committed and should not be committed as normal Git blobs:

- `/Users/asukarei/Documents/我心飞翔/tools/ComfyUI`
- Stable Diffusion checkpoint and ControlNet/BiRefNet model files
- ISNet / segmentation model cache under ignored `engine-cache/`
- Playwright browser cache
- `node_modules/`
- generated `artifacts/`
- prototype `vendor/` and `tiles/`
- QGIS/GDAL local installations and any large engine workspace caches

Impact:

- Running or building the current GitHub demo does not require ComfyUI, QGIS, GDAL, or segmentation model downloads, because the runtime assets are committed.
- Re-generating aircraft icons, weather PNGs, segmentation cutouts, DEM packages, or professional GIS derivatives does require the documented local toolchain and network/source access.
- GitHub Pages should preserve the current visual effect after the branch is merged or built, as long as the committed runtime assets are present and the build uses `npm install` plus `npm run build`.
- Downstream users who want to reproduce the asset production process must read this file plus `docs/tools/britain-air-comfyui-style-pass.md`, `docs/tools/unit-icon-production-workflow.md`, and `docs/tools/tactical-terrain-studio.md`.

## 给六层整合会话的建议 / Integration Notes

- 把伦敦气象单位作为第 2 层和第 6 层之间的跨层合同：素材生成属于地形/天气包，运行层级和覆盖率验收属于视觉证据。
- 把伦敦飞机图标作为第 4 层单位资产子工艺案例，不要把 ComfyUI 提升为全局动画流程。
- 把 `served bundle fingerprint`、`runtime href/cache headers`、`current preview evidence` 写入第 6 层准入条件。
- 把用户截图优先级写入人工复核规则：截图反馈可以推翻已通过的数值门禁，随后再把失败转成新门禁。
- 把“运行资产可提交、生成工具链不提交”写入发布边界，避免 GitHub 分支可运行性和本机生产可复现性混在一起。
