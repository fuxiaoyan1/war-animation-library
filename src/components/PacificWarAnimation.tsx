import {
  battleEvents,
  campaignEnd,
  campaignStart,
  frontLines,
  mapPoints
} from "../data/pacificWar";
import {
  pacificCampaignCountries,
  pacificCountryClassName
} from "../lib/geoMap";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { withUnitBadgeLabels } from "../lib/unitBadges";
import { publicPath } from "../lib/publicPath";
import { CampaignMapAnimation, type NarrationCue } from "./CampaignMapAnimation";

const activeSpans = frontLines.map(({ end, start }) => ({ end, start }));
const semanticFrontLines = withUnitBadgeLabels(frontLines, {
  allies: "美",
  germany: "日"
});

const timeline = createCampaignTimeline({
  activeSpans,
  campaignStart,
  campaignEnd,
  events: battleEvents,
  gapScale: 0.04,
  inactiveGapDisplayDays: 3,
  maxGapDays: 30,
  points: mapPoints,
  timingMode: "compressed"
});

const narrationCues: NarrationCue[] = [
  {
    id: "japan-offensive",
    start: "1941-12-07",
    end: "1942-05-08",
    title: "第一幕 / 航母突袭与南进",
    text: "珍珠港的航母突袭打开战争，南方资源区快速陷落。日本赢得空间，但也把海上交通线拉到极限。"
  },
  {
    id: "carrier-turning",
    start: "1942-05-08",
    end: "1943-02-09",
    title: "第二幕 / 航母改变主动权",
    text: "珊瑚海挡住南下，中途岛重创日本主力航母。瓜达尔卡纳尔把胜负从一场决战拖成持续补给与消耗。"
  },
  {
    id: "island-hopping",
    start: "1943-11-20",
    end: "1944-10-25",
    title: "第三幕 / 岛链推进",
    text: "塔拉瓦、马里亚纳、莱特湾串起中太平洋和菲律宾路线。航母不只是决战兵器，也是移动机场和两栖登陆保护伞。"
  },
  {
    id: "home-islands",
    start: "1945-02-19",
    end: "1945-09-02",
    title: "终幕 / 本土门前",
    text: "硫磺岛和冲绳把战争推到日本本土门口。原子弹、苏联参战和封锁共同压向投降，东京湾成为终点。"
  }
];

export function PacificWarAnimation() {
  return (
    <CampaignMapAnimation
      activeSpans={activeSpans}
      ariaLabel="日美太平洋战争动态地图"
      battleEvents={battleEvents}
      campaignEnd={campaignEnd}
      campaignStart={campaignStart}
      cinematicMode
      countries={pacificCampaignCountries}
      countryClassName={pacificCountryClassName}
      cueEvents={new Set(["pearl-harbor", "midway", "guadalcanal", "saipan", "leyte-gulf", "okinawa", "surrender"])}
      diveCueEvents={new Set(["pearl-harbor", "midway", "leyte-gulf", "okinawa"])}
      eyebrow="战争动画藏书馆 / 现代战争"
      focusSteps={[
        { fromProgress: 0, focus: "pacificPearl" },
        { fromProgress: timeline.dateToProgress("1942-02-15"), focus: "pacificWide" },
        { fromProgress: timeline.dateToProgress("1942-05-04"), focus: "pacificSouth" },
        { fromProgress: timeline.dateToProgress("1942-06-03"), focus: "pacificCentral" },
        { fromProgress: timeline.dateToProgress("1942-08-07"), focus: "pacificSouth" },
        { fromProgress: timeline.dateToProgress("1943-11-20"), focus: "pacificGilberts" },
        { fromProgress: timeline.dateToProgress("1944-06-15"), focus: "pacificMarianas" },
        { fromProgress: timeline.dateToProgress("1944-10-20"), focus: "pacificPhilippines" },
        { fromProgress: timeline.dateToProgress("1945-02-19"), focus: "pacificIwo" },
        { fromProgress: timeline.dateToProgress("1945-04-01"), focus: "pacificRyukyus" },
        { fromProgress: timeline.dateToProgress("1945-08-06"), focus: "pacificJapan" }
      ]}
      frontLines={semanticFrontLines}
      gapScale={0.04}
      inactiveGapDisplayDays={3}
      legendAxis="航母战役轴线"
      legendPrimary="日军航母突击"
      legendSecondary="美军航母反攻"
      mapPoints={mapPoints}
      maxGapDays={30}
      musicSource={publicPath("/audio/semper-fidelis-march.mp3")}
      narrationCues={narrationCues}
      playbackDurationSeconds={300}
      regionLabels={[
        { label: "JAPAN", coordinates: [139.7, 35.7] },
        { label: "HAWAII", coordinates: [202.05, 21.36] },
        { label: "CENTRAL PACIFIC", coordinates: [178.0, 12.0] },
        { label: "SOUTH PACIFIC", coordinates: [160.0, -9.0] }
      ]}
      shellClassName="pacific-war modern-war"
      sfxProfile="ww2"
      subtitle="全片按5分钟播放设计：非作战空档压缩，镜头按瓜岛、塔拉瓦、马里亚纳、莱特湾、硫磺岛、冲绳和东京湾连续推进。"
      terrainZones={[
        {
          className: "sea-zone",
          coordinates: [176.0, 8.0],
          label: "CARRIER WAR",
          labelCoordinates: [171.0, 8.8],
          rx: 188,
          ry: 78
        }
      ]}
      testId="pacific-app"
      timelineTitle="从珍珠港到东京湾"
      timingMode="compressed"
      title="日美太平洋战争战史"
      unitIcon="carrier"
    />
  );
}
