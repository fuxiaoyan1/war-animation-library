# 坎尼会战重建更新说明

Cannae Battle Rebuild Update Notes

更新时间：2026-06-10

Updated: 2026-06-10

## 范围

## Scope

本次重新制作《坎尼会战》独立动画入口，遵循 `AGENTS.md` P0 规则、`animation-assistant` skill、垓下/碾庄参考动画流程和成熟系列 Playwright 门禁。旧的失败独立实现没有恢复；三次布匿战争总史中的坎尼节点未被删除或替换。

This rebuild creates a standalone `Battle of Cannae` library entry under the repository P0 rules, the `animation-assistant` workflow, the Gaixia/Nianzhuang reference process, and the mature series Playwright gates. The deleted failed standalone base was not restored. The Cannae node inside the full Punic Wars animation was not removed or replaced.

## 主要变化

## Main Changes

- 新增 `CannaeBattleAnimation` 与 `CannaeTerrain3D`，采用 MapLibre 斜视战术地图、绘制型历史地形、SVG 战术覆盖层和低位旁白字幕。
- 新增 `src/data/cannaeBattle.ts` 数据模型，使用 216 BCE 8 月 2 日 06:00-16:00 小时级时间轴，固定 `playbackDurationSeconds = 300`。
- 数据拆分为部署、凸阵诱入、罗马纵深压入、骑兵清场、中军由凸转凹、两翼内折、骑兵后封口、压缩围歼、Paullus 终局和战斗结果十个事件。
- 路线使用 `formationPrelude`、`visibleUntil`、`unitVisibleFrom` 和 `unitVisibleUntil` 表达任务交接，避免压缩、内折、后封口和终局部队凭空出现。
- 开场不再只显示一侧入场。罗马部署、迦太基凸阵、非洲两翼和汉尼拔指挥从 06:00 即形成可见部署全景。
- 汉尼拔凸阵节点保持部署/接敌前意图展示，不再提前触发冷兵器特效；真正 melee 从罗马纵深压入后才出现。
- 中军后退路线延后到罗马压入后启动，避免迦太基中央在未接触时先后退，形成“罗马无脑送入包围圈”的误读。
- 坎尼专属单位 marker 改为由 0 A.D. 角色头像源图裁剪加工生成，不再使用本轮早期自绘 SVG/几何人物、Theodore Ayrault Dodge 图版或 VHV/PNGIMG 素材站尝试作为运行时图标来源；脚本保留源图、裁剪、调色、描边、加阴影和阵营角标。
- 罗马重步兵、迦太基中军、非洲两翼、骑兵清场和后口封闭的单位数量提高到密集方阵/战斗幕级别，避免单列单位排队移动。
- 罗马左右翼骑兵失败后被压制/退场，不再穿越迦太基骑兵线；Paullus 指挥节点回到罗马核心附近，不再孤立在方阵后远处。
- 为正面接触、骑兵清场、两翼内折、后口封闭、压缩围歼和 Paullus 终局增加事件级 `contactAnchors`，冷兵器特效和音效只在双方可见单位真正进入阈值后出现，并使用实时单位中点而不是静态空地坐标。
- 奥凡托河和河岸限制带上移并同步 MapLibre/交互边界，确保罗马右翼、迦太基左翼表现为沿河岸作战，而不是在河中移动。
- 时间轴拖动改为暂停播放、取消待播音效并即时重算相机/单位；专项门禁增加真实鼠标拖动 late-to-early 回归，避免拖回早期后单位消失。
- 播放推进时保留阶段相机平滑过渡，拖动和事件跳转时即时定位，避免时间轴操作时相机滞后、特效和单位错位。
- 2026-06-09 晚间二次修正了用户集中反馈的 13 项问题：开场全景相机真正放宽，旧阶段单位退场与路线留痕分离，罗马压缩核心从拖尾队列改为围绕核心的厚阵，后口骑兵封闭贴近罗马核心，melee 特效改用实际可见单位接触点，后封口/压缩阶段单位主体重新回到地图核心。
- 2026-06-09 evening pass addressed the 13 reported issues as a group: the opening camera is now a real wide deployment view, old-stage units exit while route traces remain, the Roman compressed core is a centered mass rather than a trailing column, rear cavalry closure sits against the Roman core, melee effects use visible unit contact points, and rear-seal/compression units return to the tactical map core.
- 2026-06-10 修正了“迦太基单位穿越罗马方阵、在敌阵后方列口袋阵、罗马再钻进口袋”的严重动线错误：罗马主阵从 07:10 形成连续厚阵推进，罗马骑兵从部署段随军可见；迦太基中军按接触后退回本方一侧形成凹袋；非洲步兵只在罗马核心南北外侧压迫；骑兵只从外侧后口封闭；`carthaginian-pocket-tighten` 被拆成北侧墙、南侧墙和东侧中军压力，不再穿过罗马核心。
- The 2026-06-10 pass fixed the severe pathing error where Carthaginian units appeared to pass through the Roman formation, line up behind it, and then wait for the Romans to enter the pocket. The Roman main body now forms a continuous deep advance from 07:10, Roman cavalry is visible from the deployment span, the Carthaginian center yields back toward its own side after contact, African infantry presses only from outside the Roman north/south edges, cavalry closes only from the outside rear, and `carthaginian-pocket-tighten` is split into north, south, and eastern pressure walls rather than crossing the Roman core.
- 短兵相接阶段加入持续微运动：完成路线但仍在战斗窗口内的单位会保留小幅压迫、摇动和崩溃扰动，避免阵地战看起来像回合制棋子或静态贴图。
- Close-combat phases now keep kinetic pressure motion: units whose routes have completed but remain in the fighting window still receive small pressure, wobble, and collapse disturbance, so the battle does not read as turn-based pieces or static stickers.
- 将阵法战“五道动线设计工序”纳入 `AGENTS.md` P0 和 `animation-assistant` skill：先定单位数量/尺寸/阵形厚度，再反推地图比例和镜头包络，再分别设计两军 5 分钟完整动线，再按史料合并校正接触点和不合理路径，最后完整回放并保存视觉证据。
- The formation-battle five-pass movement design loop was added to `AGENTS.md` P0 and the `animation-assistant` skill: choose unit count/size/formation thickness first, derive map scale and camera envelope, design each side's full five-minute movement separately, integrate and source-check contact/impossible paths, then replay the whole film and save visual evidence.
- 旁白和事件说明删除“镜头、动画、复盘、摆拍”等制作口吻，改为战史解说、战斗结果和战争代价表达。
- 新增独立来源文档 `docs/sources/cannae-battle.md`，记录 Polybius、Livy、Britannica、World History Encyclopedia、Wikimedia Commons 地图分类和 OpenStreetMap。
- 配乐从低码率单声道 `public/audio/wikimedia-ride-of-the-valkyries.ogg` 改为独立清晰音频 `public/audio/wikimedia-the-gladiator-us-marine-band.ogg`，不再复用三次布匿战争总史的 `Only the Braves`；`docs/sources/audio.md` 已记录来源、时长、码率和公有领域口径。
- 2026-06-10 r17 修正开场与后段相机：交互最小缩放从 `0.9` 降到 `0.46`，避免部署全景被 `scale=0.5` 后又强行放大裁切；后封口、压缩和终局相机改按可见单位包围盒核心重新居中，避免只盯事件点导致主体偏边。
- 2026-06-10 r17 fixed opening and late-stage camera behavior: the interaction minimum zoom was lowered from `0.9` to `0.46`, so the wide deployment camera is no longer forced back into a cropped close view. Rear-seal, compression, and endgame centers now follow the visible unit envelope instead of only the event point.
- 2026-06-10 r17 调整图标显示层：运行时仍使用已记录来源的 0 A.D. 加工资产，但 Cannae marker 的显示缩放降为 `0.62`，去掉额外饱和/亮度/对比滤镜，改用轻量阴影，先解决地图尺度下头像贴纸过大、黑块感和拥挤问题。
- 2026-06-10 r17 adjusted the marker rendering layer: runtime assets still use the documented 0 A.D.-derived source set, but Cannae markers now render at `0.62` scale, remove the extra saturation/brightness/contrast filter, and use a lighter shadow, reducing oversized portrait-card, dark-cluster, and crowding artifacts at map scale.
- 2026-06-10 r18 换掉 Cannae 运行时 0 A.D. 头像链，改用 `public/assets/unit-icons/source/cannae-baidu/` 下的 Baidu 候选源图重新生成八类 Cannae marker；许可状态不明，限定为本地/私有非商业演示并记录公开发布前替换要求。
- 2026-06-10 r18 replaced the Cannae runtime 0 A.D. portrait chain with Baidu-discovered source images under `public/assets/unit-icons/source/cannae-baidu/` and regenerated all eight Cannae marker kinds. License status is unverified, so these are limited to local/private non-commercial demo use and require replacement or authorization before public release.
- 2026-06-10 r18 修正坎尼动线：迦太基骑兵从 06:00 部署阶段即可见，避免突然出现；中军接触/退让/保持线整体移到罗马正面东侧，避免穿入罗马核心；后封口骑兵端点贴近罗马后肩；Paullus route 收缩为终局核心内短标识。
- 2026-06-10 r18 movement correction: Carthaginian cavalry is visible from the 06:00 deployment stage, the center contact/yield/hold lines are moved east/front of the Roman core, rear-seal cavalry closes closer to the Roman rear shoulder, and the Paullus route is reduced to a short endgame in-core marker.
- 2026-06-10 r18 保留 Cannae 独立配乐 `The Gladiator`，但通过 `WarScore` 的 `loopEndSeconds=164` 在结尾掌声前循环，避免换成已用曲目或让掌声进入战斗背景。
- 2026-06-10 r18 keeps Cannae's unique `The Gladiator` score but uses `WarScore` `loopEndSeconds=164` to loop before the ending applause, avoiding both music reuse and applause in the battle background.

