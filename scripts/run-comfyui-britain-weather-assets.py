from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import time
import urllib.request
from pathlib import Path
from typing import Any

from PIL import Image, ImageChops, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_COMFY_DIR = Path.home() / "Documents" / "我心飞翔" / "tools" / "ComfyUI"
DEFAULT_OUTPUT_DIR = ROOT / "artifacts/london-air-comfy-weather-20260614"
RUNTIME_DIR = ROOT / "public/assets/weather/battle-of-britain"

WEATHER_ASSETS: dict[str, dict[str, Any]] = {
    "morning-cloud-bank": {
        "runtime": "morning-cloud-bank.png",
        "width": 1216,
        "height": 512,
        "seedOffset": 17,
        "alphaFloor": 34,
        "alphaScale": 1.18,
        "maxOpaqueRatio": 0.25,
        "targetAlphaRatio": 0.052,
        "backgroundQuantile": 0.58,
        "backgroundOffset": 18,
        "prompt": (
            "premium strategy game weather overlay asset for a WWII Battle of Britain tactical air map, "
            "finished ComfyUI weather sprite, broken cumulus cloud bank viewed from high altitude top-down, "
            "irregular layered volumetric cloud islands and long wind-sheared streaks, strong soft depth, detailed cloud texture, "
            "darker grey undersides, muted silver sunlit rims, cinematic but restrained, large natural clear gaps for aircraft icons and route lines, "
            "clouds occupy the middle of the canvas with empty black corners and borders, no aircraft, no land, no sea, no map labels, no text, no symbols, "
            "isolated cloud forms on a perfectly pure black background for alpha extraction, no rectangle, no fog blanket, no painted ellipses, no procedural blobs"
        ),
    },
    "afternoon-cloud-breaks": {
        "runtime": "afternoon-cloud-breaks.png",
        "width": 1216,
        "height": 512,
        "seedOffset": 41,
        "alphaFloor": 22,
        "alphaScale": 1.95,
        "maxOpaqueRatio": 0.22,
        "targetAlphaRatio": 0.043,
        "backgroundQuantile": 0.35,
        "backgroundOffset": 8,
        "prompt": (
            "premium strategy game weather overlay asset for a WWII Battle of Britain tactical air map, "
            "finished ComfyUI weather sprite, thinning afternoon broken cloud lanes viewed from high altitude top-down, "
            "airy volumetric wisps and separate cloud islands, visible depth and soft shadows, clean natural clear gaps for aircraft icons and route lines, "
            "brighter sunlit edges but not white-out, clouds occupy the middle of the canvas with empty black corners and borders, "
            "no aircraft, no land, no sea, no map labels, no text, no symbols, isolated cloud forms on a perfectly pure black background for alpha extraction, "
            "no rectangle, no fog blanket, no painted ellipses, no procedural blobs"
        ),
    },
}

