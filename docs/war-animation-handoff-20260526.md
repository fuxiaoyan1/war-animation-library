# 战争动画藏书馆新会话交接文档

交接时间：2026-05-26 CST

项目路径：`/Users/asukarei/Desktop/war-animation-lab-oss`

当前分支：`main`

远端：`origin git@github.com-war-animation-lab:fuxiaoyan1/war-animation-library.git`

当前提交基线：`58b402782adb8995fed27ca1559e5041a6fd65f1 取消潜艇战集火攻击线`

当前工作区状态：源码和文档已提交；`git status --short` 只剩 `?? logs/`。`logs/` 是本地运行产物，默认不要提交。

本文件是新会话第一入口。旧交接文档 `docs/war-animation-handoff.md` 保留为历史经验库，但其中 2026-05-23 的“当前未提交大量变更”描述已经过期；新会话应以本文件的 2026-05-26 状态为准。

## 0. 绝对优先事项

- 本项目主任务是动画制作，不是普通前端组件修补。所有代码、数据、素材、音频、测试和文档都服务于“可观看、可交互、可复盘、可验证”的战争动画作品。
- 与用户沟通使用中文。
- 不要在会话中展示图片、截图、视频帧、base64、测试截图或素材预览。用户多次强调图片会导致会话变重甚至崩溃。需要视觉验证时，可本地看图、用 Playwright、DOM 数值、资源状态和文字结论，不把图片贴回会话。
- 用户的视觉反馈视为验收事实。舰队消失、船开上陆地、飞机突然消失、航迹丢失、剧透标注、T 字横切不清、幕间跳变、爆炸音错位等问题都必须当作真实缺陷处理。
- 不要把旧会话长记录当作主要事实来源。新会话优先读：本文件、`docs/war-animation-handoff.md`、目标动画 `docs/sources/*.md`、目标数据文件、测试和 mempalace 中的稳定规则。
- 修改动画时优先改结构化数据、时间轴、路线、镜头、单位可见窗口、战斗效果、音效 cue 和测试。只有通用渲染器表达不了共性能力时，才改 `CampaignMapAnimation`。

## 1. 当前产品状态

项目是 Vite + React + TypeScript 的战争动画库，首页为“战争动画藏书馆”，通过卡片进入各战役动画。README 当前描述为 22 部动画。

运行与验证脚本：

```bash
npm run dev
npm run build
npm run preview
npm run test:smoke
node /Users/asukarei/.codex/skills/animation-assistant/scripts/check-animation-project.mjs /Users/asukarei/Desktop/war-animation-lab-oss
```

核心文件：

- `src/App.tsx`：动画注册、首页/动画切换、进入动画时滚动回顶部。
- `src/components/WarLibraryHome.tsx`：首页卡片和古代/现代分类。
- `src/components/CampaignMapAnimation.tsx`：通用地图动画渲染器。
- `src/components/UnitIcon.tsx`、`src/types/units.ts`：写实单位图标。
- `src/lib/campaignTimeline.ts`：日历/压缩时间轴、事件跳转和路线进度。
- `src/lib/geoMap.ts`：地图投影和各战区视窗。
- `src/lib/warScore.ts`：背景音乐和事件 SFX。
- `src/data/*.ts`：各动画的事件、路线、地图点、编队、效果、cue。
- `docs/sources/*.md`：战史资料、素材、音频和不确定性说明。
- `tests/battle-france-smoke.spec.ts`：集中式 Playwright 回归门禁。

当前已注册动画：

- 古代/前拿破仑：亚历山大大帝征服史、三次布匿战争史、大秦统一中国战史、垓下之战、凯撒大帝战争史、十字军东征、蒙古帝国征服史。
- 现代/拿破仑以后：拿破仑争战史、特拉法尔加大海战、日俄对马海战、日德兰海战、1940 德法战役、伦敦上空的鹰、苏德战争全景、太平洋战争、中途岛海空战、俾斯麦海海空战、HX 229 / SC 122 大西洋狼群战、第二次瓜岛海战、大周行动、抗美援朝战争、1991 第一次海湾战争。

