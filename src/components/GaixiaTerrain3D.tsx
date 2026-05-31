import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  ambushSectors,
  campFortifications,
  battleEvents,
  fieldworks,
  formations,
  historicalRegions,
  mapPoints,
  rivers,
  tacticalGraphics,
  terrainContours,
  terrainLabels,
  terrainReliefSurfaces,
  type GaixiaEvent,
  type GaixiaFieldwork,
  type GaixiaFormation,
  type GaixiaRoute,
  type GaixiaTacticalGraphic,
  type GaixiaUnitKind
} from "../data/gaixiaAmbush";
import { publicPath } from "../lib/publicPath";

const gaixiaTerrainCanvasTestId = "gaixia-terrain-3d-canvas";

type TacticalPoint = [number, number];

export type GaixiaTerrainRouteState = {
  active: boolean;
  facingX: 1 | -1;
  isComplete: boolean;
  isVisible: boolean;
  labelPoint: TacticalPoint;
  markerPoint: TacticalPoint;
  route: GaixiaRoute;
  routeProgress: number;
  showUnits: boolean;
  visiblePoints: TacticalPoint[];
};

export type GaixiaTerrainEffectPlacement = {
  chuPoint?: TacticalPoint;
  chuRouteId?: string;
  hanPoint?: TacticalPoint;
  hanRouteId?: string;
  point: TacticalPoint;
  source: "event" | "route-contact" | "route-unit";
};

type GaixiaTerrain3DProps = {
  activeEffectPlacement: GaixiaTerrainEffectPlacement;
  activeEvent: GaixiaEvent;
  activeRouteIds: Set<string>;
  focusCoordinates: TacticalPoint;
  focusRoutePoints: TacticalPoint[];
  height: number;
  mapTransform: string;
  progress: number;
  projectedRoutes: GaixiaTerrainRouteState[];
  width: number;
};

type ProjectedOverlayRouteState = Omit<GaixiaTerrainRouteState, "labelPoint" | "markerPoint" | "visiblePoints"> & {
  labelPoint: TacticalPoint | null;
  markerPoint: TacticalPoint | null;
  visiblePoints: TacticalPoint[];
};

type OverlayGeometry = {
  activeEffectPlacement: GaixiaTerrainEffectPlacement | null;
  ambushSectors: Array<{ id: string; label: string; points: TacticalPoint[]; side: string }>;
  campFortifications: Array<{ id: string; label: string; labelPoint: TacticalPoint | null; points: TacticalPoint[] }>;
  eventPins: Array<{ id: string; isCurrent: boolean; passed: boolean; point: TacticalPoint | null; title: string }>;
  fieldworks: Array<GaixiaFieldwork & { labelPoint: TacticalPoint | null; points: TacticalPoint[] }>;
  formations: Array<GaixiaFormation & { labelPoint: TacticalPoint | null; points: TacticalPoint[]; rankGuides: TacticalPoint[][]; rankPoints: TacticalPoint[] }>;
  historicalRegions: Array<{ id: string; kind: string; label: string; labelPoint: TacticalPoint | null; points: TacticalPoint[] }>;
  mapPoints: Array<{ id: string; kind: string; label: string; point: TacticalPoint | null }>;
  rivers: Array<{ id: string; label: string; labelPoint: TacticalPoint | null; points: TacticalPoint[] }>;
  routes: ProjectedOverlayRouteState[];
  tacticalGraphics: Array<GaixiaTacticalGraphic & { labelPoint: TacticalPoint | null; points: TacticalPoint[] }>;
  terrainContours: Array<{ elevation: number; id: string; kind: string; label: string; labelPoint: TacticalPoint | null; points: TacticalPoint[] }>;
  terrainLabels: Array<{ id: string; kind: string; label: string; point: TacticalPoint | null }>;
  terrainReliefSurfaces: Array<{ elevation: number; id: string; kind: string; label: string; labelPoint: TacticalPoint | null; points: TacticalPoint[]; tacticalRole: string }>;
};

const gaixiaCenter: [number, number] = [117.445, 33.335];
const gaixiaBounds: [[number, number], [number, number]] = [
  [117.05, 32.94],
  [117.88, 33.64]
];
const gaixiaSourceBounds: [number, number, number, number] = [117.05, 32.94, 117.88, 33.64];
const cachedTileZoom = 14;
const minCachedTileZoom = 10;
const terrainTileUrl = "/assets/maps/gaixia-real-terrain/terrarium/{z}/{x}-{y}.png";
const imageryTileUrl = "/assets/maps/gaixia-real-terrain/imagery/{z}/{x}-{y}.jpg";

