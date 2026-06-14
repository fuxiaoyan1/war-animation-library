import { useEffect, useMemo, useRef } from "react";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { BattleEvent } from "../data/battleOfFrance";
import type { FocusTransitionState } from "./CampaignMapAnimation";
import type { MapView } from "../lib/useMapInteraction";

type TacticalPoint = [number, number];

type BattleOfBritainTerrain3DProps = {
  activeEvent: BattleEvent;
  focusState: FocusTransitionState;
  mapBaseView: MapView;
  mapFocus: string;
  mapHeight: number;
  mapView: MapView;
  mapWidth: number;
  progress: number;
  registrationSamples: Array<{
    coordinates: [number, number];
    id: string;
    projected: [number, number];
  }>;
  terrainView: {
    center: [number, number];
    projectionScale: number;
  };
};

const terrainCanvasTestId = "battle-of-britain-terrain-3d-canvas";
const terrainTileUrl = "/assets/maps/battle-of-britain-3d/terrarium/{z}/{x}-{y}.png";
const topoTileUrl = "/assets/maps/battle-of-britain-3d/topo/{z}/{x}-{y}.jpg";
const terrainSourceBounds: [number, number, number, number] = [-1.75, 50.52, 2.12, 52.22];
const terrainBounds: [[number, number], [number, number]] = [
  [terrainSourceBounds[0], terrainSourceBounds[1]],
  [terrainSourceBounds[2], terrainSourceBounds[3]]
];
const minCachedTileZoom = 6;
const cachedTerrainTileZoom = 11;
const cachedTopoTileZoom = 11;
const terrainExaggeration = 1.35;
const hillshadeExaggeration = 0.72;
const topoRasterOpacity = 0.2;
const registeredCameraPitch = 0;
const registeredCameraBearing = 0;
const registrationSampleLimit = 10;
const cameraMoveThreshold = {
  bearing: 0.02,
  center: 0.00016,
  pitch: 0.02,
  zoom: 0.025
};

const historicalBaseData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "battle-of-britain-cross-channel-aoi",
      properties: { kind: "aoi" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [terrainSourceBounds[0], terrainSourceBounds[1]],
          [terrainSourceBounds[2], terrainSourceBounds[1]],
          [terrainSourceBounds[2], terrainSourceBounds[3]],
          [terrainSourceBounds[0], terrainSourceBounds[3]],
          [terrainSourceBounds[0], terrainSourceBounds[1]]
        ]]
      }
    },
    {
      type: "Feature",
      id: "channel-deep-water-surface",
      properties: { kind: "channel" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-1.32, 50.62],
          [-0.18, 50.52],
          [0.94, 50.54],
          [2.08, 50.72],
          [2.1, 51.18],
          [1.2, 51.23],
          [0.18, 51.14],
          [-0.94, 51.02],
          [-1.32, 50.62]
        ]]
      }
    },
    {
      type: "Feature",
      id: "channel-traffic-lane-surface",
      properties: { kind: "channel-lane" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [0.12, 50.82],
          [0.76, 50.72],
          [1.42, 50.84],
          [1.66, 50.98],
          [1.08, 51.03],
          [0.36, 50.94],
          [0.12, 50.82]
        ]]
      }
    },
    {
      type: "Feature",
      id: "south-england-downs",
      properties: { kind: "england-downs" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-1.12, 51.06],
          [-0.52, 51.76],
          [0.4, 51.92],
          [1.38, 51.38],
          [1.2, 50.9],
          [0.34, 51.04],
          [-0.42, 51.18],
          [-1.12, 51.06]
        ]]
      }
    },
    {
      type: "Feature",
      id: "thames-estuary-lowland",
      properties: { kind: "thames-lowland" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-0.2, 51.32],
          [0.22, 51.24],
          [0.82, 51.34],
          [1.16, 51.42],
          [0.78, 51.62],
          [0.12, 51.58],
          [-0.2, 51.32]
        ]]
      }
    },
    {
      type: "Feature",
      id: "french-coast-chalk",
      properties: { kind: "france-chalk" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [1.08, 50.58],
          [2.12, 50.6],
          [2.12, 51.08],
          [1.42, 51.08],
          [1.08, 50.94],
          [1.08, 50.58]
        ]]
      }
    },
    {
      type: "Feature",
      id: "french-inland-launch-zone",
      properties: { kind: "france-inland" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [1.34, 50.58],
          [2.12, 50.62],
          [2.12, 50.88],
          [1.46, 50.86],
          [1.34, 50.58]
        ]]
      }
    }
  ]
} satisfies GeoJSON.FeatureCollection;

