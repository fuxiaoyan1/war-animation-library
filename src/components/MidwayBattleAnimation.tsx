import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  airWaves,
  battleEvents,
  campaignEnd,
  campaignStart,
  carriers,
  cueEventIds,
  narrationCues,
  tacticalPoints,
  type AirWave,
  type Carrier,
  type MidwayEvent
} from "../data/midwayBattle";
import {
  countryPathFactory,
  createCampaignProjection,
  pacificCampaignCountries,
  pacificCountryClassName,
  projectPoint
} from "../lib/geoMap";
import { createCampaignTimeline, toTime } from "../lib/campaignTimeline";
import { formatChineseDate } from "../lib/timeline";
import { publicPath } from "../lib/publicPath";
import { useMapInteraction } from "../lib/useMapInteraction";
import { WarScore, type BattleCueKind } from "../lib/warScore";

const mapWidth = 1180;
const mapHeight = 704;
const musicSource = publicPath("/audio/wikimedia-liberty-bell.ogg");

const eventPoints = battleEvents.map((event) => ({
  id: event.id,
  label: event.title,
  coordinates: event.coordinates,
  kind: "front" as const
}));

const pointRevealDates: Partial<Record<string, string>> = {
  "akagi-hit": "1942-06-04T10:26",
  "kaga-hit": "1942-06-04T10:26",
  "soryu-hit": "1942-06-04T10:26",
  "hiryu-hit": "1942-06-04T17:03",
  "yorktown-sink": "1942-06-07T06:00"
};

const timeline = createCampaignTimeline({
  activeSpans: [
    { start: "1942-06-04T04:30", end: "1942-06-04T17:03" },
    { start: "1942-06-06T13:00", end: "1942-06-07T06:00" }
  ],
  campaignStart,
  campaignEnd,
  events: battleEvents,
  gapOverrides: [
    { start: "1942-06-04T17:03", end: "1942-06-06T13:00", displayDays: 0.08 }
  ],
  points: eventPoints,
  timingMode: "compressed"
});

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function progressForSpan(start: string, end: string, progress: number) {
  const startProgress = timeline.dateToProgress(start);
  const endProgress = timeline.dateToProgress(end);
  return clamp((progress - startProgress) / Math.max(0.0001, endProgress - startProgress));
}

function linePointsUntil(points: Array<[number, number]>, progress: number) {
  if (points.length < 2) {
    return points;
  }

  const segmentLengths = points.slice(0, -1).map((point, index) => Math.hypot(points[index + 1][0] - point[0], points[index + 1][1] - point[1]));
  const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0);
  const visible = [points[0]];
  let remaining = totalLength * clamp(progress);

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const length = segmentLengths[index];
    if (remaining >= length) {
      visible.push(points[index + 1]);
      remaining -= length;
    } else {
      const ratio = length === 0 ? 0 : remaining / length;
      visible.push([
        points[index][0] + (points[index + 1][0] - points[index][0]) * ratio,
        points[index][1] + (points[index + 1][1] - points[index][1]) * ratio
      ]);
      break;
    }
  }

  return visible;
}

function routeLength(points: Array<[number, number]>) {
  return points
    .slice(0, -1)
    .reduce((sum, point, index) => sum + Math.hypot(points[index + 1][0] - point[0], points[index + 1][1] - point[1]), 0);
}

function interpolateLinearPoint(from: [number, number], to: [number, number], progress: number): [number, number] {
  return [from[0] + (to[0] - from[0]) * progress, from[1] + (to[1] - from[1]) * progress];
}

function routeMetrics(points: Array<[number, number]>) {
  const segmentLengths = points.slice(0, -1).map((point, index) => Math.hypot(points[index + 1][0] - point[0], points[index + 1][1] - point[1]));
  const cumulativeLengths = [0];
  for (const length of segmentLengths) {
    cumulativeLengths.push(cumulativeLengths.at(-1)! + length);
  }

  return {
    cumulativeLengths,
    segmentLengths,
    totalLength: cumulativeLengths.at(-1) ?? 0
  };
}

