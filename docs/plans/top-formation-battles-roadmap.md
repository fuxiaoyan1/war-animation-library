# 十大战役阵法动画长期计划 / Top Formation-Battles Animation Roadmap

本计划用于把十个阵法记录较完整的中外战役，陆续制作成可播放、可验证、来源可追溯的战术动画。当前阶段只完成资料底座和制作路线，不进入动画代码实现。

This roadmap turns ten formation-rich battles into source-backed, playable, testable tactical animations over multiple iterations. The current stage establishes the research base and production plan only; animation implementation has not started.

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
- Animation implementation rules: `agents/skills/animation-assistant/SKILL.md`
- GitHub submission/documentation governance: `agents/skills/github-submit-assistant/SKILL.md`

## Long-Term Goals / 长期目标

- Build ten independent tactical battle animations, each with play/pause/replay, draggable timeline, event jumps, narration subtitles, source notes, and map pan/zoom.
  制作十个独立战术战役动画，每部都支持播放/暂停/回放、拖拽时间轴、事件跳转、旁白字幕、来源说明和地图平移缩放。
- Reuse a common "formation battle" renderer for ancient, medieval, and early-modern tactical maps while allowing era-specific markers and audio.
  复用通用“阵法战役”渲染器，同时允许古代、中世纪、近代战役使用各自的单位标记和音频。
- Treat every battle as a source-backed reconstruction with explicit uncertainty labels.
  每部战役都作为有来源支撑的复原处理，并显式标注不确定性。
- Keep the series educational, non-commercial in maintainer intent, and anti-war in framing.
  系列保持教育用途、维护者非商业意图，并坚持反战表达。

## Production Order / 制作顺序

| Batch | Battles | Why this order | Deliverable |
| --- | --- | --- | --- |
| 0 | Shared research/modeling | Build shared schemas and visual grammar before drawing any one battle. | data model spec, marker inventory, uncertainty taxonomy |
| 1 | Cannae, Leuctra, Pharsalus | Best first ancient set: clear formation logic, limited terrain complexity, strong tactical contrast. | reusable ancient formation renderer |
| 2 | Gaugamela, Raphia, Hydaspes | Add large Hellenistic/Persian/Indian combined-arms systems: chariots, elephants, second lines, river crossing. | chariot/elephant/river modules |
| 3 | Jingxing, Fei River | Adapt renderer to Chinese historical sources, camp control, river-line morale collapse, and source-language labels. | ancient China formation module |
| 4 | Agincourt | Add medieval infantry/archer/stake/mud-congestion mechanics. | medieval tactical module |
| 5 | Waterloo | Add Napoleonic line/column/square/artillery/cavalry/Prussian arrival and higher-density battlefield timing. | early-modern tactical module |

## Phase 0: Shared Research and Modeling / 第 0 阶段：共享资料与建模

Tasks:

任务：

- Create a shared formation data schema:
  建立共享阵法数据结构：
  - `formationBlocks`: unit blocks, depth, width, facing, density, certainty.
  - `formationTransitions`: advance, wheel, refuse flank, open gap, collapse, envelop.
  - `terrainConstraints`: river, ridge, mud, road, pass, camp, village, fieldwork.
  - `sourceClaims`: source URL, claim type, confidence, quoted/paraphrased evidence.
- Define uncertainty labels:
  定义不确定性标签：
  - `certain`: explicit source or strong modern consensus.
  - `probable`: reasonable synthesis from multiple sources.
  - `schematic`: tactical diagram for explanation, not a coordinate claim.
  - `contested`: known scholarly or source disagreement.
- Build marker inventory:
  建立单位标记清单：
  - Greek/Macedonian phalanx, Roman legion, Carthaginian infantry, cavalry, elephant, chariot, longbowmen, dismounted men-at-arms, Napoleonic infantry square, artillery battery.
- Decide map baselines:
  决定地图底座：
  - ancient/medieval tactical maps can use simplified terrain with real coordinates where defensible;
  - Waterloo should use real local geography and named strongpoints;
  - contested ancient sites should use tactical abstraction plus uncertainty note.

Acceptance gates:

验收门槛：

- One shared TypeScript data interface draft.
- One visual legend shared across the formation series.
- One Playwright smoke pattern for formation block visibility and current-event focus.
- One source-note template for each future battle.

## Batch 1: Ancient Core / 第一批：古典核心战例

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

### Agincourt / 阿金库尔

Goal: make the mud funnel, stakes, archers, and dismounted men-at-arms work together.

目标：让泥泞狭道、木桩、长弓手和下马重装步兵形成一个完整战术机制。

Special tests:

专项测试：

- Archers/stakes must stay on flanks, not in the central men-at-arms block.
- French advance must visually compress before collapse.
- Mud/terrain constraints must explain congestion.

## Batch 5: Napoleonic Formation Density / 第五批：拿破仑时代高密度阵法

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

## Immediate Next Steps / 近期下一步

1. Create a shared TypeScript formation schema draft under `src/data` or `src/lib` after the first implementation task is approved.
   在第一项实现任务确认后，在 `src/data` 或 `src/lib` 下建立共享阵法 TypeScript schema 草案。
2. Start with Cannae because it has strong sources, clear formation phases, and a manageable terrain problem.
   首先制作坎尼，因为其资料较强、阵法阶段清晰、地形问题相对可控。
3. After Cannae, implement Leuctra and Pharsalus to validate whether the renderer handles depth, refused flank, hidden reserve, and cavalry counteraction.
   坎尼之后制作留克特拉和法萨卢斯，用来验证渲染器是否能处理纵深、拒止侧翼、隐藏预备队和骑兵反制。
4. Only after the ancient core is stable, add elephants/chariots/river-crossing modules for Gaugamela, Raphia, and Hydaspes.
   古典核心稳定后，再为高加米拉、拉菲亚和海达斯佩斯加入战象、战车、渡河模块。
5. Keep each battle's release note bilingual and update `SOURCE_INDEX.md`, `DISCLAIMER.md`, and `NOTICE.md` whenever sources or asset terms change.
   每部战役的发布说明保持双语；来源或素材条款变化时同步更新 `SOURCE_INDEX.md`、`DISCLAIMER.md` 和 `NOTICE.md`。
