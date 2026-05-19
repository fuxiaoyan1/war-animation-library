import {
  battleEvents,
  campaignEnd,
  campaignStart,
  cueEventIds,
  diveCueEventIds,
  frontLines,
  mapPoints
} from "../data/gulfWar1991";
import { gulfCampaignCountries, gulfCountryClassName } from "../lib/geoMap";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { withUnitBadgeLabels } from "../lib/unitBadges";
import { publicPath } from "../lib/publicPath";
import { CampaignMapAnimation, type NarrationCue } from "./CampaignMapAnimation";

const activeSpans = frontLines.map(({ end, start }) => ({ end, start }));
const gapOverrides = [{ start: "1990-08-08", end: "1991-01-17", displayDays: 0.2 }];
const semanticFrontLines = withUnitBadgeLabels(frontLines, {
  allies: "联",
  germany: "伊"
});

const timeline = createCampaignTimeline({
  activeSpans,
  campaignStart,
  campaignEnd,
  events: battleEvents,
  gapOverrides,
  gapScale: 0.008,
  inactiveGapDisplayDays: 0.6,
  maxGapDays: 4,
  points: mapPoints,
  timingMode: "compressed"
});

const narrationCues: NarrationCue[] = [
  {
    id: "kuwait-crisis",
    start: "1990-08-02",
    end: "1990-08-07",
    title: "第一幕 / 科威特危机",
    text: "伊拉克装甲部队突然南下占领科威特。海湾能源通道和沙特安全暴露，战争迅速国际化。"
  },
  {
    id: "shield-build-up",
    start: "1990-08-07",
    end: "1991-01-16",
    title: "第二幕 / 沙漠盾牌",
    text: "联军先守住沙特，再把空军、装甲、港口机场和后勤系统铺开。真正的反攻建立在数月集结之上。"
  },
  {
    id: "air-campaign",
    start: "1991-01-17",
    end: "1991-02-23",
    title: "第三幕 / 空中战役",
    text: "沙漠风暴以空袭切断伊拉克指挥、防空与机动能力。地面战开始前，伊军体系已经被持续削弱。"
  },
  {
    id: "hundred-hours",
    start: "1991-02-24",
    end: "1991-02-28",
    title: "终幕 / 百小时地面战",
    text: "科威特正面突破与西翼左勾拳同时展开。伊拉克军队撤出科威特，联军在停火前完成授权目标。"
  }
];

export function GulfWarAnimation() {
  return (
    <CampaignMapAnimation
      activeSpans={activeSpans}
      ariaLabel="1991年第一次海湾战争动态地图"
      battleEvents={battleEvents}
      campaignEnd={campaignEnd}
      campaignStart={campaignStart}
      cinematicMode
      countries={gulfCampaignCountries}
      countryClassName={gulfCountryClassName}
      cueEvents={cueEventIds}
      diveCueEvents={diveCueEventIds}
      eyebrow="战争动画藏书馆 / 现代战争"
      focusSteps={[
        { fromProgress: 0, focus: "gulfKuwait" },
        { fromProgress: timeline.dateToProgress("1990-08-07"), focus: "gulfWide" },
        { fromProgress: timeline.dateToProgress("1991-01-17"), focus: "gulfIraq" },
        { fromProgress: timeline.dateToProgress("1991-01-29"), focus: "gulfKuwait" },
        { fromProgress: timeline.dateToProgress("1991-02-24"), focus: "gulfGround" },
        { fromProgress: timeline.dateToProgress("1991-02-28"), focus: "gulfKuwait" }
      ]}
      frontLines={semanticFrontLines}
      gapOverrides={gapOverrides}
      gapScale={0.008}
      inactiveGapDisplayDays={0.6}
      legendAxis="联合作战轴线"
      legendPrimary="伊拉克行动"
      legendSecondary="联军行动"
      mapPoints={mapPoints}
      maxGapDays={4}
      musicSource={publicPath("/audio/wikimedia-holst-uranus.ogg")}
      narrationCues={narrationCues}
      playbackDurationSeconds={300}
      regionLabels={[
        { label: "IRAQ", coordinates: [43.8, 33.0] },
        { label: "KUWAIT", coordinates: [47.8, 29.4] },
        { label: "SAUDI ARABIA", coordinates: [45.8, 25.0] },
        { label: "PERSIAN GULF", coordinates: [51.8, 27.6] }
      ]}
      rivers={[
        {
          id: "tigris-euphrates",
          label: "两河下游",
          points: [
            [44.3661, 33.3152],
            [45.2, 32.2],
            [46.0, 31.4],
            [47.78, 30.51]
          ]
        }
      ]}
      shellClassName="gulf-war modern-war"
      sfxProfile="ww2"
      subtitle="全片按5分钟播放设计：从伊拉克入侵科威特、沙漠盾牌集结、沙漠风暴空袭，到百小时地面战和停火。"
      terrainZones={[
        {
          coordinates: [44.6, 29.5],
          label: "西部沙漠机动区",
          labelCoordinates: [43.7, 29.0],
          rx: 150,
          ry: 74
        },
        {
          coordinates: [47.4, 30.0],
          label: "科威特战区",
          labelCoordinates: [47.0, 30.7],
          rx: 98,
          ry: 48
        }
      ]}
      testId="gulf-app"
      timeStepDays={7}
      timingMode="compressed"
      timelineTitle="从科威特危机到百小时地面战"
      title="1991年第一次海湾战争"
      unitIcon="tank"
    />
  );
}
