# Tactical Terrain Studio

Tactical Terrain Studio is the project-level map and terrain preflight for war animations. It is not a replacement for professional GIS or 3D engines. Its job is to turn the battle map brief into a reproducible package, then tell the animation workflow how to move into the default game-engine-capable production pipeline.

The project direction is now **game-engine-first** for future serious battle animations. React/MapLibre can remain the interactive library shell, review UI, and lightweight fallback, but terrain, unit movement, collision/contact logic, and cinematic cameras should be authored as engine-ready assets rather than hand-tuned inside one React component.

## Why This Exists

Recent battle animations exposed the same weakness repeatedly:

- tactical maps were rebuilt inside individual React components;
- DEM, historical terrain, camera zoom, unit scale, and route continuity were tuned by hand;
- problems such as over-dense units, open pockets, route teleporting, river crossings, black terrain shapes, and weak 3D depth were found too late in visual review;
- formation battles such as Cannae need map scale, collision geometry, and unit density solved before animation implementation.

The mature flow should therefore be:

1. Build a terrain studio spec.
2. Use professional GIS/3D tools to create or verify the map package.
3. Run Tactical Terrain Studio audits.
4. Decide the engine path: Web 3D prototype, Unity/Godot, or Unreal/Cesium.
5. Only then build or revise the animation shell.

## Professional Toolchain

The registry is stored at:

```bash
tools/tactical-terrain-studio/professional-toolchain.json
```

The baseline toolchain is:

- **QGIS** for georeferencing, layer inspection, digitizing historical features, CRS control, and manual QA.
- **GDAL** for reproducible raster/vector processing: warp, clip, hillshade, slope, contour, tile preparation.
- **OpenTopography / Copernicus DEM / NASA SRTM** for DEM acquisition and cross-checking.
- **Natural Earth / OSM-derived data** for regional reference layers when appropriate.
- **Tippecanoe / PMTiles / Martin / tilemaker** for vector tile packaging and serving.
- **MapLibre GL JS** for the current review shell and lightweight map runtime.
- **CesiumJS / deck.gl / Three.js / Babylon.js** for browser-based 3D terrain, animated units, instancing, height placement, or engine-preview work.
- **Unreal + Cesium for Unreal / Unity / Godot** as the default target class for serious future battle production, especially when the battle needs real cinematic terrain, game-engine camera blocking, collision/navigation, large unit groups, or offline render-grade output.

## CLI

Run:

```bash
node tools/tactical-terrain-studio/tactical-terrain-studio.mjs \
  --spec tools/tactical-terrain-studio/specs/cannae-terrain-studio.json \
  --out artifacts/tactical-terrain-studio/cannae
```

For normal production, prefer the one-step pipeline when it helps reduce drift:

```bash
npm run animation:first-draft -- \
  --spec tools/tactical-terrain-studio/specs/cannae-terrain-studio.json \
  --out artifacts/tactical-terrain-studio/cannae-first-draft
```

This is the animation-assistant orchestration entrypoint. It calls the lower-level tools, writes a six-phase production manifest, and tells the operator whether a high-quality first draft may enter implementation. It is intentionally not a component generator. If it reports `not-ready-for-high-quality-first-draft`, the next task is to complete the missing phase contract, not to hand-patch a React component.

Lower-level terrain/unit contract run:

```bash
npm run terrain:pipeline -- \
  --spec tools/tactical-terrain-studio/specs/cannae-terrain-studio.json \
  --out artifacts/tactical-terrain-studio/cannae
```

This runs the terrain studio, terrain-height tactical unit layer, and unit-asset package audit together, then writes `pipeline-manifest.json` and `pipeline-manifest.md`.

The point is not to force every animation into a fully automated one-click build. The point is to keep production from drifting into component-local improvisation. A battle animation may still need manual research, GIS work, visual judgment, and design iteration, but it should not skip the explicit contracts for sources, terrain, historical basemap, camera, unit scale, movement preflight, terrain-height unit runtime, and visual evidence.

The desired production outcome is a **high-quality first draft**, not a perfect final animation in one pass. The pipeline should tell the operator:

- what is missing before a strong first draft can start;
- what can be drafted with disclosed uncertainty;
- what will visibly lower first-draft quality if left unresolved;
- what evidence must be captured before the user and operator tune the animation together.
- what is ready for first-draft entry but still needs non-blocking strengthening in later passes.

Or via npm:

```bash
npm run terrain:studio -- \
  --spec tools/tactical-terrain-studio/specs/cannae-terrain-studio.json \
  --out artifacts/tactical-terrain-studio/cannae
```

Outputs:

- `terrain-package.json`: consolidated package and warnings.
- `production-pipeline.json`: stable production-line contract across map sources, DEM/terrain, historical basemap, camera, unit scale, movement preflight, terrain-height units, and visual evidence.
- `pipeline-manifest.json` / `pipeline-manifest.md`: one-step production manifest with first-draft readiness, warning summary, next actions, output file inventory, six production phases, and layer-by-layer review status.
- `animation-first-draft-manifest.json` / `animation-first-draft-manifest.md`: high-level animation-assistant orchestration output from `npm run animation:first-draft`, including the implementation rule and prohibited shortcuts.
- `features.geojson`: tactical terrain, formations, and route features.
- `camera-stages.json`: recommended stage camera envelopes.
- `maplibre-contract.json`: MapLibre runtime contract and forbidden fallback patterns.
- `movement-audit.json`: route lengths, handoff gaps, avoid-feature crossings, contact gaps, encirclement gaps.
- `unit-density-audit.json`: unit density, marker load, and overpacking warnings by camera stage.
- `unit-asset-package/unit-asset-package.json`: source-backed runtime/candidate unit asset audit, including contact-sheet path, alpha/readability metrics, source/license notes, and asset readiness.
- `report.md`: human-readable report.

Use `--strict` only for CI-style checks. During production design, warnings are useful design feedback, not a reason to hide the report.

After `production-pipeline.json` exists, generate the terrain-height tactical unit runtime contract:

```bash
npm run terrain:units -- \
  --pipeline artifacts/tactical-terrain-studio/cannae/production-pipeline.json \
  --out artifacts/tactical-terrain-studio/cannae/terrain-unit-layer
```

This writes:

- `terrain-unit-runtime.json`: stage-by-stage terrain-height placement, visual scale, LOD mode, heading mode, and unit contract.
- `terrain-unit-runtime.md`: reviewable unit-layer report.

Unit asset package audit can also run separately:

```bash
npm run terrain:assets -- \
  --spec tools/tactical-terrain-studio/specs/cannae-terrain-studio.json \
  --pipeline artifacts/tactical-terrain-studio/cannae/production-pipeline.json \
  --out artifacts/tactical-terrain-studio/cannae/unit-asset-package
```

This is the generic form of the London air unit workflow. Battle-specific generators may call ComfyUI, segmentation, background removal, image search, hand retouching, or other tools, but their output must be registered as a `unitAssetPackage`: source references, candidate artifacts, runtime asset paths, contact sheets, and metrics. `--apply` style overwrites belong in battle-specific asset tools and should only happen after this package and visual review pass.

## Six Production Phases

The project can still use the original six-layer mental model as the animation production sequence. The eight technical contracts below are implementation details inside those six phases.

1. **地图资料层 / Map source data package**
   - Enter when the battle scope, period, source brief, and battlefield bounds are known.
   - Tools: source docs, terrain spec JSON, `tactical-terrain-studio.mjs` source package audit.
   - Exit when source references, control points, historical map references, required feature kinds, and uncertainty notes are present or explicitly disclosed.
   - The source package must prefer source coverage first: ancient narratives, place/gazetteer data, historical map or atlas references, archaeological/site context, modern battle studies, and secondary cross-checks. Uncertainty notes are for unresolved evidence after collection, not a substitute for collection.

2. **DEM/地形与历史战术底图层 / Terrain and historical basemap package**
   - Enter when the source package defines the battlefield envelope and terrain quality level.
   - Tools: QGIS, GDAL, OpenTopography/Copernicus/SRTM, local tile tools, DEM derivative audit, historical basemap audit.
   - Exit when terrain cache/derivatives and project-style visible historical basemap are ready or intentionally waived for low-terrain campaign scale.

3. **3D/斜视镜头层 / Oblique camera envelope**
   - Enter when features, formations, routes, and stage focus points exist.
   - Tools: camera-stage solver, MapLibre pitch/bearing/zoom contract, Web 3D or game-engine camera tests where needed.
   - Exit when every stage has geometry-derived center, zoom, pitch, bearing, and tactical envelope. CSS skew and component-local transforms are not acceptable substitutes.

4. **作战单位资产、尺度与贴地层 / Unit assets, scale, and terrain placement**
   - Enter when unit types, factions, representative counts, footprints, and visual target are known.
   - Tools: battle-specific asset generators such as the London air ComfyUI/segmentation chain, `unit-asset-package.py`, unit scale solver, and `terrain-unit-layer.mjs`.
   - Exit when unitSets map to source-backed runtime assets, candidate/contact-sheet review exists, assets pass alpha/readability checks, density/LOD/heading/terrain-height placement are declared.
   - `unit-density-audit.json` keeps raw density risks. A raw overpacking risk becomes a phase blocker only when there is no explicit density/LOD strategy that preserves independent logical unit control. LOD may reduce visual clutter, but it must not turn independently controlled units into one block.

