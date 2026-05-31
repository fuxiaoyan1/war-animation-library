import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { BattleEvent, Faction, FormationUnit, FrontLine, MapPoint } from "../data/battleOfFrance";
import {
  battleEvents,
  fragmentedLines,
  fortifiedLines,
  historicalRegions,
  mapOverlays,
  mapPoints,
  rivers,
  tacticalFormations,
  tacticalTerrainFeatures,
  terrainZones,
  type NianzhuangTacticalFormation
} from "../data/nianzhuangBattle";
import type { BattleEffectElement, GeoLine, MapOverlayElement, TacticalTerrainFeature } from "./CampaignMapAnimation";
import { UnitIcon } from "./UnitIcon";
import type { HorizontalFacing } from "./UnitIcon";
import type { UnitIconKind } from "../types/units";

type TacticalPoint = [number, number];

export type NianzhuangRouteState = {
  active: boolean;
  facingX: HorizontalFacing;
  isComplete: boolean;
  isVisible: boolean;
  labelPoint: TacticalPoint;
  line: FrontLine;
  markerPoint: TacticalPoint;
  routeProgress: number;
  sceneOpacity: number;
  scenePhase: "entering" | "exiting" | "hidden-after" | "hidden-before" | "present";
  showUnits: boolean;
  unitOpacity: number;
  visiblePoints: TacticalPoint[];
};

export type NianzhuangEffectState = BattleEffectElement & {
  progress: number;
};

type NianzhuangTerrain3DProps = {
  activeEvent: BattleEvent;
  activeRouteIds: Set<string>;
  currentFocus: string;
  currentDateProgress: (date: string) => number;
  dateToProgress: (date: string) => number;
  focusRoutePoints: TacticalPoint[];
  mapBaseView: { scale: number; x: number; y: number };
  mapView: { scale: number; x: number; y: number };
  progress: number;
  routeStates: NianzhuangRouteState[];
  visibleEffects: NianzhuangEffectState[];
};

type ProjectedRouteState = Omit<NianzhuangRouteState, "labelPoint" | "markerPoint" | "visiblePoints"> & {
  labelPoint: TacticalPoint | null;
  markerPoint: TacticalPoint | null;
  visiblePoints: TacticalPoint[];
};

type ProjectedEffectState = NianzhuangEffectState & {
  fromPoint: TacticalPoint | null;
  toPoint: TacticalPoint | null;
};

type OverlayGeometry = {
  activeEventPoint: TacticalPoint | null;
  effects: ProjectedEffectState[];
  eventPins: Array<{ id: string; isCurrent: boolean; passed: boolean; point: TacticalPoint | null; title: string }>;
  fieldworks: Array<GeoLine & { labelPoint: TacticalPoint | null; points: TacticalPoint[] }>;
  formations: Array<
    NianzhuangTacticalFormation & {
      labelPoint: TacticalPoint | null;
      points: TacticalPoint[];
      rankGuides: TacticalPoint[][];
      rankPoints: TacticalPoint[];
    }
  >;
  historicalRegions: Array<{ className?: string; id: string; label: string; labelPoint: TacticalPoint | null; points: TacticalPoint[] }>;
  mapOverlays: Array<
    MapOverlayElement & {
      fromPoint?: TacticalPoint | null;
      point?: TacticalPoint | null;
      toPoint?: TacticalPoint | null;
    }
  >;
  mapPoints: Array<{ id: string; kind: string; label: string; point: TacticalPoint | null }>;
  rivers: Array<{ id: string; label: string; labelPoint: TacticalPoint | null; points: TacticalPoint[] }>;
  routes: ProjectedRouteState[];
  terrainFeatures: Array<TacticalTerrainFeature & { labelPoint: TacticalPoint | null; points: TacticalPoint[] }>;
  terrainZones: Array<{ className?: string; label: string; labelPoint: TacticalPoint | null; point: TacticalPoint | null; rx: number; ry: number }>;
};

const nianzhuangTerrainCanvasTestId = "nianzhuang-terrain-3d-canvas";
const nianzhuangSourceBounds: [number, number, number, number] = [117.16, 34.07, 118.08, 34.42];
const nianzhuangBounds: [[number, number], [number, number]] = [
  [117.16, 34.07],
  [118.08, 34.42]
];
const terrainTileUrl = "/assets/maps/nianzhuang-real-terrain/terrarium/{z}/{x}-{y}.png";
const cachedTerrainTileZoom = 13;
const minCachedTileZoom = 10;
const terrainExaggeration = 1;
const hillshadeExaggeration = 0.1;
const tacticalCameraBearing = -18;
const tacticalCameraPitch = 48;
const cameraTransitionDurationMs = 1050;
const sceneTransitionMinimumOpacity = 0.08;
const sceneTransitionExitingOpacity = 0.84;
const sceneTransitionProgress = 0.006;

const historicalBaseBounds: TacticalPoint[] = [
  [nianzhuangSourceBounds[0], nianzhuangSourceBounds[1]],
  [nianzhuangSourceBounds[2], nianzhuangSourceBounds[1]],
  [nianzhuangSourceBounds[2], nianzhuangSourceBounds[3]],
  [nianzhuangSourceBounds[0], nianzhuangSourceBounds[3]],
  [nianzhuangSourceBounds[0], nianzhuangSourceBounds[1]]
];

