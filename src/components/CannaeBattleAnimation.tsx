import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  battleEvents,
  campaignEnd,
  campaignStart,
  cueEventIds,
  narrationCues,
  playbackDurationSeconds,
  routes,
  type CannaeEvent,
  type CannaeRoute,
  type CannaeUnitTrack
} from "../data/cannaeBattle";
import { createCampaignTimeline } from "../lib/campaignTimeline";
import { publicPath } from "../lib/publicPath";
import { formatChineseDate } from "../lib/timeline";
import { useMapInteraction, type MapView } from "../lib/useMapInteraction";
import { WarScore } from "../lib/warScore";
import { CannaeTerrain3D, type CannaeTerrainEffectPlacement, type CannaeTerrainRouteState } from "./CannaeTerrain3D";

const mapWidth = 1800;
const mapHeight = 1080;
const cannaeViewportCenterX = mapWidth / 2;
const cannaeViewportCenterY = mapHeight / 2;
const cannaeMinMapScale = 0.46;
const cannaeMaxMapScale = 3.35;
const cannaeInteractionBounds = {
  east: 16.238,
  north: 41.325,
  south: 41.262,
  west: 16.06
};
const musicSource = publicPath("/audio/wikimedia-the-gladiator-us-marine-band.ogg");

type CannaeCameraStageId = "deployment" | "convex" | "contact" | "cavalry" | "pocket" | "rearSeal" | "compression" | "endgame";

type CannaeCameraStage = {
  bearing: number;
  center: [number, number];
  focusRoutePoints: Array<[number, number]>;
  scale: number;
};

type ContactRouteState = CannaeTerrainRouteState & {
  contactPoint: [number, number];
};

const cannaeCameraStages: Record<CannaeCameraStageId, CannaeCameraStage> = {
  deployment: {
    bearing: 12,
    center: [16.151, 41.286],
    focusRoutePoints: [
      [16.075, 41.306],
      [16.222, 41.311],
      [16.222, 41.264],
      [16.075, 41.264]
    ],
    scale: 0.5
  },
  convex: {
    bearing: 12,
    center: [16.151, 41.286],
    focusRoutePoints: [
      [16.082, 41.306],
      [16.218, 41.31],
      [16.218, 41.267],
      [16.082, 41.268]
    ],
    scale: 0.52
  },
  contact: {
    bearing: 12,
    center: [16.158, 41.287],
    focusRoutePoints: [
      [16.112, 41.302],
      [16.19, 41.302],
      [16.19, 41.272],
      [16.112, 41.272]
    ],
    scale: 1.04
  },
  cavalry: {
    bearing: -18,
    center: [16.154, 41.286],
    focusRoutePoints: [
      [16.108, 41.307],
      [16.206, 41.311],
      [16.206, 41.266],
      [16.108, 41.266]
    ],
    scale: 0.84
  },
  pocket: {
    bearing: -18,
    center: [16.163, 41.287],
    focusRoutePoints: [
      [16.118, 41.301],
      [16.19, 41.301],
      [16.19, 41.276],
      [16.118, 41.276]
    ],
    scale: 1.08
  },
  rearSeal: {
    bearing: -18,
    center: [16.166, 41.286],
    focusRoutePoints: [
      [16.118, 41.301],
      [16.182, 41.299],
      [16.182, 41.276],
      [16.118, 41.276]
    ],
    scale: 1.06
  },
  compression: {
    bearing: -18,
    center: [16.1645, 41.286],
    focusRoutePoints: [
      [16.136, 41.296],
      [16.181, 41.296],
      [16.181, 41.278],
      [16.136, 41.278]
    ],
    scale: 1.16
  },
  endgame: {
    bearing: -18,
    center: [16.163, 41.285],
    focusRoutePoints: [
      [16.14, 41.294],
      [16.18, 41.294],
      [16.18, 41.279],
      [16.14, 41.279]
    ],
    scale: 1.14
  }
};

