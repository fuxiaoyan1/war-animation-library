# 战争动画库工作交接文档

交接基线：`f1cc03c Expand war animation library and visuals`

交接时间：2026-05-17 08:07 CST

项目路径：本仓库根目录。

## 1. 当前状态

这是一个 Vite + React + TypeScript 的本地战争动画库。入口是“战争动画藏书馆”，所有动画都挂在同一页面内，通过顶部按钮或主页卡片切换。

已注册动画：

- 古代战争：亚历山大大帝征服史、三次布匿战争、大秦统一中国、凯撒大帝战争史、十字军东征、蒙古帝国征服史。
- 现代战争：拿破仑争战史、1940 德法战役、苏德战争全景、日美太平洋战争、抗美援朝、1991 年第一次海湾战争。

最近一次交付已经完成：

- 新增并接入多部战争动画。
- 抽出通用 `CampaignMapAnimation` 渲染器。
- 增加可拖拽、可滚轮平移、可按钮缩放、双击复位的地图交互。
- 引入写实单位图标，包括坦克、韩战坦克、航母、埃塞克斯级航母、飞机、F-86、步兵、志愿军步兵、骑兵、战车、大炮、战船。
- 修复字幕遮挡与拦截交互问题，旁白采用低高度半透明横向 ticker。
- 加强音频层：每部动画独立配乐，战役事件触发时代匹配 SFX。
- 增加 Playwright 回归测试，覆盖主页排序、地图交互、字幕、图标、音频、时间压缩和关键镜头可见性。

当前工作树在提交后是干净的。若接手时不是干净状态，先运行：

```bash
git status --short
git log --oneline -5
```

## 2. 运行与验证

常用命令：

```bash
npm install
npm run dev
npm run build
npm run test:smoke
```

`package.json` 中脚本：

- `npm run dev`：启动 Vite 开发服务，host 为 `127.0.0.1`。
- `npm run build`：先 `tsc -b`，再 `vite build`。
- `npm run preview`：预览生产构建。
- `npm run test:smoke`：运行 Playwright 烟测。

最近一次提交前验证结果：

- `npm run build` 通过。
- `npm run test:smoke` 通过，`11 passed`。
- 第一次烟测曾因为本机缺少 Playwright Chromium headless shell 失败，已通过 `npx playwright install chromium` 修复。

如 Playwright 报 `Executable doesn't exist at ... chromium_headless_shell`，先补浏览器缓存：

```bash
npx playwright install chromium
```

## 3. 目录结构

核心目录：

- `src/App.tsx`：动画路由与顶部切换按钮。
- `src/components/WarLibraryHome.tsx`：战争藏书馆主页与古代/现代分类。
- `src/components/*Animation.tsx`：每部动画的 wrapper，负责给通用渲染器传入数据、镜头、配乐、音效配置。
- `src/components/CampaignMapAnimation.tsx`：通用地图动画渲染器。
- `src/components/UnitIcon.tsx`：写实单位图标组件与图标尺寸/默认朝向配置。
- `src/data/*.ts`：每部动画的结构化历史数据。
- `src/lib/campaignTimeline.ts`：日历时间轴、BCE 日期、压缩时间轴。
- `src/lib/geoMap.ts`：地图投影、国家边界、视窗配置。
- `src/lib/useMapInteraction.ts`：地图滚轮、拖拽、缩放、复位交互。
- `src/lib/warScore.ts`：配乐与战役音效控制。
- `src/types/units.ts`：单位图标类型。
- `src/types/maps.ts`：历史区域类型。
- `src/styles.css`：全局视觉、地图、字幕、图标、控制区样式。
- `tests/battle-france-smoke.spec.ts`：当前全部烟测集中在这个文件。
- `docs/sources/*.md`：历史资料、音频、图标来源记录。
- `public/audio`：配乐与 SFX 资源。
- `public/assets/unit-icons`：处理后的单位图标。原始素材源目录未包含在开源导出中，来源和授权不确定性见 `docs/sources/unit-icons.md`。
- `public/assets/maps/qin-warring-states-map.svg`：大秦七国边界参考/叠层资产。

注意：`dist/`、`test-results/`、`artifacts/` 是运行或预览产物，不应纳入常规提交。

## 4. 数据模型

各动画数据基本复用 `src/data/battleOfFrance.ts` 中的类型。

