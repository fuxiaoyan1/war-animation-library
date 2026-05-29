# 战争动画藏书馆交接文档（2026-05-29）

交接时间：2026-05-29 CST

项目路径：`/Users/asukarei/Desktop/war-animation-lab-oss`

当前分支：`main`

远端：`origin git@github.com-war-animation-lab:fuxiaoyan1/war-animation-library.git`

当前提交基线：`fd3a660 细化碾庄圩围歼战时间线与可读性`

当前工作区状态：碾庄圩本轮深化改动尚未提交；本文档也是新增未提交文件；`git status --short` 还会看到 `?? logs/`，这是本地运行产物，默认不要提交。

本文件是新会话第一入口。旧交接文档 `docs/war-animation-handoff-20260526.md` 和 `docs/war-animation-handoff.md` 保留为历史经验库；新会话若继续碾庄圩，应先读本文件，再读 `docs/sources/nianzhuang-battle.md`、`src/data/nianzhuangBattle.ts`、`tests/battle-france-smoke.spec.ts`。

## 状态摘要

- 本轮主线：继续打磨解放战争碾庄圩围歼战动画，重点解决总攻后单位连续性、国民党军终局被歼地晚显、总攻阶段节奏过快、地图提前剧透等问题。
- 当前代码状态：6 个 tracked 文件有源码/测试/来源文档改动，另新增本交接文档。`logs/` 未跟踪但不属于交付物。
- 当前验证状态：生产构建、碾庄定向 Playwright、全量 smoke、`git diff --check` 均已通过；预览服务已停止。
- 当前交接目标：让下一会话能从 `fd3a660` 之后的未提交改动继续，不误改时间轴、不误提交日志、不在会话中展示图片。

## 0. 绝对优先事项

- 与用户沟通使用中文。
- 不要在会话中展示图片、截图、视频帧、base64、测试截图或素材预览。用户明确要求“不要在会话中展示图片”。视觉验证可以本地做，最终只汇报文字结论和数值结果。
- 用户的视觉反馈是验收事实。地图太小、单位突然消失、部队穿越无战斗、战斗效果无单位、增援突然冒出、提前剧透、时间线乱套，都按真实缺陷处理。
- 这个项目是战争动画作品库，不是普通前端页面。优先改结构化战史数据、路线、时间轴、镜头、单位可见窗口、战斗效果和测试。
- 通用渲染器 `CampaignMapAnimation` 只在确实需要共性能力时改；本轮只给它加了 `dateAnchors` 透传，避免碾庄专属压缩时间轴与事件/路线进度不同步。
- 工作区可能有用户或上轮未提交改动。不要还原不属于本任务的改动，不要提交 `logs/`。

## 1. 当前工作区概况

本轮未提交交付物涉及 7 个文件，其中 6 个是 tracked 文件，1 个是新增交接文档：

- `docs/sources/nianzhuang-battle.md`
- `src/components/CampaignMapAnimation.tsx`
- `src/components/NianzhuangBattleAnimation.tsx`
- `src/data/nianzhuangBattle.ts`
- `src/styles.css`
- `tests/battle-france-smoke.spec.ts`
- `docs/war-animation-handoff-20260529.md`

当前 `git status --short` 预期为：

```text
 M docs/sources/nianzhuang-battle.md
 M src/components/CampaignMapAnimation.tsx
 M src/components/NianzhuangBattleAnimation.tsx
 M src/data/nianzhuangBattle.ts
 M src/styles.css
 M tests/battle-france-smoke.spec.ts
?? docs/war-animation-handoff-20260529.md
?? logs/
```

tracked 文件改动规模：

```text
6 files changed, 617 insertions(+), 122 deletions(-)
```

当前 `git diff --check` 已通过。注意：本交接文档是 untracked 文件，`git diff --check` 不会自动覆盖它；若继续编辑本文档，提交前仍应检查尾随空白。

如果用户要求提交：

```bash
git status --short
git add docs/war-animation-handoff-20260529.md docs/sources/nianzhuang-battle.md src/components/CampaignMapAnimation.tsx src/components/NianzhuangBattleAnimation.tsx src/data/nianzhuangBattle.ts src/styles.css tests/battle-france-smoke.spec.ts
git commit -m "完善碾庄圩总攻后单位连续性与交接文档"
```

不要 `git add logs/`。