English summary: Cannae now has a standalone MapLibre pitched tactical animation, a 300-second hour-level data model, source-backed phases, route handoffs, visible opening deployment, source-image-processed ancient unit markers, denser formation movement, event-bound contact effects, source documentation, and mature smoke gates.

## 坎尼专项门禁

## Cannae-Specific Gates

新增 `tests/battle-france-smoke.spec.ts` 中的专项门禁：

Added a dedicated mature-suite gate in `tests/battle-france-smoke.spec.ts`:

- `cannae battle rebuild shows pitched double envelopment with readable ancient units`

该门禁覆盖：

The gate verifies:

- 独立入口、5 分钟片长、小时级时间轴和坎尼主页入口。
- MapLibre 斜视战术地图，`data-camera-pitch="56"`，绘制型历史战术底图，不使用现代影像可见底图。
- 地图优先布局、低位非阻塞字幕、地图平移/缩放/复位交互。
- 首帧双方部署全景：罗马入场、迦太基凸阵、非洲两翼和 Hannibal 指挥同屏可见。
- 凸阵、凹袋、骑兵清场、两翼内折、后口封闭、压缩围歼和 Paullus 终局的关键路线与阵形。
- 单位资产路径、资源大小、罗马/迦太基资产区分、单位数量、罗马重步兵方阵厚度、骑兵不穿越、后口闭合距离、事件接触锚点和冷兵器音效点击触发。
- 当前事件点和可见单位必须保持在地图核心区，不能回到大片空地或主体挤边。
- 开场部署、两翼内折、后口封闭和压缩阶段增加“单位大部分留在战术视窗内”的断言，防止全景失效、旧单位拖出画面或合围阶段主体挤到边外。
- The opening, inward-turn, rear-seal, and compression phases now assert that most route units remain in the tactical viewport, preventing broken wide shots, stale offscreen units, or edge-clustered envelopment scenes.
- 2026-06-10 追加终局崩溃门禁：罗马完整压缩主阵 `roman-core-compression` 的单位必须在 14:35 前退场，`roman-core-breakup` 只保留 24-32 个不规则残部并在 15:35 前退场，Paullus 指挥单位在 15:20 前退场；16:00 结果阶段不得再渲染任何罗马单位 marker，只保留战术线、Paullus 终局点和“罗马组织崩溃区”结果点。
- 2026-06-10 added final-collapse gates: the intact Roman compressed body (`roman-core-compression`) must leave by 14:35, `roman-core-breakup` must show only 24-32 irregular remnants and leave by 15:35, and the Paullus command marker must leave by 15:20. At the 16:00 result stage no Roman unit markers may remain; only tactical traces, the Paullus outcome point, and the Roman organizational-collapse result point remain.
- 2026-06-10 r8 追加结果态门禁：16:00 结果阶段不得保留整齐的迦太基压缩墙、两翼或骑兵 marker，只保留战术线和结果点，避免结尾仍像双方整队列阵。
- 2026-06-10 r8 added a result-state gate: the 16:00 result stage must not retain ordered Carthaginian compression-wall, wing, or cavalry markers. It keeps tactical traces and result points only, so the ending does not still read as two ordered armies standing in formation.
- 残部散乱度也纳入数据门禁：终局残部不能重新排成整齐行列，同一经度桶最多 2 个、同一纬度桶最多 4 个，避免战败画面看起来像完整方阵仍然列队。
- Remnant irregularity is now gated in data: final Roman remnants cannot resolve back into tidy ranks or files. The same longitude bucket may hold at most 2 units and the same latitude bucket at most 4 units, so the defeat scene cannot read as a surviving ordered formation.
- 2026-06-10 追加动线几何门禁：迦太基中军、非洲步兵内折、口袋压缩、重骑后封口和努米底后压迫的单位轨迹不得进入罗马核心边界；口袋压缩必须在罗马核心北、南、东三侧形成外侧压力，骑兵封后必须保持在核心西侧；浏览器层还检查压缩/封口阶段迦太基单位不能落入罗马单位包围盒内部。
- 2026-06-10 added movement-geometry gates: the Carthaginian center, African inward turns, pocket compression, heavy-cavalry rear seal, and Numidian rear pressure cannot enter the Roman core bounds. Pocket compression must form outside pressure on the Roman north, south, and east, while rear cavalry remains west/behind the core. The browser gate also checks that Carthaginian units do not render inside the Roman unit bounding box during rear-seal/compression phases.
- 2026-06-10 追加持续战斗运动门禁：已完成但仍在战斗窗口内的后封口骑兵路线必须保持 `data-unit-motion="pressure"`，并且在相邻战斗时点单位 transform 发生变化，防止静态棋子化。
- 2026-06-10 added a kinetic-combat gate: completed rear-seal cavalry routes that remain in the fighting window must expose `data-unit-motion="pressure"` and their unit transforms must change across adjacent combat timestamps, preventing static-piece behavior.
- 2026-06-10 r9 追加同步压力与相机门禁：`roman-core-compression` 必须与 `carthaginian-center-yield` 同步开始并在中段继续向凹袋压入；`carthaginian-center-hold` 必须保持在罗马核心东侧/正面外部；非洲两翼终点必须分别停在罗马核心南北外侧；浏览器层确认开场、凸阵、推进、凹袋、内折、后封、压缩、终局和结果九个阶段均无 console/API 失败，且阶段 bearing 按 12 度偏罗马后方到 -18 度侧后方斜视过渡。
- 2026-06-10 r9 added synchronized-pressure and camera gates: `roman-core-compression` must start with `carthaginian-center-yield` and keep pressing into the concavity mid-route; `carthaginian-center-hold` must remain east/front of the Roman core; African wing endpoints must stay outside the Roman north/south edges. Browser evidence confirms nine phases with no console/API failures, with camera bearing transitioning from a 12-degree Roman-rear-biased view to a -18-degree side-rear pitched view.
- 2026-06-10 r12 修正后封口与终局：重骑/努米底封后终点贴近罗马压缩核心后肩，`rear-seal` 与 `encirclement-compression` 的 melee 特效绑定到真实可见单位；Paullus marker 推迟到 14:50 后作为终局标识出现，不再全程单独移动；单位徽章移除文字，只保留小型阵营色点，降低图标黑影和文字牌观感。
- 2026-06-10 r12 fixed rear closure and the endgame: heavy and Numidian rear-seal endpoints now close against the rear shoulders of the compressed Roman body, and `rear-seal` / `encirclement-compression` melee effects bind to visible units. The Paullus marker appears only after 14:50 as an endgame marker instead of moving alone through the film. Unit badges no longer render text and keep only a small faction color dot, reducing dark-card and text-badge clutter.
- 2026-06-10 r17 追加首帧与相机包围盒门禁：部署事件必须包含罗马步兵和两翼骑兵，开场可见单位联合包围盒必须足够展开但不能被过紧相机裁切；后封口、压缩和终局采样必须保持主体在视窗核心。
- 2026-06-10 r17 added opening-frame and camera-envelope gates: the deployment event must include Roman infantry plus both cavalry wings, the opening visible-unit union must be wide enough without being cropped by an over-tight camera, and rear-seal/compression/endgame samples must keep the battle mass in the tactical core.
- 2026-06-10 r17 修正开场与后段相机：交互最小缩放从 `0.9` 降到 `0.46`，避免部署全景被 `scale=0.5` 后又强行放大裁切；后封口、压缩和终局相机改按可见单位包围盒核心重新居中，避免只盯事件点导致主体偏边。
- 2026-06-10 r17 fixed opening and late-stage camera behavior: the interaction minimum zoom was lowered from `0.9` to `0.46`, so the wide deployment camera is no longer forced back into a cropped close view. Rear-seal, compression, and endgame centers now follow the visible unit envelope instead of only the event point.
- 2026-06-10 r17 调整图标显示层：运行时仍使用已记录来源的 0 A.D. 加工资产，但 Cannae marker 的显示缩放降为 `0.62`，去掉额外饱和/亮度/对比滤镜，改用轻量阴影，先解决地图尺度下头像贴纸过大、黑块感和拥挤问题。
- 2026-06-10 r17 adjusted the marker rendering layer: runtime assets still use the documented 0 A.D.-derived source set, but Cannae markers now render at `0.62` scale, remove the extra saturation/brightness/contrast filter, and use a lighter shadow, reducing oversized portrait-card, dark-cluster, and crowding artifacts at map scale.
- 百度图片和其他素材站可作为候选发现渠道，但不能作为无记录的运行时替换来源。若后续改用百度发现的 Cannae 图标，必须保存原始 URL、本地源图路径、下载/加工脚本、许可状态或不确定性，并在公开发布前替换为许可明确的素材或按许可证处理。
- Baidu Images and other asset sites may be used as candidate-discovery channels, but they cannot become untracked runtime replacements. If a future Cannae icon uses a Baidu-discovered source, the original URL, local source path, download/processing script, license status or uncertainty, and public-release handling must be documented.
- 2026-06-10 r18 已采用 Baidu 候选图作为 Cannae 本地运行时素材链，并在 `docs/sources/cannae-battle.md` 与 `docs/sources/unit-icons.md` 记录直链、本地路径、许可不确定性和公开发布限制。
- 2026-06-10 r18 adopted Baidu candidates as the Cannae local runtime source chain and recorded direct URLs, local paths, license uncertainty, and public-release limits in `docs/sources/cannae-battle.md` and `docs/sources/unit-icons.md`.

