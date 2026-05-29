import type { BattleEvent, FormationUnit, FrontLine, MapPoint } from "./battleOfFrance";
import type { BattleEffectElement, MapOverlayElement } from "../components/CampaignMapAnimation";
import type { HistoricalRegion } from "../types/maps";

export const campaignStart = "1948-11-06T18:00";
export const campaignEnd = "1948-11-22T20:00";
export const timelineInactiveGapDisplayDays = 0.1;
export const timelineActiveSpans = [
  { start: "1948-11-19T10:00", end: "1948-11-22T20:00" }
];
export const timelineGapOverrides = [
  { start: "1948-11-06T18:00", end: "1948-11-07T06:00", displayDays: 0.45 },
  { start: "1948-11-07T06:00", end: "1948-11-10T20:00", displayDays: 1.1 },
  { start: "1948-11-10T20:00", end: "1948-11-11T12:00", displayDays: 0.75 },
  { start: "1948-11-11T12:00", end: "1948-11-13T06:00", displayDays: 0.95 },
  { start: "1948-11-13T06:00", end: "1948-11-13T18:00", displayDays: 0.5 },
  { start: "1948-11-13T18:00", end: "1948-11-15T02:00", displayDays: 0.8 },
  { start: "1948-11-15T02:00", end: "1948-11-17T20:00", displayDays: 0.9 },
  { start: "1948-11-17T20:00", end: "1948-11-19T10:00", displayDays: 0.81 },
  { start: "1948-11-19T10:00", end: "1948-11-19T21:15", displayDays: 0.45 },
  { start: "1948-11-19T21:15", end: "1948-11-19T22:30", displayDays: 0.6 },
  { start: "1948-11-19T22:30", end: "1948-11-20T03:30", displayDays: 0.9 },
  { start: "1948-11-20T03:30", end: "1948-11-20T05:15", displayDays: 0.72 },
  { start: "1948-11-20T05:15", end: "1948-11-20T05:30", displayDays: 0.08 },
  { start: "1948-11-20T05:30", end: "1948-11-20T18:00", displayDays: 0.8 },
  { start: "1948-11-20T18:00", end: "1948-11-21T08:00", displayDays: 0.55 },
  { start: "1948-11-21T08:00", end: "1948-11-21T18:00", displayDays: 0.45 },
  { start: "1948-11-21T18:00", end: "1948-11-21T22:00", displayDays: 0.25 },
  { start: "1948-11-21T22:00", end: "1948-11-22T10:00", displayDays: 0.48 },
  { start: "1948-11-22T10:00", end: "1948-11-22T16:00", displayDays: 0.32 },
  { start: "1948-11-22T16:00", end: "1948-11-22T16:20", displayDays: 0.12 },
  { start: "1948-11-22T16:20", end: "1948-11-22T18:00", displayDays: 0.55 },
  { start: "1948-11-22T18:00", end: "1948-11-22T18:50", displayDays: 0.24 },
  { start: "1948-11-22T18:50", end: "1948-11-22T20:00", displayDays: 0.15 }
];

export const mapPoints: MapPoint[] = [
  { id: "xuzhou", label: "徐州", coordinates: [117.1848, 34.2618], kind: "city" },
  { id: "pantang", label: "潘塘方向", coordinates: [117.33, 34.22], kind: "front" },
  { id: "daxujia", label: "大许家阻援线", coordinates: [117.55, 34.27], kind: "front" },
  { id: "relief-forward-edge", label: "邱李先头受阻", coordinates: [117.64, 34.285], kind: "front", revealAt: "1948-11-13T18:00" },
  { id: "zhoujiazhai", label: "周家寨华野司令部", coordinates: [117.78, 34.22], kind: "front" },
  { id: "nianzhuang", label: "碾庄圩", coordinates: [117.86, 34.29], kind: "objective" },
  { id: "daxingzhuang", label: "大兴庄", coordinates: [117.835, 34.365], kind: "front", revealAt: "1948-11-13T06:00" },
  { id: "songzhuang-large", label: "大宋庄", coordinates: [117.82, 34.33], kind: "front", revealAt: "1948-11-11T12:00" },
  { id: "pengzhuang", label: "彭庄", coordinates: [117.795, 34.325], kind: "front", revealAt: "1948-11-13T06:00" },
  { id: "wangjiaji", label: "王家集", coordinates: [117.785, 34.255], kind: "front", revealAt: "1948-11-13T06:00" },
  { id: "youfang", label: "油坊阵地", coordinates: [117.91, 34.325], kind: "front", revealAt: "1948-11-11T12:00" },
  { id: "luliang-line", label: "鲁楼-梁庄线", coordinates: [117.935, 34.305], kind: "front", revealAt: "1948-11-13T06:00" },
  { id: "caobalou", label: "曹八楼阵地", coordinates: [117.94, 34.255], kind: "front", revealAt: "1948-11-11T12:00" },
  { id: "wulou", label: "吴楼阵地", coordinates: [117.8, 34.245], kind: "front", revealAt: "1948-11-11T12:00" },
  { id: "louzhuang", label: "娄庄阵地", coordinates: [117.895, 34.245], kind: "front", revealAt: "1948-11-11T12:00" },
  { id: "qianbanqiao", label: "前板桥", coordinates: [117.88, 34.222], kind: "front", revealAt: "1948-11-13T06:00" },
  { id: "xujingwa", label: "徐井洼", coordinates: [117.918, 34.232], kind: "front", revealAt: "1948-11-13T06:00" },
  { id: "zhaozhuang", label: "赵庄阵地", coordinates: [117.755, 34.305], kind: "front", revealAt: "1948-11-11T12:00" },
  { id: "inner-west-line", label: "第一道破口西线", coordinates: [117.835, 34.29], kind: "front", revealAt: "1948-11-19T22:30" },
  { id: "inner-north-line", label: "第二道围墙北线", coordinates: [117.862, 34.315], kind: "front", revealAt: "1948-11-19T22:30" },
  { id: "inner-south-line", label: "第二道围墙南线", coordinates: [117.872, 34.268], kind: "front", revealAt: "1948-11-19T22:30" },
  { id: "inner-east-line", label: "第二道围墙东线", coordinates: [117.902, 34.292], kind: "front", revealAt: "1948-11-19T22:30" },
  { id: "inner-northeast-line", label: "第一道东北破口", coordinates: [117.884, 34.309], kind: "front", revealAt: "1948-11-19T22:30" },
  { id: "inner-southeast-line", label: "第一道东南破口", coordinates: [117.892, 34.272], kind: "front", revealAt: "1948-11-19T22:30" },
  { id: "final-west-core", label: "内圩西缘", coordinates: [117.858, 34.288], kind: "front", revealAt: "1948-11-20T03:30" },
  { id: "final-north-core", label: "兵团部北缘", coordinates: [117.875, 34.306], kind: "front", revealAt: "1948-11-20T03:30" },
  { id: "final-east-core", label: "内圩东缘", coordinates: [117.893, 34.292], kind: "front", revealAt: "1948-11-20T03:30" },
  { id: "final-south-core", label: "内圩南缘", coordinates: [117.872, 34.274], kind: "front", revealAt: "1948-11-20T03:30" },
  { id: "nianzhuang-north", label: "北侧村落阵地", coordinates: [117.84, 34.345], kind: "front", revealAt: "1948-11-11T12:00" },
  { id: "nianzhuang-east", label: "东侧水沟阵地", coordinates: [117.935, 34.29], kind: "front", revealAt: "1948-11-11T12:00" },
  { id: "nianzhuang-south", label: "南侧村落阵地", coordinates: [117.855, 34.235], kind: "front", revealAt: "1948-11-11T12:00" },
  { id: "nianzhuang-west", label: "西侧第一道防线", coordinates: [117.775, 34.285], kind: "front", revealAt: "1948-11-11T12:00" },
  { id: "inner-pocket", label: "碾庄内圩", coordinates: [117.872, 34.292], kind: "objective", revealAt: "1948-11-20T05:30" },
  { id: "remnant-north-village", label: "尤家湖据点", coordinates: [117.89, 34.342], kind: "front", revealAt: "1948-11-21T08:00" },
  { id: "east-remnant-pocket", label: "小院上-吴庄据点", coordinates: [117.952, 34.302], kind: "front", revealAt: "1948-11-21T08:00" },
  { id: "remnant-south-village", label: "三里庄据点", coordinates: [117.916, 34.238], kind: "front", revealAt: "1948-11-21T08:00" },
  { id: "remnant-southwest-block", label: "南侧封锁点", coordinates: [117.888, 34.258], kind: "front", revealAt: "1948-11-21T08:00" },
  { id: "nizhuang", label: "倪庄", coordinates: [117.905, 34.25], kind: "objective", revealAt: "1948-11-22T16:00" },
  { id: "xinanzhen", label: "新安镇", coordinates: [118.34, 34.37], kind: "city" },
  { id: "pizhou-east", label: "邳州以东追击线", coordinates: [118.12, 34.33], kind: "front" },
  { id: "canal-bridge", label: "运河桥渡", coordinates: [118.02, 34.31], kind: "front" },
  { id: "north-pla-entry", label: "华野北线追击", coordinates: [118.22, 34.45], kind: "front" },
  { id: "east-pla-entry", label: "华野东线追击", coordinates: [118.38, 34.32], kind: "front" },
  { id: "south-pla-entry", label: "华野南线追击", coordinates: [118.16, 34.16], kind: "front" },
  { id: "southwest-pla-entry", label: "华野西南封口", coordinates: [117.58, 34.13], kind: "front", revealAt: "1948-11-10T20:00" },
  { id: "northwest-block-entry", label: "阻援集团北翼", coordinates: [117.46, 34.39], kind: "front", revealAt: "1948-11-11T12:00" },
  { id: "southwest-block-entry", label: "阻援集团南翼", coordinates: [117.42, 34.13], kind: "front", revealAt: "1948-11-11T12:00" },
  { id: "longhai-rail-east", label: "陇海铁路东段", coordinates: [118.26, 34.35], kind: "front" },
  { id: "yunhe", label: "运河与水网", coordinates: [118.0, 34.34], kind: "front" }
];

const huangWithdrawalColumn: FormationUnit[] = [
  { id: "lead", label: "第25军前卫", badgeLabel: "25", icon: "infantry", offset: [0, -18] },
  { id: "main", label: "黄百韬本部", badgeLabel: "黄", icon: "infantry", offset: [-38, 12] },
  { id: "rear", label: "第100军后卫", badgeLabel: "100", icon: "infantry", offset: [-74, -14] },
  { id: "side", label: "第63军侧卫", badgeLabel: "63", icon: "infantry", offset: [-110, 14] },
  { id: "guns", label: "辎重炮兵", badgeLabel: "炮", icon: "cannon", offset: [-148, -10] }
];

const huangDeployNorthUnits: FormationUnit[] = [
  { id: "25-north-deploy", label: "", badgeLabel: "25", icon: "infantry", offset: [0, -34] }
];

const huangDeployEastUnits: FormationUnit[] = [
  { id: "64-east-deploy", label: "", badgeLabel: "64", icon: "infantry", offset: [0, 34] }
];

const huangDeploySouthUnits: FormationUnit[] = [
  { id: "44-south-deploy", label: "", badgeLabel: "44", icon: "infantry", offset: [0, 34] }
];

const huangDeployWestUnits: FormationUnit[] = [
  { id: "100-west-deploy", label: "", badgeLabel: "100", icon: "infantry", offset: [0, -34] }
];

const huangDeployCommandUnits: FormationUnit[] = [
  { id: "command-deploy", label: "黄兵团部入圩", badgeLabel: "黄", icon: "infantry", offset: [0, -38] }
];

