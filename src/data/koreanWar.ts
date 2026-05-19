import type { BattleEvent, FrontLine, MapPoint } from "./battleOfFrance";

export const campaignStart = "1950-06-25";
export const campaignEnd = "1953-07-27";

export const mapPoints: MapPoint[] = [
  { id: "beijing", label: "北京", coordinates: [116.4074, 39.9042], kind: "capital" },
  { id: "shenyang", label: "沈阳", coordinates: [123.4315, 41.8057], kind: "city" },
  { id: "andong", label: "安东", coordinates: [124.383, 40.124], kind: "front" },
  { id: "sinuiju", label: "新义州", coordinates: [124.398, 40.1], kind: "front" },
  { id: "unsan", label: "云山", coordinates: [125.95, 39.95], kind: "front" },
  { id: "pyongyang", label: "平壤", coordinates: [125.7625, 39.0392], kind: "capital" },
  { id: "wonsan", label: "元山", coordinates: [127.446, 39.153], kind: "port" },
  { id: "changjin", label: "长津湖", coordinates: [127.33, 40.48], kind: "front" },
  { id: "kaesong", label: "开城", coordinates: [126.5544, 37.9382], kind: "front" },
  { id: "seoul", label: "汉城", coordinates: [126.978, 37.5665], kind: "capital" },
  { id: "incheon", label: "仁川", coordinates: [126.7052, 37.4563], kind: "port" },
  { id: "wonju", label: "原州", coordinates: [127.92, 37.342], kind: "front" },
  { id: "triangle-hill", label: "上甘岭", coordinates: [127.25, 38.34], kind: "front" },
  { id: "busan", label: "釜山", coordinates: [129.0756, 35.1796], kind: "port" },
  { id: "nakdong", label: "洛东江", coordinates: [128.35, 35.75], kind: "front" },
  { id: "yellow-sea-carrier", label: "黄海航母编队", coordinates: [125.05, 36.55], kind: "port" },
  { id: "japan-bases", label: "日本基地群", coordinates: [130.55, 33.65], kind: "port" },
  { id: "mig-alley", label: "米格走廊", coordinates: [124.9, 40.2], kind: "front" },
  { id: "panmunjom", label: "板门店", coordinates: [126.676, 37.956], kind: "front" }
];