## 2. 最近提交链

最近与潜艇战/海空战质量相关的提交：

- `58b4027 取消潜艇战集火攻击线`
- `d0650c0 修正潜艇战攻击特效与脱离单位`
- `6ccf840 修复大西洋潜艇连续航迹`
- `7d526e8 放大大西洋潜艇战作战区镜头`
- `5078fff 新增大西洋潜艇战动画`
- `ce7f874 更新战争动画藏书馆项目介绍`
- `636a08e 完善伦敦空战返航路线`
- `2f444c6 修正空战缠斗与返航表现`

最近一次提交 `58b4027` 包含 7 个文件：

- `docs/sources/atlantic-convoy-battle.md`
- `docs/war-animation-handoff.md`
- `src/components/CampaignMapAnimation.tsx`
- `src/data/atlanticConvoyBattle.ts`
- `src/lib/warScore.ts`
- `src/styles.css`
- `tests/battle-france-smoke.spec.ts`

提交前已验证：

- `npm run build` 通过。
- `npx playwright test tests/battle-france-smoke.spec.ts -g "battle of britain shows radar directed compact air formations|atlantic convoy"` 通过，2 passed。
- `npm run test:smoke` 通过，22 passed。
- `git diff --check` 通过。
- `node /Users/asukarei/.codex/skills/animation-assistant/scripts/check-animation-project.mjs /Users/asukarei/Desktop/war-animation-lab-oss` 通过。

本次交接文档创建后，如果只改文档，至少跑 `git diff --check`；如果继续改源码，按目标动画跑定向 smoke，改通用层则跑全量 smoke。

## 3. 本轮最新状态：大西洋潜艇战

动画：`HX 229 / SC 122：大西洋狼群战`

文件：

- `src/data/atlanticConvoyBattle.ts`
- `src/components/AtlanticConvoyBattleAnimation.tsx`
- `docs/sources/atlantic-convoy-battle.md`
- `tests/battle-france-smoke.spec.ts`

当前叙事：

- U-653 / U 艇接触 HX 229。
- Raubgraf、Sturmer、Dranger 多狼群向航路合围。
- U-338 发现 SC 122，形成双船队同场战斗。
- 3月17日夜间鱼雷攻击高峰。
- VLR Liberator 从冰岛/北爱尔兰方向进入中大西洋空隙边缘。
- 第二夜攻击持续，护航舰反潜屏幕压向狼群。
- 1943-03-19 17:45，U-384 被 RAF 206 中队 Fortress 机深弹击沉。
- 当夜德方终止攻击，船队继续向西部入口方向脱离，U 艇撤离。

最新改动要点：

- 潜艇战不使用集火/齐射线。三个鱼雷/深弹效果都设置 `showShellTraces: false`。
- `SalvoBattleEffectElement` 新增 `showShellTraces?: boolean`，默认 `true`，所以日德兰、瓜岛、对马等仍保留齐射线。
- 大西洋潜艇战只保留局部命中/水下爆震样式：`.atlantic-local-impact-effect`。
- 鱼雷/深弹效果仍通过 `fromRouteId` / `toRouteId` 绑定实时航迹点，避免船队已经驶离而爆点停在旧坐标。
- U-384 是独立连续航迹，从开局到击沉点一直在线，击沉后隐藏单位、保留航迹。
- U 艇和护航舰按 `unitGroupId` / `retainUnitAfterRouteEnd` 做连续交接，不沉不消失。
- `u-boat-disengagement` 末段有可见 U 艇单位，不再只有脱离线。
- 测试断言大西洋潜艇战 `.salvo-shell-trace` 数量为 0，并检查命中效果绑定目标路线。

潜艇战最容易回归的问题：

