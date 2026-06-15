#!/usr/bin/env python3
"""Derive GIS review products from the Battle of Britain Terrarium tile cache.

The runtime map uses local Terrarium RGB tiles directly in MapLibre. This script
turns the same committed tile cache into reviewable GDAL products so the fifth
map layer has a reproducible DEM/hillshade/contour evidence package.
"""

from __future__ import annotations

import argparse
import json
import math
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from PIL import Image, ImageFilter, ImageOps


WEB_MERCATOR_RADIUS = 6378137.0
WEB_MERCATOR_HALF_WORLD = WEB_MERCATOR_RADIUS * math.pi
TILE_SIZE = 256
DEFAULT_TERRAIN_DIR = Path("public/assets/maps/battle-of-britain-3d")
DEFAULT_OUT = Path("artifacts/london-air-terrain-gis-20260615")
DEFAULT_RUNTIME_DERIVED_DIR = DEFAULT_TERRAIN_DIR / "derived"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build DEM, hillshade, slope, and contours from London air-war Terrarium tiles."
    )
    parser.add_argument("--terrain-dir", type=Path, default=DEFAULT_TERRAIN_DIR)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--zoom", type=int, default=None, help="Tile zoom to use; defaults to manifest maxZoom.")
    parser.add_argument(
        "--sample-step",
        type=int,
        default=4,
        help="Pixel sampling step for the QA DEM. 4 keeps the artifact compact; 1 is full tile resolution."
    )
    parser.add_argument("--contour-interval", type=float, default=25.0)
    parser.add_argument(
        "--runtime-contour-interval",
        type=float,
        default=50.0,
        help="Contour interval kept for committed runtime GeoJSON; 50m gives legible relief without clutter."
    )
    parser.add_argument("--runtime-derived-dir", type=Path, default=DEFAULT_RUNTIME_DERIVED_DIR)
    parser.add_argument("--hillshade-z", type=float, default=1.35)
    return parser.parse_args()


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def run_command(args: list[str], cwd: Path) -> dict[str, Any]:
    result = subprocess.run(args, cwd=cwd, text=True, capture_output=True, check=False)
    return {
        "command": args,
        "exitCode": result.returncode,
        "ok": result.returncode == 0,
        "stdout": result.stdout.strip(),
        "stderr": result.stderr.strip(),
    }


def require_command(name: str) -> str:
    path = shutil.which(name)
    if not path:
        raise RuntimeError(f"Required command not found: {name}")
    return path


def tile_row_for_zoom(manifest: dict[str, Any], zoom: int) -> dict[str, int]:
    for row in manifest.get("coverage", []):
        if row.get("z") == zoom:
            return {
                "z": int(row["z"]),
                "xMin": int(row["xMin"]),
                "xMax": int(row["xMax"]),
                "yMin": int(row["yMin"]),
                "yMax": int(row["yMax"]),
                "count": int(row["count"]),
            }
    raise RuntimeError(f"No tile coverage for zoom {zoom}")


def terrarium_to_meters(red: int, green: int, blue: int) -> float:
    return red * 256.0 + green + blue / 256.0 - 32768.0