NEGATIVE_PROMPT = (
    "aircraft, airplanes, city, land, coastline, ocean waves, map labels, text, watermark, logo, frame, UI, "
    "cartoon, vector, geometric shapes, flat blobs, painted ellipses, bokeh circles, smoke explosion, storm wall, heavy fog blanket, "
    "pure white rectangle, gray card, visible border, non-black background, checkerboard, people, blurred rectangle, low detail haze"
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate Battle of Britain cloud/weather overlay PNG assets via the existing ComfyUI service.")
    parser.add_argument("--apply", action="store_true", help="Copy validated PNG assets into public/assets/weather/battle-of-britain.")
    parser.add_argument("--asset", action="append", choices=sorted(WEATHER_ASSETS), help="Asset id to process. Repeatable. Defaults to all.")
    parser.add_argument("--cfg", type=float, default=7.5)
    parser.add_argument("--checkpoint", default="v1-5-pruned-emaonly.safetensors")
    parser.add_argument("--comfy-dir", type=Path, default=DEFAULT_COMFY_DIR)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--sampler", default="euler")
    parser.add_argument("--scheduler", default="normal")
    parser.add_argument("--seed", type=int, default=2026061407)
    parser.add_argument("--steps", type=int, default=22)
    parser.add_argument("--timeout-seconds", type=int, default=600)
    parser.add_argument("--url", default="http://127.0.0.1:8188")
    parser.add_argument("--run-id", default=time.strftime("%Y%m%d%H%M%S"))
    parser.add_argument("--reuse-rgb-dir", type=Path, help="Reuse existing ComfyUI RGB outputs from a prior run and only redo local alpha/color post-processing.")
    return parser.parse_args()


def digest_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def get_json(url: str, endpoint: str) -> dict[str, Any]:
    with urllib.request.urlopen(f"{url}{endpoint}", timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def post_json(url: str, endpoint: str, body: dict[str, Any]) -> dict[str, Any]:
    request = urllib.request.Request(
        f"{url}{endpoint}",
        data=json.dumps(body).encode("utf-8"),
        headers={"content-type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def assert_comfy_ready(url: str, comfy_dir: Path, checkpoint: str) -> dict[str, Any]:
    checkpoint_path = comfy_dir / "models" / "checkpoints" / checkpoint
    if not checkpoint_path.exists():
        raise SystemExit(f"missing ComfyUI checkpoint: {checkpoint_path}")
    system_stats = get_json(url, "/system_stats")
    checkpoint_stat = checkpoint_path.stat()
    return {
        "checkpoint": str(checkpoint_path),
        "checkpointMtime": checkpoint_stat.st_mtime,
        "checkpointSize": checkpoint_stat.st_size,
        "comfyuiVersion": system_stats.get("system", {}).get("comfyui_version", ""),
        "requiredNodes": ["EmptyLatentImage", "CheckpointLoaderSimple", "CLIPTextEncode", "KSampler", "VAEDecode", "SaveImage"],
    }


def make_prompt(asset_id: str, config: dict[str, Any], args: argparse.Namespace) -> dict[str, Any]:
    prefix = f"war_london_air_weather_{args.run_id}_{asset_id}_rgb"
    return {
        "1": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": args.checkpoint}},
        "2": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "clip": ["1", 1],
                "text": config["prompt"],
            },
        },
        "3": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["1", 1], "text": NEGATIVE_PROMPT}},
        "4": {
            "class_type": "EmptyLatentImage",
            "inputs": {
                "batch_size": 1,
                "height": config["height"],
                "width": config["width"],
            },
        },
        "5": {
            "class_type": "KSampler",
            "inputs": {
                "cfg": args.cfg,
                "denoise": 1,
                "latent_image": ["4", 0],
                "model": ["1", 0],
                "negative": ["3", 0],
                "positive": ["2", 0],
                "sampler_name": args.sampler,
                "scheduler": args.scheduler,
                "seed": args.seed + int(config["seedOffset"]),
                "steps": args.steps,
            },
        },
        "6": {"class_type": "VAEDecode", "inputs": {"samples": ["5", 0], "vae": ["1", 2]}},
        "7": {"class_type": "SaveImage", "inputs": {"filename_prefix": prefix, "images": ["6", 0]}},
    }


def wait_for_history(url: str, prompt_id: str, timeout_seconds: int) -> dict[str, Any]:
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        history = get_json(url, f"/history/{prompt_id}")
        if prompt_id in history:
            return history[prompt_id]
        time.sleep(1)
    raise RuntimeError(f"ComfyUI prompt timed out: {prompt_id}")


def collect_output_by_prefix(comfy_dir: Path, history: dict[str, Any], prefix: str) -> Path:
    for node in history.get("outputs", {}).values():
        for image in node.get("images", []):
            path = comfy_dir / "output" / image.get("subfolder", "") / image["filename"]
            if path.exists() and image["filename"].startswith(prefix):
                return path
    raise RuntimeError(f"ComfyUI output missing for prefix {prefix}")


def edge_fade_multiplier(x: int, y: int, width: int, height: int) -> float:
    horizontal = min(x / max(1, width - 1), (width - 1 - x) / max(1, width - 1))
    vertical = min(y / max(1, height - 1), (height - 1 - y) / max(1, height - 1))
    return min(1.0, max(0.0, horizontal * 12.0), max(0.0, vertical * 8.0))


def make_edge_fade(width: int, height: int) -> Image.Image:
    data = bytearray(width * height)
    for y in range(height):
        row_offset = y * width
        for x in range(width):
            data[row_offset + x] = round(edge_fade_multiplier(x, y, width, height) * 255)
    return Image.frombytes("L", (width, height), bytes(data))


def estimate_edge_background_luminance(image: Image.Image, quantile: float) -> float:
    width, height = image.size
    pixels = image.load()
    values: list[float] = []
    for x in range(width):
        for y in (0, height - 1):
            red, green, blue = pixels[x, y]
            values.append(red * 0.2126 + green * 0.7152 + blue * 0.0722)
    for y in range(height):
        for x in (0, width - 1):
            red, green, blue = pixels[x, y]
            values.append(red * 0.2126 + green * 0.7152 + blue * 0.0722)
    values.sort()
    if not values:
        return 0
    return values[round(len(values) * quantile)]


