import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  battleEvents,
  campaignEnd,
  campaignStart,
  cueEventIds,
  narrationCues,
  routes,
  type GaixiaEvent,
  type GaixiaRoute
} from "../data/gaixiaAmbush";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { publicPath } from "../lib/publicPath";
import { formatChineseDate } from "../lib/timeline";
import { useMapInteraction, type MapView } from "../lib/useMapInteraction";
import { WarScore } from "../lib/warScore";
import { GaixiaTerrain3D, type GaixiaTerrainEffectPlacement, type GaixiaTerrainRouteState } from "./GaixiaTerrain3D";

const mapWidth = 1180;
const mapHeight = 2816;
const gaixiaMapScale = 0.94;
const gaixiaMinMapScale = 0.82;
const gaixiaViewportCenterY = mapHeight / 2;
const gaixiaViewportCenterX = mapWidth / 2;
const gaixiaInteractionBounds = {
  east: 117.88,
  north: 33.64,
  south: 32.94,
  west: 117.05
};
const musicSource = publicPath("/audio/shi-mian-mai-fu-pipa.mp3");

const eventMapScale: Partial<Record<string, number>> = {
  "chu-arrives-gaixia": 0.94,
  "chu-forms-camp-array": 0.98,
  "hanxin-deploys": 0.93,
  "west-counterpush-yield": 0.96,
  "han-counterpress-east-gap": 0.99,
  "ten-sided-ring": 0.82,
  "songs-of-chu": 0.98,
  farewell: 1.0,
  "dawn-assault": 0.94,
  "xiangyu-breakout": 0.98,
  "dongcheng-last-stand": 1.0,
  "wujiang-end": 1.02
};

const eventFocusY: Partial<Record<string, number>> = {
  "chu-arrives-gaixia": 1130,
  "chu-forms-camp-array": 1260,
  "hanxin-deploys": 970,
  "west-counterpush-yield": 1220,
  "han-counterpress-east-gap": 1280,
  "ten-sided-ring": 1360,
  "songs-of-chu": 1260,
  farewell: 1300,
  "dawn-assault": 1500,
  "xiangyu-breakout": 1840,
  "dongcheng-last-stand": 1975,
  "wujiang-end": 2080
};

const eventPoints = battleEvents.map((event) => ({
  id: event.id,
  label: event.title,
  coordinates: event.coordinates,
  kind: "front" as const
}));
const timelineEvents = battleEvents.map((event) => ({
  ...event,
  mapFocus: event.routeIds
}));

const timeline = createCampaignTimeline({
  campaignStart,
  campaignEnd,
  events: timelineEvents,
  points: eventPoints,
  timingMode: "calendar"
});

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function lineProgress(start: string, end: string, progress: number) {
  const startProgress = timeline.dateToProgress(start);
  const endProgress = timeline.dateToProgress(end);
  return clamp((progress - startProgress) / Math.max(0.0001, endProgress - startProgress));
}

function projectInteractionPoint(point: [number, number]) {
  const x = ((point[0] - gaixiaInteractionBounds.west) / (gaixiaInteractionBounds.east - gaixiaInteractionBounds.west)) * mapWidth;
  const y = ((gaixiaInteractionBounds.north - point[1]) / (gaixiaInteractionBounds.north - gaixiaInteractionBounds.south)) * mapHeight;
  return [
    Math.max(0, Math.min(mapWidth, x)),
    Math.max(0, Math.min(mapHeight, y))
  ] as [number, number];
}

function routeLength(points: Array<[number, number]>) {
  return points
    .slice(0, -1)
    .reduce((sum, point, index) => sum + Math.hypot(points[index + 1][0] - point[0], points[index + 1][1] - point[1]), 0);
}

function interpolateRoute(points: Array<[number, number]>, progress: number) {
  if (points.length < 2) {
    return points[0] ?? [0, 0];
  }

  const segmentLengths = points.slice(0, -1).map((point, index) => Math.hypot(points[index + 1][0] - point[0], points[index + 1][1] - point[1]));
  const totalLength = Math.max(0.001, segmentLengths.reduce((sum, length) => sum + length, 0));
  let remaining = totalLength * clamp(progress);

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const length = segmentLengths[index];
    if (remaining <= length || index === segmentLengths.length - 1) {
      const ratio = length === 0 ? 0 : remaining / length;
      return [
        points[index][0] + (points[index + 1][0] - points[index][0]) * ratio,
        points[index][1] + (points[index + 1][1] - points[index][1]) * ratio
      ] as [number, number];
    }
    remaining -= length;
  }

  return points.at(-1)!;
}

