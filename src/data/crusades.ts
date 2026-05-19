import type { BattleEvent, FrontLine, MapPoint } from "./battleOfFrance";

export const campaignStart = "1095-11-27";
export const campaignEnd = "1291-05-18";

export const mapPoints: MapPoint[] = [
  { id: "clermont", label: "克莱蒙", coordinates: [3.087, 45.777], kind: "city" },
  { id: "venice", label: "威尼斯", coordinates: [12.3155, 45.4408], kind: "port" },
  { id: "constantinople", label: "君士坦丁堡", coordinates: [28.9784, 41.0082], kind: "capital" },
  { id: "nicaea", label: "尼西亚", coordinates: [29.7211, 40.4286], kind: "front" },
  { id: "dorylaeum", label: "多律莱乌姆", coordinates: [30.52, 39.78], kind: "front" },
  { id: "edessa", label: "埃德萨", coordinates: [38.795, 37.159], kind: "city" },
  { id: "antioch", label: "安条克", coordinates: [36.161, 36.202], kind: "city" },
  { id: "tripoli", label: "的黎波里", coordinates: [35.8497, 34.4367], kind: "port" },
  { id: "acre", label: "阿卡", coordinates: [35.0818, 32.923], kind: "port" },
  { id: "jerusalem", label: "耶路撒冷", coordinates: [35.2137, 31.7683], kind: "capital" },
  { id: "damascus", label: "大马士革", coordinates: [36.2765, 33.5138], kind: "capital" },
  { id: "hattin", label: "哈丁", coordinates: [35.45, 32.8], kind: "front" },
  { id: "cairo", label: "开罗", coordinates: [31.2357, 30.0444], kind: "capital" },
  { id: "mansurah", label: "曼苏拉", coordinates: [31.38, 31.04], kind: "front" }
];

export const frontLines: FrontLine[] = [
  {
    id: "first-crusade-to-constantinople",
    faction: "rome",
    label: "第一次十字军：西欧至君士坦丁堡",
    from: "clermont",
    to: "constantinople",
    routeKind: "land",
    start: "1095-11-27",
    end: "1097-04-01",
    unitIcon: "cavalry",
    waypoints: [
      [8.5, 46.4],
      [16.3, 48.2],
      [20.5, 44.8],
      [25.0, 42.4]
    ]
  },
  {
    id: "anatolia-crossing",
    faction: "rome",
    label: "小亚细亚作战：尼西亚-多律莱乌姆",
    from: "constantinople",
    to: "dorylaeum",
    routeKind: "land",
    start: "1097-05-01",
    end: "1097-07-01",
    unitIcon: "cavalry",
    waypoints: [[29.7211, 40.4286]]
  },
  {
    id: "antioch-road",
    faction: "rome",
    label: "向叙利亚推进：安条克围城",
    from: "dorylaeum",
    to: "antioch",
    routeKind: "land",
    start: "1097-07-02",
    end: "1098-06-03",
    unitIcon: "cavalry"
  },
  {
    id: "jerusalem-capture",
    faction: "rome",
    label: "耶路撒冷作战",
    from: "antioch",
    to: "jerusalem",
    routeKind: "land",
    start: "1099-01-13",
    end: "1099-07-15",
    unitIcon: "cavalry",
    waypoints: [
      [35.8497, 34.4367],
      [35.0818, 32.923]
    ]
  },
  {
    id: "edessa-falls",
    faction: "carthage",
    label: "赞吉攻陷埃德萨",
    from: "damascus",
    to: "edessa",
    routeKind: "land",
    start: "1144-11-01",
    end: "1144-12-24",
    unitIcon: "cavalry"
  },
  {
    id: "second-crusade-damascus",
    faction: "rome",
    label: "第二次十字军：大马士革失败",
    from: "acre",
    to: "damascus",
    routeKind: "land",
    start: "1148-07-24",
    end: "1148-07-28",
    visibleUntil: "1148-08-05",
    unitVisibleUntil: "1148-07-28",
    unitIcon: "cavalry"
  },
  {
    id: "hattin-saladin",
    faction: "carthage",
    label: "萨拉丁：哈丁与耶路撒冷",
    from: "damascus",
    to: "jerusalem",
    routeKind: "land",
    start: "1187-07-04",
    end: "1187-10-02",
    unitIcon: "cavalry",
    waypoints: [[35.45, 32.8]]
  },
  {
    id: "third-crusade-coast",
    faction: "rome",
    label: "第三次十字军：阿卡与海岸",
    from: "acre",
    to: "jerusalem",
    routeKind: "land",
    start: "1189-08-28",
    end: "1192-09-02",
    visibleUntil: "1192-09-02",
    unitVisibleUntil: "1192-09-02",
    unitIcon: "cavalry",
    waypoints: [[34.95, 32.33]]
  },
  {
    id: "fourth-crusade",
    faction: "rome",
    label: "第四次十字军：威尼斯至君士坦丁堡",
    from: "venice",
    to: "constantinople",
    routeKind: "sea",
    start: "1202-10-01",
    end: "1204-04-13",
    unitIcon: "ship",
    waypoints: [
      [16.2, 42.8],
      [19.6, 39.7],
      [24.2, 37.8],
      [27.5, 40.0]
    ]
  },
  {
    id: "egypt-crusade",
    faction: "rome",
    label: "埃及作战：曼苏拉",
    from: "acre",
    to: "mansurah",
    routeKind: "sea",
    start: "1248-06-01",
    end: "1250-04-06",
    visibleUntil: "1250-04-15",
    unitVisibleUntil: "1250-04-06",
    unitIcon: "ship",
    waypoints: [
      [33.6, 32.0],
      [31.8, 31.4]
    ]
  },
  {
    id: "acre-falls",
    faction: "carthage",
    label: "马穆鲁克收复阿卡",
    from: "cairo",
    to: "acre",
    routeKind: "land",
    start: "1291-04-05",
    end: "1291-05-18",
    unitIcon: "cavalry"
  }
];

