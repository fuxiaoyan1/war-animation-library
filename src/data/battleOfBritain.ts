import type { BattleEvent, FormationUnit, FrontLine, MapPoint } from "./battleOfFrance";

export const campaignStart = "1940-09-15T10:30";
export const campaignEnd = "1940-09-15T18:00";

export const mapPoints: MapPoint[] = [
  { id: "uxbridge", label: "11群作战室", coordinates: [-0.478, 51.548], kind: "front" },
  { id: "chain-home-kent", label: "肯特雷达链", coordinates: [1.35, 51.05], kind: "front" },
  { id: "dover", label: "多佛", coordinates: [1.313, 51.129], kind: "port" },
  { id: "dungeness", label: "邓杰内斯", coordinates: [0.97, 50.91], kind: "front" },
  { id: "cap-gris-nez", label: "格里内角", coordinates: [1.585, 50.868], kind: "front" },
  { id: "calais", label: "加来", coordinates: [1.858, 50.951], kind: "port" },
  { id: "boulogne", label: "布洛涅", coordinates: [1.614, 50.726], kind: "port" },
  { id: "thames-estuary", label: "泰晤士河口", coordinates: [0.72, 51.52], kind: "front" },
  { id: "brenchley", label: "布伦奇利空域", coordinates: [0.4, 51.15], kind: "front", revealAt: "1940-09-15T11:30" },
  { id: "south-london", label: "南伦敦拦截区", coordinates: [-0.08, 51.42], kind: "objective", revealAt: "1940-09-15T11:30" },
  { id: "london", label: "伦敦", coordinates: [-0.1276, 51.5072], kind: "capital" },
  { id: "buckingham-palace", label: "白金汉宫方向", coordinates: [-0.141, 51.501], kind: "objective", revealAt: "1940-09-15T11:45" },
  { id: "victoria", label: "维多利亚站", coordinates: [-0.1445, 51.4952], kind: "objective", revealAt: "1940-09-15T11:50" },
  { id: "biggin-hill", label: "比金山", coordinates: [0.032, 51.33], kind: "front" },
  { id: "kenley", label: "肯利", coordinates: [-0.09, 51.3], kind: "front" },
  { id: "croydon", label: "克罗伊登", coordinates: [-0.117, 51.356], kind: "front" },
  { id: "hornchurch", label: "霍恩彻奇", coordinates: [0.22, 51.53], kind: "front" },
  { id: "north-weald", label: "北威尔德", coordinates: [0.16, 51.72], kind: "front" },
  { id: "northolt", label: "诺索尔特", coordinates: [-0.418, 51.553], kind: "front" },
  { id: "duxford", label: "达克斯福德", coordinates: [0.13, 52.09], kind: "front", revealAt: "1940-09-15T11:25" },
  { id: "southampton", label: "南安普敦", coordinates: [-1.404, 50.909], kind: "port", revealAt: "1940-09-15T17:00" }
];

const luftwaffeBomberBox: FormationUnit[] = [
  { id: "do17-a", label: "Do 17 轰炸机", badgeLabel: "德", icon: "ww2Bomber", offset: [0, 0] },
  { id: "he111-a", label: "He 111 轰炸机", badgeLabel: "德", icon: "ww2Bomber", offset: [-18, -10] },
  { id: "do17-b", label: "后续梯队", badgeLabel: "德", icon: "ww2Bomber", offset: [-36, 12] },
  { id: "bf109-cover", label: "Bf 109 护航", badgeLabel: "德", icon: "ww2Fighter", offset: [-12, 19] },
  { id: "bf110-cover", label: "Bf 110 掩护", badgeLabel: "德", icon: "ww2Fighter", offset: [-50, -18] }
];

const luftwaffeFollowWave: FormationUnit[] = [
  { id: "do17-second-a", label: "第二波轰炸机", badgeLabel: "德", icon: "ww2Bomber", offset: [0, 0] },
  { id: "he111-second-a", label: "第二波梯队", badgeLabel: "德", icon: "ww2Bomber", offset: [-18, 12] },
  { id: "bf109-second-a", label: "贴身护航", badgeLabel: "德", icon: "ww2Fighter", offset: [-12, -18] },
  { id: "bf109-second-b", label: "高空护航", badgeLabel: "德", icon: "ww2Fighter", offset: [-44, 21] }
];

