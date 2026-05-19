export const campaignStart = "1942-06-04T04:30";
export const campaignEnd = "1942-06-07T06:00";

export type MidwayFaction = "us" | "japan" | "midway";

export type MidwayCarrierId =
  | "enterprise"
  | "hornet"
  | "yorktown"
  | "akagi"
  | "kaga"
  | "soryu"
  | "hiryu";

export type TacticalPoint = {
  id: string;
  label: string;
  coordinates: [number, number];
  kind: "base" | "carrier" | "damage" | "sinking" | "reference";
};

export type CarrierTrackPoint = {
  date: string;
  coordinates: [number, number];
};

export type Carrier = {
  id: MidwayCarrierId;
  asset: string;
  faction: Exclude<MidwayFaction, "midway">;
  formationId: "us-tf16" | "us-tf17" | "japan-kido-butai" | "japan-hiryu";
  formationOffset?: [number, number];
  label: string;
  shortName: string;
  defaultFacing: "east" | "west";
  track: CarrierTrackPoint[];
  damagedAt?: string;
  sunkAt?: string;
  sunkPoint: [number, number];
  sunkLabel: string;
};

const usTf16Track: CarrierTrackPoint[] = [
  { date: "1942-06-04T04:30", coordinates: [185.35, 32.05] },
  { date: "1942-06-04T07:00", coordinates: [184.85, 31.86] },
  { date: "1942-06-04T10:25", coordinates: [184.22, 31.48] },
  { date: "1942-06-04T15:30", coordinates: [183.9, 31.28] },
  { date: "1942-06-05T05:00", coordinates: [183.92, 31.12] },
  { date: "1942-06-07T06:00", coordinates: [184.78, 31.62] }
];

const yorktownTf17Track: CarrierTrackPoint[] = [
  { date: "1942-06-04T04:30", coordinates: [184.88, 31.42] },
  { date: "1942-06-04T07:00", coordinates: [184.55, 31.22] },
  { date: "1942-06-04T10:25", coordinates: [184.02, 30.9] },
  { date: "1942-06-04T12:20", coordinates: [183.78, 30.72] },
  { date: "1942-06-04T14:45", coordinates: [183.55, 30.58] },
  { date: "1942-06-06T13:31", coordinates: [183.18, 30.33] },
  { date: "1942-06-07T06:00", coordinates: [183.05, 30.25] }
];

const kidoButaiTrack: CarrierTrackPoint[] = [
  { date: "1942-06-04T04:30", coordinates: [178.15, 31.22] },
  { date: "1942-06-04T06:20", coordinates: [178.86, 31.02] },
  { date: "1942-06-04T07:10", coordinates: [179.28, 30.66] },
  { date: "1942-06-04T08:30", coordinates: [179.0, 30.36] },
  { date: "1942-06-04T09:40", coordinates: [179.56, 30.78] },
  { date: "1942-06-04T10:26", coordinates: [179.88, 30.62] },
  { date: "1942-06-04T19:25", coordinates: [179.68, 30.48] },
  { date: "1942-06-05T05:00", coordinates: [179.72, 30.72] }
];

const hiryuManeuverTrack: CarrierTrackPoint[] = [
  { date: "1942-06-04T04:30", coordinates: [178.05, 31.56] },
  { date: "1942-06-04T07:00", coordinates: [178.58, 31.28] },
  { date: "1942-06-04T10:25", coordinates: [179.12, 31.02] },
  { date: "1942-06-04T12:20", coordinates: [178.82, 31.28] },
  { date: "1942-06-04T14:45", coordinates: [178.45, 31.46] },
  { date: "1942-06-04T17:03", coordinates: [178.65, 31.15] },
  { date: "1942-06-05T09:12", coordinates: [178.42, 31.02] }
];

export type AirWave = {
  id: string;
  faction: MidwayFaction;
  label: string;
  labelOffset?: [number, number];
  detail: string;
  routeLabel: string;
  start: string;
  end: string;
  points: Array<[number, number]>;
  intensity: number;
  type: "torpedo" | "dive" | "level" | "strike" | "counterstrike";
};

