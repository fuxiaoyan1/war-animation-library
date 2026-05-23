import type { BattleEvent, FormationUnit, FrontLine, MapPoint } from "./battleOfFrance";

export const campaignStart = "1943-03-01T08:00";
export const campaignEnd = "1943-03-04T18:00";

export const mapPoints: MapPoint[] = [
  { id: "rabaul", label: "拉包尔", coordinates: [152.165, -4.2], kind: "port" },
  { id: "rabaul-roadstead", label: "拉包尔外海锚地", coordinates: [153.35, -1.9], kind: "port" },
  { id: "cape-gloucester", label: "格洛斯特角", coordinates: [148.42, -5.45], kind: "front" },
  { id: "bismarck-sea", label: "俾斯麦海", coordinates: [148.4, -6.1], kind: "front" },
  { id: "vitiaz-strait", label: "维蒂亚兹海峡", coordinates: [146.85, -5.25], kind: "front", revealAt: "1943-03-03T11:50" },
  { id: "lae", label: "莱城", coordinates: [146.99, -6.73], kind: "port" },
  { id: "lae-approach", label: "莱城外海", coordinates: [146.55, -5.3], kind: "front", revealAt: "1943-03-03T11:50" },
  { id: "convoy-breakup-sea", label: "船队瓦解海域", coordinates: [147.05, -5.15], kind: "front", revealAt: "1943-03-03T11:50" },
  { id: "finschhafen", label: "芬什港", coordinates: [147.86, -6.6], kind: "port" },
  { id: "port-moresby", label: "莫尔兹比港", coordinates: [147.18, -9.44], kind: "port" },
  { id: "dobodura", label: "多博杜拉机场群", coordinates: [148.38, -8.75], kind: "front" },
  { id: "convoy-sighting", label: "侦察接触区", coordinates: [149.2769, -2.3591], kind: "front", revealAt: "1943-03-02T12:00" },
  { id: "skip-bombing-zone", label: "跳弹轰炸区", coordinates: [148.0028, -5.1106], kind: "front", revealAt: "1943-03-03T10:30" }
];

const japaneseConvoy: FormationUnit[] = [
  { id: "transport-1", label: "运输船队", badgeLabel: "日", icon: "ww2TransportShip", offset: [-8, 0] },
  { id: "escort-1", label: "护航舰", badgeLabel: "日", icon: "ww2EscortShip", offset: [-25, 0] },
  { id: "transport-2", label: "后队", badgeLabel: "日", icon: "ww2TransportShip", offset: [-44, 0] }
];

const alliedAttackWave: FormationUnit[] = [
  { id: "b25-a", label: "B-25 低空", badgeLabel: "盟", icon: "ww2AttackAircraft", offset: [0, 0] },
  { id: "b25-b", label: "扫射压制", badgeLabel: "盟", icon: "ww2AttackAircraft", offset: [-20, -10] },
  { id: "a20-a", label: "A-20 攻击", badgeLabel: "盟", icon: "ww2AttackAircraft", offset: [-40, 13] },
  { id: "fighter-cover", label: "战斗机掩护", badgeLabel: "盟", icon: "ww2Fighter", offset: [-60, -19] }
];

const highBomberWave: FormationUnit[] = [
  { id: "b17-a", label: "高空轰炸", badgeLabel: "盟", icon: "ww2Bomber", offset: [0, 0] },
  { id: "b17-b", label: "延迟投弹", badgeLabel: "盟", icon: "ww2Bomber", offset: [-35, 16] }
];