const terrainStyle: StyleSpecification = {
  version: 8,
  sources: {
    "battle-of-britain-topo": {
      type: "raster",
      tiles: [topoTileUrl],
      bounds: terrainSourceBounds,
      tileSize: 256,
      minzoom: minCachedTileZoom,
      maxzoom: cachedTopoTileZoom,
      attribution: "Basemap: Esri World Topographic Map local cache"
    },
    "battle-of-britain-real-dem": {
      type: "raster-dem",
      tiles: [terrainTileUrl],
      bounds: terrainSourceBounds,
      encoding: "terrarium",
      tileSize: 256,
      minzoom: minCachedTileZoom,
      maxzoom: cachedTerrainTileZoom,
      attribution: "Elevation: AWS Terrain Tiles, SRTM/GMTED"
    },
    "battle-of-britain-hillshade-dem": {
      type: "raster-dem",
      tiles: [terrainTileUrl],
      bounds: terrainSourceBounds,
      encoding: "terrarium",
      tileSize: 256,
      minzoom: minCachedTileZoom,
      maxzoom: cachedTerrainTileZoom,
      attribution: "Elevation: AWS Terrain Tiles, SRTM/GMTED"
    },
    "battle-of-britain-tactical-ground": {
      type: "geojson",
      data: historicalBaseData
    }
  },
  layers: [
    {
      id: "battle-of-britain-sea-background",
      type: "background",
      paint: {
        "background-color": "#477fa4"
      }
    },
    {
      id: "battle-of-britain-topo-base",
      type: "raster",
      source: "battle-of-britain-topo",
      paint: {
        "raster-brightness-max": 0.54,
        "raster-brightness-min": 0.06,
        "raster-contrast": 0.98,
        "raster-opacity": topoRasterOpacity,
        "raster-saturation": 0
      }
    },
    {
      id: "battle-of-britain-channel-color",
      type: "fill",
      source: "battle-of-britain-tactical-ground",
      filter: ["==", ["get", "kind"], "channel"],
      paint: {
        "fill-color": "#4b8bb6",
        "fill-opacity": 0.84
      }
    },
    {
      id: "battle-of-britain-channel-lane-color",
      type: "fill",
      source: "battle-of-britain-tactical-ground",
      filter: ["==", ["get", "kind"], "channel-lane"],
      paint: {
        "fill-color": "#5b9bc3",
        "fill-opacity": 0.42
      }
    },
    {
      id: "battle-of-britain-england-downs-color",
      type: "fill",
      source: "battle-of-britain-tactical-ground",
      filter: ["==", ["get", "kind"], "england-downs"],
      paint: {
        "fill-color": "#a4784b",
        "fill-opacity": 0.46
      }
    },
    {
      id: "battle-of-britain-thames-lowland-color",
      type: "fill",
      source: "battle-of-britain-tactical-ground",
      filter: ["==", ["get", "kind"], "thames-lowland"],
      paint: {
        "fill-color": "#91774d",
        "fill-opacity": 0.36
      }
    },
    {
      id: "battle-of-britain-france-chalk-color",
      type: "fill",
      source: "battle-of-britain-tactical-ground",
      filter: ["==", ["get", "kind"], "france-chalk"],
      paint: {
        "fill-color": "#b17245",
        "fill-opacity": 0.44
      }
    },
    {
      id: "battle-of-britain-france-inland-color",
      type: "fill",
      source: "battle-of-britain-tactical-ground",
      filter: ["==", ["get", "kind"], "france-inland"],
      paint: {
        "fill-color": "#856a52",
        "fill-opacity": 0.34
      }
    },
    {
      id: "battle-of-britain-dem-hillshade",
      type: "hillshade",
      source: "battle-of-britain-hillshade-dem",
      paint: {
        "hillshade-accent-color": "#9b8a63",
        "hillshade-exaggeration": hillshadeExaggeration,
        "hillshade-highlight-color": "#d6b16e",
        "hillshade-shadow-color": "#31566b"
      }
    },
    {
      id: "battle-of-britain-palette-boundaries",
      type: "line",
      source: "battle-of-britain-tactical-ground",
      filter: ["in", ["get", "kind"], ["literal", ["channel", "channel-lane", "england-downs", "thames-lowland", "france-chalk", "france-inland"]]],
      paint: {
        "line-color": "#d5ceb1",
        "line-opacity": 0.12,
        "line-width": 0.55
      }
    }
  ],
  terrain: {
    source: "battle-of-britain-real-dem",
    exaggeration: terrainExaggeration
  }
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a: number, b: number, ratio: number) {
  return a + (b - a) * ratio;
}

