import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  battleEffects,
  battleEvents,
  campaignEnd,
  campaignStart,
  cueEventIds,
  cueEventKinds,
  frontLines,
  timelineActiveSpans,
  timelineDateAnchors,
  timelineGapOverrides,
  timelineInactiveGapDisplayDays,
  mapPoints
} from "../data/nianzhuangBattle";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { publicPath } from "../lib/publicPath";
import { formatChineseDate } from "../lib/timeline";
import { useMapInteraction, type MapView } from "../lib/useMapInteraction";
import { withUnitBadgeLabels } from "../lib/unitBadges";
import { WarScore, type BattleCueKind } from "../lib/warScore";
import type { NarrationCue } from "./CampaignMapAnimation";
import {
  buildNianzhuangRouteState,
  linePointsUntil,
  lineProgressForRoute,
  NianzhuangTerrain3D,
  type NianzhuangEffectState,
  type NianzhuangRouteState
} from "./NianzhuangTerrain3D";

const mapWidth = 4800;
const mapHeight = 2880;
const nianzhuangMinMapScale = 0.86;
const nianzhuangViewportCenterX = mapWidth / 2;
const nianzhuangViewportCenterY = mapHeight / 2;
const nianzhuangInteractionBounds = {
  east: 118.42,
  north: 34.452,
  south: 34.07,
  west: 117.16
};
const musicSource = publicPath("/audio/wikimedia-the-thunderer-us-army.ogg");

type NianzhuangCameraStageId =
  | "nianzhuangPursuit"
  | "nianzhuangPocket"
  | "nianzhuangRelief"
  | "nianzhuangBreakthrough"
  | "nianzhuangCompression"
  | "nianzhuangFinal";

type NianzhuangCameraStage = {
  center: [number, number];
  focusRoutePoints: Array<[number, number]>;
  scale: number;
  terrainZoom: number;
};

type NianzhuangFocusState = {
  focus: NianzhuangCameraStageId;
  fromFocus: NianzhuangCameraStageId;
  isTransitioning: boolean;
  ratio: number;
  rawRatio: number;
  transitionProgress: number;
};

const nianzhuangCameraStages: Record<NianzhuangCameraStageId, NianzhuangCameraStage> = {
  nianzhuangPursuit: {
    center: [118.12, 34.32],
    focusRoutePoints: [
      [117.8, 34.17],
      [118.4, 34.18],
      [118.4, 34.452],
      [117.82, 34.405]
    ],
    scale: 0.86,
    terrainZoom: 10.28
  },
  nianzhuangPocket: {
    center: [117.858, 34.294],
    focusRoutePoints: [
      [117.72, 34.205],
      [117.995, 34.205],
      [117.995, 34.385],
      [117.72, 34.385]
    ],
    scale: 1.42,
    terrainZoom: 11.0
  },
  nianzhuangRelief: {
    center: [117.55, 34.275],
    focusRoutePoints: [
      [117.16, 34.09],
      [117.8, 34.1],
      [117.8, 34.42],
      [117.16, 34.42]
    ],
    scale: 0.86,
    terrainZoom: 10.24
  },
  nianzhuangBreakthrough: {
    center: [117.862, 34.292],
    focusRoutePoints: [
      [117.73, 34.22],
      [117.975, 34.22],
      [117.975, 34.365],
      [117.73, 34.365]
    ],
    scale: 1.62,
    terrainZoom: 11.08
  },
  nianzhuangCompression: {
    center: [117.875, 34.292],
    focusRoutePoints: [
      [117.79, 34.238],
      [117.95, 34.238],
      [117.95, 34.345],
      [117.79, 34.345]
    ],
    scale: 1.86,
    terrainZoom: 11.32
  },
  nianzhuangFinal: {
    center: [117.902, 34.286],
    focusRoutePoints: [
      [117.82, 34.218],
      [118.0, 34.218],
      [118.0, 34.36],
      [117.82, 34.36]
    ],
    scale: 1.74,
    terrainZoom: 11.22
  }
};

