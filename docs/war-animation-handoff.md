# 战争动画库工作交接文档

交接时间：2026-05-23 CST

项目路径：`/Users/asukarei/Desktop/war-animation-lab-oss`

上一份提交基线：`f1cc03c Expand war animation library and visuals`

当前接手状态：仓库已经在上一轮持续开发中进入大量未提交变更状态。接手者必须先看 `git status --short`，不要把当前工作树当成干净基线，不要回滚自己没有做的变更。

## 0. 项目定位：主任务是动画制作

接手者必须先记住：本项目不是普通前端组件库，也不是历史资料整理库，主任务始终是**制作可观看、可交互、可复盘、可验证的战争动画作品**。所有代码、素材、音频、测试、来源文档和智能体经验沉淀，都只是服务于动画生产质量。

判断一项工作是否真的完成，不看“代码是否能跑”这一条，而看它是否让一部动画更接近可交付：

- 观众是否能看懂战役阶段、战术态势和双方行动关系。
- 时间轴、路线、镜头、字幕、音效是否和事件节奏对齐。
- 舰队、航空队、陆上部队是否按其战争形态自然运动，而不是套用同一种箭头动画。
- 战史关键点是否有来源，且不把尚未发生的位置提前展示成剧透。
- Playwright/DOM/数据断言是否能防止用户已经指出过的问题回归。
- 新经验是否写回本文件、`animation-assistant` skill 或 mempalace，避免下一个会话重新踩坑。

后续如果接手者只能做一件事，优先做“动画质量闭环”：选定一部动画，核实资料和时间轴，修正数据/路线/镜头/音效，补来源，补测试，跑验证，再更新交接。不要为了工程洁癖把时间花在与动画观感无关的重构上。

本项目当前最重要的动画制作方向：

- 继续提升已有战争动画，而不是只堆新增条目。用户已经明确要求以日德兰经验和制作水准，对所有动画逐一全面提升。
- 海战要重点展示舰队连续航行、T 字横切、齐射、战损和撤退追击，不能有舰队突然消失、开上陆地、航迹丢失或整列图片式平移。
- 空战要按短时出击波次、密集航迹、拦截/护航/轰炸关系来建模，不能照搬陆战/海战“单位长期驻留地图”的表现方式。
- 音效是动画制作的一部分，不是附属品。爆炸、炮击、飞机、扫射等 SFX 必须与战斗事件和点击事件对齐。
- 视觉验证可以本机截图/浏览器查看，但不要在会话中展示图片或截图，避免会话再次变重。

## 1. 接手硬约束

这些要求优先级最高，后续所有实现、验证和交接都要遵守：

- 全程中文沟通。
- 不要在会话中展示、嵌入、引用本地图片、截图、视频帧或生成的视觉素材。用户明确反馈过会话因大量图片崩溃。需要视觉验证时，用 Playwright/DOM/数值断言、日志和文字结论，不要把图片贴回会话。
- 用户的视觉反馈视为验收事实。尤其是舰队消失、剧透标注、舰船上陆、幕间跳变、航迹不连续、T 字横切态势不清、爆炸音效错位等问题，不能用“数据大概合理”搪塞。
- 修改动画时优先改结构化数据、路线、时间轴、镜头、测试，除非通用渲染器能力确实不足。
- 任何新增战役、战术节点、音频、图标素材，都必须同步补 `docs/sources/*.md` 或现有来源文档。
- 使用 `animation-assistant` 工作法：先读项目，再建数据模型，再实现，再自动化验证，再沉淀经验。
- 可看图片文件、可用浏览器或 Playwright 验证，但不要在聊天中展示图片产物。
- 不要把本项目误导成“修代码优先”。代码修复必须能解释它解决了哪一个动画叙事、动画运动、动画音效、动画验证或动画资料问题。

## 2. 当前产品状态

这是一个 Vite + React + TypeScript 的本地战争动画库。入口是“战争动画藏书馆”，所有动画在同一个 React 应用内通过首页卡片进入。全局只保留题铭和返回首页，不再堆叠大量顶栏/底栏战争入口。

动画生产链路如下：

- `docs/sources/*.md`：先记录战史资料、来源、争议和素材/音频许可。
- `src/data/*.ts`：把战役拆成事件、地图点、路线、编队、时间轴、旁白和音效 cue。
- `src/components/*Animation.tsx`：给具体动画选择通用渲染器参数、镜头阶段、配乐、音效类型和战斗特效。
- `src/components/CampaignMapAnimation.tsx`：通用播放、地图、路线、单位、字幕、音频和交互层。只有共性能力不足时才改。
- `src/components/UnitIcon.tsx` 与 `src/types/units.ts`：时代匹配的写实单位图标，不允许退回抽象占位符。
- `public/audio` 与 `public/assets/unit-icons`：运行时素材。新增或替换必须同步说明来源和许可。
- `tests/battle-france-smoke.spec.ts`：当前集中承载动画回归门禁，覆盖首页、地图交互、音频、航迹、反剧透、海路不上陆、空战短波次等问题。

核心入口：

- `src/App.tsx`：注册动画 key、组件切换、进入新动画时 `window.scrollTo({ left: 0, top: 0 })`。
- `src/components/WarLibraryHome.tsx`：首页卡片，按“古代战争 / 现代战争”分架。
- `src/components/CampaignMapAnimation.tsx`：通用地图动画渲染器。
- `src/data/*.ts`：各战役数据。
- `tests/battle-france-smoke.spec.ts`：当前所有 smoke/e2e 仍集中在这个文件。

已注册动画：

古代战争：

- 亚历山大大帝征服史
- 罗马与迦太基：三次布匿战争史
- 大秦统一中国战史
- 韩信十面埋伏：垓下之战
- 凯撒大帝战争史
- 十字军东征
- 蒙古帝国征服史

现代战争：

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
- 第二次瓜岛海战
- 大周行动：欧洲昼间制空权争夺
- 抗美援朝战争
- 1991 年第一次海湾战争

## 3. 最近交付范围

2026-05-20 到 2026-05-23 这一轮主要把海战和空战能力补齐，并把用户连续反馈的问题纳入回归。

新增或重做的重点动画：

- 特拉法尔加大海战：风帆时代两纵队突破、舰名编队、专用风帆舰图标。
- 第二次瓜岛海战：铁底湾夜战、华盛顿号雷达火控、南达科他号失电、雾岛号失能、夜间撤退。
- 日德兰海战：侦察接触、南向追逐、北向引诱、主力展开、T 字横切、Scheer 全舰队转向、夜间撤离。
- 伦敦上空的鹰：聚焦 1940-09-15 伦敦方向两次昼间大空袭，雷达预警、扇区指挥、RAF 拦截、城市上空混战和回程追击。
- 大周行动：欧洲昼间制空权争夺：轰炸机流、远程护航、德机截击、制空权消耗。
- 俾斯麦海海空战：海上运输线、侦察跟踪、高空轰炸、低空扫射、跳弹轰炸、船队瓦解。
- HX 229 / SC 122：大西洋狼群战：中大西洋空隙、双船队、Raubgraf / Sturmer / Dranger 狼群线、夜间鱼雷攻击、护航反潜、VLR Liberator 反潜巡逻、U-384 被击沉与德方终止攻击。