def normalize_alpha_density(alpha: Image.Image, target_alpha_ratio: float, max_opaque_ratio: float) -> Image.Image:
    width, height = alpha.size
    values = list(alpha.tobytes())
    pixel_count = width * height
    opaque_values = sorted((value for value in values if value > 10), reverse=True)
    if not opaque_values:
        return alpha

    allowed_opaque_count = max(1, round(pixel_count * max_opaque_ratio))
    cutoff = opaque_values[min(len(opaque_values) - 1, allowed_opaque_count - 1)] if len(opaque_values) > allowed_opaque_count else 10
    dense_alpha = alpha.point(lambda value: 0 if value < max(12, cutoff) else value)
    dense_alpha = dense_alpha.filter(ImageFilter.GaussianBlur(0.65))

    dense_values = list(dense_alpha.tobytes())
    current_alpha_ratio = sum(dense_values) / (255 * pixel_count)
    if current_alpha_ratio <= 0:
        return dense_alpha
    scale = max(0.54, min(1.75, target_alpha_ratio / current_alpha_ratio))
    return dense_alpha.point(lambda value: min(232, round(value * scale)))


def extract_cloud_alpha(
    rgb_path: Path,
    output_path: Path,
    alpha_floor: int,
    alpha_scale: float,
    target_alpha_ratio: float,
    max_opaque_ratio: float,
    background_quantile: float,
    background_offset: float,
) -> dict[str, Any]:
    image = ImageOps.exif_transpose(Image.open(rgb_path)).convert("RGB")
    image = ImageOps.autocontrast(image, cutoff=0.25)
    image = ImageEnhance.Color(image).enhance(0.62)
    image = ImageEnhance.Contrast(image).enhance(1.16)
    width, height = image.size
    background_luminance = estimate_edge_background_luminance(image, background_quantile)
    rgb_bytes = image.tobytes()
    alpha_bytes = bytearray(width * height)
    visible_count = 0
    luminance_sum = 0.0
    for index in range(0, len(rgb_bytes), 3):
        red = rgb_bytes[index]
        green = rgb_bytes[index + 1]
        blue = rgb_bytes[index + 2]
        luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722
        chroma = max(red, green, blue) - min(red, green, blue)
        # Preserve the ComfyUI cloud topology: alpha comes from actual rendered cloud
        # material above the generated backing, not from a hand-drawn distribution mask.
        relative_luminance = max(0.0, luminance - background_luminance - alpha_floor * 0.16)
        absolute_highlight = max(0.0, luminance - max(alpha_floor, background_luminance + background_offset))
        opacity = relative_luminance * alpha_scale + absolute_highlight * 0.62 + max(0, chroma - 14) * 0.22
        opacity = max(0, min(226, round(opacity)))
        if opacity > 6:
            visible_count += 1
            luminance_sum += luminance
        alpha_bytes[index // 3] = opacity
    alpha = Image.frombytes("L", (width, height), bytes(alpha_bytes))
    alpha = alpha.filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.GaussianBlur(0.72))
    alpha = alpha.point(lambda value: 0 if value < 10 else min(230, round(value * 1.08)))
    edge_fade = make_edge_fade(width, height)
    alpha = ImageChops.multiply(alpha, edge_fade)
    alpha = normalize_alpha_density(alpha, target_alpha_ratio=target_alpha_ratio, max_opaque_ratio=max_opaque_ratio)
    alpha = ImageChops.multiply(alpha, edge_fade)

    rgba = image.convert("RGBA")
    rgba.putalpha(alpha)
    # Keep clouds visible as finished weather art while staying below aircraft/routes.
    rgb = rgba.convert("RGB")
    rgb = ImageEnhance.Brightness(rgb).enhance(0.86)
    rgb = ImageEnhance.Contrast(rgb).enhance(1.2)
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.16)
    rgba = rgb.convert("RGBA")
    rgba.putalpha(alpha)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    rgba.save(output_path)

    alpha_values = list(alpha.tobytes())
    edge_pixels = []
    for x in range(width):
        edge_pixels.append(alpha.getpixel((x, 0)))
        edge_pixels.append(alpha.getpixel((x, height - 1)))
    for y in range(height):
        edge_pixels.append(alpha.getpixel((0, y)))
        edge_pixels.append(alpha.getpixel((width - 1, y)))
    visible_alpha = [value for value in alpha_values if value > 8]
    return {
        "alphaRatio": sum(alpha_values) / (255 * width * height),
        "alphaTopology": "comfy-render-alpha-edgefade-density-normalized",
        "backgroundLuminance": background_luminance,
        "edgeVisibleRatio": sum(1 for value in edge_pixels if value > 8) / len(edge_pixels),
        "height": height,
        "meanVisibleLuminance": luminance_sum / max(1, visible_count),
        "opaqueRatio": len(visible_alpha) / (width * height),
        "sha256": digest_file(output_path),
        "width": width,
    }


