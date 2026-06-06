# 战争动画藏书馆更新说明

War Animation Library Update Notes

更新时间：2026-05-27

Updated: 2026-05-27

本轮推送包含三条主线：新增 `淮海战役：碾庄圩围歼战`，新增并打磨 `HX 229 / SC 122：大西洋狼群战`，以及把 `韩信十面埋伏：垓下之战` 从概念性包围图细化成可复盘的冷兵器战术动画。

This push has three main threads: adding `Huaihai Campaign: Nianzhuang Encirclement`, adding and refining `HX 229 / SC 122: Atlantic Wolfpack Battle`, and turning `Han Xin's Ten-Sided Ambush: Battle of Gaixia` from a conceptual encirclement diagram into a replayable cold-weapon tactical animation.

## 淮海战役：碾庄圩围歼战

## Huaihai Campaign: Nianzhuang Encirclement

新增一部解放战争动画，聚焦淮海战役第一阶段黄百韬第七兵团在碾庄圩被围歼的战斗。范围已明确校正为“黄百韬碾庄圩”，不是第二阶段双堆集黄维战役。

This adds a Chinese Civil War animation focused on the first phase of the Huaihai Campaign, where Huang Baitao's 7th Army Group was encircled around Nianzhuang. The scope is explicitly corrected to Huang Baitao at Nianzhuang, not the later Shuangduiji/Huang Wei phase.

### 动画内容

### Animation Content

- 表现 1948-11-06 傍晚华野向徐州东侧新安镇地区发起作战。
- 表现 1948-11-07 清晨黄百韬兵团撤离新安镇并向徐州方向收缩。
- 表现黄兵团西撤进入碾庄圩后转换为防御圈，而不是突然出现守军。
- 表现 1948-11-11 固守待援：黄百韬接令就地抵抗，同时邱清泉、李弥由徐州东援。
- 表现徐东阻援：邱李东援路线从徐州出发，止于大许家/先头受阻区域，不穿过阻援线抵达碾庄。
- 表现 1948-11-15 起对壕近迫：西、北、南、东四条短线向碾庄防御圈推进。
- 表现 1948-11-19 10:00 周家寨总攻令、当晚 22:00 突破第一道防线、21日至22日内核压缩和倪庄终局。

English summary: the animation covers the 1948-11-06 opening operation, Huang Baitao's withdrawal, the Nianzhuang defensive pocket, Xuzhou relief attempts stopped near Daxujia, trench approaches after 1948-11-15, and the final 1948-11-19 to 1948-11-22 assault and endgame.

### 战术和视觉修正

### Tactical and Visual Fixes

- 使用更大的碾庄圩战区视窗，覆盖徐州、东援轴线、大许家阻援线、新安镇撤退线、碾庄内核和倪庄终局点。
- 三次放大碾庄专用 SVG 画布到 `4800x2880`，同时把阶段相机收紧到有效作战区；图标回调到可读尺寸，避免“地图很大但战斗仍是一小团”或“图标小到看不清”。
- 地图改为浅色江淮平原底色，直接绘制防御地域、徐东阻援地域、村落水塘密集区、运河水网、陇海铁路/公路轴线，不再使用黑底或嘈杂地形图。
- 作战单位保持来源路线：华野追击、黄兵团撤退、碾庄防御圈、徐州东援、阻援集团、对壕部队、炮兵、总攻部队和倪庄追击都有连续路线。
- 作战效果绑定双方路线：阻援炮火、总攻炮火、第一道防线突破和内核压缩都绑定当前可见路线，不在无单位位置爆炸。
- 单位语义更清晰：未到终局或明确交接前不突然消失；已完成路线保留为彩色战役轨迹，不用灰影表达“消灭”。
- 基本战术单位口径进一步明确：华野以纵队表示外层包围和攻坚方向，黄兵团以师级固定守点表示核心防御；圈外侧后部队被分割另行交代，不再把全部兵力画成一个大圈。
- 新增华野外层包围圈和固定纵队包围点，包围圈位于黄兵团防御圈之外；早期试攻、对壕和总攻路线从外层来源线进入，不再穿进黄兵团内部后才发生战斗。
- 黄兵团防御阶段改为固定坐标、固定朝向的师级单位，避免布防像“走马灯”；第一道防线突破后外圈守点交接为师级阵地收缩破裂和最后内核防御。
- 新增外围试攻/相持段：大兴庄、大宋庄、彭庄、鲁楼梁庄、前板桥、徐井洼等节点，使 11月13日前后的仓促试攻、相持、转入对壕近迫之间有可见因果。
- 防御圈从单一围线改为第一道村落防线、第二道内围防线、最后内核三层，国军单位标注到第25、第44、第63、第64、第100军和黄百韬兵团部。

English summary: the tactical map now covers the full Nianzhuang operating area, keeps unit routes continuous, binds effects to active routes, clarifies PLA/Nationalist force semantics, and replaces a single defensive ring with layered village, inner, and final-core defensive lines.

