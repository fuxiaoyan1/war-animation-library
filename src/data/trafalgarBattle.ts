import type { BattleEvent, FormationUnit, FrontLine, MapPoint } from "./battleOfFrance";

const britishVan: FormationUnit[] = [
  { id: "victory", label: "胜利号", badgeLabel: "英", icon: "trafalgarHmsVictory", offset: [0, 0] },
  { id: "temeraire", label: "无畏号", badgeLabel: "英", icon: "trafalgarBritishLine", offset: [-56, -16] },
  { id: "neptune", label: "海王星号", badgeLabel: "英", icon: "trafalgarBritishLine", offset: [-112, 12] },
  { id: "leviathan", label: "利维坦号", badgeLabel: "英", icon: "trafalgarBritishLine", offset: [-168, -20] },
  { id: "conqueror", label: "征服者号", badgeLabel: "英", icon: "trafalgarBritishLine", offset: [-224, 16] },
  { id: "ajax", label: "阿贾克斯号", badgeLabel: "英", icon: "trafalgarBritishLine", offset: [-280, -14] },
  { id: "orion", label: "猎户座号", badgeLabel: "英", icon: "trafalgarBritishLine", offset: [-336, 18] }
];

const britishLee: FormationUnit[] = [
  { id: "royal-sovereign", label: "皇家主权号", badgeLabel: "英", icon: "trafalgarRoyalSovereign", offset: [0, 0] },
  { id: "belleisle", label: "贝莱尔号", badgeLabel: "英", icon: "trafalgarBritishLine", offset: [-54, 18] },
  { id: "mars", label: "火星号", badgeLabel: "英", icon: "trafalgarBritishLine", offset: [-108, -16] },
  { id: "tonnant", label: "雷鸣号", badgeLabel: "英", icon: "trafalgarBritishLine", offset: [-162, 18] },
  { id: "bellerophon", label: "柏勒洛丰号", badgeLabel: "英", icon: "trafalgarBritishLine", offset: [-216, -16] },
  { id: "colossus", label: "巨像号", badgeLabel: "英", icon: "trafalgarBritishLine", offset: [-270, 18] },
  { id: "dreadnought", label: "无畏舰队后段", badgeLabel: "英", icon: "trafalgarBritishLine", offset: [-324, -16] }
];

const lossReductionTime = "1805-10-21T17:45";
const meleeUnitStart = "1805-10-21T13:15";
const approachUnitEnd = "1805-10-21T13:14";

const alliedMainLine: FormationUnit[] = [
  { id: "fougueux", label: "福格号", badgeLabel: "法", faction: "france", hiddenFrom: lossReductionTime, icon: "trafalgarFrenchLine", offset: [0, -10] },
  { id: "santa-ana", label: "圣安娜号", badgeLabel: "西", faction: "spain", hiddenFrom: lossReductionTime, icon: "trafalgarSantisimaTrinidad", offset: [-48, 14] },
  { id: "indomptable", label: "不屈号", badgeLabel: "法", faction: "france", hiddenFrom: lossReductionTime, icon: "trafalgarFrenchLine", offset: [-96, -12] },
  { id: "bucentaure", label: "布桑托尔号", badgeLabel: "法", faction: "france", icon: "trafalgarBucentaure", offset: [-144, 16] },
  { id: "redoutable", label: "可畏号", badgeLabel: "法", faction: "france", icon: "trafalgarFrenchLine", offset: [-192, -12] },
  { id: "santisima", label: "圣三位一体号", badgeLabel: "西", faction: "spain", icon: "trafalgarSantisimaTrinidad", offset: [-240, 18] },
  { id: "neptune-fr", label: "法海王星号", badgeLabel: "法", faction: "france", icon: "trafalgarFrenchLine", offset: [-288, -14] },
  { id: "intrépide", label: "勇猛号", badgeLabel: "法", faction: "france", icon: "trafalgarFrenchLine", offset: [-336, 14] },
  { id: "argonauta", label: "阿戈诺塔号", badgeLabel: "西", faction: "spain", hiddenFrom: lossReductionTime, icon: "trafalgarFrenchLine", offset: [-384, -14] }
];