同时改进了旧动画和通用层：

- 对马海战经验被继续固化：短海战使用小时级时间轴、紧战区视窗、舰队连续航行、舰船不上陆、T 字横切齐射效果。
- `CampaignMapAnimation` 支持 `BattleEffectElement`，用于齐射弹道、弹着点、跳弹轰炸等视觉效果。
- `FormationUnit` 与路线局部 offset 支持多单位编队，不再只用一个泛型图标。
- `unitVisibleUntil`、`visibleUntil`、`formationPrelude`、`unitGroupId`、`retainUnitAfterRouteEnd` 用于解决旧单位退场、路线保留、舰队交接和连续运动问题。
- `MapPoint.revealAt` 用于防止关键位置点提前出现造成剧透。
- 新空战默认禁用 `terrainZones`，避免黑色椭圆遮挡和剧透。
- 舰船图标在近代海战中压缩到更合适比例，避免过大遮挡战场。
- 测试新增海路不上陆、舰船 bbox 不压陆地、空战短波次、航迹保留、关键点延迟揭示、齐射效果、SFX 触发等断言。

## 4. 最近涉及文件

新增或重点涉及的数据文件：

- `src/data/battleOfBritain.ts`
- `src/data/bigWeekAirBattle.ts`
- `src/data/bismarckSeaAirBattle.ts`
- `src/data/atlanticConvoyBattle.ts`
- `src/data/guadalcanalNavalBattle.ts`
- `src/data/jutlandBattle.ts`
- `src/data/trafalgarBattle.ts`
- `src/data/tsushimaBattle.ts`

新增或重点涉及的组件：

- `src/components/BattleOfBritainAnimation.tsx`
- `src/components/BigWeekAirBattleAnimation.tsx`
- `src/components/BismarckSeaAirBattleAnimation.tsx`
- `src/components/AtlanticConvoyBattleAnimation.tsx`
- `src/components/GuadalcanalNavalBattleAnimation.tsx`
- `src/components/JutlandBattleAnimation.tsx`
- `src/components/TrafalgarBattleAnimation.tsx`
- `src/components/TsushimaBattleAnimation.tsx`
- `src/components/CampaignMapAnimation.tsx`
- `src/components/UnitIcon.tsx`
- `src/components/WarLibraryHome.tsx`

新增或重点涉及的资源与脚本：

- `scripts/generate-trafalgar-ship-assets.mjs`
- `scripts/generate-ww2-air-assets.mjs`
- `scripts/generate-ww2-ship-assets.mjs`
- `public/assets/unit-icons/trafalgar-*.webp`
- `public/assets/unit-icons/ww2-fighter.webp`
- `public/assets/unit-icons/ww2-bomber.webp`
- `public/assets/unit-icons/ww2-attack-aircraft.webp`
- `public/assets/unit-icons/ww2-transport-ship.webp`
- `public/assets/unit-icons/ww2-escort-ship.webp`
- `public/audio/wikimedia-anchors-aweigh-2009.oga`
- `public/audio/wikimedia-eternal-father-instrumental.ogg`
- `public/audio/wikimedia-rule-britannia.ogg`

新增或重点涉及的来源文档：

- `docs/sources/trafalgar-battle.md`
- `docs/sources/guadalcanal-naval-battle.md`
- `docs/sources/jutland-battle.md`
- `docs/sources/battle-of-britain.md`
- `docs/sources/big-week-air-battle.md`
- `docs/sources/bismarck-sea-air-battle.md`
- `docs/sources/atlantic-convoy-battle.md`
- `docs/sources/audio.md`
- `docs/sources/unit-icons.md`

## 5. 数据模型要点

主要类型仍来自 `src/data/battleOfFrance.ts`，各动画复用这些结构：

- `MapPoint`：地图点，含 `id`、`label`、经纬度、类型和可选 `revealAt`。
- `BattleEvent`：事件，含时间、标题、地点、阶段、摘要、详情、意义和 `mapFocus`。
- `FrontLine`：路线/态势线，含起止点、时间、阵营、路线类型、单位图标、编队、可见窗口、路径点。
- `FormationUnit`：编队内单个单位，含标签、徽标、图标和路线局部 offset。
- `BattleEffectElement`：战斗效果，当前用于齐射、弹着点、跳弹轰炸等。

`FrontLine` 当前关键字段：

- `routeKind`: `"land" | "sea" | "air"`。海战和空战必须显式声明。
- `waypoints`：路线中间点。海路必须用它绕开陆地，空战用它表达航线和交战区。
- `formationUnits`：多单位编队。大规模空战、舰队行动不要只用单个图标。
- `formationPrelude`：只用于编队连续交接，让单位在新路线段开始时从上一段末位自然进入。
- `visibleUntil`：路线保留到某个时间。空战常用于“飞机离场但航迹保留”。
- `unitVisibleUntil`：单位图标消失时间。空战必须短，战损舰只可按历史时间消失。
- `unitVisibleFrom`：单位延迟出现时间。
- `unitGroupId`：同一舰队跨路线段的身份。
- `retainUnitAfterRouteEnd`：配合 `unitGroupId`，使同一舰队在段间连续保留，不让它突然消失。

`MapPoint.revealAt` 是反剧透字段。所有“击中点、T 字横切位、转向点、雷达射击位、跳弹轰炸区、瓦解海域”等事件性位置，默认都应该延迟到事件发生时出现。

## 6. 通用渲染器职责

`CampaignMapAnimation` 负责：

- 播放、暂停、回放。
- 时间轴拖拽和事件跳转。
- 当前事件、下一事件、右侧故事面板。
- 地图、国家边界、河流、历史区域、标签、事件点。
- 路线绘制、进度插值、路线保留。
- 单位图标沿路线移动，多单位编队按路线局部 offset 布置。
- 单位保持水平，只按左右方向镜像，不随路线角度旋转。
- 战斗效果：爆炸、炮击、齐射弹道、弹着点。
- 音频：背景配乐、事件 SFX、事件点击 SFX。
- 字幕 ticker、控制区、地图交互。

新增动画优先写数据和 wrapper，不要复制一套新渲染器。只有当通用层无法表达“连续舰队交接、空战短波次、齐射弹着、反剧透揭示”等共性能力时，才改 `CampaignMapAnimation`。