## 2. 本轮任务背景

用户在碾庄圩动画基础上继续提高要求，核心反馈是：

- 总攻开始后的阶段，解放军部队仍经常消失。
- 国民党军部队消失也没有表明歼灭地点。
- 动画节奏需要优化：前面不激烈的追击、固守、对壕部分压缩；后面总攻、突破、清剿部分拉长，避免运动像瞬间移动。
- 碾庄圩过程复杂，时间线、单位出现/消失时间必须反复核准。
- 地图文字不能提前剧透，否则影响观看。

此前用户还反复强调：

- 这是黄百韬碾庄圩，不是黄维双堆集。
- 这是几十万人级别相关战役中的复杂围歼，地图和单位必须能看出战术复杂性。
- 黄兵团至少要以师/军残部层级表现，不能只有大圈。
- 防线突破必须有明确碎裂，不能一条线直接扎进核心点。
- 解放军部队运动必须连续，轨迹接续，不要突然消失。
- 国民党军的军级单位要有被歼灭地演示，但地图文字不能提前剧透。

## 3. 本轮已完成的碾庄圩改动

### 3.1 压缩时间轴与节奏重排

`src/data/nianzhuangBattle.ts` 新增碾庄专属时间轴配置：

- `timelineInactiveGapDisplayDays = 0.1`
- `timelineActiveSpans = [{ start: "1948-11-19T10:00", end: "1948-11-22T20:00" }]`
- `timelineGapOverrides`
- `timelineDateAnchors`

关键播放节奏：

- 11月6日18:00 至 11月19日10:00：追击、合围、固守、试攻、对壕保留约半片时间，不再被压到只剩开场小段。
- 11月19日10:00 至 11月22日20:00：总攻令、夜间突击、内圩突破、清剿和终局约占整片二分之一。
- 11月19日21:15 至 22:30：第一道突破，显示时长 `0.6 displayDays`。
- 11月19日22:30 至 11月20日03:30：第二道围墙争夺，显示时长 `0.9 displayDays`。
- 11月20日03:30 至 05:15：内圩压缩，显示时长 `0.72 displayDays`。
- 11月20日05:30 至 11月22日16:00：残点清剿，分段拉开。
- 11月22日16:00 至 18:00：终局前最后压缩和追击，单独给较长时长。

注意：`timelineDateAnchors` 只保留 `timelineGapOverrides` 的离散边界，避免把 `22:29`、`22:31`、`05:29` 这类单位显示边界也塞进压缩轴，导致总攻段又被切碎。

补充用户反馈后的比例门禁：`expectNianzhuangTimelinePacing` 断言 1948-11-19T10:00 至片尾约为 48%-54%，夜间突击 21:15 至片尾低于 50%，避免总攻段占到四分之三。

`src/components/NianzhuangBattleAnimation.tsx` 已把这些配置传给：

- 本地 `createCampaignTimeline`
- `<CampaignMapAnimation />`

`src/components/CampaignMapAnimation.tsx` 新增 `dateAnchors?: string[]` prop，并传给通用 `createCampaignTimeline`。

### 3.2 解放军总攻后单位连续性

已修正路线窗口：

- `pla-general-assault-*` 从 21:15-22:30 的第一道突击路线，单位和航迹保留到 03:30，交给第二道推进线。
- `pla-second-wall-*` 从 22:30-03:30 推进，单位保留到 05:29，交给内圩压缩线。
- `pla-final-compression-*` 从 03:30-05:15 内圩压缩，单位保留到 05:30，交给残点清剿线。
- `pla-remnant-mop-up-*` 从 05:30 开始逐村清剿，单位保留到 11月22日16:20，交给 `pla-nizhuang-pursuit`。
- 新增拉锯/反压路线：
  - 外围：`pla-west-yield-and-hold`、`pla-west-counterpress`、`pla-east-counterpress`
  - 夜战：`pla-west-night-counterpress`、`pla-east-night-counterpress`
  - 残点：`pla-north-remnant-counterpress`、`pla-south-remnant-counterpress`

测试新增/强化：

- `expectNianzhuangCommunistUnitHandoff`
- 清剿线必须有 `unitVisibleUntil = "1948-11-22T16:20"`
- 页面测试检查 03:30、05:30、17:00 等节点的路线可见和单位可见状态。