function routePointAtDistance(points: Array<[number, number]>, distance: number) {
  if (points.length < 2) {
    return {
      direction: { x: 1, y: 0 },
      point: points[0] ?? ([0, 0] as [number, number]),
      progress: 0
    };
  }

  const metrics = routeMetrics(points);
  const totalLength = Math.max(metrics.totalLength, 1);
  const boundedDistance = Math.min(totalLength, Math.max(0, distance));
  const foundSegmentIndex = metrics.segmentLengths.findIndex((length, index) => boundedDistance <= metrics.cumulativeLengths[index] + length + 0.001);
  const index =
    foundSegmentIndex === -1
      ? metrics.segmentLengths.length - 1
      : Math.max(0, Math.min(metrics.segmentLengths.length - 1, foundSegmentIndex));
  const segmentLength = Math.max(metrics.segmentLengths[index], 0.001);
  const segmentProgress = clamp((boundedDistance - metrics.cumulativeLengths[index]) / segmentLength);
  const point = interpolateLinearPoint(points[index], points[index + 1], segmentProgress);
  const dx = points[index + 1][0] - points[index][0];
  const dy = points[index + 1][1] - points[index][1];
  const directionLength = Math.hypot(dx, dy);

  return {
    direction: directionLength < 0.01 ? { x: 1, y: 0 } : { x: dx / directionLength, y: dy / directionLength },
    point,
    progress: boundedDistance / totalLength
  };
}

function routeDistanceAtTime(track: Carrier["track"], points: Array<[number, number]>, date: string) {
  const currentTime = toTime(date);
  const metrics = routeMetrics(points);

  if (currentTime <= toTime(track[0].date)) {
    return 0;
  }

  for (let index = 0; index < track.length - 1; index += 1) {
    const fromTime = toTime(track[index].date);
    const toTimeValue = toTime(track[index + 1].date);
    if (currentTime <= toTimeValue) {
      const segmentProgress = clamp((currentTime - fromTime) / Math.max(1, toTimeValue - fromTime));
      return metrics.cumulativeLengths[index] + metrics.segmentLengths[index] * segmentProgress;
    }
  }

  return metrics.totalLength;
}

function carrierPlacement(
  projection: ReturnType<typeof createCampaignProjection>,
  carrier: Carrier,
  date: string
) {
  const ordered = [...carrier.track].sort((a, b) => toTime(a.date) - toTime(b.date));
  const points = projectLine(projection, ordered.map((point) => point.coordinates));
  const totalLength = Math.max(routeLength(points), 1);
  const baseDistance = routeDistanceAtTime(ordered, points, date);
  const [along, cross] = carrier.formationOffset ?? [0, 0];
  const rawDistance = baseDistance + along;
  const placement = routePointAtDistance(points, rawDistance);
  const overflow = rawDistance < 0 ? rawDistance : rawDistance > totalLength ? rawDistance - totalLength : 0;
  const direction = placement.direction;
  const point: [number, number] = [
    placement.point[0] + direction.x * overflow - direction.y * cross,
    placement.point[1] + direction.y * overflow + direction.x * cross
  ];

  return {
    facingX: (direction.x < -0.01 ? -1 : direction.x > 0.01 ? 1 : carrier.defaultFacing === "east" ? 1 : -1) as 1 | -1,
    point,
    routeProgress: baseDistance / totalLength,
    trackPoints: points
  };
}

