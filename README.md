# 战争动画藏书馆

Data-driven interactive web animations for historical campaigns. The project combines structured campaign data, a reusable React/Vite map renderer, cinematic audio, source notes, and Playwright gates so each battle can be replayed as a compact, inspectable five-minute film.

## Live Demo

GitHub Pages demo: <https://fuxiaoyan1.github.io/war-animation-library/>

The demo opens on the library shelf. Each card launches an interactive animation with play/pause/replay, draggable timeline, event jumps, narration subtitles, map pan/zoom, retained operational tracks, and faction-specific unit markers.

## Latest Update

The latest major update refines `韩信十面埋伏：垓下之战` and `淮海战役：碾庄圩围歼战` with real-terrain tactical maps, tighter camera framing, stronger route continuity, and visible contested combat at key breakthrough moments.

Highlights:

- Gaixia now uses a real GIS/MapLibre terrain map with local imagery and elevation tiles, historical fieldworks, formations, route anchors, and multi-point melee contact effects.
- Gaixia dawn assault no longer shows Han forces entering an empty camp: Chu inner rearguard, south-gate remnants, and east-gate covering cavalry are visible and tested.
- Gaixia close camera stages keep the active battle surface centered during the tenth-hour songs, farewell, and dawn assault moments.
- Nianzhuang now uses a real-terrain tactical map with staged camera focus for Xin'anzhen withdrawal, Xuzhou relief, Daxujia blocking, Nianzhuang compression, final pocket, and Nizhuang endgame.
- Nianzhuang defense has layered village lines, corps-level Nationalist labels, PLA column assault axes, relief blocking, trench approaches, final compression, and remnant clean-up contact.
- Regression gates now verify source-route continuity, unit visibility windows, effect-to-route binding, tactical camera focus, map interaction, terrain rendering, and key late-stage combat density.
- A repository-level [DISCLAIMER.md](DISCLAIMER.md) now documents the educational/non-commercial intent, source limits, third-party media terms, source website entry points, and the maintainers' peace-and-anti-war position.
- A repository-local GitHub submit skill records the future submission workflow so update notes, source notes, disclaimers, validation, commits, and pushes are handled consistently.

Full update note: [docs/updates/war-animation-update-2026-06-06.md](docs/updates/war-animation-update-2026-06-06.md)

Previous major update note: [docs/updates/war-animation-update-2026-05-27.md](docs/updates/war-animation-update-2026-05-27.md)

## Current Library

The repository currently includes 23 animations.

Ancient and pre-Napoleonic campaigns:

- 亚历山大大帝征服史
- 罗马与迦太基：三次布匿战争史
- 大秦统一中国战史
- 韩信十面埋伏：垓下之战
- 凯撒大帝战争史
- 十字军东征
- 蒙古帝国征服史

Modern campaigns and tactical battles:

- 拿破仑争战史
- 特拉法尔加大海战
- 日俄对马海战
- 日德兰海战
- 1940 德法战役
- 伦敦上空的鹰
- 1941-1945 苏德战争全景
- 日美太平洋战争战史
- 中途岛海空战
- 俾斯麦海海空战
- HX 229 / SC 122：大西洋狼群战
- 第二次瓜岛海战
- 大周行动：欧洲昼间制空权争夺
- 淮海战役：碾庄圩围歼战
- 抗美援朝战争
- 1991年第一次海湾战争

## Recent Additions

The latest series work focused on naval and air-war animation quality:

- Added and refined tactical naval battles: Tsushima, Trafalgar, the Second Naval Battle of Guadalcanal, and Jutland.
- Added WWII air and sea-air studies: Battle of Britain Day as `伦敦上空的鹰`, Big Week, and the Battle of the Bismarck Sea.
- Added a WWII Atlantic submarine-war study: `HX 229 / SC 122：大西洋狼群战`, covering convoy movement, wolfpack convergence, torpedo attacks, escort ASW, VLR patrol aircraft, and U-384's loss.
- Improved aircraft lifecycle modeling: sorties now show departure, contact, attack, pursuit, return, or landing instead of disappearing or loitering at target points.
- Added dogfight effects for dense air combat, without using naval-style salvo lines for air battles.
- Tightened route quality gates: air routes keep trails after aircraft leave, but visible aircraft must still be moving along a valid route.
- Expanded realistic unit markers for warships, aircraft, carriers, tanks, infantry, cavalry, chariots, and artillery.

