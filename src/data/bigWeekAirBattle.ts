import type { BattleEvent, FormationUnit, FrontLine, MapPoint } from "./battleOfFrance";

export const campaignStart = "1944-02-20T06:00";
export const campaignEnd = "1944-02-25T18:00";

export const mapPoints: MapPoint[] = [
  { id: "east-anglia", label: "英格兰东部机场群", coordinates: [0.7, 52.35], kind: "front" },
  { id: "london", label: "伦敦", coordinates: [-0.1276, 51.5072], kind: "capital" },
  { id: "channel", label: "英吉利海峡", coordinates: [1.2, 50.55], kind: "front" },
  { id: "coastal-radar", label: "德军沿岸预警", coordinates: [4.2, 51.0], kind: "front", revealAt: "1944-02-20T10:00" },
  { id: "brunswick", label: "不伦瑞克", coordinates: [10.5268, 52.2689], kind: "city", revealAt: "1944-02-21T09:00" },
  { id: "leipzig", label: "莱比锡", coordinates: [12.3731, 51.3397], kind: "city", revealAt: "1944-02-20T08:00" },
  { id: "regensburg", label: "雷根斯堡", coordinates: [12.1016, 49.0134], kind: "city", revealAt: "1944-02-24T08:00" },
  { id: "schweinfurt", label: "施韦因富特", coordinates: [10.2218, 50.0492], kind: "city", revealAt: "1944-02-21T07:30" },
  { id: "berlin", label: "柏林", coordinates: [13.405, 52.52], kind: "capital", revealAt: "1944-02-25T09:00" },
  { id: "luftwaffe-intercept", label: "德机截击区", coordinates: [7.8, 51.45], kind: "front", revealAt: "1944-02-22T10:00" },
  { id: "fighter-rendezvous", label: "远程护航交接", coordinates: [5.8, 51.35], kind: "front", revealAt: "1944-02-21T08:30" },
  { id: "bomber-loss-zone", label: "轰炸机损失带", coordinates: [7.35, 50.6], kind: "front", revealAt: "1944-02-21T11:00" },
  { id: "damaged-return-lane", label: "受损返航航路", coordinates: [3.2, 50.95], kind: "front", revealAt: "1944-02-21T12:30" },
  { id: "north-sea-return", label: "北海返航集合", coordinates: [3.1, 52.5], kind: "front", revealAt: "1944-02-22T13:00" },
  { id: "berlin-return-lane", label: "柏林方向返航线", coordinates: [7.6, 52.25], kind: "front", revealAt: "1944-02-25T12:30" }
];

const bomberStream: FormationUnit[] = [
  { id: "bomber-a", label: "B-17 盒形编队", badgeLabel: "美", icon: "ww2Bomber", offset: [0, 0] },
  { id: "bomber-b", label: "第二大队", badgeLabel: "美", icon: "ww2Bomber", offset: [-22, -10] },
  { id: "bomber-c", label: "第三大队", badgeLabel: "美", icon: "ww2Bomber", offset: [-44, 12] },
  { id: "bomber-d", label: "后续梯队", badgeLabel: "美", icon: "ww2Bomber", offset: [-66, 0] }
];

const escortFighters: FormationUnit[] = [
  { id: "p51-a", label: "P-51 护航", badgeLabel: "美", icon: "ww2Fighter", offset: [8, -20] },
  { id: "p47-a", label: "P-47 护航", badgeLabel: "美", icon: "ww2Fighter", offset: [-18, 20] },
  { id: "p51-b", label: "远程接力", badgeLabel: "美", icon: "ww2Fighter", offset: [-42, -18] }
];

const germanInterceptors: FormationUnit[] = [
  { id: "fw190-a", label: "Fw 190", badgeLabel: "德", icon: "ww2Fighter", offset: [0, 0] },
  { id: "bf109-a", label: "Bf 109", badgeLabel: "德", icon: "ww2Fighter", offset: [-20, -13] },
  { id: "fw190-b", label: "后续截击", badgeLabel: "德", icon: "ww2Fighter", offset: [-42, 14] }
];

const damagedBomberStream: FormationUnit[] = [
  { id: "damaged-bomber-a", label: "掉队B-17", badgeLabel: "美", icon: "ww2Bomber", offset: [0, 0] },
  { id: "damaged-bomber-b", label: "受损返航", badgeLabel: "美", icon: "ww2Bomber", offset: [-24, 13] },
  { id: "straggler-cover", label: "零散火力", badgeLabel: "美", icon: "ww2Bomber", offset: [-48, -12] }
];

