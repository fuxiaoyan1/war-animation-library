import type { BattleEvent, FormationUnit, FrontLine, MapPoint } from "./battleOfFrance";

export const campaignStart = "1943-03-16T03:30";
export const campaignEnd = "1943-03-20T12:00";

export const mapPoints: MapPoint[] = [
  { id: "newfoundland-approach", label: "纽芬兰以东航路", coordinates: [-44.15, 51.2], kind: "front" },
  { id: "western-air-gap", label: "中大西洋空隙西缘", coordinates: [-45.1, 51.3], kind: "front" },
  { id: "mid-atlantic-gap", label: "中大西洋空隙", coordinates: [-37.2, 52.3], kind: "front" },
  { id: "western-approaches", label: "西部入口方向", coordinates: [-28.0, 54.0], kind: "front" },
  { id: "iceland-patrol-base", label: "冰岛巡逻方向", coordinates: [-21.7, 63.4], kind: "port" },
  { id: "northern-ireland-patrol-base", label: "北爱尔兰巡逻方向", coordinates: [-6.2, 55.0], kind: "port" },
  { id: "hx229-contact", label: "HX 229 首次接触", coordinates: [-43.85, 51.25], kind: "front", revealAt: "1943-03-16T03:30" },
  { id: "raubgraf-line", label: "Raubgraf 狼群线", coordinates: [-42.7, 51.55], kind: "front", revealAt: "1943-03-16T12:00" },
  { id: "sturmer-dranger-line", label: "Sturmer / Dranger 狼群线", coordinates: [-37.8, 52.45], kind: "front", revealAt: "1943-03-17T00:30" },
  { id: "sc122-contact", label: "SC 122 被 U-338 发现", coordinates: [-38.65, 52.7], kind: "front", revealAt: "1943-03-17T00:30" },
  { id: "hx229-night-attack", label: "HX 229 夜间鱼雷攻击", coordinates: [-40.95, 51.75], kind: "objective", revealAt: "1943-03-17T00:30" },
  { id: "sc122-night-attack", label: "SC 122 夜间鱼雷攻击", coordinates: [-38.75, 52.68], kind: "objective", revealAt: "1943-03-17T00:45" },
  { id: "liberator-patrol-zone", label: "VLR Liberator 巡逻进入", coordinates: [-35.4, 54.0], kind: "front", revealAt: "1943-03-17T12:00" },
  { id: "second-night-attack", label: "第二夜持续攻击", coordinates: [-33.6, 53.1], kind: "objective", revealAt: "1943-03-18T22:00" },
  { id: "u384-sinking", label: "U-384 被飞机击沉", coordinates: [-26.25, 54.3], kind: "objective", revealAt: "1943-03-19T17:45" },
  { id: "attack-discontinued", label: "U 艇攻击终止", coordinates: [-23.8, 53.8], kind: "front", revealAt: "1943-03-19T23:00" }
];

const hx229Convoy: FormationUnit[] = [
  { id: "hx-merchant-a", label: "HX 229 商船队", badgeLabel: "盟", icon: "ww2TransportShip", offset: [0, -12] },
  { id: "hx-merchant-b", label: "后续商船", badgeLabel: "盟", icon: "ww2TransportShip", offset: [-32, 12] },
  { id: "hx-escort-a", label: "B-4 护航舰", badgeLabel: "英", faction: "britain", icon: "ww2EscortShip", offset: [-64, -18] },
  { id: "hx-escort-b", label: "增援护航", badgeLabel: "盟", icon: "ww2EscortShip", offset: [-96, 16], hiddenUntil: "1943-03-18T08:00" }
];

const sc122Convoy: FormationUnit[] = [
  { id: "sc-merchant-a", label: "SC 122 慢船队", badgeLabel: "盟", icon: "ww2TransportShip", offset: [0, 12] },
  { id: "sc-merchant-b", label: "掉队商船", badgeLabel: "盟", icon: "ww2TransportShip", offset: [-34, -12] },
  { id: "sc-escort-a", label: "B-5 护航舰", badgeLabel: "英", faction: "britain", icon: "ww2EscortShip", offset: [-68, 18] },
  { id: "sc-escort-b", label: "护航增援", badgeLabel: "盟", icon: "ww2EscortShip", offset: [-102, -16], hiddenUntil: "1943-03-19T08:00" }
];

