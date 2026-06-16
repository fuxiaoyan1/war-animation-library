from __future__ import annotations

import argparse
import json
import shutil
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_WXFX_ROOT = Path.home() / "Documents" / "我心飞翔"
DEFAULT_COMFY_DIR = DEFAULT_WXFX_ROOT / "tools" / "ComfyUI"
DEFAULT_OUTPUT_DIR = ROOT / "artifacts/london-air-comfy-style-pass-20260613"

ASSETS: dict[str, dict[str, str]] = {
    "britain-spitfire": {
        "file": "britain-spitfire.png",
        "prompt": "Supermarine Spitfire Mk I side-view aircraft, Battle of Britain 1940, realistic aviation illustration, RAF camouflage paint, faithful airframe proportions, metal skin panel lines, subtle rivets, crisp wing and fuselage material detail, tactical map unit marker, clean isolated subject, muted cinematic colors",
    },
    "britain-hurricane": {
        "file": "britain-hurricane.png",
        "prompt": "Hawker Hurricane Mk I side-view aircraft, Battle of Britain 1940, realistic aviation illustration, RAF camouflage paint, faithful airframe proportions, fabric and metal panel texture, subtle rivets, crisp wing and fuselage material detail, tactical map unit marker, clean isolated subject, muted cinematic colors",
    },
    "luftwaffe-bf109": {
        "file": "luftwaffe-bf109.png",
        "prompt": "Messerschmitt Bf 109E side-view fighter aircraft, Battle of Britain 1940, realistic aviation illustration, Luftwaffe camouflage paint, faithful compact fighter proportions, crisp metal panel lines, canopy frame detail, subtle rivets, tactical map unit marker, clean isolated subject, muted cinematic colors",
    },
    "luftwaffe-bf110": {
        "file": "luftwaffe-bf110.png",
        "prompt": "Messerschmitt Bf 110 side-view twin engine fighter aircraft, Battle of Britain 1940, realistic aviation illustration, Luftwaffe camouflage paint, faithful larger twin-engine proportions, crisp engine nacelle metal detail, canopy frame detail, subtle rivets, tactical map unit marker, clean isolated subject, muted cinematic colors",
    },
    "luftwaffe-do17": {
        "file": "luftwaffe-do17.png",
        "maxBBoxFillRatio": "0.6",
        "prompt": "Dornier Do 17Z side-view bomber aircraft, Battle of Britain 1940, realistic aviation illustration, Luftwaffe bomber camouflage paint, faithful long narrow bomber proportions, metal panel lines, glazed nose and wing detail, subtle rivets, tactical map unit marker, clean isolated subject, muted cinematic colors",
    },
    "luftwaffe-he111": {
        "file": "luftwaffe-he111.png",
        "prompt": "Heinkel He 111 side-view bomber aircraft, Battle of Britain 1940, realistic aviation illustration, Luftwaffe bomber camouflage paint, faithful broad bomber proportions, metal skin panel lines, glazed nose and wing detail, subtle rivets, tactical map unit marker, clean isolated subject, muted cinematic colors",
    },
}

