import type { BattleEvent, FrontLine, MapPoint } from "./battleOfFrance";

export const campaignStart = "1796-03-27";
export const campaignEnd = "1815-06-18";

export const mapPoints: MapPoint[] = [
  { id: "paris", label: "巴黎", coordinates: [2.3522, 48.8566], kind: "capital" },
  { id: "nice", label: "尼斯", coordinates: [7.262, 43.7102], kind: "city" },
  { id: "milan", label: "米兰", coordinates: [9.19, 45.4642], kind: "city" },
  { id: "rivoli", label: "里沃利", coordinates: [10.811, 45.572], kind: "front" },
  { id: "cairo", label: "开罗", coordinates: [31.2357, 30.0444], kind: "capital" },
  { id: "alexandria", label: "亚历山大", coordinates: [29.9187, 31.2001], kind: "port" },
  { id: "vienna", label: "维也纳", coordinates: [16.3738, 48.2082], kind: "capital" },
  { id: "ulm", label: "乌尔姆", coordinates: [9.9937, 48.4011], kind: "city" },
  { id: "austerlitz", label: "奥斯特里茨", coordinates: [16.7626, 49.153], kind: "front" },
  { id: "jena", label: "耶拿", coordinates: [11.5899, 50.9271], kind: "city" },
  { id: "berlin", label: "柏林", coordinates: [13.405, 52.52], kind: "capital" },
  { id: "warsaw", label: "华沙", coordinates: [21.0122, 52.2297], kind: "capital" },
  { id: "friedland", label: "弗里德兰", coordinates: [21.017, 54.442], kind: "front" },
  { id: "madrid", label: "马德里", coordinates: [-3.7038, 40.4168], kind: "capital" },
  { id: "lisbon", label: "里斯本", coordinates: [-9.1393, 38.7223], kind: "capital" },
  { id: "wagram", label: "瓦格拉姆", coordinates: [16.65, 48.3], kind: "front" },
  { id: "moscow", label: "莫斯科", coordinates: [37.6173, 55.7558], kind: "capital" },
  { id: "smolensk", label: "斯摩棱斯克", coordinates: [32.0453, 54.7826], kind: "city" },
  { id: "borodino", label: "博罗季诺", coordinates: [35.83, 55.52], kind: "front" },
  { id: "leipzig", label: "莱比锡", coordinates: [12.3731, 51.3397], kind: "city" },
  { id: "elba", label: "厄尔巴岛", coordinates: [10.29, 42.78], kind: "objective" },
  { id: "waterloo", label: "滑铁卢", coordinates: [4.3991, 50.7147], kind: "front" },
  { id: "brussels", label: "布鲁塞尔", coordinates: [4.3517, 50.8503], kind: "capital" }
];

export const frontLines: FrontLine[] = [
  {
    id: "italy-first-operation",
    faction: "germany",
    label: "意大利第1次作战：越过阿尔卑斯",
    from: "nice",
    to: "milan",
    start: "1796-03-27",
    end: "1796-05-15"
  },
  {
    id: "rivoli-operation",
    faction: "germany",
    label: "意大利第2次作战：里沃利解围",
    from: "milan",
    to: "rivoli",
    start: "1796-11-15",
    end: "1797-01-14"
  },
  {
    id: "egypt-operation",
    faction: "germany",
    label: "埃及远征：亚历山大-开罗",
    from: "alexandria",
    to: "cairo",
    start: "1798-07-01",
    end: "1798-07-21"
  },
  {
    id: "ulm-austerlitz-operation",
    faction: "germany",
    label: "第三次反法联盟：乌尔姆-奥斯特里茨",
    from: "ulm",
    to: "austerlitz",
    start: "1805-09-25",
    end: "1805-12-02"
  },
  {
    id: "prussia-operation",
    faction: "germany",
    label: "普鲁士作战：耶拿-柏林",
    from: "jena",
    to: "berlin",
    start: "1806-10-14",
    end: "1806-10-27"
  },
  {
    id: "poland-operation",
    faction: "germany",
    label: "波兰第1次作战：华沙-弗里德兰",
    from: "warsaw",
    to: "friedland",
    start: "1806-12-01",
    end: "1807-06-14"
  },
  {
    id: "peninsular-first-operation",
    faction: "germany",
    label: "伊比利亚第1次作战：夺取马德里",
    from: "paris",
    to: "madrid",
    start: "1808-05-02",
    end: "1808-12-04",
    visibleUntil: "1813-06-21",
    unitVisibleUntil: "1812-10-19"
  },
  {
    id: "peninsular-allied-operation",
    faction: "allies",
    label: "伊比利亚第2次作战：英葡西反攻",
    from: "lisbon",
    to: "madrid",
    start: "1809-04-22",
    end: "1813-06-21"
  },
  {
    id: "austria-second-operation",
    faction: "germany",
    label: "奥地利第2次作战：瓦格拉姆",
    from: "vienna",
    to: "wagram",
    start: "1809-05-13",
    end: "1809-07-06"
  },
  {
    id: "russia-invasion",
    faction: "germany",
    label: "俄国作战：斯摩棱斯克-莫斯科",
    from: "smolensk",
    to: "moscow",
    start: "1812-06-24",
    end: "1812-09-14",
    visibleUntil: "1812-12-14",
    unitVisibleUntil: "1812-10-19"
  },
  {
    id: "russia-retreat",
    faction: "allies",
    label: "俄国作战：反击与法军撤退",
    from: "moscow",
    to: "smolensk",
    start: "1812-10-19",
    end: "1812-12-14"
  },
  {
    id: "germany-campaign",
    faction: "allies",
    label: "德意志第1次作战：莱比锡合围",
    from: "berlin",
    to: "leipzig",
    start: "1813-08-26",
    end: "1813-10-19"
  },
  {
    id: "france-campaign",
    faction: "allies",
    label: "法国本土作战：联军入巴黎",
    from: "leipzig",
    to: "paris",
    start: "1814-01-01",
    end: "1814-03-31"
  },
  {
    id: "hundred-days",
    faction: "germany",
    label: "百日王朝：滑铁卢",
    from: "paris",
    to: "waterloo",
    start: "1815-03-20",
    end: "1815-06-18",
    unitVisibleUntil: "1815-06-18"
  }
];