export const frontLines: FrontLine[] = [
  {
    id: "kpa-south-offensive",
    faction: "communist",
    label: "朝鲜人民军南进",
    from: "pyongyang",
    to: "busan",
    routeKind: "land",
    start: "1950-06-25",
    end: "1950-09-14",
    visibleUntil: "1950-09-16",
    unitVisibleUntil: "1950-09-14",
    unitIcon: "tankKorean",
    waypoints: [
      [126.978, 37.5665],
      [128.35, 35.75]
    ]
  },
  {
    id: "busan-perimeter",
    faction: "un",
    label: "釜山防御圈",
    from: "busan",
    to: "nakdong",
    routeKind: "land",
    start: "1950-08-04",
    end: "1950-09-15",
    visibleUntil: "1950-09-28",
    unitVisibleUntil: "1950-09-14",
    unitIcon: "infantry"
  },
  {
    id: "incheon-landing",
    faction: "un",
    label: "仁川登陆",
    from: "yellow-sea-carrier",
    to: "incheon",
    routeKind: "sea",
    start: "1950-09-15",
    end: "1950-09-16",
    visibleUntil: "1950-10-19",
    unitIcon: "carrierEssex",
    waypoints: [[125.7, 37.2]]
  },
  {
    id: "un-seoul-pyongyang",
    faction: "un",
    label: "联合国军北进",
    from: "seoul",
    to: "pyongyang",
    routeKind: "land",
    start: "1950-09-16",
    end: "1950-10-19",
    visibleUntil: "1950-10-25",
    unitVisibleUntil: "1950-10-24",
    unitIcon: "tankKorean",
    waypoints: [[126.5544, 37.9382]]
  },
  {
    id: "un-to-yalu",
    faction: "un",
    label: "推进至鸭绿江",
    from: "pyongyang",
    to: "sinuiju",
    routeKind: "land",
    start: "1950-10-20",
    end: "1950-10-25",
    visibleUntil: "1950-11-05",
    unitVisibleUntil: "1950-10-24",
    unitIcon: "infantry"
  },
  {
    id: "pva-first-phase",
    faction: "communist",
    label: "第一次战役：北部接触",
    from: "andong",
    to: "unsan",
    routeKind: "land",
    start: "1950-10-25",
    end: "1950-11-05",
    unitIcon: "infantryPva",
    waypoints: [[124.398, 40.1]]
  },
  {
    id: "pva-second-phase-west",
    faction: "communist",
    label: "第二次战役：西线反击",
    from: "unsan",
    to: "pyongyang",
    routeKind: "land",
    start: "1950-11-25",
    end: "1950-12-05",
    unitIcon: "infantryPva",
    waypoints: [[125.45, 39.45]]
  },
  {
    id: "chosin-campaign",
    faction: "communist",
    label: "长津湖方向穿插",
    from: "sinuiju",
    to: "changjin",
    routeKind: "land",
    start: "1950-11-24",
    end: "1950-12-13",
    unitIcon: "infantryPva",
    waypoints: [[126.2, 40.6]]
  },
  {
    id: "third-phase-seoul",
    faction: "communist",
    label: "第三次战役入汉城",
    from: "pyongyang",
    to: "seoul",
    routeKind: "land",
    start: "1950-12-31",
    end: "1951-01-04",
    unitIcon: "infantryPva",
    waypoints: [[126.5544, 37.9382]]
  },
  {
    id: "un-counteroffensive-seoul",
    faction: "un",
    label: "联合国军重占汉城",
    from: "busan",
    to: "seoul",
    routeKind: "land",
    start: "1951-01-25",
    end: "1951-03-14",
    unitIcon: "tankKorean",
    waypoints: [
      [127.92, 37.342],
      [126.978, 37.5665]
    ]
  },
  {
    id: "fifth-phase",
    faction: "communist",
    label: "第五次战役",
    from: "kaesong",
    to: "wonju",
    routeKind: "land",
    start: "1951-04-22",
    end: "1951-05-20",
    unitIcon: "infantryPva",
    waypoints: [[127.4, 37.7]]
  },
  {
    id: "mig-alley-air-war",
    faction: "un",
    label: "米格走廊喷气空战",
    from: "japan-bases",
    to: "mig-alley",
    routeKind: "air",
    start: "1951-11-01",
    end: "1952-06-30",
    unitIcon: "sabre",
    waypoints: [
      [129.0, 36.7],
      [126.2, 39.4]
    ]
  },
  {
    id: "triangle-hill",
    faction: "communist",
    label: "上甘岭阵地战",
    from: "kaesong",
    to: "triangle-hill",
    routeKind: "land",
    start: "1952-10-14",
    end: "1952-11-25",
    unitIcon: "infantryPva"
  },
  {
    id: "armistice-line",
    faction: "un",
    label: "停战线固定",
    from: "seoul",
    to: "panmunjom",
    routeKind: "land",
    start: "1953-07-20",
    end: "1953-07-27",
    unitIcon: "infantry"
  }
];

