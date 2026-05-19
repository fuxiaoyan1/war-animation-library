export const campaignStart = "BCE-0202-12-01T16:00";
export const campaignEnd = "BCE-0202-12-02T08:00";

export type GaixiaFaction = "han" | "chu" | "terrain";
export type GaixiaUnitKind = "han-infantry" | "han-cavalry" | "han-crossbow" | "chu-infantry" | "chu-cavalry" | "chu-command";

export type GaixiaPoint = {
  id: string;
  label: string;
  coordinates: [number, number];
  kind: "camp" | "city" | "river" | "ridge" | "pass";
};

export type GaixiaRegionKind = "han-ring" | "chu-pocket" | "terrain" | "commandery";

export type GaixiaRegion = {
  id: string;
  label: string;
  coordinates: Array<[number, number]>;
  labelCoordinates: [number, number];
  kind: GaixiaRegionKind;
};

export type GaixiaTerrainLabel = {
  id: string;
  label: string;
  coordinates: [number, number];
  kind: "high-ground" | "lowland" | "old-channel" | "camp" | "approach";
};

export type GaixiaFortification = {
  id: string;
  label: string;
  coordinates: Array<[number, number]>;
  labelCoordinates: [number, number];
};

export type GaixiaAmbushSector = {
  id: string;
  label: string;
  points: Array<[number, number]>;
  side: "north" | "east" | "south" | "west";
};

export type GaixiaRoute = {
  id: string;
  label: string;
  faction: Exclude<GaixiaFaction, "terrain">;
  unitKind: GaixiaUnitKind;
  start: string;
  end: string;
  points: Array<[number, number]>;
  routeKind: "advance" | "blockade" | "ambush" | "retreat" | "breakout" | "pursuit" | "song";
  visibleUntil?: string;
};

export type GaixiaEvent = {
  id: string;
  date: string;
  title: string;
  phase: string;
  location: string;
  coordinates: [number, number];
  summary: string;
  detail: string;
  significance: string;
  routeIds: string[];
  cue?: "melee" | "song";
};

export type GaixiaNarrationCue = {
  id: string;
  start: string;
  end: string;
  title: string;
  text: string;
};

export const mapPoints: GaixiaPoint[] = [
  { id: "gaixia", label: "垓下 / 霸王城", coordinates: [117.44, 33.35], kind: "camp" },
  { id: "tuo-river", label: "沱河（古洨水）", coordinates: [117.43, 33.47], kind: "river" },
  { id: "haocheng", label: "濠城", coordinates: [117.38, 33.29], kind: "city" },
  { id: "lingbi", label: "灵璧方向", coordinates: [117.55, 33.55], kind: "city" },
  { id: "guzhen", label: "固镇方向", coordinates: [117.28, 33.18], kind: "city" },
  { id: "jiuli", label: "九里山战场意象", coordinates: [117.54, 33.38], kind: "ridge" },
  { id: "yinling", label: "阴陵迷道", coordinates: [117.67, 33.14], kind: "pass" },
  { id: "dongcheng", label: "东城快战", coordinates: [117.74, 33.09], kind: "pass" },
  { id: "wujiang-road", label: "向乌江突围方向", coordinates: [117.78, 33.04], kind: "pass" }
];

export const historicalRegions: GaixiaRegion[] = [
  {
    id: "sishui-commandery",
    label: "秦属泗水郡旧界",
    kind: "commandery",
    labelCoordinates: [117.25, 33.55],
    coordinates: [
      [117.12, 33.58],
      [117.8, 33.58],
      [117.8, 33.0],
      [117.12, 33.0]
    ]
  },
  {
    id: "han-outer-ring",
    label: "汉军合围态势",
    kind: "han-ring",
    labelCoordinates: [117.3, 33.51],
    coordinates: [
      [117.08, 33.28],
      [117.22, 33.56],
      [117.55, 33.58],
      [117.76, 33.38],
      [117.74, 33.08],
      [117.43, 33.04]
    ]
  },
  {
    id: "chu-pocket",
    label: "楚军垓下营垒",
    kind: "chu-pocket",
    labelCoordinates: [117.49, 33.31],
    coordinates: [
      [117.32, 33.24],
      [117.37, 33.42],
      [117.52, 33.44],
      [117.62, 33.32],
      [117.54, 33.19],
      [117.39, 33.18]
    ]
  },
  {
    id: "river-high-ground",
    label: "沱河南岸岗地",
    kind: "terrain",
    labelCoordinates: [117.34, 33.44],
    coordinates: [
      [117.18, 33.38],
      [117.24, 33.53],
      [117.52, 33.58],
      [117.68, 33.48],
      [117.58, 33.38],
      [117.34, 33.34]
    ]
  }
];

