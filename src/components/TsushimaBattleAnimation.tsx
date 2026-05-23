import {
  battleEvents,
  campaignEnd,
  campaignStart,
  crossingSalvoEffects,
  cueEventIds,
  frontLines,
  mapPoints
} from "../data/tsushimaBattle";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { tsushimaCampaignCountries, tsushimaCountryClassName } from "../lib/geoMap";
import { withUnitBadgeLabels } from "../lib/unitBadges";
import { publicPath } from "../lib/publicPath";
import { CampaignMapAnimation, type NarrationCue } from "./CampaignMapAnimation";

const timeline = createCampaignTimeline({
  activeSpans: frontLines.map(({ end, start }) => ({ end, start })),
  campaignStart,
  campaignEnd,
  events: battleEvents,
  points: mapPoints
});

const tacticalFrontLines = withUnitBadgeLabels(frontLines, {
  allies: "日",
  germany: "俄"
});

const narrationCues: NarrationCue[] = [
  {
    id: "approach",
    start: "1905-05-27T12:00",
    end: "1905-05-27T13:40",
    title: "第一幕 / 海峡入口",
    text: "信浓丸清晨发现俄舰队，画面从中午入峡开始压缩呈现：俄舰队北上，联合舰队已从东侧前出截击。"
  },
  {
    id: "intercept",
    start: "1905-05-27T13:40",
    end: "1905-05-27T15:10",
    title: "第二幕 / 横切截击",
    text: "日军从东侧切入并在俄舰队前方回头转向。关键不是尾追，而是抢到侧前方，集中炮火压住俄前导舰。"
  },
  {
    id: "gunfire",
    start: "1905-05-27T15:10",
    end: "1905-05-27T19:30",
    title: "第三幕 / 再截击",
    text: "奥斯利亚比亚沉没、苏沃洛夫号失控后，俄舰队转向分散。日军利用速度优势再次横切北逃舰列。"
  },
  {
    id: "night",
    start: "1905-05-27T19:30",
    end: "1905-05-28T12:00",
    title: "终幕 / 夜战与投降",
    text: "夜间雷击和持续追击让俄舰残部无法重组。第二天上午，残部被包围投降，海战结束。"
  }
];

export function TsushimaBattleAnimation() {
  return (
    <CampaignMapAnimation
      activeSpans={frontLines.map(({ end, start }) => ({ end, start }))}
      ariaLabel="日俄对马海战动态地图"
      battleEvents={battleEvents}
      battleEffects={crossingSalvoEffects}
      campaignEnd={campaignEnd}
      campaignStart={campaignStart}
      cinematicMode
      countries={tsushimaCampaignCountries}
      countryClassName={tsushimaCountryClassName}
      cueEvents={cueEventIds}
      eyebrow="战争动画藏书馆 / 现代战争"
      focusSteps={[
        { fromProgress: 0, focus: "tsushimaStrait" },
        { fromProgress: timeline.dateToProgress("1905-05-27T13:40"), focus: "tsushimaBattle" },
        { fromProgress: timeline.dateToProgress("1905-05-27T19:30"), focus: "tsushimaNorth" }
      ]}
      frontLines={tacticalFrontLines}
      legendAxis="舰队战术航迹"
      legendPrimary="俄第二太平洋舰队北上/残部"
      legendSecondary="日本联合舰队截击"
      mapPoints={mapPoints}
      musicSource={publicPath("/audio/wikimedia-hands-across-the-sea.ogg")}
      narrationCues={narrationCues}
      playbackDurationSeconds={300}
      regionLabels={[
        { label: "朝鲜半岛", coordinates: [128.18, 35.16] },
        { label: "对马海峡", coordinates: [129.55, 34.45] },
        { label: "九州", coordinates: [130.42, 33.55] }
      ]}
      retainSeaUnitsAfterRouteEnd
      shellClassName="tsushima-battle modern-war naval-war"
      sfxProfile="gunpowder"
      subtitle="全片按5分钟播放设计：短战争改用小时级时间轴，镜头收紧在对马海峡，突出侦察接触、东乡回头转向、两轮横切炮战、夜战和残部投降。"
      tacticalRouteRetention
      terrainZones={[]}
      testId="tsushima-app"
      timeCounterLabel="小时"
      timeStepDays={1 / 24}
      timelineTitle="1905年5月27日至28日的对马海峡舰队会战"
      title="日俄对马海战"
      unitIcon="warship"
    />
  );
}