function viewScaleForContainer(container: HTMLDivElement | null, mapWidth: number, mapHeight: number) {
  if (!container || container.clientWidth <= 0 || container.clientHeight <= 0) {
    return 1;
  }

  return Math.min(container.clientWidth / mapWidth, container.clientHeight / mapHeight);
}

function mercatorScaleToMapLibreZoom(projectionScale: number, viewScale: number, mapViewScale: number) {
  const cssProjectionScale = Math.max(1, projectionScale * viewScale * Math.max(mapViewScale, 0.001));
  return Math.log2((cssProjectionScale * 2 * Math.PI) / 512);
}

function cameraForState(
  terrainView: BattleOfBritainTerrain3DProps["terrainView"],
  mapView: MapView,
  container: HTMLDivElement | null,
  mapWidth: number,
  mapHeight: number
) {
  const viewScale = viewScaleForContainer(container, mapWidth, mapHeight);

  return {
    bearing: registeredCameraBearing,
    center: [
      clamp(terrainView.center[0], terrainSourceBounds[0] - 0.35, terrainSourceBounds[2] + 0.35),
      clamp(terrainView.center[1], terrainSourceBounds[1] - 0.22, terrainSourceBounds[3] + 0.22)
    ] as TacticalPoint,
    pitch: registeredCameraPitch,
    zoom: clamp(mercatorScaleToMapLibreZoom(terrainView.projectionScale, viewScale, mapView.scale), 6.8, 11.6)
  };
}

function shouldJumpCamera(map: maplibregl.Map, camera: ReturnType<typeof cameraForState>) {
  const center = map.getCenter();
  return (
    Math.abs(center.lng - camera.center[0]) > cameraMoveThreshold.center ||
    Math.abs(center.lat - camera.center[1]) > cameraMoveThreshold.center ||
    Math.abs(map.getZoom() - camera.zoom) > cameraMoveThreshold.zoom ||
    Math.abs(map.getPitch() - camera.pitch) > cameraMoveThreshold.pitch ||
    Math.abs(map.getBearing() - camera.bearing) > cameraMoveThreshold.bearing
  );
}

