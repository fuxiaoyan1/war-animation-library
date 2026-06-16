# Game-Engine Production Resource Plan

This project should move toward a game-engine-first production posture for future war animations. The existing React/MapLibre product can remain the interactive review shell, but terrain, unit motion, camera blocking, and battlefield simulation should be authored in a way that can be consumed by a 3D engine.

## Current Machine Snapshot

Measured on this machine during the 2026-06-13 session:

- Machine: MacBook Pro, Apple M4 Pro.
- CPU: 14 cores.
- GPU: 20-core Apple GPU, Metal 4.
- Memory: 24 GB unified memory.
- Free disk space: about `145 GiB`.
- Current repository size: about `6.3 GiB`.
- Current repository `.git`: about `4.2 GiB`.
- Current `dist`: about `604 MiB`.
- Current `artifacts`: about `537 MiB`.
- Current `public`: about `598 MiB`.

This hardware is good enough for a serious prototype, but the disk budget is tight for a default Unreal/Cesium production workflow.

## External Baseline Checked

- Epic's Unreal Engine hardware page lists 32 GB RAM and 8 GB or more graphics RAM as recommended hardware for UE5 development, and its own typical reference workstation uses a 2 TB OS SSD plus a 4 TB data SSD. That makes Unreal a storage-heavy production path, not a small editor dependency.
- Unity 6 supports macOS Big Sur 11 or newer, Apple Silicon, and Metal-capable GPUs. It is a practical Mac path, but real project storage still grows through imported assets, `Library/`, build cache, terrain data, and rendered outputs.
- Godot 4 is much lighter as an editor: its official recommended desktop storage is small compared with Unreal/Unity. That does not remove the storage cost of our own DEM, models, textures, renders, and source assets.
- Cesium for Unreal is specifically positioned as high-accuracy WGS84 globe and 3D Tiles streaming inside Unreal. It is the strongest geospatial/game-engine direction, but it also implies large terrain/tiles/cache discipline.

## Practical Disk Budget

The following budgets are intentionally conservative. Actual usage varies by engine version, marketplace assets, terrain resolution, source imagery, caches, and render output.

| Mode | Use Case | Working Disk Budget | Comfortable Free Space Before Starting |
|---|---|---:|---:|
| Web 3D prototype | MapLibre + Three/Babylon/CesiumJS, small DEM/tile package, GLTF units | 15-40 GB | 80 GB |
| Unity/Godot light engine | One tactical battle scene, modest terrain, local assets, some cached imports | 40-90 GB | 150 GB |
| Unreal + Cesium professional prototype | One serious battle scene, Cesium/terrain cache, derived data, Nanite/Lumen-capable assets, export renders | 120-250 GB | 300 GB |
| Multi-battle engine library | Several battles, reusable unit library, terrain packages, cached builds and renders | 300-800 GB+ | 1 TB external/project disk recommended |

With only about `145 GiB` free, the current machine can support:

- a Web 3D prototype safely;
- a small Unity/Godot engine prototype with discipline;
- one very constrained Unreal prototype only if caches and large assets are kept under control.

It should not be used for multiple Unreal/Cesium battle projects without an external SSD or aggressive cache cleanup policy. If the project policy becomes "all future animations should be game-engine-first", then local storage must be treated as part of production infrastructure, not a convenience.

## Memory and Compute Budget

| Mode | Minimum Practical Memory | Better Target |
|---|---:|---:|
| Web 3D prototype | 16 GB | 24-32 GB |
| Unity/Godot light engine | 16-24 GB | 32 GB |
| Unreal + Cesium professional prototype | 32 GB preferred | 64 GB preferred for comfort |

The current `24 GB` unified memory is acceptable for small/medium prototypes, but Unreal scenes with high-resolution terrain, many units, cinematic lighting, editor plus browser plus asset tools can pressure memory quickly.

## Storage Rules

To avoid turning the repo into an engine-cache dump:

- Do not put Unreal/Unity/Godot project caches inside the Git repo.
- Keep `Intermediate/`, `Saved/`, `DerivedDataCache/`, `Library/`, `Temp/`, engine build outputs, and rendered video exports out of Git.
- Put engine projects under a separate workspace root, for example:

```text
/Users/asukarei/Desktop/war-animation-engine-lab/
```

- Put heavy shared caches on a dedicated external SSD if possible:

```text
/Volumes/WarAnimationCache/UnrealDDC/
/Volumes/WarAnimationCache/UnityCache/
/Volumes/WarAnimationCache/TerrainTiles/
/Volumes/WarAnimationCache/Renders/
```

- Keep the React repo as the source-backed product shell and verification harness.
- Export engine outputs as controlled artifacts: optimized GLB/USD/3D Tiles, preview videos, camera JSON, unit transform JSON, and low-size screenshots.

## Recommended Default Pipeline

1. **Terrain package first**
   Use QGIS/GDAL/OpenTopography/Copernicus/SRTM to build a real battlefield terrain package.

2. **Engine-ready data model**
   Author unit tracks as independent transforms:

```json
{
  "unitId": "roman-legion-01",
  "formationId": "roman-core",
  "faction": "roman",
  "assetId": "roman_republic_infantry.glb",
  "keyframes": [
    { "t": 0.0, "lng": 16.126, "lat": 41.2862, "heading": 82, "state": "advance" },
    { "t": 0.5, "lng": 16.164, "lat": 41.2876, "heading": 86, "state": "contact" }
  ]
}
```

3. **Camera package**
   Store cameras as tactical review shots plus cinematic shots:

```json
{
  "shotId": "roman-rear-oblique-contact",
  "target": [16.165, 41.287],
  "bearing": -38,
  "pitch": 60,
  "lens": "35mm",
  "durationSeconds": 18
}
```

4. **Engine prototype**
   For Cannae-style formation battles, evaluate in this order:

- MapLibre custom Three.js layer if geographic map alignment must stay exact.
- Babylon.js or Three.js if we need web-native instancing and controllable 3D units.
- Unreal + Cesium if we need professional cinematic terrain, lighting, camera blocking, and large-scene production.
- Unity/Godot if a lighter game-engine runtime is more important than top-end terrain fidelity.

5. **Return to review shell**
   The React animation can consume exported transforms, camera shots, screenshots, videos, or 3D assets. It should not hand-author the battle geometry after the engine pipeline exists.

## Default Recommendation For Future Animations

Default to an engine-ready pipeline for every new animation:

- Build source-backed terrain and unit-transform packages first.
- Keep the existing React app as review/control surface and library shell.
- Use Web 3D or game-engine previews for actual terrain, camera, and unit motion.
- Do not hand-author final battlefield geometry in React after the engine package exists.

Given this machine's current free space, the default implementation order should be:

1. **Short term on this machine:** MapLibre + Three.js/Babylon.js prototype and terrain package audits.
2. **Next step if disk is increased:** Unity/Godot tactical prototype for independent unit movement and formation pressure.
3. **Professional target:** Unreal + Cesium for Unreal once at least 300 GB free local space or a dedicated external SSD is available.

## Immediate Recommendation

Before installing or building a full Unreal/Cesium pipeline, create a small proof-of-production:

- one Cannae terrain patch;
- 30-50 instanced unit models;
- one oblique Roman rear camera;
- one closed-pocket pressure moment;
- one exported preview video and one transform JSON;
- disk usage logged before and after.

Acceptance for this proof is not beauty alone. It must answer:

- Can we keep terrain, units, and camera in one coordinate system?
- Can units face and move independently without SVG tricks?
- Can collision/contact pressure be previewed before final animation?
- How much disk does one battle really consume?
- Can the output be reviewed inside the existing animation library without duplicating production logic?

## Cleanup Policy

For the current machine, do not start full engine production unless at least `180 GiB` is free for Unity/Godot or `300 GiB` is free for Unreal/Cesium, unless the user explicitly approves a constrained spike.

If only the current `145 GiB` is available, limit work to:

- Web 3D prototype;
- small terrain sample;
- no large marketplace asset packs;
- no multiple engine versions;
- no high-resolution render cache retention.

## Source URLs

- Unreal Engine hardware/software specifications: <https://dev.epicgames.com/documentation/en-us/unreal-engine/hardware-and-software-specifications-for-unreal-engine>
- Unity 6 system requirements: <https://docs.unity3d.com/6000.0/Documentation/Manual/system-requirements.html>
- Godot system requirements: <https://docs.godotengine.org/en/stable/about/system_requirements.html>
- Cesium for Unreal overview: <https://cesium.com/platform/cesium-for-unreal/>