export const frontLines: FrontLine[] = [
  {
    id: "argument-first-wave",
    faction: "allies",
    label: "2月20日轰炸机流往返",
    from: "east-anglia",
    to: "east-anglia",
    routeKind: "air",
    start: "1944-02-20T06:00",
    end: "1944-02-20T18:00",
    unitIcon: "ww2Bomber",
    formationUnits: bomberStream,
    waypoints: [
      [2.2, 51.2],
      [6.6, 51.55],
      [12.3731, 51.3397],
      [10.2, 51.45],
      [7.1, 51.7],
      [3.0, 52.35]
    ],
    visibleUntil: "1944-02-25T18:00",
    unitVisibleFrom: "1944-02-20T06:00",
    unitVisibleUntil: "1944-02-20T18:00"
  },
  {
    id: "deep-escort-chain",
    faction: "allies",
    label: "远程护航接力后返航",
    from: "east-anglia",
    to: "east-anglia",
    routeKind: "air",
    start: "1944-02-21T08:30",
    end: "1944-02-21T16:30",
    unitIcon: "ww2Fighter",
    formationUnits: escortFighters,
    waypoints: [
      [3.0, 51.75],
      [5.8, 51.35],
      [7.2, 51.8],
      [9.3, 52.2],
      [6.2, 51.95],
      [2.6, 52.15]
    ],
    visibleUntil: "1944-02-25T18:00",
    unitVisibleFrom: "1944-02-21T08:30",
    unitVisibleUntil: "1944-02-21T17:00"
  },
  {
    id: "luftwaffe-rises",
    faction: "germany",
    label: "德战斗机截击后返场",
    from: "brunswick",
    to: "brunswick",
    routeKind: "air",
    start: "1944-02-22T10:00",
    end: "1944-02-22T13:20",
    unitIcon: "ww2Fighter",
    formationUnits: germanInterceptors,
    waypoints: [
      [9.4, 51.9],
      [7.8, 51.45],
      [8.7, 51.8]
    ],
    visibleUntil: "1944-02-25T18:00",
    unitVisibleFrom: "1944-02-22T10:00",
    unitVisibleUntil: "1944-02-22T14:00"
  },
  {
    id: "schweinfurt-regensburg-lesson",
    faction: "allies",
    label: "无护航深袭：受损返航",
    from: "east-anglia",
    to: "east-anglia",
    routeKind: "air",
    start: "1944-02-21T07:30",
    end: "1944-02-21T17:30",
    unitIcon: "ww2Bomber",
    formationUnits: [
      ...bomberStream,
      { id: "empty-slot-a", label: "空位", badgeLabel: "损", icon: "ww2Bomber", offset: [-88, 17], hiddenFrom: "1944-02-21T12:45" }
    ],
    waypoints: [
      [1.8, 50.8],
      [5.6, 50.6],
      [8.2, 50.2],
      [7.35, 50.6],
      [4.2, 50.85],
      [1.4, 51.45]
    ],
    visibleUntil: "1944-02-25T18:00",
    unitVisibleFrom: "1944-02-21T07:30",
    unitVisibleUntil: "1944-02-21T18:00"
  },
  {
    id: "damaged-bomber-return",
    faction: "allies",
    label: "掉队轰炸机艰难返航",
    from: "bomber-loss-zone",
    to: "east-anglia",
    routeKind: "air",
    start: "1944-02-21T11:15",
    end: "1944-02-21T17:45",
    unitIcon: "ww2Bomber",
    formationUnits: damagedBomberStream,
    waypoints: [
      [6.2, 50.72],
      [4.2, 50.85],
      [3.2, 50.95],
      [1.6, 51.55]
    ],
    visibleUntil: "1944-02-25T18:00",
    unitVisibleFrom: "1944-02-21T11:15",
    unitVisibleUntil: "1944-02-21T18:00"
  },
  {
    id: "escort-fighter-sweep",
    faction: "allies",
    label: "护航战斗机扫荡后返航",
    from: "east-anglia",
    to: "east-anglia",
    routeKind: "air",
    start: "1944-02-22T09:20",
    end: "1944-02-22T15:30",
    unitIcon: "ww2Fighter",
    formationUnits: [
      ...escortFighters,
      { id: "p51-c", label: "自由猎歼", badgeLabel: "美", icon: "ww2Fighter", offset: [-62, 8] }
    ],
    waypoints: [
      [3.2, 52.15],
      [5.8, 51.35],
      [6.4, 51.8],
      [7.5, 51.55],
      [6.6, 52.1],
      [3.1, 52.5]
    ],
    visibleUntil: "1944-02-25T18:00",
    unitVisibleFrom: "1944-02-22T09:20",
    unitVisibleUntil: "1944-02-22T16:00"
  },
  {
    id: "feb-24-industrial-strike",
    faction: "allies",
    label: "2月24日工业目标空袭",
    from: "east-anglia",
    to: "east-anglia",
    routeKind: "air",
    start: "1944-02-24T06:40",
    end: "1944-02-24T18:00",
    unitIcon: "ww2Bomber",
    formationUnits: bomberStream,
    waypoints: [
      [2.4, 51.3],
      [5.9, 51.55],
      [10.5268, 52.2689],
      [12.1016, 49.0134],
      [8.1, 50.9],
      [3.0, 52.3]
    ],
    visibleUntil: "1944-02-25T18:00",
    unitVisibleFrom: "1944-02-24T06:40",
    unitVisibleUntil: "1944-02-24T18:00"
  },
  {
    id: "feb-24-escort-cover",
    faction: "allies",
    label: "2月24日护航扫荡",
    from: "east-anglia",
    to: "east-anglia",
    routeKind: "air",
    start: "1944-02-24T07:20",
    end: "1944-02-24T16:50",
    unitIcon: "ww2Fighter",
    formationUnits: escortFighters,
    waypoints: [
      [2.8, 52.05],
      [5.8, 51.35],
      [8.0, 51.75],
      [10.3, 52.25],
      [6.0, 52.0],
      [2.7, 52.22]
    ],
    visibleUntil: "1944-02-25T18:00",
    unitVisibleFrom: "1944-02-24T07:20",
    unitVisibleUntil: "1944-02-24T17:05"
  },
  {
    id: "feb-24-luftwaffe-defense",
    faction: "germany",
    label: "2月24日德国本土防空",
    from: "brunswick",
    to: "brunswick",
    routeKind: "air",
    start: "1944-02-24T08:20",
    end: "1944-02-24T13:50",
    unitIcon: "ww2Fighter",
    formationUnits: germanInterceptors,
    waypoints: [
      [10.0, 52.1],
      [8.0, 51.75],
      [10.5268, 52.2689],
      [9.1, 52.0]
    ],
    visibleUntil: "1944-02-25T18:00",
    unitVisibleFrom: "1944-02-24T08:20",
    unitVisibleUntil: "1944-02-24T14:20"
  },
  {
    id: "berlin-feint-and-return",
    faction: "allies",
    label: "纵深空袭后返航分散",
    from: "east-anglia",
    to: "east-anglia",
    routeKind: "air",
    start: "1944-02-25T06:30",
    end: "1944-02-25T17:30",
    unitIcon: "ww2Bomber",
    formationUnits: bomberStream,
    waypoints: [
      [2.4, 51.25],
      [7.0, 52.0],
      [11.0, 52.35],
      [13.0, 52.48],
      [7.6, 52.25],
      [3.1, 52.5]
    ],
    visibleUntil: "1944-02-25T18:00",
    unitVisibleFrom: "1944-02-25T06:30",
    unitVisibleUntil: "1944-02-25T18:00"
  }
];