## 7. 空战建模规则

用户已经明确指出：空战不能把陆战、海战模型简单搬过来。飞机不是长期驻留地图的单位，空战是小时级出击波次和密集航迹。

必须遵守：

- 空中路线必须 `routeKind: "air"`。
- 飞机图标用二战专用资产：`ww2Fighter`、`ww2Bomber`、`ww2AttackAircraft`。
- 图标要小而清楚，不能像陆海单位那样大面积遮挡。
- 每条空中路线的 `start/end` 应是具体小时级时间。
- 每条非隐藏空中路线都要设置 `unitVisibleUntil`，通常在出击结束后数小时内关闭飞机图标。
- 可用 `visibleUntil` 把航迹保留到战役末尾，形成空战的航迹密度。
- 空战后期测试应看到：`.front-line.route-air` 仍可见，`.formation-unit` 数量为 0，`data-unit-visible="false"`。
- `formationUnits` 表达数量比例和角色关系，例如轰炸机流、护航战斗机、截击机、攻击机。
- 不要让飞机从海上突然消失。路线要到达拦截区、目标区或返航/离场逻辑清楚的位置。
- 空战不是陆海战“单位常驻地图”的套皮。侦察、轰炸、护航、截击、攻击机波次都必须有任务生命周期：出击、接触/攻击、返航或返场；任务结束后只退飞机图标，航迹继续保留。
- 对轰炸机流这类目标航线，不能只画到目标城市。必须画返航或受损离场，否则观众看不到深袭代价和空战结果。
- 护航深袭的代价要可视化：用受损返航线、掉队机、损失带、返航集合等结构表达，不只写在事件卡里。
- 不要使用通用 `terrainZones` 椭圆表示空域，除非有明确样式和测试。三部二战空战当前都传 `terrainZones={[]}`。
- 空战关键点要设置 `revealAt`，不要提前展示目标或战斗位置。
- 空战 SFX 要用飞机飞行、扫射、俯冲、爆炸等二战音效，且事件点击也要触发。轰炸事件必须有爆炸音，空战/扫射事件必须有飞机和机枪/俯冲音。
- 高空轰炸、低空跳弹、扫射、空战混战不能共用一条错位射击线。战斗效果只在对应事件窗口出现，弹着点落在目标区、船队或合理的交战点。

三部空战当前模式：

- 伦敦上空的鹰：聚焦 1940-09-15 伦敦昼间空战，德机越岸、伦敦上空混战、回程追击和傍晚结果都保留航迹。
- 大周行动：按每天的轰炸、护航、截击、受损返航波次建模，工业目标爆炸和深袭代价都可见，不让飞机长期留场。
- 俾斯麦海：侦察接触后返航，高空轰炸后返航，低空攻击/跳弹后返航，后续追击后返航；高空段不画跳弹射击线。

对应测试：

- `expectAirRoutesHaveShortUnitWindows`
- `expectAirRouteKeepsTrackButAircraftExit`
- `expectNoTerrainZones`
- `expectMapPointsHidden`
- `expectCompactAircraftMarkers`

## 8. 海战与海空战规则

用户多轮反馈集中在舰队连续性、航迹真实性和幕间切换自然性。后续所有海战都要按这些规则处理：

- 舰队一旦出现，除非战损、沉没、失能或历史上脱离战场，否则不要突然消失。
- 不要用旧路线整体退场来制造“舰队凭空跳到下一幕”的效果。跨幕应该是同一舰队从上一幕位置自然航行到下一幕位置。
- 如果同一舰队需要换路线段，用 `unitGroupId`、`retainUnitAfterRouteEnd`、`formationPrelude`、`unitVisibleFrom/unitVisibleUntil` 做连续交接。
- 已完成航迹线应尽量保留，尤其是战术复盘型海战。用户明确指出航迹线要一直保留。
- 旧单位标记可以退场，但退场必须对应新路线单位自然接上，不能让舰队动作断裂。
- 舰队不能像一张图片一样整列平移或瞬间旋转。多舰编队要通过路线局部 offset、沿线插值和连续航向变化表现鱼贯运动。
- 幕间切换不能先变队形再缩放地图，或先缩放地图再导致舰队看起来竖起来。镜头变化、队列变化和航路推进要同一时间轴下自然过渡。
- 开场不要让重要舰队凭空出现在交战区附近。若历史上主力早已在远处航行，应一开始就进入画面，并持续向预定位置移动。
- 侦察、发现、诱敌和主力接近的空间关系要合理。日德兰中英大舰队初始位置不能近到让德侦察舰先发现大舰队而不是分舰队。
- T 字横切要体现横切者相对敌方舰列方向的战术态势，不只是文字说明。
- T 字横切、雷达齐射、近距离炮击等节点应有 `BattleEffectElement`，弹着点要落在转向点、被射击舰列或历史上合理的目标海域。
- 爆炸音和齐射效果必须对齐战斗时间点。不能战斗点无声，也不能无战斗时乱响。
- 海路不能从陆地出发、穿陆、贴陆或开上岸。港口叙事要用离岸锚地/外海点和 `waypoints`。
- 视觉上舰船图标要压缩到合适比例，当前海战测试用 `expectWarshipScale(page, selector, 0.5)` 覆盖。
- 潜艇战不是普通水面舰队战。商船/护航舰可以持续航行，U 艇应按接触、合围、攻击、脱离分段显示，航迹保留但单位不能长期悬停在攻击点；飞机反潜必须按短时巡逻出击和返航建模。
- 潜艇战不要主动加入潜潜对战，除非资料明确支持。HX 229 / SC 122 的重点是 U 艇攻击商船、护航舰反潜和飞机反潜。

海路不上陆测试已经覆盖：

- route line 采样点是否落入 `.country-core`
- `.formation-unit` 中心点是否落陆
- 舰船图标 bbox 的多个采样点是否压陆

对应测试：

- `expectNavalRoutesStayOffLand`
- `expectVisibleFleetRoutes`
- `expectRenderedRoutesInclude`
- `expectJutlandFleetGroupsContinuous`
- `expectWarshipScale`
- `expectRouteHasPolylineComplexity`

### HX 229 / SC 122：大西洋狼群战

文件：

- `src/data/atlanticConvoyBattle.ts`
- `src/components/AtlanticConvoyBattleAnimation.tsx`
- `docs/sources/atlantic-convoy-battle.md`

当前叙事阶段：

- U-653 / U 艇接触 HX 229。
- Raubgraf、Sturmer、Dranger 多狼群向航路合围。
- U-338 发现 SC 122，形成双船队同场战斗。
- 3月17日夜间鱼雷攻击高峰。
- VLR Liberator 从冰岛/北爱尔兰方向进入中大西洋空隙边缘。
- 第二夜攻击持续，护航舰反潜屏幕压向狼群。
- 1943-03-19 17:45，U-384 在约 54.18N, 26.15W 被 RAF 206 中队 Fortress 机深弹击沉。
- 当夜德方终止攻击，船队继续向西部入口方向脱离，U 艇撤离。