export const battleEvents: BattleEvent[] = [
  {
    id: "italian-campaign",
    date: "1796-03-27",
    title: "意大利第1次作战开始",
    location: "尼斯、北意大利",
    coordinates: [7.262, 43.7102],
    phase: "崛起",
    summary: "拿破仑接掌意大利方面军，用机动战击破奥地利与撒丁力量。",
    detail: "法军以较弱资源打出连续机动，穿越阿尔卑斯南缘，夺取北意大利主动权。",
    significance: "拿破仑由共和国将领跃升为欧洲级军事人物，意大利成为其战争体系的第一个样板。",
    mapFocus: ["nice", "milan", "rivoli"]
  },
  {
    id: "rivoli",
    date: "1797-01-14",
    title: "意大利第2次作战：里沃利",
    location: "里沃利",
    coordinates: [10.811, 45.572],
    phase: "北意大利定局",
    summary: "法军在里沃利击退奥军解围企图，稳住曼图亚围攻态势。",
    detail: "同一北意大利战区多次往返，本动画用第1次、第2次作战标注，避免路线重复堆叠。",
    significance: "奥地利在北意大利失势，法国势力进入意大利半岛政治重组阶段。",
    mapFocus: ["milan", "rivoli", "vienna"]
  },
  {
    id: "egypt",
    date: "1798-07-21",
    title: "埃及远征与金字塔战役",
    location: "开罗",
    coordinates: [31.2357, 30.0444],
    phase: "地中海冒险",
    summary: "法军进入埃及，试图威胁英国通往印度的交通想象线。",
    detail: "陆上战术胜利无法弥补海上控制权不足。尼罗河海战后，远征军战略上被困。",
    significance: "拿破仑战争从欧洲大陆扩展到地中海和帝国交通线，但海权短板清晰暴露。",
    mapFocus: ["alexandria", "cairo"]
  },
  {
    id: "consulate",
    date: "1799-11-09",
    title: "雾月政变",
    location: "巴黎",
    coordinates: [2.3522, 48.8566],
    phase: "夺权",
    summary: "拿破仑返回法国后发动政变，建立执政府。",
    detail: "军事声望转化为政治权力，法国革命战争逐步进入拿破仑个人统治阶段。",
    significance: "战争目标从保卫革命共和国，转向法国霸权与拿破仑帝国秩序。",
    mapFocus: ["paris"]
  },
  {
    id: "austerlitz",
    date: "1805-12-02",
    title: "奥斯特里茨会战",
    location: "奥斯特里茨",
    coordinates: [16.7626, 49.153],
    phase: "帝国巅峰",
    summary: "法军在三皇会战中击败俄奥联军，第三次反法联盟瓦解。",
    detail: "乌尔姆机动后，拿破仑诱使联军攻击其右翼，再以中央反击切裂联军。",
    significance: "奥斯特里茨确立了拿破仑陆战体系的震慑力，也重塑德意志政治格局。",
    mapFocus: ["ulm", "austerlitz", "vienna"]
  },
  {
    id: "jena",
    date: "1806-10-14",
    title: "耶拿-奥尔施泰特",
    location: "耶拿",
    coordinates: [11.5899, 50.9271],
    phase: "普鲁士崩溃",
    summary: "法军击败普鲁士主力，快速进入柏林。",
    detail: "普鲁士军制和指挥体系在法军军团制机动面前崩塌，随后被迫改革。",
    significance: "法国霸权深入中欧，普鲁士改革则为后来反法战争埋下伏笔。",
    mapFocus: ["jena", "berlin"]
  },
  {
    id: "friedland",
    date: "1807-06-14",
    title: "波兰第1次作战：弗里德兰",
    location: "弗里德兰",
    coordinates: [21.017, 54.442],
    phase: "提尔西特体系",
    summary: "法军击败俄军，法国与俄国达成提尔西特和约。",
    detail: "东欧战区第一次大规模推进以法国优势收束，但法国与俄国的合作基础并不稳固。",
    significance: "拿破仑帝国达到外交高峰，欧洲大陆封锁体系随之强化。",
    mapFocus: ["warsaw", "friedland"]
  },
  {
    id: "peninsular-war",
    date: "1808-05-02",
    title: "伊比利亚第1次作战爆发",
    location: "马德里",
    coordinates: [-3.7038, 40.4168],
    phase: "泥潭",
    summary: "西班牙起义和英葡介入使半岛成为长期消耗战场。",
    detail: "伊比利亚战线多次反复，本动画按第1次夺取马德里、第2次联军反攻标注，避免把拉锯路线画成重复杂线。",
    significance: "半岛战争持续牵制法国兵力，游击战与英国远征军成为帝国失血点。",
    mapFocus: ["madrid", "lisbon"]
  },
  {
    id: "wagram",
    date: "1809-07-06",
    title: "奥地利第2次作战：瓦格拉姆",
    location: "瓦格拉姆",
    coordinates: [16.65, 48.3],
    phase: "再胜奥地利",
    summary: "法军在多瑙河畔击败奥军，迫使奥地利再次求和。",
    detail: "阿斯佩恩-埃斯灵受挫后，拿破仑重组渡河和炮兵部署，在瓦格拉姆取胜。",
    significance: "法国仍能取胜，但代价变高，帝国军事优势不再像早期那样轻松。",
    mapFocus: ["vienna", "wagram"]
  },
  {
    id: "russia",
    date: "1812-09-14",
    title: "俄国作战：进入莫斯科",
    location: "莫斯科",
    coordinates: [37.6173, 55.7558],
    phase: "过度扩张",
    summary: "大军团进入莫斯科，却未能迫使俄国按法国条件结束战争。",
    detail: "博罗季诺后法军进入莫斯科，但补给线过长、城市焚毁和俄军拒绝决战使胜利失去战略结果。",
    significance: "俄国战役是帝国崩塌的关键起点，拿破仑机动体系被距离、补给和气候击穿。",
    mapFocus: ["smolensk", "borodino", "moscow"]
  },
  {
    id: "leipzig",
    date: "1813-10-19",
    title: "德意志第1次作战：莱比锡",
    location: "莱比锡",
    coordinates: [12.3731, 51.3397],
    phase: "联军反扑",
    summary: "第六次反法联盟在莱比锡击败拿破仑，法国势力撤出德意志。",
    detail: "俄、普、奥、瑞典等联军在中欧合围，拿破仑失去德国盟邦体系。",
    significance: "莱比锡把战争从法国扩张转为联军进逼法国本土。",
    mapFocus: ["berlin", "leipzig", "paris"]
  },
  {
    id: "abdication",
    date: "1814-04-11",
    title: "首次退位与厄尔巴岛",
    location: "枫丹白露、厄尔巴岛",
    coordinates: [10.29, 42.78],
    phase: "帝国崩塌",
    summary: "联军进入巴黎后，拿破仑退位并被流放至厄尔巴岛。",
    detail: "法国本土作战虽有局部机动胜利，但总体兵力和政治形势已无法逆转。",
    significance: "欧洲列强开始重建秩序，但拿破仑问题尚未结束。",
    mapFocus: ["paris", "elba"]
  },
  {
    id: "waterloo",
    date: "1815-06-18",
    title: "百日王朝与滑铁卢",
    location: "滑铁卢",
    coordinates: [4.3991, 50.7147],
    phase: "终局",
    summary: "拿破仑在滑铁卢败给英荷联军和普军，战争时代终结。",
    detail: "百日王朝试图在联军完成集结前击破敌军，但滑铁卢战场未能达成决定性突破。",
    significance: "拿破仑战争结束，维也纳体系成为19世纪欧洲秩序基础。",
    mapFocus: ["paris", "waterloo", "brussels"]
  }
];