export type MidwayEvent = {
  id: string;
  date: string;
  title: string;
  phase: string;
  location: string;
  coordinates: [number, number];
  summary: string;
  detail: string;
  significance: string;
  focus: MidwayCarrierId[];
  mapFocus: string[];
  waveIds: string[];
};

export type NarrationCue = {
  id: string;
  start: string;
  end: string;
  title: string;
  text: string;
};

export const tacticalPoints: TacticalPoint[] = [
  { id: "midway", label: "中途岛 / Midway", coordinates: [182.65, 28.2], kind: "base" },
  { id: "japanese-approach", label: "南云机动部队接近区", coordinates: [178.9, 31.2], kind: "reference" },
  { id: "us-task-forces", label: "TF16 / TF17", coordinates: [185.0, 32.1], kind: "reference" },
  { id: "akagi-hit", label: "赤城重创", coordinates: [179.85, 30.85], kind: "damage" },
  { id: "kaga-hit", label: "加贺重创", coordinates: [179.55, 30.55], kind: "damage" },
  { id: "soryu-hit", label: "苍龙重创", coordinates: [180.25, 30.35], kind: "damage" },
  { id: "hiryu-hit", label: "飞龙重创", coordinates: [178.65, 31.15], kind: "damage" },
  { id: "yorktown-sink", label: "约克城沉没区", coordinates: [183.05, 30.25], kind: "sinking" }
];

export const carriers: Carrier[] = [
  {
    id: "enterprise",
    asset: "/assets/unit-icons/midway-enterprise.webp",
    faction: "us",
    formationId: "us-tf16",
    formationOffset: [0, -28],
    label: "企业号",
    shortName: "企业号",
    defaultFacing: "west",
    sunkLabel: "幸存",
    sunkPoint: [184.1, 31.6],
    track: usTf16Track
  },
  {
    id: "hornet",
    asset: "/assets/unit-icons/midway-hornet.webp",
    faction: "us",
    formationId: "us-tf16",
    formationOffset: [-70, 28],
    label: "大黄蜂号",
    shortName: "大黄蜂号",
    defaultFacing: "west",
    sunkLabel: "幸存",
    sunkPoint: [184.6, 32.0],
    track: usTf16Track
  },
  {
    id: "yorktown",
    asset: "/assets/unit-icons/midway-yorktown.webp",
    faction: "us",
    formationId: "us-tf17",
    formationOffset: [0, 0],
    label: "约克城号",
    shortName: "约克城号",
    defaultFacing: "west",
    damagedAt: "1942-06-04T12:20",
    sunkAt: "1942-06-07T06:00",
    sunkLabel: "6月7日沉没",
    sunkPoint: [183.05, 30.25],
    track: yorktownTf17Track
  },
  {
    id: "akagi",
    asset: "/assets/unit-icons/midway-akagi.webp",
    faction: "japan",
    formationId: "japan-kido-butai",
    formationOffset: [0, -34],
    label: "赤城",
    shortName: "赤城",
    defaultFacing: "east",
    damagedAt: "1942-06-04T10:26",
    sunkAt: "1942-06-05T05:00",
    sunkLabel: "6月5日自沉",
    sunkPoint: [179.72, 30.72],
    track: kidoButaiTrack
  },
  {
    id: "kaga",
    asset: "/assets/unit-icons/midway-kaga.webp",
    faction: "japan",
    formationId: "japan-kido-butai",
    formationOffset: [-72, 34],
    label: "加贺",
    shortName: "加贺",
    defaultFacing: "east",
    damagedAt: "1942-06-04T10:25",
    sunkAt: "1942-06-04T19:25",
    sunkLabel: "6月4日晚自沉",
    sunkPoint: [179.48, 30.42],
    track: kidoButaiTrack
  },
  {
    id: "soryu",
    asset: "/assets/unit-icons/midway-soryu.webp",
    faction: "japan",
    formationId: "japan-kido-butai",
    formationOffset: [-144, -28],
    label: "苍龙",
    shortName: "苍龙",
    defaultFacing: "east",
    damagedAt: "1942-06-04T10:25",
    sunkAt: "1942-06-04T19:13",
    sunkLabel: "6月4日晚沉没",
    sunkPoint: [180.18, 30.22],
    track: kidoButaiTrack
  },
  {
    id: "hiryu",
    asset: "/assets/unit-icons/midway-hiryu.webp",
    faction: "japan",
    formationId: "japan-hiryu",
    formationOffset: [0, 0],
    label: "飞龙",
    shortName: "飞龙",
    defaultFacing: "east",
    damagedAt: "1942-06-04T17:03",
    sunkAt: "1942-06-05T09:12",
    sunkLabel: "6月5日沉没",
    sunkPoint: [178.42, 31.02],
    track: hiryuManeuverTrack
  }
];

