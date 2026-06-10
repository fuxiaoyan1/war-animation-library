# 坎尼会战动画资料 / Battle of Cannae Animation Sources

## 资料边界 / Source Boundary

本动画是战术教学复原，不是逐队考古级测绘。战场采用意大利普利亚奥凡托河（古 Aufidus）平原的地理口径，具体军阵朝向以“罗马纵深压入、汉尼拔中军由凸转凹、两翼骑兵清场、非洲重步兵内折、骑兵封后”的史料逻辑为准。现代地图和 Commons 示意图只作构图参考，不直接当成事实底图。

This animation is a tactical teaching reconstruction, not an archaeological survey. It uses the Ofanto/Aufidus river plain in Apulia as the geographic frame. The battle geometry follows the source logic: the Roman mass pushes in, Hannibal's center changes from convex to concave, cavalry clears both wings, African heavy infantry turns inward, and cavalry seals the rear. Modern maps and Commons diagrams are composition references only.

## 主要来源 / Main Sources

- Polybius, `Histories`, Book 3: <https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Polybius/3*.html>
  - 用于部署、汉尼拔中军凸形前出、非洲步兵分置两端、骑兵优势、罗马步兵被压入后合围等核心叙事。
  - Used for deployment, Hannibal's convex center, African infantry on both ends, cavalry superiority, and the Roman infantry mass being enclosed.
- Livy, `Ab Urbe Condita`, Book 22: <https://www.perseus.tufts.edu/hopper/text?doc=Liv.+22.44>
  - 用于罗马纵深、河岸/侧翼限制、骑兵与执政官 Paullus 终局等叙事补充。
  - Used for Roman depth, river/flank constraints, cavalry fighting, and the Paullus endgame.
- Encyclopaedia Britannica, `Battle of Cannae`: <https://www.britannica.com/event/Battle-of-Cannae>
  - 用于现代综述、奥凡托河平原和双重包围口径。
  - Used as a modern reference for the Ofanto plain and the double-envelopment interpretation.
- World History Encyclopedia, `Battle of Cannae`: <https://www.worldhistory.org/Battle_of_Cannae/>
  - 用于阶段拆分、双方兵种和战术解释的二手核对。
  - Used as a secondary check for phases, troop types, and tactical interpretation.
- Wikimedia Commons, `Maps of the Battle of Cannae`: <https://commons.wikimedia.org/wiki/Category:Maps_of_the_Battle_of_Cannae>
  - 只作为不同复原图的构图参考；本动画不直接复用其中地图文件。
  - Used only as diagram-reference context; no Commons battle map is directly reused.
- OpenStreetMap: <https://www.openstreetmap.org/>
  - 用于现代奥凡托河、坎尼遗址/周边地名的大致地理参照。
  - Used for modern river and place-name orientation around the Ofanto and Cannae area.

## 建模取舍 / Modeling Choices

- 片长固定 5 分钟，`playbackDurationSeconds = 300`。
  Runtime is fixed at five minutes through `playbackDurationSeconds = 300`.
- 时间轴使用 216 BCE 8 月 2 日的小时级锚点，从清晨部署到下午崩溃。古代史料没有逐分钟记录，小时点是动画节奏与战术阶段映射。
  The timeline uses hour-level anchors on 2 August 216 BCE, from morning deployment to afternoon collapse. Ancient sources do not provide minute-level timing; the hour marks map source-backed phases into animation pacing.
- 战斗是定点阵法会战，不是大范围运动战；镜头应紧贴中军接触、骑兵清场、翼侧内折、后口封闭和压缩崩溃。
  This is a fixed-position formation battle, not a broad campaign. Camera stages stay on center contact, cavalry clearance, inward wing turns, rear closure, and compression/collapse.
- 罗马阵形采用深纵队块表示，开场先从多列进入战场再压成厚实中军，避免首帧就完整静态列阵。
  The Roman formation is a deep block. It deploys into the field first, then thickens into the center instead of starting as a fully completed array.