const raubgrafSubmarines: FormationUnit[] = [
  { id: "u653", label: "U-653 接触", badgeLabel: "U", icon: "ww2Submarine", offset: [0, -12] },
  { id: "u603", label: "U-603", badgeLabel: "U", icon: "ww2Submarine", offset: [-28, 12] },
  { id: "u600", label: "U-600", badgeLabel: "U", icon: "ww2Submarine", offset: [-56, -8] }
];

const sturmerSubmarines: FormationUnit[] = [
  { id: "u338", label: "U-338", badgeLabel: "U", icon: "ww2Submarine", offset: [0, 12] },
  { id: "u523", label: "U-523", badgeLabel: "U", icon: "ww2Submarine", offset: [-32, -12] },
  { id: "u305", label: "U-305", badgeLabel: "U", icon: "ww2Submarine", offset: [-64, 14] }
];

const drangerSubmarines: FormationUnit[] = [
  { id: "u221", label: "U-221", badgeLabel: "U", icon: "ww2Submarine", offset: [0, -12] },
  { id: "u333", label: "U-333", badgeLabel: "U", icon: "ww2Submarine", offset: [-32, 14] },
  { id: "u666", label: "U-666", badgeLabel: "U", icon: "ww2Submarine", offset: [-64, -16] }
];

const liberatorPatrol: FormationUnit[] = [
  { id: "liberator-a", label: "VLR Liberator", badgeLabel: "RAF", icon: "ww2Bomber", offset: [0, -12] },
  { id: "liberator-b", label: "巡逻机", badgeLabel: "RAF", icon: "ww2Bomber", offset: [-28, 12], hiddenUntil: "1943-03-17T12:00" }
];

const u384Submarine: FormationUnit[] = [
  { id: "u384", label: "U-384", badgeLabel: "U", icon: "ww2Submarine", offset: [0, -12] }
];

