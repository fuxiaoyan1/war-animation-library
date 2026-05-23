import type { BattleEvent, FormationUnit, FrontLine, MapPoint } from "./battleOfFrance";

const americanBattleLine: FormationUnit[] = [
  { id: "washington", label: "华盛顿号", badgeLabel: "美", offset: [0, -18] },
  { id: "south-dakota", label: "南达科他号", badgeLabel: "美", offset: [-76, 18] },
  { id: "destroyers", label: "驱逐舰屏卫", badgeLabel: "美", offset: [-152, 0] }
];

const southDakotaExposedLine: FormationUnit[] = [
  { id: "south-dakota-dark", label: "南达科他号", badgeLabel: "美", offset: [0, 0] }
];

const washingtonRadarLine: FormationUnit[] = [
  { id: "washington-radar", label: "华盛顿号", badgeLabel: "美", offset: [0, 0] }
];

const japaneseBombardmentLine: FormationUnit[] = [
  { id: "kirishima", label: "雾岛号", badgeLabel: "日", offset: [0, -18] },
  { id: "atago", label: "爱宕", badgeLabel: "日", offset: [-70, 18] },
  { id: "takao", label: "高雄", badgeLabel: "日", offset: [-140, -10] },
  { id: "destroyer-screen", label: "驱逐舰群", badgeLabel: "日", offset: [-210, 20] }
];

const japaneseWithdrawalLine: FormationUnit[] = [
  { id: "atago-withdraw", label: "爱宕", badgeLabel: "日", offset: [0, -14] },
  { id: "takao-withdraw", label: "高雄", badgeLabel: "日", offset: [-70, 16] },
  { id: "destroyers-withdraw", label: "驱逐舰群", badgeLabel: "日", offset: [-140, 0] }
];

export const campaignStart = "1942-11-14T22:30";
export const campaignEnd = "1942-11-15T04:00";

export const mapPoints: MapPoint[] = [
  { id: "savo-island", label: "萨沃岛", coordinates: [159.82, -9.13], kind: "front" },
  { id: "ironbottom-sound", label: "铁底湾", coordinates: [160.05, -9.38], kind: "front" },
  { id: "guadalcanal", label: "瓜达尔卡纳尔", coordinates: [160.2, -9.63], kind: "front" },
  { id: "henderson-field", label: "亨德森机场", coordinates: [160.05, -9.42], kind: "objective" },
  { id: "american-south-approach", label: "美舰由铁底湾西口进入", coordinates: [159.42, -9.2], kind: "front" },
  { id: "american-west-sound", label: "Lee战列舰队", coordinates: [159.68, -9.2], kind: "front", revealAt: "1942-11-15T00:02" },
  { id: "south-dakota-blackout", label: "南达科他号失电", coordinates: [159.84, -9.18], kind: "objective", revealAt: "1942-11-15T00:05" },
  { id: "washington-radar-firing", label: "华盛顿号雷达射击位", coordinates: [159.67, -9.17], kind: "objective", revealAt: "1942-11-15T00:12" },
  { id: "kirishima-hit", label: "雾岛号遭重创", coordinates: [159.86, -9.06], kind: "objective", revealAt: "1942-11-15T00:12" },
  { id: "japanese-slot", label: "日舰由槽海峡南下", coordinates: [159.5, -8.85], kind: "front" },
  { id: "japanese-north-savo", label: "日舰绕萨沃岛北侧", coordinates: [159.82, -8.98], kind: "front", revealAt: "1942-11-15T00:00" },
  { id: "japanese-retreat", label: "日舰撤向西北", coordinates: [159.33, -8.76], kind: "front", revealAt: "1942-11-15T00:24" }
];

export const radarSalvoEffects = [
  {
    id: "guadalcanal-washington-radar-salvo",
    type: "salvo" as const,
    start: "1942-11-15T00:12",
    end: "1942-11-15T00:20",
    from: [159.67, -9.17] as [number, number],
    to: [159.86, -9.06] as [number, number],
    label: "雷达火控齐射",
    testId: "guadalcanal-radar-salvo",
    shellOffsets: [
      [-18, -10],
      [-8, 8],
      [8, -8],
      [18, 6]
    ] as Array<[number, number]>,
    impactOffsets: [
      [-10, -8],
      [4, -12],
      [12, 2],
      [-2, 10]
    ] as Array<[number, number]>
  }
];