const alliedRearLine: FormationUnit[] = [
  { id: "pluton", label: "冥王星号", badgeLabel: "法", faction: "france", hiddenFrom: lossReductionTime, icon: "trafalgarFrenchLine", offset: [0, -12] },
  { id: "monarca", label: "君主号", badgeLabel: "西", faction: "spain", hiddenFrom: lossReductionTime, icon: "trafalgarFrenchLine", offset: [-52, 14] },
  { id: "algésiras", label: "阿尔赫西拉斯号", badgeLabel: "法", faction: "france", hiddenFrom: lossReductionTime, icon: "trafalgarFrenchLine", offset: [-104, -14] },
  { id: "bahama", label: "巴哈马号", badgeLabel: "西", faction: "spain", icon: "trafalgarFrenchLine", offset: [-156, 16] },
  { id: "aigle", label: "鹰号", badgeLabel: "法", faction: "france", icon: "trafalgarFrenchLine", offset: [-208, -12] },
  { id: "swiftsure", label: "快速号", badgeLabel: "法", faction: "france", hiddenFrom: lossReductionTime, icon: "trafalgarFrenchLine", offset: [-260, 16] }
];

function withOffsets(units: FormationUnit[], offsets: Array<[number, number]>): FormationUnit[] {
  return units.map((unit, index) => ({ ...unit, offset: offsets[index] ?? unit.offset }));
}

const britishMeleeGroup: FormationUnit[] = withOffsets([...britishVan, ...britishLee], [
  [0, -16],
  [-28, 26],
  [-58, -34],
  [-88, 18],
  [-118, -42],
  [-148, 34],
  [-178, -10],
  [30, 40],
  [60, -26],
  [90, 22],
  [122, -36],
  [154, 30],
  [186, -12],
  [218, 24]
]);

const alliedMeleeGroup: FormationUnit[] = withOffsets([...alliedMainLine, ...alliedRearLine], [
  [0, 18],
  [-30, -30],
  [-60, 34],
  [-90, -14],
  [-120, 24],
  [-150, -42],
  [-180, 4],
  [-210, 38],
  [-240, -24],
  [30, -48],
  [60, 30],
  [92, -8],
  [126, 42],
  [160, -30],
  [194, 12]
]);

const alliedWithdrawalGroup: FormationUnit[] = [
  { id: "principe", label: "阿斯图里亚斯亲王号", badgeLabel: "西", faction: "spain", icon: "trafalgarSantisimaTrinidad", offset: [10, 198] },
  { id: "neptuno", label: "尼普顿号", badgeLabel: "西", faction: "spain", icon: "trafalgarFrenchLine", offset: [-48, 232] },
  { id: "montanes", label: "山地号", badgeLabel: "西", faction: "spain", icon: "trafalgarFrenchLine", offset: [-112, 194] },
  { id: "indomptable-retreat", label: "不屈号残部", badgeLabel: "法", faction: "france", icon: "trafalgarFrenchLine", offset: [-180, 236] },
  { id: "pluton-retreat", label: "冥王星号残部", badgeLabel: "法", faction: "france", icon: "trafalgarFrenchLine", offset: [-250, 198] }
];

const capturedAndDisabledGroup: FormationUnit[] = [
  { id: "victory-prize", label: "胜利号", badgeLabel: "英", faction: "britain", icon: "trafalgarHmsVictory", offset: [0, -16] },
  { id: "temeraire-prize", label: "无畏号", badgeLabel: "英", faction: "britain", icon: "trafalgarBritishLine", offset: [-42, 18] },
  { id: "bucentaure-prize", label: "布桑托尔号", badgeLabel: "法", faction: "france", icon: "trafalgarBucentaure", offset: [-84, -20] },
  { id: "redoutable-prize", label: "可畏号", badgeLabel: "法", faction: "france", icon: "trafalgarFrenchLine", offset: [-126, 22] },
  { id: "santisima-prize", label: "圣三位一体号", badgeLabel: "西", faction: "spain", icon: "trafalgarSantisimaTrinidad", offset: [-168, -18] },
  { id: "santa-ana-prize", label: "圣安娜号", badgeLabel: "西", faction: "spain", icon: "trafalgarSantisimaTrinidad", offset: [-210, 20] },
  { id: "royal-sovereign-prize", label: "皇家主权号", badgeLabel: "英", faction: "britain", icon: "trafalgarRoyalSovereign", offset: [-252, -14] }
];

export const campaignStart = "1805-10-21T11:30";
export const campaignEnd = "1805-10-21T18:00";