export const frontLines: FrontLine[] = [
  {
    id: "japanese-convoy-rabaul-lae",
    faction: "germany",
    label: "日军运输船队南下",
    from: "rabaul-roadstead",
    to: "convoy-breakup-sea",
    routeKind: "sea",
    start: "1943-03-01T08:00",
    end: "1943-03-03T18:00",
    unitIcon: "ww2TransportShip",
    formationUnits: japaneseConvoy,
    waypoints: [
      [152.4, -1.55],
      [150.8, -1.55],
      [149.2769, -2.3591],
      [148.7, -4.9],
      [148.2686, -5.1637],
      [148.0028, -5.1106],
      [147.05, -5.15]
    ],
    visibleUntil: "1943-03-04T18:00",
    unitVisibleUntil: "1943-03-03T12:30"
  },
  {
    id: "allied-search-shadow",
    faction: "allies",
    label: "盟军侦察接触后返航",
    from: "dobodura",
    to: "dobodura",
    routeKind: "air",
    start: "1943-03-02T08:30",
    end: "1943-03-02T15:30",
    unitIcon: "ww2Fighter",
    formationUnits: [
      { id: "recon-a", label: "侦察", badgeLabel: "盟", icon: "ww2Fighter", offset: [0, 0] },
      { id: "recon-b", label: "跟踪", badgeLabel: "盟", icon: "ww2Fighter", offset: [-30, 14], hiddenUntil: "1943-03-02T12:00" }
    ],
    waypoints: [
      [149.2769, -2.3591],
      [149.1, -4.2],
      [148.75, -6.6],
      [148.38, -8.75]
    ],
    visibleUntil: "1943-03-04T18:00",
    unitVisibleUntil: "1943-03-02T15:30"
  },
  {
    id: "high-level-bombing-wave",
    faction: "allies",
    label: "高空轰炸后返航",
    from: "port-moresby",
    to: "port-moresby",
    routeKind: "air",
    start: "1943-03-03T09:00",
    end: "1943-03-03T11:20",
    unitIcon: "ww2Bomber",
    formationUnits: highBomberWave,
    waypoints: [
      [147.8, -8.1],
      [148.2, -6.9],
      [148.2686, -5.1637],
      [147.95, -5.35],
      [147.8, -7.8],
      [147.18, -9.44]
    ],
    visibleUntil: "1943-03-04T18:00",
    unitVisibleUntil: "1943-03-03T11:15"
  },
  {
    id: "skip-bombing-attack",
    faction: "allies",
    label: "低空扫射与跳弹轰炸",
    from: "dobodura",
    to: "dobodura",
    routeKind: "air",
    start: "1943-03-03T10:30",
    end: "1943-03-03T13:10",
    unitIcon: "ww2AttackAircraft",
    formationUnits: alliedAttackWave,
    waypoints: [
      [148.1, -7.9],
      [147.4, -6.6],
      [147.3, -5.65],
      [148.0028, -5.1106],
      [147.25, -5.8],
      [147.55, -6.8],
      [148.38, -8.75]
    ],
    visibleUntil: "1943-03-04T18:00",
    unitVisibleUntil: "1943-03-03T13:15"
  },
  {
    id: "convoy-breakup",
    faction: "germany",
    label: "船队被打散",
    from: "convoy-breakup-sea",
    to: "lae-approach",
    routeKind: "sea",
    start: "1943-03-03T11:50",
    end: "1943-03-04T08:00",
    unitIcon: "ww2TransportShip",
    formationUnits: [
      { id: "scatter-1", label: "残存船只", badgeLabel: "日", icon: "ww2TransportShip", offset: [-8, 0] },
      { id: "scatter-2", label: "失序转向", badgeLabel: "日", icon: "ww2EscortShip", offset: [-34, 0] }
    ],
    waypoints: [
      [146.9, -5.1],
      [146.7, -5.18],
      [146.55, -5.3]
    ],
    visibleUntil: "1943-03-04T18:00",
    unitVisibleUntil: "1943-03-04T08:00"
  },
  {
    id: "mopping-up-strikes",
    faction: "allies",
    label: "连续追击与补充攻击",
    from: "dobodura",
    to: "dobodura",
    routeKind: "air",
    start: "1943-03-04T08:00",
    end: "1943-03-04T15:00",
    unitIcon: "ww2AttackAircraft",
    formationUnits: alliedAttackWave,
    waypoints: [
      [147.95, -7.55],
      [147.45, -6.2],
      [146.55, -5.3],
      [147.2, -6.2],
      [148.38, -8.75]
    ],
    visibleUntil: "1943-03-04T18:00",
    unitVisibleUntil: "1943-03-04T15:45"
  },
  {
    id: "mopping-up-return",
    faction: "allies",
    label: "追击机群返航收束",
    from: "lae-approach",
    to: "dobodura",
    routeKind: "air",
    start: "1943-03-04T15:00",
    end: "1943-03-04T18:00",
    unitIcon: "ww2AttackAircraft",
    formationUnits: [
      { id: "return-b25", label: "低空返航", badgeLabel: "盟", icon: "ww2AttackAircraft", offset: [0, 0] },
      { id: "return-fighter", label: "掩护返航", badgeLabel: "盟", icon: "ww2Fighter", offset: [-24, -14] }
    ],
    waypoints: [
      [147.15, -5.75],
      [147.72, -6.85],
      [148.0, -7.8]
    ],
    visibleUntil: "1943-03-04T18:00",
    unitVisibleFrom: "1943-03-04T15:00",
    unitVisibleUntil: "1943-03-04T18:00"
  }
];

