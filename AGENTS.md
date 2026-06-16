# War Animation Lab P0 Rules

These rules are P0 for this repository. They apply before any animation research, implementation, repair, review, handoff, or release note work.

## 0. Project Role

- Current executor role: `animation_assistant_workflow_operator`.
- All animation work must follow the `animation-assistant` skill as the production workflow and quality standard library, then read the local project evidence listed below.
- Runner/resident/worker/sub-agent flows are optional execution layers. They cannot replace the current executor's responsibility for source quality, visual judgment, browser evidence, series regression gates, and user goals.

## 0.1 Design-First Rule

- The first acceptance target is a polished, watchable animation product: clear battle design, readable era-specific assets, strong composition, smooth camera movement, useful pacing, and a map-first viewing experience.
- Quality gates exist to prevent regression and catch production drift. They are not the design brief, and passing tests does not make an ugly, confusing, placeholder-heavy, or visually mechanical animation acceptable.
- Before writing or changing gates, design the animation from sources and reference-quality examples first. Then encode the highest-risk visual and data failures as tests.
- Unit-asset prompts and production notes must require era-specific references and finished, faction-distinct markers up front. A black silhouette or generic placeholder is a production failure to prevent in the asset process; automated checks should only catch obvious fallback or regression cases.

## 1. Required Startup Reading

Before changing an animation, the executor must read the relevant parts of:

1. `/Users/asukarei/.codex/skills/animation-assistant/SKILL.md`
2. `docs/animation-assistant-agent.md`
3. Latest applicable `docs/war-animation-handoff*.md`
4. Relevant `docs/sources/<animation>.md`
5. Relevant `docs/updates/war-animation-update-*.md` gate section
6. Mempalace project memories for `war-animation-lab-oss`, especially workflow, visual-rules, and failure-modes
7. Existing implementation and tests for the requested reference animation

Do not start from an isolated component file or a new narrow smoke test when the task is to create or repair a production animation.

## 2. No Bypass

- It is forbidden to bypass `animation-assistant`, handoff docs, source docs, mempalace memories, formal Playwright evidence, and series-specific QA by independently producing an animation and only doing superficial acceptance afterward.
- It is forbidden to treat a local worker, resident, sub-agent, or generated test as proof that the animation is good. The current executor must inspect the resulting code, data, browser behavior, screenshots saved to artifacts, and regression output.
- It is forbidden to create a standalone narrow test that only proves the new page exists while ignoring mature series gates such as camera framing, battle density, unit readability, faction distinction, route continuity, interaction smoothness, subtitles, source evidence, and audio semantics.

## 3. Reference Animation Rule

If the user explicitly says to use an existing animation as a reference, the referenced animation's quality gates become mandatory for the new or changed animation.

Examples:

- If the user says "参照垓下", read `GaixiaAmbushAnimation`, `GaixiaTerrain3D`, `docs/sources/gaixia-ambush.md`, the Gaixia gate section in `docs/updates/war-animation-update-2026-05-27.md`, and the Gaixia Playwright assertions in `tests/battle-france-smoke.spec.ts`.
- If the user says "参照碾庄", read `NianzhuangBattleAnimation`, `NianzhuangTerrain3D`, `docs/sources/nianzhuang-battle.md`, the Nianzhuang gate section in `docs/updates/war-animation-update-2026-05-27.md`, and the Nianzhuang Playwright assertions in `tests/battle-france-smoke.spec.ts`.
- If the user names any other animation, find its component, data file, source doc, update gate, and smoke assertions before implementation.

The executor must adapt the referenced gates to the target battle instead of copying surface styling. For example, "参照垓下/碾庄" means inheriting the production loop: real sources, data model, stage camera, dominant map stage, low subtitle ticker, below-map story/evidence placement, readable era-specific units, route/effect continuity, and Playwright gates that catch visual regressions.

## 4. Mature Series Gates

Production animation changes must pass the relevant series gates. The minimum gate set is:

```bash
git diff --check
npm exec tsc -- -b
npm run build
FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "campaign data quality gates"
node /Users/asukarei/.codex/skills/animation-assistant/scripts/check-animation-project.mjs /Users/asukarei/Desktop/war-animation-lab-oss
```

When changing or referencing Gaixia:

```bash
FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "gaixia ambush uses terrain map ten-sided formations and pipa score"
```

When changing or referencing Nianzhuang:

```bash
FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "nianzhuang battle shows Huang Baitao pocket relief blocking trenches and final pursuit"
```

