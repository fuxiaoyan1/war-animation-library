import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ambushSectors,
  battleEvents,
  campFortifications,
  campaignEnd,
  campaignStart,
  cueEventIds,
  fieldworks,
  formations,
  historicalRegions,
  mapPoints,
  narrationCues,
  rivers,
  routes,
  tacticalGraphics,
  terrainContours,
  terrainLabels,
  terrainReliefSurfaces,
  type GaixiaEvent,
  type GaixiaFieldwork,
  type GaixiaFormation,
  type GaixiaReliefSurface,
  type GaixiaRoute,
  type GaixiaTacticalGraphic,
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
const gaixiaMapScale = 0.94;
const gaixiaMinMapScale = 0.82;
const gaixiaViewportCenterY = mapHeight / 2;
const gaixiaViewportCenterX = mapWidth / 2;
const gaixiaSandboxBaseElevation = 26;
const gaixiaSandboxElevationScale = 5.8;
const gaixiaSandboxYScale = 0.72;
const gaixiaSandboxXScale = 0.92;
const gaixiaSandboxShear = 0.06;
const gaixiaSandboxCenterX = mapWidth / 2;
const gaixiaSandboxCenterY = mapHeight / 2;
const musicSource = publicPath("/audio/shi-mian-mai-fu-pipa.mp3");

const eventMapScale: Partial<Record<string, number>> = {
  "chu-arrives-gaixia": 0.94,
  "chu-forms-camp-array": 0.98,
  "hanxin-deploys": 0.93,
  "west-counterpush-yield": 0.96,
  "han-counterpress-east-gap": 0.99,
  "ten-sided-ring": 0.88,
  "songs-of-chu": 0.98,
  farewell: 1.0,
  "dawn-assault": 0.94,
  "xiangyu-breakout": 0.98,
  "dongcheng-last-stand": 1.0,
  "wujiang-end": 1.02
};