const rafElevenGroup: FormationUnit[] = [
  { id: "spitfire-72", label: "72中队喷火", badgeLabel: "英", icon: "ww2Fighter", offset: [0, 0] },
  { id: "hurricane-303", label: "303中队飓风", badgeLabel: "英", icon: "ww2Fighter", offset: [-18, -12] },
  { id: "hurricane-501", label: "501中队飓风", badgeLabel: "英", icon: "ww2Fighter", offset: [-36, 13] },
  { id: "spitfire-92", label: "92中队喷火", badgeLabel: "英", icon: "ww2Fighter", offset: [-55, -3] }
];

const rafReinforcementWing: FormationUnit[] = [
  { id: "spitfire-19", label: "19中队喷火", badgeLabel: "英", icon: "ww2Fighter", offset: [0, 0] },
  { id: "hurricane-242", label: "242中队飓风", badgeLabel: "英", icon: "ww2Fighter", offset: [-20, 13] },
  { id: "hurricane-302", label: "302中队飓风", badgeLabel: "英", icon: "ww2Fighter", offset: [-42, -12] },
  { id: "spitfire-611", label: "611中队喷火", badgeLabel: "英", icon: "ww2Fighter", offset: [-62, 6] }
];

export const frontLines: FrontLine[] = [
  {
    id: "morning-radar-plots",
    faction: "britain",
    label: "雷达与观察哨报告",
    from: "chain-home-kent",
    to: "uxbridge",
    routeKind: "air",
    start: "1940-09-15T10:30",
    end: "1940-09-15T11:05",
    hideUnit: true,
    unitIcon: "ww2Fighter",
    waypoints: [[1.1, 51.2], [0.55, 51.36], [0.12, 51.52]],
    visibleUntil: "1940-09-15T18:00"
  },
  {
    id: "morning-raid-first-wave",
    faction: "germany",
    label: "上午第一波：百机越岸",
    from: "calais",
    to: "london",
    routeKind: "air",
    start: "1940-09-15T10:55",
    end: "1940-09-15T12:05",
    unitIcon: "ww2Bomber",
    formationUnits: luftwaffeBomberBox,
    waypoints: [
      [1.2, 51.04],
      [0.58, 51.28],
      [0.12, 51.42],
      [0.02, 51.48],
      [0.18, 51.34],
      [0.72, 51.1],
      [0.97, 50.91]
    ],
    visibleUntil: "1940-09-15T18:00",
    unitVisibleUntil: "1940-09-15T12:50"
  },
  {
    id: "morning-raid-second-wave",
    faction: "germany",
    label: "上午第二波：后续梯队",
    from: "boulogne",
    to: "south-london",
    routeKind: "air",
    start: "1940-09-15T11:05",
    end: "1940-09-15T12:18",
    unitIcon: "ww2Bomber",
    formationUnits: luftwaffeFollowWave,
    waypoints: [
      [1.02, 50.98],
      [0.42, 51.22],
      [0.06, 51.36],
      [-0.02, 51.42],
      [0.24, 51.28],
      [0.86, 50.98],
      [0.97, 50.91]
    ],
    visibleUntil: "1940-09-15T18:00",
    unitVisibleUntil: "1940-09-15T12:55"
  },
  {
    id: "eleven-group-morning-scramble",
    faction: "britain",
    label: "11群升空迎击",
    from: "biggin-hill",
    to: "brenchley",
    routeKind: "air",
    start: "1940-09-15T11:05",
    end: "1940-09-15T11:45",
    unitIcon: "ww2Fighter",
    formationUnits: rafElevenGroup,
    waypoints: [[0.16, 51.32], [0.28, 51.32], [0.36, 51.24], [0.18, 51.36], [0.52, 51.16]],
    visibleUntil: "1940-09-15T18:00",
    unitVisibleUntil: "1940-09-15T12:55"
  },
  {
    id: "twelve-group-morning-wing",
    faction: "britain",
    label: "12群大编队南下",
    from: "duxford",
    to: "thames-estuary",
    routeKind: "air",
    start: "1940-09-15T11:25",
    end: "1940-09-15T12:20",
    unitIcon: "ww2Fighter",
    formationUnits: rafReinforcementWing,
    waypoints: [[0.18, 51.84], [0.32, 51.66], [0.52, 51.52], [0.48, 51.34]],
    visibleUntil: "1940-09-15T18:00",
    unitVisibleUntil: "1940-09-15T13:05"
  },
  {
    id: "buckingham-palace-dornier",
    faction: "germany",
    label: "脱队Do 17冲向宫殿区",
    from: "thames-estuary",
    to: "victoria",
    routeKind: "air",
    start: "1940-09-15T11:35",
    end: "1940-09-15T11:52",
    unitIcon: "ww2Bomber",
    formationUnits: [{ id: "dornier-lone", label: "脱队Do 17", badgeLabel: "德", icon: "ww2Bomber", offset: [0, 0] }],
    waypoints: [[0.35, 51.5], [0.04, 51.52], [-0.12, 51.5]],
    visibleUntil: "1940-09-15T18:00",
    unitVisibleUntil: "1940-09-15T12:15"
  },
  {
    id: "ray-holmes-intercept",
    faction: "britain",
    label: "504中队拦截脱队轰炸机",
    from: "northolt",
    to: "buckingham-palace",
    routeKind: "air",
    start: "1940-09-15T11:38",
    end: "1940-09-15T11:52",
    unitIcon: "ww2Fighter",
    formationUnits: [{ id: "holmes-hurricane", label: "飓风拦截", badgeLabel: "英", icon: "ww2Fighter", offset: [0, 0] }],
    waypoints: [[-0.35, 51.55], [-0.22, 51.54], [-0.16, 51.51]],
    visibleUntil: "1940-09-15T18:00",
    unitVisibleUntil: "1940-09-15T12:18"
  },
  {
    id: "morning-return-pursuit",
    faction: "britain",
    label: "回程追击",
    from: "south-london",
    to: "dungeness",
    routeKind: "air",
    start: "1940-09-15T11:58",
    end: "1940-09-15T13:10",
    unitIcon: "ww2Fighter",
    formationUnits: [
      { id: "pursuit-a", label: "追击中队", badgeLabel: "英", icon: "ww2Fighter", offset: [0, 0] },
      { id: "pursuit-b", label: "侧后攻击", badgeLabel: "英", icon: "ww2Fighter", offset: [-34, 20] }
    ],
    waypoints: [[0.18, 51.28], [0.48, 51.18], [0.82, 50.98]],
    visibleUntil: "1940-09-15T18:00",
    unitVisibleUntil: "1940-09-15T13:35"
  },
  {
    id: "afternoon-radar-warning",
    faction: "britain",
    label: "13:45 第二次大空袭预警",
    from: "chain-home-kent",
    to: "uxbridge",
    routeKind: "air",
    start: "1940-09-15T13:45",
    end: "1940-09-15T14:05",
    hideUnit: true,
    unitIcon: "ww2Fighter",
    waypoints: [[0.88, 51.32], [0.18, 51.52]],
    visibleUntil: "1940-09-15T18:00"
  },
  {
    id: "midday-raf-refuel-patrol",
    faction: "britain",
    label: "午间中队整补巡逻",
    from: "biggin-hill",
    to: "dover",
    routeKind: "air",
    start: "1940-09-15T12:45",
    end: "1940-09-15T14:05",
    unitIcon: "ww2Fighter",
    formationUnits: [
      { id: "patrol-spitfire", label: "巡逻喷火", badgeLabel: "英", icon: "ww2Fighter", offset: [0, 0] },
      { id: "patrol-hurricane", label: "整补飓风", badgeLabel: "英", icon: "ww2Fighter", offset: [-22, 14] }
    ],
    waypoints: [[0.24, 51.32], [0.55, 51.21], [0.84, 51.1]],
    visibleUntil: "1940-09-15T18:00",
    unitVisibleUntil: "1940-09-15T14:10"
  },
  {
    id: "afternoon-raid-main-wave",
    faction: "germany",
    label: "下午第一波：150机越岸",
    from: "calais",
    to: "london",
    routeKind: "air",
    start: "1940-09-15T14:14",
    end: "1940-09-15T15:35",
    unitIcon: "ww2Bomber",
    formationUnits: [
      ...luftwaffeBomberBox,
      { id: "do17-c", label: "纵深梯队", badgeLabel: "德", icon: "ww2Bomber", offset: [-104, 6] }
    ],
    waypoints: [
      [1.12, 51.05],
      [0.68, 51.26],
      [0.28, 51.42],
      [0.0, 51.48],
      [0.2, 51.34],
      [0.82, 51.02],
      [0.97, 50.91]
    ],
    visibleUntil: "1940-09-15T18:00",
    unitVisibleUntil: "1940-09-15T16:25"
  },
  {
    id: "afternoon-raid-follow-wave",
    faction: "germany",
    label: "下午第二波：百机续进",
    from: "cap-gris-nez",
    to: "south-london",
    routeKind: "air",
    start: "1940-09-15T14:20",
    end: "1940-09-15T15:48",
    unitIcon: "ww2Bomber",
    formationUnits: luftwaffeFollowWave,
    waypoints: [
      [1.05, 50.98],
      [0.56, 51.18],
      [0.08, 51.36],
      [-0.02, 51.42],
      [0.3, 51.2],
      [0.92, 50.98],
      [0.97, 50.91]
    ],
    visibleUntil: "1940-09-15T18:00",
    unitVisibleUntil: "1940-09-15T16:35"
  },
  {
    id: "eleven-group-afternoon-all-in",
    faction: "britain",
    label: "11群多数中队投入",
    from: "kenley",
    to: "south-london",
    routeKind: "air",
    start: "1940-09-15T14:00",
    end: "1940-09-15T15:35",
    unitIcon: "ww2Fighter",
    formationUnits: [
      ...rafElevenGroup,
      { id: "hurricane-249", label: "249中队", badgeLabel: "英", icon: "ww2Fighter", offset: [-75, 17] }
    ],
    waypoints: [[-0.02, 51.34], [0.08, 51.4], [0.22, 51.36], [0.48, 51.22]],
    visibleUntil: "1940-09-15T18:00",
    unitVisibleUntil: "1940-09-15T16:30"
  },
  {
    id: "big-wing-afternoon-commitment",
    faction: "britain",
    label: "12群大编队加入",
    from: "duxford",
    to: "thames-estuary",
    routeKind: "air",
    start: "1940-09-15T14:10",
    end: "1940-09-15T15:45",
    unitIcon: "ww2Fighter",
    formationUnits: [
      ...rafReinforcementWing,
      { id: "hurricane-310", label: "310中队", badgeLabel: "英", icon: "ww2Fighter", offset: [-80, -13] }
    ],
    waypoints: [[0.18, 51.82], [0.38, 51.66], [0.58, 51.5], [0.38, 51.36]],
    visibleUntil: "1940-09-15T18:00",
    unitVisibleUntil: "1940-09-15T16:40"
  },
  {
    id: "afternoon-return-broken-raid",
    faction: "germany",
    label: "轰炸队形破碎返航",
    from: "london",
    to: "dungeness",
    routeKind: "air",
    start: "1940-09-15T15:10",
    end: "1940-09-15T16:45",
    unitIcon: "ww2Bomber",
    formationUnits: [
      { id: "damaged-bomber-a", label: "受损轰炸机", badgeLabel: "德", icon: "ww2Bomber", offset: [0, 0] },
      { id: "escort-return-a", label: "残余护航", badgeLabel: "德", icon: "ww2Fighter", offset: [-24, 16] }
    ],
    waypoints: [[0.18, 51.34], [0.62, 51.16], [0.92, 50.98]],
    visibleUntil: "1940-09-15T18:00",
    unitVisibleUntil: "1940-09-15T17:20"
  },
  {
    id: "late-pursuit-over-channel",
    faction: "britain",
    label: "海峡上空追击收束",
    from: "south-london",
    to: "dover",
    routeKind: "air",
    start: "1940-09-15T15:10",
    end: "1940-09-15T17:20",
    unitIcon: "ww2Fighter",
    formationUnits: [
      { id: "late-pursuit-spitfire", label: "喷火追击", badgeLabel: "英", icon: "ww2Fighter", offset: [0, 0] },
      { id: "late-pursuit-hurricane", label: "飓风补位", badgeLabel: "英", icon: "ww2Fighter", offset: [-24, -14] },
      { id: "late-pursuit-polish", label: "波兰中队", badgeLabel: "英", icon: "ww2Fighter", offset: [-48, 13] }
    ],
    waypoints: [[0.12, 51.32], [0.18, 51.34], [0.48, 51.18], [0.92, 51.08]],
    visibleUntil: "1940-09-15T18:00",
    unitVisibleUntil: "1940-09-15T18:00"
  },
  {
    id: "evening-bf110-diversion",
    faction: "germany",
    label: "傍晚小规模牵制",
    from: "cap-gris-nez",
    to: "southampton",
    routeKind: "air",
    start: "1940-09-15T17:00",
    end: "1940-09-15T18:00",
    unitIcon: "ww2Fighter",
    formationUnits: [
      { id: "bf110-diversion-a", label: "Bf 110牵制", badgeLabel: "德", icon: "ww2Fighter", offset: [0, 0] },
      { id: "bf110-diversion-b", label: "后续小队", badgeLabel: "德", icon: "ww2Fighter", offset: [-24, 13] }
    ],
    waypoints: [[0.8, 50.62], [-0.18, 50.72], [-0.95, 50.82]],
    visibleUntil: "1940-09-15T18:00",
    unitVisibleUntil: "1940-09-15T18:00"
  }
];