export const rivers: Array<{ id: string; label: string; points: Array<[number, number]> }> = [
  {
    id: "tuo",
    label: "沱河 / 古洨水",
    points: [
      [117.12, 33.52],
      [117.18, 33.49],
      [117.33, 33.47],
      [117.48, 33.49],
      [117.62, 33.45],
      [117.8, 33.42]
    ]
  },
  {
    id: "hao",
    label: "壕沟与旧河汊",
    points: [
      [117.25, 33.23],
      [117.36, 33.27],
      [117.48, 33.25],
      [117.6, 33.19],
      [117.77, 33.13]
    ]
  }
];

export const terrainContours: Array<{ id: string; elevation: number; points: Array<[number, number]> }> = [
  { id: "north-bank-34", elevation: 34, points: [[117.14, 33.49], [117.24, 33.55], [117.45, 33.56], [117.7, 33.48]] },
  { id: "north-bank-38", elevation: 38, points: [[117.18, 33.44], [117.35, 33.51], [117.54, 33.52], [117.68, 33.44]] },
  { id: "gaixia-rise-36", elevation: 36, points: [[117.25, 33.32], [117.36, 33.43], [117.52, 33.43], [117.66, 33.34], [117.55, 33.22], [117.36, 33.22]] },
  { id: "gaixia-rise-42", elevation: 42, points: [[117.34, 33.31], [117.41, 33.39], [117.52, 33.39], [117.58, 33.32], [117.52, 33.25], [117.4, 33.25]] },
  { id: "south-lowland-28", elevation: 28, points: [[117.18, 33.13], [117.36, 33.19], [117.58, 33.16], [117.78, 33.09]] },
  { id: "east-breakout-32", elevation: 32, points: [[117.53, 33.28], [117.64, 33.23], [117.76, 33.14]] },
  { id: "pursuit-road-30", elevation: 30, points: [[117.58, 33.22], [117.68, 33.14], [117.78, 33.05]] }
];

export const terrainLabels: GaixiaTerrainLabel[] = [
  { id: "north-bank", label: "北岸岗坡", coordinates: [117.35, 33.52], kind: "high-ground" },
  { id: "south-channel", label: "旧河汊低地", coordinates: [117.56, 33.18], kind: "old-channel" },
  { id: "gaixia-rise", label: "垓下高地", coordinates: [117.48, 33.39], kind: "high-ground" },
  { id: "chu-camp", label: "霸王城土垒", coordinates: [117.44, 33.35], kind: "camp" },
  { id: "yinling-road", label: "阴陵迷道", coordinates: [117.68, 33.14], kind: "approach" },
  { id: "wujiang-exit", label: "乌江方向", coordinates: [117.78, 33.06], kind: "approach" },
  { id: "south-lowland", label: "南侧洼地", coordinates: [117.35, 33.14], kind: "lowland" }
];

export const campFortifications: GaixiaFortification[] = [
  {
    id: "bawangcheng",
    label: "霸王城",
    labelCoordinates: [117.445, 33.355],
    coordinates: [
      [117.365, 33.302],
      [117.425, 33.415],
      [117.515, 33.392],
      [117.548, 33.316],
      [117.482, 33.252],
      [117.395, 33.265]
    ]
  },
  {
    id: "inner-camp",
    label: "楚军内营",
    labelCoordinates: [117.455, 33.302],
    coordinates: [
      [117.407, 33.319],
      [117.442, 33.372],
      [117.497, 33.36],
      [117.512, 33.318],
      [117.468, 33.289],
      [117.42, 33.295]
    ]
  }
];