const eventCameraStage: Record<string, CannaeCameraStageId> = {
  "deployment-begins": "deployment",
  "hannibal-convex-center": "convex",
  "roman-deep-advance": "contact",
  "cavalry-clearance": "cavalry",
  "center-becomes-concave": "pocket",
  "african-wings-turn": "pocket",
  "rear-seal": "rearSeal",
  "encirclement-compression": "compression",
  "paullus-endgame": "endgame",
  "battle-result": "endgame"
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
  campaignEnd,
  campaignStart,
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
  const x = ((point[0] - cannaeInteractionBounds.west) / (cannaeInteractionBounds.east - cannaeInteractionBounds.west)) * mapWidth;
  const y = ((cannaeInteractionBounds.north - point[1]) / (cannaeInteractionBounds.north - cannaeInteractionBounds.south)) * mapHeight;
  return [Math.max(0, Math.min(mapWidth, x)), Math.max(0, Math.min(mapHeight, y))] as [number, number];
}

function routeLength(points: Array<[number, number]>) {
  return points.slice(0, -1).reduce((sum, point, index) => sum + Math.hypot(points[index + 1][0] - point[0], points[index + 1][1] - point[1]), 0);
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

function easeInOut(value: number) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function trackPoint(track: CannaeUnitTrack, progress: number) {
  const startDelay = track.startDelay ?? 0;
  const endDelay = track.endDelay ?? 0;
  const localProgress = easeInOut((progress - startDelay) / Math.max(0.001, 1 - startDelay - endDelay));
  if (track.control) {
    const a: [number, number] = [
      track.from[0] + (track.control[0] - track.from[0]) * localProgress,
      track.from[1] + (track.control[1] - track.from[1]) * localProgress
    ];
    const b: [number, number] = [
      track.control[0] + (track.to[0] - track.control[0]) * localProgress,
      track.control[1] + (track.to[1] - track.control[1]) * localProgress
    ];
    return [a[0] + (b[0] - a[0]) * localProgress, a[1] + (b[1] - a[1]) * localProgress] as [number, number];
  }
  return [
    track.from[0] + (track.to[0] - track.from[0]) * localProgress,
    track.from[1] + (track.to[1] - track.from[1]) * localProgress
  ] as [number, number];
}

function routeUnitPointNear(state: CannaeTerrainRouteState, target: [number, number]) {
  const points = state.route.unitTracks?.map((track) => trackPoint(track, state.routeProgress));
  if (!points?.length) {
    return state.markerPoint;
  }
  return points
    .map((point) => ({ distance: distance(point, target), point }))
    .sort((a, b) => a.distance - b.distance)[0].point;
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

function cameraStageForEvent(event: CannaeEvent) {
  return cannaeCameraStages[eventCameraStage[event.id] ?? "contact"];
}

function mapViewForEvent(event: CannaeEvent): MapView {
  const stage = cameraStageForEvent(event);
  const [focusX, focusY] = projectInteractionPoint(stage.center);
  const scale = stage.scale;
  return {
    scale,
    x: cannaeViewportCenterX - focusX * scale,
    y: cannaeViewportCenterY - focusY * scale
  };
}

function routeShouldRender(route: CannaeRoute, progress: number, activeRouteIds: Set<string>) {
  const routeStartProgress = timeline.dateToProgress(route.start);
  const routeEndProgress = timeline.dateToProgress(route.end);
  const routeVisibleEnd = route.visibleUntil ? timeline.dateToProgress(route.visibleUntil) : 1;
  const isActive = progress >= routeStartProgress && progress < routeEndProgress;
  const isLinkedToActiveEvent = activeRouteIds.has(route.id);
  const isWithinRetainedWindow = progress >= routeStartProgress && progress <= routeVisibleEnd;
  return isLinkedToActiveEvent || isActive || isWithinRetainedWindow;
}

function routeUnitShouldRender(route: CannaeRoute, progress: number, activeEvent: CannaeEvent) {
  const resultProgress = timeline.dateToProgress(campaignEnd);
  if (activeEvent.id === "battle-result" || progress >= resultProgress - 0.0015) {
    return false;
  }
  const routeStartProgress = route.unitVisibleFrom ? timeline.dateToProgress(route.unitVisibleFrom) : timeline.dateToProgress(route.start);
  const unitVisibleEnd = route.unitVisibleUntil ? timeline.dateToProgress(route.unitVisibleUntil) : route.visibleUntil ? timeline.dateToProgress(route.visibleUntil) : 1;
  return progress >= routeStartProgress && progress <= unitVisibleEnd;
}

function distance(a: [number, number], b: [number, number]) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function weightedPoint(a: [number, number], b: [number, number], bWeight = 0.5) {
  return [a[0] * (1 - bWeight) + b[0] * bWeight, a[1] * (1 - bWeight) + b[1] * bWeight] as [number, number];
}

function routeStatePriority(state: CannaeTerrainRouteState) {
  if (state.active) {
    return 0;
  }
  if (state.showUnits) {
    return 1;
  }
  return 2;
}

function contactIsPlausible(contact: {
  carthaginianPoint: [number, number];
  carthaginianRouteId: string;
  distanceThreshold?: number;
  earliest?: string;
  point: [number, number];
  romanPoint: [number, number];
  romanRouteId: string;
}, projectedRoutes: CannaeTerrainRouteState[], progress: number) {
  if (contact.earliest && progress < timeline.dateToProgress(contact.earliest)) {
    return false;
  }
  const romanRoute = projectedRoutes.find((state) => state.route.id === contact.romanRouteId);
  const carthaginianRoute = projectedRoutes.find((state) => state.route.id === contact.carthaginianRouteId);
  if (!romanRoute?.showUnits || !carthaginianRoute?.showUnits || !romanRoute.isVisible || !carthaginianRoute.isVisible) {
    return false;
  }

  const romanContactPoint = routeUnitPointNear(romanRoute, contact.romanPoint);
  const carthaginianContactPoint = routeUnitPointNear(carthaginianRoute, contact.carthaginianPoint);
  const routeDistance = distance(romanContactPoint, carthaginianContactPoint);
  const anchorDistance = Math.max(distance(romanContactPoint, contact.romanPoint), distance(carthaginianContactPoint, contact.carthaginianPoint));
  const routeThreshold = contact.distanceThreshold ?? 0.021;
  return routeDistance < routeThreshold && anchorDistance < Math.max(0.052, routeThreshold * 2.1);
}

function routeContactPointForState(state: CannaeTerrainRouteState) {
  const points = state.route.formationPrelude?.length ? [...state.route.formationPrelude, state.markerPoint] : state.visiblePoints;
  if (points.length === 0) {
    return state.markerPoint;
  }
  const route = state.route;
  const preferredPoint = route.positionAnchor === "roman-compressed-core" || route.routeKind === "compression" || route.routeKind === "collapse"
    ? points.at(-1)!
    : state.markerPoint;
  return preferredPoint;
}

function liveRouteForContact(routeId: string, projectedRoutes: CannaeTerrainRouteState[], target?: [number, number]): ContactRouteState | null {
  const state = projectedRoutes.find((item) => item.route.id === routeId);
  if (!state || !state.isVisible || !state.showUnits) {
    return null;
  }
  return {
    ...state,
    contactPoint: target ? routeUnitPointNear(state, target) : routeContactPointForState(state)
  };
}

function liveContactForAnchor(contact: {
  carthaginianPoint: [number, number];
  carthaginianRouteId: string;
  romanPoint: [number, number];
  romanRouteId: string;
}, projectedRoutes: CannaeTerrainRouteState[]) {
  const romanRoute = liveRouteForContact(contact.romanRouteId, projectedRoutes, contact.romanPoint);
  const carthaginianRoute = liveRouteForContact(contact.carthaginianRouteId, projectedRoutes, contact.carthaginianPoint);
  if (!romanRoute || !carthaginianRoute) {
    return null;
  }
  const isMassedInfantryContact =
    romanRoute.route.unitKind === "roman-legion" &&
    (carthaginianRoute.route.unitKind === "carthaginian-infantry" || carthaginianRoute.route.unitKind === "african-infantry");
  const point = weightedPoint(romanRoute.contactPoint, carthaginianRoute.contactPoint, isMassedInfantryContact ? 0.42 : 0.5);
  return {
    carthaginianPoint: carthaginianRoute.contactPoint,
    carthaginianRouteId: carthaginianRoute.route.id,
    point,
    romanPoint: romanRoute.contactPoint,
    romanRouteId: romanRoute.route.id
  };
}

function activeEffectPlacementForEvent(event: CannaeEvent, projectedRoutes: CannaeTerrainRouteState[], fallbackPoint: [number, number], progress: number): CannaeTerrainEffectPlacement | null {
  if (!event.cue) {
    return null;
  }

  if (event.contactAnchors?.length) {
    const plausibleContacts = event.contactAnchors.filter((contact) => contactIsPlausible(contact, projectedRoutes, progress));
    if (plausibleContacts.length === 0) {
      return null;
    }
    const contacts = plausibleContacts
      .map((contact) => liveContactForAnchor(contact, projectedRoutes))
      .filter((contact): contact is NonNullable<typeof contact> => Boolean(contact));
    if (contacts.length === 0) {
      return null;
    }
    return {
      contacts,
      point: contacts[0].point,
      source: "event-contact"
    };
  }

  const candidates = projectedRoutes
    .filter((state) => event.routeIds.includes(state.route.id) && state.isVisible && state.showUnits)
    .sort((a, b) => routeStatePriority(a) - routeStatePriority(b));
  const romanRoutes = candidates.filter((state) => state.route.faction === "roman").map((state) => liveRouteForContact(state.route.id, projectedRoutes)).filter((state): state is ContactRouteState => Boolean(state));
  const carthaginianRoutes = candidates.filter((state) => state.route.faction === "carthaginian").map((state) => liveRouteForContact(state.route.id, projectedRoutes)).filter((state): state is ContactRouteState => Boolean(state));

  if (romanRoutes.length > 0 && carthaginianRoutes.length > 0) {
    const pairs = romanRoutes
      .flatMap((romanRoute) =>
        carthaginianRoutes.map((carthaginianRoute) => ({
          carthaginianRoute,
          distance: distance(romanRoute.contactPoint, carthaginianRoute.contactPoint),
          romanRoute
        }))
      )
      .sort((a, b) => a.distance + routeStatePriority(a.romanRoute) * 0.01 + routeStatePriority(a.carthaginianRoute) * 0.01 - (b.distance + routeStatePriority(b.romanRoute) * 0.01 + routeStatePriority(b.carthaginianRoute) * 0.01));
    const contacts = pairs.slice(0, 4).map((pair) => ({
      carthaginianPoint: pair.carthaginianRoute.contactPoint,
      carthaginianRouteId: pair.carthaginianRoute.route.id,
      point: weightedPoint(pair.romanRoute.contactPoint, pair.carthaginianRoute.contactPoint),
      romanPoint: pair.romanRoute.contactPoint,
      romanRouteId: pair.romanRoute.route.id
    }));

    return {
      contacts,
      point: contacts[0].point,
      source: "route-contact"
    };
  }

  return null;
}

export function CannaeBattleAnimation() {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScoreEnabled, setIsScoreEnabled] = useState(true);
  const [isScoreRunning, setIsScoreRunning] = useState(false);
  const lastFrameRef = useRef<number | null>(null);
  const scoreRef = useRef<WarScore | null>(null);
  const lastCueEventRef = useRef<string | null>(null);
  const playbackSpeed = 1 / playbackDurationSeconds;
  const activeEvent = timeline.getActiveEvent(progress);
  const upcomingEvent = timeline.getUpcomingEvent(progress);
  const activeRouteIds = useMemo(() => new Set(activeEvent.routeIds), [activeEvent.routeIds]);
  const currentDate = timeline.progressToDate(progress, 1 / 24);
  const elapsedHours = Math.max(1, Math.round(timeline.displayDaysAtProgress(progress) * 24) + 1);
  const activeCameraStage = useMemo(() => cameraStageForEvent(activeEvent), [activeEvent.id]);
  const activeMapView = useMemo(() => mapViewForEvent(activeEvent), [activeEvent.id]);
  const geographicRoutes = useMemo<CannaeTerrainRouteState[]>(
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
        const showUnits = routeUnitShouldRender(route, progress, activeEvent);

        return {
          active,
          facingX,
          isComplete,
          isVisible,
          labelPoint,
          markerPoint,
          route,
          routeProgress,
          showUnits,
          visiblePoints
        };
      }),
    [activeRouteIds, progress]
  );
  const activeGeographicEffectPlacement = useMemo(
    () => activeEffectPlacementForEvent(activeEvent, geographicRoutes, activeEvent.coordinates, progress),
    [activeEvent, geographicRoutes, progress]
  );
  const activeGeographicBearing = activeCameraStage.bearing;
  const activeGeographicFocus = activeCameraStage.center;
  const activeGeographicFocusRoutePoints = useMemo(() => [activeCameraStage.center, ...activeCameraStage.focusRoutePoints], [activeEvent.id]);
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
  } = useMapInteraction(mapWidth, mapHeight, activeEvent.id, activeMapView, { maxScale: cannaeMaxMapScale, minScale: cannaeMinMapScale });
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
  }, [isPlaying, playbackSpeed]);

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

  const scrubToProgress = (nextProgress: number) => {
    setIsPlaying(false);
    setProgress(timeline.clampProgress(nextProgress));
    lastCueEventRef.current = null;
    scoreRef.current?.cancelPendingBattleCues();
    void pauseScore();
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

  const jumpToEvent = (event: CannaeEvent) => {
    setProgress(timeline.clampProgress(timeline.dateToProgress(event.date) + 0.000001));
    window.scrollTo({ left: 0, top: 0, behavior: "auto" });
    if (isScoreEnabled && event.cue === "melee") {
      lastCueEventRef.current = event.id;
      void scoreRef.current?.playBattleCue("melee");
    }
  };

  return (
    <main className="app-shell cinematic-mode cannae-battle ancient-war" data-testid="cannae-app" data-playback-duration={`${playbackDurationSeconds}`}>
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
              scrubToProgress(0);
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
          <label className="timeline-range" htmlFor="cannae-timeline">
            <span>时间轴拖拽</span>
            <input
              id="cannae-timeline"
              data-testid="timeline"
              type="range"
              min="0"
              max="1000"
              value={Math.round(progress * 1000)}
              onChange={(event) => {
                scrubToProgress(Number(event.target.value) / 1000);
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
            <div data-testid="map-title-card">
              <h1>坎尼会战</h1>
            </div>
            <span className="day-counter">第 {elapsedHours} 小时</span>
          </div>

          <CannaeTerrain3D
            activeEffectPlacement={activeGeographicEffectPlacement}
            activeEvent={activeEvent}
            activeRouteIds={activeRouteIds}
            cameraBearing={activeGeographicBearing}
            cameraScale={activeCameraStage.scale}
            dateToProgress={timeline.dateToProgress}
            focusCoordinates={activeGeographicFocus}
            focusRoutePoints={activeGeographicFocusRoutePoints}
            isPlaying={isPlaying}
            mapBaseView={activeMapView}
            mapView={mapView}
            progress={progress}
            projectedRoutes={geographicRoutes}
          />

          <svg
            ref={svgRef}
            className={`battle-map cannae-map is-interactive-map ${isMapDragging ? "is-dragging" : ""}`}
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            preserveAspectRatio="xMidYMid slice"
            role="img"
            aria-label="坎尼会战奥凡托河平原倾斜战术地图"
            {...mapInteractionProps}
          >
            <g className="camera-layer cannae-camera-layer" data-testid="camera-layer" data-projection="maplibre-control-only" transform={mapTransform} />
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
          <div className="map-legend cannae-legend" aria-label="图例">
            <span className="legend-roman">罗马纵深集团</span>
            <span className="legend-carthaginian">迦太基中军与两翼</span>
            <span className="legend-cavalry">骑兵清场与封口</span>
            <span className="legend-terrain">奥凡托河平原</span>
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
          <h2>从凸阵诱入到双重包围闭合</h2>
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
