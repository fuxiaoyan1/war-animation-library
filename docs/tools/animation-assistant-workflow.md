# Animation Assistant Workflow

This is the project-level workflow entrypoint for animation production. It does not replace the `animation-assistant` skill. It gives the current executor a repeatable local command that asks the project tools what is ready, what is missing, and which production phase should be worked next.

Use it before starting or repairing a serious animation:

```bash
npm run animation:workflow -- \
  --spec tools/tactical-terrain-studio/specs/cannae-terrain-studio.json \
  --out artifacts/animation-assistant-workflow/cannae
```

The workflow writes:

- `animation-assistant-workflow.json`: machine-readable current phase, work items, guardrails, and tool runs.
- `animation-assistant-workflow.md`: human-readable work order for the executor.
- `animation-first-draft-manifest.json/md`: first-draft readiness and six production phase details.
- Lower-level terrain, camera, unit, movement, and asset artifacts.
- `Non-Blocking Enhancements`: known follow-up work that should continue improving the pipeline even when the six phases are ready for a first draft.

## Runtime Visual Evidence Loop

After a first draft or repair is implemented, capture browser keyframes through the assistant workflow instead of relying on ad hoc screenshots:

```bash
npm run animation:visual-evidence -- \
  --spec tools/tactical-terrain-studio/specs/cannae-terrain-studio.json \
  --url http://127.0.0.1:5177/ \
  --out artifacts/cannae-visual-pass
```

Then feed the saved evidence back into the workflow:

```bash
npm run animation:workflow -- \
  --spec tools/tactical-terrain-studio/specs/cannae-terrain-studio.json \
  --out artifacts/animation-assistant-workflow/cannae-runtime-review \
  --visual-evidence artifacts/cannae-visual-pass
```

The capture tool opens the configured animation and reference animations, saves keyframe screenshots under `artifacts/`, and writes `metrics.dom.json` with runtime unit counts, marker footprint, route groups, asset hrefs, and facing data. The workflow review can then reopen phase 4, 5, or 6 if the browser evidence shows visual density, asset reuse, parade-like final groups, missing winner/remnant presence, or other product drift.

## Operating Rule

When the user asks to make or repair an animation, the executor should call this workflow first unless the user explicitly says to edit the assistant/tooling itself. The workflow then tells the executor the current phase and work items. The executor completes that phase, reruns the workflow, and continues until the workflow says implementation can proceed. After implementation, the executor still runs browser visual evidence and mature series gates.

The user may explicitly choose between two kinds of work:

- **改动画**: improve the product animation while obeying the workflow work items.
- **改助手**: improve this workflow/tooling because the current process is insufficient for quality.

## How Existing Tools Fit

The workflow currently calls:

1. `tools/tactical-terrain-studio/run-animation-first-draft.mjs`
2. `tools/tactical-terrain-studio/run-terrain-pipeline.mjs`
3. `tools/tactical-terrain-studio/tactical-terrain-studio.mjs`
4. `tools/tactical-terrain-studio/terrain-unit-layer.mjs`
5. `tools/tactical-terrain-studio/unit-asset-package.py`
6. `tools/tactical-terrain-studio/capture-runtime-visual-evidence.mjs` when runtime visual evidence is required.
7. `tools/tactical-terrain-studio/analyze-runtime-visual-evidence.mjs` when `--visual-evidence` is provided.

Those tools cover the six production phases:

1. Map source data package.
2. DEM/terrain and historical tactical basemap package.
3. 3D/oblique camera envelope.
4. Unit assets, scale, and terrain placement.
5. Tactical movement preflight.
6. Visual evidence and first-draft gate.

## ComfyUI And Other Asset Tools

ComfyUI is not the global workflow runner. It is one possible tool inside phase 4.

The current ComfyUI integration is battle-specific for `伦敦上空的鹰`:

```bash
npm run assets:britain-air:comfy
npm run assets:britain-air:comfy-flight
npm run assets:britain-air:comfy:apply
```

It calls the existing external ComfyUI installation at:

```text
/Users/asukarei/Documents/我心飞翔/tools/ComfyUI
```

That chain creates source-backed aircraft candidates, saves contact sheets and metrics under `artifacts/`, and only applies runtime assets with explicit `--apply`.

The generic project rule is:

- battle-specific generators may use ComfyUI, segmentation, image search, manual retouching, or other tools;
- their outputs must be registered through `unitAssetPackage`;
- runtime assets must have source references, candidate artifacts when applicable, alpha/readability metrics, and contact-sheet evidence;
- screenshots or contact sheets are saved under `artifacts/`, not embedded in chat.

## Current Boundary

This workflow is not yet a full automatic animation builder. It is a process governor and tool orchestrator. Its job is to prevent the executor from skipping missing source, terrain, unit, movement, or visual evidence work and jumping into component-local hand tuning.

For Cannae, the calibrated 2026-06-14 workflow can now report all six phases ready for first-draft implementation while still listing non-blocking enhancements. Treat `ready-for-animation-first-draft-implementation` as permission to enter implementation or visual review from generated contracts, not as proof that the map, assets, motion, or final animation are already product-approved.

`ready` means the assistant found a traceable production contract for each phase. It does not mean:

- the historical GIS package is final;
- every DEM derivative has been professionally regenerated;
- Web 3D or browser evidence has passed visual review;
- the final animation can skip comparison against Gaixia/Nianzhuang and user-reported screenshots.

If non-blocking enhancements exist, keep them visible in handoffs and use them to choose the next layer to strengthen after the current first-draft or visual-review step.
