from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import time
import urllib.request
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

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
        "alphaFloor": 24,
        "alphaScale": 1.28,
        "prompt": (
            "high-end strategy game weather overlay asset for a WWII Battle of Britain map, "
            "broken cumulus cloud bank seen from high oblique top-down aircraft altitude over the English Channel, "
            "wide horizontal cloud streaks and scattered soft cloud masses, photographic cloud texture, volumetric depth, "
            "silver gray white cloud tops with subtle warm morning light, no aircraft, no land, no text, no symbols, "
            "isolated cloud forms on a perfectly pure black background for alpha extraction, generous empty gaps between clouds"
        ),
    },
    "afternoon-cloud-breaks": {
        "runtime": "afternoon-cloud-breaks.png",
        "width": 1216,
        "height": 512,
        "seedOffset": 41,
        "alphaFloor": 8,
        "alphaScale": 3.0,
        "prompt": (
            "high-end strategy game weather overlay asset for a WWII Battle of Britain map, "
            "thinning afternoon broken cloud streaks viewed from high oblique top-down aircraft altitude, "
            "long soft cloud wisps, realistic photometric cloud texture, clear gaps, slightly brighter sunlit edges, "
            "no aircraft, no land, no text, no symbols, isolated cloud forms on a perfectly pure black background for alpha extraction"
        ),
    },
}