最容易回归的问题：

- 把船队强行拉到英国近岸，导致接触、夜袭和第二夜攻击与船队位置错开。当前动画只复原战斗海域内态势，不做完整横跨大西洋航程。
- 为了展示冰岛、北爱尔兰或西部入口而使用北大西洋总览镜头，会把主作战区压得太小。潜艇战主镜头必须收在接触线、夜袭区、航空反潜区和 U-384 东部击沉区；航空/东部镜头要在对应航线开始时提前切入，避免事件点击落在镜头过渡起点。
- U 艇忽隐忽现或停在攻击点不动。正确做法是把潜艇当船处理：不沉就持续在线；分段路线只能通过 `unitGroupId` / `retainUnitAfterRouteEnd` 做连续交接，`visibleUntil` 保留航迹，不能用早期 `unitVisibleUntil` 让未沉潜艇退场。U-384 必须有从开局到 `1943-03-19T17:45` 击沉点的单艇连续航迹，击沉后才隐藏单位。
- 鱼雷/深弹效果和舰船航迹对不上。夜间鱼雷 `salvo` 的命中点要贴近当时 HX 229 / SC 122 船队位置；U-384 深弹效果要贴近 U-384 连续航迹末端。
- 发现/合围节点乱放爆炸音。当前只有夜间鱼雷、第二夜攻击和 U-384 深弹节点有战斗音。
- 关键点提前显示。`sc122-contact`、夜袭点、`second-night-attack`、`u384-sinking`、`attack-discontinued` 都要 `revealAt`。
- 把反潜飞机当作常驻单位。`vlr-liberator-first-patrol` 和 `u384-hunt-by-air` 必须飞入、接触、返航，航迹保留但飞机图标在任务结束时退场。

测试覆盖：

- 新动画 smoke：`atlantic convoy battle shows wolfpack submarine and anti-submarine timeline`。
- 数据门禁检查关键事件有活跃路线、攻击/反潜路线同窗接近、空中反潜路线短时窗口、海路不上陆、潜艇/商船/护航舰/巡逻机写实资产，并断言首屏和夜袭阶段的单位/航迹占据足够地图比例，防止战区过小。

## 9. 重点战役接手说明

### 日德兰海战

文件：

- `src/data/jutlandBattle.ts`
- `src/components/JutlandBattleAnimation.tsx`
- `docs/sources/jutland-battle.md`

当前叙事阶段：

- 侦察舰接触
- 南向追逐
- 玛丽女王号爆炸
- Beatty 北转引诱
- 大舰队接近和展开
- Jellicoe 横切 T 字位
- Scheer 第一次全舰队转向
- 战列巡洋舰掩护冲锋
- 第二次转向
- 夜间追击与德军撤离

最容易回归的问题：

- 舰队跨幕突然消失。
- 上部大舰队凭空出现或离交战区太近。
- 德军主力舰没有从开场持续进入画面。
- T 字横切速度过快、方向不对、态势看不出。
- Beatty 或 Hipper 分舰队转向不自然。
- 德舰在 T 字横切下折返时像整张图片平移，不像鱼贯转向。
- 末段双方停住不动。夜间阶段应有德军撤退、英军追击/搜索和分队撤离。

接手时优先看这些路线：

- `beatty-scouting-east`
- `hipper-scouting-west`
- `grand-fleet-approach`
- `grand-fleet-closing`
- `grand-fleet-deploys`
- `high-seas-fleet-north`
- `scheer-battle-turn`
- `battlecruiser-death-ride`
- `german-main-night-retreat`
- `british-night-pursuit-route`

### 第二次瓜岛海战

文件：

- `src/data/guadalcanalNavalBattle.ts`
- `src/components/GuadalcanalNavalBattleAnimation.tsx`
- `docs/sources/guadalcanal-naval-battle.md`

当前重点：

- 开场两舰队已经在铁底湾行动，不能让侦察/铺垫占掉开头。
- `mapPoints` 里的南达科他号失电、华盛顿号雷达射击位、雾岛号重创等关键点都有 `revealAt`，不要提前剧透。
- 华盛顿号雷达火控齐射用 `guadalcanal-radar-salvo`。
- 舰船不能从岛上、港口陆地点或海岸线上开过。

最容易回归的问题：

- 关键位置点提前出现。
- 舰船开上瓜岛、萨沃岛或海岸。
- 夜战路线太简化，导致舰队从不合理方向穿越。
- 通用齐射漏掉音效或弹着点。

### 俾斯麦海海空战

文件：

- `src/data/bismarckSeaAirBattle.ts`
- `src/components/BismarckSeaAirBattleAnimation.tsx`
- `docs/sources/bismarck-sea-air-battle.md`

当前重点：

- 船队起点是 `rabaul-roadstead`，不是拉包尔陆地点。
- 船队终点和瓦解点使用 `convoy-breakup-sea`、`lae-approach` 等离岸点。
- 水面 `waypoints` 绕开新不列颠岛和新几内亚北岸。
- 船队航线要覆盖侦察、3月3日上午攻击和瓦解窗口；侦察机返航后，目标船队仍要继续移动，不能让侦察接触看起来早于运输船到达海域。
- 船图标使用 `ww2TransportShip`、`ww2EscortShip`，不是通用 `ship`。
- 攻击机使用 `ww2AttackAircraft`，轰炸机使用 `ww2Bomber`。
- 空战不再使用舰炮式 `salvo` / 集火线。跳弹轰炸要靠低空机群贴近船队、扫射/轰炸音效和船队瓦解路线表达；高空轰炸与低空跳弹都不能提前显示攻击线。
- 船队、高空轰炸、低空跳弹必须在事件窗口同位，测试里用敌我路线距离断言防止“两军态势线没对上”回归。
- 2026-05-23 继续修复后，侦察接触点改到船队北侧实际插值位置，高空轰炸、跳弹轰炸、末段追击都用敌我路线同窗距离门禁约束；`mopping-up` 改为 3月4日 11:30，追击机群先抵达残余船只，再返航。
- `bismarckSeaWide` / `bismarckSeaBattle` 视窗已外扩，避免侦察或跳弹事件点贴近画面边缘。
- 末段追击拆为 `mopping-up-strikes` 与 `mopping-up-return`，避免飞机单位超过短时任务窗口，同时保留15:00后返航动作。

最容易回归的问题：

- 船队从陆地开出或开到陆地。
- 黑色椭圆/terrainZones 重新出现。
- 航空队长期留在地图上，像陆军一样驻留。
- 航迹保留丢失，导致空战密度不够。