const eventFocusYOffset: Partial<Record<string, number>> = {
  "chu-arrives-gaixia": 18,
  "chu-forms-camp-array": 36,
  "hanxin-deploys": -210,
  "west-counterpush-yield": 18,
  "han-counterpress-east-gap": 26,
  "ten-sided-ring": 56,
  "songs-of-chu": 30,
  farewell: 36,
  "dawn-assault": 58,
  "xiangyu-breakout": 86,
  "dongcheng-last-stand": 96,
  "wujiang-end": 108
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

type GaixiaGroundMaterial = {
  id: string;
  kind: "sand" | "grass" | "marsh" | "approach" | "camp";
  elevation: number;
  points: Array<[number, number]>;
};

const groundMaterials: GaixiaGroundMaterial[] = [
  {
    id: "west-river-grass",
    kind: "grass",
    elevation: 28,
    points: [
      [117.05, 33.62],
      [117.31, 33.6],
      [117.34, 33.48],
      [117.28, 33.33],
      [117.24, 33.13],
      [117.1, 32.97],
      [117.05, 32.97]
    ]
  },
  {
    id: "north-bank-grass",
    kind: "grass",
    elevation: 29,
    points: [
      [117.19, 33.57],
      [117.52, 33.6],
      [117.75, 33.48],
      [117.64, 33.4],
      [117.35, 33.39],
      [117.19, 33.45]
    ]
  },
  {
    id: "central-dry-field",
    kind: "sand",
    elevation: 30,
    points: [
      [117.29, 33.42],
      [117.52, 33.45],
      [117.71, 33.35],
      [117.68, 33.16],
      [117.46, 33.1],
      [117.24, 33.2]
    ]
  },
  {
    id: "south-marsh-floor",
    kind: "marsh",
    elevation: 27,
    points: [
      [117.17, 33.16],
      [117.37, 33.22],
      [117.61, 33.17],
      [117.82, 33.08],
      [117.79, 32.98],
      [117.38, 33.02]
    ]
  },
  {
    id: "east-breakout-road-floor",
    kind: "approach",
    elevation: 31,
    points: [
      [117.51, 33.31],
      [117.6, 33.29],
      [117.76, 33.12],
      [117.82, 33.04],
      [117.74, 33.01],
      [117.58, 33.18],
      [117.49, 33.26]
    ]
  },
  {
    id: "bawangcheng-beaten-earth",
    kind: "camp",
    elevation: 36,
    points: [
      [117.36, 33.3],
      [117.42, 33.41],
      [117.52, 33.39],
      [117.55, 33.32],
      [117.49, 33.25],
      [117.39, 33.26]
    ]
  }
];

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

function projectFlatTacticalPoint(projection: ReturnType<typeof createCampaignProjection>, point: [number, number]) {
  const [x, y] = projectPoint(projection, point);
  return [x, y * tacticalYScale] as [number, number];
}

function projectSandboxFlatPoint(point: [number, number], elevation = gaixiaSandboxBaseElevation) {
  const z = Math.max(-4, elevation - gaixiaSandboxBaseElevation) * gaixiaSandboxElevationScale;
  return [
    gaixiaSandboxCenterX + (point[0] - gaixiaSandboxCenterX) * gaixiaSandboxXScale + (point[1] - gaixiaSandboxCenterY) * gaixiaSandboxShear,
    gaixiaSandboxCenterY + (point[1] - gaixiaSandboxCenterY) * gaixiaSandboxYScale - z
  ] as [number, number];
}

function projectTacticalPoint(projection: ReturnType<typeof createCampaignProjection>, point: [number, number], elevation = reliefElevationAtPoint(point)) {
  return projectSandboxFlatPoint(projectFlatTacticalPoint(projection, point), elevation);
}

function projectLine(projection: ReturnType<typeof createCampaignProjection>, points: Array<[number, number]>) {
  return points.map((point) => projectTacticalPoint(projection, point));
}

function projectLineAtElevation(projection: ReturnType<typeof createCampaignProjection>, points: Array<[number, number]>, elevation: number) {
  return points.map((point) => projectTacticalPoint(projection, point, elevation));
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

function reliefSideWallPath(basePoints: Array<[number, number]>, raisedPoints: Array<[number, number]>) {
  const startIndex = Math.max(1, Math.floor(basePoints.length * 0.46));
  const baseEdge = basePoints.slice(startIndex);
  const raisedEdge = raisedPoints.slice(startIndex).reverse();
  return `${buildPath([...baseEdge, ...raisedEdge])} Z`;
}

function reliefBackWallPath(basePoints: Array<[number, number]>, raisedPoints: Array<[number, number]>) {
  const endIndex = Math.max(2, Math.floor(basePoints.length * 0.5));
  const baseEdge = basePoints.slice(0, endIndex);
  const raisedEdge = raisedPoints.slice(0, endIndex).reverse();
  return `${buildPath([...baseEdge, ...raisedEdge])} Z`;
}

function reliefEdgeWallPaths(basePoints: Array<[number, number]>, raisedPoints: Array<[number, number]>) {
  return basePoints.map((point, index) => {
    const nextIndex = (index + 1) % basePoints.length;
    return `${buildPath([point, basePoints[nextIndex], raisedPoints[nextIndex], raisedPoints[index]])} Z`;
  });
}

function reliefElevationAtPoint(point: [number, number]) {
  const distances = terrainReliefSurfaces.map((surface) => {
    const surfacePoints = surface.points;
    const distanceToSurface = surfacePoints.reduce((minimum, surfacePoint) => {
      const distanceToPoint = Math.hypot(surfacePoint[0] - point[0], surfacePoint[1] - point[1]);
      return Math.min(minimum, distanceToPoint);
    }, Number.POSITIVE_INFINITY);
    return { distance: distanceToSurface, surface };
  });
  const nearest = distances.sort((a, b) => a.distance - b.distance)[0]?.surface;
  return nearest?.elevation ?? 30;
}

function isTacticalGraphicVisible(graphic: GaixiaTacticalGraphic, progress: number) {
  return !graphic.revealAt || progress >= timeline.dateToProgress(graphic.revealAt);
}

function isFieldworkVisible(fieldwork: GaixiaFieldwork, progress: number) {
  return !fieldwork.revealAt || progress >= timeline.dateToProgress(fieldwork.revealAt);
}

function isFormationVisible(formation: GaixiaFormation, progress: number) {
  const start = timeline.dateToProgress(formation.start);
  const end = formation.end ? timeline.dateToProgress(formation.end) : 1;
  return progress >= start && progress <= end;
}

function pointAtRatio(points: Array<[number, number]>, ratio: number) {
  if (points.length < 2) {
    return points[0] ?? [0, 0];
  }

  return interpolateRoute(points, ratio);
}

function normalAtRatio(points: Array<[number, number]>, ratio: number) {
  const previous = pointAtRatio(points, Math.max(0, ratio - 0.02));
  const next = pointAtRatio(points, Math.min(1, ratio + 0.02));
  const dx = next[0] - previous[0];
  const dy = next[1] - previous[1];
  const length = Math.hypot(dx, dy) || 1;
  return [-dy / length, dx / length] as [number, number];
}

function formationFrontSamples(points: Array<[number, number]>, count: number) {
  if (points.length < 2) {
    return points;
  }

  return Array.from({ length: count }, (_, index) => pointAtRatio(points, count === 1 ? 0 : index / (count - 1)));
}

function formationGridPoints(points: Array<[number, number]>, rows: number, columns: number) {
  if (points.length < 3) {
    return formationFrontSamples(points, rows * columns);
  }

  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = maxX - minX;
  const height = maxY - minY;
  return Array.from({ length: rows * columns }, (_, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const xRatio = columns === 1 ? 0.5 : column / (columns - 1);
    const yRatio = rows === 1 ? 0.5 : row / (rows - 1);
    const stagger = row % 2 === 0 ? 0 : width / Math.max(16, columns * 4);
    return [minX + width * (0.18 + xRatio * 0.64) + stagger, minY + height * (0.18 + yRatio * 0.64)] as [number, number];
  });
}

function formationDepthRows(points: Array<[number, number]>, rows: number, columns: number, spacing = 13) {
  const front = formationFrontSamples(points, columns);
  return Array.from({ length: rows * columns }, (_, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const frontRatio = columns === 1 ? 0.5 : column / (columns - 1);
    const stagger = row % 2 === 0 ? 0 : 0.035;
    const normal = normalAtRatio(points, clamp(frontRatio + stagger, 0, 1));
    const depth = (row - (rows - 1) / 2) * spacing;
    return [front[column][0] + normal[0] * depth, front[column][1] + normal[1] * depth] as [number, number];
  });
}

function formationArcPoints(points: Array<[number, number]>, count: number, depth = 18) {
  const samples = formationFrontSamples(points, count);
  const center = samples.reduce(
    (sum, point) => [sum[0] + point[0] / samples.length, sum[1] + point[1] / samples.length] as [number, number],
    [0, 0]
  );
  return samples.map((point, index) => {
    const ratio = count === 1 ? 0 : index / (count - 1);
    const bow = Math.sin(ratio * Math.PI) * depth;
    const direction = point[0] < center[0] ? -1 : 1;
    return [point[0] + direction * bow * 0.2, point[1] - bow] as [number, number];
  });
}

function formationRankGuides(points: Array<[number, number]>, rows: number, spacing = 14) {
  if (points.length < 2 || rows < 2) {
    return [];
  }

  return Array.from({ length: rows }, (_, index) => {
    const depth = (index - (rows - 1) / 2) * spacing;
    return formationFrontSamples(points, 16).map((point, sampleIndex) => {
      const ratio = sampleIndex / 15;
      const normal = normalAtRatio(points, ratio);
      return [point[0] + normal[0] * depth, point[1] + normal[1] * depth] as [number, number];
    });
  });
}

function mapViewForEvent(event: GaixiaEvent, activePoint: [number, number]): MapView {
  const focusY = activePoint[1] + (eventFocusYOffset[event.id] ?? 0);
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

function routeStatePriority(state: ProjectedGaixiaRoute) {
  if (state.active) {
    return 0;
  }
  if (state.showUnits) {
    return 1;
  }
  return 2;
}

function activeEffectPlacementForEvent(event: GaixiaEvent, projectedRoutes: ProjectedGaixiaRoute[], fallbackPoint: [number, number]): ActiveEffectPlacement {
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
      <ellipse className="gaixia-unit-ground-shadow" cx="13" cy={config.height * 0.38} rx={config.width * 0.45} ry="9" />
      <path className="gaixia-unit-stem" d={`M 0 ${config.height * 0.18} L 12 ${config.height * 0.42}`} />
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

function SandboxDeck() {
  const deckCorners: Array<[number, number]> = [
    [72, 104],
    [1100, 104],
    [1140, 2690],
    [42, 2690]
  ];
  const top = deckCorners.map((point) => projectSandboxFlatPoint(point, gaixiaSandboxBaseElevation));
  const underside = deckCorners.map((point) => projectSandboxFlatPoint(point, gaixiaSandboxBaseElevation - 7));
  const rightWall = [top[1], top[2], underside[2], underside[1]];
  const frontWall = [top[2], top[3], underside[3], underside[2]];
  const leftWall = [top[3], top[0], underside[0], underside[3]];
  const xGridLines = Array.from({ length: 8 }, (_, index) => {
    const x = 170 + index * 118;
    return [
      projectSandboxFlatPoint([x, 170], gaixiaSandboxBaseElevation + 0.2),
      projectSandboxFlatPoint([x + 34, 2620], gaixiaSandboxBaseElevation + 0.2)
    ] as Array<[number, number]>;
  });
  const yGridLines = Array.from({ length: 11 }, (_, index) => {
    const y = 260 + index * 210;
    return [
      projectSandboxFlatPoint([92, y], gaixiaSandboxBaseElevation + 0.2),
      projectSandboxFlatPoint([1106, y + 18], gaixiaSandboxBaseElevation + 0.2)
    ] as Array<[number, number]>;
  });

  return (
    <g className="gaixia-tactical-ground" data-testid="gaixia-tactical-ground" data-projection="elevated-isometric">
      <path className="gaixia-sandbox-side-wall gaixia-sandbox-side-wall-left" d={`${buildPath(leftWall)} Z`} />
      <path className="gaixia-sandbox-side-wall gaixia-sandbox-side-wall-right" d={`${buildPath(rightWall)} Z`} />
      <path className="gaixia-sandbox-side-wall gaixia-sandbox-side-wall-front" d={`${buildPath(frontWall)} Z`} />
      <path className="gaixia-sandbox-top" d={`${buildPath(top)} Z`} />
      <g className="gaixia-sandbox-grid" aria-hidden="true">
        {[...xGridLines, ...yGridLines].map((line, index) => (
          <path key={`sandbox-grid-${index}`} className="gaixia-sandbox-grid-line" d={buildPath(line)} />
        ))}
      </g>
      <path className="gaixia-sandbox-rim" d={`${buildPath(top)} Z`} />
    </g>
  );
}

function TerrainMaterialLayer({ projection }: { projection: ReturnType<typeof createCampaignProjection> }) {
  return (
    <g className="gaixia-ground-materials" data-testid="gaixia-ground-material-layer">
      {groundMaterials.map((material) => {
        const points = projectLineAtElevation(projection, material.points, material.elevation + 0.4);
        return (
          <path
            key={material.id}
            className={`gaixia-ground-material gaixia-ground-material-${material.kind}`}
            data-ground-material-kind={material.kind}
            data-testid={`gaixia-ground-material-${material.id}`}
            d={`${buildPath(points)} Z`}
          />
        );
      })}
    </g>
  );
}

function ReliefSurface({ projection, surface }: { projection: ReturnType<typeof createCampaignProjection>; surface: GaixiaReliefSurface }) {
  const basePoints = projectLineAtElevation(projection, surface.points, surface.baseElevation);
  const raisedPoints = projectLineAtElevation(projection, surface.points, surface.elevation);
  const edgeWallPaths = reliefEdgeWallPaths(basePoints, raisedPoints);
  const labelPoint = projectTacticalPoint(projection, surface.labelCoordinates, surface.elevation + 2);
  const ridgeLines = [0.16, 0.32, 0.5, 0.68, 0.84].map((ratio) =>
    raisedPoints.map(([x, y], index) => {
      const wave = Math.sin(index * 1.7 + ratio * Math.PI) * 5;
      return [x + wave, y + (surface.elevation - surface.baseElevation) * (ratio - 0.5) * 0.8] as [number, number];
    })
  );
  return (
    <g
      className={`gaixia-relief-surface gaixia-relief-${surface.kind} gaixia-relief-role-${surface.tacticalRole}`}
      data-elevation={surface.elevation}
      data-base-elevation={surface.baseElevation}
      data-testid={`gaixia-relief-${surface.id}`}
    >
      <path className="gaixia-relief-drop" d={`${buildPath(basePoints)} Z`} />
      <path className="gaixia-relief-shadow" d={`${buildPath(basePoints)} Z`} />
      {edgeWallPaths.map((wallPath, index) => (
        <path key={`${surface.id}-edge-${index}`} className={`gaixia-relief-edge-face gaixia-relief-edge-face-${index % 2 === 0 ? "lit" : "shade"}`} d={wallPath} />
      ))}
      <path className="gaixia-relief-back-wall" d={reliefBackWallPath(basePoints, raisedPoints)} />
      <path className="gaixia-relief-wall" d={reliefSideWallPath(basePoints, raisedPoints)} />
      <path className="gaixia-relief-underside" d={`${buildPath(basePoints)} Z`} />
      <path className="gaixia-relief-top" d={`${buildPath(raisedPoints)} Z`} />
      <path className="gaixia-relief-shade" d={`${buildPath(raisedPoints)} Z`} />
      {ridgeLines.map((line, index) => (
        <path key={`${surface.id}-facet-${index}`} className="gaixia-relief-facet" d={buildPath(line)} />
      ))}
      <path className="gaixia-relief-rim" d={`${buildPath(raisedPoints)} Z`} />
      <text x={labelPoint[0]} y={labelPoint[1] - 12}>
        {surface.label} {surface.elevation}m
      </text>
    </g>
  );
}

function TacticalGraphic({ graphic, projection }: { graphic: GaixiaTacticalGraphic; projection: ReturnType<typeof createCampaignProjection> }) {
  const points = projectLine(projection, graphic.points);
  const labelPoint = projectTacticalPoint(projection, graphic.labelCoordinates);
  const isArea = graphic.kind === "engagement-area";
  return (
    <g className={`gaixia-tactical-graphic gaixia-tactical-graphic-${graphic.kind}`} data-testid={`gaixia-tactical-graphic-${graphic.id}`}>
      <path d={`${buildPath(points)}${isArea ? " Z" : ""}`} />
      {graphic.kind === "key-terrain" && points.map((point, index) => <circle key={`${graphic.id}-${index}`} cx={point[0]} cy={point[1]} r="4.5" />)}
      <text x={labelPoint[0]} y={labelPoint[1] - 10}>
        {graphic.label}
      </text>
    </g>
  );
}

function Fieldwork({ fieldwork, projection }: { fieldwork: GaixiaFieldwork; projection: ReturnType<typeof createCampaignProjection> }) {
  const points = projectLine(projection, fieldwork.coordinates);
  const labelPoint = projectTacticalPoint(projection, fieldwork.labelCoordinates);
  const isClosed = fieldwork.kind === "earthwork";
  const cornerPoints = isClosed ? points.filter((_, index) => index % 2 === 0) : [];
  const midpoints = points.slice(0, -1).map((point, index) => midpoint(point, points[index + 1]));
  return (
    <g className={`gaixia-fieldwork gaixia-fieldwork-${fieldwork.kind}`} data-testid={`gaixia-fieldwork-${fieldwork.id}`}>
      <path className="gaixia-fieldwork-shadow" d={`${buildPath(points)}${isClosed ? " Z" : ""}`} />
      {fieldwork.kind === "earthwork" && <path className="gaixia-fieldwork-wall-face" d={`${buildPath(points.map(([x, y]) => [x + 10, y + 13] as [number, number]))} Z`} />}
      <path className="gaixia-fieldwork-body" d={`${buildPath(points)}${isClosed ? " Z" : ""}`} />
      {fieldwork.kind === "earthwork" &&
        cornerPoints.map((point, index) => (
          <g key={`${fieldwork.id}-tower-${index}`} className="gaixia-fieldwork-icon gaixia-fieldwork-tower" transform={`translate(${point[0]} ${point[1]})`}>
            <path d="M -9 8 L 0 -7 L 9 8 Z" />
            <rect x="-6" y="3" width="12" height="9" />
          </g>
        ))}
      {fieldwork.kind === "ditch" &&
        midpoints.map((point, index) => (
          <path key={`${fieldwork.id}-trench-${index}`} className="gaixia-fieldwork-trench-rib" d={`M ${point[0] - 8} ${point[1] + 6} L ${point[0] + 8} ${point[1] - 6}`} />
        ))}
      {fieldwork.kind === "gate" && (
        <>
          {points.map((point, index) => (
            <g key={`${fieldwork.id}-post-${index}`} className="gaixia-fieldwork-icon gaixia-gate-post" transform={`translate(${point[0]} ${point[1]})`}>
              <rect x="-5" y="-13" width="10" height="22" />
              <path d="M -7 -13 L 0 -20 L 7 -13 Z" />
              <path d="M -5 9 L 5 9 L 9 15 L -1 15 Z" />
            </g>
          ))}
        </>
      )}
      {fieldwork.kind === "camp-line" &&
        midpoints.map((point, index) => (
          <g key={`${fieldwork.id}-tent-${index}`} className="gaixia-fieldwork-icon gaixia-camp-tent" transform={`translate(${point[0]} ${point[1]})`}>
            <path d="M -10 9 L 0 -10 L 10 9 Z" />
            <path d="M 0 -10 L 0 9" />
          </g>
        ))}
      <text x={labelPoint[0]} y={labelPoint[1] - 10}>
        {fieldwork.label}
      </text>
    </g>
  );
}

function Formation({ formation, projection }: { formation: GaixiaFormation; projection: ReturnType<typeof createCampaignProjection> }) {
  const points = projectLine(projection, formation.coordinates);
  const labelPoint = projectTacticalPoint(projection, formation.labelCoordinates);
  const isArea = formation.kind === "infantry-block" || formation.kind === "command-post";
  const iconPoints = isArea ? points : points.slice(0, -1).map((point, index) => midpoint(point, points[index + 1]));
  const frontPoints = formation.kind === "infantry-block" ? points.slice(0, 2) : points;
  const formationDepth =
    formation.kind === "infantry-block"
      ? formation.faction === "chu"
        ? { columns: 7, rows: 6, spacing: 11 }
        : { columns: 6, rows: 4, spacing: 10 }
      : formation.kind === "crossbow-line"
        ? { columns: 12, rows: 2, spacing: 12 }
        : formation.kind === "cavalry-screen"
          ? { columns: 8, rows: 2, spacing: 16 }
          : formation.kind === "ambush-line"
            ? { columns: 9, rows: 2, spacing: 15 }
            : { columns: 4, rows: 2, spacing: 10 };
  const rankPoints =
    formation.kind === "infantry-block"
      ? formationDepthRows(frontPoints, formationDepth.rows, formationDepth.columns, formationDepth.spacing)
      : formation.kind === "crossbow-line"
        ? formationDepthRows(points, formationDepth.rows, formationDepth.columns, formationDepth.spacing)
        : formation.kind === "cavalry-screen"
          ? formationArcPoints(points, 8, 28)
          : formation.kind === "ambush-line"
            ? formationArcPoints(points, 9, 24)
            : formationGridPoints(points, 2, 4);
  const rankGuides =
    formation.kind === "infantry-block"
      ? formationRankGuides(frontPoints, formationDepth.rows, formationDepth.spacing)
      : formation.kind === "crossbow-line"
        ? formationRankGuides(points, 2, 12)
        : [];
  return (
    <g
      className={`gaixia-formation gaixia-formation-${formation.faction} gaixia-formation-${formation.kind}`}
      data-formation-kind={formation.kind}
      data-testid={`gaixia-formation-${formation.id}`}
    >
      <path className="gaixia-formation-shadow" d={`${buildPath(points)}${isArea ? " Z" : ""}`} />
      {isArea && <path className="gaixia-formation-wall-face" d={`${buildPath(points.map(([x, y]) => [x + 11, y + 12] as [number, number]))} Z`} />}
      <path className="gaixia-formation-body" d={`${buildPath(points)}${isArea ? " Z" : ""}`} />
      <path className="gaixia-formation-front-line" d={buildPath(frontPoints)} />
      {rankGuides.map((guide, index) => (
        <path key={`${formation.id}-guide-${index}`} className="gaixia-formation-rank-guide" d={buildPath(guide)} />
      ))}
      <g className="gaixia-formation-ranks" data-testid={`gaixia-formation-ranks-${formation.id}`}>
        {rankPoints.map((point, index) => (
          <circle
            key={`${formation.id}-rank-${index}`}
            className={`gaixia-formation-rank-dot gaixia-formation-rank-dot-${formation.kind}`}
            cx={point[0]}
            cy={point[1]}
            r={formation.kind === "infantry-block" ? 2.8 : formation.kind === "crossbow-line" ? 2.4 : 3}
          />
        ))}
      </g>
      {formation.kind === "infantry-block" && (
        <g className="gaixia-formation-icon gaixia-formation-front-standard" transform={`translate(${frontPoints[0][0]} ${frontPoints[0][1] - 12})`}>
          <path d="M 0 -18 L 0 16" />
          <path d="M 0 -18 L 15 -12 L 0 -6 Z" />
        </g>
      )}
      {formation.kind === "crossbow-line" &&
        points.map((point, index) => (
          <g key={`${formation.id}-crossbow-${index}`} className="gaixia-formation-icon gaixia-formation-crossbow-icon" transform={`translate(${point[0]} ${point[1]})`}>
            <path className="gaixia-formation-chevron" d="M -11 5 L 0 -7 L 11 5" />
            <path d="M -12 2 L 12 2 M 0 -8 L 0 10 M -6 8 L 6 8" />
          </g>
        ))}
      {formation.kind === "cavalry-screen" &&
        points.map((point, index) => (
          <g key={`${formation.id}-screen-${index}`} className="gaixia-formation-icon gaixia-formation-cavalry-icon" transform={`translate(${point[0]} ${point[1]})`}>
            <path d="M -12 7 L 7 -10 L 14 1 L 1 11 Z" />
            <circle cx="-3" cy="4" r="3" />
          </g>
        ))}
      {formation.kind === "ambush-line" &&
        iconPoints.map((point, index) => (
          <g key={`${formation.id}-ambush-${index}`} className="gaixia-formation-icon gaixia-formation-ambush-icon" transform={`translate(${point[0]} ${point[1]})`}>
            <path d="M -13 8 L 0 -11 L 13 8 Z" />
            <path d="M -7 5 L 0 -3 L 7 5" />
          </g>
        ))}
      {formation.kind === "infantry-block" &&
        iconPoints.map((point, index) => (
          <g key={`${formation.id}-shield-${index}`} className="gaixia-formation-icon gaixia-formation-shield-icon" transform={`translate(${point[0]} ${point[1]})`}>
            <path d="M -7 -9 L 7 -9 L 8 1 Q 0 12 -8 1 Z" />
            <path d="M -4 -2 L 4 -2" />
          </g>
        ))}
      {formation.kind === "command-post" && (
        <g className="gaixia-formation-icon gaixia-formation-command-icon" transform={`translate(${labelPoint[0]} ${labelPoint[1]})`}>
          <path d="M 0 -18 L 0 12" />
          <path d="M 0 -18 L 18 -10 L 0 -2 Z" />
          <circle cx="0" cy="14" r="5" />
        </g>
      )}
      <text x={labelPoint[0]} y={labelPoint[1] - 12}>
        {formation.label}
      </text>
    </g>
  );
}

function ActiveEffect({ event, placement }: { event: GaixiaEvent; placement: ActiveEffectPlacement }) {
  const point = placement.point;
  if (event.cue === "song") {
    return (
      <g
        className="gaixia-song-effect"
        data-effect-source={placement.source}
        data-testid="gaixia-song-effect"
        transform={`translate(${point[0]} ${point[1]})`}
      >
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
    <g
      className="gaixia-melee-effect"
      data-chu-route={placement.chuRouteId ?? ""}
      data-effect-source={placement.source}
      data-han-route={placement.hanRouteId ?? ""}
      data-testid="gaixia-melee-effect"
      transform={`translate(${point[0]} ${point[1]})`}
    >
      {placement.hanPoint && placement.chuPoint && (
        <path className="gaixia-contact-tether" d={buildPath([placement.hanPoint, point, placement.chuPoint])} />
      )}
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
  const activePoint = projectTacticalPoint(projection, activeEvent.coordinates);
  const activeMapView = useMemo(() => mapViewForEvent(activeEvent, activePoint), [activeEvent.id, activePoint[0], activePoint[1]]);
  const projectedRoutes = useMemo<ProjectedGaixiaRoute[]>(
    () =>
      routes.map((route) => {
        const projected = projectLine(projection, route.points);
        const routeProgress = lineProgress(route.start, route.end, progress);
        const routeEndProgress = timeline.dateToProgress(route.end);
        const isComplete = progress >= routeEndProgress;
        const isVisible = routeShouldRender(route, progress, activeRouteIds);
        const visiblePoints = linePointsUntil(projected, isComplete ? 1 : routeProgress);
        const markerPoint = interpolateRoute(projected, routeProgress);
        const facingX = routeFacing(projected, routeProgress);
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
          projected,
          route,
          routeProgress,
          showUnits,
          visiblePoints
        };
      }),
    [activeRouteIds, progress, projection]
  );
  const activeEffectPlacement = useMemo(
    () => activeEffectPlacementForEvent(activeEvent, projectedRoutes, activePoint),
    [activeEvent, activePoint, projectedRoutes]
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

          <svg
            ref={svgRef}
            className={`battle-map gaixia-map is-interactive-map ${isMapDragging ? "is-dragging" : ""}`}
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            preserveAspectRatio="xMidYMid slice"
            role="img"
            aria-label="韩信十面埋伏垓下之战地形态势图"
            {...mapInteractionProps}
          >
            <defs>
              <pattern id="gaixiaSandTexture" patternUnits="userSpaceOnUse" width="86" height="86">
                <rect width="86" height="86" fill="#dfc895" />
                <circle cx="12" cy="18" r="1.7" fill="#c9a979" opacity="0.36" />
                <circle cx="47" cy="11" r="1.1" fill="#f1ddb0" opacity="0.58" />
                <circle cx="72" cy="38" r="1.4" fill="#b99564" opacity="0.28" />
                <path d="M 6 66 C 26 58 48 62 78 50" fill="none" stroke="#c6a776" strokeWidth="1.1" opacity="0.22" />
                <path d="M 0 32 C 24 26 46 32 86 20" fill="none" stroke="#f2ddb0" strokeWidth="1.2" opacity="0.24" />
              </pattern>
              <pattern id="gaixiaGrassTexture" patternUnits="userSpaceOnUse" width="72" height="72">
                <rect width="72" height="72" fill="#8cae57" />
                <path d="M 8 16 L 17 6 M 31 28 L 42 16 M 54 61 L 66 47 M 4 58 L 15 45" stroke="#5f863a" strokeWidth="2" opacity="0.36" />
                <path d="M 12 42 C 26 36 41 39 63 30" fill="none" stroke="#b6cb73" strokeWidth="2.2" opacity="0.34" />
                <circle cx="52" cy="13" r="2.4" fill="#c9d990" opacity="0.26" />
              </pattern>
              <pattern id="gaixiaMarshTexture" patternUnits="userSpaceOnUse" width="78" height="78">
                <rect width="78" height="78" fill="#9bbd91" />
                <path d="M 6 18 C 24 10 42 18 62 8 M 10 48 C 32 42 48 51 72 40" fill="none" stroke="#5b9aa1" strokeWidth="3" opacity="0.28" />
                <path d="M 17 68 L 24 53 M 39 28 L 47 13 M 58 66 L 66 51" stroke="#4e7d4a" strokeWidth="2.2" opacity="0.32" />
              </pattern>
              <pattern id="gaixiaApproachTexture" patternUnits="userSpaceOnUse" width="84" height="84">
                <rect width="84" height="84" fill="#c5c286" />
                <path d="M -4 44 C 20 32 42 32 88 22" fill="none" stroke="#ece0a4" strokeWidth="5" opacity="0.34" />
                <path d="M 8 55 C 30 45 50 45 76 34" fill="none" stroke="#8f9b58" strokeWidth="2.2" strokeDasharray="8 9" opacity="0.3" />
              </pattern>
              <pattern id="gaixiaCampTexture" patternUnits="userSpaceOnUse" width="64" height="64">
                <rect width="64" height="64" fill="#c89468" />
                <path d="M 2 18 H 62 M 12 42 H 56" stroke="#a8704d" strokeWidth="2" opacity="0.32" />
                <path d="M 22 6 L 28 20 M 46 31 L 52 48" stroke="#e0b185" strokeWidth="2" opacity="0.38" />
              </pattern>
              <filter id="gaixiaTerrainShadow" x="-15%" y="-15%" width="130%" height="130%">
                <feDropShadow dx="-22" dy="30" stdDeviation="12" floodColor="#06110f" floodOpacity="0.52" />
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
            <g className="camera-layer gaixia-camera-layer" data-testid="camera-layer" data-projection="elevated-isometric" transform={mapTransform}>
              <SandboxDeck />
              <g className="gaixia-terrain-base" data-testid="gaixia-terrain-layer">
                <TerrainMaterialLayer projection={projection} />
                <g className="gaixia-relief-layer" data-testid="gaixia-relief-terrain-layer">
                  {terrainReliefSurfaces.map((surface) => (
                    <ReliefSurface key={surface.id} projection={projection} surface={surface} />
                  ))}
                </g>
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

              <g className="gaixia-tactical-graphics" data-testid="gaixia-tactical-graphics-layer">
                {tacticalGraphics
                  .filter((graphic) => isTacticalGraphicVisible(graphic, progress))
                  .map((graphic) => (
                    <TacticalGraphic key={graphic.id} graphic={graphic} projection={projection} />
                  ))}
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
                  const points = projectLineAtElevation(projection, river.points, 28.5);
                  const labelPoint = points[Math.floor(points.length / 2)] ?? points[0];
                  return (
                    <g key={river.id} className="gaixia-river">
                      <path className="gaixia-river-bank" d={buildPath(points)} />
                      <path className="gaixia-river-water" d={buildPath(points)} />
                      <path className="gaixia-river-highlight" d={buildPath(points)} />
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

              <g className="gaixia-fieldworks" data-testid="gaixia-fieldwork-layer">
                {fieldworks
                  .filter((fieldwork) => isFieldworkVisible(fieldwork, progress))
                  .map((fieldwork) => (
                    <Fieldwork key={fieldwork.id} fieldwork={fieldwork} projection={projection} />
                  ))}
              </g>

              <g className="gaixia-formations" data-testid="gaixia-formation-layer">
                {formations
                  .filter((formation) => isFormationVisible(formation, progress))
                  .map((formation) => (
                    <Formation key={formation.id} formation={formation} projection={projection} />
                  ))}
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
                {projectedRoutes.map((state) => {
                  const { active, facingX, isComplete, isVisible, labelPoint, markerPoint, route, routeProgress, showUnits, visiblePoints } = state;
                  if (!isVisible) {
                    return null;
                  }
                  const labelOffset = route.labelOffset ?? [10, -12];
                  return (
                    <g
                      key={route.id}
                      className={`gaixia-route gaixia-route-${route.faction} gaixia-route-${route.routeKind} ${active ? "is-active" : isComplete ? "is-complete" : "is-forming"}`}
                      data-route-complete={isComplete ? "true" : "false"}
                      data-route-id={route.id}
                      data-route-kind={route.routeKind}
                      data-route-current={activeRouteIds.has(route.id) ? "true" : "false"}
                      data-unit-visible={showUnits ? "true" : "false"}
                      data-ground-elevation={reliefElevationAtPoint(route.points[Math.min(route.points.length - 1, Math.max(0, Math.round(routeProgress * (route.points.length - 1))))]).toFixed(0)}
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
                            data-ground-elevation={reliefElevationAtPoint(interpolateRoute(route.points, routeProgress)).toFixed(0)}
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
                      {isCurrent && <ActiveEffect event={event} placement={activeEffectPlacement} />}
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