const huangDefenseUnits: FormationUnit[] = [
  { id: "command", label: "黄兵团部", badgeLabel: "黄", icon: "infantry", coordinates: [117.872, 34.292], facingX: -1, offset: [0, 0] },
  { id: "25-40", label: "25军40师", badgeLabel: "40", icon: "infantry", coordinates: [117.828, 34.346], facingX: -1, offset: [0, -8] },
  { id: "25-108", label: "25军108师", badgeLabel: "108", icon: "infantry", coordinates: [117.858, 34.352], facingX: -1, offset: [0, 8] },
  { id: "25-148", label: "25军148师", badgeLabel: "148", icon: "infantry", coordinates: [117.89, 34.34], facingX: 1, offset: [0, 0] },
  { id: "64-156", label: "64军156师", badgeLabel: "156", icon: "infantry", coordinates: [117.932, 34.314], facingX: 1, offset: [0, -8] },
  { id: "64-159", label: "64军159师", badgeLabel: "159", icon: "infantry", coordinates: [117.937, 34.272], facingX: 1, offset: [0, 8] },
  { id: "44-150", label: "44军150师", badgeLabel: "150", icon: "infantry", coordinates: [117.85, 34.238], facingX: -1, offset: [0, -8] },
  { id: "44-162", label: "44军162师", badgeLabel: "162", icon: "infantry", coordinates: [117.895, 34.244], facingX: 1, offset: [0, 8] },
  { id: "100-63", label: "100军63师", badgeLabel: "63", icon: "infantry", coordinates: [117.805, 34.274], facingX: -1, offset: [0, -8] },
  { id: "100-19", label: "100军19师残部", badgeLabel: "19", icon: "infantry", coordinates: [117.78, 34.296], facingX: -1, offset: [0, 8] },
  { id: "guns-north", label: "北侧火力点", badgeLabel: "炮", icon: "cannon", coordinates: [117.855, 34.325], facingX: -1, offset: [0, 0] },
  { id: "guns-south", label: "南侧火力点", badgeLabel: "炮", icon: "cannon", coordinates: [117.876, 34.268], facingX: 1, offset: [0, 0] }
];

const huangOuterDestroyedUnits: FormationUnit[] = [
  { id: "100-44-east-bank", label: "100军44师被截断", badgeLabel: "44", icon: "infantry", coordinates: [118.035, 34.315], facingX: -1, offset: [0, -6] },
  { id: "63-side-guard", label: "63军侧卫后撤", badgeLabel: "63", icon: "infantry", coordinates: [118.09, 34.365], facingX: -1, offset: [0, 6] },
  { id: "rear-column", label: "后卫纵队被截", badgeLabel: "后", icon: "infantry", coordinates: [117.995, 34.245], facingX: -1, offset: [0, 0] }
];

const plaPursuitUnits: FormationUnit[] = [
  { id: "v1", label: "", icon: "infantryPva", offset: [0, -34] },
  { id: "v2", label: "", icon: "infantryPva", offset: [-96, 32] },
  { id: "v3", label: "", icon: "infantryPva", offset: [-190, -4] }
];

const plaAssaultUnits: FormationUnit[] = [
  { id: "assault-a", label: "", icon: "infantryPva", offset: [0, -24] }
];

const plaCounterpressUnits: FormationUnit[] = [
  { id: "counterpress-a", label: "", badgeLabel: "压", icon: "infantryPva", offset: [0, -28] },
  { id: "counterpress-b", label: "", badgeLabel: "炮", icon: "cannon", offset: [-70, 24] }
];

const plaMopUpUnits: FormationUnit[] = [{ id: "mop-up", label: "", icon: "infantryPva", offset: [0, -20] }];

const plaMopUpEastUnits: FormationUnit[] = [{ id: "mop-up-east", label: "", icon: "infantryPva", offset: [0, -46] }];

const plaMopUpWestUnits: FormationUnit[] = [{ id: "mop-up-west", label: "", icon: "infantryPva", offset: [0, 46] }];

const plaAssaultNorthUnits: FormationUnit[] = [{ id: "assault-north", label: "", icon: "infantryPva", offset: [0, -56] }];

const plaAssaultSouthUnits: FormationUnit[] = [{ id: "assault-south", label: "", icon: "infantryPva", offset: [0, 56] }];

const plaMopUpNorthUnits: FormationUnit[] = [{ id: "mop-up-north", label: "", icon: "infantryPva", offset: [0, -70] }];

const plaMopUpSouthUnits: FormationUnit[] = [{ id: "mop-up-south", label: "", icon: "infantryPva", offset: [0, 70] }];

const plaGunUnits: FormationUnit[] = [
  { id: "battery-a", label: "华野炮兵", icon: "cannon", offset: [0, -28] },
  { id: "battery-b", label: "", icon: "cannon", offset: [-76, 28] },
  { id: "battery-c", label: "", icon: "cannon", offset: [-150, -4] }
];

const reliefUnits: FormationUnit[] = [
  { id: "qiu-armour", label: "", badgeLabel: "邱", icon: "tankKorean", offset: [0, -84] },
  { id: "li-infantry", label: "", badgeLabel: "李", icon: "infantry", offset: [-280, 84] }
];

const blockingUnits: FormationUnit[] = [
  { id: "block-a", label: "", badgeLabel: "阻", icon: "infantryPva", offset: [0, -84] },
  { id: "block-b", label: "", badgeLabel: "炮", icon: "cannon", offset: [-280, 84] }
];

const reliefCounterpushUnits: FormationUnit[] = [
  { id: "counterpush-a", label: "", badgeLabel: "阻", icon: "infantryPva", offset: [320, -260] },
  { id: "counterpush-gun", label: "", badgeLabel: "炮", icon: "cannon", offset: [-420, 230] }
];

const trenchWorkerUnits: FormationUnit[] = [
  { id: "sap-a", label: "", icon: "infantryPva", offset: [0, -24] },
  { id: "sap-b", label: "", icon: "infantryPva", offset: [-72, 24] }
];

const plaSoutheastAdvanceUnits: FormationUnit[] = [
  { id: "advance-a", label: "", icon: "infantryPva", offset: [0, -26] },
  { id: "advance-b", label: "", icon: "infantryPva", offset: [-76, 26] }
];

const plaEncirclementUnits: FormationUnit[] = [
  { id: "4col-south", label: "4纵南口", icon: "infantryPva", coordinates: [117.84, 34.18], facingX: 1, offset: [0, 0] },
  { id: "6col-north", label: "6纵北口", icon: "infantryPva", coordinates: [117.81, 34.405], facingX: 1, offset: [0, 0] },
  { id: "8col-east", label: "8纵东口", icon: "infantryPva", coordinates: [118.015, 34.3], facingX: -1, offset: [0, 0] },
  { id: "9col-southeast", label: "9纵东南", icon: "infantryPva", coordinates: [117.955, 34.19], facingX: -1, offset: [0, 0] },
  { id: "13col-west", label: "13纵西口", icon: "infantryPva", coordinates: [117.685, 34.3], facingX: 1, offset: [0, 0] },
  { id: "special-artillery", label: "特纵火力", icon: "cannon", coordinates: [117.77, 34.17], facingX: 1, offset: [0, 0] }
];

const huangFirstLineFragments: FormationUnit[] = [
  { id: "25-north-holding", label: "25军北段碎裂", badgeLabel: "25", icon: "infantry", coordinates: [117.858, 34.318], facingX: -1, offset: [0, -10] },
  { id: "64-east-holding", label: "64军东段后撤", badgeLabel: "64", icon: "infantry", coordinates: [117.9, 34.3], facingX: 1, offset: [0, 10] },
  { id: "44-south-broken", label: "44军南段割裂", badgeLabel: "44", icon: "infantry", coordinates: [117.865, 34.27], facingX: -1, offset: [0, -10] },
  { id: "100-west-broken", label: "100军西段破口", badgeLabel: "100", icon: "infantry", coordinates: [117.842, 34.292], facingX: -1, offset: [0, 10] },
  { id: "25-108-gap", label: "25军余部北退", badgeLabel: "108", icon: "infantry", coordinates: [117.876, 34.306], facingX: -1, offset: [0, -8] },
  { id: "44-162-gap", label: "44军余部南退", badgeLabel: "162", icon: "infantry", coordinates: [117.884, 34.278], facingX: 1, offset: [0, 8] },
  { id: "command-inner", label: "黄兵团部内缩", badgeLabel: "黄", icon: "infantry", coordinates: [117.876, 34.292], facingX: -1, offset: [0, 0] }
];

const huangCounterpushUnits: FormationUnit[] = [
  { id: "counter-infantry", label: "守军反扑", badgeLabel: "反", icon: "infantry", offset: [0, -24] },
  { id: "counter-gun", label: "", badgeLabel: "炮", icon: "cannon", offset: [-64, 24] }
];

const huangSecondWallFragments: FormationUnit[] = [
  { id: "25-second-north", label: "25军退守二道北段", badgeLabel: "25", icon: "infantry", coordinates: [117.873, 34.306], facingX: -1, offset: [0, -10] },
  { id: "64-second-east", label: "64军二道东段回缩", badgeLabel: "64", icon: "infantry", coordinates: [117.89, 34.295], facingX: 1, offset: [0, 10] },
  { id: "44-second-south", label: "44军二道南段割裂", badgeLabel: "44", icon: "infantry", coordinates: [117.872, 34.278], facingX: -1, offset: [0, -10] },
  { id: "100-second-west", label: "100军残部退入内圩", badgeLabel: "100", icon: "infantry", coordinates: [117.86, 34.29], facingX: -1, offset: [0, 10] },
  { id: "command-second", label: "兵团部收至内圩", badgeLabel: "黄", icon: "infantry", coordinates: [117.878, 34.293], facingX: -1, offset: [0, 0] }
];

const huangSecondWallCollapseUnits: FormationUnit[] = [
  { id: "25-second-collapse", label: "25军二道北段破碎", badgeLabel: "25", icon: "infantry", coordinates: [117.876, 34.304], facingX: -1, offset: [0, -24] },
  { id: "64-second-collapse", label: "64军二道东段失守", badgeLabel: "64", icon: "infantry", coordinates: [117.889, 34.294], facingX: 1, offset: [0, 22] },
  { id: "44-second-collapse", label: "44军南段退入核心", badgeLabel: "44", icon: "infantry", coordinates: [117.872, 34.28], facingX: -1, offset: [0, 22] },
  { id: "command-core", label: "黄部退至兵团部", badgeLabel: "黄", icon: "infantry", coordinates: [117.879, 34.292], facingX: -1, offset: [0, -28] }
];

const huangFinalCoreUnits: FormationUnit[] = [
  { id: "command-final", label: "黄部核心", badgeLabel: "黄", icon: "infantry", coordinates: [117.879, 34.292], facingX: -1, offset: [0, -30] },
  { id: "25-64-final", label: "25/64军残部", badgeLabel: "残", icon: "infantry", coordinates: [117.889, 34.301], facingX: 1, offset: [0, -18] },
  { id: "44-100-final", label: "44/100军残部", badgeLabel: "残", icon: "infantry", coordinates: [117.864, 34.276], facingX: -1, offset: [0, 18] },
  { id: "100-final-west", label: "100军残部", badgeLabel: "100", icon: "infantry", coordinates: [117.858, 34.286], facingX: -1, offset: [0, -20] },
  { id: "final-guns", label: "残余火力", badgeLabel: "炮", icon: "cannon", coordinates: [117.882, 34.282], facingX: 1, offset: [0, 0] }
];

const huangEastRemnantUnits: FormationUnit[] = [
  { id: "64-east-yard", label: "64军东侧据点", badgeLabel: "64", icon: "infantry", coordinates: [117.952, 34.302], facingX: -1, offset: [0, -8] },
  { id: "25-north-remnant", label: "25军北侧据点", badgeLabel: "25", icon: "infantry", coordinates: [117.89, 34.342], facingX: -1, offset: [0, 8] },
  { id: "159-south-remnant", label: "159师南侧据点", badgeLabel: "159", icon: "infantry", coordinates: [117.916, 34.238], facingX: -1, offset: [0, -8] },
  { id: "44-south-remnant", label: "44军南侧据点", badgeLabel: "44", icon: "infantry", coordinates: [117.904, 34.252], facingX: -1, offset: [0, 12] },
  { id: "100-southwest-remnant", label: "100军西南据点", badgeLabel: "100", icon: "infantry", coordinates: [117.888, 34.258], facingX: -1, offset: [0, -12] },
  { id: "huang-remnant-command", label: "黄部东侧据点", badgeLabel: "黄", icon: "infantry", coordinates: [117.936, 34.286], facingX: -1, offset: [0, 0] }
];