def validate_stats(asset_id: str, stats: dict[str, Any]) -> list[str]:
    checks = {
        "opaqueRatioMin": stats["opaqueRatio"] > 0.08,
        "opaqueRatioMax": stats["opaqueRatio"] < 0.48,
        "alphaRatioMin": stats["alphaRatio"] > 0.035,
        "alphaRatioMax": stats["alphaRatio"] < 0.42,
        "edgeVisibleRatioMax": stats["edgeVisibleRatio"] < 0.62,
        "meanVisibleLuminanceMin": stats["meanVisibleLuminance"] > 44,
    }
    return [name for name, ok in checks.items() if not ok]


def make_contact_sheet(records: list[dict[str, Any]], output_dir: Path) -> Path:
    cell_w = 420
    cell_h = 178
    margin = 18
    sheet = Image.new("RGB", (cell_w * 2 + margin * 3, (cell_h + 48) * len(records) + margin), (27, 32, 34))
    for row, record in enumerate(records):
        y = margin + row * (cell_h + 48)
        for column, key in enumerate(("raw", "asset")):
            image = Image.open(record[key]).convert("RGBA")
            preview = Image.new("RGB", image.size, (45, 56, 58))
            preview.paste(image.convert("RGB"), mask=image.getchannel("A") if image.mode == "RGBA" else None)
            preview.thumbnail((cell_w, cell_h), Image.Resampling.LANCZOS)
            x = margin + column * (cell_w + margin)
            sheet.paste(preview, (x + (cell_w - preview.width) // 2, y))
    path = output_dir / "weather-contact-sheet.png"
    sheet.save(path)
    return path


def main() -> None:
    args = parse_args()
    assets = args.asset or sorted(WEATHER_ASSETS)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    model_record = (
        {
            "mode": "reused-comfy-rgb-local-postprocess",
            "sourceDir": str(args.reuse_rgb_dir),
        }
        if args.reuse_rgb_dir
        else assert_comfy_ready(args.url, args.comfy_dir, args.checkpoint)
    )
    records: list[dict[str, Any]] = []
    failures: dict[str, list[str]] = {}

    for asset_id in assets:
        config = WEATHER_ASSETS[asset_id]
        prompt_id = "reused-rgb"
        if args.reuse_rgb_dir:
            matches = sorted(args.reuse_rgb_dir.glob(f"{asset_id}.comfy-rgb.png"))
            if not matches:
                raise SystemExit(f"missing reusable RGB output for {asset_id} in {args.reuse_rgb_dir}")
            raw_path = matches[0]
        else:
            prompt = make_prompt(asset_id, config, args)
            response = post_json(args.url, "/prompt", {"client_id": f"war-london-weather-{args.run_id}", "prompt": prompt})
            prompt_id = response["prompt_id"]
            history = wait_for_history(args.url, prompt_id, args.timeout_seconds)
            raw_prefix = f"war_london_air_weather_{args.run_id}_{asset_id}_rgb"
            raw_path = collect_output_by_prefix(args.comfy_dir, history, raw_prefix)
        copied_raw = args.output_dir / f"{asset_id}.comfy-rgb.png"
        shutil.copy2(raw_path, copied_raw)
        candidate = args.output_dir / config["runtime"]
        stats = extract_cloud_alpha(
            copied_raw,
            candidate,
            int(config["alphaFloor"]),
            float(config["alphaScale"]),
            float(config["targetAlphaRatio"]),
            float(config["maxOpaqueRatio"]),
            float(config["backgroundQuantile"]),
            float(config["backgroundOffset"]),
        )
        failed = validate_stats(asset_id, stats)
        if failed:
            failures[asset_id] = failed
        if args.apply and not failed:
            RUNTIME_DIR.mkdir(parents=True, exist_ok=True)
            shutil.copy2(candidate, RUNTIME_DIR / config["runtime"])
        records.append(
            {
                "asset": str(candidate),
                "assetId": asset_id,
                "applied": bool(args.apply and not failed),
                "failures": failed,
                "promptId": prompt_id,
                "raw": str(copied_raw),
                "runtime": str(RUNTIME_DIR / config["runtime"]),
                "stats": stats,
            }
        )

    contact_sheet = make_contact_sheet(records, args.output_dir)
    manifest = {
        "assetKind": "battle-of-britain-weather-cloud-overlays",
        "checkedAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "comfyUrl": args.url,
        "contactSheet": str(contact_sheet),
        "failures": failures,
        "model": model_record,
        "negativePrompt": NEGATIVE_PROMPT,
        "records": records,
        "runId": args.run_id,
    }
    (args.output_dir / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if failures:
        raise SystemExit(f"weather asset gates failed: {failures}")


if __name__ == "__main__":
    main()
