import type { BattleEvent, FrontLine, MapPoint } from "./battleOfFrance";

export const campaignStart = "BCE-0264-01-01";
export const campaignEnd = "BCE-0146-01-01";

export const mapPoints: MapPoint[] = [
  { id: "rome", label: "罗马", coordinates: [12.4964, 41.9028], kind: "capital" },
  { id: "ostia", label: "奥斯提亚", coordinates: [12.29, 41.74], kind: "port" },
  { id: "carthage", label: "迦太基", coordinates: [10.323, 36.8529], kind: "capital" },
  { id: "messana", label: "墨西拿", coordinates: [15.554, 38.1938], kind: "port" },
  { id: "syracuse", label: "叙拉古", coordinates: [15.2866, 37.0755], kind: "port" },
  { id: "agrigentum", label: "阿格里真托", coordinates: [13.5765, 37.3111], kind: "front" },
  { id: "mylae", label: "米莱", coordinates: [15.38, 38.42], kind: "port" },
  { id: "ecnomus", label: "埃克诺穆斯", coordinates: [13.86, 36.78], kind: "port" },
  { id: "zama", label: "扎马", coordinates: [9.32, 36.2], kind: "front" },
  { id: "new-carthage", label: "新迦太基", coordinates: [-0.9862, 37.6257], kind: "port" },
  { id: "saguntum", label: "萨贡托", coordinates: [-0.2735, 39.679], kind: "city" },
  { id: "pyrenees", label: "比利牛斯", coordinates: [1.3, 42.6], kind: "front" },
  { id: "rhone", label: "罗讷河", coordinates: [4.84, 43.95], kind: "front" },
  { id: "alps", label: "阿尔卑斯", coordinates: [7.7, 45.5], kind: "front" },
  { id: "trebia", label: "特雷比亚", coordinates: [9.63, 45.05], kind: "front" },
  { id: "trasimene", label: "特拉西梅诺", coordinates: [12.1, 43.12], kind: "front" },
  { id: "cannae", label: "坎尼", coordinates: [16.15, 41.3], kind: "front" },
  { id: "capua", label: "卡普阿", coordinates: [14.2117, 41.0832], kind: "city" },
  { id: "baecula", label: "拜库拉", coordinates: [-3.51, 38.1], kind: "front" },
  { id: "metaurus", label: "梅陶罗", coordinates: [12.9, 43.8], kind: "front" },
  { id: "utica", label: "乌提卡", coordinates: [10.05, 37.05], kind: "port" }
];