const huangRemnantFallbackUnits: FormationUnit[] = [
  { id: "command-fallback", label: "黄部由内圩东撤", badgeLabel: "黄", icon: "infantry", offset: [0, -28] },
  { id: "64-fallback", label: "", badgeLabel: "64", icon: "infantry", offset: [-92, 28] },
  { id: "25-fallback", label: "", badgeLabel: "25", icon: "infantry", offset: [-184, -26] },
  { id: "44-fallback", label: "", badgeLabel: "44", icon: "infantry", offset: [-276, 26] },
  { id: "100-fallback", label: "", badgeLabel: "100", icon: "infantry", offset: [-368, -24] }
];

const huangFinalNorthUnits: FormationUnit[] = [
  { id: "25-final-north", label: "25军残部", badgeLabel: "25", icon: "infantry", offset: [0, -18] }
];

const huangFinalEastUnits: FormationUnit[] = [
  { id: "64-final-east", label: "64军残部", badgeLabel: "64", icon: "infantry", offset: [0, -18] }
];

const huangFinalSouthUnits: FormationUnit[] = [
  { id: "44-final-south", label: "44军残部", badgeLabel: "44", icon: "infantry", offset: [0, -22] },
  { id: "100-final-south", label: "100军残部", badgeLabel: "100", icon: "infantry", offset: [-76, 22] }
];