- 迦太基中军先呈凸月形前出，再在罗马压力下逐步后退成凹袋；该形变是动画核心。
  The Carthaginian center begins as a convex arc and yields into a concave pocket under Roman pressure; this transformation is the visual core.
- 非洲重步兵初期放在两端/后拒位置，直到罗马压入后才内折，避免过早剧透最终包围。
  African heavy infantry sits on the ends/refused positions at first and turns inward only after the Roman mass pushes in, avoiding early spoiler geometry.
- 骑兵分左翼重骑与右翼努米底骑兵：左翼先击溃罗马骑兵，随后绕后封闭；努米底骑兵牵制、追击和侧后压迫分阶段表现。
  Cavalry is split into heavy cavalry and Numidian cavalry: the heavy cavalry clears the Roman horse first and then seals the rear; Numidians fix, pursue, and press from the side/rear by phase.
- 终局标注 Paullus/罗马指挥节点和罗马核心崩溃，但不表现血腥细节。项目保持教育、非商业、反战表达。
  The endgame marks Paullus/Roman command and the collapse of the Roman core without graphic violence. The project remains educational, non-commercial in intent, and anti-war.
- 2026-06-10 动线修正口径：Polybius/Livy 支持的是“中军接触后退让、两端非洲重步兵内折、骑兵清场后封后”的结构，不支持迦太基步骑兵穿越完整罗马方阵后在敌阵背后重新列队。运行时模型必须把罗马核心作为不可穿越边界，除非表现的是明确的崩溃、突破或残部退散。
  2026-06-10 movement correction: Polybius/Livy support the structure of center yielding after contact, African heavy infantry turning inward from the ends, and cavalry sealing the rear after clearing the wings. They do not support Carthaginian infantry or cavalry passing through an intact Roman formation and re-forming behind it. The runtime model must treat the Roman core as a no-crossing boundary unless the scene explicitly depicts collapse, breakthrough, or scattered remnants.
- 可见态势线本身也必须遵守不可穿越边界；即使单位 `unitTracks` 没有穿越，压缩线、封口线或口袋线也不能画成切过完整罗马核心。
  Visible tactical route lines must obey the same no-crossing boundary. Even when `unitTracks` do not intrude, compression, rear-seal, or pocket lines must not be drawn as cutting through the intact Roman core.
- 16:00 结果态是战斗后果展示，不是继续交战画面；罗马与迦太基单位 marker 均退场，只保留战术线、Paullus 终局点和“罗马组织崩溃区”等结果标识。
  The 16:00 result state shows the battle outcome, not continued close combat. Roman and Carthaginian unit markers both leave the map; tactical traces, the Paullus outcome point, and the Roman organizational-collapse result marker remain.
- 阵法战制作采用五道动线设计工序：先确定代表性单位数量/尺寸/阵形厚度，再反推地图比例和镜头包络，再独立设计两军完整五分钟动线，再按史料合并校正接触点、战斗点和不合理路径，最后完整回放并保存视觉证据。
  Formation-battle production uses a five-pass movement design loop: choose representative unit count/size/formation thickness, derive map scale and camera envelope, design each side's full five-minute movement independently, integrate and source-check contact points/effects/impossible paths, then replay the whole film and save visual evidence.
- 2026-06-10 r9 动线口径：`roman-core-compression` 从 10:05 与 `carthaginian-center-yield` 同步开始，罗马核心先继续压入凹袋再被侧后压力压缩，避免中军后退时罗马原地等待。`carthaginian-center-hold` 独立保持正面压力到围歼阶段，防止中军在 13:20-14:05 视觉断档；非洲两翼采用 2x12 浅纵深斜线，从罗马核心南北外侧内折，不再表现为静止柱状队列。
  2026-06-10 r9 movement model: `roman-core-compression` starts at 10:05 with `carthaginian-center-yield`, so the Roman core continues pressing into the concavity before being compressed by side/rear pressure instead of waiting while the center retreats. `carthaginian-center-hold` independently keeps front pressure through the envelopment phase, preventing the center from visually disappearing around 13:20-14:05. The African wings use shallow 2x12 angled pressure lines and turn inward from outside the Roman north/south edges rather than standing as static pillar-like columns.
