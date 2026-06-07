import { publicPath } from "../lib/publicPath";

export type CannaeFaction = "rome" | "carthage";

export type CannaePhaseId =
  | "deployment"
  | "romanAdvance"
  | "centerYields"
  | "cavalryClears"
  | "africanWingsTurn"
  | "encirclement"
  | "collapse";

export type CannaeCertainty = "source-backed" | "probable" | "schematic" | "contested";

export type CannaeBlockState = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  bend?: "convex" | "flat" | "concave";
};

export type CannaeFormationBlock = {
  id: string;
  faction: CannaeFaction;
  role: "heavy-infantry" | "cavalry" | "light-infantry" | "command";
  label: string;
  shortLabel: string;
  certainty: CannaeCertainty;
  keyframes: Record<CannaePhaseId, CannaeBlockState>;
};

export type CannaePhase = {
  id: CannaePhaseId;
  title: string;
  dateLabel: string;
  meterLabel: string;
  summary: string;
  detail: string;
  romanCompression: number;
  centerCurvature: "convex" | "flat" | "concave";
  wingClosure: number;
  cavalrySweep: number;
  focusBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type CannaeNarrationCue = {
  id: string;
  title: string;
  text: string;
};

export type CannaeSource = {
  title: string;
  url: string;
  role: string;
};

export const musicSource = publicPath("/audio/wikimedia-holst-mars.ogg");

export const cannaeSources: CannaeSource[] = [
  {
    title: "Polybius, Histories, Book 3",
    url: "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Polybius/3*.html",
    role: "Primary ancient narrative for Hannibal's deployment, cavalry action, and Roman compression."
  },
  {
    title: "Livy, Ab Urbe Condita, Book 22",
    url: "https://www.perseus.tufts.edu/hopper/text?doc=Liv.+22.44",
    role: "Ancient narrative cross-check for deployment, Roman depth, and battlefield sequence."
  },
  {
    title: "Encyclopaedia Britannica, Battle of Cannae",
    url: "https://www.britannica.com/event/Battle-of-Cannae",
    role: "Modern reference for battle date, commanders, and double-envelopment summary."
  },
  {
    title: "World History Encyclopedia, Battle of Cannae",
    url: "https://www.worldhistory.org/Battle_of_Cannae/",
    role: "Modern narrative cross-check for the convex-to-concave center and envelopment."
  },
  {
    title: "Wikimedia Commons, Maps of the Battle of Cannae",
    url: "https://commons.wikimedia.org/wiki/Category:Maps_of_the_Battle_of_Cannae",
    role: "Map-composition lead only; not treated as primary evidence."
  }
];

export const cannaePhases: CannaePhase[] = [
  {
    id: "deployment",
    title: "部署：奥菲杜斯河平原",
    dateLabel: "公元前216年8月2日 清晨",
    meterLabel: "开局阵列",
    summary: "罗马步兵以异常纵深集中在中央；汉尼拔把较弱的伊比利亚、凯尔特步兵推成凸月，中军两侧布置非洲重步兵，骑兵占两翼。",
    detail:
      "动画从战术沙盘开始：罗马重步兵不是薄线，而是密集纵深集团；迦太基中军向前凸出，两端的非洲重步兵暂时拒止在后，左翼重骑、右翼努米底亚骑兵准备清翼。",
    romanCompression: 1,
    centerCurvature: "convex",
    wingClosure: 0.08,
    cavalrySweep: 0,
    focusBox: { x: 130, y: 116, width: 900, height: 650 }
  },
  {
    id: "romanAdvance",
    title: "罗马推进：纵深压向中军",
    dateLabel: "上午 接敌",
    meterLabel: "纵深推进",
    summary: "罗马中央集团向前压入，战术画面优先聚焦步兵接触面，而不是留出无关空地。",
    detail:
      "罗马军团的宽度略收、纵深加厚，说明其攻击重心在中央；迦太基凸月中军开始承压，但两侧非洲重步兵仍保持可内折的位置。",
    romanCompression: 0.9,
    centerCurvature: "convex",
    wingClosure: 0.18,
    cavalrySweep: 0.16,
    focusBox: { x: 185, y: 138, width: 790, height: 620 }
  },
  {
    id: "centerYields",
    title: "中军后退：凸月变成凹口",
    dateLabel: "上午后段 中央陷入",
    meterLabel: "中军诱陷",
    summary: "汉尼拔中军边战边退，由凸形逐步转成凹形，把罗马步兵吸进袋口。",
    detail:
      "这是坎尼动画的第一处关键转折：迦太基中军不是简单溃退，而是形成可见凹口；罗马集团继续向前，正面战斗看似占优，但两翼空间正在收紧。",
    romanCompression: 0.78,
    centerCurvature: "concave",
    wingClosure: 0.34,
    cavalrySweep: 0.38,
    focusBox: { x: 220, y: 170, width: 710, height: 560 }
  },
  {
    id: "cavalryClears",
    title: "骑兵清翼：罗马两翼失去屏护",
    dateLabel: "中午前后 两翼决出",
    meterLabel: "骑兵清场",
    summary: "迦太基左翼重骑击败罗马骑兵后横扫；右翼努米底亚骑兵牵制并扩大战果，罗马步兵两侧暴露。",
    detail:
      "动画用两道骑兵弧线表现清翼，而不是只在步兵中心画包围圈。骑兵完成清场后，迦太基的合围条件才成立。",
    romanCompression: 0.72,
    centerCurvature: "concave",
    wingClosure: 0.52,
    cavalrySweep: 0.66,
    focusBox: { x: 208, y: 146, width: 750, height: 610 }
  },
  {
    id: "africanWingsTurn",
    title: "非洲重步兵内折",
    dateLabel: "午后 合围成形",
    meterLabel: "两翼内折",
    summary: "两侧非洲重步兵转向内压，罗马集团的正面推进转化为被两侧夹击。",
    detail:
      "非洲重步兵的旋转是第二处关键转折。画面要让用户清楚看到：合围不是突然出现的圆，而是两翼从拒止位置向内折叠。",
    romanCompression: 0.62,
    centerCurvature: "concave",
    wingClosure: 0.74,
    cavalrySweep: 0.82,
    focusBox: { x: 245, y: 180, width: 660, height: 530 }
  },
  {
    id: "encirclement",
    title: "双重合围：罗马集团被压缩",
    dateLabel: "午后至傍晚 封闭口袋",
    meterLabel: "合围闭合",
    summary: "骑兵从后方补上闭合面，非洲重步兵和凹形中军共同压缩罗马中央。",
    detail:
      "这一阶段显示闭合包围环、内部罗马集团面积压缩和多方向近战接触。动画的主镜头始终压在战斗画面上，避免把大片空地留给边缘区域。",
    romanCompression: 0.48,
    centerCurvature: "concave",
    wingClosure: 0.92,
    cavalrySweep: 1,
    focusBox: { x: 290, y: 210, width: 570, height: 460 }
  },
  {
    id: "collapse",
    title: "终局：密集集团崩溃",
    dateLabel: "傍晚 战斗结束",
    meterLabel: "压缩崩溃",
    summary: "罗马军主力在包围中失去机动空间；动画用更暗的内圈、停滞的队列和四面压力表示崩溃。",
    detail:
      "终局不渲染血腥细节，重点表现战术结构的后果：密集纵深集团在被侧后夹击后无法展开，阵形变成被动挤压的内核。",
    romanCompression: 0.4,
    centerCurvature: "concave",
    wingClosure: 1,
    cavalrySweep: 1,
    focusBox: { x: 310, y: 220, width: 520, height: 430 }
  }
];

export const cannaeNarrationCues: Record<CannaePhaseId, CannaeNarrationCue> = Object.fromEntries(
  cannaePhases.map((phase) => [
    phase.id,
    {
      id: phase.id,
      title: phase.meterLabel,
      text: phase.summary
    }
  ])
) as Record<CannaePhaseId, CannaeNarrationCue>;

const state = (
  x: number,
  y: number,
  width: number,
  height: number,
  rotation = 0,
  opacity = 1,
  bend?: CannaeBlockState["bend"]
): CannaeBlockState => ({ x, y, width, height, rotation, opacity, bend });

export const cannaeFormationBlocks: CannaeFormationBlock[] = [
  {
    id: "roman-infantry-mass",
    faction: "rome",
    role: "heavy-infantry",
    label: "罗马重步兵纵深集团",
    shortLabel: "罗马军团",
    certainty: "source-backed",
    keyframes: {
      deployment: state(455, 618, 290, 130),
      romanAdvance: state(458, 540, 270, 150),
      centerYields: state(468, 468, 235, 178),
      cavalryClears: state(480, 440, 210, 192),
      africanWingsTurn: state(497, 418, 174, 185),
      encirclement: state(522, 406, 120, 150),
      collapse: state(532, 414, 102, 122, 0, 0.86)
    }
  },
  {
    id: "roman-left-cavalry",
    faction: "rome",
    role: "cavalry",
    label: "罗马左翼骑兵",
    shortLabel: "罗马左骑",
    certainty: "probable",
    keyframes: {
      deployment: state(265, 620, 140, 58, -5),
      romanAdvance: state(280, 570, 130, 54, -7),
      centerYields: state(300, 535, 112, 48, -14, 0.72),
      cavalryClears: state(310, 526, 92, 38, -22, 0.34),
      africanWingsTurn: state(330, 518, 68, 30, -26, 0.2),
      encirclement: state(340, 512, 48, 22, -26, 0.08),
      collapse: state(340, 512, 42, 18, -26, 0)
    }
  },
  {
    id: "roman-right-cavalry",
    faction: "rome",
    role: "cavalry",
    label: "罗马右翼骑兵",
    shortLabel: "罗马右骑",
    certainty: "probable",
    keyframes: {
      deployment: state(790, 620, 140, 58, 5),
      romanAdvance: state(780, 570, 130, 54, 7),
      centerYields: state(764, 535, 112, 48, 14, 0.74),
      cavalryClears: state(770, 520, 92, 38, 22, 0.38),
      africanWingsTurn: state(784, 508, 68, 30, 26, 0.22),
      encirclement: state(794, 506, 48, 22, 26, 0.08),
      collapse: state(794, 506, 42, 18, 26, 0)
    }
  },
  {
    id: "carthaginian-yielding-center",
    faction: "carthage",
    role: "heavy-infantry",
    label: "伊比利亚-凯尔特中军",
    shortLabel: "凸月中军",
    certainty: "source-backed",
    keyframes: {
      deployment: state(408, 355, 372, 82, 0, 1, "convex"),
      romanAdvance: state(418, 365, 350, 78, 0, 1, "convex"),
      centerYields: state(440, 377, 305, 74, 0, 1, "concave"),
      cavalryClears: state(452, 380, 282, 70, 0, 1, "concave"),
      africanWingsTurn: state(468, 386, 244, 64, 0, 1, "concave"),
      encirclement: state(498, 390, 176, 52, 0, 0.96, "concave"),
      collapse: state(518, 394, 132, 42, 0, 0.82, "concave")
    }
  },
  {
    id: "african-left-infantry",
    faction: "carthage",
    role: "heavy-infantry",
    label: "非洲重步兵左翼",
    shortLabel: "非洲左翼",
    certainty: "source-backed",
    keyframes: {
      deployment: state(288, 372, 108, 118, -7),
      romanAdvance: state(314, 392, 108, 126, -9),
      centerYields: state(345, 410, 106, 136, -14),
      cavalryClears: state(368, 418, 104, 148, -22),
      africanWingsTurn: state(438, 415, 92, 156, -58),
      encirclement: state(478, 404, 74, 138, -80),
      collapse: state(500, 414, 58, 118, -84, 0.92)
    }
  },
  {
    id: "african-right-infantry",
    faction: "carthage",
    role: "heavy-infantry",
    label: "非洲重步兵右翼",
    shortLabel: "非洲右翼",
    certainty: "source-backed",
    keyframes: {
      deployment: state(792, 372, 108, 118, 7),
      romanAdvance: state(762, 392, 108, 126, 9),
      centerYields: state(730, 410, 106, 136, 14),
      cavalryClears: state(708, 418, 104, 148, 22),
      africanWingsTurn: state(642, 415, 92, 156, 58),
      encirclement: state(610, 404, 74, 138, 80),
      collapse: state(600, 414, 58, 118, 84, 0.92)
    }
  },
  {
    id: "carthaginian-left-cavalry",
    faction: "carthage",
    role: "cavalry",
    label: "迦太基左翼重骑",
    shortLabel: "左翼重骑",
    certainty: "source-backed",
    keyframes: {
      deployment: state(174, 390, 140, 66, -8),
      romanAdvance: state(210, 430, 144, 62, -16),
      centerYields: state(235, 506, 138, 58, -34),
      cavalryClears: state(405, 604, 150, 54, -2),
      africanWingsTurn: state(482, 592, 126, 46, 12),
      encirclement: state(506, 570, 106, 42, 2),
      collapse: state(520, 552, 90, 36, 0, 0.86)
    }
  },
  {
    id: "numidian-right-cavalry",
    faction: "carthage",
    role: "cavalry",
    label: "努米底亚右翼骑兵",
    shortLabel: "努米底亚骑",
    certainty: "source-backed",
    keyframes: {
      deployment: state(900, 390, 142, 66, 8),
      romanAdvance: state(854, 430, 142, 62, 16),
      centerYields: state(806, 505, 136, 58, 34),
      cavalryClears: state(678, 604, 146, 54, 2),
      africanWingsTurn: state(598, 590, 124, 46, -12),
      encirclement: state(572, 570, 106, 42, -2),
      collapse: state(566, 552, 90, 36, 0, 0.86)
    }
  },
  {
    id: "carthaginian-command",
    faction: "carthage",
    role: "command",
    label: "汉尼拔指挥点",
    shortLabel: "汉尼拔",
    certainty: "probable",
    keyframes: {
      deployment: state(570, 306, 56, 40),
      romanAdvance: state(570, 326, 56, 40),
      centerYields: state(570, 350, 56, 40),
      cavalryClears: state(570, 352, 56, 40),
      africanWingsTurn: state(570, 358, 56, 40),
      encirclement: state(570, 366, 56, 40),
      collapse: state(570, 366, 56, 40, 0, 0.78)
    }
  }
];

export const cannaeCueEventIds = new Set<CannaePhaseId>([
  "romanAdvance",
  "centerYields",
  "cavalryClears",
  "africanWingsTurn",
  "encirclement",
  "collapse"
]);

export const cannaeTacticalClaims = [
  {
    claim: "罗马中央集团以密集纵深推进，动画以面积和纵深压缩表达其陷入口袋。",
    certainty: "source-backed"
  },
  {
    claim: "迦太基中军由凸月后退成凹形，具体曲线和坐标为示意重建。",
    certainty: "schematic"
  },
  {
    claim: "非洲重步兵从两侧内折，骑兵完成侧后封闭，动画按阶段拆分以说明双重合围结构。",
    certainty: "source-backed"
  },
  {
    claim: "奥菲杜斯河、营地和尘土纹理用于战场环境提示；精确朝向在现代复原中存在差异。",
    certainty: "contested"
  }
];
