# Battle of France Animation Retrospective

This retrospective captures reusable lessons from building the War Animation Lab React/Vite web animation for the 1940 Battle of France.

## What Worked

- Lightweight Vite + React was enough for an expressive single-topic animation.
- Structuring `src/data/battleOfFrance.ts` separately from `src/App.tsx` made iteration fast.
- `d3-geo`, `topojson-client`, and `world-atlas` enabled an offline real-map background.
- Playwright smoke tests caught regressions in controls and layout.
- Screenshots were critical; user screenshots exposed issues tests did not initially catch.
- A macOS LaunchAgent made the demo feel like a persistent product instead of a one-off dev server.

## Failure Modes And Fixes

- Global SVG CSS broke icon rendering.
  Fix: Scope map SVG rules to `.battle-map`; explicitly size button icons.

- `d3-geo.fitExtent` with a rectangular Polygon produced a tiny map.
  Fix: Use `MultiPoint` bounds for viewport fitting.

- A single fixed map viewport made southern/later campaign phases invisible.
  Fix: Use phase-specific projections/camera stages.

- Filled arrows looked crude and obscured labels.
  Fix: Use thin route lines, weak halos, direction dash marks, and unit icons.

- CSS/SVG transforms plus `preserveAspectRatio="slice"` made camera-follow math fragile.
  Fix: Prefer projection changes or `meet` over transform hacks when important content must remain visible.

- Playwright SVG text `boundingBox()` can mislead under transforms/full-page screenshots.
  Fix: Use visual screenshots plus geometry tests on model/projected coordinates where possible.

- Procedural Web Audio war score sounded like low-frequency noise.
  Fix: Use a finished public-domain or clearly licensed background recording, then use code only for playback control.

- Synthesized cannon, dive, and strafing sounds felt artificial and low quality.
  Fix: Use finished SFX assets with explicit license pages; reject convenient assets with unsuitable licenses such as non-commercial terms.

- Explosion and weapon SFX masked the background march.
  Fix: raise music to the main bed and reduce SFX to event cues. In this project, music `0.72`, cannon `0.34`, explosion `0.28`, aircraft `0.34`, strafing `0.30`.

## Battle Map Visual Rules

- Base map should occupy most of the screen but not crop current story-critical points.
- Major operations should be routes, not slabs.
- Use moving tank icons for armored thrusts.
- Use explosions only around active battle events; convert passed events to static battle marks.
- Keep labels legible with restrained stroke outlines.
- If the theater moves, the camera or projection must move too.

## Audio Layer Rules

- Treat audio as a first-class layer alongside visual effects, controls, and data.
- Background music should be a finished recording, preferably public domain or CC0/CC-BY with documented attribution requirements.
- Do not assume “old” or “military” means safe. Record source page, direct asset URL, copyright/license status, file size, duration, sample rate, and bitrate in project docs.
- Verify downloads are complete. Use `afinfo` or equivalent to check duration; use file size and HTTP `Content-Length` to catch partial downloads.
- Do not use Web Audio synthesis for realism-critical explosions, cannon fire, aircraft dives, or machine-gun fire unless the user explicitly accepts synthetic stylization.
- Reject non-commercial audio licenses for reusable demos unless the user explicitly accepts that constraint.
- Trigger SFX from event changes, not continuously. Stop or cap long clips with `maxDuration`; use offsets to extract the best segment from long source clips.
- Balance for comprehension: music remains audible, SFX marks the event. Start with music around `0.7`, SFX around `0.3`, then adjust by user feedback.
- Pause/replay should pause active SFX and not leave long clips running behind the timeline.
- Add smoke tests for every served audio asset: `200`, audio content type, and plausible length. Do not rely on UI text alone.

## Useful Verification Targets

- Initial state: first event visible, map stage width ratio above target.
- Mid state: a German tank marker is visible on an active armored thrust.
- Late state: the late event label and relevant location are visible.
- Controls: play toggles to pause, pause toggles to play, replay returns to first event, timeline drag changes current event.
- Audio: music and all SFX assets are served; playback code does not depend on autoplay before a user gesture; active SFX are stopped on pause/replay.
