import {
  battleEffects,
  battleEvents,
  campaignEnd,
  campaignStart,
  cueEventIds,
  cueEventKinds,
  fragmentedLines,
  fortifiedLines,
  frontLines,
  historicalRegions,
  timelineActiveSpans,
  timelineDateAnchors,
  timelineGapOverrides,
  timelineInactiveGapDisplayDays,
  mapOverlays,
  mapPoints,
  rivers,
  tacticalTerrainFeatures,
  terrainZones
} from "../data/nianzhuangBattle";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { nianzhuangCampaignCountries, nianzhuangCountryClassName } from "../lib/geoMap";
import { publicPath } from "../lib/publicPath";
import { withUnitBadgeLabels } from "../lib/unitBadges";
import { CampaignMapAnimation, type NarrationCue } from "./CampaignMapAnimation";

const timeline = createCampaignTimeline({
  activeSpans: timelineActiveSpans,
  campaignEnd,
  campaignStart,
  dateAnchors: timelineDateAnchors,
  events: battleEvents,
  gapOverrides: timelineGapOverrides,
  inactiveGapDisplayDays: timelineInactiveGapDisplayDays,
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
    text: "黄兵团约10万人在碾庄圩村落水网中固守待援，核心圈按师级守点展开，华野纵队形成外层包围；邱清泉、李弥从徐州东援，被徐东阻援集团钉在大许家一线。"
  },
  {
    id: "trench",
    start: "1948-11-15T02:00",
    end: "1948-11-19T10:00",
    title: "第三幕 / 对壕近迫",
    text: "华野由运动战转入攻坚战，利用夜间挖壕隐藏接近，沿村落、水沟和水塘间隙逐点靠近防御圈。"
  },
  {
    id: "assault",
    start: "1948-11-19T10:00",
    end: "1948-11-20T05:30",
    title: "第四幕 / 夜攻破墙",
    text: "19日10时下达总攻令，白天炮火准备；21时15分后步兵夜攻展开，22时30分突破第一道围墙，20日凌晨突破第二道围墙并突入内圩。"
  },
  {
    id: "inner-pocket",
    start: "1948-11-20T05:30",
    end: "1948-11-22T16:00",
    title: "第五幕 / 残点清剿",
    text: "内圩核心失守后，黄兵团残部退向东侧村落残点；华野分北、东、南、西逐村压缩，徐州东援仍被阻在大许家一线。"
  },
  {
    id: "ending",
    start: "1948-11-22T16:00",
    end: "1948-11-22T20:00",
    title: "终幕 / 倪庄终局",
    text: "黄百韬残部从东侧村落残点向倪庄逃散，追击部队压上，淮海战役第一阶段取得决定性胜利。"
  }
];

export function NianzhuangBattleAnimation() {
  return (
    <CampaignMapAnimation
      activeSpans={timelineActiveSpans}
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
      dateAnchors={timelineDateAnchors}
      eyebrow="战争动画藏书馆 / 解放战争"
      focusSteps={[
        { fromProgress: 0, focus: "nianzhuangPursuit" },
        { fromProgress: timeline.dateToProgress("1948-11-10T20:00"), focus: "nianzhuangPocket" },
        { fromProgress: timeline.dateToProgress("1948-11-11T12:00"), focus: "nianzhuangRelief" },
        { fromProgress: timeline.dateToProgress("1948-11-13T06:00"), focus: "nianzhuangPocket" },
        { fromProgress: timeline.dateToProgress("1948-11-15T02:00"), focus: "nianzhuangPocket" },
        { fromProgress: timeline.dateToProgress("1948-11-19T10:00"), focus: "nianzhuangBreakthrough" },
        { fromProgress: timeline.dateToProgress("1948-11-19T22:30"), focus: "nianzhuangCompression" },
        { fromProgress: timeline.dateToProgress("1948-11-20T05:30"), focus: "nianzhuangFinal" },
        { fromProgress: timeline.dateToProgress("1948-11-22T16:00"), focus: "nianzhuangFinal" }
      ]}
      focusTransitionProgress={0.085}
      frontLines={semanticFrontLines}
      fortifiedLines={[...fortifiedLines, ...fragmentedLines]}
      historicalRegions={historicalRegions}
      gapOverrides={timelineGapOverrides}
      inactiveGapDisplayDays={timelineInactiveGapDisplayDays}
      legendAxis="追击 / 围歼 / 阻援 / 对壕攻坚"
      legendPrimary="华东野战军"
      legendSecondary="国民党军"
      mapDimensions={{ width: 4800, height: 2880 }}
      mapOverlays={mapOverlays}
      mapPoints={mapPoints}
      musicSource={publicPath("/audio/wikimedia-the-thunderer-us-army.ogg")}
      narrationCues={narrationCues}
      outcomeStats={[
        { label: "战斗持续", value: "17天" },
        { label: "核心目标", value: "黄百韬第七兵团约10万人" },
        { label: "关键支线", value: "徐东阻援" },
        { label: "战术单位", value: "华野纵队 / 黄兵团师" }
      ]}
      playbackDurationSeconds={300}
      regionLabels={[
        { label: "XUZHOU", coordinates: [117.2, 34.35] },
        { label: "NIANZHUANG POCKET", coordinates: [117.88, 34.43] },
        { label: "XIN'ANZHEN", coordinates: [118.34, 34.45] },
        { label: "CANAL WATER NET", coordinates: [118.08, 34.2] }
      ]}
      raisedUnitMarkers
      rivers={rivers}
      shellClassName="nianzhuang-battle modern-war chinese-civil-war"
      sfxProfile="ww2"
      subtitle="按5分钟播放设计：新安镇西撤、碾庄合围、师级布防、华野外层包围、徐州东援受阻、试攻受挫、对壕近迫、19日总攻令、夜攻突破第一道围墙、20日凌晨突破第二道围墙、内圩核心失守、东侧残点清剿与倪庄终局。"
      tacticalRouteRetention
      tacticalMapReference={{
        datumLabel: "战术示意 / 坐标近似",
        grid: true,
        gridSpacing: 480,
        scaleLabel: "约10公里"
      }}
      tacticalTerrainFeatures={tacticalTerrainFeatures}
      terrainZones={terrainZones}
      testId="nianzhuang-app"
      timeCounterLabel="天"
      timeStepDays={1 / 96}
      timingMode="compressed"
      timelineTitle="1948年11月6日至22日 碾庄圩围歼战"
      title="淮海战役：碾庄圩围歼战"
      unitIcon="infantryPva"
    />
  );
}
