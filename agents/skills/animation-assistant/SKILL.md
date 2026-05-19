---
name: animation-assistant
description: Build, improve, or operationalize data-driven interactive web animations, especially timeline/map/story animations with play, pause, replay, draggable timeline, visual effects, source-backed research, browser verification, screenshots, tests, and optional always-on local service. Use when the user asks for an animation demo, animated historical/strategic/process visualization, “make this visual better”, “turn this into an agent/workflow”, or asks to preserve animation-building know-how as a reusable skill.
---

# Animation Assistant

Use this skill to turn a theme into a stable, verifiable web animation product. Bias toward implementation plus evidence, not a design-only answer.

## Operating Contract

1. Build context from the target project first: read `package.json`, app entry points, data files, tests, and any service setup.
2. Separate content data from rendering: keep events, coordinates, phases, sources, and captions in data files; keep interpolation, projection, and timeline math in `lib`.
3. Use primary or reputable sources for factual content. Record URLs and uncertainty in project docs.
4. Make the animation controllable: play, pause, replay, draggable timeline, event jump points, and visible current state.
5. Make visual claims testable: add `data-testid`, Playwright smoke tests, screenshots, and layout assertions for important ratios/visibility.
6. For local demos the user wants to revisit, provide a persistent service via launchd/systemd/etc. and document start/stop/status commands.
7. After each major iteration, capture lessons in memory if a memory tool is available.
8. For animations with sound, treat audio as a production layer: licensed assets, balanced levels, user-triggered playback, and asset tests.

## Workflow

### 1. Discover

- Read the repo structure and current implementation before editing.
- If the animation depends on current facts, niche history, product data, or visual references, browse and cite sources.
- For local browser verification, use the Browser plugin when available; otherwise use Playwright directly and save screenshots.

### 2. Model

Define the animation as a data model before drawing:

- `Event`: id, date/time, title, phase, summary, detail, significance, coordinates/focus, media/effect type.
- `Track`: route id, faction/category, from/to points, start/end, line style, icon/marker type.
- `Viewport`: named camera/projection stages and transition thresholds.
- `NarrationCue`: id, start/end dates, title, subtitle text. Keep narration timing as data, not JSX literals, so it can drive subtitles, side cards, and later voice-over/export.
- `Source`: title, URL, evidence role, confidence notes.

For maps, prefer real geographic coordinates plus projection. Avoid hand-drawn pixel maps unless explicitly requested.

### 3. Render

Start with a minimal, working scene, then add refinement layers:

- Base layer: real map, grid, terrain, regions, labels.
- Data layer: event points, tracks, current marker.
- Effect layer: explosions, glow, pulse, particles, route reveal.
- Audio layer: loopable licensed music plus event-triggered finished SFX.
- Control layer: play/pause/replay/timeline/event rail.
- Story layer: current chapter, next chapter, narration subtitle track, details, source notes.
- Cinematic layer: opt-in per animation, not global. Use scoped classes for vignette, dust/ash particles, focus glow around the active event, haze, contrast/saturation tuning, and subtitle-safe framing.

Guardrails learned from the Battle of France project:

- Do not style all `svg` globally. Scope map SVG rules with a class such as `.battle-map`; icon SVGs will otherwise explode in size.
- For `d3-geo` viewport fitting, prefer `MultiPoint` bounds for rectangular extents. Polygon rings can be interpreted as the wrong spherical side.
- If `preserveAspectRatio="slice"` hides important content, use `meet` or use stage-specific projections instead of transform hacks.
- For later-stage geography, switch projection/camera by phase; a single fixed viewport often fails when the story moves south/east.
- For multi-front wars, camera phases must follow the active operation theater, not only broad chapters. Add dedicated viewports for major theater shifts such as south/frontier/encirclement phases, and regression-test that current event pins stay in the map core during timeline dragging and event jumps.
- For compressed timelines with temporary theater excursions, always add an explicit return camera stage for the next operation span. Do not assume the prior broad theater remains active after a side trip such as a channel crossing; event jumps after the excursion must recenter on their own theater and keep the event label group, not just the raw point, inside the map core.
- Keep arrows thin. Large filled arrows quickly obscure cities and labels. Prefer fine routes, weak halo, direction dashes, and moving unit icons.
- Do not let title/subtitle overlays cover the map. Use compact corner intelligence cards, clamp long titles, and keep the detailed narrative in the side story panel.
- Opposing sides must be visually distinguishable. Use different colors and stroke patterns for attacker, defender/counteroffensive, withdrawals/evacuations, and special operations; legends must match those semantics.
- If both sides use the same era/unit type such as infantry or tanks, do not rely on route color alone. Add a small faction badge, tint, or other marker-level distinction on the moving unit icon itself, and regression-test that representative opposing-side icons expose different faction identifiers. If the factions' equipment or uniforms are visually distinct, prefer faction-specific realistic assets instead of one shared icon with only a badge.
- Use explosions briefly for active events, then static battle icons for passed events.
- Use real finished audio assets for cinematic weapon/aircraft effects. Do not synthesize explosions, cannon, aircraft dives, or gunfire when realism is requested.
- For background music, prefer public-domain or clearly licensed recordings; verify full download size and duration before wiring.
- In a war-animation series, avoid reusing the same background march for every film. Assign each animation a distinct, suitable, high-quality finished track and document attribution/source/bitrate/duration.
- Treat background-music uniqueness as a regression gate, not a style preference. Expose each animation's `musicSource` in a stable testable attribute and add a smoke assertion that all registered war animations use distinct background tracks unless the user explicitly asks otherwise.
- When adding a new animation to an existing library, inspect the already-registered `musicSource` list before selecting music. Download and document a new high-quality finished track, then extend the uniqueness smoke test at the same time as the navigation entry.
- Background-music quality is part of acceptance. Avoid low-fidelity mono archival march recordings for cinematic historical animations unless the user specifically wants archival sound. Prefer finished stereo music with adequate bitrate/size and a tone that fits the campaign; if a temporary low-quality track is used, mark it as a placeholder and replace it before calling the animation done.
- Balance levels by ear and by config: music should remain audible; SFX should mark events without masking narration/music. Cap long SFX clips with offsets and max durations.
- Match iconography and SFX to the era. Ancient land battles use cavalry/chariot/infantry-style markers and sword/melee clash audio, not explosions. Ancient naval battles use ship markers and routes that stay over water. Napoleonic-era battles use cannon markers and cannon audio. WWII armored operations use tank markers and may use explosions, aircraft, and strafing where historically appropriate. WWII carrier-war/naval-air campaigns such as the Pacific War should use a dedicated aircraft-carrier marker, not the generic ship marker.
- Air-strike and aviation routes must use a realistic aircraft icon plus an explicit `routeKind="air"`; never render an air campaign with tank, cavalry, ship, or other ground/sea markers. For modern air-ground wars, test that air-strike events show aircraft markers while ground offensives still show tanks or appropriate land units.
- For Cold War/Korean War era animations, do not reuse later modern icons by convenience. Korean War air combat should use 1950s jet aircraft such as F-86/MiG-15 style markers, not F-16; carrier operations should use Essex-era carrier silhouettes, not Nimitz; armored routes should use period tanks such as T-34/M26/M46-style markers; infantry-heavy mountain/trench operations should use realistic period-looking infantry markers with readable helmet/body/weapon silhouettes. Chinese People's Volunteer Army routes should use PVA-looking padded-uniform infantry imagery when available, not the same steel-helmet UN infantry asset. Add smoke tests that assert the exact asset kind/path for representative sea, air, tank, UN infantry, and PVA infantry routes.
- Event audio must trigger from both playback progression and user event jumps. If the user clicks an ancient battle such as Gaugamela or Alesia, the click handler must play the melee/swords cue inside that user gesture; do not rely only on an `isPlaying && activeEvent changed` effect, because manual exploration will otherwise be silent. Mock `Audio` in Playwright to assert the expected SFX path is requested on event-click.
- Cue-event lists must cover all battle/combat events, not only the climax set. Keep political/death/accession/treaty nodes silent unless they deliberately need a cue, but every battle/siege/crossing/assault event should have an era-matched SFX cue. Add regression tests that iterate representative battle-event buttons, not just one famous battle.
- Unit icons for chariots, war horses/cavalry, cannons, warships, aircraft carriers, tanks, and infantry must be polished realistic mini-illustrations, not abstract line, cartoon, first-responder, or stick symbols. Prefer layered SVG or licensed finished assets. At map-marker size, key parts must remain recognizable: chariot cab/wheel/driver, horse/rider/weapon, sail/oars/hull, carrier flight deck/island, barrel/carriage/wheels, tread/turret/road wheels, or infantry helmet/body/weapon. Add smoke assertions for these detail layers when the project uses inline SVG.
- If realistic icon assets are raster images, preserve their silhouette ratio in marker geometry. Do not squeeze wide chariots, cavalry, ships, carriers, cannons, or tanks into square markers. Smoke-test `.unit-icon-image` asset kind/path and plausible asset size, document source/license limits, and inspect screenshots at actual map scale.
- Unit icons must remain horizontally level and readable. Do not rotate tanks, cavalry, ships, carriers, cannons, or chariots with route slope; route lines/arrows carry the angle. Determine the current route segment's horizontal direction, account for the asset's default facing, and mirror with `scale(-1 1)` only when needed so the icon faces the same left/right direction as the arrow. At route start points where current length is zero, use the next non-zero segment as the direction fallback.
- Route semantics must respect geography. If a naval operation connects inland political centers, add realistic port nodes and water `waypoints`; never draw a sea battle line across land.
- Narration subtitles should be a low-height, semi-transparent horizontal ticker in the map stage and also be mirrored in the story panel. The ticker must not receive mouse events (`pointer-events: none`), must not block wheel scrolling, and must not cover operational geography.
- Bottom controls must not be sticky overlays on top of the map stage. If controls overlap the map, subtitles may appear to block the scene or wheel gestures may hit controls instead of the map.
- Map interaction is part of the common renderer contract: support normal wheel vertical pan, shift/horizontal wheel horizontal pan, visible zoom in/out/reset buttons, drag pan, and double-click reset on the map/stage. Attach wheel handling with a non-passive listener when calling `preventDefault`; otherwise Chromium will emit passive-listener errors and wheel behavior may regress.
- Do not make Ctrl/⌘+wheel the primary zoom interaction; it is hard to discover and often feels bad. Keep it only as an optional shortcut if desired, but provide explicit `+`, `-`, and reset controls and test them by asserting `camera-layer` scale changes.
- Horizontal map movement must work even at default zoom. Do not clamp `x` to zero when `scale === 1`; provide a base horizontal pan allowance just like vertical pan. Wheel modes must be mutually exclusive: normal wheel changes only `y`, shift/horizontal wheel changes only `x`, and zoom buttons change only scale.
- Manual map movement must not poison later automatic camera stages. When the active `focus`/viewport changes, reset any user pan/zoom transform so event jumps and playback recenter on the new theater while still allowing wheel/drag within the current theater.
- Cross-date-line theaters need a dedicated projection strategy. For Pacific-style `0-360` longitudes, rotate the projection (for example `geoMercator().rotate([-180, 0])`) and define theater-specific viewports; then regression-test that Pearl Harbor/Midway/Solomons/Marianas/Philippines/Japan events land in the map core.
- Ancient China campaign maps must not use decorative wallpaper. In a unified war-animation library, keep the shared base map/projection style and add historical borders as a data overlay in the same `camera-layer`, above the country layer and below rivers/routes/events. For Warring States China, the fix is seven-state boundary data and control overlays, not a special paper wallpaper that hides the common geography. If building a standalone ancient-China map with no shared series style, use one coherent historical atlas look, but still keep borders, rivers, routes, and event pins in the same projection. Historical regions must be topological partitions: adjacent states reuse the same boundary point arrays, so fills meet at shared edges rather than overlapping as translucent blobs. Add regression assertions that key origins, such as Xianyang for Qin, fall inside the correct region fill and that each key city is inside exactly one base historical region by checking all SVG region paths with `SVGGeometryElement.isPointInFill`. If the campaign changes territorial control over time, add `captureDate`/control overlays so later routes start from territory already shown as controlled, not from an enemy-colored state.