export const battleEvents: BattleEvent[] = [
  {
    id: "clermont",
    date: "1095-11-27",
    title: "克莱蒙号召",
    location: "克莱蒙",
    coordinates: [3.087, 45.777],
    phase: "动员",
    summary: "教皇乌尔班二世号召西欧骑士前往东方，第一次十字军运动开始。",
    detail: "宗教热情、贵族扩张、朝圣通道和拜占庭求援交织在一起，西欧军队开始向君士坦丁堡集结。",
    significance: "十字军把西欧、拜占庭和伊斯兰近东卷入长期互动，战争与朝圣、贸易和政治重组相互缠绕。",
    mapFocus: ["clermont", "constantinople"]
  },
  {
    id: "nicaea-dorylaeum",
    date: "1097-07-01",
    title: "尼西亚与多律莱乌姆",
    location: "小亚细亚",
    coordinates: [30.52, 39.78],
    phase: "小亚细亚突破",
    summary: "十字军通过拜占庭控制区进入小亚细亚，击败塞尔柱力量后继续南下。",
    detail: "尼西亚交还拜占庭，多律莱乌姆战斗保证了穿越安纳托利亚的道路，但补给和炎热持续削弱军队。",
    significance: "第一次十字军从动员变成真实远征，战线从欧洲边缘推进到叙利亚门户。",
    mapFocus: ["constantinople", "nicaea", "dorylaeum"]
  },
  {
    id: "antioch",
    date: "1098-06-03",
    title: "安条克陷落",
    location: "安条克",
    coordinates: [36.161, 36.202],
    phase: "叙利亚门户",
    summary: "长期围城后，十字军夺取安条克，但随即面临反包围压力。",
    detail: "安条克是通向黎凡特南部的关键城防节点。夺城后，十字军内部领地利益与继续进军之间出现张力。",
    significance: "安条克公国形成，十字军国家雏形出现，远征目标从单一路线转为持久占领。",
    mapFocus: ["antioch", "edessa", "jerusalem"]
  },
  {
    id: "jerusalem-1099",
    date: "1099-07-15",
    title: "耶路撒冷陷落",
    location: "耶路撒冷",
    coordinates: [35.2137, 31.7683],
    phase: "圣城夺取",
    summary: "第一次十字军夺取耶路撒冷，建立耶路撒冷王国。",
    detail: "远征军沿海岸南下，最终攻破耶路撒冷。军事胜利伴随严重屠杀，成为后续记忆和冲突的核心节点。",
    significance: "十字军国家在黎凡特站稳脚跟，但也必须长期依赖海上补给和西欧增援。",
    mapFocus: ["acre", "jerusalem", "tripoli"]
  },
  {
    id: "edessa-1144",
    date: "1144-12-24",
    title: "埃德萨陷落",
    location: "埃德萨",
    coordinates: [38.795, 37.159],
    phase: "边疆崩裂",
    summary: "赞吉攻陷埃德萨，十字军国家最北部的屏障被打破。",
    detail: "埃德萨远离海岸且补给脆弱，它的陷落暴露十字军国家纵深不足的问题。",
    significance: "埃德萨陷落触发第二次十字军，也显示伊斯兰政权开始重新整合反击力量。",
    mapFocus: ["edessa", "antioch", "damascus"]
  },
  {
    id: "second-crusade",
    date: "1148-07-28",
    title: "第二次十字军大马士革失败",
    location: "大马士革",
    coordinates: [36.2765, 33.5138],
    phase: "远征受挫",
    summary: "第二次十字军围攻大马士革失败，西欧大规模增援没有恢复局势。",
    detail: "战略目标摇摆和地方盟友关系复杂，使远征军无法取得决定性成果。",
    significance: "十字军运动第一次遭遇重大声望打击，东方战场的主动权继续向穆斯林统合者移动。",
    mapFocus: ["acre", "damascus", "jerusalem"]
  },
  {
    id: "hattin",
    date: "1187-07-04",
    title: "哈丁会战",
    location: "哈丁",
    coordinates: [35.45, 32.8],
    phase: "萨拉丁反攻",
    summary: "萨拉丁在哈丁击败耶路撒冷王国主力，随后收复耶路撒冷。",
    detail: "十字军主力在缺水和机动劣势下被围歼，圣城防御体系随即崩溃。",
    significance: "哈丁改变黎凡特力量平衡，引发第三次十字军和海岸据点防御格局。",
    mapFocus: ["hattin", "jerusalem", "damascus"]
  },
  {
    id: "third-crusade",
    date: "1191-07-12",
    title: "第三次十字军夺取阿卡",
    location: "阿卡",
    coordinates: [35.0818, 32.923],
    phase: "海岸线争夺",
    summary: "第三次十字军夺取阿卡，巩固沿海据点，但未能重夺耶路撒冷。",
    detail: "狮心王理查等西欧君主介入，使十字军恢复部分海岸控制，最终以停战保障朝圣通道。",
    significance: "十字军国家重心从内陆圣城转向海港和补给线，长期依赖地中海交通。",
    mapFocus: ["acre", "jerusalem"]
  },
  {
    id: "constantinople-1204",
    date: "1204-04-13",
    title: "第四次十字军攻陷君士坦丁堡",
    location: "君士坦丁堡",
    coordinates: [28.9784, 41.0082],
    phase: "目标偏航",
    summary: "第四次十字军偏离圣地目标，攻陷并洗劫基督教的君士坦丁堡。",
    detail: "债务、威尼斯海运和拜占庭内部政治把远征导向君士坦丁堡，拉丁帝国建立。",
    significance: "这次偏航严重削弱拜占庭，也暴露十字军运动中宗教、商业和政治利益的冲突。",
    mapFocus: ["venice", "constantinople"]
  },
  {
    id: "egypt",
    date: "1250-04-06",
    title: "埃及作战受挫",
    location: "曼苏拉",
    coordinates: [31.38, 31.04],
    phase: "尼罗河失败",
    summary: "法王路易九世的埃及远征在曼苏拉受挫，转向埃及的战略没有成功。",
    detail: "十字军试图以埃及作为控制圣地的关键，但尼罗河三角洲地形和马穆鲁克反击造成失败。",
    significance: "后期十字军越来越依赖海上投送和有限据点，已难以恢复内陆优势。",
    mapFocus: ["cairo", "mansurah", "acre"]
  },
  {
    id: "acre-1291",
    date: "1291-05-18",
    title: "阿卡陷落",
    location: "阿卡",
    coordinates: [35.0818, 32.923],
    phase: "十字军国家终局",
    summary: "马穆鲁克攻陷阿卡，拉丁基督教在黎凡特的主要据点瓦解。",
    detail: "阿卡失守后，残余据点相继撤离或陷落，十字军国家在近东大陆的时代结束。",
    significance: "十字军运动并未停止，但军事重心从占领圣地转向地中海岛屿、边疆和后续政治想象。",
    mapFocus: ["acre", "jerusalem", "cairo"]
  }
];
