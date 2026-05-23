import type { BattleEvent, FrontLine, MapPoint } from "./battleOfFrance";

export const campaignStart = "1941-06-22";
export const campaignEnd = "1945-05-09";

export const mapPoints: MapPoint[] = [
  { id: "berlin", label: "柏林", coordinates: [13.405, 52.52], kind: "capital" },
  { id: "warsaw", label: "华沙", coordinates: [21.0122, 52.2297], kind: "capital" },
  { id: "brest", label: "布列斯特", coordinates: [23.7341, 52.0976], kind: "front" },
  { id: "kaunas", label: "考纳斯", coordinates: [23.9036, 54.8985], kind: "city" },
  { id: "riga", label: "里加", coordinates: [24.1052, 56.9496], kind: "port" },
  { id: "minsk", label: "明斯克", coordinates: [27.5615, 53.9045], kind: "city" },
  { id: "smolensk", label: "斯摩棱斯克", coordinates: [32.0453, 54.7826], kind: "city" },
  { id: "moscow", label: "莫斯科", coordinates: [37.6173, 55.7558], kind: "capital" },
  { id: "leningrad", label: "列宁格勒", coordinates: [30.3351, 59.9343], kind: "city" },
  { id: "kiev", label: "基辅", coordinates: [30.5234, 50.4501], kind: "capital" },
  { id: "kharkov", label: "哈尔科夫", coordinates: [36.2304, 49.9935], kind: "city" },
  { id: "rostov", label: "罗斯托夫", coordinates: [39.7015, 47.2357], kind: "city" },
  { id: "sevastopol", label: "塞瓦斯托波尔", coordinates: [33.5254, 44.6167], kind: "port" },
  { id: "maykop", label: "迈科普", coordinates: [40.1058, 44.6098], kind: "objective" },
  { id: "stalingrad", label: "斯大林格勒", coordinates: [44.5018, 48.708], kind: "city" },
  { id: "kursk", label: "库尔斯克", coordinates: [36.1874, 51.7373], kind: "city" },
  { id: "orel", label: "奥廖尔", coordinates: [36.0644, 52.9671], kind: "city" },
  { id: "gomel", label: "戈梅利", coordinates: [30.9754, 52.4345], kind: "city" },
  { id: "vilnius", label: "维尔纽斯", coordinates: [25.2797, 54.6872], kind: "city" },
  { id: "lublin", label: "卢布林", coordinates: [22.5684, 51.2465], kind: "city" },
  { id: "budapest", label: "布达佩斯", coordinates: [19.0402, 47.4979], kind: "capital" },
  { id: "vienna", label: "维也纳", coordinates: [16.3738, 48.2082], kind: "capital" },
  { id: "oder", label: "奥得河", coordinates: [14.55, 52.55], kind: "front" },
  { id: "prague", label: "布拉格", coordinates: [14.4378, 50.0755], kind: "capital" }
];