function parseSvgMapTransform(transform: string) {
  const match = transform.match(/translate\((-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)\) scale\((\d+(?:\.\d+)?)\)/);
  return {
    x: match ? Number(match[1]) : 0,
    y: match ? Number(match[2]) : 0,
    scale: match ? Number(match[3]) : 1
  };
}

function cameraForTransform(transform: string, focusCoordinates: TacticalPoint) {
  const { x, y, scale } = parseSvgMapTransform(transform);
  const lng = focusCoordinates[0] - x / 10500 / Math.max(scale, 0.1);
  const lat = focusCoordinates[1] + y / 14500 / Math.max(scale, 0.1);
  return {
    bearing: -23,
    center: [Math.max(117.12, Math.min(117.8, lng)), Math.max(33.02, Math.min(33.56, lat))] as [number, number],
    pitch: 60,
    zoom: Math.max(11.1, Math.min(13.15, 11.75 + (scale - 0.82) * 2.35))
  };
}

function markMapCanvas(container: HTMLDivElement, map?: maplibregl.Map | null) {
  const canvas = map?.getCanvas() ?? container.querySelector<HTMLCanvasElement>("canvas.maplibregl-canvas");
  if (!canvas) {
    return false;
  }
  canvas.dataset.testid = gaixiaTerrainCanvasTestId;
  canvas.setAttribute("aria-label", "垓下真实DEM三维地形与同图战术标绘");
  return true;
}

