# 十大战役阵法动画长期计划 / Top Formation-Battles Animation Roadmap

本计划是现有“战争动画藏书馆”的长期排期和资料底座，用于把十个阵法记录较完整的中外战役，陆续纳入本仓库既有动画产品流程。当前阶段只整理候选、资料线索、制作顺序和验收口径，不进入动画代码实现。

This roadmap is a backlog and research base inside the existing War Animation Library. It turns ten formation-rich battles into future source-backed, playable, testable entries through the repository's mature production workflow. The current stage establishes candidates, source leads, sequencing, and acceptance expectations only; animation implementation has not started.

## Repository Position / 仓库定位

- This is not a separate product line, framework, renderer, or workflow.
  本计划不是另起一套产品线、框架、渲染器或工作流。
- Every future battle must be built inside the existing app/library structure, under `AGENTS.md`, the `animation-assistant` skill, handoff docs, mempalace lessons, and the mature series Playwright gates.
  后续每一役都必须在现有应用/藏书馆结构中制作，并受 `AGENTS.md`、`animation-assistant` skill、交接文档、mempalace 经验和成熟系列 Playwright 门禁约束。
- "Independent animation" only means an independent library entry with its own data, source note, assets, gates, and release notes. It does not mean an independent repo, standalone renderer, isolated component experiment, or narrow smoke-test path.
  “独立动画”只表示它在藏书馆中有独立入口、数据、来源说明、资产、门禁和更新说明；不表示独立仓库、独立渲染器、孤立组件实验或窄测试路径。
- New shared helpers may be extracted only after a real implementation proves repeated need inside the existing architecture. They must not be designed first as a way to bypass Gaixia/Nianzhuang-style production practice.
  新的共享辅助能力只能在真实实现证明现有架构内存在重复需求后再抽取，不能先设计一套东西来绕开垓下/碾庄这类成熟生产工艺。

## Scope / 范围

Target battles:

目标战役：

1. Waterloo / 滑铁卢
2. Cannae / 坎尼
3. Gaugamela / 高加米拉
4. Pharsalus / 法萨卢斯
5. Raphia / 拉菲亚
6. Hydaspes / 海达斯佩斯
7. Leuctra / 留克特拉
8. Agincourt / 阿金库尔
9. Jingxing / 井陉
10. Fei River / 淝水

Research base:

资料底座：

- Source and map leads: `docs/sources/top-formation-battles.md`
- Source website index: `SOURCE_INDEX.md`
- Disclaimer and licensing requirements: `DISCLAIMER.md`, `NOTICE.md`
- P0 rules: `AGENTS.md`
- Animation implementation workflow: `/Users/asukarei/.codex/skills/animation-assistant/SKILL.md`, `docs/animation-assistant-agent.md`
- GitHub submission/documentation governance: repository docs, `DISCLAIMER.md`, `NOTICE.md`, and `SOURCE_INDEX.md`

## Long-Term Goals / 长期目标

- Build ten future tactical battle entries in the existing library, each with play/pause/replay, draggable timeline, event jumps, narration subtitles, source notes, and map pan/zoom.
  在现有藏书馆中制作十个后续战术战役入口，每部都支持播放/暂停/回放、拖拽时间轴、事件跳转、旁白字幕、来源说明和地图平移缩放。
- Reuse the repository's mature animation structures first: source-backed data files, map-first stage layout, staged camera, era-specific assets, low subtitles, below-map story/evidence, and mature Playwright gates.
  优先复用本仓库已经成熟的动画结构：来源支撑的数据文件、地图优先舞台、阶段镜头、时代化资产、低位字幕、地图下方叙事/证据区和成熟 Playwright 门禁。
- Any shared formation helper must emerge from repo-integrated implementations and remain subordinate to the existing animation library architecture.
  任何共享阵法辅助能力都必须从已接入本仓库的真实实现中沉淀，并服从现有战争动画藏书馆架构。
- Treat every battle as a source-backed reconstruction with explicit uncertainty labels.
  每部战役都作为有来源支撑的复原处理，并显式标注不确定性。
- Keep the series educational, non-commercial in maintainer intent, and anti-war in framing.
  系列保持教育用途、维护者非商业意图，并坚持反战表达。

## Production Order / 制作顺序

