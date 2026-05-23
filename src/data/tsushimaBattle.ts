import type { BattleEvent, FrontLine, MapPoint } from "./battleOfFrance";

const japaneseMainBattleLine = [
  { id: "mikasa", label: "三笠", badgeLabel: "日", offset: [0, 0] as [number, number] },
  { id: "shikishima", label: "敷岛", badgeLabel: "日", offset: [-58, 0] as [number, number] },
  { id: "fuji", label: "富士", badgeLabel: "日", offset: [-116, 0] as [number, number] },
  { id: "asahi", label: "朝日", badgeLabel: "日", offset: [-174, 0] as [number, number] }
];

const russianMainBattleLine = [
  { id: "suvorov", label: "苏沃洛夫", badgeLabel: "俄", offset: [0, -18] as [number, number] },
  { id: "oslyabya", label: "奥斯利亚比亚", badgeLabel: "俄", offset: [0, 18] as [number, number] },
  { id: "alexander-iii", label: "亚历山大三世", badgeLabel: "俄", offset: [-62, -18] as [number, number] },
  { id: "borodino", label: "博罗季诺", badgeLabel: "俄", offset: [-62, 18] as [number, number] }
];

const russianReorderedBattleLine = [
  { id: "alexander-iii", label: "亚历山大三世", badgeLabel: "俄", offset: [0, -14] as [number, number] },
  { id: "borodino", label: "博罗季诺", badgeLabel: "俄", offset: [-58, -12] as [number, number] },
  { id: "orel", label: "鹰号", badgeLabel: "俄", offset: [-116, -8] as [number, number] },
  { id: "nikolai-i", label: "尼古拉一世", badgeLabel: "俄", offset: [-174, 8] as [number, number] }
];

const russianScatteredLine = [
  { id: "orel", label: "鹰号", badgeLabel: "俄", offset: [0, -24] as [number, number] },
  { id: "nikolai-i", label: "尼古拉一世", badgeLabel: "俄", offset: [0, 0] as [number, number] },
  { id: "senyavin", label: "谢尼亚文", badgeLabel: "俄", offset: [-52, 26] as [number, number] }
];

const japaneseTorpedoLine = [
  { id: "destroyers", label: "驱逐舰队", badgeLabel: "日", offset: [0, -20] as [number, number] },
  { id: "torpedo-boats", label: "鱼雷艇队", badgeLabel: "日", offset: [-50, 20] as [number, number] }
];

export const campaignStart = "1905-05-27T12:00";
export const campaignEnd = "1905-05-28T12:00";

export const mapPoints: MapPoint[] = [
  { id: "busan", label: "釜山", coordinates: [129.0756, 35.1796], kind: "port" },
  { id: "tsushima", label: "对马岛", coordinates: [129.29, 34.48], kind: "front" },
  { id: "korea-strait", label: "朝鲜海峡南口", coordinates: [128.45, 33.72], kind: "front" },
  { id: "shinano-sighting", label: "信浓丸接触", coordinates: [128.78, 34.08], kind: "front" },
  { id: "russian-column", label: "俄纵队北上", coordinates: [129.1, 34.26], kind: "front" },
  { id: "russian-pre-turn", label: "俄前导未越线", coordinates: [129.18, 34.48], kind: "front" },
  { id: "togo-approach", label: "联合舰队东侧接近", coordinates: [130.3, 34.72], kind: "front" },
  { id: "togo-turn", label: "东乡回头转向", coordinates: [129.86, 34.74], kind: "front", revealAt: "1905-05-27T14:05" },
  { id: "oslyabya-suvorov", label: "俄前导舰受创", coordinates: [129.48, 34.8], kind: "front", revealAt: "1905-05-27T14:20" },
  { id: "first-battle", label: "第一合战区", coordinates: [129.56, 35.02], kind: "front", revealAt: "1905-05-27T14:20" },
  { id: "second-battle", label: "第二合战区", coordinates: [129.82, 35.28], kind: "front", revealAt: "1905-05-27T17:30" },
  { id: "russian-breakup", label: "俄舰队分散", coordinates: [130.1, 35.5], kind: "front", revealAt: "1905-05-27T17:30" },
  { id: "night-attack", label: "夜战雷击区", coordinates: [130.42, 35.78], kind: "front", revealAt: "1905-05-27T19:30" },
  { id: "takeshima", label: "残部投降海域", coordinates: [130.78, 36.08], kind: "front", revealAt: "1905-05-28T10:30" },
  { id: "sasebo", label: "佐世保", coordinates: [129.72, 33.16], kind: "port" },
  { id: "sasebo-offshore", label: "佐世保外海", coordinates: [129.32, 33.2], kind: "front" },
  { id: "mokpo", label: "木浦外海", coordinates: [126.38, 34.78], kind: "port" }
];