- 作战区域镜头过大，看不清船队、狼群和反潜飞机。
- 舰船或潜艇忽隐忽现；只要不沉、不失能、不历史脱离，就应持续在线。
- U-384 击沉没有完整前序航迹。
- 攻击效果开始时，船队已经离开攻击点。
- 最后一条 U 艇脱离线只有线没有船。
- 船队/护航舰/U 艇开上陆地或贴陆。
- 潜艇战被画成舰炮集火，出现跨屏齐射线。
- 反潜飞机接触后直接消失，而不是返航/离场。

潜艇战相关测试覆盖：

- `expectAtlanticConvoySeaUnitsStayOnline`
- `expectAtlanticConvoyEffectsAlignWithTargets`
- `expectNavalRoutesStayOffLand`
- `expectAirRouteKeepsTrackButAircraftExit`
- `atlantic convoy battle shows wolfpack submarine and anti-submarine timeline`

## 4. 音效队列修正

最近一次提交顺带修了一个通用音效问题：时间轴拖动或事件跳转后，上一事件的延迟音效不能滞后响到新节点。

涉及文件：`src/lib/warScore.ts`、`src/components/CampaignMapAnimation.tsx`

当前行为：

- `WarScore` 用 `cueTimers = new Map<number, SfxKey>()` 管理延迟 SFX。
- `playBattleCue` 触发新 cue 时会清掉上一轮待触发 cue。
- `cancelPendingBattleCues()` 清理全部待触发 cue，用于事件列表跳转。
- `cancelPendingAirCues()` 只清理飞机/扫射尾音，用于普通时间轴拖动，避免误杀同一次 `combined` 鱼雷/炮击里的爆炸延迟。
- `CampaignMapAnimation.playEventCue` 在事件跳转前清理待触发 cue。
- `CampaignMapAnimation.handleRangeChange` 在拖动时间轴时只清理空战尾音。

为什么要这样：

- 伦敦空战曾出现点击结尾静音节点后，上一段空战的飞机声延迟响起。
- 如果粗暴清理全部延迟音效，潜艇战鱼雷 `combined` 的爆炸延迟会被时间轴拖动误杀，导致只有前段声、没有爆炸。

后续改音频时不要退回简单 `window.setTimeout`，也不要在拖动时间轴时一刀切取消所有 SFX。

## 5. 海战制作规则

用户对海战的要求很明确：航迹、舰队连续性和战术几何比“画得热闹”更重要。

硬规则：

- 舰队一旦出现，除非沉没、失能、战损脱离或历史撤离，不要消失。
- 航迹线要保留，尤其是战术复盘型海战。
- 舰队不能在幕间突然位移、竖起来、整体平移或整列旋转。
- 跨路线段用 `unitGroupId`、`retainUnitAfterRouteEnd`、`formationPrelude`、`unitVisibleFrom/unitVisibleUntil` 做自然交接。
- T 字横切必须体现横切者与敌方舰列方向之间的战术态势，不能只有文字说明。
- T 字横切、雷达火控、近距离炮击等节点可使用齐射/弹着效果，但弹着点要落在合理目标区。
- 海路必须走海上，用 `waypoints` 绕陆；不能从港口陆地点直接开船。
- 舰船图标要写实、水平、宽幅比例正确、尺寸适中，不能遮挡字幕和航迹。
- 幕间镜头变化不能让单位先跳位再缩放，或先缩放导致队列看起来被竖起。

重点战役：

- 日德兰：主力舰必须从远处持续进入，Beatty/Hipper/Jellicoe/Scheer 路线要自然交接；T 字横切和 Scheer 转向是核心。
- 第二次瓜岛：关键位置点必须 `revealAt`，舰船不能上瓜岛/萨沃岛，华盛顿号雷达火控齐射要对齐雾岛号。
- 对马：短战术海战视窗要紧，T 字横切、旗舰失能、夜战追击和投降拆成路线段。
- 特拉法尔加：风帆舰队要保持横向写实图标和两纵队突破态势。

## 6. 空战制作规则

用户已经明确指出，空战不能照搬陆战/海战“单位长期驻留”的表现形式。

