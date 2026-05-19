import type { BattleEvent, FrontLine, MapPoint } from "./battleOfFrance";

export const campaignStart = "BCE-0058-03-01";
export const campaignEnd = "BCE-0044-03-15";

export const battleCueEventIds = new Set([
  "helvetii",
  "ariovistus",
  "sabis",
  "britain",
  "alesia",
  "rubicon",
  "ilerda",
  "pharsalus",
  "alexandria",
  "zela",
  "thapsus",
  "munda"
]);

export const mapPoints: MapPoint[] = [
  { id: "rome", label: "罗马", coordinates: [12.4964, 41.9028], kind: "capital" },
  { id: "ravenna", label: "拉文纳", coordinates: [12.2035, 44.4184], kind: "city" },
  { id: "rubicon", label: "卢比孔", coordinates: [12.37, 44.05], kind: "front" },
  { id: "geneva", label: "日内瓦", coordinates: [6.1432, 46.2044], kind: "city" },
  { id: "bibracte", label: "比布拉克特", coordinates: [4.05, 46.92], kind: "front" },
  { id: "vosges", label: "孚日", coordinates: [7.15, 48.25], kind: "front" },
  { id: "sabis", label: "萨比斯", coordinates: [3.8, 50.25], kind: "front" },
  { id: "channel", label: "海峡", coordinates: [1.5, 50.9], kind: "front" },
  { id: "britain", label: "不列颠", coordinates: [0.05, 51.28], kind: "front" },
  { id: "avvaricum", label: "阿瓦里库姆", coordinates: [2.4, 47.08], kind: "front" },
  { id: "gergovia", label: "格尔戈维亚", coordinates: [3.13, 45.7], kind: "front" },
  { id: "alesia", label: "阿莱西亚", coordinates: [4.5, 47.54], kind: "front" },
  { id: "massilia", label: "马赛", coordinates: [5.3698, 43.2965], kind: "port" },
  { id: "ilerda", label: "伊莱尔达", coordinates: [0.62, 41.62], kind: "front" },
  { id: "brundisium", label: "布伦迪西乌姆", coordinates: [17.94, 40.64], kind: "port" },
  { id: "dyrrachium", label: "狄拉基乌姆", coordinates: [19.45, 41.32], kind: "port" },
  { id: "pharsalus", label: "法萨卢斯", coordinates: [22.38, 39.29], kind: "front" },
  { id: "alexandria", label: "亚历山大里亚", coordinates: [29.92, 31.2], kind: "port" },
  { id: "zela", label: "泽拉", coordinates: [35.89, 40.14], kind: "front" },
  { id: "thapsus", label: "塔普苏斯", coordinates: [10.68, 35.65], kind: "front" },
  { id: "munda", label: "蒙达", coordinates: [-4.8, 37.6], kind: "front" }
];