export const crossingSalvoEffects = [
  {
    id: "tsushima-first-crossing-salvo",
    type: "salvo" as const,
    start: "1905-05-27T14:18",
    end: "1905-05-27T14:36",
    from: [129.62, 34.84] as [number, number],
    to: [129.48, 34.8] as [number, number],
    label: "第一合战齐射",
    testId: "tsushima-first-crossing-salvo",
    shellOffsets: [
      [-22, -12],
      [-6, -6],
      [10, 2],
      [26, 8]
    ] as Array<[number, number]>,
    impactOffsets: [
      [-12, -8],
      [2, -12],
      [12, -2],
      [-4, 10]
    ] as Array<[number, number]>
  },
  {
    id: "tsushima-second-crossing-salvo",
    type: "salvo" as const,
    start: "1905-05-27T17:28",
    end: "1905-05-27T17:46",
    from: [130.02, 35.24] as [number, number],
    to: [129.92, 35.26] as [number, number],
    label: "再横切齐射",
    testId: "tsushima-second-crossing-salvo",
    shellOffsets: [
      [-18, -10],
      [-4, -4],
      [12, 4],
      [28, 10]
    ] as Array<[number, number]>,
    impactOffsets: [
      [-10, -8],
      [4, -10],
      [14, 0],
      [-2, 10]
    ] as Array<[number, number]>
  }
];