## 视觉证据

## Visual Evidence

截图和指标已保存到：

Screenshots and visual metrics were saved to:

- `artifacts/cannae-rebuild-20260609-r7/00-deployment.png`
- `artifacts/cannae-rebuild-20260609-r7/01-convex.png`
- `artifacts/cannae-rebuild-20260609-r7/02-advance.png`
- `artifacts/cannae-rebuild-20260609-r7/03-cavalry-clearance.png`
- `artifacts/cannae-rebuild-20260609-r7/04-concave-pocket.png`
- `artifacts/cannae-rebuild-20260609-r7/05-wing-turn.png`
- `artifacts/cannae-rebuild-20260609-r7/06-rear-seal.png`
- `artifacts/cannae-rebuild-20260609-r7/07-compression.png`
- `artifacts/cannae-rebuild-20260609-r7/08-paullus.png`
- `artifacts/cannae-rebuild-20260609-r7/visual-metrics.json`
- `artifacts/cannae-rebuild-20260610-r4/07-compression.png`
- `artifacts/cannae-rebuild-20260610-r4/08-paullus.png`
- `artifacts/cannae-rebuild-20260610-r4/09-result.png`
- `artifacts/cannae-rebuild-20260610-r4/visual-metrics.json`
- `artifacts/cannae-rebuild-20260610-r7/00-deployment.png`
- `artifacts/cannae-rebuild-20260610-r7/01-contact.png`
- `artifacts/cannae-rebuild-20260610-r7/02-cavalry-clearance.png`
- `artifacts/cannae-rebuild-20260610-r7/03-concave-pocket.png`
- `artifacts/cannae-rebuild-20260610-r7/04-wing-turn.png`
- `artifacts/cannae-rebuild-20260610-r7/05-rear-seal.png`
- `artifacts/cannae-rebuild-20260610-r7/06-compression.png`
- `artifacts/cannae-rebuild-20260610-r7/07-paullus.png`
- `artifacts/cannae-rebuild-20260610-r7/08-result.png`
- `artifacts/cannae-rebuild-20260610-r7/visual-metrics.json`
- `artifacts/cannae-rebuild-20260610-r9/0600-deployment.png`
- `artifacts/cannae-rebuild-20260610-r9/0705-convex.png`
- `artifacts/cannae-rebuild-20260610-r9/0945-roman-pressure.png`
- `artifacts/cannae-rebuild-20260610-r9/1045-concavity.png`
- `artifacts/cannae-rebuild-20260610-r9/1245-wing-turn.png`
- `artifacts/cannae-rebuild-20260610-r9/1320-rear-seal.png`
- `artifacts/cannae-rebuild-20260610-r9/1405-compression.png`
- `artifacts/cannae-rebuild-20260610-r9/1510-paullus.png`
- `artifacts/cannae-rebuild-20260610-r9/1600-result.png`
- `artifacts/cannae-rebuild-20260610-r9/visual-audit.json`
- `artifacts/cannae-rebuild-20260610-r12/00-deployment.png`
- `artifacts/cannae-rebuild-20260610-r12/01-convex.png`
- `artifacts/cannae-rebuild-20260610-r12/02-roman-contact.png`
- `artifacts/cannae-rebuild-20260610-r12/03-cavalry-clearance.png`
- `artifacts/cannae-rebuild-20260610-r12/04-concavity.png`
- `artifacts/cannae-rebuild-20260610-r12/05-wing-turn.png`
- `artifacts/cannae-rebuild-20260610-r12/06-rear-seal.png`
- `artifacts/cannae-rebuild-20260610-r12/07-compression.png`
- `artifacts/cannae-rebuild-20260610-r12/08-paullus.png`
- `artifacts/cannae-rebuild-20260610-r12/09-result.png`
- `artifacts/cannae-rebuild-20260610-r12/visual-audit.json`
- `artifacts/cannae-rebuild-20260610-r14/visual-audit.json`
- `artifacts/cannae-rebuild-20260610-r15/visual-audit.json`
- `artifacts/cannae-rebuild-20260610-r16/visual-audit.json`
- `artifacts/cannae-rebuild-20260610-r17/00-deployment.png`
- `artifacts/cannae-rebuild-20260610-r17/01-convex.png`
- `artifacts/cannae-rebuild-20260610-r17/02-roman-contact.png`
- `artifacts/cannae-rebuild-20260610-r17/03-cavalry-clearance.png`
- `artifacts/cannae-rebuild-20260610-r17/04-concavity.png`
- `artifacts/cannae-rebuild-20260610-r17/05-wing-turn.png`
- `artifacts/cannae-rebuild-20260610-r17/06-rear-seal.png`
- `artifacts/cannae-rebuild-20260610-r17/07-compression.png`
- `artifacts/cannae-rebuild-20260610-r17/08-paullus.png`
- `artifacts/cannae-rebuild-20260610-r17/09-result.png`
- `artifacts/cannae-rebuild-20260610-r17/visual-audit.json`

