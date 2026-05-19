import type { BattleEvent, FrontLine, MapPoint } from "./battleOfFrance";

export const campaignStart = "1990-08-02";
export const campaignEnd = "1991-02-28";

export const mapPoints: MapPoint[] = [
  { id: "baghdad", label: "巴格达", coordinates: [44.3661, 33.3152], kind: "capital" },
  { id: "basra", label: "巴士拉", coordinates: [47.78, 30.51], kind: "city" },
  { id: "kuwait-city", label: "科威特城", coordinates: [47.9783, 29.3759], kind: "capital" },
  { id: "riyadh", label: "利雅得", coordinates: [46.6753, 24.7136], kind: "capital" },
  { id: "dhahran", label: "达兰", coordinates: [50.0888, 26.2361], kind: "front" },
  { id: "khafji", label: "海夫吉", coordinates: [48.4913, 28.4391], kind: "front" },
  { id: "hafar", label: "哈费尔巴廷", coordinates: [45.9708, 28.4328], kind: "front" },
  { id: "wadi-batin", label: "巴廷河谷", coordinates: [46.2, 29.6], kind: "front" },
  { id: "iraq-border-west", label: "西翼沙漠", coordinates: [43.8, 30.3], kind: "front" },
  { id: "highway-80", label: "80号公路", coordinates: [47.0, 29.7], kind: "front" }
];

export const frontLines: FrontLine[] = [
  {
    id: "iraq-kuwait-invasion",
    faction: "germany",
    label: "伊拉克装甲南下",
    from: "basra",
    to: "kuwait-city",
    routeKind: "land",
    start: "1990-08-02",
    end: "1990-08-04",
    visibleUntil: "1991-02-27",
    unitVisibleUntil: "1991-02-24",
    unitIcon: "tank"
  },
  {
    id: "desert-shield-deployment",
    faction: "allies",
    label: "沙漠盾牌：联军展开",
    from: "riyadh",
    to: "dhahran",
    routeKind: "land",
    start: "1990-08-07",
    end: "1990-08-08",
    unitIcon: "tank",
    waypoints: [[48.0, 25.5]]
  },
  {
    id: "strategic-air-war",
    faction: "allies",
    label: "空袭伊拉克指挥中枢",
    from: "dhahran",
    to: "baghdad",
    routeKind: "air",
    start: "1991-01-17",
    end: "1991-02-23",
    unitIcon: "fighter",
    waypoints: [
      [48.8, 29.5],
      [46.2, 32.1]
    ]
  },
  {
    id: "khafji-counterattack",
    faction: "germany",
    label: "海夫吉反击",
    from: "kuwait-city",
    to: "khafji",
    routeKind: "land",
    start: "1991-01-29",
    end: "1991-02-01",
    visibleUntil: "1991-02-24",
    unitVisibleUntil: "1991-02-01",
    unitIcon: "tank"
  },
  {
    id: "marines-kuwait-front",
    faction: "allies",
    label: "科威特正面突破",
    from: "dhahran",
    to: "kuwait-city",
    routeKind: "land",
    start: "1991-02-24",
    end: "1991-02-27",
    unitIcon: "tank",
    waypoints: [[48.7, 27.9]]
  },
  {
    id: "left-hook",
    faction: "allies",
    label: "西翼左勾拳",
    from: "hafar",
    to: "basra",
    routeKind: "land",
    start: "1991-02-24",
    end: "1991-02-27",
    unitIcon: "tank",
    waypoints: [
      [43.8, 30.3],
      [45.6, 31.2]
    ]
  },
  {
    id: "wadi-batin-fix",
    faction: "allies",
    label: "巴廷河谷牵制",
    from: "hafar",
    to: "wadi-batin",
    routeKind: "land",
    start: "1991-02-24",
    end: "1991-02-25",
    unitIcon: "tank"
  },
  {
    id: "highway-80-retreat",
    faction: "germany",
    label: "伊军沿80号公路撤退",
    from: "kuwait-city",
    to: "basra",
    routeKind: "land",
    start: "1991-02-26",
    end: "1991-02-27",
    visibleUntil: "1991-02-28",
    unitVisibleUntil: "1991-02-27",
    unitIcon: "tank",
    waypoints: [[47.0, 29.7]]
  }
];