const focusSteps = [
  { date: campaignStart, focus: "nianzhuangPursuit" },
  { date: "1948-11-10T20:00", focus: "nianzhuangPocket" },
  { date: "1948-11-11T12:00", focus: "nianzhuangRelief" },
  { date: "1948-11-13T06:00", focus: "nianzhuangPocket" },
  { date: "1948-11-15T02:00", focus: "nianzhuangPocket" },
  { date: "1948-11-19T10:00", focus: "nianzhuangBreakthrough" },
  { date: "1948-11-19T21:15", focus: "nianzhuangCompression" },
  { date: "1948-11-20T05:30", focus: "nianzhuangFinal" },
  { date: "1948-11-22T16:00", focus: "nianzhuangFinal" }
] satisfies Array<{ date: string; focus: NianzhuangCameraStageId }>;

const nianzhuangFocusTransitionProgress = 0.042;

const timeline = createCampaignTimeline({
  activeSpans: timelineActiveSpans,
  campaignEnd,
  campaignStart,
  dateAnchors: timelineDateAnchors,
  events: battleEvents,
  gapOverrides: timelineGapOverrides,
  inactiveGapDisplayDays: timelineInactiveGapDisplayDays,
  points: mapPoints,
  timingMode: "compressed"
});

const semanticFrontLines = withUnitBadgeLabels(frontLines, {
  communist: "华",
  nationalist: "國"
});

const pursuitFollowRouteIds = new Set([
  "huang-xinan-west-withdrawal",
  "pla-east-pursuit-main",
  "pla-north-pursuit",
  "pla-south-pursuit"
]);

const pointById = new Map(mapPoints.map((point) => [point.id, point]));

const narrationCues: NarrationCue[] = [
  {
    id: "pursuit",
    start: "1948-11-06T18:00",
    end: "1948-11-10T20:00",
    title: "第一幕 / 追上黄兵团",
    text: "黄百韬第七兵团撤离新安镇向徐州收缩，华野多路急行追击，在碾庄圩一带把退路封住。"
  },
  {
    id: "hold-relief",
    start: "1948-11-11T12:00",
    end: "1948-11-14T20:00",
    title: "第二幕 / 固守与阻援",
    text: "黄兵团约10万人在碾庄圩村落水网中固守待援，核心圈按师级守点展开，华野纵队形成外层包围；邱清泉、李弥从徐州东援，被徐东阻援集团钉在大许家一线。"
  },
  {
    id: "trench",
    start: "1948-11-15T02:00",
    end: "1948-11-19T10:00",
    title: "第三幕 / 对壕近迫",
    text: "华野由运动战转入攻坚战，利用夜间挖壕隐藏接近，沿村落、水沟和水塘间隙逐点靠近防御圈。"
  },
  {
    id: "assault",
    start: "1948-11-19T10:00",
    end: "1948-11-20T05:30",
    title: "第四幕 / 夜攻破墙",
    text: "19日10时下达总攻令，白天炮火准备；21时15分后步兵夜攻展开，22时30分突破第一道围墙，20日凌晨突破第二道围墙并突入内圩。"
  },
  {
    id: "inner-pocket",
    start: "1948-11-20T05:30",
    end: "1948-11-22T16:00",
    title: "第五幕 / 残点清剿",
    text: "内圩核心失守后，黄兵团残部退向东侧村落残点；华野分北、东、南、西逐村压缩，徐州东援仍被阻在大许家一线。"
  },
  {
    id: "ending",
    start: "1948-11-22T16:00",
    end: "1948-11-22T20:00",
    title: "终幕 / 倪庄终局",
    text: "黄百韬残部从东侧村落残点向倪庄逃散，追击部队压上，淮海战役第一阶段取得决定性胜利。"
  }
];

function projectInteractionPoint(point: [number, number]) {
  const x = ((point[0] - nianzhuangInteractionBounds.west) / (nianzhuangInteractionBounds.east - nianzhuangInteractionBounds.west)) * mapWidth;
  const y = ((nianzhuangInteractionBounds.north - point[1]) / (nianzhuangInteractionBounds.north - nianzhuangInteractionBounds.south)) * mapHeight;
  return [Math.max(0, Math.min(mapWidth, x)), Math.max(0, Math.min(mapHeight, y))] as [number, number];
}

