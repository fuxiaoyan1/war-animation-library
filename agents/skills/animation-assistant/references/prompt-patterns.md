# Animation Assistant Prompt Patterns

## Project Kickoff Prompt

Use this when a user asks for a new animation:

```text
Build a data-driven interactive web animation for: <topic>.

Requirements:
- Create a project structure with `src/data`, `src/lib`, `docs/sources`, and `tests`.
- Research enough source material to build a structured event timeline. Record URLs and source roles.
- Implement play, pause, replay, draggable timeline, and event jump controls.
- Keep events/tracks/camera data separate from rendering.
- Use strong visual design; avoid generic layouts and oversized opaque arrows.
- Keep map overlays small; do not let large title cards cover operational geography.
- For ancient China topics, use a coherent historical-map background with parchment texture, hand-drawn borders/rivers, and Chinese place labels; do not use repeated decorative mountain patterns or modern grid wallpaper.
- Make opposing forces visually distinct with different colors, dash patterns, markers, and legend labels.
- Use distinct suitable background music per animation in a series, with source and attribution recorded.
- For war-series animations, keep runtime at 5 minutes by setting `playbackDurationSeconds=300`; classify by ancient/modern shelves if a series homepage exists.
- For repeated fronts or tug-of-war theaters, label repeated routes as `region/theater + 第N次作战` instead of stacking duplicate lines.
- For BCE topics, use explicit internal BCE dates such as `BCE-YYYY-MM-DD` and format them in the timeline layer.
- Match unit markers and SFX to the era: ancient land = cavalry/chariot/melee, ancient naval = ship/water route, Napoleonic = cannon/cannon audio, WWII armored = tank/modern firepower, WWII carrier war = aircraft-carrier marker.
- Compress long empty gaps for sparse campaigns, but preserve a shared calendar axis for multi-front wars where simultaneity matters.
- For sparse long campaigns, derive `activeSpans` from front/route start-end intervals and exclude inactive gaps from playback time; do not just scale the full calendar range.
- Default visible progress to week-level granularity for war animations; keep exact event dates in source data.
- Explicitly identify treaty/armistice/peace gaps between separate wars and compress them to short transition beats; verify with event-rail spacing tests.
- Unit icons for chariots, war horses/cavalry, cannons, warships, aircraft carriers, and tanks should be polished readable mini-illustrations, not crude stick figures or abstract symbols; prefer layered SVG or licensed icon assets with clear visual identity.
- If realistic icons use finished raster assets, preserve each asset's silhouette ratio in the SVG marker width/height. Do not use horse-only placeholders for cavalry, reuse cavalry as a chariot, or use generic ship markers for carrier-war campaigns. Document source/license limits and screenshot-check the markers at actual map size.
- Keep unit icons horizontally level. Do not rotate tanks, cavalry, cannons, ships, carriers, or chariots with route slope; mirror them left/right based on the current route segment so they face the same direction as the route arrow. If the marker is exactly at route start, use the next non-zero segment as the facing fallback.
- Keep the map manually movable: normal wheel vertical pan, shift/horizontal wheel horizontal pan, visible zoom in/out/reset buttons, drag pan, and double-click reset. Subtitle tickers, cinematic overlays, legends, and controls must not block map wheel/drag interactions. Reset manual pan/zoom when the automatic camera focus changes so old user offsets do not make later theaters look off-camera. At default zoom, allow horizontal as well as vertical pan; do not clamp `x` to zero just because there is no scale overflow.
- Add Playwright smoke tests for load, controls, map/stage visibility, and late-stage visibility.
- Generate screenshots for initial, mid, and late states.
- If requested, configure a local persistent service and document access/status commands.
```

## Visual Improvement Prompt

Use this when the user says the animation “looks wrong”:

```text
Treat the screenshot as the source of truth.
Identify whether the issue is layout, projection/camera, visual hierarchy, animation semantics, or CSS scope.
Patch the smallest durable fix.
Add or update a regression test that would have caught this.
Rebuild, rerun smoke tests, refresh the always-on service if present, and save a new screenshot.
```

## Campaign Map Prompt

Use this for military/history maps:

```text
Use real coordinates and a map projection.
Model events, fronts, routes, and camera stages as data.
Use thin routes, direction marks, unit icons, battle effects, and static post-event markers.
Differentiate attackers, defenders, counteroffensives, withdrawals, and special operations with color plus stroke pattern; do not rely on labels alone.
Keep naval routes over water by adding port nodes and route waypoints; never draw sea operations across land.
Use era-correct event effects: sword/melee clashes for ancient battles, cannon fire for Napoleonic-era battles, and explosions/aircraft/strafing only for modern firepower contexts.
Switch camera/projection by campaign phase if the theater moves.
If the user reports that the map no longer follows or cannot be moved, first determine whether the camera focus data is wrong or whether wheel/drag interaction regressed. Add a regression test that `camera-layer` transform changes on wheel and drag, then resets before visibility assertions.
For mouse wheel behavior, normal wheel should pan vertically and shift/horizontal wheel should pan horizontally. Do not make Ctrl/⌘+wheel the primary zoom path; use visible `+`, `-`, and reset buttons and test button-driven scale changes. If Ctrl/⌘+wheel remains as a shortcut, keep it optional and separate from normal pan behavior.
For cross-date-line theaters such as the Pacific, do not use an unrotated Mercator with mixed negative and `0-360` longitudes. Rotate the projection around the Pacific, split the camera into operation theaters, and test each key event pin in the map core after event jumps.
Unit icons should face the route but stay level: calculate left/right facing from the current route segment, mirror the asset if its default facing differs, and assert the marker transform does not contain `rotate`.
Limit war-series runtime to 5 minutes unless explicitly overridden.
Avoid duplicate route clutter in repeated campaigns; number the operations by theater/region.
For long sparse campaigns, build playback from active operation spans and exclude inter-battle dead time; for island-hopping campaigns, give inactive gaps a short fixed display duration and assert post-turning-point event-rail spacing; for multi-front wars, keep one shared time axis and let inactive routes pause.
Do not obscure labels with filled arrows.
Keep historical claims sourced and distinguish inference from source-backed facts.
For ancient China campaigns, the map background must live inside the same camera/interaction layer as country paths, routes, and pins. Test that the ancient-map image is a child of the camera layer and that wheel/drag movement moves the whole map together.
```

## Local Persistent Demo Prompt

```text
Build production assets, serve them locally, then configure a user-level persistent service.
Use preview/static serving rather than dev mode unless hot reload is explicitly needed.
Verify with service status, listening port, HTTP 200, Playwright smoke, and screenshot.
Document access URL, logs, start/restart/stop/status commands.
```