export const battleEvents: BattleEvent[] = [
  {
    id: "iraq-invades-kuwait",
    date: "1990-08-02",
    title: "伊拉克入侵科威特",
    location: "科威特",
    coordinates: [47.9783, 29.3759],
    phase: "危机爆发",
    summary: "伊拉克军队越境进入科威特，迅速控制科威特城。",
    detail: "萨达姆政权以债务、石油和边界争端为借口发动入侵。科威特被占使海湾能源通道和沙特安全直接暴露在伊拉克装甲力量面前。",
    significance: "战争从地区争端升级为国际危机，联合国和美国主导的多国联军开始集结。",
    mapFocus: ["basra", "kuwait-city"]
  },
  {
    id: "desert-shield",
    date: "1990-08-07",
    title: "沙漠盾牌部署",
    location: "沙特阿拉伯",
    coordinates: [50.0888, 26.2361],
    phase: "联军集结",
    summary: "美军和多国联军进入沙特，先建立防御屏障，再准备反攻。",
    detail: "沙漠盾牌的关键不是立即进攻，而是把空军、装甲、后勤和港口机场体系铺开，阻止伊拉克继续南下。",
    significance: "联军获得安全集结区，战争节奏从危机应对转入体系化联合战役准备。",
    mapFocus: ["riyadh", "dhahran", "kuwait-city"]
  },
  {
    id: "air-war",
    date: "1991-01-17",
    title: "沙漠风暴空袭开始",
    location: "伊拉克与科威特战区",
    coordinates: [44.3661, 33.3152],
    phase: "空中战役",
    summary: "联军以大规模空袭攻击伊拉克指挥、通信、防空和地面部队。",
    detail: "空中战役持续削弱伊拉克的战役协同能力。精确制导弹药、电子战和联合作战节奏成为这场战争最显著的现代化特征。",
    significance: "地面进攻开始前，伊拉克军队的防空、指挥与机动能力已被显著压制。",
    mapFocus: ["baghdad", "basra", "kuwait-city"]
  },
  {
    id: "khafji",
    date: "1991-01-29",
    title: "海夫吉战斗",
    location: "沙特北部海夫吉",
    coordinates: [48.4913, 28.4391],
    phase: "边境反击",
    summary: "伊拉克部队短暂攻入海夫吉，随后被沙特、卡塔尔和美军火力击退。",
    detail: "海夫吉暴露伊拉克仍有局部主动行动能力，但也显示联军空地火力、侦察和盟军地面部队能快速封堵反击。",
    significance: "这是地面战前最重要的边境战斗，也验证联军火力体系的反应速度。",
    mapFocus: ["khafji", "kuwait-city", "dhahran"]
  },
  {
    id: "ground-war",
    date: "1991-02-24",
    title: "地面战开始",
    location: "科威特与伊拉克南部",
    coordinates: [46.2, 29.6],
    phase: "百小时地面战",
    summary: "联军从科威特正面和西部沙漠同时发动地面进攻。",
    detail: "正面部队固定伊拉克在科威特的防线，西翼装甲则绕向伊军侧后，形成典型的宽正面欺骗与深远包抄。",
    significance: "空中优势转化为地面突破，伊拉克防线开始快速瓦解。",
    mapFocus: ["hafar", "wadi-batin", "kuwait-city"]
  },
  {
    id: "left-hook",
    date: "1991-02-25",
    title: "西翼左勾拳展开",
    location: "伊拉克南部沙漠",
    coordinates: [43.8, 30.3],
    phase: "装甲包抄",
    summary: "联军装甲主力从西部沙漠大纵深穿插，绕过科威特正面防线。",
    detail: "第七军等装甲力量向伊拉克南部推进，试图切断共和国卫队退路。速度、导航和后勤成为沙漠纵深机动的关键。",
    significance: "伊拉克军队被迫面对侧后威胁，科威特战场的防御体系失去稳定结构。",
    mapFocus: ["hafar", "iraq-border-west", "basra"]
  },
  {
    id: "highway-of-death",
    date: "1991-02-26",
    title: "80号公路撤退遭打击",
    location: "科威特城至巴士拉方向",
    coordinates: [47.0, 29.7],
    phase: "撤退崩溃",
    summary: "伊拉克部队从科威特撤退，在通往巴士拉的道路上遭联军火力重创。",
    detail: "撤退纵队被空地火力持续打击，成为海湾战争最具争议也最震撼的画面之一。",
    significance: "科威特战区的伊军组织性快速崩溃，停火压力随即上升。",
    mapFocus: ["kuwait-city", "highway-80", "basra"]
  },
  {
    id: "kuwait-liberated",
    date: "1991-02-27",
    title: "科威特城解放",
    location: "科威特城",
    coordinates: [47.9783, 29.3759],
    phase: "目标达成",
    summary: "联军进入科威特城，伊拉克军队退出科威特。",
    detail: "科威特主权恢复成为联军作战的核心政治目标。地面战在极短时间内达成主要战役目标。",
    significance: "联军完成授权目标，没有继续推进到巴格达推翻伊拉克政权。",
    mapFocus: ["kuwait-city", "basra"]
  },
  {
    id: "ceasefire",
    date: "1991-02-28",
    title: "停火生效",
    location: "海湾战区",
    coordinates: [47.78, 30.51],
    phase: "战争收束",
    summary: "美国宣布停火，百小时地面战结束。",
    detail: "战争以科威特解放和伊拉克军队撤出为终点。随后的制裁、禁飞区和地区安全结构继续塑造海湾局势。",
    significance: "第一次海湾战争展示了冷战后高技术联合作战的压倒性效果，也留下长期地区后果。",
    mapFocus: ["basra", "kuwait-city"]
  }
];

export const cueEventIds = new Set([
  "iraq-invades-kuwait",
  "air-war",
  "khafji",
  "ground-war",
  "left-hook",
  "highway-of-death",
  "kuwait-liberated"
]);

export const diveCueEventIds = new Set(["air-war", "highway-of-death"]);
