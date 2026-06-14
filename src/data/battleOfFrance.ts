import type { UnitIconKind } from "../types/units";

export type Faction =
  | "germany"
  | "allies"
  | "france"
  | "britain"
  | "belgium"
  | "carthage"
  | "rome"
  | "communist"
  | "nationalist"
  | "un"
  | "spain";

export type FrontLine = {
  id: string;
  faction: Faction;
  label: string;
  from: string;
  to: string;
  start: string;
  end: string;
  hideUnit?: boolean;
  retainUnitAfterRouteEnd?: boolean;
  retainRouteTailRatio?: number;
  visibleFrom?: string;
  unitVisibleFrom?: string;
  visibleUntil?: string;
  unitVisibleUntil?: string;
  routeKind?: "air" | "land" | "sea";
  unitBadgeLabel?: string;
  unitGroupId?: string;
  unitIcon?: UnitIconKind;
  /** Visible terrain, fieldwork, or position id that the route is tactically using. */
  positionAnchor?: string;
  /** Additional visible terrain, fieldwork, or position ids that should light up with the route. */
  positionAnchors?: string[];
  /** Extra route points before `from`, used only to keep multi-unit formations continuous through route handoffs. */
  formationPrelude?: Array<[number, number]>;
  waypoints?: Array<[number, number]>;
  /** Optional dates for each waypoint, used when tactical routes need contact/closure timing instead of uniform path speed. */
  waypointDates?: string[];
  width?: number;
  intensity?: number;
  formationUnits?: FormationUnit[];
};

export type FormationUnit = {
  badgeLabel?: string;
  className?: string;
  coordinates?: [number, number];
  faction?: Faction;
  facingX?: -1 | 1;
  forcedFacingX?: -1 | 1;
  hiddenFrom?: string;
  hiddenUntil?: string;
  icon?: UnitIconKind;
  id: string;
  label: string;
  /** Route-local [along, cross] offset in projected map units. Negative along values trail the lead unit. */
  offset?: [number, number];
};

export type BattleEvent = {
  id: string;
  date: string;
  title: string;
  location: string;
  coordinates: [number, number];
  phase: string;
  summary: string;
  detail: string;
  significance: string;
  mapFocus: string[];
};

export type MapPoint = {
  id: string;
  label: string;
  coordinates: [number, number];
  hidden?: boolean;
  kind: "city" | "front" | "objective" | "port" | "forest" | "capital";
  revealAt?: string;
};

export const mapPoints: MapPoint[] = [
  { id: "rotterdam", label: "鹿特丹", coordinates: [4.4792, 51.9225], kind: "city" },
  { id: "amsterdam", label: "阿姆斯特丹", coordinates: [4.9041, 52.3676], kind: "city" },
  { id: "brussels", label: "布鲁塞尔", coordinates: [4.3517, 50.8503], kind: "city" },
  { id: "liege", label: "列日", coordinates: [5.5797, 50.6326], kind: "front" },
  { id: "meuse", label: "默兹河", coordinates: [4.9, 49.9], kind: "front" },
  { id: "ardennes", label: "阿登森林", coordinates: [5.45, 49.9], kind: "forest" },
  { id: "sedan", label: "色当", coordinates: [4.94, 49.70], kind: "objective" },
  { id: "dinant", label: "迪南", coordinates: [4.91, 50.26], kind: "front" },
  { id: "arras", label: "阿拉斯", coordinates: [2.78, 50.29], kind: "city" },
  { id: "abbeville", label: "阿布维尔", coordinates: [1.84, 50.11], kind: "objective" },
  { id: "calais", label: "加来", coordinates: [1.86, 50.95], kind: "port" },
  { id: "dunkirk", label: "敦刻尔克", coordinates: [2.38, 51.03], kind: "port" },
  { id: "lille", label: "里尔", coordinates: [3.06, 50.63], kind: "city" },
  { id: "paris", label: "巴黎", coordinates: [2.35, 48.86], kind: "capital" },
  { id: "amiens", label: "亚眠", coordinates: [2.30, 49.89], kind: "city" },
  { id: "rouen", label: "鲁昂", coordinates: [1.10, 49.44], kind: "city" },
  { id: "reims", label: "兰斯", coordinates: [4.03, 49.26], kind: "city" },
  { id: "lyon", label: "里昂", coordinates: [4.83, 45.76], kind: "city" },
  { id: "bordeaux", label: "波尔多", coordinates: [-0.58, 44.84], kind: "city" },
  { id: "compiegne", label: "贡比涅", coordinates: [2.83, 49.42], kind: "objective" }
];