### 3.3 国民党军消失与歼灭地点演示

已补齐从内圩到终局的国民党军连续链：

- 第一层完整防御圈 `huang-nianzhuang-defense-ring`
- 第一道碎裂/退缩：
  - `huang-inner-recoil`
  - `huang-north-fragment-recoil`
  - `huang-east-fragment-recoil`
  - `huang-south-fragment-recoil`
- 第二道/内圩：
  - `huang-second-wall-collapse`
  - `huang-final-core-defense`
- 内圩向东侧据点后撤：
  - `huang-remnant-fallback-east`
  - `huang-east-remnant-defense`
- 拉锯/反扑：
  - `huang-west-counterpush`、`huang-east-counterpush`
  - `huang-west-night-counterattack`、`huang-east-night-counterattack`
  - `huang-north-remnant-sortie`、`huang-south-remnant-sortie`
- 22日16:00 后军级终局路线：
  - `huang-final-north-collapse`：25军残部退守尤家湖终点。
  - `huang-final-east-collapse`：64军残部退守小院上吴庄终点。
  - `huang-final-south-collapse`：44/100军残部退守南侧终点。
  - `huang-nizhuang-final-flight`：黄百韬残部向倪庄逃散。

地图晚显标注：

- `nianzhuang-destruction-site-25`
- `nianzhuang-destruction-site-64`
- `nianzhuang-destruction-site-44-100`
- `nianzhuang-destruction-site-command`

这些标注的 `revealAt` 都是 `1948-11-22T18:00`。终局前不能出现“被歼”“覆灭”“终局点”等文字。

样式：

- `src/styles.css` 新增 `.nianzhuang-battle .destruction-site-marker*`，用于终局被歼地标注。

### 3.4 反剧透规则

已做两层处理：

1. 地图点和路线标签在终局前只使用“据点、封锁点、终点”等当前态词，不提前写“被歼地”。
2. 测试 `expectNianzhuangNoResultSpoilers` 在多个节点断言地图文本不包含：
   - `被歼`
   - `覆灭`
   - `终局点`

注意：`docs/sources/nianzhuang-battle.md` 作为来源文档可以写“被歼地”，但页面地图和事件前画面不能提前显示。

### 3.5 文档更新

`docs/sources/nianzhuang-battle.md` 已补充：

- 碾庄是黄百韬第七兵团，不是双堆集黄维第十二兵团。
- 播放轴不按日历均分，但总攻令后约占整片二分之一，不能再压成四分之三。
- 解放军与国民党军都必须有单位交接，不允许突然消失。
- 外围、夜战破口、残点清剿都必须有双方拉锯/反扑/再压回，不允许只表现单向平推。
- 国民党军军级残部终局地点只在 1948-11-22T18:00 后显示。
- `timelineGapOverrides`、`timelineActiveSpans`、`timelineDateAnchors` 必须共同使用。

## 4. 已验证事项

本轮已执行并通过：

```bash
npm run build
npx playwright test tests/battle-france-smoke.spec.ts -g "campaign data quality gates keep timelines routes and cues coherent|nianzhuang battle shows"
FRONTEND_URL=http://127.0.0.1:4177 npm run test:smoke
git diff --check
```

结果：

- `npm run build` 通过。
- 碾庄定向测试：2 passed。
- 全量烟测：23 passed。
- `git diff --check` 通过。
- 4177 预览服务已停止，`lsof -iTCP:4177 -sTCP:LISTEN` 无输出。

另外做过一次无图页面 DOM 巡检：

- 打开 `http://127.0.0.1:4177/`。
- 从首页进入碾庄。
- 点击事件：
  - 第一道围墙被突破
  - 第二道围墙被突破
  - 内圩核心失守
  - 倪庄终局
- 结果：
  - 无 console error。
  - 终局前 `destructionSites = 0`，且无 `被歼|覆灭|终局点` 剧透。
  - 03:30 时 `pla-second-wall-west` 和 `huang-final-core-defense` 都有单位可见。
  - 05:30 时 `huang-remnant-fallback-east`、`huang-east-remnant-defense`、清剿线都接上。
  - 18:00 时 4 个终局标注出现，25/64/44/100 终局路线和倪庄追击线可见。