export const battleEvents: BattleEvent[] = [
  {
    id: "argument-sortie-begins",
    date: "1944-02-20T06:00",
    title: "大周行动起飞：轰炸机流出海",
    location: "英国东部机场群",
    coordinates: [0.7, 52.35],
    phase: "出击集结",
    summary: "轰炸机从英国东部机场群出动，先形成出海航迹，尚未进入目标区。",
    detail: "开场只表现出动和集结，不播放目标区音效，也不显示目标区齐射线。等轰炸机流抵达莱比锡方向后，目标区爆炸和战斗音效才出现。",
    significance: "把起飞、越海、目标区攻击和返航拆开，避免飞机没到而攻击效果先出现。",
    mapFocus: ["east-anglia", "channel", "coastal-radar"]
  },
  {
    id: "operation-argument-start",
    date: "1944-02-20T11:35",
    title: "首日轰炸机流抵达目标区",
    location: "莱比锡方向",
    coordinates: [12.3731, 51.3397],
    phase: "制空权攻势",
    summary: "盟军轰炸机流越过北海并压到德国航空工业目标上空，随后继续组织返航。",
    detail: "大周行动不是把飞机画到目标点就结束。去程、目标区爆炸、返航集合和德机截击共同构成空中战役链条，动画保留整条航迹说明轰炸机必须飞完整个往返航程。",
    significance: "这让战略轰炸从目标摧毁转向制空权争夺，是欧洲空战节奏变化的关键节点。",
    mapFocus: ["east-anglia", "leipzig", "luftwaffe-intercept"]
  },
  {
    id: "deep-escort-lesson",
    date: "1944-02-21T08:30",
    title: "远程护航改变深袭生存率",
    location: "德国西部空域",
    coordinates: [5.8, 51.35],
    phase: "护航接力",
    summary: "P-47、P-38 与 P-51 等护航力量把保护范围延伸到德国纵深，同时让受损轰炸机有返航机会。",
    detail: "1943年施韦因富特-雷根斯堡等深袭暴露了无护航轰炸的高代价。动画把教训表现为轰炸机流穿过损失带、掉队机沿低速航路返航，再与1944年远程护航线对照。",
    significance: "远程护航的意义不是好看的一条伴飞线，而是降低深袭代价，并把德机拖入 escort 与 intercept 的连续对抗。",
    mapFocus: ["fighter-rendezvous", "bomber-loss-zone", "damaged-return-lane"]
  },
  {
    id: "luftwaffe-attrition",
    date: "1944-02-22T10:00",
    title: "德国截击机群被拖入消耗",
    location: "德国西北部",
    coordinates: [7.8, 51.45],
    phase: "截击与猎歼",
    summary: "德国战斗机为保护本土目标被迫反复升空，截击后也要返场整补，不能在接触点消失。",
    detail: "动画里用德机截击线、返场线与盟军护航线交叉表现：德机不只是追轰炸机，还必须面对外侧护航机的主动扫荡和返航路上的持续压力。",
    significance: "飞行员和战斗机损耗削弱了德国空军后续对诺曼底登陆和本土防空的应对能力。",
    mapFocus: ["luftwaffe-intercept", "brunswick", "fighter-rendezvous"]
  },
  {
    id: "aircraft-industry-targets",
    date: "1944-02-24T10:50",
    title: "航空工业目标遭连续打击",
    location: "不伦瑞克、莱比锡、雷根斯堡方向",
    coordinates: [10.5268, 52.2689],
    phase: "工业与制空",
    summary: "盟军连续攻击德国飞机制造和相关工业目标，爆炸点必须落在工业目标而不是空中航线外侧。",
    detail: "大周行动的目标体系覆盖飞机制造、零部件、轴承和装配链。动画用2月24日轰炸机流、护航扫荡、德机本土防空和目标区爆炸表现：轰炸有实际落点，攻击后机群继续返航，而不是抵达目标后消失。",
    significance: "工业打击与空中消耗叠加，形成战役级制空权效果。",
    mapFocus: ["brunswick", "leipzig", "regensburg"]
  },
  {
    id: "argument-outcome",
    date: "1944-02-25T15:30",
    title: "大周行动收束：制空权天平倾斜",
    location: "西欧空域",
    coordinates: [7.2, 51.8],
    phase: "攻势结果",
    summary: "连续空袭、护航战斗和返航损耗共同削弱德国昼间战斗机力量，盟军为诺曼底前的空中优势奠基。",
    detail: "结果不能只看工厂炸毁，还要看德国战斗机部队被迫在不利条件下连续出战。动画收束时保留轰炸、护航、截击和返航航迹，让观众看到空战结果来自往返航程上的累积消耗。",
    significance: "大周行动常被视作盟军夺取欧洲昼间制空权过程中的关键阶段。",
    mapFocus: ["east-anglia", "luftwaffe-intercept", "berlin-return-lane"]
  }
];

export const cueEventIds = new Set([
  "deep-escort-lesson",
  "luftwaffe-attrition",
  "aircraft-industry-targets",
  "argument-outcome"
]);
export const diveCueEventIds = new Set(["luftwaffe-attrition", "argument-outcome"]);