export const frontLines: FrontLine[] = [
  {
    id: "sickle-cut",
    faction: "germany",
    label: "A集团军群：阿登突击",
    from: "liege",
    to: "sedan",
    start: "1940-05-10",
    end: "1940-05-14",
    routeKind: "land",
    unitIcon: "tank",
    width: 10,
    intensity: 0.9
  },
  {
    id: "meuse-crossing",
    faction: "germany",
    label: "色当突破",
    from: "sedan",
    to: "arras",
    start: "1940-05-13",
    end: "1940-05-18",
    routeKind: "land",
    unitIcon: "tank",
    width: 13,
    intensity: 1
  },
  {
    id: "channel-dash",
    faction: "germany",
    label: "装甲部队冲向海峡",
    from: "arras",
    to: "abbeville",
    start: "1940-05-16",
    end: "1940-05-20",
    routeKind: "land",
    unitIcon: "tank",
    width: 14,
    intensity: 1
  },
  {
    id: "northern-pocket",
    faction: "germany",
    label: "北方口袋合围",
    from: "abbeville",
    to: "dunkirk",
    start: "1940-05-21",
    end: "1940-05-28",
    routeKind: "land",
    unitIcon: "tank",
    width: 10,
    intensity: 0.85
  },
  {
    id: "allied-dyle",
    faction: "allies",
    label: "英法比联军前出比利时",
    from: "arras",
    to: "brussels",
    start: "1940-05-10",
    end: "1940-05-16",
    visibleUntil: "1940-05-22",
    unitVisibleUntil: "1940-05-15",
    routeKind: "land",
    unitIcon: "infantry",
    width: 9,
    intensity: 0.65
  },
  {
    id: "dunkirk-evac",
    faction: "britain",
    label: "发电机行动：海上撤离",
    from: "dunkirk",
    to: "calais",
    start: "1940-05-26",
    end: "1940-06-04",
    visibleUntil: "1940-06-05",
    unitVisibleUntil: "1940-06-04",
    routeKind: "sea",
    unitIcon: "ship",
    width: 12,
    intensity: 0.8
  },
  {
    id: "fall-rot-somme",
    faction: "germany",
    label: "红色方案：突破索姆-埃纳",
    from: "amiens",
    to: "paris",
    start: "1940-06-05",
    end: "1940-06-14",
    routeKind: "land",
    unitIcon: "tank",
    width: 13,
    intensity: 1
  },
  {
    id: "fall-rot-east",
    faction: "germany",
    label: "东翼穿插与马奇诺侧后",
    from: "reims",
    to: "lyon",
    start: "1940-06-09",
    end: "1940-06-19",
    routeKind: "land",
    unitIcon: "tank",
    width: 10,
    intensity: 0.75
  },
  {
    id: "french-retreat",
    faction: "france",
    label: "法国政府南撤",
    from: "paris",
    to: "bordeaux",
    start: "1940-06-10",
    end: "1940-06-17",
    visibleUntil: "1940-06-22",
    unitVisibleUntil: "1940-06-17",
    routeKind: "land",
    unitIcon: "infantry",
    width: 7,
    intensity: 0.55
  },
  {
    id: "armistice",
    faction: "germany",
    label: "停战签署",
    from: "paris",
    to: "compiegne",
    start: "1940-06-21",
    end: "1940-06-22",
    routeKind: "land",
    unitIcon: "tank",
    width: 7,
    intensity: 0.6
  }
];