function buildPath(points: Array<[number, number]>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point[0].toFixed(1)} ${point[1].toFixed(1)}`).join(" ");
}

function projectLine(projection: ReturnType<typeof createCampaignProjection>, points: Array<[number, number]>) {
  return points.map((point) => projectPoint(projection, point));
}

function currentWavePoint(points: Array<[number, number]>, progress: number) {
  return linePointsUntil(points, progress).at(-1) ?? points[0];
}

function waveCueForEvent(event: MidwayEvent): BattleCueKind {
  if (event.waveIds.some((id) => ["tomonaga-midway-strike", "hiryu-first-counterstrike", "hiryu-second-counterstrike", "i168-yorktown"].includes(id))) {
    return "combined";
  }

  if (event.waveIds.some((id) => ["enterprise-vb6-vs6", "yorktown-vb3", "hiryu-final-strike"].includes(id))) {
    return "dive";
  }

  return "strafing";
}

function isCarrierActive(carrier: Carrier, progress: number) {
  return !carrier.sunkAt || progress <= timeline.dateToProgress(carrier.sunkAt);
}

function isCarrierDamaged(carrier: Carrier, progress: number) {
  return Boolean(carrier.damagedAt && progress >= timeline.dateToProgress(carrier.damagedAt));
}

function isCarrierSunk(carrier: Carrier, progress: number) {
  return Boolean(carrier.sunkAt && progress >= timeline.dateToProgress(carrier.sunkAt));
}

function CarrierMarker({
  carrier,
  currentDate,
  isFocused,
  point,
  progress,
  facingX,
  sunk = false
}: {
  carrier: Carrier;
  currentDate: string;
  facingX?: 1 | -1;
  isFocused?: boolean;
  point: [number, number];
  progress: number;
  sunk?: boolean;
}) {
  const resolvedFacingX = facingX ?? (carrier.defaultFacing === "east" ? 1 : -1);
  const shouldMirror = (resolvedFacingX === -1 && carrier.defaultFacing === "east") || (resolvedFacingX === 1 && carrier.defaultFacing === "west");
  const markerClass = [
    "midway-carrier-marker",
    `midway-${carrier.faction}-carrier`,
    isFocused ? "is-focused" : "",
    isCarrierDamaged(carrier, progress) || sunk ? "is-damaged" : "",
    sunk ? "is-sunk" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <g
      className={markerClass}
      data-testid={`midway-carrier-${carrier.id}`}
      data-carrier-id={carrier.id}
      data-facing-x={resolvedFacingX}
      data-formation-id={carrier.formationId}
      data-unit-offset-along={(carrier.formationOffset?.[0] ?? 0).toString()}
      transform={`translate(${point[0]} ${point[1]})`}
    >
      <ellipse className="midway-carrier-shadow" cx="0" cy="27" rx="52" ry="12" />
      <g transform={`scale(${shouldMirror ? -1 : 1} 1)`}>
        <image
          href={carrier.asset}
          x="-64"
          y="-30"
          width="128"
          height="58"
          preserveAspectRatio="xMidYMid meet"
          className="midway-carrier-image"
          data-testid={`midway-carrier-asset-${carrier.id}`}
          data-asset-kind="midway-carrier"
          data-carrier-id={carrier.id}
        />
      </g>
      {sunk && <ExplosionBurst x={0} y={0} compact />}
      <text className="midway-carrier-label" x="0" y="-38">
        {carrier.shortName}
      </text>
    </g>
  );
}

function ExplosionBurst({
  compact = false,
  testId = "midway-sunk-explosion",
  x,
  y
}: {
  compact?: boolean;
  testId?: string;
  x: number;
  y: number;
}) {
  const scale = compact ? 0.72 : 1;
  return (
    <g className="midway-explosion-burst" data-testid={testId} transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle r="22" />
      <circle r="34" />
      <path d="M 0 -30 L 8 -10 L 30 -8 L 12 3 L 20 27 L 0 14 L -20 27 L -12 3 L -30 -8 L -8 -10 Z" />
    </g>
  );
}

function AirWaveRoute({
  currentDate,
  progress,
  projection,
  wave
}: {
  currentDate: string;
  progress: number;
  projection: ReturnType<typeof createCampaignProjection>;
  wave: AirWave;
}) {
  const startProgress = timeline.dateToProgress(wave.start);
  const endProgress = timeline.dateToProgress(wave.end);
  const routeProgress = progressForSpan(wave.start, wave.end, progress);
  const hasStarted = progress >= startProgress - 0.005;
  const isActive = toTime(currentDate) >= toTime(wave.start) && toTime(currentDate) <= toTime(wave.end);
  const isComplete = progress >= endProgress - 0.000001;
  const routeState = isActive ? "is-active" : isComplete ? "is-complete" : "is-forming";
  const drawnProgress = isComplete ? 1 : routeProgress;
  const showAircraft = !isComplete || progress <= Math.min(1, endProgress + 0.035);
  const showLabel = hasStarted;
  const showArrow = !isComplete;
  const labelProgress = isComplete ? 0.62 : 0.55;
  if (!hasStarted) {
    return null;
  }

  const projected = projectLine(projection, wave.points);
  const visiblePoints = linePointsUntil(projected, drawnProgress);
  const markerPoint = currentWavePoint(projected, drawnProgress);
  const labelPoint = visiblePoints[Math.max(1, Math.floor(visiblePoints.length * labelProgress))] ?? markerPoint;
  const path = buildPath(visiblePoints);

  return (
    <g
      className={`midway-air-wave midway-wave-${wave.faction} midway-wave-${wave.type} ${routeState}`}
      data-testid={`midway-wave-${wave.id}`}
      data-wave-label={wave.label}
      data-route-state={routeState}
    >
      <path className="midway-wave-halo" d={path} />
      <path className="midway-wave-route" d={path} markerEnd={showArrow ? `url(#midway-arrow-${wave.faction})` : undefined} />
      <path className="midway-wave-direction" d={path} />
      {showAircraft && (
        <g className="midway-aircraft-marker" transform={`translate(${markerPoint[0]} ${markerPoint[1]})`}>
          <path d="M -18 1 L -5 -3 L 1 -20 L 7 -3 L 20 1 L 7 5 L 3 18 L -3 18 L -7 5 Z" />
        </g>
      )}
      {showLabel && (
        <text
          className="midway-wave-label"
          x={labelPoint[0] + (wave.labelOffset?.[0] ?? 10)}
          y={labelPoint[1] + (wave.labelOffset?.[1] ?? -10)}
        >
          {wave.routeLabel}
        </text>
      )}
    </g>
  );
}

