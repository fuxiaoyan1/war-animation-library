import {
  battleEvents,
  campaignEnd,
  campaignStart,
  frontLines,
  mapPoints
} from "../data/crusades";
import {
  crusadesCampaignCountries,
  crusadesCountryClassName
} from "../lib/geoMap";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { withUnitBadgeLabels } from "../lib/unitBadges";
import { publicPath } from "../lib/publicPath";
import { CampaignMapAnimation, type NarrationCue } from "./CampaignMapAnimation";

const activeSpans = frontLines.map(({ end, start }) => ({ end, start }));
const semanticFrontLines = withUnitBadgeLabels(frontLines, {
  carthage: "穆",
  rome: "十"
});

const timeline = createCampaignTimeline({
  activeSpans,
  campaignStart,
  campaignEnd,
  events: battleEvents,
  gapScale: 0.02,
  maxGapDays: 70,
  points: mapPoints,
  timingMode: "compressed"
});

const narrationCues: NarrationCue[] = [
  {
    id: "first-crusade",
    start: "1095-11-27",
    end: "1099-07-15",
    title: "第一幕 / 远征成形",
    text: "从克莱蒙到君士坦丁堡，西欧军队穿过小亚细亚。安条克和耶路撒冷把远征变成长期占领。"
  },
  {
    id: "frontier-cracks",
    start: "1144-12-24",
    end: "1148-07-28",
    title: "第二幕 / 边疆崩裂",
    text: "埃德萨陷落暴露十字军国家纵深不足。第二次十字军未能恢复局势，东方反击力量开始重新整合。"
  },
  {
    id: "saladin",
    start: "1187-07-04",
    end: "1192-09-02",
    title: "第三幕 / 萨拉丁与海岸线",
    text: "哈丁之后，圣城失守；第三次十字军夺回阿卡，却把重心从内陆圣城转向海港和补给线。"
  },
  {
    id: "diversion-and-end",
    start: "1204-04-13",
    end: "1291-05-18",
    title: "终幕 / 偏航与终局",
    text: "第四次十字军攻陷君士坦丁堡，后期远征转向埃及却未能扭转局势。阿卡陷落后，黎凡特十字军国家终结。"
  }
];

export function CrusadesAnimation() {
  return (
    <CampaignMapAnimation
      activeSpans={activeSpans}
      ariaLabel="十字军东征动态地图"
      battleEvents={battleEvents}
      campaignEnd={campaignEnd}
      campaignStart={campaignStart}
      cinematicMode
      countries={crusadesCampaignCountries}
      countryClassName={crusadesCountryClassName}
      cueEvents={new Set(["jerusalem-1099", "edessa-1144", "hattin", "constantinople-1204", "acre-1291"])}
      eyebrow="War Animation Lab / 古代战争"
      focusSteps={[
        { fromProgress: 0, focus: "easternMediterranean" },
        { fromProgress: timeline.dateToProgress("1099-01-13"), focus: "levant" },
        { fromProgress: timeline.dateToProgress("1202-10-01"), focus: "easternMediterranean" },
        { fromProgress: timeline.dateToProgress("1248-06-01"), focus: "levant" }
      ]}
      frontLines={semanticFrontLines}
      gapScale={0.02}
      legendAxis="远征轴线"
      legendPrimary="十字军推进"
      legendSecondary="穆斯林政权反攻"
      mapPoints={mapPoints}
      maxGapDays={70}
      musicSource={publicPath("/audio/wikimedia-washington-post.ogg")}
      narrationCues={narrationCues}
      playbackDurationSeconds={300}
      regionLabels={[
        { label: "ANATOLIA", coordinates: [32.5, 39.4] },
        { label: "SYRIA", coordinates: [37.0, 35.0] },
        { label: "LEVANT", coordinates: [35.5, 32.6] },
        { label: "EGYPT", coordinates: [31.2, 30.0] }
      ]}
      rivers={[
        {
          id: "nile",
          label: "尼罗河",
          points: [
            [31.2, 30.0],
            [31.35, 30.6],
            [31.38, 31.04]
          ]
        }
      ]}
      shellClassName="crusades ancient-war"
      sfxProfile="ancient"
      subtitle="全片按5分钟播放设计：压缩非作战间歇，串联第一次十字军、埃德萨、哈丁、第三/第四次十字军、埃及与阿卡终局。"
      terrainZones={[
        {
          coordinates: [35.6, 31.9],
          label: "JUDEAN HILLS",
          labelCoordinates: [35.45, 31.95],
          rx: 92,
          ry: 42
        }
      ]}
      testId="crusades-app"
      timeStepDays={30}
      timingMode="compressed"
      timelineTitle="从克莱蒙号召到阿卡陷落"
      title="十字军东征"
      unitIcon="cavalry"
    />
  );
}