export const battleEvents: BattleEvent[] = [
  {
    id: "yellow-plan",
    date: "1940-05-10",
    title: "黄色方案启动",
    location: "荷兰、比利时、卢森堡边境",
    coordinates: [5.35, 50.45],
    phase: "佯动与突破准备",
    summary: "德国同时进攻低地国家，诱使英法主力按预案北上进入比利时。",
    detail:
      "B集团军群在荷兰、比利时方向制造主攻态势；真正决定战役的装甲集群由A集团军群穿越阿登，试图绕开马奇诺防线并切断北上的盟军。",
    significance:
      "德军利用盟军对一战经验的预期，制造北线威胁，把英法机动部队吸入比利时，为阿登突击打开战略空间。",
    mapFocus: ["rotterdam", "brussels", "ardennes"]
  },
  {
    id: "ardennes-traffic",
    date: "1940-05-11",
    title: "阿登纵队穿林",
    location: "阿登森林",
    coordinates: [5.45, 49.9],
    phase: "隐蔽穿插",
    summary: "德军装甲与摩托化部队通过道路狭窄的阿登森林，赌盟军反应迟缓。",
    detail:
      "阿登被不少盟军计划者视为不适合大规模装甲行动的地形。德军以高风险交通组织把坦克、工兵、炮兵和补给车流压进森林走廊。",
    significance:
      "如果纵队被及时空袭或堵塞，计划可能崩溃；盟军未能集中打断这一交通瓶颈，使色当方向出现突然的装甲质量。",
    mapFocus: ["ardennes", "sedan"]
  },
  {
    id: "sedan-crossing",
    date: "1940-05-13",
    title: "色当渡河与空袭震慑",
    location: "色当、默兹河",
    coordinates: [4.94, 49.70],
    phase: "突破口形成",
    summary: "古德里安装甲部队在强烈空中支援下强渡默兹河，法军防线被撕开。",
    detail:
      "德军俯冲轰炸和炮火压制削弱了法国第55步兵师的防御；工兵架桥后，装甲部队开始从桥头堡向西扩张。",
    significance:
      "色当突破把战役从边境会战变成纵深崩溃。法军预备队与指挥反应跟不上德军穿插节奏。",
    mapFocus: ["sedan", "meuse"]
  },
  {
    id: "meuse-breakout",
    date: "1940-05-15",
    title: "默兹河防线崩裂",
    location: "色当至蒙科尔内方向",
    coordinates: [4.55, 49.78],
    phase: "战役机动",
    summary: "德军装甲群突破桥头堡后向西高速推进，法国最高统帅部意识到战线被切开。",
    detail:
      "德军没有停下来等待传统步兵战线完全跟上，而是冒险向盟军后方通信、补给和交通枢纽突进。",
    significance:
      "法军局部反击未能恢复连续防线，北上的英法比联军开始面临后路被截断的危险。",
    mapFocus: ["sedan", "arras", "abbeville"]
  },
  {
    id: "abbeville-channel",
    date: "1940-05-20",
    title: "装甲前锋抵达英吉利海峡",
    location: "阿布维尔、索姆河口",
    coordinates: [1.84, 50.11],
    phase: "战略切割",
    summary: "德军装甲部队抵达海峡，切断北部盟军与法国南部主力的陆上联系。",
    detail:
      "从阿登经色当向西的突击完成“镰刀割”核心动作。北部英法比部队、比利时军和法国第一集团军陷入大口袋。",
    significance:
      "这一步决定了战役形态：盟军不再只是后撤，而是要在海岸线和港口寻找逃生通道。",
    mapFocus: ["arras", "abbeville", "dunkirk"]
  },
  {
    id: "arras-counterattack",
    date: "1940-05-21",
    title: "阿拉斯反击",
    location: "阿拉斯",
    coordinates: [2.78, 50.29],
    phase: "短促反击",
    summary: "英法装甲与步兵在阿拉斯发动反击，一度震动德军侧翼，但规模不足以切断突击矛头。",
    detail:
      "马蒂尔达坦克造成局部冲击，暴露德军装甲侧翼风险；德军依靠反坦克炮、88毫米炮和空中支援稳住局势。",
    significance:
      "阿拉斯反击显示德军突破并非不可阻挡，但盟军指挥、通信和预备队不足，无法把战术冲击转化为战役逆转。",
    mapFocus: ["arras", "abbeville"]
  },
  {
    id: "dunkirk-pocket",
    date: "1940-05-26",
    title: "敦刻尔克撤离开始",
    location: "敦刻尔克",
    coordinates: [2.38, 51.03],
    phase: "海岸撤离",
    summary: "发电机行动展开，英国海军和大量民船从敦刻尔克海滩与港口撤出盟军。",
    detail:
      "北部口袋被压缩，港口与海滩成为唯一出口。德国装甲短暂停顿、盟军后卫防御与海上组织共同给撤离争取时间。",
    significance:
      "撤离保存了英国远征军主体和大量法军人员，但重装备大量遗失；这不是战术胜利，却影响英国继续作战能力。",
    mapFocus: ["dunkirk", "calais", "lille"]
  },
  {
    id: "belgium-surrenders",
    date: "1940-05-28",
    title: "比利时投降",
    location: "比利时北部",
    coordinates: [3.55, 50.95],
    phase: "北线崩解",
    summary: "比利时军停止抵抗，盟军北部防线缺口扩大，敦刻尔克压力上升。",
    detail:
      "比利时战线的崩溃使英法部队必须用更少兵力维持撤离走廊。里尔等地的法军坚守为撤离争取时间。",
    significance:
      "北部盟军的战略目标从恢复战线转为尽可能多地撤出人员，法国本土防御进入第二阶段。",
    mapFocus: ["brussels", "lille", "dunkirk"]
  },
  {
    id: "dunkirk-ends",
    date: "1940-06-04",
    title: "敦刻尔克撤离结束",
    location: "敦刻尔克",
    coordinates: [2.38, 51.03],
    phase: "北部战役终局",
    summary: "撤离行动结束，数十万盟军士兵被转移到英国，法国北部战场基本结束。",
    detail:
      "撤离让英国保留了继续战争的人力基础，也留下了法国孤立面对德军第二阶段攻势的问题。",
    significance:
      "德军错失歼灭全部北部盟军的机会，但法国防线已被重创，后续红色方案面对的是更弱的法国防御。",
    mapFocus: ["dunkirk", "calais"]
  },
  {
    id: "fall-rot",
    date: "1940-06-05",
    title: "红色方案展开",
    location: "索姆河、埃纳河防线",
    coordinates: [2.85, 49.75],
    phase: "法国本土决战",
    summary: "德军转向法国纵深，攻击索姆河与埃纳河防线，法国试图用纵深支撑迟滞推进。",
    detail:
      "法国军队在缺少机动预备队和空中优势的条件下重新布防。德军从北部和东部多方向压迫，避免给法军恢复连续战线的时间。",
    significance:
      "红色方案把战役从北部合围转入国家崩溃阶段。法国政府和军队面临继续抵抗、撤往海外或停战的战略选择。",
    mapFocus: ["amiens", "reims", "paris"]
  },
  {
    id: "italy-enters",
    date: "1940-06-10",
    title: "意大利参战，法国政府撤离巴黎",
    location: "巴黎、阿尔卑斯边境",
    coordinates: [2.35, 48.86],
    phase: "政治压力",
    summary: "意大利对法宣战；法国政府离开巴黎，国家指挥重心南移。",
    detail:
      "虽然意大利在阿尔卑斯的军事影响有限，但政治冲击加重了法国的孤立感。巴黎被宣布为不设防城市。",
    significance:
      "法国战争目标开始从守住北部工业区转向保存国家与殖民资源，政府内部停战派影响上升。",
    mapFocus: ["paris", "lyon", "bordeaux"]
  },
  {
    id: "paris-falls",
    date: "1940-06-14",
    title: "巴黎陷落",
    location: "巴黎",
    coordinates: [2.35, 48.86],
    phase: "首都失守",
    summary: "德军进入巴黎，法国第三共和国的战争意志和行政连续性遭到沉重打击。",
    detail:
      "巴黎避免了大规模城市战破坏，但首都失守具有巨大象征意义。法国军队继续南撤，东部集团也遭到包抄威胁。",
    significance:
      "首都失守并非单一军事终点，却使停战谈判迅速成为政府内部现实选项。",
    mapFocus: ["paris", "reims", "rouen"]
  },
  {
    id: "petain",
    date: "1940-06-17",
    title: "贝当要求寻求停战",
    location: "波尔多",
    coordinates: [-0.58, 44.84],
    phase: "停战决策",
    summary: "贝当出任政府首脑后宣布寻求停战，戴高乐则准备从伦敦号召继续抵抗。",
    detail:
      "法国政府围绕本土继续作战、转移到北非或签署停战发生重大分歧。军事溃败与难民潮使停战派占上风。",
    significance:
      "这一天标志军事战役转为政治断裂：维希道路与自由法国道路开始分岔。",
    mapFocus: ["bordeaux", "paris"]
  },
  {
    id: "armistice-signed",
    date: "1940-06-22",
    title: "贡比涅停战协定签署",
    location: "贡比涅森林",
    coordinates: [2.83, 49.42],
    phase: "战役结束",
    summary: "法国与德国签署停战协定，法国被划分为占领区与维希政权控制区。",
    detail:
      "德国刻意选择一战停战车厢旧址，以制造象征性复仇。停战于6月25日生效，法国本土战役结束。",
    significance:
      "德法战役以德国快速胜利告终，也开启了英国孤军作战、法国抵抗运动和欧洲占领秩序的新阶段。",
    mapFocus: ["compiegne", "paris"]
  }
];

export const campaignStart = "1940-05-10";
export const campaignEnd = "1940-06-25";