function mapViewForStage(stage: NianzhuangCameraStage): MapView {
  const [focusX, focusY] = projectInteractionPoint(stage.center);
  const scale = stage.scale;
  return {
    scale,
    x: nianzhuangViewportCenterX - focusX * scale,
    y: nianzhuangViewportCenterY - focusY * scale
  };
}

function interpolatePoint(from: [number, number], to: [number, number], ratio: number) {
  return [from[0] + (to[0] - from[0]) * ratio, from[1] + (to[1] - from[1]) * ratio] as [number, number];
}

function interpolateCameraStage(fromStage: NianzhuangCameraStage, toStage: NianzhuangCameraStage, ratio: number): NianzhuangCameraStage {
  const maxFocusPointCount = Math.max(fromStage.focusRoutePoints.length, toStage.focusRoutePoints.length);
  return {
    center: interpolatePoint(fromStage.center, toStage.center, ratio),
    focusRoutePoints: Array.from({ length: maxFocusPointCount }, (_, index) => {
      const fromPoint = fromStage.focusRoutePoints[index] ?? fromStage.focusRoutePoints.at(-1) ?? fromStage.center;
      const toPoint = toStage.focusRoutePoints[index] ?? toStage.focusRoutePoints.at(-1) ?? toStage.center;
      return interpolatePoint(fromPoint, toPoint, ratio);
    }),
    scale: fromStage.scale + (toStage.scale - fromStage.scale) * ratio,
    terrainZoom: fromStage.terrainZoom + (toStage.terrainZoom - fromStage.terrainZoom) * ratio
  };
}

function focusAtProgress(progress: number) {
  return focusTransitionState(progress).focus;
}

function smoothStep(value: number) {
  const clamped = Math.min(1, Math.max(0, value));
  return clamped * clamped * (3 - 2 * clamped);
}

function focusTransitionState(progress: number): NianzhuangFocusState {
  const timelineSteps = focusSteps.map((step) => ({ ...step, fromProgress: timeline.dateToProgress(step.date) }));
  let activeIndex = 0;
  timelineSteps.forEach((step, index) => {
    if (progress >= step.fromProgress) {
      activeIndex = index;
    }
  });
  const activeStep = timelineSteps[activeIndex] ?? timelineSteps[0];
  const previousStep = timelineSteps[activeIndex - 1] ?? activeStep;
  const nextStep = timelineSteps[activeIndex + 1];
  const availableProgressBeforeNextStep = nextStep ? Math.max(0, nextStep.fromProgress - activeStep.fromProgress) : nianzhuangFocusTransitionProgress;
  const transitionProgress =
    previousStep.focus !== activeStep.focus
      ? Math.max(0.001, Math.min(nianzhuangFocusTransitionProgress, availableProgressBeforeNextStep || nianzhuangFocusTransitionProgress))
      : 0;
  const rawRatio = transitionProgress > 0 ? (progress - activeStep.fromProgress) / transitionProgress : 1;
  const isTransitioning = previousStep.focus !== activeStep.focus && rawRatio < 1;

  return {
    focus: activeStep.focus,
    fromFocus: isTransitioning ? previousStep.focus : activeStep.focus,
    isTransitioning,
    ratio: smoothStep(rawRatio),
    rawRatio: Math.min(1, Math.max(0, rawRatio)),
    transitionProgress
  };
}

function routePointAtCurrentTime(routeId: string, progress: number) {
  const line = semanticFrontLines.find((frontLine) => frontLine.id === routeId);
  if (!line) {
    return undefined;
  }
  const startPoint = pointById.get(line.from)?.coordinates;
  const endPoint = pointById.get(line.to)?.coordinates;
  if (!startPoint || !endPoint) {
    return undefined;
  }
  const routePoints = [startPoint, ...(line.waypoints ?? []), endPoint] as Array<[number, number]>;
  const routeProgress = lineProgressForRoute(line, progress, timeline.dateToProgress);
  return linePointsUntil(routePoints, routeProgress).at(-1);
}