| Batch | Battles | Why this order | Deliverable inside this repo |
| --- | --- | --- | --- |
| 0 | Repo-aligned preparation | Read P0, animation-assistant, handoff, mempalace, reference implementations, and source leads before any code. | per-battle source brief, reference-animation map, gate checklist |
| 1 | Leuctra, Cannae, Pharsalus | Best first ancient set for testing formation expression while staying inside the current library workflow. | repo-integrated tactical entries and migrated series gates |
| 2 | Gaugamela, Raphia, Hydaspes | Extend existing stage/data/asset patterns to chariots, elephants, second lines, and river crossing. | repo-integrated entries with battle-specific assets, source notes, and validated gates |
| 3 | Jingxing, Fei River | Apply existing ancient-China and map-first rules to camp control, river-line morale collapse, and source-language labels. | repo-integrated ancient China tactical entries |
| 4 | Agincourt | Use existing map-first workflow for medieval infantry, archers, stakes, mud, and congestion. | repo-integrated medieval tactical entry |
| 5 | Waterloo | Use existing modern-war workflow for line/column/square/artillery/cavalry/Prussian arrival and dense timing. | repo-integrated Napoleonic tactical entry |

## Phase 0: Repo-Aligned Preparation / 第 0 阶段：仓库对齐准备

Tasks:

任务：

- Before each battle, read `AGENTS.md`, the `animation-assistant` skill, the latest handoff docs, mempalace workflow/visual-rules/failure-modes, relevant source docs, and reference implementations/tests.
  每一役开工前必须读取 `AGENTS.md`、`animation-assistant` skill、最新交接文档、mempalace 的 workflow/visual-rules/failure-modes、相关来源文档和参考动画实现/测试。
- For each approved battle, create or update its own `docs/sources/<battle>.md` before implementation.
  每个经用户确认开工的战役，必须先创建或更新自己的 `docs/sources/<battle>.md`，再进入实现。
- Map the battle to existing production patterns before writing components: Gaixia/Nianzhuang for tilted tactical stages and endgame handling, relevant naval/air/modern examples when the battle type requires them, and the shared `CampaignMapAnimation` contract where appropriate.
  写组件前先把战役映射到既有生产模式：垓下/碾庄用于倾斜战术舞台和终局处理；如战役类型需要，再参考相应海战、空战、现代战争案例；适合时继续沿用共享 `CampaignMapAnimation` 合同。
- Define the battle data in normal repository data files first: events, routes, formations, camera stages, narration cues, sources, and uncertainty notes.
  先在本仓库常规数据文件中定义战役数据：事件、路线、阵形、镜头阶段、旁白 cue、来源和不确定性。
- Define uncertainty labels:
  定义不确定性标签：
  - `certain`: explicit source or strong modern consensus.
  - `probable`: reasonable synthesis from multiple sources.
  - `schematic`: tactical diagram for explanation, not a coordinate claim.
  - `contested`: known scholarly or source disagreement.
- Build a battle-specific asset requirement list, not a generic icon system:
  建立战役专属资产需求清单，而不是另做一套通用图标系统：
  - Greek/Macedonian phalanx, Roman legion, Carthaginian infantry, cavalry, elephant, chariot, longbowmen, dismounted men-at-arms, Napoleonic infantry square, artillery battery.
- Decide map baselines:
  决定地图底座：
  - ancient/medieval tactical maps can use simplified terrain with real coordinates where defensible;
  - Waterloo should use real local geography and named strongpoints;
  - contested ancient sites should use tactical abstraction plus uncertainty note.
- Do not create a new standalone renderer, schema package, or isolated smoke test as the first implementation move.
  不得把新建独立渲染器、schema 包或孤立 smoke test 当成第一步实现动作。

Acceptance gates:

验收门槛：

- Startup-reading evidence and reference-animation mapping are documented for the selected battle.
- The implementation path explicitly stays inside the current app/library architecture.
- The first source note for the selected battle exists or has a tracked update.
- The initial gate checklist names existing mature series gates to inherit and battle-specific risks to add.
- No standalone renderer or narrow page-existence test has been created as a substitute for product work.

## Batch 1: Ancient Core / 第一批：古典核心战例

Batch rule: start from the existing ancient-war production pattern, especially Gaixia's tilted tactical stage, route continuity, low subtitle ticker, below-map story/evidence, and mature gates. Do not create an isolated "ancient formation renderer" first.

批次规则：从本仓库既有古代战争生产模式开工，尤其对齐垓下的倾斜战术舞台、路线连续性、低位字幕、地图下方叙事/证据区和成熟门禁。不得先另建孤立“古代阵法渲染器”。

### Leuctra / 留克特拉

Goal: explain deep left-wing shock and oblique/refused formation.

目标：解释底比斯左翼深阵冲击和斜形/拒止布置。

Key events:

关键节点：

- Spartan right is identified as the decisive point.
- Theban left deploys in deep column.
- Theban weaker side refuses/holds back.
- Spartan right breaks first; the rest of the line destabilizes.