function linePointsUntil(points: Array<[number, number]>, progress: number) {
  if (points.length < 2) {
    return points;
  }

  const current = interpolateRoute(points, progress);
  const segmentLengths = points.slice(0, -1).map((point, index) => Math.hypot(points[index + 1][0] - point[0], points[index + 1][1] - point[1]));
  const totalLength = routeLength(points);
  let remaining = totalLength * clamp(progress);
  const visible = [points[0]];

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const length = segmentLengths[index];
    if (remaining >= length) {
      visible.push(points[index + 1]);
      remaining -= length;
    } else {
      visible.push(current);
      break;
    }
  }

  return visible;
}

function routeFacing(points: Array<[number, number]>, progress: number) {
  const previous = interpolateRoute(points, Math.max(0, progress - 0.025));
  const next = interpolateRoute(points, Math.min(1, progress + 0.025));
  return next[0] - previous[0] < -0.01 ? -1 : 1;
}

function mapViewForEvent(event: GaixiaEvent, activePoint: [number, number]): MapView {
  const focusY = eventFocusY[event.id] ?? activePoint[1];
  const focusX = activePoint[0];
  const scale = eventMapScale[event.id] ?? gaixiaMapScale;
  return {
    scale,
    x: gaixiaViewportCenterX - focusX * scale,
    y: gaixiaViewportCenterY - focusY * scale
  };
}

function routeUnitOffsets(route: GaixiaRoute) {
  const addDepth = (offsets: Array<[number, number]>, additions: Array<[number, number]>) => {
    const occupied = new Set(offsets.map((offset) => `${offset[0]},${offset[1]}`));
    return [...offsets, ...additions.filter((offset) => !occupied.has(`${offset[0]},${offset[1]}`))];
  };

  if (route.unitOffsets) {
    if (route.unitKind.includes("cavalry")) {
      return addDepth(route.unitOffsets, [
        [-58, 30],
        [34, -24]
      ]);
    }

    if (route.unitKind.includes("crossbow")) {
      return addDepth(route.unitOffsets, [
        [-34, 26],
        [38, -28]
      ]);
    }

    return addDepth(route.unitOffsets, [
      [-38, 28],
      [36, -24]
    ]);
  }

  if (route.unitKind.includes("cavalry")) {
    return [
      [0, 0],
      [-30, 14],
      [-58, 30]
    ];
  }

  if (route.unitKind.includes("crossbow")) {
    return [
      [0, 0],
      [22, -12],
      [-34, 26]
    ];
  }

  return [
    [0, 0],
    [-38, 28]
  ];
}

function routeShouldRender(route: GaixiaRoute, progress: number, activeRouteIds: Set<string>) {
  const routeStartProgress = timeline.dateToProgress(route.start);
  const routeEndProgress = timeline.dateToProgress(route.end);
  const isLinkedToActiveEvent = activeRouteIds.has(route.id);
  const isActive = progress >= routeStartProgress && progress < routeEndProgress;
  const routeVisibleEnd = route.visibleUntil ? timeline.dateToProgress(route.visibleUntil) : 1;
  const isWithinRetainedWindow = progress >= routeStartProgress && progress <= routeVisibleEnd;
  return isLinkedToActiveEvent || isActive || isWithinRetainedWindow;
}

function routeUnitShouldRender(route: GaixiaRoute, progress: number) {
  const routeStartProgress = timeline.dateToProgress(route.start);
  const unitVisibleEnd = route.unitVisibleUntil ? timeline.dateToProgress(route.unitVisibleUntil) : route.visibleUntil ? timeline.dateToProgress(route.visibleUntil) : 1;
  return progress >= routeStartProgress && progress <= unitVisibleEnd && route.routeKind !== "song";
}

type ProjectedGaixiaRoute = {
  active: boolean;
  facingX: 1 | -1;
  isComplete: boolean;
  isVisible: boolean;
  labelPoint: [number, number];
  markerPoint: [number, number];
  projected: Array<[number, number]>;
  route: GaixiaRoute;
  routeProgress: number;
  showUnits: boolean;
  visiblePoints: Array<[number, number]>;
};

type ActiveEffectPlacement = {
  chuPoint?: [number, number];
  chuRouteId?: string;
  hanPoint?: [number, number];
  hanRouteId?: string;
  point: [number, number];
  source: "event" | "route-contact" | "route-unit";
};

