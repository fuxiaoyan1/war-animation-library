# Engine Capability Samples

This file collects visual and interactive examples for the game-engine-first map/terrain direction. These are not project deliverables; they are reference targets for what each tool family can realistically contribute.

## Existing Project Baseline

- **Gaixia / Nianzhuang / Cannae current MapLibre direction**
  - Capability: map-first tactical animation, projected historical overlays, DEM-backed 3D camera, route/unit/story synchronization.
  - Limitation: units are still mostly 2D image overlays; collision, formation pressure, terrain-height placement, lighting, and cinematic blocking are not game-engine-grade.
  - Local evidence:
    - `artifacts/cannae-restore-probe-20260613/reference-structure-compare-3/gaixia-01-mid.png`
    - `artifacts/cannae-restore-probe-20260613/reference-structure-compare-3/nianzhuang-01-mid.png`
    - `artifacts/tactical-terrain-studio/cannae-20260613-preview/preview.png`

## Web Map / Web 3D

- **MapLibre GL JS 3D Terrain**
  - Example: <https://www.maplibre.org/maplibre-gl-js/docs/examples/3d-terrain/>
  - Shows real 3D elevation in a browser map.
  - Fit: current lightweight interactive map shell.

- **MapLibre + Three.js models on terrain**
  - Example: <https://www.maplibre.org/maplibre-gl-js/docs/examples/adding-3d-models-using-threejs-on-terrain/>
  - Shows GLTF/Three.js objects placed on geographic terrain at the correct height.
  - Fit: next likely browser prototype for war-animation units before full game-engine work.

- **MapLibre + 3D Tiles using Three.js**
  - Example: <https://www.maplibre.org/maplibre-gl-js/docs/examples/add-3d-tiles-using-threejs/>
  - Shows the direction for combining tiled 3D datasets with the current web map.
  - Fit: useful if we want some 3D Tiles in the existing React shell.

- **CesiumJS Sandcastle**
  - Example: <https://cesium.com/learn/cesiumjs-sandcastle/>
  - Shows 3D Tiles, terrain, glTF models, CZML, camera flight, and 3D geospatial effects.
  - Fit: stronger geospatial browser runtime than a pure MapLibre overlay.

- **deck.gl TripsLayer**
  - Example: <https://deck.gl/examples/trips-layer>
  - Shows animated timestamped paths over a map.
  - Fit: useful for path/time visualization, less suitable for cinematic battlefield units by itself.

## Game Engines

- **Cesium for Unreal: Photorealistic 3D Tiles**
  - Example: <https://cesium.com/learn/unreal/unreal-photorealistic-3d-tiles/>
  - Shows real-world photogrammetry/3D Tiles streamed into Unreal.
  - Fit: strongest path for geospatial terrain plus cinematic engine rendering.

- **Cesium for Unreal samples**
  - Example: <https://github.com/CesiumGS/cesium-unreal-samples>
  - Shows terrain, photogrammetry, 3D Tiles, point clouds, and Gaussian splats inside Unreal.
  - Fit: useful for judging whether Cannae-style terrain packages should target Unreal.

- **Unreal Engine: Valley of the Ancient**
  - Example: <https://dev.epicgames.com/documentation/unreal-engine/valley-of-the-ancient-sample-game-for-unreal-engine>
  - Shows high-end environment rendering, open-world workflow, animation, lighting, and cinematic scene quality.
  - Fit: visual/cinematic quality reference, not geospatial by itself.

- **Unity Terrain Sample Pack / Terrain Tools**
  - Examples:
    - <https://unity.com/blog/games/the-latest-unity-terrain-sample-pack-is-here>
    - <https://docs.unity3d.com/Packages/com.unity.terrain-tools@latest/>
  - Shows terrain authoring, brushes, materials, details, and HDRP/URP environment scenes.
  - Fit: practical lighter engine route for controllable tactical scenes.

- **Godot 4 TPS / 3D demos**
  - Examples:
    - <https://gdquest-demos.github.io/godot-4-3d-third-person-controller/>
    - <https://godotengine.org/asset-library/asset?category=10>
  - Shows open-source 3D gameplay demos and lighter 3D engine capabilities.
  - Fit: lightweight prototypes; weaker geospatial/terrain production ecosystem than Unreal/Cesium.

## What These Examples Mean For This Project

- If the target is still a web tactical explainer, MapLibre + Three.js can be the next step.
- If the target is professional battlefield terrain and camera work, Unreal + Cesium should be treated as the target pipeline.
- If the target is many independently moving unit groups with collisions but less geographic fidelity, Unity/Godot can be considered.
- If the target is mostly route/time analytics, deck.gl is strong but should not be mistaken for a cinematic battle engine.