- 2026-06-10 r9 相机口径：开场和凸阵阶段使用偏罗马阵后方的 12 度斜视全景，保证双方部署、罗马骑兵和迦太基展开同屏；进入凹袋、两翼内折、后封口、压缩和终局后切到 -18 度侧后方斜视，仍保持 56 度 pitch，以便稳定展示包围几何。缩放按战术教学阶段变化，避免频繁特写。
  2026-06-10 r9 camera model: deployment and convex-center stages use a 12-degree pitched wide view biased behind the Roman formation, keeping both deployments, Roman cavalry, and the Carthaginian line in frame. The concavity, wing-turn, rear-seal, compression, and endgame stages switch to a -18-degree side-rear pitched view, still at pitch 56, to show the envelopment geometry. Zoom changes follow teaching stages rather than frequent close-up cuts.
- 2026-06-10 r12 动线口径：后封口骑兵不再停在远离罗马核心的西侧空地，而是贴近罗马压缩核心的北/南后肩，同时仍保持在罗马核心外侧；Paullus 指挥 marker 不再从早期作为单独单位全程移动，只在 14:50 后作为终局指挥崩溃标识出现，并在结果态前退场。
  2026-06-10 r12 movement model: rear-sealing cavalry no longer stops in open ground far west of the Roman core. It closes against the northern and southern rear shoulders of the compressed Roman body while staying outside the core. The Paullus command marker no longer roams as a lone unit from early phases; it appears only after 14:50 as an endgame command-collapse marker and exits before the result state.

## 地图和不确定性 / Map and Uncertainty

- 奥凡托河与平原是高置信地理约束；具体战线方向、双方左右翼相对地貌和军阵宽度为 `probable` 或 `schematic`。
  The Ofanto river and plain are high-confidence geographic constraints; line orientation, exact wing relation to terrain, and formation width are `probable` or `schematic`.
- 动画坐标用于视觉叙事，不声称每个部队点是考古测绘点。
  Animation coordinates support visual storytelling and do not claim archaeological precision for every unit point.
- 所有 `formation`、`route`、`camera` 记录应保留不确定性标签，以便后续找到更好地图或学术资料时替换。
  `formation`, `route`, and `camera` records keep uncertainty labels so better maps or scholarship can replace them later.

## 单位资产 / Unit Assets

- 坎尼专属 marker 由 `scripts/generate-cannae-unit-assets.mjs` 从 `public/assets/unit-icons/source/cannae-baidu/` 下的 Baidu 图片候选源图裁剪、调色、描边、加阴影和阵营角标生成，输出到 `public/assets/unit-icons/cannae-*.webp`。旧 Theodore Ayrault Dodge 图版、VHV/PNGIMG 素材站尝试、0 A.D. 头像链和本轮早期自绘/几何图标均不再作为 Cannae 运行时图标来源。
  Cannae-specific markers are generated by `scripts/generate-cannae-unit-assets.mjs` from Baidu-discovered candidate images under `public/assets/unit-icons/source/cannae-baidu/`, with cropping, tinting, outline, shadow, and faction badges. The old Theodore Ayrault Dodge plates, VHV/PNGIMG source-site attempt, 0 A.D. portrait chain, and early self-drawn/geometric markers are no longer used as runtime Cannae icon sources.
- 本地保留运行时源图：`baidu-roman-warrior-3d.jpeg`、`baidu-roman-mounted-soldier.jpeg`、`baidu-ancient-european-soldier.jpeg`、`baidu-numidian-cavalry-history.jpeg` 和 `baidu-ancient-cavalry-lancer.jpeg`。
  Runtime source images are retained as `baidu-roman-warrior-3d.jpeg`, `baidu-roman-mounted-soldier.jpeg`, `baidu-ancient-european-soldier.jpeg`, `baidu-numidian-cavalry-history.jpeg`, and `baidu-ancient-cavalry-lancer.jpeg`.