export const frontLines: FrontLine[] = [
  {
    id: "hx229-convoy-track",
    faction: "allies",
    label: "HX 229 快船队东航",
    from: "newfoundland-approach",
    to: "western-approaches",
    routeKind: "sea",
    start: "1943-03-16T03:30",
    end: "1943-03-20T12:00",
    unitIcon: "ww2TransportShip",
    formationUnits: hx229Convoy,
    waypoints: [
      [-43.85, 51.25],
      [-43.2, 51.35],
      [-40.95, 51.75],
      [-38.2, 52.05],
      [-33.6, 53.1],
      [-28.1, 53.6],
      [-28.0, 54.0]
    ],
    visibleUntil: "1943-03-20T12:00"
  },
  {
    id: "sc122-convoy-track",
    faction: "britain",
    label: "SC 122 慢船队东航",
    from: "newfoundland-approach",
    to: "western-approaches",
    routeKind: "sea",
    start: "1943-03-16T03:30",
    end: "1943-03-20T12:00",
    unitIcon: "ww2TransportShip",
    formationUnits: sc122Convoy,
    waypoints: [
      [-41.7, 52.1],
      [-40.2, 52.35],
      [-38.65, 52.7],
      [-38.2, 52.85],
      [-36.2, 52.95],
      [-33.6, 53.1],
      [-29.2, 53.7],
      [-28.0, 54.0]
    ],
    visibleUntil: "1943-03-20T12:00"
  },
  {
    id: "raubgraf-hx229-contact",
    faction: "germany",
    label: "Raubgraf 狼群追上 HX 229",
    from: "raubgraf-line",
    to: "hx229-night-attack",
    routeKind: "sea",
    start: "1943-03-16T03:30",
    end: "1943-03-17T06:00",
    unitIcon: "ww2Submarine",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "raubgraf-wolfpack",
    formationUnits: raubgrafSubmarines,
    waypoints: [
      [-43.9, 50.9],
      [-43.85, 51.25],
      [-42.5, 51.45],
      [-40.95, 51.75]
    ],
    visibleUntil: "1943-03-20T12:00"
  },
  {
    id: "sturmer-sc122-attack",
    faction: "germany",
    label: "Sturmer 线截住 SC 122",
    from: "sturmer-dranger-line",
    to: "sc122-night-attack",
    routeKind: "sea",
    start: "1943-03-16T20:00",
    end: "1943-03-17T07:30",
    unitIcon: "ww2Submarine",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "sturmer-wolfpack",
    formationUnits: sturmerSubmarines,
    waypoints: [
      [-39.2, 52.75],
      [-38.85, 52.68],
      [-38.75, 52.68]
    ],
    visibleUntil: "1943-03-20T12:00"
  },
  {
    id: "dranger-hx229-converge",
    faction: "germany",
    label: "Dranger 从前方压向船队",
    from: "sturmer-dranger-line",
    to: "hx229-night-attack",
    routeKind: "sea",
    start: "1943-03-16T14:00",
    end: "1943-03-17T08:30",
    unitIcon: "ww2Submarine",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "dranger-wolfpack",
    formationUnits: drangerSubmarines,
    waypoints: [
      [-38.0, 52.0],
      [-39.8, 51.8],
      [-40.95, 51.75]
    ],
    visibleUntil: "1943-03-20T12:00"
  },
  {
    id: "u384-continuous-track",
    faction: "germany",
    label: "U-384 单艇持续航迹",
    from: "sturmer-dranger-line",
    to: "u384-sinking",
    routeKind: "sea",
    start: "1943-03-16T03:30",
    end: "1943-03-19T17:45",
    unitIcon: "ww2Submarine",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "u384-submarine",
    formationUnits: u384Submarine,
    waypoints: [
      [-39.2, 52.75],
      [-38.85, 52.68],
      [-38.75, 52.68],
      [-36.6, 52.8],
      [-33.6, 53.1],
      [-30.2, 53.7],
      [-28.2, 54.05]
    ],
    visibleUntil: "1943-03-20T12:00",
    unitVisibleUntil: "1943-03-19T17:45"
  },
  {
    id: "u384-sunk-track",
    faction: "germany",
    label: "U-384 击沉后航迹保留",
    from: "u384-sinking",
    to: "u384-sinking",
    routeKind: "sea",
    hideUnit: true,
    start: "1943-03-19T17:45",
    end: "1943-03-20T12:00",
    unitIcon: "ww2Submarine",
    visibleUntil: "1943-03-20T12:00"
  },
  {
    id: "raubgraf-second-night-shadow",
    faction: "germany",
    label: "Raubgraf 持续跟踪东航船队",
    from: "hx229-night-attack",
    to: "second-night-attack",
    routeKind: "sea",
    start: "1943-03-17T06:00",
    end: "1943-03-19T02:00",
    unitIcon: "ww2Submarine",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "raubgraf-wolfpack",
    formationUnits: raubgrafSubmarines,
    waypoints: [
      [-39.6, 51.95],
      [-36.8, 52.6],
      [-34.3, 53.0]
    ],
    visibleUntil: "1943-03-20T12:00"
  },
  {
    id: "sturmer-second-night-shadow",
    faction: "germany",
    label: "Sturmer 随 SC 122 东移",
    from: "sc122-night-attack",
    to: "second-night-attack",
    routeKind: "sea",
    start: "1943-03-17T07:30",
    end: "1943-03-19T02:00",
    unitIcon: "ww2Submarine",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "sturmer-wolfpack",
    formationUnits: sturmerSubmarines,
    waypoints: [
      [-37.6, 52.75],
      [-35.4, 53.0],
      [-33.6, 53.1]
    ],
    visibleUntil: "1943-03-20T12:00"
  },
  {
    id: "dranger-second-night-shadow",
    faction: "germany",
    label: "Dranger 从侧翼继续压迫",
    from: "hx229-night-attack",
    to: "second-night-attack",
    routeKind: "sea",
    start: "1943-03-17T08:30",
    end: "1943-03-19T02:00",
    unitIcon: "ww2Submarine",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "dranger-wolfpack",
    formationUnits: drangerSubmarines,
    waypoints: [
      [-39.0, 52.2],
      [-36.5, 52.75],
      [-33.6, 53.1]
    ],
    visibleUntil: "1943-03-20T12:00"
  },
  {
    id: "raubgraf-disengagement",
    faction: "germany",
    label: "Raubgraf 向东脱离",
    from: "second-night-attack",
    to: "attack-discontinued",
    routeKind: "sea",
    start: "1943-03-19T02:00",
    end: "1943-03-20T12:00",
    unitIcon: "ww2Submarine",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "raubgraf-wolfpack",
    formationUnits: raubgrafSubmarines,
    waypoints: [
      [-31.2, 53.2],
      [-27.4, 53.55]
    ],
    visibleUntil: "1943-03-20T12:00"
  },
  {
    id: "sturmer-disengagement",
    faction: "germany",
    label: "Sturmer 中断攻击",
    from: "second-night-attack",
    to: "attack-discontinued",
    routeKind: "sea",
    start: "1943-03-19T02:00",
    end: "1943-03-20T12:00",
    unitIcon: "ww2Submarine",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "sturmer-wolfpack",
    formationUnits: sturmerSubmarines,
    waypoints: [
      [-31.0, 53.0],
      [-27.6, 53.35]
    ],
    visibleUntil: "1943-03-20T12:00"
  },
  {
    id: "dranger-disengagement",
    faction: "germany",
    label: "Dranger 脱离船队航路",
    from: "second-night-attack",
    to: "attack-discontinued",
    routeKind: "sea",
    start: "1943-03-19T02:00",
    end: "1943-03-20T12:00",
    unitIcon: "ww2Submarine",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "dranger-wolfpack",
    formationUnits: drangerSubmarines,
    waypoints: [
      [-31.4, 53.45],
      [-27.8, 53.75]
    ],
    visibleUntil: "1943-03-20T12:00"
  },
  {
    id: "vlr-liberator-first-patrol",
    faction: "allies",
    label: "VLR Liberator 首次压入空隙",
    from: "iceland-patrol-base",
    to: "iceland-patrol-base",
    routeKind: "air",
    start: "1943-03-17T07:30",
    end: "1943-03-17T17:00",
    unitIcon: "ww2Bomber",
    formationUnits: liberatorPatrol,
    waypoints: [
      [-26.0, 59.8],
      [-31.5, 56.2],
      [-35.4, 54.0],
      [-38.0, 52.8],
      [-35.4, 54.0],
      [-31.5, 56.2],
      [-21.7, 63.4]
    ],
    visibleUntil: "1943-03-20T12:00",
    unitVisibleUntil: "1943-03-17T17:00"
  },
  {
    id: "second-night-submarine-screen",
    faction: "germany",
    label: "狼群第二夜再合围",
    from: "sc122-night-attack",
    to: "second-night-attack",
    routeKind: "sea",
    hideUnit: true,
    start: "1943-03-17T18:00",
    end: "1943-03-19T02:00",
    unitIcon: "ww2Submarine",
    formationUnits: [
      { id: "u221-second", label: "U-221", badgeLabel: "U", icon: "ww2Submarine", offset: [0, -12] },
      { id: "u527-second", label: "U-527", badgeLabel: "U", icon: "ww2Submarine", offset: [-34, 12] },
      { id: "u666-second", label: "U-666", badgeLabel: "U", icon: "ww2Submarine", offset: [-68, -14] }
    ],
    waypoints: [
      [-36.6, 52.8],
      [-34.8, 53.05],
      [-33.6, 53.1]
    ],
    visibleUntil: "1943-03-20T12:00"
  },
  {
    id: "escort-counterattack-screen",
    faction: "britain",
    label: "护航舰反潜搜索屏",
    from: "hx229-night-attack",
    to: "second-night-attack",
    routeKind: "sea",
    start: "1943-03-17T00:30",
    end: "1943-03-19T12:00",
    unitIcon: "ww2EscortShip",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "allied-escort-screen",
    formationUnits: [
      { id: "havelock", label: "Havelock", badgeLabel: "英", icon: "ww2EscortShip", offset: [0, -18] },
      { id: "swale", label: "Swale", badgeLabel: "英", icon: "ww2EscortShip", offset: [-42, 16] },
      { id: "highlander", label: "增援舰", badgeLabel: "英", icon: "ww2EscortShip", offset: [-84, -14], hiddenUntil: "1943-03-18T08:00" }
    ],
    waypoints: [
      [-40.7, 51.7],
      [-38.25, 52.85],
      [-35.4, 53.05],
      [-33.6, 53.1]
    ],
    visibleUntil: "1943-03-20T12:00"
  },
  {
    id: "escort-eastern-cover",
    faction: "britain",
    label: "护航舰掩护船队东撤",
    from: "second-night-attack",
    to: "western-approaches",
    routeKind: "sea",
    start: "1943-03-19T12:00",
    end: "1943-03-20T12:00",
    unitIcon: "ww2EscortShip",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "allied-escort-screen",
    formationUnits: [
      { id: "havelock", label: "Havelock", badgeLabel: "英", icon: "ww2EscortShip", offset: [0, -18] },
      { id: "swale", label: "Swale", badgeLabel: "英", icon: "ww2EscortShip", offset: [-42, 16] },
      { id: "highlander", label: "增援舰", badgeLabel: "英", icon: "ww2EscortShip", offset: [-84, -14] }
    ],
    waypoints: [
      [-31.0, 53.35],
      [-29.2, 53.7]
    ],
    visibleUntil: "1943-03-20T12:00"
  },
  {
    id: "u384-hunt-by-air",
    faction: "allies",
    label: "206中队飞机击沉 U-384",
    from: "northern-ireland-patrol-base",
    to: "northern-ireland-patrol-base",
    routeKind: "air",
    start: "1943-03-19T12:30",
    end: "1943-03-19T23:00",
    unitIcon: "ww2Bomber",
    formationUnits: [
      { id: "fortress-a", label: "Fortress", badgeLabel: "RAF", icon: "ww2Bomber", offset: [0, -12] },
      { id: "fortress-b", label: "深弹攻击", badgeLabel: "RAF", icon: "ww2Bomber", offset: [-30, 12], hiddenUntil: "1943-03-19T16:30" }
    ],
    waypoints: [
      [-12.0, 56.4],
      [-18.4, 55.7],
      [-23.4, 54.9],
      [-26.25, 54.3],
      [-23.4, 54.9],
      [-16.4, 55.6],
      [-6.2, 55.0]
    ],
    visibleUntil: "1943-03-20T12:00",
    unitVisibleUntil: "1943-03-19T23:00"
  },
  {
    id: "u-boat-disengagement",
    faction: "germany",
    label: "U 艇向东南脱离",
    from: "second-night-attack",
    to: "attack-discontinued",
    routeKind: "sea",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "u-boat-general-disengagement",
    start: "1943-03-19T17:45",
    end: "1943-03-20T12:00",
    unitIcon: "ww2Submarine",
    formationUnits: [
      { id: "u-withdraw-a", label: "返航 U 艇", badgeLabel: "U", icon: "ww2Submarine", offset: [0, -12] },
      { id: "u-withdraw-b", label: "下潜脱离", badgeLabel: "U", icon: "ww2Submarine", offset: [-34, 14] }
    ],
    waypoints: [
      [-31.2, 53.0],
      [-28.0, 53.4],
      [-23.8, 53.8]
    ],
    visibleUntil: "1943-03-20T12:00"
  }
];

