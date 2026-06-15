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
const runtimeContourUrl = "/assets/maps/battle-of-britain-3d/derived/battle-of-britain-contours-runtime.geojson";
const runtimeReliefTextureUrl = "/assets/maps/battle-of-britain-3d/derived/battle-of-britain-runtime-relief.png";
const runtimeDerivedManifestUrl = "/assets/maps/battle-of-britain-3d/derived/manifest.json";
const terrainSourceBounds: [number, number, number, number] = [-1.75, 50.52, 2.12, 52.22];
const runtimeDerivedBounds: [number, number, number, number] = [-1.7578125, 50.5134265, 2.2851563, 52.2681574];
const terrainBounds: [[number, number], [number, number]] = [
  [terrainSourceBounds[0], terrainSourceBounds[1]],
  [terrainSourceBounds[2], terrainSourceBounds[3]]
];
const minCachedTileZoom = 6;
const cachedTerrainTileZoom = 11;
const cachedTopoTileZoom = 11;
const terrainExaggeration = 1.35;
const hillshadeExaggeration = 0.72;
const topoRasterOpacity = 0.15;
const registeredCameraPitch = 0;
const registeredCameraBearing = 0;
const registrationSampleLimit = 10;
const runtimeContourLayerIds = [
  "battle-of-britain-gis-subsea-contours",
  "battle-of-britain-gis-land-contours",
  "battle-of-britain-gis-coastline-contour"
];
const runtimeReliefLayerId = "battle-of-britain-gis-relief-texture";
const cameraMoveThreshold = {
  bearing: 0.02,
  center: 0.00016,
  pitch: 0.02,
  zoom: 0.025
};
const bannedMaplibreLayerIds = [
  "battle-of-britain-channel-color",
  "battle-of-britain-channel-lane-color",
  "battle-of-britain-england-downs-color",
  "battle-of-britain-thames-lowland-color",
  "battle-of-britain-france-chalk-color",
  "battle-of-britain-france-inland-color",
  "battle-of-britain-palette-boundaries"
];

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
    "battle-of-britain-runtime-contours": {
      type: "geojson",
      data: runtimeContourUrl,
      attribution: "Contours: GDAL derivatives from local Terrarium DEM cache"
    },
    "battle-of-britain-runtime-relief": {
      type: "image",
      url: runtimeReliefTextureUrl,
      coordinates: [
        [runtimeDerivedBounds[0], runtimeDerivedBounds[3]],
        [runtimeDerivedBounds[2], runtimeDerivedBounds[3]],
        [runtimeDerivedBounds[2], runtimeDerivedBounds[1]],
        [runtimeDerivedBounds[0], runtimeDerivedBounds[1]]
      ]
    }
  },
  layers: [
    {
      id: "battle-of-britain-sea-background",
      type: "background",
      paint: {
        "background-color": "#365d72"
      }
    },
    {
      id: "battle-of-britain-topo-base",
      type: "raster",
      source: "battle-of-britain-topo",
      paint: {
        "raster-brightness-max": 0.4,
        "raster-brightness-min": 0.02,
        "raster-contrast": 0.96,
        "raster-opacity": topoRasterOpacity,
        "raster-saturation": 0.24
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
      id: "battle-of-britain-gis-relief-texture",
      type: "raster",
      source: "battle-of-britain-runtime-relief",
      paint: {
        "raster-brightness-max": 0.72,
        "raster-brightness-min": 0,
        "raster-contrast": 0.12,
        "raster-opacity": ["interpolate", ["linear"], ["zoom"], 6.8, 0.07, 10.8, 0.12],
        "raster-saturation": 0
      }
    },
    {
      id: "battle-of-britain-gis-subsea-contours",
      type: "line",
      source: "battle-of-britain-runtime-contours",
      filter: ["<", ["get", "elev_m"], 0],
      paint: {
        "line-blur": 0.18,
        "line-color": "#9bbcc2",
        "line-opacity": ["interpolate", ["linear"], ["zoom"], 6.8, 0.08, 10.8, 0.22],
        "line-width": ["interpolate", ["linear"], ["zoom"], 6.8, 0.18, 10.8, 0.62]
      }
    },
    {
      id: "battle-of-britain-gis-land-contours",
      type: "line",
      source: "battle-of-britain-runtime-contours",
      filter: [">", ["get", "elev_m"], 0],
      paint: {
        "line-blur": 0.2,
        "line-color": [
          "case",
          [">=", ["get", "elev_m"], 150],
          "#e0c978",
          [">=", ["get", "elev_m"], 100],
          "#d0c486",
          "#bdc88d"
        ],
        "line-opacity": [
          "case",
          [">=", ["get", "elev_m"], 150],
          0.28,
          [">=", ["get", "elev_m"], 100],
          0.22,
          0.16
        ],
        "line-width": ["interpolate", ["linear"], ["zoom"], 6.8, 0.2, 10.8, 0.68]
      }
    },
    {
      id: "battle-of-britain-gis-coastline-contour",
      type: "line",
      source: "battle-of-britain-runtime-contours",
      filter: ["==", ["get", "elev_m"], 0],
      paint: {
        "line-blur": 0.08,
        "line-color": "#dfe9ca",
        "line-opacity": ["interpolate", ["linear"], ["zoom"], 6.8, 0.34, 10.8, 0.72],
        "line-width": ["interpolate", ["linear"], ["zoom"], 6.8, 0.46, 10.8, 1.1]
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
      const styleLayerIds = map.getStyle().layers?.map((layer) => layer.id) ?? [];
      const bannedLayersPresent = bannedMaplibreLayerIds.filter((id) => styleLayerIds.includes(id));
      const runtimeContourLayersPresent = runtimeContourLayerIds.filter((id) => styleLayerIds.includes(id));
      const runtimeReliefLayerPresent = styleLayerIds.includes(runtimeReliefLayerId) ? runtimeReliefLayerId : "";
      container.dataset.currentEvent = latestStateRef.current.activeEvent.id;
      container.dataset.mapCenter = `${center.lng.toFixed(5)},${center.lat.toFixed(5)}`;
      container.dataset.mapFocus = latestStateRef.current.mapFocus;
      container.dataset.maplibreStyleLayerIds = styleLayerIds.join(",");
      container.dataset.bannedMaplibreLayersPresent = bannedLayersPresent.join(",");
      container.dataset.runtimeContourLayersPresent = runtimeContourLayersPresent.join(",");
      container.dataset.runtimeReliefLayerPresent = runtimeReliefLayerPresent;
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
      data-banned-maplibre-layer-ids={bannedMaplibreLayerIds.join(",")}
      data-banned-maplibre-layers-present=""
      data-maplibre-fill-veil="removed"
      data-hillshade-exaggeration={`${hillshadeExaggeration}`}
      data-gis-derivatives="dem-hillshade-slope-runtime-contours-relief-texture"
      data-gis-derivatives-manifest={runtimeDerivedManifestUrl}
      data-runtime-contour-layer-ids={runtimeContourLayerIds.join(",")}
      data-runtime-contour-layers-present=""
      data-runtime-contour-source={runtimeContourUrl}
      data-runtime-relief-layer-id={runtimeReliefLayerId}
      data-runtime-relief-layer-present=""
      data-runtime-relief-source={runtimeReliefTextureUrl}
      data-terrain-color-layer-ids=""
      data-terrain-color-model="real-terrain-texture-runtime-relief-contours-no-polygon-blocks"
      data-terrain-color-zones="none"
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
      data-visual-surface-contract="maplibre-real-terrain-no-polygon-color-blocks"
      data-weather-phase={cloudPhase}
    >
    </div>
  );
}