- 直链记录：`baidu-roman-warrior-3d.jpeg` 来自 `https://img2.baidu.com/it/u=2069415824,3225917727&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=501`；`baidu-roman-mounted-soldier.jpeg` 来自 `https://img1.baidu.com/it/u=3592297730,3909263135&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=501`；`baidu-ancient-european-soldier.jpeg` 来自 `https://img0.baidu.com/it/u=3198198010,1152726694&fm=253&fmt=auto&app=120&f=JPEG?w=800&h=871`；`baidu-numidian-cavalry-history.jpeg` 来自 `https://img2.baidu.com/it/u=3688842152,2083128120&fm=253&fmt=auto&app=138&f=JPEG?w=735&h=500`；`baidu-ancient-cavalry-lancer.jpeg` 来自 `https://img0.baidu.com/it/u=1723024674,1090626759&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=869`。
  Direct URL log: `baidu-roman-warrior-3d.jpeg` came from `https://img2.baidu.com/it/u=2069415824,3225917727&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=501`; `baidu-roman-mounted-soldier.jpeg` from `https://img1.baidu.com/it/u=3592297730,3909263135&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=501`; `baidu-ancient-european-soldier.jpeg` from `https://img0.baidu.com/it/u=3198198010,1152726694&fm=253&fmt=auto&app=120&f=JPEG?w=800&h=871`; `baidu-numidian-cavalry-history.jpeg` from `https://img2.baidu.com/it/u=3688842152,2083128120&fm=253&fmt=auto&app=138&f=JPEG?w=735&h=500`; and `baidu-ancient-cavalry-lancer.jpeg` from `https://img0.baidu.com/it/u=1723024674,1090626759&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=869`.
- Baidu 候选图许可状态不明；当前仅作为本地/私有非商业演示的可追踪素材使用。公开发布前必须替换为公有领域、宽松许可、已购买或其他授权明确素材，或按实际许可证补齐授权与署名。
  The Baidu-discovered candidate images have unverified license status; they are used only as tracked local/private non-commercial demo sources. Before public release, replace them with public-domain, permissively licensed, purchased, or otherwise authorized assets, or complete the required attribution and license handling.
- 本地/私有演示阶段，授权不确定不得成为继续使用黑剪影、泛用图标或低质量占位图的理由；应先满足地图尺度可读性和阵营区分，再把许可不确定性、来源 URL 和公开发布前替换要求写入文档。
  In local/private demo work, license uncertainty must not justify keeping black silhouettes, generic icons, or low-quality placeholders. First meet map-scale readability and faction distinction, then document license uncertainty, source URLs, and the replacement requirement before public release.
- 资产要求：罗马红/铜色、迦太基青金色、非洲步兵绿铜色、努米底骑兵土金色；两军必须在地图尺度下一眼可分。黑剪影、泛用占位、同质化兵牌均视为失败。
  Asset requirements: Roman red/bronze, Carthaginian teal/gold, African green/bronze, Numidian earth/gold; factions must be immediately distinguishable at map scale. Black silhouettes, generic placeholders, and same-looking markers are failures.
- 2026-06-10 r12 渲染要求：坎尼运行时单位 marker 以图像主体为主，只保留小型阵营色点，不再在每个单位上叠加中文/缩写文字徽章；阵营名称由图例、路线和事件说明承担，避免地图尺度下变成密集文字牌或黑色污点。
  2026-06-10 r12 rendering requirement: Cannae runtime unit markers are image-first. They keep only a small faction color dot and no longer render Chinese/abbreviated text badges on every unit. Faction names belong in the legend, routes, and event text, preventing marker clusters from becoming dense text cards or dark spots at map scale.
- 2026-06-10 r18 渲染要求：运行时来源改为 Baidu 候选源图链，地图显示层继续保持 `.cannae-unit-holder .cannae-unit` 缩放为 `0.62` 和轻量阴影；图标验收以地图尺度可读、两军一眼可分、避免黑剪影为第一目标。
  2026-06-10 r18 rendering requirement: runtime sources now use the Baidu candidate chain, while the map display layer keeps `.cannae-unit-holder .cannae-unit` at `0.62` scale with a light shadow. Icon acceptance prioritizes map-scale readability, immediate faction distinction, and avoidance of black silhouettes.