硬规则：

- 空中路线必须 `routeKind: "air"`。
- 飞机用写实二战图标：`ww2Fighter`、`ww2Bomber`、`ww2AttackAircraft`。
- 飞机图标要小而清楚，不能遮挡地图。
- 每条空中路线应是小时级任务窗口。
- 飞机必须有任务生命周期：起飞/进入、接触、攻击/护航/截击、返航或离场。
- 航迹可以保留到片尾，飞机图标不能长期停在目标点。
- `visibleUntil` 用于保留航迹，`unitVisibleUntil` 用于让飞机退场。
- 空战关键点要 `revealAt`，不要提前剧透。
- 空战不要使用舰炮式 `salvo` / 集火线。轰炸、扫射、缠斗应用同窗路线、局部缠斗效果、爆炸/扫射/飞机音效表达。
- 高空轰炸、低空跳弹、扫射、空战混战不能共用错位射击线。
- 无护航深袭的代价必须可视化：德机截击、高炮带、受损返航、掉队机、损失带，而不是只写在文字里。

重点空战：

- 伦敦上空的鹰：聚焦 1940-09-15 伦敦昼间空战。注意两轮来袭、RAF 拦截、南伦敦/维多利亚/邓杰内斯返航，不允许德机停在区域不动或擦肩而过无战斗。
- 大周行动：目前机群移动速度、航迹、地图比例和双发表现相对最好。伦敦应参考大周；大周已接入缠斗效果，注意不要出现没有双方飞机的空缠斗。
- 俾斯麦海：船队不能穿岛，侦察/高空轰炸/低空跳弹/追击都要有返航流。高空轰炸不需要集火攻击线。

## 7. 反剧透与位置点

用户多次指出“剧透式标注”。后续统一规则：

- 事件性位置点默认不提前显示。
- 伏击点、转向点、雷达射击位、弹着点、失能点、瓦解海域、轰炸目标和击沉点都要加 `revealAt`。
- 基础地理点可以常显，事件结果点不可以常显。
- 用 `expectMapPointsHidden(page, selector, pointIds)` 做首屏或事件前断言。
- 不要用提前出现的标注解释后续战术，这会破坏动画叙事。

## 8. 音频规则

音频不是附属层，是动画节奏的一部分。

- 背景配乐尽量每部唯一，`score-toggle` 暴露 `data-music-source`。
- 古代战斗用冷兵器音效。
- 拿破仑、风帆舰、近代舰炮用炮声/火炮类音效。
- 二战空战/海空战细分：`aircraft` 用于升空/接近，`airCombat` 用于拦截/追击，`bombing` 用于明确轰炸，`combined` 用于炮击/爆炸组合。
- 预警、结果、纯移动、返航收束节点通常静音。
- 事件点击必须在用户手势内触发 SFX，不能只靠自动播放触发。
- 爆炸声必须和战斗事件对齐，不能无战斗乱响，也不能战斗点无声。
- 修改 SFX 逻辑后要跑相关 Playwright 音频断言。

## 9. 测试与验证

常用验证：

```bash
git status --short
git diff --check
npm run build
npm run test:smoke
node /Users/asukarei/.codex/skills/animation-assistant/scripts/check-animation-project.mjs /Users/asukarei/Desktop/war-animation-lab-oss
```

潜艇战/空战定向：

```bash
npx playwright test tests/battle-france-smoke.spec.ts -g "battle of britain shows radar directed compact air formations|atlantic convoy"
```

海空战定向：

```bash
npx playwright test tests/battle-france-smoke.spec.ts -g "battle of britain|big week air battle|bismarck sea air battle|atlantic convoy|guadalcanal naval battle|jutland battle|tsushima battle|trafalgar battle"
```

注意：