NEGATIVE_PROMPT = (
    "aircraft, airplanes, city, land, coastline, ocean waves, map labels, text, watermark, logo, frame, UI, "
    "cartoon, vector, geometric shapes, flat blobs, bokeh circles, smoke explosion, storm wall, heavy fog blanket, "
    "pure white rectangle, gray card, visible border, non-black background, checkerboard, people"
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
    object_info = get_json(url, "/object_info")
    required = ["EmptyLatentImage", "CheckpointLoaderSimple", "CLIPTextEncode", "KSampler", "VAEDecode", "SaveImage"]
    missing = [node for node in required if node not in object_info]
    if missing:
        raise SystemExit(f"ComfyUI missing required nodes: {missing}")
    return {
        "checkpoint": str(checkpoint_path),
        "checkpointSha256": digest_file(checkpoint_path),
        "requiredNodes": required,
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


def make_cloud_distribution_mask(asset_id: str, width: int, height: int) -> Image.Image:
    mask = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(mask, "L")
    if asset_id == "morning-cloud-bank":
        centers = [
            (0.22, 0.34, 0.23, 0.13, 132),
            (0.42, 0.39, 0.27, 0.15, 158),
            (0.67, 0.34, 0.24, 0.13, 136),
            (0.83, 0.46, 0.16, 0.10, 104),
            (0.36, 0.66, 0.20, 0.10, 88),
        ]
    else:
        centers = [
            (0.24, 0.34, 0.18, 0.09, 132),
            (0.48, 0.43, 0.24, 0.11, 162),
            (0.70, 0.30, 0.16, 0.08, 118),
            (0.78, 0.62, 0.20, 0.09, 112),
        ]
    for cx, cy, rx, ry, value in centers:
        box = (
            round((cx - rx) * width),
            round((cy - ry) * height),
            round((cx + rx) * width),
            round((cy + ry) * height),
        )
        draw.ellipse(box, fill=value)
    # Cut tactical visibility gaps through the bank. These are soft masks, not visible geometric assets.
    gap = Image.new("L", (width, height), 0)
    gap_draw = ImageDraw.Draw(gap, "L")
    gap_draw.ellipse((round(width * 0.02), round(height * 0.05), round(width * 0.18), round(height * 0.28)), fill=180)
    gap_draw.ellipse((round(width * 0.52), round(height * 0.50), round(width * 0.72), round(height * 0.78)), fill=160)
    gap_draw.ellipse((round(width * 0.86), round(height * 0.10), round(width * 1.05), round(height * 0.40)), fill=170)
    mask = mask.filter(ImageFilter.GaussianBlur(width * 0.018))
    gap = gap.filter(ImageFilter.GaussianBlur(width * 0.016))
    mask_pixels = mask.load()
    gap_pixels = gap.load()
    for y in range(height):
        vertical_fade = min(1.0, max(0.0, (y / max(1, height - 1)) * 5.5), max(0.0, ((height - 1 - y) / max(1, height - 1)) * 5.5))
        for x in range(width):
            horizontal_fade = min(1.0, max(0.0, (x / max(1, width - 1)) * 7), max(0.0, ((width - 1 - x) / max(1, width - 1)) * 7))
            value = max(0, mask_pixels[x, y] - round(gap_pixels[x, y] * 0.8))
            mask_pixels[x, y] = round(value * min(vertical_fade, horizontal_fade))
    return mask.filter(ImageFilter.GaussianBlur(1.2))


def extract_cloud_alpha(rgb_path: Path, output_path: Path, alpha_floor: int, alpha_scale: float) -> dict[str, Any]:
    image = ImageOps.exif_transpose(Image.open(rgb_path)).convert("RGB")
    image = ImageOps.autocontrast(image, cutoff=0.25)
    image = ImageEnhance.Color(image).enhance(0.55)
    image = ImageEnhance.Contrast(image).enhance(1.1)
    width, height = image.size
    alpha = Image.new("L", image.size, 0)
    pixels = image.load()
    alpha_pixels = alpha.load()
    visible_count = 0
    luminance_sum = 0.0
    for y in range(height):
        for x in range(width):
            red, green, blue = pixels[x, y]
            luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722
            chroma = max(red, green, blue) - min(red, green, blue)
            # The prompt asks for black backing. Convert only luminous cloud material to alpha.
            opacity = max(0, luminance - alpha_floor) * alpha_scale + max(0, chroma - 18) * 0.2
            opacity = max(0, min(210, round(opacity)))
            if opacity > 6:
                visible_count += 1
                luminance_sum += luminance
            alpha_pixels[x, y] = opacity
    alpha = alpha.filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.GaussianBlur(0.85))
    alpha = alpha.point(lambda value: 0 if value < 8 else min(218, round(value * 1.08)))
    distribution = make_cloud_distribution_mask(output_path.stem, width, height)
    alpha_pixels = alpha.load()
    distribution_pixels = distribution.load()
    for y in range(height):
        for x in range(width):
            alpha_pixels[x, y] = round(alpha_pixels[x, y] * distribution_pixels[x, y] / 255)
    rgba = image.convert("RGBA")
    rgba.putalpha(alpha)
    # Keep clouds pale and compatible with the muted MapLibre underlay.
    rgb = rgba.convert("RGB")
    rgb = ImageEnhance.Brightness(rgb).enhance(1.08)
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.08)
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
        "opaqueRatioMax": stats["opaqueRatio"] < 0.72,
        "alphaRatioMin": stats["alphaRatio"] > 0.035,
        "alphaRatioMax": stats["alphaRatio"] < 0.42,
        "edgeVisibleRatioMax": stats["edgeVisibleRatio"] < 0.62,
        "meanVisibleLuminanceMin": stats["meanVisibleLuminance"] > 46,
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
    model_record = assert_comfy_ready(args.url, args.comfy_dir, args.checkpoint)
    records: list[dict[str, Any]] = []
    failures: dict[str, list[str]] = {}

    for asset_id in assets:
        config = WEATHER_ASSETS[asset_id]
        prompt = make_prompt(asset_id, config, args)
        response = post_json(args.url, "/prompt", {"client_id": f"war-london-weather-{args.run_id}", "prompt": prompt})
        prompt_id = response["prompt_id"]
        history = wait_for_history(args.url, prompt_id, args.timeout_seconds)
        raw_prefix = f"war_london_air_weather_{args.run_id}_{asset_id}_rgb"
        raw_path = collect_output_by_prefix(args.comfy_dir, history, raw_prefix)
        copied_raw = args.output_dir / f"{asset_id}.comfy-rgb.png"
        shutil.copy2(raw_path, copied_raw)
        candidate = args.output_dir / config["runtime"]
        stats = extract_cloud_alpha(copied_raw, candidate, int(config["alphaFloor"]), float(config["alphaScale"]))
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
