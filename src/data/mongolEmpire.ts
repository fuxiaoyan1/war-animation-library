import type { BattleEvent, FrontLine, MapPoint } from "./battleOfFrance";

export const campaignStart = "1206-01-01";
export const campaignEnd = "1279-03-19";

export const mapPoints: MapPoint[] = [
  { id: "karakorum", label: "哈拉和林", coordinates: [102.84, 47.2], kind: "capital" },
  { id: "onon", label: "斡难河", coordinates: [110.6, 49.3], kind: "front" },
  { id: "zhongdu", label: "中都", coordinates: [116.4074, 39.9042], kind: "capital" },
  { id: "xingqing", label: "兴庆", coordinates: [106.2782, 38.4664], kind: "capital" },
  { id: "bukhara", label: "布哈拉", coordinates: [64.4286, 39.767], kind: "city" },
  { id: "samarkand", label: "撒马尔罕", coordinates: [66.9749, 39.627], kind: "city" },
  { id: "merv", label: "木鹿", coordinates: [62.177, 37.662], kind: "city" },
  { id: "nishapur", label: "尼沙普尔", coordinates: [58.7958, 36.2133], kind: "city" },
  { id: "kalka", label: "迦勒迦河", coordinates: [37.6, 47.1], kind: "front" },
  { id: "kyiv", label: "基辅", coordinates: [30.5234, 50.4501], kind: "capital" },
  { id: "baghdad", label: "巴格达", coordinates: [44.3661, 33.3152], kind: "capital" },
  { id: "kaifeng", label: "开封", coordinates: [114.3076, 34.7973], kind: "capital" },
  { id: "linan", label: "临安", coordinates: [120.1551, 30.2741], kind: "capital" },
  { id: "xiangyang", label: "襄阳", coordinates: [112.1224, 32.009], kind: "front" },
  { id: "yamen", label: "崖山", coordinates: [113.16, 22.18], kind: "front" }
];

export const frontLines: FrontLine[] = [
  {
    id: "unification-steppe",
    faction: "carthage",
    label: "草原诸部统一",
    from: "onon",
    to: "karakorum",
    start: "1206-01-01",
    end: "1206-12-31",
    unitIcon: "cavalry"
  },
  {
    id: "western-xia",
    faction: "carthage",
    label: "西夏方向作战",
    from: "karakorum",
    to: "xingqing",
    start: "1209-01-01",
    end: "1209-09-01",
    unitIcon: "cavalry"
  },
  {
    id: "jin-zhongdu",
    faction: "carthage",
    label: "金朝中都方向",
    from: "karakorum",
    to: "zhongdu",
    start: "1211-01-01",
    end: "1215-06-01",
    unitIcon: "cavalry",
    waypoints: [[111.0, 41.0]]
  },
  {
    id: "khwarezm-opening",
    faction: "carthage",
    label: "花剌子模第1次作战：河中",
    from: "karakorum",
    to: "samarkand",
    start: "1219-09-01",
    end: "1220-03-01",
    unitIcon: "cavalry",
    waypoints: [
      [92.0, 45.0],
      [78.0, 43.0],
      [68.8, 41.3]
    ]
  },
  {
    id: "khwarezm-iran",
    faction: "carthage",
    label: "花剌子模第2次作战：呼罗珊",
    from: "samarkand",
    to: "nishapur",
    start: "1220-03-02",
    end: "1221-04-01",
    unitIcon: "cavalry",
    waypoints: [
      [64.4286, 39.767],
      [62.177, 37.662]
    ]
  },
  {
    id: "subutai-western-raid",
    faction: "carthage",
    label: "速不台西探：高加索-罗斯",
    from: "nishapur",
    to: "kalka",
    start: "1221-04-02",
    end: "1223-05-31",
    unitIcon: "cavalry",
    waypoints: [
      [51.4, 35.7],
      [44.8, 41.7],
      [39.7, 44.6]
    ]
  },
  {
    id: "western-xia-final",
    faction: "carthage",
    label: "西夏终局",
    from: "karakorum",
    to: "xingqing",
    start: "1226-01-01",
    end: "1227-08-18",
    unitIcon: "cavalry"
  },
  {
    id: "jin-collapse",
    faction: "carthage",
    label: "金朝终局：汴京",
    from: "zhongdu",
    to: "kaifeng",
    start: "1232-01-01",
    end: "1234-02-09",
    unitIcon: "cavalry"
  },
  {
    id: "baghdad-campaign",
    faction: "carthage",
    label: "旭烈兀西征：巴格达",
    from: "samarkand",
    to: "baghdad",
    start: "1256-01-01",
    end: "1258-02-10",
    unitIcon: "cavalry",
    waypoints: [
      [58.4, 35.7],
      [50.0, 34.6]
    ]
  },
  {
    id: "song-xiangyang",
    faction: "carthage",
    label: "南宋第1次作战：襄阳",
    from: "kaifeng",
    to: "xiangyang",
    start: "1268-01-01",
    end: "1273-03-01",
    unitIcon: "cavalry"
  },
  {
    id: "song-linan",
    faction: "carthage",
    label: "南宋第2次作战：临安",
    from: "xiangyang",
    to: "linan",
    start: "1274-01-01",
    end: "1276-02-04",
    unitIcon: "cavalry"
  },
  {
    id: "song-yamen",
    faction: "carthage",
    label: "南宋第3次作战：崖山",
    from: "linan",
    to: "yamen",
    routeKind: "sea",
    start: "1276-02-05",
    end: "1279-03-19",
    unitIcon: "ship",
    waypoints: [
      [121.5, 28.0],
      [119.2, 24.7]
    ]
  }
];