export const frontLines: FrontLine[] = [
  {
    id: "huang-xinan-west-withdrawal",
    faction: "nationalist",
    label: "黄百韬第七兵团由新安镇西撤",
    from: "xinanzhen",
    to: "nianzhuang",
    routeKind: "land",
    start: "1948-11-07T06:00",
    end: "1948-11-10T20:00",
    unitIcon: "infantry",
    formationUnits: huangWithdrawalColumn,
    waypoints: [
      [118.23, 34.355],
      [118.12, 34.335],
      [118.02, 34.315],
      [117.94, 34.3],
      [117.88, 34.292]
    ],
    visibleUntil: "1948-11-10T22:00",
    unitVisibleUntil: "1948-11-10T22:00"
  },
  {
    id: "huang-nianzhuang-defense-ring",
    faction: "nationalist",
    label: "黄兵团师级防御部署",
    from: "nianzhuang-west",
    to: "nianzhuang-west",
    routeKind: "land",
    start: "1948-11-11T12:00",
    end: "1948-11-11T18:00",
    unitIcon: "infantry",
    formationUnits: huangDefenseUnits,
    waypoints: [
      [117.81, 34.337],
      [117.86, 34.36],
      [117.92, 34.335],
      [117.955, 34.29],
      [117.925, 34.245],
      [117.865, 34.225],
      [117.8, 34.242],
      [117.755, 34.282],
      [117.775, 34.285]
    ],
    visibleUntil: "1948-11-19T22:29",
    unitVisibleUntil: "1948-11-19T22:30"
  },
  {
    id: "huang-deploy-north",
    faction: "nationalist",
    label: "25军由行军纵队转北侧阵地",
    from: "nianzhuang",
    to: "nianzhuang-north",
    routeKind: "land",
    start: "1948-11-10T20:00",
    end: "1948-11-11T12:00",
    unitIcon: "infantry",
    formationUnits: huangDeployNorthUnits,
    waypoints: [
      [117.86, 34.31],
      [117.848, 34.335]
    ],
    visibleUntil: "1948-11-11T11:59",
    unitVisibleFrom: "1948-11-10T22:30",
    unitVisibleUntil: "1948-11-11T11:59"
  },
  {
    id: "huang-deploy-east",
    faction: "nationalist",
    label: "64军进入东侧水沟阵地",
    from: "nianzhuang",
    to: "nianzhuang-east",
    routeKind: "land",
    start: "1948-11-10T20:00",
    end: "1948-11-11T12:00",
    unitIcon: "infantry",
    formationUnits: huangDeployEastUnits,
    waypoints: [
      [117.888, 34.302],
      [117.92, 34.302]
    ],
    visibleUntil: "1948-11-11T11:59",
    unitVisibleFrom: "1948-11-10T23:00",
    unitVisibleUntil: "1948-11-11T11:59"
  },
  {
    id: "huang-deploy-south",
    faction: "nationalist",
    label: "44军转入南侧村落阵地",
    from: "nianzhuang",
    to: "nianzhuang-south",
    routeKind: "land",
    start: "1948-11-10T20:00",
    end: "1948-11-11T12:00",
    unitIcon: "infantry",
    formationUnits: huangDeploySouthUnits,
    waypoints: [
      [117.87, 34.278],
      [117.858, 34.25]
    ],
    visibleUntil: "1948-11-11T11:59",
    unitVisibleFrom: "1948-11-10T23:30",
    unitVisibleUntil: "1948-11-11T11:59"
  },
  {
    id: "huang-deploy-west",
    faction: "nationalist",
    label: "100军后卫转西侧防线",
    from: "nianzhuang",
    to: "nianzhuang-west",
    routeKind: "land",
    start: "1948-11-10T20:00",
    end: "1948-11-11T12:00",
    unitIcon: "infantry",
    formationUnits: huangDeployWestUnits,
    waypoints: [
      [117.848, 34.292],
      [117.81, 34.288]
    ],
    visibleUntil: "1948-11-11T11:59",
    unitVisibleFrom: "1948-11-11T00:00",
    unitVisibleUntil: "1948-11-11T11:59"
  },
  {
    id: "huang-deploy-command",
    faction: "nationalist",
    label: "黄兵团部进入碾庄圩内圩",
    from: "nianzhuang",
    to: "inner-pocket",
    routeKind: "land",
    start: "1948-11-10T20:00",
    end: "1948-11-11T12:00",
    unitIcon: "infantry",
    formationUnits: huangDeployCommandUnits,
    waypoints: [
      [117.865, 34.292],
      [117.872, 34.292]
    ],
    visibleUntil: "1948-11-11T11:59",
    unitVisibleUntil: "1948-11-11T11:59"
  },
  {
    id: "huang-outer-destroyed-column",
    faction: "nationalist",
    label: "圈外侧后部队被截断",
    from: "canal-bridge",
    to: "louzhuang",
    routeKind: "land",
    start: "1948-11-10T20:00",
    end: "1948-11-13T18:00",
    unitIcon: "infantry",
    formationUnits: huangOuterDestroyedUnits,
    waypoints: [
      [118.0, 34.335],
      [117.96, 34.305],
      [117.925, 34.27]
    ],
    visibleUntil: "1948-11-15T01:59",
    unitVisibleUntil: "1948-11-13T18:00"
  },
  {
    id: "pla-encirclement-ring",
    faction: "communist",
    label: "华野外层包围圈",
    from: "nianzhuang-west",
    to: "nianzhuang-west",
    routeKind: "land",
    start: "1948-11-10T20:00",
    end: "1948-11-11T12:00",
    unitIcon: "infantryPva",
    formationUnits: plaEncirclementUnits,
    waypoints: [
      [117.70, 34.34],
      [117.795, 34.415],
      [117.915, 34.405],
      [118.025, 34.335],
      [118.005, 34.22],
      [117.91, 34.17],
      [117.795, 34.17],
      [117.68, 34.255],
      [117.775, 34.285]
    ],
    visibleUntil: "1948-11-22T20:00"
  },
  {
    id: "pla-east-pursuit-main",
    faction: "communist",
    label: "华野8纵东线急追",
    from: "east-pla-entry",
    to: "nianzhuang-east",
    routeKind: "land",
    start: "1948-11-06T18:00",
    end: "1948-11-10T20:00",
    unitIcon: "infantryPva",
    formationUnits: plaPursuitUnits,
    waypoints: [
      [118.29, 34.33],
      [118.16, 34.315],
      [118.02, 34.305],
      [117.95, 34.292]
    ],
    visibleUntil: "1948-11-10T22:00",
    unitVisibleUntil: "1948-11-10T22:00"
  },
  {
    id: "pla-north-pursuit",
    faction: "communist",
    label: "华野9纵北线压向碾庄",
    from: "north-pla-entry",
    to: "nianzhuang-north",
    routeKind: "land",
    start: "1948-11-07T06:00",
    end: "1948-11-10T20:00",
    unitIcon: "infantryPva",
    formationUnits: plaPursuitUnits,
    waypoints: [
      [118.14, 34.42],
      [118.0, 34.39],
      [117.9, 34.36]
    ],
    visibleUntil: "1948-11-10T22:00",
    unitVisibleUntil: "1948-11-10T22:00"
  },
  {
    id: "pla-south-pursuit",
    faction: "communist",
    label: "华野4纵南线截入水网",
    from: "south-pla-entry",
    to: "nianzhuang-south",
    routeKind: "land",
    start: "1948-11-07T12:00",
    end: "1948-11-10T20:00",
    unitIcon: "infantryPva",
    formationUnits: plaPursuitUnits,
    waypoints: [
      [118.05, 34.185],
      [117.94, 34.215],
      [117.87, 34.238]
    ],
    visibleUntil: "1948-11-10T22:00",
    unitVisibleUntil: "1948-11-10T22:00"
  },
  {
    id: "pla-southwest-closing-line",
    faction: "communist",
    label: "华野7纵西南封口",
    from: "southwest-pla-entry",
    to: "nianzhuang-west",
    routeKind: "land",
    start: "1948-11-09T18:00",
    end: "1948-11-10T20:00",
    unitIcon: "infantryPva",
    formationUnits: plaPursuitUnits,
    waypoints: [
      [117.64, 34.18],
      [117.7, 34.235],
      [117.76, 34.282]
    ],
    visibleUntil: "1948-11-10T22:00",
    unitVisibleUntil: "1948-11-10T22:00"
  },
  {
    id: "xuzhou-relief-east",
    faction: "nationalist",
    label: "邱清泉、李弥兵团由徐州东援",
    from: "xuzhou",
    to: "relief-forward-edge",
    routeKind: "land",
    start: "1948-11-11T12:00",
    end: "1948-11-13T18:00",
    unitIcon: "tankKorean",
    formationUnits: reliefUnits,
    waypoints: [
      [117.3, 34.26],
      [117.42, 34.265],
      [117.53, 34.275],
      [117.62, 34.283]
    ],
    visibleUntil: "1948-11-22T20:00",
    unitVisibleUntil: "1948-11-22T18:00"
  },
  {
    id: "pla-relief-block-line",
    faction: "communist",
    label: "徐东阻援集团大许家一线",
    from: "northwest-block-entry",
    to: "southwest-block-entry",
    routeKind: "land",
    start: "1948-11-11T12:00",
    end: "1948-11-13T18:00",
    unitIcon: "infantryPva",
    formationUnits: blockingUnits,
    waypoints: [
      [117.52, 34.34],
      [117.56, 34.27],
      [117.51, 34.2],
      [117.45, 34.15]
    ],
    visibleUntil: "1948-11-22T20:00"
  },
  {
    id: "pla-relief-counterpush",
    faction: "communist",
    label: "阻援反冲击压回东援先头",
    from: "daxujia",
    to: "relief-forward-edge",
    routeKind: "land",
    start: "1948-11-13T18:00",
    end: "1948-11-20T18:00",
    unitIcon: "infantryPva",
    formationUnits: reliefCounterpushUnits,
    waypoints: [
      [117.58, 34.31],
      [117.62, 34.285]
    ],
    visibleUntil: "1948-11-22T20:00",
    unitVisibleUntil: "1948-11-22T20:00"
  },
  {
    id: "pla-4th-preliminary-daxingzhuang",
    faction: "communist",
    label: "6纵北面大兴庄试攻",
    from: "north-pla-entry",
    to: "daxingzhuang",
    routeKind: "land",
    start: "1948-11-11T20:00",
    end: "1948-11-13T23:00",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultUnits,
    waypoints: [
      [118.0, 34.405],
      [117.9, 34.375],
      [117.834, 34.36]
    ],
    visibleUntil: "1948-11-17T20:00",
    unitVisibleUntil: "1948-11-17T20:00"
  },
  {
    id: "pla-13th-preliminary-songzhuang",
    faction: "communist",
    label: "13纵大宋庄相持",
    from: "zhaozhuang",
    to: "songzhuang-large",
    routeKind: "land",
    start: "1948-11-11T20:00",
    end: "1948-11-13T23:00",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultUnits,
    waypoints: [
      [117.76, 34.315],
      [117.805, 34.322]
    ],
    visibleUntil: "1948-11-17T20:00",
    unitVisibleUntil: "1948-11-17T20:00"
  },
  {
    id: "pla-6th-preliminary-pengzhuang",
    faction: "communist",
    label: "13纵西侧赵庄至彭庄攻坚",
    from: "zhaozhuang",
    to: "pengzhuang",
    routeKind: "land",
    start: "1948-11-13T06:00",
    end: "1948-11-15T20:00",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultUnits,
    waypoints: [
      [117.77, 34.292],
      [117.792, 34.305]
    ],
    visibleUntil: "1948-11-19T10:00",
    unitVisibleUntil: "1948-11-19T10:00"
  },
  {
    id: "pla-8th-east-fix-youfang",
    faction: "communist",
    label: "8纵东线鲁楼梁庄受阻",
    from: "east-pla-entry",
    to: "luliang-line",
    routeKind: "land",
    start: "1948-11-12T12:00",
    end: "1948-11-14T20:00",
    unitIcon: "infantryPva",
    formationUnits: plaPursuitUnits,
    waypoints: [
      [118.1, 34.325],
      [117.98, 34.315],
      [117.93, 34.31],
      [117.915, 34.323]
    ],
    visibleUntil: "1948-11-17T20:00",
    unitVisibleUntil: "1948-11-17T20:00"
  },
  {
    id: "pla-9th-southeast-advance",
    faction: "communist",
    label: "9纵东南前板桥徐井洼推进",
    from: "south-pla-entry",
    to: "xujingwa",
    routeKind: "land",
    start: "1948-11-13T06:00",
    end: "1948-11-17T20:00",
    unitIcon: "infantryPva",
    formationUnits: plaSoutheastAdvanceUnits,
    waypoints: [
      [118.05, 34.18],
      [117.95, 34.205],
      [117.895, 34.226]
    ],
    visibleUntil: "1948-11-19T10:00",
    unitVisibleUntil: "1948-11-19T10:00"
  },
  {
    id: "huang-preliminary-counterattack",
    faction: "nationalist",
    label: "守军依托村落反冲击",
    from: "songzhuang-large",
    to: "nianzhuang-north",
    routeKind: "land",
    start: "1948-11-12T06:00",
    end: "1948-11-14T12:00",
    unitIcon: "infantry",
    formationUnits: [
      { id: "counter-a", label: "第25军反击", badgeLabel: "25", icon: "infantry", offset: [0, -12] },
      { id: "counter-gun", label: "村落火力点", badgeLabel: "炮", icon: "cannon", offset: [-30, 12] }
    ],
    waypoints: [
      [117.815, 34.335],
      [117.84, 34.345]
    ],
    visibleUntil: "1948-11-17T20:00",
    unitVisibleUntil: "1948-11-14T20:00"
  },
  {
    id: "huang-west-counterpush",
    faction: "nationalist",
    label: "100军西侧反扑压出壕线",
    from: "nianzhuang-west",
    to: "pengzhuang",
    routeKind: "land",
    start: "1948-11-15T08:00",
    end: "1948-11-15T20:00",
    unitIcon: "infantry",
    formationUnits: huangCounterpushUnits,
    waypoints: [
      [117.795, 34.292],
      [117.792, 34.305]
    ],
    visibleUntil: "1948-11-17T20:00",
    unitVisibleUntil: "1948-11-15T20:00"
  },
  {
    id: "pla-west-yield-and-hold",
    faction: "communist",
    label: "13纵壕线后撤稳住西侧",
    from: "pengzhuang",
    to: "zhaozhuang",
    routeKind: "land",
    start: "1948-11-15T18:00",
    end: "1948-11-16T08:00",
    unitIcon: "infantryPva",
    formationUnits: trenchWorkerUnits,
    waypoints: [
      [117.785, 34.303],
      [117.765, 34.315]
    ],
    visibleUntil: "1948-11-17T20:00",
    unitVisibleUntil: "1948-11-16T08:00"
  },
  {
    id: "pla-west-counterpress",
    faction: "communist",
    label: "13纵重新压回彭庄西缘",
    from: "zhaozhuang",
    to: "pengzhuang",
    routeKind: "land",
    start: "1948-11-16T08:00",
    end: "1948-11-17T20:00",
    unitIcon: "infantryPva",
    formationUnits: plaCounterpressUnits,
    waypoints: [
      [117.772, 34.314],
      [117.792, 34.305]
    ],
    visibleUntil: "1948-11-19T10:00",
    unitVisibleUntil: "1948-11-19T10:00"
  },
  {
    id: "huang-east-counterpush",
    faction: "nationalist",
    label: "64军东侧水沟反扑",
    from: "nianzhuang-east",
    to: "luliang-line",
    routeKind: "land",
    start: "1948-11-16T20:00",
    end: "1948-11-17T08:00",
    unitIcon: "infantry",
    formationUnits: huangCounterpushUnits,
    waypoints: [
      [117.928, 34.298],
      [117.935, 34.305]
    ],
    visibleUntil: "1948-11-19T10:00",
    unitVisibleUntil: "1948-11-17T08:00"
  },
  {
    id: "pla-east-counterpress",
    faction: "communist",
    label: "8纵水沟间再压东侧",
    from: "luliang-line",
    to: "nianzhuang-east",
    routeKind: "land",
    start: "1948-11-17T08:00",
    end: "1948-11-19T09:30",
    unitIcon: "infantryPva",
    formationUnits: plaCounterpressUnits,
    waypoints: [
      [117.926, 34.306],
      [117.935, 34.29]
    ],
    visibleUntil: "1948-11-19T22:29",
    unitVisibleUntil: "1948-11-19T09:30"
  },
  {
    id: "pla-west-trench-approach",
    faction: "communist",
    label: "西侧对壕近迫",
    from: "zhoujiazhai",
    to: "nianzhuang-west",
    routeKind: "land",
    start: "1948-11-15T02:00",
    end: "1948-11-19T09:30",
    unitIcon: "infantryPva",
    formationUnits: trenchWorkerUnits,
    waypoints: [
      [117.77, 34.245],
      [117.765, 34.27],
      [117.775, 34.285]
    ],
    visibleUntil: "1948-11-19T22:29"
  },
  {
    id: "pla-north-trench-approach",
    faction: "communist",
    label: "北侧夜挖交通壕",
    from: "nianzhuang-north",
    to: "inner-north-line",
    routeKind: "land",
    start: "1948-11-15T02:00",
    end: "1948-11-19T09:30",
    unitIcon: "infantryPva",
    formationUnits: trenchWorkerUnits,
    waypoints: [
      [117.835, 34.335],
      [117.848, 34.323]
    ],
    visibleUntil: "1948-11-19T22:29"
  },
  {
    id: "pla-south-trench-approach",
    faction: "communist",
    label: "南侧水沟接敌",
    from: "nianzhuang-south",
    to: "inner-south-line",
    routeKind: "land",
    start: "1948-11-15T02:00",
    end: "1948-11-19T09:30",
    unitIcon: "infantryPva",
    formationUnits: trenchWorkerUnits,
    waypoints: [
      [117.855, 34.245],
      [117.858, 34.262]
    ],
    visibleUntil: "1948-11-19T22:29"
  },
  {
    id: "pla-east-trench-approach",
    faction: "communist",
    label: "东侧穿越村落水塘间隙",
    from: "nianzhuang-east",
    to: "inner-east-line",
    routeKind: "land",
    start: "1948-11-15T02:00",
    end: "1948-11-19T09:30",
    unitIcon: "infantryPva",
    formationUnits: trenchWorkerUnits,
    waypoints: [
      [117.925, 34.295],
      [117.905, 34.292]
    ],
    visibleUntil: "1948-11-19T22:29"
  },
  {
    id: "pla-artillery-zhoujiazhai",
    faction: "communist",
    label: "周家寨方向炮兵准备",
    from: "zhoujiazhai",
    to: "nianzhuang-west",
    routeKind: "land",
    start: "1948-11-18T18:00",
    end: "1948-11-19T12:00",
    unitIcon: "cannon",
    formationUnits: plaGunUnits,
    visibleUntil: "1948-11-19T22:29",
    unitVisibleUntil: "1948-11-19T22:29"
  },
  {
    id: "pla-general-assault-west",
    faction: "communist",
    label: "13纵西线夜攻突破第一道围墙",
    from: "nianzhuang-west",
    to: "inner-west-line",
    routeKind: "land",
    start: "1948-11-19T21:15",
    end: "1948-11-19T22:30",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultNorthUnits,
    waypoints: [
      [117.805, 34.287],
      [117.818, 34.288],
      [117.835, 34.29]
    ],
    visibleUntil: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T03:30"
  },
  {
    id: "pla-general-assault-north",
    faction: "communist",
    label: "6纵北线突破第一道北段",
    from: "songzhuang-large",
    to: "inner-north-line",
    routeKind: "land",
    start: "1948-11-19T21:15",
    end: "1948-11-19T22:30",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultSouthUnits,
    waypoints: [
      [117.84, 34.33],
      [117.852, 34.322],
      [117.862, 34.315]
    ],
    visibleUntil: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T03:30"
  },
  {
    id: "pla-general-assault-south",
    faction: "communist",
    label: "4纵南线突破第一道南段",
    from: "wulou",
    to: "inner-south-line",
    routeKind: "land",
    start: "1948-11-19T21:15",
    end: "1948-11-19T22:30",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultUnits,
    waypoints: [
      [117.852, 34.248],
      [117.86, 34.258],
      [117.872, 34.268]
    ],
    visibleUntil: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T03:30"
  },
  {
    id: "pla-general-assault-east",
    faction: "communist",
    label: "8纵东线突破第一道东段",
    from: "youfang",
    to: "inner-east-line",
    routeKind: "land",
    start: "1948-11-19T21:15",
    end: "1948-11-19T22:30",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultUnits,
    waypoints: [
      [117.92, 34.292],
      [117.912, 34.292],
      [117.902, 34.292]
    ],
    visibleUntil: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T03:30"
  },
  {
    id: "pla-general-assault-northeast",
    faction: "communist",
    label: "9纵东北线压进第一道东北口",
    from: "nianzhuang-north",
    to: "inner-northeast-line",
    routeKind: "land",
    start: "1948-11-19T21:15",
    end: "1948-11-19T22:30",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultUnits,
    waypoints: [
      [117.872, 34.335],
      [117.88, 34.32],
      [117.884, 34.309]
    ],
    visibleUntil: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T03:30"
  },
  {
    id: "pla-general-assault-southeast",
    faction: "communist",
    label: "9纵东南线夺曹八楼后压入",
    from: "xujingwa",
    to: "inner-southeast-line",
    routeKind: "land",
    start: "1948-11-19T21:15",
    end: "1948-11-19T22:30",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultUnits,
    waypoints: [
      [117.92, 34.262],
      [117.904, 34.268],
      [117.892, 34.272]
    ],
    visibleUntil: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T03:30"
  },
  {
    id: "pla-second-wall-west",
    faction: "communist",
    label: "13纵破口后压第二道西段",
    from: "inner-west-line",
    to: "final-west-core",
    routeKind: "land",
    start: "1948-11-19T22:30",
    end: "1948-11-20T03:30",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultUnits,
    waypoints: [
      [117.842, 34.292],
      [117.85, 34.29],
      [117.858, 34.288]
    ],
    visibleUntil: "1948-11-20T05:29",
    unitVisibleFrom: "1948-11-19T22:31",
    unitVisibleUntil: "1948-11-20T05:29"
  },
  {
    id: "pla-second-wall-north",
    faction: "communist",
    label: "北线突破第二道围墙",
    from: "inner-north-line",
    to: "final-north-core",
    routeKind: "land",
    start: "1948-11-19T22:30",
    end: "1948-11-20T03:30",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultUnits,
    waypoints: [
      [117.864, 34.314],
      [117.87, 34.31],
      [117.875, 34.306]
    ],
    visibleUntil: "1948-11-20T05:29",
    unitVisibleFrom: "1948-11-19T22:31",
    unitVisibleUntil: "1948-11-20T05:29"
  },
  {
    id: "pla-second-wall-south",
    faction: "communist",
    label: "南线突破第二道围墙",
    from: "inner-south-line",
    to: "final-south-core",
    routeKind: "land",
    start: "1948-11-19T22:30",
    end: "1948-11-20T03:30",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultUnits,
    waypoints: [
      [117.872, 34.268],
      [117.874, 34.271],
      [117.872, 34.274]
    ],
    visibleUntil: "1948-11-20T05:29",
    unitVisibleFrom: "1948-11-19T22:31",
    unitVisibleUntil: "1948-11-20T05:29"
  },
  {
    id: "pla-second-wall-east",
    faction: "communist",
    label: "东线突破第二道围墙",
    from: "inner-east-line",
    to: "final-east-core",
    routeKind: "land",
    start: "1948-11-19T22:30",
    end: "1948-11-20T03:30",
    unitIcon: "infantryPva",
    formationUnits: plaAssaultUnits,
    waypoints: [
      [117.902, 34.292],
      [117.898, 34.292],
      [117.893, 34.292]
    ],
    visibleUntil: "1948-11-20T05:29",
    unitVisibleFrom: "1948-11-19T22:31",
    unitVisibleUntil: "1948-11-20T05:29"
  },
  {
    id: "huang-west-night-counterattack",
    faction: "nationalist",
    label: "100军夜间反扑西侧破口",
    from: "final-west-core",
    to: "inner-west-line",
    routeKind: "land",
    start: "1948-11-19T23:15",
    end: "1948-11-20T00:40",
    unitIcon: "infantry",
    formationUnits: huangCounterpushUnits,
    waypoints: [
      [117.85, 34.29],
      [117.842, 34.292]
    ],
    visibleUntil: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T00:40"
  },
  {
    id: "pla-west-night-counterpress",
    faction: "communist",
    label: "13纵再压回西侧破口",
    from: "inner-west-line",
    to: "final-west-core",
    routeKind: "land",
    start: "1948-11-20T00:40",
    end: "1948-11-20T03:30",
    unitIcon: "infantryPva",
    formationUnits: plaCounterpressUnits,
    waypoints: [
      [117.846, 34.292],
      [117.858, 34.288]
    ],
    visibleUntil: "1948-11-20T05:29",
    unitVisibleUntil: "1948-11-20T05:29"
  },
  {
    id: "huang-east-night-counterattack",
    faction: "nationalist",
    label: "64军夜间反扑东侧破口",
    from: "final-east-core",
    to: "inner-east-line",
    routeKind: "land",
    start: "1948-11-20T00:20",
    end: "1948-11-20T02:00",
    unitIcon: "infantry",
    formationUnits: huangCounterpushUnits,
    waypoints: [
      [117.898, 34.294],
      [117.902, 34.292]
    ],
    visibleUntil: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T02:20"
  },
  {
    id: "pla-east-night-counterpress",
    faction: "communist",
    label: "8纵再压东侧第二道",
    from: "inner-east-line",
    to: "final-east-core",
    routeKind: "land",
    start: "1948-11-20T02:00",
    end: "1948-11-20T03:30",
    unitIcon: "infantryPva",
    formationUnits: plaCounterpressUnits,
    waypoints: [
      [117.9, 34.292],
      [117.893, 34.292]
    ],
    visibleUntil: "1948-11-20T05:29",
    unitVisibleUntil: "1948-11-20T05:29"
  },
  {
    id: "huang-inner-recoil",
    faction: "nationalist",
    label: "第一道破口向二道西段收缩",
    from: "inner-west-line",
    to: "final-west-core",
    routeKind: "land",
    start: "1948-11-19T22:30",
    end: "1948-11-20T03:30",
    unitIcon: "infantry",
    formationUnits: huangFirstLineFragments.filter((unit) => ["100-west-broken", "command-inner"].includes(unit.id)),
    waypoints: [
      [117.846, 34.292],
      [117.858, 34.288]
    ],
    visibleUntil: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T03:30"
  },
  {
    id: "huang-north-fragment-recoil",
    faction: "nationalist",
    label: "北段残部退守第二道",
    from: "inner-north-line",
    to: "final-north-core",
    routeKind: "land",
    start: "1948-11-19T22:30",
    end: "1948-11-20T03:30",
    unitIcon: "infantry",
    formationUnits: huangFirstLineFragments.filter((unit) => ["25-north-holding", "25-108-gap"].includes(unit.id)),
    waypoints: [
      [117.868, 34.312],
      [117.875, 34.306]
    ],
    visibleUntil: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T03:30"
  },
  {
    id: "huang-east-fragment-recoil",
    faction: "nationalist",
    label: "东段残部退守第二道",
    from: "inner-east-line",
    to: "final-east-core",
    routeKind: "land",
    start: "1948-11-19T22:30",
    end: "1948-11-20T03:30",
    unitIcon: "infantry",
    formationUnits: huangFirstLineFragments.filter((unit) => ["64-east-holding"].includes(unit.id)),
    waypoints: [
      [117.898, 34.297],
      [117.893, 34.292]
    ],
    visibleUntil: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T03:30"
  },
  {
    id: "huang-south-fragment-recoil",
    faction: "nationalist",
    label: "南段残部割裂后撤二道",
    from: "inner-south-line",
    to: "final-south-core",
    routeKind: "land",
    start: "1948-11-19T22:30",
    end: "1948-11-20T03:30",
    unitIcon: "infantry",
    formationUnits: huangFirstLineFragments.filter((unit) => ["44-south-broken", "44-162-gap"].includes(unit.id)),
    waypoints: [
      [117.874, 34.27],
      [117.872, 34.274]
    ],
    visibleUntil: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T03:30"
  },
  {
    id: "huang-final-core-defense",
    faction: "nationalist",
    label: "内圩残部最后据点",
    from: "inner-pocket",
    to: "inner-pocket",
    routeKind: "land",
    start: "1948-11-20T03:30",
    end: "1948-11-20T05:15",
    unitIcon: "infantry",
    formationUnits: huangFinalCoreUnits,
    waypoints: [
      [117.884, 34.298],
      [117.89, 34.284],
      [117.872, 34.272],
      [117.856, 34.286],
      [117.872, 34.292]
    ],
    visibleUntil: "1948-11-20T05:30",
    unitVisibleFrom: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T05:30"
  },
  {
    id: "huang-second-wall-collapse",
    faction: "nationalist",
    label: "二道围墙破碎退入内圩核心",
    from: "final-north-core",
    to: "inner-pocket",
    routeKind: "land",
    start: "1948-11-20T03:30",
    end: "1948-11-20T05:15",
    unitIcon: "infantry",
    formationUnits: huangSecondWallCollapseUnits,
    waypoints: [
      [117.89, 34.298],
      [117.884, 34.292],
      [117.876, 34.288]
    ],
    visibleUntil: "1948-11-20T05:30",
    unitVisibleFrom: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T05:30"
  },
  {
    id: "pla-final-compression-ring",
    faction: "communist",
    label: "北东两线压入内圩据点",
    from: "inner-north-line",
    to: "final-east-core",
    routeKind: "land",
    start: "1948-11-20T03:30",
    end: "1948-11-20T05:15",
    unitIcon: "infantryPva",
    formationUnits: plaMopUpUnits,
    waypoints: [
      [117.875, 34.31],
      [117.888, 34.302],
      [117.893, 34.292]
    ],
    visibleUntil: "1948-11-20T05:30",
    unitVisibleFrom: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T05:30"
  },
  {
    id: "pla-final-compression-south",
    faction: "communist",
    label: "南线清剿内圩南缘",
    from: "inner-south-line",
    to: "final-south-core",
    routeKind: "land",
    start: "1948-11-20T03:30",
    end: "1948-11-20T05:15",
    unitIcon: "infantryPva",
    formationUnits: plaMopUpUnits,
    waypoints: [
      [117.872, 34.268],
      [117.878, 34.272],
      [117.872, 34.274]
    ],
    visibleUntil: "1948-11-20T05:30",
    unitVisibleFrom: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T05:30"
  },
  {
    id: "pla-final-compression-west",
    faction: "communist",
    label: "西线从破口压入兵团部",
    from: "inner-west-line",
    to: "final-west-core",
    routeKind: "land",
    start: "1948-11-20T03:30",
    end: "1948-11-20T05:15",
    unitIcon: "infantryPva",
    formationUnits: plaMopUpUnits,
    waypoints: [
      [117.842, 34.292],
      [117.852, 34.29],
      [117.858, 34.288]
    ],
    visibleUntil: "1948-11-20T05:30",
    unitVisibleFrom: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T05:30"
  },
  {
    id: "pla-final-compression-east",
    faction: "communist",
    label: "东线清剿内圩东缘",
    from: "inner-east-line",
    to: "final-east-core",
    routeKind: "land",
    start: "1948-11-20T03:30",
    end: "1948-11-20T05:15",
    unitIcon: "infantryPva",
    formationUnits: plaMopUpUnits,
    waypoints: [
      [117.902, 34.292],
      [117.898, 34.292],
      [117.893, 34.292]
    ],
    visibleUntil: "1948-11-20T05:30",
    unitVisibleFrom: "1948-11-20T03:30",
    unitVisibleUntil: "1948-11-20T05:30"
  },
  {
    id: "huang-east-remnant-defense",
    faction: "nationalist",
    label: "黄部东侧村落据点防御",
    from: "east-remnant-pocket",
    to: "east-remnant-pocket",
    routeKind: "land",
    start: "1948-11-20T05:30",
    end: "1948-11-22T16:00",
    unitIcon: "infantry",
    formationUnits: huangEastRemnantUnits,
    waypoints: [
      [117.89, 34.342],
      [117.952, 34.302],
      [117.916, 34.238],
      [117.936, 34.286],
      [117.952, 34.302]
    ],
    visibleUntil: "1948-11-22T20:00",
    unitVisibleUntil: "1948-11-22T16:00"
  },
  {
    id: "huang-remnant-fallback-east",
    faction: "nationalist",
    label: "内圩残部退向大院上吴庄",
    from: "inner-pocket",
    to: "east-remnant-pocket",
    routeKind: "land",
    start: "1948-11-20T05:30",
    end: "1948-11-21T08:00",
    unitIcon: "infantry",
    formationUnits: huangRemnantFallbackUnits,
    waypoints: [
      [117.895, 34.294],
      [117.922, 34.298],
      [117.944, 34.301]
    ],
    visibleUntil: "1948-11-22T20:00",
    unitVisibleUntil: "1948-11-21T08:00"
  },
  {
    id: "pla-remnant-mop-up-north",
    faction: "communist",
    label: "北线逐村清剿尤家湖",
    from: "final-north-core",
    to: "remnant-north-village",
    routeKind: "land",
    start: "1948-11-20T05:30",
    end: "1948-11-21T18:00",
    unitIcon: "infantryPva",
    formationUnits: plaMopUpNorthUnits,
    waypoints: [
      [117.878, 34.322],
      [117.888, 34.338]
    ],
    visibleUntil: "1948-11-22T20:00",
    unitVisibleUntil: "1948-11-22T16:20"
  },
  {
    id: "pla-remnant-mop-up-east",
    faction: "communist",
    label: "东线压向小院上吴庄",
    from: "final-east-core",
    to: "east-remnant-pocket",
    routeKind: "land",
    start: "1948-11-20T05:30",
    end: "1948-11-22T10:00",
    unitIcon: "infantryPva",
    formationUnits: plaMopUpEastUnits,
    waypoints: [
      [117.916, 34.294],
      [117.936, 34.298],
      [117.944, 34.301]
    ],
    visibleUntil: "1948-11-22T20:00",
    unitVisibleUntil: "1948-11-22T16:20"
  },
  {
    id: "pla-remnant-mop-up-south",
    faction: "communist",
    label: "南线清剿三里庄残部",
    from: "final-south-core",
    to: "remnant-south-village",
    routeKind: "land",
    start: "1948-11-20T05:30",
    end: "1948-11-21T22:00",
    unitIcon: "infantryPva",
    formationUnits: plaMopUpSouthUnits,
    waypoints: [
      [117.89, 34.262],
      [117.91, 34.244]
    ],
    visibleUntil: "1948-11-22T20:00",
    unitVisibleUntil: "1948-11-22T16:20"
  },
  {
    id: "pla-remnant-mop-up-west",
    faction: "communist",
    label: "西线封住南侧回窜",
    from: "final-west-core",
    to: "remnant-southwest-block",
    routeKind: "land",
    start: "1948-11-20T05:30",
    end: "1948-11-22T16:00",
    unitIcon: "infantryPva",
    formationUnits: plaMopUpWestUnits,
    waypoints: [
      [117.872, 34.286],
      [117.906, 34.292],
      [117.908, 34.272],
      [117.892, 34.26]
    ],
    visibleUntil: "1948-11-22T20:00",
    unitVisibleUntil: "1948-11-22T16:20"
  },
  {
    id: "huang-north-remnant-sortie",
    faction: "nationalist",
    label: "25军尤家湖残部短促外突",
    from: "remnant-north-village",
    to: "final-north-core",
    routeKind: "land",
    start: "1948-11-21T08:00",
    end: "1948-11-21T12:00",
    unitIcon: "infantry",
    formationUnits: huangFinalNorthUnits,
    waypoints: [
      [117.884, 34.334],
      [117.875, 34.306]
    ],
    visibleUntil: "1948-11-21T18:00",
    unitVisibleUntil: "1948-11-21T12:30"
  },
  {
    id: "pla-north-remnant-counterpress",
    faction: "communist",
    label: "北线反压回尤家湖",
    from: "final-north-core",
    to: "remnant-north-village",
    routeKind: "land",
    start: "1948-11-21T12:00",
    end: "1948-11-21T18:00",
    unitIcon: "infantryPva",
    formationUnits: plaCounterpressUnits,
    waypoints: [
      [117.882, 34.322],
      [117.888, 34.338]
    ],
    visibleUntil: "1948-11-22T16:20",
    unitVisibleUntil: "1948-11-22T16:20"
  },
  {
    id: "huang-south-remnant-sortie",
    faction: "nationalist",
    label: "44/100军南侧残部反扑",
    from: "remnant-south-village",
    to: "final-south-core",
    routeKind: "land",
    start: "1948-11-21T18:00",
    end: "1948-11-21T22:00",
    unitIcon: "infantry",
    formationUnits: huangFinalSouthUnits,
    waypoints: [
      [117.906, 34.248],
      [117.872, 34.274]
    ],
    visibleUntil: "1948-11-22T10:00",
    unitVisibleUntil: "1948-11-21T22:30"
  },
  {
    id: "pla-south-remnant-counterpress",
    faction: "communist",
    label: "南线再压三里庄据点",
    from: "final-south-core",
    to: "remnant-south-village",
    routeKind: "land",
    start: "1948-11-21T22:00",
    end: "1948-11-22T10:00",
    unitIcon: "infantryPva",
    formationUnits: plaCounterpressUnits,
    waypoints: [
      [117.888, 34.26],
      [117.91, 34.244]
    ],
    visibleUntil: "1948-11-22T16:20",
    unitVisibleUntil: "1948-11-22T16:20"
  },
  {
    id: "huang-final-north-collapse",
    faction: "nationalist",
    label: "25军残部退守尤家湖终点",
    from: "remnant-north-village",
    to: "remnant-north-village",
    routeKind: "land",
    start: "1948-11-22T16:00",
    end: "1948-11-22T18:00",
    unitIcon: "infantry",
    formationUnits: huangFinalNorthUnits,
    waypoints: [
      [117.896, 34.336],
      [117.89, 34.342]
    ],
    visibleUntil: "1948-11-22T20:00",
    unitVisibleUntil: "1948-11-22T18:00"
  },
  {
    id: "huang-final-east-collapse",
    faction: "nationalist",
    label: "64军残部退守小院上吴庄终点",
    from: "east-remnant-pocket",
    to: "east-remnant-pocket",
    routeKind: "land",
    start: "1948-11-22T16:00",
    end: "1948-11-22T18:00",
    unitIcon: "infantry",
    formationUnits: huangFinalEastUnits,
    waypoints: [
      [117.944, 34.296],
      [117.952, 34.302]
    ],
    visibleUntil: "1948-11-22T20:00",
    unitVisibleUntil: "1948-11-22T18:00"
  },
  {
    id: "huang-final-south-collapse",
    faction: "nationalist",
    label: "44/100军残部退守南侧终点",
    from: "remnant-southwest-block",
    to: "remnant-south-village",
    routeKind: "land",
    start: "1948-11-22T16:00",
    end: "1948-11-22T18:00",
    unitIcon: "infantry",
    formationUnits: huangFinalSouthUnits,
    waypoints: [
      [117.896, 34.252],
      [117.908, 34.244]
    ],
    visibleUntil: "1948-11-22T20:00",
    unitVisibleUntil: "1948-11-22T18:00"
  },
  {
    id: "huang-nizhuang-final-flight",
    faction: "nationalist",
    label: "黄百韬残部向倪庄逃散",
    from: "east-remnant-pocket",
    to: "nizhuang",
    routeKind: "land",
    start: "1948-11-22T16:00",
    end: "1948-11-22T18:00",
    unitIcon: "infantry",
    formationUnits: [
      { id: "huang-command", label: "黄百韬残部", badgeLabel: "黄", icon: "infantry", offset: [0, -28] }
    ],
    waypoints: [[117.885, 34.275]],
    visibleUntil: "1948-11-22T20:00",
    unitVisibleUntil: "1948-11-22T18:00"
  },
  {
    id: "pla-nizhuang-pursuit",
    faction: "communist",
    label: "解放军追至倪庄",
    from: "east-remnant-pocket",
    to: "nizhuang",
    routeKind: "land",
    start: "1948-11-22T16:20",
    end: "1948-11-22T18:50",
    unitIcon: "infantryPva",
    formationUnits: plaMopUpUnits,
    waypoints: [[117.89, 34.268]],
    visibleUntil: "1948-11-22T20:00"
  }
];

