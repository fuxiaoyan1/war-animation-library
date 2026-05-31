import { useEffect, useRef } from "react";
import maplibregl, { type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const gaixiaTerrainCanvasTestId = "gaixia-terrain-3d-canvas";

type GaixiaTerrain3DProps = {
  height: number;
  mapTransform: string;
  width: number;
};

const gaixiaCenter: [number, number] = [117.445, 33.335];
const gaixiaBounds: [[number, number], [number, number]] = [
  [117.05, 32.94],
  [117.88, 33.64]
];
const gaixiaSourceBounds: [number, number, number, number] = [117.05, 32.94, 117.88, 33.64];
const cachedTileZoom = 10;
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

function cameraForTransform(transform: string) {
  const { x, y, scale } = parseSvgMapTransform(transform);
  const lng = gaixiaCenter[0] - x / 1050 / Math.max(scale, 0.1);
  const lat = gaixiaCenter[1] + y / 1900 / Math.max(scale, 0.1);
  return {
    bearing: -22,
    center: [Math.max(117.11, Math.min(117.82, lng)), Math.max(33.0, Math.min(33.58, lat))] as [number, number],
    pitch: 58,
    zoom: Math.max(10.7, Math.min(12.4, 10.9 + (scale - 0.82) * 2.6))
  };
}

function markMapCanvas(container: HTMLDivElement, map?: maplibregl.Map | null) {
  const canvas = map?.getCanvas() ?? container.querySelector<HTMLCanvasElement>("canvas.maplibregl-canvas");
  if (!canvas) {
    return false;
  }
  canvas.dataset.testid = gaixiaTerrainCanvasTestId;
  canvas.setAttribute("aria-label", "垓下真实DEM三维地形");
  return true;
}

const gaixiaTerrainStyle: StyleSpecification = {
  version: 8,
  sources: {
    "gaixia-world-imagery": {
      type: "raster",
      tiles: [imageryTileUrl],
      bounds: gaixiaSourceBounds,
      minzoom: cachedTileZoom,
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
      minzoom: cachedTileZoom,
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
        "raster-brightness-min": 0.08,
        "raster-brightness-max": 0.84,
        "raster-contrast": 0.08,
        "raster-saturation": -0.18
      }
    },
    {
      id: "gaixia-dem-hillshade",
      type: "hillshade",
      source: "gaixia-real-dem",
      paint: {
        "hillshade-accent-color": "#62784d",
        "hillshade-exaggeration": 0.16,
        "hillshade-highlight-color": "#f5e6bd",
        "hillshade-shadow-color": "#33412e"
      }
    }
  ],
  terrain: {
    source: "gaixia-real-dem",
    exaggeration: 1
  }
};

export function GaixiaTerrain3D({ mapTransform }: GaixiaTerrain3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const initialCamera = cameraForTransform(mapTransform);
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
      maxPitch: 60,
      minZoom: 10.2,
      maxZoom: 12.4,
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
    };
    markMapCanvas(container, map);

    map.once("load", () => {
      map.setTerrain({ source: "gaixia-real-dem", exaggeration: 1 });
      syncMetadata();
    });
    map.on("idle", syncMetadata);

    const resizeObserver = new ResizeObserver(() => map.resize());
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
    const camera = cameraForTransform(mapTransform);
    map.jumpTo(camera);
  }, [mapTransform]);

  return (
    <div
      ref={containerRef}
      className="gaixia-terrain-3d"
      data-testid="gaixia-terrain-3d"
      data-renderer="maplibre-real-terrain"
      data-terrain-model="real-dem-raster-terrain"
      data-terrain-exaggeration="1"
      data-terrain-source={terrainTileUrl}
      data-imagery-source={imageryTileUrl}
      data-tile-cache-zoom={`${cachedTileZoom}`}
      data-projection="webgl-gis-terrain"
    />
  );
}
