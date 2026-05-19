import type { BattleEvent, FrontLine, MapPoint } from "./battleOfFrance";

export const campaignStart = "BCE-0336-10-01";
export const campaignEnd = "BCE-0323-06-13";

export const battleCueEventIds = new Set([
  "thebes",
  "granicus",
  "issus",
  "tyre",
  "gaugamela",
  "persepolis",
  "darius-death",
  "sogdian",
  "hydaspes",
  "hyphasis"
]);

export const mapPoints: MapPoint[] = [
  { id: "pella", label: "佩拉", coordinates: [22.52, 40.76], kind: "capital" },
  { id: "thebes", label: "底比斯", coordinates: [23.32, 38.32], kind: "city" },
  { id: "hellespont", label: "赫勒斯滂", coordinates: [26.4, 40.15], kind: "front" },
  { id: "granicus", label: "格拉尼库斯", coordinates: [27.25, 40.18], kind: "front" },
  { id: "gordium", label: "戈尔迪乌姆", coordinates: [31.98, 39.66], kind: "city" },
  { id: "issus", label: "伊苏斯", coordinates: [36.17, 36.86], kind: "front" },
  { id: "tyre", label: "推罗", coordinates: [35.2, 33.27], kind: "port" },
  { id: "gaza", label: "加沙", coordinates: [34.47, 31.5], kind: "front" },
  { id: "memphis", label: "孟菲斯", coordinates: [31.25, 29.85], kind: "capital" },
  { id: "alexandria", label: "亚历山大港", coordinates: [29.92, 31.2], kind: "port" },
  { id: "gaugamela", label: "高加米拉", coordinates: [43.36, 36.37], kind: "front" },
  { id: "babylon", label: "巴比伦", coordinates: [44.42, 32.54], kind: "capital" },
  { id: "susa", label: "苏萨", coordinates: [48.26, 32.19], kind: "capital" },
  { id: "persepolis", label: "波斯波利斯", coordinates: [52.89, 29.93], kind: "capital" },
  { id: "ecbatana", label: "埃克巴坦那", coordinates: [48.52, 34.8], kind: "city" },
  { id: "bactra", label: "巴克特拉", coordinates: [66.9, 36.75], kind: "city" },
  { id: "sogdianRock", label: "粟特岩", coordinates: [67.1, 39.6], kind: "front" },
  { id: "hydaspes", label: "希达斯佩斯", coordinates: [73.73, 32.93], kind: "front" },
  { id: "hyphasis", label: "希法西斯", coordinates: [75.7, 31.5], kind: "front" },
  { id: "gedrosia", label: "格德罗西亚", coordinates: [62.3, 26.7], kind: "front" }
];