指标显示 9 个阶段均无浏览器控制台错误；MapLibre 相机 pitch 为 56；开场可见单位 96/124，罗马部署、迦太基中军、非洲两翼和 Hannibal 指挥均在视窗内；推进、骑兵清场、内折、后封口、压缩和终局阶段可见单位分别约 250、316、249、169、223、274；所有带 melee 的阶段特效距离最近可见单位约 18-111px，未回到空地特效；字幕 text-shadow 为 `none`。

Metrics show no browser console errors across nine sampled phases. The MapLibre camera pitch is 56. The opening deployment has 96 of 124 rendered units visible, with Roman deployment, Carthaginian center, African wings, and Hannibal command all inside the viewport. The advance, cavalry-clearance, wing-turn, rear-seal, compression, and endgame phases show roughly 250, 316, 249, 169, 223, and 274 visible units. Melee effects are about 18-111px from the nearest visible units instead of empty terrain, and subtitle text-shadow is `none`.

2026-06-10 终局复核指标显示：14:00 压缩阶段罗马完整核心仍有 90 个单位；15:00 Paullus 终局只剩 27 个罗马破碎残部加 1 个 Paullus 指挥标识；16:00 结果阶段罗马单位 marker 数量为 0，Paullus 终局点和“罗马组织崩溃区”结果点均可见。