export const frontLines: FrontLine[] = [
  {
    id: "sicily-first-operation",
    faction: "rome",
    label: "西西里第1次作战：墨西拿介入",
    from: "ostia",
    to: "messana",
    routeKind: "sea",
    start: "BCE-0264-01-01",
    end: "BCE-0263-01-01",
    unitVisibleUntil: "BCE-0263-01-01",
    unitIcon: "ship",
    waypoints: [
      [12.62, 40.55],
      [13.7, 39.25],
      [14.75, 38.55]
    ]
  },
  {
    id: "sicily-second-operation",
    faction: "rome",
    label: "西西里第2次作战：阿格里真托",
    from: "messana",
    to: "agrigentum",
    routeKind: "land",
    start: "BCE-0262-01-01",
    end: "BCE-0261-01-01",
    unitIcon: "cavalry"
  },
  {
    id: "naval-operation",
    faction: "rome",
    label: "海上第1次作战：米莱-埃克诺穆斯",
    from: "mylae",
    to: "ecnomus",
    routeKind: "sea",
    start: "BCE-0260-01-01",
    end: "BCE-0256-01-01",
    unitVisibleUntil: "BCE-0256-01-01",
    unitIcon: "ship",
    waypoints: [
      [15.8, 38.05],
      [15.55, 37.4],
      [14.9, 36.78],
      [14.25, 36.66]
    ]
  },
  {
    id: "carthage-counter-sicily",
    faction: "carthage",
    label: "西西里第3次作战：迦太基坚守",
    from: "carthage",
    to: "syracuse",
    routeKind: "sea",
    start: "BCE-0255-01-01",
    end: "BCE-0241-01-01",
    visibleUntil: "BCE-0241-01-01",
    unitVisibleUntil: "BCE-0241-01-01",
    unitIcon: "ship",
    waypoints: [
      [11.25, 36.45],
      [13.1, 36.7],
      [14.8, 36.85]
    ]
  },
  {
    id: "hannibal-spain",
    faction: "carthage",
    label: "伊比利亚第1次作战：萨贡托",
    from: "new-carthage",
    to: "saguntum",
    routeKind: "land",
    start: "BCE-0219-01-01",
    end: "BCE-0218-01-01",
    visibleUntil: "BCE-0202-01-01",
    unitVisibleUntil: "BCE-0209-01-01",
    unitIcon: "cavalry"
  },
  {
    id: "hannibal-alps",
    faction: "carthage",
    label: "汉尼拔远征：阿尔卑斯越岭",
    from: "saguntum",
    to: "alps",
    routeKind: "land",
    start: "BCE-0218-01-01",
    end: "BCE-0217-01-01",
    visibleUntil: "BCE-0202-01-01",
    unitVisibleUntil: "BCE-0209-01-01",
    unitIcon: "cavalry",
    waypoints: [
      [1.3, 42.6],
      [4.84, 43.95]
    ]
  },
  {
    id: "italy-first-operation",
    faction: "carthage",
    label: "意大利第1次作战：特雷比亚",
    from: "alps",
    to: "trebia",
    routeKind: "land",
    start: "BCE-0218-02-01",
    end: "BCE-0218-12-01",
    visibleUntil: "BCE-0202-01-01",
    unitVisibleUntil: "BCE-0209-01-01",
    unitIcon: "cavalry"
  },
  {
    id: "italy-second-operation",
    faction: "carthage",
    label: "意大利第2次作战：特拉西梅诺",
    from: "trebia",
    to: "trasimene",
    routeKind: "land",
    start: "BCE-0217-01-01",
    end: "BCE-0217-06-01",
    visibleUntil: "BCE-0202-01-01",
    unitVisibleUntil: "BCE-0209-01-01",
    unitIcon: "cavalry"
  },
  {
    id: "italy-third-operation",
    faction: "carthage",
    label: "意大利第3次作战：坎尼",
    from: "trasimene",
    to: "cannae",
    routeKind: "land",
    start: "BCE-0216-01-01",
    end: "BCE-0216-08-01",
    visibleUntil: "BCE-0202-01-01",
    unitVisibleUntil: "BCE-0209-01-01",
    unitIcon: "cavalry"
  },
  {
    id: "rome-counter-italy",
    faction: "rome",
    label: "意大利第4次作战：罗马消耗反击",
    from: "rome",
    to: "capua",
    routeKind: "land",
    start: "BCE-0215-01-01",
    end: "BCE-0211-01-01",
    unitIcon: "cavalry"
  },
  {
    id: "spain-second-operation",
    faction: "rome",
    label: "伊比利亚第2次作战：新迦太基",
    from: "ostia",
    to: "new-carthage",
    routeKind: "sea",
    start: "BCE-0210-01-01",
    end: "BCE-0209-01-01",
    unitVisibleUntil: "BCE-0209-01-01",
    unitIcon: "ship",
    waypoints: [
      [10.4, 40.2],
      [7.4, 39.45],
      [3.6, 38.9],
      [0.5, 38.35]
    ]
  },
  {
    id: "spain-third-operation",
    faction: "rome",
    label: "伊比利亚第3次作战：拜库拉",
    from: "new-carthage",
    to: "baecula",
    routeKind: "land",
    start: "BCE-0208-01-01",
    end: "BCE-0206-01-01",
    unitIcon: "cavalry"
  },
  {
    id: "africa-operation",
    faction: "rome",
    label: "非洲第1次作战：乌提卡-扎马",
    from: "utica",
    to: "zama",
    routeKind: "land",
    start: "BCE-0204-01-01",
    end: "BCE-0202-01-01",
    unitIcon: "cavalry"
  },
  {
    id: "third-punic",
    faction: "rome",
    label: "非洲第2次作战：围攻迦太基",
    from: "utica",
    to: "carthage",
    routeKind: "land",
    start: "BCE-0149-01-01",
    end: "BCE-0146-01-01",
    unitIcon: "cavalry"
  }
];