const timelineActiveStart = timelineActiveSpans[0]?.start ?? campaignStart;
const timelineActiveStartTime = Date.parse(timelineActiveStart);
const timelineDiscreteAnchors = new Set(timelineGapOverrides.flatMap((gap) => [gap.start, gap.end]));

export const timelineDateAnchors = Array.from(
  new Set([
    ...timelineGapOverrides.flatMap((gap) => [gap.start, gap.end]),
    ...frontLines
      .flatMap((line) => [line.start, line.end, line.visibleUntil, line.unitVisibleFrom, line.unitVisibleUntil])
      .filter((date): date is string => Boolean(date))
      .filter((date) => Date.parse(date) >= timelineActiveStartTime)
      .filter((date) => timelineDiscreteAnchors.has(date))
  ])
);

export const historicalRegions: HistoricalRegion[] = [
  {
    id: "nianzhuang-pocket",
    label: "五个军部十个整师防御地域",
    className: "nianzhuang-pocket-region",
    labelCoordinates: [117.87, 34.355],
    coordinates: [
      [117.74, 34.25],
      [117.8, 34.37],
      [117.93, 34.36],
      [118.0, 34.29],
      [117.93, 34.22],
      [117.8, 34.21]
    ]
  },
  {
    id: "daxujia-blocking-zone",
    label: "邱李东援被阻地域",
    className: "nianzhuang-block-region",
    labelCoordinates: [117.48, 34.36],
    coordinates: [
      [117.36, 34.12],
      [117.5, 34.42],
      [117.64, 34.37],
      [117.62, 34.18],
      [117.5, 34.1]
    ]
  },
  {
    id: "waterlogged-villages",
    label: "村落水塘水沟密集区",
    className: "nianzhuang-water-region",
    labelCoordinates: [118.02, 34.22],
    coordinates: [
      [117.86, 34.17],
      [118.08, 34.2],
      [118.15, 34.32],
      [117.99, 34.39],
      [117.86, 34.34]
    ]
  }
];