Special tests:

专项测试：

- Theban left depth must be visibly greater than other blocks.
- Oblique advance must not look like a straight full-line charge.

### Cannae / 坎尼

Goal: make double envelopment readable without overloading the map.

目标：清楚表现双重包围，不让地图过载。

Key events:

关键节点：

- Roman mass deploys and advances.
- Hannibal's center yields from convex to concave.
- Carthaginian cavalry clears Roman cavalry.
- African infantry turns inward.
- Roman mass is enclosed and compressed.

Special tests:

专项测试：

- Roman block must visibly compress after center yields.
- Both Carthaginian wings must close before final encirclement effect.
- Cannae must start fresh from approved sources and current mature workflow; do not restore the deleted failed standalone base.
  坎尼必须从用户确认的来源和当前成熟流程重新开工；不得恢复已删除的失败独立底板。

### Pharsalus / 法萨卢斯

Goal: show how Caesar's fourth line defeats Pompey's cavalry plan.

目标：表现凯撒第四线如何击破庞培骑兵方案。

Key events:

关键节点：

- Both Roman armies deploy in multiple lines.
- Pompey's cavalry and archers/slingers move against Caesar's flank.
- Caesar's withheld fourth line advances diagonally or laterally into the cavalry.
- Pompey's cavalry flees; Caesar's infantry turns the flank.

Special tests:

专项测试：

- Fourth line must remain hidden/held before commitment.
- Cavalry rout must precede Pompeian infantry collapse.

## Batch 2: Combined-Arms Hellenistic and Imperial Battles / 第二批：希腊化与帝国复合兵种

Batch rule: extend existing map/stage/asset patterns inside the current library entry model. Add chariot, elephant, reserve-line, or river-crossing expression only as battle-specific layers first; extract shared helpers only after multiple repo-integrated entries prove the same need.

批次规则：在当前藏书馆入口模型内扩展既有地图、舞台和资产模式。战车、战象、预备线或渡河表达先作为战役专属层实现；只有多个已接入仓库的入口证明存在同类需求后，才能抽取共享辅助能力。

### Gaugamela / 高加米拉

Goal: show Alexander's oblique pressure, Persian breadth, chariots, and anti-envelopment reserve.

目标：表现亚历山大斜向压力、波斯宽大战线、战车和防包抄预备线。

Key risks:

关键风险：

- Battlefield location is contested; map must not overclaim precision.
- Persian scale cannot make Macedonian formations unreadably small.

### Raphia / 拉菲亚

Goal: build a clean Hellenistic system with phalanx, elephants, cavalry, and light troops.

目标：建立方阵、战象、骑兵、轻装部队组成的希腊化大阵系统。

Key risks:

关键风险：

- Elephant positions vary by reconstruction; mark as source-backed but schematic.
- The center phalanx engagement must not hide wing dynamics.

### Hydaspes / 海达斯佩斯

Goal: combine river deception/crossing with battlefield response to elephants.

目标：结合渡河欺敌与对战象阵的战场应对。

Key risks:

关键风险：

- Exact crossing and battle sites are debated.
- Porus' elephant line must be visible without turning the battle into a monster-scene spectacle.

## Batch 3: Ancient Chinese Formation Logic / 第三批：中国古代阵法逻辑

Batch rule: use the existing ancient-China/map-first rules already accumulated in this repository. Chinese-language source claims, camp control, river-line movement, and morale collapse must be modeled as data and evidence, not as a separate Chinese-history renderer.

批次规则：使用本仓库已经沉淀的古代中国/地图优先规则。中文史料口径、营地控制、河线移动和士气崩溃必须作为数据和证据建模，不得另做“中国史渲染器”。

### Jingxing / 井陉

Goal: animate the back-to-water array as psychological and tactical bait, not a static miracle.

目标：把背水阵表现为心理和战术诱敌，而不是静态神迹。

Key events:

关键节点：

- Han Xin sends advance troops to back-water position.
- Zhao forces leave camp to attack.
- Han detachment seizes Zhao camp and changes flags.
- Zhao army loses cohesion between battlefield and camp.

### Fei River / 淝水

Goal: animate formation breakdown across a river-line standoff.

目标：表现临河对峙中阵列如何从移动变成崩溃。

Key events:

关键节点：

- Qin and Jin forces face each other across/near the Fei River.
- Jin asks Qin to withdraw slightly for crossing/battle.
- Qin movement becomes disorder; Zhu Xu's shout accelerates panic.
- Qin formation collapses and routs.

## Batch 4: Medieval Formation and Terrain / 第四批：中世纪阵形与地形