function averageFocusPoint(points: Array<[number, number]>) {
  return [
    points.reduce((sum, point) => sum + point[0], 0) / points.length,
    points.reduce((sum, point) => sum + point[1], 0) / points.length
  ] as [number, number];
}

function visibleBattleEffects(progress: number): NianzhuangEffectState[] {
  return battleEffects
    .map((effect) => {
      const start = timeline.dateToProgress(effect.start);
      const end = timeline.dateToProgress(effect.end);
      if (progress < start || progress > end) {
        return null;
      }
      const effectProgress = end > start ? (progress - start) / (end - start) : 1;
      if (effect.type === "salvo") {
        return {
          ...effect,
          from: effect.fromRouteId ? routePointAtCurrentTime(effect.fromRouteId, progress) ?? effect.from : effect.from,
          progress: Math.min(1, Math.max(0, effectProgress)),
          to: effect.toRouteId ? routePointAtCurrentTime(effect.toRouteId, progress) ?? effect.to : effect.to
        };
      }
      return {
        ...effect,
        progress: Math.min(1, Math.max(0, effectProgress))
      };
    })
    .filter((effect): effect is NianzhuangEffectState => Boolean(effect));
}

function battleCueForEvent(eventId: string): BattleCueKind {
  const configuredKind = (cueEventKinds as Partial<Record<string, BattleCueKind>>)[eventId];
  return configuredKind ?? "combined";
}