The 2026-06-10 final-stage recheck shows 90 Roman units in the 14:00 compression phase, only 27 broken Roman remnants plus 1 Paullus command marker at 15:00, and 0 Roman unit markers at the 16:00 result stage. Both the Paullus outcome point and the Roman organizational-collapse result point are visible.

2026-06-10 r7 复核指标显示：9 个阶段均无浏览器控制台错误和 API 失败；单位可见率为 0.99-1.00；中段凹袋/两翼内折 `centerXRatio` 回到 0.45-0.48，后封口/压缩/终局为 0.61-0.68；后封口、两翼内折和压缩阶段 `carthInsideRomanCore=0`，没有再把迦太基单位渲染到罗马核心内部。

The 2026-06-10 r7 recheck shows no browser console errors or API failures across nine phases; unit visibility is 0.99-1.00; the concave-pocket and wing-turn phases are back near the visual core with `centerXRatio` 0.45-0.48, while rear-seal/compression/endgame are 0.61-0.68. Rear-seal, wing-turn, and compression phases report `carthInsideRomanCore=0`, so Carthaginian units no longer render inside the Roman core.

2026-06-10 r9 复核指标显示：9 个阶段均无浏览器控制台错误和请求失败；开场和凸阵阶段 bearing=12、pitch=56、单位可见率 1.00，罗马左右骑兵、迦太基中军、非洲两翼和 Hannibal 指挥均同屏；10:45 后 bearing=-18、pitch=56，罗马核心压缩 90 个单位、迦太基中军保持 42 个单位、非洲两翼各 24 个单位和后封口骑兵均保持可见；16:00 结果阶段单位 marker 清空。