Batch rule: use the existing map-first product surface and add medieval terrain/asset layers only where the selected battle's sources require them.

批次规则：使用现有地图优先产品界面，只在所选战役来源需要时增加中世纪地形和资产层。

### Agincourt / 阿金库尔

Goal: make the mud funnel, stakes, archers, and dismounted men-at-arms work together.

目标：让泥泞狭道、木桩、长弓手和下马重装步兵形成一个完整战术机制。

Special tests:

专项测试：

- Archers/stakes must stay on flanks, not in the central men-at-arms block.
- French advance must visually compress before collapse.
- Mud/terrain constraints must explain congestion.

## Batch 5: Napoleonic Formation Density / 第五批：拿破仑时代高密度阵法

Batch rule: use the existing modern-war workflow and Napoleonic-era asset/audio conventions. Waterloo is a dense library entry, not a new early-modern engine.

批次规则：使用现有现代战争工作流和拿破仑时代资产/音频约定。滑铁卢是一个高密度藏书馆入口，不是新的近代战争引擎。

### Waterloo / 滑铁卢

Goal: represent line, column, square, cavalry charges, artillery, strongpoints, and Prussian arrival without losing readability.

目标：在保持可读性的前提下表现线列、纵队、方阵、骑兵冲击、炮兵、支撑点和普军到场。

Special tests:

专项测试：

- British/Allied squares must appear only during cavalry-charge phases.
- Hougoumont, La Haye Sainte, Papelotte, Plancenoit, and the Mount St Jean ridge must be spatially stable.
- Prussian arrival must affect French right/rear pressure before the Imperial Guard final attack resolves.

## Shared Acceptance Criteria / 共享验收标准

- Source file exists before code implementation.
  代码实现前必须已有来源文件。
- The animation is registered as an existing library entry, not a separate app, separate repo, or standalone renderer experiment.
  动画必须作为现有藏书馆入口接入，而不是独立应用、独立仓库或独立渲染器实验。
- Each battle has at least five event anchors and at least three formation transitions.
  每役至少有五个事件锚点和三个阵形转换。
- Active battle area remains centered during event jumps and playback.
  事件跳转和播放时，当前战斗区域保持居中。
- Important formations are visible at map scale and do not overlap labels.
  关键阵形在地图比例下可见，且不与标签重叠。
- Audio matches era: ancient melee/cavalry, medieval arrows/melee, Napoleonic cannon/musket/cavalry.
  音频匹配时代：古代近战/骑兵，中世纪箭雨/近战，拿破仑时代火炮/火枪/骑兵。
- Every uncertainty claim appears in the source note and, where relevant, in UI text.
  每个不确定性判断都记录在来源说明中，必要时也出现在界面文本里。
- Gates live in the mature series suite unless there is a documented repo-level reason to add another shared suite; no battle may rely on a page-existence-only smoke test.
  门禁应进入成熟系列测试套件，除非有明确仓库级理由新增共享测试套件；任何战役都不得依赖只证明页面存在的窄 smoke test。

## Immediate Next Steps / 近期下一步

1. Do not create a shared renderer or schema first. When the first implementation task is approved, create the selected battle's source brief, data model, reference-animation mapping, and inherited gate checklist inside the current repo workflow.
   不要先创建共享渲染器或 schema。第一项实现任务确认后，先在当前仓库流程内建立所选战役的来源简报、数据模型、参考动画映射和继承门禁清单。
2. Start with Leuctra only after explicit user approval, because it has clear asymmetric depth, oblique pressure, and limited terrain complexity.
   首先制作留克特拉，因为其非对称纵深、斜向压力和地形复杂度都更适合作为稳定起点。
3. After Leuctra, Cannae and Pharsalus remain future candidates for validating envelopment geometry, compression, hidden reserve, and cavalry counteraction; Cannae must start fresh from approved sources and mature workflow, not from the deleted failed standalone base.
   留克特拉之后制作坎尼和法萨卢斯，用来验证渲染器是否能处理包围几何、压缩、隐藏预备队和骑兵反制。
4. Only after repo-integrated ancient entries are stable, extend existing map/stage/unit patterns for elephants, chariots, and river crossing in Gaugamela, Raphia, and Hydaspes.
   古典核心稳定后，再为高加米拉、拉菲亚和海达斯佩斯加入战象、战车、渡河模块。
5. Keep each battle's release note bilingual and update `SOURCE_INDEX.md`, `DISCLAIMER.md`, and `NOTICE.md` whenever sources or asset terms change.
   每部战役的发布说明保持双语；来源或素材条款变化时同步更新 `SOURCE_INDEX.md`、`DISCLAIMER.md` 和 `NOTICE.md`。