export const fortifiedLines: Array<{ id: string; label: string; points: Array<[number, number]>; revealAt?: string; visibleUntil?: string }> = [
  {
    id: "pla-encirclement",
    label: "华野包围圈",
    revealAt: "1948-11-10T20:00",
    points: [
      [117.675, 34.292],
      [117.71, 34.355],
      [117.795, 34.415],
      [117.915, 34.405],
      [118.03, 34.335],
      [118.005, 34.22],
      [117.91, 34.17],
      [117.795, 34.17],
      [117.675, 34.255],
      [117.675, 34.292]
    ]
  },
  {
    id: "outer-defense",
    label: "第一道村落防线",
    revealAt: "1948-11-10T20:00",
    visibleUntil: "1948-11-19T22:29",
    points: [
      [117.76, 34.302],
      [117.805, 34.35],
      [117.875, 34.36],
      [117.945, 34.325],
      [117.96, 34.275],
      [117.91, 34.235],
      [117.815, 34.236],
      [117.755, 34.282],
      [117.76, 34.302]
    ]
  },
  {
    id: "second-defense",
    label: "第二道围墙",
    revealAt: "1948-11-15T02:00",
    visibleUntil: "1948-11-20T03:29",
    points: [
      [117.825, 34.306],
      [117.858, 34.326],
      [117.902, 34.312],
      [117.915, 34.285],
      [117.888, 34.26],
      [117.842, 34.264],
      [117.812, 34.286],
      [117.825, 34.306]
    ]
  },
  {
    id: "final-core",
    label: "内圩最后据点",
    revealAt: "1948-11-20T03:30",
    visibleUntil: "1948-11-20T05:29",
    points: [
      [117.852, 34.302],
      [117.875, 34.31],
      [117.895, 34.296],
      [117.89, 34.275],
      [117.866, 34.268],
      [117.846, 34.282],
      [117.852, 34.302]
    ]
  }
];