export const frontLines: FrontLine[] = [
  {
    id: "japanese-approach-slot",
    faction: "germany",
    label: "日军炮击队沿槽海峡南下",
    from: "japanese-slot",
    to: "japanese-north-savo",
    routeKind: "sea",
    start: "1942-11-14T22:30",
    end: "1942-11-15T00:00",
    unitVisibleUntil: "1942-11-14T23:59",
    unitGroupId: "japanese-bombardment-force",
    unitIcon: "warship",
    formationUnits: japaneseBombardmentLine,
    waypoints: [[159.58, -8.84], [159.7, -8.88], [159.78, -8.94]],
    width: 11,
    intensity: 0.96
  },
  {
    id: "american-battleships-enter",
    faction: "allies",
    label: "Lee舰队由南侧进入铁底湾",
    from: "american-south-approach",
    to: "american-west-sound",
    routeKind: "sea",
    start: "1942-11-14T22:30",
    end: "1942-11-15T00:02",
    unitVisibleUntil: "1942-11-15T00:01",
    unitGroupId: "american-battle-line",
    unitIcon: "warship",
    formationUnits: americanBattleLine,
    waypoints: [[159.5, -9.19], [159.6, -9.2]],
    width: 11,
    intensity: 0.92
  },
  {
    id: "south-dakota-exposed",
    faction: "allies",
    label: "南达科他号失电并暴露",
    from: "american-west-sound",
    to: "south-dakota-blackout",
    routeKind: "sea",
    start: "1942-11-15T00:02",
    end: "1942-11-15T00:10",
    unitVisibleUntil: "1942-11-15T00:16",
    unitGroupId: "south-dakota",
    unitIcon: "warship",
    formationUnits: southDakotaExposedLine,
    waypoints: [[159.76, -9.19]],
    width: 8,
    intensity: 0.7
  },
  {
    id: "japanese-spot-south-dakota",
    faction: "germany",
    label: "日舰集中照射南达科他号",
    from: "japanese-north-savo",
    to: "south-dakota-blackout",
    routeKind: "sea",
    start: "1942-11-15T00:04",
    end: "1942-11-15T00:14",
    visibleUntil: "1942-11-15T00:28",
    hideUnit: true,
    unitIcon: "warship",
    waypoints: [[159.86, -9.02], [159.86, -9.1]],
    width: 7,
    intensity: 0.62
  },
  {
    id: "washington-radar-attack",
    faction: "allies",
    label: "华盛顿号雷达火控隐蔽射击",
    from: "american-west-sound",
    to: "washington-radar-firing",
    routeKind: "sea",
    start: "1942-11-15T00:08",
    end: "1942-11-15T00:17",
    unitVisibleUntil: "1942-11-15T00:32",
    unitGroupId: "washington",
    unitIcon: "warship",
    formationUnits: washingtonRadarLine,
    waypoints: [[159.66, -9.18]],
    width: 12,
    intensity: 1
  },
  {
    id: "kirishima-disabled",
    faction: "germany",
    label: "雾岛号被16英寸炮重创",
    from: "japanese-north-savo",
    to: "kirishima-hit",
    routeKind: "sea",
    start: "1942-11-15T00:12",
    end: "1942-11-15T00:22",
    visibleUntil: "1942-11-15T04:00",
    unitVisibleUntil: "1942-11-15T00:26",
    unitGroupId: "kirishima",
    unitIcon: "warship",
    formationUnits: [japaneseBombardmentLine[0]],
    waypoints: [[159.84, -9.0], [159.86, -9.04]],
    width: 9,
    intensity: 0.88
  },
  {
    id: "japanese-withdrawal",
    faction: "germany",
    label: "日军放弃炮击撤退",
    from: "kirishima-hit",
    to: "japanese-retreat",
    routeKind: "sea",
    start: "1942-11-15T00:24",
    end: "1942-11-15T03:25",
    visibleUntil: "1942-11-15T04:00",
    unitVisibleFrom: "1942-11-15T00:28",
    unitVisibleUntil: "1942-11-15T03:25",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "japanese-bombardment-force",
    unitIcon: "warship",
    formationUnits: japaneseWithdrawalLine,
    waypoints: [[159.76, -8.96], [159.58, -8.84]],
    width: 8,
    intensity: 0.55
  }
];