export function MidwayBattleAnimation() {
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
  const currentDate = timeline.progressToDate(progress, 1 / (24 * 60));
  const elapsedHours = Math.max(1, Math.round(timeline.displayDaysAtProgress(progress) * 24) + 1);
  const projection = useMemo(() => createCampaignProjection(mapWidth, mapHeight, "midwayTactical"), []);
  const countryPath = useMemo(() => countryPathFactory(projection), [projection]);
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
  } = useMapInteraction(mapWidth, mapHeight, "midwayTactical");

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
    void scoreRef.current?.playBattleCue(waveCueForEvent(activeEvent));
  }, [activeEvent, isPlaying, isScoreEnabled]);

  const activeNarrationCue = narrationCues.find((cue, index) => {
    const start = timeline.dateToProgress(cue.start);
    const end = timeline.dateToProgress(cue.end);
    return progress >= start && (progress < end || (index === narrationCues.length - 1 && progress <= end));
  });
  const activeWaveIds = new Set(activeEvent.waveIds);
  const focusedCarrierIds = new Set(activeEvent.focus);
  const projectedPoints = tacticalPoints.map((point) => ({
    ...point,
    xy: projectPoint(projection, point.coordinates)
  }));

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

  const jumpToEvent = (event: MidwayEvent) => {
    setProgress(timeline.dateToProgress(event.date));
    window.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    if (isScoreEnabled && cueEventIds.has(event.id)) {
      lastCueEventRef.current = event.id;
      void scoreRef.current?.playBattleCue(waveCueForEvent(event));
    }
  };

  return (
    <main className="app-shell cinematic-mode midway-battle modern-war naval-war" data-testid="midway-app">
      <section className="control-deck" data-testid="control-deck">
        <div className="transport">
          <button
            type="button"
            data-testid="play-pause"
            onClick={() => {
              void togglePlayback();
            }}
            aria-label={isPlaying ? "暂停动画" : "播放动画"}
          >
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
          <button
            type="button"
            data-testid="score-toggle"
            data-music-source={musicSource}
            onClick={() => {
              void toggleScore();
            }}
            aria-label={isScoreEnabled ? "关闭循环战争配乐" : "开启循环战争配乐"}
          >
            {isScoreEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            配乐{isScoreEnabled ? (isScoreRunning ? "循环中" : "待播放") : "关闭"}
          </button>
          <span className="clock" data-testid="current-date">
            {formatChineseDate(currentDate)}
          </span>
        </div>

        <div className="timeline-stack">
          <label className="timeline-range" htmlFor="midway-timeline">
            <span>时间轴拖拽</span>
            <input
              id="midway-timeline"
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
              <h1>中途岛海空战</h1>
            </div>
            <span className="day-counter">第 {elapsedHours} 小时</span>
          </div>

          <svg
            ref={svgRef}
            className={`battle-map midway-map is-interactive-map ${isMapDragging ? "is-dragging" : ""}`}
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="中途岛海空战动态战术地图"
            {...mapInteractionProps}
          >
            <defs>
              <linearGradient id="midwayOceanGradient" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#17384c" />
                <stop offset="46%" stopColor="#102d41" />
                <stop offset="100%" stopColor="#071825" />
              </linearGradient>
              <linearGradient id="midwayLandGradient" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#e1d0a2" />
                <stop offset="100%" stopColor="#8fa876" />
              </linearGradient>
              <pattern id="midwayGrid" width="42" height="42" patternUnits="userSpaceOnUse">
                <path d="M0 21H42M21 0V42" stroke="rgba(170, 220, 236, 0.08)" strokeWidth="1" />
                <circle cx="21" cy="21" r="1.2" fill="rgba(219, 244, 255, 0.12)" />
              </pattern>
              <marker id="midway-arrow-us" markerHeight="8" markerWidth="10" orient="auto" refX="9" refY="4">
                <path d="M0 0L10 4L0 8L2 4Z" fill="#5cc6ff" />
              </marker>
              <marker id="midway-arrow-japan" markerHeight="8" markerWidth="10" orient="auto" refX="9" refY="4">
                <path d="M0 0L10 4L0 8L2 4Z" fill="#ff6b46" />
              </marker>
              <marker id="midway-arrow-midway" markerHeight="8" markerWidth="10" orient="auto" refX="9" refY="4">
                <path d="M0 0L10 4L0 8L2 4Z" fill="#ffd35a" />
              </marker>
            </defs>

            <rect className="map-base" width={mapWidth} height={mapHeight} fill="url(#midwayOceanGradient)" />
            <rect className="map-texture" width={mapWidth} height={mapHeight} fill="url(#midwayGrid)" opacity="0.9" />
            <g className="camera-layer" data-testid="camera-layer" transform={mapTransform}>
              <g className="country-layer">
                {pacificCampaignCountries.map((country) => (
                  <path key={country.properties?.name} d={countryPath(country) ?? undefined} className={pacificCountryClassName(country)} />
                ))}
              </g>

              <g className="midway-battle-room">
                <ellipse cx={projectPoint(projection, [182.65, 28.2])[0]} cy={projectPoint(projection, [182.65, 28.2])[1]} rx="74" ry="28" />
                <text x={projectPoint(projection, [182.65, 28.2])[0] - 62} y={projectPoint(projection, [182.65, 28.2])[1] - 34}>
                  MIDWAY ATOLL
                </text>
              </g>

              <g className="region-labels">
                <text x={projectPoint(projection, [179.2, 31.8])[0]} y={projectPoint(projection, [179.2, 31.8])[1]}>
                  KIDO BUTAI
                </text>
                <text x={projectPoint(projection, [185.4, 32.6])[0]} y={projectPoint(projection, [185.4, 32.6])[1]}>
                  U.S. TASK FORCES
                </text>
              </g>

              <g className="midway-carrier-tracks">
                {carriers.map((carrier) => {
                  const placement = carrierPlacement(projection, carrier, currentDate);
                  const track = linePointsUntil(placement.trackPoints, placement.routeProgress);
                  const visible = track.length > 1;
                  if (!visible) {
                    return null;
                  }
                  return (
                    <path
                      key={carrier.id}
                      className={`midway-carrier-track midway-track-${carrier.faction}`}
                      data-testid={`midway-track-${carrier.id}`}
                      data-formation-id={carrier.formationId}
                      d={buildPath(track)}
                    />
                  );
                })}
              </g>

              <g className="midway-air-waves">
                {airWaves.map((wave) => (
                  <AirWaveRoute key={wave.id} currentDate={currentDate} progress={progress} projection={projection} wave={wave} />
                ))}
              </g>

              <g className="midway-carriers-active">
                {carriers.map((carrier) => {
                  if (!isCarrierActive(carrier, progress)) {
                    return null;
                  }
                  const placement = carrierPlacement(projection, carrier, currentDate);
                  return (
                    <CarrierMarker
                      key={carrier.id}
                      carrier={carrier}
                      currentDate={currentDate}
                      facingX={placement.facingX}
                      isFocused={focusedCarrierIds.has(carrier.id)}
                      point={placement.point}
                      progress={progress}
                    />
                  );
                })}
              </g>

              <g className="midway-sunk-markers">
                {carriers.map((carrier) => {
                  if (!isCarrierSunk(carrier, progress)) {
                    return null;
                  }
                  const point = projectPoint(projection, carrier.sunkPoint);
                  return (
                    <g key={`${carrier.id}-sunk`} data-testid={`midway-sunk-${carrier.id}`} className="midway-sunk-site">
                      <CarrierMarker carrier={carrier} currentDate={carrier.sunkAt ?? currentDate} point={point} progress={progress} sunk />
                      <text className="midway-sunk-label" x={point[0] + 42} y={point[1] + 35}>
                        {carrier.shortName} / {carrier.sunkLabel}
                      </text>
                    </g>
                  );
                })}
              </g>

              <g className="midway-event-effects">
                {battleEvents.map((event) => {
                  const eventProgress = timeline.eventProgress(event.date, progress);
                  const passed = timeline.dateToProgress(event.date) <= progress;
                  const isCurrent = event.id === activeEvent.id;
                  if (!passed && !isCurrent) {
                    return null;
                  }

                  const [x, y] = projectPoint(projection, event.coordinates);
                  return (
                    <g key={event.id} className={`event-pin ${passed ? "passed" : ""} ${isCurrent ? "is-current" : ""}`}>
                      {isCurrent && <ExplosionBurst x={x} y={y} compact={eventProgress < 0.55} testId="midway-event-explosion" />}
                      <circle cx={x} cy={y} r={isCurrent ? 7 : 4.4} />
                      {isCurrent && (
                        <text x={x + 16} y={y + 5} className="active-event-label">
                          {event.title}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>

              <g className="midway-points">
                {projectedPoints.map((point) => {
                  const revealDate = pointRevealDates[point.id];

                  if (revealDate && progress < timeline.dateToProgress(revealDate)) {
                    return null;
                  }

                  return (
                    <g key={point.id} className={`map-point point-${point.kind}`} data-testid={`midway-point-${point.id}`}>
                      <circle cx={point.xy[0]} cy={point.xy[1]} r={point.kind === "base" ? 5.6 : 3.2} />
                      {point.kind !== "damage" && (
                        <text x={point.xy[0] + 8} y={point.xy[1] + 4}>
                          {point.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </g>

            <g className="cinematic-map-effects" data-testid="cinematic-map-effects" aria-hidden="true">
              <circle className="cinematic-focus-glow" cx={projectPoint(projection, activeEvent.coordinates)[0]} cy={projectPoint(projection, activeEvent.coordinates)[1]} r="146" />
              <path className="cinematic-front-haze" d="M40 690C210 598 330 688 512 606C714 514 856 620 1140 500V880H40Z" />
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

          <div className="map-legend midway-legend" aria-label="图例">
            <span className="legend-allies">美军航母/空袭波次</span>
            <span className="legend-germany">日军航母/反击波次</span>
            <span className="legend-midway">中途岛陆基机</span>
            <span className="legend-event">重创/沉没点</span>
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
            <div className="midway-wave-card" data-testid="midway-active-waves">
              <span>当前波次</span>
              {activeEvent.waveIds.map((waveId) => {
                const wave = airWaves.find((item) => item.id === waveId);
                return wave ? <p key={wave.id}>{wave.label}：{wave.detail}</p> : null;
              })}
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
          <h2>1942年6月4日至7日的中途岛航母海空战</h2>
        </div>
        <div className="event-list" data-testid="event-list">
          {battleEvents.map((event) => (
            <button key={event.id} type="button" className={event.id === activeEvent.id ? "active" : ""} onClick={() => jumpToEvent(event)}>
              <span>{formatChineseDate(event.date)}</span>
              <strong>{event.title}</strong>
              <small>{event.summary}</small>
              {event.waveIds.some((waveId) => activeWaveIds.has(waveId)) && <em>{event.waveIds.join(" / ")}</em>}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