export function NianzhuangBattleAnimation() {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScoreEnabled, setIsScoreEnabled] = useState(true);
  const [isScoreRunning, setIsScoreRunning] = useState(false);
  const lastFrameRef = useRef<number | null>(null);
  const scoreRef = useRef<WarScore | null>(null);
  const lastCueEventRef = useRef<string | null>(null);
  const playbackSpeed = 1 / 300;
  const activeEvent = timeline.getActiveEvent(progress);
  const upcomingEvent = timeline.getUpcomingEvent(progress);
  const currentDate = timeline.progressToDate(progress, 1 / 96);
  const currentTimeCounter = Math.max(1, Math.round(timeline.displayDaysAtProgress(progress)) + 1);
  const focusState = useMemo(() => focusTransitionState(progress), [progress]);
  const currentFocus = focusState.focus;
  const activeStage = useMemo(() => {
    const targetStage = nianzhuangCameraStages[currentFocus];
    if (!focusState.isTransitioning) {
      return targetStage;
    }
    return interpolateCameraStage(nianzhuangCameraStages[focusState.fromFocus], targetStage, focusState.ratio);
  }, [currentFocus, focusState.fromFocus, focusState.isTransitioning, focusState.ratio]);
  const activeMapView = useMemo(() => mapViewForStage(activeStage), [activeStage]);
  const activeRouteIds = useMemo(() => new Set(activeEvent.mapFocus), [activeEvent.mapFocus]);
  const routeStates = useMemo<NianzhuangRouteState[]>(
    () =>
      semanticFrontLines.map((line) =>
        buildNianzhuangRouteState({
          dateToProgress: timeline.dateToProgress,
          line,
          pointById,
          progress
        })
      ),
    [progress]
  );
  const activeGeographicFocusRoutePoints = useMemo(() => {
    const stagePoints = [activeStage.center, ...activeStage.focusRoutePoints];
    if (currentFocus !== "nianzhuangPursuit") {
      return stagePoints;
    }

    const movingPursuitPoints = routeStates
      .filter((state) => pursuitFollowRouteIds.has(state.line.id) && state.isRouteVisible && state.isUnitVisible)
      .map((state) => state.markerPoint);

    if (movingPursuitPoints.length === 0) {
      return stagePoints;
    }

    const movingCenter = averageFocusPoint(movingPursuitPoints);
    const pursuitStart = timeline.dateToProgress("1948-11-06T18:00");
    const pursuitEnd = timeline.dateToProgress("1948-11-10T20:00");
    const pursuitRatio = Math.min(1, Math.max(0, (progress - pursuitStart) / Math.max(0.001, pursuitEnd - pursuitStart)));
    const nianzhuangWeight = smoothStep((pursuitRatio - 0.58) / 0.42) * 0.28;
    const focusPoint: [number, number] = [
      movingCenter[0] * (1 - nianzhuangWeight) + 117.9 * nianzhuangWeight,
      movingCenter[1] * (1 - nianzhuangWeight) + 34.3 * nianzhuangWeight
    ];

    return [focusPoint];
  }, [activeStage.center, activeStage.focusRoutePoints, currentFocus, progress, routeStates]);
  const activeTerrainZoom = useMemo(() => {
    if (currentFocus !== "nianzhuangPursuit") {
      return activeStage.terrainZoom;
    }
    const pursuitStart = timeline.dateToProgress("1948-11-06T18:00");
    const pursuitEnd = timeline.dateToProgress("1948-11-10T20:00");
    const pursuitRatio = Math.min(1, Math.max(0, (progress - pursuitStart) / Math.max(0.001, pursuitEnd - pursuitStart)));
    return activeStage.terrainZoom + smoothStep((pursuitRatio - 0.38) / 0.62) * 0.22;
  }, [activeStage.terrainZoom, currentFocus, progress]);
  const effectStates = useMemo(() => visibleBattleEffects(progress), [progress]);
  const activeNarrationCue = narrationCues.find((cue, index) => {
    const start = timeline.dateToProgress(cue.start);
    const end = timeline.dateToProgress(cue.end);
    return progress >= start && (progress < end || (index === narrationCues.length - 1 && progress <= end));
  });
  const {
    canZoomIn,
    canZoomOut,
    isMapDragging,
    mapInteractionProps,
    mapTransform,
    mapView,
    resetMapView,
    stageRef,
    svgRef,
    zoomIn,
    zoomOut
  } = useMapInteraction(mapWidth, mapHeight, currentFocus, activeMapView, { minScale: nianzhuangMinMapScale });

  useEffect(() => {
    scoreRef.current = new WarScore(musicSource);
    return () => {
      void scoreRef.current?.stop();
      scoreRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      lastFrameRef.current = null;
      return;
    }

    let frameId = 0;
    const tick = (timestamp: number) => {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = timestamp;
      }
      const delta = timestamp - lastFrameRef.current;
      lastFrameRef.current = timestamp;
      setProgress((current) => {
        const next = timeline.clampProgress(current + (delta / 1000) * playbackSpeed);
        if (next >= 1) {
          setIsPlaying(false);
          void scoreRef.current?.pause().then(() => setIsScoreRunning(false));
        }
        return next;
      });
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  useEffect(() => {
    const isCueInWindow = timeline.eventProgress(activeEvent.date, progress) >= 0.5;
    if (!isPlaying || !isScoreEnabled || !isCueInWindow || lastCueEventRef.current === activeEvent.id || !cueEventIds.has(activeEvent.id)) {
      return;
    }

    lastCueEventRef.current = activeEvent.id;
    void scoreRef.current?.playBattleCue(battleCueForEvent(activeEvent.id));
  }, [activeEvent.date, activeEvent.id, isPlaying, isScoreEnabled, progress]);

  const startScore = async () => {
    if (!isScoreEnabled) {
      return;
    }
    await scoreRef.current?.start();
    setIsScoreRunning(true);
  };

  const pauseScore = async () => {
    await scoreRef.current?.pause();
    setIsScoreRunning(false);
  };

  const togglePlayback = async () => {
    const nextPlaying = !isPlaying;
    setIsPlaying(nextPlaying);
    if (nextPlaying) {
      await startScore();
    } else {
      await pauseScore();
    }
  };

  const toggleScore = async () => {
    const nextEnabled = !isScoreEnabled;
    setIsScoreEnabled(nextEnabled);
    if (nextEnabled) {
      await scoreRef.current?.start();
      setIsScoreRunning(true);
    } else {
      await pauseScore();
    }
  };

  const playEventCue = (eventId: string) => {
    scoreRef.current?.cancelPendingBattleCues();
    if (!isScoreEnabled || !cueEventIds.has(eventId)) {
      return;
    }
    lastCueEventRef.current = eventId;
    void scoreRef.current?.playBattleCue(battleCueForEvent(eventId));
  };

  const jumpToEvent = (event: (typeof battleEvents)[number]) => {
    setProgress(timeline.dateToProgress(event.date));
    stageRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
    playEventCue(event.id);
  };

  return (
    <main className="app-shell cinematic-mode nianzhuang-battle modern-war chinese-civil-war" data-testid="nianzhuang-app">
      <section className="control-deck" data-testid="control-deck">
        <div className="transport">
          <button type="button" data-testid="play-pause" onClick={() => void togglePlayback()} aria-label={isPlaying ? "暂停动画" : "播放动画"}>
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            {isPlaying ? "暂停" : "播放"}
          </button>
          <button
            type="button"
            data-testid="replay"
            onClick={() => {
              setIsPlaying(false);
              void pauseScore();
              lastCueEventRef.current = null;
              setProgress(0);
            }}
          >
            <RotateCcw size={18} />
            回放
          </button>
          <button type="button" data-testid="score-toggle" data-music-source={musicSource} onClick={() => void toggleScore()} aria-label={isScoreEnabled ? "关闭循环战争配乐" : "开启循环战争配乐"}>
            {isScoreEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            配乐{isScoreEnabled ? (isScoreRunning ? "循环中" : "待播放") : "关闭"}
          </button>
          <span className="clock" data-testid="current-date">
            {formatChineseDate(currentDate)}
          </span>
        </div>

        <div className="timeline-stack">
          <label className="timeline-range" htmlFor="nianzhuang-timeline">
            <span>时间轴拖拽</span>
            <input
              id="nianzhuang-timeline"
              data-testid="timeline"
              type="range"
              min="0"
              max="1000"
              value={Math.round(progress * 1000)}
              onChange={(event) => {
                scoreRef.current?.cancelPendingAirCues();
                setProgress(Number(event.target.value) / 1000);
              }}
            />
          </label>

          <div className="event-rail" data-testid="event-rail">
            {battleEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                className={event.id === activeEvent.id ? "active" : ""}
                data-event-id={event.id}
                style={{ left: `${timeline.dateToProgress(event.date) * 100}%` }}
                onClick={() => jumpToEvent(event)}
                aria-label={`跳到${event.title}`}
                title={`${event.date} ${event.title}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="cinema-grid">
        <article ref={stageRef} className="map-stage" data-testid="map-stage">
          <div className="map-topbar map-overlay">
            <div className="map-title-card" data-testid="map-title-card">
              <p className="map-eyebrow">战争动画藏书馆 / 解放战争</p>
              <h1>淮海战役：碾庄圩围歼战</h1>
            </div>
            <span className="day-counter">第 {currentTimeCounter} 天</span>
          </div>

          <NianzhuangTerrain3D
            activeEvent={activeEvent}
            activeRouteIds={activeRouteIds}
            currentDateProgress={timeline.dateToProgress}
            currentFocus={currentFocus}
            dateToProgress={timeline.dateToProgress}
            focusRoutePoints={activeGeographicFocusRoutePoints}
            mapBaseView={activeMapView}
            mapView={mapView}
            progress={progress}
            routeStates={routeStates}
            terrainZoom={activeTerrainZoom}
            visibleEffects={effectStates}
          />

          <svg
            ref={svgRef}
            className={`battle-map nianzhuang-map is-interactive-map ${isMapDragging ? "is-dragging" : ""}`}
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="淮海战役碾庄圩围歼战三维战术地图"
            {...mapInteractionProps}
          >
            <g
              className="camera-layer nianzhuang-camera-layer"
              data-focus-from={focusState.fromFocus}
              data-focus-transition-active={focusState.isTransitioning}
              data-focus-transition-progress={focusState.transitionProgress.toFixed(3)}
              data-focus-transition-raw-ratio={focusState.rawRatio.toFixed(3)}
              data-focus-transition-ratio={focusState.ratio.toFixed(3)}
              data-map-focus={currentFocus}
              data-projection="maplibre-control-only"
              data-scene-content-transition-progress="0.012"
              data-testid="camera-layer"
              transform={mapTransform}
            />
          </svg>

          <div className="map-zoom-controls" data-testid="map-zoom-controls" aria-label="地图缩放控制">
            <button type="button" data-testid="map-zoom-in" onClick={zoomIn} disabled={!canZoomIn} aria-label="放大地图">
              +
            </button>
            <button type="button" data-testid="map-zoom-out" onClick={zoomOut} disabled={!canZoomOut} aria-label="缩小地图">
              -
            </button>
            <button type="button" data-testid="map-reset" onClick={resetMapView} aria-label="复位地图">
              复位
            </button>
          </div>

          <div className="cinematic-vignette" aria-hidden="true" />
          {activeNarrationCue && (
            <div className="narration-subtitle" data-testid="narration-subtitle" aria-live="polite">
              <span>{activeNarrationCue.title ?? activeEvent.phase}</span>
              <div className="narration-ticker">
                <p>{activeNarrationCue.text}</p>
              </div>
            </div>
          )}

          <div className="map-legend" aria-label="图例">
            <span className="legend-germany">华野</span>
            <span className="legend-allies">国军</span>
            <span className="legend-evacuation">行动线</span>
            <span className="legend-event">事件</span>
          </div>

          <div className="outcome-panel" data-testid="outcome-panel">
            <span>
              <strong>17天</strong>
              战斗持续
            </span>
            <span>
              <strong>黄百韬第七兵团约10万人</strong>
              核心目标
            </span>
            <span>
              <strong>徐东阻援</strong>
              关键支线
            </span>
            <span>
              <strong>华野纵队 / 黄兵团师</strong>
              战术单位
            </span>
          </div>

          <div className="tactical-reference-panel" data-testid="tactical-reference-panel" aria-label="战术地图参考">
            <span className="north-arrow">N</span>
            <span className="scale-ruler">约10公里</span>
            <span>战术示意 / 坐标近似</span>
          </div>
        </article>

        <aside className="story-panel">
          <div className="now-card story-card" data-testid="active-event-card">
            <span className="phase-pill">{activeEvent.phase}</span>
            <p className="date-line">{formatChineseDate(currentDate)}</p>
            <h2>{activeEvent.title}</h2>
            <p>{activeEvent.summary}</p>
          </div>

          <div className="story-card detail-card">
            <p className="label">当前章节</p>
            <h2>{activeEvent.title}</h2>
            <p>{activeEvent.detail}</p>
            {activeNarrationCue && (
              <div className="narration-card" data-testid="narration-card">
                <span>旁白字幕轨</span>
                <p>{activeNarrationCue.text}</p>
              </div>
            )}
            <div className="impact-box">
              <span>意义</span>
              <p>{activeEvent.significance}</p>
            </div>
          </div>

          <div className="story-card next-card">
            <p className="label">下一个节点</p>
            <h3>{upcomingEvent.title}</h3>
            <p>
              {formatChineseDate(upcomingEvent.date)} / {upcomingEvent.location}
            </p>
          </div>
        </aside>
      </section>

      <section className="timeline-list">
        <div className="section-heading">
          <p className="label">完整过程</p>
          <h2>1948年11月6日至22日 碾庄圩围歼战</h2>
        </div>
        <div className="event-list" data-testid="event-list">
          {battleEvents.map((event) => (
            <button key={event.id} type="button" className={event.id === activeEvent.id ? "active" : ""} onClick={() => jumpToEvent(event)}>
              <span>{formatChineseDate(event.date)}</span>
              <strong>{event.title}</strong>
              <small>{event.summary}</small>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