function distance(a: [number, number], b: [number, number]) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function midpoint(a: [number, number], b: [number, number]) {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as [number, number];
}

function routeStatePriority(state: GaixiaTerrainRouteState) {
  if (state.active) {
    return 0;
  }
  if (state.showUnits) {
    return 1;
  }
  return 2;
}

function activeEffectPlacementForEvent(event: GaixiaEvent, projectedRoutes: GaixiaTerrainRouteState[], fallbackPoint: [number, number]): GaixiaTerrainEffectPlacement {
  if (event.cue === "song") {
    const songRoute = projectedRoutes.find((state) => event.routeIds.includes(state.route.id) && state.route.routeKind === "song" && state.isVisible);
    return {
      point: songRoute?.markerPoint ?? fallbackPoint,
      source: songRoute ? "route-unit" : "event"
    };
  }

  const candidates = projectedRoutes
    .filter((state) => event.routeIds.includes(state.route.id) && state.isVisible && state.showUnits && state.route.routeKind !== "song")
    .sort((a, b) => routeStatePriority(a) - routeStatePriority(b));
  const hanRoutes = candidates.filter((state) => state.route.faction === "han");
  const chuRoutes = candidates.filter((state) => state.route.faction === "chu");

  if (hanRoutes.length > 0 && chuRoutes.length > 0) {
    const bestPair = hanRoutes
      .flatMap((hanRoute) =>
        chuRoutes.map((chuRoute) => ({
          chuRoute,
          distance: distance(hanRoute.markerPoint, chuRoute.markerPoint),
          hanRoute
        }))
      )
      .sort((a, b) => a.distance - b.distance)[0];

    return {
      chuPoint: bestPair.chuRoute.markerPoint,
      chuRouteId: bestPair.chuRoute.route.id,
      hanPoint: bestPair.hanRoute.markerPoint,
      hanRouteId: bestPair.hanRoute.route.id,
      point: midpoint(bestPair.hanRoute.markerPoint, bestPair.chuRoute.markerPoint),
      source: "route-contact"
    };
  }

  const singleRoute = candidates[0];
  return {
    point: singleRoute?.markerPoint ?? fallbackPoint,
    source: singleRoute ? "route-unit" : "event"
  };
}

