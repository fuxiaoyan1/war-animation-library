import type { BattleEvent, FormationUnit, FrontLine, MapPoint } from "./battleOfFrance";
import type { BattleEffectElement, MapOverlayElement } from "../components/CampaignMapAnimation";
import type { HistoricalRegion } from "../types/maps";

export const campaignStart = "1948-11-06T18:00";
export const campaignEnd = "1948-11-22T12:00";

export const mapPoints: MapPoint[] = [
  { id: "xuzhou", label: "徐州", coordinates: [117.1848, 34.2618], kind: "city" },
  { id: "pantang", label: "潘塘方向", coordinates: [117.33, 34.22], kind: "front" },
  { id: "daxujia", label: "大许家阻援线", coordinates: [117.55, 34.27], kind: "front" },
  { id: "relief-forward-edge", label: "邱李先头受阻", coordinates: [117.64, 34.285], kind: "front", revealAt: "1948-11-13T18:00" },
  { id: "zhoujiazhai", label: "周家寨华野司令部", coordinates: [117.78, 34.22], kind: "front" },
  { id: "nianzhuang", label: "碾庄圩", coordinates: [117.86, 34.29], kind: "objective" },
  { id: "nianzhuang-north", label: "北侧村落阵地", coordinates: [117.84, 34.345], kind: "front", revealAt: "1948-11-11T12:00" },
  { id: "nianzhuang-east", label: "东侧水沟阵地", coordinates: [117.935, 34.29], kind: "front", revealAt: "1948-11-11T12:00" },
  { id: "nianzhuang-south", label: "南侧村落阵地", coordinates: [117.855, 34.235], kind: "front", revealAt: "1948-11-11T12:00" },
  { id: "nianzhuang-west", label: "西侧第一道防线", coordinates: [117.775, 34.285], kind: "front", revealAt: "1948-11-11T12:00" },
  { id: "inner-pocket", label: "碾庄内核", coordinates: [117.872, 34.292], kind: "objective", revealAt: "1948-11-19T22:00" },
  { id: "nizhuang", label: "倪庄", coordinates: [117.905, 34.25], kind: "objective", revealAt: "1948-11-22T10:00" },
  { id: "xinanzhen", label: "新安镇", coordinates: [118.34, 34.37], kind: "city" },
  { id: "pizhou-east", label: "邳州以东追击线", coordinates: [118.12, 34.33], kind: "front" },
  { id: "canal-bridge", label: "运河桥渡", coordinates: [118.02, 34.31], kind: "front" },
  { id: "north-pla-entry", label: "华野北线追击", coordinates: [118.22, 34.45], kind: "front" },
  { id: "east-pla-entry", label: "华野东线追击", coordinates: [118.38, 34.32], kind: "front" },
  { id: "south-pla-entry", label: "华野南线追击", coordinates: [118.16, 34.16], kind: "front" },
  { id: "southwest-pla-entry", label: "华野西南封口", coordinates: [117.58, 34.13], kind: "front", revealAt: "1948-11-10T20:00" },
  { id: "northwest-block-entry", label: "阻援集团北翼", coordinates: [117.46, 34.39], kind: "front", revealAt: "1948-11-11T12:00" },
  { id: "southwest-block-entry", label: "阻援集团南翼", coordinates: [117.42, 34.13], kind: "front", revealAt: "1948-11-11T12:00" },
  { id: "longhai-rail-east", label: "陇海铁路东段", coordinates: [118.26, 34.35], kind: "front" },
  { id: "yunhe", label: "运河与水网", coordinates: [118.0, 34.34], kind: "front" }
];

const huangWithdrawalColumn: FormationUnit[] = [
  { id: "lead", label: "第七兵团前卫", badgeLabel: "七", icon: "infantry", offset: [0, -18] },
  { id: "main", label: "黄百韬本队", badgeLabel: "黄", icon: "infantry", offset: [-34, 12] },
  { id: "rear", label: "后卫与辎重", badgeLabel: "后", icon: "cannon", offset: [-72, -12] }
];