注意：曾有两个手写 Playwright 巡检脚本因为时间轴 `fill` 或按钮等待写法不稳挂住，后来已手动结束。最终可靠证据以定向 Playwright 用例、全量烟测和最后的极简 DOM 巡检为准。

## 5. 当前重要测试点

`tests/battle-france-smoke.spec.ts` 中碾庄相关关键 helper：

- `expectNianzhuangTimelinePacing`
- `expectNianzhuangCommunistUnitHandoff`
- `expectNianzhuangNationalistUnitHandoff`
- `expectNianzhuangNoResultSpoilers`
- `expectNianzhuangRouteHasBadges`
- `expectNianzhuangDestructionSite`
- `jumpNianzhuangTimelineTo`

碾庄页面测试重点：

- 追击、合围、布防不是突然出现。
- 黄兵团师级布防不沿圈转动。
- 华野包围圈位于黄兵团防线外。
- 第一、第二、内圩三层防线按顺序碎裂。
- 03:30 到 05:30 有内圩压缩，不是一条线直接扎进核心。
- 15-17日外围、19日晚破口、21-22日残点都有双方拉锯/反压，不是单向平推。
- 05:30 后残部清剿和徐东阻援并行。
- 22日16:00 后国民党军终局路线可见。
- 18:00 前无结果性地图文字，18:00 后被歼地显示。

## 6. 下一会话接手建议

如果继续打磨碾庄圩：

1. 先运行：

   ```bash
   git status --short
   npm run build
   npx playwright test tests/battle-france-smoke.spec.ts -g "nianzhuang battle shows"
   ```

2. 用浏览器实际看画面，但不要在会话里展示截图。
3. 若用户继续反馈“看不清/挤在一起”，优先检查：
   - `src/lib/geoMap.ts` 的 `nianzhuangCompression` / `nianzhuangFinal` 视窗。
   - 编队 `offset` 是否过大或过小。
   - `mapDimensions={{ width: 4800, height: 2880 }}` 是否还够。
   - 终局路线和清剿路线是否同时堆在东侧据点。
4. 若用户反馈“单位消失”，优先检查：
   - `unitVisibleUntil`
   - `unitVisibleFrom`
   - route `start/end`
   - `expectNianzhuangCommunistUnitHandoff`
   - `expectNianzhuangNationalistUnitHandoff`
5. 若用户反馈“时间线乱”，不要直接改动画速度；先画出路线窗口和事件窗口，再更新 `timelineGapOverrides` 和 `timelineDateAnchors`，最后同步测试里的 `jumpNianzhuangTimelineTo`。

## 7. 已知风险与注意事项

- `timelineDateAnchors` 现在刻意只保留 `timelineGapOverrides` 边界。不要随手把所有路线 `start/end/unitVisible*` 都塞进去，否则压缩轴会被 22:29、22:31、05:29 等边界切碎，总攻段又会变快。
- `CampaignMapAnimation` 的 `dateAnchors` 是通用能力，后续其他战役也可用，但不要为了单个战役再加大量专属分支。
- `huang-final-*` 终局路线标签不能写“被歼地”，否则 17:00 阶段会提前剧透。真正的“被歼地”只放在 `mapOverlays`，并设置 `revealAt: "1948-11-22T18:00"`。
- `huang-nianzhuang-defense-ring` 的 `visibleUntil` 是 `22:29`，但 `unitVisibleUntil` 是 `22:30`，这是为了数据交接不断，同时不让完整大圈在 22:30 覆盖碎裂画面。
- `pla-remnant-mop-up-*` 的单位窗口到 `1948-11-22T16:20`，接 `pla-nizhuang-pursuit`。不要把它们提前关掉。
- `logs/` 是未跟踪运行产物，默认不要提交。

## 8. 快速命令

开发：

```bash
npm run dev
```

构建：

```bash
npm run build
```

预览：

```bash
npm run preview -- --port 4177
```

碾庄定向测试：

```bash
npx playwright test tests/battle-france-smoke.spec.ts -g "campaign data quality gates keep timelines routes and cues coherent|nianzhuang battle shows"
```

全量烟测：

```bash
npm run test:smoke
```

若已有手动预览服务：

```bash
FRONTEND_URL=http://127.0.0.1:4177 npm run test:smoke
```

检查残留服务：

```bash
lsof -iTCP:4177 -sTCP:LISTEN || true
```

提交前：

```bash
git diff --check
git status --short
```