The 2026-06-10 r9 recheck shows no browser console errors or request failures across nine phases. Deployment and convex-center stages use bearing 12, pitch 56, and unit visibility 1.00, keeping Roman cavalry, the Carthaginian center, African wings, and Hannibal command in frame. From 10:45 onward the view uses bearing -18 and pitch 56; 90 Roman compression units, 42 Carthaginian center-hold units, 24 units per African wing, and rear-seal cavalry remain visible. At 16:00 all unit markers are cleared for the result state.

2026-06-10 r12 复核指标显示：10 个阶段均无浏览器控制台错误；后封口阶段 288 个单位、压缩阶段 336 个单位、Paullus 终局阶段 226 个单位均全部在视窗内；后封口/压缩阶段 `carthInsideRoman=0`，不再把迦太基单位放进罗马压缩核心；后封口特效距离最近单位约 17-19px，压缩特效约 7-52px，终局特效约 13px；16:00 结果阶段只保留 44 个罗马破碎残部，迦太基 marker 清空。

The 2026-06-10 r12 recheck shows no browser console errors across ten phases. Rear-seal, compression, and Paullus phases render 288, 336, and 226 units respectively, all inside the viewport. Rear-seal and compression report `carthInsideRoman=0`, so Carthaginian markers are no longer placed inside the compressed Roman core. Rear-seal effects are about 17-19px from the nearest unit, compression effects about 7-52px, and the endgame effect about 13px. At 16:00 only 44 broken Roman remnants remain and Carthaginian markers are cleared.