export const ambushSectors: GaixiaAmbushSector[] = [
  { id: "northwest-screen", label: "北西封锁", side: "north", points: [[117.18, 33.49], [117.27, 33.43], [117.36, 33.4]] },
  { id: "north-river-screen", label: "北岸弩阵", side: "north", points: [[117.36, 33.55], [117.43, 33.48], [117.49, 33.42]] },
  { id: "east-cavalry-screen", label: "东侧骑兵", side: "east", points: [[117.72, 33.38], [117.64, 33.34], [117.54, 33.33]] },
  { id: "southeast-ambush", label: "东南伏兵", side: "east", points: [[117.72, 33.16], [117.62, 33.22], [117.53, 33.29]] },
  { id: "south-closing-line", label: "南路收束", side: "south", points: [[117.39, 33.07], [117.42, 33.18], [117.45, 33.28]] },
  { id: "west-command-line", label: "西侧中军", side: "west", points: [[117.16, 33.27], [117.28, 33.3], [117.38, 33.34]] }
];

export const routes: GaixiaRoute[] = [
  {
    id: "chu-retreat-gaixia",
    label: "项羽主力退守垓下",
    faction: "chu",
    unitKind: "chu-command",
    routeKind: "retreat",
    start: "BCE-0202-12-01T16:00",
    end: "BCE-0202-12-01T18:00",
    points: [
      [117.68, 33.56],
      [117.58, 33.48],
      [117.49, 33.4],
      [117.47, 33.39]
    ]
  },
  {
    id: "han-west-infantry",
    label: "汉军西路步兵压入",
    faction: "han",
    unitKind: "han-infantry",
    routeKind: "advance",
    start: "BCE-0202-12-01T17:00",
    end: "BCE-0202-12-01T21:00",
    points: [
      [117.08, 33.34],
      [117.19, 33.35],
      [117.31, 33.37],
      [117.39, 33.36]
    ]
  },
  {
    id: "han-north-crossbow",
    label: "北岸弩兵封锁沱河",
    faction: "han",
    unitKind: "han-crossbow",
    routeKind: "blockade",
    start: "BCE-0202-12-01T17:30",
    end: "BCE-0202-12-01T22:00",
    points: [
      [117.31, 33.58],
      [117.38, 33.51],
      [117.45, 33.44]
    ]
  },
  {
    id: "han-east-cavalry",
    label: "灌婴骑兵切断东南",
    faction: "han",
    unitKind: "han-cavalry",
    routeKind: "ambush",
    start: "BCE-0202-12-01T18:20",
    end: "BCE-0202-12-01T22:30",
    visibleUntil: "BCE-0202-12-02T04:00",
    points: [
      [117.76, 33.36],
      [117.68, 33.32],
      [117.57, 33.31],
      [117.5, 33.32]
    ]
  },
  {
    id: "han-south-infantry",
    label: "南路伏兵收束",
    faction: "han",
    unitKind: "han-infantry",
    routeKind: "ambush",
    start: "BCE-0202-12-01T18:40",
    end: "BCE-0202-12-01T23:00",
    points: [
      [117.42, 33.03],
      [117.44, 33.14],
      [117.45, 33.26],
      [117.45, 33.33]
    ]
  },
  {
    id: "han-southeast-cavalry",
    label: "东南骑兵伏击线",
    faction: "han",
    unitKind: "han-cavalry",
    routeKind: "ambush",
    start: "BCE-0202-12-01T19:00",
    end: "BCE-0202-12-02T00:30",
    points: [
      [117.78, 33.08],
      [117.67, 33.16],
      [117.57, 33.24],
      [117.5, 33.3]
    ]
  },
  {
    id: "han-command-center",
    label: "韩信中军指挥线",
    faction: "han",
    unitKind: "han-crossbow",
    routeKind: "advance",
    start: "BCE-0202-12-01T18:00",
    end: "BCE-0202-12-02T01:00",
    points: [
      [117.22, 33.18],
      [117.31, 33.24],
      [117.39, 33.29],
      [117.43, 33.34]
    ]
  },
  {
    id: "chu-breakout-southeast",
    label: "项羽小股向东南突围",
    faction: "chu",
    unitKind: "chu-cavalry",
    routeKind: "breakout",
    start: "BCE-0202-12-02T04:20",
    end: "BCE-0202-12-02T05:30",
    visibleUntil: "BCE-0202-12-02T06:40",
    points: [
      [117.45, 33.33],
      [117.55, 33.25],
      [117.65, 33.16],
      [117.72, 33.1]
    ]
  },
  {
    id: "han-tighten-west",
    label: "西北步兵压缩楚营",
    faction: "han",
    unitKind: "han-infantry",
    routeKind: "advance",
    start: "BCE-0202-12-01T22:10",
    end: "BCE-0202-12-02T00:40",
    points: [
      [117.32, 33.39],
      [117.37, 33.38],
      [117.41, 33.36],
      [117.44, 33.35]
    ]
  },
  {
    id: "han-tighten-north",
    label: "北岸弩阵南压",
    faction: "han",
    unitKind: "han-crossbow",
    routeKind: "blockade",
    start: "BCE-0202-12-01T22:20",
    end: "BCE-0202-12-02T00:50",
    points: [
      [117.47, 33.45],
      [117.48, 33.41],
      [117.48, 33.37],
      [117.47, 33.34]
    ]
  },
  {
    id: "chu-night-breakout-check",
    label: "楚军夜间冲围受阻",
    faction: "chu",
    unitKind: "chu-infantry",
    routeKind: "breakout",
    start: "BCE-0202-12-02T00:40",
    end: "BCE-0202-12-02T02:10",
    visibleUntil: "BCE-0202-12-02T04:20",
    points: [
      [117.46, 33.34],
      [117.52, 33.32],
      [117.56, 33.28],
      [117.51, 33.3],
      [117.46, 33.33]
    ]
  },
  {
    id: "han-dawn-assault-north",
    label: "黎明北路合击",
    faction: "han",
    unitKind: "han-crossbow",
    routeKind: "advance",
    start: "BCE-0202-12-02T03:40",
    end: "BCE-0202-12-02T04:50",
    points: [
      [117.52, 33.43],
      [117.51, 33.39],
      [117.5, 33.35],
      [117.48, 33.32]
    ]
  },
  {
    id: "han-dawn-assault-south",
    label: "黎明南路合击",
    faction: "han",
    unitKind: "han-infantry",
    routeKind: "advance",
    start: "BCE-0202-12-02T03:50",
    end: "BCE-0202-12-02T05:00",
    points: [
      [117.42, 33.2],
      [117.44, 33.25],
      [117.46, 33.29],
      [117.48, 33.32]
    ]
  },
  {
    id: "han-cavalry-pursuit-yinling",
    label: "汉骑追至阴陵",
    faction: "han",
    unitKind: "han-cavalry",
    routeKind: "pursuit",
    start: "BCE-0202-12-02T05:10",
    end: "BCE-0202-12-02T06:30",
    points: [
      [117.5, 33.31],
      [117.58, 33.24],
      [117.66, 33.16],
      [117.72, 33.1]
    ]
  },
  {
    id: "chu-dongcheng-last-stand",
    label: "项羽东城快战",
    faction: "chu",
    unitKind: "chu-command",
    routeKind: "breakout",
    start: "BCE-0202-12-02T06:20",
    end: "BCE-0202-12-02T07:10",
    visibleUntil: "BCE-0202-12-02T08:00",
    points: [
      [117.72, 33.1],
      [117.75, 33.08],
      [117.73, 33.11],
      [117.76, 33.09]
    ]
  },
  {
    id: "han-cavalry-pursuit-wujiang",
    label: "汉骑追逼乌江方向",
    faction: "han",
    unitKind: "han-cavalry",
    routeKind: "pursuit",
    start: "BCE-0202-12-02T06:35",
    end: "BCE-0202-12-02T07:50",
    points: [
      [117.66, 33.16],
      [117.72, 33.1],
      [117.76, 33.07],
      [117.79, 33.04]
    ]
  }
];

