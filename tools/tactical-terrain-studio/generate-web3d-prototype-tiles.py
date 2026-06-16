#!/usr/bin/env python3
"""Generate synthetic Terrarium DEM and bare-terrain texture tiles.

This is a local Web 3D capability demo input, not a historical terrain
reconstruction. Real battle production should replace this with DEM/GIS data.
"""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/prototypes/web3d-terrain-prototype/tiles"
# Wider than the visible camera envelope so pitched terrain views do not expose
# the source edge as a beige vertical skirt.
BOUNDS = (11.12, 47.07, 11.72, 47.50)
DETAIL_BOUNDS = (11.24, 47.18, 11.58, 47.38)
ZOOMS = (11, 12, 13, 14)
TILE_SIZE = 256


def lonlat_to_tile_fraction(lon: float, lat: float, zoom: int) -> tuple[float, float]:
    n = 2**zoom
    x = (lon + 180.0) / 360.0 * n
    lat_rad = math.radians(lat)
    y = (1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n
    return x, y


def tile_grid(z: int, x: int, y: int) -> tuple[np.ndarray, np.ndarray]:
    n = 2**z
    px = (np.arange(TILE_SIZE, dtype=np.float64) + 0.5) / TILE_SIZE
    py = (np.arange(TILE_SIZE, dtype=np.float64) + 0.5) / TILE_SIZE
    gx, gy = np.meshgrid(x + px, y + py)
    lon = gx / n * 360.0 - 180.0
    merc_y = np.pi * (1.0 - 2.0 * gy / n)
    lat = np.degrees(np.arctan(np.sinh(merc_y)))
    return lon, lat


def tile_range(z: int) -> tuple[range, range]:
    west, south, east, north = DETAIL_BOUNDS if z >= 14 else BOUNDS
    x0, y0 = lonlat_to_tile_fraction(west, north, z)
    x1, y1 = lonlat_to_tile_fraction(east, south, z)
    return range(math.floor(x0), math.floor(x1) + 1), range(math.floor(y0), math.floor(y1) + 1)


def smoothstep(edge0: float, edge1: float, value: np.ndarray) -> np.ndarray:
    t = np.clip((value - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def hash_grid(ix: np.ndarray, iy: np.ndarray) -> np.ndarray:
    return np.mod(np.sin(ix * 127.1 + iy * 311.7) * 43758.5453123, 1.0)


def value_noise(x: np.ndarray, y: np.ndarray) -> np.ndarray:
    x0 = np.floor(x)
    y0 = np.floor(y)
    xf = x - x0
    yf = y - y0
    u = xf * xf * (3.0 - 2.0 * xf)
    v = yf * yf * (3.0 - 2.0 * yf)
    n00 = hash_grid(x0, y0)
    n10 = hash_grid(x0 + 1, y0)
    n01 = hash_grid(x0, y0 + 1)
    n11 = hash_grid(x0 + 1, y0 + 1)
    nx0 = n00 * (1.0 - u) + n10 * u
    nx1 = n01 * (1.0 - u) + n11 * u
    return nx0 * (1.0 - v) + nx1 * v


def fbm(x: np.ndarray, y: np.ndarray, octaves: int = 5) -> np.ndarray:
    total = np.zeros_like(x)
    amplitude = 0.5
    frequency = 1.0
    norm = 0.0
    for _ in range(octaves):
        total += amplitude * value_noise(x * frequency, y * frequency)
        norm += amplitude
        amplitude *= 0.5
        frequency *= 2.03
    return total / norm


def normalized(lon: np.ndarray, lat: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    west, south, east, north = BOUNDS
    return (lon - west) / (east - west), (lat - south) / (north - south)


def terrain_height(lon: np.ndarray, lat: np.ndarray) -> np.ndarray:
    u, v = normalized(lon, lat)
    valley_center = 0.42 + 0.22 * np.sin((u - 0.12) * np.pi * 1.05) - 0.12 * (u - 0.5)
    valley_distance = np.abs(v - valley_center)
    valley_floor = smoothstep(0.0, 0.18, valley_distance)

    ridge_left = np.exp(-((v - (valley_center + 0.34 + 0.04 * np.sin(u * 7.0))) ** 2) / 0.018)
    ridge_right = np.exp(-((v - (valley_center - 0.31 + 0.05 * np.cos(u * 6.0))) ** 2) / 0.015)
    headwall = np.exp(-(((u - 0.78) ** 2) / 0.032 + ((v - 0.68) ** 2) / 0.04))
    foreground_ridge = np.exp(-(((u - 0.22) ** 2) / 0.06 + ((v - 0.18) ** 2) / 0.028))

    drainage = np.zeros_like(u)
    for offset, amp, freq in ((0.16, 1.0, 8.0), (-0.12, 0.85, 10.0), (0.29, 0.65, 12.0)):
        stream = v - (valley_center + offset * np.sin(u * np.pi))
        drainage += amp * np.exp(-(stream * stream) / 0.00042) * (0.4 + 0.6 * np.sin((u + offset) * freq) ** 2)

    micro = (fbm(u * 12.0 + 4.0, v * 12.0 - 2.0, 6) - 0.5) * 430.0
    striation = np.sin((u * 19.0 + v * 7.5) * np.pi) * 70.0

    height = (
        720.0
        + valley_floor * 640.0
        + ridge_left * 760.0
        + ridge_right * 680.0
        + headwall * 860.0
        + foreground_ridge * 460.0
        - drainage * 140.0
        + micro * 0.5
        + striation * 0.5
    )
    return np.clip(height, 260.0, 2350.0)


def terrarium_image(height: np.ndarray) -> Image.Image:
    encoded = height + 32768.0
    red = np.floor(encoded / 256.0)
    green = np.floor(encoded % 256.0)
    blue = np.round((encoded - np.floor(encoded)) * 256.0)
    rgb = np.dstack([red, green, blue]).clip(0, 255).astype(np.uint8)
    return Image.fromarray(rgb, "RGB")


def texture_image(lon: np.ndarray, lat: np.ndarray, height: np.ndarray) -> Image.Image:
    u, v = normalized(lon, lat)
    dy, dx = np.gradient(height)
    shade = np.clip((-dx * -0.48 + -dy * -0.62 + 120.0 * 0.62) / np.sqrt(dx * dx + dy * dy + 120.0 * 120.0), -0.55, 1.0)
    slope = np.clip(np.sqrt(dx * dx + dy * dy) / 95.0, 0.0, 1.0)

    valley_center = 0.42 + 0.22 * np.sin((u - 0.12) * np.pi * 1.05) - 0.12 * (u - 0.5)
    valley_distance = np.abs(v - valley_center)
    valley_t = 1.0 - smoothstep(0.015, 0.22, valley_distance)
    vegetation = np.clip(valley_t * 0.7 + (1.0 - slope) * 0.15 + (fbm(u * 22, v * 22, 4) - 0.5) * 0.2, 0.0, 1.0)
    rock = np.clip((height - 1220.0) / 860.0 + slope * 0.36, 0.0, 1.0)
    pale_rock = smoothstep(1680.0, 2260.0, height) * (0.24 + 0.14 * fbm(u * 34, v * 34, 3))

    dry = np.array([158, 139, 98], dtype=np.float64)
    grass = np.array([86, 116, 71], dtype=np.float64)
    rock_color = np.array([126, 121, 106], dtype=np.float64)
    pale_rock_color = np.array([183, 174, 153], dtype=np.float64)
    color = dry * (1.0 - vegetation[..., None]) + grass * vegetation[..., None]
    color = color * (1.0 - rock[..., None]) + rock_color * rock[..., None]
    color = color * (1.0 - pale_rock[..., None]) + pale_rock_color * pale_rock[..., None]

    striation = 0.5 + 0.5 * np.sin((u * 46.0 + v * 19.0 + fbm(u * 10, v * 10, 3) * 2.6) * np.pi)
    fine_grain = fbm(u * 76, v * 76, 3) - 0.5
    contour = np.abs(np.mod(height / 84.0, 1.0) - 0.5)
    contour_line = np.clip((0.055 - contour) / 0.055, 0.0, 1.0) * (0.16 + 0.28 * slope)
    contrast = 0.76 + 0.52 * np.maximum(0.0, shade) - 0.2 * np.maximum(0.0, -shade) - 0.12 * slope + (striation - 0.5) * 0.08 + fine_grain * 0.055 - contour_line
    color = np.clip(color * contrast[..., None], 0, 255).astype(np.uint8)
    return Image.fromarray(color, "RGB")


def main() -> None:
    for subdir in ("highland-dem", "highland-texture"):
        target = OUT / subdir
        if target.exists():
            for path in target.rglob("*.png"):
                path.unlink()

    count = 0
    for z in ZOOMS:
        xs, ys = tile_range(z)
        for x in xs:
            for y in ys:
                lon, lat = tile_grid(z, x, y)
                height = terrain_height(lon, lat)
                dem = terrarium_image(height)
                texture = texture_image(lon, lat, height)
                dem_path = OUT / "highland-dem" / str(z) / f"{x}-{y}.png"
                tex_path = OUT / "highland-texture" / str(z) / f"{x}-{y}.png"
                dem_path.parent.mkdir(parents=True, exist_ok=True)
                tex_path.parent.mkdir(parents=True, exist_ok=True)
                dem.save(dem_path, optimize=True)
                texture.save(tex_path, optimize=True)
                count += 2
    print(f"generated {count} synthetic Web 3D tiles under {OUT}")


if __name__ == "__main__":
    main()
