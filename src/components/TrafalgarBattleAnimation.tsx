import {
  battleEvents,
  campaignEnd,
  campaignStart,
  cueEventIds,
  frontLines,
  mapPoints
} from "../data/trafalgarBattle";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { publicPath } from "../lib/publicPath";
import {
  trafalgarCampaignCountries,
  trafalgarCountryClassName
} from "../lib/geoMap";
import { withUnitBadgeLabels } from "../lib/unitBadges";
import {
  CampaignMapAnimation,
  type MapOverlayElement,
  type NarrationCue,
  type OutcomeStat
} from "./CampaignMapAnimation";

const activeSpans = frontLines.map(({ end, start }) => ({ end, start }));

const timeline = createCampaignTimeline({
  activeSpans,
  campaignStart,
  campaignEnd,
  events: battleEvents,
  points: mapPoints
});

const tacticalFrontLines = withUnitBadgeLabels(frontLines, {
  britain: "英",
  france: "法",
  spain: "西"
});

const narrationCues: NarrationCue[] = [
  {
    id: "approach",
    start: "1805-10-21T11:30",
    end: "1805-10-21T12:10",
    title: "第一幕 / 轻风接近",
    text: "法西联合舰队在轻风中拉成长列，纳尔逊与科林伍德从西侧以两纵队切入，先承受横向炮火，再换取近距离突破。"
  },
  {
    id: "breakthrough",
    start: "1805-10-21T12:10",
    end: "1805-10-21T13:15",
    title: "第二幕 / 两处突破",
    text: "皇家主权号率先压向圣安娜附近；胜利号随后在布桑托尔号与可畏号一带切入中央，整条敌线开始被割裂。"
  },
  {
    id: "nelson",
    start: "1805-10-21T13:15",
    end: "1805-10-21T16:30",
    title: "第三幕 / 炮烟混战",
    text: "纳尔逊在胜利号上中弹，但战法已经展开。多艘战列舰在中央挤压、接舷、失去机动，画面进入大舰队混战。"
  },
  {
    id: "losses",
    start: "1805-10-21T16:30",
    end: "1805-10-21T18:00",
    title: "终幕 / 战果统计",
    text: "英军无战列舰损失，法西舰队大批被俘或毁损；纳尔逊约16:30死亡，胜利与阵亡在同一节点被记住。"
  }
];

const mapOverlays: MapOverlayElement[] = [
  {
    id: "light-west-northwest",
    type: "wind",
    from: [-7.06, 36.36],
    to: [-6.72, 36.2],
    label: "轻风 / 西北偏西",
    testId: "trafalgar-wind"
  },
  {
    id: "nelson-shot",
    type: "marker",
    coordinates: [-6.695, 36.128],
    label: "纳尔逊中弹",
    revealAt: "1805-10-21T13:15",
    subtitle: "13:15 / 胜利号",
    testId: "nelson-shot-marker"
  }
];

const outcomeStats: OutcomeStat[] = [
  { className: "outcome-british", label: "英军伤亡", value: "449亡 / 1241伤" },
  { className: "outcome-allied", label: "法西伤亡", value: "约4400亡 / 2500伤" },
  { className: "outcome-captured", label: "法西被俘", value: "约7000人" },
  { className: "outcome-ships", label: "舰船损失", value: "英0艘 / 法西约18艘" }
];

export function TrafalgarBattleAnimation() {
  return (
    <CampaignMapAnimation
      activeSpans={activeSpans}
      ariaLabel="1805年特拉法尔加大海战动态地图"
      battleEvents={battleEvents}
      campaignEnd={campaignEnd}
      campaignStart={campaignStart}
      cinematicMode
      countries={trafalgarCampaignCountries}
      countryClassName={trafalgarCountryClassName}
      cueEvents={cueEventIds}
      eyebrow="战争动画藏书馆 / 现代战争"
      focusSteps={[
        { fromProgress: 0, focus: "trafalgarApproach" },
        { fromProgress: timeline.dateToProgress("1805-10-21T12:40"), focus: "trafalgarBattle" },
        { fromProgress: timeline.dateToProgress("1805-10-21T13:15"), focus: "trafalgarBreakthrough" },
        { fromProgress: timeline.dateToProgress("1805-10-21T14:20"), focus: "trafalgarMelee" },
        { fromProgress: timeline.dateToProgress("1805-10-21T16:20"), focus: "trafalgarDecision" },
        { fromProgress: timeline.dateToProgress("1805-10-21T17:30"), focus: "trafalgarAftermath" }
      ]}
      frontLines={tacticalFrontLines}
      legendAxis="舰队战术航迹 / 风向"
      legendPrimary="法西联合舰队"
      legendSecondary="英军两纵队"
      mapOverlays={mapOverlays}
      mapPoints={mapPoints}
      musicSource={publicPath("/audio/wikimedia-rule-britannia.ogg")}
      narrationCues={narrationCues}
      outcomeStats={outcomeStats}
      playbackDurationSeconds={300}
      regionLabels={[
        { label: "加的斯湾", coordinates: [-6.42, 36.42] },
        { label: "特拉法尔加角", coordinates: [-6.02, 36.2] },
        { label: "大西洋外海", coordinates: [-6.95, 35.78] }
      ]}
      shellClassName="trafalgar-battle modern-war naval-war age-of-sail-war"
      sfxProfile="gunpowder"
      subtitle="战术级大地图：按约1:5比例展示舰队，使用英法不同同期船模资产，突出两纵队突破、法西长列崩解、纳尔逊中弹与最终损失统计。"
      tacticalRouteRetention
      terrainZones={[]}
      testId="trafalgar-app"
      timeCounterLabel="小时"
      timeStepDays={1 / 96}
      timelineTitle="1805年10月21日特拉法尔加大海战"
      title="特拉法尔加大海战"
      unitIcon="trafalgarBritishLine"
    />
  );
}
