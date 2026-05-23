import {
  battleEvents,
  campaignEnd,
  campaignStart,
  cueEventIds,
  frontLines,
  mapPoints,
  radarSalvoEffects
} from "../data/guadalcanalNavalBattle";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { guadalcanalCampaignCountries, guadalcanalCountryClassName } from "../lib/geoMap";
import { publicPath } from "../lib/publicPath";
import { withUnitBadgeLabels } from "../lib/unitBadges";
import { CampaignMapAnimation, type NarrationCue } from "./CampaignMapAnimation";

const activeSpans = frontLines.map(({ end, start }) => ({ end, start }));

const timeline = createCampaignTimeline({
  activeSpans,
  campaignStart,
  campaignEnd,
  events: battleEvents,
  points: mapPoints
});

const tacticalFrontLines = withUnitBadgeLabels(frontLines, {
  allies: "美",
  germany: "日"
});

const narrationCues: NarrationCue[] = [
  {
    id: "approach",
    start: "1942-11-14T22:30",
    end: "1942-11-15T00:05",
    title: "第一幕 / 夜间接近",
    text: "日军炮击队沿槽海峡南下，美军战列舰队从南侧进入铁底湾。动画直接从接近航线开始，避免前奏空镜拖慢节奏。"
  },
  {
    id: "blackout",
    start: "1942-11-15T00:05",
    end: "1942-11-15T00:12",
    title: "第二幕 / 失电暴露",
    text: "南达科他号电力与通信故障让它暴露在探照灯和炮火下，夜战的技术系统问题立刻变成战术风险。"
  },
  {
    id: "radar",
    start: "1942-11-15T00:12",
    end: "1942-11-15T00:24",
    title: "第三幕 / 雷达火控",
    text: "华盛顿号保持隐蔽，用雷达火控锁定雾岛号。胜负窗口来自传感器、火控与纪律，而不只是战列舰口径。"
  },
  {
    id: "withdraw",
    start: "1942-11-15T00:24",
    end: "1942-11-15T04:00",
    title: "终幕 / 任务失败",
    text: "雾岛号失去战斗能力，日军放弃炮击机场撤退。这个夜晚的关键结果是亨德森机场没有被战列舰压制。"
  }
];

export function GuadalcanalNavalBattleAnimation() {
  return (
    <CampaignMapAnimation
      activeSpans={activeSpans}
      ariaLabel="第二次瓜岛海战动态地图"
      battleEvents={battleEvents}
      battleEffects={radarSalvoEffects}
      campaignEnd={campaignEnd}
      campaignStart={campaignStart}
      cinematicMode
      countries={guadalcanalCampaignCountries}
      countryClassName={guadalcanalCountryClassName}
      cueEvents={cueEventIds}
      eyebrow="战争动画藏书馆 / 现代战争"
      focusSteps={[
        { fromProgress: 0, focus: "guadalcanalIronbottom" },
        { fromProgress: timeline.dateToProgress("1942-11-15T00:05"), focus: "guadalcanalSavoNight" },
        { fromProgress: timeline.dateToProgress("1942-11-15T00:12"), focus: "guadalcanalRadarAction" },
        { fromProgress: timeline.dateToProgress("1942-11-15T00:24"), focus: "guadalcanalWithdrawal" }
      ]}
      frontLines={tacticalFrontLines}
      legendAxis="夜战舰队航迹 / 雷达火控"
      legendPrimary="日本炮击队"
      legendSecondary="美国第64特遣队"
      mapPoints={mapPoints}
      musicSource={publicPath("/audio/wikimedia-anchors-aweigh-2009.oga")}
      narrationCues={narrationCues}
      playbackDurationSeconds={300}
      regionLabels={[
        { label: "萨沃岛", coordinates: [159.82, -9.13] },
        { label: "铁底湾", coordinates: [160.05, -9.38] },
        { label: "瓜达尔卡纳尔", coordinates: [160.2, -9.65] }
      ]}
      retainSeaUnitsAfterRouteEnd
      shellClassName="guadalcanal-naval-battle modern-war naval-war"
      sfxProfile="gunpowder"
      subtitle="战术级夜战：聚焦1942年11月14-15日铁底湾，突出南达科他号失电、华盛顿号雷达火控、雾岛号重创与日军炮击任务失败。"
      tacticalRouteRetention
      terrainZones={[]}
      testId="guadalcanal-naval-app"
      timeCounterLabel="小时"
      timeStepDays={1 / 96}
      timelineTitle="1942年11月14-15日第二次瓜岛海战"
      title="第二次瓜岛海战"
      unitIcon="warship"
    />
  );
}
