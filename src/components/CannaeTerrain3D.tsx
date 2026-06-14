import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  battleEvents,
  contactScrums,
  formations,
  historicalRegions,
  mapPoints,
  rivers,
  tacticalGraphics,
  terrainFeatures,
  type CannaeEvent,
  type CannaeContactScrum,
  type CannaeFormation,
  type CannaeRoute,
  type CannaeTacticalGraphic,
  type CannaeTerrainFeature,
  type CannaeUnitTrack,
  type CannaeUnitKind
} from "../data/cannaeBattle";
import { publicPath } from "../lib/publicPath";
import type { MapView } from "../lib/useMapInteraction";

const cannaeTerrainCanvasTestId = "cannae-terrain-3d-canvas";

type TacticalPoint = [number, number];

export type CannaeTerrainRouteState = {
  active: boolean;
  facingX: 1 | -1;
  isComplete: boolean;
  isVisible: boolean;
  labelPoint: TacticalPoint;
  markerPoint: TacticalPoint;
  route: CannaeRoute;
  routeProgress: number;
  showUnits: boolean;
  visiblePoints: TacticalPoint[];
};

export type CannaeTerrainEffectPlacement = {
  contacts?: Array<{
    carthaginianPoint: TacticalPoint;
    carthaginianRouteId: string;
    point: TacticalPoint;
    romanPoint: TacticalPoint;
    romanRouteId: string;
  }>;
  point: TacticalPoint;
  source: "event" | "event-contact" | "route-contact" | "route-unit";
};

type CannaeTerrain3DProps = {
  activeEffectPlacement: CannaeTerrainEffectPlacement | null;
  activeEvent: CannaeEvent;
  activeRouteIds: Set<string>;
  cameraBearing: number;
  cameraScale: number;
  dateToProgress: (date: string) => number;
  focusCoordinates: TacticalPoint;
  focusRoutePoints: TacticalPoint[];
  isPlaying: boolean;
  mapBaseView: MapView;
  mapView: MapView;
  progress: number;
  projectedRoutes: CannaeTerrainRouteState[];
};

type ProjectedOverlayRouteState = Omit<CannaeTerrainRouteState, "labelPoint" | "markerPoint" | "visiblePoints"> & {
  formationPreludePoints: TacticalPoint[];
  labelPoint: TacticalPoint | null;
  markerPoint: TacticalPoint | null;
  unitMotion: "march" | "pressure" | "static";
  unitTrackPlacements?: CannaeProjectedUnitPlacement[];
  visiblePoints: TacticalPoint[];
};

type CannaeProjectedUnitPlacement = {
  facingX: 1 | -1;
  point: TacticalPoint;
  routeId: string;
  routeProgress: number;
};

type OverlayGeometry = {
  activeEffectPlacement: CannaeTerrainEffectPlacement | null;
  contactScrums: Array<CannaeContactScrum & { points: TacticalPoint[]; visibleRatio: number }>;
  eventPins: Array<{ id: string; isCurrent: boolean; passed: boolean; point: TacticalPoint | null; title: string }>;
  formations: Array<CannaeFormation & { labelPoint: TacticalPoint | null; points: TacticalPoint[]; rankGuides: TacticalPoint[][]; rankPoints: TacticalPoint[] }>;
  historicalRegions: Array<{ id: string; kind: string; label: string; labelPoint: TacticalPoint | null; points: TacticalPoint[] }>;
  mapPoints: Array<{ id: string; kind: string; label: string; point: TacticalPoint | null; revealAt?: string }>;
  rivers: Array<{ id: string; label: string; labelPoint: TacticalPoint | null; points: TacticalPoint[] }>;
  routes: ProjectedOverlayRouteState[];
  tacticalGraphics: Array<CannaeTacticalGraphic & { labelPoint: TacticalPoint | null; points: TacticalPoint[]; segments: TacticalPoint[][] }>;
  terrainFeatures: Array<CannaeTerrainFeature & { labelPoint: TacticalPoint | null; points: TacticalPoint[] }>;
};

const cannaeBounds: [[number, number], [number, number]] = [
  [16.048, 41.256],
  [16.25, 41.331]
];
const cannaeSourceBounds: [number, number, number, number] = [16.048, 41.256, 16.25, 41.331];
const terrainTileUrl = "/assets/maps/cannae-real-terrain/terrarium/{z}/{x}-{y}.png";
const cachedTerrainTileZoom = 14;
const minCachedTileZoom = 10;
const terrainExaggeration = 1;
const hillshadeExaggeration = 0.08;
const cameraTransitionDurationMs = 1050;
const tacticalCameraPitch = 60;

function closedCoordinates(points: TacticalPoint[]) {
  if (points.length === 0) {
    return points;
  }
  const first = points[0];
  const last = points[points.length - 1];
  return first[0] === last[0] && first[1] === last[1] ? points : [...points, first];
}

function featureCollection(features: GeoJSON.Feature<GeoJSON.Geometry>[]) {
  return {
    type: "FeatureCollection",
    features
  } satisfies GeoJSON.FeatureCollection;
}

function polygonFeature(id: string, points: TacticalPoint[], properties: Record<string, string | number> = {}) {
  return {
    type: "Feature",
    id,
    properties: { id, ...properties },
    geometry: {
      type: "Polygon",
      coordinates: [closedCoordinates(points)]
    }
  } satisfies GeoJSON.Feature<GeoJSON.Polygon>;
}

function lineFeature(id: string, points: TacticalPoint[], properties: Record<string, string | number> = {}) {
  return {
    type: "Feature",
    id,
    properties: { id, ...properties },
    geometry: {
      type: "LineString",
      coordinates: points
    }
  } satisfies GeoJSON.Feature<GeoJSON.LineString>;
}

const cannaeHistoricalTerrainData = featureCollection([
  polygonFeature("cannae-historical-base", [
    [cannaeSourceBounds[0], cannaeSourceBounds[1]],
    [cannaeSourceBounds[2], cannaeSourceBounds[1]],
    [cannaeSourceBounds[2], cannaeSourceBounds[3]],
    [cannaeSourceBounds[0], cannaeSourceBounds[3]]
  ], { kind: "base" }),
  ...historicalRegions.map((region) => polygonFeature(`region-${region.id}`, region.coordinates, { kind: region.kind })),
  ...terrainFeatures
    .filter((feature) => feature.coordinates.length >= 3)
    .map((feature) => polygonFeature(`terrain-${feature.id}`, feature.coordinates, { kind: feature.kind }))
]);
const cannaeHistoricalWaterData = featureCollection(rivers.map((river) => lineFeature(river.id, river.points)));