### 伦敦上空的鹰

文件：

- `src/data/battleOfBritain.ts`
- `src/components/BattleOfBritainAnimation.tsx`
- `docs/sources/battle-of-britain.md`

当前重点：

- 片名已从“不列颠空战”改为“伦敦上空的鹰”，不再做 1940-07-10 至 1940-09-15 的全景压缩，而是聚焦 1940-09-15 伦敦方向两次昼间大空袭。
- 初期德机路线飞越肯特海岸并进入伦敦方向，RAF 有 11 群升空、12 群增援、城市上空拦截和回程追击线。
- 12:45-14:05 有 `midday-raf-refuel-patrol` 衔接上午追击和13:45第二轮预警，避免空白期过长。
- 布伦奇利空域、白金汉宫方向、维多利亚站、达克斯福德、南安普敦等点按 `revealAt` 延迟出现。
- 编队使用 `ww2Bomber` 和 `ww2Fighter`，尺寸较小。
- 伦敦参照大周的表现口径：地图视窗收紧，德军来袭线补足去程、伦敦附近接触和返航段，RAF 航线补足侧前拦截、增援加入和追击段。
- 2026-05-23 继续修复后，上午回程追击改为 `12:00`，下午高峰改为 `14:45`，下午队形破碎改为 `15:10`；敌我路线在事件窗口必须同位，避免两军交汇却没有战斗事件。
- 德军来袭线已延伸到肯特/邓杰内斯返航方向，RAF 追击线从接触点接上返航走廊，补足伦敦两轮战斗后的返航流。
- 2026-05-23 再修“没有空军交战感”：伦敦新增 RAF/德军短时缠斗航迹和 `dogfightEffects`，上午/下午接触窗口显示缠斗圈、盘旋弧、短曳光和闪点；空战不要用 `salvo`/集火线。
- 2026-05-24 修复德机停在维多利亚/南伦敦问题：德军大编队把伦敦/南伦敦只作为中间航路点，随后经邓杰内斯走廊返航到法国基地；白金汉宫脱队机与拦截机在事件完成时退场。`dogfightEffects` 绑定 `routeIds`，测试检查效果中点必须有双方飞机仍可见且靠近中心。
- 2026-05-24 继续修复邓杰内斯德机停留和 RAF 返航缺失：邓杰内斯不能作为大编队最终停车点，上午/下午德军主波返回加来、布洛涅或格里内角，11群/12群/追击/缠斗航线返回比金山、肯利或达克斯福德。数据门禁新增 `unitVisibleUntil <= end`，确保空中单位可见期间仍在航线运动，航迹可保留到片尾但飞机不能在最后一点悬停。
- 10:30 开场已有雷达航迹，13:45 预警和18:00结果节点静音；实际拦截/混战/追击才播放飞机或扫射音效。

最容易回归的问题：

- 德机没飞到英国，半路在海上没了。
- 地图比例过大、长时间无飞机却有爆炸音。
- 雷达/机场关键点提前出现。
- 飞机图标过大、过卡通。
- 敌我机群只是擦肩而过：必须在数据层断言同一事件时间窗双方路线靠近，同时在视觉层显示空战缠斗效果。
- 只把路线终点从伦敦改到邓杰内斯不够；如果 `unitVisibleUntil` 晚于 `end`，飞机仍会在邓杰内斯悬停。正确做法是补完整返航/返场路径，或让单位退场时间不晚于航线结束。

### 大周行动

文件：

- `src/data/bigWeekAirBattle.ts`
- `src/components/BigWeekAirBattleAnimation.tsx`
- `docs/sources/big-week-air-battle.md`

当前重点：

- 每天的空袭、护航、截击、受损返航以短时波次表达。
- 组件必须使用 `timingMode="compressed"`，避免跨天夜间空白拖慢五分钟动画；不要只改数据文件却忘了组件时间线参数。
- 轰炸机流、护航战斗机、德军截击机有数量比例，且都有返航/返场路线。
- 2月20日拆成出动集结和目标区攻击；`argument-sortie-begins` 不触发爆炸音，`operation-argument-start` 才对应目标区轰炸。
- 2026-05-23 继续修复后，`operation-argument-start` 改为 `1944-02-20T12:05`，此时首日轰炸机流插值位置贴近莱比锡；该节点已加入 `cueEventIds` 并配置为 `bombing`，浏览器测试点击事件会校验爆炸音。
- 2月24日工业目标节点必须有 `feb-24-industrial-strike`、`feb-24-escort-cover`、`feb-24-luftwaffe-defense` 同窗活动。
- 目标点如不伦瑞克、莱比锡、雷根斯堡、柏林、截击区、损失带、返航集合点按 `revealAt` 出现。
- 空战不使用 `big-week-industrial-bombing` / `big-week-brunswick-bombing` 这类舰炮式 `salvo` 特效；工业目标轰炸只通过 `bombing` 事件音效和目标区同窗航迹表达。
- 2026-05-24 已接入伦敦同款缠斗效果：`big-week-loss-belt-dogfight`、`big-week-escort-dogfight`、`big-week-industrial-dogfight`。新增 `escort-sweep-dogfight-weave` 和 `luftwaffe-dogfight-break`，并把 `luftwaffe-attrition` 移到 `1944-02-22T11:15` 接敌窗口。
- 大周缠斗必须绑定 `routeIds`，测试会检查效果中点双方飞机仍在单位可见窗口内且靠近缠斗中心；不要出现没有双方飞机的空缠斗。
- “无护航深袭的代价”要通过 `schweinfurt-regensburg-lesson`、`loss-belt-luftwaffe-intercept`、`ruhr-flak-belt-fire`、`damaged-bomber-return` 等同窗航迹表现，必须明确损失来自德机截击和高炮带。
- 2月25日终幕是纵深返航分散，不是新一轮不明轰炸；航线不能飞到柏林边缘却不解释，也不能在收束节点播放爆炸音。

最容易回归的问题：

- 飞机长期留场。
- 航迹线消失。
- 护航与截击关系看不出，只剩几条简单直线。
- 轰炸没有爆炸音，或爆炸点没有落在目标区。
- 受损返航/深袭代价只写文字，画面上看不出来。

### 特拉法尔加与对马

文件：

- `src/data/trafalgarBattle.ts`
- `src/components/TrafalgarBattleAnimation.tsx`
- `docs/sources/trafalgar-battle.md`
- `src/data/tsushimaBattle.ts`
- `src/components/TsushimaBattleAnimation.tsx`
- `docs/sources/tsushima-battle.md`

保留经验：

- 短战术海战要收紧到战场视窗，不要放成大区域地图。
- 风帆舰和近代战舰要用宽幅、水平、可识别的写实图标。
- T 字横切、旗舰失能、夜战追击、残部投降都要拆成路线段，而不是一个“追击箭头”。
- 清晨侦察可作为旁白和事件，但不能让播放开头长时间空地图。