### 碾庄圩门禁

### Nianzhuang Gates

- 碾庄圩数据必须使用 1948-11-06 至 1948-11-22 时间轴。
- `hold-and-relief` 必须同时引用黄兵团防御圈、徐州东援和阻援线。
- `preliminary-attacks` 必须存在，且早期攻坚路线必须覆盖多个华野纵队和村落阵地，不允许跳过试攻受挫直接进入总攻。
- 徐州东援必须从徐州出发，并停止在碾庄以西的大许家/受阻区域。
- 对壕路线必须在 1948-11-15 之后出现。
- 总攻必须锚定 1948-11-19 10:00，第一道防线突破必须锚定 1948-11-19 22:00。
- 终局必须显示黄百韬残部向倪庄逃散和华野追击线。
- 动画文本不得误写为双堆集或黄维。
- 碾庄画布必须保持 `4800x2880`；单位图标必须通过可读尺寸门禁，防止图标过小看不清、图标过大遮住战术关系或地图过小再次回归。
- 黄兵团防御单位必须至少到师级固定坐标，华野包围圈必须独立可见，第一道/第二道防线突破后必须按时间隐藏旧完整防线。

English summary: gates enforce the correct timeline, correct battle scope, blocked Xuzhou relief, visible preliminary attacks, trench timing, final assault anchors, Nizhuang endgame, readable canvas/icon sizing, and staged defensive-line visibility.

## HX 229 / SC 122：大西洋狼群战

## HX 229 / SC 122: Atlantic Wolfpack Battle

新增一部二战大西洋潜艇战动画，聚焦 1943 年 3 月中大西洋空隙中的 HX 229 / SC 122 双船队战斗。

This adds a World War II Atlantic submarine-war animation focused on the March 1943 HX 229 / SC 122 convoy battle in the Mid-Atlantic air gap.

### 动画内容

### Animation Content

- 表现 HX 229 与 SC 122 两支船队持续东航，而不是静态目标点。
- 表现 Raubgraf、Sturmer、Dranger 等狼群从不同方向收拢。
- 加入 U-653 / U 艇接触 HX 229、U-338 发现 SC 122、两夜鱼雷攻击、护航舰反潜、VLR Liberator 进入空隙边缘、U-384 被 RAF Fortress 深弹击沉、德方终止攻击等节点。
- U-384 使用独立连续航迹，从狼群线、攻击区域到 1943-03-19 17:45 击沉点；击沉后隐藏单位，保留航迹。

English summary: the animation shows both convoys moving east, multiple wolfpacks converging, contact and torpedo attack events, escort ASW, VLR Liberator air cover, U-384's sinking, and Germany ending the attack.

### 视觉和战术修正

### Visual and Tactical Fixes

- 放大潜艇战作战区镜头，让船队、狼群、护航舰和反潜飞机在同一战术区域内可读。
- 修复潜艇和舰船忽隐忽现问题：不沉、不脱离就持续在线；跨路线段用连续航迹交接。
- 修复攻击效果和目标脱节：鱼雷/深弹效果绑定实时目标航迹，不再让爆点停在旧坐标。
- 取消潜艇战集火攻击线：潜艇战不使用跨屏舰炮齐射线，只保留局部鱼雷命中和深弹爆震。
- 反潜飞机采用短任务生命周期：进入、接触、攻击/压制、返航或离场，航迹保留但飞机不长期悬停。

English summary: the camera is tightened around the convoy/wolfpack fight, ships and submarines stay visible unless sunk or departed, attack effects bind to live targets, naval salvo lines are removed, and ASW aircraft use short sortie lifecycles.

### 潜艇战门禁

### Submarine-War Gates

- 潜艇战没有 `.salvo-shell-trace`。
- U-384 有连续航迹并在击沉后合理隐藏单位。
- 船队、护航舰、U 艇不在未沉没时消失。
- 攻击效果必须绑定目标路线。
- 海上路线不得穿陆。

English summary: gates prevent inappropriate salvo traces, require U-384 continuity and correct disappearance after sinking, keep unsunk units visible, bind effects to target routes, and prevent sea routes from crossing land.

## 韩信十面埋伏：垓下之战

## Han Xin's Ten-Sided Ambush: Battle of Gaixia

垓下之战做了一次战术级重构。目标不是让地图更热闹，而是让观众能看清冷兵器战场中的阵形、拉扯、封锁、突围和追击因果。

Gaixia received a tactical reconstruction. The goal was not to make the map busier, but to make cold-weapon formations, pressure, blocking, breakout, and pursuit causality readable.

### 更大的战术地图

### Larger Tactical Map