export const frontLines: FrontLine[] = [
  {
    id: "army-group-north",
    faction: "germany",
    label: "北方集团军群：波罗的海-列宁格勒",
    from: "kaunas",
    to: "leningrad",
    start: "1941-06-22",
    end: "1941-09-08",
    visibleUntil: "1944-01-27",
    unitVisibleUntil: "1941-12-05",
    routeKind: "land",
    unitIcon: "tank",
    width: 9,
    intensity: 0.85
  },
  {
    id: "army-group-centre-minsk",
    faction: "germany",
    label: "中央集团军群：明斯克合围",
    from: "brest",
    to: "minsk",
    start: "1941-06-22",
    end: "1941-07-03",
    visibleUntil: "1944-06-22",
    unitVisibleUntil: "1941-12-05",
    routeKind: "land",
    unitIcon: "tank",
    width: 12,
    intensity: 1
  },
  {
    id: "army-group-centre-smolensk",
    faction: "germany",
    label: "中央集团军群：斯摩棱斯克方向",
    from: "minsk",
    to: "smolensk",
    start: "1941-07-10",
    end: "1941-08-05",
    visibleUntil: "1944-06-22",
    unitVisibleUntil: "1941-12-05",
    routeKind: "land",
    unitIcon: "tank",
    width: 11,
    intensity: 0.95
  },
  {
    id: "typhoon-moscow",
    faction: "germany",
    label: "台风行动：逼近莫斯科",
    from: "smolensk",
    to: "moscow",
    start: "1941-09-30",
    end: "1941-12-05",
    visibleUntil: "1942-01-15",
    unitVisibleUntil: "1941-12-05",
    routeKind: "land",
    unitIcon: "tank",
    width: 10,
    intensity: 0.9
  },
  {
    id: "army-group-south-kiev",
    faction: "germany",
    label: "南方集团军群：基辅大合围",
    from: "brest",
    to: "kiev",
    start: "1941-06-22",
    end: "1941-09-26",
    visibleUntil: "1943-11-06",
    unitVisibleUntil: "1942-11-19",
    routeKind: "land",
    unitIcon: "tank",
    width: 10,
    intensity: 0.9
  },
  {
    id: "crimea-sevastopol",
    faction: "germany",
    label: "克里米亚与塞瓦斯托波尔",
    from: "kiev",
    to: "sevastopol",
    start: "1941-10-24",
    end: "1942-07-04",
    visibleUntil: "1944-05-12",
    unitVisibleUntil: "1942-11-19",
    routeKind: "land",
    unitIcon: "tank",
    width: 7,
    intensity: 0.68
  },
  {
    id: "case-blue",
    faction: "germany",
    label: "蓝色方案：顿河-伏尔加",
    from: "kharkov",
    to: "stalingrad",
    start: "1942-06-28",
    end: "1942-09-13",
    visibleUntil: "1943-02-02",
    unitVisibleUntil: "1942-11-19",
    routeKind: "land",
    unitIcon: "tank",
    width: 12,
    intensity: 1
  },
  {
    id: "caucasus-drive",
    faction: "germany",
    label: "高加索油田方向",
    from: "rostov",
    to: "maykop",
    start: "1942-07-23",
    end: "1942-08-10",
    visibleUntil: "1943-02-02",
    unitVisibleUntil: "1942-11-19",
    routeKind: "land",
    unitIcon: "tank",
    width: 8,
    intensity: 0.72
  },
  {
    id: "uranus-encirclement",
    faction: "allies",
    label: "天王星行动：钳形合围",
    from: "stalingrad",
    to: "rostov",
    start: "1942-11-19",
    end: "1943-02-02",
    routeKind: "land",
    unitIcon: "tank",
    width: 11,
    intensity: 1
  },
  {
    id: "kursk-counterstroke",
    faction: "allies",
    label: "库尔斯克后反攻",
    from: "kursk",
    to: "orel",
    start: "1943-07-12",
    end: "1943-08-23",
    routeKind: "land",
    unitIcon: "tank",
    width: 10,
    intensity: 0.92
  },
  {
    id: "dnieper-kiev",
    faction: "allies",
    label: "第聂伯河会战与基辅解放",
    from: "kursk",
    to: "kiev",
    start: "1943-08-26",
    end: "1943-11-06",
    routeKind: "land",
    unitIcon: "tank",
    width: 10,
    intensity: 0.86
  },
  {
    id: "bagration-minsk",
    faction: "allies",
    label: "巴格拉季昂行动：粉碎中央集团军群",
    from: "gomel",
    to: "minsk",
    start: "1944-06-22",
    end: "1944-07-03",
    routeKind: "land",
    unitIcon: "tank",
    width: 13,
    intensity: 1
  },
  {
    id: "bagration-vistula",
    faction: "allies",
    label: "推进至维斯瓦河",
    from: "minsk",
    to: "warsaw",
    start: "1944-07-04",
    end: "1944-08-02",
    routeKind: "land",
    unitIcon: "tank",
    width: 11,
    intensity: 0.9
  },
  {
    id: "balkans-hungary",
    faction: "allies",
    label: "罗马尼亚转向与巴尔干推进",
    from: "kiev",
    to: "budapest",
    start: "1944-08-20",
    end: "1945-02-13",
    routeKind: "land",
    unitIcon: "tank",
    width: 9,
    intensity: 0.78
  },
  {
    id: "vistula-oder",
    faction: "allies",
    label: "维斯瓦-奥得攻势",
    from: "warsaw",
    to: "oder",
    start: "1945-01-12",
    end: "1945-02-03",
    routeKind: "land",
    unitIcon: "tank",
    width: 13,
    intensity: 1
  },
  {
    id: "berlin-offensive",
    faction: "allies",
    label: "柏林战役",
    from: "oder",
    to: "berlin",
    start: "1945-04-16",
    end: "1945-05-02",
    routeKind: "land",
    unitIcon: "tank",
    width: 12,
    intensity: 1
  },
  {
    id: "prague-final",
    faction: "allies",
    label: "布拉格方向与战争终局",
    from: "vienna",
    to: "prague",
    start: "1945-04-13",
    end: "1945-05-09",
    routeKind: "land",
    unitIcon: "tank",
    width: 8,
    intensity: 0.72
  }
];

