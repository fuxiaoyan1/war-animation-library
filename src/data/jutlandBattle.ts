import type { BattleEvent, FormationUnit, FrontLine, MapPoint } from "./battleOfFrance";

const britishBattlecruisers: FormationUnit[] = [
  { id: "lion", label: "狮号", badgeLabel: "英", offset: [0, -12] },
  { id: "princess-royal", label: "皇家公主号", badgeLabel: "英", offset: [-24, 10] },
  { id: "queen-mary", label: "玛丽女王号", badgeLabel: "英", offset: [-48, -10], hiddenFrom: "1916-05-31T16:26" },
  { id: "tiger", label: "虎号", badgeLabel: "英", offset: [-72, 12] }
];

const germanScoutingGroup: FormationUnit[] = [
  { id: "lutzow", label: "吕措夫号", badgeLabel: "德", offset: [0, -12] },
  { id: "derfflinger", label: "德弗林格号", badgeLabel: "德", offset: [-42, 12] },
  { id: "seyditz", label: "塞德利茨号", badgeLabel: "德", offset: [-84, -10] },
  { id: "moltke", label: "毛奇号", badgeLabel: "德", offset: [-126, 12] }
];

const germanScoutingGroupOffshoreStart: FormationUnit[] = [
  { id: "lutzow", label: "吕措夫号", badgeLabel: "德", offset: [0, -24] },
  { id: "derfflinger", label: "德弗林格号", badgeLabel: "德", offset: [-26, -20] },
  { id: "seyditz", label: "塞德利茨号", badgeLabel: "德", offset: [-52, -24] },
  { id: "moltke", label: "毛奇号", badgeLabel: "德", offset: [-78, -20] }
];

const britishGrandFleet: FormationUnit[] = [
  { id: "iron-duke", label: "铁公爵号", badgeLabel: "英", offset: [0, -16] },
  { id: "marlborough", label: "马尔伯勒号", badgeLabel: "英", offset: [-72, 16] },
  { id: "revenge", label: "复仇号", badgeLabel: "英", offset: [-144, -14] },
  { id: "benbow", label: "本博号", badgeLabel: "英", offset: [-216, 14] },
  { id: "colossus", label: "巨像号", badgeLabel: "英", offset: [-288, -12] },
  { id: "orion", label: "猎户座号", badgeLabel: "英", offset: [-360, 12] }
];

const britishBattlecruisersNorthRun: FormationUnit[] = [
  { id: "lion-north", label: "狮号", badgeLabel: "英", offset: [0, -12] },
  { id: "princess-royal-north", label: "皇家公主号", badgeLabel: "英", offset: [-32, 12] },
  { id: "tiger-north", label: "虎号", badgeLabel: "英", offset: [-72, 12] }
];

const britishNightPursuit: FormationUnit[] = [
  { id: "iron-duke-night", label: "铁公爵号", badgeLabel: "英", offset: [0, -14] },
  { id: "marlborough-night", label: "马尔伯勒号", badgeLabel: "英", offset: [-72, 16] },
  { id: "revenge-night", label: "复仇号", badgeLabel: "英", offset: [-144, -14] },
  { id: "benbow-night", label: "本博号", badgeLabel: "英", offset: [-216, 14] },
  { id: "destroyer-search", label: "驱逐舰搜索线", badgeLabel: "英", offset: [-108, 42] },
  { id: "light-cruisers", label: "轻巡警戒线", badgeLabel: "英", offset: [-180, 42] }
];

const germanHighSeasFleet: FormationUnit[] = [
  { id: "friedrich", label: "腓特烈大帝号", badgeLabel: "德", offset: [0, -14] },
  { id: "konig", label: "国王号", badgeLabel: "德", offset: [-54, 14] },
  { id: "kaiser", label: "皇帝号", badgeLabel: "德", offset: [-108, -12] },
  { id: "markgraf", label: "边疆伯爵号", badgeLabel: "德", offset: [-162, 12] },
  { id: "old-battleships", label: "旧式战列舰", badgeLabel: "德", offset: [-216, 0] }
];

