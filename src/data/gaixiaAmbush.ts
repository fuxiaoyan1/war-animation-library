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

export type GaixiaReliefSurface = {
  id: string;
  label: string;
  kind: "ridge" | "slope" | "lowland" | "corridor";
  elevation: number;
  baseElevation: number;
  points: Array<[number, number]>;
  labelCoordinates: [number, number];
  tacticalRole: "key-terrain" | "obstacle" | "avenue" | "camp-shelf";
};

export type GaixiaTacticalGraphic = {
  id: string;
  label: string;
  kind: "key-terrain" | "obstacle" | "avenue" | "engagement-area" | "blocking-line";
  points: Array<[number, number]>;
  labelCoordinates: [number, number];
  revealAt?: string;
};

export type GaixiaFortification = {
  id: string;
  label: string;
  coordinates: Array<[number, number]>;
  labelCoordinates: [number, number];
};

export type GaixiaFieldwork = {
  id: string;
  label: string;
  kind: "earthwork" | "ditch" | "gate" | "camp-line";
  coordinates: Array<[number, number]>;
  labelCoordinates: [number, number];
  revealAt?: string;
};

export type GaixiaFormation = {
  id: string;
  label: string;
  faction: Exclude<GaixiaFaction, "terrain">;
  kind: "infantry-block" | "cavalry-screen" | "crossbow-line" | "command-post" | "ambush-line";
  coordinates: Array<[number, number]>;
  labelCoordinates: [number, number];
  start: string;
  end?: string;
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
  labelOffset?: [number, number];
  unitOffsets?: Array<[number, number]>;
  unitVisibleUntil?: string;
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
  { id: "crossbow-ridge", label: "弩阵高地", coordinates: [117.5, 33.43], kind: "ridge" },
  { id: "east-gap", label: "东口诱隙", coordinates: [117.57, 33.3], kind: "pass" },
  { id: "south-marsh-mouth", label: "南侧洼地口", coordinates: [117.44, 33.16], kind: "pass" },
  { id: "yinling", label: "阴陵迷道", coordinates: [117.67, 33.14], kind: "pass" },
  { id: "pursuit-cutoff", label: "追击截口", coordinates: [117.71, 33.1], kind: "pass" },
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

export const terrainContours: Array<{ id: string; elevation: number; kind: "ridge" | "slope" | "lowland" | "corridor"; label: string; points: Array<[number, number]> }> = [
  { id: "north-bank-ridge", elevation: 38, kind: "ridge", label: "北岸岗脊", points: [[117.16, 33.48], [117.25, 33.54], [117.45, 33.56], [117.66, 33.5]] },
  { id: "gaixia-west-ridge", elevation: 40, kind: "ridge", label: "垓下西岗", points: [[117.26, 33.31], [117.34, 33.39], [117.43, 33.43]] },
  { id: "gaixia-east-ridge", elevation: 42, kind: "ridge", label: "垓下东岗", points: [[117.5, 33.42], [117.58, 33.34], [117.55, 33.25]] },
  { id: "camp-slope", elevation: 36, kind: "slope", label: "营垒缓坡", points: [[117.33, 33.3], [117.41, 33.37], [117.52, 33.38], [117.6, 33.31], [117.52, 33.24], [117.39, 33.24]] },
  { id: "south-lowland", elevation: 28, kind: "lowland", label: "南侧洼地", points: [[117.18, 33.13], [117.36, 33.19], [117.58, 33.16], [117.78, 33.09]] },
  { id: "east-breakout-corridor", elevation: 32, kind: "corridor", label: "东口通道", points: [[117.52, 33.3], [117.6, 33.26], [117.68, 33.18], [117.76, 33.1]] },
  { id: "yinling-pursuit-corridor", elevation: 30, kind: "corridor", label: "阴陵追击道", points: [[117.58, 33.22], [117.66, 33.16], [117.74, 33.08], [117.79, 33.04]] }
];

export const terrainReliefSurfaces: GaixiaReliefSurface[] = [
  {
    id: "north-bank-ridge",
    label: "北岸弩阵高地",
    kind: "ridge",
    elevation: 38,
    baseElevation: 27,
    tacticalRole: "key-terrain",
    labelCoordinates: [117.39, 33.52],
    points: [
      [117.14, 33.45],
      [117.23, 33.56],
      [117.47, 33.58],
      [117.69, 33.5],
      [117.58, 33.42],
      [117.31, 33.4]
    ]
  },
  {
    id: "gaixia-west-ridge",
    label: "西岗步兵压迫面",
    kind: "ridge",
    elevation: 40,
    baseElevation: 28,
    tacticalRole: "key-terrain",
    labelCoordinates: [117.34, 33.37],
    points: [
      [117.23, 33.29],
      [117.29, 33.43],
      [117.44, 33.45],
      [117.49, 33.37],
      [117.41, 33.29],
      [117.31, 33.25]
    ]
  },
  {
    id: "gaixia-east-ridge",
    label: "东岗弩骑控口面",
    kind: "ridge",
    elevation: 42,
    baseElevation: 28,
    tacticalRole: "key-terrain",
    labelCoordinates: [117.57, 33.33],
    points: [
      [117.48, 33.43],
      [117.63, 33.39],
      [117.66, 33.27],
      [117.57, 33.2],
      [117.48, 33.26],
      [117.45, 33.36]
    ]
  },
  {
    id: "camp-slope",
    label: "霸王城营垒台地",
    kind: "slope",
    elevation: 36,
    baseElevation: 28,
    tacticalRole: "camp-shelf",
    labelCoordinates: [117.45, 33.34],
    points: [
      [117.34, 33.29],
      [117.4, 33.39],
      [117.51, 33.39],
      [117.59, 33.31],
      [117.51, 33.23],
      [117.39, 33.24]
    ]
  },
  {
    id: "south-lowland",
    label: "南侧河汊低地",
    kind: "lowland",
    elevation: 28,
    baseElevation: 26,
    tacticalRole: "obstacle",
    labelCoordinates: [117.43, 33.15],
    points: [
      [117.14, 33.08],
      [117.34, 33.2],
      [117.58, 33.18],
      [117.8, 33.1],
      [117.78, 33.02],
      [117.38, 33.04]
    ]
  },
  {
    id: "east-breakout-corridor",
    label: "东口诱隙通道",
    kind: "corridor",
    elevation: 32,
    baseElevation: 27,
    tacticalRole: "avenue",
    labelCoordinates: [117.62, 33.23],
    points: [
      [117.49, 33.31],
      [117.57, 33.28],
      [117.66, 33.19],
      [117.77, 33.09],
      [117.73, 33.05],
      [117.58, 33.17],
      [117.5, 33.26]
    ]
  },
  {
    id: "yinling-pursuit-corridor",
    label: "阴陵追击走廊",
    kind: "corridor",
    elevation: 30,
    baseElevation: 26,
    tacticalRole: "avenue",
    labelCoordinates: [117.71, 33.09],
    points: [
      [117.58, 33.21],
      [117.67, 33.15],
      [117.79, 33.05],
      [117.81, 33.02],
      [117.75, 33.0],
      [117.64, 33.1],
      [117.55, 33.17]
    ]
  }
];

export const tacticalGraphics: GaixiaTacticalGraphic[] = [
  {
    id: "key-north-crossbow-ridge",
    label: "K1 北岸弩阵可控河岸",
    kind: "key-terrain",
    labelCoordinates: [117.44, 33.49],
    points: [
      [117.31, 33.5],
      [117.4, 33.49],
      [117.51, 33.44]
    ]
  },
  {
    id: "obstacle-old-channel",
    label: "O1 旧河汊限制南撤",
    kind: "obstacle",
    labelCoordinates: [117.5, 33.2],
    points: [
      [117.25, 33.23],
      [117.36, 33.27],
      [117.49, 33.25],
      [117.62, 33.18],
      [117.77, 33.12]
    ]
  },
  {
    id: "avenue-east-gap",
    label: "AA 东口突围通道",
    kind: "avenue",
    labelCoordinates: [117.63, 33.26],
    points: [
      [117.5, 33.32],
      [117.58, 33.29],
      [117.66, 33.2],
      [117.74, 33.1]
    ]
  },
  {
    id: "ea-east-gap",
    label: "EA 东口弩骑杀伤区",
    kind: "engagement-area",
    labelCoordinates: [117.58, 33.3],
    points: [
      [117.51, 33.34],
      [117.57, 33.36],
      [117.64, 33.29],
      [117.59, 33.25],
      [117.51, 33.28]
    ],
    revealAt: "BCE-0202-12-01T21:00"
  },
  {
    id: "bl-south-mouth",
    label: "BL 南口封锁线",
    kind: "blocking-line",
    labelCoordinates: [117.43, 33.25],
    points: [
      [117.39, 33.17],
      [117.43, 33.24],
      [117.46, 33.3]
    ],
    revealAt: "BCE-0202-12-01T21:50"
  },
  {
    id: "ea-dawn-pocket",
    label: "EA 黎明合击切割区",
    kind: "engagement-area",
    labelCoordinates: [117.47, 33.32],
    points: [
      [117.4, 33.36],
      [117.49, 33.38],
      [117.54, 33.31],
      [117.48, 33.27],
      [117.41, 33.3]
    ],
    revealAt: "BCE-0202-12-02T03:20"
  }
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

export const fieldworks: GaixiaFieldwork[] = [
  {
    id: "bawangcheng-outer-rampart",
    label: "外土垒",
    kind: "earthwork",
    labelCoordinates: [117.42, 33.397],
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
    id: "chu-inner-rampart",
    label: "内营土垒",
    kind: "earthwork",
    labelCoordinates: [117.455, 33.357],
    coordinates: [
      [117.407, 33.319],
      [117.442, 33.372],
      [117.497, 33.36],
      [117.512, 33.318],
      [117.468, 33.289],
      [117.42, 33.295]
    ]
  },
  {
    id: "west-camp-gate",
    label: "西营门",
    kind: "gate",
    labelCoordinates: [117.382, 33.35],
    coordinates: [
      [117.372, 33.348],
      [117.395, 33.36]
    ]
  },
  {
    id: "east-gap-gate",
    label: "东口营门",
    kind: "gate",
    labelCoordinates: [117.535, 33.326],
    coordinates: [
      [117.52, 33.34],
      [117.552, 33.315]
    ]
  },
  {
    id: "old-channel-ditch",
    label: "旧河汊壕沟",
    kind: "ditch",
    labelCoordinates: [117.49, 33.236],
    coordinates: [
      [117.25, 33.23],
      [117.36, 33.27],
      [117.48, 33.25],
      [117.6, 33.19],
      [117.77, 33.13]
    ]
  },
  {
    id: "han-forward-camp-line",
    label: "汉军前出营线",
    kind: "camp-line",
    labelCoordinates: [117.34, 33.41],
    coordinates: [
      [117.2, 33.36],
      [117.3, 33.41],
      [117.45, 33.44],
      [117.57, 33.39],
      [117.66, 33.31]
    ],
    revealAt: "BCE-0202-12-01T19:00"
  }
];

export const formations: GaixiaFormation[] = [
  {
    id: "chu-center-block",
    label: "楚中军步阵",
    faction: "chu",
    kind: "infantry-block",
    start: "BCE-0202-12-01T18:00",
    end: "BCE-0202-12-02T04:10",
    labelCoordinates: [117.455, 33.333],
    coordinates: [
      [117.42, 33.355],
      [117.462, 33.375],
      [117.497, 33.34],
      [117.468, 33.3],
      [117.425, 33.314]
    ]
  },
  {
    id: "chu-east-cavalry-screen",
    label: "楚骑东侧屏卫",
    faction: "chu",
    kind: "cavalry-screen",
    start: "BCE-0202-12-01T18:10",
    end: "BCE-0202-12-02T03:30",
    labelCoordinates: [117.535, 33.325],
    coordinates: [
      [117.5, 33.365],
      [117.535, 33.338],
      [117.555, 33.29]
    ]
  },
  {
    id: "chu-south-infantry-line",
    label: "楚南侧步阵",
    faction: "chu",
    kind: "infantry-block",
    start: "BCE-0202-12-01T18:20",
    end: "BCE-0202-12-01T22:00",
    labelCoordinates: [117.456, 33.268],
    coordinates: [
      [117.43, 33.294],
      [117.458, 33.282],
      [117.474, 33.25],
      [117.438, 33.244]
    ]
  },
  {
    id: "han-west-infantry-block",
    label: "汉西路步阵",
    faction: "han",
    kind: "infantry-block",
    start: "BCE-0202-12-01T17:00",
    labelCoordinates: [117.32, 33.365],
    coordinates: [
      [117.24, 33.335],
      [117.33, 33.385],
      [117.39, 33.365],
      [117.31, 33.325]
    ]
  },
  {
    id: "han-north-crossbow-line",
    label: "汉北岸弩阵",
    faction: "han",
    kind: "crossbow-line",
    start: "BCE-0202-12-01T17:30",
    labelCoordinates: [117.405, 33.49],
    coordinates: [
      [117.3, 33.52],
      [117.38, 33.5],
      [117.5, 33.44]
    ]
  },
  {
    id: "han-east-crossbow-line",
    label: "东口交叉弩网",
    faction: "han",
    kind: "crossbow-line",
    start: "BCE-0202-12-01T18:10",
    labelCoordinates: [117.61, 33.35],
    coordinates: [
      [117.68, 33.38],
      [117.61, 33.35],
      [117.51, 33.33]
    ]
  },
  {
    id: "han-southeast-cavalry-ambush",
    label: "东南伏骑阵",
    faction: "han",
    kind: "ambush-line",
    start: "BCE-0202-12-01T19:00",
    labelCoordinates: [117.63, 33.195],
    coordinates: [
      [117.75, 33.09],
      [117.67, 33.16],
      [117.58, 33.23]
    ]
  },
  {
    id: "han-command-post",
    label: "韩信中军",
    faction: "han",
    kind: "command-post",
    start: "BCE-0202-12-01T18:00",
    labelCoordinates: [117.31, 33.25],
    coordinates: [
      [117.29, 33.235],
      [117.335, 33.26],
      [117.31, 33.285],
      [117.265, 33.26]
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
    unitVisibleUntil: "BCE-0202-12-01T18:19",
    unitOffsets: [
      [0, 0],
      [-24, 18],
      [-44, -14]
    ],
    points: [
      [117.64, 33.52],
      [117.58, 33.48],
      [117.49, 33.4],
      [117.47, 33.39]
    ]
  },
  {
    id: "chu-camp-array-center",
    label: "楚军中军收拢成营阵",
    faction: "chu",
    unitKind: "chu-infantry",
    routeKind: "blockade",
    start: "BCE-0202-12-01T18:00",
    end: "BCE-0202-12-01T19:00",
    visibleUntil: "BCE-0202-12-02T04:20",
    labelOffset: [-122, -18],
    unitOffsets: [
      [0, 0],
      [22, -16],
      [-24, 16],
      [42, 16]
    ],
    points: [
      [117.47, 33.39],
      [117.45, 33.36],
      [117.45, 33.33],
      [117.46, 33.31]
    ]
  },
  {
    id: "chu-camp-array-east",
    label: "楚骑东侧屏卫",
    faction: "chu",
    unitKind: "chu-cavalry",
    routeKind: "blockade",
    start: "BCE-0202-12-01T18:10",
    end: "BCE-0202-12-01T19:10",
    visibleUntil: "BCE-0202-12-02T04:20",
    labelOffset: [16, -24],
    unitOffsets: [
      [0, 0],
      [26, 14]
    ],
    points: [
      [117.47, 33.38],
      [117.51, 33.36],
      [117.54, 33.33],
      [117.55, 33.3]
    ]
  },
  {
    id: "chu-camp-array-south",
    label: "楚军南侧步阵",
    faction: "chu",
    unitKind: "chu-infantry",
    routeKind: "blockade",
    start: "BCE-0202-12-01T18:20",
    end: "BCE-0202-12-01T19:20",
    visibleUntil: "BCE-0202-12-02T04:20",
    unitVisibleUntil: "BCE-0202-12-01T21:59",
    labelOffset: [-118, 22],
    unitOffsets: [
      [0, 0],
      [22, 14]
    ],
    points: [
      [117.45, 33.34],
      [117.45, 33.29],
      [117.46, 33.25]
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
    unitOffsets: [
      [0, 0],
      [-28, -14],
      [-48, 16]
    ],
    points: [
      [117.2, 33.34],
      [117.19, 33.35],
      [117.31, 33.37],
      [117.39, 33.36]
    ]
  },
  {
    id: "chu-west-counterpush",
    label: "楚军西侧外推试探",
    faction: "chu",
    unitKind: "chu-infantry",
    routeKind: "advance",
    start: "BCE-0202-12-01T19:20",
    end: "BCE-0202-12-01T20:10",
    visibleUntil: "BCE-0202-12-02T00:40",
    labelOffset: [-130, 18],
    unitOffsets: [
      [0, 0],
      [-24, 16]
    ],
    points: [
      [117.43, 33.35],
      [117.39, 33.35],
      [117.35, 33.35],
      [117.32, 33.36]
    ]
  },
  {
    id: "han-west-fallback",
    label: "汉西路后退稳住阵脚",
    faction: "han",
    unitKind: "han-infantry",
    routeKind: "retreat",
    start: "BCE-0202-12-01T20:05",
    end: "BCE-0202-12-01T20:45",
    visibleUntil: "BCE-0202-12-02T00:40",
    labelOffset: [-124, -22],
    unitOffsets: [
      [0, 0],
      [-24, -14],
      [-44, 16]
    ],
    points: [
      [117.39, 33.36],
      [117.35, 33.36],
      [117.31, 33.36],
      [117.28, 33.35]
    ]
  },
  {
    id: "han-west-counterpress",
    label: "汉西路重新压回",
    faction: "han",
    unitKind: "han-infantry",
    routeKind: "advance",
    start: "BCE-0202-12-01T20:45",
    end: "BCE-0202-12-01T22:10",
    visibleUntil: "BCE-0202-12-02T04:20",
    labelOffset: [-112, 24],
    unitOffsets: [
      [0, 0],
      [-24, -14],
      [-44, 16]
    ],
    points: [
      [117.28, 33.35],
      [117.32, 33.36],
      [117.36, 33.36],
      [117.41, 33.35]
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
    unitOffsets: [
      [0, 0],
      [-22, -16],
      [-42, 12]
    ],
    points: [
      [117.34, 33.53],
      [117.38, 33.51],
      [117.45, 33.44]
    ]
  },
  {
    id: "han-northwest-shield",
    label: "北西盾阵封住河岸",
    faction: "han",
    unitKind: "han-infantry",
    routeKind: "blockade",
    start: "BCE-0202-12-01T17:40",
    end: "BCE-0202-12-01T22:10",
    visibleUntil: "BCE-0202-12-02T04:20",
    labelOffset: [-82, -8],
    unitOffsets: [
      [0, 0],
      [-26, 14]
    ],
    points: [
      [117.22, 33.49],
      [117.29, 33.44],
      [117.36, 33.4],
      [117.41, 33.37]
    ]
  },
  {
    id: "han-east-crossbow-net",
    label: "东口弩兵交叉封锁",
    faction: "han",
    unitKind: "han-crossbow",
    routeKind: "blockade",
    start: "BCE-0202-12-01T18:10",
    end: "BCE-0202-12-01T22:40",
    visibleUntil: "BCE-0202-12-02T04:20",
    labelOffset: [12, -26],
    unitOffsets: [
      [0, 0],
      [24, -16]
    ],
    points: [
      [117.68, 33.38],
      [117.62, 33.35],
      [117.56, 33.32],
      [117.5, 33.33]
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
    visibleUntil: "BCE-0202-12-02T05:20",
    unitOffsets: [
      [0, 0],
      [-30, 16],
      [-58, -12]
    ],
    points: [
      [117.76, 33.36],
      [117.68, 33.32],
      [117.6, 33.29],
      [117.55, 33.28],
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
    visibleUntil: "BCE-0202-12-02T05:00",
    unitOffsets: [
      [0, 0],
      [24, 16]
    ],
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
    visibleUntil: "BCE-0202-12-02T06:40",
    labelOffset: [18, 22],
    unitOffsets: [
      [0, 0],
      [-28, 16],
      [-54, -12]
    ],
    points: [
      [117.78, 33.08],
      [117.67, 33.16],
      [117.6, 33.22],
      [117.54, 33.27],
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
    unitOffsets: [
      [0, 0],
      [-24, 14]
    ],
    points: [
      [117.22, 33.18],
      [117.31, 33.24],
      [117.39, 33.29],
      [117.43, 33.34]
    ]
  },
  {
    id: "han-feigned-gap-east",
    label: "东口诱隙牵出楚骑",
    faction: "han",
    unitKind: "han-cavalry",
    routeKind: "ambush",
    start: "BCE-0202-12-01T20:50",
    end: "BCE-0202-12-02T00:20",
    visibleUntil: "BCE-0202-12-02T04:20",
    labelOffset: [18, -30],
    unitOffsets: [
      [0, 0],
      [28, -12]
    ],
    points: [
      [117.61, 33.28],
      [117.56, 33.3],
      [117.52, 33.31],
      [117.49, 33.32]
    ]
  },
  {
    id: "chu-east-counterpush",
    label: "楚骑东口外推",
    faction: "chu",
    unitKind: "chu-cavalry",
    routeKind: "advance",
    start: "BCE-0202-12-01T20:40",
    end: "BCE-0202-12-01T21:20",
    visibleUntil: "BCE-0202-12-02T00:30",
    labelOffset: [18, 22],
    unitOffsets: [
      [0, 0],
      [-24, 14]
    ],
    points: [
      [117.5, 33.33],
      [117.54, 33.31],
      [117.58, 33.3],
      [117.61, 33.29]
    ]
  },
  {
    id: "han-east-cavalry-yield",
    label: "汉骑假退让出东口",
    faction: "han",
    unitKind: "han-cavalry",
    routeKind: "retreat",
    start: "BCE-0202-12-01T20:45",
    end: "BCE-0202-12-01T21:30",
    visibleUntil: "BCE-0202-12-02T00:30",
    labelOffset: [18, -28],
    unitOffsets: [
      [0, 0],
      [28, -12]
    ],
    points: [
      [117.5, 33.32],
      [117.55, 33.31],
      [117.6, 33.29],
      [117.64, 33.28]
    ]
  },
  {
    id: "chu-probe-east-gap",
    label: "楚骑试探东口诱隙",
    faction: "chu",
    unitKind: "chu-cavalry",
    routeKind: "breakout",
    start: "BCE-0202-12-01T21:10",
    end: "BCE-0202-12-01T22:30",
    visibleUntil: "BCE-0202-12-02T00:30",
    labelOffset: [16, 18],
    unitOffsets: [
      [0, 0],
      [-24, 16]
    ],
    points: [
      [117.47, 33.34],
      [117.53, 33.31],
      [117.58, 33.3],
      [117.52, 33.32],
      [117.47, 33.34]
    ]
  },
  {
    id: "han-east-counterpress",
    label: "汉弩骑合力压回东口",
    faction: "han",
    unitKind: "han-crossbow",
    routeKind: "blockade",
    start: "BCE-0202-12-01T21:30",
    end: "BCE-0202-12-01T22:40",
    visibleUntil: "BCE-0202-12-02T04:20",
    labelOffset: [16, -26],
    unitOffsets: [
      [0, 0],
      [24, 14],
      [-22, -14]
    ],
    points: [
      [117.64, 33.28],
      [117.59, 33.3],
      [117.54, 33.32],
      [117.49, 33.33]
    ]
  },
  {
    id: "chu-breakout-southeast",
    label: "项羽小股向东南突围",
    faction: "chu",
    unitKind: "chu-cavalry",
    routeKind: "breakout",
    start: "BCE-0202-12-02T04:20",
    end: "BCE-0202-12-02T06:20",
    visibleUntil: "BCE-0202-12-02T06:40",
    unitVisibleUntil: "BCE-0202-12-02T06:20",
    labelOffset: [14, 20],
    unitOffsets: [
      [0, 0],
      [-26, 12]
    ],
    points: [
      [117.45, 33.33],
      [117.52, 33.3],
      [117.6, 33.24],
      [117.65, 33.16],
      [117.72, 33.1]
    ]
  },
  {
    id: "chu-south-screen-recoil",
    label: "楚南侧步阵被压回",
    faction: "chu",
    unitKind: "chu-infantry",
    routeKind: "retreat",
    start: "BCE-0202-12-01T21:50",
    end: "BCE-0202-12-02T00:30",
    visibleUntil: "BCE-0202-12-02T04:20",
    labelOffset: [-120, 18],
    unitOffsets: [
      [0, 0],
      [22, 14]
    ],
    points: [
      [117.46, 33.25],
      [117.455, 33.28],
      [117.45, 33.31],
      [117.45, 33.33]
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
    unitOffsets: [
      [0, 0],
      [-22, -12]
    ],
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
    unitOffsets: [
      [0, 0],
      [22, -14]
    ],
    points: [
      [117.47, 33.45],
      [117.48, 33.41],
      [117.48, 33.37],
      [117.47, 33.34]
    ]
  },
  {
    id: "han-south-locking-line",
    label: "汉南路贴住楚南口",
    faction: "han",
    unitKind: "han-infantry",
    routeKind: "blockade",
    start: "BCE-0202-12-01T21:50",
    end: "BCE-0202-12-02T00:40",
    visibleUntil: "BCE-0202-12-02T05:00",
    labelOffset: [-116, 24],
    unitOffsets: [
      [0, 0],
      [24, 16],
      [-24, -14]
    ],
    points: [
      [117.42, 33.17],
      [117.43, 33.22],
      [117.445, 33.26],
      [117.455, 33.29]
    ]
  },
  {
    id: "han-tighten-east",
    label: "东侧弩骑反推楚军",
    faction: "han",
    unitKind: "han-crossbow",
    routeKind: "blockade",
    start: "BCE-0202-12-02T00:20",
    end: "BCE-0202-12-02T02:00",
    visibleUntil: "BCE-0202-12-02T04:20",
    labelOffset: [18, -18],
    unitOffsets: [
      [0, 0],
      [24, 14]
    ],
    points: [
      [117.57, 33.31],
      [117.54, 33.32],
      [117.51, 33.33],
      [117.48, 33.34]
    ]
  },
  {
    id: "han-night-east-gap-block",
    label: "东口汉骑横截冲围",
    faction: "han",
    unitKind: "han-cavalry",
    routeKind: "blockade",
    start: "BCE-0202-12-02T00:30",
    end: "BCE-0202-12-02T01:20",
    visibleUntil: "BCE-0202-12-02T04:20",
    labelOffset: [18, 24],
    unitOffsets: [
      [0, 0],
      [30, -14]
    ],
    points: [
      [117.63, 33.25],
      [117.6, 33.27],
      [117.57, 33.29],
      [117.54, 33.31]
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
    unitOffsets: [
      [0, 0],
      [-22, 14],
      [22, -12]
    ],
    points: [
      [117.46, 33.34],
      [117.52, 33.32],
      [117.56, 33.28],
      [117.51, 33.3],
      [117.46, 33.33]
    ]
  },
  {
    id: "han-song-cordons",
    label: "楚歌声线沿外营推进",
    faction: "han",
    unitKind: "han-crossbow",
    routeKind: "song",
    start: "BCE-0202-12-02T01:00",
    end: "BCE-0202-12-02T03:20",
    visibleUntil: "BCE-0202-12-02T04:20",
    labelOffset: [-120, 14],
    points: [
      [117.28, 33.42],
      [117.38, 33.39],
      [117.48, 33.36],
      [117.58, 33.33]
    ]
  },
  {
    id: "chu-camp-fragmentation",
    label: "楚军营内队列碎裂",
    faction: "chu",
    unitKind: "chu-infantry",
    routeKind: "retreat",
    start: "BCE-0202-12-02T02:20",
    end: "BCE-0202-12-02T04:10",
    visibleUntil: "BCE-0202-12-02T05:10",
    labelOffset: [-118, -18],
    unitOffsets: [
      [0, 0],
      [22, 14]
    ],
    points: [
      [117.5, 33.36],
      [117.47, 33.35],
      [117.45, 33.33],
      [117.43, 33.31]
    ]
  },
  {
    id: "han-dawn-assault-north",
    label: "北岸弩阵转入黎明合击",
    faction: "han",
    unitKind: "han-crossbow",
    routeKind: "advance",
    start: "BCE-0202-12-02T03:05",
    end: "BCE-0202-12-02T04:50",
    unitOffsets: [
      [0, 0],
      [24, -14]
    ],
    points: [
      [117.47, 33.45],
      [117.51, 33.42],
      [117.51, 33.39],
      [117.5, 33.35],
      [117.48, 33.32]
    ]
  },
  {
    id: "han-dawn-assault-south",
    label: "南路伏兵转入黎明合击",
    faction: "han",
    unitKind: "han-infantry",
    routeKind: "advance",
    start: "BCE-0202-12-02T03:10",
    end: "BCE-0202-12-02T05:00",
    unitOffsets: [
      [0, 0],
      [-22, 14]
    ],
    points: [
      [117.42, 33.08],
      [117.42, 33.14],
      [117.42, 33.2],
      [117.44, 33.25],
      [117.46, 33.29],
      [117.48, 33.32]
    ]
  },
  {
    id: "han-dawn-assault-west",
    label: "西路压回后割裂楚营",
    faction: "han",
    unitKind: "han-infantry",
    routeKind: "advance",
    start: "BCE-0202-12-02T03:10",
    end: "BCE-0202-12-02T05:05",
    labelOffset: [-116, 8],
    unitOffsets: [
      [0, 0],
      [-24, -14]
    ],
    points: [
      [117.31, 33.36],
      [117.35, 33.34],
      [117.39, 33.33],
      [117.43, 33.32],
      [117.48, 33.32]
    ]
  },
  {
    id: "han-dawn-cavalry-cutoff",
    label: "东南伏骑转入截断退路",
    faction: "han",
    unitKind: "han-cavalry",
    routeKind: "ambush",
    start: "BCE-0202-12-02T03:20",
    end: "BCE-0202-12-02T05:20",
    visibleUntil: "BCE-0202-12-02T06:40",
    labelOffset: [14, -24],
    unitOffsets: [
      [0, 0],
      [-30, 16]
    ],
    points: [
      [117.74, 33.12],
      [117.68, 33.18],
      [117.64, 33.24],
      [117.6, 33.24],
      [117.55, 33.28],
      [117.52, 33.3],
      [117.49, 33.3]
    ]
  },
  {
    id: "han-cavalry-pursuit-yinling",
    label: "东南截骑续追至阴陵",
    faction: "han",
    unitKind: "han-cavalry",
    routeKind: "pursuit",
    start: "BCE-0202-12-02T04:45",
    end: "BCE-0202-12-02T06:30",
    unitOffsets: [
      [0, 0],
      [-30, 16],
      [-58, -12]
    ],
    points: [
      [117.49, 33.3],
      [117.55, 33.28],
      [117.56, 33.27],
      [117.62, 33.21],
      [117.68, 33.14],
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
    unitVisibleUntil: "BCE-0202-12-02T07:05",
    unitOffsets: [
      [0, 0],
      [22, -14]
    ],
    points: [
      [117.72, 33.1],
      [117.75, 33.08],
      [117.73, 33.11],
      [117.76, 33.09]
    ]
  },
  {
    id: "chu-wujiang-final-flight",
    label: "项羽小股向乌江退走",
    faction: "chu",
    unitKind: "chu-command",
    routeKind: "breakout",
    start: "BCE-0202-12-02T07:05",
    end: "BCE-0202-12-02T08:00",
    visibleUntil: "BCE-0202-12-02T08:00",
    labelOffset: [16, -18],
    unitOffsets: [
      [0, 0],
      [22, -14]
    ],
    points: [
      [117.76, 33.09],
      [117.77, 33.07],
      [117.79, 33.045],
      [117.8, 33.035]
    ]
  },
  {
    id: "han-cavalry-pursuit-wujiang",
    label: "阴陵追骑续逼乌江方向",
    faction: "han",
    unitKind: "han-cavalry",
    routeKind: "pursuit",
    start: "BCE-0202-12-02T06:10",
    end: "BCE-0202-12-02T07:50",
    unitOffsets: [
      [0, 0],
      [-28, 16]
    ],
    points: [
      [117.68, 33.14],
      [117.72, 33.1],
      [117.74, 33.08],
      [117.755, 33.07],
      [117.775, 33.055]
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
    summary: "项羽主力退守沱河边高地，粮尽兵疲，外线机动空间急剧缩小，先抢占营垒准备整队。",
    detail: "动画以垓下遗址与沱河高地为战场中心，先显示楚军退入霸王城土垒，而不是一进来就碎裂。",
    significance: "楚军虽然仍有精锐骑兵，但已失去战略纵深。",
    routeIds: ["chu-retreat-gaixia"],
    cue: "melee"
  },
  {
    id: "chu-forms-camp-array",
    date: "BCE-0202-12-01T18:20",
    title: "楚军布成垓下营阵",
    phase: "入营列阵",
    location: "楚军内营",
    coordinates: [117.46, 33.33],
    summary: "退入垓下后，楚军先以步卒收拢中军，骑兵屏卫东侧，南侧步阵守住低地口。",
    detail: "这一步把楚军从行军退却状态转成可防守的营阵：中军收束、东侧骑兵屏卫、南侧步阵卡口，后面队列碎裂才有明确参照。",
    significance: "古代战场先有阵，再有阵形被压碎；否则十面埋伏只剩现代箭头式包围。",
    routeIds: ["chu-retreat-gaixia", "chu-camp-array-center", "chu-camp-array-east", "chu-camp-array-south"]
  },
  {
    id: "hanxin-deploys",
    date: "BCE-0202-12-01T19:00",
    title: "韩信布成合围态势",
    phase: "十面成形",
    location: "垓下外围",
    coordinates: [117.39, 33.29],
    summary: "韩信中军压住垓下西南，步兵、弩兵和骑兵分层封锁楚军营阵外缘。",
    detail: "楚军营阵仍然完整；汉军西路步兵、北岸弩兵、北西盾阵、东口弩网和中军指挥线同时出现：这不是一圈装饰线，而是外线封锁、弩阵压制和机动预备队的组合。",
    significance: "胜负关键不只是兵力多，而是封闭了楚军机动空间。",
    routeIds: [
      "chu-camp-array-center",
      "chu-camp-array-east",
      "chu-camp-array-south",
      "han-west-infantry",
      "han-north-crossbow",
      "han-northwest-shield",
      "han-east-crossbow-net",
      "han-command-center"
    ],
    cue: "melee"
  },
  {
    id: "west-counterpush-yield",
    date: "BCE-0202-12-01T20:15",
    title: "楚军西侧外推，汉军后退稳住",
    phase: "阵前拉扯",
    location: "垓下西侧",
    coordinates: [117.34, 33.36],
    summary: "楚军从营阵西侧向外推，汉军西路没有立刻硬顶到底，而是后退半步稳住阵脚。",
    detail: "西侧路线表现冷兵器战场常见的阵前拉扯：楚卒从营门外推，汉军步阵先退到预设位置，北西盾阵和弩兵仍压住侧翼，避免退却变成溃退。",
    significance: "合围不是单向推进；能承受反推并保持队列，才有后续压回的条件。",
    routeIds: ["chu-camp-array-center", "chu-west-counterpush", "han-west-infantry", "han-west-fallback", "han-northwest-shield", "han-north-crossbow"],
    cue: "melee"
  },
  {
    id: "han-counterpress-east-gap",
    date: "BCE-0202-12-01T21:00",
    title: "汉军西路再压回，东口诱隙展开",
    phase: "诱隙反压",
    location: "垓下西侧与东口",
    coordinates: [117.52, 33.31],
    summary: "汉军西路从后退位重新压回，同时东口骑兵有意让出缝隙，牵动楚骑外推。",
    detail: "西侧是步兵重新顶回去，东侧是骑兵假退和弩网等待。两边同步变化，说明汉军不是静态围城，而是在用预备队调动楚军阵势。",
    significance: "楚军还能局部外推，但每一次外推都在消耗阵形完整性。",
    routeIds: [
      "chu-camp-array-center",
      "chu-camp-array-east",
      "han-west-counterpress",
      "han-east-crossbow-net",
      "han-feigned-gap-east",
      "chu-east-counterpush",
      "han-east-cavalry-yield"
    ],
    cue: "melee"
  },
  {
    id: "ten-sided-ring",
    date: "BCE-0202-12-01T22:00",
    title: "十面伏兵完成闭合，东口诱隙被控",
    phase: "合围闭合",
    location: "垓下外围",
    coordinates: [117.52, 33.31],
    summary: "东、南、北多线伏兵收束，东口诱隙被弩骑反压回去，楚军营阵被迫缩回内线。",
    detail: "地形层显示河汊、壕沟与低洼地。合围不是静态画圈：东南骑兵、南路伏兵、东口诱隙、楚骑试探和汉弩骑反压共同说明，汉军在控制出口，而不是简单把楚军围成一个点。",
    significance: "包围态势从战略压力变成战术锁闭，并开始切碎楚军阵列。",
    routeIds: [
      "chu-camp-array-center",
      "chu-camp-array-east",
      "chu-camp-array-south",
      "han-east-cavalry",
      "han-south-infantry",
      "han-southeast-cavalry",
      "han-feigned-gap-east",
      "chu-probe-east-gap",
      "chu-south-screen-recoil",
      "han-west-counterpress",
      "han-east-counterpress",
      "han-tighten-west",
      "han-tighten-north",
      "han-south-locking-line"
    ],
    cue: "melee"
  },
  {
    id: "songs-of-chu",
    date: "BCE-0202-12-02T01:00",
    title: "四面楚歌瓦解军心",
    phase: "心理战",
    location: "楚军营垒",
    coordinates: [117.44, 33.35],
    summary: "夜色中楚歌从汉军营垒传来，楚军试图冲开东南口却被弩骑反推，营阵开始动摇。",
    detail: "音乐层与地图上的声波同向推进，同时显示楚军夜间冲围受阻和东侧弩骑反推。此时先表现军心动摇，不提前把营内队列画成已经碎裂。",
    significance: "战场从兵力对抗转入意志崩溃。",
    routeIds: [
      "han-command-center",
      "chu-camp-array-center",
      "chu-camp-array-east",
      "chu-camp-array-south",
      "han-tighten-west",
      "han-tighten-north",
      "han-south-locking-line",
      "han-tighten-east",
      "han-night-east-gap-block",
      "han-song-cordons",
      "chu-night-breakout-check"
    ],
    cue: "song"
  },
  {
    id: "farewell",
    date: "BCE-0202-12-02T02:30",
    title: "楚军营阵碎裂与霸王别姬",
    phase: "败局已定",
    location: "楚营",
    coordinates: [117.45, 33.34],
    summary: "楚歌之后，原本收拢的中军、东侧屏卫和南侧步阵无法保持整齐，项羽在楚营中诀别。",
    detail: "此处把早先布成的楚军营阵与营内碎裂线同时显示：碎裂不是突然出现，而是经过外推受阻、弩骑反压和楚歌动摇后的结果。",
    significance: "垓下之战的历史记忆由军事失败进入悲剧叙事，同时主力阵势已无法恢复。",
    routeIds: [
      "chu-camp-array-center",
      "chu-camp-array-east",
      "chu-camp-array-south",
      "chu-south-screen-recoil",
      "han-south-locking-line",
      "chu-night-breakout-check",
      "han-song-cordons",
      "chu-camp-fragmentation"
    ],
    cue: "song"
  },
  {
    id: "dawn-assault",
    date: "BCE-0202-12-02T04:20",
    title: "黎明合击与楚军溃散",
    phase: "决战收束",
    location: "垓下外围",
    coordinates: [117.49, 33.32],
    summary: "汉军从北、南、西三面切入，东南骑兵截断退路，楚军阵列被切碎后只剩项羽小股骑兵冲出。",
    detail: "多条伏击线同时高亮，表现“十面”不是同一方向重复推进，而是步兵切割、弩阵压制、骑兵截击同步收紧后逼出小股突围。",
    significance: "楚汉战争在战术层面进入不可逆结局。",
    routeIds: [
      "han-dawn-assault-north",
      "han-dawn-assault-south",
      "han-dawn-assault-west",
      "han-dawn-cavalry-cutoff",
      "chu-breakout-southeast",
      "han-cavalry-pursuit-yinling"
    ],
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
    summary: "项羽小股继续向乌江方向退走，汉军追击线压在后方，已无整军突围空间。",
    detail: "动画不把乌江位置画成考古级精确点，只用东南追逃关系表现最后压力来源：前方是项羽小股退走线，后方是汉骑追逼线。",
    significance: "没有后续追击，垓下便不足以解释项羽终局；追击线补上了军事因果。",
    routeIds: ["chu-wujiang-final-flight", "han-cavalry-pursuit-wujiang"],
    cue: "melee"
  }
];

export const narrationCues: GaixiaNarrationCue[] = [
  {
    id: "terrain",
    start: "BCE-0202-12-01T16:00",
    end: "BCE-0202-12-01T19:00",
    title: "第一幕 / 河边高地",
    text: "垓下在沱河边高地上，周围河汊、壕沟和低洼地限制大军展开。楚军退入这里后先收拢中军、屏卫东侧、卡住南口，后面的碎裂才有阵形参照。"
  },
  {
    id: "ring",
    start: "BCE-0202-12-01T19:00",
    end: "BCE-0202-12-02T01:00",
    title: "第二幕 / 阵前拉扯",
    text: "韩信把步兵、盾阵、弩兵、骑兵分成多层封锁线。楚军西侧外推，汉军后退稳住再压回；东口假退诱出楚骑，再由弩骑合力压回。"
  },
  {
    id: "song",
    start: "BCE-0202-12-02T01:00",
    end: "BCE-0202-12-02T04:20",
    title: "第三幕 / 四面楚歌",
    text: "夜色和民乐主题进入战场。楚歌瓦解军心，楚军夜间冲围被弩骑压回，先前布成的营阵开始碎裂，包围圈从地形与兵力延伸到军心。"
  },
  {
    id: "breakout",
    start: "BCE-0202-12-02T04:20",
    end: "BCE-0202-12-02T08:00",
    title: "终幕 / 追击至乌江",
    text: "黎明后汉军北、南、西三面切入，东南骑兵截断退路。项羽小股突围后仍被汉骑追击，东城快战与乌江终局接上垓下的军事因果。"
  }
];

export const cueEventIds = new Set(battleEvents.filter((event) => event.cue === "melee").map((event) => event.id));