- `playwright.config.ts` 默认使用 `http://127.0.0.1:4177`，并由 Playwright 启动 `npm run preview`。不要并行启动多个 Playwright 进程抢同一端口。
- 如果测试使用 `vite preview`，源码改完必须先 `npm run build`，否则会测到旧 `dist`。
- 测试失败可能生成 `test-results/` 截图和 trace，不要把图片展示到会话里。
- 只改文档至少跑 `git diff --check`。
- 改通用渲染器、音频、地图交互、单位图标时跑全量 `npm run test:smoke`。

当前 smoke 覆盖 22 个用例，包括：

- 数据质量门禁。
- 首页古代/现代分类。
- 所有动画可进入。
- 地图交互、字幕、配乐来源。
- 空战短波次、航迹保留、飞机退场。
- 海路不上陆、舰船 bbox 不压陆。
- 反剧透点隐藏。
- 齐射/弹着/局部效果。
- 音频点击触发。

## 10. 新增或升级动画标准流程

1. 读本文件、`docs/war-animation-handoff.md`、`docs/animation-assistant-agent.md` 和 `animation-assistant` skill。
2. 查资料，写或更新 `docs/sources/<campaign>.md`。
3. 先定时间轴和事件：`battleEvents`。
4. 再定地图点和 `revealAt`。
5. 再定路线：`frontLines`，明确 `routeKind`、`waypoints`、`formationUnits`、单位可见窗口。
6. 再定镜头：`focusSteps` 和 `geoMap` 视窗。
7. 再定音效：`cueEventIds`、`cueEventKinds`、`sfxProfile`、`musicSource`。
8. 再定效果：齐射、爆炸、缠斗、局部命中等。
9. 优先复用 `CampaignMapAnimation`，不要复制新渲染器。
10. 注册到 `src/App.tsx` 和 `WarLibraryHome.tsx`。
11. 补 Playwright smoke，覆盖加载、关键镜头、路线类型、图标、音频、反剧透、航迹/单位窗口。
12. 跑 build、定向 smoke、必要时全量 smoke。
13. 更新来源文档、交接文档和 mempalace。

## 11. 下一步建议

当前不要急着新增很多战役，优先按“日德兰制作水准”逐部提升已有动画。

推荐顺序：

1. 继续复查 `HX 229 / SC 122：大西洋狼群战`，重点看攻击效果与船队航迹是否在所有时间段都对齐，单位尺寸是否刚好，U 艇脱离是否自然。
2. 复查 `日德兰海战`，重点看 T 字横切、Scheer 转向、舰队连续性和夜间撤退/追击。
3. 复查 `第二次瓜岛海战`，重点看反剧透、舰船不上陆、华盛顿号齐射和夜间航迹。
4. 复查 `伦敦上空的鹰`，重点看敌我不再擦肩而过、德机/RAF 返航完整、静音节点不乱响。
5. 复查 `俾斯麦海海空战`，重点看船队不上陆、侦察机返航、高空轰炸无集火线、攻击点与船队同位。
6. 复查 `大周行动`，重点看莱比锡轰炸节点、护航/截击/高炮损失来源和缠斗效果是否均有双方飞机。
7. 再回到中途岛、太平洋战争、苏德战争、古代战役，按同一质量标准提升。

## 12. 提交纪律

- 开始前看 `git status --short`。
- 不要提交 `logs/`、`dist/`、`test-results/`、`artifacts/` 或临时截图。
- 若有用户未提交变更，不要回滚。
- 文档/源码/测试应按功能闭环提交。
- 通用渲染器能力改动要单独说明，并跑全量 smoke。
- 提交前至少执行 `git diff --check`。

## 13. 新会话快速启动提示

新会话可以直接这样开始：

```text
请先阅读 docs/war-animation-handoff-20260526.md、docs/war-animation-handoff.md 和目标动画 sources 文档。
不要在会话中展示图片/截图/视频。
先运行 git status --short，确认只剩 logs/ 未跟踪。
当前基线是 58b402782adb8995fed27ca1559e5041a6fd65f1。
下一步按用户最新反馈，继续修 war-animation-lab-oss 的动画质量，并在改动后跑 build/Playwright/diff check。
```

