import { useEffect, useMemo, useRef } from "react";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { BattleEvent } from "../data/battleOfFrance";
import { publicPath } from "../lib/publicPath";
import type { FocusTransitionState } from "./CampaignMapAnimation";
import type { MapView } from "../lib/useMapInteraction";

type TacticalPoint = [number, number];

type BattleOfBritainTerrain3DProps = {
  activeEvent: BattleEvent;
  focusState: FocusTransitionState;
  mapBaseView: MapView;
  mapFocus: string;
  mapView: MapView;
  progress: number;
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
const terrainExaggeration = 1;
const hillshadeExaggeration = 0.16;
const cameraTransitionDurationMs = 1050;
const weatherAssetVersion = "20260614-comfy-weather-v1";
const morningCloudAsset = `${publicPath("/assets/weather/battle-of-britain/morning-cloud-bank.png")}?v=${weatherAssetVersion}`;
const afternoonCloudAsset = `${publicPath("/assets/weather/battle-of-britain/afternoon-cloud-breaks.png")}?v=${weatherAssetVersion}`;

const cameraStages: Record<string, { bearing: number; center: TacticalPoint; pitch: number; zoom: number }> = {
  britainAirRadar: {
    bearing: -21,
    center: [0.58, 51.13],
    pitch: 55,
    zoom: 8.94
  },
  britainAirCombat: {
    bearing: -24,
    center: [0.18, 51.36],
    pitch: 57,
    zoom: 9.78
  },
  britainAirReturn: {
    bearing: -18,
    center: [0.82, 51.02],
    pitch: 56,
    zoom: 9.66
  }
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
      id: "channel-operational-surface",
      properties: { kind: "channel" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-0.58, 50.72],
          [0.16, 50.58],
          [0.82, 50.62],
          [1.7, 50.78],
          [1.94, 50.98],
          [1.28, 51.05],
          [0.54, 50.96],
          [-0.38, 50.86],
          [-0.58, 50.72]
        ]]
      }
    },
    {
      type: "Feature",
      id: "south-england-airfields",
      properties: { kind: "south-england" },
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
      id: "french-coast-launch-zone",
      properties: { kind: "french-coast" },
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
    }
  ]
} satisfies GeoJSON.FeatureCollection;