5. **战术动线预检层 / Tactical movement preflight**
   - Enter when map envelope, obstacles, unit scale, formations, contacts, route handoffs, and result requirements are declared.
   - Tools: movement audit, formation collision/contact review, and future engine pathfinding/crowd-pressure tools.
   - Exit when routes do not teleport, cross forbidden terrain, fire effects away from contact, leave impossible encirclement gaps, or remove winner/remnant units without a data reason.

6. **视觉证据与首版准入层 / Visual evidence and first-draft gate**
   - Enter when previous phases have artifacts and no unresolved blocker.
   - Tools: visual evidence plan, Playwright screenshots and metrics saved to `artifacts/`, mature series gates from `AGENTS.md`, manual visual inspection.
   - Exit when screenshots and metrics exist, are not embedded in chat, and manual comparison against reference-quality animations supports moving from first draft to user/operator tuning.

The animation assistant is considered to be following the project workflow only when these six phases are represented in artifacts. A passing build or smoke test alone is not enough.

## What The MVP Checks

- DEM tile coverage by zoom and x/y range.
- MapLibre runtime attributes required by mature Gaixia/Nianzhuang-style 3D terrain.
- Camera stage center, pitch, bearing, bbox, and zoom from battle geometry.
- Unit density and marker footprint against camera envelope.
- Explicit density/LOD strategy when raw marker load would otherwise become fog-like.
- Route handoff gaps that may create teleporting.
- Routes crossing `avoid` features such as rivers or forbidden corridors.
- Contact gaps where battle effects would fire away from actual units.
- Encirclement closure gaps.
- Winner/remnant presence in result frames.
- Runtime engine recommendation: Web review shell is enough, Web 3D is required, or game-engine production/evaluation is required.

## Production Pipeline Contract

The practical production line is compatible with the original six-layer analysis, but the Web 3D prototype showed that two concerns must be split out instead of being hidden inside other layers:

1. **Map source data package**: battle range, period, references, modern control points, historical map references, uncertainty notes, rivers, roads, settlements, high ground, camps, and other traceable features.
2. **DEM / terrain layer**: DEM/Terrarium cache, tile coverage, hillshade, slope, aspect, contours, river valleys, high ground, corridors, and obstacle zones.
3. **Historical tactical basemap layer**: final project-style historical map surface. Modern imagery or street maps can be references, but the visible product layer must be rivers, terrain faces, settlements, roads/tracks, camps, contours/lowlands, corridors, and uncertainty overlays in a consistent style.
4. **3D / oblique camera layer**: pitch, bearing, zoom, battlefield envelope, phase cameras, and visibility constraints derived from tactical geometry, not hand-tuned CSS.
5. **Unit scale solver layer**: force size, representative unit count, marker size, formation footprint, map scale, density, LOD needs, and whether the scene will become fog-like or too empty.
6. **Tactical movement preflight layer**: route handoffs, avoid-feature crossings, contact gaps, encirclement closure, teleporting risk, impossible movement, and result-state winner/remnant presence.
7. **Terrain-height tactical unit layer**: units sample terrain height for placement, but their visual scale is tactical-symbol scale. This layer owns billboard/low-poly token mode, heading, vertical offset, LOD, and final unit readability.
8. **Visual evidence layer**: keyframe screenshots and metrics go to `artifacts/`; manual visual judgment remains required.

The CLI writes this contract to `production-pipeline.json`. Animation components should consume this package instead of rebuilding terrain, camera, unit scale, and movement rules inside component-local code.

`terrain-package.json` reports unresolved production warnings, engine recommendation, and non-blocking enhancements. It should not use already-mitigated raw measurements to force overbuilt engine choices. For example, a high raw marker load with an explicit LOD/independent-control strategy may require Web 3D review, but it should not automatically escalate to Unreal/Unity unless cinematic camera blocking, physics/navigation, offline render quality, or unit counts truly demand it.

## Important Boundary

This tool must not become another single-battle generator. Cannae failed partly because custom one-off generators, gates, and component-local fixes replaced the mature production process. Tactical Terrain Studio must stay as a preflight and orchestration layer:

- professional tools produce the terrain and map sources;
- animation data remains source-backed and battle-specific;
- visual screenshots still decide product quality;
- gates only preserve high-risk rules after the design is sound.

## Anti-Drift Rule