export const torpedoAndDepthChargeEffects = [
  {
    id: "hx229-torpedo-spread",
    type: "salvo" as const,
    start: "1943-03-17T00:45",
    end: "1943-03-17T02:15",
    from: [-42.45, 51.35] as [number, number],
    fromRouteId: "raubgraf-hx229-contact",
    to: [-40.45, 51.91] as [number, number],
    toRouteId: "hx229-convoy-track",
    label: "鱼雷命中",
    className: "atlantic-hx229-torpedo-effect atlantic-local-impact-effect",
    testId: "atlantic-hx229-torpedo-salvo",
    showShellTraces: false,
    shellOffsets: [
      [-22, -10],
      [-8, 8],
      [10, -4]
    ] as Array<[number, number]>,
    impactOffsets: [
      [-12, -10],
      [5, -14],
      [14, 4],
      [-2, 12]
    ] as Array<[number, number]>
  },
  {
    id: "sc122-torpedo-spread",
    type: "salvo" as const,
    start: "1943-03-17T02:00",
    end: "1943-03-17T02:25",
    from: [-38.9, 52.72] as [number, number],
    fromRouteId: "sturmer-sc122-attack",
    to: [-38.75, 52.68] as [number, number],
    toRouteId: "sc122-convoy-track",
    label: "U-338 命中",
    className: "atlantic-sc122-torpedo-effect atlantic-local-impact-effect",
    testId: "atlantic-sc122-torpedo-salvo",
    showShellTraces: false,
    shellOffsets: [
      [-18, -10],
      [2, 10],
      [18, -4]
    ] as Array<[number, number]>,
    impactOffsets: [
      [-14, -8],
      [2, -14],
      [12, 4],
      [-2, 13]
    ] as Array<[number, number]>
  },
  {
    id: "u384-depth-charge-attack",
    type: "salvo" as const,
    start: "1943-03-19T17:35",
    end: "1943-03-19T17:55",
    from: [-25.85, 54.56] as [number, number],
    fromRouteId: "u384-hunt-by-air",
    to: [-26.25, 54.3] as [number, number],
    toRouteId: "u384-continuous-track",
    label: "航空深弹",
    className: "atlantic-u384-depth-charge-effect atlantic-local-impact-effect",
    testId: "atlantic-u384-depth-charge",
    showShellTraces: false,
    shellOffsets: [
      [-18, -16],
      [6, -10],
      [20, 4]
    ] as Array<[number, number]>,
    impactOffsets: [
      [-10, -8],
      [6, -12],
      [13, 4],
      [-4, 12]
    ] as Array<[number, number]>
  }
];