export const mapPoints: MapPoint[] = [
  { id: "cadiz", label: "加的斯", coordinates: [-6.292, 36.529], kind: "port" },
  { id: "cape-trafalgar", label: "特拉法尔加角", coordinates: [-6.035, 36.183], kind: "front" },
  { id: "british-weather-column", label: "纳尔逊纵队", coordinates: [-7.02, 36.06], kind: "front" },
  { id: "british-lee-column", label: "科林伍德纵队", coordinates: [-7.02, 35.86], kind: "front" },
  { id: "allied-van", label: "法西前卫", coordinates: [-6.64, 36.24], kind: "front" },
  { id: "allied-center", label: "法西中央", coordinates: [-6.72, 36.12], kind: "front" },
  { id: "allied-rear", label: "法西后卫", coordinates: [-6.82, 35.98], kind: "front" },
  { id: "royal-sovereign-break", label: "皇家主权号突破", coordinates: [-6.79, 36.0], kind: "front" },
  { id: "victory-break", label: "胜利号突破", coordinates: [-6.72, 36.12], kind: "front" },
  { id: "redoutable-victory", label: "胜利号-可畏号接舷", coordinates: [-6.7, 36.13], kind: "front", revealAt: "1805-10-21T13:00" },
  { id: "nelson-fall", label: "纳尔逊中弹位置", coordinates: [-6.695, 36.128], kind: "objective", revealAt: "1805-10-21T13:15" },
  { id: "melee-center", label: "中央混战", coordinates: [-6.7, 36.06], kind: "front", revealAt: "1805-10-21T14:30" },
  { id: "captured-line", label: "被俘舰群", coordinates: [-6.64, 36.03], kind: "front", revealAt: "1805-10-21T17:45" },
  { id: "cadiz-retreat", label: "残舰退向加的斯", coordinates: [-6.55, 36.18], kind: "front", revealAt: "1805-10-21T17:45" }
];

export const frontLines: FrontLine[] = [
  {
    id: "allied-line-before-turn",
    faction: "france",
    label: "法西联合舰队：松散单纵列",
    from: "allied-van",
    to: "allied-rear",
    routeKind: "sea",
    start: "1805-10-21T11:30",
    end: "1805-10-21T12:10",
    visibleUntil: "1805-10-21T18:00",
    unitVisibleUntil: approachUnitEnd,
    unitIcon: "trafalgarFrenchLine",
    formationUnits: alliedMainLine,
    waypoints: [[-6.67, 36.2], [-6.74, 36.1], [-6.79, 36.02]],
    width: 11,
    intensity: 1
  },
  {
    id: "allied-rear-disorder",
    faction: "spain",
    label: "法西后卫：转向迟缓",
    from: "allied-center",
    to: "allied-rear",
    routeKind: "sea",
    start: "1805-10-21T11:30",
    end: "1805-10-21T12:35",
    visibleUntil: "1805-10-21T18:00",
    unitVisibleUntil: approachUnitEnd,
    unitIcon: "trafalgarFrenchLine",
    formationUnits: alliedRearLine,
    waypoints: [[-6.75, 36.08], [-6.8, 36.02]],
    width: 9,
    intensity: 0.75
  },
  {
    id: "nelson-weather-column",
    faction: "britain",
    label: "纳尔逊纵队：直插中央",
    from: "british-weather-column",
    to: "victory-break",
    routeKind: "sea",
    start: "1805-10-21T11:30",
    end: "1805-10-21T12:55",
    visibleUntil: "1805-10-21T18:00",
    unitVisibleUntil: approachUnitEnd,
    unitIcon: "trafalgarBritishLine",
    formationUnits: britishVan,
    waypoints: [[-6.9, 36.04], [-6.8, 36.08]],
    width: 12,
    intensity: 1
  },
  {
    id: "collingwood-lee-column",
    faction: "britain",
    label: "科林伍德纵队：切入后卫",
    from: "british-lee-column",
    to: "royal-sovereign-break",
    routeKind: "sea",
    start: "1805-10-21T11:30",
    end: "1805-10-21T12:15",
    visibleUntil: "1805-10-21T18:00",
    unitVisibleUntil: approachUnitEnd,
    unitIcon: "trafalgarBritishLine",
    formationUnits: britishLee,
    waypoints: [[-6.91, 35.88], [-6.84, 35.94]],
    width: 12,
    intensity: 1
  },
  {
    id: "royal-sovereign-breakthrough",
    faction: "britain",
    label: "皇家主权号突破圣安娜附近",
    from: "british-lee-column",
    to: "royal-sovereign-break",
    routeKind: "sea",
    start: "1805-10-21T12:00",
    end: "1805-10-21T12:20",
    hideUnit: true,
    visibleUntil: "1805-10-21T18:00",
    unitIcon: "trafalgarRoyalSovereign",
    formationUnits: [britishLee[0], britishLee[1], britishLee[2]],
    waypoints: [[-6.84, 35.94]],
    width: 8,
    intensity: 0.95
  },
  {
    id: "victory-breakthrough",
    faction: "britain",
    label: "胜利号突破布桑托尔-可畏号间隙",
    from: "british-weather-column",
    to: "redoutable-victory",
    routeKind: "sea",
    start: "1805-10-21T12:25",
    end: "1805-10-21T13:05",
    hideUnit: true,
    visibleUntil: "1805-10-21T18:00",
    unitIcon: "trafalgarHmsVictory",
    formationUnits: [britishVan[0], britishVan[1], britishVan[2]],
    waypoints: [[-6.84, 36.08], [-6.76, 36.11]],
    width: 8,
    intensity: 1
  },
  {
    id: "victory-redoutable-melee",
    faction: "france",
    label: "胜利号、可畏号与无畏号混战",
    from: "allied-center",
    to: "melee-center",
    routeKind: "sea",
    start: "1805-10-21T13:05",
    end: "1805-10-21T15:00",
    visibleUntil: "1805-10-21T18:00",
    unitVisibleFrom: meleeUnitStart,
    unitVisibleUntil: "1805-10-21T17:44",
    unitIcon: "trafalgarFrenchLine",
    formationUnits: alliedMeleeGroup,
    waypoints: [[-6.7, 36.13], [-6.77, 36.09], [-6.72, 36.06]],
    width: 7,
    intensity: 0.92
  },
  {
    id: "british-central-melee",
    faction: "britain",
    label: "英军两纵队展开包夹",
    from: "victory-break",
    to: "melee-center",
    routeKind: "sea",
    start: "1805-10-21T13:05",
    end: "1805-10-21T15:25",
    visibleUntil: "1805-10-21T18:00",
    unitVisibleFrom: meleeUnitStart,
    unitVisibleUntil: "1805-10-21T17:44",
    unitIcon: "trafalgarBritishLine",
    formationUnits: britishMeleeGroup,
    waypoints: [[-6.73, 36.11], [-6.74, 36.08]],
    width: 9,
    intensity: 0.88
  },
  {
    id: "captured-hulks-drift",
    faction: "britain",
    label: "英军俘获与控船",
    from: "melee-center",
    to: "captured-line",
    routeKind: "sea",
    start: "1805-10-21T15:00",
    end: "1805-10-21T17:15",
    unitVisibleFrom: "1805-10-21T16:30",
    visibleUntil: "1805-10-21T18:00",
    unitIcon: "trafalgarBritishLine",
    formationUnits: capturedAndDisabledGroup,
    waypoints: [[-6.69, 36.05], [-6.66, 36.04]],
    width: 8,
    intensity: 0.68
  },
  {
    id: "allied-retreat-cadiz",
    faction: "spain",
    label: "法西残舰退向加的斯",
    from: "melee-center",
    to: "cadiz-retreat",
    routeKind: "sea",
    start: "1805-10-21T15:20",
    end: "1805-10-21T17:45",
    unitVisibleFrom: "1805-10-21T16:30",
    visibleUntil: "1805-10-21T18:00",
    unitIcon: "trafalgarFrenchLine",
    formationUnits: alliedWithdrawalGroup,
    waypoints: [[-6.66, 36.1], [-6.6, 36.14]],
    width: 7,
    intensity: 0.52
  }
];