export const fragmentedLines: Array<{
  className?: string;
  id: string;
  label: string;
  points: Array<[number, number]>;
  revealAt?: string;
  visibleUntil?: string;
}> = [
  {
    id: "outer-defense-west-break",
    label: "西段破口",
    revealAt: "1948-11-19T22:30",
    visibleUntil: "1948-11-20T03:29",
    className: "fragmented-line-breach",
    points: [
      [117.755, 34.282],
      [117.782, 34.296],
      [117.808, 34.287]
    ]
  },
  {
    id: "outer-defense-north-fragment",
    label: "北段碎裂",
    revealAt: "1948-11-19T22:30",
    visibleUntil: "1948-11-20T03:29",
    points: [
      [117.812, 34.342],
      [117.85, 34.352],
      [117.88, 34.346]
    ]
  },
  {
    id: "outer-defense-east-fragment",
    label: "东段后撤",
    revealAt: "1948-11-19T22:30",
    visibleUntil: "1948-11-20T03:29",
    points: [
      [117.94, 34.322],
      [117.955, 34.292],
      [117.932, 34.27]
    ]
  },
  {
    id: "outer-defense-south-fragment",
    label: "南段割裂",
    revealAt: "1948-11-19T22:30",
    visibleUntil: "1948-11-20T03:29",
    points: [
      [117.91, 34.238],
      [117.865, 34.23],
      [117.82, 34.238]
    ]
  },
  {
    id: "second-defense-north-fragment",
    label: "二道北段破碎",
    revealAt: "1948-11-20T03:30",
    visibleUntil: "1948-11-20T05:30",
    points: [
      [117.84, 34.318],
      [117.866, 34.32],
      [117.89, 34.31]
    ]
  },
  {
    id: "second-defense-east-breach",
    label: "二道东段失守",
    revealAt: "1948-11-20T03:30",
    visibleUntil: "1948-11-20T05:30",
    className: "fragmented-line-breach",
    points: [
      [117.908, 34.306],
      [117.914, 34.286],
      [117.896, 34.268]
    ]
  },
  {
    id: "second-defense-south-fragment",
    label: "二道南段割裂",
    revealAt: "1948-11-20T03:30",
    visibleUntil: "1948-11-20T05:30",
    points: [
      [117.888, 34.262],
      [117.86, 34.264],
      [117.832, 34.274]
    ]
  },
  {
    id: "final-core-east-break",
    label: "内圩核心失守",
    revealAt: "1948-11-20T05:30",
    visibleUntil: "1948-11-21T08:00",
    className: "fragmented-line-breach",
    points: [
      [117.858, 34.302],
      [117.878, 34.304],
      [117.894, 34.294],
      [117.882, 34.276],
      [117.862, 34.274]
    ]
  }
];

export const rivers: Array<{ id: string; label: string; points: Array<[number, number]> }> = [
  {
    id: "yunhe-water-net",
    label: "运河与水网",
    points: [
      [118.08, 34.48],
      [118.05, 34.42],
      [118.02, 34.36],
      [118.0, 34.31],
      [117.98, 34.25],
      [117.94, 34.18]
    ]
  },
  {
    id: "nianzhuang-ditches",
    label: "碾庄周边水沟",
    points: [
      [117.77, 34.33],
      [117.82, 34.31],
      [117.87, 34.3],
      [117.93, 34.27],
      [118.0, 34.25]
    ]
  },
  {
    id: "lowland-ponds",
    label: "村落水塘",
    points: [
      [117.79, 34.23],
      [117.86, 34.245],
      [117.92, 34.235],
      [118.02, 34.22]
    ]
  }
];

export const mapOverlays: MapOverlayElement[] = [
  {
    id: "longhai-rail",
    type: "wind",
    label: "陇海铁路 / 徐州-新安镇轴线",
    from: [117.18, 34.262],
    to: [118.36, 34.36],
    className: "rail-overlay",
    testId: "nianzhuang-longhai-rail"
  },
  {
    id: "xuzhou-relief-note",
    type: "marker",
    label: "东援止于大许家一线",
    coordinates: [117.58, 34.315],
    revealAt: "1948-11-13T18:00",
    testId: "nianzhuang-relief-block-note"
  },
  {
    id: "trench-note",
    type: "marker",
    label: "纵横壕沟近迫",
    coordinates: [117.82, 34.255],
    revealAt: "1948-11-15T02:00",
    testId: "nianzhuang-trench-note"
  },
  {
    id: "force-scale-note",
    type: "marker",
    label: "黄兵团师级阵地展开",
    coordinates: [117.875, 34.365],
    revealAt: "1948-11-10T20:00",
    testId: "nianzhuang-force-scale-note"
  },
  {
    id: "assault-axis-note",
    type: "marker",
    label: "华野5个纵队四面向心突击",
    coordinates: [117.69, 34.37],
    revealAt: "1948-11-19T10:00",
    testId: "nianzhuang-assault-axis-note"
  },
  {
    id: "destroyed-site-25",
    type: "marker",
    label: "25军残部被歼地",
    subtitle: "尤家湖方向",
    coordinates: [117.89, 34.342],
    revealAt: "1948-11-22T18:00",
    className: "destruction-site-marker",
    testId: "nianzhuang-destruction-site-25"
  },
  {
    id: "destroyed-site-64",
    type: "marker",
    label: "64军残部被歼地",
    subtitle: "小院上-吴庄方向",
    coordinates: [117.952, 34.302],
    revealAt: "1948-11-22T18:00",
    className: "destruction-site-marker",
    testId: "nianzhuang-destruction-site-64"
  },
  {
    id: "destroyed-site-44-100",
    type: "marker",
    label: "44/100军残部被歼地",
    subtitle: "南侧村落方向",
    coordinates: [117.916, 34.238],
    revealAt: "1948-11-22T18:00",
    className: "destruction-site-marker",
    testId: "nianzhuang-destruction-site-44-100"
  },
  {
    id: "destroyed-site-command",
    type: "marker",
    label: "兵团部终局点",
    subtitle: "倪庄附近",
    coordinates: [117.905, 34.25],
    revealAt: "1948-11-22T18:00",
    className: "destruction-site-marker command-destruction-site",
    testId: "nianzhuang-destruction-site-command"
  }
];

export const terrainZones = [
  {
    className: "nianzhuang-village-zone",
    coordinates: [117.875, 34.292] as [number, number],
    label: "碾庄圩村落工事",
    labelCoordinates: [117.885, 34.318] as [number, number],
    rx: 84,
    ry: 54
  },
  {
    className: "nianzhuang-water-zone",
    coordinates: [117.99, 34.275] as [number, number],
    label: "水沟水塘限制机动",
    labelCoordinates: [118.03, 34.295] as [number, number],
    rx: 96,
    ry: 52
  },
  {
    className: "nianzhuang-relief-zone",
    coordinates: [117.55, 34.27] as [number, number],
    label: "大许家阻援阵地",
    labelCoordinates: [117.49, 34.305] as [number, number],
    rx: 86,
    ry: 88
  }
];

export const battleEffects: BattleEffectElement[] = [
  {
    id: "relief-blocked-salvo",
    type: "salvo",
    start: "1948-11-13T18:00",
    end: "1948-11-14T12:00",
    from: [117.55, 34.3],
    to: [117.63, 34.285],
    fromRouteId: "pla-relief-block-line",
    toRouteId: "xuzhou-relief-east",
    label: "阻援炮火",
    testId: "nianzhuang-effect-relief-blocked"
  },
  {
    id: "opening-assault-salvo",
    type: "salvo",
    start: "1948-11-19T10:00",
    end: "1948-11-19T21:15",
    from: [117.78, 34.22],
    to: [117.78, 34.296],
    fromRouteId: "pla-artillery-zhoujiazhai",
    toRouteId: "huang-nianzhuang-defense-ring",
    label: "总攻炮火",
    testId: "nianzhuang-effect-general-assault"
  },
  {
    id: "first-line-break-salvo",
    type: "salvo",
    start: "1948-11-19T21:15",
    end: "1948-11-19T22:30",
    from: [117.805, 34.287],
    to: [117.855, 34.292],
    fromRouteId: "pla-general-assault-west",
    toRouteId: "huang-inner-recoil",
    label: "第一道围墙突破",
    showShellTraces: false,
    testId: "nianzhuang-effect-first-line"
  },
  {
    id: "north-fragment-break-salvo",
    type: "salvo",
    start: "1948-11-19T22:30",
    end: "1948-11-20T03:30",
    from: [117.852, 34.322],
    to: [117.868, 34.312],
    fromRouteId: "pla-general-assault-north",
    toRouteId: "huang-north-fragment-recoil",
    label: "北段碎裂",
    showShellTraces: false,
    className: "nianzhuang-fragment-impact",
    testId: "nianzhuang-effect-north-fragment"
  },
  {
    id: "east-fragment-break-salvo",
    type: "salvo",
    start: "1948-11-19T22:30",
    end: "1948-11-20T03:30",
    from: [117.912, 34.292],
    to: [117.898, 34.297],
    fromRouteId: "pla-general-assault-east",
    toRouteId: "huang-east-fragment-recoil",
    label: "东段回缩",
    showShellTraces: false,
    className: "nianzhuang-fragment-impact",
    testId: "nianzhuang-effect-east-fragment"
  },
  {
    id: "south-fragment-break-salvo",
    type: "salvo",
    start: "1948-11-19T22:30",
    end: "1948-11-20T03:30",
    from: [117.86, 34.258],
    to: [117.874, 34.27],
    fromRouteId: "pla-general-assault-south",
    toRouteId: "huang-south-fragment-recoil",
    label: "南段割裂",
    showShellTraces: false,
    className: "nianzhuang-fragment-impact",
    testId: "nianzhuang-effect-south-fragment"
  },
  {
    id: "final-pocket-salvo",
    type: "salvo",
    start: "1948-11-20T05:30",
    end: "1948-11-21T08:00",
    from: [117.89, 34.294],
    to: [117.928, 34.3],
    fromRouteId: "pla-remnant-mop-up-east",
    toRouteId: "huang-remnant-fallback-east",
    label: "内圩失守",
    showShellTraces: false,
    testId: "nianzhuang-effect-final-pocket"
  },
  {
    id: "remnant-village-salvo",
    type: "salvo",
    start: "1948-11-21T08:00",
    end: "1948-11-22T16:00",
    from: [117.91, 34.29],
    to: [117.94, 34.286],
    fromRouteId: "pla-remnant-mop-up-west",
    toRouteId: "huang-east-remnant-defense",
    label: "残点清剿",
    showShellTraces: false,
    testId: "nianzhuang-effect-remnant-village"
  },
  {
    id: "north-destruction-salvo",
    type: "salvo",
    start: "1948-11-22T16:00",
    end: "1948-11-22T18:00",
    from: [117.888, 34.338],
    to: [117.89, 34.342],
    fromRouteId: "pla-remnant-mop-up-north",
    toRouteId: "huang-final-north-collapse",
    label: "25军终局",
    showShellTraces: false,
    testId: "nianzhuang-effect-north-destruction"
  },
  {
    id: "east-destruction-salvo",
    type: "salvo",
    start: "1948-11-22T16:00",
    end: "1948-11-22T18:00",
    from: [117.944, 34.301],
    to: [117.952, 34.302],
    fromRouteId: "pla-remnant-mop-up-east",
    toRouteId: "huang-final-east-collapse",
    label: "64军终局",
    showShellTraces: false,
    testId: "nianzhuang-effect-east-destruction"
  },
  {
    id: "south-destruction-salvo",
    type: "salvo",
    start: "1948-11-22T16:00",
    end: "1948-11-22T18:00",
    from: [117.892, 34.26],
    to: [117.916, 34.238],
    fromRouteId: "pla-remnant-mop-up-west",
    toRouteId: "huang-final-south-collapse",
    label: "44/100军终局",
    showShellTraces: false,
    testId: "nianzhuang-effect-south-destruction"
  }
];