const huangDefenseUnits: FormationUnit[] = [
  { id: "command", label: "黄兵团指挥部", badgeLabel: "黄", icon: "infantry", offset: [0, 0] },
  { id: "north", label: "北侧守军", badgeLabel: "七", icon: "infantry", offset: [-160, -18] },
  { id: "east", label: "东侧守军", badgeLabel: "七", icon: "infantry", offset: [-290, 18] },
  { id: "guns", label: "守军火力点", badgeLabel: "炮", icon: "cannon", offset: [-420, -16] }
];

const plaPursuitUnits: FormationUnit[] = [
  { id: "v1", label: "追击纵队", icon: "infantryPva", offset: [0, -16] },
  { id: "v2", label: "后续纵队", icon: "infantryPva", offset: [-34, 16] }
];

const plaAssaultUnits: FormationUnit[] = [
  { id: "assault-a", label: "突击队", icon: "infantryPva", offset: [0, -14] },
  { id: "assault-b", label: "后续梯队", icon: "infantryPva", offset: [-30, 14] }
];

const plaGunUnits: FormationUnit[] = [
  { id: "battery-a", label: "华野炮兵", icon: "cannon", offset: [0, -12] },
  { id: "battery-b", label: "迫击炮群", icon: "cannon", offset: [-30, 14] }
];

const reliefUnits: FormationUnit[] = [
  { id: "qiu-armour", label: "邱清泉兵团", badgeLabel: "邱", icon: "tankKorean", offset: [0, -14] },
  { id: "li-infantry", label: "李弥兵团", badgeLabel: "李", icon: "infantry", offset: [-36, 14] },
  { id: "relief-guns", label: "东援炮兵", badgeLabel: "炮", icon: "cannon", offset: [-72, -14] }
];

const blockingUnits: FormationUnit[] = [
  { id: "block-a", label: "阻援阵地", icon: "infantryPva", offset: [0, -18] },
  { id: "block-b", label: "反坦克火力", icon: "cannon", offset: [-38, 18] }
];