War-series rules learned from the multi-campaign project:

- Use a series homepage as the default entry when multiple war animations exist; register every new animation name and route there. Do not keep duplicating every war as a global top/bottom navigation strip once the library grows; use the homepage cards as the main entry and reserve the global chrome for fixed identity/motto/context. Smoke-test that stale global navigation is absent if it has been intentionally replaced.
- When a card opens an animation from a scrolled homepage, reset scroll to the top of the new view. Otherwise the map may load partly above the viewport, and wheel/drag tests or real users will miss the interactive map surface.
- Sort war-library homepage cards by campaign start date within the series, not by the order features were added. Add a smoke assertion for the visible order when users report that the shelf looks random.
- Decorative SVG terrain/annotation layers must always have explicit scoped CSS for `fill`, `stroke`, and opacity. A missing class style can render as a solid black SVG ellipse or shape and obscure the map; add a regression assertion when removing or changing such decoration.
- Classify wars by the Napoleonic boundary: Napoleonic-era and later wars are modern; earlier wars are ancient.
- Keep future war animations at exactly 5 minutes by default unless the user explicitly asks otherwise. Set `playbackDurationSeconds=300`, so playback speed is `1 / playbackDurationSeconds`.
- Condense long wars into key operational nodes rather than literal day-by-day playback.
- For long single-thread or sparse wars, compress empty inter-battle gaps to keep pacing. For multi-front wars such as the Eastern Front, preserve one shared calendar axis so quiet lines can pause while active lines move; do not independently compress fronts and confuse simultaneity.
- Short battles or wars must not be forced into week-level pacing. For campaigns lasting hours or a few days, support hour-level date anchors such as `YYYY-MM-DDTHH:mm`, set an hourly step like `timeStepDays={1 / 24}`, and show an hour/day counter rather than “第 N 周”.
- Tactical naval battles with complex maneuvering, such as Tsushima, need a tight battle-area viewport rather than a broad regional map. Keep the map centered on the strait/bay/sea room where the fleets maneuver, and model approach, intercept, turning, first crossing, disabled flagship/formation breakup, second crossing, night pursuit, dawn envelopment, and surrender as separate route segments so tactical geometry remains readable. Verify the route geometry does not imply the faster force is stuck behind the slower force when the historical tactic was side/front interception.
- For short tactical naval battles, do not let reconnaissance or prelude consume the opening playback. Use narration/event text for early detection if needed, but make the first rendered frame show fleets/routes already in motion. At the turning/crossing moment, assert geometry: the intercepted fleet must still be south/west or otherwise before the intercept line, not already beyond the faster force's crossing path.
- Warship markers for modern or pre-dreadnought naval battles should look like ships underway. Prefer side-view underway photographs/illustrations with transparent backgrounds and wide marker geometry; avoid plan views, top-down design drawings, ship blueprints, or technical three-view diagrams unless the user explicitly asks for a schematic.
- Long naval/island-hopping campaigns often look empty after the main turning point if the calendar axis is left uncompressed. For Pacific-style campaigns, derive `activeSpans` from operations, set `timingMode="compressed"`, give inactive gaps a short fixed display duration, and add event-rail spacing assertions for the post-turning-point sequence.
- For long sparse campaigns like the Punic or Napoleonic wars, compute the playback axis from active operation spans derived from route/front `start/end`; exclude non-operational gaps from playback time instead of mixing the full calendar into one proportional compression.
- Use week-level display/progress by default for long war animations. Keep exact dates in data and event labels, but avoid day-by-day perceived stepping unless the campaign is short enough to benefit from daily granularity.
- Treaty/armistice/peace gaps between separate wars often need explicit fixed-duration compression, not only proportional gap scaling; otherwise decades of non-combat still appear as visible dead air. Add test coverage on event-rail spacing for these gaps.
- When a long war enters a negotiation/static-front phase, compress the negotiation gaps explicitly with `gapOverrides` while keeping representative combat nodes such as air campaigns and positional battles visible. Regression-test event-rail spacing across the negotiation-to-late-battle sequence so the film does not spend most of its five minutes in dead air.
- When compressed timing is enabled, camera stages, route interpolation, event jumps, and event rail positions must all use the same compressed timeline mapping.
- When Playwright uses `vite preview` or another static preview server, rebuild production assets before rerunning browser smoke after source edits. Otherwise tests may keep exercising stale `dist` output and hide or preserve camera/layout failures that no longer match the source tree.
- For repeated fronts or tug-of-war theaters, do not redraw the same thick routes. Label them as `region/theater + 第N次作战` or `phase N` and keep route lines thin.
- Do not let old offensive arrows remain visible after a later counteroffensive has operationally invalidated them. Add route-level visibility windows such as `visibleUntil` for phase-specific routes, and test that an obsolete advance line disappears before the next counteroffensive climax. This avoids impossible scenes such as one side already entering a city while the other side's earlier advance still appears to be pushing past it. If a background route/defense line should remain briefly as context after being broken, hide the defeated side's moving unit marker separately with `unitVisibleUntil` so the map does not show the beaten formation still standing on the breakthrough point.
- Event effects must align with active operation routes. If an event fires on a campaign start date and the route progress is still zero, either start the route slightly before the event date or use a dedicated event route so the explosion/active marker appears on a meaningful line rather than disconnected from the operational background.
- For BCE history, use an explicit internal date format such as `BCE-YYYY-MM-DD` and a project formatter instead of relying on browser `Date` negative-year behavior.
- Prefer one reusable generic renderer, such as `CampaignMapAnimation`, with campaign-specific data files, wrapper components, source docs, and smoke tests.