export const battleEvents: BattleEvent[] = [
  {
    id: "uxbridge-quiet-before-raid",
    date: "1940-09-15T10:30",
    title: "乌克斯布里奇：短暂平静",
    location: "11群作战室",
    coordinates: [-0.478, 51.548],
    phase: "作战室待命",
    summary: "伦敦连续遭袭后，9月15日上午先出现短暂平静，雷达和观察哨仍保持警戒。",
    detail: "这部动画从战役高潮的一天开始，而不是再铺开整个7月至9月战役。画面重点是伦敦方向空中态势如何从雷达点迹转成多批拦截。",
    significance: "把叙事收束到单日战术空战，避免长期日历空档中飞机消失，也能更清楚表现伦敦上空最激烈的昼间争夺。",
    mapFocus: ["uxbridge", "chain-home-kent", "london"]
  },
  {
    id: "morning-radar-contact",
    date: "1940-09-15T10:55",
    title: "雷达报告：大编队越海",
    location: "肯特海岸",
    coordinates: [1.1, 51.02],
    phase: "发现来袭",
    summary: "链家雷达和观察哨报告大批敌机从多佛至邓杰内斯方向接近。",
    detail: "RAF Museum 对9月15日的叙述记录，接近11点时雷达和观察哨报告敌机，上午攻击由两波组成，约100架和150架敌机从多佛至邓杰内斯间越岸。",
    significance: "雷达发现不是装饰线，而是动画的第一条作战链：发现、判读、下令、起飞、拦截。",
    mapFocus: ["chain-home-kent", "dover", "dungeness"]
  },
  {
    id: "eleven-group-scramble",
    date: "1940-09-15T11:05",
    title: "11群连续下令升空",
    location: "比金山、肯利、霍恩彻奇等机场",
    coordinates: [0.03, 51.33],
    phase: "升空拦截",
    summary: "11群多支喷火和飓风中队在半小时内升空，迎向伦敦东南方向的轰炸机流。",
    detail: "资料显示11:05-11:42之间，11群、10群和12群多个中队陆续加入。动画用多条 RAF 航线表现分批升空，而不是只画一支战斗机队。",
    significance: "这体现了伦敦防空不是单点英雄主义，而是雷达、作战室、机场和中队的体系反应。",
    mapFocus: ["biggin-hill", "kenley", "thames-estuary"]
  },
  {
    id: "morning-dogfight-london",
    date: "1940-09-15T11:30",
    title: "伦敦南侧空域混战",
    location: "布伦奇利至南伦敦",
    coordinates: [0.18, 51.36],
    phase: "上午混战",
    summary: "德国轰炸机队向伦敦推进，RAF 中队从侧前方和高空切入，护航战斗机与拦截机交错。",
    detail: "这段不再表现成几条简单线，而用两波德军轰炸机、11群拦截、12群增援和回程追击叠加形成密集航迹。",
    significance: "空战自由度高，但仍有清晰战术结构：轰炸机流、护航圈、拦截屏障、回程追击。",
    mapFocus: ["brenchley", "south-london", "london"]
  },
  {
    id: "buckingham-palace-intercept",
    date: "1940-09-15T11:50",
    title: "白金汉宫方向：脱队轰炸机被拦",
    location: "伦敦市区上空",
    coordinates: [-0.141, 51.501],
    phase: "低空惊险",
    summary: "一架脱队 Do 17 逼近市区核心方向，被 RAF 飓风拦截，坠向维多利亚站附近。",
    detail: "RAF Museum 记录了Ray Holmes与504中队相关的著名事件。动画将它作为上午混战中的局部战术节点，而非单独英雄故事。",
    significance: "它让伦敦上空的空战从抽象航线变成可感知的城市防空战。",
    mapFocus: ["buckingham-palace", "victoria", "northolt"]
  },
  {
    id: "morning-return-fire",
    date: "1940-09-15T12:00",
    title: "回程仍遭攻击",
    location: "南伦敦至肯特海岸",
    coordinates: [0.12, 51.36],
    phase: "回程追击",
    summary: "约百架轰炸机进入伦敦投弹后，返航途中继续遭到 RAF 攻击。",
    detail: "资料记录上午交战约持续到12:45。动画保留回程追击航迹，避免飞机抵达目标后凭空消失。",
    significance: "空战不在投弹点结束，返航阶段仍是损失与队形破碎的重要部分。",
    mapFocus: ["london", "dungeness", "dover"]
  },
  {
    id: "afternoon-warning",
    date: "1940-09-15T13:45",
    title: "13:45 第二次大空袭预警",
    location: "肯特海岸方向",
    coordinates: [0.62, 51.2],
    phase: "再度发现",
    summary: "午后，第二次大规模来袭报告传入；南部中队在整补与巡逻后准备再次拦截。",
    detail: "RAF Museum 记录13:45后不久出现第二次大攻击报告，随后约150架敌机和后续约100架敌机在14:14-14:20间越岸。动画在12:45-14:05保留RAF整补巡逻线，避免上午追击结束后画面空白。",
    significance: "这解释了为什么动画要表现两轮高峰，而不是把9月15日画成一条单一来袭线。",
    mapFocus: ["chain-home-kent", "dover", "biggin-hill"]
  },
  {
    id: "afternoon-all-squadrons-engaged",
    date: "1940-09-15T14:45",
    title: "下午高峰：多数中队投入",
    location: "伦敦东南空域",
    coordinates: [0.28, 51.42],
    phase: "全力拦截",
    summary: "第二轮大空袭抵近伦敦，11群与12群多批中队同时投入，天空出现更密集航迹。",
    detail: "资料称下午约一小时内11群所有中队都投入交战。动画用多条 RAF 航线和大编队加入表现这一点。",
    significance: "这是“伦敦上空的鹰”的核心画面：不是飞机消失，而是航迹和编队层层叠加。",
    mapFocus: ["thames-estuary", "south-london", "london"]
  },
  {
    id: "afternoon-bombers-broken",
    date: "1940-09-15T15:10",
    title: "轰炸队形被撕开",
    location: "伦敦上空至肯特海岸",
    coordinates: [0.18, 51.34],
    phase: "队形瓦解",
    summary: "约70架轰炸机抵达伦敦，但整体损害小于9月7日；回程队形被持续攻击。",
    detail: "动画将下午回程拆成受损轰炸机返航和 RAF 海峡追击两条线，表现集群被撕裂，而不是到伦敦后直接消失。",
    significance: "这正是大规模空战的特点：航线密集、接触反复、队形破碎、追击延伸到海峡。",
    mapFocus: ["london", "south-london", "dungeness"]
  },
  {
    id: "channel-pursuit-closes",
    date: "1940-09-15T16:30",
    title: "海峡追击收束",
    location: "肯特海岸与海峡上空",
    coordinates: [0.92, 51.08],
    phase: "追击收束",
    summary: "RAF 战斗机继续压迫返航编队，残余护航机掩护轰炸机脱离。",
    detail: "这段保留傍晚仍可见的 RAF 追击单位和德机牵制线，避免时间轴拖到后段出现空地图。",
    significance: "空战高潮不是一个瞬间，而是发现、拦截、投弹、回程和追击构成的连续链条。",
    mapFocus: ["dover", "dungeness", "south-london"]
  },
  {
    id: "evening-result",
    date: "1940-09-15T18:00",
    title: "傍晚：伦敦守住白昼",
    location: "伦敦与英格兰东南部",
    coordinates: [-0.1276, 51.5072],
    phase: "白昼战斗结束",
    summary: "白昼大规模空袭未能摧毁 RAF 防空体系，德国随后越来越转向夜间轰炸。",
    detail: "9月15日没有结束整场不列颠空战，但成为德国无法夺取白昼制空权的象征节点。动画末段保留航迹网和最后的小规模牵制航线。",
    significance: "伦敦上空的鹰仍在，德国入侵英国所需的空中优势没有实现。",
    mapFocus: ["london", "uxbridge", "thames-estuary"]
  }
];

export const cueEventIds = new Set([
  "morning-radar-contact",
  "eleven-group-scramble",
  "morning-dogfight-london",
  "buckingham-palace-intercept",
  "morning-return-fire",
  "afternoon-all-squadrons-engaged",
  "afternoon-bombers-broken",
  "channel-pursuit-closes"
]);

export const diveCueEventIds = new Set<string>();