export function GaixiaAmbushAnimation() {
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
  const activeRouteIds = useMemo(() => new Set(activeEvent.routeIds), [activeEvent.routeIds]);
  const currentDate = timeline.progressToDate(progress, 1 / (24 * 60));
  const elapsedHours = Math.max(1, Math.round(timeline.displayDaysAtProgress(progress) * 24) + 1);
  const activePoint = projectInteractionPoint(activeEvent.coordinates);
  const activeMapView = useMemo(() => mapViewForEvent(activeEvent, activePoint), [activeEvent.id, activePoint[0], activePoint[1]]);
  const geographicRoutes = useMemo<GaixiaTerrainRouteState[]>(
    () =>
      routes.map((route) => {
        const routeProgress = lineProgress(route.start, route.end, progress);
        const routeEndProgress = timeline.dateToProgress(route.end);
        const isComplete = progress >= routeEndProgress;
        const isVisible = routeShouldRender(route, progress, activeRouteIds);
        const visiblePoints = linePointsUntil(route.points, isComplete ? 1 : routeProgress);
        const markerPoint = interpolateRoute(route.points, routeProgress);
        const facingX = routeFacing(route.points, routeProgress);
        const active = routeProgress > 0 && routeProgress < 1;
        const labelPoint = visiblePoints.at(-1) ?? markerPoint;
        const showUnits = routeUnitShouldRender(route, progress);

        return {
          active,
          facingX,
          isComplete,
          isVisible,
          labelPoint,
          markerPoint,
          projected: route.points,
          route,
          routeProgress,
          showUnits,
          visiblePoints
        };
      }),
    [activeRouteIds, progress]
  );
  const activeGeographicEffectPlacement = useMemo(
    () => activeEffectPlacementForEvent(activeEvent, geographicRoutes, activeEvent.coordinates),
    [activeEvent, geographicRoutes]
  );
  const activeGeographicFocus = activeEvent.coordinates;
  const activeGeographicFocusRoutePoints = useMemo(
    () => [activeEvent.coordinates, ...routes.filter((route) => activeEvent.routeIds.includes(route.id)).flatMap((route) => route.points)],
    [activeEvent]
  );
  const {
    canZoomIn,
    canZoomOut,
    isMapDragging,
    mapInteractionProps,
    mapTransform,
    resetMapView,
    stageRef,
    svgRef,
    zoomIn,
    zoomOut
  } = useMapInteraction(mapWidth, mapHeight, activeEvent.id, activeMapView, { minScale: gaixiaMinMapScale });
  const activeNarrationCue = narrationCues.find((cue, index) => {
    const start = timeline.dateToProgress(cue.start);
    const end = timeline.dateToProgress(cue.end);
    return progress >= start && (progress < end || (index === narrationCues.length - 1 && progress <= end));
  });

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
    if (!isPlaying || !isScoreEnabled || lastCueEventRef.current === activeEvent.id || !cueEventIds.has(activeEvent.id)) {
      return;
    }

    lastCueEventRef.current = activeEvent.id;
    void scoreRef.current?.playBattleCue("melee");
  }, [activeEvent.id, isPlaying, isScoreEnabled]);

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

  const jumpToEvent = (event: GaixiaEvent) => {
    setProgress(timeline.dateToProgress(event.date));
    window.scrollTo({ left: 0, top: 0, behavior: "auto" });
    if (isScoreEnabled && event.cue === "melee") {
      lastCueEventRef.current = event.id;
      void scoreRef.current?.playBattleCue("melee");
    }
  };

  return (
    <main className="app-shell cinematic-mode gaixia-ambush ancient-war" data-testid="gaixia-app">
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
          <button type="button" data-testid="score-toggle" data-music-source={musicSource} onClick={() => void toggleScore()}>
            {isScoreEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            配乐{isScoreEnabled ? (isScoreRunning ? "循环中" : "待播放") : "关闭"}
          </button>
          <span className="clock" data-testid="current-date">
            {formatChineseDate(currentDate)}
          </span>
        </div>
        <div className="timeline-stack">
          <label className="timeline-range" htmlFor="gaixia-timeline">
            <span>时间轴拖拽</span>
            <input
              id="gaixia-timeline"
              data-testid="timeline"
              type="range"
              min="0"
              max="1000"
              value={Math.round(progress * 1000)}
              onChange={(event) => {
                setProgress(Number(event.target.value) / 1000);
                lastCueEventRef.current = null;
              }}
            />
          </label>
          <div className="event-rail" data-testid="event-rail">
            {battleEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                className={event.id === activeEvent.id ? "active" : ""}
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
            <div data-testid="map-title-card">
              <h1>韩信十面埋伏：垓下之战</h1>
            </div>
            <span className="day-counter">第 {elapsedHours} 小时</span>
          </div>

          <GaixiaTerrain3D
            activeEffectPlacement={activeGeographicEffectPlacement}
            activeEvent={activeEvent}
            activeRouteIds={activeRouteIds}
            focusCoordinates={activeGeographicFocus}
            focusRoutePoints={activeGeographicFocusRoutePoints}
            width={mapWidth}
            height={mapHeight}
            mapTransform={mapTransform}
            progress={progress}
            projectedRoutes={geographicRoutes}
          />

          <svg
            ref={svgRef}
            className={`battle-map gaixia-map is-interactive-map ${isMapDragging ? "is-dragging" : ""}`}
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            preserveAspectRatio="xMidYMid slice"
            role="img"
            aria-label="韩信十面埋伏垓下之战地形态势图"
            {...mapInteractionProps}
          >
            <g className="camera-layer gaixia-camera-layer" data-testid="camera-layer" data-projection="maplibre-control-only" transform={mapTransform} />
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
              <span>{activeNarrationCue.title}</span>
              <div className="narration-ticker">
                <p>{activeNarrationCue.text}</p>
              </div>
            </div>
          )}
          <div className="map-legend gaixia-legend" aria-label="图例">
            <span className="legend-han">汉军步骑弩合围</span>
            <span className="legend-chu">楚军营垒与突围</span>
            <span className="legend-terrain">河汊高地地形</span>
            <span className="legend-song">四面楚歌心理战</span>
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
          <h2>一夜之间形成的空间合围与心理战</h2>
        </div>
        <div className="event-list" data-testid="event-list">
          {battleEvents.map((event) => (
            <button key={event.id} type="button" className={event.id === activeEvent.id ? "active" : ""} onClick={() => jumpToEvent(event)}>
              <span>{formatChineseDate(event.date)}</span>
              <strong>{event.title}</strong>
              <small>{event.summary}</small>
              {event.routeIds.length > 0 && <em>{event.routeIds.join(" / ")}</em>}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
