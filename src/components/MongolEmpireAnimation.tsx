import {
  battleEvents,
  campaignEnd,
  campaignStart,
  frontLines,
  mapPoints
} from "../data/mongolEmpire";
import {
  mongolCampaignCountries,
  mongolCountryClassName
} from "../lib/geoMap";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { withUnitBadgeLabels } from "../lib/unitBadges";
import { publicPath } from "../lib/publicPath";
import { CampaignMapAnimation, type NarrationCue } from "./CampaignMapAnimation";

const activeSpans = frontLines.map(({ end, start }) => ({ end, start }));
const semanticFrontLines = withUnitBadgeLabels(frontLines, {
  carthage: "蒙"
});

const timeline = createCampaignTimeline({
  activeSpans,
  campaignStart,
  campaignEnd,
  events: battleEvents,
  gapScale: 0.025,
  maxGapDays: 95,
  points: mapPoints,
  timingMode: "compressed"
});

const narrationCues: NarrationCue[] = [
  {
    id: "steppe-to-north-china",
    start: "1206-01-01",
    end: "1215-06-01",
    title: "第一幕 / 草原成军",
    text: "蒙古高原的部落战争被整理成千户制和远征机器，西夏与金朝北部先后成为这台机器的试验场。"
  },
  {
    id: "central-asia",
    start: "1219-09-01",
    end: "1223-05-31",
    title: "第二幕 / 横穿中亚",
    text: "从河中到呼罗珊，城市链被分割包围；速不台的西探越过高加索和黑海北岸，试出通向东欧的草原走廊。"
  },
  {
    id: "succession-and-west",
    start: "1226-01-01",
    end: "1258-02-10",
    title: "第三幕 / 继承后的扩张",
    text: "成吉思汗去世后，蒙古扩张没有停下：金朝灭亡、西亚震荡，帝国从草原征服转入多汗国分治。"
  },
  {
    id: "yuan-china",
    start: "1268-01-01",
    end: "1279-03-19",
    title: "终幕 / 南宋终局",
    text: "襄阳打开南宋门户，临安投降，残余水师退向崖山。东方征服最终转化为元朝对中国的统一治理。"
  }
];

export function MongolEmpireAnimation() {
  return (
    <CampaignMapAnimation
      activeSpans={activeSpans}
      ariaLabel="蒙古帝国征服史动态地图"
      battleEvents={battleEvents}
      campaignEnd={campaignEnd}
      campaignStart={campaignStart}
      cinematicMode
      countries={mongolCampaignCountries}
      countryClassName={mongolCountryClassName}
      cueEvents={new Set(["kurultai-1206", "samarkand-1220", "kalka-1223", "baghdad-1258", "xiangyang-1273", "yamen-1279"])}
      eyebrow="战争动画藏书馆 / 古代战争"
      focusSteps={[
        { fromProgress: 0, focus: "mongolWide" },
        { fromProgress: timeline.dateToProgress("1219-09-01"), focus: "mongolCentralAsia" },
        { fromProgress: timeline.dateToProgress("1223-05-31"), focus: "mongolWest" },
        { fromProgress: timeline.dateToProgress("1234-02-09"), focus: "mongolChina" }
      ]}
      frontLines={semanticFrontLines}
      gapScale={0.025}
      legendAxis="征服轴线"
      legendPrimary="蒙古主攻"
      legendSecondary="防御/反击"
      mapPoints={mapPoints}
      maxGapDays={95}
      musicSource={publicPath("/audio/gutenberg-stars-and-stripes.mp3")}
      narrationCues={narrationCues}
      playbackDurationSeconds={300}
      regionLabels={[
        { label: "MONGOLIA", coordinates: [103.5, 47.5] },
        { label: "CENTRAL ASIA", coordinates: [67.5, 42.0] },
        { label: "NORTH CHINA", coordinates: [113.0, 37.5] },
        { label: "IRAN", coordinates: [53.0, 32.5] }
      ]}
      rivers={[
        {
          id: "yellow-river",
          label: "黄河",
          points: [
            [106.2782, 38.4664],
            [110.91, 34.62],
            [114.31, 34.8],
            [118.0, 37.0]
          ]
        },
        {
          id: "yangtze",
          label: "长江",
          points: [
            [112.1224, 32.009],
            [116.78, 32.58],
            [120.1551, 30.2741]
          ]
        }
      ]}
      shellClassName="mongol-empire ancient-war"
      sfxProfile="ancient"
      subtitle="全片按5分钟播放设计：从蒙古高原统一、金与花剌子模，到巴格达、南宋和崖山。"
      terrainZones={[
        {
          coordinates: [101.5, 45.0],
          label: "STEPPE",
          labelCoordinates: [99.0, 45.4],
          rx: 180,
          ry: 68
        },
        {
          coordinates: [64.0, 39.0],
          label: "TRANSOXIANA",
          labelCoordinates: [61.0, 39.4],
          rx: 132,
          ry: 52
        }
      ]}
      testId="mongol-app"
      timeStepDays={45}
      timingMode="compressed"
      timelineTitle="从成吉思汗到崖山"
      title="蒙古帝国征服史"
      unitIcon="cavalry"
    />
  );
}