export const battleEvents: GaixiaEvent[] = [
  {
    id: "chu-arrives-gaixia",
    date: "BCE-0202-12-01T16:00",
    title: "楚军退至垓下",
    phase: "疲师入围",
    location: "垓下城垒",
    coordinates: [117.44, 33.35],
    summary: "项羽主力退守沱河边高地，粮尽兵疲，外线机动空间急剧缩小。",
    detail: "动画以垓下遗址与沱河高地为战场中心，先显示楚军据高地扎营，再显示汉军从多方向逼近。",
    significance: "楚军虽然仍有精锐骑兵，但已失去战略纵深。",
    routeIds: ["chu-retreat-gaixia"],
    cue: "melee"
  },
  {
    id: "hanxin-deploys",
    date: "BCE-0202-12-01T18:00",
    title: "韩信布成合围态势",
    phase: "十面成形",
    location: "垓下外围",
    coordinates: [117.39, 33.29],
    summary: "韩信中军压住垓下西南，步兵、弩兵和骑兵分层封锁楚军可能突围方向。",
    detail: "蓝色高架趋势线表示汉军外线，红色线表示楚军退守与突围方向，避免把十面埋伏画成单一箭头。",
    significance: "胜负关键不只是兵力多，而是封闭了楚军机动空间。",
    routeIds: ["han-west-infantry", "han-north-crossbow", "han-command-center"],
    cue: "melee"
  },
  {
    id: "ten-sided-ring",
    date: "BCE-0202-12-01T22:00",
    title: "十面伏兵完成闭合",
    phase: "合围闭合",
    location: "垓下外围",
    coordinates: [117.5, 33.32],
    summary: "东、南、北多线伏兵收束，楚营被压在沱河高地与沟洫之间，随后包围圈继续向内压缩。",
    detail: "地形层显示河汊、壕沟与低洼地。合围不是静态画圈，汉军还要持续缩小楚军整队和冲围的空间。",
    significance: "包围态势从战略压力变成战术锁闭，并开始切碎楚军阵列。",
    routeIds: ["han-east-cavalry", "han-south-infantry", "han-southeast-cavalry", "han-tighten-west", "han-tighten-north"],
    cue: "melee"
  },
  {
    id: "songs-of-chu",
    date: "BCE-0202-12-02T01:00",
    title: "四面楚歌瓦解军心",
    phase: "心理战",
    location: "楚军营垒",
    coordinates: [117.44, 33.35],
    summary: "夜色中楚歌从汉军营垒传来，楚军试图冲开东南口却被压回营垒，士气进一步崩解。",
    detail: "音乐层与地图上的声波同向推进，同时显示楚军夜间冲围受阻，突出十面埋伏既是空间合围，也是心理合围。",
    significance: "战场从兵力对抗转入意志崩溃。",
    routeIds: ["han-command-center", "han-tighten-west", "han-tighten-north", "chu-night-breakout-check"],
    cue: "song"
  },
  {
    id: "farewell",
    date: "BCE-0202-12-02T02:30",
    title: "霸王别姬",
    phase: "败局已定",
    location: "楚营",
    coordinates: [117.45, 33.34],
    summary: "项羽在楚营中诀别，仍保留突围意志，但主力已无法恢复。",
    detail: "此处不以爆炸表现，而以楚军营垒暗红光和民乐主题表现败军夜色。",
    significance: "垓下之战的历史记忆由军事失败进入悲剧叙事。",
    routeIds: ["chu-night-breakout-check"],
    cue: "song"
  },
  {
    id: "dawn-assault",
    date: "BCE-0202-12-02T04:20",
    title: "黎明合击与楚军溃散",
    phase: "决战收束",
    location: "垓下外围",
    coordinates: [117.49, 33.32],
    summary: "汉军多线压缩包围圈，楚军阵列被切碎，项羽率少数骑兵冲出，汉骑随即咬住追击。",
    detail: "多条伏击线同时高亮，表现“十面”不是同一方向重复推进，而是多个封锁口同步收紧后逼出小股突围。",
    significance: "楚汉战争在战术层面进入不可逆结局。",
    routeIds: ["han-dawn-assault-north", "han-dawn-assault-south", "chu-breakout-southeast", "han-cavalry-pursuit-yinling"],
    cue: "melee"
  },
  {
    id: "xiangyu-breakout",
    date: "BCE-0202-12-02T05:30",
    title: "项羽率骑兵东南突围",
    phase: "残局突围",
    location: "阴陵方向",
    coordinates: [117.69, 33.13],
    summary: "楚军主力已散，项羽率小股骑兵向东南冲出，汉骑沿阴陵方向追上。",
    detail: "红色突围线只保留小股骑兵，蓝色追击线随后压上，避免把突围画成无人阻拦的离场。",
    significance: "突围不是脱离战场，而是进入被追击的残局。",
    routeIds: ["chu-breakout-southeast", "han-cavalry-pursuit-yinling"],
    cue: "melee"
  },
  {
    id: "dongcheng-last-stand",
    date: "BCE-0202-12-02T06:50",
    title: "东城快战与汉骑追逼",
    phase: "追击收束",
    location: "东城至乌江方向",
    coordinates: [117.75, 33.08],
    summary: "项羽小股骑兵边战边退，汉骑追逼至乌江方向，突围空间被彻底压缩。",
    detail: "此段补出追击线，说明项羽不是自由撤离，而是在连续追击和截击中走向终局。",
    significance: "追击把垓下战术胜利转化为西楚主力的最终覆灭。",
    routeIds: ["chu-dongcheng-last-stand", "han-cavalry-pursuit-wujiang"],
    cue: "melee"
  },
  {
    id: "wujiang-end",
    date: "BCE-0202-12-02T07:50",
    title: "乌江方向终局",
    phase: "霸王自刎",
    location: "乌江方向",
    coordinates: [117.79, 33.04],
    summary: "汉军追击线压至乌江方向，项羽已无整军突围空间，垓下战役进入悲剧终点。",
    detail: "动画不把乌江位置画成考古级精确点，只用东南追击方向表现最后压力来源。",
    significance: "没有后续追击，垓下便不足以解释项羽终局；追击线补上了军事因果。",
    routeIds: ["han-cavalry-pursuit-wujiang"],
    cue: "melee"
  }
];