export const battleEvents: BattleEvent[] = [
  {
    id: "campaign-opens",
    date: "1948-11-06T18:00",
    title: "淮海第一阶段发起",
    location: "徐州东侧新安镇地区",
    coordinates: [118.28, 34.36],
    phase: "追击发起",
    summary: "华东野战军按中央军委第一阶段重心歼灭黄百韬兵团的方针，对新安镇地区全线出击。",
    detail: "动画把东线、北线和南线追击同时展开，黄兵团尚在新安镇以西轴线上，战场重心从徐州东侧向碾庄圩转移。",
    significance: "这一节点决定战役不是静态围城，而是先追上、再合围、再攻坚。",
    mapFocus: ["xinanzhen", "east-pla-entry", "xuzhou"]
  },
  {
    id: "huang-withdraws",
    date: "1948-11-07T06:00",
    title: "黄百韬兵团西撤",
    location: "新安镇至碾庄圩轴线",
    coordinates: [118.12, 34.335],
    phase: "急行追击",
    summary: "黄百韬兵团撤离新安镇向徐州收缩，华野急行追击，不与小股敌人纠缠。",
    detail: "第七兵团撤退路线沿铁路/公路水网轴线西行，华野北、东、南三路紧追，路线不穿越水网密集处和村落防线。",
    significance: "撤退路线和追击路线必须连续呈现，避免后续防御圈像凭空出现。",
    mapFocus: ["xinanzhen", "canal-bridge", "nianzhuang"]
  },
  {
    id: "pocket-closes",
    date: "1948-11-10T20:00",
    title: "碾庄圩合围形成",
    location: "碾庄圩周边",
    coordinates: [117.86, 34.29],
    phase: "合围",
    summary: "黄百韬兵团约10万人被压入距徐州不到50公里的碾庄圩一带，华野多路形成包围。",
    detail: "撤退纵队先进入碾庄圩，再由25军、64军、44军、100军等分路转向北、东、南、西各村落阵地；圈外侧后部队被截断，但此时尚不是已经结束的结果。",
    significance: "这是运动战转入攻坚战的分界点，也解释后面完整防御阵地不是突然摊开。",
    mapFocus: [
      "huang-deploy-north",
      "huang-deploy-east",
      "huang-deploy-south",
      "huang-deploy-west",
      "huang-deploy-command",
      "huang-outer-destroyed-column",
      "pla-encirclement-ring"
    ]
  },
  {
    id: "hold-and-relief",
    date: "1948-11-11T12:00",
    title: "固守待援与徐州东援",
    location: "碾庄圩、徐州至大许家",
    coordinates: [117.72, 34.285],
    phase: "围歼与救援并行",
    summary: "黄百韬接令就地抵抗，邱清泉、李弥兵团由徐州向东增援。",
    detail: "动画同时保留华野包围圈、黄兵团师级守点和徐州东援路线：东援部队从徐州出现，沿徐州至大许家轴线推进，不会直接跳到碾庄附近。",
    significance: "碾庄攻坚能否完成，关键取决于徐东阻援是否挡住邱李两兵团。",
    mapFocus: ["huang-nianzhuang-defense-ring", "pla-encirclement-ring", "xuzhou-relief-east", "pla-relief-block-line"]
  },
  {
    id: "preliminary-attacks",
    date: "1948-11-13T06:00",
    title: "试攻受挫，转入攻坚判断",
    location: "大兴庄、大宋庄、彭庄、鲁楼梁庄外围",
    coordinates: [117.82, 34.33],
    phase: "试攻",
    summary: "华野部分纵队从运动追击仓促转攻坚，在大兴庄、大宋庄、彭庄、鲁楼梁庄等村落阵地遇到顽强抗击。",
    detail: "动画把4纵、6纵、8纵、9纵、13纵的外围动作拆开：部队从外层包围线进入各自攻击方向，停在村落阵地外沿相持，不再穿过黄兵团师级守点后才发生战斗。",
    significance: "碾庄圩不是小规模包围，而是约10万人守在村落水网中的复杂攻坚。",
    mapFocus: ["pla-4th-preliminary-daxingzhuang", "pla-13th-preliminary-songzhuang", "pla-6th-preliminary-pengzhuang", "pla-encirclement-ring", "huang-nianzhuang-defense-ring"]
  },
  {
    id: "relief-blocked",
    date: "1948-11-13T18:00",
    title: "大许家阻援线钉住东援",
    location: "大许家一线",
    coordinates: [117.56, 34.28],
    phase: "徐东阻击",
    summary: "阻援集团把邱清泉、李弥挡在大许家一线，东援先头距碾庄仍有距离。",
    detail: "东援箭头止于大许家以东的受阻点，华野阻援线和反冲击与其正面相接，避免出现穿过阻援线却没有战斗的画面。",
    significance: "这使黄百韬兵团从等待救援转为被孤立消耗。",
    mapFocus: ["xuzhou-relief-east", "pla-relief-block-line", "daxujia"]
  },
  {
    id: "trench-approach",
    date: "1948-11-15T02:00",
    title: "对壕近迫开始",
    location: "碾庄圩四周",
    coordinates: [117.83, 34.285],
    phase: "攻坚准备",
    summary: "14日晚会议后，华野停止急攻，15日凌晨开始大规模挖壕，隐藏接近守军阵地。",
    detail: "四条对壕路线从西、北、南、东压向防御圈，但尚未穿越第一道村落防线；守军仍在完整防御圈内。",
    significance: "时间线上先有防御圈，再有壕沟近迫，之后队形才被逐点压碎。",
    mapFocus: ["pla-west-trench-approach", "pla-north-trench-approach", "huang-nianzhuang-defense-ring"]
  },
  {
    id: "village-by-village",
    date: "1948-11-17T20:00",
    title: "村落水沟反复争夺",
    location: "碾庄圩外围阵地",
    coordinates: [117.88, 34.275],
    phase: "逐点争夺",
    summary: "村落、水塘、水沟有利于防守，外围阵地反复争夺，华野继续把壕沟推近。",
    detail: "这一段不让双方互相穿过：西侧和东侧都显示守军短促反扑、华野壕线后撤稳住、再重新压回的交错路线；黄兵团防御圈仍可见，炮火和战斗效果只在双方路线相接处出现。",
    significance: "表现碾庄圩之战艰苦、迟滞和攻坚属性，而不是一次简单平推。",
    mapFocus: [
      "nianzhuang",
      "huang-west-counterpush",
      "pla-west-yield-and-hold",
      "pla-west-counterpress",
      "huang-east-counterpush",
      "pla-east-counterpress",
      "huang-nianzhuang-defense-ring"
    ]
  },
  {
    id: "general-assault",
    date: "1948-11-19T10:00",
    title: "粟裕下达总攻令",
    location: "周家寨至碾庄圩",
    coordinates: [117.8, 34.285],
    phase: "总攻",
    summary: "19日上午10时，粟裕在周家寨下达总攻碾庄圩令；白天主要是炮火准备和突击集结，不把部队提前画进内圩。",
    detail: "画面保留周家寨炮兵、对壕近迫线和完整第一道村落防线。真正的步兵突击放到当晚21时15分以后，避免出现白天已经突破、后面还说守军防线破碎的时间错位。",
    significance: "这是总攻命令与火力准备节点，夜间突击才是防线破碎的开始。",
    mapFocus: ["pla-artillery-zhoujiazhai", "pla-west-trench-approach", "pla-north-trench-approach", "huang-nianzhuang-defense-ring"]
  },
  {
    id: "first-line-broken",
    date: "1948-11-19T22:30",
    title: "第一道围墙被突破",
    location: "碾庄圩西侧至内围",
    coordinates: [117.835, 34.29],
    phase: "突破",
    summary: "19日晚21时15分左右突击发起，至22时至22时30分突破第一道围墙；守军外圈阵地开始碎裂。",
    detail: "突破后，25军、64军、44军、100军的师级阵地不再沿外圈完整站住，而是西段破口、北段碎裂、东段回缩、南段割裂；华野各突击线先止于第二道围墙附近，随后才继续压入内圩。",
    significance: "先突破第一道围墙，再压向第二道围墙，避免把多层防线画成一次平推。",
    mapFocus: [
      "pla-general-assault-west",
      "huang-west-night-counterattack",
      "pla-west-night-counterpress",
      "huang-east-night-counterattack",
      "pla-east-night-counterpress",
      "huang-inner-recoil",
      "huang-north-fragment-recoil",
      "huang-east-fragment-recoil",
      "huang-south-fragment-recoil",
      "inner-west-line"
    ]
  },
  {
    id: "second-line-broken",
    date: "1948-11-20T03:30",
    title: "第二道围墙被突破",
    location: "碾庄圩第二道围墙至内圩",
    coordinates: [117.872, 34.292],
    phase: "突入内圩",
    summary: "20日凌晨3时30分前后，华野突破最后一道围墙并冲入圩内，黄兵团防御从第二道围墙转为内圩残部据点。",
    detail: "03:30 以后画面切换为四向内圩压缩线：黄兵团残部由第二道围墙向兵团部、25军军部等内圩据点收缩，第二道围墙本身显示为北段破碎、东段失守、南段割裂，避免同一部队跨阶段重叠。",
    significance: "这是第一道突破和最终清剿之间的关键层级，使一、二、三层防线的破碎有清楚次序。",
    mapFocus: [
      "pla-second-wall-west",
      "pla-second-wall-north",
      "pla-second-wall-south",
      "pla-second-wall-east",
      "huang-final-core-defense",
      "huang-second-wall-collapse",
      "final-core"
    ]
  },
  {
    id: "final-pocket",
    date: "1948-11-20T05:30",
    title: "内圩核心失守，残点清剿",
    location: "碾庄圩内圩及东侧村落残点",
    coordinates: [117.872, 34.292],
    phase: "清剿残点",
    summary: "20日清晨后，兵团部和25军军部等内圩核心相继失守，残部退向东侧村落据点继续顽抗，救援仍被阻在西侧。",
    detail: "画面先显示内圩核心破碎和黄部向大院上、吴庄方向连续后撤，再显示尤家湖、小院上-吴庄、三里庄等据点；北侧和南侧残部还会短促外突，华野再反压回据点。华野不再沿一条线直插核心，而是分北、东、南、西四路逐村压缩。",
    significance: "内圩核心失守不等于所有敌军立即消失，后续清剿必须有残点、路线和时间。",
    mapFocus: [
      "pla-remnant-mop-up-north",
      "pla-remnant-mop-up-east",
      "pla-remnant-mop-up-south",
      "pla-remnant-mop-up-west",
      "huang-north-remnant-sortie",
      "pla-north-remnant-counterpress",
      "huang-south-remnant-sortie",
      "pla-south-remnant-counterpress",
      "huang-remnant-fallback-east",
      "huang-east-remnant-defense",
      "xuzhou-relief-east"
    ]
  },
  {
    id: "huang-end",
    date: "1948-11-22T18:00",
    title: "倪庄终局",
    location: "倪庄附近",
    coordinates: [117.905, 34.25],
    phase: "终局",
    summary: "22日下午至黄昏，黄百韬逃至倪庄附近，在彻底绝望中自戕；碾庄圩围歼战结束。",
    detail: "最终路线从东侧据点连续通向倪庄，北、东、南各军级残部同时退到晚显标注点，解放军追击线在后方压上；除最终消灭的残部外，其他作战线保持可读的历史轨迹。",
    significance: "碾庄圩之战完成淮海战役第一阶段决定性胜利，徐州集团东侧主力被切除。",
    mapFocus: [
      "huang-final-north-collapse",
      "huang-final-east-collapse",
      "huang-final-south-collapse",
      "huang-nizhuang-final-flight",
      "pla-nizhuang-pursuit",
      "nizhuang"
    ]
  }
];

export const cueEventIds = new Set([
  "campaign-opens",
  "huang-withdraws",
  "pocket-closes",
  "hold-and-relief",
  "preliminary-attacks",
  "relief-blocked",
  "trench-approach",
  "village-by-village",
  "general-assault",
  "first-line-broken",
  "second-line-broken",
  "final-pocket",
  "huang-end"
]);

export const cueEventKinds = {
  "campaign-opens": "cannon",
  "huang-withdraws": "cannon",
  "pocket-closes": "cannon",
  "hold-and-relief": "cannon",
  "preliminary-attacks": "combined",
  "relief-blocked": "combined",
  "trench-approach": "cannon",
  "village-by-village": "combined",
  "general-assault": "combined",
  "first-line-broken": "combined",
  "second-line-broken": "combined",
  "final-pocket": "combined",
  "huang-end": "cannon"
} as const;