## 10. 图标与素材规则

图标类型定义在 `src/types/units.ts`，具体配置在 `src/components/UnitIcon.tsx`。

当前可用图标：

- 古代/冷兵器：`cavalry`、`chariot`、`ship`
- 火炮/近代：`cannon`
- 装甲/陆战：`tank`、`tankKorean`
- 航母/海战：`carrier`、`carrierEssex`、`warship`
- 步兵：`infantry`、`infantryPva`
- 现代/韩战航空：`fighter`、`sabre`
- 特拉法尔加专用风帆舰：`trafalgarBritishLine`、`trafalgarBucentaure`、`trafalgarFrenchLine`、`trafalgarHmsVictory`、`trafalgarRoyalSovereign`、`trafalgarSantisimaTrinidad`
- 二战空战：`ww2Fighter`、`ww2Bomber`、`ww2AttackAircraft`
- 二战海空战舰船：`ww2TransportShip`、`ww2EscortShip`

硬规则：

- 不要退回抽象简笔图标。
- 二战飞机图标必须是经典机型加工出的低饱和剪影风格，不要动画式图标。
- 俾斯麦海的运输船和护航舰必须用二战船图标，不要通用 `ship`。
- 近代战舰图标不要用俯视图、蓝图或三视图，优先用航行态侧视。
- 图标保持水平，只按当前路线段左右方向镜像。
- 宽主体要按实际比例配置 `width/height`，不要压进正方形。
- 舰船图标在战术海战中通常要缩小，防止遮挡字幕、图例和航迹。

素材授权风险：

- 详见 `docs/sources/unit-icons.md`。
- PNGIMG 等来源可能是 CC BY-NC 4.0 或存在非商业限制。当前项目适合作本地 demo，若公开商业发布，必须替换有风险的派生图标。

## 11. 音频规则

音频控制在 `src/lib/warScore.ts`，来源记录在 `docs/sources/audio.md`。

必须遵守：

- 每部动画优先使用不同背景配乐，并在 `score-toggle` 暴露 `data-music-source`。
- 古代战斗用冷兵器/近战音效。
- 拿破仑、风帆舰、近代海战用炮声或火炮类音效。
- 二战空战/海空战用细分音效：`aircraft` 只给升空/接近，`airCombat` 给拦截/追击并播放飞机+扫射，`bombing` 只给明确轰炸目标并播放爆炸+飞机；预警、结果、返航收束节点静音。
- 事件点击必须在用户手势内触发 SFX，不能只靠自动播放时的 `activeEvent` 变化。
- `cueEvents` 应覆盖战斗、围城、登陆、强攻、空袭、舰炮交战等军事事件，政治/条约/结果节点可静音。
- 爆炸音效要和战斗时间对齐。用户已经多次指出“战斗点没有爆炸音效”和“爆炸背景音跟战斗时间没对上”。

当前注意点：

- `tests/battle-france-smoke.spec.ts` 里仍有 `temporarySharedMusicCampaignIds`，当前把 `big-week`、`bismarck-sea`、`britain-air` 从全局配乐唯一性测试中临时排除。不要把这理解为“这三部不需要配乐唯一性”；伦敦已从德法战役曲换到 `Rule, Britannia!` 作为临时修复，但仍与特拉法尔加复用，后续应补独立空战配乐后移除豁免。
- 海战齐射不一定使用“爆炸”声，风帆/近代舰炮更适合 `gunpowder` 配置；二战空袭和跳弹轰炸才更偏 `ww2`。

## 12. 时间轴与节奏规则

默认新战争动画控制在 5 分钟：

```tsx
playbackDurationSeconds={300}
```

长跨度战争：

- 使用 `timingMode="compressed"`、`activeSpans`、`inactiveGapDisplayDays`、`gapOverrides` 压缩非作战空档。
- 多线并进且强依赖同一日历关系的战争，例如苏德战争，可保留 `timingMode="calendar"`。
- 启用压缩时间轴时，事件跳转、路线推进、镜头切换和事件轨道位置必须使用同一映射。

短战术战斗：

- 使用小时级 `YYYY-MM-DDTHH:mm`。
- 设置 `timeStepDays={1 / 24}` 和 `timeCounterLabel="小时"`。
- 使用紧战区视窗展示战术走位。
- 不要让侦察或背景铺垫消耗开场播放时间。第一帧应已有关键舰队/航空队行动。

空战：

- 飞机单位是小时级短波次。
- 航迹可以保留，飞机图标不能长期驻留。

海战：

- 舰队可以跨阶段持续存在。
- 航迹线应保留用于战术复盘。
- 舰队路线段交接要连续，不能幕间位移。

## 13. 地图、镜头和字幕规则

地图视窗定义在 `src/lib/geoMap.ts`，wrapper 通过 `focusSteps` 控制阶段镜头。

规则：

- 多战区动画必须按事件所在战区切镜头，不能只用一个宽视图。
- 临时切到旁支战区后必须显式切回主战区。
- 跨日期线战区使用太平洋中心投影策略，新增太平洋岛链事件要检查经度口径。
- 手动平移/缩放在 `mapFocus` 改变时会复位，避免旧偏移污染新镜头。
- 幕间镜头切换不能突然，尤其海战中不要让舰队先完成队列变换，再让地图缩放。
- 上部图例、标题、字幕不能互相遮挡。用户曾指出“上边的图例挡住字幕”。
- 字幕必须是低高度、半透明、横向 ticker，`pointer-events: none`。
- 底部控制区不能 sticky 覆盖地图。

地图交互仍是通用硬要求：

- 普通滚轮只纵向平移。
- Shift + 滚轮或横向滚轮只横向平移。
- 拖拽可横纵向平移。
- 有显式 `+`、`-`、复位按钮。
- 双击地图复位。
- 默认缩放 `scale=1` 时也允许基础横向/纵向平移。

## 14. 反剧透规则

用户多次指出“瓜岛还在剧透”。后续统一处理：

- 事件性位置点默认不要提前显示。
- 关键伏击点、转向点、射击位、弹着点、失能位置、瓦解海域、目标区，必须加 `revealAt`。
- 测试用 `expectMapPointsHidden(page, selector, pointIds)` 覆盖首屏或事件前状态。
- 需要提前存在的基础地理点可以常显，例如伦敦、多佛、拉包尔外海锚地、铁底湾等。
- 不要用提前出现的标注解释后续战术，这会破坏动画叙事。

## 15. 测试与验证

常用命令：

```bash
npm install
npm run dev
npm run build
npm run preview
npm run test:smoke
git diff --check
node /Users/asukarei/.codex/skills/animation-assistant/scripts/check-animation-project.mjs /Users/asukarei/Desktop/war-animation-lab-oss
```