const nightScreen: FormationUnit[] = [
  { id: "destroyer-flotillas", label: "驱逐舰/巡洋舰群", badgeLabel: "英", offset: [0, -14] },
  { id: "german-screen", label: "德军掩护舰", badgeLabel: "德", faction: "germany", offset: [-52, 14] }
];

const germanNightRetreat: FormationUnit[] = [
  { id: "friedrich-night", label: "腓特烈大帝号", badgeLabel: "德", offset: [0, -14] },
  { id: "konig-night", label: "国王号", badgeLabel: "德", offset: [-58, 14] },
  { id: "kaiser-night", label: "皇帝号", badgeLabel: "德", offset: [-116, -10] },
  { id: "screen-night", label: "屏卫舰", badgeLabel: "德", offset: [-174, 12] }
];

const germanScoutingGroupNightRetreat: FormationUnit[] = [
  { id: "lutzow-night", label: "吕措夫号", badgeLabel: "德", offset: [0, -12] },
  { id: "derfflinger-night", label: "德弗林格号", badgeLabel: "德", offset: [-32, 12] },
  { id: "seyditz-night", label: "塞德利茨号", badgeLabel: "德", offset: [-64, -10] },
  { id: "moltke-night", label: "毛奇号", badgeLabel: "德", offset: [-96, 12] }
];

export const campaignStart = "1916-05-31T14:20";
export const campaignEnd = "1916-06-01T03:30";

export const mapPoints: MapPoint[] = [
  { id: "denmark-west", label: "日德兰半岛外海", coordinates: [5.75, 56.36], kind: "front" },
  { id: "scapa-flow", label: "斯卡帕湾外海方向", coordinates: [-2.2, 58.55], kind: "port" },
  { id: "rosyth", label: "罗赛斯外海方向", coordinates: [0.2, 56.35], kind: "port" },
  { id: "horns-reef", label: "霍恩斯礁方向", coordinates: [7.8, 55.9], kind: "front" },
  { id: "contact-zone", label: "侦察舰接触区", coordinates: [5.55, 56.55], kind: "front", revealAt: "1916-05-31T15:30" },
  { id: "run-south-start", label: "南向追逐开始", coordinates: [5.45, 56.32], kind: "front", revealAt: "1916-05-31T15:48" },
  { id: "queen-mary-loss", label: "玛丽女王号爆炸", coordinates: [5.74, 55.9], kind: "objective", revealAt: "1916-05-31T16:26" },
  { id: "hipper-south-turn", label: "Hipper侦察群南端转向", coordinates: [5.9, 55.94], kind: "front", revealAt: "1916-05-31T16:35" },
  { id: "run-north-turn", label: "Beatty发现公海舰队后北转", coordinates: [5.58, 55.84], kind: "front", revealAt: "1916-05-31T16:40" },
  { id: "high-seas-offshore", label: "公海舰队外海接近", coordinates: [5.38, 55.82], kind: "front", revealAt: "1916-05-31T16:20" },
  { id: "grand-fleet-north-approach", label: "大舰队西北远海接近", coordinates: [3.25, 57.34], kind: "front", revealAt: "1916-05-31T18:15" },
  { id: "grand-fleet-offshore", label: "大舰队北海中部接近", coordinates: [4.62, 57.0], kind: "front", revealAt: "1916-05-31T18:15" },
  { id: "grand-fleet-deployment", label: "大舰队展开线", coordinates: [5.92, 56.68], kind: "objective", revealAt: "1916-05-31T18:15" },
  { id: "crossing-t-zone", label: "Jellicoe横切T字位", coordinates: [6.18, 56.43], kind: "objective", revealAt: "1916-05-31T18:30" },
  { id: "scheer-first-turn", label: "Scheer首次全舰队转向", coordinates: [6.08, 56.18], kind: "front", revealAt: "1916-05-31T18:36" },
  { id: "death-ride", label: "战列巡洋舰掩护冲锋", coordinates: [6.02, 56.34], kind: "front", revealAt: "1916-05-31T19:00" },
  { id: "scheer-second-turn", label: "Scheer再次全舰队转向", coordinates: [6.32, 56.08], kind: "front", revealAt: "1916-05-31T19:20" },
  { id: "british-night-pursuit", label: "英军夜间追击搜索线", coordinates: [6.18, 56.22], kind: "front", revealAt: "1916-05-31T21:00" },
  { id: "german-homeward-retreat", label: "德军主力撤向本土", coordinates: [7.18, 55.74], kind: "front", revealAt: "1916-05-31T21:00" },
  { id: "night-escape", label: "公海舰队夜间穿越尾部", coordinates: [6.75, 55.86], kind: "front", revealAt: "1916-06-01T01:00" }
];