export const battleEvents: BattleEvent[] = [
  {
    id: "kurultai-1206",
    date: "1206-01-01",
    title: "铁木真称成吉思汗",
    location: "蒙古高原",
    coordinates: [110.6, 49.3],
    phase: "草原统一",
    summary: "蒙古诸部在库里尔台上承认铁木真的最高权威，蒙古帝国形成。",
    detail: "统一后的草原军事组织把亲族、千户、侦察和机动作战合成一个可连续远征的体系。",
    significance: "从部落联盟到帝国军政机器，这是此后跨欧亚扩张的前提。",
    mapFocus: ["onon", "karakorum"]
  },
  {
    id: "western-xia-1209",
    date: "1209-09-01",
    title: "西夏称臣",
    location: "兴庆",
    coordinates: [106.2782, 38.4664],
    phase: "南缘突破",
    summary: "蒙古迫使西夏臣服，打开通向华北和河西走廊的压力面。",
    detail: "西夏不是一次性终结，而是成为蒙古与金、宋之间的战略缓冲和反复施压对象。",
    significance: "蒙古军获得对华北边缘的作战经验，也开始把草原战争导向城池和农耕区域。",
    mapFocus: ["karakorum", "xingqing"]
  },
  {
    id: "zhongdu-1215",
    date: "1215-06-01",
    title: "中都陷落",
    location: "中都",
    coordinates: [116.4074, 39.9042],
    phase: "金朝北方动摇",
    summary: "蒙古军攻陷金朝中都，金朝北方统治遭到重创。",
    detail: "骑兵机动与围城压力结合，迫使金朝战略重心南移，但战争并未立即结束。",
    significance: "蒙古对华北的战争从边境劫掠转为持续占领和王朝替代。",
    mapFocus: ["zhongdu", "kaifeng"]
  },
  {
    id: "samarkand-1220",
    date: "1220-03-01",
    title: "撒马尔罕陷落",
    location: "河中",
    coordinates: [66.9749, 39.627],
    phase: "中亚崩裂",
    summary: "蒙古军摧毁花剌子模核心城市链，中亚防线迅速瓦解。",
    detail: "多路骑兵越过沙漠和山口，切断城市之间的互援，把花剌子模从一个帝国打成孤立据点。",
    significance: "蒙古战争进入中亚和伊朗世界，东西商道和政治格局被重新洗牌。",
    mapFocus: ["bukhara", "samarkand", "merv"]
  },
  {
    id: "kalka-1223",
    date: "1223-05-31",
    title: "迦勒迦河之战",
    location: "黑海北岸草原",
    coordinates: [37.6, 47.1],
    phase: "西探",
    summary: "速不台、哲别远征军击败罗斯诸公和钦察联军。",
    detail: "这次作战更像战略侦察与惩戒远征，显示蒙古军可以跨越高加索和草原保持机动。",
    significance: "它预示了后来拔都西征和金帐汗国对东欧的长期影响。",
    mapFocus: ["kalka", "kyiv"]
  },
  {
    id: "xixia-final-1227",
    date: "1227-08-18",
    title: "西夏灭亡与成吉思汗去世",
    location: "河西、兴庆",
    coordinates: [106.2782, 38.4664],
    phase: "继承转折",
    summary: "蒙古最终灭西夏，同年成吉思汗去世，帝国转入继承与分封扩张阶段。",
    detail: "西夏终局清除了蒙古南缘长期隐患，但权力继承也使帝国扩张进入窝阔台时代。",
    significance: "蒙古扩张没有因创始者去世而停止，制度化战争机器继续运行。",
    mapFocus: ["xingqing", "karakorum"]
  },
  {
    id: "jin-falls-1234",
    date: "1234-02-09",
    title: "金朝灭亡",
    location: "汴京、蔡州方向",
    coordinates: [114.3076, 34.7973],
    phase: "华北定局",
    summary: "蒙古与南宋夹击金朝，金朝灭亡。",
    detail: "金朝的终局证明蒙古已能持续组织围城、补给和跨季节攻势，华北被纳入帝国体系。",
    significance: "北中国进入蒙古支配，为之后南宋战争和元朝建立铺平道路。",
    mapFocus: ["zhongdu", "kaifeng"]
  },
  {
    id: "baghdad-1258",
    date: "1258-02-10",
    title: "巴格达陷落",
    location: "巴格达",
    coordinates: [44.3661, 33.3152],
    phase: "西亚震荡",
    summary: "旭烈兀攻陷阿拔斯哈里发首都巴格达。",
    detail: "伊儿汗国方向的西征把蒙古军事压力推向两河流域，传统伊斯兰政治中心遭到毁灭性打击。",
    significance: "巴格达陷落成为欧亚政治和文化记忆中的巨大断裂点。",
    mapFocus: ["samarkand", "baghdad"]
  },
  {
    id: "xiangyang-1273",
    date: "1273-03-01",
    title: "襄阳陷落",
    location: "襄阳",
    coordinates: [112.1224, 32.009],
    phase: "南宋门户",
    summary: "长期围攻后，襄阳失守，南宋长江防线门户被打开。",
    detail: "围城器械、水陆封锁和持久消耗让蒙古军突破以往难以解决的南方城防问题。",
    significance: "南宋从战略防御转入连续崩溃，临安已暴露在元军推进轴线上。",
    mapFocus: ["xiangyang", "linan"]
  },
  {
    id: "linan-1276",
    date: "1276-02-04",
    title: "临安投降",
    location: "临安",
    coordinates: [120.1551, 30.2741],
    phase: "南宋主干崩溃",
    summary: "元军进入临安，南宋朝廷主干投降。",
    detail: "南宋残余力量继续向东南沿海转移，但政治和财政中心已经丧失。",
    significance: "元朝完成对中国核心地区的控制，只剩沿海残余抵抗。",
    mapFocus: ["linan", "yamen"]
  },
  {
    id: "yamen-1279",
    date: "1279-03-19",
    title: "崖山海战",
    location: "崖山",
    coordinates: [113.16, 22.18],
    phase: "终局",
    summary: "元军击败南宋残余水师，南宋灭亡。",
    detail: "残余朝廷在海上失败，宋元战争收束。蒙古帝国的东方部分转化为元朝统治。",
    significance: "中国重新统一在元朝框架下，蒙古征服从草原扩张转入帝国治理问题。",
    mapFocus: ["linan", "yamen"]
  }
];
