import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ambushSectors,
  battleEvents,
  campFortifications,
  campaignEnd,
  campaignStart,
  cueEventIds,
  historicalRegions,
  mapPoints,
  narrationCues,
  rivers,
  routes,
  terrainContours,
  terrainLabels,
  type GaixiaEvent,
  type GaixiaUnitKind
} from "../data/gaixiaAmbush";
import { createCampaignProjection, projectPoint } from "../lib/geoMap";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { publicPath } from "../lib/publicPath";
import { formatChineseDate } from "../lib/timeline";
import { useMapInteraction, type MapView } from "../lib/useMapInteraction";
import { WarScore } from "../lib/warScore";

const mapWidth = 1180;
const projectionHeight = 1408;
const tacticalYScale = 2;
const mapHeight = projectionHeight * tacticalYScale;
const initialMapView: MapView = { scale: 1.58, x: -180, y: -780 };
const musicSource = publicPath("/audio/shi-mian-mai-fu-pipa.mp3");

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

function buildPath(points: Array<[number, number]>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point[0].toFixed(1)} ${point[1].toFixed(1)}`).join(" ");
}

function projectTacticalPoint(projection: ReturnType<typeof createCampaignProjection>, point: [number, number]) {
  const [x, y] = projectPoint(projection, point);
  return [x, y * tacticalYScale] as [number, number];
}

function projectLine(projection: ReturnType<typeof createCampaignProjection>, points: Array<[number, number]>) {
  return points.map((point) => projectTacticalPoint(projection, point));
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

function routeUnitOffsets(route: (typeof routes)[number]) {
  if (route.unitOffsets) {
    return route.unitOffsets;
  }

  if (route.unitKind.includes("cavalry")) {
    return [
      [0, 0],
      [-30, 14]
    ];
  }

  if (route.unitKind.includes("crossbow")) {
    return [
      [0, 0],
      [22, -12]
    ];
  }

  return [[0, 0]];
}

function routeShouldRender(route: (typeof routes)[number], progress: number, activeRouteIds: Set<string>) {
  const routeStartProgress = timeline.dateToProgress(route.start);
  const routeEndProgress = timeline.dateToProgress(route.end);
  const isLinkedToActiveEvent = activeRouteIds.has(route.id);
  const isActive = progress >= routeStartProgress && progress < routeEndProgress;
  const routeVisibleEnd = route.visibleUntil ? timeline.dateToProgress(route.visibleUntil) : 1;
  const isWithinRetainedWindow = progress >= routeStartProgress && progress <= routeVisibleEnd;
  return isLinkedToActiveEvent || isActive || isWithinRetainedWindow;
}

function routeUnitShouldRender(route: (typeof routes)[number], progress: number) {
  const routeStartProgress = timeline.dateToProgress(route.start);
  const unitVisibleEnd = route.unitVisibleUntil ? timeline.dateToProgress(route.unitVisibleUntil) : route.visibleUntil ? timeline.dateToProgress(route.visibleUntil) : 1;
  return progress >= routeStartProgress && progress <= unitVisibleEnd && route.routeKind !== "song";
}

function GaixiaUnitIcon({ facingX, kind }: { facingX: 1 | -1; kind: GaixiaUnitKind }) {
  const faction = kind.startsWith("han") ? "han" : "chu";
  const imageConfig: Record<GaixiaUnitKind, { height: number; href: string; label: string; width: number }> = {
    "chu-cavalry": { height: 50, href: publicPath("/assets/unit-icons/gaixia-chu-cavalry.webp"), label: "楚骑", width: 65 },
    "chu-command": { height: 56, href: publicPath("/assets/unit-icons/gaixia-chu-command.webp"), label: "项", width: 34 },
    "chu-infantry": { height: 56, href: publicPath("/assets/unit-icons/gaixia-chu-infantry.webp"), label: "楚卒", width: 45 },
    "han-cavalry": { height: 50, href: publicPath("/assets/unit-icons/gaixia-han-cavalry.webp"), label: "汉骑", width: 65 },
    "han-crossbow": { height: 58, href: publicPath("/assets/unit-icons/gaixia-han-crossbow.webp"), label: "汉弩", width: 39 },
    "han-infantry": { height: 58, href: publicPath("/assets/unit-icons/gaixia-han-infantry.webp"), label: "汉卒", width: 39 }
  };
  const config = imageConfig[kind];
  const x = -config.width / 2;
  const y = -config.height / 2;

  return (
    <g className={`gaixia-unit gaixia-unit-${faction} gaixia-unit-${kind}`} data-testid={`gaixia-unit-${kind}`} data-facing-x={facingX}>
      <ellipse className="gaixia-unit-shadow" cx="0" cy={config.height * 0.32} rx={config.width * 0.34} ry="7" />
      <g transform={`scale(${facingX} 1)`}>
        <image
          className="gaixia-unit-image"
          data-asset-kind={kind}
          href={config.href}
          preserveAspectRatio="xMidYMid meet"
          x={x}
          y={y}
          width={config.width}
          height={config.height}
        />
      </g>
      <g className="gaixia-unit-badge">
        <circle cx={-config.width * 0.32} cy={-config.height * 0.34} r="12" />
        <text x={-config.width * 0.32} y={-config.height * 0.34 + 4}>
          {config.label}
        </text>
      </g>
    </g>
  );
}

function ActiveEffect({ event, point }: { event: GaixiaEvent; point: [number, number] }) {
  if (event.cue === "song") {
    return (
      <g className="gaixia-song-effect" data-testid="gaixia-song-effect" transform={`translate(${point[0]} ${point[1]})`}>
        <circle r="42" />
        <circle r="76" />
        <path d="M -70 -8 C -38 -36 32 -36 74 -2" />
        <path d="M -80 22 C -38 -8 36 -6 88 24" />
        <text x="0" y="-52">
          楚歌
        </text>
      </g>
    );
  }

  return (
    <g className="gaixia-melee-effect" data-testid="gaixia-melee-effect" transform={`translate(${point[0]} ${point[1]})`}>
      <circle r="28" />
      <circle r="48" />
      <path d="M -24 -24 L 24 24 M 24 -24 L -24 24" />
    </g>
  );
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
  const projection = useMemo(() => createCampaignProjection(mapWidth, projectionHeight, "gaixiaBattle"), []);
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
  } = useMapInteraction(mapWidth, mapHeight, "gaixiaBattle", initialMapView);
  const activeNarrationCue = narrationCues.find((cue, index) => {
    const start = timeline.dateToProgress(cue.start);
    const end = timeline.dateToProgress(cue.end);
    return progress >= start && (progress < end || (index === narrationCues.length - 1 && progress <= end));
  });
  const activePoint = projectTacticalPoint(projection, activeEvent.coordinates);

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

          <svg
            ref={svgRef}
            className={`battle-map gaixia-map is-interactive-map ${isMapDragging ? "is-dragging" : ""}`}
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="韩信十面埋伏垓下之战地形态势图"
            {...mapInteractionProps}
          >
            <defs>
              <filter id="gaixiaTerrainShadow" x="-15%" y="-15%" width="130%" height="130%">
                <feDropShadow dx="-14" dy="18" stdDeviation="9" floodColor="#0b1815" floodOpacity="0.42" />
              </filter>
              <filter id="gaixiaUnitGlow" x="-60%" y="-70%" width="220%" height="230%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ffd36f" floodOpacity="0.44" />
                <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#0b0d0b" floodOpacity="0.5" />
              </filter>
              <marker id="gaixia-arrow-han" markerHeight="8" markerWidth="10" orient="auto" refX="9" refY="4">
                <path d="M0 0L10 4L0 8L2 4Z" fill="#7fd4ff" />
              </marker>
              <marker id="gaixia-arrow-chu" markerHeight="8" markerWidth="10" orient="auto" refX="9" refY="4">
                <path d="M0 0L10 4L0 8L2 4Z" fill="#e54c43" />
              </marker>
            </defs>

            <rect className="gaixia-grid" width={mapWidth} height={mapHeight} />
            <g className="camera-layer gaixia-camera-layer" data-testid="camera-layer" transform={mapTransform}>
              <rect className="gaixia-tactical-ground" data-testid="gaixia-tactical-ground" x="0" y="0" width={mapWidth} height={mapHeight} />
              <g className="gaixia-terrain-base" data-testid="gaixia-terrain-layer">
                <rect x="0" y="0" width={mapWidth} height={mapHeight} />
                <g className="gaixia-contour-layer" data-testid="gaixia-contour-layer">
                  {terrainContours.map((contour) => {
                    const points = projectLine(projection, contour.points);
                    const midpoint = points[Math.floor(points.length / 2)] ?? points[0];
                    return (
                      <g key={contour.id} className={`gaixia-contour gaixia-contour-${contour.kind}`} data-elevation={contour.elevation} data-terrain-kind={contour.kind} data-testid={`gaixia-terrain-${contour.id}`}>
                        <path className="gaixia-contour-buffer" d={buildPath(points)} />
                        <path className="gaixia-contour-line" d={buildPath(points)} />
                        <text x={midpoint[0] + 6} y={midpoint[1] - 6}>
                          {contour.label} {contour.elevation}m
                        </text>
                      </g>
                    );
                  })}
                </g>
                <g className="gaixia-terrain-labels">
                  {terrainLabels.map((label) => {
                    const [x, y] = projectTacticalPoint(projection, label.coordinates);
                    return (
                      <text key={label.id} className={`gaixia-terrain-label gaixia-terrain-label-${label.kind}`} x={x} y={y}>
                        {label.label}
                      </text>
                    );
                  })}
                </g>
              </g>

              <g className="gaixia-regions">
                {historicalRegions.map((region) => {
                  const points = projectLine(projection, region.coordinates);
                  const labelPoint = projectTacticalPoint(projection, region.labelCoordinates);
                  return (
                    <g key={region.id} className={`gaixia-region gaixia-region-${region.kind}`} data-testid={`gaixia-region-${region.id}`}>
                      <path d={`${buildPath(points)} Z`} />
                      <text x={labelPoint[0]} y={labelPoint[1]}>
                        {region.label}
                      </text>
                    </g>
                  );
                })}
              </g>

              <g className="gaixia-rivers" data-testid="gaixia-river-layer">
                {rivers.map((river) => {
                  const points = projectLine(projection, river.points);
                  const labelPoint = points[Math.floor(points.length / 2)] ?? points[0];
                  return (
                    <g key={river.id} className="gaixia-river">
                      <path d={buildPath(points)} />
                      <text x={labelPoint[0] + 10} y={labelPoint[1] - 8}>
                        {river.label}
                      </text>
                    </g>
                  );
                })}
              </g>

              <g className="gaixia-fortifications" data-testid="gaixia-fortification-layer">
                {campFortifications.map((fortification) => {
                  const points = projectLine(projection, fortification.coordinates);
                  const labelPoint = projectTacticalPoint(projection, fortification.labelCoordinates);
                  return (
                    <g key={fortification.id} className={`gaixia-camp-fortification gaixia-camp-fortification-${fortification.id}`}>
                      <path d={`${buildPath(points)} Z`} />
                      <text x={labelPoint[0]} y={labelPoint[1]}>
                        {fortification.label}
                      </text>
                    </g>
                  );
                })}
              </g>

              <g className="gaixia-ambush-sectors" data-testid="gaixia-ambush-sector-layer">
                {ambushSectors.map((sector) => {
                  const points = projectLine(projection, sector.points);
                  const labelPoint = points[Math.floor(points.length / 2)] ?? points[0];
                  return (
                    <g key={sector.id} className={`gaixia-ambush-sector gaixia-ambush-sector-${sector.side}`}>
                      <path d={buildPath(points)} />
                      <text x={labelPoint[0]} y={labelPoint[1] - 10}>
                        {sector.label}
                      </text>
                    </g>
                  );
                })}
              </g>

              <g className="gaixia-routes">
                {routes.map((route) => {
                  const projected = projectLine(projection, route.points);
                  const routeProgress = lineProgress(route.start, route.end, progress);
                  const routeEndProgress = timeline.dateToProgress(route.end);
                  const isComplete = progress >= routeEndProgress;
                  const isVisible = routeShouldRender(route, progress, activeRouteIds);
                  if (!isVisible) {
                    return null;
                  }
                  const visiblePoints = linePointsUntil(projected, isComplete ? 1 : routeProgress);
                  const markerPoint = interpolateRoute(projected, routeProgress);
                  const facingX = routeFacing(projected, routeProgress);
                  const active = routeProgress > 0 && routeProgress < 1;
                  const labelPoint = visiblePoints.at(-1) ?? markerPoint;
                  const labelOffset = route.labelOffset ?? [10, -12];
                  const showUnits = routeUnitShouldRender(route, progress);
                  return (
                    <g
                      key={route.id}
                      className={`gaixia-route gaixia-route-${route.faction} gaixia-route-${route.routeKind} ${active ? "is-active" : isComplete ? "is-complete" : "is-forming"}`}
                      data-route-id={route.id}
                      data-route-kind={route.routeKind}
                      data-route-current={activeRouteIds.has(route.id) ? "true" : "false"}
                      data-testid={`gaixia-route-${route.id}`}
                    >
                      <path className="gaixia-route-shadow" d={buildPath(visiblePoints)} />
                      <path
                        className="gaixia-route-line"
                        d={buildPath(visiblePoints)}
                        markerEnd={active || route.routeKind === "breakout" ? `url(#gaixia-arrow-${route.faction})` : undefined}
                      />
                      <path className="gaixia-route-highlight" d={buildPath(visiblePoints)} />
                      {active && (route.routeKind === "ambush" || route.routeKind === "pursuit") && (
                        <circle className="gaixia-ambush-pulse" cx={markerPoint[0]} cy={markerPoint[1]} r={route.routeKind === "pursuit" ? 14 : 18} />
                      )}
                      {showUnits &&
                        routeUnitOffsets(route).map((offset, index) => (
                          <g
                            key={`${route.id}-unit-${index}`}
                            className="gaixia-unit-holder"
                            data-testid={`gaixia-route-unit-${route.id}-${index}`}
                            transform={`translate(${markerPoint[0] + offset[0]} ${markerPoint[1] + offset[1]})`}
                          >
                            <GaixiaUnitIcon kind={route.unitKind} facingX={facingX} />
                          </g>
                        ))}
                      <text className="gaixia-route-label" x={labelPoint[0] + labelOffset[0]} y={labelPoint[1] + labelOffset[1]}>
                        {route.label}
                      </text>
                    </g>
                  );
                })}
              </g>

              <g className="gaixia-points">
                {mapPoints.map((point) => {
                  const [x, y] = projectTacticalPoint(projection, point.coordinates);
                  return (
                    <g key={point.id} className={`gaixia-point gaixia-point-${point.kind}`} data-testid={`gaixia-point-${point.id}`}>
                      <circle cx={x} cy={y} r={point.kind === "camp" ? 6 : 4} />
                      <text x={x + 9} y={y + 4}>
                        {point.label}
                      </text>
                    </g>
                  );
                })}
              </g>

              <g className="gaixia-event-effects">
                {battleEvents.map((event) => {
                  const eventProgress = timeline.eventProgress(event.date, progress);
                  const passed = timeline.dateToProgress(event.date) <= progress;
                  const isCurrent = event.id === activeEvent.id;
                  const [x, y] = projectTacticalPoint(projection, event.coordinates);
                  return (
                    <g key={event.id} className={`event-pin ${passed ? "passed" : ""} ${isCurrent ? "is-current" : ""}`}>
                      {isCurrent && <ActiveEffect event={event} point={[x, y]} />}
                      <circle cx={x} cy={y} r={isCurrent ? 7 : 4.2} />
                      {isCurrent && (
                        <text x={x + 16} y={y + 5} className="active-event-label">
                          {event.title}
                        </text>
                      )}
                      {!isCurrent && passed && eventProgress < 0.3 && <circle className="gaixia-passed-ring" cx={x} cy={y} r={10} />}
                    </g>
                  );
                })}
              </g>
            </g>
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