export const frontLines: FrontLine[] = [
  {
    id: "helvetii-campaign",
    faction: "rome",
    label: "高卢开局：赫尔维蒂",
    from: "geneva",
    to: "bibracte",
    routeKind: "land",
    start: "BCE-0058-03-01",
    end: "BCE-0058-06-01",
    unitIcon: "cavalry"
  },
  {
    id: "ariovistus-campaign",
    faction: "rome",
    label: "击退阿里奥维斯图斯",
    from: "bibracte",
    to: "vosges",
    routeKind: "land",
    start: "BCE-0058-07-01",
    end: "BCE-0058-09-01",
    unitIcon: "cavalry"
  },
  {
    id: "belgae-campaign",
    faction: "rome",
    label: "比利时诸部作战",
    from: "vosges",
    to: "sabis",
    routeKind: "land",
    start: "BCE-0057-03-01",
    end: "BCE-0057-09-01",
    unitIcon: "cavalry"
  },
  {
    id: "britain-crossing",
    faction: "rome",
    label: "渡海侦察不列颠",
    from: "channel",
    to: "britain",
    routeKind: "sea",
    start: "BCE-0055-08-01",
    end: "BCE-0054-09-01",
    unitIcon: "ship",
    waypoints: [[1.0, 51.4]]
  },
  {
    id: "vercingetorix-campaign",
    faction: "rome",
    label: "镇压维钦托利联盟",
    from: "avvaricum",
    to: "alesia",
    routeKind: "land",
    start: "BCE-0052-03-01",
    end: "BCE-0052-10-01",
    unitIcon: "cavalry",
    waypoints: [[3.13, 45.7]]
  },
  {
    id: "rubicon-march",
    faction: "rome",
    label: "越过卢比孔",
    from: "ravenna",
    to: "rome",
    routeKind: "land",
    start: "BCE-0049-01-10",
    end: "BCE-0049-01-17",
    unitIcon: "cavalry",
    waypoints: [[12.37, 44.05]]
  },
  {
    id: "ilerda-campaign",
    faction: "rome",
    label: "西班牙伊莱尔达",
    from: "rome",
    to: "ilerda",
    routeKind: "land",
    start: "BCE-0049-03-01",
    end: "BCE-0049-08-01",
    unitIcon: "cavalry",
    waypoints: [[5.3698, 43.2965]]
  },
  {
    id: "greece-crossing",
    faction: "rome",
    label: "横渡亚得里亚追庞培",
    from: "brundisium",
    to: "dyrrachium",
    routeKind: "sea",
    start: "BCE-0049-12-01",
    end: "BCE-0048-07-01",
    unitIcon: "ship"
  },
  {
    id: "pharsalus-campaign",
    faction: "rome",
    label: "法萨卢斯决战",
    from: "dyrrachium",
    to: "pharsalus",
    routeKind: "land",
    start: "BCE-0048-07-02",
    end: "BCE-0048-08-09",
    unitIcon: "cavalry"
  },
  {
    id: "alexandrian-war",
    faction: "rome",
    label: "亚历山大里亚战争",
    from: "pharsalus",
    to: "alexandria",
    routeKind: "sea",
    start: "BCE-0048-09-01",
    end: "BCE-0047-03-27",
    unitIcon: "ship",
    waypoints: [
      [25.1, 35.3],
      [29.92, 31.2]
    ]
  },
  {
    id: "zela-campaign",
    faction: "rome",
    label: "本都泽拉：来见胜",
    from: "alexandria",
    to: "zela",
    routeKind: "sea",
    start: "BCE-0047-04-01",
    end: "BCE-0047-08-02",
    unitIcon: "ship",
    waypoints: [
      [32.0, 34.0],
      [35.0, 36.0]
    ]
  },
  {
    id: "thapsus-campaign",
    faction: "rome",
    label: "北非塔普苏斯",
    from: "rome",
    to: "thapsus",
    routeKind: "sea",
    start: "BCE-0046-01-01",
    end: "BCE-0046-04-06",
    unitIcon: "ship",
    waypoints: [[12.0, 37.0]]
  },
  {
    id: "munda-campaign",
    faction: "rome",
    label: "西班牙蒙达终战",
    from: "rome",
    to: "munda",
    routeKind: "land",
    start: "BCE-0045-01-01",
    end: "BCE-0045-03-17",
    unitIcon: "cavalry",
    waypoints: [
      [5.3698, 43.2965],
      [0.62, 41.62]
    ]
  },
  {
    id: "ides-of-march",
    faction: "carthage",
    label: "政治终局：三月十五日",
    from: "munda",
    to: "rome",
    routeKind: "land",
    start: "BCE-0045-03-18",
    end: "BCE-0044-03-15",
    unitIcon: "cavalry",
    waypoints: [[5.3698, 43.2965]]
  }
];