export const crossingSalvoEffects = [
  {
    id: "jutland-first-crossing-salvo",
    type: "salvo" as const,
    start: "1916-05-31T18:32",
    end: "1916-05-31T18:42",
    from: [5.98, 56.52] as [number, number],
    to: [6.08, 56.18] as [number, number],
    label: "英军战列线齐射",
    testId: "jutland-crossing-salvo",
    shellOffsets: [
      [-52, -10],
      [-22, -18],
      [8, -12],
      [38, -4],
      [66, 6]
    ] as Array<[number, number]>,
    impactOffsets: [
      [-18, -12],
      [-4, -20],
      [12, -10],
      [20, 4],
      [2, 14]
    ] as Array<[number, number]>
  }
];

export const frontLines: FrontLine[] = [
  {
    id: "beatty-scouting-east",
    faction: "britain",
    label: "Beatty战列巡洋舰队东进侦察",
    from: "rosyth",
    to: "contact-zone",
    routeKind: "sea",
    start: "1916-05-31T14:20",
    end: "1916-05-31T15:30",
    visibleUntil: "1916-05-31T15:50",
    unitVisibleUntil: "1916-05-31T15:50",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "beatty-battlecruisers",
    unitIcon: "warship",
    formationUnits: britishBattlecruisers,
    waypoints: [[1.1, 56.28], [2.8, 56.34], [4.35, 56.46]],
    width: 10,
    intensity: 0.92
  },
  {
    id: "hipper-scouting-west",
    faction: "germany",
    label: "Hipper侦察群向西诱敌",
    from: "denmark-west",
    to: "contact-zone",
    routeKind: "sea",
    start: "1916-05-31T14:20",
    end: "1916-05-31T15:35",
    visibleUntil: "1916-05-31T15:48",
    unitVisibleUntil: "1916-05-31T15:48",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "hipper-scouting-group",
    unitIcon: "warship",
    formationUnits: germanScoutingGroupOffshoreStart,
    waypoints: [[5.72, 56.43], [5.68, 56.52]],
    width: 10,
    intensity: 0.9
  },
  {
    id: "run-to-the-south",
    faction: "germany",
    label: "南向追逐：德军引向主力",
    from: "contact-zone",
    to: "hipper-south-turn",
    routeKind: "sea",
    start: "1916-05-31T15:48",
    end: "1916-05-31T16:35",
    visibleUntil: "1916-05-31T16:48",
    unitVisibleUntil: "1916-05-31T16:35",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "hipper-scouting-group",
    unitIcon: "warship",
    formationUnits: germanScoutingGroup,
    waypoints: [[5.64, 56.28], [5.82, 56.12], [5.88, 56.02]],
    width: 11,
    intensity: 0.96
  },
  {
    id: "beatty-south-pursuit",
    faction: "britain",
    label: "英战列巡洋舰追击中受重创",
    from: "contact-zone",
    to: "run-north-turn",
    routeKind: "sea",
    start: "1916-05-31T15:50",
    end: "1916-05-31T16:40",
    visibleUntil: "1916-05-31T16:48",
    unitVisibleUntil: "1916-05-31T16:40",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "beatty-battlecruisers",
    unitIcon: "warship",
    formationUnits: britishBattlecruisers,
    waypoints: [[5.58, 56.34], [5.66, 56.12], [5.64, 55.96]],
    width: 11,
    intensity: 0.88
  },
  {
    id: "run-to-the-north",
    faction: "britain",
    label: "北向引诱：Beatty把德主力带向Jellicoe",
    from: "run-north-turn",
    to: "grand-fleet-deployment",
    routeKind: "sea",
    start: "1916-05-31T16:40",
    end: "1916-05-31T18:15",
    visibleUntil: "1916-05-31T19:24",
    unitVisibleUntil: "1916-05-31T19:18",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "beatty-battlecruisers",
    unitIcon: "warship",
    formationUnits: britishBattlecruisersNorthRun,
    waypoints: [[5.44, 56.02], [5.34, 56.28], [5.46, 56.52], [5.66, 56.62]],
    width: 9,
    intensity: 0.76
  },
  {
    id: "hipper-rejoins-main-fleet",
    faction: "germany",
    label: "Hipper侦察群北返掩护主力",
    from: "hipper-south-turn",
    to: "scheer-second-turn",
    routeKind: "sea",
    start: "1916-05-31T16:35",
    end: "1916-05-31T18:58",
    visibleUntil: "1916-05-31T19:24",
    unitVisibleUntil: "1916-05-31T19:00",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "hipper-scouting-group",
    unitIcon: "warship",
    formationUnits: germanScoutingGroup,
    formationPrelude: [[5.82, 56.12], [5.88, 56.02]],
    waypoints: [[5.96, 56.0], [6.06, 56.08], [6.18, 56.1]],
    width: 8,
    intensity: 0.68
  },
  {
    id: "high-seas-fleet-north",
    faction: "germany",
    label: "公海舰队北上追击",
    from: "high-seas-offshore",
    to: "scheer-first-turn",
    routeKind: "sea",
    start: "1916-05-31T14:20",
    end: "1916-05-31T18:35",
    visibleUntil: "1916-05-31T18:44",
    unitVisibleUntil: "1916-05-31T18:36",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "german-high-seas-fleet",
    unitIcon: "warship",
    formationUnits: germanHighSeasFleet,
    waypoints: [[5.52, 55.9], [5.7, 56.0], [5.92, 56.1]],
    width: 12,
    intensity: 0.92
  },
  {
    id: "grand-fleet-approach",
    faction: "britain",
    label: "Jellicoe大舰队北侧持续接近",
    from: "grand-fleet-north-approach",
    to: "grand-fleet-offshore",
    routeKind: "sea",
    start: "1916-05-31T14:20",
    end: "1916-05-31T16:00",
    visibleUntil: "1916-05-31T19:24",
    unitVisibleUntil: "1916-05-31T16:00",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "british-grand-fleet",
    unitIcon: "warship",
    formationUnits: britishGrandFleet,
    waypoints: [[3.54, 57.28], [3.88, 57.2], [4.25, 57.1]],
    width: 12,
    intensity: 0.72
  },
  {
    id: "grand-fleet-closing",
    faction: "britain",
    label: "Jellicoe大舰队向展开海域靠拢",
    from: "grand-fleet-offshore",
    to: "grand-fleet-deployment",
    routeKind: "sea",
    start: "1916-05-31T16:00",
    end: "1916-05-31T18:15",
    visibleUntil: "1916-05-31T19:24",
    unitVisibleUntil: "1916-05-31T18:15",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "british-grand-fleet",
    unitIcon: "warship",
    formationUnits: britishGrandFleet,
    waypoints: [[4.96, 56.92], [5.28, 56.82], [5.62, 56.82], [5.86, 56.74]],
    width: 13,
    intensity: 0.84
  },
  {
    id: "grand-fleet-deploys",
    faction: "britain",
    label: "Jellicoe大舰队展开横切T字",
    from: "grand-fleet-deployment",
    to: "crossing-t-zone",
    routeKind: "sea",
    start: "1916-05-31T18:15",
    end: "1916-05-31T18:35",
    visibleUntil: "1916-05-31T19:24",
    unitVisibleUntil: "1916-05-31T19:18",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "british-grand-fleet",
    unitIcon: "warship",
    formationUnits: britishGrandFleet,
    waypoints: [[5.96, 56.64], [6.02, 56.59], [6.08, 56.53], [6.14, 56.48]],
    width: 14,
    intensity: 1
  },
  {
    id: "scheer-battle-turn",
    faction: "germany",
    label: "Scheer全舰队转向脱离",
    from: "scheer-first-turn",
    to: "scheer-second-turn",
    routeKind: "sea",
    start: "1916-05-31T18:36",
    end: "1916-05-31T19:05",
    visibleUntil: "1916-05-31T21:00",
    unitVisibleUntil: "1916-05-31T19:20",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "german-high-seas-fleet",
    unitIcon: "warship",
    formationUnits: germanHighSeasFleet,
    waypoints: [[6.0, 56.24], [5.9, 56.3], [5.96, 56.22], [6.16, 56.12]],
    width: 12,
    intensity: 0.86
  },
  {
    id: "battlecruiser-death-ride",
    faction: "germany",
    label: "战列巡洋舰与驱逐舰掩护冲锋",
    from: "scheer-second-turn",
    to: "death-ride",
    routeKind: "sea",
    start: "1916-05-31T19:00",
    end: "1916-05-31T19:18",
    visibleUntil: "1916-05-31T21:00",
    unitVisibleFrom: "1916-05-31T19:00",
    unitVisibleUntil: "1916-05-31T19:18",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "hipper-scouting-group",
    unitIcon: "warship",
    formationUnits: germanScoutingGroup,
    waypoints: [[6.22, 56.2], [6.1, 56.28]],
    width: 8,
    intensity: 0.74
  },
  {
    id: "hipper-night-retreat",
    faction: "germany",
    label: "Hipper战列巡洋舰群夜间撤退",
    from: "death-ride",
    to: "german-homeward-retreat",
    routeKind: "sea",
    start: "1916-05-31T19:18",
    end: "1916-06-01T03:30",
    visibleUntil: "1916-06-01T03:30",
    unitVisibleFrom: "1916-05-31T19:18",
    unitVisibleUntil: "1916-06-01T03:30",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "hipper-scouting-group",
    unitIcon: "warship",
    formationUnits: germanScoutingGroupNightRetreat,
    waypoints: [[5.96, 56.36], [6.12, 56.2], [6.38, 56.02], [6.72, 55.86]],
    width: 8,
    intensity: 0.5
  },
  {
    id: "beatty-night-screen",
    faction: "britain",
    label: "Beatty战列巡洋舰夜间警戒",
    from: "grand-fleet-deployment",
    to: "british-night-pursuit",
    routeKind: "sea",
    start: "1916-05-31T19:18",
    end: "1916-06-01T03:30",
    visibleUntil: "1916-06-01T03:30",
    unitVisibleFrom: "1916-05-31T19:18",
    unitVisibleUntil: "1916-06-01T03:30",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "beatty-battlecruisers",
    unitIcon: "warship",
    formationUnits: britishBattlecruisersNorthRun,
    waypoints: [[6.04, 56.66], [6.1, 56.44], [6.14, 56.28]],
    width: 7,
    intensity: 0.46
  },
  {
    id: "british-night-pursuit-route",
    faction: "britain",
    label: "英军夜间追击与搜索",
    from: "crossing-t-zone",
    to: "british-night-pursuit",
    routeKind: "sea",
    start: "1916-05-31T19:18",
    end: "1916-06-01T03:30",
    visibleUntil: "1916-06-01T03:30",
    unitVisibleFrom: "1916-05-31T19:18",
    unitVisibleUntil: "1916-06-01T03:30",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "british-grand-fleet",
    unitIcon: "warship",
    formationUnits: britishNightPursuit,
    waypoints: [[6.24, 56.36], [6.24, 56.3], [6.2, 56.25]],
    width: 9,
    intensity: 0.54
  },
  {
    id: "german-main-night-retreat",
    faction: "germany",
    label: "公海舰队主力夜间撤退",
    from: "scheer-second-turn",
    to: "german-homeward-retreat",
    routeKind: "sea",
    start: "1916-05-31T19:20",
    end: "1916-06-01T03:30",
    visibleUntil: "1916-06-01T03:30",
    unitVisibleFrom: "1916-05-31T19:20",
    unitVisibleUntil: "1916-06-01T03:30",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "german-high-seas-fleet",
    unitIcon: "warship",
    formationUnits: germanNightRetreat,
    waypoints: [[6.44, 56.02], [6.64, 55.9], [6.9, 55.8]],
    width: 10,
    intensity: 0.62
  },
  {
    id: "night-escape-route",
    faction: "germany",
    label: "夜间撤离：穿过英舰尾部",
    from: "scheer-second-turn",
    to: "night-escape",
    routeKind: "sea",
    start: "1916-05-31T21:10",
    end: "1916-06-01T03:30",
    visibleUntil: "1916-06-01T03:30",
    unitVisibleFrom: "1916-05-31T21:10",
    unitVisibleUntil: "1916-06-01T03:30",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "german-night-screen",
    unitIcon: "warship",
    formationUnits: nightScreen,
    waypoints: [[6.34, 56.0], [6.5, 55.92], [6.62, 55.88]],
    width: 8,
    intensity: 0.58
  }
];

