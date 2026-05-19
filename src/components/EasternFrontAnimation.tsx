import {
  battleEvents,
  campaignEnd,
  campaignStart,
  frontLines,
  mapPoints
} from "../data/easternFront";
import {
  easternCountryClassName,
  easternFrontCountries
} from "../lib/geoMap";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { withUnitBadgeLabels } from "../lib/unitBadges";
import { CampaignMapAnimation, type NarrationCue } from "./CampaignMapAnimation";

const timeline = createCampaignTimeline({
  campaignStart,
  campaignEnd,
  events: battleEvents,
  points: mapPoints
});
const semanticFrontLines = withUnitBadgeLabels(frontLines, {
  allies: "苏",
  germany: "德"
});

const cueEvents = new Set([
  "barbarossa",
  "minsk-smolensk",
  "kiev-pocket",
  "moscow-counteroffensive",
  "stalingrad-urban",
  "uranus",
  "stalingrad-surrender",
  "kursk",
  "bagration",
  "vistula-oder",
  "berlin-battle",
  "berlin-surrender"
]);

const riverLines = [
  {
    id: "volga",
    label: "伏尔加河",
    points: [
      [37.65, 56.2],
      [40.4, 53.2],
      [44.5, 48.7],
      [45.4, 46.35]
    ] as Array<[number, number]>
  },
  {
    id: "don",
    label: "顿河",
    points: [
      [39.7, 51.7],
      [40.25, 49.6],
      [39.7, 47.2],
      [39.0, 46.3]
    ] as Array<[number, number]>
  },
  {
    id: "dnieper",
    label: "第聂伯河",
    points: [
      [31.0, 54.0],
      [30.5, 50.45],
      [32.6, 48.45],
      [35.1, 46.6]
    ] as Array<[number, number]>
  }
];

const narrationCues: NarrationCue[] = [
  {
    id: "opening-frontier",
    start: "1941-06-22",
    end: "1941-09-08",
    title: "第一幕 / 边境崩裂",
    text: "凌晨的边境被炮火撕开，三路集团军群向列宁格勒、莫斯科和乌克兰同时压进。地图上的每条亮线，都是一次把空间换成时间的赌博。"
  },
  {
    id: "moscow-winter",
    start: "1941-09-08",
    end: "1942-06-28",
    title: "第二幕 / 速胜破产",
    text: "德军抵近莫斯科，却被泥泞、寒冬、补给和苏军预备队拖住。闪击战的节奏第一次断裂，东线转入更漫长的工业消耗。"
  },
  {
    id: "volga-trap",
    start: "1942-06-28",
    end: "1943-02-02",
    title: "第三幕 / 伏尔加陷阱",
    text: "南线目标被拉向伏尔加和高加索，战线越拉越长。斯大林格勒的火光让攻势变成陷阱，包围者最终在冰冷废墟中被包围。"
  },
  {
    id: "soviet-initiative",
    start: "1943-02-02",
    end: "1944-06-22",
    title: "第四幕 / 主动权易手",
    text: "库尔斯克之后，德军再难发动同等规模的战略攻势。苏军把炮兵、装甲、桥头堡和后勤组织成连续推进的机器。"
  },
  {
    id: "bagration-collapse",
    start: "1944-06-22",
    end: "1945-01-12",
    title: "第五幕 / 中央集团军群崩溃",
    text: "白俄罗斯战场被撕开，明斯克、维斯瓦和巴尔干方向相继亮起。德国东欧缓冲地带消失，战争开始压向本土。"
  },
  {
    id: "berlin-finale",
    start: "1945-01-12",
    end: "1945-05-09",
    title: "终幕 / 通向柏林",
    text: "维斯瓦到奥得河只剩数周距离，柏林不再是地图后的政治符号，而是前线目标。东线以首都街区战和无条件投降收束。"
  }
];

export function EasternFrontAnimation() {
  return (
    <CampaignMapAnimation
      ariaLabel="1941至1945年苏德战争动态地图"
      battleEvents={battleEvents}
      campaignEnd={campaignEnd}
      campaignStart={campaignStart}
      cinematicMode
      countries={easternFrontCountries}
      countryClassName={easternCountryClassName}
      cueEvents={cueEvents}
      diveCueEvents={new Set(["stalingrad-urban"])}
      eyebrow="War Animation Lab / 现代战争"
      focusSteps={[
        { fromProgress: 0, focus: "easternOpening" },
        { fromProgress: timeline.dateToProgress("1942-06-28"), focus: "easternSouth" },
        { fromProgress: timeline.dateToProgress("1942-09-13"), focus: "easternStalingrad" },
        { fromProgress: timeline.dateToProgress("1943-07-05"), focus: "easternCentral" },
        { fromProgress: timeline.dateToProgress("1945-01-12"), focus: "easternBerlin" }
      ]}
      frontLines={semanticFrontLines}
      legendAxis="战役轴线"
      legendPrimary="德军推进"
      legendSecondary="苏军反攻"
      mapPoints={mapPoints}
      musicSource="/audio/fiftysounds-false-flag.mp3"
      narrationCues={narrationCues}
      playbackDurationSeconds={300}
      regionLabels={[
        { label: "POLAND", coordinates: [18.6, 52.4] },
        { label: "BELARUS", coordinates: [28.4, 53.5] },
        { label: "UKRAINE", coordinates: [32.4, 49.2] },
        { label: "USSR", coordinates: [38.0, 56.4] }
      ]}
      rivers={riverLines}
      shellClassName="eastern-front"
      sfxProfile="ww2"
      subtitle="全片按5分钟播放设计：从巴巴罗萨、莫斯科、斯大林格勒、库尔斯克到柏林。"
      terrainZones={[
        {
          coordinates: [34.5, 49.5],
          label: "UKRAINIAN STEPPE",
          labelCoordinates: [33.8, 49.6],
          rx: 180,
          ry: 74
        }
      ]}
      testId="eastern-front-app"
      timelineTitle="从巴巴罗萨到柏林"
      title="1941-1945 苏德战争全景"
      unitIcon="tank"
    />
  );
}