def web_mercator_bounds(row: dict[str, int], sample_step: int) -> dict[str, float]:
    base_pixel_size = 2 * WEB_MERCATOR_HALF_WORLD / (TILE_SIZE * (2 ** row["z"]))
    sampled_cell = base_pixel_size * sample_step
    ncols = (row["xMax"] - row["xMin"] + 1) * (TILE_SIZE // sample_step)
    nrows = (row["yMax"] - row["yMin"] + 1) * (TILE_SIZE // sample_step)
    west = -WEB_MERCATOR_HALF_WORLD + row["xMin"] * TILE_SIZE * base_pixel_size
    north = WEB_MERCATOR_HALF_WORLD - row["yMin"] * TILE_SIZE * base_pixel_size
    east = west + ncols * sampled_cell
    south = north - nrows * sampled_cell
    return {"west": west, "south": south, "east": east, "north": north, "cellSize": sampled_cell}


def tile_path(terrain_dir: Path, zoom: int, x: int, y: int) -> Path:
    return terrain_dir / "terrarium" / str(zoom) / f"{x}-{y}.png"


def topo_tile_path(terrain_dir: Path, zoom: int, x: int, y: int) -> Path:
    return terrain_dir / "topo" / str(zoom) / f"{x}-{y}.jpg"


def write_dem_ascii(
    terrain_dir: Path,
    row: dict[str, int],
    sample_step: int,
    ascii_path: Path,
) -> dict[str, Any]:
    if TILE_SIZE % sample_step != 0:
        raise RuntimeError("--sample-step must evenly divide 256")

    ascii_path.parent.mkdir(parents=True, exist_ok=True)
    ncols = (row["xMax"] - row["xMin"] + 1) * (TILE_SIZE // sample_step)
    nrows = (row["yMax"] - row["yMin"] + 1) * (TILE_SIZE // sample_step)
    bounds = web_mercator_bounds(row, sample_step)
    missing_tiles: list[str] = []
    min_elevation = math.inf
    max_elevation = -math.inf
    value_count = 0

    with ascii_path.open("w", encoding="utf-8") as handle:
        handle.write(f"ncols {ncols}\n")
        handle.write(f"nrows {nrows}\n")
        handle.write(f"xllcorner {bounds['west']:.6f}\n")
        handle.write(f"yllcorner {bounds['south']:.6f}\n")
        handle.write(f"cellsize {bounds['cellSize']:.6f}\n")
        handle.write("NODATA_value -9999\n")

        for y in range(row["yMin"], row["yMax"] + 1):
            tile_images: list[Image.Image | None] = []
            for x in range(row["xMin"], row["xMax"] + 1):
                path = tile_path(terrain_dir, row["z"], x, y)
                if not path.exists():
                    missing_tiles.append(str(path))
                    tile_images.append(None)
                    continue
                tile_images.append(Image.open(path).convert("RGB"))

            try:
                for py in range(0, TILE_SIZE, sample_step):
                    values: list[str] = []
                    for image in tile_images:
                        if image is None:
                            values.extend(["-9999"] * (TILE_SIZE // sample_step))
                            continue
                        pixels = image.load()
                        for px in range(0, TILE_SIZE, sample_step):
                            red, green, blue = pixels[px, py]
                            elevation = terrarium_to_meters(red, green, blue)
                            min_elevation = min(min_elevation, elevation)
                            max_elevation = max(max_elevation, elevation)
                            value_count += 1
                            values.append(f"{elevation:.2f}")
                    handle.write(" ".join(values) + "\n")
            finally:
                for image in tile_images:
                    if image is not None:
                        image.close()

    return {
        "ascii": str(ascii_path),
        "bounds3857": bounds,
        "missingTiles": missing_tiles,
        "ncols": ncols,
        "nrows": nrows,
        "sampleStep": sample_step,
        "valueCount": value_count,
        "elevationMeters": {
            "min": None if min_elevation is math.inf else round(min_elevation, 2),
            "max": None if max_elevation == -math.inf else round(max_elevation, 2),
        },
    }


def command_ok_or_raise(result: dict[str, Any]) -> None:
    if result["ok"]:
        return
    raise RuntimeError(
        "\n".join(
            [
                f"Command failed: {' '.join(result['command'])}",
                result.get("stdout") or "",
                result.get("stderr") or "",
            ]
        ).strip()
    )


def write_markdown(path: Path, manifest: dict[str, Any]) -> None:
    products = manifest["products"]
    lines = [
        "# London Air Terrain GIS Derivatives",
        "",
        f"Generated: {manifest['generatedAt']}",
        "",
        "## Scope",
        "",
        "This is a fifth-layer GIS evidence package derived from the existing committed Battle of Britain Terrarium tile cache. It does not change runtime source files.",
        "",
        "## Inputs",
        "",
        f"- Terrain manifest: `{manifest['inputs']['terrainManifest']}`",
        f"- Tile zoom: `{manifest['inputs']['zoom']}`",
        f"- Sample step: `{manifest['inputs']['sampleStep']}`",
        f"- Contour interval: `{manifest['inputs']['contourIntervalMeters']}m`",
        "",
        "## Outputs",
        "",
        f"- DEM ASCII Grid: `{products['demAscii']}`",
        f"- DEM GeoTIFF: `{products['demGeoTiff']}`",
        f"- Hillshade GeoTIFF: `{products['hillshadeGeoTiff']}`",
        f"- Hillshade preview PNG: `{products['hillshadePreviewPng']}`",
        f"- Slope GeoTIFF: `{products['slopeGeoTiff']}`",
        f"- Slope preview PNG: `{products['slopePreviewPng']}`",
        f"- Contours GeoJSON: `{products['contoursGeoJson']}`",
        f"- Runtime contours GeoJSON: `{products['runtimeContoursGeoJson']}`",
        f"- Runtime derived manifest: `{products['runtimeDerivedManifest']}`",
        f"- GDAL stats: `{products['gdalStats']}`",
        "",
        "## Elevation QA",
        "",
        f"- Rows x columns: `{manifest['dem']['nrows']} x {manifest['dem']['ncols']}`",
        f"- Elevation min/max: `{manifest['dem']['elevationMeters']['min']}m / {manifest['dem']['elevationMeters']['max']}m`",
        f"- Missing tiles: `{len(manifest['dem']['missingTiles'])}`",
        "",
        "## Commands",
        "",
    ]
    for command in manifest["commands"]:
        status = "ok" if command["ok"] else "failed"
        lines.append(f"- [{status}] `{' '.join(command['command'])}`")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def thin_line_coordinates(coordinates: list[Any], precision: int = 5) -> list[list[float]]:
    points: list[list[float]] = []
    for index, coordinate in enumerate(coordinates):
        if not isinstance(coordinate, list | tuple) or len(coordinate) < 2:
            continue
        lon = round(float(coordinate[0]), precision)
        lat = round(float(coordinate[1]), precision)
        point = [lon, lat]
        if points and points[-1] == point:
            continue
        if index % 2 == 0 or index == len(coordinates) - 1:
            points.append(point)
    if len(points) < 2 and len(coordinates) >= 2:
        start = coordinates[0]
        end = coordinates[-1]
        points = [[round(float(start[0]), precision), round(float(start[1]), precision)], [round(float(end[0]), precision), round(float(end[1]), precision)]]
    return points


def write_runtime_contours(
    source_geojson: Path,
    output_geojson: Path,
    runtime_interval: float,
    contour_interval: float,
) -> dict[str, Any]:
    source = read_json(source_geojson)
    features: list[dict[str, Any]] = []
    coordinate_count = 0
    kept_elevations: set[float] = set()
    source_features = source.get("features", [])

    for feature in source_features:
        properties = feature.get("properties", {})
        elevation = float(properties.get("elev_m", 0))
        if runtime_interval > contour_interval and abs((elevation / runtime_interval) - round(elevation / runtime_interval)) > 0.001:
            continue
        geometry = feature.get("geometry", {})
        geometry_type = geometry.get("type")
        output_geometry: dict[str, Any] | None = None
        if geometry_type == "LineString":
            coordinates = thin_line_coordinates(geometry.get("coordinates", []))
            if len(coordinates) >= 2:
                coordinate_count += len(coordinates)
                output_geometry = {"type": "LineString", "coordinates": coordinates}
        elif geometry_type == "MultiLineString":
            lines = []
            for line in geometry.get("coordinates", []):
                coordinates = thin_line_coordinates(line)
                if len(coordinates) >= 2:
                    coordinate_count += len(coordinates)
                    lines.append(coordinates)
            if lines:
                output_geometry = {"type": "MultiLineString", "coordinates": lines}
        if output_geometry is None:
            continue
        kept_elevations.add(elevation)
        features.append(
            {
                "type": "Feature",
                "properties": {"elev_m": elevation},
                "geometry": output_geometry,
            }
        )

    output = {
        "type": "FeatureCollection",
        "features": features,
    }
    output_geojson.parent.mkdir(parents=True, exist_ok=True)
    output_geojson.write_text(json.dumps(output, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    return {
        "coordinateCount": coordinate_count,
        "elevationsMeters": sorted(kept_elevations),
        "featureCount": len(features),
        "sourceFeatureCount": len(source_features),
    }


def remap_range(value: float, in_min: float, in_max: float, out_min: float, out_max: float) -> float:
    if in_max <= in_min:
        return out_min
    ratio = max(0.0, min(1.0, (value - in_min) / (in_max - in_min)))
    return out_min + (out_max - out_min) * ratio


def write_runtime_relief_texture(
    hillshade_png: Path,
    slope_png: Path,
    output_png: Path,
    root: Path,
) -> dict[str, Any]:
    hill = Image.open(hillshade_png).convert("L")
    slope = Image.open(slope_png).convert("L")
    try:
        if slope.size != hill.size:
            slope = slope.resize(hill.size, Image.Resampling.BILINEAR)
        width, height = hill.size
        output_png.parent.mkdir(parents=True, exist_ok=True)
        pixels = output_png.parent / f".{output_png.name}.tmp"
        image = Image.new("RGBA", (width, height))
        hill_pixels = hill.load()
        slope_pixels = slope.load()
        out_pixels = image.load()

        coverage = 0
        alpha_sum = 0
        max_alpha = 0
        for y in range(height):
            for x in range(width):
                hill_v = hill_pixels[x, y]
                slope_v = slope_pixels[x, y]
                ridge = max(0.0, min(1.0, (255 - hill_v) / 255.0))
                slope_norm = max(0.0, min(1.0, slope_v / 255.0))
                alpha = int(round(remap_range(ridge * 0.75 + slope_norm * 0.45, 0.0, 1.2, 0, 96)))
                alpha = max(0, min(96, alpha))
                if alpha > 0:
                    coverage += 1
                alpha_sum += alpha
                max_alpha = max(max_alpha, alpha)
                cool = int(round(remap_range(hill_v, 0, 255, 66, 228)))
                warm = int(round(remap_range(255 - slope_v, 0, 255, 78, 214)))
                blue = min(255, max(0, int(round(cool * 0.74 + warm * 0.26))))
                green = min(255, max(0, int(round(cool * 0.82 + warm * 0.18))))
                red = min(255, max(0, int(round(cool * 0.63 + warm * 0.37))))
                out_pixels[x, y] = (red, green, blue, alpha)
        image.save(output_png)
    finally:
        hill.close()
        slope.close()
    return {
        "height": height,
        "width": width,
        "alphaCoverageRatio": coverage / (width * height),
        "alphaMax": max_alpha,
        "alphaMean": alpha_sum / (width * height),
        "output": str(output_png.relative_to(root)),
    }


def write_runtime_transport_reference(
    terrain_dir: Path,
    row: dict[str, int],
    sample_step: int,
    output_png: Path,
    root: Path,
) -> dict[str, Any]:
    tile_sample_size = TILE_SIZE // sample_step
    width = (row["xMax"] - row["xMin"] + 1) * tile_sample_size
    height = (row["yMax"] - row["yMin"] + 1) * tile_sample_size
    topo_mosaic = Image.new("RGB", (width, height), (236, 240, 229))
    missing_tiles: list[str] = []

    for tile_y, y in enumerate(range(row["yMin"], row["yMax"] + 1)):
        for tile_x, x in enumerate(range(row["xMin"], row["xMax"] + 1)):
            path = topo_tile_path(terrain_dir, row["z"], x, y)
            if not path.exists():
                missing_tiles.append(str(path.relative_to(root)))
                continue
            with Image.open(path).convert("RGB") as tile:
                sampled = tile.resize((tile_sample_size, tile_sample_size), Image.Resampling.LANCZOS)
                topo_mosaic.paste(sampled, (tile_x * tile_sample_size, tile_y * tile_sample_size))

    gray = ImageOps.grayscale(topo_mosaic)
    edges = gray.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.GaussianBlur(radius=0.55))
    output_png.parent.mkdir(parents=True, exist_ok=True)
    output = Image.new("RGBA", (width, height))
    topo_pixels = topo_mosaic.load()
    edge_pixels = edges.load()
    out_pixels = output.load()

    coverage = 0
    alpha_sum = 0
    max_alpha = 0
    blue_ink_count = 0
    warm_road_count = 0
    dark_line_count = 0

    for y in range(height):
        for x in range(width):
            red, green, blue = topo_pixels[x, y]
            edge = edge_pixels[x, y]
            luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722
            saturation = max(red, green, blue) - min(red, green, blue)
            blue_ink = blue > red + 10 and green > red + 4 and luminance < 232
            warm_road = red > blue + 8 and green > blue + 4 and luminance < 238 and saturation > 14
            dark_line = luminance < 206 and edge > 4
            high_frequency = edge > 7 and luminance < 240

            if not (blue_ink or warm_road or dark_line or high_frequency):
                out_pixels[x, y] = (0, 0, 0, 0)
                continue

            alpha = int(round((max(0, edge - 4) * 1.25) + max(0, 230 - luminance) * 0.32 + min(54, saturation) * 0.18))
            if blue_ink:
                alpha += 10
                blue_ink_count += 1
            if warm_road:
                alpha += 8
                warm_road_count += 1
            if dark_line:
                alpha += 6
                dark_line_count += 1
            alpha = max(0, min(82, alpha))
            if alpha <= 4:
                out_pixels[x, y] = (0, 0, 0, 0)
                continue

            coverage += 1
            alpha_sum += alpha
            max_alpha = max(max_alpha, alpha)
            if blue_ink:
                out_pixels[x, y] = (34, 82, 103, alpha)
            elif warm_road:
                out_pixels[x, y] = (112, 92, 58, alpha)
            else:
                out_pixels[x, y] = (38, 63, 64, alpha)

    output.save(output_png)
    return {
        "height": height,
        "width": width,
        "alphaCoverageRatio": coverage / (width * height),
        "alphaMax": max_alpha,
        "alphaMean": alpha_sum / (width * height),
        "blueInkPixels": blue_ink_count,
        "darkLinePixels": dark_line_count,
        "missingTiles": missing_tiles,
        "output": str(output_png.relative_to(root)),
        "warmRoadPixels": warm_road_count,
    }


def main() -> int:
    args = parse_args()
    root = Path.cwd()
    terrain_dir = (root / args.terrain_dir).resolve()
    out_dir = (root / args.out).resolve()
    manifest_path = terrain_dir / "manifest.json"
    if not manifest_path.exists():
        raise RuntimeError(f"Terrain manifest not found: {manifest_path}")

    for command in ["gdal_translate", "gdaldem", "gdal_contour", "ogr2ogr", "gdalinfo"]:
        require_command(command)

    tile_manifest = read_json(manifest_path)
    zoom = int(args.zoom or tile_manifest.get("maxZoom"))
    row = tile_row_for_zoom(tile_manifest, zoom)

    work_dir = out_dir / "work"
    products_dir = out_dir / "products"
    work_dir.mkdir(parents=True, exist_ok=True)
    products_dir.mkdir(parents=True, exist_ok=True)

    dem_ascii = work_dir / f"battle-of-britain-dem-z{zoom}-step{args.sample_step}.asc"
    dem_tif = products_dir / "battle-of-britain-dem-qa-3857.tif"
    hillshade_tif = products_dir / "battle-of-britain-hillshade-qa-3857.tif"
    hillshade_png = products_dir / "battle-of-britain-hillshade-preview.png"
    slope_tif = products_dir / "battle-of-britain-slope-qa-3857.tif"
    slope_png = products_dir / "battle-of-britain-slope-preview.png"
    contours_3857 = work_dir / "battle-of-britain-contours-3857.geojson"
    contours_geojson = products_dir / "battle-of-britain-contours.geojson"
    runtime_derived_dir = (root / args.runtime_derived_dir).resolve()
    runtime_contours_geojson = runtime_derived_dir / "battle-of-britain-contours-runtime.geojson"
    runtime_manifest_path = runtime_derived_dir / "manifest.json"
    runtime_relief_png = runtime_derived_dir / "battle-of-britain-runtime-relief.png"
    runtime_transport_png = runtime_derived_dir / "battle-of-britain-transport-reference.png"
    gdal_stats_path = products_dir / "gdal-stats.json"

    dem_info = write_dem_ascii(terrain_dir, row, args.sample_step, dem_ascii)
    commands: list[dict[str, Any]] = []

    commands.append(
        run_command(
            [
                "gdal_translate",
                "-of",
                "GTiff",
                "-a_srs",
                "EPSG:3857",
                "-co",
                "COMPRESS=DEFLATE",
                "-co",
                "PREDICTOR=3",
                str(dem_ascii),
                str(dem_tif),
            ],
            root,
        )
    )
    command_ok_or_raise(commands[-1])

    commands.append(
        run_command(
            [
                "gdaldem",
                "hillshade",
                str(dem_tif),
                str(hillshade_tif),
                "-compute_edges",
                "-z",
                str(args.hillshade_z),
                "-az",
                "315",
                "-alt",
                "45",
            ],
            root,
        )
    )
    command_ok_or_raise(commands[-1])

    commands.append(run_command(["gdal_translate", "-of", "PNG", str(hillshade_tif), str(hillshade_png)], root))
    command_ok_or_raise(commands[-1])

    commands.append(run_command(["gdaldem", "slope", str(dem_tif), str(slope_tif), "-compute_edges"], root))
    command_ok_or_raise(commands[-1])

    commands.append(
        run_command(
            ["gdal_translate", "-of", "PNG", "-ot", "Byte", "-scale", "0", "35", "0", "255", str(slope_tif), str(slope_png)],
            root,
        )
    )
    command_ok_or_raise(commands[-1])

    commands.append(
        run_command(
            ["gdal_contour", "-a", "elev_m", "-i", str(args.contour_interval), str(dem_tif), str(contours_3857)],
            root,
        )
    )
    command_ok_or_raise(commands[-1])

    commands.append(run_command(["ogr2ogr", "-t_srs", "EPSG:4326", str(contours_geojson), str(contours_3857)], root))
    command_ok_or_raise(commands[-1])

    runtime_contours = write_runtime_contours(
        contours_geojson,
        runtime_contours_geojson,
        args.runtime_contour_interval,
        args.contour_interval,
    )
    runtime_relief = write_runtime_relief_texture(hillshade_png, slope_png, runtime_relief_png, root)
    runtime_transport = write_runtime_transport_reference(terrain_dir, row, args.sample_step, runtime_transport_png, root)
    runtime_manifest = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "battle": "battle-of-britain",
        "purpose": "runtime-fifth-layer-gis-final-derivatives",
        "source": {
            "terrainManifest": str(manifest_path.relative_to(root)),
            "qaManifest": str((out_dir / "terrain-gis-derivatives-manifest.json").relative_to(root)),
        },
        "contours": {
            "url": "/assets/maps/battle-of-britain-3d/derived/battle-of-britain-contours-runtime.geojson",
            "sourceIntervalMeters": args.contour_interval,
            "runtimeIntervalMeters": args.runtime_contour_interval,
            **runtime_contours,
        },
        "reliefTexture": {
            "url": "/assets/maps/battle-of-britain-3d/derived/battle-of-britain-runtime-relief.png",
            **runtime_relief,
        },
        "transportReference": {
            "url": "/assets/maps/battle-of-britain-3d/derived/battle-of-britain-transport-reference.png",
            **runtime_transport,
        },
        "limitations": [
            "Runtime GeoJSON is a thinned validation layer derived from committed Terrarium tiles, not a final public GIS dataset.",
            "It is intentionally limited to subtle contour/coastline cues below aircraft, routes, labels, and local weather units.",
            "The runtime relief texture is derived from the same local hillshade and slope outputs and is intended as a subtle texture lift, not a new full-map paint layer.",
            "The runtime transport reference is extracted from the committed Esri topo cache as transparent linework, not as a restored full topo raster wash.",
        ],
    }
    write_json(runtime_manifest_path, runtime_manifest)

    stats = run_command(["gdalinfo", "-json", "-stats", str(dem_tif)], root)
    command_ok_or_raise(stats)
    gdal_stats_path.write_text(stats["stdout"] + "\n", encoding="utf-8")
    commands.append({**stats, "stdout": f"written to {gdal_stats_path}"})

    products = {
        "demAscii": str(dem_ascii.relative_to(root)),
        "demGeoTiff": str(dem_tif.relative_to(root)),
        "hillshadeGeoTiff": str(hillshade_tif.relative_to(root)),
        "hillshadePreviewPng": str(hillshade_png.relative_to(root)),
        "slopeGeoTiff": str(slope_tif.relative_to(root)),
        "slopePreviewPng": str(slope_png.relative_to(root)),
        "contoursGeoJson": str(contours_geojson.relative_to(root)),
        "runtimeContoursGeoJson": str(runtime_contours_geojson.relative_to(root)),
        "runtimeDerivedManifest": str(runtime_manifest_path.relative_to(root)),
        "runtimeReliefTexture": str(runtime_relief_png.relative_to(root)),
        "runtimeTransportReference": str(runtime_transport_png.relative_to(root)),
        "gdalStats": str(gdal_stats_path.relative_to(root)),
    }
    output_manifest = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "battle": {
            "id": "battle-of-britain",
            "title": "伦敦上空的鹰",
            "layer": "fifth-map-layer-gis-derivatives",
        },
        "inputs": {
            "terrainDir": str(terrain_dir.relative_to(root)),
            "terrainManifest": str(manifest_path.relative_to(root)),
            "zoom": zoom,
            "sampleStep": args.sample_step,
            "contourIntervalMeters": args.contour_interval,
            "hillshadeZFactor": args.hillshade_z,
            "sourceBounds4326": tile_manifest.get("bounds"),
            "sourceAttribution": tile_manifest.get("attribution"),
        },
        "dem": dem_info,
        "runtimeDerivatives": runtime_manifest,
        "products": products,
        "commands": commands,
        "status": "ready-for-fifth-layer-review",
        "limitations": [
            "The QA DEM is sampled from committed Terrarium tiles and is intended for review evidence, not as a higher-authority source than the original terrain tile cache.",
            "Runtime still uses the existing MapLibre Terrarium tile source; these products are GIS derivatives for inspection, rule capture, and future refinement.",
            "The transport-reference texture intentionally keeps roads and cartographic linework without restoring full third-party label dominance.",
            "gdal_calc.py is not required because local Homebrew Python currently has a numpy ABI issue.",
        ],
    }
    write_json(out_dir / "terrain-gis-derivatives-manifest.json", output_manifest)
    write_markdown(out_dir / "terrain-gis-derivatives-report.md", output_manifest)
    print(json.dumps({"out": str(out_dir.relative_to(root)), "status": output_manifest["status"], "products": products}, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(1)
