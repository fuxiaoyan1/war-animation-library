import {
  battleEvents,
  battleCueEventIds,
  campaignEnd,
  campaignStart,
  frontLines,
  mapPoints
} from "../data/caesarWars";
import {
  caesarCampaignCountries,
  caesarCountryClassName
} from "../lib/geoMap";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { withUnitBadgeLabels } from "../lib/unitBadges";
import { publicPath } from "../lib/publicPath";
import { CampaignMapAnimation, type NarrationCue } from "./CampaignMapAnimation";

const activeSpans = frontLines.map(({ end, start }) => ({ end, start }));
const semanticFrontLines = withUnitBadgeLabels(frontLines, {
  carthage: "敌",
  rome: "凯"
});

const timeline = createCampaignTimeline({
  activeSpans,
  campaignStart,
  campaignEnd,
  events: battleEvents,
  gapScale: 0.04,
  maxGapDays: 75,
  points: mapPoints,
  timingMode: "compressed"
});

const narrationCues: NarrationCue[] = [
  {
    id: "gallic-opening",
    start: "BCE-0058-03-01",
    end: "BCE-0055-12-31",
    title: "第一幕 / 高卢成军",
    text: "凯撒先把边疆危机转成持续征服：赫尔维蒂、日耳曼威胁和比利时诸部，让他的军队在高卢成形。"
  },
  {
    id: "gallic-decision",
    start: "BCE-0055-01-01",
    end: "BCE-0052-10-01",
    title: "第二幕 / 海峡与阿莱西亚",
    text: "渡海不列颠扩大政治声望，阿莱西亚则用双重围城线压垮高卢联盟，凯撒的军事资本达到顶点。"
  },
  {
    id: "civil-war",
    start: "BCE-0049-01-10",
    end: "BCE-0048-08-09",
    title: "第三幕 / 共和国内战",
    text: "越过卢比孔后，战争从边疆转回罗马本土。凯撒先断西班牙，再渡海追庞培，法萨卢斯决定主战场。"
  },
  {
    id: "dictator-end",
    start: "BCE-0048-09-01",
    end: "BCE-0044-03-15",
    title: "终幕 / 地中海清场",
    text: "埃及、本都、北非和西班牙相继收束军事抵抗，但军事胜利没有解决共和国制度危机，终点落在三月十五日。"
  }
];

export function CaesarWarsAnimation() {
  return (
    <CampaignMapAnimation
      activeSpans={activeSpans}
      ariaLabel="凯撒大帝战争史动态地图"
      battleEvents={battleEvents}
      campaignEnd={campaignEnd}
      campaignStart={campaignStart}
      cinematicMode
      countries={caesarCampaignCountries}
      countryClassName={caesarCountryClassName}
      cueEvents={battleCueEventIds}
      eyebrow="War Animation Lab / 古代战争"
      focusSteps={[
        { fromProgress: 0, focus: "caesarGaul" },
        { fromProgress: timeline.dateToProgress("BCE-0055-08-01"), focus: "caesarBritain" },
        { fromProgress: timeline.dateToProgress("BCE-0052-03-01"), focus: "caesarGaul" },
        { fromProgress: timeline.dateToProgress("BCE-0049-01-10"), focus: "caesarItaly" },
        { fromProgress: timeline.dateToProgress("BCE-0049-12-01"), focus: "caesarGreece" },
        { fromProgress: timeline.dateToProgress("BCE-0048-09-01"), focus: "easternMediterranean" },
        { fromProgress: timeline.dateToProgress("BCE-0046-01-01"), focus: "caesarAfrica" },
        { fromProgress: timeline.dateToProgress("BCE-0045-01-01"), focus: "caesarSpain" },
        { fromProgress: timeline.dateToProgress("BCE-0045-03-18"), focus: "caesarWide" }
      ]}
      frontLines={semanticFrontLines}
      gapScale={0.04}
      legendAxis="凯撒战争轴"
      legendPrimary="凯撒推进"
      legendSecondary="共和派 / 抵抗"
      mapPoints={mapPoints}
      maxGapDays={75}
      musicSource={publicPath("/audio/wikimedia-1812-overture.ogg")}
      narrationCues={narrationCues}
      playbackDurationSeconds={300}
      regionLabels={[
        { label: "GAUL", coordinates: [2.5, 47.5] },
        { label: "BRITANNIA", coordinates: [-1.0, 52.2] },
        { label: "ITALIA", coordinates: [12.2, 43.2] },
        { label: "HISPANIA", coordinates: [-4.2, 40.0] },
        { label: "GRAECIA", coordinates: [21.5, 39.0] },
        { label: "AFRICA", coordinates: [10.5, 34.0] },
        { label: "AEGYPTUS", coordinates: [29.5, 30.4] }
      ]}
      rivers={[
        {
          id: "rhone",
          label: "罗讷河",
          points: [
            [6.14, 46.2],
            [5.1, 45.7],
            [4.84, 45.76],
            [4.8, 44.2],
            [4.36, 43.8]
          ]
        },
        {
          id: "rhine",
          label: "莱茵河",
          points: [
            [7.7, 47.6],
            [7.6, 49.0],
            [7.1, 50.1],
            [6.0, 51.1]
          ]
        },
        {
          id: "nile",
          label: "尼罗河",
          points: [
            [31.25, 29.85],
            [31.3, 30.5],
            [30.5, 31.0],
            [29.92, 31.2]
          ]
        }
      ]}
      shellClassName="caesar-wars ancient-war"
      sfxProfile="ancient"
      subtitle="全片按5分钟播放设计：从高卢战争、阿莱西亚、越过卢比孔、法萨卢斯，到埃及、本都、北非、西班牙和三月十五日。"
      terrainZones={[
        {
          coordinates: [4.5, 47.54],
          label: "高卢腹地",
          labelCoordinates: [3.4, 47.9],
          rx: 130,
          ry: 56
        },
        {
          coordinates: [22.38, 39.29],
          label: "希腊主战场",
          labelCoordinates: [21.4, 39.8],
          rx: 108,
          ry: 46
        },
        {
          coordinates: [10.68, 35.65],
          label: "北非战区",
          labelCoordinates: [10.0, 35.1],
          rx: 104,
          ry: 44
        }
      ]}
      testId="caesar-app"
      timeStepDays={30}
      timingMode="compressed"
      timelineTitle="从高卢军功到共和国终局"
      title="凯撒大帝战争史"
      unitIcon="cavalry"
    />
  );
}