- 垓下专用 SVG 战场画布扩展为 `1180x2816`，承载营垒、河汊、低地、东口通道、阴陵追击道等多层地形。
- 地形不再依赖嘈杂底图，而是直接绘制山脊、缓坡、低地、旧河汊、通道和河流。
- 默认镜头改为横屏战术视窗，按事件自动居中到作战核心区，打开动画后不需要先手动拖到战场。

English summary: Gaixia now uses a larger dedicated tactical SVG battlefield, directly draws terrain features and routes, and opens with an event-centered widescreen tactical viewport.

### 冷兵器阵形和战术拉扯

### Cold-Weapon Formations and Tactical Pressure

- 楚军退入垓下后先成阵：中军、东侧骑兵屏卫、南侧步阵各自展开。
- 汉军不是静态围圈，而是西路步兵、北岸弩兵、东口弩网、东南骑兵、南路伏兵和中军指挥线分层压迫。
- 增加阵前拉扯：楚军外推，汉军后退稳住，再重新压回。
- 东口诱隙改为完整过程：汉骑假退、楚骑试探、汉弩骑反压。

English summary: Chu forces form before collapse, Han forces pressure in layers instead of as a static ring, and the eastern opening now shows feint, probe, and counter-pressure.

### 单位连续性和路线语义

### Unit Continuity and Route Semantics

- 未被消灭的单位不再忽隐忽现。
- 已完成路线不再整组变灰，避免被误读成“部队被消灭”；保留路线只轻微降噪，单位仍按当前战术状态保持彩色。
- 后续投入部队不再从地图中段突然出现：黎明北路、南路、西路和东南骑兵都从已有外线或伏兵线提前进入。

English summary: units no longer disappear without cause, completed routes remain as colored operational memory, and later-arriving forces originate from visible source routes instead of appearing in the middle of the map.

### 战斗效果对齐真实接触点

### Combat Effects Aligned to Real Contact Points

- 近战效果不再固定落在事件坐标上，而是计算当前事件中汉军与楚军可见单位的位置，放在双方接触中点。
- 夜间冲围受阻节点新增东口汉骑横截线，楚军前方有明确阻碍。
- 南侧阵线新增“汉南路贴住楚南口”和“楚南侧步阵被压回”，避免汉军压上后消失、楚军孤立停留。

English summary: melee effects now compute contact between visible Han and Chu units, night breakout has a blocking line, and the southern line shows pressure and withdrawal instead of isolated units.

### 追逃关系修正

### Pursuit Relationship Fixes

- 项羽主力退入路线在营阵成形后交接隐藏，不再让旧行军队列一直停在高地。
- 项羽小股突围线延长到阴陵/东城阶段，不再原地等汉军追上。
- 乌江终局新增项羽小股继续退走线，汉骑追击线保持在后方，表达“前方有项羽，后方有追兵”的追逃关系。

English summary: Xiang Yu's breakout and pursuit route now continues through the later stages, with Han cavalry following behind instead of the scene implying that the pursued unit is stationary or already caught.

### 垓下门禁

### Gaixia Gates

- 垓下地图默认填满战术视窗。
- 当前事件点位于地图核心区域。
- 已完成路线不整体灰化，保留单位仍保持彩色。
- 近战效果必须绑定可见汉军与楚军单位。
- 黎明合击部队必须早于事件从来源路线进入。
- 夜间冲围前方必须有汉军阻挡线。
- 乌江终局必须同时显示项羽小股退走线和汉骑追击线。
- 南侧旧楚军单位必须交接，新楚军回缩线和汉南路封锁线必须同时存在。

English summary: gates enforce viewport fill, active-event centering, colored completed routes, visible unit-bound melee effects, source-route arrivals, blocking lines, Wujiang pursuit, and southern-line handoff.

## 已验证

## Verified

- `npm run build`
- 垓下定向 Playwright 回归
- 大西洋潜艇战定向 Playwright 回归
- 数据质量门禁
- `npm run test:smoke`，23 项通过
- 动画项目健康检查
- `git diff --check`

The listed build, targeted Playwright regressions, data gates, smoke test suite, project health check, and diff check passed.

## 相关提交

## Related Commits

潜艇战：

Submarine-war commits:

- `5078fff` 新增大西洋潜艇战动画
- `7d526e8` 放大大西洋潜艇战作战区镜头
- `6ccf840` 修复大西洋潜艇连续航迹
- `d0650c0` 修正潜艇战攻击特效与脱离单位
- `58b4027` 取消潜艇战集火攻击线

垓下之战：

Gaixia commits:

- `e69fb73` 细化垓下十面埋伏战术动画
- `103cd5d` 优化垓下战场首屏与战术地图
- `78b7137` 修正垓下横屏战术视窗
- `8b6c0fb` 细化垓下战术地图与部队连续性
- `8026fd0` 修正垓下项军交接与追逃关系
- `03ec407` 修正垓下南侧阵线交接

碾庄圩围歼战：

Nianzhuang commits:

- 本次提交新增
  Added in this push.