关键类型：

- `MapPoint`：地图节点，包含 `id`、中文标签、经纬度、节点类型。
- `BattleEvent`：战役事件，包含日期、标题、地点、经纬度、阶段、摘要、详细说明、意义和 `mapFocus`。
- `FrontLine`：态势线，包含起止节点、起止日期、阵营、路线类型、单位图标、可见窗口和路径点。

`FrontLine` 的关键字段：

- `routeKind`: `"land" | "sea" | "air"`，用于区分陆上、海上、空中路线。
- `unitIcon`：覆盖默认单位图标，例如海湾战争空袭用 `fighter`，抗美援朝空战用 `sabre`。
- `waypoints`：给海路、远距离跨区路线添加中间点，避免路线穿陆地或穿过不合理区域。
- `visibleUntil`：整条旧态势线在某日期后消失，用于避免历史上已被反攻打断的旧箭头仍留在图上。
- `unitVisibleUntil`：仅移动单位图标提前消失，路线可短暂保留为背景。用于“失败方已被突破，不应继续站在突破点”的场景。

日期规则：

- 公元后使用 `YYYY-MM-DD`。
- 短战争/短会战可使用小时级 `YYYY-MM-DDTHH:mm`，例如对马海战用小时锚点展示 1905-05-27 到 1905-05-28 的舰队走位。
- 公元前使用 `BCE-YYYY-MM-DD`，不要用 JavaScript 原生负年份。
- 显示格式由 `src/lib/campaignTimeline.ts` 处理。

## 5. 通用渲染器职责

`CampaignMapAnimation` 负责：

- 播放、暂停、回放。
- 进度条拖拽和事件跳转。
- 当前事件、下一事件、右侧故事面板。
- 地图绘制、国家边界、历史区域、河流、地形、城市标签。
- 态势线进度插值。
- 单位图标沿路线推进。
- 战役效果：古代刀剑交锋、近现代爆炸/炮火。
- 战役音效：播放推进触发和事件点击触发。
- 背景配乐开关。
- 旁白字幕 ticker。
- 地图交互控件。

保持这个原则：新增动画优先写数据和 wrapper，不要复制一套渲染器。

## 6. 镜头和地图规则

镜头视窗定义在 `src/lib/geoMap.ts` 的 `viewports`。每个 wrapper 通过 `focusSteps` 传入进度到视窗的切换点。

常见视窗：

- 苏德战争：`easternOpening`、`easternVolga`、`easternSouth`、`easternStalingrad`、`easternCentral`、`easternBerlin`。
- 太平洋战争：`pacificWide`、`pacificPearl`、`pacificCentral`、`pacificSouth`、`pacificMarianas`、`pacificPhilippines`、`pacificJapan` 等。
- 抗美援朝：`koreaPeninsula`、`koreaSouth`、`koreaWestCoast`、`koreaNorth`、`koreaYalu`、`koreaCentral`、`koreaAirSea`。
- 大秦：`chinaWarringStates`、`chinaGuanzhong`、`chinaEast`。

重要规则：

- 多战区动画必须按事件所在战区切镜头，不能只用一个宽视图。
- 跨日期线战区，例如太平洋，使用太平洋中心投影策略，测试关键事件点是否落在地图核心区域。
- 临时切到旁支战区后必须显式切回主战区。例如凯撒从高卢切不列颠后，要给后续高卢事件单独回到高卢的镜头阶段。
- 手动平移/缩放在 `mapFocus` 改变时会自动复位，避免旧偏移污染后续自动镜头。

## 7. 地图交互规则

交互实现位于 `src/lib/useMapInteraction.ts`。

当前行为：

- 普通滚轮：只纵向平移地图。
- Shift + 滚轮或横向滚轮：只横向平移地图。
- 拖拽：横纵向平移地图。
- `+`、`-`、复位按钮：显式缩放和复位。
- Ctrl/⌘ + 滚轮：保留为可选缩放快捷方式，但不是主入口。
- 双击地图：复位视图。
- 默认缩放 `scale=1` 时也允许横向和纵向基础平移。

不要回退这些行为。之前用户明确反馈过：

- 苏德战争不是“切细节不够”，而是地图不能动，导致镜头跟不上。
- 普通滚轮不应导致横向移动。
- `Ctrl/⌘+滚轮只缩放` 不好用，必须有显式按钮。
- 所有地图必须支持左右移动，不能只上下移动。