The production line is allowed to be partly manual, but it must not become implicit. Before a battle animation enters component implementation, the current operator should be able to point to:

- source map data package and unresolved uncertainty;
- DEM/terrain package or a documented reason why weak terrain is enough;
- historical tactical basemap contract;
- stage camera contract;
- unit scale / density contract;
- movement preflight report;
- terrain-height unit runtime contract when Web 3D or pitched terrain is used;
- visual evidence plan.

If these do not exist, the right next step is not to patch the animation component. The right next step is to complete or revise the missing contract, then replay the visual evidence loop. This is the guardrail against repeating the Cannae failure mode where old component state, ad hoc gates, placeholder assets, and local CSS/SVG fixes kept pulling the work away from the mature animation process.

## Engine-First Rule

New serious war animations should be planned so their terrain package, unit tracks, camera shots, and result-state data can be consumed by a game engine. Use the current MapLibre overlay only when the product is intentionally lightweight or when the engine prototype is not yet available.

## Terrain Quality Levels

Terrain production must match the animation scale instead of applying one heavy 3D style everywhere.

- **War-level / large campaign animations**: use a map-first shell with weak terrain cues, hillshade, rivers, borders, theaters, and clear routes. Terrain should support orientation, not dominate the story.
- **Campaign / operation animations**: use MapLibre terrain or hillshade where topography affects movement, supply, weather, or chokepoints. Moderate pitch/bearing is enough unless the operation is terrain-driven.
- **Battle / formation animations**: use a source-backed terrain package when slope, river corridors, roads, fields, ridgelines, or visibility shape the fight. This level may use MapLibre raster-dem, local landform texture, fog, Three.js custom layers, and terrain-height unit/effect placement.
- **Cinematic / simulation-grade productions**: evaluate Unreal, Unity, Godot, Cesium, or Babylon/Three scene pipelines when collision, pathfinding, crowd pressure, offline render quality, or true 3D cameras are required.

The local prototype at:

```bash
public/prototypes/web3d-terrain-prototype/index.html
```

is a **synthetic Web 3D capability sample**. It deliberately does not use a modern street-map layer. It demonstrates bare landform texture, Terrarium DEM terrain, hillshade, fog, and Three.js models seated with `queryTerrainElevation`. It must not be cited as a Cannae terrain reconstruction.

The prototype keeps only source and instructions in Git. Its `vendor/` and `tiles/` directories are generated local outputs and are ignored by Git. Prepare them with:

```bash
npm run prototype:web3d:prepare
```

This copies MapLibre/Three runtime files from `node_modules` and regenerates the synthetic DEM/texture tiles from `tools/tactical-terrain-studio/generate-web3d-prototype-tiles.py`. Do not commit those generated directories.

Large local models follow the same boundary. Segmentation models are described in `tools/models/segmentation/model-manifest.json` and stored under ignored `engine-cache/models/segmentation/`; run `npm run assets:models:ensure` before legacy source-photo cutout generation.

For real Cannae or another battle-level product, first build a source-backed package:

- DEM acquisition and cross-check: Copernicus DEM, OpenTopography, SRTM, or another documented elevation source.
- Historical geography: river course, floodplain, roads/tracks, field/settlement assumptions, and uncertainty notes.
- GIS derivations: clipped DEM, hillshade, slope/aspect, contours, landform/ground texture, water corridor, and tactical avoid/crossing geometry.
- Runtime outputs: MapLibre terrain tiles or PMTiles/MBTiles, vector overlays, Three placement contract, camera stages, and unit-density envelopes.

Use Web 3D when the battle needs:

- true 3D unit models or instanced unit meshes;
- terrain-height placement for units/routes/effects;
- better lighting and camera depth than SVG can provide;
- high unit count that becomes fog-like in SVG;
- formation collision or pressure preview.

Use Unreal/Unity/Godot evaluation when the battle needs:

- professional cinematic terrain and camera blocking;
- pathfinding, collision, physics, or crowd simulation;
- offline video-grade rendering;
- large-scale independently controlled unit groups that exceed a browser map overlay.

For Cannae-level formation battles, stop relying on manual SVG/MapLibre overlay tuning as the production route. Build at least a Web 3D or game-engine proof-of-production before treating further animation work as final.

For the current Cannae workflow, Web 3D is the calibrated next engine class: MapLibre custom Three.js layer, Babylon.js, Three.js, or CesiumJS should be evaluated before another round of manual SVG/MapLibre overlay tuning. Unreal/Unity/Godot remain later escalation options, not the default answer for every terrain or density problem.

See also:

```bash
docs/tools/game-engine-production-resources.md
```