const cannaeTerrainStyle: StyleSpecification = {
  version: 8,
  sources: {
    "cannae-historical-terrain": {
      type: "geojson",
      data: cannaeHistoricalTerrainData
    },
    "cannae-historical-water": {
      type: "geojson",
      data: cannaeHistoricalWaterData
    },
    "cannae-real-dem": {
      type: "raster-dem",
      tiles: [terrainTileUrl],
      bounds: cannaeSourceBounds,
      encoding: "terrarium",
      tileSize: 256,
      minzoom: minCachedTileZoom,
      maxzoom: cachedTerrainTileZoom,
      attribution: "Elevation: AWS Terrain Tiles, SRTM/GMTED"
    },
    "cannae-hillshade-dem": {
      type: "raster-dem",
      tiles: [terrainTileUrl],
      bounds: cannaeSourceBounds,
      encoding: "terrarium",
      tileSize: 256,
      minzoom: minCachedTileZoom,
      maxzoom: cachedTerrainTileZoom,
      attribution: "Elevation: AWS Terrain Tiles, SRTM/GMTED"
    }
  },
  layers: [
    {
      id: "cannae-paper",
      type: "background",
      paint: {
        "background-color": "#d9c68d"
      }
    },
    {
      id: "cannae-ground",
      type: "fill",
      source: "cannae-historical-terrain",
      filter: ["==", ["get", "kind"], "base"],
      paint: {
        "fill-color": "#d6c389",
        "fill-opacity": 1
      }
    },
    {
      id: "cannae-river-corridor",
      type: "fill",
      source: "cannae-historical-terrain",
      filter: ["==", ["get", "kind"], "river-corridor"],
      paint: {
        "fill-color": "#a5c0a7",
        "fill-opacity": 0.42
      }
    },
    {
      id: "cannae-fields",
      type: "fill",
      source: "cannae-historical-terrain",
      filter: ["in", ["get", "kind"], ["literal", ["roman-field", "carthaginian-field", "dust-flat", "plain-rise", "compression-basin"]]],
      paint: {
        "fill-color": [
          "match",
          ["get", "kind"],
          "roman-field",
          "#c7a56e",
          "carthaginian-field",
          "#bfa86c",
          "compression-basin",
          "#c29968",
          "plain-rise",
          "#cdb070",
          "#cbb274"
        ],
        "fill-opacity": 0.5
      }
    },
    {
      id: "cannae-killing-ground",
      type: "fill",
      source: "cannae-historical-terrain",
      filter: ["==", ["get", "kind"], "killing-ground"],
      paint: {
        "fill-color": "#bd7a57",
        "fill-opacity": 0.24
      }
    },
    {
      id: "cannae-region-lines",
      type: "line",
      source: "cannae-historical-terrain",
      filter: ["!=", ["get", "kind"], "base"],
      paint: {
        "line-color": "#7a5c35",
        "line-dasharray": [4, 3],
        "line-opacity": 0.52,
        "line-width": 2
      }
    },
    {
      id: "cannae-water-bank",
      type: "line",
      source: "cannae-historical-water",
      paint: {
        "line-color": "#6b9d93",
        "line-opacity": 0.52,
        "line-width": 15
      }
    },
    {
      id: "cannae-water",
      type: "line",
      source: "cannae-historical-water",
      paint: {
        "line-color": "#278ea0",
        "line-opacity": 0.86,
        "line-width": 6
      }
    },
    {
      id: "cannae-dem-hillshade",
      type: "hillshade",
      source: "cannae-hillshade-dem",
      paint: {
        "hillshade-accent-color": "#7a7350",
        "hillshade-exaggeration": hillshadeExaggeration,
        "hillshade-highlight-color": "#fff0c3",
        "hillshade-shadow-color": "#5a563d"
      }
    }
  ],
  terrain: {
    source: "cannae-real-dem",
    exaggeration: terrainExaggeration
  }
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function buildPath(points: TacticalPoint[]) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point[0].toFixed(1)} ${point[1].toFixed(1)}`).join(" ");
}

function midpoint(a: TacticalPoint, b: TacticalPoint) {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as TacticalPoint;
}

function routeLength(points: TacticalPoint[]) {
  return points.slice(0, -1).reduce((sum, point, index) => sum + Math.hypot(points[index + 1][0] - point[0], points[index + 1][1] - point[1]), 0);
}

function pointAtRatio(points: TacticalPoint[], ratio: number) {
  if (points.length < 2) {
    return points[0] ?? [0, 0];
  }
  const segmentLengths = points.slice(0, -1).map((point, index) => Math.hypot(points[index + 1][0] - point[0], points[index + 1][1] - point[1]));
  const totalLength = Math.max(0.001, segmentLengths.reduce((sum, length) => sum + length, 0));
  let remaining = totalLength * clamp(ratio);

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const length = segmentLengths[index];
    if (remaining <= length || index === segmentLengths.length - 1) {
      const localRatio = length === 0 ? 0 : remaining / length;
      return [
        points[index][0] + (points[index + 1][0] - points[index][0]) * localRatio,
        points[index][1] + (points[index + 1][1] - points[index][1]) * localRatio
      ] as TacticalPoint;
    }
    remaining -= length;
  }

  return points.at(-1)!;
}

function normalAtRatio(points: TacticalPoint[], ratio: number) {
  const previous = pointAtRatio(points, Math.max(0, ratio - 0.02));
  const next = pointAtRatio(points, Math.min(1, ratio + 0.02));
  const dx = next[0] - previous[0];
  const dy = next[1] - previous[1];
  const length = Math.hypot(dx, dy) || 1;
  return [-dy / length, dx / length] as TacticalPoint;
}

function routeFacingX(points: TacticalPoint[], routeProgress: number): 1 | -1 {
  const previous = pointAtRatio(points, Math.max(0, routeProgress - 0.018));
  const next = pointAtRatio(points, Math.min(1, routeProgress + 0.018));
  return next[0] - previous[0] < -0.01 ? -1 : 1;
}

function routeDirectionVector(points: TacticalPoint[], routeProgress: number) {
  const previous = pointAtRatio(points, Math.max(0, routeProgress - 0.018));
  const current = pointAtRatio(points, routeProgress);
  const next = pointAtRatio(points, Math.min(1, routeProgress + 0.018));
  const dx = current[0] - previous[0] || next[0] - previous[0] || 1;
  const dy = current[1] - previous[1] || next[1] - previous[1] || 0;
  const length = Math.hypot(dx, dy) || 1;
  return { x: dx / length, y: dy / length };
}

function routeLocalOffset(point: TacticalPoint, direction: { x: number; y: number }, offset: TacticalPoint) {
  const [along, cross] = offset;
  return [point[0] + direction.x * along - direction.y * cross, point[1] + direction.y * along + direction.x * cross] as TacticalPoint;
}

function formationUnitPlacement(points: TacticalPoint[], progress: number, offset: TacticalPoint, offsetScale = 1) {
  const totalLength = Math.max(routeLength(points), 1);
  const [along, cross] = offset;
  const rawProgress = progress + (along * offsetScale) / totalLength;
  const unitProgress = clamp(rawProgress);
  const pointOnRoute = pointAtRatio(points, unitProgress);
  const direction = routeDirectionVector(points, unitProgress);
  const clampedAlongOverflow = rawProgress < 0 ? rawProgress * totalLength : rawProgress > 1 ? (rawProgress - 1) * totalLength : 0;
  return {
    facingX: routeFacingX(points, unitProgress),
    point: routeLocalOffset(pointOnRoute, direction, [clampedAlongOverflow, cross * offsetScale]),
    routeId: "",
    routeProgress: unitProgress
  };
}

function easeInOut(value: number) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function trackPoint(track: CannaeUnitTrack, progress: number) {
  const startDelay = track.startDelay ?? 0;
  const endDelay = track.endDelay ?? 0;
  const localProgress = easeInOut((progress - startDelay) / Math.max(0.001, 1 - startDelay - endDelay));
  const control = track.control;
  if (control) {
    const a: TacticalPoint = [
      track.from[0] + (control[0] - track.from[0]) * localProgress,
      track.from[1] + (control[1] - track.from[1]) * localProgress
    ];
    const b: TacticalPoint = [
      control[0] + (track.to[0] - control[0]) * localProgress,
      control[1] + (track.to[1] - control[1]) * localProgress
    ];
    return [a[0] + (b[0] - a[0]) * localProgress, a[1] + (b[1] - a[1]) * localProgress] as TacticalPoint;
  }
  return [
    track.from[0] + (track.to[0] - track.from[0]) * localProgress,
    track.from[1] + (track.to[1] - track.from[1]) * localProgress
  ] as TacticalPoint;
}

function trackRouteFacingX(map: maplibregl.Map, track: CannaeUnitTrack, routeProgress: number): 1 | -1 {
  const previous = projectPoint(map, trackPoint(track, Math.max(0, routeProgress - 0.024)));
  const next = projectPoint(map, trackPoint(track, Math.min(1, routeProgress + 0.024)));
  if (previous && next && Math.abs(next[0] - previous[0]) > 2) {
    return next[0] < previous[0] ? -1 : 1;
  }
  return track.facingX ?? (track.to[0] - track.from[0] < -0.001 ? -1 : 1);
}

function nearestEnemyFacingX(
  placement: CannaeProjectedUnitPlacement,
  route: CannaeRoute,
  candidateRoutes: Array<{ route: CannaeRoute; unitTrackPlacements?: CannaeProjectedUnitPlacement[] }>
): 1 | -1 {
  if (route.routeKind === "deploy" || route.unitKind.includes("command")) {
    return placement.facingX;
  }

  let nearest: { distance: number; point: TacticalPoint } | null = null;

  for (const candidateRoute of candidateRoutes) {
    if (candidateRoute.route.faction === route.faction) {
      continue;
    }
    for (const candidate of candidateRoute.unitTrackPlacements ?? []) {
      const dx = candidate.point[0] - placement.point[0];
      const dy = candidate.point[1] - placement.point[1];
      const candidateDistance = Math.hypot(dx, dy);
      if (!nearest || candidateDistance < nearest.distance) {
        nearest = { distance: candidateDistance, point: candidate.point };
      }
    }
  }

  if (nearest && nearest.distance < 210 && Math.abs(nearest.point[0] - placement.point[0]) > 2.6) {
    return nearest.point[0] < placement.point[0] ? -1 : 1;
  }
  return placement.facingX;
}

function routeTrackPlacements(map: maplibregl.Map, state: CannaeTerrainRouteState, progress: number): CannaeProjectedUnitPlacement[] | undefined {
  if (state.route.unitTracks) {
    return state.route.unitTracks
      .map((track) => {
      const trackIndex = Number(track.id.match(/\d+$/)?.[0] ?? 0);
      const point = projectPoint(map, trackPoint(track, state.routeProgress));
      const kineticPoint = point ? kineticPressurePoint(point, state.route, trackIndex, progress, state.routeProgress) : null;
      return point
        ? {
            facingX: trackRouteFacingX(map, track, state.routeProgress),
            point: kineticPoint ?? point,
            routeId: state.route.id,
            routeProgress: state.routeProgress
        }
        : null;
      })
      .filter((placement): placement is CannaeProjectedUnitPlacement => Boolean(placement));
  }

  const projectedPrelude = projectLine(map, state.route.formationPrelude ?? []);
  const projectedVisiblePoints = projectLine(map, state.visiblePoints);
  const formationRoutePoints = projectedPrelude.length > 0 ? [...projectedPrelude, ...projectedVisiblePoints] : projectedVisiblePoints;
  if (formationRoutePoints.length < 2) {
    return undefined;
  }

  return routeUnitOffsets(state.route).map((offset, index, offsets) => {
    const [along, cross] = offset;
    const routeSpread = routeSpreadForKind(state.route);
    const unitProgress = clamp(1 - (index / Math.max(1, offsets.length - 1)) * routeSpread);
    const placement = formationUnitPlacement(formationRoutePoints, unitProgress, [along * 0.34, cross], routeOffsetScaleForKind(state.route));
    return {
      ...placement,
      routeId: state.route.id
    };
  });
}

function routeVisualLodModulo(route: CannaeRoute, routeProgress: number, globalProgress: number) {
  const isLateResult = globalProgress >= 0.9;
  const isOpening = globalProgress < 0.35;
  if (route.unitKind.includes("command")) {
    return 1;
  }
  if (isOpening && route.routeKind === "deploy" && !route.unitKind.includes("cavalry")) {
    return route.faction === "roman" ? 2 : 3;
  }
  if (isOpening && route.unitKind.includes("cavalry")) {
    return 3;
  }
  if (route.id === "carthaginian-center-forward" && globalProgress >= 0.34) {
    return 2;
  }
  if ((route.id === "african-left-hold" || route.id === "african-right-hold") && globalProgress >= 0.34) {
    return 3;
  }
  if (route.routeKind === "cavalry" && globalProgress >= 0.34) {
    return 3;
  }
  if (route.routeKind === "advance" && globalProgress < 0.45) {
    return route.faction === "roman" ? 3 : 2;
  }
  if (route.routeKind === "advance" && globalProgress >= 0.35) {
    return route.faction === "roman" ? 3 : 2;
  }
  if (route.routeKind === "yield" && globalProgress >= 0.35) {
    return 3;
  }
  if (route.routeKind === "collapse") {
    return isLateResult ? 2 : 1;
  }
  if (route.routeKind === "compression") {
    if (route.faction === "roman") {
      return globalProgress >= 0.45 ? 3 : routeProgress > 0.82 ? 2 : 1;
    }
    return isLateResult ? 2 : globalProgress >= 0.45 ? 2 : routeProgress > 0.72 ? 2 : 1;
  }
  if (route.routeKind === "wing-turn") {
    return routeProgress > 0.5 || globalProgress >= 0.5 || isLateResult ? 3 : 2;
  }
  if (route.routeKind === "rear-seal") {
    return isLateResult ? 2 : 1;
  }
  return 1;
}

function routeVisualLodPhase(route: CannaeRoute) {
  return route.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function applyRouteVisualLod(route: CannaeRoute, placements: CannaeProjectedUnitPlacement[] | undefined, routeProgress: number, globalProgress: number) {
  if (!placements?.length) {
    return placements;
  }
  const modulo = routeVisualLodModulo(route, routeProgress, globalProgress);
  if (modulo <= 1) {
    return placements;
  }
  const phase = routeVisualLodPhase(route) % modulo;
  const filtered = placements.filter((_, index) => index === 0 || index === placements.length - 1 || index % modulo === phase);
  return filtered.length >= Math.min(3, placements.length) ? filtered : placements.slice(0, Math.min(placements.length, 3));
}

function formationFrontSamples(points: TacticalPoint[], count: number) {
  if (points.length < 2) {
    return points;
  }
  return Array.from({ length: count }, (_, index) => pointAtRatio(points, count === 1 ? 0 : index / (count - 1)));
}

function formationDepthRows(points: TacticalPoint[], rows: number, columns: number, spacing = 13) {
  const front = formationFrontSamples(points, columns);
  return Array.from({ length: rows * columns }, (_, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const frontRatio = columns === 1 ? 0.5 : column / (columns - 1);
    const stagger = row % 2 === 0 ? 0 : 0.035;
    const normal = normalAtRatio(points, clamp(frontRatio + stagger, 0, 1));
    const depth = (row - (rows - 1) / 2) * spacing;
    return [front[column][0] + normal[0] * depth, front[column][1] + normal[1] * depth] as TacticalPoint;
  });
}

function rotatedDepthRows(points: TacticalPoint[], rows: number, columns: number, spacing = 13) {
  if (points.length < 2 || rows <= 0 || columns <= 0) {
    return [];
  }
  const frontStart = points[0];
  const frontEnd = points[1];
  const dx = frontEnd[0] - frontStart[0];
  const dy = frontEnd[1] - frontStart[1];
  const length = Math.hypot(dx, dy) || 1;
  const along = [dx / length, dy / length] as TacticalPoint;
  const normal = [-along[1], along[0]] as TacticalPoint;
  return Array.from({ length: rows * columns }, (_, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const frontRatio = columns === 1 ? 0.5 : column / (columns - 1);
    const stagger = row % 2 === 0 ? 0 : length / Math.max(18, columns * 5);
    const base = [frontStart[0] + dx * frontRatio + along[0] * stagger, frontStart[1] + dy * frontRatio + along[1] * stagger] as TacticalPoint;
    const depth = (row - (rows - 1) / 2) * spacing;
    return [base[0] + normal[0] * depth, base[1] + normal[1] * depth] as TacticalPoint;
  });
}

function formationArcPoints(points: TacticalPoint[], count: number, depth = 22) {
  const samples = formationFrontSamples(points, count);
  const center = samples.reduce(
    (sum, point) => [sum[0] + point[0] / samples.length, sum[1] + point[1] / samples.length] as TacticalPoint,
    [0, 0]
  );
  return samples.map((point, index) => {
    const ratio = count === 1 ? 0 : index / (count - 1);
    const bow = Math.sin(ratio * Math.PI) * depth;
    const direction = point[0] < center[0] ? -1 : 1;
    return [point[0] + direction * bow * 0.18, point[1] - bow] as TacticalPoint;
  });
}

function formationGridPoints(points: TacticalPoint[], rows: number, columns: number) {
  if (points.length < 3) {
    return formationDepthRows(points, rows, columns, 10);
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
    const stagger = row % 2 === 0 ? 0 : width / Math.max(14, columns * 4);
    return [minX + width * (0.18 + xRatio * 0.64) + stagger, minY + height * (0.18 + yRatio * 0.64)] as TacticalPoint;
  });
}

function formationRankGuides(points: TacticalPoint[], rows: number, spacing = 14) {
  if (points.length < 2 || rows < 2) {
    return [];
  }
  return Array.from({ length: rows }, (_, index) => {
    const depth = (index - (rows - 1) / 2) * spacing;
    return formationFrontSamples(points, 16).map((point, sampleIndex) => {
      const ratio = sampleIndex / 15;
      const normal = normalAtRatio(points, ratio);
      return [point[0] + normal[0] * depth, point[1] + normal[1] * depth] as TacticalPoint;
    });
  });
}

function isRevealed(revealAt: string | undefined, progress: number, dateToProgress: (date: string) => number) {
  return !revealAt || progress >= dateToProgress(revealAt);
}

function isVisibleWindow(revealAt: string | undefined, visibleUntil: string | undefined, progress: number, dateToProgress: (date: string) => number) {
  const start = revealAt ? dateToProgress(revealAt) : 0;
  const end = visibleUntil ? dateToProgress(visibleUntil) : 1;
  return progress >= start && progress < end;
}

function isFormationVisible(formation: CannaeFormation, progress: number, dateToProgress: (date: string) => number) {
  const start = dateToProgress(formation.start);
  const end = formation.end ? dateToProgress(formation.end) : 1;
  return progress >= start && progress <= end;
}

function visibleRatioForWindow(start: string, end: string, progress: number, dateToProgress: (date: string) => number) {
  const startProgress = dateToProgress(start);
  const endProgress = dateToProgress(end);
  return clamp((progress - startProgress) / Math.max(0.0001, endProgress - startProgress));
}

function routeUnitOffsets(route: CannaeRoute) {
  if (route.unitOffsets) {
    return route.unitOffsets;
  }
  if (route.unitKind.includes("cavalry")) {
    return [
      [0, 0],
      [-52, 16],
      [-104, -12]
    ] as TacticalPoint[];
  }
  if (route.unitKind.includes("command")) {
    return [[0, 0]] as TacticalPoint[];
  }
  return [
    [0, 0],
    [-42, 18],
    [-84, -18]
  ] as TacticalPoint[];
}

function routeKineticAmplitude(route: CannaeRoute) {
  if (route.unitKind.includes("command")) {
    return 0;
  }
  if (route.routeKind === "collapse") {
    return 2.8;
  }
  if (route.routeKind === "compression") {
    return 1.9;
  }
  if (route.routeKind === "rear-seal" || route.routeKind === "wing-turn") {
    return 1.55;
  }
  if (route.routeKind === "cavalry") {
    return 1.35;
  }
  if (route.routeKind === "yield" || route.routeKind === "advance") {
    return 1.25;
  }
  if (route.routeKind === "deploy") {
    return 0.45;
  }
  return 0;
}

function routeBattleElasticityAmplitude(route: CannaeRoute) {
  if (route.unitKind.includes("command") || route.routeKind === "deploy") {
    return 0;
  }
  if (route.routeKind === "collapse") {
    return route.faction === "roman" ? 3.8 : 2.4;
  }
  if (route.routeKind === "compression") {
    return route.faction === "roman" ? 2.8 : 2.4;
  }
  if (route.routeKind === "wing-turn") {
    return 2.3;
  }
  if (route.routeKind === "rear-seal") {
    return 2.0;
  }
  if (route.routeKind === "yield") {
    return 1.7;
  }
  if (route.routeKind === "advance") {
    return 1.4;
  }
  if (route.routeKind === "cavalry") {
    return 1.2;
  }
  return 0;
}

function routeUnitMotion(route: CannaeRoute) {
  const amplitude = routeKineticAmplitude(route);
  if (amplitude === 0) {
    return "static" as const;
  }
  return route.routeKind === "deploy" ? "march" as const : "pressure" as const;
}

function kineticPressurePoint(point: TacticalPoint, route: CannaeRoute, index: number, globalProgress: number, routeProgress: number) {
  const amplitude = routeKineticAmplitude(route);
  if (amplitude === 0 || routeProgress <= 0) {
    return point;
  }
  const routeSeed = route.id.length * 0.37 + index * 0.83;
  const activeEnvelope = route.routeKind === "deploy" ? Math.sin(Math.PI * clamp(routeProgress)) : 1;
  const pressure = amplitude * Math.max(0.24, activeEnvelope);
  const elasticity = routeBattleElasticityAmplitude(route) * Math.max(0, Math.min(1, routeProgress * 1.8));
  const slowPressure = Math.sin(globalProgress * 41 + routeSeed) * pressure * 0.42;
  const closeOrderFriction = Math.cos(globalProgress * 29 + routeSeed * 1.7) * pressure * 0.24;
  const sideJostle =
    route.routeKind === "compression" || route.routeKind === "wing-turn" || route.routeKind === "rear-seal"
      ? Math.sin(globalProgress * 57 + index * 0.71) * pressure * 0.26
      : 0;
  const disorder = route.routeKind === "collapse" ? Math.sin(globalProgress * 63 + index * 1.41) * pressure * 0.92 : 0;
  const elasticRank = Math.sin(routeSeed * 1.91 + index * 0.97) * elasticity;
  const elasticFile = Math.cos(routeSeed * 1.37 + index * 1.29) * elasticity;
  const collisionPulse = Math.sin(globalProgress * 73 + routeSeed * 0.9) * elasticity * 0.28;
  const factionPressureX =
    route.routeKind === "compression" || route.routeKind === "wing-turn" || route.routeKind === "rear-seal"
      ? (route.faction === "carthaginian" ? -1 : 1) * collisionPulse
      : 0;
  return [
    point[0] + slowPressure * 0.28 + sideJostle * 0.2 + disorder * 0.42 + elasticRank * 0.62 + factionPressureX,
    point[1] + closeOrderFriction + sideJostle * 0.34 + disorder * 0.3 + elasticFile * 0.72
  ] as TacticalPoint;
}

function routeSpreadForKind(route: CannaeRoute) {
  if (route.routeKind === "collapse") {
    return 0.3;
  }
  if (route.routeKind === "compression") {
    return 0.36;
  }
  if (route.routeKind === "rear-seal") {
    return 0.22;
  }
  if (route.routeKind === "wing-turn") {
    return 0.46;
  }
  if (route.routeKind === "cavalry") {
    return 0.5;
  }
  if (route.routeKind === "deploy") {
    return 0.64;
  }
  return 0.54;
}

function routeOffsetScaleForKind(route: CannaeRoute) {
  if (route.routeKind === "collapse") {
    return 0.62;
  }
  if (route.routeKind === "compression") {
    return 0.66;
  }
  if (route.routeKind === "rear-seal") {
    return 0.52;
  }
  if (route.routeKind === "wing-turn") {
    return 0.72;
  }
  return 0.76;
}

function projectPoint(map: maplibregl.Map, point: TacticalPoint): TacticalPoint | null {
  const projected = map.project(point);
  if (!Number.isFinite(projected.x) || !Number.isFinite(projected.y)) {
    return null;
  }
  return [projected.x, projected.y];
}

function projectLine(map: maplibregl.Map, points: TacticalPoint[]) {
  return points.map((point) => projectPoint(map, point)).filter((point): point is TacticalPoint => Boolean(point));
}

function projectEffectPlacement(map: maplibregl.Map, placement: CannaeTerrainEffectPlacement): CannaeTerrainEffectPlacement | null {
  const point = projectPoint(map, placement.point);
  if (!point) {
    return null;
  }
  const contacts = placement.contacts
    ?.map((contact) => {
      const contactPoint = projectPoint(map, contact.point);
      const romanPoint = projectPoint(map, contact.romanPoint);
      const carthaginianPoint = projectPoint(map, contact.carthaginianPoint);
      return contactPoint && romanPoint && carthaginianPoint
        ? {
            ...contact,
            carthaginianPoint,
            point: contactPoint,
            romanPoint
          }
        : null;
    })
    .filter((contact): contact is NonNullable<typeof contact> => Boolean(contact));
  return { ...placement, contacts, point };
}

function formationDepthConfig(formation: CannaeFormation) {
  if (formation.kind === "deep-infantry-block") {
    return { columns: 10, rows: 8, spacing: 11 };
  }
  if (formation.kind === "compressed-pocket") {
    return { columns: 8, rows: 5, spacing: 10 };
  }
  if (formation.kind === "heavy-infantry-wing") {
    return { columns: 8, rows: 3, spacing: 12 };
  }
  if (formation.kind === "convex-center" || formation.kind === "concave-center") {
    return { columns: 16, rows: 2, spacing: 13 };
  }
  if (formation.kind === "cavalry-wing") {
    return { columns: 9, rows: 2, spacing: 15 };
  }
  return { columns: 4, rows: 2, spacing: 10 };
}

function projectFormation(map: maplibregl.Map, formation: CannaeFormation) {
  const points = projectLine(map, formation.coordinates);
  const labelPoint = projectPoint(map, formation.labelCoordinates);
  const depth = formationDepthConfig(formation);
  const frontPoints = formation.kind === "deep-infantry-block" || formation.kind === "compressed-pocket" || formation.kind === "heavy-infantry-wing" ? points.slice(0, 2) : points;
  const rankPoints =
    formation.kind === "convex-center" || formation.kind === "concave-center" || formation.kind === "cavalry-wing"
      ? formationArcPoints(points, depth.columns, formation.kind === "concave-center" ? -26 : 26)
      : formation.kind === "command-post"
        ? formationGridPoints(points, 2, 4)
        : rotatedDepthRows(frontPoints, depth.rows, depth.columns, depth.spacing);
  const rankGuides =
    formation.kind === "deep-infantry-block" || formation.kind === "compressed-pocket" || formation.kind === "heavy-infantry-wing"
      ? formationRankGuides(frontPoints, depth.rows, depth.spacing)
      : [];
  return { ...formation, labelPoint, points, rankGuides, rankPoints };
}

function computeOverlayGeometry({
  activeEffectPlacement,
  activeEvent,
  dateToProgress,
  map,
  progress,
  projectedRoutes
}: {
  activeEffectPlacement: CannaeTerrainEffectPlacement | null;
  activeEvent: CannaeEvent;
  dateToProgress: (date: string) => number;
  map: maplibregl.Map;
  progress: number;
  projectedRoutes: CannaeTerrainRouteState[];
}) {
  const routePlacementPass = projectedRoutes.map((state) => ({
    ...state,
    formationPreludePoints: projectLine(map, state.route.formationPrelude ?? []),
    labelPoint: projectPoint(map, state.labelPoint),
    markerPoint: projectPoint(map, state.markerPoint),
    unitMotion: routeUnitMotion(state.route),
    unitTrackPlacements: state.showUnits ? applyRouteVisualLod(state.route, routeTrackPlacements(map, state, progress), state.routeProgress, progress) : undefined,
    visiblePoints: projectLine(map, state.visiblePoints)
  }));
  const routeProjectionPass = routePlacementPass.map((state) => ({
    ...state,
    unitTrackPlacements: state.unitTrackPlacements?.map((placement) => ({
      ...placement,
      facingX: nearestEnemyFacingX(placement, state.route, routePlacementPass)
    }))
  }));

  return {
    activeEffectPlacement: activeEffectPlacement ? projectEffectPlacement(map, activeEffectPlacement) : null,
    contactScrums: contactScrums
      .filter((scrum) => isVisibleWindow(scrum.start, scrum.end, progress, dateToProgress))
      .map((scrum) => ({
        ...scrum,
        points: projectLine(map, scrum.points),
        visibleRatio: visibleRatioForWindow(scrum.start, scrum.end, progress, dateToProgress)
      }))
      .filter((scrum) => scrum.points.length >= 2),
    eventPins: battleEvents.map((event) => ({
      id: event.id,
      isCurrent: event.id === activeEvent.id,
      passed: dateToProgress(event.date) <= progress,
      point: projectPoint(map, event.coordinates),
      title: event.title
    })),
    formations: formations.filter((formation) => isFormationVisible(formation, progress, dateToProgress)).map((formation) => projectFormation(map, formation)),
    historicalRegions: historicalRegions
      .filter((region) => isRevealed(region.revealAt, progress, dateToProgress))
      .map((region) => ({
        id: region.id,
        kind: region.kind,
        label: region.label,
        labelPoint: projectPoint(map, region.labelCoordinates),
        points: projectLine(map, region.coordinates)
      })),
    mapPoints: mapPoints
      .filter((point) => isRevealed(point.revealAt, progress, dateToProgress))
      .map((point) => ({
        id: point.id,
        kind: point.kind,
        label: point.label,
        point: projectPoint(map, point.coordinates),
        revealAt: point.revealAt
      })),
    rivers: rivers.map((river) => {
      const points = projectLine(map, river.points);
      return {
        id: river.id,
        label: river.label,
        labelPoint: points[Math.floor(points.length / 2)] ?? null,
        points
      };
    }),
    routes: routeProjectionPass,
    tacticalGraphics: tacticalGraphics
      .filter((graphic) => isVisibleWindow(graphic.revealAt, graphic.visibleUntil, progress, dateToProgress))
      .map((graphic) => {
        const projectedPoints = projectLine(map, graphic.points);
        const segments = (graphic.segments ?? [graphic.points])
          .map((segment) => projectLine(map, segment))
          .filter((segment) => segment.length >= 2);
        return { ...graphic, labelPoint: projectPoint(map, graphic.labelCoordinates), points: projectedPoints, segments };
      }),
    terrainFeatures: terrainFeatures
      .filter((feature) => isRevealed(feature.revealAt, progress, dateToProgress))
      .map((feature) => ({ ...feature, labelPoint: projectPoint(map, feature.labelCoordinates), points: projectLine(map, feature.coordinates) }))
  } satisfies OverlayGeometry;
}

function cameraForMapView(mapView: MapView, mapBaseView: MapView, focusCoordinates: TacticalPoint, focusRoutePoints: TacticalPoint[], cameraScale: number, cameraBearing: number) {
  const longitudes = focusRoutePoints.map((point) => point[0]);
  const latitudes = focusRoutePoints.map((point) => point[1]);
  const spanLng = Math.max(...longitudes) - Math.min(...longitudes);
  const spanLat = Math.max(...latitudes) - Math.min(...latitudes);
  const span = Math.max(spanLng, spanLat);
  const envelopeCenter: TacticalPoint = [
    (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    (Math.min(...latitudes) + Math.max(...latitudes)) / 2
  ];
  const fittedWeight = span < 0.032 ? 0.16 : span < 0.05 ? 0.24 : 0.34;
  const userPanX = mapView.x - mapBaseView.x;
  const userPanY = mapView.y - mapBaseView.y;
  const userZoomDelta = mapView.scale - mapBaseView.scale;
  const stageScaleBoost = Math.log2(Math.max(cameraScale, 0.46) / 0.78) * 0.76;
  const center: TacticalPoint = [
    focusCoordinates[0] * (1 - fittedWeight) + envelopeCenter[0] * fittedWeight - userPanX / 10800 / Math.max(mapView.scale, 0.1),
    focusCoordinates[1] * (1 - fittedWeight) + envelopeCenter[1] * fittedWeight + userPanY / 12800 / Math.max(mapView.scale, 0.1)
  ];
  const fittedZoom = span < 0.02 ? 13.56 : span < 0.028 ? 13.48 : span < 0.038 ? 13.3 : span < 0.052 ? 13.08 : 12.86;
  const stageZoom = fittedZoom + stageScaleBoost;

  const minZoom = cameraScale < 0.82 ? 11.72 : 12.15;

  return {
    bearing: cameraBearing,
    center: [Math.max(16.075, Math.min(16.222, center[0])), Math.max(41.268, Math.min(41.304, center[1]))] as [number, number],
    pitch: tacticalCameraPitch,
    zoom: Math.max(minZoom, Math.min(14.62, stageZoom + userZoomDelta * 1.1))
  };
}

function markMapCanvas(container: HTMLDivElement, map?: maplibregl.Map | null) {
  const canvas = map?.getCanvas() ?? container.querySelector<HTMLCanvasElement>("canvas.maplibregl-canvas");
  if (!canvas) {
    return false;
  }
  canvas.dataset.testid = cannaeTerrainCanvasTestId;
  canvas.setAttribute("aria-label", "坎尼会战倾斜战术地图");
  return true;
}

function CannaeUnitIcon({ facingX, kind, unitIndex }: { facingX: 1 | -1; kind: CannaeUnitKind; unitIndex: number }) {
  const faction = kind.startsWith("roman") || kind.startsWith("paullus") ? "roman" : "carthaginian";
  const assetVersion = "20260614-runtime-lod-v1";
  const cannaeUnitAsset = (assetPath: string) => `${publicPath(assetPath)}?v=${assetVersion}`;
  const imageConfig: Record<CannaeUnitKind, { height: number; href: string; width: number }> = {
    "african-infantry": { height: 54, href: cannaeUnitAsset("/assets/unit-icons/cannae-african-infantry.webp"), width: 41 },
    "carthaginian-cavalry": { height: 48, href: cannaeUnitAsset("/assets/unit-icons/cannae-carthaginian-cavalry.webp"), width: 81 },
    "carthaginian-infantry": { height: 54, href: cannaeUnitAsset("/assets/unit-icons/cannae-iberian-gaul-infantry.webp"), width: 40 },
    "hannibal-command": { height: 58, href: cannaeUnitAsset("/assets/unit-icons/cannae-carthaginian-command.webp"), width: 46 },
    "numidian-cavalry": { height: 48, href: cannaeUnitAsset("/assets/unit-icons/cannae-numidian-cavalry.webp"), width: 81 },
    "paullus-command": { height: 58, href: cannaeUnitAsset("/assets/unit-icons/cannae-roman-command.webp"), width: 46 },
    "roman-cavalry": { height: 48, href: cannaeUnitAsset("/assets/unit-icons/cannae-roman-cavalry.webp"), width: 81 },
    "roman-legion": { height: 54, href: cannaeUnitAsset("/assets/unit-icons/cannae-roman-legion.webp"), width: 39 }
  };
  const config = imageConfig[kind];
  const x = -config.width / 2;
  const y = -config.height / 2;

  const badgeLabel = {
    "african-infantry": "非",
    "carthaginian-cavalry": "迦骑",
    "carthaginian-infantry": "迦",
    "hannibal-command": "汉",
    "numidian-cavalry": "努",
    "paullus-command": "保",
    "roman-cavalry": "罗骑",
    "roman-legion": "罗"
  } satisfies Record<CannaeUnitKind, string>;
  const isCommand = kind.includes("command");
  const showBadge = false;
  const badgeRadius = 8.8;

  return (
    <g className={`cannae-unit cannae-unit-${faction} cannae-unit-${kind}`} data-testid={`cannae-unit-${kind}`} data-facing-x={facingX}>
      <g transform={`scale(${facingX} 1)`}>
        <image
          className="cannae-unit-image"
          data-asset-kind={kind}
          href={config.href}
          preserveAspectRatio="xMidYMid meet"
          x={x}
          y={y}
          width={config.width}
          height={config.height}
        />
      </g>
      {showBadge && (
        <g className="cannae-unit-badge is-command-badge">
          <circle cx={-config.width * 0.24} cy={-config.height * 0.33} r={badgeRadius} />
          <text x={-config.width * 0.24} y={-config.height * 0.33 + 3.3}>
            {badgeLabel[kind]}
          </text>
        </g>
      )}
    </g>
  );
}

function ScrumStroke({ scrum }: { scrum: OverlayGeometry["contactScrums"][number] }) {
  const visibleCount = Math.max(2, Math.ceil(scrum.points.length * Math.max(0.25, scrum.visibleRatio)));
  const points = scrum.points.slice(0, visibleCount);
  return (
    <g
      className={`cannae-contact-scrum cannae-contact-scrum-${scrum.kind}`}
      data-contact-kind={scrum.kind}
      data-faction-mix={scrum.factionMix}
      data-testid={`cannae-contact-scrum-${scrum.id}`}
      opacity={0.42 + scrum.intensity * 0.34}
    >
      <path className="cannae-contact-scrum-shadow" d={buildPath(points)} />
      <path className="cannae-contact-scrum-line" d={buildPath(points)} />
      {points.map((point, index) => (
        <path
          key={`${scrum.id}-slash-${index}`}
          className="cannae-contact-scrum-slash"
          d={`M ${(point[0] - 5 - (index % 2) * 2).toFixed(1)} ${(point[1] - 3 + (index % 3)).toFixed(1)} L ${(point[0] + 5 + (index % 2) * 2).toFixed(1)} ${(point[1] + 3 - (index % 3)).toFixed(1)}`}
        />
      ))}
    </g>
  );
}

function ActiveEffect({ placement }: { event: CannaeEvent; placement: CannaeTerrainEffectPlacement }) {
  const contacts = placement.contacts?.length ? placement.contacts : [];
  const relativeContactPath = (contact: NonNullable<CannaeTerrainEffectPlacement["contacts"]>[number]) =>
    buildPath(
      [contact.romanPoint, contact.point, contact.carthaginianPoint].map(
        (point) => [point[0] - contact.point[0], point[1] - contact.point[1]] as TacticalPoint
      )
    );

  return (
    <g className="cannae-melee-effects">
      {contacts.length > 0 ? (
        contacts.slice(0, 4).map((contact, index) => (
          <g
            key={`${contact.romanRouteId}-${contact.carthaginianRouteId}-${index}`}
            className={`cannae-melee-effect ${index === 0 ? "is-primary-contact" : "is-secondary-contact"}`}
            data-carthaginian-route={contact.carthaginianRouteId}
            data-effect-source={placement.source}
            data-roman-route={contact.romanRouteId}
            data-testid="cannae-melee-effect"
            transform={`translate(${contact.point[0]} ${contact.point[1]})`}
          >
            <path className="cannae-contact-tether" d={relativeContactPath(contact)} />
            <circle r={index === 0 ? 17 : 13} />
            <circle r={index === 0 ? 29 : 22} />
            <path d="M -13 -13 L 13 13 M 13 -13 L -13 13" />
          </g>
        ))
      ) : (
        <g className="cannae-melee-effect is-primary-contact" data-effect-source={placement.source} data-testid="cannae-melee-effect" transform={`translate(${placement.point[0]} ${placement.point[1]})`}>
          <circle r="17" />
          <circle r="29" />
          <path d="M -13 -13 L 13 13 M 13 -13 L -13 13" />
        </g>
      )}
    </g>
  );
}

function OverlayFormation({ activeAnchorIds, formation }: { activeAnchorIds: Set<string>; formation: OverlayGeometry["formations"][number] }) {
  const isArea = formation.kind === "deep-infantry-block" || formation.kind === "compressed-pocket" || formation.kind === "heavy-infantry-wing" || formation.kind === "command-post";
  const isActiveAnchor = activeAnchorIds.has(formation.id);
  const frontPoints = isArea ? formation.points.slice(0, 2) : formation.points;
  return (
    <g
      className={`cannae-formation cannae-formation-${formation.faction} cannae-formation-${formation.kind} ${isActiveAnchor ? "is-route-anchor" : ""}`}
      data-formation-kind={formation.kind}
      data-route-anchor={isActiveAnchor ? "true" : "false"}
      data-testid={`cannae-formation-${formation.id}`}
    >
      <path className="cannae-formation-shadow" d={`${buildPath(formation.points)}${isArea ? " Z" : ""}`} />
      <path className="cannae-formation-body" d={`${buildPath(formation.points)}${isArea ? " Z" : ""}`} />
      <path className="cannae-formation-front-line" d={buildPath(frontPoints)} />
      {formation.rankGuides.map((guide, index) => (
        <path key={`${formation.id}-guide-${index}`} className="cannae-formation-rank-guide" d={buildPath(guide)} />
      ))}
      <g className="cannae-formation-ranks" data-testid={`cannae-formation-ranks-${formation.id}`}>
        {formation.rankPoints.map((point, index) => (
          <path
            key={`${formation.id}-rank-${index}`}
            className={`cannae-formation-rank-mark cannae-formation-rank-mark-${formation.kind}`}
            d={`M ${(point[0] - 4.2).toFixed(1)} ${point[1].toFixed(1)} L ${(point[0] + 4.2).toFixed(1)} ${point[1].toFixed(1)}`}
          />
        ))}
      </g>
      {formation.labelPoint && (
        <text x={formation.labelPoint[0]} y={formation.labelPoint[1] - 12}>
          {formation.label}
        </text>
      )}
    </g>
  );
}

function CannaeTacticalOverlay({
  activeEvent,
  activeRouteIds,
  geometry
}: {
  activeEvent: CannaeEvent;
  activeRouteIds: Set<string>;
  geometry: OverlayGeometry;
}) {
  const isResultState = activeEvent.id === "battle-result";
  const activeAnchorIds = new Set(
    geometry.routes.filter((state) => state.isVisible && (state.active || activeRouteIds.has(state.route.id))).map((state) => state.route.positionAnchor).filter((anchor): anchor is string => Boolean(anchor))
  );
  return (
    <svg
      className={`cannae-maplibre-tactical-overlay ${isResultState ? "is-result-state" : ""}`}
      data-testid="cannae-maplibre-tactical-overlay"
      data-projection="maplibre-pitched-geographic-overlay"
      aria-hidden="true"
    >
      <g className="cannae-terrain-base" data-testid="cannae-terrain-layer">
        {geometry.terrainFeatures.map((feature) => (
          <g key={feature.id} className={`cannae-terrain-feature cannae-terrain-${feature.kind}`} data-confidence={feature.confidence} data-testid={`cannae-terrain-${feature.id}`}>
            <path className="cannae-terrain-rim" d={buildPath(feature.points)} />
            {feature.labelPoint && (
              <text x={feature.labelPoint[0]} y={feature.labelPoint[1] - 8}>
                {feature.label}
              </text>
            )}
          </g>
        ))}
      </g>
      <g className="cannae-regions" data-testid="cannae-region-layer">
        {geometry.historicalRegions.map((region) => (
          <g key={region.id} className={`cannae-region cannae-region-${region.kind}`} data-testid={`cannae-region-${region.id}`}>
            <path d={`${buildPath(region.points)} Z`} />
            {region.labelPoint && (
              <text x={region.labelPoint[0]} y={region.labelPoint[1]}>
                {region.label}
              </text>
            )}
          </g>
        ))}
      </g>
      <g className="cannae-rivers" data-testid="cannae-river-layer">
        {geometry.rivers.map((river) => (
          <g key={river.id} className="cannae-river">
            <path className="cannae-river-bank" d={buildPath(river.points)} />
            <path className="cannae-river-water" d={buildPath(river.points)} />
            <path className="cannae-river-highlight" d={buildPath(river.points)} />
            {river.labelPoint && (
              <text x={river.labelPoint[0] + 10} y={river.labelPoint[1] - 8}>
                {river.label}
              </text>
            )}
          </g>
        ))}
      </g>
      <g className="cannae-tactical-graphics" data-testid="cannae-tactical-graphics-layer">
        {geometry.tacticalGraphics.map((graphic) => (
          <g key={graphic.id} className={`cannae-tactical-graphic cannae-tactical-graphic-${graphic.kind}`} data-testid={`cannae-tactical-graphic-${graphic.id}`}>
            {graphic.segments.map((segment, index) => (
              <path key={`${graphic.id}-segment-${index}`} d={`${buildPath(segment)}${graphic.kind === "yield-zone" ? " Z" : ""}`} />
            ))}
            {graphic.labelPoint && (
              <text x={graphic.labelPoint[0]} y={graphic.labelPoint[1] - 10}>
                {graphic.label}
              </text>
            )}
          </g>
        ))}
      </g>
      <g className="cannae-formations" data-testid="cannae-formation-layer">
        {geometry.formations.map((formation) => (
          <OverlayFormation key={formation.id} activeAnchorIds={activeAnchorIds} formation={formation} />
        ))}
      </g>
      <g className="cannae-contact-scrums" data-testid="cannae-contact-scrums-layer">
        {geometry.contactScrums.map((scrum) => (
          <ScrumStroke key={scrum.id} scrum={scrum} />
        ))}
      </g>
      <g className="cannae-routes" data-testid="cannae-route-layer">
        {geometry.routes.map((state) => {
          const { active, formationPreludePoints, isComplete, isVisible, labelPoint, markerPoint, route, routeProgress, showUnits, unitMotion, unitTrackPlacements, visiblePoints } = state;
          if (!isVisible || visiblePoints.length < 2 || !markerPoint) {
            return null;
          }
          const labelOffset = route.labelOffset ?? [10, -12];
          const isCurrentRoute = activeRouteIds.has(route.id);
          const showRouteLabel = Boolean(labelPoint && isCurrentRoute && !isResultState);
          return (
            <g
              key={route.id}
              className={`cannae-route cannae-route-${route.faction} cannae-route-${route.routeKind} ${active ? "is-active" : isComplete ? "is-complete" : "is-forming"}`}
              data-confidence={route.confidence}
              data-faction={route.faction}
              data-formation-prelude-count={route.formationPrelude?.length ?? 0}
              data-position-anchor={route.positionAnchor ?? ""}
              data-route-complete={isComplete ? "true" : "false"}
              data-route-current={isCurrentRoute ? "true" : "false"}
              data-route-id={route.id}
              data-route-kind={route.routeKind}
              data-unit-motion={showUnits ? unitMotion : "none"}
              data-unit-visible={showUnits ? "true" : "false"}
              data-testid={`cannae-route-${route.id}`}
            >
              <path className="cannae-route-shadow" d={buildPath(visiblePoints)} />
              <path className="cannae-route-line" d={buildPath(visiblePoints)} />
              <path className="cannae-route-highlight" d={buildPath(visiblePoints)} />
              {showUnits &&
                unitTrackPlacements?.map((placement, index) => {
                  return (
                    <g
                      key={`${route.id}-unit-${index}`}
                      className={`cannae-unit-holder cannae-battle-unit cannae-unit-${route.faction === "roman" ? "rome" : "carthage"}`}
                      data-faction={route.faction}
                      data-route-id={route.id}
                      data-route-progress={routeProgress.toFixed(4)}
                      data-unit-route-progress={placement.routeProgress.toFixed(4)}
                      data-testid={`cannae-route-unit-${route.id}-${index}`}
                      transform={`translate(${placement.point[0]} ${placement.point[1]})`}
                    >
                      <CannaeUnitIcon kind={route.unitKind} facingX={placement.facingX} unitIndex={index} />
                    </g>
                  );
                })}
              {showRouteLabel && labelPoint && (
                <text className="cannae-route-label" x={labelPoint[0] + labelOffset[0]} y={labelPoint[1] + labelOffset[1]}>
                  {route.label}
                </text>
              )}
            </g>
          );
        })}
      </g>
      <g className="cannae-points">
        {geometry.mapPoints.map(
          (point) =>
            point.point && (
              <g key={point.id} className={`cannae-point cannae-point-${point.kind}`} data-testid={`cannae-point-${point.id}`}>
                <circle cx={point.point[0]} cy={point.point[1]} r={point.kind === "command" || point.kind === "result" ? 6 : 4.5} />
                <text x={point.point[0] + 9} y={point.point[1] + 4}>
                  {point.label}
                </text>
              </g>
            )
        )}
      </g>
      <g className="cannae-event-effects">
        {geometry.eventPins.map(
          (event) =>
            event.point && (
              <g key={event.id} className={`event-pin ${event.passed ? "passed" : ""} ${event.isCurrent ? "is-current" : ""}`}>
                <circle cx={event.point[0]} cy={event.point[1]} r={event.isCurrent ? 7 : 4.2} />
                {event.isCurrent && (
                  <text x={event.point[0] + 16} y={event.point[1] + 5} className="active-event-label">
                    {event.title}
                  </text>
                )}
              </g>
            )
        )}
        {geometry.activeEffectPlacement && <ActiveEffect event={activeEvent} placement={geometry.activeEffectPlacement} />}
      </g>
    </svg>
  );
}

export function CannaeTerrain3D({
  activeEffectPlacement,
  activeEvent,
  activeRouteIds,
  cameraBearing,
  cameraScale,
  dateToProgress,
  focusCoordinates,
  focusRoutePoints,
  isPlaying,
  mapBaseView,
  mapView,
  progress,
  projectedRoutes
}: CannaeTerrain3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const lastCameraEventIdRef = useRef(activeEvent.id);
  const [geometry, setGeometry] = useState<OverlayGeometry | null>(null);
  const latestStateRef = useRef({ activeEffectPlacement, activeEvent, progress, projectedRoutes });
  const visibleUnitStats = useMemo(() => {
    const visibleRoutes = projectedRoutes.filter((state) => state.isVisible && state.showUnits);
    const routeUnitCount = (state: CannaeTerrainRouteState) => {
      const logicalCount = state.route.unitTracks?.length ?? state.route.unitOffsets?.length ?? 0;
      const modulo = routeVisualLodModulo(state.route, state.routeProgress, progress);
      if (modulo <= 1) {
        return logicalCount;
      }
      return Math.max(Math.min(3, logicalCount), Math.ceil(logicalCount / modulo));
    };
    return {
      carthage: visibleRoutes.filter((state) => state.route.faction === "carthaginian").reduce((sum, state) => sum + routeUnitCount(state), 0),
      leftJaw: visibleRoutes.filter((state) => state.route.id === "african-left-inward-turn" || state.route.id === "carthaginian-pocket-tighten").reduce((sum, state) => sum + routeUnitCount(state), 0),
      rearClosure: visibleRoutes.filter((state) => state.route.id === "heavy-cavalry-rear-ride" || state.route.id === "numidian-rear-pressure").reduce((sum, state) => sum + routeUnitCount(state), 0),
      rightJaw: visibleRoutes.filter((state) => state.route.id === "african-right-inward-turn" || state.route.id === "carthaginian-pocket-tighten").reduce((sum, state) => sum + routeUnitCount(state), 0),
      roman: visibleRoutes.filter((state) => state.route.faction === "roman").reduce((sum, state) => sum + routeUnitCount(state), 0)
    };
  }, [progress, projectedRoutes]);

  latestStateRef.current = { activeEffectPlacement, activeEvent, progress, projectedRoutes };

  const syncOverlayGeometry = useMemo(
    () => () => {
      const map = mapRef.current;
      if (!map) {
        return;
      }
      const latest = latestStateRef.current;
      setGeometry(
        computeOverlayGeometry({
          activeEffectPlacement: latest.activeEffectPlacement,
          activeEvent: latest.activeEvent,
          dateToProgress,
          map,
          progress: latest.progress,
          projectedRoutes: latest.projectedRoutes
        })
      );
    },
    [dateToProgress]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const initialCamera = cameraForMapView(mapView, mapBaseView, focusCoordinates, focusRoutePoints, cameraScale, cameraBearing);
    const map = new maplibregl.Map({
      attributionControl: false,
      bearing: initialCamera.bearing,
      boxZoom: false,
      canvasContextAttributes: {
        antialias: true,
        preserveDrawingBuffer: true
      },
      center: initialCamera.center,
      container,
      doubleClickZoom: false,
      dragPan: false,
      dragRotate: false,
      interactive: false,
      keyboard: false,
      maxBounds: cannaeBounds,
      maxPitch: 62,
      maxZoom: 15.2,
      minZoom: 11.4,
      pixelRatio: Math.min(3, Math.max(2, window.devicePixelRatio || 1)),
      pitch: initialCamera.pitch,
      refreshExpiredTiles: false,
      scrollZoom: false,
      style: cannaeTerrainStyle,
      touchPitch: false,
      touchZoomRotate: false,
      zoom: initialCamera.zoom
    });
    mapRef.current = map;

    const syncMetadata = () => {
      markMapCanvas(container, map);
      const canvas = map.getCanvas();
      container.dataset.terrainLoaded = map.loaded() ? "true" : "false";
      const center = map.getCenter();
      container.dataset.mapCenter = `${center.lng.toFixed(5)},${center.lat.toFixed(5)}`;
      container.dataset.mapZoom = map.getZoom().toFixed(2);
      container.dataset.mapMaxZoom = map.getMaxZoom().toFixed(2);
      container.dataset.mapPixelRatio = canvas.clientWidth > 0 ? (canvas.width / canvas.clientWidth).toFixed(2) : "0";
      syncOverlayGeometry();
    };
    markMapCanvas(container, map);

    map.once("load", () => {
      map.setTerrain({ source: "cannae-real-dem", exaggeration: terrainExaggeration });
      syncMetadata();
    });
    map.on("render", syncOverlayGeometry);
    map.on("idle", syncMetadata);
    map.on("move", syncOverlayGeometry);

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
      syncOverlayGeometry();
    });
    resizeObserver.observe(container);
    resizeObserverRef.current = resizeObserver;

    return () => {
      resizeObserver.disconnect();
      resizeObserverRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const activeEventChanged = lastCameraEventIdRef.current !== activeEvent.id;
    lastCameraEventIdRef.current = activeEvent.id;
    const camera = cameraForMapView(activeEventChanged ? mapBaseView : mapView, mapBaseView, focusCoordinates, focusRoutePoints, cameraScale, cameraBearing);
    map.stop();
    if (activeEventChanged && isPlaying) {
      map.easeTo({ ...camera, duration: cameraTransitionDurationMs, easing: (t) => t * t * (3 - 2 * t) });
    } else {
      map.jumpTo(camera);
    }
    syncOverlayGeometry();
  }, [activeEvent.id, cameraBearing, cameraScale, focusCoordinates, focusRoutePoints, isPlaying, mapBaseView, mapView, syncOverlayGeometry]);

  useEffect(() => {
    syncOverlayGeometry();
  }, [activeEffectPlacement, progress, projectedRoutes, syncOverlayGeometry]);

  return (
    <div
      ref={containerRef}
      className="cannae-terrain-3d"
      data-testid="cannae-terrain-3d"
      data-renderer="maplibre-real-terrain"
      data-tactical-renderer="maplibre-geographic-overlay"
      data-terrain-model="real-dem-raster-terrain"
      data-visible-basemap="drawn-historical-tactical-terrain"
      data-modern-imagery-visible="false"
      data-terrain-exaggeration={`${terrainExaggeration}`}
      data-hillshade-exaggeration={`${hillshadeExaggeration}`}
      data-terrain-source={terrainTileUrl}
      data-terrain-tile-cache-zoom={`${cachedTerrainTileZoom}`}
      data-projection="webgl-gis-terrain"
      data-camera-mode="stable-tactical-stages"
      data-camera-transition-ms={`${cameraTransitionDurationMs}`}
      data-camera-bearing={`${cameraBearing}`}
      data-camera-pitch={`${tacticalCameraPitch}`}
      data-route-fit-zoom="disabled"
      data-left-jaw-units={`${visibleUnitStats.leftJaw}`}
      data-rear-closure-units={`${visibleUnitStats.rearClosure}`}
      data-right-jaw-units={`${visibleUnitStats.rightJaw}`}
      data-visible-carthage-units={`${visibleUnitStats.carthage}`}
      data-visible-roman-units={`${visibleUnitStats.roman}`}
    >
      {geometry && <CannaeTacticalOverlay activeEvent={activeEvent} activeRouteIds={activeRouteIds} geometry={geometry} />}
    </div>
  );
}