NEGATIVE_PROMPT = (
    "text, watermark, label, logo, frame, rectangular photo card, full background, cast shadow, contact shadow, "
    "modern jet, top view, blueprint, toy, cartoon, childish drawing, flat silhouette, flat gray icon, low quality, "
    "blurry, deformed aircraft, wrong number of wings, extra propellers, cropped subject, wrong scale"
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "DEPRECATED: creates London aircraft candidates from already-cut transparent runtime PNGs. "
            "Use scripts/run-comfyui-air-source-pass.py for production candidates from original source photos."
        )
    )
    parser.add_argument("--asset", action="append", choices=sorted(ASSETS), help="Asset id to process. Repeatable. Defaults to all.")
    parser.add_argument("--apply", action="store_true", help="Overwrite runtime PNGs after generated candidates pass alpha gates.")
    parser.add_argument("--blend", type=float, default=0.62, help="Generated RGB blend over original RGB, 0..1.")
    parser.add_argument("--cfg", type=float, default=6.5)
    parser.add_argument("--checkpoint", default="v1-5-pruned-emaonly.safetensors")
    parser.add_argument("--comfy-dir", type=Path, default=DEFAULT_COMFY_DIR)
    parser.add_argument("--controlnet", default="control_v11p_sd15_canny_fp16.safetensors")
    parser.add_argument("--denoise", type=float, default=0.32)
    parser.add_argument("--height", type=int, default=256)
    parser.add_argument(
        "--keep-comfy-temp",
        action="store_true",
        help="Keep this run's temporary war_london_air_* files under the external ComfyUI input/output folders.",
    )
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--sampler", default="euler")
    parser.add_argument("--scheduler", default="normal")
    parser.add_argument("--seed", type=int, default=2026061307)
    parser.add_argument("--steps", type=int, default=8)
    parser.add_argument("--timeout-seconds", type=int, default=420)
    parser.add_argument("--url", default="http://127.0.0.1:8188")
    parser.add_argument("--width", type=int, default=768)
    parser.add_argument("--run-id", default=time.strftime("%Y%m%d%H%M%S"), help="Unique id used in ComfyUI output filenames to avoid stale cached output histories.")
    return parser.parse_args()


def post_json(url: str, endpoint: str, body: dict[str, Any]) -> dict[str, Any]:
    request = urllib.request.Request(
        f"{url}{endpoint}",
        data=json.dumps(body).encode("utf-8"),
        headers={"content-type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"{endpoint} {error.code}: {detail}") from error


def get_json(url: str, endpoint: str) -> dict[str, Any]:
    with urllib.request.urlopen(f"{url}{endpoint}", timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def assert_file(path: Path, label: str) -> None:
    if not path.exists():
        raise SystemExit(f"{label} missing: {path}")


def prepare_comfy_input(source: Image.Image, size: tuple[int, int]) -> Image.Image:
    source = source.convert("RGBA")
    matte = Image.new("RGBA", source.size, (214, 218, 211, 255))
    matte.alpha_composite(source)
    matte = matte.convert("RGB")
    matte = ImageOps.autocontrast(matte, cutoff=0.5)
    matte = ImageEnhance.Sharpness(matte).enhance(1.18)
    return matte.resize(size, Image.Resampling.LANCZOS)


def make_prompt(asset_id: str, input_name: str, args: argparse.Namespace) -> dict[str, Any]:
    return {
        "1": {"class_type": "LoadImage", "inputs": {"image": input_name}},
        "2": {
            "class_type": "CannyEdgePreprocessor",
            "inputs": {"image": ["1", 0], "low_threshold": 54, "high_threshold": 154, "resolution": args.width},
        },
        "3": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": args.checkpoint}},
        "4": {"class_type": "ControlNetLoader", "inputs": {"control_net_name": args.controlnet}},
        "5": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["3", 1], "text": ASSETS[asset_id]["prompt"]}},
        "6": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["3", 1], "text": NEGATIVE_PROMPT}},
        "7": {
            "class_type": "ControlNetApplyAdvanced",
            "inputs": {
                "positive": ["5", 0],
                "negative": ["6", 0],
                "control_net": ["4", 0],
                "image": ["2", 0],
                "strength": 0.82,
                "start_percent": 0,
                "end_percent": 0.82,
                "vae": ["3", 2],
            },
        },
        "8": {"class_type": "VAEEncode", "inputs": {"pixels": ["1", 0], "vae": ["3", 2]}},
        "9": {
            "class_type": "KSampler",
            "inputs": {
                "seed": args.seed + list(ASSETS).index(asset_id),
                "steps": args.steps,
                "cfg": args.cfg,
                "sampler_name": args.sampler,
                "scheduler": args.scheduler,
                "denoise": args.denoise,
                "model": ["3", 0],
                "positive": ["7", 0],
                "negative": ["7", 1],
                "latent_image": ["8", 0],
            },
        },
        "10": {"class_type": "VAEDecode", "inputs": {"samples": ["9", 0], "vae": ["3", 2]}},
        "11": {"class_type": "SaveImage", "inputs": {"images": ["10", 0], "filename_prefix": f"war_london_air_{args.run_id}_{asset_id}"}},
    }