const gaixiaTerrainStyle: StyleSpecification = {
  version: 8,
  sources: {
    "gaixia-world-imagery": {
      type: "raster",
      tiles: [imageryTileUrl],
      bounds: gaixiaSourceBounds,
      minzoom: minCachedTileZoom,
      maxzoom: cachedTileZoom,
      tileSize: 256,
      attribution: "Imagery: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
    },
    "gaixia-real-dem": {
      type: "raster-dem",
      tiles: [terrainTileUrl],
      bounds: gaixiaSourceBounds,
      encoding: "terrarium",
      tileSize: 256,
      minzoom: minCachedTileZoom,
      maxzoom: cachedTileZoom,
      attribution: "Elevation: AWS Terrain Tiles, SRTM/GMTED"
    }
  },
  layers: [
    {
      id: "gaixia-world-imagery",
      type: "raster",
      source: "gaixia-world-imagery",
      paint: {
        "raster-brightness-min": 0.04,
        "raster-brightness-max": 0.92,
        "raster-contrast": 0.14,
        "raster-saturation": -0.06
      }
    },
    {
      id: "gaixia-dem-hillshade",
      type: "hillshade",
      source: "gaixia-real-dem",
      paint: {
        "hillshade-accent-color": "#5f7346",
        "hillshade-exaggeration": 0.22,
        "hillshade-highlight-color": "#f7e7b9",
        "hillshade-shadow-color": "#263325"
      }
    }
  ],
  terrain: {
    source: "gaixia-real-dem",
    exaggeration: 1
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

function formationFrontSamples(points: TacticalPoint[], count: number) {
  if (points.length < 2) {
    return points;
  }

  return Array.from({ length: count }, (_, index) => pointAtRatio(points, count === 1 ? 0 : index / (count - 1)));
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

function formationArcPoints(points: TacticalPoint[], count: number, depth = 18) {
  const samples = formationFrontSamples(points, count);
  const center = samples.reduce(
    (sum, point) => [sum[0] + point[0] / samples.length, sum[1] + point[1] / samples.length] as TacticalPoint,
    [0, 0]
  );
  return samples.map((point, index) => {
    const ratio = count === 1 ? 0 : index / (count - 1);
    const bow = Math.sin(ratio * Math.PI) * depth;
    const direction = point[0] < center[0] ? -1 : 1;
    return [point[0] + direction * bow * 0.2, point[1] - bow] as TacticalPoint;
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

function isTacticalGraphicVisible(graphic: GaixiaTacticalGraphic, progress: number, dateToProgress: (date: string) => number) {
  return !graphic.revealAt || progress >= dateToProgress(graphic.revealAt);
}

function isFieldworkVisible(fieldwork: GaixiaFieldwork, progress: number, dateToProgress: (date: string) => number) {
  return !fieldwork.revealAt || progress >= dateToProgress(fieldwork.revealAt);
}

function isFormationVisible(formation: GaixiaFormation, progress: number, dateToProgress: (date: string) => number) {
  const start = dateToProgress(formation.start);
  const end = formation.end ? dateToProgress(formation.end) : 1;
  return progress >= start && progress <= end;
}

function routeUnitOffsets(route: GaixiaRoute) {
  const addDepth = (offsets: TacticalPoint[], additions: TacticalPoint[]) => {
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
    ] as TacticalPoint[];
  }

  if (route.unitKind.includes("crossbow")) {
    return [
      [0, 0],
      [22, -12],
      [-34, 26]
    ] as TacticalPoint[];
  }

  return [
    [0, 0],
    [-38, 28]
  ] as TacticalPoint[];
}

function reliefElevationAtPoint(point: TacticalPoint) {
  const distances = terrainReliefSurfaces.map((surface) => {
    const distanceToSurface = surface.points.reduce((minimum, surfacePoint) => {
      const distanceToPoint = Math.hypot(surfacePoint[0] - point[0], surfacePoint[1] - point[1]);
      return Math.min(minimum, distanceToPoint);
    }, Number.POSITIVE_INFINITY);
    return { distance: distanceToSurface, surface };
  });
  const nearest = distances.sort((a, b) => a.distance - b.distance)[0]?.surface;
  return nearest?.elevation ?? 30;
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

function projectEffectPlacement(map: maplibregl.Map, placement: GaixiaTerrainEffectPlacement): GaixiaTerrainEffectPlacement | null {
  const point = projectPoint(map, placement.point);
  if (!point) {
    return null;
  }
  return {
    ...placement,
    chuPoint: placement.chuPoint ? projectPoint(map, placement.chuPoint) ?? undefined : undefined,
    hanPoint: placement.hanPoint ? projectPoint(map, placement.hanPoint) ?? undefined : undefined,
    point
  };
}

function mapPointLabelPlacement(pointId: string) {
  if (["dongcheng", "wujiang-road"].includes(pointId)) {
    return { anchor: "end" as const, dx: -10 };
  }
  return { anchor: "start" as const, dx: 9 };
}

function formationDepthConfig(formation: GaixiaFormation) {
  if (formation.kind === "infantry-block") {
    return formation.faction === "chu" ? { columns: 7, rows: 6, spacing: 11 } : { columns: 6, rows: 4, spacing: 10 };
  }
  if (formation.kind === "crossbow-line") {
    return { columns: 12, rows: 2, spacing: 12 };
  }
  if (formation.kind === "cavalry-screen") {
    return { columns: 8, rows: 2, spacing: 16 };
  }
  if (formation.kind === "ambush-line") {
    return { columns: 9, rows: 2, spacing: 15 };
  }
  return { columns: 4, rows: 2, spacing: 10 };
}

function projectFormation(map: maplibregl.Map, formation: GaixiaFormation) {
  const points = projectLine(map, formation.coordinates);
  const labelPoint = projectPoint(map, formation.labelCoordinates);
  const frontPoints = formation.kind === "infantry-block" ? points.slice(0, 2) : points;
  const depth = formationDepthConfig(formation);
  const rankPoints =
    formation.kind === "infantry-block"
      ? formationDepthRows(frontPoints, depth.rows, depth.columns, depth.spacing)
      : formation.kind === "crossbow-line"
        ? formationDepthRows(points, depth.rows, depth.columns, depth.spacing)
        : formation.kind === "cavalry-screen"
          ? formationArcPoints(points, 8, 28)
          : formation.kind === "ambush-line"
            ? formationArcPoints(points, 9, 24)
            : formationGridPoints(points, 2, 4);
  const rankGuides =
    formation.kind === "infantry-block"
      ? formationRankGuides(frontPoints, depth.rows, depth.spacing)
      : formation.kind === "crossbow-line"
        ? formationRankGuides(points, 2, 12)
        : [];

  return { ...formation, labelPoint, points, rankGuides, rankPoints };
}

function computeOverlayGeometry({
  activeEffectPlacement,
  activeEvent,
  map,
  progress,
  projectedRoutes
}: {
  activeEffectPlacement: GaixiaTerrainEffectPlacement;
  activeEvent: GaixiaEvent;
  map: maplibregl.Map;
  progress: number;
  projectedRoutes: GaixiaTerrainRouteState[];
}) {
  const dateToProgress = (date: string) => {
    const [datePart, timePart = "00:00"] = date.replace("BCE-", "").split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute = 0] = timePart.split(":").map(Number);
    const totalMinutes = ((month - 1) * 31 + day) * 24 * 60 + hour * 60 + minute;
    const startMinutes = ((12 - 1) * 31 + 1) * 24 * 60 + 16 * 60;
    const endMinutes = ((12 - 1) * 31 + 2) * 24 * 60 + 8 * 60;
    return clamp((totalMinutes - startMinutes) / Math.max(1, endMinutes - startMinutes));
  };

  return {
    activeEffectPlacement: projectEffectPlacement(map, activeEffectPlacement),
    ambushSectors: ambushSectors.map((sector) => ({
      id: sector.id,
      label: sector.label,
      points: projectLine(map, sector.points),
      side: sector.side
    })),
    campFortifications: campFortifications.map((fortification) => ({
      id: fortification.id,
      label: fortification.label,
      labelPoint: projectPoint(map, fortification.labelCoordinates),
      points: projectLine(map, fortification.coordinates)
    })),
    eventPins: battleEvents.map((event) => ({
      id: event.id,
      isCurrent: event.id === activeEvent.id,
      passed: dateToProgress(event.date) <= progress,
      point: projectPoint(map, event.coordinates),
      title: event.title
    })),
    fieldworks: fieldworks
      .filter((fieldwork) => isFieldworkVisible(fieldwork, progress, dateToProgress))
      .map((fieldwork) => ({ ...fieldwork, labelPoint: projectPoint(map, fieldwork.labelCoordinates), points: projectLine(map, fieldwork.coordinates) })),
    formations: formations.filter((formation) => isFormationVisible(formation, progress, dateToProgress)).map((formation) => projectFormation(map, formation)),
    historicalRegions: historicalRegions.map((region) => ({
      id: region.id,
      kind: region.kind,
      label: region.label,
      labelPoint: projectPoint(map, region.labelCoordinates),
      points: projectLine(map, region.coordinates)
    })),
    mapPoints: mapPoints.map((point) => ({
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
    routes: projectedRoutes.map((state) => ({
      ...state,
      labelPoint: projectPoint(map, state.labelPoint),
      markerPoint: projectPoint(map, state.markerPoint),
      visiblePoints: projectLine(map, state.visiblePoints)
    })),
    tacticalGraphics: tacticalGraphics
      .filter((graphic) => isTacticalGraphicVisible(graphic, progress, dateToProgress))
      .map((graphic) => ({ ...graphic, labelPoint: projectPoint(map, graphic.labelCoordinates), points: projectLine(map, graphic.points) })),
    terrainContours: terrainContours.map((contour) => {
      const points = projectLine(map, contour.points);
      return {
        elevation: contour.elevation,
        id: contour.id,
        kind: contour.kind,
        label: contour.label,
        labelPoint: points[Math.floor(points.length / 2)] ?? null,
        points
      };
    }),
    terrainLabels: terrainLabels.map((label) => ({
      id: label.id,
      kind: label.kind,
      label: label.label,
      point: projectPoint(map, label.coordinates)
    })),
    terrainReliefSurfaces: terrainReliefSurfaces.map((surface) => ({
      elevation: surface.elevation,
      id: surface.id,
      kind: surface.kind,
      label: surface.label,
      labelPoint: projectPoint(map, surface.labelCoordinates),
      points: projectLine(map, surface.points),
      tacticalRole: surface.tacticalRole
    }))
  } satisfies OverlayGeometry;
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

function ActiveEffect({ event, placement }: { event: GaixiaEvent; placement: GaixiaTerrainEffectPlacement }) {
  const point = placement.point;
  if (event.cue === "song") {
    return (
      <g className="gaixia-song-effect" data-effect-source={placement.source} data-testid="gaixia-song-effect" transform={`translate(${point[0]} ${point[1]})`}>
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
      {placement.hanPoint && placement.chuPoint && <path className="gaixia-contact-tether" d={buildPath([placement.hanPoint, point, placement.chuPoint])} />}
      <circle r="28" />
      <circle r="48" />
      <path d="M -24 -24 L 24 24 M 24 -24 L -24 24" />
    </g>
  );
}

function OverlayFieldwork({ fieldwork }: { fieldwork: OverlayGeometry["fieldworks"][number] }) {
  const isClosed = fieldwork.kind === "earthwork";
  const cornerPoints = isClosed ? fieldwork.points.filter((_, index) => index % 2 === 0) : [];
  const midpoints = fieldwork.points.slice(0, -1).map((point, index) => midpoint(point, fieldwork.points[index + 1]));
  return (
    <g className={`gaixia-fieldwork gaixia-fieldwork-${fieldwork.kind}`} data-testid={`gaixia-fieldwork-${fieldwork.id}`}>
      <path className="gaixia-fieldwork-shadow" d={`${buildPath(fieldwork.points)}${isClosed ? " Z" : ""}`} />
      <path className="gaixia-fieldwork-body" d={`${buildPath(fieldwork.points)}${isClosed ? " Z" : ""}`} />
      {isClosed &&
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
      {fieldwork.kind === "gate" &&
        fieldwork.points.map((point, index) => (
          <g key={`${fieldwork.id}-post-${index}`} className="gaixia-fieldwork-icon gaixia-gate-post" transform={`translate(${point[0]} ${point[1]})`}>
            <rect x="-5" y="-13" width="10" height="22" />
            <path d="M -7 -13 L 0 -20 L 7 -13 Z" />
            <path d="M -5 9 L 5 9 L 9 15 L -1 15 Z" />
          </g>
        ))}
      {fieldwork.kind === "camp-line" &&
        midpoints.map((point, index) => (
          <g key={`${fieldwork.id}-tent-${index}`} className="gaixia-fieldwork-icon gaixia-camp-tent" transform={`translate(${point[0]} ${point[1]})`}>
            <path d="M -10 9 L 0 -10 L 10 9 Z" />
            <path d="M 0 -10 L 0 9" />
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

function OverlayFormation({ formation }: { formation: OverlayGeometry["formations"][number] }) {
  const isArea = formation.kind === "infantry-block" || formation.kind === "command-post";
  const iconPoints = isArea ? formation.points : formation.points.slice(0, -1).map((point, index) => midpoint(point, formation.points[index + 1]));
  const frontPoints = formation.kind === "infantry-block" ? formation.points.slice(0, 2) : formation.points;
  return (
    <g className={`gaixia-formation gaixia-formation-${formation.faction} gaixia-formation-${formation.kind}`} data-formation-kind={formation.kind} data-testid={`gaixia-formation-${formation.id}`}>
      <path className="gaixia-formation-shadow" d={`${buildPath(formation.points)}${isArea ? " Z" : ""}`} />
      <path className="gaixia-formation-body" d={`${buildPath(formation.points)}${isArea ? " Z" : ""}`} />
      <path className="gaixia-formation-front-line" d={buildPath(frontPoints)} />
      {formation.rankGuides.map((guide, index) => (
        <path key={`${formation.id}-guide-${index}`} className="gaixia-formation-rank-guide" d={buildPath(guide)} />
      ))}
      <g className="gaixia-formation-ranks" data-testid={`gaixia-formation-ranks-${formation.id}`}>
        {formation.rankPoints.map((point, index) => (
          <circle
            key={`${formation.id}-rank-${index}`}
            className={`gaixia-formation-rank-dot gaixia-formation-rank-dot-${formation.kind}`}
            cx={point[0]}
            cy={point[1]}
            r={formation.kind === "infantry-block" ? 2.8 : formation.kind === "crossbow-line" ? 2.4 : 3}
          />
        ))}
      </g>
      {formation.kind === "infantry-block" && frontPoints[0] && (
        <g className="gaixia-formation-icon gaixia-formation-front-standard" transform={`translate(${frontPoints[0][0]} ${frontPoints[0][1] - 12})`}>
          <path d="M 0 -18 L 0 16" />
          <path d="M 0 -18 L 15 -12 L 0 -6 Z" />
        </g>
      )}
      {formation.kind === "crossbow-line" &&
        formation.points.map((point, index) => (
          <g key={`${formation.id}-crossbow-${index}`} className="gaixia-formation-icon gaixia-formation-crossbow-icon" transform={`translate(${point[0]} ${point[1]})`}>
            <path className="gaixia-formation-chevron" d="M -11 5 L 0 -7 L 11 5" />
            <path d="M -12 2 L 12 2 M 0 -8 L 0 10 M -6 8 L 6 8" />
          </g>
        ))}
      {formation.kind === "cavalry-screen" &&
        formation.points.map((point, index) => (
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
      {formation.kind === "command-post" && formation.labelPoint && (
        <g className="gaixia-formation-icon gaixia-formation-command-icon" transform={`translate(${formation.labelPoint[0]} ${formation.labelPoint[1]})`}>
          <path d="M 0 -18 L 0 12" />
          <path d="M 0 -18 L 18 -10 L 0 -2 Z" />
          <circle cx="0" cy="14" r="5" />
        </g>
      )}
      {formation.labelPoint && (
        <text x={formation.labelPoint[0]} y={formation.labelPoint[1] - 12}>
          {formation.label}
        </text>
      )}
    </g>
  );
}

function GaixiaTacticalOverlay({
  activeEvent,
  activeRouteIds,
  geometry
}: {
  activeEvent: GaixiaEvent;
  activeRouteIds: Set<string>;
  geometry: OverlayGeometry;
}) {
  return (
    <svg className="gaixia-maplibre-tactical-overlay" data-testid="gaixia-maplibre-tactical-overlay" data-projection="maplibre-real-terrain" aria-hidden="true">
      <defs>
        <filter id="gaixiaUnitGlow" x="-60%" y="-70%" width="220%" height="230%">
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#ffd36f" floodOpacity="0.44" />
          <feDropShadow dx="0" dy="7" stdDeviation="5" floodColor="#0b0d0b" floodOpacity="0.5" />
        </filter>
      </defs>
      <g className="gaixia-terrain-base" data-testid="gaixia-terrain-layer">
        <g className="gaixia-relief-layer" data-testid="gaixia-relief-terrain-layer" data-render-mode="maplibre-geographic-reference">
          {geometry.terrainReliefSurfaces.map((surface) => (
            <g key={surface.id} className={`gaixia-relief-surface gaixia-relief-${surface.kind} gaixia-relief-role-${surface.tacticalRole}`} data-elevation={surface.elevation} data-testid={`gaixia-relief-${surface.id}`}>
              <path className="gaixia-relief-rim" d={`${buildPath(surface.points)} Z`} />
              {surface.labelPoint && (
                <text x={surface.labelPoint[0]} y={surface.labelPoint[1] - 12}>
                  {surface.label} {surface.elevation}m
                </text>
              )}
            </g>
          ))}
        </g>
        <g className="gaixia-contour-layer" data-testid="gaixia-contour-layer">
          {geometry.terrainContours.map((contour) => (
            <g key={contour.id} className={`gaixia-contour gaixia-contour-${contour.kind}`} data-elevation={contour.elevation} data-terrain-kind={contour.kind} data-testid={`gaixia-terrain-${contour.id}`}>
              <path className="gaixia-contour-buffer" d={buildPath(contour.points)} />
              <path className="gaixia-contour-line" d={buildPath(contour.points)} />
              {contour.labelPoint && (
                <text x={contour.labelPoint[0] + 6} y={contour.labelPoint[1] - 6}>
                  {contour.label} {contour.elevation}m
                </text>
              )}
            </g>
          ))}
        </g>
        <g className="gaixia-terrain-labels">
          {geometry.terrainLabels.map(
            (label) =>
              label.point && (
                <text key={label.id} className={`gaixia-terrain-label gaixia-terrain-label-${label.kind}`} x={label.point[0]} y={label.point[1]}>
                  {label.label}
                </text>
              )
          )}
        </g>
      </g>

      <g className="gaixia-tactical-graphics" data-testid="gaixia-tactical-graphics-layer">
        {geometry.tacticalGraphics.map((graphic) => (
          <g key={graphic.id} className={`gaixia-tactical-graphic gaixia-tactical-graphic-${graphic.kind}`} data-testid={`gaixia-tactical-graphic-${graphic.id}`}>
            <path d={`${buildPath(graphic.points)}${graphic.kind === "engagement-area" ? " Z" : ""}`} />
            {graphic.kind === "key-terrain" && graphic.points.map((point, index) => <circle key={`${graphic.id}-${index}`} cx={point[0]} cy={point[1]} r="4.5" />)}
            {graphic.labelPoint && (
              <text x={graphic.labelPoint[0]} y={graphic.labelPoint[1] - 10}>
                {graphic.label}
              </text>
            )}
          </g>
        ))}
      </g>

      <g className="gaixia-regions">
        {geometry.historicalRegions.map((region) => (
          <g key={region.id} className={`gaixia-region gaixia-region-${region.kind}`} data-testid={`gaixia-region-${region.id}`}>
            <path d={`${buildPath(region.points)} Z`} />
            {region.labelPoint && (
              <text x={region.labelPoint[0]} y={region.labelPoint[1]}>
                {region.label}
              </text>
            )}
          </g>
        ))}
      </g>

      <g className="gaixia-rivers" data-testid="gaixia-river-layer">
        {geometry.rivers.map((river) => (
          <g key={river.id} className="gaixia-river">
            <path className="gaixia-river-bank" d={buildPath(river.points)} />
            <path className="gaixia-river-water" d={buildPath(river.points)} />
            <path className="gaixia-river-highlight" d={buildPath(river.points)} />
            {river.labelPoint && (
              <text x={river.labelPoint[0] + 10} y={river.labelPoint[1] - 8}>
                {river.label}
              </text>
            )}
          </g>
        ))}
      </g>

      <g className="gaixia-fortifications" data-testid="gaixia-fortification-layer">
        {geometry.campFortifications.map((fortification) => (
          <g key={fortification.id} className={`gaixia-camp-fortification gaixia-camp-fortification-${fortification.id}`}>
            <path d={`${buildPath(fortification.points)} Z`} />
            {fortification.labelPoint && (
              <text x={fortification.labelPoint[0]} y={fortification.labelPoint[1]}>
                {fortification.label}
              </text>
            )}
          </g>
        ))}
      </g>

      <g className="gaixia-fieldworks" data-testid="gaixia-fieldwork-layer">
        {geometry.fieldworks.map((fieldwork) => (
          <OverlayFieldwork key={fieldwork.id} fieldwork={fieldwork} />
        ))}
      </g>

      <g className="gaixia-formations" data-testid="gaixia-formation-layer">
        {geometry.formations.map((formation) => (
          <OverlayFormation key={formation.id} formation={formation} />
        ))}
      </g>

      <g className="gaixia-ambush-sectors" data-testid="gaixia-ambush-sector-layer">
        {geometry.ambushSectors.map((sector) => (
          <g key={sector.id} className={`gaixia-ambush-sector gaixia-ambush-sector-${sector.side}`}>
            <path d={buildPath(sector.points)} />
            {sector.points[Math.floor(sector.points.length / 2)] && (
              <text x={sector.points[Math.floor(sector.points.length / 2)][0]} y={sector.points[Math.floor(sector.points.length / 2)][1] - 10}>
                {sector.label}
              </text>
            )}
          </g>
        ))}
      </g>

      <g className="gaixia-routes">
        {geometry.routes.map((state) => {
          const { active, facingX, isComplete, isVisible, labelPoint, markerPoint, route, routeProgress, showUnits, visiblePoints } = state;
          if (!isVisible || visiblePoints.length < 2 || !markerPoint) {
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
              <path className="gaixia-route-line" d={buildPath(visiblePoints)} />
              <path className="gaixia-route-highlight" d={buildPath(visiblePoints)} />
              {active && (route.routeKind === "ambush" || route.routeKind === "pursuit") && <circle className="gaixia-ambush-pulse" cx={markerPoint[0]} cy={markerPoint[1]} r={route.routeKind === "pursuit" ? 14 : 18} />}
              {showUnits &&
                routeUnitOffsets(route).map((offset, index) => (
                  <g
                    key={`${route.id}-unit-${index}`}
                    className="gaixia-unit-holder"
                    data-ground-elevation={reliefElevationAtPoint(state.markerPoint ?? route.points[0]).toFixed(0)}
                    data-testid={`gaixia-route-unit-${route.id}-${index}`}
                    transform={`translate(${markerPoint[0] + offset[0]} ${markerPoint[1] + offset[1]})`}
                  >
                    <GaixiaUnitIcon kind={route.unitKind} facingX={facingX} />
                  </g>
                ))}
              {labelPoint && (
                <text className="gaixia-route-label" x={labelPoint[0] + labelOffset[0]} y={labelPoint[1] + labelOffset[1]}>
                  {route.label}
                </text>
              )}
            </g>
          );
        })}
      </g>

      <g className="gaixia-points">
        {geometry.mapPoints.map(
          (point) => {
            if (!point.point) {
              return null;
            }
            const labelPlacement = mapPointLabelPlacement(point.id);
            return (
              <g key={point.id} className={`gaixia-point gaixia-point-${point.kind}`} data-testid={`gaixia-point-${point.id}`}>
                <circle cx={point.point[0]} cy={point.point[1]} r={point.kind === "camp" ? 6 : 4} />
                <text x={point.point[0] + labelPlacement.dx} y={point.point[1] + 4} textAnchor={labelPlacement.anchor}>
                  {point.label}
                </text>
              </g>
            );
          }
        )}
      </g>

      <g className="gaixia-event-effects">
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

export function GaixiaTerrain3D({ activeEffectPlacement, activeEvent, activeRouteIds, focusCoordinates, focusRoutePoints, mapTransform, progress, projectedRoutes }: GaixiaTerrain3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [geometry, setGeometry] = useState<OverlayGeometry | null>(null);
  const latestStateRef = useRef({ activeEffectPlacement, progress, projectedRoutes });

  latestStateRef.current = { activeEffectPlacement, progress, projectedRoutes };

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
          activeEvent,
          map,
          progress: latest.progress,
          projectedRoutes: latest.projectedRoutes
        })
      );
    },
    []
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const initialCamera = cameraForTransform(mapTransform, focusCoordinates);
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
      maxBounds: gaixiaBounds,
      maxPitch: 62,
      maxZoom: 14.3,
      minZoom: 10.6,
      pitch: initialCamera.pitch,
      refreshExpiredTiles: false,
      scrollZoom: false,
      style: gaixiaTerrainStyle,
      touchPitch: false,
      touchZoomRotate: false,
      zoom: initialCamera.zoom
    });
    mapRef.current = map;

    const syncMetadata = () => {
      markMapCanvas(container, map);
      container.dataset.terrainLoaded = map.loaded() ? "true" : "false";
      syncOverlayGeometry();
    };
    markMapCanvas(container, map);

    map.once("load", () => {
      map.setTerrain({ source: "gaixia-real-dem", exaggeration: 1 });
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
    const camera = cameraForTransform(mapTransform, focusCoordinates);
    if (focusRoutePoints.length > 1) {
      const longitudes = focusRoutePoints.map((point) => point[0]);
      const latitudes = focusRoutePoints.map((point) => point[1]);
      const west = Math.max(gaixiaBounds[0][0], Math.min(...longitudes) - 0.085);
      const east = Math.min(gaixiaBounds[1][0], Math.max(...longitudes) + 0.15);
      const south = Math.max(gaixiaBounds[0][1], Math.min(...latitudes) - 0.085);
      const north = Math.min(gaixiaBounds[1][1], Math.max(...latitudes) + 0.085);
      const boundsCamera = map.cameraForBounds(
        [
          [west, south],
          [east, north]
        ],
        {
          bearing: camera.bearing,
          padding: { bottom: 220, left: 230, right: 430, top: 205 },
          pitch: camera.pitch
        }
      );
      map.jumpTo({
        bearing: camera.bearing,
        center: boundsCamera?.center ?? camera.center,
        pitch: camera.pitch,
        zoom: Math.max(10.45, Math.min(12.75, (boundsCamera?.zoom ?? camera.zoom) - 0.04))
      });
    } else {
      map.jumpTo(camera);
    }
    syncOverlayGeometry();
  }, [focusCoordinates, focusRoutePoints, mapTransform, syncOverlayGeometry]);

  useEffect(() => {
    syncOverlayGeometry();
  }, [activeEffectPlacement, progress, projectedRoutes, syncOverlayGeometry]);

  return (
    <div
      ref={containerRef}
      className="gaixia-terrain-3d"
      data-testid="gaixia-terrain-3d"
      data-renderer="maplibre-real-terrain"
      data-tactical-renderer="maplibre-geographic-overlay"
      data-terrain-model="real-dem-raster-terrain"
      data-terrain-exaggeration="1"
      data-terrain-source={terrainTileUrl}
      data-imagery-source={imageryTileUrl}
      data-tile-cache-zoom={`${cachedTileZoom}`}
      data-projection="webgl-gis-terrain"
    >
      {geometry && <GaixiaTacticalOverlay activeEvent={activeEvent} activeRouteIds={activeRouteIds} geometry={geometry} />}
    </div>
  );
}
