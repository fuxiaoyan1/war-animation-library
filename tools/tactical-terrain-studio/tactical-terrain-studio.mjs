#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const earthRadiusMeters = 6371008.8;
const defaultViewport = { width: 1412, height: 796 };
const defaultTileSize = 512;

function usage() {
  return [
    "Usage:",
    "  node tools/tactical-terrain-studio/tactical-terrain-studio.mjs --spec <file> --out <dir>",
    "",
    "Options:",
    "  --spec <file>       Tactical terrain spec JSON.",
    "  --out <dir>         Output artifact directory.",
    "  --strict            Exit non-zero when the audit has warnings.",
    "  --help              Show this help."
  ].join("\n");
}

function parseArgs(argv) {
  const args = { strict: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }
    if (arg === "--strict") {
      args.strict = true;
      continue;
    }
    if (arg === "--spec" || arg === "--out") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for ${arg}`);
      }
      args[arg.slice(2)] = value;
      index += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value);
}

function assertArray(value, name) {
  if (!Array.isArray(value)) {
    throw new Error(`${name} must be an array`);
  }
}

function assertPoint(point, name) {
  if (!Array.isArray(point) || point.length !== 2 || !point.every(Number.isFinite)) {
    throw new Error(`${name} must be [lng, lat]`);
  }
}

function validateSpec(spec) {
  if (!spec || typeof spec !== "object") {
    throw new Error("Spec must be a JSON object");
  }
  if (!spec.battle?.id) {
    throw new Error("Spec requires battle.id");
  }
  if (!spec.map?.bounds || spec.map.bounds.length !== 4) {
    throw new Error("Spec requires map.bounds = [west, south, east, north]");
  }
  if (!spec.map.bounds.every(Number.isFinite)) {
    throw new Error("map.bounds must contain finite numbers");
  }
  assertArray(spec.features ?? [], "features");
  assertArray(spec.routes ?? [], "routes");
  assertArray(spec.unitSets ?? [], "unitSets");
  assertArray(spec.cameraStages ?? [], "cameraStages");
  for (const feature of spec.features ?? []) {
    if (!feature.id || !feature.type) {
      throw new Error("Every feature requires id and type");
    }
    assertArray(feature.points, `feature ${feature.id}.points`);
    feature.points.forEach((point, index) => assertPoint(point, `feature ${feature.id}.points[${index}]`));
  }
  for (const route of spec.routes ?? []) {
    if (!route.id || !route.faction) {
      throw new Error("Every route requires id and faction");
    }
    assertArray(route.points, `route ${route.id}.points`);
    route.points.forEach((point, index) => assertPoint(point, `route ${route.id}.points[${index}]`));
  }
  for (const formation of spec.formations ?? []) {
    if (!formation.id || !formation.faction) {
      throw new Error("Every formation requires id and faction");
    }
    assertArray(formation.points, `formation ${formation.id}.points`);
    formation.points.forEach((point, index) => assertPoint(point, `formation ${formation.id}.points[${index}]`));
  }
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function haversineMeters(a, b) {
  const lat1 = toRadians(a[1]);
  const lat2 = toRadians(b[1]);
  const deltaLat = lat2 - lat1;
  const deltaLng = toRadians(b[0] - a[0]);
  const sinLat = Math.sin(deltaLat / 2);
  const sinLng = Math.sin(deltaLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * earthRadiusMeters * Math.asin(Math.min(1, Math.sqrt(h)));
}

function lineLengthMeters(points) {
  return points.slice(0, -1).reduce((sum, point, index) => sum + haversineMeters(point, points[index + 1]), 0);
}

function bboxForPoints(points) {
  const lngs = points.map((point) => point[0]);
  const lats = points.map((point) => point[1]);
  return {
    east: Math.max(...lngs),
    north: Math.max(...lats),
    south: Math.min(...lats),
    west: Math.min(...lngs)
  };
}

function bboxToArray(bbox) {
  return [bbox.west, bbox.south, bbox.east, bbox.north];
}

function padBbox(bbox, ratio = 0.08) {
  const width = Math.max(0.00001, bbox.east - bbox.west);
  const height = Math.max(0.00001, bbox.north - bbox.south);
  return {
    east: bbox.east + width * ratio,
    north: bbox.north + height * ratio,
    south: bbox.south - height * ratio,
    west: bbox.west - width * ratio
  };
}

function mergeBboxes(boxes) {
  const filtered = boxes.filter(Boolean);
  if (!filtered.length) {
    return null;
  }
  return {
    east: Math.max(...filtered.map((bbox) => bbox.east)),
    north: Math.max(...filtered.map((bbox) => bbox.north)),
    south: Math.min(...filtered.map((bbox) => bbox.south)),
    west: Math.min(...filtered.map((bbox) => bbox.west))
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lonLatToTile(point, zoom) {
  const [lng, lat] = point;
  const latRad = toRadians(clamp(lat, -85.05112878, 85.05112878));
  const scale = 2 ** zoom;
  const x = Math.floor(((lng + 180) / 360) * scale);
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * scale);
  return { x, y, z: zoom };
}

function tileCoverage(bounds, minZoom, maxZoom) {
  const [west, south, east, north] = bounds;
  const coverage = [];
  for (let zoom = minZoom; zoom <= maxZoom; zoom += 1) {
    const nw = lonLatToTile([west, north], zoom);
    const se = lonLatToTile([east, south], zoom);
    const xMin = Math.min(nw.x, se.x);
    const xMax = Math.max(nw.x, se.x);
    const yMin = Math.min(nw.y, se.y);
    const yMax = Math.max(nw.y, se.y);
    coverage.push({
      count: (xMax - xMin + 1) * (yMax - yMin + 1),
      xMax,
      xMin,
      yMax,
      yMin,
      z: zoom
    });
  }
  return coverage;
}

function mercatorY(lat) {
  const latRad = toRadians(clamp(lat, -85.05112878, 85.05112878));
  return (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2;
}

function recommendedZoomForBbox(bbox, viewport = defaultViewport, tileSize = defaultTileSize) {
  const lngSpan = Math.max(0.00001, bbox.east - bbox.west);
  const ySpan = Math.max(0.00001, Math.abs(mercatorY(bbox.north) - mercatorY(bbox.south)));
  const zoomX = Math.log2(viewport.width / ((lngSpan / 360) * tileSize));
  const zoomY = Math.log2(viewport.height / (ySpan * tileSize));
  return Math.min(zoomX, zoomY);
}

function metersForBbox(bbox) {
  const midLat = (bbox.north + bbox.south) / 2;
  return {
    height: haversineMeters([bbox.west, bbox.south], [bbox.west, bbox.north]),
    width: haversineMeters([bbox.west, midLat], [bbox.east, midLat])
  };
}

function bboxAreaMeters(bbox) {
  const meters = metersForBbox(bbox);
  return Math.max(1, meters.width * meters.height);
}

function bboxContainsPoint(bbox, point) {
  return point[0] >= bbox.west && point[0] <= bbox.east && point[1] >= bbox.south && point[1] <= bbox.north;
}

function bboxContainsBbox(outer, inner) {
  return (
    inner.west >= outer.west &&
    inner.east <= outer.east &&
    inner.south >= outer.south &&
    inner.north <= outer.north
  );
}

function pointInPolygon(point, polygon) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const xi = polygon[index][0];
    const yi = polygon[index][1];
    const xj = polygon[previous][0];
    const yj = polygon[previous][1];
    const intersects = yi > point[1] !== yj > point[1] && point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi || 1e-12) + xi;
    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
}

function orientation(a, b, c) {
  const value = (b[1] - a[1]) * (c[0] - b[0]) - (b[0] - a[0]) * (c[1] - b[1]);
  if (Math.abs(value) < 1e-12) {
    return 0;
  }
  return value > 0 ? 1 : 2;
}

function onSegment(a, b, c) {
  return (
    b[0] <= Math.max(a[0], c[0]) + 1e-12 &&
    b[0] >= Math.min(a[0], c[0]) - 1e-12 &&
    b[1] <= Math.max(a[1], c[1]) + 1e-12 &&
    b[1] >= Math.min(a[1], c[1]) - 1e-12
  );
}

function segmentsIntersect(a, b, c, d) {
  const o1 = orientation(a, b, c);
  const o2 = orientation(a, b, d);
  const o3 = orientation(c, d, a);
  const o4 = orientation(c, d, b);
  if (o1 !== o2 && o3 !== o4) {
    return true;
  }
  return (
    (o1 === 0 && onSegment(a, c, b)) ||
    (o2 === 0 && onSegment(a, d, b)) ||
    (o3 === 0 && onSegment(c, a, d)) ||
    (o4 === 0 && onSegment(c, b, d))
  );
}

function lineIntersectsPolygon(line, polygon) {
  if (line.some((point) => pointInPolygon(point, polygon))) {
    return true;
  }
  const closed = [...polygon, polygon[0]];
  for (let lineIndex = 0; lineIndex < line.length - 1; lineIndex += 1) {
    for (let polyIndex = 0; polyIndex < closed.length - 1; polyIndex += 1) {
      if (segmentsIntersect(line[lineIndex], line[lineIndex + 1], closed[polyIndex], closed[polyIndex + 1])) {
        return true;
      }
    }
  }
  return false;
}

function lineIntersectsLine(a, b) {
  for (let aIndex = 0; aIndex < a.length - 1; aIndex += 1) {
    for (let bIndex = 0; bIndex < b.length - 1; bIndex += 1) {
      if (segmentsIntersect(a[aIndex], a[aIndex + 1], b[bIndex], b[bIndex + 1])) {
        return true;
      }
    }
  }
  return false;
}

function collectStagePoints(spec, stage) {
  const points = [];
  if (stage.focus) {
    points.push(stage.focus);
  }
  const routeIds = new Set(stage.includeRouteIds ?? []);
  const formationIds = new Set(stage.includeFormationIds ?? []);
  const featureIds = new Set(stage.includeFeatureIds ?? []);
  for (const route of spec.routes ?? []) {
    if (routeIds.has(route.id)) {
      points.push(...route.points);
    }
  }
  for (const formation of spec.formations ?? []) {
    if (formationIds.has(formation.id)) {
      points.push(...formation.points);
    }
  }
  for (const feature of spec.features ?? []) {
    if (featureIds.has(feature.id)) {
      points.push(...feature.points);
    }
  }
  for (const unitSet of spec.unitSets ?? []) {
    if ((unitSet.stages ?? []).includes(stage.id) && unitSet.footprint) {
      const [west, south, east, north] = unitSet.footprint;
      points.push([west, south], [east, north]);
    }
  }
  return points;
}

function buildCameraStages(spec) {
  const viewport = spec.map.renderer?.viewport
    ? { width: spec.map.renderer.viewport[0], height: spec.map.renderer.viewport[1] }
    : defaultViewport;
  return (spec.cameraStages ?? []).map((stage) => {
    const points = collectStagePoints(spec, stage);
    const rawBbox = stage.bounds
      ? { west: stage.bounds[0], south: stage.bounds[1], east: stage.bounds[2], north: stage.bounds[3] }
      : bboxForPoints(points.length ? points : [[spec.map.bounds[0], spec.map.bounds[1]], [spec.map.bounds[2], spec.map.bounds[3]]]);
    const bbox = padBbox(rawBbox, stage.paddingRatio ?? 0.08);
    const zoom = clamp(
      recommendedZoomForBbox(bbox, viewport) + (stage.zoomBias ?? 0),
      spec.map.renderer?.minZoom ?? 9,
      spec.map.renderer?.maxZoom ?? 15
    );
    return {
      bearing: stage.bearing ?? spec.map.renderer?.bearing ?? 0,
      bbox: bboxToArray(bbox),
      center: stage.focus ?? [(bbox.west + bbox.east) / 2, (bbox.south + bbox.north) / 2],
      id: stage.id,
      pitch: stage.pitch ?? spec.map.renderer?.pitch ?? 0,
      sourcePointCount: points.length,
      viewport,
      zoom: Number(zoom.toFixed(2))
    };
  });
}

function buildGeoJson(spec) {
  const features = [];
  for (const feature of spec.features ?? []) {
    features.push({
      type: "Feature",
      id: feature.id,
      properties: {
        avoid: Boolean(feature.avoid),
        id: feature.id,
        kind: feature.kind ?? feature.type,
        label: feature.label ?? feature.id,
        role: feature.role ?? "context"
      },
      geometry: feature.type === "polygon"
        ? { type: "Polygon", coordinates: [[...feature.points, feature.points[0]]] }
        : { type: "LineString", coordinates: feature.points }
    });
  }
  for (const formation of spec.formations ?? []) {
    features.push({
      type: "Feature",
      id: formation.id,
      properties: {
        faction: formation.faction,
        id: formation.id,
        kind: formation.kind ?? "formation",
        label: formation.label ?? formation.id,
        role: "formation"
      },
      geometry: { type: "Polygon", coordinates: [[...formation.points, formation.points[0]]] }
    });
  }
  for (const route of spec.routes ?? []) {
    features.push({
      type: "Feature",
      id: route.id,
      properties: {
        faction: route.faction,
        id: route.id,
        kind: route.kind ?? "route",
        label: route.label ?? route.id,
        role: "route"
      },
      geometry: { type: "LineString", coordinates: route.points }
    });
  }
  return { type: "FeatureCollection", features };
}

function buildMapLibreContract(spec) {
  const tileCache = spec.map.tileCache ?? {};
  return {
    forbiddenRendererPatterns: [
      "standalone CSS-skew battlefield map",
      "SVG-only terrain that is not projected from the geographic camera",
      "modern imagery as visible basemap for historical war animation",
      "dark blurred terrain shadows or default black SVG fills"
    ],
    maplibreStyleSkeleton: {
      terrain: tileCache.terrainTemplate
        ? {
            exaggeration: tileCache.exaggeration ?? 1,
            source: `${spec.battle.id}-real-dem`
          }
        : null,
      sources: {
        [`${spec.battle.id}-historical-tactical-terrain`]: {
          data: "features.geojson",
          type: "geojson"
        },
        ...(tileCache.terrainTemplate
          ? {
              [`${spec.battle.id}-real-dem`]: {
                attribution: tileCache.attribution ?? "DEM source must be documented",
                bounds: spec.map.bounds,
                encoding: tileCache.encoding ?? "terrarium",
                maxzoom: tileCache.maxZoom,
                minzoom: tileCache.minZoom,
                tileSize: tileCache.tileSize ?? 256,
                tiles: [tileCache.terrainTemplate],
                type: "raster-dem"
              }
            }
          : {})
      },
      version: 8
    },
    requiredRuntimeAttributes: {
      "data-modern-imagery-visible": "false",
      "data-projection": "webgl-gis-terrain",
      "data-renderer": "maplibre-real-terrain",
      "data-tactical-renderer": "maplibre-geographic-overlay",
      "data-terrain-model": tileCache.terrainTemplate ? "real-dem-raster-terrain" : "drawn-historical-tactical-terrain",
      "data-visible-basemap": "drawn-historical-tactical-terrain"
    },
    tileTemplate: tileCache.terrainTemplate ?? null
  };
}

function buildSourceDataPackage(spec) {
  const sourceInputs = spec.sourceInputs ?? {};
  const bounds = {
    east: spec.map.bounds[2],
    north: spec.map.bounds[3],
    south: spec.map.bounds[1],
    west: spec.map.bounds[0]
  };
  const allFeatureKinds = new Set((spec.features ?? []).map((feature) => feature.kind ?? feature.type));
  const requiredKinds = sourceInputs.requiredFeatureKinds ?? ["river", "road", "settlement", "high-ground", "camp", "battlefield-boundary"];
  const missingFeatureKinds = requiredKinds.filter((kind) => !allFeatureKinds.has(kind));
  const references = sourceInputs.references ?? [];
  const minReferenceCount = sourceInputs.minReferenceCount ?? 6;
  const requiredReferenceCategories = sourceInputs.requiredReferenceCategories ?? [];
  const referenceCategories = new Set(references.flatMap((reference) => reference.category ? [reference.category] : reference.categories ?? []));
  const missingReferenceCategories = requiredReferenceCategories.filter((category) => !referenceCategories.has(category));
  const modernControlPoints = sourceInputs.modernControlPoints ?? [];
  const historicalMapRefs = sourceInputs.historicalMapRefs ?? [];
  const warnings = [];
  if (!references.length) {
    warnings.push({
      code: "SOURCE_REFERENCES_MISSING",
      message: "Map data package has no source references; battle map cannot be treated as traceable.",
      severity: "warn"
    });
  }
  if (references.length && references.length < minReferenceCount) {
    warnings.push({
      code: "SOURCE_REFERENCE_COUNT_LOW",
      message: `Map data package has only ${references.length} source references; collect a broader source set before treating it as a production base.`,
      severity: "warn",
      value: { actual: references.length, minReferenceCount }
    });
  }
  for (const category of missingReferenceCategories) {
    warnings.push({
      code: "SOURCE_REFERENCE_CATEGORY_MISSING",
      message: `Source package does not yet cover required reference category ${category}.`,
      severity: "warn",
      value: { category }
    });
  }
  if (!modernControlPoints.length) {
    warnings.push({
      code: "CONTROL_POINTS_MISSING",
      message: "No modern coordinate control points are declared for georeferencing.",
      severity: "warn"
    });
  }
  if (!historicalMapRefs.length) {
    warnings.push({
      code: "HISTORICAL_MAP_REFS_MISSING",
      message: "No historical map/reference-map inputs are declared.",
      severity: "warn"
    });
  }
  for (const kind of missingFeatureKinds) {
    warnings.push({
      code: "REQUIRED_FEATURE_KIND_MISSING",
      message: `Source package does not yet contain required feature kind ${kind}.`,
      severity: "info",
      value: { kind }
    });
  }
  return {
    battle: spec.battle,
    bounds: spec.map.bounds,
    featureInventory: [...allFeatureKinds].sort().map((kind) => ({
      count: (spec.features ?? []).filter((feature) => (feature.kind ?? feature.type) === kind).length,
      kind
    })),
    historicalMapRefs,
    minReferenceCount,
    modernControlPoints,
    referenceCategories: [...referenceCategories].sort(),
    references,
    requiredReferenceCategories,
    requiredFeatureKinds: requiredKinds,
    sourceConfidence: sourceInputs.confidence ?? "unknown",
    sourceUncertainties: sourceInputs.uncertainties ?? [],
    stage: "source-map-data-package",
    targetAreaMeters: {
      area: Number(bboxAreaMeters(bounds).toFixed(1)),
      ...Object.fromEntries(Object.entries(metersForBbox(bounds)).map(([key, value]) => [key, Number(value.toFixed(1))]))
    },
    warnings
  };
}

function buildDemTerrainLayer(spec, tileCoverageRows) {
  const tileCache = spec.map.tileCache ?? {};
  const terrainDerivatives = spec.terrainDerivatives ?? {};
  const requiredDerivatives = terrainDerivatives.required ?? [
    "clipped-dem",
    "hillshade",
    "slope",
    "aspect",
    "contours",
    "river-valley",
    "high-ground",
    "movement-corridors",
    "obstacle-zones"
  ];
  const declaredDerivatives = terrainDerivatives.outputs ?? [];
  const declaredIds = new Set(declaredDerivatives.map((item) => item.id ?? item));
  const warnings = [];
  if (!tileCache.terrainTemplate) {
    warnings.push({
      code: "DEM_TILE_TEMPLATE_MISSING",
      message: "No DEM/Terrarium tile template is declared.",
      severity: "warn"
    });
  }
  for (const derivative of requiredDerivatives) {
    if (!declaredIds.has(derivative)) {
      warnings.push({
        code: "TERRAIN_DERIVATIVE_MISSING",
        message: `Terrain derivative ${derivative} is not declared yet.`,
        severity: "info",
        value: { derivative }
      });
    }
  }
  const totalTiles = tileCoverageRows.reduce((sum, row) => sum + row.count, 0);
  return {
    cachePolicy: {
      maxZoom: tileCache.maxZoom ?? null,
      minZoom: tileCache.minZoom ?? null,
      template: tileCache.terrainTemplate ?? null,
      tileSize: tileCache.tileSize ?? 256,
      totalTileEstimate: totalTiles
    },
    demSource: {
      attribution: tileCache.attribution ?? null,
      encoding: tileCache.encoding ?? null,
      needsCrossCheck: terrainDerivatives.needsCrossCheck ?? true
    },
    requiredDerivatives,
    declaredDerivatives,
    deferredEnhancements: terrainDerivatives.deferredEnhancements ?? [],
    stage: "dem-terrain-layer",
    tileCoverage: tileCoverageRows,
    warnings
  };
}

function buildHistoricalTacticalBasemapLayer(spec) {
  const basemap = spec.historicalBasemap ?? {};
  const requiredLayers = basemap.requiredLayers ?? [
    "terrain-faces",
    "river-course",
    "roads-or-tracks",
    "settlements",
    "camps",
    "contours-or-lowland",
    "key-corridors",
    "uncertainty-overlays"
  ];
  const featureKinds = new Set((spec.features ?? []).map((feature) => feature.kind ?? feature.type));
  const declaredLayers = basemap.layers ?? [];
  const declaredIds = new Set(declaredLayers.map((layer) => layer.id ?? layer));
  const warnings = [];
  for (const layer of requiredLayers) {
    if (!declaredIds.has(layer) && !featureKinds.has(layer)) {
      warnings.push({
        code: "TACTICAL_BASEMAP_LAYER_MISSING",
        message: `Historical tactical basemap layer ${layer} is not declared.`,
        severity: "info",
        value: { layer }
      });
    }
  }
  if (basemap.modernImageryVisible === true) {
    warnings.push({
      code: "MODERN_IMAGERY_VISIBLE",
      message: "Modern imagery should be reference-only; final historical tactical basemap must use project visual style.",
      severity: "warn"
    });
  }
  return {
    declaredLayers,
    deferredEnhancements: basemap.deferredEnhancements ?? [],
    forbiddenVisibleLayers: ["modern-satellite-imagery", "modern-street-map-labels", "unscoped-black-svg-fills"],
    requiredLayers,
    stage: "historical-tactical-basemap-layer",
    styleTarget: basemap.styleTarget ?? "project-historical-tactical-map",
    warnings
  };
}

function buildCameraLayer(spec, cameraStages) {
  const warnings = [];
  for (const stage of cameraStages) {
    if (stage.pitch > 78) {
      warnings.push({
        code: "CAMERA_PITCH_TOO_STEEP",
        message: `${stage.id} pitch ${stage.pitch} may expose terrain tile skirts or flatten tactical readability.`,
        severity: "warn",
        stageId: stage.id
      });
    }
    if (stage.sourcePointCount < 2) {
      warnings.push({
        code: "CAMERA_STAGE_UNDERCONSTRAINED",
        message: `${stage.id} camera was derived from too few tactical points.`,
        severity: "warn",
        stageId: stage.id
      });
    }
  }
  return {
    stage: "3d-oblique-camera-layer",
    cameraStages,
    defaults: {
      bearing: spec.map.renderer?.bearing ?? 0,
      maxZoom: spec.map.renderer?.maxZoom ?? 15,
      minZoom: spec.map.renderer?.minZoom ?? 9,
      pitch: spec.map.renderer?.pitch ?? 0
    },
    warnings
  };
}

function getStageDensityStrategy(spec, stageId) {
  const strategies = spec.unitDensityStrategy?.stageStrategies ?? [];
  if (Array.isArray(strategies)) {
    return strategies.find((strategy) => strategy.stageId === stageId) ?? null;
  }
  return strategies[stageId] ?? null;
}

function hasExplicitDensityStrategy(spec, stageId) {
  const strategy = getStageDensityStrategy(spec, stageId);
  return Boolean(strategy?.mode || strategy?.displayMode || strategy?.maxVisibleInstances || strategy?.clusterPolicy || strategy?.lodMode);
}

function buildUnitScaleSolver(spec, densityAudit, cameraStages) {
  const warnings = [];
  const recommendations = [];
  const preserveIndependentControl = spec.unitDensityStrategy?.preserveIndependentControl === true;
  for (const stage of densityAudit.byStage) {
    const cameraStage = cameraStages.find((candidate) => candidate.id === stage.stageId);
    const maxOverlap = Math.max(0, ...stage.unitSets.map((unitSet) => unitSet.overlapIndex));
    const minSpacing = Math.min(...stage.unitSets.map((unitSet) => unitSet.nominalSpacingMeters));
    const densityStrategy = getStageDensityStrategy(spec, stage.stageId);
    const recommendation = {
      densityStrategy: densityStrategy ?? null,
      markerPixelRatio: stage.markerPixelRatio,
      maxOverlapIndex: Number(maxOverlap.toFixed(2)),
      metersPerPixel: stage.metersPerPixel,
      minNominalSpacingMeters: Number(minSpacing.toFixed(1)),
      recommendedActions: [],
      stageId: stage.stageId,
      totalUnits: stage.totalUnits,
      zoom: cameraStage?.zoom ?? null
    };
    if (maxOverlap > 1.15) {
      recommendation.recommendedActions.push("increase-camera-envelope-or-reduce-visible-unit-count");
    }
    if (stage.markerPixelRatio > 0.22) {
      recommendation.recommendedActions.push("switch-to-formation-clusters-or-lod");
    }
    if (stage.metersPerPixel > 18) {
      recommendation.recommendedActions.push("zoom-in-or-increase-unit-marker-size");
    }
    if (!recommendation.recommendedActions.length) {
      recommendation.recommendedActions.push("density-ok-for-current-stage");
    }
    recommendations.push(recommendation);
  }
  const stagesNeedingLod = recommendations.filter((row) => row.recommendedActions.includes("switch-to-formation-clusters-or-lod"));
  const stagesMissingLod = stagesNeedingLod.filter((row) => !hasExplicitDensityStrategy(spec, row.stageId));
  if (stagesMissingLod.length) {
    warnings.push({
      code: "UNIT_LOD_REQUIRED",
      message: `High-density stages need explicit unit LOD or formation-cluster strategies: ${stagesMissingLod.map((row) => row.stageId).join(", ")}.`,
      severity: "warn",
      value: { stageIds: stagesMissingLod.map((row) => row.stageId) }
    });
  }
  if (stagesNeedingLod.length && !preserveIndependentControl) {
    warnings.push({
      code: "UNIT_LOD_INDEPENDENT_CONTROL_UNDECLARED",
      message: "Unit LOD must declare that tactical units keep independent logical positions and headings instead of becoming one block.",
      severity: "warn"
    });
  }
  return {
    densityAudit,
    recommendations,
    strategy: spec.unitDensityStrategy ?? null,
    stage: "unit-scale-solver-layer",
    warnings
  };
}

function buildTerrainPlacementContract(spec) {
  const warnings = [];
  const unitContracts = (spec.unitSets ?? []).map((unitSet) => {
    const marker = unitSet.markerPx ?? [36, 36];
    const minVisiblePx = unitSet.minVisiblePx ?? Math.min(marker[0], marker[1]);
    const lod = unitSet.lod ?? [
      { maxMetersPerPixel: 8, mode: "detailed-billboard-or-lowpoly-token" },
      { maxMetersPerPixel: 20, mode: "formation-token" },
      { maxMetersPerPixel: 9999, mode: "aggregate-formation-surface" }
    ];
    if (minVisiblePx < 24) {
      warnings.push({
        code: "TERRAIN_UNIT_MIN_VISIBLE_TOO_SMALL",
        message: `${unitSet.id} minVisiblePx ${minVisiblePx} is below readable map scale.`,
        severity: "warn",
        unitSetId: unitSet.id
      });
    }
    return {
      anchor: unitSet.anchor ?? "formation-centroid",
      billboardMode: unitSet.billboardMode ?? "screen-facing-with-heading",
      count: unitSet.count ?? 0,
      elevationSample: unitSet.elevationSample ?? "queryTerrainElevation",
      faction: unitSet.faction,
      footprint: unitSet.footprint ?? null,
      headingMode: unitSet.headingMode ?? "route-tangent-or-enemy-facing",
      id: unitSet.id,
      lod,
      markerPx: marker,
      minVisiblePx,
      stages: unitSet.stages ?? [],
      verticalOffsetMeters: unitSet.verticalOffsetMeters ?? 2,
      visualScale: unitSet.visualScale ?? "tactical-symbol-scale-not-real-human-scale"
    };
  });
  return {
    constraints: [
      "sample terrain height for placement but decouple visual marker scale from real human/vehicle meters",
      "use heading-aware billboard/sprite or low-poly token; do not use flat color bars as final units",
      "apply LOD by camera meters-per-pixel and formation density",
      "winner/remnant result units must remain visible when result stage is active"
    ],
    stage: "terrain-height-tactical-unit-layer",
    unitContracts,
    warnings
  };
}

function buildUnitAssetProductionLayer(spec) {
  const warnings = [];
  const unitAssetPackage = spec.unitAssetPackage ?? {};
  const assets = unitAssetPackage.assets ?? [];
  const assetIds = new Set(assets.map((asset) => asset.id));
  const unitSetMappings = (spec.unitSets ?? []).map((unitSet) => ({
    assetId: unitSet.assetId ?? unitSet.unitAssetId ?? null,
    faction: unitSet.faction,
    unitSetId: unitSet.id
  }));
  if (!assets.length) {
    warnings.push({
      code: "UNIT_ASSET_PACKAGE_MISSING",
      message: "No unitAssetPackage.assets are declared; first-draft animation should not hand-tune unit icons inside a component.",
      severity: "warn"
    });
  }
  for (const mapping of unitSetMappings) {
    if (!mapping.assetId) {
      warnings.push({
        code: "UNIT_SET_ASSET_MAPPING_MISSING",
        message: `${mapping.unitSetId} has no assetId/unitAssetId mapping to the asset production package.`,
        severity: "warn",
        unitSetId: mapping.unitSetId
      });
    } else if (!assetIds.has(mapping.assetId)) {
      warnings.push({
        code: "UNIT_SET_ASSET_UNDECLARED",
        message: `${mapping.unitSetId} maps to ${mapping.assetId}, but that asset is not declared in unitAssetPackage.assets.`,
        severity: "warn",
        unitSetId: mapping.unitSetId,
        value: { assetId: mapping.assetId }
      });
    }
  }
  return {
    artifactPolicy: {
      defaultDirectory: unitAssetPackage.artifactDir ?? `artifacts/tactical-terrain-studio/${spec.battle.id}/unit-assets`,
      embedContactSheetsInChat: false,
      runtimeApplyRequiresPassedGates: true
    },
    assets: assets.map((asset) => ({
      candidateCount: (asset.candidateArtifacts ?? []).length,
      eraReference: asset.eraReference ?? null,
      faction: asset.faction ?? null,
      id: asset.id,
      kind: asset.kind ?? null,
      runtime: asset.runtime ?? asset.runtimeAsset ?? null,
      sourceCount: (asset.sources ?? []).length,
      toolchain: asset.toolchain ?? unitAssetPackage.toolchain ?? []
    })),
    stage: "unit-asset-production-layer",
    toolchainContract: unitAssetPackage.toolchainContract ?? [
      "collect era-specific visual references and record local source paths plus license or uncertainty",
      "generate candidates into artifacts before runtime application",
      "inspect candidate contact sheets manually; do not embed screenshots in chat",
      "apply candidates to runtime assets only after alpha, texture, scale, and faction-readability gates pass",
      "record browser evidence after runtime assets enter the animation"
    ],
    unitSetMappings,
    warnings
  };
}

function buildVisualEvidencePlan(spec, cameraStages) {
  const configuredFrames = spec.visualEvidence?.keyframes;
  const keyframes = configuredFrames ?? cameraStages.map((stage, index) => ({
    id: `${stage.id}-visual-check`,
    cameraStageId: stage.id,
    progress: cameraStages.length <= 1 ? 0 : Number((index / (cameraStages.length - 1)).toFixed(3)),
    purpose: `Verify ${stage.id} camera, terrain, tactical layers, units, and route continuity.`
  }));
  return {
    artifactPolicy: {
      directory: spec.visualEvidence?.artifactDir ?? `artifacts/tactical-terrain-studio/${spec.battle.id}/visual`,
      embedInChat: false,
      saveScreenshots: true
    },
    keyframes,
    requiredMetrics: [
      "terrain-layer-active",
      "three-layer-active-when-required",
      "camera-core-coverage",
      "unit-density-readability",
      "route-contact-distance",
      "encirclement-closure",
      "winner-remains-visible"
    ],
    stage: "visual-evidence-layer"
  };
}

function buildProductionPipeline(spec, cameraStages, tileCoverageRows, densityAudit, movementAudit, rendererContract) {
  const sourceDataPackage = buildSourceDataPackage(spec);
  const demTerrainLayer = buildDemTerrainLayer(spec, tileCoverageRows);
  const historicalBasemapLayer = buildHistoricalTacticalBasemapLayer(spec);
  const cameraLayer = buildCameraLayer(spec, cameraStages);
  const unitScaleLayer = buildUnitScaleSolver(spec, densityAudit, cameraStages);
  const unitAssetLayer = buildUnitAssetProductionLayer(spec);
  const terrainUnitLayer = buildTerrainPlacementContract(spec);
  const visualEvidenceLayer = buildVisualEvidencePlan(spec, cameraStages);
  const layers = [
    sourceDataPackage,
    demTerrainLayer,
    historicalBasemapLayer,
    cameraLayer,
    unitScaleLayer,
    {
      movementAudit,
      stage: "tactical-movement-preflight-layer",
      warnings: movementAudit.warnings
    },
    unitAssetLayer,
    terrainUnitLayer,
    visualEvidenceLayer
  ];
  const warnings = layers.flatMap((layer) => layer.warnings ?? []);
  return {
    battle: spec.battle,
    generatedAt: new Date().toISOString(),
    layers,
    rendererContract,
    stageOrder: layers.map((layer) => layer.stage),
    status: warnings.some((warning) => warning.severity === "error") ? "blocked" : warnings.length ? "needs-review" : "ready",
    warnings
  };
}

function recommendEngine(spec, densityAudit, movementAudit, productionPipeline) {
  const needs = spec.engineNeeds ?? {};
  const maxMarkerLoad = Math.max(0, ...densityAudit.byStage.map((stage) => stage.markerPixelRatio));
  const unresolvedWarningCodes = new Set((productionPipeline?.warnings ?? []).map((warning) => warning.code));
  const web3dTriggers = [
    needs.requiresTrue3DUnits,
    needs.requiresTerrainHeightPlacement,
    needs.requiresFormationCollisionPreview,
    maxMarkerLoad > 0.18,
    unresolvedWarningCodes.has("UNIT_OVERPACKED")
  ].filter(Boolean).length;
  const gameEngineTriggers = [
    needs.requiresCinematicCameraBlocking,
    needs.requiresPhysicsOrNavigation,
    needs.requiresOfflineVideoGradeOutput,
    needs.expectedVisibleUnits >= 350,
    needs.requiresFormationCollisionPreview && needs.requiresTrue3DUnits && needs.requiresCinematicCameraBlocking
  ].filter(Boolean).length;

  if (gameEngineTriggers >= 2) {
    return {
      level: "game-engine-evaluation-required",
      primaryCandidates: ["Unreal Engine + Cesium for Unreal", "Unity Terrain + DOTS/ECS + Timeline"],
      rationale: [
        "The spec requires cinematic 3D terrain/camera or collision/navigation beyond a MapLibre SVG overlay.",
        "Use the web animation only as review UI unless the engine evaluation proves browser runtime is enough."
      ],
      webFallback: ["MapLibre custom Three.js layer", "Babylon.js", "CesiumJS"]
    };
  }

  if (web3dTriggers >= 2) {
    return {
      level: "web-3d-required",
      primaryCandidates: ["MapLibre custom Three.js layer", "Babylon.js", "Three.js", "CesiumJS"],
      rationale: [
        "The spec needs true 3D units, terrain-height placement, density handling, or collision preview.",
        "Keep geographic camera alignment, but stop using SVG/CSS tricks as the main battle surface."
      ],
      webFallback: ["MapLibre raster-dem with projected SVG overlay"]
    };
  }

  return {
    level: "maplibre-sufficient",
    primaryCandidates: ["MapLibre GL JS raster-dem terrain with projected tactical overlay"],
    rationale: [
      "The current map-first animation can stay in the existing React/MapLibre renderer if visual QA passes."
    ],
    webFallback: []
  };
}

function auditUnitDensity(spec, cameraStages) {
  const warnings = [];
  const byStage = [];
  for (const stage of cameraStages) {
    const stageSets = (spec.unitSets ?? []).filter((unitSet) => (unitSet.stages ?? []).includes(stage.id));
    if (!stageSets.length) {
      continue;
    }
    const stageBbox = {
      west: stage.bbox[0],
      south: stage.bbox[1],
      east: stage.bbox[2],
      north: stage.bbox[3]
    };
    const stageMeters = metersForBbox(stageBbox);
    const metersPerPixel = Math.max(stageMeters.width / stage.viewport.width, stageMeters.height / stage.viewport.height);
    let totalUnits = 0;
    let totalMarkerPixels = 0;
    const sets = [];
    for (const unitSet of stageSets) {
      const footprint = unitSet.footprint
        ? { west: unitSet.footprint[0], south: unitSet.footprint[1], east: unitSet.footprint[2], north: unitSet.footprint[3] }
        : stageBbox;
      const footprintMeters = metersForBbox(footprint);
      const footprintArea = Math.max(1, footprintMeters.width * footprintMeters.height);
      const count = unitSet.count ?? 0;
      const marker = unitSet.markerPx ?? [36, 36];
      const nominalSpacingMeters = Math.sqrt(footprintArea / Math.max(1, count));
      const markerGroundWidth = marker[0] * metersPerPixel;
      const markerGroundHeight = marker[1] * metersPerPixel;
      const overlapIndex = Math.max(markerGroundWidth, markerGroundHeight) / Math.max(1, nominalSpacingMeters);
      const markerPixels = count * marker[0] * marker[1];
      totalUnits += count;
      totalMarkerPixels += markerPixels;
      const row = {
        count,
        faction: unitSet.faction,
        footprintMeters: {
          height: Number(footprintMeters.height.toFixed(1)),
          width: Number(footprintMeters.width.toFixed(1))
        },
        id: unitSet.id,
        markerPx: marker,
        nominalSpacingMeters: Number(nominalSpacingMeters.toFixed(1)),
        overlapIndex: Number(overlapIndex.toFixed(2))
      };
      sets.push(row);
      if (overlapIndex > 1.15) {
        warnings.push({
          code: "UNIT_OVERPACKED",
          message: `${stage.id}/${unitSet.id} marker footprint is likely too dense; enlarge map envelope, reduce count, or stagger depth.`,
          severity: "warn",
          stageId: stage.id,
          unitSetId: unitSet.id,
          value: row
        });
      }
      if (marker[0] < 24 || marker[1] < 24) {
        warnings.push({
          code: "UNIT_TOO_SMALL",
          message: `${stage.id}/${unitSet.id} marker is below readable battlefield scale.`,
          severity: "warn",
          stageId: stage.id,
          unitSetId: unitSet.id,
          value: marker
        });
      }
    }
    const markerPixelRatio = totalMarkerPixels / Math.max(1, stage.viewport.width * stage.viewport.height);
    if (markerPixelRatio > 0.28) {
      warnings.push({
        code: "STAGE_MARKER_PIXEL_LOAD_HIGH",
        message: `${stage.id} has high marker pixel load; it may read as a fog or block at map scale.`,
        severity: "warn",
        stageId: stage.id,
        value: Number(markerPixelRatio.toFixed(3))
      });
    }
    byStage.push({
      markerPixelRatio: Number(markerPixelRatio.toFixed(3)),
      metersPerPixel: Number(metersPerPixel.toFixed(2)),
      stageId: stage.id,
      totalUnits,
      unitSets: sets
    });
  }
  return { byStage, warnings };
}

function auditMovement(spec) {
  const warnings = [];
  const routesById = new Map((spec.routes ?? []).map((route) => [route.id, route]));
  const featureRisks = [];
  for (const route of spec.routes ?? []) {
    if (route.points.length < 2) {
      warnings.push({
        code: "ROUTE_TOO_SHORT",
        message: `${route.id} has fewer than two points.`,
        routeId: route.id,
        severity: "error"
      });
      continue;
    }
    for (const feature of spec.features ?? []) {
      if (!feature.avoid) {
        continue;
      }
      if ((route.allowFeatureCrossings ?? []).includes(feature.id)) {
        continue;
      }
      const intersects = feature.type === "polygon"
        ? lineIntersectsPolygon(route.points, feature.points)
        : lineIntersectsLine(route.points, feature.points);
      if (intersects) {
        const risk = {
          code: "ROUTE_CROSSES_AVOID_FEATURE",
          featureId: feature.id,
          message: `${route.id} crosses avoid feature ${feature.id}.`,
          routeId: route.id,
          severity: "warn"
        };
        warnings.push(risk);
        featureRisks.push(risk);
      }
    }
    if (route.continuesFrom) {
      const previous = routesById.get(route.continuesFrom);
      if (!previous) {
        warnings.push({
          code: "MISSING_HANDOFF_ROUTE",
          message: `${route.id} continuesFrom ${route.continuesFrom}, but the previous route is missing.`,
          routeId: route.id,
          severity: "error"
        });
      } else {
        const gap = haversineMeters(previous.points.at(-1), route.points[0]);
        const maxGap = route.maxHandoffMeters ?? spec.audit?.maxHandoffMeters ?? 180;
        if (gap > maxGap) {
          warnings.push({
            code: "ROUTE_HANDOFF_GAP",
            message: `${route.id} starts ${gap.toFixed(1)}m from ${route.continuesFrom}; this risks teleporting.`,
            routeId: route.id,
            severity: "warn",
            value: { gapMeters: Number(gap.toFixed(1)), maxGapMeters: maxGap }
          });
        }
      }
    }
  }

  for (const contact of spec.contacts ?? []) {
    const points = contact.points ?? [];
    if (points.length >= 2) {
      const gap = haversineMeters(points[0], points[1]);
      const maxGap = contact.maxDistanceMeters ?? spec.audit?.maxContactGapMeters ?? 240;
      if (gap > maxGap) {
        warnings.push({
          code: "CONTACT_GAP_TOO_WIDE",
          contactId: contact.id,
          message: `${contact.id} contact points are ${gap.toFixed(1)}m apart.`,
          severity: "warn",
          value: { gapMeters: Number(gap.toFixed(1)), maxGapMeters: maxGap }
        });
      }
    }
  }

  for (const encirclement of spec.encirclements ?? []) {
    const points = encirclement.points ?? [];
    if (points.length < 4) {
      warnings.push({
        code: "ENCIRCLEMENT_UNDERSPECIFIED",
        encirclementId: encirclement.id,
        message: `${encirclement.id} needs at least four points to audit closure.`,
        severity: "error"
      });
      continue;
    }
    const closingGap = haversineMeters(points[0], points.at(-1));
    const segmentGaps = points.slice(0, -1).map((point, index) => haversineMeters(point, points[index + 1]));
    const maxSegmentGap = Math.max(...segmentGaps, closingGap);
    const allowedGap = encirclement.maxGapMeters ?? spec.audit?.maxEncirclementGapMeters ?? 280;
    if (closingGap > allowedGap || maxSegmentGap > allowedGap * 2.2) {
      warnings.push({
        code: "ENCIRCLEMENT_GAP",
        encirclementId: encirclement.id,
        message: `${encirclement.id} has a closure gap of ${closingGap.toFixed(1)}m and max segment gap ${maxSegmentGap.toFixed(1)}m.`,
        severity: "warn",
        value: {
          closingGapMeters: Number(closingGap.toFixed(1)),
          maxSegmentGapMeters: Number(maxSegmentGap.toFixed(1)),
          maxAllowedGapMeters: allowedGap
        }
      });
    }
  }

  const result = spec.result;
  if (result) {
    const resultSets = (spec.unitSets ?? []).filter((unitSet) => (unitSet.stages ?? []).includes(result.stage));
    const winnerUnits = resultSets.filter((unitSet) => unitSet.faction === result.winnerFaction).reduce((sum, unitSet) => sum + (unitSet.count ?? 0), 0);
    const loserUnits = resultSets.filter((unitSet) => unitSet.faction !== result.winnerFaction).reduce((sum, unitSet) => sum + (unitSet.count ?? 0), 0);
    if (winnerUnits < (result.minWinnerUnits ?? 1)) {
      warnings.push({
        code: "WINNER_NOT_PRESENT",
        message: `${result.stage} has only ${winnerUnits} ${result.winnerFaction} units; winner must remain on field.`,
        severity: "error",
        value: { minWinnerUnits: result.minWinnerUnits, winnerUnits }
      });
    }
    if (loserUnits < (result.minLoserRemnants ?? 0)) {
      warnings.push({
        code: "LOSER_REMNANTS_TOO_LOW",
        message: `${result.stage} has only ${loserUnits} loser/remnant units; collapse may read as disappearance.`,
        severity: "warn",
        value: { loserUnits, minLoserRemnants: result.minLoserRemnants }
      });
    }
  }

  const routeSummaries = (spec.routes ?? []).map((route) => ({
    end: route.points.at(-1),
    faction: route.faction,
    id: route.id,
    kind: route.kind ?? "route",
    lengthMeters: Number(lineLengthMeters(route.points).toFixed(1)),
    pointCount: route.points.length,
    start: route.points[0]
  }));

  return { featureRisks, routeSummaries, warnings };
}

function buildTerrainPackage(spec, cameraStages, tileCoverageRows, geojson, contract, densityAudit, movementAudit, productionPipeline) {
  const engineRecommendation = recommendEngine(spec, densityAudit, movementAudit, productionPipeline);
  return {
    battle: spec.battle,
    generatedAt: new Date().toISOString(),
    map: {
      bounds: spec.map.bounds,
      rendererContract: contract.requiredRuntimeAttributes,
      tileCache: {
        coverage: tileCoverageRows,
        template: spec.map.tileCache?.terrainTemplate ?? null
      }
    },
    cameraStages,
    densityAudit,
    productionPipeline: {
      stageOrder: productionPipeline.stageOrder,
      status: productionPipeline.status,
      warningCount: productionPipeline.warnings.length
    },
    geojsonSummary: {
      featureCount: geojson.features.length,
      formationCount: (spec.formations ?? []).length,
      routeCount: (spec.routes ?? []).length
    },
    nonBlockingEnhancements: productionPipeline.layers.flatMap((layer) =>
      (layer.deferredEnhancements ?? []).map((item) => ({
        item,
        stage: layer.stage
      }))
    ),
    engineRecommendation,
    movementAudit,
    warnings: productionPipeline.warnings ?? []
  };
}

function buildMarkdownReport(pkg) {
  const warnings = pkg.warnings;
  const lines = [
    `# Tactical Terrain Studio Report: ${pkg.battle.title ?? pkg.battle.id}`,
    "",
    `Generated: ${pkg.generatedAt}`,
    "",
    "## Renderer Contract",
    "",
    ...Object.entries(pkg.map.rendererContract).map(([key, value]) => `- \`${key}\`: \`${value}\``),
    "",
    "## Production Pipeline",
    "",
    `- Status: \`${pkg.productionPipeline.status}\``,
    `- Warning count: ${pkg.productionPipeline.warningCount}`,
    "",
    "| order | layer |",
    "|---:|---|",
    ...pkg.productionPipeline.stageOrder.map((stage, index) => `| ${index + 1} | \`${stage}\` |`),
    "",
    "## Tile Coverage",
    "",
    "| z | x | y | tiles |",
    "|---|---|---|---:|",
    ...pkg.map.tileCache.coverage.map((row) => `| ${row.z} | ${row.xMin}-${row.xMax} | ${row.yMin}-${row.yMax} | ${row.count} |`),
    "",
    "## Camera Stages",
    "",
    "| stage | center | zoom | pitch | bearing | bbox |",
    "|---|---|---:|---:|---:|---|",
    ...pkg.cameraStages.map((stage) => `| ${stage.id} | ${stage.center.map((value) => value.toFixed(5)).join(", ")} | ${stage.zoom} | ${stage.pitch} | ${stage.bearing} | ${stage.bbox.map((value) => value.toFixed(5)).join(", ")} |`),
    "",
    "## Unit Density",
    "",
    "| stage | units | marker load | meters/px |",
    "|---|---:|---:|---:|",
    ...pkg.densityAudit.byStage.map((stage) => `| ${stage.stageId} | ${stage.totalUnits} | ${stage.markerPixelRatio} | ${stage.metersPerPixel} |`),
    "",
    "## Engine Recommendation",
    "",
    `- Level: \`${pkg.engineRecommendation.level}\``,
    `- Candidates: ${pkg.engineRecommendation.primaryCandidates.join(", ")}`,
    ...pkg.engineRecommendation.rationale.map((item) => `- ${item}`),
    "",
    "## Movement Routes",
    "",
    "| route | faction | kind | length m | points |",
    "|---|---|---|---:|---:|",
    ...pkg.movementAudit.routeSummaries.map((route) => `| ${route.id} | ${route.faction} | ${route.kind} | ${route.lengthMeters} | ${route.pointCount} |`),
    "",
    "## Warnings",
    "",
    warnings.length ? warnings.map((warning) => `- ${warning.severity.toUpperCase()} ${warning.code}: ${warning.message}`).join("\n") : "- None",
    ""
  ];
  return `${lines.join("\n")}\n`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  if (!args.spec || !args.out) {
    throw new Error(`Missing required arguments.\n${usage()}`);
  }

  const specPath = path.resolve(args.spec);
  const outDir = path.resolve(args.out);
  const spec = readJson(specPath);
  validateSpec(spec);

  const tileCache = spec.map.tileCache ?? {};
  const coverage = tileCoverage(spec.map.bounds, tileCache.minZoom ?? 10, tileCache.maxZoom ?? 14);
  const cameraStages = buildCameraStages(spec);
  const geojson = buildGeoJson(spec);
  const rendererContract = buildMapLibreContract(spec);
  const densityAudit = auditUnitDensity(spec, cameraStages);
  const movementAudit = auditMovement(spec);
  const productionPipeline = buildProductionPipeline(spec, cameraStages, coverage, densityAudit, movementAudit, rendererContract);
  const terrainPackage = buildTerrainPackage(spec, cameraStages, coverage, geojson, rendererContract, densityAudit, movementAudit, productionPipeline);

  fs.mkdirSync(outDir, { recursive: true });
  writeJson(path.join(outDir, "terrain-package.json"), terrainPackage);
  writeJson(path.join(outDir, "production-pipeline.json"), productionPipeline);
  writeJson(path.join(outDir, "features.geojson"), geojson);
  writeJson(path.join(outDir, "camera-stages.json"), cameraStages);
  writeJson(path.join(outDir, "maplibre-contract.json"), rendererContract);
  writeJson(path.join(outDir, "movement-audit.json"), movementAudit);
  writeJson(path.join(outDir, "unit-density-audit.json"), densityAudit);
  writeText(path.join(outDir, "report.md"), buildMarkdownReport(terrainPackage));

  const summary = {
    artifactDir: outDir,
    battleId: spec.battle.id,
    cameraStages: cameraStages.length,
    features: geojson.features.length,
    pipelineStatus: productionPipeline.status,
    routes: spec.routes?.length ?? 0,
    warnings: productionPipeline.warnings.length
  };
  console.log(JSON.stringify(summary, null, 2));
  if (args.strict && productionPipeline.warnings.length > 0) {
    process.exitCode = 2;
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