export const battleEvents: BattleEvent[] = [
  {
    id: "north-korea-invasion",
    date: "1950-06-25",
    title: "朝鲜战争爆发",
    location: "三八线至汉城方向",
    coordinates: [126.978, 37.5665],
    phase: "南进与危机",
    summary: "朝鲜人民军越过三八线南下，汉城很快失守，半岛局势急剧扩大。",
    detail: "战争初期，朝鲜人民军依托装甲和纵深推进快速压向韩国南部。联合国安理会决议后，美国主导的联合国军开始介入。",
    significance: "局部内战迅速国际化，东亚冷战结构被推入直接军事对抗。",
    mapFocus: ["pyongyang", "seoul", "busan"]
  },
  {
    id: "busan-perimeter",
    date: "1950-08-04",
    title: "釜山防御圈形成",
    location: "韩国东南部洛东江一线",
    coordinates: [128.35, 35.75],
    phase: "防线压缩",
    summary: "联合国军和韩国军队退守釜山防御圈，在洛东江一线稳住最后纵深。",
    detail: "釜山港和外围机场维持了增援、补给和空中支援。防御圈没有解决全局危机，但为后续反击争取了时间。",
    significance: "半岛南端的据点守住，使登陆反击和兵力集结成为可能。",
    mapFocus: ["busan", "nakdong", "seoul"]
  },
  {
    id: "incheon-landing",
    date: "1950-09-15",
    title: "仁川登陆",
    location: "仁川港",
    coordinates: [126.7052, 37.4563],
    phase: "两栖反击",
    summary: "联合国军在仁川实施高风险登陆，切入朝鲜人民军后方。",
    detail: "仁川潮汐、港口条件和航道复杂，但登陆成功后迅速威胁汉城和朝鲜人民军补给线。航母航空兵和舰炮支援是登陆窗口的关键。",
    significance: "战场主动权逆转，釜山方向与仁川方向形成南北夹击。",
    mapFocus: ["yellow-sea-carrier", "incheon", "seoul"]
  },
  {
    id: "seoul-retaken",
    date: "1950-09-28",
    title: "联合国军重夺汉城",
    location: "汉城",
    coordinates: [126.978, 37.5665],
    phase: "反攻展开",
    summary: "仁川登陆后，联合国军与韩国军队重夺汉城。",
    detail: "首都争夺使朝鲜人民军南方战线后路受到威胁。釜山防御圈内的部队也转入反攻。",
    significance: "朝鲜人民军从进攻态势转入大规模后撤，战线快速北移。",
    mapFocus: ["incheon", "seoul", "busan"]
  },
  {
    id: "pyongyang-falls",
    date: "1950-10-19",
    title: "平壤陷落",
    location: "平壤",
    coordinates: [125.7625, 39.0392],
    phase: "北进",
    summary: "联合国军占领平壤，战线继续向鸭绿江方向推进。",
    detail: "越过三八线后的北进使战争目标从恢复战前状态转向摧毁北方政权；但鸭绿江方向的推进很快遭遇中国人民志愿军第一次战役打击。",
    significance: "半岛战局接近鸭绿江，战争进入新的国际干预临界点；动画在10月25日后隐藏这条旧进攻线，避免与志愿军反击同时显示。",
    mapFocus: ["seoul", "pyongyang", "sinuiju"]
  },
  {
    id: "pva-entry",
    date: "1950-10-25",
    title: "中国人民志愿军入朝",
    location: "鸭绿江至北朝鲜山地",
    coordinates: [124.398, 40.1],
    phase: "入朝作战",
    summary: "中国人民志愿军跨过鸭绿江，发动第一次战役，在北部山地接触并打断联合国军北进节奏。",
    detail: "第一次战役的重点是北部山地接触和突然打击，并不是立即推进到平壤。随后第二次战役才把联合国军大幅推回。",
    significance: "战争从半岛内部战争升级为中美直接交战，战线走势被重新改写。",
    mapFocus: ["andong", "sinuiju", "unsan"]
  },
  {
    id: "chosin-reservoir",
    date: "1950-11-27",
    title: "长津湖战役",
    location: "长津湖与盖马高原",
    coordinates: [127.33, 40.48],
    phase: "严寒山地战",
    summary: "志愿军在严寒山地围攻美陆战一师等部，东线联合国军被迫向兴南方向撤退。",
    detail: "长津湖方向的战斗把补给、天气、山地机动和突围火力推到极限。它不是单点歼灭，而是东线战役态势的急剧扭转。",
    significance: "联合国军从鸭绿江附近撤回，北朝鲜大部重新进入中朝控制。",
    mapFocus: ["changjin", "wonsan", "sinuiju"]
  },
  {
    id: "seoul-third-phase",
    date: "1951-01-04",
    title: "第三次战役占领汉城",
    location: "汉城",
    coordinates: [126.978, 37.5665],
    phase: "战线南压",
    summary: "中朝军队发动第三次战役，再次占领汉城。",
    detail: "冬季攻势迫使联合国军继续南撤，但补给和火力优势也使联合国军在南方逐步恢复组织。",
    significance: "汉城再次易手，显示战线仍在剧烈摆动，双方都还未形成稳定停战线。",
    mapFocus: ["pyongyang", "kaesong", "seoul"]
  },
  {
    id: "seoul-un-retaken",
    date: "1951-03-14",
    title: "联合国军再占汉城",
    location: "汉城",
    coordinates: [126.978, 37.5665],
    phase: "反攻与稳定",
    summary: "联合国军反攻重新占领汉城，战线回到三八线附近。",
    detail: "联合国军依托空地火力、机动和后勤优势逐步北推。战场从大纵深进退转向围绕中部山地和交通线的争夺。",
    significance: "战线开始趋向稳定，战争目标重新收缩到停战与分界线问题。",
    mapFocus: ["busan", "wonju", "seoul"]
  },
  {
    id: "fifth-phase-offensive",
    date: "1951-04-22",
    title: "第五次战役",
    location: "中部战线",
    coordinates: [127.4, 37.7],
    phase: "大规模攻防",
    summary: "中朝军队发动第五次战役，双方在中部战线进行大规模攻防。",
    detail: "这次攻势规模大、推进快，但联合国军凭借火力和机动恢复反击。之后双方更难通过一次进攻改变全局。",
    significance: "机动作战高潮逐步结束，战线进入持久阵地战和谈判并行阶段。",
    mapFocus: ["kaesong", "wonju", "seoul"]
  },
  {
    id: "armistice-talks",
    date: "1951-07-10",
    title: "停战谈判开始",
    location: "开城、板门店方向",
    coordinates: [126.676, 37.956],
    phase: "谈判与阵地战",
    summary: "停战谈判启动，但前线战斗仍持续，双方围绕分界线和战俘问题拉锯。",
    detail: "谈判没有立即带来停火。前线逐渐固化为高地、交通线和火力控制的消耗战。",
    significance: "战争进入政治谈判和局部阵地争夺并行的长期阶段。",
    mapFocus: ["kaesong", "panmunjom", "seoul"]
  },
  {
    id: "mig-alley",
    date: "1951-11-01",
    title: "米格走廊喷气空战",
    location: "鸭绿江下游空域",
    coordinates: [124.9, 40.2],
    phase: "喷气空战",
    summary: "F-86 与 MiG-15 等喷气机在鸭绿江附近空域频繁交战。",
    detail: "抗美援朝空战体现了喷气时代的高速拦截、护航和制空争夺。动画使用 F-86 时代图标，不使用海湾战争 F-16。",
    significance: "空中优势影响补给线、桥梁和前线火力节奏，也标志喷气战斗机时代正式进入大规模战争。",
    mapFocus: ["japan-bases", "mig-alley", "sinuiju"]
  },
  {
    id: "triangle-hill",
    date: "1952-10-14",
    title: "上甘岭战役",
    location: "中部战线五圣山地区",
    coordinates: [127.25, 38.34],
    phase: "阵地消耗",
    summary: "双方围绕上甘岭等高地进行密集火力和坑道阵地争夺。",
    detail: "战斗集中在有限高地，却投入大量炮火、步兵和坑道防御。它代表停战谈判阶段的高强度阵地战。",
    significance: "前线大体稳定后，局部阵地的政治和军事象征意义被放大。",
    mapFocus: ["triangle-hill", "kaesong", "panmunjom"]
  },
  {
    id: "armistice",
    date: "1953-07-27",
    title: "朝鲜停战协定签署",
    location: "板门店",
    coordinates: [126.676, 37.956],
    phase: "停战",
    summary: "交战方签署停战协定，军事分界线和非军事区形成。",
    detail: "停战不是和平条约。朝鲜半岛的分裂和军事对峙延续至今，战争的政治后果远超战场本身。",
    significance: "战争以停战线固定告一段落，东亚冷战格局长期固化。",
    mapFocus: ["panmunjom", "seoul", "pyongyang"]
  }
];

export const cueEventIds = new Set([
  "north-korea-invasion",
  "busan-perimeter",
  "incheon-landing",
  "seoul-retaken",
  "pyongyang-falls",
  "pva-entry",
  "chosin-reservoir",
  "seoul-third-phase",
  "seoul-un-retaken",
  "fifth-phase-offensive",
  "mig-alley",
  "triangle-hill"
]);

export const diveCueEventIds = new Set(["incheon-landing", "mig-alley"]);