export const airWaves: AirWave[] = [
  {
    id: "tomonaga-midway-strike",
    faction: "japan",
    type: "strike",
    label: "友永队 / 第一波空袭",
    labelOffset: [18, 24],
    detail: "南云机动部队约04:30放出友永丈市率领的第一攻击队，06:20前后攻击中途岛机场和设施。",
    routeLabel: "友永队 B5N/D3A/A6M",
    start: "1942-06-04T04:30",
    end: "1942-06-04T06:20",
    points: [
      [178.45, 31.12],
      [180.25, 30.34],
      [181.45, 29.28],
      [182.65, 28.2]
    ],
    intensity: 0.92
  },
  {
    id: "midway-b26-tbf",
    faction: "midway",
    type: "torpedo",
    label: "中途岛 B-26/TBF 鱼雷攻击",
    labelOffset: [22, -28],
    detail: "中途岛陆基机分批扑向日航母，攻击效果有限但迫使日舰持续规避。",
    routeLabel: "B-26 / TBF",
    start: "1942-06-04T07:05",
    end: "1942-06-04T07:28",
    points: [
      [182.65, 28.2],
      [181.55, 29.1],
      [180.2, 30.0],
      [179.38, 30.72]
    ],
    intensity: 0.58
  },
  {
    id: "midway-b17-vmsb",
    faction: "midway",
    type: "level",
    label: "中途岛 B-17 / VMSB-241",
    labelOffset: [20, -48],
    detail: "B-17高空轰炸和海军陆战队俯冲轰炸相继攻击南云舰队，命中率低但加剧甲板调度压力。",
    routeLabel: "B-17 / VMSB-241",
    start: "1942-06-04T07:55",
    end: "1942-06-04T08:35",
    points: [
      [182.65, 28.2],
      [181.82, 29.8],
      [180.55, 30.7],
      [179.15, 31.08]
    ],
    intensity: 0.48
  },
  {
    id: "hornet-vt8",
    faction: "us",
    type: "torpedo",
    label: "VT-8 / 大黄蜂号鱼雷机",
    labelOffset: [26, 30],
    detail: "VT-8从低空单独接敌，几乎全队损失，却将日舰战斗机拖到低空。",
    routeLabel: "VT-8 / 大黄蜂号",
    start: "1942-06-04T07:00",
    end: "1942-06-04T09:25",
    points: [
      [185.65, 31.82],
      [184.15, 31.1],
      [182.4, 30.42],
      [179.62, 30.55]
    ],
    intensity: 0.72
  },
  {
    id: "enterprise-vt6",
    faction: "us",
    type: "torpedo",
    label: "VT-6 / 企业号鱼雷机",
    labelOffset: [18, -22],
    detail: "VT-6随后攻击，继续牵制日军防空和空中掩护。",
    routeLabel: "VT-6 / 企业号",
    start: "1942-06-04T07:05",
    end: "1942-06-04T09:40",
    points: [
      [185.25, 32.1],
      [183.6, 31.4],
      [181.82, 30.78],
      [179.7, 30.82]
    ],
    intensity: 0.68
  },
  {
    id: "yorktown-vt3",
    faction: "us",
    type: "torpedo",
    label: "VT-3 / 约克城号鱼雷机",
    labelOffset: [26, -40],
    detail: "VT-3最后一波低空鱼雷攻击压住日军战斗机，为高空俯冲轰炸创造窗口。",
    routeLabel: "VT-3 / 约克城号",
    start: "1942-06-04T08:38",
    end: "1942-06-04T10:10",
    points: [
      [184.95, 31.35],
      [183.28, 30.9],
      [181.45, 30.5],
      [179.95, 30.48]
    ],
    intensity: 0.7
  },
  {
    id: "enterprise-vb6-vs6",
    faction: "us",
    type: "dive",
    label: "VB-6/VS-6 / 企业号",
    labelOffset: [18, -28],
    detail: "企业号俯冲轰炸机群由东北方向压入，重创加贺和赤城。",
    routeLabel: "VB-6/VS-6 → 加贺/赤城",
    start: "1942-06-04T07:10",
    end: "1942-06-04T10:26",
    points: [
      [185.25, 32.1],
      [184.02, 32.7],
      [182.15, 32.1],
      [180.45, 31.1],
      [179.6, 30.58],
      [179.85, 30.85]
    ],
    intensity: 1
  },
  {
    id: "yorktown-vb3",
    faction: "us",
    type: "dive",
    label: "VB-3 / 约克城号",
    labelOffset: [18, 4],
    detail: "约克城号的VB-3俯冲轰炸机命中苍龙，三艘日航母几乎在同一窗口失去战斗力。",
    routeLabel: "VB-3 → 苍龙",
    start: "1942-06-04T08:38",
    end: "1942-06-04T10:25",
    points: [
      [184.95, 31.35],
      [183.72, 31.55],
      [182.1, 31.05],
      [180.95, 30.62],
      [180.25, 30.35]
    ],
    intensity: 0.98
  },
  {
    id: "hiryu-first-counterstrike",
    faction: "japan",
    type: "counterstrike",
    label: "飞龙第一反击 / D3A",
    labelOffset: [22, -26],
    detail: "飞龙幸存后放出第一波俯冲轰炸机，重创约克城号。",
    routeLabel: "飞龙反击 I / D3A",
    start: "1942-06-04T10:55",
    end: "1942-06-04T12:20",
    points: [
      [178.82, 31.25],
      [180.18, 31.0],
      [181.92, 30.78],
      [183.78, 30.72]
    ],
    intensity: 0.86
  },
  {
    id: "hiryu-second-counterstrike",
    faction: "japan",
    type: "counterstrike",
    label: "飞龙第二反击 / B5N",
    labelOffset: [22, 22],
    detail: "第二波鱼雷机再次找到约克城号，使其丧失恢复能力。",
    routeLabel: "飞龙反击 II / B5N",
    start: "1942-06-04T13:30",
    end: "1942-06-04T14:45",
    points: [
      [178.72, 31.22],
      [180.05, 30.95],
      [181.62, 30.62],
      [183.55, 30.58]
    ],
    intensity: 0.9
  },
  {
    id: "hiryu-final-strike",
    faction: "us",
    type: "dive",
    label: "企业号/约克城号混成机群",
    labelOffset: [20, -30],
    detail: "美军侦察确认飞龙位置后，企业号起飞的混成机群在傍晚命中飞龙。",
    routeLabel: "SBD → 飞龙",
    start: "1942-06-04T15:30",
    end: "1942-06-04T17:03",
    points: [
      [184.0, 31.55],
      [182.78, 32.02],
      [181.0, 31.78],
      [179.5, 31.42],
      [178.65, 31.15]
    ],
    intensity: 0.96
  },
  {
    id: "i168-yorktown",
    faction: "japan",
    type: "counterstrike",
    label: "I-168 潜艇雷击",
    labelOffset: [18, -18],
    detail: "6月6日，I-168击中拖带中的约克城号，航母最终在6月7日沉没。",
    routeLabel: "I-168 → 约克城号",
    start: "1942-06-06T13:00",
    end: "1942-06-06T13:31",
    points: [
      [182.25, 30.0],
      [182.62, 30.18],
      [183.18, 30.33]
    ],
    intensity: 0.78
  }
];

