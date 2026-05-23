import {
  battleEvents,
  campaignEnd,
  campaignStart,
  crossingSalvoEffects,
  cueEventIds,
  frontLines,
  mapPoints
} from "../data/jutlandBattle";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { jutlandCampaignCountries, jutlandCountryClassName } from "../lib/geoMap";
import { publicPath } from "../lib/publicPath";
import { withUnitBadgeLabels } from "../lib/unitBadges";
import { CampaignMapAnimation, type NarrationCue } from "./CampaignMapAnimation";

const activeSpans = frontLines.map(({ end, start }) => ({ end, start }));

const timeline = createCampaignTimeline({
  activeSpans,
  campaignStart,
  campaignEnd,
  events: battleEvents,
  points: mapPoints
});

const tacticalFrontLines = withUnitBadgeLabels(frontLines, {
  britain: "英",
  germany: "德"
});

const narrationCues: NarrationCue[] = [
  {
    id: "contact",
    start: "1916-05-31T14:20",
    end: "1916-05-31T15:48",
    title: "第一幕 / 侦察接触",
    text: "英德侦察部队在北海接触。双方都想把对方拖向己方主力，日德兰从一开始就是侦察链与诱敌链的较量。"
  },
  {
    id: "south",
    start: "1916-05-31T15:48",
    end: "1916-05-31T16:40",
    title: "第二幕 / 南向追逐",
    text: "Hipper向南引诱，Beatty追击中遭到重创。战列巡洋舰高航速、重炮和防护取舍在这一段暴露出代价。"
  },
  {
    id: "north",
    start: "1916-05-31T16:40",
    end: "1916-05-31T18:15",
    title: "第三幕 / 北向引诱",
    text: "Beatty发现德军主力后北撤，把Scheer引向Jellicoe。战场主动权从前卫战斗转向主力舰队部署。"
  },
  {
    id: "deployment",
    start: "1916-05-31T18:15",
    end: "1916-05-31T19:10",
    title: "第四幕 / 横切与转向",
    text: "Jellicoe展开大舰队试图横切T字，Scheer两次全舰队转向脱离。大舰队会战的胜负窗口只持续很短时间。"
  },
  {
    id: "night",
    start: "1916-05-31T19:10",
    end: "1916-06-01T03:30",
    title: "终幕 / 夜间撤离",
    text: "夜间接触混乱，德军主力穿越英军尾部撤离。英国保持北海封锁，德国主力舰队避免被毁但未改变战略态势。"
  }
];

export function JutlandBattleAnimation() {
  return (
    <CampaignMapAnimation
      activeSpans={activeSpans}
      ariaLabel="日德兰海战动态地图"
      battleEvents={battleEvents}
      battleEffects={crossingSalvoEffects}
      campaignEnd={campaignEnd}
      campaignStart={campaignStart}
      cinematicMode
      countries={jutlandCampaignCountries}
      countryClassName={jutlandCountryClassName}
      cueEvents={cueEventIds}
      cueEventKinds={{
        "queen-mary-loss": "combined",
        "scheer-turns-away": "combined",
        "battlecruiser-death-ride": "combined"
      }}
      eyebrow="战争动画藏书馆 / 现代战争"
      focusSteps={[
        { fromProgress: 0, focus: "jutlandWide" },
        { fromProgress: timeline.dateToProgress("1916-05-31T15:48"), focus: "jutlandRunSouth" },
        { fromProgress: timeline.dateToProgress("1916-05-31T16:40"), focus: "jutlandRunNorth" },
        { fromProgress: timeline.dateToProgress("1916-05-31T18:15"), focus: "jutlandMainBattle" },
        { fromProgress: timeline.dateToProgress("1916-05-31T19:00"), focus: "jutlandMainBattle" },
        { fromProgress: timeline.dateToProgress("1916-05-31T21:00"), focus: "jutlandNightEscape" }
      ]}
      focusTransitionProgress={0.035}
      frontLines={tacticalFrontLines}
      legendAxis="主力舰队航迹 / 展开方向"
      legendPrimary="德国公海舰队"
      legendSecondary="英国大舰队"
      mapPoints={mapPoints}
      musicSource={publicPath("/audio/wikimedia-eternal-father-instrumental.ogg")}
      narrationCues={narrationCues}
      playbackDurationSeconds={300}
      regionLabels={[
        { label: "北海", coordinates: [3.0, 56.4] },
        { label: "日德兰半岛", coordinates: [8.4, 56.4] },
        { label: "苏格兰方向", coordinates: [-2.8, 58.2] }
      ]}
      retainSeaUnitsAfterRouteEnd
      shellClassName="jutland-battle modern-war naval-war dreadnought-war"
      sfxProfile="gunpowder"
      subtitle="无畏舰时代最大舰队会战：压缩呈现侦察接触、南向追逐、北向引诱、Jellicoe展开、Scheer全舰队转向与夜间撤离。"
      tacticalRouteRetention
      terrainZones={[]}
      testId="jutland-app"
      timeCounterLabel="小时"
      timeStepDays={1 / 288}
      timelineTitle="1916年5月31日至6月1日的日德兰海战"
      title="日德兰海战"
      unitIcon="warship"
    />
  );
}
