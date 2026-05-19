import type { BattleEvent, FrontLine, MapPoint } from "./battleOfFrance";
import type { HistoricalRegion } from "../types/maps";

export const campaignStart = "BCE-0230-01-01";
export const campaignEnd = "BCE-0221-01-01";

export const mapPoints: MapPoint[] = [
  { id: "xianyang", label: "咸阳", coordinates: [108.704, 34.329], kind: "capital" },
  { id: "hangu", label: "函谷关", coordinates: [110.91, 34.62], kind: "front" },
  { id: "yangdi", label: "阳翟", coordinates: [113.47, 34.16], kind: "capital" },
  { id: "handan", label: "邯郸", coordinates: [114.49, 36.62], kind: "capital" },
  { id: "daliang", label: "大梁", coordinates: [114.31, 34.8], kind: "capital" },
  { id: "shouchun", label: "寿春", coordinates: [116.78, 32.58], kind: "capital" },
  { id: "jicheng", label: "蓟城", coordinates: [116.4, 39.9], kind: "capital" },
  { id: "linzi", label: "临淄", coordinates: [118.31, 36.82], kind: "capital" },
  { id: "liaodong", label: "辽东", coordinates: [123.43, 41.8], kind: "front" },
  { id: "chuai", label: "蕲南", coordinates: [116.1, 31.7], kind: "front" },
  { id: "huanghe", label: "黄河", coordinates: [113.7, 35.0], kind: "front" },
  { id: "huai", label: "淮水", coordinates: [116.4, 33.0], kind: "front" }
];

type Coordinate = [number, number];

const reverse = (points: Coordinate[]) => [...points].reverse();

// Topological Warring States partition redrawn from the CC0 Wikimedia
// "Warring States c. 250 BC.svg" reference. Adjacent states reuse the same
// boundary arrays so the fills meet cleanly instead of overlapping.
const qinZhaoWest: Coordinate[] = [
  [110.1, 39.2],
  [110.8, 37.7],
  [110.7, 35.6]
];
const qinHan: Coordinate[] = [
  [110.7, 35.6],
  [110.9, 34.0]
];
const qinChu: Coordinate[] = [
  [110.9, 34.0],
  [109.8, 32.7],
  [108.2, 31.3]
];
const hanZhao: Coordinate[] = [
  [110.7, 35.6],
  [112.5, 35.4]
];
const hanWei: Coordinate[] = [
  [112.5, 35.4],
  [113.6, 34.6],
  [113.8, 33.6]
];
const hanChu: Coordinate[] = [
  [113.8, 33.6],
  [112.4, 33.2],
  [110.9, 34.0]
];
const zhaoWei: Coordinate[] = [
  [112.5, 35.4],
  [114.6, 36.1],
  [116.3, 35.9]
];
const zhaoQi: Coordinate[] = [
  [116.3, 35.9],
  [117.0, 36.9],
  [118.0, 38.1]
];
const zhaoYan: Coordinate[] = [
  [118.0, 38.1],
  [116.0, 39.3],
  [115.5, 41.0]
];
const yanQi: Coordinate[] = [
  [121.2, 38.8],
  [119.6, 38.3],
  [118.0, 38.1]
];
const weiQi: Coordinate[] = [
  [116.3, 35.9],
  [116.8, 35.1],
  [117.2, 34.5]
];
const weiChu: Coordinate[] = [
  [117.2, 34.5],
  [115.0, 33.6],
  [113.8, 33.6]
];
const qiChu: Coordinate[] = [
  [117.2, 34.5],
  [118.6, 34.2],
  [120.3, 33.6]
];