### 4. Verify

Minimum verification:

- `npm run build` or equivalent production build.
- Playwright smoke: page loads, controls work, no console errors, no `/api/**` 4xx/5xx.
- Layout assertions: map area ratio, key feature spread, important later-stage points visible.
- Subtitle assertions: subtitle ticker is visible, changes with the active event/time segment, remains low-height, has `pointer-events: none`, and appears near the bottom edge without covering title cards, routes, or event pins.
- Audio assertions: key music/SFX assets return `200`, expected `Content-Type`, and plausible `Content-Length`; document file duration/bitrate when relevant.
- Screenshot evidence for initial, mid-animation, and late-animation states.

If a user reports a screenshot issue, treat it as ground truth and add a regression assertion where possible.

### 5. Operate

If the user wants “常驻运行”:

- Build production assets first.
- Run a preview/static server rather than dev server when possible.
- Create a user service (`~/Library/LaunchAgents/*.plist` on macOS) with logs under the project.
- Verify with `launchctl print`, `lsof`, and `curl -I`.
- Document the access URL and service commands.

### 6. Remember

When mempalace or another memory system is available:

- Store durable lessons, not transient logs.
- Store exact reusable rules and failure modes.
- Use project-specific wing/rooms such as `animation-assistant/workflow`, `animation-assistant/visual-rules`, `animation-assistant/failure-modes`.

## Resource Loading

- Read `references/prompt-patterns.md` when composing prompts for a new animation agent or sub-agent.
- Read `references/battle-france-retrospective.md` when working on campaign-map, history animation, or animation audio-layer tasks.
- Run `scripts/check-animation-project.mjs <project-dir>` after implementation to inspect basic project health.