export const battleEvents: BattleEvent[] = [
  {
    id: "convoy-departs-rabaul",
    date: "1943-03-01T08:00",
    title: "日军船队从拉包尔出航",
    location: "拉包尔至莱城航线",
    coordinates: [152.165, -4.2],
    phase: "运输企图",
    summary: "日军试图把兵力和物资运往新几内亚莱城，加强当地防御。",
    detail: "俾斯麦海海战的核心不是舰队炮战，而是陆基航空兵对海上运输线的截击。船队从拉包尔出航后进入可被盟军航空兵搜索和攻击的海域。",
    significance: "它适合补足空战动画中的反舰样式：空中侦察、波次攻击、低空扫射和跳弹轰炸共同决定海上战役结果。",
    mapFocus: ["rabaul-roadstead", "lae", "bismarck-sea"]
  },
  {
    id: "recon-contact",
    date: "1943-03-02T12:00",
    title: "盟军侦察发现并跟踪船队",
    location: "俾斯麦海北部",
    coordinates: [149.2769, -2.3591],
    phase: "发现与跟踪",
    summary: "盟军侦察机发现船队，并为后续打击组织提供航向和位置。",
    detail: "大规模空袭不是凭空出现。侦察接触让攻击波次能在正确时间压到船队上空，动画中保留侦察航迹作为后续攻击的引导线。",
    significance: "空战自由度首先来自信息优势：知道目标在哪里，才能组织高低空、多方向的攻击。",
    mapFocus: ["dobodura", "convoy-sighting", "bismarck-sea"]
  },
  {
    id: "convoy-shadowing-continues",
    date: "1943-03-02T18:00",
    title: "船队继续南下，攻击波待命",
    location: "俾斯麦海北部",
    coordinates: [149.2769, -2.3591],
    phase: "跟踪与待机",
    summary: "侦察机返航后，船队仍沿海上航线南下；盟军机场准备次日攻击波。",
    detail: "这一节点不把飞机长期留场，而是让侦察航迹保留、船队继续移动。这样能解释为什么侦察机返航后目标没有消失，次日攻击波可以按船队新位置展开。",
    significance: "空战动画不能靠飞机常驻填满画面，目标运动和已保留航迹同样要支撑战役连续性。",
    mapFocus: ["convoy-sighting", "bismarck-sea", "dobodura"]
  },
  {
    id: "coordinated-air-attack",
    date: "1943-03-03T10:05",
    title: "高空轰炸先压迫船队",
    location: "俾斯麦海",
    coordinates: [148.2686, -5.1637],
    phase: "协同攻击",
    summary: "盟军先以高空轰炸迫使船队机动，低空攻击波随后进入。",
    detail: "这一段只显示高空轰炸和船队机动，不提前显示跳弹/集火线。高空机群先从船队上空压过，低空 B-25/A-20 沿海面突入、扫射压制和跳弹轰炸放到下一节点。",
    significance: "俾斯麦海海战成为空中力量摧毁海上运输的经典案例，也体现战术创新与训练准备的价值。",
    mapFocus: ["bismarck-sea", "skip-bombing-zone", "dobodura"]
  },
  {
    id: "skip-bombing-breakup",
    date: "1943-03-03T11:50",
    title: "跳弹轰炸撕裂船队",
    location: "维蒂亚兹海峡方向",
    coordinates: [148.0028, -5.1106],
    phase: "船队瓦解",
    summary: "低空攻击使运输船队失去队形，残存舰船分散转向。",
    detail: "这里要重点表现集群撕裂：日军船队从连续航迹变成几条短分散路线，盟军攻击波从不同高度和方向交错进入。空战不使用舰炮式集火线，跳弹轰炸以机群贴近船队、扫射音效和船队瓦解路线表达。",
    significance: "它把空中自由度转化为海上结果，说明空军可通过攻击节奏和角度控制敌方队形。",
    mapFocus: ["skip-bombing-zone", "vitiaz-strait", "lae-approach"]
  },
  {
    id: "mopping-up",
    date: "1943-03-04T11:30",
    title: "后续追击终结运输企图",
    location: "莱城外海",
    coordinates: [146.55, -5.3],
    phase: "追击收束",
    summary: "盟军继续攻击残余船只和落水救援目标，日军向莱城增援的海上企图失败。",
    detail: "末段不应让双方停在地图上。残余船队继续向莱城外海分散，盟军攻击波先压到残余船只上空，再沿新几内亚机场方向返航，航迹保留显示连续压力。",
    significance: "日本在新几内亚方向的海上补给受到重创，盟军航空兵证明了对海上交通线的决定性威胁。",
    mapFocus: ["vitiaz-strait", "lae-approach", "dobodura"]
  }
];

export const cueEventIds = new Set(["coordinated-air-attack", "skip-bombing-breakup", "mopping-up"]);
export const cueEventKinds = {
  "coordinated-air-attack": "bombing",
  "skip-bombing-breakup": "strafing",
  "mopping-up": "airCombat"
} as const;
export const diveCueEventIds = new Set<string>();