export const historicalRegions: HistoricalRegion[] = [
  {
    id: "qin",
    label: "秦",
    labelCoordinates: [106.7, 34.5],
    coordinates: [
      [101.5, 31.2],
      [101.8, 34.0],
      [102.8, 36.2],
      [104.2, 38.4],
      [107.0, 39.4],
      ...qinZhaoWest,
      ...qinHan.slice(1),
      ...qinChu.slice(1),
      [105.0, 29.2],
      [103.0, 29.5]
    ]
  },
  {
    id: "han",
    label: "韩",
    captureDate: "BCE-0230-01-01",
    labelCoordinates: [112.8, 34.3],
    coordinates: [
      ...hanZhao,
      ...hanWei.slice(1),
      ...hanChu.slice(1),
      ...reverse(qinHan).slice(1)
    ]
  },
  {
    id: "wei",
    label: "魏",
    captureDate: "BCE-0225-01-01",
    labelCoordinates: [114.8, 34.8],
    coordinates: [
      ...zhaoWei,
      ...weiQi.slice(1),
      ...weiChu.slice(1),
      ...reverse(hanWei).slice(1)
    ]
  },
  {
    id: "zhao",
    label: "赵",
    captureDate: "BCE-0228-01-01",
    labelCoordinates: [114.8, 38.0],
    coordinates: [
      [110.1, 39.2],
      [111.5, 40.5],
      [114.5, 41.2],
      ...reverse(zhaoYan),
      ...reverse(zhaoQi).slice(1),
      ...reverse(zhaoWei).slice(1),
      ...reverse(hanZhao).slice(1),
      ...reverse(qinZhaoWest).slice(1)
    ]
  },
  {
    id: "yan",
    label: "燕",
    captureDate: "BCE-0222-01-01",
    labelCoordinates: [119.5, 40.6],
    coordinates: [
      [115.5, 41.0],
      [118.4, 42.3],
      [122.8, 42.5],
      [125.3, 41.2],
      [124.4, 39.5],
      [121.2, 38.8],
      ...yanQi.slice(1),
      ...zhaoYan.slice(1)
    ]
  },
  {
    id: "qi",
    label: "齐",
    captureDate: "BCE-0221-01-01",
    labelCoordinates: [118.8, 36.4],
    coordinates: [
      ...zhaoQi,
      ...reverse(yanQi).slice(1),
      [122.5, 36.8],
      [122.0, 35.2],
      ...reverse(qiChu),
      ...reverse(weiQi).slice(1)
    ]
  },
  {
    id: "chu",
    label: "楚",
    captureDate: "BCE-0223-01-01",
    labelCoordinates: [115.4, 30.5],
    coordinates: [
      ...reverse(qinChu),
      ...reverse(hanChu).slice(1),
      ...reverse(weiChu).slice(1),
      ...qiChu.slice(1),
      [121.4, 31.2],
      [119.6, 28.8],
      [116.2, 27.1],
      [112.0, 27.3],
      [108.0, 29.2],
      [108.2, 31.3]
    ]
  }
];

export const frontLines: FrontLine[] = [
  {
    id: "qin-han",
    faction: "carthage",
    label: "灭韩",
    from: "xianyang",
    to: "yangdi",
    start: "BCE-0230-01-01",
    end: "BCE-0230-12-31",
    unitIcon: "cavalry",
    waypoints: [[110.91, 34.62]]
  },
  {
    id: "qin-zhao",
    faction: "carthage",
    label: "灭赵：邯郸",
    from: "xianyang",
    to: "handan",
    start: "BCE-0229-01-01",
    end: "BCE-0228-12-31",
    unitIcon: "chariot",
    waypoints: [
      [110.91, 34.62],
      [113.6, 35.6]
    ]
  },
  {
    id: "qin-yan-liaodong",
    faction: "carthage",
    label: "燕国方向",
    from: "handan",
    to: "liaodong",
    start: "BCE-0227-01-01",
    end: "BCE-0226-12-31",
    unitIcon: "chariot",
    waypoints: [[116.4, 39.9]]
  },
  {
    id: "qin-wei",
    faction: "carthage",
    label: "水灌大梁灭魏",
    from: "yangdi",
    to: "daliang",
    start: "BCE-0225-01-01",
    end: "BCE-0225-12-31",
    unitIcon: "chariot"
  },
  {
    id: "qin-chu-first",
    faction: "rome",
    label: "楚国反击：李信受挫",
    from: "shouchun",
    to: "chuai",
    start: "BCE-0225-07-01",
    end: "BCE-0225-12-31",
    visibleUntil: "BCE-0224-01-01",
    unitVisibleUntil: "BCE-0225-12-31",
    unitIcon: "chariot"
  },
  {
    id: "qin-chu",
    faction: "carthage",
    label: "王翦灭楚",
    from: "xianyang",
    to: "shouchun",
    start: "BCE-0224-01-01",
    end: "BCE-0223-12-31",
    unitIcon: "chariot",
    waypoints: [
      [110.91, 34.62],
      [114.31, 34.8]
    ]
  },
  {
    id: "qin-yan-final",
    faction: "carthage",
    label: "燕代终局",
    from: "handan",
    to: "liaodong",
    start: "BCE-0222-01-01",
    end: "BCE-0222-08-01",
    unitIcon: "chariot",
    waypoints: [[116.4, 39.9]]
  },
  {
    id: "qin-qi",
    faction: "carthage",
    label: "灭齐",
    from: "daliang",
    to: "linzi",
    start: "BCE-0221-01-01",
    end: "BCE-0221-10-01",
    unitIcon: "chariot"
  }
];

