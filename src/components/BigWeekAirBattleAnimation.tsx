import {
  battleEvents,
  campaignEnd,
  campaignStart,
  cueEventIds,
  diveCueEventIds,
  frontLines,
  mapPoints
} from "../data/bigWeekAirBattle";
import { bigWeekCampaignCountries, bigWeekCountryClassName } from "../lib/geoMap";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { withUnitBadgeLabels } from "../lib/unitBadges";
import { publicPath } from "../lib/publicPath";
import { CampaignMapAnimation, type BattleEffectElement, type NarrationCue } from "./CampaignMapAnimation";

const activeSpans = frontLines.map(({ end, start }) => ({ end, start }));
const semanticFrontLines = withUnitBadgeLabels(frontLines, {
  allies: "美",
  germany: "德"
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
    id: "opening",
    start: "1944-02-20T06:00",
    end: "1944-02-21T08:30",
    title: "第一幕 / 逼迫迎战",
    text: "首日轰炸机流越过北海压向德国航空工业目标，爆炸发生在目标区，返航航迹继续保留。"
  },
  {
    id: "escort",
    start: "1944-02-21T08:30",
    end: "1944-02-24T06:40",
    title: "第二幕 / 远程护航",
    text: "P-51 等远程护航机把保护范围推入德国纵深，轰炸机流、护航接力和德机截击在同一空域交叉。"
  },
  {
    id: "outcome",
    start: "1944-02-24T06:40",
    end: "1944-02-25T18:00",
    title: "终幕 / 制空权倾斜",
    text: "2月24日工业目标空袭后，2月25日纵深突入与返航分散继续把德国战斗机拖入消耗。"
  }
];

const battleEffects: BattleEffectElement[] = [
  {
    id: "leipzig-industrial-bombing",
    type: "salvo",
    start: "1944-02-20T11:25",
    end: "1944-02-20T12:20",
    from: [10.15, 51.55],
    to: [12.3731, 51.3397],
    label: "航空工业目标爆炸",
    testId: "big-week-industrial-bombing",
    shellOffsets: [
      [-18, -12],
      [12, -18],
      [24, 10],
      [-6, 18]
    ],
    impactOffsets: [
      [-16, -12],
      [10, -16],
      [18, 2],
      [-4, 14]
    ]
  },
  {
    id: "brunswick-industrial-bombing",
    type: "salvo",
    start: "1944-02-24T10:35",
    end: "1944-02-24T11:35",
    from: [9.4, 52.05],
    to: [10.5268, 52.2689],
    label: "不伦瑞克目标区",
    testId: "big-week-brunswick-bombing",
    shellOffsets: [
      [-14, -18],
      [14, -10],
      [24, 14],
      [-8, 18]
    ],
    impactOffsets: [
      [-18, -8],
      [8, -14],
      [22, 4],
      [-6, 16]
    ]
  }
];

export function BigWeekAirBattleAnimation() {
  return (
    <CampaignMapAnimation
      activeSpans={activeSpans}
      ariaLabel="大周行动动态地图"
      battleEffects={battleEffects}
      battleEvents={battleEvents}
      campaignEnd={campaignEnd}
      campaignStart={campaignStart}
      cinematicMode
      countries={bigWeekCampaignCountries}
      countryClassName={bigWeekCountryClassName}
      cueEvents={cueEventIds}
      cueEventKinds={{
        "aircraft-industry-targets": "combined",
        "argument-outcome": "combined",
        "deep-escort-lesson": "dive",
        "luftwaffe-attrition": "combined"
      }}
      diveCueEvents={diveCueEventIds}
      eyebrow="战争动画藏书馆 / 二战空战"
      focusSteps={[
        { fromProgress: 0, focus: "bigWeekWide" },
        { fromProgress: timeline.dateToProgress("1944-02-22T10:00"), focus: "bigWeekGermany" },
        { fromProgress: timeline.dateToProgress("1944-02-25T15:30"), focus: "bigWeekWide" }
      ]}
      frontLines={semanticFrontLines}
      gapScale={0.04}
      inactiveGapDisplayDays={0.04}
      legendAxis="轰炸机流 / 护航 / 截击"
      legendPrimary="德国截击"
      legendSecondary="盟军轰炸与护航"
      mapPoints={mapPoints}
      maxGapDays={1}
      musicSource={publicPath("/audio/wikimedia-holst-uranus.ogg")}
      narrationCues={narrationCues}
      outcomeStats={[
        { label: "轰炸机流往返", value: "6天" },
        { label: "护航深入德国", value: "P-51/P-47" },
        { label: "德机被迫消耗", value: "持续截击" }
      ]}
      playbackDurationSeconds={300}
      regionLabels={[
        { label: "EAST ANGLIA", coordinates: [0.2, 52.6] },
        { label: "NORTH SEA", coordinates: [3.5, 53.0] },
        { label: "GERMANY", coordinates: [10.2, 51.3] }
      ]}
      shellClassName="big-week-air-battle modern-war ww2-air-war"
      sfxProfile="ww2"
      subtitle="全片按5分钟播放设计：以1944年2月20-25日大周行动为主线，展示轰炸机流、远程护航、德机截击和制空权消耗。"
      tacticalRouteRetention
      terrainZones={[]}
      testId="big-week-app"
      timeCounterLabel="天"
      timeStepDays={1 / 24}
      timingMode="compressed"
      timelineTitle="Operation Argument：轰炸与护航夺取制空权"
      title="大周行动：欧洲昼间制空权争夺"
      unitIcon="ww2Bomber"
    />
  );
}