const weatherData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "morning-broken-cloud",
      properties: { kind: "morning" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [1.2, 50.92],
          [0.82, 51.02],
          [0.38, 51.2],
          [-0.18, 51.44],
          [-0.02, 51.62],
          [0.58, 51.4],
          [1.08, 51.12],
          [1.34, 50.98],
          [1.2, 50.92]
        ]]
      }
    },
    {
      type: "Feature",
      id: "afternoon-clearing-cloud",
      properties: { kind: "afternoon" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [0.92, 50.88],
          [0.54, 51.06],
          [0.08, 51.3],
          [-0.14, 51.48],
          [0.22, 51.6],
          [0.74, 51.34],
          [1.12, 51.08],
          [1.28, 50.96],
          [0.92, 50.88]
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
    },
    "battle-of-britain-weather": {
      type: "geojson",
      data: weatherData
    }
  },
  layers: [
    {
      id: "battle-of-britain-sea-background",
      type: "background",
      paint: {
        "background-color": "#4f7984"
      }
    },
    {
      id: "battle-of-britain-topo-base",
      type: "raster",
      source: "battle-of-britain-topo",
      paint: {
        "raster-brightness-max": 0.88,
        "raster-brightness-min": 0.12,
        "raster-contrast": 0.18,
        "raster-opacity": 0.9,
        "raster-saturation": -0.08
      }
    },
    {
      id: "battle-of-britain-channel-depth",
      type: "fill",
      source: "battle-of-britain-tactical-ground",
      filter: ["==", ["get", "kind"], "channel"],
      paint: {
        "fill-color": "#315f75",
        "fill-opacity": 0.28
      }
    },
    {
      id: "battle-of-britain-landform-tone",
      type: "fill",
      source: "battle-of-britain-tactical-ground",
      filter: ["in", ["get", "kind"], ["literal", ["south-england", "french-coast"]]],
      paint: {
        "fill-color": ["match", ["get", "kind"], "south-england", "#9aa876", "#b4a46f"],
        "fill-opacity": 0.18
      }
    },
    {
      id: "battle-of-britain-dem-hillshade",
      type: "hillshade",
      source: "battle-of-britain-hillshade-dem",
      paint: {
        "hillshade-accent-color": "#668470",
        "hillshade-exaggeration": hillshadeExaggeration,
        "hillshade-highlight-color": "#f4e2a7",
        "hillshade-shadow-color": "#435f61"
      }
    },
    {
      id: "battle-of-britain-weather-morning",
      type: "fill",
      source: "battle-of-britain-weather",
      filter: ["==", ["get", "kind"], "morning"],
      paint: {
        "fill-color": "#d7ddd3",
        "fill-opacity": 0.16
      }
    },
    {
      id: "battle-of-britain-weather-afternoon",
      type: "fill",
      source: "battle-of-britain-weather",
      filter: ["==", ["get", "kind"], "afternoon"],
      paint: {
        "fill-color": "#edf1df",
        "fill-opacity": 0.1
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

function stageForFocus(focus: string) {
  return cameraStages[focus] ?? cameraStages.britainAirCombat;
}

function cameraForState(focusState: FocusTransitionState, mapBaseView: MapView, mapView: MapView) {
  const fromStage = stageForFocus(focusState.fromFocus);
  const toStage = stageForFocus(focusState.focus);
  const ratio = focusState.isTransitioning ? focusState.ratio : 1;
  const userPanX = mapView.x - mapBaseView.x;
  const userPanY = mapView.y - mapBaseView.y;
  const userZoomDelta = mapView.scale - mapBaseView.scale;
  const center = [
    lerp(fromStage.center[0], toStage.center[0], ratio) - userPanX / 8400 / Math.max(mapView.scale, 0.1),
    lerp(fromStage.center[1], toStage.center[1], ratio) + userPanY / 10800 / Math.max(mapView.scale, 0.1)
  ] as TacticalPoint;

  return {
    bearing: lerp(fromStage.bearing, toStage.bearing, ratio),
    center: [
      clamp(center[0], terrainSourceBounds[0] + 0.18, terrainSourceBounds[2] - 0.18),
      clamp(center[1], terrainSourceBounds[1] + 0.14, terrainSourceBounds[3] - 0.14)
    ] as TacticalPoint,
    pitch: lerp(fromStage.pitch, toStage.pitch, ratio),
    zoom: clamp(lerp(fromStage.zoom, toStage.zoom, ratio) + userZoomDelta * 1.05, 7.25, 11.45)
  };
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
  mapView,
  progress
}: BattleOfBritainTerrain3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const latestStateRef = useRef({ focusState, mapBaseView, mapFocus, mapView, progress });
  latestStateRef.current = { focusState, mapBaseView, mapFocus, mapView, progress };
  const cloudPhase = useMemo(() => weatherPhase(progress), [progress]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const initialCamera = cameraForState(focusState, mapBaseView, mapView);
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
      maxBounds: terrainBounds,
      maxPitch: 62,
      maxZoom: 11.55,
      minZoom: 6.8,
      pixelRatio: Math.min(3, Math.max(2, window.devicePixelRatio || 1)),
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
      container.dataset.currentEvent = activeEvent.id;
      container.dataset.mapCenter = `${center.lng.toFixed(5)},${center.lat.toFixed(5)}`;
      container.dataset.mapFocus = latestStateRef.current.mapFocus;
      container.dataset.mapPixelRatio = canvas.clientWidth > 0 ? (canvas.width / canvas.clientWidth).toFixed(2) : "0";
      container.dataset.mapZoom = map.getZoom().toFixed(2);
      container.dataset.terrainLoaded = map.loaded() ? "true" : "false";
      container.dataset.weatherPhase = weatherPhase(latestStateRef.current.progress);
    };
    markMapCanvas(container, map);

    map.once("load", () => {
      map.setTerrain({ source: "battle-of-britain-real-dem", exaggeration: terrainExaggeration });
      map.jumpTo(cameraForState(latestStateRef.current.focusState, latestStateRef.current.mapBaseView, latestStateRef.current.mapView));
      syncMetadata();
    });
    map.on("idle", syncMetadata);
    map.on("move", syncMetadata);

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
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
    const camera = cameraForState(focusState, mapBaseView, mapView);
    if (focusState.isTransitioning) {
      map.easeTo({
        ...camera,
        duration: cameraTransitionDurationMs,
        easing: (time) => time * time * (3 - 2 * time)
      });
    } else {
      map.jumpTo(camera);
    }
    container.dataset.currentEvent = activeEvent.id;
    container.dataset.mapFocus = mapFocus;
    container.dataset.weatherPhase = cloudPhase;
  }, [activeEvent.id, cloudPhase, focusState, mapBaseView, mapFocus, mapView]);

  return (
    <div
      ref={containerRef}
      className="battle-of-britain-terrain-3d"
      data-camera-mode="cross-channel-oblique-stages"
      data-camera-pitch={`${cameraForState(focusState, mapBaseView, mapView).pitch.toFixed(1)}`}
      data-camera-transition-ms={`${cameraTransitionDurationMs}`}
      data-cloud-animation="phase-linked-drifting-overlay"
      data-hillshade-exaggeration={`${hillshadeExaggeration}`}
      data-modern-imagery-visible="true"
      data-projection="webgl-gis-terrain"
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
      data-weather-phase={cloudPhase}
    >
      <div
        className="battle-of-britain-cloud-layer"
        data-asset-source="comfyui-weather-png"
        data-testid="battle-of-britain-cloud-layer"
        data-weather-phase={cloudPhase}
        aria-hidden="true"
      >
        <img
          className="battle-of-britain-cloud cloud-a"
          data-testid="battle-of-britain-morning-cloud-asset"
          src={morningCloudAsset}
          alt=""
          draggable={false}
        />
        <img
          className="battle-of-britain-cloud cloud-b"
          data-testid="battle-of-britain-afternoon-cloud-asset"
          src={afternoonCloudAsset}
          alt=""
          draggable={false}
        />
        <img
          className="battle-of-britain-cloud cloud-c"
          data-testid="battle-of-britain-evening-cloud-asset"
          src={afternoonCloudAsset}
          alt=""
          draggable={false}
        />
      </div>
    </div>
  );
}