export const battleEvents: BattleEvent[] = [
  {
    id: "scouting-contact",
    date: "1916-05-31T15:30",
    title: "侦察舰接触，主力尚未出现",
    location: "北海日德兰半岛以西",
    coordinates: [5.55, 56.55],
    phase: "侦察接触",
    summary: "英德战列巡洋舰侦察部队接触，双方都试图把对手引向己方主力舰队。",
    detail:
      "动画从侦察接触开始，而不是从港口出航拉长。Beatty在西侧，Hipper从东侧接近，双方都还没有看到真正的主力舰队。",
    significance: "日德兰不是一次简单遭遇战，而是两套侦察-诱敌-主力展开体系在北海相撞。",
    mapFocus: ["contact-zone", "run-south-start", "denmark-west"]
  },
  {
    id: "run-to-south",
    date: "1916-05-31T15:48",
    title: "南向追逐：Hipper引Beatty靠近公海舰队",
    location: "接触区南侧海面",
    coordinates: [5.62, 56.18],
    phase: "南向追逐",
    summary: "德军战列巡洋舰向南引诱，Beatty追击中暴露在更有利的德军射击节奏里。",
    detail:
      "路线向南压缩，表现德军不是单纯逃跑，而是把英军侦察部队拉向Scheer主力。英军战列巡洋舰在这一阶段连续遭受重大损失。",
    significance: "这一段反复被研究，因为它展示了侦察部队如何从前卫战斗转化为主力会战的诱导链条。",
    mapFocus: ["queen-mary-loss", "contact-zone", "horns-reef"]
  },
  {
    id: "queen-mary-loss",
    date: "1916-05-31T16:26",
    title: "玛丽女王号爆炸沉没",
    location: "南向追逐航线",
    coordinates: [5.74, 55.9],
    phase: "弹药安全灾难",
    summary: "英军战列巡洋舰损失惨重，玛丽女王号爆炸沉没成为战列巡洋舰防护与弹药处理问题的典型案例。",
    detail:
      "动画在该节点隐藏玛丽女王号，不用爆炸大场面持续覆盖画面，只保留受创点和舰列缺口，强调损失对队形与判断的影响。",
    significance: "战列巡洋舰高速重炮但防护不足的争论，在这一节点变成战术和工程教训。",
    mapFocus: ["queen-mary-loss", "run-north-turn", "contact-zone"]
  },
  {
    id: "run-to-north",
    date: "1916-05-31T16:40",
    title: "北向引诱：Beatty把德主力带向Jellicoe",
    location: "北海南部至大舰队展开区",
    coordinates: [5.42, 56.04],
    phase: "北向引诱",
    summary: "Beatty发现公海舰队主力后转向北方，把Scheer引向英国大舰队。",
    detail:
      "这一段是日德兰会战的镜像：刚才Hipper引英军南下，现在Beatty北上，把德军主力带向Jellicoe。动画用回转路线表现战场主动权转换。",
    significance: "日德兰的核心不只是炮战，而是侦察部队能否把敌主力送到己方主力火力弧内。",
    mapFocus: ["run-north-turn", "grand-fleet-deployment", "scheer-first-turn"]
  },
  {
    id: "jellicoe-deploys",
    date: "1916-05-31T18:15",
    title: "Jellicoe大舰队展开，准备横切T字",
    location: "大舰队展开线",
    coordinates: [5.78, 56.72],
    phase: "主力展开",
    summary: "Jellicoe将大舰队从行军队形展开为战列线，抢占能横切德军航向的位置。",
    detail:
      "动画把英军主力舰列从西北方向展开到德军前方。这个节点重点是部署判断：在信息不完整、能见度不佳时选择展开方向。",
    significance: "Jellicoe的展开被视为现代舰队指挥的经典案例：一次部署错误就可能让整个舰队错失或承受灾难。",
    mapFocus: ["grand-fleet-deployment", "crossing-t-zone", "scheer-first-turn"]
  },
  {
    id: "scheer-turns-away",
    date: "1916-05-31T18:36",
    title: "Scheer全舰队转向，避开被横切",
    location: "英德主力舰队交会区",
    coordinates: [6.24, 56.18],
    phase: "战术脱离",
    summary: "德军发现自己正进入英军战列线火力弧后，以全舰队转向脱离。",
    detail:
      "动画用德军主力线整体右转表现Gefechtskehrtwendung，而不是把它画成零散逃跑。随后德军又短暂冲回，以战列巡洋舰和驱逐舰掩护主力脱离。",
    significance: "这是日德兰最常被研究的舰队机动之一：在被横切前用训练化的大编队转向保全主力。",
    mapFocus: ["scheer-first-turn", "death-ride", "crossing-t-zone"]
  },
  {
    id: "battlecruiser-death-ride",
    date: "1916-05-31T19:00",
    title: "战列巡洋舰与驱逐舰掩护主力脱离",
    location: "英德主力舰队交会区",
    coordinates: [6.02, 56.34],
    phase: "掩护冲锋",
    summary: "德军战列巡洋舰和驱逐舰向英军方向压上，争取时间掩护主力舰队完成再次转向脱离。",
    detail:
      "这一段不是孤立冲锋，而是Scheer全舰队转向后的战术屏障。动画把掩护舰队单独画成短促前出航迹，让主力转向和掩护行动同时可读。",
    significance: "日德兰的战术复杂性在这里最清楚：主力保存、屏卫牺牲、火力压制和夜间脱离连成同一个决策链。",
    mapFocus: ["death-ride", "scheer-second-turn", "crossing-t-zone"]
  },
  {
    id: "night-escape",
    date: "1916-06-01T01:00",
    title: "夜间接触混乱，公海舰队穿越英军尾部撤离",
    location: "北海南部夜战海域",
    coordinates: [6.75, 55.86],
    phase: "夜间撤离",
    summary: "夜间驱逐舰和巡洋舰接触不断，但德军主力最终穿越英军尾部，向本土方向撤离。",
    detail:
      "收束阶段保留夜间撤退线和屏卫舰接触，不再把每次夜间小规模交火展开成独立战斗。日德兰的结果是战术损失与战略态势并存。",
    significance: "日德兰之后，双方都宣称战术或战略意义上的胜利，但英国继续保持北海封锁优势，德国主力舰队再未寻求同等规模决战。",
    mapFocus: ["night-escape", "horns-reef", "crossing-t-zone"]
  }
];

export const cueEventIds = new Set([
  "run-to-south",
  "queen-mary-loss",
  "jellicoe-deploys",
  "scheer-turns-away",
  "battlecruiser-death-ride"
]);