export const battleEvents: BattleEvent[] = [
  {
    id: "hx229-first-contact",
    date: "1943-03-16T03:30",
    title: "U-653 接触 HX 229",
    location: "中大西洋空隙西缘",
    coordinates: [-43.85, 51.25],
    phase: "接触",
    summary: "返航中的 U-653 在黎明前追上 HX 229，报告船队位置，狼群开始向同一航路收拢。",
    detail: "这是 HX 229 / SC 122 狼群战的起点。资料显示 U 艇按南北线布置拦截东航船队，U-653 接触后使 Raubgraf 余部和前方的 Sturmer、Dranger 获得合围目标。",
    significance: "潜艇战首先是发现与报告战。动画用接触线和持续东航的船队表示：船队没有停住，潜艇也不是凭空出现在攻击点。",
    mapFocus: ["newfoundland-approach", "hx229-contact", "raubgraf-line"]
  },
  {
    id: "wolfpacks-converge",
    date: "1943-03-16T18:00",
    title: "多狼群向船队航路合围",
    location: "中大西洋空隙",
    coordinates: [-41.9, 51.55],
    phase: "合围",
    summary: "Raubgraf 从后方追击，Sturmer 与 Dranger 从前方和侧方压向 HX 229 航路。",
    detail: "这里不把潜艇画成一团静止图标，而是让三组 U 艇从不同线位向东航船队收拢。它表达狼群战术的核心：单艇发现、无线电报告、艇群按船队航向重新集结。",
    significance: "这场战斗适合做潜艇战动画，正因为它同时展示了狼群合围、商船队被动航行和护航反潜压力。",
    mapFocus: ["raubgraf-line", "sturmer-dranger-line", "hx229-night-attack"]
  },
  {
    id: "sc122-first-contact",
    date: "1943-03-17T00:30",
    title: "U-338 又发现 SC 122",
    location: "HX 229 前方约120海里",
    coordinates: [-38.65, 52.7],
    phase: "双船队",
    summary: "U-338 在 HX 229 前方发现 SC 122，使德方意识到同一海域存在两支东航船队。",
    detail: "资料将两支船队归入同一场战斗。动画把 SC 122 作为平行航路持续显示，而不是在攻击时才突然出现，避免双船队关系不清。",
    significance: "双船队使这场战斗的态势复杂化：狼群目标分流，护航舰与远程巡逻机必须在更大海区内压制潜艇。",
    mapFocus: ["sc122-contact", "sc122-night-attack", "sturmer-dranger-line"]
  },
  {
    id: "night-torpedo-attacks",
    date: "1943-03-17T01:00",
    title: "夜间鱼雷攻击高峰",
    location: "HX 229 与 SC 122 航路",
    coordinates: [-41.9, 51.55],
    phase: "夜袭",
    summary: "U 艇在夜间对两支船队实施鱼雷攻击，商船损失迅速扩大。",
    detail: "uboat.net 叙述称，HX 229 在第一夜有多艘船被鱼雷击中，U-338 对 SC 122 的首轮齐射命中多船。动画用两处短时鱼雷效果对应两支船队，而不是用跨屏集火线。",
    significance: "潜艇战的战术创新不是舰队炮战，而是夜间水面接近、扇面鱼雷齐射和对护航薄弱区的集中打击。",
    mapFocus: ["hx229-night-attack", "sc122-night-attack", "mid-atlantic-gap"]
  },
  {
    id: "vlr-air-cover-arrives",
    date: "1943-03-17T12:00",
    title: "远程巡逻机进入空隙边缘",
    location: "中大西洋空隙上空",
    coordinates: [-35.4, 54.0],
    phase: "反潜航空",
    summary: "VLR Liberator 从冰岛和北爱尔兰方向压入空隙，迫使部分跟踪 U 艇下潜或中断接触。",
    detail: "资料提到 86 中队和 120 中队的 VLR Liberator 在 3月17日进入空隙并干扰跟踪 U 艇。动画中飞机完成巡逻后返航，只保留航迹，避免航空单位直接消失或长期悬停。",
    significance: "这正是大西洋战役转折的关键机制：远程航空兵把中大西洋空隙缩小，狼群无法再长时间水面跟踪。",
    mapFocus: ["liberator-patrol-zone", "sc122-night-attack", "mid-atlantic-gap"]
  },
  {
    id: "second-night-battle",
    date: "1943-03-19T02:00",
    title: "第二夜攻击仍在持续",
    location: "中大西洋空隙东部",
    coordinates: [-33.6, 53.1],
    phase: "持续攻击",
    summary: "3月18日夜间，U 艇继续攻击两支船队，护航舰和巡逻机的压力也逐步增强。",
    detail: "HX 229 与 SC 122 的损失并非一次瞬间爆发，而是 17日至19日连续发生。动画保留第一夜航迹，并用第二夜潜艇屏幕说明狼群仍跟随船队东移。",
    significance: "连续时间线是潜艇战动画成败的关键：船队、U 艇和护航屏幕都在移动，战斗不是几个孤立爆点。",
    mapFocus: ["second-night-attack", "sc122-night-attack", "escort-counterattack-screen"]
  },
  {
    id: "u384-sunk",
    date: "1943-03-19T17:45",
    title: "U-384 被 RAF 206中队击沉",
    location: "爱尔兰以西北大西洋",
    coordinates: [-26.25, 54.3],
    phase: "反潜命中",
    summary: "3月19日17:45，U-384 在约 54.18N, 26.15W 被英国 Fortress 机深弹击沉。",
    detail: "uboat.net 的 U-384 条目给出位置和时间。动画将巡逻机航线压到该点后返航，深弹效果只在这一窗口出现，避免反潜攻击与潜艇位置错开。",
    significance: "这不是潜潜对战，而是航空反潜的代表节点：狼群战术在远程巡逻机和护航增援到达后开始失去自由行动空间。",
    mapFocus: ["u384-sinking", "liberator-patrol-zone", "northern-ireland-patrol-base"]
  },
  {
    id: "attack-discontinued",
    date: "1943-03-19T23:00",
    title: "德方命令终止攻击",
    location: "中大西洋空隙东缘",
    coordinates: [-23.8, 53.8],
    phase: "脱离",
    summary: "护航增援与巡逻机数量增加后，U 艇当夜被命令停止攻击，船队继续向英国方向脱离。",
    detail: "3月19日只剩零星攻击，夜间攻击终止。动画末段让船队继续东航、U 艇脱离，避免双方全部停在地图上。",
    significance: "HX 229 / SC 122 是狼群战术高峰之一，也暴露出其对空中覆盖缺口的依赖；它是 1943年5月 U 艇损失激增前的重要前奏。",
    mapFocus: ["attack-discontinued", "western-approaches", "u384-sinking"]
  }
];

export const cueEventIds = new Set(["night-torpedo-attacks", "second-night-battle", "u384-sunk"]);
export const cueEventKinds = {
  "night-torpedo-attacks": "combined",
  "second-night-battle": "combined",
  "u384-sunk": "bombing"
} as const;
export const diveCueEventIds = new Set<string>();
