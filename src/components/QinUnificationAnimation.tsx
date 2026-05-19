import {
  battleEvents,
  campaignEnd,
  campaignStart,
  frontLines,
  historicalRegions,
  mapPoints
} from "../data/qinUnification";
import { qinCampaignCountries, qinCountryClassName } from "../lib/geoMap";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { withUnitBadgeLabels } from "../lib/unitBadges";
import { publicPath } from "../lib/publicPath";
import { CampaignMapAnimation, type NarrationCue } from "./CampaignMapAnimation";

const activeSpans = frontLines.map(({ end, start }) => ({ end, start }));
const semanticFrontLines = withUnitBadgeLabels(frontLines, {
  carthage: "秦",
  rome: "楚"
});

const timeline = createCampaignTimeline({
  activeSpans,
  campaignStart,
  campaignEnd,
  events: battleEvents,
  gapScale: 0.05,
  maxGapDays: 45,
  points: mapPoints,
  timingMode: "compressed"
});

const narrationCues: NarrationCue[] = [
  {
    id: "eastward-opening",
    start: "BCE-0230-01-01",
    end: "BCE-0228-01-01",
    title: "第一幕 / 函谷东出",
    text: "秦从关中东出，先灭韩，再压垮赵国主干。统一战争不是地图染色，而是逐一拆掉六国互援结构。"
  },
  {
    id: "central-plains",
    start: "BCE-0227-01-01",
    end: "BCE-0225-12-31",
    title: "第二幕 / 中原收束",
    text: "燕国以刺杀冒险回应压力，魏国在大梁失守。秦军取得中原回旋空间，但楚国仍能让轻进部队付出代价。"
  },
  {
    id: "chu-and-final",
    start: "BCE-0224-01-01",
    end: "BCE-0221-10-01",
    title: "终幕 / 南北清场",
    text: "王翦以大军稳进灭楚，燕代残余被清除，齐国投降。战国终结，秦把战争胜利转化为统一帝国。"
  }
];

export function QinUnificationAnimation() {
  return (
    <CampaignMapAnimation
      activeSpans={activeSpans}
      ariaLabel="大秦统一中国战史动态地图"
      battleEvents={battleEvents}
      campaignEnd={campaignEnd}
      campaignStart={campaignStart}
      cinematicMode
      countries={qinCampaignCountries}
      countryClassName={qinCountryClassName}
      cueEvents={new Set(["han-falls", "zhao-falls", "wei-falls", "li-xin-defeat", "chu-falls", "qi-falls"])}
      eyebrow="War Animation Lab / 古代战争"
      focusSteps={[
        { fromProgress: 0, focus: "chinaGuanzhongExpanded" },
        { fromProgress: timeline.dateToProgress("BCE-0228-01-01"), focus: "chinaWarringStates" },
        { fromProgress: timeline.dateToProgress("BCE-0225-01-01"), focus: "chinaEastExpanded" },
        { fromProgress: timeline.dateToProgress("BCE-0223-01-01"), focus: "chinaWarringStates" }
      ]}
      frontLines={semanticFrontLines}
      gapScale={0.05}
      historicalRegions={historicalRegions}
      legendAxis="统一轴线"
      legendPrimary="秦军推进"
      legendSecondary="六国反击"
      mapPoints={mapPoints}
      maxGapDays={45}
      musicSource={publicPath("/audio/fiftysounds-invincible.mp3")}
      narrationCues={narrationCues}
      playbackDurationSeconds={300}
      regionLabels={[
        { label: "关中秦本土", coordinates: [107.2, 35.6] },
        { label: "三晋中原", coordinates: [113.6, 35.5] },
        { label: "燕赵北疆", coordinates: [118.2, 40.0] },
        { label: "楚淮汉水", coordinates: [114.2, 31.2] },
        { label: "齐鲁海岱", coordinates: [119.2, 36.0] }
      ]}
      rivers={[
        {
          id: "yellow-river",
          label: "黄河",
          points: [
            [103.8, 36.2],
            [106.2, 37.7],
            [108.8, 37.6],
            [110.5, 36.7],
            [111.2, 35.3],
            [112.7, 34.8],
            [114.4, 35.0],
            [116.0, 35.8],
            [118.6, 37.2],
            [119.0, 37.8]
          ]
        },
        {
          id: "huai",
          label: "淮水",
          points: [
            [112.8, 32.7],
            [114.6, 33.0],
            [116.4, 33.0],
            [118.2, 32.8],
            [120.0, 32.4]
          ]
        },
        {
          id: "han-river",
          label: "汉水",
          points: [
            [106.5, 33.2],
            [108.9, 32.6],
            [111.0, 31.8],
            [112.5, 30.7],
            [114.3, 30.5]
          ]
        },
        {
          id: "yangtze",
          label: "长江",
          points: [
            [105.5, 30.6],
            [108.4, 30.5],
            [111.2, 30.4],
            [114.3, 30.6],
            [117.2, 30.8],
            [120.3, 31.4]
          ]
        }
      ]}
      shellClassName="qin-unification ancient-war"
      sfxProfile="ancient"
      subtitle="全片按5分钟播放设计：从灭韩、破赵、灭魏楚燕齐，到战国结束、秦帝国建立。"
      terrainZones={[
        {
          coordinates: [108.4, 34.4],
          label: "关中",
          labelCoordinates: [107.5, 34.8],
          rx: 110,
          ry: 48
        },
        {
          coordinates: [116.1, 31.7],
          label: "楚地",
          labelCoordinates: [115.1, 31.9],
          rx: 118,
          ry: 52
        }
      ]}
      testId="qin-app"
      timeStepDays={30}
      timingMode="compressed"
      timelineTitle="从灭韩到天下归一"
      title="大秦统一中国战史"
      unitIcon="chariot"
    />
  );
}