定向跑本轮海空战相关 smoke：

```bash
npx playwright test tests/battle-france-smoke.spec.ts -g "campaign data quality gates|battle of britain|big week air battle|bismarck sea air battle|guadalcanal naval battle|jutland battle|trafalgar battle|tsushima battle" --reporter=line
```

上一轮实现后的已知验证结果：

- `npm run build` 通过。
- `npx playwright test tests/battle-france-smoke.spec.ts -g "campaign data quality gates|battle of britain|big week air battle|bismarck sea air battle" --reporter=line` 通过，4 passed。
- `npm run test:smoke -- --reporter=line` 通过，21 passed。
- `git diff --check` 通过。
- `node /Users/asukarei/.codex/skills/animation-assistant/scripts/check-animation-project.mjs /Users/asukarei/Desktop/war-animation-lab-oss` 通过。
- 手动 preview 进程已清理，4177 端口无残留。

接手者注意：

- 如果用 `vite preview` 跑浏览器测试，源码改完必须先 `npm run build`，否则会测到旧 `dist`。
- 只改文档时至少跑 `git diff --check`。
- 涉及动画代码、数据、样式、音频或素材时，必须跑 `npm run build` 和相关 Playwright smoke。

## 16. 当前测试覆盖重点

`tests/battle-france-smoke.spec.ts` 已覆盖：

- 首页古代/现代分类和卡片顺序。
- 所有注册动画可从首页进入。
- 5 分钟片长和时间计数。
- 地图首屏、中期、后期关键事件可见性。
- 普通滚轮、横向滚轮、拖拽、缩放按钮、复位按钮。
- 字幕低高度、不拦截交互。
- 背景配乐来源属性。
- 图标资产路径、尺寸、类型。
- 事件点击触发 SFX。
- 空战短波次、飞机离场、航迹保留。
- 新空战没有 `terrainZones` 黑椭圆。
- mapPoints 延迟揭示。
- 海路和舰船 bbox 不上陆。
- 舰船尺寸压缩。
- 战术路线复杂度。
- 日德兰舰队组连续存在。
- 瓜岛、日德兰、对马、俾斯麦海的齐射/弹着效果。

后续建议拆分测试文件：

- `tests/home.spec.ts`
- `tests/map-interaction.spec.ts`
- `tests/audio.spec.ts`
- `tests/campaigns/naval.spec.ts`
- `tests/campaigns/air.spec.ts`

当前不必为拆分而暂停交付，除非测试文件继续显著膨胀。

## 17. 常见失败模式

这些问题已经反复出现，接手者要主动排查：

- 会话中展示图片或截图，导致上下文/会话崩溃风险。
- 只看源码不跑浏览器，错过字幕遮挡、图例遮挡、地图上陆、舰队跳变。
- 在 `vite preview` 下忘记先 build，测到旧产物。
- 舰队跨幕突然消失。
- 航迹线被 `visibleUntil` 过早隐藏。
- 旧单位标记退场后，新路线单位没有自然接上，形成位置跳变。
- 编队像整张图片平移，而不是沿路线鱼贯行驶。
- T 字横切没有相对敌方舰列方向，只有一个文字标签。
- 飞机像陆军一样长期驻留地图。
- 空战图标过大或卡通化。
- 黑色 `terrainZones` 椭圆遮挡地图。
- 关键位置点提前出现，造成剧透。
- 海路连接港口中心，导致路线穿陆。
- 舰船 bbox 即使中心在海上，边角仍压到陆地。
- 上部图例压住字幕。
- SFX 只在自动播放触发，点击事件无声。
- 爆炸音效和事件时间不一致。
- 新动画忘记注册首页卡片或忘记滚动回顶部。
- 新资源来源没有写入 `docs/sources`。

## 18. 新增动画标准流程

1. 阅读本交接文档和 `animation-assistant` skill。
2. 查资料，写 `docs/sources/<campaign>.md`。
3. 新建或修改 `src/data/<campaign>.ts`，先定 `mapPoints`、`battleEvents`、`frontLines`、`narrationCues`、`cueEventIds`。
4. 短战术战斗使用小时级时间，长战争使用压缩时间轴。
5. 需要新视窗时改 `src/lib/geoMap.ts`。
6. 新建 wrapper，复用 `CampaignMapAnimation`。
7. 设置 `playbackDurationSeconds={300}`，除非用户明确要求不同片长。
8. 按时代选择 `sfxProfile`、`cueEventKinds`、`unitIcon`、`routeKind`。
9. 若要新图标，优先写生成脚本并记录来源。
10. 在 `src/App.tsx` 注册 key 和组件。
11. 在 `src/components/WarLibraryHome.tsx` 加卡片，并按历史时间排序。
12. 在 Playwright 中补 smoke，至少覆盖加载、关键镜头、路线类型、图标、音频、反剧透、航迹/单位可见窗口。
13. 跑 `npm run build` 和定向 smoke。
14. 更新本交接文档或相关来源文档。
15. 把可复用经验沉淀到 mempalace。

## 19. Mempalace 已沉淀经验

已记录的 durable rules 包括：

- 空战要用短时波次，飞机离场但航迹保留。
- 新空战不要使用无必要黑椭圆，事件性 `mapPoints` 要延迟揭示。
- 海空战舰船要用离岸航路和 bbox 不上陆测试。
- 海战使用战术舰队中心线、路线局部编队 offset、水平舰船图标、海路采样验证。
- 短战术海战用小时/分钟锚点和紧战区视窗，不让铺垫消耗开场。
- 瓜岛第一帧应显示双方舰队已在铁底湾行动。
- 日德兰拆成侦察、南向追逐、北向引诱、大舰队展开、Scheer 转向、夜间逃脱等阶段。

如果后续有新的稳定经验，继续写入 `war-animation-lab-oss` 或 `animation-assistant` 对应 wing/room。

## 20. 提交前清单

提交前执行：

```bash
git status --short
git diff --check
npm run build
npm run test:smoke
```

只改文档时：

```bash
git diff --check
```

如果新增大资源：

- 不要误提交 `dist/`、`test-results/`、`artifacts/`。
- 检查 `logs/` 是否只是本地运行产物，通常不应提交。
- 用 `file` 或资源测试确认图片/音频不是 403/404 HTML。
- 确认来源、许可、用途写入 `docs/sources/`。

推荐提交粒度：

- 新增一部动画：数据、wrapper、来源、测试、必要资源放同一提交。
- 通用渲染器能力：单独提交，并跑全量 smoke。
- 纯素材替换：单独提交，说明来源、许可和替换原因。

## 21. 快速接手步骤

