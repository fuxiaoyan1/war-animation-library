import {
  battleEvents,
  campaignEnd,
  campaignStart,
  cueEventIds,
  diveCueEventIds,
  frontLines,
  mapPoints
} from "../data/koreanWar";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { koreanWarCampaignCountries, koreanWarCountryClassName } from "../lib/geoMap";
import { CampaignMapAnimation, type NarrationCue } from "./CampaignMapAnimation";

const activeSpans = frontLines.map(({ end, start }) => ({ end, start }));
const gapOverrides = [
  { start: "1951-07-10", end: "1951-11-01", displayDays: 2.4 },
  { start: "1952-11-25", end: "1953-07-20", displayDays: 2.2 }
];

const timeline = createCampaignTimeline({
  activeSpans,
  campaignStart,
  campaignEnd,
  events: battleEvents,
  gapOverrides,
  gapScale: 0.018,
  inactiveGapDisplayDays: 1.4,
  maxGapDays: 18,
  points: mapPoints,
  timingMode: "compressed"
});

const narrationCues: NarrationCue[] = [
  {
    id: "collapse-to-busan",
    start: "1950-06-25",
    end: "1950-09-14",
    title: "第一幕 / 南进与釜山",
    text: "朝鲜人民军突破三八线后快速南下。釜山防御圈守住最后港口和补给口，反攻窗口由此保留下来。"
  },
  {
    id: "incheon-and-north",
    start: "1950-09-15",
    end: "1950-10-24",
    title: "第二幕 / 仁川逆转",
    text: "航母与舰炮掩护下，仁川登陆切入后方。汉城、平壤相继易手，战线逼近鸭绿江。"
  },
  {
    id: "pva-intervention",
    start: "1950-10-25",
    end: "1951-05-20",
    title: "第三幕 / 入朝与拉锯",
    text: "志愿军跨江入朝，长津湖、第三次战役和第五次战役把战线重新推回中部山地。"
  },
  {
    id: "air-and-trench",
    start: "1951-07-10",
    end: "1953-07-27",
    title: "终幕 / 谈判、空战与阵地",
    text: "谈判拖长，前线固化。米格走廊进入喷气空战时代，上甘岭等阵地战决定停战线上的局部控制。"
  }
];

export function KoreanWarAnimation() {
  return (
    <CampaignMapAnimation
      activeSpans={activeSpans}
      ariaLabel="抗美援朝战争动态地图"
      battleEvents={battleEvents}
      campaignEnd={campaignEnd}
      campaignStart={campaignStart}
      cinematicMode
      countries={koreanWarCampaignCountries}
      countryClassName={koreanWarCountryClassName}
      cueEvents={cueEventIds}
      diveCueEvents={diveCueEventIds}
      eyebrow="War Animation Lab / 现代战争"
      focusSteps={[
        { fromProgress: 0, focus: "koreaPeninsula" },
        { fromProgress: timeline.dateToProgress("1950-08-04"), focus: "koreaSouth" },
        { fromProgress: timeline.dateToProgress("1950-09-15"), focus: "koreaWestCoast" },
        { fromProgress: timeline.dateToProgress("1950-10-19"), focus: "koreaNorth" },
        { fromProgress: timeline.dateToProgress("1950-10-25"), focus: "koreaYalu" },
        { fromProgress: timeline.dateToProgress("1950-12-31"), focus: "koreaCentral" },
        { fromProgress: timeline.dateToProgress("1951-11-01"), focus: "koreaAirSea" },
        { fromProgress: timeline.dateToProgress("1952-10-14"), focus: "koreaCentral" },
        { fromProgress: timeline.dateToProgress("1953-07-20"), focus: "koreaCentral" }
      ]}
      frontLines={frontLines}
      gapOverrides={gapOverrides}
      gapScale={0.018}
      inactiveGapDisplayDays={1.4}
      legendAxis="陆海空联合轴线"
      legendPrimary="中朝行动"
      legendSecondary="联合国军行动"
      mapPoints={mapPoints}
      maxGapDays={18}
      musicSource="/audio/wikimedia-holst-jupiter.ogg"
      narrationCues={narrationCues}
      playbackDurationSeconds={300}
      regionLabels={[
        { label: "CHINA", coordinates: [123.2, 41.6] },
        { label: "NORTH KOREA", coordinates: [126.6, 40.1] },
        { label: "SOUTH KOREA", coordinates: [128.2, 36.2] },
        { label: "YELLOW SEA", coordinates: [124.8, 37.2] },
        { label: "SEA OF JAPAN", coordinates: [130.0, 38.6] }
      ]}
      rivers={[
        {
          id: "yalu",
          label: "鸭绿江",
          points: [
            [124.15, 40.08],
            [124.8, 40.4],
            [126.0, 41.45],
            [127.1, 41.7]
          ]
        },
        {
          id: "han",
          label: "汉江",
          points: [
            [126.65, 37.48],
            [126.98, 37.56],
            [127.45, 37.42]
          ]
        },
        {
          id: "nakdong",
          label: "洛东江",
          points: [
            [128.0, 36.4],
            [128.35, 35.75],
            [128.9, 35.2]
          ]
        }
      ]}
      shellClassName="korean-war modern-war"
      sfxProfile="ww2"
      subtitle="全片按5分钟播放设计：南进、仁川登陆、志愿军入朝、喷气空战、阵地战和停战谈判压缩到一条紧凑战役轴。"
      terrainZones={[
        {
          coordinates: [127.1, 40.0],
          label: "北部山地与严寒战区",
          labelCoordinates: [126.4, 40.85],
          rx: 138,
          ry: 74
        },
        {
          coordinates: [127.1, 38.2],
          label: "中部停战线",
          labelCoordinates: [126.6, 38.55],
          rx: 118,
          ry: 42
        }
      ]}
      testId="korean-app"
      timeStepDays={7}
      timelineTitle="从南进、仁川登陆到停战协定"
      timingMode="compressed"
      title="抗美援朝战争"
      unitIcon="infantry"
    />
  );
}
