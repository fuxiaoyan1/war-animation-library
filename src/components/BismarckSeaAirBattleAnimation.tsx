import {
  battleEvents,
  campaignEnd,
  campaignStart,
  cueEventIds,
  cueEventKinds,
  diveCueEventIds,
  frontLines,
  mapPoints
} from "../data/bismarckSeaAirBattle";
import { bismarckSeaCampaignCountries, bismarckSeaCountryClassName } from "../lib/geoMap";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { withUnitBadgeLabels } from "../lib/unitBadges";
import { publicPath } from "../lib/publicPath";
import { CampaignMapAnimation, type BattleEffectElement, type NarrationCue } from "./CampaignMapAnimation";

const activeSpans = frontLines.map(({ end, start }) => ({ end, start }));
const semanticFrontLines = withUnitBadgeLabels(frontLines, {
  allies: "盟",
  germany: "日"
});

const timeline = createCampaignTimeline({
  activeSpans,
  campaignEnd,
  campaignStart,
  events: battleEvents,
  gapScale: 0.04,
  inactiveGapDisplayDays: 0.04,
  maxGapDays: 1,
  points: mapPoints,
  timingMode: "compressed"
});

const narrationCues: NarrationCue[] = [
  {
    id: "convoy",
    start: "1943-03-01T08:00",
    end: "1943-03-02T12:00",
    title: "第一幕 / 海上运输线",
    text: "日军船队从拉包尔驶向莱城，盟军侦察机开始搜索和跟踪，空中打击的时间窗口由情报决定。"
  },
  {
    id: "attack",
    start: "1943-03-03T10:30",
    end: "1943-03-03T18:00",
    title: "第二幕 / 高低空协同",
    text: "高空轰炸先迫使船队机动，随后 B-25 与 A-20 低空进入，以扫射和跳弹轰炸撕裂队形。"
  },
  {
    id: "pursuit",
    start: "1943-03-04T08:00",
    end: "1943-03-04T18:00",
    title: "终幕 / 追击收束",
    text: "残余船只向莱城外海分散，盟军攻击波继续从新几内亚机场出击，海上增援企图失败。"
  }
];

const battleEffects: BattleEffectElement[] = [
  {
    id: "skip-bombing",
    type: "salvo",
    start: "1943-03-03T11:45",
    end: "1943-03-03T12:25",
    from: [147.4, -6.6],
    to: [147.05, -5.2],
    label: "低空跳弹命中区",
    testId: "bismarck-sea-skip-bombing",
    shellOffsets: [
      [-20, 10],
      [10, -12],
      [24, 16],
      [-4, -24]
    ],
    impactOffsets: [
      [-18, -8],
      [10, -14],
      [22, 3],
      [-4, 14]
    ]
  }
];

export function BismarckSeaAirBattleAnimation() {
  return (
    <CampaignMapAnimation
      activeSpans={activeSpans}
      ariaLabel="俾斯麦海海空战动态地图"
      battleEffects={battleEffects}
      battleEvents={battleEvents}
      campaignEnd={campaignEnd}
      campaignStart={campaignStart}
      cinematicMode
      countries={bismarckSeaCampaignCountries}
      countryClassName={bismarckSeaCountryClassName}
      cueEventKinds={cueEventKinds}
      cueEvents={cueEventIds}
      diveCueEvents={diveCueEventIds}
      eyebrow="战争动画藏书馆 / 二战空战"
      focusSteps={[
        { fromProgress: 0, focus: "bismarckSeaWide" },
        { fromProgress: timeline.dateToProgress("1943-03-03T10:30"), focus: "bismarckSeaBattle" },
        { fromProgress: timeline.dateToProgress("1943-03-04T08:00"), focus: "bismarckSeaLae" }
      ]}
      frontLines={semanticFrontLines}
      gapScale={0.04}
      inactiveGapDisplayDays={0.04}
      legendAxis="侦察 / 高空轰炸 / 低空攻击"
      legendPrimary="日军船队"
      legendSecondary="盟军航空兵"
      mapPoints={mapPoints}
      maxGapDays={1}
      musicSource={publicPath("/audio/wikimedia-liberty-bell.ogg")}
      narrationCues={narrationCues}
      playbackDurationSeconds={300}
      regionLabels={[
        { label: "BISMARCK SEA", coordinates: [148.5, -5.7] },
        { label: "NEW GUINEA", coordinates: [147.2, -8.2] },
        { label: "RABAUL", coordinates: [152.0, -4.35] }
      ]}
      shellClassName="bismarck-sea-air-battle modern-war ww2-air-war"
      sfxProfile="ww2"
      subtitle="全片按5分钟播放设计：拉包尔出航、侦察跟踪、高低空协同攻击、跳弹轰炸撕裂船队、残余目标追击。"
      tacticalRouteRetention
      terrainZones={[]}
      testId="bismarck-sea-app"
      timeCounterLabel="小时"
      timeStepDays={1 / 24}
      timingMode="compressed"
      timelineTitle="俾斯麦海：空中力量截断海上运输"
      title="俾斯麦海海空战"
      unitIcon="ww2AttackAircraft"
    />
  );
}