const eventTimeline: Array<Omit<MidwayEvent, "mapFocus">> = [
  {
    id: "first-strike-launch",
    date: "1942-06-04T04:30",
    title: "南云第一攻击队起飞",
    phase: "拂晓出击",
    location: "中途岛西北海域",
    coordinates: [178.45, 31.12],
    summary: "友永队从四艘日航母起飞攻击中途岛，美军航母已在东北方向待机。",
    detail: "动画直接从攻击队起飞开始，不把侦察前奏拉长；第一帧即显示双方航母和空袭路径。",
    significance: "日本试图先压制中途岛航空兵，但美军情报已提前布置航母伏击。",
    focus: ["akagi", "kaga", "soryu", "hiryu"],
    waveIds: ["tomonaga-midway-strike"]
  },
  {
    id: "midway-bombed",
    date: "1942-06-04T06:20",
    title: "中途岛遭第一波空袭",
    phase: "岛上空袭",
    location: "中途岛",
    coordinates: [182.65, 28.2],
    summary: "日机攻击中途岛，但未彻底瘫痪机场，友永回报需要第二次攻击。",
    detail: "返航和再攻击判断使南云陷入换装、待命与搜索报告之间的时间压力。",
    significance: "甲板调度矛盾开始积累，为10点后的灾难埋下条件。",
    focus: ["akagi", "kaga", "soryu", "hiryu"],
    waveIds: ["tomonaga-midway-strike"]
  },
  {
    id: "midway-counterattacks",
    date: "1942-06-04T08:30",
    title: "中途岛陆基机连续反扑",
    phase: "陆基反扑",
    location: "南云舰队上空",
    coordinates: [179.38, 30.72],
    summary: "B-26、TBF、B-17、VMSB-241等分批攻击，未能有效命中但迫使舰队规避。",
    detail: "这些波次容易在画面上混淆，因此动画以黄色虚线分层标注部队番号。",
    significance: "日军舰队防空被持续消耗，机动和甲板作业被打断。",
    focus: ["akagi", "kaga", "soryu", "hiryu"],
    waveIds: ["midway-b26-tbf", "midway-b17-vmsb"]
  },
  {
    id: "torpedo-squadrons",
    date: "1942-06-04T09:40",
    title: "VT-8、VT-6、VT-3低空突击",
    phase: "鱼雷机牵制",
    location: "日航母编队东侧",
    coordinates: [179.82, 30.62],
    summary: "三支美军鱼雷机中队先后攻击，损失惨重但把零战和防空注意力压到低空。",
    detail: "三条蓝色低空路线分别标注大黄蜂号、企业号、约克城号，避免把不同中队画成一团。",
    significance: "鱼雷机没有击沉航母，却为俯冲轰炸创造了关键窗口。",
    focus: ["enterprise", "hornet", "yorktown", "akagi", "kaga", "soryu"],
    waveIds: ["hornet-vt8", "enterprise-vt6", "yorktown-vt3"]
  },
  {
    id: "three-carriers-hit",
    date: "1942-06-04T10:26",
    title: "赤城、加贺、苍龙被重创",
    phase: "决定性俯冲",
    location: "中途岛西北海域",
    coordinates: [179.86, 30.6],
    summary: "企业号和约克城号俯冲轰炸机几乎同时命中三艘日本主力航母。",
    detail: "画面显示两条高空俯冲路线：VB-6/VS-6打击加贺/赤城，VB-3打击苍龙。",
    significance: "南云四航母中的三艘在数分钟内丧失战斗力，战役主动权急转。",
    focus: ["enterprise", "yorktown", "akagi", "kaga", "soryu"],
    waveIds: ["enterprise-vb6-vs6", "yorktown-vb3"]
  },
  {
    id: "hiryu-counterattack",
    date: "1942-06-04T12:20",
    title: "飞龙第一反击命中约克城号",
    phase: "日军反击",
    location: "约克城号周边海域",
    coordinates: [183.78, 30.72],
    summary: "飞龙仍可作战，第一波俯冲轰炸机重创约克城号。",
    detail: "红色反击路线从飞龙向东延伸，目标清楚标为约克城号，避免与美军西进路线混淆。",
    significance: "日本仍有反击能力，美军必须继续搜索并消灭最后一艘航母。",
    focus: ["hiryu", "yorktown"],
    waveIds: ["hiryu-first-counterstrike"]
  },
  {
    id: "second-hit-yorktown",
    date: "1942-06-04T14:45",
    title: "飞龙第二波鱼雷机再击约克城号",
    phase: "约克城号失能",
    location: "约克城号周边海域",
    coordinates: [183.55, 30.58],
    summary: "飞龙第二波B5N鱼雷机再次命中约克城号，航母被迫弃舰。",
    detail: "约克城号图标转入重创状态，但沉没点保留到6月7日，区分“重创”和“最终沉没”。",
    significance: "美军损失一艘航母，但仍保有企业号和大黄蜂号继续打击。",
    focus: ["hiryu", "yorktown"],
    waveIds: ["hiryu-second-counterstrike"]
  },
  {
    id: "hiryu-hit",
    date: "1942-06-04T17:03",
    title: "飞龙被美军傍晚打击重创",
    phase: "最后航母失能",
    location: "飞龙所在海域",
    coordinates: [178.65, 31.15],
    summary: "企业号起飞的混成SBD机群找到飞龙并命中，日本最后一艘可战航母失能。",
    detail: "蓝色俯冲路线从美军航母区折向西北，终点以飞龙图标和爆炸纹饰标出。",
    significance: "四艘日本主力航母全部失去作战能力，中途岛海空战胜负已定。",
    focus: ["enterprise", "hiryu"],
    waveIds: ["hiryu-final-strike"]
  },
  {
    id: "i168-yorktown",
    date: "1942-06-06T13:31",
    title: "I-168击中拖带中的约克城号",
    phase: "沉没前奏",
    location: "中途岛东北海域",
    coordinates: [183.18, 30.33],
    summary: "日潜艇I-168击中抢救拖带中的约克城号，航母最终无法保住。",
    detail: "潜艇雷击作为短线单独呈现，不再把约克城号误画成仍在主动机动的作战单位。",
    significance: "美军胜利仍付出航母损失，战场残余行动延续到6月7日。",
    focus: ["yorktown"],
    waveIds: ["i168-yorktown"]
  },
  {
    id: "battle-over",
    date: "1942-06-07T06:00",
    title: "约克城号沉没，战役结束",
    phase: "战役结束",
    location: "中途岛东北海域",
    coordinates: [183.05, 30.25],
    summary: "约克城号沉没；日本四艘主力航母已全部损失，美国守住中途岛。",
    detail: "最终画面保留五个沉没/重创点：赤城、加贺、苍龙、飞龙、约克城号，各点都有对应航母图标和爆炸纹饰。",
    significance: "日本航母航空兵骨干遭重创，太平洋战争进入美国逐步反攻阶段。",
    focus: ["enterprise", "hornet", "yorktown"],
    waveIds: ["i168-yorktown"]
  }
];

