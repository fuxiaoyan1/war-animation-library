import {
  battleEvents,
  campaignEnd,
  campaignStart,
  frontLines,
  mapPoints
} from "../data/battleOfFrance";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { countryClassName, westernEuropeCountries } from "../lib/geoMap";
import { publicPath } from "../lib/publicPath";
import { CampaignMapAnimation, type NarrationCue } from "./CampaignMapAnimation";

const timeline = createCampaignTimeline({
  campaignStart,
  campaignEnd,
  events: battleEvents,
  points: mapPoints
});

const cueEvents = new Set([
  "yellow-plan",
  "ardennes-traffic",
  "sedan-crossing",
  "meuse-breakout",
  "abbeville-channel",
  "arras-counterattack",
  "dunkirk-pocket",
  "belgium-surrenders",
  "fall-rot",
  "paris-falls"
]);

const narrationCues: NarrationCue[] = [
  {
    id: "yellow-plan",
    start: "1940-05-10",
    end: "1940-05-20",
    title: "第一幕 / 阿登穿插",
    text: "低地国家方向吸走盟军主力，真正的装甲矛头穿过阿登，在色当撕开默兹河防线。"
  },
  {
    id: "channel-pocket",
    start: "1940-05-20",
    end: "1940-06-04",
    title: "第二幕 / 海峡口袋",
    text: "德军抵达英吉利海峡，北部盟军被切成口袋。敦刻尔克撤离保存了英军骨干，但大陆战局已经逆转。"
  },
  {
    id: "fall-rot",
    start: "1940-06-05",
    end: "1940-06-17",
    title: "第三幕 / 法国崩裂",
    text: "红色方案越过索姆-埃纳防线，巴黎失守，法国政府南撤，防御体系从连续战线变成政治崩溃。"
  },
  {
    id: "armistice",
    start: "1940-06-18",
    end: "1940-06-22",
    title: "终幕 / 贡比涅停战",
    text: "停战在贡比涅签署。德国速胜完成，英国撤出大陆，西欧战局进入新的长期对峙。"
  }
];

export function BattleFranceAnimation() {
  return (
    <CampaignMapAnimation
      ariaLabel="1940年德法战役动态地图"
      battleEvents={battleEvents}
      campaignEnd={campaignEnd}
      campaignStart={campaignStart}
      countries={westernEuropeCountries}
      countryClassName={countryClassName}
      cueEvents={cueEvents}
      diveCueEvents={new Set(["dunkirk-pocket"])}
      eyebrow="War Animation Lab / 实验一"
      focusSteps={[
        { fromProgress: 0, focus: "north" },
        { fromProgress: timeline.dateToProgress("1940-06-10"), focus: "france" },
        { fromProgress: timeline.dateToProgress("1940-06-21"), focus: "armistice" }
      ]}
      frontLines={frontLines}
      legendAxis="战役轴线"
      legendPrimary="德军推进"
      legendSecondary="盟军行动"
      mapPoints={mapPoints}
      musicSource={publicPath("/audio/directory-audio-military-exercise.mp3")}
      narrationCues={narrationCues}
      playbackDurationSeconds={300}
      regionLabels={[
        { label: "NETHERLANDS", coordinates: [4.9, 52.0] },
        { label: "BELGIUM", coordinates: [4.5, 50.75] },
        { label: "FRANCE", coordinates: [2.2, 47.35] },
        { label: "GERMANY", coordinates: [6.45, 50.65] }
      ]}
      rivers={[
        {
          id: "meuse",
          label: "默兹河",
          points: [
            [5.67, 50.98],
            [5.58, 50.63],
            [5.09, 50.46],
            [4.91, 50.26],
            [4.86, 50.01],
            [4.94, 49.7]
          ]
        },
        {
          id: "somme",
          label: "索姆河",
          points: [
            [2.75, 49.93],
            [2.3, 49.89],
            [1.84, 50.11],
            [1.62, 50.2]
          ]
        },
        {
          id: "seine",
          label: "塞纳河",
          points: [
            [2.55, 48.9],
            [2.35, 48.86],
            [1.1, 49.44],
            [0.12, 49.49]
          ]
        }
      ]}
      shellClassName="battle-of-france modern-war"
      sfxProfile="ww2"
      subtitle="真实西欧底图上的阿登突击、色当突破、敦刻尔克与法国陷落。"
      terrainZones={[
        {
          className: "forest-zone",
          coordinates: [5.45, 49.92],
          label: "ARDENNES",
          labelCoordinates: [5.27, 49.95],
          rx: 86,
          ry: 68
        }
      ]}
      testId="battle-app"
      timelineTitle="从阿登到贡比涅"
      title="1940 德法战役"
      unitIcon="tank"
    />
  );
}