def wait_for_history(url: str, prompt_id: str, timeout_seconds: int) -> dict[str, Any]:
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        history = get_json(url, f"/history/{prompt_id}")
        if prompt_id in history:
            return history[prompt_id]
        time.sleep(1)
    raise RuntimeError(f"ComfyUI prompt did not finish within {timeout_seconds}s: {prompt_id}")


def collect_first_image(comfy_dir: Path, history: dict[str, Any]) -> Path:
    for node in history.get("outputs", {}).values():
        for image in node.get("images", []):
            output_path = comfy_dir / "output" / image.get("subfolder", "") / image["filename"]
            if output_path.exists():
                return output_path
    status = history.get("status", {})
    raise RuntimeError(f"ComfyUI history finished without an image output; status={json.dumps(status, ensure_ascii=False)[:2000]}")


def safe_delete_comfy_temp(path: Path, comfy_dir: Path) -> bool:
    try:
        resolved = path.resolve()
        comfy_root = comfy_dir.resolve()
    except FileNotFoundError:
        return False
    if not resolved.exists() or not resolved.name.startswith("war_london_air_"):
        return False
    if comfy_root not in resolved.parents:
        return False
    resolved.unlink()
    return True


def clamp_alpha(alpha: Image.Image) -> Image.Image:
    return alpha.point(lambda value: 0 if value <= 16 else value)


def combine_generated_with_original(source: Image.Image, generated: Image.Image, blend: float) -> Image.Image:
    source = source.convert("RGBA")
    generated = generated.convert("RGB").resize(source.size, Image.Resampling.LANCZOS)
    original_rgb = source.convert("RGB")
    generated = ImageOps.autocontrast(generated, cutoff=0.5)
    generated = ImageEnhance.Color(generated).enhance(0.86)
    generated = ImageEnhance.Sharpness(generated).enhance(1.2)
    rgb = Image.blend(original_rgb, generated, max(0, min(1, blend)))
    alpha = clamp_alpha(source.getchannel("A"))
    result = rgb.convert("RGBA")
    result.putalpha(alpha)
    return result


def alpha_stats(image: Image.Image) -> dict[str, Any]:
    alpha = image.convert("RGBA").getchannel("A")
    width, height = image.size
    values = list(alpha.tobytes())
    visible = []
    opaque = 0
    luminance_sum = 0.0
    luminance_square_sum = 0.0
    visible_count = 0
    rows = [0] * height
    columns = [0] * width
    edges = []
    for y in range(height):
        for x in range(width):
            value = alpha.getpixel((x, y))
            if value > 8:
                opaque += 1
            if value > 16:
                red, green, blue, _alpha = image.getpixel((x, y))
                luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722
                luminance_sum += luminance
                luminance_square_sum += luminance * luminance
                visible_count += 1
                visible.append((x, y))
                rows[y] += 1
                columns[x] += 1
            if x == 0 or y == 0 or x == width - 1 or y == height - 1:
                edges.append(value)
    if visible:
        xs = [point[0] for point in visible]
        ys = [point[1] for point in visible]
        bbox_area = (max(xs) - min(xs) + 1) * (max(ys) - min(ys) + 1)
    else:
        bbox_area = 0
    luminance_mean = luminance_sum / visible_count if visible_count else 0
    luminance_variance = max(0, luminance_square_sum / visible_count - luminance_mean * luminance_mean) if visible_count else 0
    return {
        "alphaRatio": sum(values) / (255 * width * height),
        "bboxFillRatio": opaque / bbox_area if bbox_area else 0,
        "bboxRatio": bbox_area / (width * height),
        "cornerAlphaMax": max(alpha.getpixel((0, 0)), alpha.getpixel((width - 1, 0)), alpha.getpixel((0, height - 1)), alpha.getpixel((width - 1, height - 1))),
        "edgeVisibleRatio": sum(1 for value in edges if value > 8) / len(edges),
        "luminanceMean": luminance_mean,
        "luminanceStdDev": luminance_variance ** 0.5,
        "maxColumnCoverage": max(columns) / height,
        "maxRowCoverage": max(rows) / width,
        "opaqueRatio": opaque / (width * height),
        "visiblePixels": visible_count,
    }