export const battleEvents: BattleEvent[] = [
  {
    id: "night-approach",
    date: "1942-11-14T22:30",
    title: "双方夜间接近铁底湾",
    location: "萨沃岛与瓜达尔卡纳尔之间",
    coordinates: [159.66, -9.16],
    phase: "夜战接触",
    summary: "日军舰队试图再次炮击亨德森机场，美军第64特遣队以两艘战列舰和驱逐舰进入拦截位置。",
    detail:
      "动画从双方已在接近航线上开始，不把长时间搜索过程拖成空镜。日军沿槽海峡南下，美军从南侧进入铁底湾，双方在岛屿和黑夜中缩短距离。",
    significance: "这是瓜岛战役海上补给与机场争夺的关键夜晚，目标不是单纯击沉敌舰，而是阻止日军炮击机场。",
    mapFocus: ["savo-island", "american-west-sound", "japanese-north-savo"]
  },
  {
    id: "south-dakota-blackout",
    date: "1942-11-15T00:05",
    title: "南达科他号失电并吸引日军火力",
    location: "萨沃岛西北侧近海",
    coordinates: [159.84, -9.18],
    phase: "混乱暴露",
    summary: "南达科他号因电力故障和通信混乱暂时失去战斗效能，日舰探照灯和炮火集中到它身上。",
    detail:
      "这不是美军预设的诱饵，而是夜战中技术和组织故障造成的危险暴露。动画把南达科他号单独标出，让它与保持隐蔽的华盛顿号形成对比。",
    significance: "工业时代海战的关键不再只是装甲和口径，电力、雷达、通信和损管会直接改变战术态势。",
    mapFocus: ["south-dakota-blackout", "japanese-north-savo", "washington-radar-firing"]
  },
  {
    id: "washington-radar-fires",
    date: "1942-11-15T00:12",
    title: "华盛顿号用雷达火控锁定雾岛号",
    location: "萨沃岛西北铁底湾",
    coordinates: [159.68, -9.22],
    phase: "雷达决胜",
    summary: "华盛顿号保持相对隐蔽，用雷达火控对雾岛号实施近距离主炮射击。",
    detail:
      "动画把射击位放在南达科他号以西，表现华盛顿号没有被日军集中照射，却能通过雷达建立目标解算。火力线从美舰侧后方向雾岛号集中。",
    significance: "这是战列舰夜战中雷达火控优势的标志性案例，常被用于讨论传感器、火控和战术纪律的结合。",
    mapFocus: ["washington-radar-firing", "kirishima-hit", "south-dakota-blackout"]
  },
  {
    id: "kirishima-disabled",
    date: "1942-11-15T00:18",
    title: "雾岛号遭重创，日军炮击任务失败",
    location: "萨沃岛北侧外海",
    coordinates: [159.86, -9.06],
    phase: "目标失能",
    summary: "雾岛号被重创后失去继续作战能力，日军无法完成对亨德森机场的炮击任务。",
    detail:
      "动画保留雾岛号受创点，同时让日军其他舰艇转向西北撤离。这里的胜负不是舰队全歼，而是关键炮击舰丧失战斗力、任务中止。",
    significance: "美军用少量战列舰拦住炮击队，保障了亨德森机场继续运作，进而影响瓜岛战役的补给节奏。",
    mapFocus: ["kirishima-hit", "henderson-field", "japanese-retreat"]
  },
  {
    id: "japanese-withdraw",
    date: "1942-11-15T03:25",
    title: "日军撤退，铁底湾夜战结束",
    location: "萨沃岛西北方向",
    coordinates: [159.45, -8.82],
    phase: "撤离收束",
    summary: "日军放弃炮击任务向西北撤退，雾岛号最终沉没；美军守住机场外围海域。",
    detail:
      "收束阶段只显示撤退方向和受创点，不再触发新的战斗音效。此时战术问题已经转为战果确认与任务结果。",
    significance: "第二次瓜岛海战把夜战、雷达火控、战列舰炮战和机场争夺压缩到一个高度可研究的案例中。",
    mapFocus: ["japanese-retreat", "kirishima-hit", "henderson-field"]
  }
];

export const cueEventIds = new Set(["south-dakota-blackout", "washington-radar-fires", "kirishima-disabled"]);
