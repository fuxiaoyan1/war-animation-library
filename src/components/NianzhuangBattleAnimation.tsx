import {
  battleEffects,
  battleEvents,
  campaignEnd,
  campaignStart,
  cueEventIds,
  cueEventKinds,
  frontLines,
  historicalRegions,
  mapOverlays,
  mapPoints,
  rivers,
  terrainZones
} from "../data/nianzhuangBattle";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { nianzhuangCampaignCountries, nianzhuangCountryClassName } from "../lib/geoMap";
import { publicPath } from "../lib/publicPath";
import { withUnitBadgeLabels } from "../lib/unitBadges";
import { CampaignMapAnimation, type NarrationCue } from "./CampaignMapAnimation";

const activeSpans = frontLines.map(({ end, start }) => ({ end, start }));
const timeline = createCampaignTimeline({
  activeSpans,
  campaignEnd,
  campaignStart,
  events: battleEvents,
  inactiveGapDisplayDays: 0.12,
  points: mapPoints,
  timingMode: "compressed"
});

const semanticFrontLines = withUnitBadgeLabels(frontLines, {
  communist: "华",
  nationalist: "國"
});

const narrationCues: NarrationCue[] = [
  {
    id: "pursuit",
    start: "1948-11-06T18:00",
    end: "1948-11-10T20:00",
    title: "第一幕 / 追上黄兵团",
    text: "黄百韬第七兵团撤离新安镇向徐州收缩，华野多路急行追击，在碾庄圩一带把退路封住。"
  },
  {
    id: "hold-relief",
    start: "1948-11-11T12:00",
    end: "1948-11-14T20:00",
    title: "第二幕 / 固守与阻援",
    text: "黄兵团在碾庄圩固守待援，邱清泉、李弥从徐州东援；徐东阻援集团把东援钉在大许家一线。"
  },
  {
    id: "trench",
    start: "1948-11-15T02:00",
    end: "1948-11-19T09:45",
    title: "第三幕 / 对壕近迫",
    text: "华野由运动战转入攻坚战，利用夜间挖壕隐藏接近，沿村落、水沟和水塘间隙逐点靠近防御圈。"
  },
  {
    id: "assault",
    start: "1948-11-19T10:00",
    end: "1948-11-21T18:00",
    title: "第四幕 / 总攻压缩",
    text: "19日10时总攻开始，晚10时突破第一道防线；守军由外圈退入内核，华野继续多方向压缩。"
  },
  {
    id: "ending",
    start: "1948-11-21T18:00",
    end: "1948-11-22T12:00",
    title: "终幕 / 倪庄终局",
    text: "黄百韬残部从碾庄内核向倪庄逃散，追击部队压上，淮海战役第一阶段取得决定性胜利。"
  }
];

export function NianzhuangBattleAnimation() {
  return (
    <CampaignMapAnimation
      activeSpans={activeSpans}
      ariaLabel="淮海战役碾庄圩围歼战动态地图"
      battleEffects={battleEffects}
      battleEvents={battleEvents}
      campaignEnd={campaignEnd}
      campaignStart={campaignStart}
      cinematicMode
      countries={nianzhuangCampaignCountries}
      countryClassName={nianzhuangCountryClassName}
      cueEventKinds={cueEventKinds}
      cueEvents={cueEventIds}
      eyebrow="战争动画藏书馆 / 解放战争"
      focusSteps={[
        { fromProgress: 0, focus: "nianzhuangWide" },
        { fromProgress: timeline.dateToProgress("1948-11-10T20:00"), focus: "nianzhuangPocket" },
        { fromProgress: timeline.dateToProgress("1948-11-11T12:00"), focus: "nianzhuangRelief" },
        { fromProgress: timeline.dateToProgress("1948-11-15T02:00"), focus: "nianzhuangPocket" },
        { fromProgress: timeline.dateToProgress("1948-11-19T10:00"), focus: "nianzhuangFinal" },
        { fromProgress: timeline.dateToProgress("1948-11-21T18:00"), focus: "nianzhuangFinal" }
      ]}
      focusTransitionProgress={0.035}
      frontLines={semanticFrontLines}
      historicalRegions={historicalRegions}
      inactiveGapDisplayDays={0.12}
      legendAxis="追击 / 围歼 / 阻援 / 对壕攻坚"
      legendPrimary="华东野战军"
      legendSecondary="国民党军"
      mapOverlays={mapOverlays}
      mapPoints={mapPoints}
      musicSource={publicPath("/audio/wikimedia-the-thunderer-us-army.ogg")}
      narrationCues={narrationCues}
      outcomeStats={[
        { label: "战斗持续", value: "17天" },
        { label: "核心目标", value: "黄百韬第七兵团" },
        { label: "关键支线", value: "徐东阻援" },
        { label: "攻坚方式", value: "对壕近迫" }
      ]}
      playbackDurationSeconds={300}
      regionLabels={[
        { label: "XUZHOU", coordinates: [117.2, 34.35] },
        { label: "NIANZHUANG POCKET", coordinates: [117.89, 34.4] },
        { label: "XIN'ANZHEN", coordinates: [118.34, 34.45] },
        { label: "CANAL WATER NET", coordinates: [118.08, 34.22] }
      ]}
      rivers={rivers}
      shellClassName="nianzhuang-battle modern-war chinese-civil-war"
      sfxProfile="ww2"
      subtitle="按5分钟播放设计：新安镇西撤、碾庄合围、徐州东援受阻、对壕近迫、19日总攻、第一道防线突破、内核压缩与倪庄终局。"
      tacticalRouteRetention
      terrainZones={terrainZones}
      testId="nianzhuang-app"
      timeCounterLabel="天"
      timeStepDays={1}
      timingMode="compressed"
      timelineTitle="1948年11月6日至22日 碾庄圩围歼战"
      title="淮海战役：碾庄圩围歼战"
      unitIcon="infantryPva"
    />
  );
}