export const frontLines: FrontLine[] = [
  {
    id: "russian-night-approach",
    faction: "germany",
    label: "俄第二太平洋舰队夜航北上",
    from: "korea-strait",
    to: "shinano-sighting",
    routeKind: "sea",
    start: "1905-05-27T12:00",
    end: "1905-05-27T13:15",
    visibleUntil: "1905-05-28T12:00",
    unitVisibleUntil: "1905-05-27T13:14",
    unitGroupId: "russian-main-fleet",
    unitIcon: "warship",
    formationUnits: russianMainBattleLine,
    width: 10,
    intensity: 0.9
  },
  {
    id: "russian-column-north",
    faction: "germany",
    label: "俄主力纵队保持北上",
    from: "shinano-sighting",
    to: "russian-pre-turn",
    routeKind: "sea",
    start: "1905-05-27T13:15",
    end: "1905-05-27T14:10",
    visibleUntil: "1905-05-28T05:00",
    unitVisibleUntil: "1905-05-27T14:09",
    unitGroupId: "russian-main-fleet",
    unitIcon: "warship",
    formationUnits: russianMainBattleLine,
    waypoints: [[129.04, 34.3]],
    width: 10,
    intensity: 0.86
  },
  {
    id: "japanese-sortie-sasebo",
    faction: "allies",
    label: "日本主力由佐世保出击",
    from: "sasebo-offshore",
    to: "togo-approach",
    routeKind: "sea",
    start: "1905-05-27T12:00",
    end: "1905-05-27T13:45",
    unitVisibleUntil: "1905-05-27T13:44",
    unitGroupId: "japanese-main-fleet",
    unitIcon: "warship",
    formationUnits: japaneseMainBattleLine,
    waypoints: [
      [129.3, 33.55],
      [129.52, 33.95],
      [129.92, 34.36]
    ],
    width: 11,
    intensity: 1
  },
  {
    id: "togo-loop-turn",
    faction: "allies",
    label: "东乡回头转向抢占前方",
    from: "togo-approach",
    to: "togo-turn",
    routeKind: "sea",
    start: "1905-05-27T13:45",
    end: "1905-05-27T14:10",
    unitVisibleUntil: "1905-05-27T14:09",
    unitGroupId: "japanese-main-fleet",
    unitIcon: "warship",
    formationUnits: japaneseMainBattleLine,
    waypoints: [
      [130.18, 34.92],
      [130.02, 34.92]
    ],
    width: 12,
    intensity: 1
  },
  {
    id: "crossing-the-t",
    faction: "allies",
    label: "第一合战：横切俄前导",
    from: "togo-turn",
    to: "first-battle",
    routeKind: "sea",
    start: "1905-05-27T14:10",
    end: "1905-05-27T14:55",
    unitVisibleUntil: "1905-05-27T14:59",
    unitGroupId: "japanese-main-fleet",
    unitIcon: "warship",
    formationUnits: japaneseMainBattleLine,
    waypoints: [
      [129.62, 34.76],
      [129.48, 34.9]
    ],
    width: 13,
    intensity: 1
  },
  {
    id: "russian-flagship-chaos",
    faction: "germany",
    label: "苏沃洛夫号失控、俄队形紊乱",
    from: "russian-pre-turn",
    to: "first-battle",
    routeKind: "sea",
    start: "1905-05-27T14:10",
    end: "1905-05-27T15:20",
    visibleUntil: "1905-05-28T05:00",
    unitVisibleUntil: "1905-05-27T15:19",
    unitGroupId: "russian-main-fleet",
    unitIcon: "warship",
    formationUnits: russianReorderedBattleLine,
    waypoints: [
      [129.32, 34.68],
      [129.48, 34.82]
    ],
    width: 8,
    intensity: 0.62
  },
  {
    id: "japanese-second-turn",
    faction: "allies",
    label: "第二合战：再横切北逃舰列",
    from: "first-battle",
    to: "second-battle",
    routeKind: "sea",
    start: "1905-05-27T15:20",
    end: "1905-05-27T17:30",
    unitVisibleUntil: "1905-05-27T17:59",
    unitGroupId: "japanese-main-fleet",
    unitIcon: "warship",
    formationUnits: japaneseMainBattleLine,
    waypoints: [
      [130.08, 35.08],
      [130.12, 35.24]
    ],
    width: 11,
    intensity: 0.92
  },
  {
    id: "russian-breakout-scatter",
    faction: "germany",
    label: "俄残队分散向北逃",
    from: "oslyabya-suvorov",
    to: "russian-breakup",
    routeKind: "sea",
    start: "1905-05-27T15:20",
    end: "1905-05-27T18:30",
    visibleUntil: "1905-05-28T10:30",
    unitVisibleUntil: "1905-05-27T18:29",
    unitGroupId: "russian-main-fleet",
    unitIcon: "warship",
    formationUnits: russianScatteredLine,
    waypoints: [
      [129.66, 35.1],
      [129.9, 35.34]
    ],
    width: 7,
    intensity: 0.52
  },
  {
    id: "torpedo-night-attack",
    faction: "allies",
    label: "夜战：驱逐舰与鱼雷艇夹击",
    from: "second-battle",
    to: "night-attack",
    routeKind: "sea",
    start: "1905-05-27T19:30",
    end: "1905-05-28T03:00",
    unitVisibleUntil: "1905-05-28T03:00",
    unitGroupId: "japanese-screen",
    unitIcon: "warship",
    formationUnits: japaneseTorpedoLine,
    waypoints: [
      [130.26, 35.46],
      [130.62, 35.56]
    ],
    width: 8,
    intensity: 0.78
  },
  {
    id: "japanese-dawn-envelopment",
    faction: "allies",
    label: "拂晓包围残部",
    from: "night-attack",
    to: "takeshima",
    routeKind: "sea",
    start: "1905-05-28T05:00",
    end: "1905-05-28T10:00",
    retainUnitAfterRouteEnd: true,
    unitGroupId: "japanese-main-fleet",
    unitIcon: "warship",
    formationUnits: japaneseMainBattleLine,
    waypoints: [[130.9, 35.92]],
    width: 9,
    intensity: 0.82
  },
  {
    id: "russian-remnants-surrender",
    faction: "germany",
    label: "俄残部被包围投降",
    from: "russian-breakup",
    to: "takeshima",
    routeKind: "sea",
    start: "1905-05-28T05:00",
    end: "1905-05-28T10:30",
    visibleUntil: "1905-05-28T12:00",
    unitVisibleUntil: "1905-05-28T09:59",
    unitGroupId: "russian-main-fleet",
    unitIcon: "warship",
    formationUnits: russianScatteredLine,
    width: 7,
    intensity: 0.5
  }
];