export const battleEvents: BattleEvent[] = [
  {
    id: "han-falls",
    date: "BCE-0230-01-01",
    title: "秦灭韩",
    location: "韩国、阳翟",
    coordinates: [113.47, 34.16],
    phase: "东出开局",
    summary: "韩国最先被秦吞并，六国体系出现第一个缺口。",
    detail: "韩国地处秦东出通道，国力较弱。秦先取韩，既消除函谷关外近邻，也为后续东进建立前沿。",
    significance: "秦统一战争进入不可逆阶段，六国由均势竞争转为逐国被击破。",
    mapFocus: ["xianyang", "yangdi", "hangu"]
  },
  {
    id: "zhao-falls",
    date: "BCE-0228-01-01",
    title: "邯郸陷落",
    location: "赵国、邯郸",
    coordinates: [114.49, 36.62],
    phase: "北方主敌崩溃",
    summary: "秦军攻破邯郸，赵国主干灭亡。",
    detail: "赵国曾是秦在北方最强对手之一。连年战争、灾荒和内部政治削弱了赵军抵抗能力。",
    significance: "赵亡后，北方抗秦核心不复存在，燕、代退入更远的东北边缘。",
    mapFocus: ["handan", "jicheng"]
  },
  {
    id: "yan-prince-dan",
    date: "BCE-0227-01-01",
    title: "荆轲刺秦与燕国危机",
    location: "咸阳、燕国",
    coordinates: [116.4, 39.9],
    phase: "燕国受压",
    summary: "燕太子丹孤注一掷刺秦失败，秦军随后加强对燕方向进攻。",
    detail: "刺杀反映燕国在军事压力下缺乏战略纵深，政治冒险未能阻止秦军北上。",
    significance: "燕国从战国大国转为逃向辽东的残余力量。",
    mapFocus: ["jicheng", "liaodong"]
  },
  {
    id: "wei-falls",
    date: "BCE-0225-01-01",
    title: "水灌大梁灭魏",
    location: "大梁",
    coordinates: [114.31, 34.8],
    phase: "中原收束",
    summary: "秦军攻魏都大梁，传世叙事中以引水围灌结束战斗。",
    detail: "魏处黄河、淮河之间的中原枢纽，失去魏后，秦军对齐、楚方向的战略回旋更充分。",
    significance: "中原腹地被秦控制，楚国成为南方最大阻力。",
    mapFocus: ["daliang", "huanghe"]
  },
  {
    id: "li-xin-defeat",
    date: "BCE-0225-07-01",
    title: "李信伐楚受挫",
    location: "楚地",
    coordinates: [116.1, 31.7],
    phase: "楚国反击",
    summary: "秦军轻兵伐楚失利，显示楚国仍具备辽阔纵深和反击能力。",
    detail: "楚国地广兵众，不能用灭韩、灭魏的节奏简单套用。秦随后改用王翦大军稳进。",
    significance: "统一战争并非单向碾压，秦需要调整兵力规模和作战节奏。",
    mapFocus: ["shouchun", "chuai"]
  },
  {
    id: "chu-falls",
    date: "BCE-0223-01-01",
    title: "王翦灭楚",
    location: "寿春方向",
    coordinates: [116.78, 32.58],
    phase: "南方决战",
    summary: "王翦率大军稳进，楚国灭亡。",
    detail: "秦军以大兵团和持久准备取代冒进，逐步消耗楚军后攻破核心区域。",
    significance: "楚亡后，六国中已经没有能独立改变统一进程的大国。",
    mapFocus: ["shouchun", "huai"]
  },
  {
    id: "yan-dai-falls",
    date: "BCE-0222-01-01",
    title: "燕代灭亡",
    location: "燕、代残余",
    coordinates: [123.43, 41.8],
    phase: "北方清场",
    summary: "秦军继续追击燕、代残余势力，东北方向抵抗被清除。",
    detail: "这一步是统一战争的扫尾，也是秦对北方边缘的控制延伸。",
    significance: "秦完成北方安全面整合，只剩齐国等待最后处置。",
    mapFocus: ["jicheng", "liaodong"]
  },
  {
    id: "qi-falls",
    date: "BCE-0221-01-01",
    title: "秦灭齐，天下归一",
    location: "齐国、临淄",
    coordinates: [118.31, 36.82],
    phase: "统一完成",
    summary: "齐国未能组织有效抵抗，秦完成六国统一。",
    detail: "秦从西向东逐国击破，最终以齐国投降收束战争。统一后，秦始皇建立皇帝制度和郡县制帝国。",
    significance: "战国时代结束，中国进入统一帝国政治框架。",
    mapFocus: ["linzi", "xianyang"]
  }
];
