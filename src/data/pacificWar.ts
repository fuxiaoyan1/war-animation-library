import type { BattleEvent, FrontLine, MapPoint } from "./battleOfFrance";

export const campaignStart = "1941-12-07";
export const campaignEnd = "1945-09-02";

export const mapPoints: MapPoint[] = [
  { id: "tokyo", label: "东京", coordinates: [139.6917, 35.6895], kind: "capital" },
  { id: "pearl", label: "珍珠港", coordinates: [202.05, 21.36], kind: "port" },
  { id: "wake", label: "威克岛", coordinates: [166.62, 19.29], kind: "front" },
  { id: "manila", label: "马尼拉", coordinates: [120.9842, 14.5995], kind: "capital" },
  { id: "singapore", label: "新加坡", coordinates: [103.8198, 1.3521], kind: "port" },
  { id: "coral", label: "珊瑚海", coordinates: [155.0, -15.0], kind: "front" },
  { id: "midway", label: "中途岛", coordinates: [182.65, 28.2], kind: "front" },
  { id: "guadalcanal", label: "瓜达尔卡纳尔", coordinates: [160.15, -9.43], kind: "front" },
  { id: "tarawa", label: "塔拉瓦", coordinates: [172.98, 1.43], kind: "front" },
  { id: "saipan", label: "塞班", coordinates: [145.75, 15.18], kind: "front" },
  { id: "leyte", label: "莱特湾", coordinates: [125.0, 10.8], kind: "front" },
  { id: "iwo", label: "硫磺岛", coordinates: [141.29, 24.78], kind: "front" },
  { id: "okinawa", label: "冲绳", coordinates: [127.68, 26.21], kind: "front" },
  { id: "hiroshima", label: "广岛", coordinates: [132.4553, 34.3853], kind: "city" },
  { id: "nagasaki", label: "长崎", coordinates: [129.8737, 32.7448], kind: "city" },
  { id: "tokyo-bay", label: "东京湾", coordinates: [139.9, 35.4], kind: "port" }
];

export const frontLines: FrontLine[] = [
  {
    id: "pearl-harbor-strike",
    faction: "germany",
    label: "日本航母机动部队：珍珠港",
    from: "tokyo",
    to: "pearl",
    routeKind: "sea",
    start: "1941-12-07",
    end: "1941-12-08",
    visibleUntil: "1942-06-05",
    unitVisibleUntil: "1942-06-03",
    unitIcon: "carrier",
    waypoints: [
      [160.0, 42.0],
      [185.0, 36.0]
    ]
  },
  {
    id: "japan-south-offensive",
    faction: "germany",
    label: "南方资源区攻势",
    from: "tokyo",
    to: "singapore",
    routeKind: "sea",
    start: "1941-12-08",
    end: "1942-02-15",
    visibleUntil: "1942-08-07",
    unitVisibleUntil: "1942-06-03",
    unitIcon: "carrier",
    waypoints: [
      [130.0, 25.0],
      [121.0, 14.6]
    ]
  },
  {
    id: "philippines-campaign",
    faction: "germany",
    label: "菲律宾方向",
    from: "tokyo",
    to: "manila",
    routeKind: "sea",
    start: "1941-12-08",
    end: "1942-05-06",
    visibleUntil: "1944-10-20",
    unitVisibleUntil: "1942-06-03",
    unitIcon: "carrier",
    waypoints: [[128.0, 24.0]]
  },
  {
    id: "coral-sea",
    faction: "allies",
    label: "珊瑚海：航母阻击",
    from: "pearl",
    to: "coral",
    routeKind: "sea",
    start: "1942-05-04",
    end: "1942-05-08",
    unitIcon: "carrier",
    waypoints: [
      [190.0, 10.0],
      [175.0, -6.0]
    ]
  },
  {
    id: "midway-counter",
    faction: "allies",
    label: "中途岛航母会战",
    from: "pearl",
    to: "midway",
    routeKind: "sea",
    start: "1942-06-03",
    end: "1942-06-07",
    unitIcon: "carrier"
  },
  {
    id: "guadalcanal-campaign",
    faction: "allies",
    label: "瓜达尔卡纳尔争夺",
    from: "pearl",
    to: "guadalcanal",
    routeKind: "sea",
    start: "1942-08-07",
    end: "1943-02-09",
    unitIcon: "carrier",
    waypoints: [
      [188.0, 5.0],
      [176.0, -5.0]
    ]
  },
  {
    id: "gilberts-marshalls",
    faction: "allies",
    label: "中太平洋第1次作战：塔拉瓦",
    from: "pearl",
    to: "tarawa",
    routeKind: "sea",
    start: "1943-11-20",
    end: "1943-11-23",
    unitIcon: "carrier",
    waypoints: [[190.0, 9.0]]
  },
  {
    id: "marianas",
    faction: "allies",
    label: "中太平洋第2次作战：马里亚纳",
    from: "tarawa",
    to: "saipan",
    routeKind: "sea",
    start: "1944-06-15",
    end: "1944-07-09",
    unitIcon: "carrier",
    waypoints: [[160.0, 8.0]]
  },
  {
    id: "leyte-return",
    faction: "allies",
    label: "菲律宾反攻：莱特湾",
    from: "saipan",
    to: "leyte",
    routeKind: "sea",
    start: "1944-10-20",
    end: "1944-10-26",
    unitIcon: "carrier"
  },
  {
    id: "iwo-jima",
    faction: "allies",
    label: "硫磺岛登陆",
    from: "saipan",
    to: "iwo",
    routeKind: "sea",
    start: "1945-02-19",
    end: "1945-03-26",
    unitIcon: "carrier"
  },
  {
    id: "okinawa",
    faction: "allies",
    label: "冲绳作战",
    from: "iwo",
    to: "okinawa",
    routeKind: "sea",
    start: "1945-04-01",
    end: "1945-06-22",
    unitIcon: "carrier"
  },
  {
    id: "japan-surrender",
    faction: "allies",
    label: "通向东京湾",
    from: "okinawa",
    to: "tokyo-bay",
    routeKind: "sea",
    start: "1945-08-15",
    end: "1945-09-02",
    unitIcon: "carrier",
    waypoints: [[132.4553, 34.3853]]
  }
];