export const battleEvents: MidwayEvent[] = eventTimeline.map((event) => ({
  ...event,
  mapFocus: event.focus
}));

export const narrationCues: NarrationCue[] = [
  {
    id: "opening",
    start: "1942-06-04T04:30",
    end: "1942-06-04T08:30",
    title: "第一幕 / 伏击展开",
    text: "中途岛不是空旷海图上的偶遇。日军先炸岛，美军三艘航母在东北方向待机，陆基机不断迫使南云舰队规避。"
  },
  {
    id: "torpedo",
    start: "1942-06-04T08:30",
    end: "1942-06-04T10:25",
    title: "第二幕 / 低空牵制",
    text: "VT-8、VT-6、VT-3依次低空突击，损失惨重却把日军战斗机拖低，为俯冲轰炸打开窗口。"
  },
  {
    id: "dive",
    start: "1942-06-04T10:25",
    end: "1942-06-04T17:03",
    title: "第三幕 / 俯冲决胜",
    text: "企业号和约克城号机群几乎同时命中赤城、加贺、苍龙；飞龙两次反击约克城号后，也在傍晚被找到并重创。"
  },
  {
    id: "aftermath",
    start: "1942-06-04T17:03",
    end: "1942-06-07T06:00",
    title: "终幕 / 残局与沉没点",
    text: "战术胜负在6月4日傍晚已经形成，但各舰自沉、沉没和约克城号遭I-168雷击延续到6月7日。"
  }
];

export const cueEventIds = new Set(battleEvents.filter((event) => event.id !== "battle-over").map((event) => event.id));