function registrationErrorForState(
  map: maplibregl.Map,
  container: HTMLDivElement,
  state: {
    mapHeight: number;
    mapView: MapView;
    mapWidth: number;
    registrationSamples: BattleOfBritainTerrain3DProps["registrationSamples"];
  }
) {
  const viewScale = viewScaleForContainer(container, state.mapWidth, state.mapHeight);
  const renderedWidth = state.mapWidth * viewScale;
  const renderedHeight = state.mapHeight * viewScale;
  const offsetX = (container.clientWidth - renderedWidth) / 2;
  const offsetY = (container.clientHeight - renderedHeight) / 2;
  const samples = state.registrationSamples.slice(0, registrationSampleLimit).map((sample) => {
    const projected = map.project(sample.coordinates);
    const svgX = offsetX + (sample.projected[0] * state.mapView.scale + state.mapView.x) * viewScale;
    const svgY = offsetY + (sample.projected[1] * state.mapView.scale + state.mapView.y) * viewScale;
    const error = Math.hypot(projected.x - svgX, projected.y - svgY);
    return {
      error,
      id: sample.id,
      mapX: projected.x,
      mapY: projected.y,
      svgX,
      svgY
    };
  });
  const max = samples.reduce((highest, sample) => Math.max(highest, sample.error), 0);
  const mean = samples.length > 0 ? samples.reduce((sum, sample) => sum + sample.error, 0) / samples.length : 0;

  return { max, mean, samples };
}

function markMapCanvas(container: HTMLDivElement, map?: maplibregl.Map | null) {
  const canvas = map?.getCanvas() ?? container.querySelector<HTMLCanvasElement>("canvas.maplibregl-canvas");
  if (!canvas) {
    return false;
  }
  canvas.dataset.testid = terrainCanvasTestId;
  canvas.setAttribute("aria-label", "伦敦上空的鹰跨海峡MapLibre三维地形底图");
  return true;
}

function weatherPhase(progress: number) {
  if (progress < 0.44) {
    return "morning-broken-cloud";
  }
  if (progress < 0.82) {
    return "afternoon-clearing-cloud";
  }
  return "evening-thinning-cloud";
}