export const frontLines: FrontLine[] = [
  {
    id: "huang-xinan-west-withdrawal",
    faction: "nationalist",
    label: "黄百韬第七兵团由新安镇西撤",
    from: "xinanzhen",
    to: "nianzhuang",
    routeKind: "land",
    start: "1948-11-07T06:00",
    end: "1948-11-10T20:00",
    unitIcon: "infantry",
    formationUnits: huangWithdrawalColumn,
    waypoints: [
      [118.23, 34.355],
      [118.12, 34.335],
      [118.02, 34.315],
      [117.94, 34.3],
      [117.88, 34.292]
    ],
    visibleUntil: "1948-11-22T12:00",
    unitVisibleUntil: "1948-11-11T12:00"
  },
  {
    id: "huang-nianzhuang-defense-ring",
    faction: "nationalist",
    label: "第七兵团碾庄圩防御圈",
    from: "nianzhuang-west",
    to: "nianzhuang-west",
    routeKind: "land",
    start: "1948-11-10T20:00",
    end: "1948-11-11T12:00",
    unitIcon: "infantry",
    formationPrelude: [[117.93, 34.3], [117.88, 34.292]],
    formationUnits: huangDefenseUnits,
    waypoints: [
      [117.81, 34.337],
      [117.86, 34.36],
      [117.92, 34.335],
      [117.955, 34.29],
      [117.925, 34.245],
      [117.865, 34.225],
      [117.8, 34.242],
      [117.755, 34.282],
      [117.775, 34.285]
    ],
    visibleUntil: "1948-11-22T12:00",
    unitVisibleUntil: "1948-11-22T10:00"
  },
  {
    id: "pla-east-pursuit-main",
    faction: "communist",
    label: "华野东线急追",
    from: "east-pla-entry",
    to: "nianzhuang-east",
    routeKind: "land",
    start: "1948-11-06T18:00",
    end: "1948-11-10T20:00",
    unitIcon: "infantryPva",
    formationUnits: plaPursuitUnits,
    waypoints: [
      [118.29, 34.33],
      [118.16, 34.315],
      [118.02, 34.305],
      [117.95, 34.292]
    ],
    visibleUntil: "1948-11-22T12:00"
  },
  {
    id: "pla-north-pursuit",
    faction: "communist",
    label: "华野北线压向碾庄",
    from: "north-pla-entry",
    to: "nianzhuang-north",
    routeKind: "land",
    start: "1948-11-07T06:00",
    end: "1948-11-10T20:00",
    unitIcon: "infantryPva",
    formationUnits: plaPursuitUnits,
    waypoints: [
      [118.14, 34.42],
      [118.0, 34.39],
      [117.9, 34.36]
    ],
    visibleUntil: "1948-11-22T12:00"
  },
  {
    id: "pla-south-pursuit",
    faction: "communist",
    label: "华野南线截入水网",
    from: "south-pla-entry",
    to: "nianzhuang-south",
    routeKind: "land",
    start: "1948-11-07T12:00",
    end: "1948-11-10T20:00",
    unitIcon: "infantryPva",
    formationUnits: plaPursuitUnits,
    waypoints: [
      [118.05, 34.185],
      [117.94, 34.215],
      [117.87, 34.238]
    ],
    visibleUntil: "1948-11-22T12:00"
  },
  {
    id: "pla-southwest-closing-line",
    faction: "communist",
    label: "西南封口切断退路",
    from: "southwest-pla-entry",
    to: "nianzhuang-west",
    routeKind: "land",
    start: "1948-11-09T18:00",
    end: "1948-11-10T20:00",
    unitIcon: "infantryPva",
    formationUnits: plaPursuitUnits,
    waypoints: [
      [117.64, 34.18],
      [117.7, 34.235],
      [117.76, 34.282]
    ],
    visibleUntil: "1948-11-22T12:00"
  },
  {
    id: "xuzhou-relief-east",
    faction: "nationalist",
    label: "邱清泉、李弥兵团由徐州东援",
    from: "xuzhou",
    to: "relief-forward-edge",
    routeKind: "land",
    start: "1948-11-11T12:00",
    end: "1948-11-22T10:00",
    unitIcon: "tankKorean",
    formationUnits: reliefUnits,
    waypoints: [
      [117.3, 34.26],
      [117.42, 34.265],
      [117.53, 34.275],
      [117.62, 34.283]
    ],
    visibleUntil: "1948-11-22T12:00",
    unitVisibleUntil: "1948-11-22T10:00"
  },
  {
    id: "pla-relief-block-line",
    faction: "communist",
    label: "徐东阻援集团大许家一线",
    from: "northwest-block-entry",
    to: "southwest-block-entry",
    routeKind: "land",
    start: "1948-11-11T12:00",
    end: "1948-11-13T18:00",
    unitIcon: "infantryPva",
    formationUnits: blockingUnits,
    waypoints: [
      [117.52, 34.34],
      [117.56, 34.27],
      [117.51, 34.2],
      [117.45, 34.15]
    ],
    visibleUntil: "1948-11-22T12:00"
  },
  {
    id: "pla-relief-counterpush",
    faction: "communist",
    label: "阻援反冲击压回东援先头",
    from: "daxujia",
    to: "relief-forward-edge",
    routeKind: "land",
    start: "1948-11-13T18:00",
    end: "1948-11-20T18:00",
    unitIcon: "infantryPva",
    formationUnits: blockingUnits,
    waypoints: [
      [117.58, 34.31],
      [117.62, 34.285]
    ],
    visibleUntil: "1948-11-22T12:00"
  },
  {
    id: "pla-west-trench-approach",
    faction: "communist",
    label: "西侧对壕近迫",
    from: "zhoujiazhai",
    to: "nianzhuang-west",
    routeKind: "land",
    start: "1948-11-15T02:00",
    end: "1948-11-19T09:30",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultUnits,
    waypoints: [
      [117.77, 34.245],
      [117.765, 34.27],
      [117.775, 34.285]
    ],
    visibleUntil: "1948-11-22T12:00"
  },
  {
    id: "pla-north-trench-approach",
    faction: "communist",
    label: "北侧夜挖交通壕",
    from: "nianzhuang-north",
    to: "inner-pocket",
    routeKind: "land",
    start: "1948-11-15T02:00",
    end: "1948-11-19T09:30",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultUnits,
    waypoints: [
      [117.835, 34.335],
      [117.852, 34.315]
    ],
    visibleUntil: "1948-11-22T12:00"
  },
  {
    id: "pla-south-trench-approach",
    faction: "communist",
    label: "南侧水沟接敌",
    from: "nianzhuang-south",
    to: "inner-pocket",
    routeKind: "land",
    start: "1948-11-15T02:00",
    end: "1948-11-19T09:30",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultUnits,
    waypoints: [
      [117.855, 34.245],
      [117.862, 34.27]
    ],
    visibleUntil: "1948-11-22T12:00"
  },
  {
    id: "pla-east-trench-approach",
    faction: "communist",
    label: "东侧穿越村落水塘间隙",
    from: "nianzhuang-east",
    to: "inner-pocket",
    routeKind: "land",
    start: "1948-11-15T02:00",
    end: "1948-11-19T09:30",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultUnits,
    waypoints: [
      [117.925, 34.295],
      [117.895, 34.292]
    ],
    visibleUntil: "1948-11-22T12:00"
  },
  {
    id: "pla-artillery-zhoujiazhai",
    faction: "communist",
    label: "周家寨方向炮兵准备",
    from: "zhoujiazhai",
    to: "nianzhuang-west",
    routeKind: "land",
    start: "1948-11-18T18:00",
    end: "1948-11-19T12:00",
    unitIcon: "cannon",
    formationUnits: plaGunUnits,
    visibleUntil: "1948-11-22T12:00",
    unitVisibleUntil: "1948-11-19T22:00"
  },
  {
    id: "pla-general-assault-west",
    faction: "communist",
    label: "总攻西线突破第一道防线",
    from: "nianzhuang-west",
    to: "inner-pocket",
    routeKind: "land",
    start: "1948-11-19T09:45",
    end: "1948-11-19T22:00",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultUnits,
    waypoints: [
      [117.805, 34.287],
      [117.84, 34.29]
    ],
    visibleUntil: "1948-11-22T12:00"
  },
  {
    id: "pla-general-assault-north",
    faction: "communist",
    label: "总攻北线逐村争夺",
    from: "nianzhuang-north",
    to: "inner-pocket",
    routeKind: "land",
    start: "1948-11-19T09:45",
    end: "1948-11-20T12:00",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultUnits,
    waypoints: [
      [117.84, 34.33],
      [117.86, 34.31]
    ],
    visibleUntil: "1948-11-22T12:00"
  },
  {
    id: "pla-general-assault-south",
    faction: "communist",
    label: "总攻南线沿水沟压入",
    from: "nianzhuang-south",
    to: "inner-pocket",
    routeKind: "land",
    start: "1948-11-19T09:45",
    end: "1948-11-20T12:00",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultUnits,
    waypoints: [
      [117.852, 34.248],
      [117.865, 34.272]
    ],
    visibleUntil: "1948-11-22T12:00"
  },
  {
    id: "pla-general-assault-east",
    faction: "communist",
    label: "总攻东线切入内围",
    from: "nianzhuang-east",
    to: "inner-pocket",
    routeKind: "land",
    start: "1948-11-19T09:45",
    end: "1948-11-20T12:00",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultUnits,
    waypoints: [
      [117.92, 34.292],
      [117.89, 34.292]
    ],
    visibleUntil: "1948-11-22T12:00"
  },
  {
    id: "huang-inner-recoil",
    faction: "nationalist",
    label: "黄兵团残部退守内核",
    from: "nianzhuang-east",
    to: "inner-pocket",
    routeKind: "land",
    start: "1948-11-19T22:00",
    end: "1948-11-21T18:00",
    unitIcon: "infantry",
    formationUnits: [
      { id: "remnant-a", label: "残部内缩", badgeLabel: "七", icon: "infantry", offset: [0, -12] },
      { id: "remnant-gun", label: "残余火力", badgeLabel: "炮", icon: "cannon", offset: [-28, 14] }
    ],
    waypoints: [
      [117.91, 34.292],
      [117.89, 34.292],
      [117.872, 34.292]
    ],
    visibleUntil: "1948-11-22T12:00",
    unitVisibleUntil: "1948-11-22T08:00"
  },
  {
    id: "pla-final-compression-ring",
    faction: "communist",
    label: "华野压缩碾庄内核",
    from: "nianzhuang-west",
    to: "nianzhuang-east",
    routeKind: "land",
    start: "1948-11-20T12:00",
    end: "1948-11-21T18:00",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultUnits,
    waypoints: [
      [117.82, 34.33],
      [117.87, 34.325],
      [117.91, 34.305],
      [117.93, 34.29]
    ],
    visibleUntil: "1948-11-22T12:00"
  },
  {
    id: "huang-nizhuang-final-flight",
    faction: "nationalist",
    label: "黄百韬残部向倪庄逃散",
    from: "inner-pocket",
    to: "nizhuang",
    routeKind: "land",
    start: "1948-11-21T18:00",
    end: "1948-11-22T10:00",
    unitIcon: "infantry",
    formationUnits: [
      { id: "huang-command", label: "黄百韬残部", badgeLabel: "黄", icon: "infantry", offset: [0, -10] }
    ],
    waypoints: [[117.885, 34.275]],
    visibleUntil: "1948-11-22T12:00",
    unitVisibleUntil: "1948-11-22T10:00"
  },
  {
    id: "pla-nizhuang-pursuit",
    faction: "communist",
    label: "解放军追至倪庄",
    from: "inner-pocket",
    to: "nizhuang",
    routeKind: "land",
    start: "1948-11-21T20:00",
    end: "1948-11-22T10:00",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultUnits,
    waypoints: [[117.89, 34.268]],
    visibleUntil: "1948-11-22T12:00"
  }
];