function closedCoordinates(points: TacticalPoint[]) {
  if (points.length === 0) {
    return points;
  }
  const first = points[0];
  const last = points.at(-1);
  return last && first[0] === last[0] && first[1] === last[1] ? points : [...points, first];
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

const tacticalTerrainBaseData = featureCollection([
  polygonFeature("nianzhuang-historical-base", historicalBaseBounds, { kind: "base" }),
  ...historicalRegions.map((region) => polygonFeature(`region-${region.id}`, region.coordinates, { kind: region.className ?? "region" })),
  ...tacticalTerrainFeatures
    .filter((feature) => feature.type === "area")
    .map((feature) => polygonFeature(feature.id, feature.points, { height: feature.height ?? 0, kind: feature.kind })),
  ...terrainZones.map((zone) =>
    polygonFeature(
      `zone-${zone.className ?? zone.label}`,
      ellipsePolygon(zone.coordinates, zone.rx / 3500, zone.ry / 4200, 20),
      { kind: zone.className ?? "zone" }
    )
  )
]);
const tacticalTerrainLineData = featureCollection([
  ...rivers.map((river) => lineFeature(river.id, river.points, { kind: "water" })),
  ...tacticalTerrainFeatures.filter((feature) => feature.type === "line").map((feature) => lineFeature(feature.id, feature.points, { kind: feature.kind })),
  ...fortifiedLines.map((line) => lineFeature(line.id, line.points, { kind: line.kind ?? "fieldwork" })),
  ...fragmentedLines.map((line) => lineFeature(line.id, line.points, { kind: "fragmented" }))
]);

const nianzhuangTerrainStyle: StyleSpecification = {
  version: 8,
  sources: {
    "nianzhuang-historical-terrain": {
      type: "geojson",
      data: tacticalTerrainBaseData
    },
    "nianzhuang-tactical-lines": {
      type: "geojson",
      data: tacticalTerrainLineData
    },
    "nianzhuang-real-dem": {
      type: "raster-dem",
      tiles: [terrainTileUrl],
      bounds: nianzhuangSourceBounds,
      encoding: "terrarium",
      tileSize: 256,
      minzoom: minCachedTileZoom,
      maxzoom: cachedTerrainTileZoom,
      attribution: "Elevation: AWS Terrain Tiles, SRTM/GMTED"
    }
  },
  layers: [
    {
      id: "nianzhuang-historical-paper",
      type: "background",
      paint: {
        "background-color": "#d0bf8f"
      }
    },
    {
      id: "nianzhuang-historical-ground",
      type: "fill",
      source: "nianzhuang-historical-terrain",
      filter: ["==", ["get", "kind"], "base"],
      paint: {
        "fill-color": "#d1c08e",
        "fill-opacity": 1
      }
    },
    {
      id: "nianzhuang-historical-regions",
      type: "fill",
      source: "nianzhuang-historical-terrain",
      filter: ["in", ["get", "kind"], ["literal", ["nianzhuang-pocket-region", "nianzhuang-block-region", "nianzhuang-water-region"]]],
      paint: {
        "fill-color": [
          "match",
          ["get", "kind"],
          "nianzhuang-block-region",
          "#b8764e",
          "nianzhuang-water-region",
          "#74a6ad",
          "#9a8f56"
        ],
        "fill-opacity": 0.16
      }
    },
    {
      id: "nianzhuang-historical-relief",
      type: "fill",
      source: "nianzhuang-historical-terrain",
      filter: ["in", ["get", "kind"], ["literal", ["relief", "village", "lowland"]]],
      paint: {
        "fill-color": ["match", ["get", "kind"], "lowland", "#89adb1", "village", "#b18958", "#b99c61"],
        "fill-opacity": ["match", ["get", "kind"], "lowland", 0.5, "village", 0.42, 0.52]
      }
    },
    {
      id: "nianzhuang-historical-zone-lines",
      type: "line",
      source: "nianzhuang-historical-terrain",
      paint: {
        "line-color": "#725a35",
        "line-dasharray": [3, 3],
        "line-opacity": 0.36,
        "line-width": 1.2
      }
    },
    {
      id: "nianzhuang-water-lines",
      type: "line",
      source: "nianzhuang-tactical-lines",
      filter: ["==", ["get", "kind"], "water"],
      paint: {
        "line-color": "#4e91a3",
        "line-opacity": 0.76,
        "line-width": 5
      }
    },
    {
      id: "nianzhuang-contours",
      type: "line",
      source: "nianzhuang-tactical-lines",
      filter: ["in", ["get", "kind"], ["literal", ["contour", "ditch", "trench"]]],
      paint: {
        "line-color": ["match", ["get", "kind"], "contour", "#79603b", "#3e7c91"],
        "line-dasharray": [2, 2],
        "line-opacity": 0.5,
        "line-width": 1.5
      }
    },
    {
      id: "nianzhuang-dem-hillshade",
      type: "hillshade",
      source: "nianzhuang-real-dem",
      paint: {
        "hillshade-accent-color": "#756f4d",
        "hillshade-exaggeration": hillshadeExaggeration,
        "hillshade-highlight-color": "#fff1c4",
        "hillshade-shadow-color": "#5c5b3d"
      }
    }
  ],
  terrain: {
    source: "nianzhuang-real-dem",
    exaggeration: terrainExaggeration
  }
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function smoothStep(value: number) {
  const clamped = clamp(value);
  return clamped * clamped * (3 - 2 * clamped);
}

function sceneElementVisibility(progress: number, visibleFromProgress: number, visibleUntilProgress: number) {
  const hasFiniteEnd = Number.isFinite(visibleUntilProgress);

  if (progress < visibleFromProgress) {
    return {
      isDrawn: false,
      isNominalVisible: false,
      opacity: 0,
      phase: "hidden-before" as const
    };
  }

  if (hasFiniteEnd && progress >= visibleUntilProgress + sceneTransitionProgress) {
    return {
      isDrawn: false,
      isNominalVisible: false,
      opacity: 0,
      phase: "hidden-after" as const
    };
  }

  const isNominalVisible = progress >= visibleFromProgress && (!hasFiniteEnd || progress <= visibleUntilProgress);
  if (progress < visibleFromProgress + sceneTransitionProgress) {
    const ratio = smoothStep((progress - visibleFromProgress) / sceneTransitionProgress);
    return {
      isDrawn: true,
      isNominalVisible,
      opacity: sceneTransitionMinimumOpacity + (1 - sceneTransitionMinimumOpacity) * ratio,
      phase: "entering" as const
    };
  }

  if (hasFiniteEnd && progress > visibleUntilProgress) {
    const ratio = smoothStep((progress - visibleUntilProgress) / sceneTransitionProgress);
    return {
      isDrawn: true,
      isNominalVisible,
      opacity: sceneTransitionExitingOpacity * (1 - ratio),
      phase: "exiting" as const
    };
  }

  return {
    isDrawn: true,
    isNominalVisible,
    opacity: 1,
    phase: "present" as const
  };
}

function ellipsePolygon(center: TacticalPoint, rx: number, ry: number, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (Math.PI * 2 * index) / count;
    return [center[0] + Math.cos(angle) * rx, center[1] + Math.sin(angle) * ry] as TacticalPoint;
  });
}

