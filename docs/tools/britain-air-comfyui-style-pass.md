# Britain Air ComfyUI Source And Flight-State Pass

This workflow creates Battle of Britain aircraft icon candidates from source aircraft photos plus aircraft-type prompts. It is the production path for flight-state refinement; the older transparent-PNG style pass is kept only as a deprecated comparison tool.

It uses the existing ComfyUI installation at:

```text
/Users/asukarei/Documents/我心飞翔/tools/ComfyUI
```

It does not install ComfyUI, copy Stable Diffusion models into this repository, or keep generated assets only in an external cache.

## Commands

Generate candidates only:

```bash
npm run assets:britain-air:comfy -- --steps 14 --denoise 0.42
```

Generate top-down tactical icon candidates when side-view markers are not readable enough at map scale:

```bash
npm run assets:britain-air:comfy -- --view top-down --steps 20 --cfg 8.0 --denoise 0.74 --control-strength 0.5 --control-end-percent 0.68
```

Generate flight-state candidates when the source photo is grounded, has landing gear, or is otherwise too literal:

```bash
npm run assets:britain-air:comfy-flight -- --steps 16
```

Apply candidates to runtime PNGs only after visual review:

```bash
npm run assets:britain-air:comfy:apply -- --steps 14 --denoise 0.42
```

Apply the accepted top-down icon pass:

```bash
npm run assets:britain-air:comfy -- --view top-down --apply --steps 20 --cfg 8.0 --denoise 0.74 --control-strength 0.5 --control-end-percent 0.68 --output-dir artifacts/london-air-comfy-topdown-apply-20260614
```

The script expects the ComfyUI service to be reachable at `http://127.0.0.1:8188` and uses:

- `models/checkpoints/v1-5-pruned-emaonly.safetensors`
- `models/controlnet/control_v11p_sd15_canny_fp16.safetensors`
- `models/background_removal/birefnet.safetensors`

The runtime icons are served through stable filenames, so every production apply must also verify the browser-facing path and cache behavior. For the current 2026-06-14 He 111-standard pass, the `UnitIcon` hrefs include `?v=20260614-he111-standard-v1`, and the local static server returns `Cache-Control: no-cache` for `assets/unit-icons/`.

## Output Contract

Default output:

```text
artifacts/london-air-comfy-source-pass-20260613/
```

The directory contains:

- `inputs/`: flattened source-photo inputs copied into this project.
- `control-inputs/`: optional softened Canny-control inputs for flight-state cleanup.
- `repair-masks/`: optional masks for landing gear, wheel, display-stand, or ground-contact remnants.
- `raw-comfy/`: raw RGB outputs copied from ComfyUI.
- `birefnet-masks/` and `comfy-rgba/`: ComfyUI background-removal output.
- `candidates/`: transparent PNG candidates normalized to runtime marker dimensions.
- `workflows/`: per-aircraft ComfyUI JSON workflows.
- `contact-sheet.png`: source, RGB, RGBA, and final-candidate sheet for local visual review.
- `metrics.json`: alpha, card-shape, luminance, texture, model path, prompt id, and cleanup report.

By default, the script deletes this run's `war_london_air_*` temporary files from the external ComfyUI `input/` and `output/` folders after copying them into the project artifacts. Use `--keep-comfy-temp` only for debugging.

## Acceptance Rule

Runtime aircraft icons must keep:

- real-photo or source-derived aircraft geometry, not placeholder drawings;
- true transparent cutout alpha, not a rectangular photo card;
- visible metal/fabric skin texture and panel detail, not a black silhouette or flat gray plate;
- Battle-of-Britain-relative scale hierarchy: Bf 109 smallest, RAF single-engine fighters slightly larger, Bf 110 larger, Do 17 and He 111 largest but still compact enough for map clusters.
- for `--view top-down`, an orthographic or near-orthographic dorsal aircraft planform: wings, engines, tail, canopy, and camouflage should read at marker size. Do not accept side-profile photo strips merely because their alpha is clean.
- He 111 is the current in-animation quality reference for color balance, material contrast, and tail integration. Runtime PNG metrics should stay in the He 111-derived band: visible luminance mean `80-150`, luminance stddev `46-88`, saturation mean `45-95`, top/bottom planform balance `> 0.82`, tail-join ratio `0.028-0.1`, and tail-root to rear-fuselage RGB distance `< 32`. Bf 109 has a stricter generator target of `< 22` for tail-root to rear-fuselage distance because its previous tail read as a separate color patch.

Do not block the asset workflow on perfect pre-ComfyUI cutouts. A clear source photo plus aircraft data can be passed through `--flight-state` so ComfyUI generates or refines the in-flight pose before BiRefNet cutout. The gate target is the final runtime animation: no photo-card backgrounds, no black silhouettes, no wrong engine/airframe proportions, no overlarge marker, and no stale camera/map failure.

Do 17 is allowed a higher `bboxFillRatio` because its long bomber body fills more of its alpha bounding box. That exception is not a photo-card waiver: transparent corners/edges, alpha bounding-box ratio, row/column coverage, marker width, and browser screenshots must still pass.

Do not use photo-derived alpha as a broad union with the segmentation result. That can pass transparent-corner checks while preserving an internal rectangular photo strip. The production cutout path should keep the real-photo RGB, but use segmentation intersected with an aircraft-family envelope for alpha; if a specific aircraft needs repair, localize that exception to the affected type.

For the 2026-06-14 top-down pass, the script first builds a local aircraft-data control reference from source-photo palette, span, length, wing planform, engine count, and faction markings. ComfyUI then performs the material and detail pass, while the final runtime alpha is constrained by the top-down control reference so a side-view photo cannot re-enter as a long strip. This control reference is a production guide, not the final asset.

After applying candidates, rebuild and run the London gate:

```bash
npm run build
npm run preview:local -- --skip-build
FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "battle of britain shows radar directed compact air formations"
```

Then regenerate browser evidence:

```bash
FRONTEND_URL=http://127.0.0.1:5177 node scripts/probe-london-air-visual-evidence.mjs artifacts/london-air-he111-standard-browser-20260614
```

The evidence script writes six keyframe screenshots and `metrics.browser.json` under `artifacts/london-air-he111-standard-browser-20260614/`. Acceptance requires empty console/page errors, `genericAircraftMarkers=0`, no large dark blocks, `Cache-Control: no-cache` for all six aircraft PNGs, and DOM hrefs containing the current aircraft asset version such as `?v=20260614-he111-standard-v1`. The metrics must also show every aircraft passing the He 111-derived quality band, including `tailRootRearFuselageRgbDistance`.