export const historicalRegions: HistoricalRegion[] = [
  {
    id: "nianzhuang-pocket",
    label: "碾庄圩防御地域",
    className: "nianzhuang-pocket-region",
    labelCoordinates: [117.87, 34.355],
    coordinates: [
      [117.74, 34.25],
      [117.8, 34.37],
      [117.93, 34.36],
      [118.0, 34.29],
      [117.93, 34.22],
      [117.8, 34.21]
    ]
  },
  {
    id: "daxujia-blocking-zone",
    label: "徐东阻援地域",
    className: "nianzhuang-block-region",
    labelCoordinates: [117.48, 34.36],
    coordinates: [
      [117.36, 34.12],
      [117.5, 34.42],
      [117.64, 34.37],
      [117.62, 34.18],
      [117.5, 34.1]
    ]
  },
  {
    id: "waterlogged-villages",
    label: "村落水塘密集区",
    className: "nianzhuang-water-region",
    labelCoordinates: [118.02, 34.22],
    coordinates: [
      [117.86, 34.17],
      [118.08, 34.2],
      [118.15, 34.32],
      [117.99, 34.39],
      [117.86, 34.34]
    ]
  }
];

export const rivers: Array<{ id: string; label: string; points: Array<[number, number]> }> = [
  {
    id: "yunhe-water-net",
    label: "运河与水网",
    points: [
      [118.08, 34.48],
      [118.05, 34.42],
      [118.02, 34.36],
      [118.0, 34.31],
      [117.98, 34.25],
      [117.94, 34.18]
    ]
  },
  {
    id: "nianzhuang-ditches",
    label: "碾庄周边水沟",
    points: [
      [117.77, 34.33],
      [117.82, 34.31],
      [117.87, 34.3],
      [117.93, 34.27],
      [118.0, 34.25]
    ]
  },
  {
    id: "lowland-ponds",
    label: "村落水塘",
    points: [
      [117.79, 34.23],
      [117.86, 34.245],
      [117.92, 34.235],
      [118.02, 34.22]
    ]
  }
];

