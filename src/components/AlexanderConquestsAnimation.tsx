import {
  battleEvents,
  battleCueEventIds,
  campaignEnd,
  campaignStart,
  frontLines,
  mapPoints
} from "../data/alexanderConquests";
import {
  alexanderCampaignCountries,
  alexanderCountryClassName
} from "../lib/geoMap";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { withUnitBadgeLabels } from "../lib/unitBadges";
import { publicPath } from "../lib/publicPath";
import { CampaignMapAnimation, type NarrationCue } from "./CampaignMapAnimation";

const activeSpans = frontLines.map(({ end, start }) => ({ end, start }));
const semanticFrontLines = withUnitBadgeLabels(frontLines, (line) =>
  line.id === "hyphasis-mutiny" ? "拒" : "马"
);

const timeline = createCampaignTimeline({
  activeSpans,
  campaignStart,
  campaignEnd,
  events: battleEvents,
  gapScale: 0.04,
  maxGapDays: 80,
  points: mapPoints,
  timingMode: "compressed"
});

const narrationCues: NarrationCue[] = [
  {
    id: "macedon-and-asia-minor",
    start: "BCE-0336-10-01",
    end: "BCE-0333-11-01",
    title: "第一幕 / 马其顿出海",
    text: "亚历山大先稳住希腊后方，再渡过赫勒斯滂。格拉尼库斯和小亚细亚推进，把波斯西部防线撕开。"
  },
  {
    id: "levant-and-egypt",
    start: "BCE-0333-11-02",
    end: "BCE-0331-04-07",
    title: "第二幕 / 海岸线与埃及",
    text: "伊苏斯之后，他没有盲目东追，而是拆掉腓尼基海权支点，夺推罗、下埃及，并建立新的地中海港口。"
  },
  {
    id: "imperial-core",
    start: "BCE-0331-04-08",
    end: "BCE-0330-07-01",
    title: "第三幕 / 波斯帝国中枢",
    text: "高加米拉击溃大流士主力，巴比伦、苏萨和波斯波利斯相继落入马其顿手中，征服转向帝国接管。"
  },
  {
    id: "eastern-limit",
    start: "BCE-0330-07-02",
    end: "BCE-0323-06-13",
    title: "终幕 / 东方极限",
    text: "中亚山地战争、希达斯佩斯河和希法西斯兵变显示远征边界。归途回到巴比伦，帝国却没有完成继承安排。"
  }
];

export function AlexanderConquestsAnimation() {
  return (
    <CampaignMapAnimation
      activeSpans={activeSpans}
      ariaLabel="亚历山大大帝征服史动态地图"
      battleEvents={battleEvents}
      campaignEnd={campaignEnd}
      campaignStart={campaignStart}
      cinematicMode
      countries={alexanderCampaignCountries}
      countryClassName={alexanderCountryClassName}
      cueEvents={battleCueEventIds}
      eyebrow="战争动画藏书馆 / 古代战争"
      focusSteps={[
        { fromProgress: 0, focus: "alexanderAegean" },
        { fromProgress: timeline.dateToProgress("BCE-0333-11-02"), focus: "alexanderLevantEgypt" },
        { fromProgress: timeline.dateToProgress("BCE-0331-04-07"), focus: "alexanderEgypt" },
        { fromProgress: timeline.dateToProgress("BCE-0331-10-01"), focus: "alexanderMesopotamia" },
        { fromProgress: timeline.dateToProgress("BCE-0330-05-02"), focus: "alexanderPersia" },
        { fromProgress: timeline.dateToProgress("BCE-0330-07-02"), focus: "alexanderCentralAsia" },
        { fromProgress: timeline.dateToProgress("BCE-0327-05-01"), focus: "alexanderIndus" },
        { fromProgress: timeline.dateToProgress("BCE-0325-01-01"), focus: "alexanderReturn" },
        { fromProgress: timeline.dateToProgress("BCE-0323-06-13"), focus: "alexanderMesopotamia" }
      ]}
      frontLines={semanticFrontLines}
      gapScale={0.04}
      legendAxis="东征轴线"
      legendPrimary="马其顿推进"
      legendSecondary="抵抗 / 东进极限"
      mapPoints={mapPoints}
      maxGapDays={80}
      musicSource={publicPath("/audio/wikimedia-holst-mars.ogg")}
      narrationCues={narrationCues}
      playbackDurationSeconds={300}
      regionLabels={[
        { label: "MACEDON", coordinates: [22.5, 40.7] },
        { label: "ANATOLIA", coordinates: [31.0, 39.0] },
        { label: "LEVANT", coordinates: [35.5, 33.0] },
        { label: "EGYPT", coordinates: [30.7, 29.5] },
        { label: "MESOPOTAMIA", coordinates: [43.5, 33.5] },
        { label: "PERSIA", coordinates: [52.5, 31.0] },
        { label: "BACTRIA", coordinates: [66.5, 37.0] },
        { label: "INDUS", coordinates: [73.5, 32.0] }
      ]}
      rivers={[
        {
          id: "nile",
          label: "尼罗河",
          points: [
            [31.25, 29.85],
            [31.32, 30.4],
            [31.2, 31.2],
            [29.92, 31.2]
          ]
        },
        {
          id: "euphrates",
          label: "幼发拉底河",
          points: [
            [38.0, 36.2],
            [40.2, 35.4],
            [42.2, 34.1],
            [44.42, 32.54]
          ]
        },
        {
          id: "tigris",
          label: "底格里斯河",
          points: [
            [43.0, 37.0],
            [43.36, 36.37],
            [44.4, 34.4],
            [45.3, 32.8]
          ]
        },
        {
          id: "indus",
          label: "印度河",
          points: [
            [71.6, 35.9],
            [72.7, 34.4],
            [73.73, 32.93],
            [72.9, 30.8],
            [68.5, 25.2]
          ]
        }
      ]}
      shellClassName="alexander-conquests ancient-war"
      sfxProfile="ancient"
      subtitle="全片按5分钟播放设计：从马其顿继位、渡海入亚、推罗与埃及、高加米拉、波斯腹地、中亚到印度河极限。"
      terrainZones={[
        {
          coordinates: [35.2, 33.27],
          label: "腓尼基海岸",
          labelCoordinates: [35.8, 34.1],
          rx: 96,
          ry: 42
        },
        {
          coordinates: [59.0, 31.0],
          label: "伊朗高原",
          labelCoordinates: [57.0, 32.0],
          rx: 130,
          ry: 54
        },
        {
          coordinates: [66.8, 38.0],
          label: "中亚山地",
          labelCoordinates: [65.8, 38.9],
          rx: 118,
          ry: 48
        }
      ]}
      testId="alexander-app"
      timeStepDays={30}
      timingMode="compressed"
      timelineTitle="从马其顿继位到巴比伦终局"
      title="亚历山大大帝征服史"
      unitIcon="cavalry"
    />
  );
}