export const battleEvents: BattleEvent[] = [
  {
    id: "barbarossa",
    date: "1941-06-22",
    title: "巴巴罗萨行动爆发",
    location: "波罗的海至黑海边境",
    coordinates: [24.2, 52.2],
    phase: "战略突袭",
    summary: "德国及其盟国越过苏德边境，东线战争以大规模闪击开始。",
    detail:
      "德军把进攻分为北方、中央、南方三个主要方向，试图迅速摧毁苏军主力并夺取列宁格勒、莫斯科和乌克兰资源区。",
    significance:
      "这一天把欧洲战争扩大为工业、空间和人口规模都极端庞大的消耗战，德国速胜假设从此接受现实检验。",
    mapFocus: ["brest", "kaunas", "kiev"]
  },
  {
    id: "minsk-smolensk",
    date: "1941-07-10",
    title: "明斯克至斯摩棱斯克合围",
    location: "白俄罗斯、斯摩棱斯克方向",
    coordinates: [30.2, 54.4],
    phase: "纵深合围",
    summary: "中央集团军群快速推进，多个苏军集团军被包围，但抵抗拖慢了通向莫斯科的节奏。",
    detail:
      "装甲矛头在白俄罗斯取得巨大包围战果，却也暴露补给距离、步兵跟进和侧翼安全问题。苏军不断重建防线。",
    significance:
      "德军仍在前进，但从边境突袭转入纵深消耗；苏军以空间换时间，莫斯科方向没有被一击打穿。",
    mapFocus: ["minsk", "smolensk", "moscow"]
  },
  {
    id: "leningrad-siege",
    date: "1941-09-08",
    title: "列宁格勒围困形成",
    location: "列宁格勒",
    coordinates: [30.3351, 59.9343],
    phase: "北线围困",
    summary: "北方集团军群抵近列宁格勒，城市进入长期围困状态。",
    detail:
      "列宁格勒未被迅速攻下，而是陷入围困、炮击、饥荒和湖上补给线维持的艰难防御。",
    significance:
      "北线无法转化为快速政治胜利，苏军和城市居民的坚持把德国计划拖入持久战。",
    mapFocus: ["leningrad", "riga", "kaunas"]
  },
  {
    id: "kiev-pocket",
    date: "1941-09-26",
    title: "基辅大合围结束",
    location: "基辅",
    coordinates: [30.5234, 50.4501],
    phase: "南线包围",
    summary: "德军在乌克兰完成大规模包围，夺取重要农业、工业与交通区域。",
    detail:
      "南方集团军群和从中央方向转来的装甲兵力夹击基辅地区。战果巨大，但也消耗了进攻莫斯科的季节窗口。",
    significance:
      "基辅战役体现了德国战略目标的分裂：歼灭苏军、夺取资源和直取莫斯科之间难以同时满足。",
    mapFocus: ["kiev", "kharkov", "moscow"]
  },
  {
    id: "moscow-counteroffensive",
    date: "1941-12-05",
    title: "莫斯科城下反攻",
    location: "莫斯科",
    coordinates: [37.6173, 55.7558],
    phase: "速胜破产",
    summary: "德军在莫斯科近郊受阻，苏军冬季反攻迫使德军后退。",
    detail:
      "泥泞、寒冬、补给压力与苏军预备队共同削弱了台风行动。苏军在莫斯科方向发动反击，德国首次在东线遭遇战略性挫败。",
    significance:
      "莫斯科没有陷落，说明苏联国家与军队没有被第一年闪击摧毁；战争转向长期工业消耗。",
    mapFocus: ["smolensk", "moscow"]
  },
  {
    id: "case-blue-start",
    date: "1942-06-28",
    title: "蓝色方案启动",
    location: "顿河、伏尔加和高加索方向",
    coordinates: [39.5, 48.8],
    phase: "资源南进",
    summary: "德军把主攻转向南方，目标是伏尔加交通线和高加索油田。",
    detail:
      "1942年德军不再全面进攻，而是集中南线，试图夺取石油资源并切断苏联南北交通。",
    significance:
      "目标同时指向斯大林格勒和高加索，使德军战线被拉长，也为苏军反包围创造条件。",
    mapFocus: ["kharkov", "rostov", "stalingrad", "maykop"]
  },
  {
    id: "stalingrad-urban",
    date: "1942-09-13",
    title: "斯大林格勒巷战白热化",
    location: "斯大林格勒",
    coordinates: [44.5018, 48.708],
    phase: "城市消耗",
    summary: "德军攻入斯大林格勒市区，战斗变成逐街逐厂争夺。",
    detail:
      "伏尔加河畔的城市战削弱了德军机动优势。苏军把防御贴近德军前沿，降低德军空炮优势，持续向河东补充兵力。",
    significance:
      "斯大林格勒从交通目标变成政治与军事绞肉机，双方都被迫投入越来越多资源。",
    mapFocus: ["stalingrad", "rostov"]
  },
  {
    id: "uranus",
    date: "1942-11-19",
    title: "天王星行动合围第6集团军",
    location: "斯大林格勒两翼",
    coordinates: [43.1, 49.2],
    phase: "战略反包围",
    summary: "苏军攻击德军侧翼的罗马尼亚等盟军部队，在斯大林格勒外线完成合围。",
    detail:
      "苏军没有正面硬啃市区德军主力，而是选择两翼薄弱环节突破，装甲与机械化部队向卡拉奇会合。",
    significance:
      "东线主动权开始逆转：德军从包围者变为被包围者，南线整体布局发生连锁危机。",
    mapFocus: ["stalingrad", "rostov", "maykop"]
  },
  {
    id: "stalingrad-surrender",
    date: "1943-02-02",
    title: "斯大林格勒德军投降",
    location: "斯大林格勒",
    coordinates: [44.5018, 48.708],
    phase: "转折确认",
    summary: "被围德军残部投降，德国在东线遭遇灾难性失败。",
    detail:
      "空中补给无法维持包围圈，解围尝试失败。第6集团军和轴心国盟军损失沉重。",
    significance:
      "斯大林格勒成为东线心理和战略转折点，苏联开始更有信心地组织连续大规模攻势。",
    mapFocus: ["stalingrad"]
  },
  {
    id: "kursk",
    date: "1943-07-05",
    title: "库尔斯克会战",
    location: "库尔斯克突出部",
    coordinates: [36.1874, 51.7373],
    phase: "装甲决战",
    summary: "德国发动堡垒行动攻击库尔斯克突出部，苏军纵深防御吸收攻势后转入反攻。",
    detail:
      "德军试图夺回主动权；苏军预设多层反坦克、防空、雷场和预备队体系，随后在奥廖尔、别尔哥罗德-哈尔科夫方向反击。",
    significance:
      "库尔斯克后德军再难组织同等规模战略攻势，苏军掌握长期主动权。",
    mapFocus: ["kursk", "orel", "kharkov"]
  },
  {
    id: "dnieper",
    date: "1943-11-06",
    title: "第聂伯河与基辅解放",
    location: "第聂伯河、基辅",
    coordinates: [30.5234, 50.4501],
    phase: "乌克兰反攻",
    summary: "苏军强渡第聂伯河并解放基辅，德军东线防御继续西退。",
    detail:
      "第聂伯河是重要天然屏障。苏军以多个桥头堡和持续突击突破德军防线，重新夺回乌克兰政治中心。",
    significance:
      "苏军证明自己能连续突破河流防线，东线从局部转折变成体系化反攻。",
    mapFocus: ["kiev", "gomel", "kursk"]
  },
  {
    id: "bagration",
    date: "1944-06-22",
    title: "巴格拉季昂行动",
    location: "白俄罗斯",
    coordinates: [28.8, 53.6],
    phase: "集团军群崩溃",
    summary: "苏军在白俄罗斯发动大规模攻势，德国中央集团军群遭到毁灭性打击。",
    detail:
      "苏军通过欺骗、集中炮兵和装甲突破撕开德军防线，迅速解放明斯克并推进至波兰方向。",
    significance:
      "这次攻势摧毁德军东线中段，使苏军逼近维斯瓦河和东普鲁士，德国战略纵深急剧缩短。",
    mapFocus: ["gomel", "minsk", "warsaw"]
  },
  {
    id: "warsaw-vistula",
    date: "1944-08-02",
    title: "苏军抵达维斯瓦河",
    location: "华沙、维斯瓦河",
    coordinates: [21.0122, 52.2297],
    phase: "逼近德国本土",
    summary: "苏军推进至华沙附近和维斯瓦河一线，东线战场进入德国边境前沿。",
    detail:
      "经过夏季连续突击，苏军到达维斯瓦河，但后勤、兵力重组和政治复杂性使攻势在部分地段暂停。",
    significance:
      "德国已失去东欧缓冲地带，下一步战场将直接指向奥得河和柏林。",
    mapFocus: ["warsaw", "lublin", "berlin"]
  },
  {
    id: "romania-budapest",
    date: "1944-08-23",
    title: "罗马尼亚转向与巴尔干震荡",
    location: "罗马尼亚、匈牙利方向",
    coordinates: [26.1, 47.1],
    phase: "南翼瓦解",
    summary: "罗马尼亚转向削弱德国南翼，苏军向巴尔干和匈牙利推进。",
    detail:
      "轴心国盟友体系开始连锁动摇。苏军和当地政治变化共同压缩德军在东南欧的战略空间。",
    significance:
      "德国失去关键油源和南翼支撑，柏林方向与多瑙河方向同时承压。",
    mapFocus: ["budapest", "vienna", "kiev"]
  },
  {
    id: "vistula-oder",
    date: "1945-01-12",
    title: "维斯瓦-奥得攻势",
    location: "波兰至奥得河",
    coordinates: [17.5, 52.4],
    phase: "终局突进",
    summary: "苏军从维斯瓦河桥头堡出击，数周内推进至奥得河，距柏林已很近。",
    detail:
      "德军在波兰防线迅速崩溃。苏军以强大炮兵、装甲和纵深突破能力向德国本土推进。",
    significance:
      "柏林进入前线视野，德国东线已经失去战略恢复可能。",
    mapFocus: ["warsaw", "oder", "berlin"]
  },
  {
    id: "berlin-battle",
    date: "1945-04-16",
    title: "柏林战役开始",
    location: "奥得河、柏林",
    coordinates: [13.405, 52.52],
    phase: "首都决战",
    summary: "苏军越过奥得河和尼斯河防线，向柏林发起最终攻势。",
    detail:
      "白俄罗斯第1方面军和乌克兰第1方面军从东、南方向压向柏林。城市战与外围合围同步展开。",
    significance:
      "东线战争进入政治和军事终点，纳粹德国的核心权力空间被直接攻入。",
    mapFocus: ["oder", "berlin", "vienna"]
  },
  {
    id: "berlin-surrender",
    date: "1945-05-02",
    title: "柏林守军投降",
    location: "柏林",
    coordinates: [13.405, 52.52],
    phase: "德国崩溃",
    summary: "柏林市区战斗结束，德国军事与政治中枢崩溃。",
    detail:
      "经过街垒、地铁、政府区和国会大厦周边战斗，柏林守军投降。欧洲战争只剩最后投降手续。",
    significance:
      "柏林陷落标志苏德战争的决定性终局，欧洲战场的战争即将正式结束。",
    mapFocus: ["berlin", "oder"]
  },
  {
    id: "victory-day",
    date: "1945-05-09",
    title: "德国无条件投降生效",
    location: "柏林、欧洲战场",
    coordinates: [13.405, 52.52],
    phase: "战争结束",
    summary: "德国签署并确认无条件投降，苏德战争和欧洲战场战争结束。",
    detail:
      "投降文件在欧洲时间5月8日晚、莫斯科时间5月9日生效。本动画按中国语境常用的5月9日胜利日收束。",
    significance:
      "1941年开始的东线战争以苏联胜利、德国战败和欧洲秩序重组告终。",
    mapFocus: ["berlin", "prague", "vienna"]
  }
];