export const frontLines: FrontLine[] = [
  {
    id: "macedon-to-thebes",
    faction: "rome",
    label: "马其顿稳住希腊",
    from: "pella",
    to: "thebes",
    routeKind: "land",
    start: "BCE-0336-10-01",
    end: "BCE-0335-09-01",
    unitIcon: "cavalry"
  },
  {
    id: "hellespont-crossing",
    faction: "rome",
    label: "渡海进入小亚细亚",
    from: "pella",
    to: "granicus",
    routeKind: "sea",
    start: "BCE-0334-03-01",
    end: "BCE-0334-05-01",
    unitIcon: "ship",
    waypoints: [
      [24.9, 40.3],
      [26.4, 40.15]
    ]
  },
  {
    id: "asia-minor-opening",
    faction: "rome",
    label: "小亚细亚推进",
    from: "granicus",
    to: "gordium",
    routeKind: "land",
    start: "BCE-0334-05-01",
    end: "BCE-0333-04-01",
    unitIcon: "cavalry"
  },
  {
    id: "issus-campaign",
    faction: "rome",
    label: "伊苏斯击退大流士",
    from: "gordium",
    to: "issus",
    routeKind: "land",
    start: "BCE-0333-04-02",
    end: "BCE-0333-11-01",
    unitIcon: "cavalry",
    waypoints: [[34.0, 37.5]]
  },
  {
    id: "levant-siege-line",
    faction: "rome",
    label: "腓尼基海岸与推罗",
    from: "issus",
    to: "gaza",
    routeKind: "land",
    start: "BCE-0333-11-02",
    end: "BCE-0332-10-01",
    unitIcon: "cavalry",
    waypoints: [[35.2, 33.27]]
  },
  {
    id: "egypt-foundation",
    faction: "rome",
    label: "进入埃及并建港",
    from: "gaza",
    to: "alexandria",
    routeKind: "land",
    start: "BCE-0332-10-02",
    end: "BCE-0331-04-07",
    unitIcon: "cavalry",
    waypoints: [[31.25, 29.85]]
  },
  {
    id: "gaugamela-strike",
    faction: "rome",
    label: "高加米拉决战",
    from: "alexandria",
    to: "gaugamela",
    routeKind: "land",
    start: "BCE-0331-04-08",
    end: "BCE-0331-10-01",
    unitIcon: "cavalry",
    waypoints: [
      [35.2, 33.27],
      [39.5, 35.5]
    ]
  },
  {
    id: "persian-capitals",
    faction: "rome",
    label: "夺取波斯王都",
    from: "gaugamela",
    to: "persepolis",
    routeKind: "land",
    start: "BCE-0331-10-02",
    end: "BCE-0330-05-01",
    unitIcon: "cavalry",
    waypoints: [
      [44.42, 32.54],
      [48.26, 32.19]
    ]
  },
  {
    id: "darius-pursuit",
    faction: "rome",
    label: "追击大流士",
    from: "persepolis",
    to: "ecbatana",
    routeKind: "land",
    start: "BCE-0330-05-02",
    end: "BCE-0330-07-01",
    unitIcon: "cavalry"
  },
  {
    id: "bactria-sogdiana",
    faction: "rome",
    label: "中亚山地战争",
    from: "ecbatana",
    to: "sogdianRock",
    routeKind: "land",
    start: "BCE-0330-07-02",
    end: "BCE-0328-05-01",
    unitIcon: "cavalry",
    waypoints: [
      [58.36, 37.94],
      [66.9, 36.75]
    ]
  },
  {
    id: "hydaspes-campaign",
    faction: "rome",
    label: "印度河方向",
    from: "sogdianRock",
    to: "hydaspes",
    routeKind: "land",
    start: "BCE-0327-05-01",
    end: "BCE-0326-05-01",
    unitIcon: "cavalry",
    waypoints: [[70.0, 34.4]]
  },
  {
    id: "hyphasis-mutiny",
    faction: "carthage",
    label: "军队拒绝继续东进",
    from: "hydaspes",
    to: "hyphasis",
    routeKind: "land",
    start: "BCE-0326-05-02",
    end: "BCE-0326-09-01",
    unitIcon: "cavalry"
  },
  {
    id: "gedrosian-return",
    faction: "rome",
    label: "格德罗西亚归途",
    from: "hyphasis",
    to: "babylon",
    routeKind: "land",
    start: "BCE-0325-01-01",
    end: "BCE-0323-06-13",
    unitIcon: "cavalry",
    waypoints: [
      [67.0, 24.9],
      [62.3, 26.7],
      [52.89, 29.93]
    ]
  }
];