def validate(asset_id: str, stats: dict[str, Any]) -> list[str]:
    max_bbox_fill_ratio = float(ASSETS[asset_id].get("maxBBoxFillRatio", 0.48))
    checks = {
        "alphaRatio": stats["alphaRatio"] < 0.24,
        "opaqueRatio": stats["opaqueRatio"] > 0.05,
        "bboxRatio": stats["bboxRatio"] < 0.42,
        "bboxFillRatio": stats["bboxFillRatio"] < max_bbox_fill_ratio,
        "maxRowCoverage": stats["maxRowCoverage"] < 0.78,
        "maxColumnCoverage": stats["maxColumnCoverage"] < 0.56,
        "edgeVisibleRatio": stats["edgeVisibleRatio"] < 0.02,
        "luminanceMean": 70 < stats["luminanceMean"] < 180,
        "luminanceStdDev": stats["luminanceStdDev"] > 36,
        "cornerAlphaMax": stats["cornerAlphaMax"] <= 8,
    }
    return [name for name, ok in checks.items() if not ok]


def project_path(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def make_contact_sheet(records: list[dict[str, Any]], output_dir: Path) -> Path | None:
    if not records:
        return None
    cell_w = 340
    cell_h = 142
    label_h = 24
    margin = 18
    sheet = Image.new("RGB", (margin * 3 + cell_w * 2, margin + len(records) * (cell_h + label_h + margin)), (31, 36, 37))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()

    for row, record in enumerate(records):
        y = margin + row * (cell_h + label_h + margin)
        runtime_path = Path(record["runtimeAsset"])
        if not runtime_path.is_absolute():
            runtime_path = ROOT / runtime_path
        candidate_path = Path(record["candidate"])
        if not candidate_path.is_absolute():
            candidate_path = ROOT / candidate_path
        for column, (title, path) in enumerate((("runtime", runtime_path), ("comfy candidate", candidate_path))):
            x = margin + column * (cell_w + margin)
            draw.text((x, y), f"{record['asset']} / {title}", fill=(219, 230, 217), font=font)
            image = Image.open(path).convert("RGBA")
            thumb = Image.new("RGBA", (cell_w, cell_h), (214, 218, 211, 255))
            image.thumbnail((cell_w - 22, cell_h - 24), Image.Resampling.LANCZOS)
            thumb.alpha_composite(image, ((cell_w - image.width) // 2, (cell_h - image.height) // 2))
            sheet.paste(thumb.convert("RGB"), (x, y + label_h))

    path = output_dir / "contact-sheet.png"
    sheet.save(path)
    return path


def main() -> None:
    args = parse_args()
    if args.apply:
        raise SystemExit(
            "Refusing --apply for deprecated transparent-PNG style pass. "
            "Use `npm run assets:britain-air:comfy:apply` after source-photo ComfyUI candidates pass visual review."
        )
    print(
        "WARNING: deprecated transparent-PNG style pass. "
        "For production, feed original source photos through scripts/run-comfyui-air-source-pass.py.",
        flush=True,
    )
    comfy_dir = args.comfy_dir
    assert_file(comfy_dir / "main.py", "ComfyUI main.py")
    assert_file(comfy_dir / "models/checkpoints" / args.checkpoint, "ComfyUI checkpoint")
    assert_file(comfy_dir / "models/controlnet" / args.controlnet, "ComfyUI ControlNet")
    get_json(args.url, "/system_stats")

    asset_ids = args.asset or list(ASSETS)
    output_dir = args.output_dir if args.output_dir.is_absolute() else ROOT / args.output_dir
    input_dir = output_dir / "inputs"
    raw_dir = output_dir / "raw-comfy"
    candidate_dir = output_dir / "candidates"
    workflow_dir = output_dir / "workflows"
    for directory in (input_dir, raw_dir, candidate_dir, workflow_dir, comfy_dir / "input"):
        directory.mkdir(parents=True, exist_ok=True)

    records = []
    deleted_temp_files = []
    for asset_id in asset_ids:
        source_path = ROOT / "public/assets/unit-icons" / ASSETS[asset_id]["file"]
        assert_file(source_path, f"{asset_id} source icon")
        source = Image.open(source_path).convert("RGBA")
        comfy_input = prepare_comfy_input(source, (args.width, args.height))
        input_name = f"war_london_air_{asset_id}_input.png"
        comfy_input_path = comfy_dir / "input" / input_name
        artifact_input_path = input_dir / input_name
        comfy_input.save(comfy_input_path)
        comfy_input.save(artifact_input_path)

        prompt = make_prompt(asset_id, input_name, args)
        (workflow_dir / f"{asset_id}.json").write_text(json.dumps(prompt, indent=2, ensure_ascii=False))
        queued = post_json(args.url, "/prompt", {"prompt": prompt})
        prompt_id = queued["prompt_id"]
        history = wait_for_history(args.url, prompt_id, args.timeout_seconds)
        try:
            raw_path = collect_first_image(comfy_dir, history)
        except Exception as error:
            failure_report = {
                "asset": asset_id,
                "error": str(error),
                "historyStatus": history.get("status", {}),
                "promptId": prompt_id,
            }
            (output_dir / f"{asset_id}-failure.json").write_text(json.dumps(failure_report, indent=2, ensure_ascii=False))
            raise
        artifact_raw_path = raw_dir / f"{asset_id}-comfy-rgb.png"
        shutil.copy2(raw_path, artifact_raw_path)

        candidate = combine_generated_with_original(source, Image.open(raw_path), args.blend)
        candidate_path = candidate_dir / ASSETS[asset_id]["file"]
        candidate.save(candidate_path)
        stats = alpha_stats(candidate)
        failed = validate(asset_id, stats)
        applied = False
        if args.apply:
            if failed:
                raise RuntimeError(f"{asset_id} failed alpha gates, not applying: {failed}; stats={stats}")
            candidate.save(source_path)
            applied = True

        if not args.keep_comfy_temp:
            for temp_path in (comfy_input_path, raw_path):
                if safe_delete_comfy_temp(temp_path, comfy_dir):
                    deleted_temp_files.append(str(temp_path))

        records.append(
            {
                "asset": asset_id,
                "applied": applied,
                "candidate": project_path(candidate_path),
                "failedGates": failed,
                "input": project_path(artifact_input_path),
                "promptId": prompt_id,
                "rawComfyOutput": project_path(artifact_raw_path),
                "runtimeAsset": project_path(source_path),
                "stats": stats,
                "thresholds": {"maxBBoxFillRatio": float(ASSETS[asset_id].get("maxBBoxFillRatio", 0.48))},
            }
        )

    contact_sheet_path = make_contact_sheet(records, output_dir)

    report = {
        "checked_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "apply": args.apply,
        "blend": args.blend,
        "checkpoint": str((comfy_dir / "models/checkpoints" / args.checkpoint)),
        "comfy_dir": str(comfy_dir),
        "controlnet": str((comfy_dir / "models/controlnet" / args.controlnet)),
        "deleted_comfy_temp_files": deleted_temp_files,
        "keep_comfy_temp": args.keep_comfy_temp,
        "output_dir": project_path(output_dir),
        "records": records,
        "run_id": args.run_id,
        "contact_sheet": project_path(contact_sheet_path) if contact_sheet_path else None,
        "url": args.url,
    }
    (output_dir / "metrics.json").write_text(json.dumps(report, indent=2, ensure_ascii=False))
    print(json.dumps({"output_dir": str(output_dir), "records": len(records), "apply": args.apply}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
