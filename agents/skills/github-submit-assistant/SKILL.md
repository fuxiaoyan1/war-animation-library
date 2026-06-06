---
name: github-submit-assistant
description: Use when preparing a GitHub update for this war-animation repository: gather all dirty work, write release/update notes, keep the disclaimer prominent, check source and copyright notes, run validation gates, commit locally, and push to GitHub.
---

# GitHub Submit Assistant

Use this skill before any GitHub-facing update of the war-animation repository, especially when a new animation is added or an existing animation changes history sources, media assets, route data, camera behavior, or narrative interpretation.

## Required Workflow

1. Inspect repository state:
   - `git status --short --branch`
   - `git remote -v`
   - `git log --oneline origin/main..HEAD`
   - `git diff --name-status origin/main`
2. Treat user instruction "submit all current project work" as permission to stage every tracked and untracked change with `git add -A`, including changes not made by the current agent.
3. Write or update a dated file under `docs/updates/` that explains user-facing changes relative to GitHub `origin/main`.
4. Ensure the root `DISCLAIMER.md` exists and README/NOTICE link to it prominently.
5. For every new animation or any changed information/media source:
   - update the relevant `docs/sources/*` file;
   - mention source/licensing changes in the update note;
   - preserve the statement that the project is open-source, non-commercial in intent, loves peace, and opposes war.
6. Run validation before commit:
   - `git diff --check`
   - `npm exec tsc -- -b`
   - `npm run build`
   - targeted Playwright gates for affected animations;
   - data quality gate when campaign data changes.
7. Commit with a concise Chinese message that names the release scope.
8. Push the current branch to `origin`.
9. Report commit hash, pushed branch, key changed docs, and verification results.

## Disclaimer Contract

The disclaimer must say, in substance:

- The project is educational, technical, open-source, and non-commercial in maintainer intent.
- The maintainers love peace and oppose war.
- Animations do not glorify violence or endorse political, military, ethnic, national, religious, or ideological positions.
- Historical data is source-backed but compressed, approximate, and not authoritative advice.
- Code is MIT unless otherwise stated.
- Media, maps, audio, fonts, and unit markers may carry separate terms and are not automatically MIT licensed.
- Rights concerns should be handled by correcting attribution, replacing material, or removing it.

## Output Expectations

Keep the final user response short but include:

- local commit hash;
- pushed remote and branch;
- update note path;
- disclaimer path;
- skill path;
- verification commands that passed;
- any command that could not be run or any push failure.