export const battleEvents: BattleEvent[] = [
  {
    id: "accession",
    date: "BCE-0336-10-01",
    title: "亚历山大继位",
    location: "马其顿、佩拉",
    coordinates: [22.52, 40.76],
    phase: "马其顿整合",
    summary: "腓力二世遇刺后，亚历山大继承王位，先稳住马其顿和希腊同盟。",
    detail: "年轻国王必须证明自己能控制马其顿贵族、希腊城邦和父亲留下的东征计划。继位初期的速度，决定远征能否开始。",
    significance: "这不是远征的旁白前奏，而是战役轴线的起点：没有希腊后方的压制，就没有跨海攻波斯。",
    mapFocus: ["pella", "thebes"]
  },
  {
    id: "thebes",
    date: "BCE-0335-09-01",
    title: "底比斯被毁",
    location: "希腊、底比斯",
    coordinates: [23.32, 38.32],
    phase: "希腊后方",
    summary: "亚历山大镇压底比斯叛乱，以强硬姿态稳住希腊后方。",
    detail: "底比斯的毁灭震慑了其他城邦。马其顿军队因此能把主力转向亚洲，而不必在南希腊持续消耗。",
    significance: "希腊战场被迅速压平，远征军获得向赫勒斯滂集结的政治空间。",
    mapFocus: ["pella", "thebes", "hellespont"]
  },
  {
    id: "granicus",
    date: "BCE-0334-05-01",
    title: "格拉尼库斯河战役",
    location: "小亚细亚西北部",
    coordinates: [27.25, 40.18],
    phase: "小亚细亚开局",
    summary: "亚历山大渡过赫勒斯滂后，在格拉尼库斯击败波斯地方总督军。",
    detail: "这场胜利打开小亚细亚门户，也向希腊城邦宣示远征不是袭扰，而是持续征服。",
    significance: "马其顿军队第一次在亚洲正面击败波斯军政体系，沿岸城市开始倒向亚历山大。",
    mapFocus: ["hellespont", "granicus", "gordium"]
  },
  {
    id: "issus",
    date: "BCE-0333-11-01",
    title: "伊苏斯击败大流士三世",
    location: "奇里乞亚、伊苏斯",
    coordinates: [36.17, 36.86],
    phase: "大王对决",
    summary: "亚历山大在狭窄地形中击败大流士三世，波斯王室辎重落入马其顿手中。",
    detail: "伊苏斯把远征从地方战争升级成王对王的决斗。大流士逃走后，亚历山大没有立刻东追，而是转向海岸线。",
    significance: "波斯帝国的王权威望受损，东地中海海岸成为下一阶段的关键目标。",
    mapFocus: ["gordium", "issus", "tyre"]
  },
  {
    id: "tyre",
    date: "BCE-0332-07-01",
    title: "推罗围城",
    location: "腓尼基海岸、推罗",
    coordinates: [35.2, 33.27],
    phase: "切断波斯海权",
    summary: "亚历山大长期围攻岛城推罗，夺取腓尼基海岸控制权。",
    detail: "推罗是海上枢纽。亚历山大修筑堤道、动用舰队，说明他不是只靠骑兵突进，也在拆除波斯海军支点。",
    significance: "推罗陷落后，波斯在东地中海的海上威胁被大幅削弱，埃及通道打开。",
    mapFocus: ["issus", "tyre", "gaza"]
  },
  {
    id: "egypt",
    date: "BCE-0331-04-07",
    title: "进入埃及并奠基亚历山大港",
    location: "埃及、孟菲斯与亚历山大港",
    coordinates: [29.92, 31.2],
    phase: "尼罗河与新港",
    summary: "亚历山大进入埃及，被当地接纳为统治者，并规划亚历山大港。",
    detail: "埃及阶段让远征获得粮食、港口和合法性资源。亚历山大港成为后续希腊化世界的海上枢纽。",
    significance: "征服不只是战场推进，也包括建立长期控制节点和地中海交通网络。",
    mapFocus: ["gaza", "memphis", "alexandria"]
  },
  {
    id: "gaugamela",
    date: "BCE-0331-10-01",
    title: "高加米拉决战",
    location: "亚述平原、高加米拉",
    coordinates: [43.36, 36.37],
    phase: "帝国决战",
    summary: "亚历山大在高加米拉击败大流士主力，波斯帝国中枢瓦解。",
    detail: "大流士选择开阔地形，试图发挥数量和战车优势。马其顿骑兵突击打穿中枢，大流士再次逃离。",
    significance: "高加米拉后，巴比伦、苏萨和波斯王都相继向亚历山大开放，阿契美尼德帝国进入崩解阶段。",
    mapFocus: ["gaugamela", "babylon", "susa"]
  },
  {
    id: "persepolis",
    date: "BCE-0330-05-01",
    title: "波斯波利斯陷落",
    location: "波斯腹地",
    coordinates: [52.89, 29.93],
    phase: "王都与财富",
    summary: "马其顿军队进入波斯王都，帝国财富和象征中心落入亚历山大手中。",
    detail: "苏萨、波斯波利斯等王都代表波斯财政和礼仪中心。焚毁宫殿的传统叙事，也标志复仇希波战争的象征完成。",
    significance: "远征目标从打败波斯王，转向接管和重组波斯帝国空间。",
    mapFocus: ["babylon", "susa", "persepolis"]
  },
  {
    id: "darius-death",
    date: "BCE-0330-07-01",
    title: "大流士三世之死",
    location: "伊朗高原",
    coordinates: [48.52, 34.8],
    phase: "追击与继承",
    summary: "大流士在逃亡中被部下杀害，亚历山大开始以波斯王权继承者姿态继续东进。",
    detail: "大流士之死没有结束战争，反而把战场推向伊朗高原、巴克特里亚和粟特。",
    significance: "亚历山大从征服者转为帝国继承者，军队也进入更漫长、更分散的山地与边疆战争。",
    mapFocus: ["persepolis", "ecbatana", "bactra"]
  },
  {
    id: "sogdian",
    date: "BCE-0328-05-01",
    title: "中亚山地平定",
    location: "巴克特里亚、粟特",
    coordinates: [67.1, 39.6],
    phase: "边疆硬仗",
    summary: "马其顿军队在中亚经历持续叛乱、山地堡垒和远距离补给压力。",
    detail: "巴克特里亚、粟特的战争不再是一次会战解决。亚历山大通过围攻、联姻和驻军逐步压制边疆。",
    significance: "帝国越向东，军事胜利越依赖政治整合和补给体系，而不只是战术冲锋。",
    mapFocus: ["bactra", "sogdianRock"]
  },
  {
    id: "hydaspes",
    date: "BCE-0326-05-01",
    title: "希达斯佩斯河战役",
    location: "旁遮普、希达斯佩斯河",
    coordinates: [73.73, 32.93],
    phase: "印度河战场",
    summary: "亚历山大击败波罗斯，遭遇战象和季风河流环境下的艰难作战。",
    detail: "马其顿军队夜渡河流，利用机动压制波罗斯军。胜利后，东方继续扩张的代价变得更清晰。",
    significance: "这是远征最东端的决定性战斗，也暴露军队疲惫和战略边界。",
    mapFocus: ["sogdianRock", "hydaspes", "hyphasis"]
  },
  {
    id: "hyphasis",
    date: "BCE-0326-09-01",
    title: "希法西斯河兵变",
    location: "印度河以东边缘",
    coordinates: [75.7, 31.5],
    phase: "东进极限",
    summary: "军队拒绝继续向更远东方前进，亚历山大被迫折返。",
    detail: "连年征战、季风环境、未知强敌和补给压力叠加，军队不愿再推进到恒河流域。",
    significance: "征服史的边界不是地图尽头，而是军队承受力、补给和政治控制能力的共同极限。",
    mapFocus: ["hydaspes", "hyphasis"]
  },
  {
    id: "babylon-return",
    date: "BCE-0323-06-13",
    title: "巴比伦病逝",
    location: "巴比伦",
    coordinates: [44.42, 32.54],
    phase: "帝国未定",
    summary: "亚历山大回到巴比伦后病逝，庞大征服成果随即进入继业者争夺。",
    detail: "归途穿越格德罗西亚造成惨重损失。亚历山大仍计划新的远征和帝国整合，但死亡让继承问题立即爆发。",
    significance: "征服完成得极快，制度整合却远未完成。亚历山大的帝国在他死后被继业者瓜分。",
    mapFocus: ["gedrosia", "babylon"]
  }
];