export const mapOverlays: MapOverlayElement[] = [
  {
    id: "longhai-rail",
    type: "wind",
    label: "陇海铁路 / 徐州-新安镇轴线",
    from: [117.18, 34.262],
    to: [118.36, 34.36],
    className: "rail-overlay",
    testId: "nianzhuang-longhai-rail"
  },
  {
    id: "xuzhou-relief-note",
    type: "marker",
    label: "东援止于大许家一线",
    subtitle: "距碾庄仍有约40-50华里口径",
    coordinates: [117.58, 34.315],
    revealAt: "1948-11-13T18:00",
    testId: "nianzhuang-relief-block-note"
  },
  {
    id: "trench-note",
    type: "marker",
    label: "纵横壕沟近迫",
    subtitle: "11月15日起隐藏接近",
    coordinates: [117.82, 34.255],
    revealAt: "1948-11-15T02:00",
    testId: "nianzhuang-trench-note"
  }
];

export const terrainZones = [
  {
    className: "nianzhuang-village-zone",
    coordinates: [117.875, 34.292] as [number, number],
    label: "碾庄圩村落工事",
    labelCoordinates: [117.885, 34.318] as [number, number],
    rx: 84,
    ry: 54
  },
  {
    className: "nianzhuang-water-zone",
    coordinates: [117.99, 34.275] as [number, number],
    label: "水沟水塘限制机动",
    labelCoordinates: [118.03, 34.295] as [number, number],
    rx: 96,
    ry: 52
  },
  {
    className: "nianzhuang-relief-zone",
    coordinates: [117.55, 34.27] as [number, number],
    label: "大许家阻援阵地",
    labelCoordinates: [117.49, 34.305] as [number, number],
    rx: 86,
    ry: 88
  }
];