1. 运行 `git status --short`，确认当前未提交变更范围。
2. 读本文件、`docs/animation-assistant-agent.md` 和目标动画的 `docs/sources/*.md`。
3. 若任务涉及视觉问题，用 Playwright/DOM 断言验证，不在会话展示图片。
4. 先看目标动画 `src/data/*.ts`，判断是否能通过数据修复。
5. 需要改通用层时，再读 `src/components/CampaignMapAnimation.tsx`、`src/components/UnitIcon.tsx`、`src/lib/geoMap.ts`、`src/lib/useMapInteraction.ts`。
6. 增加或更新测试，优先复用现有 helper。
7. 跑 build 和 smoke。
8. 更新来源文档、交接文档和 mempalace。

## 22. 接手第一天建议路线

如果新会话刚接手，不要立刻开始大范围重构。建议按以下顺序恢复生产节奏：

1. 先确认工作树：`git status --short`。当前仓库存在大量未提交动画开发成果，不能回滚。
2. 只读本文件、`README.md`、`docs/animation-assistant-agent.md`、目标动画数据和目标来源文档。不要读取旧 Codex rollout 作为上下文来源。
3. 跑一次只读体检：`node agents/skills/animation-assistant/scripts/check-animation-project.mjs .`。
4. 如果要改动画，先选一个目标，不要同时开多部。优先从用户最近反馈最强的海战/空战开始。
5. 对目标动画先列“事件时间轴 - 路线段 - 单位可见窗口 - 镜头阶段 - 音效 cue - revealAt 点”六列检查表。
6. 先修数据：`src/data/<campaign>.ts`。多数问题是路线、时间、单位窗口、关键点提前显示或编队交接不对。
7. 再修 wrapper：`src/components/<Campaign>Animation.tsx`。重点是 `focusSteps`、`activeSpans`、`musicSource`、`sfxProfile`、`battleEffects`、`terrainZones`。
8. 只有通用能力缺失时才改 `CampaignMapAnimation`、`UnitIcon`、`geoMap` 或 `useMapInteraction`。
9. 改完必须补或更新 smoke helper。用户指出过的问题，不接受只靠人工说“看起来好了”。
10. 最后更新 `docs/sources`、本交接文档和 mempalace。

第一天不要做的事：

- 不要把所有动画一起重排。
- 不要把测试拆文件作为第一优先级，除非它阻碍本次动画验证。
- 不要新增大量素材却不验证显示比例、授权和资源可访问性。
- 不要在会话中贴截图、贴图片、贴 base64 或大段日志。
- 不要把旧会话内容当作事实来源；事实来源应是仓库文档、代码、测试、mempalace 和公开资料。

## 23. 逐部动画升级标准

用户已经要求“以日德兰的经验和制作水准，对所有动画逐一全面提升”。这不是一次性全仓库重构，而是逐部动画做质量闭环。每部动画升级时按以下标准验收：

### 23.1 资料和时间轴

- 战役节点来自可靠资料，来源写入 `docs/sources/<campaign>.md`。
- 长战争按作战段压缩，短战斗用小时级锚点。
- 事件顺序、路线起止、战斗效果、音效 cue 使用同一时间轴。
- 空档不能拖慢 5 分钟播放节奏；但多线并进战争要保留必要的同时性。

### 23.2 地图和镜头

- 地图第一屏就是动画主体验，不做营销页式铺垫。
- 视窗跟随实际战区；侧支战区结束后显式切回主战区。
- 镜头切换不能让单位先跳位、先变队形或突然竖起来。
- 字幕、图例、标题、控制区不能遮挡关键路线、事件点或彼此重叠。

### 23.3 单位和运动

- 陆战单位、舰船、飞机、古代骑兵/战车必须时代匹配。
- 海战舰队出现后必须持续存在，除非战损、沉没、失能或历史脱离。
- 空战飞机必须短时出击、离场；航迹可以保留，飞机不能长期驻留。
- 多单位协同行动必须像编队沿路线运动，不能像整张图片平移或整体旋转。
- 舰船和飞机图标要小而清楚，不能遮挡战术几何。

### 23.4 路线和反剧透

- 海路不得穿陆、贴陆或让舰船 bbox 压陆。
- 空中路线必须到达目标区、拦截区或返航/离场点，不能半路消失。
- 战术海战航迹应尽量保留，用于复盘。
- 关键伏击点、转向点、弹着点、雷达射击位、瓦解海域必须用 `revealAt` 延迟出现。

### 23.5 音频和战斗效果

- 每部动画背景配乐尽量唯一且适配战役气质。
- 战斗事件自动播放和手动点击都要触发时代匹配 SFX。
- 齐射、爆炸、跳弹轰炸、扫射、舰炮交战等效果必须与事件时间点对齐；空战轰炸事件要能听到爆炸音，攻击/扫射/混战事件要能听到飞机与机枪/俯冲音。
- 不要把爆炸声当作通用背景噪声；没有战斗的时段不应乱响。

### 23.6 验证

- 至少跑 `npm run build` 和目标 smoke。
- 若改通用渲染器，跑全量 `npm run test:smoke`。
- 文档改动至少跑 `git diff --check`。
- 不在会话展示截图；如需要截图，只保存本地证据并文字说明结论。

## 24. 当前最高风险和下一步候选

当前最高风险不是“缺少动画数量”，而是已有动画质量不均、工作树未提交、测试集中且变更面大。下一任应优先把当前未提交开发成果收敛成可验证提交，再继续逐部升级。

建议优先级：

1. 收敛当前海战/空战大改：确认 `npm run build`、定向 smoke、`npm run test:smoke` 和 `git diff --check` 当前是否仍通过。
2. 检查 `logs/` 是否为本地运行产物，通常不要提交。
3. 检查新增 `public/assets/unit-icons` 和 `public/audio` 的来源文档是否完整。
4. 确认 `docs/sources/audio.md` 中配乐唯一性临时豁免是否仍需要。
5. 以日德兰为标杆，逐部复查对马、瓜岛、俾斯麦海、伦敦上空的鹰、大周行动、中途岛、太平洋战争。
6. 再回到陆战和古代战役，重点看镜头、压缩时间轴、图标写实度、地图交互和音效 cue 覆盖。

## 25. 会话健康和上下文纪律

本项目很容易因为图片、截图、素材和长日志把会话拖死。后续必须遵守：

- 不在聊天中展示图片、截图、视频帧或本地素材。
- 不把旧 rollout、HTML、base64、完整日志或大段测试输出贴进会话。
- 大量经验沉淀到 mempalace，具体交接写到仓库文档。
- 视觉验证用 Playwright、DOM 数值、资源状态和本地人工查看，最终回复只写结论和路径。
- 每完成一轮动画规则修正，都更新本文件或 `agents/skills/animation-assistant/SKILL.md`，避免新会话重新问一遍。