export const battleEvents: BattleEvent[] = [
  {
    id: "helvetii",
    date: "BCE-0058-06-01",
    title: "比布拉克特击败赫尔维蒂",
    location: "高卢、比布拉克特",
    coordinates: [4.05, 46.92],
    phase: "高卢开局",
    summary: "凯撒阻止赫尔维蒂人大迁徙，打开高卢战争序幕。",
    detail: "这场战役让凯撒把罗马边疆危机转化为个人军功舞台，也使军队长期留在高卢成为现实。",
    significance: "高卢战争从边防干预变成持续征服，凯撒获得独立于罗马政治的军队和声望。",
    mapFocus: ["geneva", "bibracte"]
  },
  {
    id: "ariovistus",
    date: "BCE-0058-09-01",
    title: "孚日击退阿里奥维斯图斯",
    location: "孚日方向",
    coordinates: [7.15, 48.25],
    phase: "莱茵威慑",
    summary: "凯撒击败日耳曼首领阿里奥维斯图斯，宣示罗马对高卢秩序的主导权。",
    detail: "击败阿里奥维斯图斯后，凯撒可以把自己塑造成高卢诸部的保护者，同时压制来自莱茵以东的威胁。",
    significance: "这一步把战线推向高卢东北部，也让凯撒获得继续作战的政治理由。",
    mapFocus: ["bibracte", "vosges"]
  },
  {
    id: "sabis",
    date: "BCE-0057-09-01",
    title: "萨比斯河苦战",
    location: "比利时高卢",
    coordinates: [3.8, 50.25],
    phase: "北方诸部",
    summary: "凯撒在萨比斯河遭遇比利时诸部突袭，罗马军团险胜。",
    detail: "战斗显示高卢作战并非线性推进。凯撒的军团纪律和临场调度在危急中稳住战线。",
    significance: "北方高卢被打开，罗马军队进一步深入大西洋和海峡方向。",
    mapFocus: ["vosges", "sabis"]
  },
  {
    id: "britain",
    date: "BCE-0055-08-26",
    title: "首次登陆不列颠",
    location: "英吉利海峡与不列颠南岸",
    coordinates: [0.05, 51.28],
    phase: "海峡展示",
    summary: "凯撒两次渡海不列颠，军事成果有限，但政治宣传价值巨大。",
    detail: "远征不列颠证明凯撒可以把战争叙事推到罗马人熟悉世界的边缘。海上投送、潮汐和补给限制也暴露明显。",
    significance: "不列颠远征扩大凯撒声望，但没有形成持久占领，更多是高卢战争中的政治展示。",
    mapFocus: ["channel", "britain"]
  },
  {
    id: "alesia",
    date: "BCE-0052-10-01",
    title: "阿莱西亚围城",
    location: "高卢、阿莱西亚",
    coordinates: [4.5, 47.54],
    phase: "高卢决战",
    summary: "凯撒围困维钦托利，同时用内外两道防线挡住救援军。",
    detail: "阿莱西亚是凯撒军事工程能力的代表：围城线和反围城线同时运作，迫使高卢联盟投降。",
    significance: "高卢大规模抵抗被压垮，凯撒的军事实力和个人威望达到顶点。",
    mapFocus: ["avvaricum", "gergovia", "alesia"]
  },
  {
    id: "rubicon",
    date: "BCE-0049-01-10",
    title: "越过卢比孔",
    location: "意大利、卢比孔",
    coordinates: [12.37, 44.05],
    phase: "内战爆发",
    summary: "凯撒率军越过卢比孔，直接挑战元老院和庞培阵营。",
    detail: "这一步把高卢战争积累的军队资源带回意大利政治核心。军事行动和宪政危机合为一体。",
    significance: "罗马共和国的权力斗争转化为全面内战，凯撒从边疆统帅变成夺权者。",
    mapFocus: ["ravenna", "rubicon", "rome"]
  },
  {
    id: "ilerda",
    date: "BCE-0049-08-01",
    title: "伊莱尔达解除西班牙威胁",
    location: "西班牙、伊莱尔达",
    coordinates: [0.62, 41.62],
    phase: "先断庞培西翼",
    summary: "凯撒先解决庞培在西班牙的军队，再转向东地中海主战场。",
    detail: "他没有立刻追庞培本人，而是选择切断庞培阵营的西方资源和老兵军团。",
    significance: "西班牙行动保证凯撒后方安全，使内战主力可以转向希腊。",
    mapFocus: ["massilia", "ilerda"]
  },
  {
    id: "pharsalus",
    date: "BCE-0048-08-09",
    title: "法萨卢斯决战",
    location: "希腊、法萨卢斯",
    coordinates: [22.38, 39.29],
    phase: "共和国主战场",
    summary: "凯撒在法萨卢斯击败庞培主力，内战格局逆转。",
    detail: "面对庞培较强骑兵，凯撒预留步兵反制，打破庞培侧翼计划。庞培随后逃往埃及。",
    significance: "法萨卢斯不是内战终点，但它摧毁了庞培作为共和国军事核心的地位。",
    mapFocus: ["dyrrachium", "pharsalus"]
  },
  {
    id: "alexandria",
    date: "BCE-0047-03-27",
    title: "亚历山大里亚战争",
    location: "埃及、亚历山大里亚",
    coordinates: [29.92, 31.2],
    phase: "埃及纠缠",
    summary: "凯撒追庞培至埃及，卷入托勒密王朝内争，并扶持克娄巴特拉。",
    detail: "埃及战事把罗马内战和东地中海王朝政治连接起来。凯撒在城内受困，最终获得增援脱身。",
    significance: "埃及成为凯撒政治和军事网络的一部分，也为后续罗马-埃及关系埋下伏笔。",
    mapFocus: ["pharsalus", "alexandria"]
  },
  {
    id: "zela",
    date: "BCE-0047-08-02",
    title: "泽拉：我来我见我胜",
    location: "本都、泽拉",
    coordinates: [35.89, 40.14],
    phase: "东方速胜",
    summary: "凯撒迅速击败法尔纳克二世，以短促胜利重建东方威慑。",
    detail: "泽拉战役规模不如法萨卢斯，却因凯撒的简短战报成为政治传播经典。",
    significance: "东部威胁被快速清除，凯撒得以回头处理共和国残余势力。",
    mapFocus: ["alexandria", "zela"]
  },
  {
    id: "thapsus",
    date: "BCE-0046-04-06",
    title: "塔普苏斯击溃北非共和派",
    location: "北非、塔普苏斯",
    coordinates: [10.68, 35.65],
    phase: "北非清场",
    summary: "凯撒在北非击败小加图和庞培派残余支持的军队。",
    detail: "北非战场有努米底亚骑兵和战象因素。胜利后，共和派在非洲的政治军事基础崩溃。",
    significance: "内战重心转向最后的西班牙战场，凯撒独裁地位更稳固。",
    mapFocus: ["rome", "thapsus"]
  },
  {
    id: "munda",
    date: "BCE-0045-03-17",
    title: "蒙达终战",
    location: "西班牙、蒙达",
    coordinates: [-4.8, 37.6],
    phase: "内战终局",
    summary: "凯撒在西班牙击败庞培之子，结束主要军事抵抗。",
    detail: "蒙达是一场艰难的正面战，凯撒本人据称也感到胜负接近。胜利后，庞培派主力瓦解。",
    significance: "凯撒完成军事统一，但共和国政治裂痕并未被解决。",
    mapFocus: ["ilerda", "munda"]
  },
  {
    id: "assassination",
    date: "BCE-0044-03-15",
    title: "三月十五日遇刺",
    location: "罗马",
    coordinates: [12.4964, 41.9028],
    phase: "政治终局",
    summary: "凯撒在罗马遇刺，军事胜利没有转化为稳定制度安排。",
    detail: "终身独裁和个人权力集中激化反对者恐惧。刺杀没有恢复共和国，反而引发新的内战。",
    significance: "凯撒战争史以政治暴力收束，罗马共和国走向元首制帝国。",
    mapFocus: ["munda", "rome"]
  }
];