export const battleEvents: BattleEvent[] = [
  {
    id: "first-punic-start",
    date: "BCE-0264-01-01",
    title: "第一次布匿战争：墨西拿危机",
    location: "西西里、墨西拿",
    coordinates: [15.554, 38.1938],
    phase: "西西里争夺",
    summary: "罗马介入墨西拿事务，与迦太基在西西里发生长期战争。",
    detail: "西西里战区反复争夺，本动画按第1次、第2次、第3次作战分层展示，避免重复态势线堆叠。",
    significance: "罗马首次大规模跨海作战，与海上强权迦太基正面竞争。",
    mapFocus: ["rome", "carthage", "messana"]
  },
  {
    id: "agrigentum",
    date: "BCE-0262-01-01",
    title: "西西里第2次作战：阿格里真托",
    location: "阿格里真托",
    coordinates: [13.5765, 37.3111],
    phase: "陆上海岛战",
    summary: "罗马在西西里取得重要陆上胜利，但仍需解决迦太基海权。",
    detail: "罗马军团适合陆战，却必须学习造舰和海战才能维持跨海战役。",
    significance: "战争从岛上争夺升级为海陆综合较量。",
    mapFocus: ["messana", "agrigentum", "carthage"]
  },
  {
    id: "mylae",
    date: "BCE-0260-01-01",
    title: "海上第1次作战：米莱",
    location: "米莱",
    coordinates: [15.243, 38.22],
    phase: "罗马造舰",
    summary: "罗马舰队利用接舷装置取得早期海战胜利。",
    detail: "罗马把海战转化为近似陆战的登船格斗，弥补航海传统不足。",
    significance: "罗马证明自己能挑战迦太基海权，战争持续扩大。",
    mapFocus: ["mylae", "rome", "carthage"]
  },
  {
    id: "aegates",
    date: "BCE-0241-01-01",
    title: "第一次布匿战争结束",
    location: "西西里西部海域",
    coordinates: [12.3, 37.95],
    phase: "罗马夺取西西里",
    summary: "罗马在海上取得决定性胜利，迦太基放弃西西里。",
    detail: "长期战争拖垮双方财政，罗马最后重建舰队并切断迦太基补给。",
    significance: "西西里成为罗马第一个海外行省，地中海力量平衡改变。",
    mapFocus: ["rome", "carthage", "messana"]
  },
  {
    id: "saguntum",
    date: "BCE-0219-01-01",
    title: "第二次布匿战争：萨贡托",
    location: "萨贡托",
    coordinates: [-0.2735, 39.679],
    phase: "汉尼拔崛起",
    summary: "汉尼拔攻取萨贡托，引发罗马与迦太基的新一轮战争。",
    detail: "迦太基在伊比利亚重建资源基地，汉尼拔选择主动把战争带向意大利。",
    significance: "第二次布匿战争从伊比利亚点燃，随即转入欧洲大陆远征。",
    mapFocus: ["new-carthage", "saguntum"]
  },
  {
    id: "alps",
    date: "BCE-0218-01-01",
    title: "汉尼拔越过阿尔卑斯",
    location: "阿尔卑斯",
    coordinates: [7.7, 45.5],
    phase: "战略奇袭",
    summary: "迦太基军经伊比利亚、高卢和阿尔卑斯进入意大利。",
    detail: "远征路线避开罗马海上拦截，以高风险山地机动换取战略突然性。",
    significance: "汉尼拔把战场带到罗马本土，迫使罗马在意大利承受长期压力。",
    mapFocus: ["saguntum", "pyrenees", "alps"]
  },
  {
    id: "trebia",
    date: "BCE-0218-12-01",
    title: "意大利第1次作战：特雷比亚",
    location: "特雷比亚",
    coordinates: [9.63, 45.05],
    phase: "北意大利突破",
    summary: "汉尼拔在特雷比亚击败罗马军，争取高卢盟友。",
    detail: "北意大利同一区域后续仍有行动，路线以第1次作战标识，避免与后续拉锯混淆。",
    significance: "罗马意识到汉尼拔不是边境袭扰，而是能在本土歼灭执政官军队的强敌。",
    mapFocus: ["alps", "trebia", "rome"]
  },
  {
    id: "trasimene",
    date: "BCE-0217-06-01",
    title: "意大利第2次作战：特拉西梅诺",
    location: "特拉西梅诺湖",
    coordinates: [12.1, 43.12],
    phase: "伏击",
    summary: "汉尼拔在湖畔设伏，重创追击的罗马军。",
    detail: "机动、地形和诱敌结合，使罗马再次遭遇灾难性失败。",
    significance: "罗马转向费边迟滞战略，避免轻易被诱入决战。",
    mapFocus: ["trebia", "trasimene", "rome"]
  },
  {
    id: "cannae",
    date: "BCE-0216-08-01",
    title: "意大利第3次作战：坎尼",
    location: "坎尼",
    coordinates: [16.15, 41.3],
    phase: "包围歼灭",
    summary: "汉尼拔以双重包围歼灭罗马大军，取得战术巅峰胜利。",
    detail: "罗马兵力优势被迦太基中央后撤和两翼包卷反转，战场损失极其惨重。",
    significance: "坎尼成为军事史经典歼灭战，但汉尼拔仍无法迫使罗马政治崩溃。",
    mapFocus: ["trasimene", "cannae", "capua"]
  },
  {
    id: "capua",
    date: "BCE-0211-01-01",
    title: "意大利第4次作战：罗马消耗反击",
    location: "卡普阿",
    coordinates: [14.2117, 41.0832],
    phase: "战略韧性",
    summary: "罗马避免决战，逐步收复意大利盟邦并削弱汉尼拔。",
    detail: "罗马把战争从一次决战改成资源和同盟体系的长期消耗，汉尼拔胜利无法转化为补给和政治终局。",
    significance: "罗马战略韧性成为第二次布匿战争转折的基础。",
    mapFocus: ["rome", "capua", "cannae"]
  },
  {
    id: "new-carthage",
    date: "BCE-0209-01-01",
    title: "伊比利亚第2次作战：新迦太基",
    location: "新迦太基",
    coordinates: [-0.9862, 37.6257],
    phase: "西班牙转折",
    summary: "西庇阿攻占新迦太基，切断迦太基在伊比利亚的重要基地。",
    detail: "罗马不再只在意大利防守，而是攻击迦太基资源和兵源后方。",
    significance: "战争主动权开始转向罗马，汉尼拔在意大利越来越孤立。",
    mapFocus: ["new-carthage", "baecula"]
  },
  {
    id: "metaurus",
    date: "BCE-0207-01-01",
    title: "梅陶罗河阻援",
    location: "梅陶罗河",
    coordinates: [12.9, 43.8],
    phase: "阻断会合",
    summary: "罗马击败哈斯德鲁巴援军，汉尼拔失去关键增援希望。",
    detail: "迦太基试图从伊比利亚再越阿尔卑斯增援意大利，但在会合前被罗马截断。",
    significance: "汉尼拔在意大利的战略前景大幅恶化。",
    mapFocus: ["alps", "metaurus", "rome"]
  },
  {
    id: "zama",
    date: "BCE-0202-01-01",
    title: "非洲第1次作战：扎马",
    location: "扎马",
    coordinates: [9.32, 36.2],
    phase: "罗马反攻非洲",
    summary: "西庇阿在北非击败汉尼拔，第二次布匿战争结束。",
    detail: "罗马把战争带到迦太基本土，迫使汉尼拔回援并接受决定性会战。",
    significance: "迦太基丧失大国地位，罗马成为西地中海主导力量。",
    mapFocus: ["utica", "zama", "carthage"]
  },
  {
    id: "third-punic-start",
    date: "BCE-0149-01-01",
    title: "第三次布匿战争：围攻开始",
    location: "迦太基",
    coordinates: [10.323, 36.8529],
    phase: "终局围城",
    summary: "罗马再次出兵北非，长期围攻迦太基城。",
    detail: "第三次战争不再是势均力敌的霸权争夺，而是罗马决意消灭迦太基独立力量。",
    significance: "战争性质从竞争转向彻底摧毁。",
    mapFocus: ["utica", "carthage"]
  },
  {
    id: "carthage-falls",
    date: "BCE-0146-01-01",
    title: "迦太基陷落",
    location: "迦太基",
    coordinates: [10.323, 36.8529],
    phase: "布匿战争结束",
    summary: "罗马攻陷并摧毁迦太基，三次布匿战争终结。",
    detail: "城市经过长期围攻后被攻破，迦太基国家灭亡，北非成为罗马势力范围。",
    significance: "罗马成为地中海世界最强权力，之后的扩张进入帝国化阶段。",
    mapFocus: ["rome", "carthage"]
  }
];

export const battleCueEventIds = new Set(battleEvents.map((event) => event.id));
