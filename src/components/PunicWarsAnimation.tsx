import {
  battleEvents,
  battleCueEventIds,
  campaignEnd,
  campaignStart,
  frontLines,
  mapPoints
} from "../data/punicWars";
import {
  mediterraneanCampaignCountries,
  mediterraneanCountryClassName
} from "../lib/geoMap";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { CampaignMapAnimation, type NarrationCue } from "./CampaignMapAnimation";

const activeSpans = frontLines.map(({ end, start }) => ({ end, start }));

const timeline = createCampaignTimeline({
  activeSpans,
  campaignStart,
  campaignEnd,
  events: battleEvents,
  gapScale: 0.015,
  maxGapDays: 80,
  points: mapPoints,
  timingMode: "compressed"
});

const narrationCues: NarrationCue[] = [
  {
    id: "sicily-sea",
    start: "BCE-0264-01-01",
    end: "BCE-0241-01-01",
    title: "第一幕 / 西西里与海权",
    text: "罗马第一次大规模跨海作战，西西里把陆战强国逼成造舰国家。海权成为两强争霸的第一道门槛。"
  },
  {
    id: "hannibal-italy",
    start: "BCE-0219-01-01",
    end: "BCE-0211-01-01",
    title: "第二幕 / 汉尼拔入意大利",
    text: "汉尼拔从伊比利亚越过阿尔卑斯，把战争带进意大利。特雷比亚、特拉西梅诺和坎尼让罗马濒临崩溃。"
  },
  {
    id: "rome-recovery",
    start: "BCE-0210-01-01",
    end: "BCE-0202-01-01",
    title: "第三幕 / 罗马反攻",
    text: "罗马避免决战崩溃，转向伊比利亚和非洲。战争重心离开意大利，扎马把主动权彻底转回罗马。"
  },
  {
    id: "carthage-falls",
    start: "BCE-0149-01-01",
    end: "BCE-0146-01-01",
    title: "终幕 / 迦太基陷落",
    text: "第三次战争不再是均势争霸，而是罗马对旧敌的最终清算。迦太基陷落后，西地中海进入罗马时代。"
  }
];

export function PunicWarsAnimation() {
  return (
    <CampaignMapAnimation
      activeSpans={activeSpans}
      ariaLabel="三次布匿战争动态地图"
      battleEvents={battleEvents}
      campaignEnd={campaignEnd}
      campaignStart={campaignStart}
      cinematicMode
      countries={mediterraneanCampaignCountries}
      countryClassName={mediterraneanCountryClassName}
      cueEvents={battleCueEventIds}
      diveCueEvents={new Set(["cannae"])}
      eyebrow="War Animation Lab / 古代战争"
      focusSteps={[
        { fromProgress: 0, focus: "centralMediterranean" },
        { fromProgress: timeline.dateToProgress("BCE-0219-01-01"), focus: "westernMediterranean" },
        { fromProgress: timeline.dateToProgress("BCE-0204-01-01"), focus: "centralMediterranean" },
        { fromProgress: timeline.dateToProgress("BCE-0149-01-01"), focus: "centralMediterranean" }
      ]}
      frontLines={frontLines}
      gapScale={0.015}
      legendAxis="分阶段作战"
      legendPrimary="迦太基/汉尼拔推进"
      legendSecondary="罗马推进"
      mapPoints={mapPoints}
      maxGapDays={80}
      musicSource="/audio/fiftysounds-only-the-braves.mp3"
      narrationCues={narrationCues}
      playbackDurationSeconds={300}
      regionLabels={[
        { label: "ITALIA", coordinates: [12.6, 42.2] },
        { label: "SICILIA", coordinates: [14.1, 37.5] },
        { label: "CARTHAGE", coordinates: [9.7, 36.4] },
        { label: "IBERIA", coordinates: [-2.0, 39.4] },
        { label: "AFRICA", coordinates: [10.5, 34.8] }
      ]}
      rivers={[
        {
          id: "rhone",
          label: "罗讷河",
          points: [
            [4.84, 43.95],
            [4.7, 44.6],
            [4.85, 45.75]
          ]
        }
      ]}
      shellClassName="punic-wars ancient-war"
      sfxProfile="ancient"
      subtitle="全片按5分钟播放设计：休战与非作战间歇不计入播放轴，重点连贯展示西西里、意大利、伊比利亚与非洲作战。"
      terrainZones={[
        {
          coordinates: [7.7, 45.5],
          label: "ALPS",
          labelCoordinates: [7.4, 45.9],
          rx: 110,
          ry: 42
        }
      ]}
      testId="punic-app"
      timingMode="compressed"
      timelineTitle="从西西里争夺到迦太基陷落"
      title="罗马与迦太基：三次布匿战争史"
      unitIcon="cavalry"
    />
  );
}