export const battleEffects: BattleEffectElement[] = [
  {
    id: "relief-blocked-salvo",
    type: "salvo",
    start: "1948-11-13T18:00",
    end: "1948-11-14T12:00",
    from: [117.55, 34.3],
    to: [117.63, 34.285],
    fromRouteId: "pla-relief-block-line",
    toRouteId: "xuzhou-relief-east",
    label: "阻援炮火",
    testId: "nianzhuang-effect-relief-blocked"
  },
  {
    id: "opening-assault-salvo",
    type: "salvo",
    start: "1948-11-19T10:00",
    end: "1948-11-19T16:00",
    from: [117.78, 34.22],
    to: [117.80, 34.285],
    fromRouteId: "pla-artillery-zhoujiazhai",
    toRouteId: "huang-nianzhuang-defense-ring",
    label: "总攻炮火",
    testId: "nianzhuang-effect-general-assault"
  },
  {
    id: "first-line-break-salvo",
    type: "salvo",
    start: "1948-11-19T21:00",
    end: "1948-11-20T04:00",
    from: [117.805, 34.287],
    to: [117.855, 34.292],
    fromRouteId: "pla-general-assault-west",
    toRouteId: "huang-inner-recoil",
    label: "第一道防线突破",
    showShellTraces: false,
    testId: "nianzhuang-effect-first-line"
  },
  {
    id: "final-pocket-salvo",
    type: "salvo",
    start: "1948-11-21T18:00",
    end: "1948-11-22T08:00",
    from: [117.87, 34.3],
    to: [117.89, 34.26],
    fromRouteId: "pla-final-compression-ring",
    toRouteId: "huang-nizhuang-final-flight",
    label: "内核压缩",
    showShellTraces: false,
    testId: "nianzhuang-effect-final-pocket"
  }
];