## Design Principles

- Campaign facts live in `src/data`, rendering logic lives in shared components and `src/lib`.
- Routes are geographic and source-backed where possible; uncertain compression choices are documented in `docs/sources`.
- Long wars use compressed active spans; short tactical battles use hour-level timelines.
- Air units use short sortie windows; land and sea units can persist when historically appropriate.
- Routes and tracks should remain visible as operational memory, while unit icons reflect the current live force.
- Audio is event-typed: aircraft, air combat, bombing, cannon, melee, or silence depending on the event.
- Every animation must remain controllable and testable, not just visually impressive.

## Repository Layout

- `src/data`: campaign events, routes, map points, effects, and cue metadata.
- `src/components`: React animation views and shared renderers.
- `src/lib`: timeline math, projection helpers, map interaction, unit badge logic, and audio helpers.
- `public`: runtime media assets used by the demos.
- `SOURCE_INDEX.md`: website-level source index for historical references, maps, terrain, software, fonts, audio, and asset traceability.
- `docs/sources`: historical references, audio attribution, asset notes, and uncertainty records.
- `docs/war-animation-handoff.md`: detailed production handoff and accumulated animation rules.
- `agents/skills/animation-assistant`: reusable Codex skill, references, and project health-check script.
- `tests`: Playwright smoke tests for data gates, layout, map interaction, route visibility, audio behavior, and representative animation states.

## Run Locally

```bash
npm install
npm run dev
```

Open the Vite URL printed by the command, usually `http://127.0.0.1:5177/`.

## Verify

```bash
npm run build
npm run test:smoke
node agents/skills/animation-assistant/scripts/check-animation-project.mjs .
```

The smoke tests expect browser dependencies installed by Playwright. If needed:

```bash
npx playwright install chromium
```

## Publish Demo

Pushes to `main` trigger two GitHub Actions workflows:

- `CI`: installs dependencies, builds the app, runs Playwright smoke tests, and runs the animation project health check.
- `Deploy GitHub Pages`: builds with `GITHUB_PAGES=true` and deploys `dist` to GitHub Pages.

## Skill / Agent

The reusable animation workflow lives at:

```text
agents/skills/animation-assistant/
```

Use it as a portable Codex skill for building new campaign-map animations. It encodes the hard-earned rules around map projections, compressed timelines, realistic unit markers, audio assets, controls, source notes, and Playwright gates.

The GitHub submission workflow lives at:

```text
agents/skills/github-submit-assistant/
```

Use it before publishing repository updates. It enforces update notes, source/disclaimer checks, validation, local commits, and GitHub pushes.

## Peace, Sources, and Disclaimer

This project is an educational, open-source, non-commercial historical animation library. We love peace and oppose war. The animations are source-backed but simplified visualizations, not authoritative historical, legal, political, military, or cartographic advice.

Read [DISCLAIMER.md](DISCLAIMER.md), [SOURCE_INDEX.md](SOURCE_INDEX.md), [NOTICE.md](NOTICE.md), and `docs/sources/*` before reusing the project, redistributing assets, or relying on any historical interpretation.

## Licensing

Code in this repository is released under the MIT License. Media assets are not automatically MIT licensed. They come from mixed public-domain, CC0, attribution-required, non-commercial, or not-yet-fully-verified sources.

Read [DISCLAIMER.md](DISCLAIMER.md), [SOURCE_INDEX.md](SOURCE_INDEX.md), [NOTICE.md](NOTICE.md), and `docs/sources/*` before redistributing assets or using them commercially. Treat the included media as demo/runtime assets with source-specific terms unless a file is explicitly documented as public domain or CC0.