回归测试中已有：

- `expectMapCanMoveUnderPointer`
- `expectMapCanMoveHorizontallyUnderPointer`
- `expectMapZoomButtonsWork`
- `expectTickerDoesNotBlockMapWheel`

## 8. 字幕与界面遮挡规则

用户明确要求旁白不能遮挡画面。当前规则：

- 字幕是地图底部低高度、半透明、横向 ticker。
- 字幕节点 `data-testid="narration-subtitle"`。
- CSS 必须保持 `pointer-events: none`，不能拦截滚轮、拖拽或点击。
- 底部控制区不能 sticky 覆盖地图。
- 详细叙事放右侧故事面板，地图上只保留短情报卡和短字幕。

修改字幕或控制区时必须跑：

```bash
npm run build
npm run test:smoke
```

## 9. 单位图标规则

图标类型定义在 `src/types/units.ts`，具体配置在 `src/components/UnitIcon.tsx`。

当前可用图标：

- `tank`：现代坦克。
- `tankKorean`：韩战时代坦克。
- `carrier`：现代/二战大型航空母舰，太平洋战争使用。
- `carrierEssex`：韩战时代埃塞克斯级航母。
- `fighter`：F-16 风格现代飞机，海湾战争空袭使用。
- `sabre`：F-86 Sabre 风格喷气机，抗美援朝空战使用。
- `infantry`：联合国军/钢盔步兵。
- `infantryPva`：志愿军棉服步兵。
- `cavalry`：骑兵。
- `chariot`：战车。
- `cannon`：大炮。
- `ship`：古代/中世纪战船。

硬性规则：

- 战车、战马、大炮、战船、航母、坦克、步兵都必须使用写实图标，不能退回抽象简笔画。
- 如果双方同兵种但形象差异明显，应使用阵营专属图标。抗美援朝中志愿军使用 `infantryPva`，联合国军使用 `infantry`。
- 图标必须保持水平，不随路线角度旋转。
- 图标只根据当前路线段左右方向镜像，方向应和态势线箭头一致。
- 宽主体不能压进正方形 marker，要在 `UnitIcon` 中设置合适的 `width` 和 `height`。
- 失败方被突破后可用 `unitVisibleUntil` 提前隐藏移动图标，避免画面上失败方仍站在被突破点。

素材来源和授权风险见 `docs/sources/unit-icons.md`。PNGIMG 来源为 CC BY-NC 4.0，仅适合当前本地非商业 demo。若要公开商业发布，必须替换 PNGIMG 派生图标。

## 10. 音频规则

音频控制在 `src/lib/warScore.ts`，音频来源在 `docs/sources/audio.md`。

规则：

- 每部动画应使用不同背景配乐，不能所有动画复用同一首。
- `musicSource` 必须暴露在可测试属性上，Playwright 会检查配乐不重复。
- 古代战斗用刀剑/冷兵器音效。
- 拿破仑时代用炮声。
- 现代战争用爆炸、炮火、飞机俯冲等。
- 空袭路线必须有飞机图标和航空音效，不能出现“天上飞坦克”。
- 事件点击也必须触发 SFX，不能只在自动播放时触发。
- `cueEvents` 应覆盖所有战斗、围城、登陆、强攻、渡河等军事事件；政治、继位、死亡、条约节点可静音。

音频素材注意：

- FiftySounds 曲目需要署名。
- 公版/CC0/Wikimedia 曲目需要保留来源、时长、码率或文件大小说明。
- 不要交付低质、单声道、留声机感强的配乐，除非用户明确要求档案感。

## 11. 时间轴与节奏规则

用户要求后续战争动画默认压缩到 5 分钟。wrapper 中设置：

```tsx
playbackDurationSeconds={300}
```

长跨度战争不能简单按完整日历比例播放，否则会出现大量空余时间。当前可用策略在 `createCampaignTimeline`：

- `timingMode="calendar"`：保留统一日历轴。适合苏德战争这类多线并进、多战场同时发生的战争。
- `timingMode="compressed"`：压缩非作战间歇。适合太平洋战争、布匿战争、拿破仑战争、海湾战争这类长跨度或节点稀疏动画。
- `activeSpans`：定义有效作战段。
- `inactiveGapDisplayDays`：非作战空档固定显示天数。
- `gapOverrides`：显式压缩某些谈判、停战或集结空档。
- `maxGapDays` 和 `gapScale`：长空档比例压缩。