export const battleEvents: BattleEvent[] = [
  {
    id: "campaign-opens",
    date: "1948-11-06T18:00",
    title: "淮海第一阶段发起",
    location: "徐州东侧新安镇地区",
    coordinates: [118.28, 34.36],
    phase: "追击发起",
    summary: "华东野战军按中央军委第一阶段重心歼灭黄百韬兵团的方针，对新安镇地区全线出击。",
    detail: "动画把东线、北线和南线追击同时展开，黄兵团尚在新安镇以西轴线上，战场重心从徐州东侧向碾庄圩转移。",
    significance: "这一节点决定战役不是静态围城，而是先追上、再合围、再攻坚。",
    mapFocus: ["xinanzhen", "east-pla-entry", "xuzhou"]
  },
  {
    id: "huang-withdraws",
    date: "1948-11-07T06:00",
    title: "黄百韬兵团西撤",
    location: "新安镇至碾庄圩轴线",
    coordinates: [118.12, 34.335],
    phase: "急行追击",
    summary: "黄百韬兵团撤离新安镇向徐州收缩，华野急行追击，不与小股敌人纠缠。",
    detail: "第七兵团撤退路线沿铁路/公路水网轴线西行，华野北、东、南三路紧追，路线不穿越水网密集处和村落防线。",
    significance: "撤退路线和追击路线必须连续呈现，避免后续防御圈像凭空出现。",
    mapFocus: ["xinanzhen", "canal-bridge", "nianzhuang"]
  },
  {
    id: "pocket-closes",
    date: "1948-11-10T20:00",
    title: "碾庄圩合围形成",
    location: "碾庄圩周边",
    coordinates: [117.86, 34.29],
    phase: "合围",
    summary: "黄百韬兵团被压入距徐州不到50公里的碾庄圩一带，华野多路形成包围。",
    detail: "撤退纵队在碾庄圩转换为防御圈，华野西南封口接上，北、东、南方向不再只是追击，而是围住防御地域。",
    significance: "这是运动战转入攻坚战的分界点，也解释后面为何出现完整防御阵地。",
    mapFocus: ["nianzhuang", "nianzhuang-west", "zhoujiazhai"]
  },
  {
    id: "hold-and-relief",
    date: "1948-11-11T12:00",
    title: "固守待援与徐州东援",
    location: "碾庄圩、徐州至大许家",
    coordinates: [117.72, 34.285],
    phase: "围歼与救援并行",
    summary: "黄百韬接令就地抵抗，邱清泉、李弥兵团由徐州向东增援。",
    detail: "动画同时保留碾庄防御圈和徐州东援路线：东援部队从徐州出现，沿徐州至大许家轴线推进，不会直接跳到碾庄附近。",
    significance: "碾庄攻坚能否完成，关键取决于徐东阻援是否挡住邱李两兵团。",
    mapFocus: ["huang-nianzhuang-defense-ring", "xuzhou-relief-east", "pla-relief-block-line"]
  },
  {
    id: "relief-blocked",
    date: "1948-11-13T18:00",
    title: "大许家阻援线钉住东援",
    location: "大许家一线",
    coordinates: [117.56, 34.28],
    phase: "徐东阻击",
    summary: "阻援集团把邱清泉、李弥挡在大许家一线，东援先头距碾庄仍有距离。",
    detail: "东援箭头止于大许家以东的受阻点，华野阻援线和反冲击与其正面相接，避免出现穿过阻援线却没有战斗的画面。",
    significance: "这使黄百韬兵团从等待救援转为被孤立消耗。",
    mapFocus: ["xuzhou-relief-east", "pla-relief-block-line", "daxujia"]
  },
  {
    id: "trench-approach",
    date: "1948-11-15T02:00",
    title: "对壕近迫开始",
    location: "碾庄圩四周",
    coordinates: [117.83, 34.285],
    phase: "攻坚准备",
    summary: "14日晚会议后，华野停止急攻，15日凌晨开始大规模挖壕，隐藏接近守军阵地。",
    detail: "四条短促对壕路线从西、北、南、东压向防御圈，但尚未穿越第一道防线；守军仍在完整防御圈内。",
    significance: "时间线上先有防御圈，再有壕沟近迫，之后队形才被逐点压碎。",
    mapFocus: ["pla-west-trench-approach", "pla-north-trench-approach", "huang-nianzhuang-defense-ring"]
  },
  {
    id: "village-by-village",
    date: "1948-11-17T20:00",
    title: "村落水沟反复争夺",
    location: "碾庄圩外围阵地",
    coordinates: [117.88, 34.275],
    phase: "逐点争夺",
    summary: "村落、水塘、水沟有利于防守，外围阵地反复争夺，华野继续把壕沟推近。",
    detail: "这一段不让双方互相穿过：华野壕线停在外围，黄兵团防御圈仍可见，炮火和战斗效果只在双方路线相接处出现。",
    significance: "表现碾庄圩之战艰苦、迟滞和攻坚属性，而不是一次简单平推。",
    mapFocus: ["nianzhuang", "pla-east-trench-approach", "huang-nianzhuang-defense-ring"]
  },
  {
    id: "general-assault",
    date: "1948-11-19T10:00",
    title: "粟裕下达总攻令",
    location: "周家寨至碾庄圩",
    coordinates: [117.8, 34.285],
    phase: "总攻",
    summary: "19日上午10时，粟裕在周家寨下达总攻碾庄圩令，炮声和突击同时压向守军防线。",
    detail: "西、北、南、东四路突击从壕线跃出，炮兵效果绑定周家寨炮兵和守军防御圈，冲击点上同时存在双方单位。",
    significance: "这是从近迫作业转为全面攻坚的时间锚点。",
    mapFocus: ["pla-artillery-zhoujiazhai", "pla-general-assault-west", "huang-nianzhuang-defense-ring"]
  },
  {
    id: "first-line-broken",
    date: "1948-11-19T22:00",
    title: "第一道防线被突破",
    location: "碾庄圩西侧至内围",
    coordinates: [117.835, 34.29],
    phase: "突破",
    summary: "19日晚10时，华野突破敌第一道防线，继续向第二道防线和内核猛扑。",
    detail: "突破后黄兵团路线由外圈收缩为内核退守，旧防御单位不再站在已被突破的西侧；华野突击线接入碾庄内围。",
    significance: "这解释后续‘队列碎裂’的前提：先有阵地，再被突破压缩。",
    mapFocus: ["pla-general-assault-west", "huang-inner-recoil", "inner-pocket"]
  },
  {
    id: "final-pocket",
    date: "1948-11-21T18:00",
    title: "碾庄内核被压缩",
    location: "碾庄圩内核",
    coordinates: [117.872, 34.292],
    phase: "内围压缩",
    summary: "华野从外围和已突破方向继续压缩，黄兵团残部退入碾庄内核，救援仍被阻在西侧。",
    detail: "画面同时显示三件事：东援路线仍停在大许家，华野压缩环逼近内核，黄兵团残部尚未消失而是向内收缩。",
    significance: "把围歼、阻援和最终追击放在同一张大地图上，避免单线叙事误导。",
    mapFocus: ["pla-final-compression-ring", "huang-inner-recoil", "xuzhou-relief-east"]
  },
  {
    id: "huang-end",
    date: "1948-11-22T10:00",
    title: "倪庄终局",
    location: "倪庄附近",
    coordinates: [117.905, 34.25],
    phase: "终局",
    summary: "黄百韬逃至倪庄附近，在彻底绝望中自戕；碾庄圩围歼战结束。",
    detail: "最终路线从碾庄内核连续通向倪庄，解放军追击线在后方压上；除终局被歼灭的残部外，其他作战线保持可读的历史轨迹。",
    significance: "碾庄圩之战完成淮海战役第一阶段决定性胜利，徐州集团东侧主力被切除。",
    mapFocus: ["huang-nizhuang-final-flight", "pla-nizhuang-pursuit", "nizhuang"]
  }
];

export const cueEventIds = new Set([
  "campaign-opens",
  "huang-withdraws",
  "pocket-closes",
  "hold-and-relief",
  "relief-blocked",
  "trench-approach",
  "village-by-village",
  "general-assault",
  "first-line-broken",
  "final-pocket",
  "huang-end"
]);

export const cueEventKinds = {
  "campaign-opens": "cannon",
  "huang-withdraws": "cannon",
  "pocket-closes": "cannon",
  "hold-and-relief": "cannon",
  "relief-blocked": "combined",
  "trench-approach": "cannon",
  "village-by-village": "combined",
  "general-assault": "combined",
  "first-line-broken": "combined",
  "final-pocket": "combined",
  "huang-end": "cannon"
} as const;
