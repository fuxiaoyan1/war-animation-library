import {
  battleEvents,
  campaignEnd,
  campaignStart,
  cueEventIds,
  diveCueEventIds,
  frontLines,
  mapPoints
} from "../data/battleOfBritain";
import { battleOfBritainCampaignCountries, battleOfBritainCountryClassName } from "../lib/geoMap";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { withUnitBadgeLabels } from "../lib/unitBadges";
import { publicPath } from "../lib/publicPath";
import { CampaignMapAnimation, type NarrationCue } from "./CampaignMapAnimation";

const activeSpans = frontLines.map(({ end, start }) => ({ end, start }));
const semanticFrontLines = withUnitBadgeLabels(frontLines, {
  britain: "英",
  germany: "德"
});

const timeline = createCampaignTimeline({
  activeSpans,
  campaignEnd,
  campaignStart,
  events: battleEvents,
  gapScale: 0.04,
  inactiveGapDisplayDays: 0.35,
  maxGapDays: 3,
  points: mapPoints,
  timingMode: "compressed"
});

const narrationCues: NarrationCue[] = [
  {
    id: "morning-warning",
    start: "1940-09-15T10:30",
    end: "1940-09-15T11:25",
    title: "第一幕 / 雷达报来袭",
    text: "9月15日上午，肯特雷达链和观察哨报告多批敌机越过海峡，11群作战室把点迹转化为升空命令。"
  },
  {
    id: "morning-fight",
    start: "1940-09-15T11:25",
    end: "1940-09-15T13:30",
    title: "第二幕 / 上午伦敦混战",
    text: "两波德军轰炸机向伦敦推进，11群和12群多批喷火、飓风中队从侧前方、高空和回程段连续攻击。"
  },
  {
    id: "afternoon-fight",
    start: "1940-09-15T13:30",
    end: "1940-09-15T18:00",
    title: "终幕 / 下午全力拦截",
    text: "午后更大规模空袭再度越岸，伦敦东南空域航迹密集叠加，轰炸队形被撕开并在返航途中继续遭追击。"
  }
];

export function BattleOfBritainAnimation() {
  return (
    <CampaignMapAnimation
      activeSpans={activeSpans}
      ariaLabel="伦敦上空的鹰动态地图"
      battleEvents={battleEvents}
      campaignEnd={campaignEnd}
      campaignStart={campaignStart}
      cinematicMode
      countries={battleOfBritainCampaignCountries}
      countryClassName={battleOfBritainCountryClassName}
      cueEvents={cueEventIds}
      cueEventKinds={{
        "afternoon-all-squadrons-engaged": "airCombat",
        "afternoon-bombers-broken": "airCombat",
        "buckingham-palace-intercept": "airCombat",
        "channel-pursuit-closes": "airCombat",
        "eleven-group-scramble": "aircraft",
        "morning-dogfight-london": "airCombat",
        "morning-radar-contact": "aircraft",
        "morning-return-fire": "airCombat"
      }}
      diveCueEvents={diveCueEventIds}
      eyebrow="战争动画藏书馆 / 二战空战"
      focusSteps={[
        { fromProgress: 0, focus: "britainAirLondon" },
        { fromProgress: timeline.dateToProgress("1940-09-15T11:25"), focus: "britainAirLondon" },
        { fromProgress: timeline.dateToProgress("1940-09-15T16:30"), focus: "britainAirLondon" }
      ]}
      frontLines={semanticFrontLines}
      gapScale={0.04}
      inactiveGapDisplayDays={0.35}
      legendAxis="雷达预警 / 航迹保留"
      legendPrimary="德军轰炸机流与护航"
      legendSecondary="RAF 多批拦截"
      mapPoints={mapPoints}
      maxGapDays={3}
      musicSource={publicPath("/audio/wikimedia-rule-britannia.ogg")}
      narrationCues={narrationCues}
      playbackDurationSeconds={300}
      regionLabels={[
        { label: "ENGLAND", coordinates: [-1.6, 51.7] },
        { label: "CHANNEL", coordinates: [0.15, 50.28] },
        { label: "FRANCE", coordinates: [1.9, 50.35] }
      ]}
      shellClassName="battle-of-britain modern-war ww2-air-war"
      sfxProfile="ww2"
      subtitle="聚焦1940年9月15日伦敦方向两次大规模昼间空袭：雷达发现、11群升空、12群增援、伦敦上空混战与回程追击。"
      tacticalRouteRetention
      terrainZones={[]}
      testId="battle-of-britain-app"
      timeStepDays={1 / 24}
      timingMode="compressed"
      timelineTitle="1940年9月15日伦敦空战"
      title="伦敦上空的鹰"
      unitIcon="ww2Fighter"
    />
  );
}