2026-06-10 r17 复核指标显示：10 个阶段均无浏览器控制台错误和请求失败；开场渲染 355 个单位，联合包围盒 `centerXRatio≈0.506`、`widthRatio≈0.939`，说明全景部署已展开且未被过紧相机裁切；凸阵阶段 `widthRatio≈0.841`；后封口、压缩和 Paullus 终局的主体中心分别约为 `0.575`、`0.558`、`0.562`，均回到战术视窗核心；16:00 结果阶段单位 marker 为 0。

The 2026-06-10 r17 recheck shows no browser console errors or request failures across ten phases. The opening renders 355 units with a visible-unit union of `centerXRatio≈0.506` and `widthRatio≈0.939`, so the wide deployment view is spread out without camera cropping. The convex stage has `widthRatio≈0.841`. Rear-seal, compression, and Paullus endgame center ratios are about `0.575`, `0.558`, and `0.562`, keeping the battle mass in the tactical viewport core. At 16:00 the result state has 0 unit markers.

2026-06-10 r18 复核证据保存到 `artifacts/cannae-rebuild-20260610-r18/`：`00-deployment.png`、`01-convex.png`、`02-roman-contact.png`、`03-cavalry-clearance.png`、`04-concavity.png`、`05-wing-turn.png`、`06-rear-seal.png`、`07-compression.png`、`08-paullus.png`、`09-result.png` 和 `visual-audit.json`。10 个阶段均无浏览器控制台错误和请求失败；开场渲染 397 个单位，迦太基重骑与努米底骑兵各 21 个单位从 06:00 即可见，避免后续突然出现；开场联合包围盒 `centerXRatio≈0.540`、`widthRatio≈1.006`，凸阵阶段 `widthRatio≈0.934`，后封口/压缩/Paullus 终局主体中心分别约为 `0.612`、`0.610`、`0.616`；`data-music-loop-end=164`，避开原曲后段掌声；16:00 结果阶段单位 marker 为 0。