export const narrationCues: GaixiaNarrationCue[] = [
  {
    id: "terrain",
    start: "BCE-0202-12-01T16:00",
    end: "BCE-0202-12-01T18:00",
    title: "第一幕 / 河边高地",
    text: "垓下在沱河边高地上，周围河汊、壕沟和低洼地限制大军展开。楚军退入这里，已经不是主动选战场。"
  },
  {
    id: "ring",
    start: "BCE-0202-12-01T18:00",
    end: "BCE-0202-12-02T01:00",
    title: "第二幕 / 十面成形",
    text: "韩信把步兵、弩兵、骑兵分成多层封锁线。合围成型后，西北和北岸继续内压，东南骑兵守住突围口。"
  },
  {
    id: "song",
    start: "BCE-0202-12-02T01:00",
    end: "BCE-0202-12-02T04:20",
    title: "第三幕 / 四面楚歌",
    text: "夜色和民乐主题进入战场。楚歌瓦解军心，楚军夜间冲围被压回，包围圈从地形与兵力延伸到军心。"
  },
  {
    id: "breakout",
    start: "BCE-0202-12-02T04:20",
    end: "BCE-0202-12-02T08:00",
    title: "终幕 / 追击至乌江",
    text: "黎明后汉军合击，楚军主力溃散。项羽小股突围后仍被汉骑追击，东城快战与乌江终局接上垓下的军事因果。"
  }
];

export const cueEventIds = new Set(battleEvents.filter((event) => event.cue === "melee").map((event) => event.id));