export function BattleOfBritainTerrain3D({
  activeEvent,
  focusState,
  mapBaseView,
  mapFocus,
  mapHeight,
  mapView,
  mapWidth,
  progress,
  registrationSamples,
  terrainView
}: BattleOfBritainTerrain3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const latestStateRef = useRef({
    activeEvent,
    focusState,
    mapBaseView,
    mapFocus,
    mapHeight,
    mapView,
    mapWidth,
    progress,
    registrationSamples,
    terrainView
  });
  latestStateRef.current = {
    activeEvent,
    focusState,
    mapBaseView,
    mapFocus,
    mapHeight,
    mapView,
    mapWidth,
    progress,
    registrationSamples,
    terrainView
  };
  const cloudPhase = useMemo(() => weatherPhase(progress), [progress]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const initialCamera = cameraForState(terrainView, mapView, container, mapWidth, mapHeight);
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
      maxPitch: 0,
      maxZoom: 11.6,
      minZoom: 6.8,
      pixelRatio: Math.min(2, Math.max(1.5, window.devicePixelRatio || 1)),
      pitch: initialCamera.pitch,
      refreshExpiredTiles: false,
      scrollZoom: false,
      style: terrainStyle,
      touchPitch: false,
      touchZoomRotate: false,
      zoom: initialCamera.zoom
    });

    mapRef.current = map;
    const syncMetadata = () => {
      markMapCanvas(container, map);
      const canvas = map.getCanvas();
      const center = map.getCenter();
      const registration = registrationErrorForState(map, container, latestStateRef.current);
      container.dataset.currentEvent = latestStateRef.current.activeEvent.id;
      container.dataset.mapCenter = `${center.lng.toFixed(5)},${center.lat.toFixed(5)}`;
      container.dataset.mapFocus = latestStateRef.current.mapFocus;
      container.dataset.mapPixelRatio = canvas.clientWidth > 0 ? (canvas.width / canvas.clientWidth).toFixed(2) : "0";
      container.dataset.mapZoom = map.getZoom().toFixed(2);
      container.dataset.registrationMaxError = registration.max.toFixed(2);
      container.dataset.registrationMeanError = registration.mean.toFixed(2);
      container.dataset.registrationSampleCount = `${registration.samples.length}`;
      container.dataset.terrainLoaded = map.loaded() && map.areTilesLoaded() ? "true" : "false";
      container.dataset.weatherPhase = weatherPhase(latestStateRef.current.progress);
    };
    markMapCanvas(container, map);

    map.once("load", () => {
      map.setTerrain({ source: "battle-of-britain-real-dem", exaggeration: terrainExaggeration });
      map.jumpTo(
        cameraForState(
          latestStateRef.current.terrainView,
          latestStateRef.current.mapView,
          container,
          latestStateRef.current.mapWidth,
          latestStateRef.current.mapHeight
        )
      );
      syncMetadata();
    });
    map.on("idle", syncMetadata);

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
      map.jumpTo(
        cameraForState(
          latestStateRef.current.terrainView,
          latestStateRef.current.mapView,
          container,
          latestStateRef.current.mapWidth,
          latestStateRef.current.mapHeight
        )
      );
      syncMetadata();
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
    const container = containerRef.current;
    if (!map || !container) {
      return;
    }
    const camera = cameraForState(terrainView, mapView, container, mapWidth, mapHeight);
    if (shouldJumpCamera(map, camera)) {
      map.jumpTo(camera);
    }
    container.dataset.currentEvent = activeEvent.id;
    container.dataset.mapFocus = mapFocus;
    container.dataset.weatherPhase = cloudPhase;
    const registration = registrationErrorForState(map, container, { mapHeight, mapView, mapWidth, registrationSamples });
    container.dataset.registrationMaxError = registration.max.toFixed(2);
    container.dataset.registrationMeanError = registration.mean.toFixed(2);
    container.dataset.registrationSampleCount = `${registration.samples.length}`;
  }, [activeEvent.id, cloudPhase, focusState, mapBaseView, mapFocus, mapHeight, mapView, mapWidth, registrationSamples, terrainView]);

  return (
    <div
      ref={containerRef}
      className="battle-of-britain-terrain-3d"
      data-camera-mode="svg-projection-registered-terrain"
      data-camera-update-threshold={`${cameraMoveThreshold.zoom.toFixed(3)}-zoom`}
      data-camera-pitch={`${registeredCameraPitch.toFixed(1)}`}
      data-camera-transition-ms="0"
      data-cloud-animation="progress-linked-local-weather-units"
      data-cloud-renderer="svg-camera-layer-comfy-weather-png"
      data-maplibre-fill-veil="removed"
      data-hillshade-exaggeration={`${hillshadeExaggeration}`}
      data-terrain-color-layer-ids="battle-of-britain-channel-color,battle-of-britain-channel-lane-color,battle-of-britain-england-downs-color,battle-of-britain-thames-lowland-color,battle-of-britain-france-chalk-color,battle-of-britain-france-inland-color"
      data-terrain-color-model="typed-regional-palette-v2"
      data-terrain-color-zones="channel,channel-lane,england-downs,thames-lowland,france-chalk,france-inland"
      data-topo-labels-suppressed="true"
      data-topo-raster-opacity={topoRasterOpacity.toFixed(2)}
      data-modern-imagery-visible="true"
      data-map-registration="svg-projection"
      data-projection="registered-web-mercator-hillshade"
      data-renderer="maplibre-real-terrain"
      data-tactical-renderer="maplibre-underlay-svg-tactical-overlay"
      data-terrain-exaggeration={`${terrainExaggeration}`}
      data-terrain-model="real-dem-raster-terrain"
      data-terrain-source={terrainTileUrl}
      data-terrain-tile-cache-zoom={`${cachedTerrainTileZoom}`}
      data-testid="battle-of-britain-terrain-3d"
      data-topo-source={topoTileUrl}
      data-topo-tile-cache-zoom={`${cachedTopoTileZoom}`}
      data-visible-basemap="local-cached-world-topographic-map"
      data-visual-surface-contract="maplibre-typed-terrain-palette-country-boundaries-only"
      data-weather-phase={cloudPhase}
    >
    </div>
  );
}