特别注意：

- 太平洋战争瓜岛之后如果节奏拖、镜头不跟，通常要同时检查 `activeSpans`、`focusSteps` 和事件轨道间距。
- 海湾战争集结阶段不能停留过久，空袭阶段必须快速进入且使用飞机图标。
- 抗美援朝要严格按时间排序，避免联合国军还在向鸭绿江推进时志愿军已经到平壤这种时序冲突。

## 12. 大秦地图规则

用户对大秦地图多次反馈，重点不是“做成古风背景”，而是准确和统一：

- 不要用装饰墙纸或重复山纹替代历史地图。
- 保持系列通用地图/投影风格。
- 补的是战国七国边界和控制区域，不是另起一套孤立风格。
- 七国边界应像拼图一样共享边界，不要半透明区域互相重叠。
- 统一路线起点必须从秦国控制范围内出发，特别是咸阳。
- 如做更精确版本，应找可靠历史地图作参考，再重绘成同投影数据层。

当前相关文件：

- `src/data/qinUnification.ts`
- `src/components/QinUnificationAnimation.tsx`
- `public/assets/maps/qin-warring-states-map.svg`
- `docs/sources/qin-unification.md`

## 13. 新增动画流程

建议步骤：

1. 先查资料并写 `docs/sources/<campaign>.md`。
2. 新建 `src/data/<campaign>.ts`，包含 `mapPoints`、`frontLines`、`battleEvents`、`narrationCues`、必要的 `activeSpans`。
3. 若需要新视窗，在 `src/lib/geoMap.ts` 增加 viewport。
4. 新建 `src/components/<Campaign>Animation.tsx`，复用 `CampaignMapAnimation`。
5. 设置 `playbackDurationSeconds={300}`，除非用户明确要求不同片长。
6. 选择未被其他动画使用的高质量 `musicSource`，记录到 `docs/sources/audio.md`。
7. 按时代设置 `sfxProfile`、`unitIcon`、单条路线 `unitIcon` 和 `routeKind`。
8. 在 `src/App.tsx` 注册 `CampaignKey`、按钮标签和组件。
9. 在 `src/components/WarLibraryHome.tsx` 增加卡片，并按战争开始时间排序。
10. 在 `tests/battle-france-smoke.spec.ts` 增加或扩展 smoke，至少覆盖页面加载、5 分钟片长、关键镜头、图标、配乐唯一性和代表性事件音效。
11. 运行 `npm run build` 和 `npm run test:smoke`。

## 14. 测试覆盖重点

当前 smoke 不是只测德法战役，已覆盖整个战争库。主要覆盖：

- 主页古代/现代战争分类和顺序。
- 每部动画可加载。
- 片长或播放速度符合 5 分钟要求。
- 地图关键事件位于核心区域。
- 普通滚轮、横向滚轮/Shift、拖拽、缩放按钮、复位按钮有效。
- 字幕低高度、不拦截交互。
- 真实图标资源存在、路径正确、content-length 合理。
- 韩战飞机/航母/坦克/步兵时代匹配。
- 志愿军和联合国军步兵图标区分。
- 空袭使用飞机而非坦克。
- 背景配乐不重复。
- 事件点击触发对应音效。
- 压缩时间轴下后半段不出现大段死时间。

改动后不要只手动看页面，必须跑自动化。若只改文档可不跑 Playwright，但提交前至少确认 `git diff --check`。

## 15. 已知风险与债务

素材授权：

- 部分图标来自 PNGIMG，许可为 CC BY-NC 4.0，只适合本地非商业 demo。
- 若要公开发布或商业化，优先替换 PNGIMG 派生素材。

包体大小：

- 音频和源图较多，仓库体积会上升。
- 当前没有做按动画懒加载，Vite 构建会有大 chunk 警告。若后续动画继续增多，应考虑 `React.lazy` 或路由级 code splitting。

测试组织：

- 所有 smoke 目前集中在 `tests/battle-france-smoke.spec.ts`，文件较长。
- 后续可拆成 `home.spec.ts`、`map-interaction.spec.ts`、`audio.spec.ts`、`campaigns/*.spec.ts`。