The 2026-06-10 r18 evidence is saved under `artifacts/cannae-rebuild-20260610-r18/`: `00-deployment.png`, `01-convex.png`, `02-roman-contact.png`, `03-cavalry-clearance.png`, `04-concavity.png`, `05-wing-turn.png`, `06-rear-seal.png`, `07-compression.png`, `08-paullus.png`, `09-result.png`, and `visual-audit.json`. All ten phases have no browser console errors or request failures. The opening renders 397 units; Carthaginian heavy cavalry and Numidian cavalry each render 21 visible units from 06:00, preventing later pop-in. The opening visible-unit union is `centerXRatio≈0.540`, `widthRatio≈1.006`; the convex stage has `widthRatio≈0.934`; rear-seal, compression, and Paullus endgame center ratios are about `0.612`, `0.610`, and `0.616`. `data-music-loop-end=164` avoids the applause section in the source recording. At 16:00 the result state has 0 unit markers.

## 已验证 / 已重新验证

## Verified / Re-verified

- `git diff --check`
- `npm exec tsc -- -b`
- `npm run build`
- `npm run preview:local -- --skip-build`
- `FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "cannae battle rebuild shows pitched double envelopment with readable ancient units"`
- `FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "campaign data quality gates"`
- `FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "gaixia ambush uses terrain map ten-sided formations and pipa score"`
- `FRONTEND_URL=http://127.0.0.1:5177 npm exec playwright -- test tests/battle-france-smoke.spec.ts -g "nianzhuang battle shows Huang Baitao pocket relief blocking trenches and final pursuit"`
- `node /Users/asukarei/.codex/skills/animation-assistant/scripts/check-animation-project.mjs /Users/asukarei/Desktop/war-animation-lab-oss`

## 仍需人工判断

## Remaining Human Review

本轮已经通过结构、数据、视觉指标和参考动画回归门禁，但动画最终是否达到用户对垓下/碾庄同级或更高的观感标准，仍应以本地 5177 页面和 artifacts 截图的人工审看为准。

The rebuild passes structural, data, visual-metric, and reference-animation regression gates. Final acceptance against the user's Gaixia/Nianzhuang-level visual standard should still be based on manual review of the local 5177 page and the saved artifact screenshots.