function buildPath(points: TacticalPoint[]) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point[0].toFixed(1)} ${point[1].toFixed(1)}`).join(" ");
}

function midpoint(a: TacticalPoint, b: TacticalPoint) {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as TacticalPoint;
}

function distance(a: TacticalPoint, b: TacticalPoint) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function pointAtRatio(points: TacticalPoint[], ratio: number) {
  if (points.length < 2) {
    return points[0] ?? [0, 0];
  }

  const segmentLengths = points.slice(0, -1).map((point, index) => distance(point, points[index + 1]));
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
    const normal = normalAtRatio(points, frontRatio);
    const depth = (row - (rows - 1) / 2) * spacing;
    return [front[column][0] + normal[0] * depth, front[column][1] + normal[1] * depth] as TacticalPoint;
  });
}

function formationGridPoints(points: TacticalPoint[], rows: number, columns: number) {
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

function activeAnchorIds(routeStates: NianzhuangRouteState[]) {
  return new Set(
    routeStates
      .filter((state) => state.isVisible && state.showUnits)
      .flatMap((state) => [state.line.positionAnchor, ...(state.line.positionAnchors ?? []), state.line.from, state.line.to])
      .filter((anchor): anchor is string => Boolean(anchor))
  );
}

function isFormationVisible(formation: NianzhuangTacticalFormation, progress: number, dateToProgress: (date: string) => number) {
  const start = dateToProgress(formation.start);
  const end = formation.end ? dateToProgress(formation.end) : 1;
  return progress >= start && progress <= end;
}

function routeSpan(points: TacticalPoint[]) {
  if (points.length < 2) {
    return 0;
  }
  const longitudes = points.map((point) => point[0]);
  const latitudes = points.map((point) => point[1]);
  return Math.max(Math.max(...longitudes) - Math.min(...longitudes), Math.max(...latitudes) - Math.min(...latitudes));
}

function stableZoomForRouteSpan(points: TacticalPoint[]) {
  const span = routeSpan(points);
  if (span <= 0.1) {
    return 13.05;
  }
  if (span <= 0.16) {
    return 12.75;
  }
  if (span <= 0.24) {
    return 12.35;
  }
  if (span <= 0.42) {
    return 11.95;
  }
  return 11.35;
}

function cameraForMapView(
  mapView: { scale: number; x: number; y: number },
  mapBaseView: { scale: number; x: number; y: number },
  focusRoutePoints: TacticalPoint[]
) {
  const longitudes = focusRoutePoints.map((point) => point[0]);
  const latitudes = focusRoutePoints.map((point) => point[1]);
  const fittedCenter: TacticalPoint = [
    (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    (Math.min(...latitudes) + Math.max(...latitudes)) / 2
  ];
  const userPanX = mapView.x - mapBaseView.x;
  const userPanY = mapView.y - mapBaseView.y;
  const userZoomDelta = mapView.scale - mapBaseView.scale;

  return {
    bearing: tacticalCameraBearing,
    center: [
      Math.max(117.22, Math.min(118.03, fittedCenter[0] - userPanX / 11000 / Math.max(mapView.scale, 0.1))),
      Math.max(34.09, Math.min(34.4, fittedCenter[1] + userPanY / 14500 / Math.max(mapView.scale, 0.1)))
    ] as TacticalPoint,
    pitch: tacticalCameraPitch,
    zoom: Math.max(10.9, Math.min(13.45, stableZoomForRouteSpan(focusRoutePoints) + (mapBaseView.scale - 0.86) * 0.42 + userZoomDelta * 1.38))
  };
}

function markMapCanvas(container: HTMLDivElement, map?: maplibregl.Map | null) {
  const canvas = map?.getCanvas() ?? container.querySelector<HTMLCanvasElement>("canvas.maplibregl-canvas");
  if (!canvas) {
    return false;
  }
  canvas.dataset.testid = nianzhuangTerrainCanvasTestId;
  canvas.setAttribute("aria-label", "碾庄圩真实DEM三维地形与历史战术底图标绘");
  return true;
}

function forceMarkerLabel(label: string | undefined, faction: string) {
  if (label && label.length <= 3) {
    return label;
  }
  if (label) {
    return label.slice(0, 3);
  }
  return faction === "communist" ? "华" : faction === "nationalist" ? "國" : faction.slice(0, 2).toUpperCase();
}

function RaisedForceMarker({ faction, label, testId }: { faction: string; label?: string; testId: string }) {
  const displayLabel = forceMarkerLabel(label, faction);

  return (
    <g className={`force-echelon-marker force-echelon-${faction}`} data-testid={testId} aria-hidden="true">
      <ellipse className="force-echelon-shadow" cx="4" cy="23" rx="54" ry="10" />
      <path className="force-echelon-side" d="M -48 -4 H 26 L 46 12 V 22 H -48 Z" />
      <path className="force-echelon-face" d="M -52 -20 H 25 L 50 0 L 25 20 H -52 Z" />
      <path className="force-echelon-top" d="M -52 -20 H 25 L 50 0 L -29 -2 Z" />
      <path className="force-echelon-cut" d="M 25 -20 L 50 0 L 25 20" />
      <text className="force-echelon-label" x="-8" y="8">
        {displayLabel}
      </text>
    </g>
  );
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

function routeFacingX(points: TacticalPoint[], routeProgress: number): HorizontalFacing {
  const previous = pointAtRatio(points, Math.max(0, routeProgress - 0.018));
  const next = pointAtRatio(points, Math.min(1, routeProgress + 0.018));
  return next[0] - previous[0] < -0.01 ? -1 : 1;
}

function routeLocalOffset(point: TacticalPoint, direction: { x: number; y: number }, offset: TacticalPoint) {
  const [along, cross] = offset;
  return [point[0] + direction.x * along - direction.y * cross, point[1] + direction.y * along + direction.x * cross] as TacticalPoint;
}

function routeLength(points: TacticalPoint[]) {
  return points.slice(0, -1).reduce((sum, point, index) => sum + distance(point, points[index + 1]), 0);
}

function formationUnitPlacement(points: TacticalPoint[], progress: number, offset: TacticalPoint, offsetScale = 1) {
  const totalLength = Math.max(routeLength(points), 1);
  const [along, cross] = offset;
  const rawProgress = progress + (along * offsetScale) / totalLength;
  const unitProgress = clamp(rawProgress);
  const pointOnRoute = pointAtRatio(points, unitProgress);
  const direction = routeDirectionVector(points, unitProgress);
  const clampedAlongOverflow = rawProgress < 0 ? rawProgress * totalLength : rawProgress > 1 ? (rawProgress - 1) * totalLength : 0;
  const markerPoint = routeLocalOffset(pointOnRoute, direction, [clampedAlongOverflow, cross * offsetScale]);
  return {
    facingX: routeFacingX(points, unitProgress),
    point: markerPoint,
    routeProgress: unitProgress
  };
}

function computeOverlayGeometry({
  activeEvent,
  dateToProgress,
  map,
  progress,
  routeStates,
  visibleEffects
}: {
  activeEvent: BattleEvent;
  dateToProgress: (date: string) => number;
  map: maplibregl.Map;
  progress: number;
  routeStates: NianzhuangRouteState[];
  visibleEffects: NianzhuangEffectState[];
}) {
  return {
    activeEventPoint: projectPoint(map, activeEvent.coordinates),
    effects: visibleEffects.map((effect) => ({
      ...effect,
      fromPoint: effect.type === "salvo" ? projectPoint(map, effect.from) : null,
      toPoint: effect.type === "salvo" ? projectPoint(map, effect.to) : null
    })),
    eventPins: battleEvents.map((event) => ({
      id: event.id,
      isCurrent: event.id === activeEvent.id,
      passed: dateToProgress(event.date) <= progress,
      point: projectPoint(map, event.coordinates),
      title: event.title
    })),
    fieldworks: [...fortifiedLines, ...fragmentedLines]
      .filter((line) => {
        const visibility = sceneElementVisibility(progress, line.revealAt ? dateToProgress(line.revealAt) : 0, line.visibleUntil ? dateToProgress(line.visibleUntil) : Number.POSITIVE_INFINITY);
        return visibility.isDrawn;
      })
      .map((line) => ({
        ...line,
        labelPoint: projectPoint(map, line.points[Math.max(0, Math.floor(line.points.length / 3))] ?? line.points[0]),
        points: projectLine(map, line.points)
      })),
    formations: tacticalFormations
      .filter((formation) => isFormationVisible(formation, progress, dateToProgress))
      .map((formation) => {
        const points = projectLine(map, formation.coordinates);
        const columns = formation.columns ?? 5;
        const rows = formation.rows ?? 2;
        const frontPoints = formation.kind === "blocking-line" || formation.kind === "assault-echelon" || formation.kind === "trench-work" ? points : points.slice(0, 2);
        return {
          ...formation,
          labelPoint: projectPoint(map, formation.labelCoordinates),
          points,
          rankGuides:
            formation.kind === "command-post"
              ? []
              : formation.kind === "remnant-pocket"
                ? []
                : formationRankGuides(frontPoints.length >= 2 ? frontPoints : points, rows, formation.kind === "assault-echelon" ? 12 : 13),
          rankPoints:
            formation.kind === "command-post" || formation.kind === "remnant-pocket"
              ? formationGridPoints(points, rows, columns)
              : formationDepthRows(frontPoints.length >= 2 ? frontPoints : points, rows, columns, formation.kind === "assault-echelon" ? 12 : 13)
        };
      }),
    historicalRegions: historicalRegions.map((region) => ({
      className: region.className,
      id: region.id,
      label: region.label,
      labelPoint: projectPoint(map, region.labelCoordinates ?? region.coordinates[0]),
      points: projectLine(map, region.coordinates)
    })),
    mapOverlays: mapOverlays
      .filter((overlay) => {
        const visibility = sceneElementVisibility(progress, overlay.revealAt ? dateToProgress(overlay.revealAt) : 0, Number.POSITIVE_INFINITY);
        return visibility.isDrawn;
      })
      .map((overlay) =>
        overlay.type === "wind"
          ? { ...overlay, fromPoint: projectPoint(map, overlay.from), toPoint: projectPoint(map, overlay.to) }
          : { ...overlay, point: projectPoint(map, overlay.coordinates) }
      ),
    mapPoints: mapPoints
      .filter((point) => !point.hidden)
      .filter((point) => {
        const visibility = sceneElementVisibility(progress, point.revealAt ? dateToProgress(point.revealAt) : 0, Number.POSITIVE_INFINITY);
        return visibility.isDrawn;
      })
      .map((point) => ({
        id: point.id,
        kind: point.kind,
        label: point.label,
        point: projectPoint(map, point.coordinates)
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
    routes: routeStates.map((state) => ({
      ...state,
      labelPoint: projectPoint(map, state.labelPoint),
      line: state.line.formationUnits
        ? {
            ...state.line,
            formationUnits: state.line.formationUnits.map((unit) => {
              if (!unit.coordinates) {
                return unit;
              }
              const coordinates = projectPoint(map, unit.coordinates);
              return coordinates ? { ...unit, coordinates } : { ...unit, coordinates: undefined };
            })
          }
        : state.line,
      markerPoint: projectPoint(map, state.markerPoint),
      visiblePoints: projectLine(map, state.visiblePoints)
    })),
    terrainFeatures: tacticalTerrainFeatures
      .filter((feature) => {
        const visibility = sceneElementVisibility(progress, feature.revealAt ? dateToProgress(feature.revealAt) : 0, feature.visibleUntil ? dateToProgress(feature.visibleUntil) : Number.POSITIVE_INFINITY);
        return visibility.isDrawn;
      })
      .map((feature) => ({
        ...feature,
        labelPoint: feature.labelCoordinates ? projectPoint(map, feature.labelCoordinates) : projectPoint(map, feature.points[Math.max(0, Math.floor(feature.points.length / 2))] ?? feature.points[0]),
        points: projectLine(map, feature.points)
      })),
    terrainZones: terrainZones.map((zone) => ({
      className: zone.className,
      label: zone.label,
      labelPoint: projectPoint(map, zone.labelCoordinates),
      point: projectPoint(map, zone.coordinates),
      rx: zone.rx,
      ry: zone.ry
    }))
  } satisfies OverlayGeometry;
}

function OverlayFieldwork({ activeAnchors, dateToProgress, fieldwork, progress }: { activeAnchors: Set<string>; dateToProgress: (date: string) => number; fieldwork: OverlayGeometry["fieldworks"][number]; progress: number }) {
  const visibility = sceneElementVisibility(progress, fieldwork.revealAt ? dateToProgress(fieldwork.revealAt) : 0, fieldwork.visibleUntil ? dateToProgress(fieldwork.visibleUntil) : Number.POSITIVE_INFINITY);
  const isActiveAnchor = activeAnchors.has(fieldwork.id);
  const points = fieldwork.points;
  const midpoints = points.slice(0, -1).map((point, index) => midpoint(point, points[index + 1]));
  const isBroken = fieldwork.className?.includes("breach") || fieldwork.id.includes("fragment") || fieldwork.id.includes("break");
  return (
    <g
      className={`nianzhuang-fieldwork fortified-line tactical-terrain-feature fortified-line-${fieldwork.id} fortified-line-${fieldwork.kind ?? "fieldwork"} ${isActiveAnchor ? "is-route-anchor" : ""} ${fieldwork.className ?? ""}`}
      data-fortified-height={`${fieldwork.height ?? 24}`}
      data-fortified-id={fieldwork.id}
      data-fortified-kind={fieldwork.kind ?? "fieldwork"}
      data-route-anchor={isActiveAnchor ? "true" : "false"}
      data-scene-transition-phase={visibility.phase}
      data-terrain-id={fieldwork.id}
      data-testid={fieldwork.testId ?? `fortified-line-${fieldwork.id}`}
      style={{ opacity: visibility.opacity }}
    >
      <path className="nianzhuang-fieldwork-shadow fortified-line-shadow" d={buildPath(points)} />
      <path className="nianzhuang-fieldwork-body fortified-line-body" d={buildPath(points)} />
      <path className="nianzhuang-fieldwork-crest fortified-line-crest" d={buildPath(points)} />
      {fieldwork.kind === "fortification" &&
        midpoints.map((point, index) => (
          <g key={`${fieldwork.id}-bunker-${index}`} className="nianzhuang-fieldwork-icon nianzhuang-bunker-icon" transform={`translate(${point[0]} ${point[1]})`}>
            <path d="M -10 7 L -6 -6 L 7 -8 L 12 4 L 5 10 Z" />
            <path d="M -5 0 L 8 -1" />
          </g>
        ))}
      {(fieldwork.kind === "trench" || fieldwork.kind === "fieldwork") &&
        midpoints.map((point, index) => (
          <path key={`${fieldwork.id}-rib-${index}`} className="nianzhuang-trench-rib" d={`M ${point[0] - 7} ${point[1] + 5} L ${point[0] + 7} ${point[1] - 5}`} />
        ))}
      {isBroken &&
        midpoints.map((point, index) => (
          <g key={`${fieldwork.id}-gap-${index}`} className="nianzhuang-breach-icon" transform={`translate(${point[0]} ${point[1]})`}>
            <path d="M -9 -8 L 0 0 L -7 8 M 5 -9 L -1 0 L 8 8" />
          </g>
        ))}
      {fieldwork.labelPoint && (
        <text x={fieldwork.labelPoint[0]} y={fieldwork.labelPoint[1] - 10}>
          {fieldwork.label}
        </text>
      )}
    </g>
  );
}

function OverlayFormation({ activeAnchors, formation }: { activeAnchors: Set<string>; formation: OverlayGeometry["formations"][number] }) {
  const isActiveAnchor = [formation.id, ...(formation.anchorIds ?? [])].some((anchor) => activeAnchors.has(anchor));
  const isArea = formation.kind === "infantry-block" || formation.kind === "remnant-pocket" || formation.kind === "command-post";
  const frontPoints = formation.kind === "infantry-block" ? formation.points.slice(0, 2) : formation.points;
  return (
    <g
      className={`nianzhuang-formation nianzhuang-formation-${formation.faction} nianzhuang-formation-${formation.kind} ${isActiveAnchor ? "is-route-anchor" : ""}`}
      data-formation-kind={formation.kind}
      data-route-anchor={isActiveAnchor ? "true" : "false"}
      data-testid={`nianzhuang-formation-${formation.id}`}
    >
      <path className="nianzhuang-formation-shadow" d={`${buildPath(formation.points)}${isArea ? " Z" : ""}`} />
      <path className="nianzhuang-formation-body" d={`${buildPath(formation.points)}${isArea ? " Z" : ""}`} />
      <path className="nianzhuang-formation-front-line" d={buildPath(frontPoints)} />
      {formation.rankGuides.map((guide, index) => (
        <path key={`${formation.id}-guide-${index}`} className="nianzhuang-formation-rank-guide" d={buildPath(guide)} />
      ))}
      <g className="nianzhuang-formation-ranks" data-testid={`nianzhuang-formation-ranks-${formation.id}`}>
        {formation.rankPoints.map((point, index) => (
          <circle
            key={`${formation.id}-rank-${index}`}
            className={`nianzhuang-formation-rank-dot nianzhuang-formation-rank-dot-${formation.kind}`}
            cx={point[0]}
            cy={point[1]}
            r={formation.kind === "command-post" ? 3.7 : formation.kind === "remnant-pocket" ? 3.1 : 2.6}
          />
        ))}
      </g>
      {formation.kind === "command-post" && formation.labelPoint && (
        <g className="nianzhuang-formation-icon nianzhuang-command-post-icon" transform={`translate(${formation.labelPoint[0]} ${formation.labelPoint[1]})`}>
          <path d="M 0 -18 L 0 12" />
          <path d="M 0 -18 L 18 -10 L 0 -2 Z" />
          <circle cx="0" cy="14" r="5" />
        </g>
      )}
      {(formation.kind === "blocking-line" || formation.kind === "assault-echelon" || formation.kind === "trench-work") &&
        frontPoints.slice(0, -1).map((point, index) => {
          const mid = midpoint(point, frontPoints[index + 1]);
          return (
            <g key={`${formation.id}-arrow-${index}`} className="nianzhuang-formation-icon nianzhuang-echelon-chevron" transform={`translate(${mid[0]} ${mid[1]})`}>
              <path d="M -10 5 L 0 -8 L 10 5" />
            </g>
          );
        })}
      {formation.labelPoint && (
        <text x={formation.labelPoint[0]} y={formation.labelPoint[1] - 12}>
          {formation.label}
        </text>
      )}
    </g>
  );
}

function OverlayRouteUnit({
  formationUnit,
  line,
  markerPoint,
  routeDirection,
  routePoints,
  routeProgress
}: {
  formationUnit: FormationUnit;
  line: FrontLine;
  markerPoint: TacticalPoint;
  routeDirection: { x: number; y: number };
  routePoints: TacticalPoint[];
  routeProgress: number;
}) {
  const icon: UnitIconKind = formationUnit.icon ?? line.unitIcon ?? "infantryPva";
  const markerFaction: Faction = formationUnit.faction ?? line.faction;
  const placement = formationUnit.coordinates
    ? {
        facingX: formationUnit.facingX ?? routeFacingX(routePoints, routeProgress),
        point: routeLocalOffset(formationUnit.coordinates, routeDirection, formationUnit.offset ?? [0, 0]),
        routeProgress
      }
    : formationUnitPlacement(routePoints, routeProgress, formationUnit.offset ?? [0, 0], 0.7);

  return (
    <g
      className={`unit-icon-orientation formation-unit has-force-echelon ${formationUnit.className ?? ""}`}
      data-facing-x={placement.facingX}
      data-route-progress={routeProgress.toFixed(4)}
      data-ship-label={formationUnit.label}
      data-testid={`formation-unit-${line.id}-${formationUnit.id}`}
      transform={`translate(${placement.point[0]} ${placement.point[1]})`}
    >
      <RaisedForceMarker faction={markerFaction} label={formationUnit.badgeLabel ?? line.unitBadgeLabel} testId={`force-echelon-${line.id}-${formationUnit.id}`} />
      <UnitIcon badgeLabel={formationUnit.badgeLabel ?? line.unitBadgeLabel} icon={icon} isActive={routeProgress > 0 && routeProgress < 1} facingX={placement.facingX} faction={markerFaction} />
      {formationUnit.label && (
        <text className="formation-unit-label" x={0} y={-38}>
          {formationUnit.label}
        </text>
      )}
    </g>
  );
}

function OverlayRoute({ routeState }: { routeState: ProjectedRouteState }) {
  const { active, isComplete, isVisible, labelPoint, line, markerPoint, routeProgress, sceneOpacity, scenePhase, showUnits, unitOpacity, visiblePoints } = routeState;
  if (!isVisible || visiblePoints.length < 2 || !markerPoint) {
    return null;
  }
  const routePath = buildPath(visiblePoints);
  const routeStateClass = active ? "is-active" : isComplete ? "is-complete" : "is-forming";
  const routeDirection = routeDirectionVector(visiblePoints, routeProgress);
  const formationRoutePoints = routeState.line.formationPrelude ? [...routeState.line.formationPrelude, ...visiblePoints] : visiblePoints;
  const formationUnits =
    line.formationUnits && line.formationUnits.length > 0
      ? line.formationUnits
      : [
          {
            badgeLabel: line.unitBadgeLabel,
            faction: line.faction,
            icon: line.unitIcon,
            id: "unit",
            label: "",
            offset: [0, 0] as TacticalPoint
          }
        ] satisfies FormationUnit[];

  return (
    <g
      className={`front-line nianzhuang-route route-${line.routeKind ?? "land"} unit-marker-${line.faction} ${routeStateClass}`}
      data-position-anchor={line.positionAnchor ?? ""}
      data-route-end={line.end}
      data-route-from={line.from}
      data-route-id={line.id}
      data-route-label={line.label}
      data-route-point-count={visiblePoints.length}
      data-route-start={line.start}
      data-route-state={routeStateClass}
      data-route-to={line.to}
      data-route-visible-from={line.visibleFrom ?? ""}
      data-route-visible-until={line.visibleUntil ?? ""}
      data-scene-transition-opacity={sceneOpacity.toFixed(3)}
      data-scene-transition-phase={scenePhase}
      data-unit-transition-opacity={unitOpacity.toFixed(3)}
      data-unit-visible={showUnits ? "true" : "false"}
      data-unit-visible-until={line.unitVisibleUntil ?? ""}
      style={{ opacity: sceneOpacity }}
    >
      <path className="front-halo nianzhuang-route-shadow" d={routePath} />
      <path className="front-route nianzhuang-route-line" d={routePath} />
      <path className="front-direction nianzhuang-route-highlight" d={routePath} />
      <circle cx={markerPoint[0]} cy={markerPoint[1]} r={active ? 4.6 : 3.2} />
      {showUnits && (
        <g className="formation-units" style={{ opacity: unitOpacity }}>
          {formationUnits.map((formationUnit) => (
            <OverlayRouteUnit
              key={formationUnit.id}
              formationUnit={formationUnit}
              line={line}
              markerPoint={markerPoint}
              routeDirection={routeDirection}
              routePoints={formationRoutePoints}
              routeProgress={routeProgress}
            />
          ))}
        </g>
      )}
      {labelPoint && active && (
        <text className="line-label" x={labelPoint[0] + 14} y={labelPoint[1] - 14}>
          {line.label}
        </text>
      )}
    </g>
  );
}

function OverlayTerrainFeature({ activeAnchors, dateToProgress, feature, progress }: { activeAnchors: Set<string>; dateToProgress: (date: string) => number; feature: OverlayGeometry["terrainFeatures"][number]; progress: number }) {
  const visibility = sceneElementVisibility(progress, feature.revealAt ? dateToProgress(feature.revealAt) : 0, feature.visibleUntil ? dateToProgress(feature.visibleUntil) : Number.POSITIVE_INFINITY);
  const anchorIds = [feature.id, ...(feature.anchorIds ?? [])];
  const isActiveAnchor = anchorIds.some((anchor) => activeAnchors.has(anchor));
  const path = `${buildPath(feature.points)}${feature.type === "area" ? " Z" : ""}`;
  const isRaisedArea = feature.type === "area" && (feature.kind === "relief" || feature.kind === "village");
  return (
    <g
      className={`tactical-terrain-feature nianzhuang-terrain-feature tactical-terrain-${feature.kind} ${isActiveAnchor ? "is-route-anchor" : ""} ${feature.className ?? ""}`}
      data-route-anchor={isActiveAnchor ? "true" : "false"}
      data-terrain-height={`${feature.height ?? 0}`}
      data-terrain-id={feature.id}
      data-terrain-kind={feature.kind}
      data-testid={feature.testId ?? `tactical-terrain-${feature.id}`}
      style={{ opacity: visibility.opacity }}
    >
      <path className="tactical-terrain-shadow" d={path} />
      {isRaisedArea && <path className="tactical-terrain-skirt" d={path} />}
      {isRaisedArea && <path className="tactical-terrain-wall" d={path} />}
      {feature.type === "line" && <path className="tactical-terrain-contour-step" d={path} />}
      <path className="tactical-terrain-surface" d={path} />
      <path className="tactical-terrain-highlight" d={path} />
      {feature.label && feature.labelPoint && (
        <text className="tactical-terrain-label" x={feature.labelPoint[0]} y={feature.labelPoint[1]}>
          {feature.label}
        </text>
      )}
    </g>
  );
}

function OverlayEffect({ effect }: { effect: ProjectedEffectState }) {
  if (effect.type !== "salvo" || !effect.fromPoint || !effect.toPoint) {
    return null;
  }
  const point = midpoint(effect.fromPoint, effect.toPoint);
  const trace = buildPath([effect.fromPoint, point, effect.toPoint]);
  return (
    <g className={`battle-salvo-effect ${effect.className ?? ""}`} data-testid={effect.testId ?? `nianzhuang-effect-${effect.id}`} transform={`translate(${point[0]} ${point[1]})`}>
      {effect.showShellTraces !== false && <path className="salvo-trace" d={trace} transform={`translate(${-point[0]} ${-point[1]})`} />}
      <circle className="salvo-blast" r={24 + effect.progress * 16} />
      <circle className="salvo-core" r={8 + effect.progress * 6} />
      {effect.label && (
        <text className="salvo-label" x={22} y={-18}>
          {effect.label}
        </text>
      )}
    </g>
  );
}

function NianzhuangTacticalOverlay({
  activeAnchors,
  dateToProgress,
  geometry,
  progress
}: {
  activeAnchors: Set<string>;
  dateToProgress: (date: string) => number;
  geometry: OverlayGeometry;
  progress: number;
}) {
  return (
    <svg className="nianzhuang-maplibre-tactical-overlay" data-testid="nianzhuang-maplibre-tactical-overlay" data-projection="maplibre-real-terrain" aria-hidden="true">
      <g className="tactical-grid-layer" data-testid="tactical-grid-layer">
        {Array.from({ length: 8 }, (_, index) => (
          <line key={`v-${index}`} x1={`${(index + 1) * 11.1}%`} y1="0" x2={`${(index + 1) * 11.1}%`} y2="100%" />
        ))}
        {Array.from({ length: 5 }, (_, index) => (
          <line key={`h-${index}`} x1="0" y1={`${(index + 1) * 16.6}%`} x2="100%" y2={`${(index + 1) * 16.6}%`} />
        ))}
      </g>
      <g className="tactical-terrain-layer" data-testid="tactical-terrain-layer">
        {geometry.terrainFeatures.map((feature) => (
          <OverlayTerrainFeature key={feature.id} activeAnchors={activeAnchors} dateToProgress={dateToProgress} feature={feature} progress={progress} />
        ))}
      </g>
      <g className="river-layer">
        {geometry.rivers.map((river) => (
          <g key={river.id} className={`river river-${river.id}`}>
            <path className="nianzhuang-river-bank" d={buildPath(river.points)} />
            <path className="nianzhuang-river-water" d={buildPath(river.points)} />
            {river.labelPoint && (
              <text x={river.labelPoint[0] + 10} y={river.labelPoint[1] - 8}>
                {river.label}
              </text>
            )}
          </g>
        ))}
      </g>
      <g className="historical-map-layer" data-testid="historical-map-layer">
        {geometry.historicalRegions.map((region) => (
          <g key={region.id} className="historical-region-group">
            <path className={`historical-region historical-region-${region.id} ${region.className ?? ""}`} data-testid={`historical-region-${region.id}`} d={`${buildPath(region.points)} Z`} />
            {region.labelPoint && (
              <text className={`historical-region-name historical-region-name-${region.id}`} data-testid={`historical-region-label-${region.id}`} x={region.labelPoint[0]} y={region.labelPoint[1]}>
                {region.label}
              </text>
            )}
          </g>
        ))}
      </g>
      <g className="region-labels nianzhuang-terrain-zone-layer" data-testid="nianzhuang-terrain-zone-layer">
        {geometry.terrainZones.map(
          (zone) =>
            zone.point &&
            zone.labelPoint && (
              <g key={zone.label} className={zone.className}>
                <ellipse cx={zone.point[0]} cy={zone.point[1]} rx={zone.rx} ry={zone.ry} />
                <text className="terrain-label" x={zone.labelPoint[0]} y={zone.labelPoint[1]}>
                  {zone.label}
                </text>
              </g>
            )
        )}
      </g>
      <g className="fortified-line-layer" data-testid="fortified-line-layer">
        {geometry.fieldworks.map((fieldwork) => (
          <OverlayFieldwork key={fieldwork.id} activeAnchors={activeAnchors} dateToProgress={dateToProgress} fieldwork={fieldwork} progress={progress} />
        ))}
      </g>
      <g className="nianzhuang-formation-layer" data-testid="nianzhuang-formation-layer">
        {geometry.formations.map((formation) => (
          <OverlayFormation key={formation.id} activeAnchors={activeAnchors} formation={formation} />
        ))}
      </g>
      <g className="map-overlay-elements" data-testid="map-overlay-elements">
        {geometry.mapOverlays.map((overlay) => {
          if (overlay.type === "wind" && overlay.fromPoint && overlay.toPoint) {
            return (
              <g key={overlay.id} className={`wind-overlay ${overlay.className ?? ""}`} data-testid={overlay.testId ?? `wind-overlay-${overlay.id}`}>
                <path d={buildPath([overlay.fromPoint, overlay.toPoint])} />
                <text x={(overlay.fromPoint[0] + overlay.toPoint[0]) / 2 + 12} y={(overlay.fromPoint[1] + overlay.toPoint[1]) / 2 - 10}>
                  {overlay.label}
                </text>
              </g>
            );
          }
          if (overlay.type === "marker" && overlay.point) {
            return (
              <g key={overlay.id} className={`annotation-marker ${overlay.className ?? ""}`} data-testid={overlay.testId ?? `annotation-marker-${overlay.id}`} transform={`translate(${overlay.point[0]} ${overlay.point[1]})`}>
                <circle r="8" />
                <path d="M -12 -12 L 12 12 M 12 -12 L -12 12" />
                <text x="16" y="-4">
                  {overlay.label}
                </text>
                {overlay.subtitle && (
                  <text className="annotation-subtitle" x="16" y="14">
                    {overlay.subtitle}
                  </text>
                )}
              </g>
            );
          }
          return null;
        })}
      </g>
      <g className="nianzhuang-routes">
        {geometry.routes.map((route) => (
          <OverlayRoute key={route.line.id} routeState={route} />
        ))}
      </g>
      <g className="battle-effect-layer" data-testid="battle-effect-layer">
        {geometry.effects.map((effect) => (
          <OverlayEffect key={effect.id} effect={effect} />
        ))}
      </g>
      <g className="nianzhuang-points">
        {geometry.mapPoints.map(
          (point) =>
            point.point && (
              <g key={point.id} className={`map-point point-${point.kind}`} data-testid={`map-point-${point.id}`}>
                <circle cx={point.point[0]} cy={point.point[1]} r={point.kind === "objective" ? 5.2 : 3.4} />
                <text x={point.point[0] + 8} y={point.point[1] + 4}>
                  {point.label}
                </text>
              </g>
            )
        )}
      </g>
      <g className="event-pin-layer">
        {geometry.eventPins.map(
          (event) =>
            event.point &&
            (event.passed || event.isCurrent) && (
              <g key={event.id} className={`event-pin ${event.passed ? "passed" : ""} ${event.isCurrent ? "is-current" : ""}`}>
                <circle cx={event.point[0]} cy={event.point[1]} r={event.isCurrent ? 7 : 4.4} />
                {event.isCurrent && (
                  <text x={event.point[0] + 16} y={event.point[1] + 5} className="active-event-label">
                    {event.title}
                  </text>
                )}
              </g>
            )
        )}
      </g>
    </svg>
  );
}

export function lineProgressForRoute(line: FrontLine, progress: number, dateToProgress: (date: string) => number) {
  const start = dateToProgress(line.start);
  const end = dateToProgress(line.end);
  if (end <= start) {
    return progress >= end ? 1 : 0;
  }
  return clamp((progress - start) / (end - start));
}

export function linePointsUntil(points: TacticalPoint[], progress: number) {
  if (points.length < 2) {
    return points;
  }
  const current = pointAtRatio(points, progress);
  const segmentLengths = points.slice(0, -1).map((point, index) => distance(point, points[index + 1]));
  const totalLength = Math.max(0.001, segmentLengths.reduce((sum, length) => sum + length, 0));
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

export function buildNianzhuangRouteState({
  dateToProgress,
  line,
  pointById,
  progress
}: {
  dateToProgress: (date: string) => number;
  line: FrontLine;
  pointById: Map<string, MapPoint>;
  progress: number;
}) {
  const startPoint = pointById.get(line.from)?.coordinates ?? [0, 0];
  const endPoint = pointById.get(line.to)?.coordinates ?? [0, 0];
  const routePoints = [startPoint, ...(line.waypoints ?? []), endPoint] as TacticalPoint[];
  const routeProgress = lineProgressForRoute(line, progress, dateToProgress);
  const isComplete = progress >= dateToProgress(line.end);
  const visibleFrom = line.visibleFrom ? dateToProgress(line.visibleFrom) : dateToProgress(line.start);
  const visibleUntil = line.visibleUntil ? dateToProgress(line.visibleUntil) : Number.POSITIVE_INFINITY;
  const unitVisibleFrom = line.unitVisibleFrom ? dateToProgress(line.unitVisibleFrom) : dateToProgress(line.start);
  const unitVisibleUntil = line.unitVisibleUntil ? dateToProgress(line.unitVisibleUntil) : Number.POSITIVE_INFINITY;
  const routeVisibility = sceneElementVisibility(progress, visibleFrom, visibleUntil);
  const unitVisibility = sceneElementVisibility(progress, unitVisibleFrom, unitVisibleUntil);
  const drawnProgress = isComplete ? 1 : routeProgress;
  const visiblePoints = linePointsUntil(routePoints, drawnProgress);
  const markerPoint = pointAtRatio(routePoints, routeProgress);
  const showUnits = !line.hideUnit && progress >= unitVisibleFrom && progress <= unitVisibleUntil && unitVisibility.isDrawn;
  return {
    active: routeProgress > 0 && routeProgress < 1,
    facingX: routeFacingX(routePoints, routeProgress),
    isComplete,
    isVisible: routeVisibility.isDrawn,
    labelPoint: visiblePoints.at(-1) ?? markerPoint,
    line,
    markerPoint,
    routeProgress,
    sceneOpacity: routeVisibility.opacity,
    scenePhase: routeVisibility.phase,
    showUnits,
    unitOpacity: showUnits ? unitVisibility.opacity : 0,
    visiblePoints
  } satisfies NianzhuangRouteState;
}

export function NianzhuangTerrain3D({
  activeEvent,
  currentFocus,
  dateToProgress,
  focusRoutePoints,
  mapBaseView,
  mapView,
  progress,
  routeStates,
  visibleEffects
}: NianzhuangTerrain3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const lastFocusRef = useRef(currentFocus);
  const [geometry, setGeometry] = useState<OverlayGeometry | null>(null);
  const latestStateRef = useRef({ activeEvent, progress, routeStates, visibleEffects });
  latestStateRef.current = { activeEvent, progress, routeStates, visibleEffects };
  const routeAnchors = useMemo(() => activeAnchorIds(routeStates), [routeStates]);

  const syncOverlayGeometry = useMemo(
    () => () => {
      const map = mapRef.current;
      if (!map) {
        return;
      }
      const latest = latestStateRef.current;
      setGeometry(
        computeOverlayGeometry({
          activeEvent: latest.activeEvent,
          dateToProgress,
          map,
          progress: latest.progress,
          routeStates: latest.routeStates,
          visibleEffects: latest.visibleEffects
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
    const initialCamera = cameraForMapView(mapView, mapBaseView, focusRoutePoints);
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
      maxBounds: nianzhuangBounds,
      maxPitch: 62,
      maxZoom: 13.5,
      minZoom: 10.4,
      pixelRatio: Math.min(3, Math.max(2, window.devicePixelRatio || 1)),
      pitch: initialCamera.pitch,
      refreshExpiredTiles: false,
      scrollZoom: false,
      style: nianzhuangTerrainStyle,
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
      container.dataset.mapFocus = currentFocus;
      container.dataset.mapZoom = map.getZoom().toFixed(2);
      container.dataset.mapMaxZoom = map.getMaxZoom().toFixed(2);
      container.dataset.mapPixelRatio = canvas.clientWidth > 0 ? (canvas.width / canvas.clientWidth).toFixed(2) : "0";
      syncOverlayGeometry();
    };
    markMapCanvas(container, map);

    map.once("load", () => {
      map.setTerrain({ source: "nianzhuang-real-dem", exaggeration: terrainExaggeration });
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
    const focusChanged = lastFocusRef.current !== currentFocus;
    lastFocusRef.current = currentFocus;
    const camera = cameraForMapView(focusChanged ? mapBaseView : mapView, mapBaseView, focusRoutePoints);
    if (focusChanged) {
      map.easeTo({
        ...camera,
        duration: cameraTransitionDurationMs,
        easing: (time) => time * time * (3 - 2 * time)
      });
    } else {
      map.jumpTo(camera);
    }
    const container = containerRef.current;
    if (container) {
      container.dataset.mapFocus = currentFocus;
    }
    syncOverlayGeometry();
  }, [currentFocus, focusRoutePoints, mapBaseView, mapView, syncOverlayGeometry]);

  useEffect(() => {
    syncOverlayGeometry();
  }, [activeEvent, progress, routeStates, syncOverlayGeometry, visibleEffects]);

  return (
    <div
      ref={containerRef}
      className="nianzhuang-terrain-3d"
      data-camera-mode="stable-tactical-stages"
      data-camera-pitch={`${tacticalCameraPitch}`}
      data-camera-transition-ms={`${cameraTransitionDurationMs}`}
      data-hillshade-exaggeration={`${hillshadeExaggeration}`}
      data-modern-imagery-visible="false"
      data-projection="webgl-gis-terrain"
      data-renderer="maplibre-real-terrain"
      data-route-fit-zoom="disabled"
      data-tactical-renderer="maplibre-geographic-overlay"
      data-terrain-exaggeration={`${terrainExaggeration}`}
      data-terrain-model="real-dem-raster-terrain"
      data-terrain-source={terrainTileUrl}
      data-terrain-tile-cache-zoom={`${cachedTerrainTileZoom}`}
      data-testid="nianzhuang-terrain-3d"
      data-visible-basemap="drawn-historical-tactical-terrain"
    >
      {geometry && <NianzhuangTacticalOverlay activeAnchors={routeAnchors} dateToProgress={dateToProgress} geometry={geometry} progress={progress} />}
    </div>
  );
}