export const battleEvents: BattleEvent[] = [
  {
    id: "fleet-contact",
    date: "1805-10-21T11:30",
    title: "两舰队在特拉法尔加外海接近",
    location: "加的斯以南、特拉法尔加角外海",
    coordinates: [-6.86, 36.02],
    phase: "接敌展开",
    summary: "英军约27艘战列舰分两纵队从西侧接近，法西联合舰队约33艘战列舰在轻风中保持松散单纵列。",
    detail:
      "动画按约1:5比例抽象显示舰船：英军两纵队各显示7艘左右，法西中央与后卫显示15艘左右，并保留关键旗舰。轻风让双方接近速度慢，队列越拉越不整。",
    significance: "纳尔逊放弃平行炮战，用两纵队切断敌线，核心风险是靠近时要承受长时间横向火力。",
    mapFocus: ["british-weather-column", "british-lee-column", "allied-center"]
  },
  {
    id: "royal-sovereign-breaks-line",
    date: "1805-10-21T12:10",
    title: "皇家主权号先切入敌后卫",
    location: "法西后卫、圣安娜号附近",
    coordinates: [-6.79, 36.0],
    phase: "首段突破",
    summary: "科林伍德的皇家主权号率先抵近并切入联合舰队后卫，后续英舰还在追上，局面开始从线列战转为混战。",
    detail:
      "皇家主权号先于纳尔逊纵队接敌，向圣安娜号附近穿入。英军后续舰尚未完全到位，所以动画保留它的独立突破段和后续纵队展开。",
    significance: "这使法西后卫被提前缠住，联合舰队很难维持一条完整战列线。",
    mapFocus: ["royal-sovereign-break", "allied-rear", "british-lee-column"]
  },
  {
    id: "victory-breaks-center",
    date: "1805-10-21T13:00",
    title: "胜利号切入中央缺口",
    location: "布桑托尔号与可畏号附近",
    coordinates: [-6.7, 36.13],
    phase: "中央突破",
    summary: "胜利号在布桑托尔号与可畏号附近穿入敌线，纳尔逊纵队的后续舰逐步进入中心战场。",
    detail:
      "突破点并不是整齐十字路口，而是舰队在轻风、炮烟与队列错位中形成的缝隙。动画让布桑托尔号、可畏号、圣三位一体号等旗舰级目标集中在中央。",
    significance: "法西中央被切开后，英军可以从两侧近距离射击，联合舰队指挥与互援迅速恶化。",
    mapFocus: ["victory-break", "redoutable-victory", "allied-center"]
  },
  {
    id: "nelson-shot",
    date: "1805-10-21T13:15",
    title: "纳尔逊在胜利号上中弹",
    location: "胜利号甲板，可畏号近旁",
    coordinates: [-6.695, 36.128],
    phase: "旗舰混战",
    summary: "约13:15，纳尔逊在胜利号甲板上中弹。这里标注的是中弹位置，不是死亡时间。",
    detail:
      "纳尔逊大约在战斗开始后约三分之一时中弹，被抬到下层甲板；胜利号仍与可畏号、无畏号等舰纠缠，中央炮烟和接舷战最为混乱。",
    significance: "指挥官倒下没有立即中断既定战法，但它成为特拉法尔加叙事中最重要的个人节点。",
    mapFocus: ["nelson-fall", "redoutable-victory", "melee-center"]
  },
  {
    id: "central-melee",
    date: "1805-10-21T14:30",
    title: "中央海域形成大混战",
    location: "特拉法尔加角西南外海",
    coordinates: [-6.7, 36.06],
    phase: "混战扩大",
    summary: "英军两纵队逐渐展开，法西中央与后卫被割裂；多艘战列舰在烟雾、低速和近距离炮战中挤作一团。",
    detail:
      "画面不再只保留两三艘旗舰，而是继续显示普通主力舰和后续舰，表现一场大舰队战的承载量。路线开始变短、交叉、拥挤，用来表达队列崩解而非整齐航行。",
    significance: "特拉法尔加的决定性不在单舰决斗，而在英军把敌线切碎后形成局部多打少。",
    mapFocus: ["melee-center", "redoutable-victory", "captured-line"]
  },
  {
    id: "nelson-dies",
    date: "1805-10-21T16:30",
    title: "纳尔逊确认胜利后死亡",
    location: "胜利号下层甲板",
    coordinates: [-6.66, 36.07],
    phase: "战局已定",
    summary: "约16:30，纳尔逊在胜利号下层甲板去世；此时英军胜势已经明确。",
    detail:
      "动画将13:15中弹与16:30死亡分开，避免把“战斗三分之一时中弹”误写成当场阵亡。此时法西多艘战列舰已失去机动或投降。",
    significance: "纳尔逊的死亡和胜利几乎绑定在一起，使特拉法尔加成为英国海军记忆中的核心事件。",
    mapFocus: ["nelson-fall", "melee-center", "captured-line"]
  },
  {
    id: "losses-counted",
    date: "1805-10-21T17:45",
    title: "战果与损失：法西舰队被重创",
    location: "特拉法尔加外海至加的斯方向",
    coordinates: [-6.64, 36.03],
    phase: "战斗结束",
    summary: "英军无战列舰损失；法西联合舰队约18艘被俘或摧毁，后续风暴又扩大损失。",
    detail:
      "RMG口径记录双方战列舰约27对33，英军约449人阵亡、1241人受伤；法西约4400人阵亡、2500人受伤、约7000人被俘。不同资料对俘获/毁损舰数有18艘或22艘等口径差异，本动画采用战斗当日约18艘被俘/毁损并在来源文档说明。",
    significance: "战斗消除了拿破仑短期渡海威胁，也确立英国长期制海权优势。",
    mapFocus: ["captured-line", "cadiz-retreat", "cape-trafalgar"]
  }
];

export const cueEventIds = new Set([
  "royal-sovereign-breaks-line",
  "victory-breaks-center",
  "nelson-shot",
  "central-melee"
]);
