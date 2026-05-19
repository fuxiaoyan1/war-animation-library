# War Animation Lab

Data-driven interactive web animations for historical campaigns, with reusable renderer patterns, source notes, Playwright smoke tests, and an included Codex skill for building more animations.

The project is separated from the original local working folder so it can be managed as a standalone GitHub repository.

## What's Included

- A React/Vite war animation library homepage.
- Campaign animations for ancient, medieval, modern, naval, air, and tactical battles.
- Shared map renderer, timeline interpolation, BCE date formatting, map pan/zoom, music and SFX handling.
- Playwright smoke tests for layout, map interaction, audio assets, route visibility, and representative animation states.
- Source notes under `docs/sources`.
- A reusable Codex skill under `agents/skills/animation-assistant`.

## Repository Layout

- `src/data`: structured campaign events, routes, map points, narration cues, and source-facing metadata.
- `src/components`: React animation views and shared renderers.
- `src/lib`: timeline math, projection helpers, map interaction, and audio playback helpers.
- `public`: runtime media assets used by the demos.
- `docs/sources`: historical references, audio attribution, asset notes, and uncertainty records.
- `agents/skills/animation-assistant`: reusable workflow, references, and health-check script for animation-building agents.
- `tests`: Playwright smoke tests.

## Run Locally

```bash
npm install
npm run dev
```

Open the Vite URL printed by the command, usually `http://127.0.0.1:5173/`.

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

## Skill / Agent

The reusable animation workflow lives at:

```text
agents/skills/animation-assistant/
```

Use it as a portable Codex skill for building new campaign-map animations. It encodes the hard-earned rules around map projections, timeline compression, realistic unit markers, audio assets, controls, screenshots, and Playwright gates.

## Licensing

Code in this repository is released under the MIT License. Media assets are not automatically MIT licensed. They come from mixed public-domain, CC0, attribution-required, non-commercial, or not-yet-fully-verified sources.

Read [NOTICE.md](NOTICE.md) and `docs/sources/*` before redistributing assets or using them commercially. Treat the included media as demo/runtime assets with source-specific terms unless a file is explicitly documented as public domain or CC0.

## Publishing Notes

This directory is intended to be initialized as a clean Git repository. It intentionally does not include:

- the original local `.git` history,
- `node_modules`,
- `dist`,
- Playwright reports,
- generated screenshots under `artifacts`,
- raw source image/reference folders under `public/assets/**/source`.

That keeps the public repository smaller and avoids carrying local-only source material into Git history.