When adding a new production animation, add its durable gates to the mature series suite, preferably `tests/battle-france-smoke.spec.ts`, unless there is a clear project-level reason to create another shared suite. A new test must cover the actual user-visible quality risks, not only page existence.

## 5. Visual Quality Floor

The following are P0 visual gates for war animations:

- The battle map must dominate the first screen; narration, evidence, and detail panels must not compete beside the map unless the referenced production pattern already does so.
- The active battle area and current contact geometry must stay near the visual core. Large empty land/water should not dominate unless the historical action requires it.
- Opposing sides must be distinguishable at map scale through faction-specific assets, color, badges, and line semantics.
- Era-specific unit icons must be readable mini-illustrations or locally verified assets. Dark silhouettes, generic fallbacks, or same-looking opposing units are failures.
- Routes, units, formations, effects, and labels must preserve operational continuity. Units should not appear, disappear, or hand off without a data reason and a regression gate.
- Camera changes and manual map interaction must be smooth and must not fight each other.
- Subtitles must be low, compact, and non-blocking; evidence/story sections must follow the established series layout.
- User-reported screenshots are ground truth. Save screenshot evidence to `artifacts/`, but do not embed images in chat unless the user explicitly asks.

## 5.1 Tactical Pacing Rule

- New war animations default to exactly five minutes unless the user explicitly requests a different runtime. For data-driven playback this means `playbackDurationSeconds = 300`.
  新战争动画默认片长为 5 分钟，除非用户明确要求其他时长。数据驱动播放中应体现为 `playbackDurationSeconds = 300`。
- Short tactical battles must use hour-level anchors and battle-area camera stages. Do not stretch them into week-level campaign pacing or large-area movement maps.
  短时战术会战必须使用小时级锚点和战场区域镜头，不得拉成周级战役节奏或大范围运动地图。
- Ancient formation battles need a visible but compact deployment segment. Opposing forces should not begin fully and perfectly arrayed at the first frame, but deployment also must not consume a large share of the five-minute runtime.
  古代阵法战必须有可见但短促的部署段。双方不能在首帧就完整静止列阵，但部署也不能占用 5 分钟片长中过大的比例。
- Fixed-position formation battles are not broad movement campaigns. Keep the camera tight on active contact, flanking movement, rear closure, collapse, and key unit/commander outcomes. Avoid long blank spans, sudden teleporting, or routes/units that appear and disappear without a source/data reason.
  定点阵法战不是大范围运动战。镜头应紧贴当前接触、侧翼动作、后口封闭、崩溃和关键单位/人物结果，避免长时间空白、突然瞬移，或没有来源/数据理由的路线和单位忽隐忽现。
- Route handoffs must preserve continuity. If a later route represents compression, inward turn, rear closure, pursuit, or destruction after a previous task, use route prelude/visibility windows and tests so the new action visibly inherits the prior position rather than popping into existence.
  路线任务交接必须保持连续。若后续路线表示压缩、内折、封口、追击或歼灭，应使用前置路线、可见窗口和测试，让新动作可见地继承前一段位置，而不是凭空出现。

## 5.2 Formation Movement Design Loop

- Formation battles and short close-combat battles must produce evidence that the five-pass movement design loop from `animation-assistant` was applied: unit scale, map/camera envelope, separate side movement, integrated contact/path review, and full visual replay.
  阵法战和短兵相接战必须留下证据，证明已执行 `animation-assistant` 中的五道动线设计工序：单位尺度、地图/镜头包络、双方独立动线、合并后的接触/路径复核、完整视觉回放。
- AGENTS.md stays at repository-policy level. Detailed battle-specific movement rules, checklists, and acceptance notes belong in the skill, source docs, update docs, tests, and artifacts.
  AGENTS.md 只保留仓库级规则。具体战役的动线细则、清单和验收说明应放在 skill、sources、updates、tests 和 artifacts 中。

## 6. Failed Animation Restart Rule

If an animation base has repeatedly failed product-quality review, stop patching it as a local component problem. Delete the failed isolated runtime when requested, preserve only user-approved source/research material, and restart from the mature animation product flow with reference implementation review, visual inspection, and inherited series gates before it can be treated as production-quality.

## 7. Memory And Handoff

Every user-visible failure, successful correction, workflow loophole, and new acceptance rule must be recorded in project docs and mempalace after the implementation is verified. If a failure cannot yet be automated, record the manual review rule and the reason it is not automated.