export const battleEvents: BattleEvent[] = [
  {
    id: "shinano-maru-contact",
    date: "1905-05-27T12:00",
    title: "信浓丸发现俄舰队",
    location: "对马海峡南口外海",
    coordinates: [128.78, 34.08],
    phase: "侦察接触",
    summary: "清晨信浓丸发现俄国第二太平洋舰队，动画从中午舰队入峡开始压缩呈现接敌过程。",
    detail:
      "对马海战不是双方偶然撞上。信浓丸清晨发现并回报俄舰队，日军通过侦察和无线电获得截击时间；为避免前奏空跑，画面从中午舰队入峡和日军前出开始。",
    significance: "侦察让日军先手成立，俄舰队虽然继续北上，但已经失去隐蔽穿越海峡的机会。",
    mapFocus: ["shinano-sighting", "korea-strait", "togo-approach"]
  },
  {
    id: "russian-column-enters",
    date: "1905-05-27T12:20",
    title: "俄舰队进入对马海峡",
    location: "朝鲜海峡南口",
    coordinates: [128.45, 33.72],
    phase: "接敌前",
    summary: "俄国第二太平洋舰队从南口北上，试图穿过对马海峡前往海参崴。",
    detail:
      "罗杰斯特文斯基舰队远航至东亚后选择穿越对马海峡。舰队航速、队形和通信能力都处于不利状态。",
    significance: "战场被压缩在对马海峡，双方即将在狭窄海域进行决定性舰队会战。",
    mapFocus: ["korea-strait", "shinano-sighting", "tsushima"]
  },
  {
    id: "contact-report",
    date: "1905-05-27T13:40",
    title: "日军侦察确认接触",
    location: "对马岛西南海域",
    coordinates: [129.08, 34.3],
    phase: "发现敌舰",
    summary: "日军巡洋舰与无线电报告确认俄舰队位置，东乡平八郎主力舰队开始截击。",
    detail:
      "日本舰队依托近岸基地、侦察和无线电组织截击，而俄舰队必须在被发现后继续维持北上纵队。",
    significance: "战术主动权转向日军：东乡可以选择切入角度，而俄舰队难以及时重组。",
    mapFocus: ["shinano-sighting", "russian-column", "togo-approach"]
  },
  {
    id: "togo-turn",
    date: "1905-05-27T14:05",
    title: "东乡回头转向截断航路",
    location: "对马海峡中部",
    coordinates: [129.86, 34.74],
    phase: "横切机动",
    summary: "日本联合舰队在俄舰队前方回头转向，冒短暂暴露风险换取横切俄前导的炮战位置。",
    detail:
      "东乡不是在俄舰队尾后追击，而是从东侧切入，在俄舰队前方转向，使日本主力获得集中火力打击前导舰的角度。",
    significance: "这一步奠定了“丁字战法”的火力几何优势，日本舰队把队形优势转化为命中优势。",
    mapFocus: ["togo-approach", "togo-turn", "russian-pre-turn"]
  },
  {
    id: "first-crossing-fire",
    date: "1905-05-27T14:20",
    title: "第一合战：T字炮火压前导",
    location: "对马岛东北近海",
    coordinates: [129.48, 34.8],
    phase: "主力炮战",
    summary: "日舰队集中火力打击俄前导舰，俄舰队的纵队航向和指挥开始失序。",
    detail:
      "日本舰队速度、训练、火控和高爆弹效果共同放大了横切优势。俄前导舰承受集中火力，后续舰只难以展开成有效火线。",
    significance: "战斗从舰队通过海峡变成俄舰队队形崩溃，日本海军掌握海上决胜主动。",
    mapFocus: ["togo-turn", "oslyabya-suvorov", "first-battle"]
  },
  {
    id: "oslyabya-suvorov-disabled",
    date: "1905-05-27T15:10",
    title: "奥斯利亚比亚沉没、苏沃洛夫号失控",
    location: "对马岛东北海域",
    coordinates: [129.56, 35.04],
    phase: "俄前导崩溃",
    summary: "俄舰队前导受重创，旗舰失去有效指挥，俄纵队被迫转向和分散。",
    detail:
      "俄国舰队原本依赖纵队北上穿越海峡；前导舰和旗舰被打乱后，整个队形既无法保持速度，也无法组织同等规模的集中火力。",
    significance: "这解释了为什么后续不是单纯追逐，而是日军不断横切、俄舰队不断失去组织性的过程。",
    mapFocus: ["oslyabya-suvorov", "first-battle", "second-battle"]
  },
  {
    id: "second-crossing-fire",
    date: "1905-05-27T17:30",
    title: "第二合战：日军再横切北逃舰列",
    location: "对马岛以北海域",
    coordinates: [129.92, 35.26],
    phase: "再截击",
    summary: "日本主力利用速度优势再次横切俄舰队北逃方向，迫使残队继续偏转和分散。",
    detail:
      "对马海战的态势不是一条直线追击。日军多次用较高航速重新占位，让俄舰队残部每次试图北上都遭到侧前方火力压迫。",
    significance: "第二次截击让俄舰队白天恢复队形的机会消失，为夜间鱼雷艇攻击创造条件。",
    mapFocus: ["first-battle", "second-battle", "russian-breakup"]
  },
  {
    id: "night-torpedo",
    date: "1905-05-27T19:30",
    title: "夜战雷击与追击",
    location: "对马岛以北海域",
    coordinates: [130.45, 35.78],
    phase: "夜间追击",
    summary: "夜幕后，日本驱逐舰和鱼雷艇继续攻击，俄舰队残部进一步分散。",
    detail:
      "主力炮战后，日军轻型舰艇在夜间追击受损俄舰。俄舰队试图分散北逃，但组织性已经严重削弱。",
    significance: "夜战使俄舰队无法恢复队形，也让第二天残部投降成为大概率结局。",
    mapFocus: ["second-battle", "russian-breakup", "night-attack"]
  },
  {
    id: "nebogatov-surrenders",
    date: "1905-05-28T10:30",
    title: "俄舰残部投降",
    location: "对马海峡以北",
    coordinates: [130.72, 36.12],
    phase: "会战结束",
    summary: "涅鲍加托夫所率俄舰残部被包围后投降，对马海战以日本决定性胜利收束。",
    detail:
      "少数俄舰逃脱，多数被击沉、俘获或自沉。俄国远东海上力量遭到毁灭性打击。",
    significance: "对马海战确认日本在东亚海上的优势，也加速日俄战争走向谈判终局。",
    mapFocus: ["night-attack", "takeshima"]
  }
];

export const cueEventIds = new Set([
  "togo-turn",
  "first-crossing-fire",
  "oslyabya-suvorov-disabled",
  "second-crossing-fire",
  "night-torpedo",
  "nebogatov-surrenders"
]);
