import {
  battleEvents,
  campaignEnd,
  campaignStart,
  frontLines,
  mapPoints
} from "../data/napoleonicWars";
import {
  europeCampaignCountries,
  europeCampaignCountryClassName
} from "../lib/geoMap";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { withUnitBadgeLabels } from "../lib/unitBadges";
import { publicPath } from "../lib/publicPath";
import { CampaignMapAnimation, type NarrationCue } from "./CampaignMapAnimation";

const activeSpans = frontLines.map(({ end, start }) => ({ end, start }));
const semanticFrontLines = withUnitBadgeLabels(frontLines, {
  allies: "盟",
  germany: "法"
});

const timeline = createCampaignTimeline({
  activeSpans,
  campaignStart,
  campaignEnd,
  events: battleEvents,
  gapScale: 0.08,
  maxGapDays: 120,
  points: mapPoints,
  timingMode: "compressed"
});

const narrationCues: NarrationCue[] = [
  {
    id: "italy-rise",
    start: "1796-03-27",
    end: "1799-11-09",
    title: "第一幕 / 意大利与埃及",
    text: "年轻将领从北意大利打出机动战样板，又把战争推向埃及。胜利扩大了声望，也暴露法国海权短板。"
  },
  {
    id: "imperial-peak",
    start: "1799-11-09",
    end: "1807-06-14",
    title: "第二幕 / 帝国巅峰",
    text: "雾月政变之后，军事声望变成政治权力。奥斯特里茨、耶拿和弗里德兰把欧洲大陆秩序推向法国主导。"
  },
  {
    id: "empire-stretched",
    start: "1808-05-02",
    end: "1812-09-14",
    title: "第三幕 / 战线拉长",
    text: "伊比利亚消耗帝国兵力，俄国远征把补给线拉到极限。拿破仑体系开始在空间和后勤上付出代价。"
  },
  {
    id: "coalition-return",
    start: "1812-10-19",
    end: "1815-06-18",
    title: "终幕 / 联军回潮",
    text: "俄国撤退、莱比锡、巴黎和滑铁卢连成终局。反法联盟把法国从攻势中心压回本土，帝国时代收束。"
  }
];

export function NapoleonicWarsAnimation() {
  return (
    <CampaignMapAnimation
      activeSpans={activeSpans}
      ariaLabel="拿破仑战争史动态地图"
      battleEvents={battleEvents}
      campaignEnd={campaignEnd}
      campaignStart={campaignStart}
      cinematicMode
      countries={europeCampaignCountries}
      countryClassName={europeCampaignCountryClassName}
      cueEvents={new Set(["italian-campaign", "austerlitz", "jena", "wagram", "russia", "leipzig", "waterloo"])}
      diveCueEvents={new Set(["austerlitz", "waterloo"])}
      eyebrow="战争动画藏书馆 / 现代战争"
      focusSteps={[
        { fromProgress: 0, focus: "europeCentral" },
        { fromProgress: timeline.dateToProgress("1798-07-21"), focus: "mediterranean" },
        { fromProgress: timeline.dateToProgress("1805-12-02"), focus: "europeCentral" },
        { fromProgress: timeline.dateToProgress("1812-06-24"), focus: "europeRussia" },
        { fromProgress: timeline.dateToProgress("1815-03-20"), focus: "north" }
      ]}
      frontLines={semanticFrontLines}
      gapScale={0.08}
      legendAxis="多战区作战"
      legendPrimary="法军/拿破仑推进"
      legendSecondary="反法联盟反攻"
      mapPoints={mapPoints}
      maxGapDays={120}
      musicSource={publicPath("/audio/radetzky-march.mp3")}
      narrationCues={narrationCues}
      playbackDurationSeconds={300}
      regionLabels={[
        { label: "FRANCE", coordinates: [2.2, 46.4] },
        { label: "ITALY", coordinates: [12.2, 43.4] },
        { label: "AUSTRIA", coordinates: [15.0, 47.7] },
        { label: "RUSSIA", coordinates: [34.0, 56.0] },
        { label: "IBERIA", coordinates: [-4.0, 40.2] }
      ]}
      rivers={[
        {
          id: "danube",
          label: "多瑙河",
          points: [
            [9.9, 48.4],
            [16.37, 48.2],
            [19.04, 47.5],
            [26.1, 44.4]
          ]
        },
        {
          id: "nile",
          label: "尼罗河",
          points: [
            [31.2, 30.0],
            [31.4, 29.2],
            [31.6, 28.2]
          ]
        }
      ]}
      shellClassName="napoleonic-wars"
      sfxProfile="gunpowder"
      subtitle="全片按5分钟播放设计：非作战间歇不计入播放轴，用分战区作战标签串联意大利、埃及、中欧、伊比利亚、俄国与滑铁卢。"
      terrainZones={[
        {
          coordinates: [7.7, 45.5],
          label: "ALPS",
          labelCoordinates: [7.1, 45.9],
          rx: 110,
          ry: 44
        }
      ]}
      testId="napoleonic-app"
      timingMode="compressed"
      timelineTitle="从意大利战役到滑铁卢"
      title="拿破仑争战史"
      unitIcon="cannon"
    />
  );
}
