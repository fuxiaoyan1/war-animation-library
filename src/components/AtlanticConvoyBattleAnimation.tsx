import {
  battleEvents,
  campaignEnd,
  campaignStart,
  cueEventIds,
  cueEventKinds,
  diveCueEventIds,
  frontLines,
  mapPoints,
  torpedoAndDepthChargeEffects
} from "../data/atlanticConvoyBattle";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { atlanticConvoyCampaignCountries, atlanticConvoyCountryClassName } from "../lib/geoMap";
import { publicPath } from "../lib/publicPath";
import { withUnitBadgeLabels } from "../lib/unitBadges";
import { CampaignMapAnimation, type NarrationCue } from "./CampaignMapAnimation";

const activeSpans = frontLines.map(({ end, start }) => ({ end, start }));
const semanticFrontLines = withUnitBadgeLabels(frontLines, {
  allies: "盟",
  britain: "英",
  germany: "U"
});

const timeline = createCampaignTimeline({
  activeSpans,
  campaignEnd,
  campaignStart,
  events: battleEvents,
  inactiveGapDisplayDays: 0.04,
  points: mapPoints,
  timingMode: "compressed"
});

const narrationCues: NarrationCue[] = [
  {
    id: "contact",
    start: "1943-03-16T03:30",
    end: "1943-03-16T18:00",
    title: "第一幕 / 发现船队",
    text: "HX 229 与 SC 122 东航进入中大西洋空隙，U 艇按拦截线发现并报告目标，狼群开始沿船队航向重组。"
  },
  {
    id: "wolfpack",
    start: "1943-03-16T18:00",
    end: "1943-03-17T12:00",
    title: "第二幕 / 双船队夜袭",
    text: "Raubgraf、Sturmer 与 Dranger 合围，两支船队在夜间遭鱼雷攻击，护航舰只能围绕商船队展开反潜屏障。"
  },
  {
    id: "air-gap",
    start: "1943-03-17T12:00",
    end: "1943-03-19T17:45",
    title: "第三幕 / 空隙被压缩",
    text: "远程 Liberator 巡逻机进入空隙，U 艇仍在第二夜继续攻击，但水面跟踪和集结空间被逐渐压缩。"
  },
  {
    id: "ending",
    start: "1943-03-19T17:45",
    end: "1943-03-20T12:00",
    title: "终幕 / 反潜命中与脱离",
    text: "U-384 被飞机深弹击沉后，增援护航与空中巡逻继续压迫狼群。德方当夜终止攻击，船队向西部入口方向脱离。"
  }
];

export function AtlanticConvoyBattleAnimation() {
  return (
    <CampaignMapAnimation
      activeSpans={activeSpans}
      ariaLabel="HX 229 与 SC 122 大西洋潜艇战动态地图"
      battleEvents={battleEvents}
      battleEffects={torpedoAndDepthChargeEffects}
      campaignEnd={campaignEnd}
      campaignStart={campaignStart}
      cinematicMode
      countries={atlanticConvoyCampaignCountries}
      countryClassName={atlanticConvoyCountryClassName}
      cueEventKinds={cueEventKinds}
      cueEvents={cueEventIds}
      diveCueEvents={diveCueEventIds}
      eyebrow="战争动画藏书馆 / 二战潜艇战"
      focusSteps={[
        { fromProgress: 0, focus: "atlanticConvoyContact" },
        { fromProgress: timeline.dateToProgress("1943-03-17T00:30"), focus: "atlanticConvoyBattle" },
        { fromProgress: timeline.dateToProgress("1943-03-17T07:30"), focus: "atlanticConvoyAirCover" },
        { fromProgress: timeline.dateToProgress("1943-03-19T12:30"), focus: "atlanticConvoyEastern" }
      ]}
      focusTransitionProgress={0.035}
      frontLines={semanticFrontLines}
      inactiveGapDisplayDays={0.04}
      legendAxis="商船航迹 / 狼群线 / 远程反潜"
      legendPrimary="德国 U 艇"
      legendSecondary="盟军船队与护航"
      mapPoints={mapPoints}
      musicSource={publicPath("/audio/wikimedia-heart-of-oak.ogg")}
      narrationCues={narrationCues}
      outcomeStats={[
        { label: "两支船队", value: "87艘" },
        { label: "U艇参战口径", value: "40+" },
        { label: "商船损失", value: "22艘沉没" },
        { label: "U-384", value: "1艘被击沉" }
      ]}
      playbackDurationSeconds={300}
      regionLabels={[
        { label: "AIR GAP", coordinates: [-37.2, 52.0] },
        { label: "WOLFPACK LINE", coordinates: [-42.7, 51.55] },
        { label: "WESTERN APPROACHES", coordinates: [-24.2, 53.7] }
      ]}
      shellClassName="atlantic-convoy-battle modern-war naval-war ww2-submarine-war"
      sfxProfile="ww2"
      subtitle="按5分钟播放设计：U-653接触、三狼群合围、HX 229与SC 122夜间鱼雷攻击、远程巡逻机压入空隙、U-384被击沉与攻击终止。"
      tacticalRouteRetention
      terrainZones={[]}
      testId="atlantic-convoy-app"
      timeCounterLabel="小时"
      timeStepDays={1 / 24}
      timingMode="compressed"
      timelineTitle="1943年3月 HX 229 / SC 122 中大西洋狼群战"
      title="HX 229 / SC 122：大西洋狼群战"
      unitIcon="ww2Submarine"
    />
  );
}