export const battleEvents: BattleEvent[] = [
  {
    id: "pearl-harbor",
    date: "1941-12-07",
    title: "珍珠港袭击",
    location: "夏威夷珍珠港",
    coordinates: [202.05, 21.36],
    phase: "战争爆发",
    summary: "日本航母机动部队突袭珍珠港，美国正式进入太平洋战争。",
    detail: "日本试图以航母航空兵重创美太平洋舰队，争取南方资源区攻势的战略窗口。",
    significance: "航母航空兵成为太平洋战争的核心力量，战争从东亚扩展为横跨太平洋的海空决战。",
    mapFocus: ["pearl", "tokyo"]
  },
  {
    id: "fall-of-singapore",
    date: "1942-02-15",
    title: "新加坡陷落",
    location: "新加坡",
    coordinates: [103.8198, 1.3521],
    phase: "日本南进",
    summary: "日本攻占新加坡，英帝国在东南亚的防线崩溃。",
    detail: "南方资源区攻势以快速登陆、空海协同和陆上突进取得巨大成果。",
    significance: "日本获得资源区纵深，但战线被拉长，海上交通线成为未来弱点。",
    mapFocus: ["singapore", "manila"]
  },
  {
    id: "coral-sea",
    date: "1942-05-08",
    title: "珊瑚海海战",
    location: "珊瑚海",
    coordinates: [155.0, -15.0],
    phase: "航母阻击",
    summary: "美澳方向以航母阻止日军进一步威胁莫尔兹比港。",
    detail: "双方舰队主要通过舰载机交战，预示未来海战将由视距外航空兵主导。",
    significance: "日本连续扩张第一次被战略性挡住，通往澳大利亚方向的压力减轻。",
    mapFocus: ["coral", "guadalcanal"]
  },
  {
    id: "midway",
    date: "1942-06-04",
    title: "中途岛海战",
    location: "中途岛",
    coordinates: [182.65, 28.2],
    phase: "主动权逆转",
    summary: "美国海军击沉日本四艘主力航母，太平洋战争主动权开始逆转。",
    detail: "情报、搜索、甲板调度和俯冲轰炸在短时间内改变战局。",
    significance: "日本航母核心力量遭到难以弥补的损失，美国开始逐步转入攻势。",
    mapFocus: ["midway", "pearl"]
  },
  {
    id: "guadalcanal",
    date: "1942-08-07",
    title: "瓜达尔卡纳尔登陆",
    location: "所罗门群岛",
    coordinates: [160.15, -9.43],
    phase: "消耗战开始",
    summary: "盟军在瓜达尔卡纳尔登陆，南太平洋进入长期陆海空消耗。",
    detail: "岛屿机场、夜战舰队和补给线反复争夺，双方都被迫投入大量舰机和陆战兵力。",
    significance: "日本从扩张转为守势消耗，盟军积累两栖作战经验。",
    mapFocus: ["guadalcanal", "coral"]
  },
  {
    id: "tarawa",
    date: "1943-11-20",
    title: "塔拉瓦登陆",
    location: "吉尔伯特群岛",
    coordinates: [172.98, 1.43],
    phase: "中太平洋推进",
    summary: "美军以高代价夺取塔拉瓦，打开中太平洋逐岛推进。",
    detail: "环礁登陆暴露火力准备、潮汐、登陆艇和情报问题，也推动两栖战术改进。",
    significance: "中太平洋路线成形，下一步指向马绍尔和马里亚纳。",
    mapFocus: ["tarawa", "saipan"]
  },
  {
    id: "saipan",
    date: "1944-07-09",
    title: "塞班岛陷落",
    location: "马里亚纳群岛",
    coordinates: [145.75, 15.18],
    phase: "本土圈被打开",
    summary: "美军夺取塞班，B-29 对日本本土的战略轰炸基地逐步形成。",
    detail: "马里亚纳战役还伴随菲律宾海海战，日本海军航空兵遭受严重损失。",
    significance: "日本本土进入远程轰炸半径，战争压力直接压向本土。",
    mapFocus: ["saipan", "tokyo"]
  },
  {
    id: "leyte-gulf",
    date: "1944-10-25",
    title: "莱特湾海战",
    location: "菲律宾莱特湾",
    coordinates: [125.0, 10.8],
    phase: "日本舰队决战失败",
    summary: "美军重返菲律宾，日军试图以海军决战阻止登陆失败。",
    detail: "多方向舰队行动、航母诱敌、战列舰夜战和护航航母抵抗交织成巨大海战。",
    significance: "日本联合舰队失去作为战略决战力量的能力。",
    mapFocus: ["leyte", "manila"]
  },
  {
    id: "iwo-jima",
    date: "1945-02-19",
    title: "硫磺岛登陆",
    location: "硫磺岛",
    coordinates: [141.29, 24.78],
    phase: "逼近本土",
    summary: "美军夺取硫磺岛，为轰炸机护航、迫降和本土进攻准备前沿节点。",
    detail: "日军深挖地下阵地，美军以高伤亡推进，岛屿战越来越接近日本本土防御形态。",
    significance: "太平洋战争进入本土外围决战。",
    mapFocus: ["iwo", "tokyo"]
  },
  {
    id: "okinawa",
    date: "1945-04-01",
    title: "冲绳战役",
    location: "冲绳",
    coordinates: [127.68, 26.21],
    phase: "本土门前",
    summary: "美军在冲绳登陆，日军以地面防御和神风攻击进行持久抵抗。",
    detail: "冲绳显示如果登陆日本本土，伤亡可能极高。海空支援、航母防空和岛上阵地战达到极限。",
    significance: "冲绳影响了盟军对战争终局手段的判断。",
    mapFocus: ["okinawa", "tokyo"]
  },
  {
    id: "atomic-bombs",
    date: "1945-08-06",
    title: "广岛与长崎原子弹",
    location: "日本本土",
    coordinates: [132.4553, 34.3853],
    phase: "终战压力",
    summary: "美国对广岛、长崎使用原子弹，日本投降压力急剧上升。",
    detail: "原子弹、苏联对日宣战和本土封锁共同构成终战压力。本动画把它们作为战争终局节点处理。",
    significance: "太平洋战争进入投降谈判和占领安排阶段。",
    mapFocus: ["hiroshima", "nagasaki", "tokyo"]
  },
  {
    id: "surrender",
    date: "1945-09-02",
    title: "东京湾受降",
    location: "东京湾",
    coordinates: [139.9, 35.4],
    phase: "战争结束",
    summary: "日本在密苏里号上签署投降书，太平洋战争结束。",
    detail: "从航母突袭到航母护航下的东京湾受降，太平洋战争证明海空力量、工业产能和岛链基地共同决定战局。",
    significance: "二战结束，战后东亚和太平洋秩序开始重组。",
    mapFocus: ["tokyo-bay", "tokyo"]
  }
];