地图精度：

- 大秦七国边界仍有继续精修空间。后续如用户继续要求精确，应基于可靠历史地图重新校准边界点。
- 太平洋跨日期线投影已处理，但任何新增太平洋岛链事件都要检查经度是否使用一致的 0-360 表示。

历史严谨性：

- 当前是教学演示级，不是史学数据库。
- 新增或修改事件时必须同步补来源文档，避免“画面做完但出处不可追溯”。

## 16. 不要回退的用户偏好

这些是用户多轮明确反馈后的稳定要求：

- 不要让字幕遮挡画面；使用半透明横向滚动字幕。
- 地图必须能滚轮上下移动、横向移动、拖拽移动，并有显式缩放按钮。
- 不要把缩放主要绑定到 Ctrl/⌘ + 滚轮。
- 图标要写实，不要抽象简笔画。
- 图标要根据路线方向智能左右镜像，并保持水平，不能侧立或倒立。
- 空袭必须用飞机图标。
- 太平洋战争要分段镜头，瓜岛后不能大段空转。
- 大秦地图要统一系列风格，但要补准确七国边界，不要特殊丑背景。
- 所有新战争动画默认 5 分钟。
- 短战争仍默认 5 分钟，但不要按周跑；用小时/天粒度和近景战场视窗，确保战术走位而不是大范围地理被看清。
- 同一系列中每部动画应使用不同战争配乐。
- 战役音效要覆盖代表性战斗事件，不能有的战役有声、有的无声。
- 失败方被突破后，其移动单位图标可以消失，避免画面混乱。
- 对马海战经验：战术复杂的海峡会战应把视窗收紧到主战场，以近代 `warship` 写实图标表达舰队航向；俄舰队主力受创和残部投降后用 `unitVisibleUntil` 隐藏失败单位。路线不要简化成“日军尾随俄军追击”，而要按资料拆成侦察接触、东乡回头转向、第一合战、俄前导/旗舰失控、第二合战、夜间鱼雷攻击、拂晓包围投降等战术段。短海战开场必须立即有舰队行动，清晨侦察背景不要占据实际播放空窗；东乡转向时俄舰队不得已经越过日舰航线。
- 近代海战图标经验：`warship` 不要用设计舰船俯视图或技术蓝图，优先用航行态侧视战舰图，保持宽幅比例，作为水平地图标记只左右镜像。
- 首页入口经验：战争数量增加后，全局顶/底部不要继续堆战争导航；首页卡片承担入口，全局区域可改成固定题铭。卡片进入动画后要 `scrollTo(0,0)`，否则从首页下部入口打开会保留滚动位置，导致地图在视口上方、鼠标滚轮/拖拽命中失败。
- 装饰图层经验：新增 SVG 装饰区必须配套 scoped CSS。`terrainZones` 这类椭圆如果只给 class 不写样式，会按 SVG 默认黑色填充，形成遮挡地图的大黑块；需要显式设置 `fill/stroke/opacity` 或直接移除。

## 17. 提交建议

常规提交前：

```bash
git status --short
git diff --check
npm run build
npm run test:smoke
```

如果新增大资源：

- 检查是否误加 `artifacts/`、`dist/`、`test-results/`。
- 用 `file` 检查下载的图片源文件，避免把 403/404 HTML 页面伪装成 `.png` 提交。
- 确认来源写进 `docs/sources/`。

推荐提交粒度：

- 新增一部动画：数据、wrapper、来源、测试、必要资源放同一提交。
- 通用渲染器改动：单独提交，测试覆盖所有已注册动画。
- 纯素材替换：说明来源、许可和替换原因。

## 18. 快速接手清单

接手者先做这几件事：

1. 运行 `git status --short`，确认工作树是否干净。
2. 运行 `npm run build`，确认 TypeScript 和生产构建通过。
3. 运行 `npm run test:smoke`，确认浏览器环境可用。
4. 阅读 `src/components/CampaignMapAnimation.tsx`、`src/lib/useMapInteraction.ts`、`src/components/UnitIcon.tsx`。
5. 阅读要改动画对应的 `src/data/*.ts` 和 `docs/sources/*.md`。
6. 修改数据优先，除非确实是通用渲染能力不足。
7. 修改后补测试，再提交。
