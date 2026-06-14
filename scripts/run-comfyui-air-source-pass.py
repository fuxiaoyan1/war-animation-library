from __future__ import annotations

import argparse
import hashlib
import json
import math
import random
import shutil
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_WXFX_ROOT = Path.home() / "Documents" / "我心飞翔"
DEFAULT_COMFY_DIR = DEFAULT_WXFX_ROOT / "tools" / "ComfyUI"
DEFAULT_OUTPUT_DIR = ROOT / "artifacts/london-air-comfy-source-pass-20260613"
SOURCE_DIR = ROOT / "public/assets/unit-icons/source/britain-air"
RUNTIME_DIR = ROOT / "public/assets/unit-icons"
DEFAULT_BACKGROUND_REMOVAL_MODEL = "birefnet.safetensors"
EXPECTED_COMFY_MODELS = {
    f"models/background_removal/{DEFAULT_BACKGROUND_REMOVAL_MODEL}": {
        "md5": "474c0d343806856b6d69fb4f57196684",
        "sha256": "9ab37426bf4de0567af6b5d21b16151357149139362e6e8992021b8ce356a154",
        "size": 444473596,
    },
}

ASSETS: dict[str, dict[str, Any]] = {
    "britain-spitfire": {
        "fallback": "602sqdn-spit1.jpg",
        "candidates": [],
        "runtime": "britain-spitfire.png",
        "size": (720, 240),
        "fitPadding": (92, 55),
        "topDownSize": (640, 560),
        "topDownFitPadding": (92, 70),
        "lengthMeters": 9.1,
        "spanMeters": 11.2,
        "planform": "spitfire",
        "sourceCrop": (0, 0, 900, 430),
        "prompt": "Supermarine Spitfire Mk I in clean flying configuration, landing gear fully retracted, no wheels visible, one Rolls-Royce Merlin inline engine, one propeller, single-seat canopy, narrow fuselage, elliptical wings, wingspan about 11.2 m and length about 9.1 m, RAF 1940 dark earth and dark green camouflage with sky underside, accurate Battle of Britain fighter proportions, preserve the source photo silhouette and aircraft identity, subtle three-dimensional relighting, realistic metal and fabric skin, panel lines, canopy frame, rivets and worn paint, isolated single aircraft on clean light gray studio background, no ground, no shadow, high fidelity aviation reference",
        "topDownPrompt": "Supermarine Spitfire Mk I viewed from directly above in a clean level flying pose, nose pointing right, complete aircraft reconstructed from aviation knowledge and aircraft data, elliptical wings clearly visible and unbroken, slender fuselage, one nose-mounted propeller disk only, no propellers on wings or tail, single-seat bubble canopy, RAF 1940 dark earth and dark green camouflage with visible roundels, wingspan about 11.2 m and length about 9.1 m, accurate Battle of Britain Spitfire planform",
    },
    "britain-hurricane": {
        "fallback": "hawker-hurricane-xii-canada-side.jpg",
        "candidates": ["candidates/hurricane-hawke1-side-wikimedia.jpg", "candidates/hurricane-mk-xii-flickr-pah.jpg"],
        "runtime": "britain-hurricane.png",
        "size": (720, 240),
        "fitPadding": (92, 55),
        "topDownSize": (640, 560),
        "topDownFitPadding": (92, 68),
        "lengthMeters": 9.8,
        "spanMeters": 12.2,
        "planform": "hurricane",
        "repairSubjectBox": (0.18, 0.12, 0.81, 0.72),
        "repairZones": [(0.47, 0.58, 0.74, 0.93), (0.15, 0.61, 0.31, 0.82)],
        "prompt": "Hawker Hurricane Mk I in clean flying configuration, landing gear fully retracted, no wheels visible, one Rolls-Royce Merlin inline engine, one propeller, single-seat canopy, thicker straight wing and deeper fuselage than Spitfire, wingspan about 12.2 m and length about 9.8 m, RAF 1940 dark earth and dark green camouflage with sky underside, preserve the source photo silhouette and aircraft identity, subtle three-dimensional relighting, realistic fabric rear fuselage, metal cowling, panel lines, canopy frame and worn paint, isolated single aircraft on clean light gray studio background, no ground, no shadow, high fidelity aviation reference",
        "topDownPrompt": "Hawker Hurricane Mk I viewed from directly above in a clean level flying pose, nose pointing right, complete aircraft reconstructed from aviation knowledge and aircraft data, thicker straight tapered wings than the Spitfire, deep robust fuselage, one nose-mounted propeller disk only, no propellers on wings or tail, single-seat canopy, RAF 1940 dark earth and dark green camouflage with visible roundels, wingspan about 12.2 m and length about 9.8 m, accurate Hurricane planform and fabric rear fuselage character",
    },
    "luftwaffe-bf109": {
        "fallback": "messerschmitt-bf109e3.jpg",
        "candidates": ["candidates/bf109-me1e-paine-field-side-wikimedia.jpg", "candidates/bf109-swiss-side-right-wikimedia.jpg"],
        "runtime": "luftwaffe-bf109.png",
        "size": (720, 240),
        "fitPadding": (92, 55),
        "topDownSize": (620, 540),
        "topDownFitPadding": (98, 76),
        "topDownBrightness": 1.04,
        "lengthMeters": 8.7,
        "spanMeters": 9.9,
        "planform": "bf109",
        "repairSubjectBox": (0.12, 0.18, 0.81, 0.77),
        "repairZones": [(0.09, 0.58, 0.32, 0.93), (0.48, 0.60, 0.73, 0.88)],
        "prompt": "Messerschmitt Bf 109E-3 / Bf 109E-4 Emil in clean flying configuration, landing gear fully retracted, no wheels visible, one Daimler-Benz inverted V engine, one propeller, angular tapered wings, compact fuselage, narrow canopy, tailwheel fighter, wingspan about 9.9 m and length about 8.7 m, Luftwaffe Battle of Britain camouflage with restrained yellow theater markings, preserve the source photo silhouette and aircraft identity, subtle three-dimensional relighting, realistic metal skin, panel seams, canopy frame, exhaust and worn paint, isolated single aircraft on clean light gray studio background, no ground, no shadow, high fidelity aviation reference",
        "topDownPrompt": "Messerschmitt Bf 109E-3 / Bf 109E-4 Emil viewed from directly above in a clean level flying pose, nose pointing right, complete aircraft reconstructed from aviation knowledge and aircraft data, compact single-engine fuselage, narrow canopy, angular tapered wings, one nose-mounted propeller disk only, no wing engines, no wingtip propellers, small tailplane, Luftwaffe Battle of Britain camouflage with restrained yellow theater markings, wingspan about 9.9 m and length about 8.7 m, accurate Bf 109 Emil planform",
    },
    "luftwaffe-bf110": {
        "fallback": "messerschmitt-bf110b-1940-side.jpg",
        "candidates": [],
        "runtime": "luftwaffe-bf110.png",
        "size": (760, 240),
        "fitPadding": (80, 55),
        "topDownSize": (720, 600),
        "topDownFitPadding": (78, 74),
        "topDownMaxBBoxFillRatio": 0.66,
        "lengthMeters": 12.3,
        "spanMeters": 16.3,
        "planform": "bf110",
        "sourceCrop": (260, 120, 1750, 780),
        "repairSubjectBox": (0.08, 0.22, 0.90, 0.75),
        "repairZones": [(0.20, 0.58, 0.31, 0.89), (0.44, 0.58, 0.55, 0.90), (0.68, 0.58, 0.81, 0.90)],
        "prompt": "Messerschmitt Bf 110C / Bf 110D heavy fighter in clean flying configuration, landing gear fully retracted, no wheels visible, exactly two wing-mounted engines and two propellers, long greenhouse canopy, long fuselage, twin vertical tail fins, larger than Bf 109, wingspan about 16.3 m and length about 12.3 m, Luftwaffe Battle of Britain camouflage, preserve the source photo silhouette and aircraft identity, subtle three-dimensional relighting, realistic metal skin, panel seams, canopy framing, engine nacelles and worn paint, isolated single aircraft on clean light gray studio background, no ground, no shadow, high fidelity aviation reference",
        "topDownPrompt": "Messerschmitt Bf 110C / Bf 110D heavy fighter viewed from directly above in a clean level flying pose, nose pointing right, complete aircraft reconstructed from aviation knowledge and aircraft data, exactly two wing-mounted engine nacelles and exactly two propeller disks, no nose propeller, long greenhouse canopy, long fuselage, twin vertical tail fins, larger than Bf 109, Luftwaffe Battle of Britain camouflage, wingspan about 16.3 m and length about 12.3 m, accurate Bf 110 planform",
    },
    "luftwaffe-do17": {
        "fallback": "dornier-do17z-1942.jpg",
        "candidates": ["candidates/do17z-2-sandiego.jpg"],
        "runtime": "luftwaffe-do17.png",
        "size": (780, 250),
        "fitPadding": (102, 58),
        "topDownSize": (760, 620),
        "topDownFitPadding": (92, 76),
        "topDownMaxBBoxFillRatio": 0.62,
        "lengthMeters": 15.8,
        "spanMeters": 18.0,
        "planform": "do17",
        "maxBBoxFillRatio": 0.6,
        "repairSubjectBox": (0.17, 0.25, 0.82, 0.86),
        "repairZones": [(0.16, 0.52, 0.34, 0.91), (0.47, 0.47, 0.76, 0.96), (0.05, 0.76, 0.90, 0.99)],
        "prompt": "Dornier Do 17Z bomber in clean flying configuration, landing gear fully retracted, no wheels visible, exactly two radial engines and two propellers, narrow flying-pencil fuselage, glazed nose and cockpit, twin tailplane form, wingspan about 18 m and length about 15.8 m, Luftwaffe Battle of Britain bomber camouflage, preserve the source photo silhouette and aircraft identity, subtle three-dimensional relighting, realistic metal skin, panel seams, glazing, engine nacelles and worn paint, isolated single aircraft on clean light gray studio background, no ground, no shadow, high fidelity aviation reference",
        "topDownPrompt": "Dornier Do 17Z bomber viewed from directly above in a clean level flying pose, nose pointing right, complete aircraft reconstructed from aviation knowledge and aircraft data, long narrow flying-pencil fuselage, glazed nose and cockpit, exactly two radial engine nacelles and exactly two propeller disks, no nose propeller, twin tailplane form, Luftwaffe Battle of Britain bomber camouflage, wingspan about 18 m and length about 15.8 m, accurate Do 17Z bomber planform",
    },
    "luftwaffe-he111": {
        "fallback": "heinkel-he111-battle-of-britain.jpg",
        "candidates": [],
        "runtime": "luftwaffe-he111.png",
        "size": (780, 250),
        "fitPadding": (102, 58),
        "topDownSize": (780, 660),
        "topDownFitPadding": (90, 78),
        "topDownMaxBBoxFillRatio": 0.66,
        "lengthMeters": 16.4,
        "spanMeters": 22.6,
        "planform": "he111",
        "sourceCrop": (640, 0, 2050, 900),
        "prompt": "Heinkel He 111H / He 111P medium bomber in clean flying configuration, landing gear fully retracted, no wheels visible, exactly two engines and two propellers, broad elliptical bomber wing, distinctive fully glazed greenhouse nose, single vertical tail, larger than Do 17 and much larger than Bf 110, wingspan about 22.6 m and length about 16.4 m, Luftwaffe Battle of Britain bomber camouflage, preserve the source photo silhouette and aircraft identity, subtle three-dimensional relighting, realistic metal skin, panel seams, glass nose, engine nacelles and worn paint, isolated single aircraft on clean light gray studio background, no ground, no shadow, high fidelity aviation reference",
        "topDownPrompt": "Heinkel He 111H / He 111P medium bomber viewed from directly above in a clean level flying pose, nose pointing right, complete aircraft reconstructed from aviation knowledge and aircraft data, broad elliptical bomber wing, distinctive fully glazed greenhouse nose, exactly two engine nacelles and exactly two propeller disks, no nose propeller, single vertical tail, larger than Do 17 and much larger than Bf 110, Luftwaffe Battle of Britain bomber camouflage, wingspan about 22.6 m and length about 16.4 m, accurate He 111 planform",
    },
}

NEGATIVE_PROMPT = (
    "transparent background, alpha checkerboard, text, watermark, label, logo, frame, rectangular photo card, museum floor, "
    "hangar, indoor museum, runway, grass field, people, display stand, landing gear, wheels, wheel struts, open landing gear, "
    "modern jet, top view, blueprint, toy, cartoon, low quality, "
    "flat silhouette, flat vector art, technical drawing, plastic model, overpainted fantasy aircraft, extra aircraft, second aircraft, "
    "formation, blurry, deformed aircraft, wrong aircraft type, wrong number of engines, wrong wing count, extra propellers, extra tail, missing propeller"
)

TOP_DOWN_STYLE_PROMPT = (
    "Create a finished game-style tactical unit icon, orthographic dorsal top-down aircraft view, complete unbroken aircraft, "
    "full wings, tail, fuselage, canopy, engine nacelles, and nose visible. Use the source photo only as an aircraft identity and era reference; "
    "do not copy the source crop boundary, missing parts, dirt, museum lighting, or poor cutout. Use the aircraft data for proportions and let the model "
    "reconstruct the complete aircraft shape from aviation knowledge, not from a source-image edge map. Create a polished RTS/war-game unit icon finish: "
    "rich but historically plausible camouflage, controlled faction markings, strong readable silhouette, "
    "dark midtones with clean metal/fabric highlights, panel seams, rivets, canopy glazing, engine detail, subtle worn paint, and crisp bevel-like edge lighting. "
    "The icon should feel like a high-quality WWII aircraft game asset on a clean light gray studio background, not like a processed photo."
)

TOP_DOWN_NEGATIVE_PROMPT = (
    "side profile, side elevation, pure side view, belly view, front view, rear view, three-quarter side view, "
    "technical blueprint, line drawing, flat plan drawing, plastic kit instruction sheet, top-view diagram, "
    "transparent background, alpha checkerboard, text, watermark, label, logo, frame, rectangular photo card, museum floor, "
    "hangar, indoor museum, runway, grass field, people, display stand, landing gear, wheels, wheel struts, open landing gear, "
    "modern jet, toy, cartoon, low quality, flat silhouette, flat vector art, overpainted fantasy aircraft, extra aircraft, second aircraft, "
    "formation, blurry, deformed aircraft, incomplete aircraft, cropped aircraft, broken wing, missing wing, missing tail, missing nose, missing fuselage, "
    "wrong aircraft type, wrong number of engines, wrong wing count, extra propellers, extra tail, missing propeller, "
    "low quality cutout, dirty alpha, source photo boundary, washed out pale colors, black blob, featureless dark shape, detached black circles, detached gray blobs"
)

REPAIR_PROMPT = (
    "Masked inpaint only the selected landing gear, wheel, display stand, and ground-contact remnants into clean in-flight aircraft underside. "
    "Keep the unmasked aircraft fuselage, wings, tail, canopy, engines, markings, and proportions unchanged. "
    "Retract the landing gear completely, remove visible wheels and struts, rebuild plausible lower fuselage or engine nacelle panels, "
    "match the surrounding camouflage, metal and fabric texture, panel seams, highlights, and weathering."
)

FLIGHT_STATE_PROMPT = (
    "Use the source photo as aircraft identity and proportion reference, not as a literal grounded photograph to preserve. "
    "Generate a finished in-flight tactical unit icon: level side profile, landing gear fully retracted, no museum or runway remnants, "
    "clean propeller disks, coherent wings and tail, accurate number of engines, readable canopy and panel details, realistic metal or fabric material, "
    "muted colors suitable for overlay on a war-animation map, no background plate."
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create transparent London aircraft candidates from original source photos via ComfyUI + ISNet segmentation.")
    parser.add_argument("--apply", action="store_true", help="Overwrite runtime PNGs only if transparent candidates pass all gates.")
    parser.add_argument("--asset", action="append", choices=sorted(ASSETS), help="Asset id to process. Repeatable. Defaults to all available sources.")
    parser.add_argument("--cfg", type=float, default=7.0)
    parser.add_argument("--checkpoint", default="v1-5-pruned-emaonly.safetensors")
    parser.add_argument("--comfy-dir", type=Path, default=DEFAULT_COMFY_DIR)
    parser.add_argument("--controlnet", default="control_v11p_sd15_canny_fp16.safetensors")
    parser.add_argument("--background-removal-model", default=DEFAULT_BACKGROUND_REMOVAL_MODEL)
    parser.add_argument("--control-strength", type=float, default=0.72)
    parser.add_argument("--control-end-percent", type=float, default=0.86)
    parser.add_argument("--denoise", type=float, default=0.42)
    parser.add_argument(
        "--generation-mode",
        choices=["control", "weak-control", "text"],
        default="control",
        help=(
            "control preserves the original img2img/ControlNet path; weak-control uses only early weak Canny guidance; "
            "text uses txt2img from EmptyLatentImage so aircraft data and prompt dominate instead of the source boundary."
        ),
    )
    parser.add_argument("--height", type=int, default=320)
    parser.add_argument("--keep-comfy-temp", action="store_true")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument(
        "--flight-state",
        action="store_true",
        help="Use ComfyUI as a flight-state generator/refiner when the source photo is grounded or low quality.",
    )
    parser.add_argument("--repair-inpaint", action="store_true", help="Inpaint configured landing-gear/display-stand zones before BiRefNet cutout.")
    parser.add_argument("--repair-feather", type=int, default=10, help="Local feather radius for repair mask edges.")
    parser.add_argument("--repair-grow", type=int, default=10, help="ComfyUI inpaint mask growth in pixels.")
    parser.add_argument("--sampler", default="euler")
    parser.add_argument("--scheduler", default="normal")
    parser.add_argument("--seed", type=int, default=2026061311)
    parser.add_argument("--source", action="append", help="Explicit source mapping asset=relative/path.jpg. Repeatable.")
    parser.add_argument("--steps", type=int, default=14)
    parser.add_argument("--timeout-seconds", type=int, default=600)
    parser.add_argument("--url", default="http://127.0.0.1:8188")
    parser.add_argument("--view", choices=["side", "top-down"], default="side", help="Output view for the aircraft icon candidates.")
    parser.add_argument("--width", type=int, default=960)
    parser.add_argument("--run-id", default=time.strftime("%Y%m%d%H%M%S"))
    parser.add_argument("--no-source-crop", action="store_true", help="Ignore configured sourceCrop when testing alternate explicit source images.")
    return parser.parse_args()


def digest_file(path: Path, algorithm: str) -> str:
    digest = hashlib.new(algorithm)
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def verify_models(comfy_dir: Path, background_model: str) -> list[dict[str, object]]:
    records = []
    rel_paths = [
        Path("models/checkpoints/v1-5-pruned-emaonly.safetensors"),
        Path("models/controlnet/control_v11p_sd15_canny_fp16.safetensors"),
        Path("models/background_removal") / background_model,
    ]
    for rel_path in rel_paths:
        path = comfy_dir / rel_path
        if not path.exists():
            raise SystemExit(f"missing ComfyUI model: {path}")
        record: dict[str, object] = {
            "file": str(path),
            "md5": digest_file(path, "md5"),
            "sha256": digest_file(path, "sha256"),
            "size": path.stat().st_size,
        }
        expected = EXPECTED_COMFY_MODELS.get(str(rel_path))
        if expected:
            for key, value in expected.items():
                if record[key] != value:
                    raise SystemExit(f"bad {key} for {path}: {record[key]}, expected {value}")
        records.append(record)
    return records


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


def effective_asset_config(config: dict[str, Any], args: argparse.Namespace) -> dict[str, Any]:
    if args.view != "top-down":
        return dict(config)
    result = dict(config)
    result["size"] = tuple(result.get("topDownSize", result["size"]))
    result["fitPadding"] = tuple(result.get("topDownFitPadding", result["fitPadding"]))
    result["maxBBoxFillRatio"] = result.get("topDownMaxBBoxFillRatio", 0.56)
    result["maxBBoxRatio"] = result.get("topDownMaxBBoxRatio", 0.58)
    result["maxColumnCoverage"] = result.get("topDownMaxColumnCoverage", 0.88)
    result["maxRowCoverage"] = result.get("topDownMaxRowCoverage", 0.72)
    result["minOpaqueRatio"] = result.get("topDownMinOpaqueRatio", 0.065)
    return result


def assert_comfy_nodes(url: str, background_model: str) -> dict[str, Any]:
    object_info = get_json(url, "/object_info")
    required = [
        "LoadImage",
        "EmptyLatentImage",
        "CannyEdgePreprocessor",
        "CheckpointLoaderSimple",
        "ControlNetLoader",
        "CLIPTextEncode",
        "ControlNetApplyAdvanced",
        "VAEEncode",
        "KSampler",
        "VAEDecode",
        "LoadBackgroundRemovalModel",
        "RemoveBackground",
        "InvertMask",
        "MaskToImage",
        "JoinImageWithAlpha",
        "SaveImage",
    ]
    missing = [node for node in required if node not in object_info]
    if missing:
        raise SystemExit(f"ComfyUI is missing required nodes: {missing}")
    bg_input = object_info["LoadBackgroundRemovalModel"]["input"]["required"]["bg_removal_name"]
    bg_options = bg_input[1].get("options", []) if isinstance(bg_input, list) and len(bg_input) > 1 else []
    if background_model not in bg_options:
        raise SystemExit(f"ComfyUI background removal model {background_model!r} is not available; options={bg_options}")
    return {"requiredNodes": required, "backgroundRemovalOptions": bg_options}


def project_path(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def choose_source(asset_id: str, explicit: dict[str, str]) -> Path:
    if asset_id in explicit:
        value = explicit[asset_id]
        candidate = Path(value)
        if candidate.is_absolute():
            path = candidate
        else:
            root_relative = ROOT / candidate
            path = root_relative if root_relative.exists() else SOURCE_DIR / candidate
        assert_file(path, f"{asset_id} explicit source")
        return path
    config = ASSETS[asset_id]
    for candidate in config.get("candidates", []):
        path = SOURCE_DIR / candidate
        if path.exists():
            return path
    path = SOURCE_DIR / config["fallback"]
    assert_file(path, f"{asset_id} fallback source")
    return path


def parse_sources(values: list[str] | None) -> dict[str, str]:
    explicit: dict[str, str] = {}
    for value in values or []:
        if "=" not in value:
            raise SystemExit(f"--source must be asset=relative/path.jpg, got {value}")
        asset, path = value.split("=", 1)
        if asset not in ASSETS:
            raise SystemExit(f"unknown asset in --source: {asset}")
        explicit[asset] = path
    return explicit


def prepare_source_input(source_path: Path, size: tuple[int, int], config: dict[str, Any], use_source_crop: bool = True) -> Image.Image:
    opened = Image.open(source_path)
    opened = ImageOps.exif_transpose(opened)
    if opened.mode == "RGBA":
        image = Image.new("RGB", opened.size, (214, 218, 211))
        image.paste(opened.convert("RGB"), mask=opened.getchannel("A"))
    else:
        image = opened.convert("RGB")
    crop = config.get("sourceCrop") if use_source_crop else None
    if crop:
        x1, y1, x2, y2 = crop
        x1 = max(0, min(image.width - 1, int(x1)))
        y1 = max(0, min(image.height - 1, int(y1)))
        x2 = max(x1 + 1, min(image.width, int(x2)))
        y2 = max(y1 + 1, min(image.height, int(y2)))
        image = image.crop((x1, y1, x2, y2))
    image.thumbnail((size[0], size[1]), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", size, (214, 218, 211))
    canvas.paste(image, ((size[0] - image.width) // 2, (size[1] - image.height) // 2))
    canvas = ImageOps.autocontrast(canvas, cutoff=0.5)
    canvas = ImageEnhance.Sharpness(canvas).enhance(1.08)
    return canvas


def sample_source_palette(source_path: Path) -> list[tuple[int, int, int]]:
    image = ImageOps.exif_transpose(Image.open(source_path)).convert("RGB")
    image.thumbnail((320, 320), Image.Resampling.LANCZOS)
    palette = image.convert("P", palette=Image.Palette.ADAPTIVE, colors=8)
    colors = palette.getpalette() or []
    counts = palette.getcolors() or []
    ranked: list[tuple[int, tuple[int, int, int]]] = []
    for count, index in counts:
        offset = index * 3
        color = tuple(colors[offset : offset + 3])
        if len(color) == 3 and 35 < sum(color) / 3 < 220:
            ranked.append((count, color))
    ranked.sort(reverse=True)
    defaults = [(82, 91, 72), (54, 68, 58), (116, 111, 86), (151, 143, 111)]
    sampled = [color for _, color in ranked[:4]]
    return (sampled + defaults)[:4]


def top_down_icon_palette(asset_id: str) -> list[tuple[int, int, int]]:
    if asset_id.startswith("britain"):
        return [(76, 88, 58), (43, 61, 44), (114, 88, 61), (189, 177, 139), (38, 50, 88)]
    return [(72, 80, 65), (42, 48, 40), (103, 110, 91), (176, 166, 132), (70, 60, 44)]


def shifted_color(color: tuple[int, int, int], factor: float, offset: int = 0) -> tuple[int, int, int]:
    return tuple(max(0, min(255, round(channel * factor + offset))) for channel in color)


def draw_poly(draw: ImageDraw.ImageDraw, points: list[tuple[float, float]], scale: int, fill, outline=None, width: int = 1) -> None:
    scaled = [(round(x * scale), round(y * scale)) for x, y in points]
    draw.polygon(scaled, fill=fill, outline=outline)
    if outline and width > 1:
        draw.line(scaled + [scaled[0]], fill=outline, width=width)


def ellipse_box(cx: float, cy: float, rx: float, ry: float, scale: int) -> tuple[int, int, int, int]:
    return (
        round((cx - rx) * scale),
        round((cy - ry) * scale),
        round((cx + rx) * scale),
        round((cy + ry) * scale),
    )


def elliptical_wing_polygon(
    cx: float,
    cy: float,
    root_x: float,
    span_half: float,
    chord_root: float,
    chord_tip: float,
    side: int,
) -> list[tuple[float, float]]:
    points: list[tuple[float, float]] = []
    steps = 10
    for index in range(steps + 1):
        t = index / steps
        y = side * span_half * t
        chord = chord_root * (1 - t) + chord_tip * t
        curve = math.sin(t * math.pi) * chord_root * 0.08
        points.append((cx + root_x + chord * 0.42 - curve, cy + y))
    for index in range(steps, -1, -1):
        t = index / steps
        y = side * span_half * t
        chord = chord_root * (1 - t) + chord_tip * t
        curve = math.sin(t * math.pi) * chord_root * 0.08
        points.append((cx + root_x - chord * 0.58 + curve, cy + y))
    return points


def make_top_down_reference(asset_id: str, source_path: Path, config: dict[str, Any]) -> Image.Image:
    width, height = tuple(config["size"])
    pad_x, pad_y = tuple(config["fitPadding"])
    scale_up = 3
    canvas = Image.new("RGB", (width * scale_up, height * scale_up), (214, 218, 211))
    draw = ImageDraw.Draw(canvas)
    rng = random.Random(f"{asset_id}-top-down-reference")
    source_palette = sample_source_palette(source_path)
    palette = top_down_icon_palette(asset_id)
    base = shifted_color(palette[0], 0.72)
    dark = shifted_color(palette[1], 0.58)
    light = shifted_color(palette[2], 0.88, 8)
    line = shifted_color(base, 0.38)
    length = float(config["lengthMeters"])
    span = float(config["spanMeters"])
    pixels_per_meter = min((width - pad_x * 2) / length, (height - pad_y * 2) / span)
    plane_length = length * pixels_per_meter
    plane_span = span * pixels_per_meter
    cx = width / 2
    cy = height / 2
    nose_x = cx + plane_length * 0.5
    tail_x = cx - plane_length * 0.5
    wing_x = cx + plane_length * 0.04
    planform = str(config.get("planform", "spitfire"))

    def p(point: tuple[float, float]) -> tuple[float, float]:
        return point

    shape_mask = Image.new("L", canvas.size, 0)
    shape_draw = ImageDraw.Draw(shape_mask)

    def add_shape_polygon(points: list[tuple[float, float]]) -> None:
        shape_draw.polygon([(round(x * scale_up), round(y * scale_up)) for x, y in points], fill=255)

    def add_shape_ellipse(box: tuple[int, int, int, int]) -> None:
        shape_draw.ellipse(box, fill=255)

    # Wings first, then fuselage and nacelles.
    if planform == "spitfire":
        for side in (-1, 1):
            wing = elliptical_wing_polygon(wing_x, cy, 0, plane_span * 0.48, plane_length * 0.34, plane_length * 0.10, side)
            add_shape_polygon(wing)
            draw_poly(draw, wing, scale_up, fill=base, outline=line, width=2 * scale_up)
    elif planform == "hurricane":
        for side in (-1, 1):
            wing = [
                p((wing_x - plane_length * 0.22, cy)),
                p((wing_x + plane_length * 0.22, cy + side * plane_span * 0.08)),
                p((wing_x + plane_length * 0.12, cy + side * plane_span * 0.48)),
                p((wing_x - plane_length * 0.2, cy + side * plane_span * 0.44)),
            ]
            add_shape_polygon(wing)
            draw_poly(draw, wing, scale_up, fill=base, outline=line, width=2 * scale_up)
    elif planform == "bf109":
        for side in (-1, 1):
            wing = [
                p((wing_x - plane_length * 0.16, cy)),
                p((wing_x + plane_length * 0.24, cy + side * plane_span * 0.08)),
                p((wing_x + plane_length * 0.06, cy + side * plane_span * 0.47)),
                p((wing_x - plane_length * 0.22, cy + side * plane_span * 0.39)),
            ]
            add_shape_polygon(wing)
            draw_poly(draw, wing, scale_up, fill=base, outline=line, width=2 * scale_up)
    else:
        for side in (-1, 1):
            sweep = 0.12 if planform == "he111" else 0.07
            wing = [
                p((wing_x - plane_length * 0.24, cy)),
                p((wing_x + plane_length * 0.28, cy + side * plane_span * sweep)),
                p((wing_x + plane_length * 0.12, cy + side * plane_span * 0.48)),
                p((wing_x - plane_length * 0.28, cy + side * plane_span * 0.42)),
            ]
            add_shape_polygon(wing)
            draw_poly(draw, wing, scale_up, fill=base, outline=line, width=2 * scale_up)

    fuselage_width = plane_span * (0.075 if planform in {"spitfire", "bf109"} else 0.09)
    if planform in {"do17", "he111"}:
        fuselage_width = plane_span * 0.08
    fuselage = [
        (tail_x + plane_length * 0.06, cy - fuselage_width * 0.62),
        (cx + plane_length * 0.18, cy - fuselage_width * 0.76),
        (nose_x - plane_length * 0.1, cy - fuselage_width * 0.48),
        (nose_x, cy),
        (nose_x - plane_length * 0.1, cy + fuselage_width * 0.48),
        (cx + plane_length * 0.18, cy + fuselage_width * 0.76),
        (tail_x + plane_length * 0.06, cy + fuselage_width * 0.62),
        (tail_x, cy),
    ]
    add_shape_polygon(fuselage)
    draw_poly(draw, fuselage, scale_up, fill=dark, outline=line, width=2 * scale_up)

    # Tailplanes.
    tail_span = plane_span * (0.24 if planform in {"spitfire", "hurricane", "bf109"} else 0.28)
    tail_chord = plane_length * (0.12 if planform in {"spitfire", "hurricane", "bf109"} else 0.14)
    for side in (-1, 1):
        tailplane = [
            (tail_x + plane_length * 0.05, cy),
            (tail_x + tail_chord, cy + side * tail_span * 0.12),
            (tail_x + tail_chord * 0.62, cy + side * tail_span),
            (tail_x - tail_chord * 0.08, cy + side * tail_span * 0.72),
        ]
        add_shape_polygon(tailplane)
        draw_poly(draw, tailplane, scale_up, fill=dark, outline=line, width=2 * scale_up)

    # Engine nacelles and propeller discs.
    engine_offsets: list[float]
    if planform in {"bf110", "do17", "he111"}:
        engine_offsets = [-plane_span * 0.22, plane_span * 0.22]
    else:
        engine_offsets = [0]
    for engine_y in engine_offsets:
        ex = wing_x + (plane_length * 0.06 if len(engine_offsets) > 1 else plane_length * 0.42)
        nacelle_w = plane_length * (0.12 if len(engine_offsets) > 1 else 0.09)
        nacelle_h = plane_span * (0.08 if len(engine_offsets) > 1 else 0.055)
        nacelle_box = ellipse_box(ex, cy + engine_y, nacelle_w, nacelle_h, scale_up)
        add_shape_ellipse(nacelle_box)
        draw.ellipse(nacelle_box, fill=shifted_color(dark, 0.84), outline=line, width=2 * scale_up)
        prop_x = ex + nacelle_w * 1.05
        prop_box = ellipse_box(prop_x, cy + engine_y, nacelle_w * 0.42, nacelle_h * 1.45, scale_up)
        add_shape_ellipse(prop_box)
        draw.ellipse(prop_box, fill=shifted_color(light, 0.85), outline=shifted_color(line, 1.2), width=1 * scale_up)

    # Canopy/glazing.
    canopy_x = cx + plane_length * (0.18 if planform not in {"do17", "he111"} else 0.28)
    canopy_w = plane_length * (0.13 if planform not in {"do17", "he111"} else 0.18)
    canopy_h = fuselage_width * 0.76
    canopy_box = ellipse_box(canopy_x, cy, canopy_w, canopy_h, scale_up)
    add_shape_ellipse(canopy_box)
    draw.ellipse(canopy_box, fill=(74, 102, 108), outline=shifted_color(line, 1.15), width=1 * scale_up)

    # Camouflage bands and panel lines. Keep marks inside the aircraft mask so they never become alpha debris.
    camo = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    camo_draw = ImageDraw.Draw(camo)
    for index in range(22):
        x = tail_x + plane_length * rng.random()
        y = cy + (rng.random() - 0.5) * plane_span * 0.82
        rx = plane_length * rng.uniform(0.035, 0.09)
        ry = plane_span * rng.uniform(0.025, 0.08)
        color = shifted_color((palette + source_palette)[index % (len(palette) + len(source_palette))], rng.uniform(0.62, 0.9), rng.randint(-6, 10))
        camo_draw.ellipse(ellipse_box(x, y, rx, ry, scale_up), fill=(*color, 115))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), Image.composite(camo, Image.new("RGBA", canvas.size, (0, 0, 0, 0)), shape_mask))
    draw = ImageDraw.Draw(canvas)
    for frac in (0.23, 0.39, 0.57, 0.72):
        x = tail_x + plane_length * frac
        draw.line((round(x * scale_up), round((cy - fuselage_width * 0.55) * scale_up), round(x * scale_up), round((cy + fuselage_width * 0.55) * scale_up)), fill=shifted_color(line, 1.25), width=1 * scale_up)

    if asset_id.startswith("britain"):
        for side in (-1, 1):
            mx = wing_x + plane_length * 0.04
            my = cy + side * plane_span * 0.3
            draw.ellipse(ellipse_box(mx, my, plane_span * 0.045, plane_span * 0.045, scale_up), fill=(36, 54, 104), outline=None)
            draw.ellipse(ellipse_box(mx, my, plane_span * 0.028, plane_span * 0.028, scale_up), fill=(214, 216, 202), outline=None)
            draw.ellipse(ellipse_box(mx, my, plane_span * 0.014, plane_span * 0.014, scale_up), fill=(136, 37, 38), outline=None)
    else:
        for side in (-1, 1):
            mx = wing_x + plane_length * 0.05
            my = cy + side * plane_span * 0.29
            cross_w = plane_span * 0.07
            cross_h = plane_span * 0.018
            draw.rectangle(
                (
                    round((mx - cross_w) * scale_up),
                    round((my - cross_h) * scale_up),
                    round((mx + cross_w) * scale_up),
                    round((my + cross_h) * scale_up),
                ),
                fill=(42, 43, 38),
            )
            draw.rectangle(
                (
                    round((mx - cross_h) * scale_up),
                    round((my - cross_w) * scale_up),
                    round((mx + cross_h) * scale_up),
                    round((my + cross_w) * scale_up),
                ),
                fill=(42, 43, 38),
            )

    # Fine grain keeps ControlNet from reading the guide as a flat vector, but it must stay inside the aircraft.
    canvas = canvas.convert("RGBA")
    pixels = canvas.load()
    mask_pixels = shape_mask.load()
    for y in range(canvas.height):
        for x in range(canvas.width):
            if mask_pixels[x, y] > 0:
                grain = rng.randint(-10, 10)
                red, green, blue, alpha = pixels[x, y]
                pixels[x, y] = (
                    max(0, min(255, red + grain)),
                    max(0, min(255, green + grain)),
                    max(0, min(255, blue + grain)),
                    alpha,
                )

    bbox = shape_mask.filter(ImageFilter.MaxFilter(7)).getbbox()
    if bbox:
        left = max(0, bbox[0] - 9 * scale_up)
        top = max(0, bbox[1] - 9 * scale_up)
        right = min(canvas.width, bbox[2] + 9 * scale_up)
        bottom = min(canvas.height, bbox[3] + 9 * scale_up)
        background = Image.new("RGBA", canvas.size, (214, 218, 211, 255))
        aircraft_only = Image.composite(canvas.convert("RGBA"), background, shape_mask.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.0)))
        canvas = aircraft_only
    canvas = canvas.convert("RGB").resize((width, height), Image.Resampling.LANCZOS)
    canvas = ImageEnhance.Contrast(canvas).enhance(1.12)
    canvas = ImageEnhance.Sharpness(canvas).enhance(1.2)
    return canvas


def estimate_subject_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    rgb = image.convert("RGB")
    background = (214, 218, 211)
    diff = Image.new("L", rgb.size, 0)
    diff_pixels = diff.load()
    rgb_pixels = rgb.load()
    for y in range(rgb.height):
        for x in range(rgb.width):
            red, green, blue = rgb_pixels[x, y]
            distance = abs(red - background[0]) + abs(green - background[1]) + abs(blue - background[2])
            if distance > 42:
                diff_pixels[x, y] = 255
    diff = diff.filter(ImageFilter.MedianFilter(5))
    bbox = diff.getbbox()
    if not bbox:
        return (0, 0, image.width, image.height)
    left, top, right, bottom = bbox
    margin_x = max(4, round((right - left) * 0.03))
    margin_y = max(4, round((bottom - top) * 0.05))
    return (
        max(0, left - margin_x),
        max(0, top - margin_y),
        min(image.width, right + margin_x),
        min(image.height, bottom + margin_y),
    )


def make_repair_mask(image: Image.Image, config: dict[str, Any], grow: int, feather: int) -> tuple[Image.Image, dict[str, Any]]:
    subject_box = config.get("repairSubjectBox")
    if subject_box:
        x1, y1, x2, y2 = subject_box
        bbox = (
            max(0, round(x1 * image.width)),
            max(0, round(y1 * image.height)),
            min(image.width, round(x2 * image.width)),
            min(image.height, round(y2 * image.height)),
        )
    else:
        bbox = estimate_subject_bbox(image)
    left, top, right, bottom = bbox
    subject_width = max(1, right - left)
    subject_height = max(1, bottom - top)
    mask = Image.new("L", image.size, 0)
    draw = ImageDraw.Draw(mask)
    zones = config.get("repairZones", [])
    rects = []
    for zone in zones:
        x1, y1, x2, y2 = zone
        rect = (
            max(0, round(left + x1 * subject_width)),
            max(0, round(top + y1 * subject_height)),
            min(image.width, round(left + x2 * subject_width)),
            min(image.height, round(top + y2 * subject_height)),
        )
        if rect[2] > rect[0] and rect[3] > rect[1]:
            draw.rounded_rectangle(rect, radius=max(2, feather), fill=255)
            rects.append(rect)
    if grow > 0:
        radius = grow * 2 + 1
        mask = mask.filter(ImageFilter.MaxFilter(radius))
    if feather > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(feather))
        mask = mask.point(lambda value: 0 if value < 18 else min(255, round(value * 1.25)))
    return mask, {
        "repairSubjectBox": subject_box,
        "subjectBbox": list(bbox),
        "repairRects": [list(rect) for rect in rects],
        "repairZones": zones,
    }


def make_control_input_without_repair_edges(image: Image.Image, mask: Image.Image) -> Image.Image:
    control = image.convert("RGB").copy()
    neutral = Image.new("RGB", control.size, (214, 218, 211))
    hard_mask = mask.point(lambda value: 255 if value > 18 else 0)
    control.paste(neutral, mask=hard_mask)
    return control


def centered_fit(rgba: Image.Image, size: tuple[int, int], padding: tuple[int, int]) -> Image.Image:
    alpha = rgba.convert("RGBA").getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 12 else 0).getbbox()
    if not bbox:
        raise RuntimeError("empty alpha mask")
    subject = rgba.crop(bbox)
    max_width, max_height = size
    padding_x, padding_y = padding
    scale = min((max_width - padding_x * 2) / subject.width, (max_height - padding_y * 2) / subject.height, 1)
    if scale < 0.999:
        subject = subject.resize((max(1, round(subject.width * scale)), max(1, round(subject.height * scale))), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.alpha_composite(subject, ((max_width - subject.width) // 2, (max_height - subject.height) // 2))
    return canvas


def normalize_comfy_rgba(comfy_rgba_path: Path, config: dict[str, Any]) -> Image.Image:
    rgba = Image.open(comfy_rgba_path).convert("RGBA")
    alpha = rgba.getchannel("A")
    alpha = alpha.filter(ImageFilter.MedianFilter(3))
    alpha = alpha.point(lambda value: 0 if value <= 14 else min(255, round(value * 1.08)))
    rgba.putalpha(alpha)
    rgba = centered_fit(rgba, tuple(config["size"]), tuple(config["fitPadding"]))
    rgb = rgba.convert("RGB")
    rgb = ImageOps.autocontrast(rgb, cutoff=0.6)
    rgb = ImageEnhance.Contrast(rgb).enhance(1.08)
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.2)
    styled = rgb.convert("RGBA")
    styled.putalpha(rgba.getchannel("A").point(lambda value: 0 if value <= 14 else value))
    return styled


def alpha_from_reference_shape(reference: Image.Image) -> Image.Image:
    background = (214, 218, 211)
    rgb = reference.convert("RGB")
    alpha = Image.new("L", rgb.size, 0)
    alpha_pixels = alpha.load()
    pixels = rgb.load()
    for y in range(rgb.height):
        for x in range(rgb.width):
            red, green, blue = pixels[x, y]
            distance = abs(red - background[0]) + abs(green - background[1]) + abs(blue - background[2])
            if distance > 28:
                alpha_pixels[x, y] = 255
            elif distance > 12:
                alpha_pixels[x, y] = round((distance - 12) / 16 * 180)
    alpha = alpha.filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.GaussianBlur(0.45))
    return alpha.point(lambda value: 0 if value < 18 else min(255, round(value * 1.12)))


def normalize_top_down_comfy_rgb(comfy_rgb_path: Path, reference: Image.Image, config: dict[str, Any], asset_id: str) -> Image.Image:
    size = tuple(config["size"])
    rgb = Image.open(comfy_rgb_path).convert("RGB")
    if rgb.size != size:
        rgb = rgb.resize(size, Image.Resampling.LANCZOS)
    guide = reference.convert("RGB")
    if guide.size != size:
        guide = guide.resize(size, Image.Resampling.LANCZOS)

    rgb = ImageOps.autocontrast(rgb, cutoff=0.55)
    rgb = ImageEnhance.Color(rgb).enhance(0.86)
    rgb = ImageEnhance.Contrast(rgb).enhance(1.22)
    rgb = ImageEnhance.Brightness(rgb).enhance(float(config.get("topDownBrightness", 0.84)))
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.32)
    rgb = Image.blend(guide, rgb, 0.78)

    alpha = alpha_from_reference_shape(guide)
    styled = rgb.convert("RGBA")
    styled.putalpha(alpha)
    styled = centered_fit(styled, size, tuple(config["fitPadding"]))
    styled = ImageEnhance.Contrast(styled.convert("RGB")).enhance(1.08).convert("RGBA")
    styled.putalpha(centered_fit(Image.merge("RGBA", (alpha, alpha, alpha, alpha)), size, tuple(config["fitPadding"])).getchannel("A"))
    styled = styled.filter(ImageFilter.UnsharpMask(radius=0.8, percent=105, threshold=2))
    return styled


def normalize_top_down_comfy_rgba(comfy_rgba_path: Path, config: dict[str, Any], asset_id: str) -> Image.Image:
    rgba = Image.open(comfy_rgba_path).convert("RGBA")
    alpha = rgba.getchannel("A")
    alpha = alpha.filter(ImageFilter.MedianFilter(3))
    alpha = alpha.point(lambda value: 0 if value <= 10 else min(255, round(value * 1.06)))
    rgba.putalpha(alpha)
    fitted = centered_fit(rgba, tuple(config["size"]), tuple(config["fitPadding"]))
    fitted_alpha = fitted.getchannel("A").point(lambda value: 0 if value <= 10 else value)
    neutral = Image.new("RGB", fitted.size, (214, 218, 211))
    rgb = neutral.copy()
    rgb.paste(fitted.convert("RGB"), mask=fitted_alpha)
    rgb = ImageOps.autocontrast(rgb, cutoff=0.45)
    rgb = ImageEnhance.Color(rgb).enhance(float(config.get("topDownColor", 1.1)))
    rgb = ImageEnhance.Contrast(rgb).enhance(float(config.get("topDownContrast", 1.2)))
    rgb = ImageEnhance.Brightness(rgb).enhance(float(config.get("topDownBrightness", 0.96)))
    rgb = ImageEnhance.Sharpness(rgb).enhance(float(config.get("topDownSharpness", 1.42)))
    styled = rgb.convert("RGBA")
    styled.putalpha(fitted_alpha)
    styled = styled.filter(ImageFilter.UnsharpMask(radius=0.8, percent=120, threshold=2))
    return styled


def alpha_stats(image: Image.Image) -> dict[str, Any]:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    width, height = rgba.size
    values = list(alpha.tobytes())
    visible_points: list[tuple[int, int]] = []
    opaque_pixels = 0
    row_counts = [0 for _ in range(height)]
    column_counts = [0 for _ in range(width)]
    edge_values = []
    luminance_sum = 0.0
    luminance_square_sum = 0.0
    visible_count = 0
    for y in range(height):
        for x in range(width):
            value = alpha.getpixel((x, y))
            if value > 8:
                opaque_pixels += 1
            if value > 16:
                visible_points.append((x, y))
                row_counts[y] += 1
                column_counts[x] += 1
                red, green, blue, _ = rgba.getpixel((x, y))
                luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722
                luminance_sum += luminance
                luminance_square_sum += luminance * luminance
                visible_count += 1
            if x == 0 or y == 0 or x == width - 1 or y == height - 1:
                edge_values.append(value)
    if visible_points:
        xs = [point[0] for point in visible_points]
        ys = [point[1] for point in visible_points]
        bbox = [min(xs), min(ys), max(xs) - min(xs) + 1, max(ys) - min(ys) + 1]
        bbox_ratio = bbox[2] * bbox[3] / (width * height)
        bbox_fill_ratio = opaque_pixels / (bbox[2] * bbox[3])
    else:
        bbox = [0, 0, 0, 0]
        bbox_ratio = 0
        bbox_fill_ratio = 0
    luminance_mean = luminance_sum / visible_count if visible_count else 0
    luminance_variance = max(0, luminance_square_sum / visible_count - luminance_mean * luminance_mean) if visible_count else 0
    corners = [
        alpha.getpixel((0, 0)),
        alpha.getpixel((width - 1, 0)),
        alpha.getpixel((0, height - 1)),
        alpha.getpixel((width - 1, height - 1)),
    ]
    return {
        "alphaRatio": sum(values) / (255 * width * height),
        "bbox": bbox,
        "bboxFillRatio": bbox_fill_ratio,
        "bboxRatio": bbox_ratio,
        "cornerAlphaMax": max(corners),
        "edgeVisibleRatio": sum(1 for value in edge_values if value > 8) / len(edge_values),
        "luminanceMean": luminance_mean,
        "luminanceStdDev": luminance_variance ** 0.5,
        "maxColumnCoverage": max(column_counts) / height,
        "maxRowCoverage": max(row_counts) / width,
        "opaqueRatio": opaque_pixels / (width * height),
        "size": [width, height],
        "visiblePixels": visible_count,
    }


def validate_candidate(asset_id: str, stats: dict[str, Any], config_override: dict[str, Any] | None = None) -> list[str]:
    config = config_override or ASSETS[asset_id]
    max_bbox_fill_ratio = float(config.get("maxBBoxFillRatio", 0.48))
    checks = {
        "alphaRatio": stats["alphaRatio"] < 0.28,
        "opaqueRatio": stats["opaqueRatio"] > float(config.get("minOpaqueRatio", 0.035)),
        "bboxRatio": stats["bboxRatio"] < float(config.get("maxBBoxRatio", 0.5)),
        "bboxFillRatio": stats["bboxFillRatio"] < max_bbox_fill_ratio,
        "maxRowCoverage": stats["maxRowCoverage"] < float(config.get("maxRowCoverage", 0.84)),
        "maxColumnCoverage": stats["maxColumnCoverage"] < float(config.get("maxColumnCoverage", 0.66)),
        "edgeVisibleRatio": stats["edgeVisibleRatio"] < 0.02,
        "cornerAlphaMax": stats["cornerAlphaMax"] <= 8,
        "luminanceMean": 45 < stats["luminanceMean"] < 205,
        "luminanceStdDev": stats["luminanceStdDev"] > 20,
    }
    return [name for name, ok in checks.items() if not ok]


def effective_generation_settings(args: argparse.Namespace) -> dict[str, float]:
    if args.generation_mode == "text":
        return {
            "control_end_percent": 0.0,
            "control_strength": 0.0,
            "denoise": 1.0,
        }
    if args.generation_mode == "weak-control":
        if args.view == "top-down":
            return {
                "control_end_percent": min(args.control_end_percent, 0.22),
                "control_strength": min(args.control_strength, 0.12),
                "denoise": max(args.denoise, 0.9),
            }
        return {
            "control_end_percent": min(args.control_end_percent, 0.42),
            "control_strength": min(args.control_strength, 0.22),
            "denoise": max(args.denoise, 0.72),
        }
    if args.view == "top-down":
        return {
            "control_end_percent": min(args.control_end_percent, 0.52),
            "control_strength": min(args.control_strength, 0.38),
            "denoise": max(args.denoise, 0.72),
        }
    if not args.flight_state:
        return {
            "control_end_percent": args.control_end_percent,
            "control_strength": args.control_strength,
            "denoise": args.denoise,
        }
    return {
        "control_end_percent": min(args.control_end_percent, 0.74),
        "control_strength": min(args.control_strength, 0.58),
        "denoise": max(args.denoise, 0.56),
    }


def pipeline_description(args: argparse.Namespace) -> str:
    if args.generation_mode == "text":
        return (
            "source photo and aircraft data -> text-primary ComfyUI txt2img from EmptyLatentImage"
            " -> BiRefNet mask -> RGBA candidate -> project sizing and visual gates"
        )
    if args.generation_mode == "weak-control":
        return (
            "source photo and aircraft data -> low-strength short-window Canny reference"
            " -> ComfyUI generation/refinement with aircraft-data prompt dominant -> BiRefNet mask"
            " -> RGBA candidate -> project sizing and visual gates"
        )
    if args.view == "top-down":
        return (
            "source photo -> optional subject crop -> aircraft-data top-down icon generation with low-strength Canny identity guidance"
            " -> ComfyUI BiRefNet mask -> RGBA top-down candidate -> project sizing and visual gates"
        )
    if args.flight_state:
        return (
            "source photo -> optional subject crop -> aircraft-data flight-state generation/refinement"
            " with softened Canny control for configured ground-remnant zones -> ComfyUI BiRefNet mask"
            " -> RGBA candidate -> project sizing and visual gates"
        )
    if args.repair_inpaint:
        return (
            "source photo -> optional subject crop -> configured landing-gear/display-remnant mask"
            " -> masked inpaint repair and Canny with masked zones neutralized -> aircraft-data prompt relighting/material pass"
            " -> ComfyUI BiRefNet mask -> RGBA candidate -> project sizing and visual gates"
        )
    return (
        "source photo -> optional subject crop -> ControlNet Canny img2img -> aircraft-data prompt relighting/material pass"
        " -> ComfyUI BiRefNet mask -> RGBA candidate -> project sizing and visual gates"
    )


def make_prompt(asset_id: str, input_name: str, args: argparse.Namespace, mask_name: str | None = None, control_name: str | None = None) -> dict[str, Any]:
    base_prefix = f"war_london_air_source_{args.run_id}_{asset_id}"
    if args.view == "top-down":
        positive_text = f"{ASSETS[asset_id]['topDownPrompt']}. {TOP_DOWN_STYLE_PROMPT}"
        negative_text = TOP_DOWN_NEGATIVE_PROMPT
    else:
        positive_text = ASSETS[asset_id]["prompt"]
        negative_text = NEGATIVE_PROMPT
    settings = effective_generation_settings(args)
    if args.flight_state:
        positive_text = f"{positive_text}. {FLIGHT_STATE_PROMPT}"
        negative_text = (
            f"{negative_text}, grounded pose, parked aircraft, museum aircraft, airshow photo, "
            "uncorrected source photo, copied runway background, copied display stand"
        )
    if args.repair_inpaint:
        positive_text = f"{positive_text}. {REPAIR_PROMPT}"
        negative_text = f"{negative_text}, keep landing gear, visible wheels, visible wheel struts, museum display remnants, floor reflection"
    control_input = control_name or input_name
    positive_conditioning: list[object] = ["5", 0]
    negative_conditioning: list[object] = ["6", 0]
    latent_image: list[object] = ["8", 0]
    prompt: dict[str, Any] = {
        "1": {"class_type": "LoadImage", "inputs": {"image": input_name}},
        "3": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": args.checkpoint}},
        "5": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["3", 1], "text": positive_text}},
        "6": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["3", 1], "text": negative_text}},
        "9": {
            "class_type": "KSampler",
            "inputs": {
                "seed": args.seed + list(ASSETS).index(asset_id),
                "steps": args.steps,
                "cfg": args.cfg,
                "sampler_name": args.sampler,
                "scheduler": args.scheduler,
                "denoise": settings["denoise"],
                "model": ["3", 0],
                "positive": positive_conditioning,
                "negative": negative_conditioning,
                "latent_image": latent_image,
            },
        },
        "10": {"class_type": "VAEDecode", "inputs": {"samples": ["9", 0], "vae": ["3", 2]}},
        "11": {"class_type": "LoadBackgroundRemovalModel", "inputs": {"bg_removal_name": args.background_removal_model}},
        "12": {"class_type": "RemoveBackground", "inputs": {"bg_removal_model": ["11", 0], "image": ["10", 0]}},
        "13": {"class_type": "InvertMask", "inputs": {"mask": ["12", 0]}},
        "14": {"class_type": "MaskToImage", "inputs": {"mask": ["12", 0]}},
        "15": {"class_type": "JoinImageWithAlpha", "inputs": {"image": ["10", 0], "alpha": ["13", 0]}},
        "16": {"class_type": "SaveImage", "inputs": {"images": ["10", 0], "filename_prefix": f"{base_prefix}_rgb"}},
        "17": {"class_type": "SaveImage", "inputs": {"images": ["14", 0], "filename_prefix": f"{base_prefix}_birefnet_mask"}},
        "18": {"class_type": "SaveImage", "inputs": {"images": ["15", 0], "filename_prefix": f"{base_prefix}_rgba"}},
    }
    if args.generation_mode == "text":
        prompt["8"] = {"class_type": "EmptyLatentImage", "inputs": {"width": args.width, "height": args.height, "batch_size": 1}}
    else:
        prompt.update(
            {
                "19": {"class_type": "LoadImage", "inputs": {"image": control_input}},
                "2": {
                    "class_type": "CannyEdgePreprocessor",
                    "inputs": {"image": ["19", 0], "low_threshold": 42, "high_threshold": 142, "resolution": args.width},
                },
                "4": {"class_type": "ControlNetLoader", "inputs": {"control_net_name": args.controlnet}},
                "7": {
                    "class_type": "ControlNetApplyAdvanced",
                    "inputs": {
                        "positive": ["5", 0],
                        "negative": ["6", 0],
                        "control_net": ["4", 0],
                        "image": ["2", 0],
                        "strength": settings["control_strength"],
                        "start_percent": 0,
                        "end_percent": settings["control_end_percent"],
                        "vae": ["3", 2],
                    },
                },
                "8": {"class_type": "VAEEncode", "inputs": {"pixels": ["1", 0], "vae": ["3", 2]}},
            }
        )
        prompt["9"]["inputs"]["positive"] = ["7", 0]
        prompt["9"]["inputs"]["negative"] = ["7", 1]
        prompt["9"]["inputs"]["latent_image"] = ["8", 0]
    if args.repair_inpaint:
        if args.generation_mode == "text":
            raise RuntimeError("--repair-inpaint requires --generation-mode control or weak-control")
        if not mask_name:
            raise RuntimeError("repair inpaint requires mask_name")
        prompt["20"] = {"class_type": "LoadImageMask", "inputs": {"image": mask_name, "channel": "red"}}
        prompt["8"] = {
            "class_type": "InpaintModelConditioning",
            "inputs": {
                "positive": ["7", 0],
                "negative": ["7", 1],
                "vae": ["3", 2],
                "pixels": ["1", 0],
                "mask": ["20", 0],
                "noise_mask": True,
            },
        }
        prompt["9"]["inputs"]["positive"] = ["8", 0]
        prompt["9"]["inputs"]["negative"] = ["8", 1]
        prompt["9"]["inputs"]["latent_image"] = ["8", 2]
    return prompt


def wait_for_history(url: str, prompt_id: str, timeout_seconds: int) -> dict[str, Any]:
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        history = get_json(url, f"/history/{prompt_id}")
        if prompt_id in history:
            return history[prompt_id]
        time.sleep(1)
    raise RuntimeError(f"ComfyUI prompt did not finish within {timeout_seconds}s: {prompt_id}")


def collect_image_by_prefix(comfy_dir: Path, history: dict[str, Any], prefix: str) -> Path:
    for node in history.get("outputs", {}).values():
        for image in node.get("images", []):
            output_path = comfy_dir / "output" / image.get("subfolder", "") / image["filename"]
            if output_path.exists() and image["filename"].startswith(prefix):
                return output_path
    status = history.get("status", {})
    raise RuntimeError(f"ComfyUI history finished without output prefix {prefix!r}; status={json.dumps(status, ensure_ascii=False)[:2000]}")


def safe_delete_comfy_temp(path: Path, comfy_dir: Path) -> bool:
    try:
        resolved = path.resolve()
        comfy_root = comfy_dir.resolve()
    except FileNotFoundError:
        return False
    if not resolved.exists() or not resolved.name.startswith("war_london_air_source_"):
        return False
    if comfy_root not in resolved.parents:
        return False
    resolved.unlink()
    return True


def image_stats(path: Path) -> dict[str, Any]:
    image = Image.open(path).convert("RGB")
    pixels = list(image.tobytes())
    total = image.width * image.height
    means = [sum(pixels[index] for index in range(channel, len(pixels), 3)) / total for channel in range(3)]
    luminance_values = [
        pixels[index] * 0.2126 + pixels[index + 1] * 0.7152 + pixels[index + 2] * 0.0722
        for index in range(0, len(pixels), 3)
    ]
    luminance_mean = sum(luminance_values) / total
    luminance_std = (sum((value - luminance_mean) ** 2 for value in luminance_values) / total) ** 0.5
    return {
        "height": image.height,
        "luminanceMean": luminance_mean,
        "luminanceStdDev": luminance_std,
        "meanRgb": means,
        "width": image.width,
    }


def make_contact_sheet(records: list[dict[str, Any]], output_dir: Path) -> Path | None:
    if not records:
        return None
    cell_w = 420
    cell_h = 170
    label_h = 24
    margin = 18
    columns = (("source input", "input"), ("comfy RGB", "rawComfyOutput"), ("BiRefNet RGBA", "comfyTransparent"), ("final candidate", "candidate"))
    sheet = Image.new("RGB", (margin * (len(columns) + 1) + cell_w * len(columns), margin + len(records) * (cell_h + label_h + margin)), (31, 36, 37))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    for row, record in enumerate(records):
        y = margin + row * (cell_h + label_h + margin)
        for column, (title, key) in enumerate(columns):
            x = margin + column * (cell_w + margin)
            draw.text((x, y), f"{record['asset']} / {title}", fill=(219, 230, 217), font=font)
            image = Image.open(ROOT / record[key]).convert("RGBA")
            image.thumbnail((cell_w - 18, cell_h - 18), Image.Resampling.LANCZOS)
            tile = Image.new("RGBA", (cell_w, cell_h), (214, 218, 211, 255))
            tile.alpha_composite(image, ((cell_w - image.width) // 2, (cell_h - image.height) // 2))
            sheet.paste(tile.convert("RGB"), (x, y + label_h))
    path = output_dir / "contact-sheet.png"
    sheet.save(path)
    return path


def main() -> None:
    args = parse_args()
    comfy_dir = args.comfy_dir
    assert_file(comfy_dir / "main.py", "ComfyUI main.py")
    assert_file(comfy_dir / "models/checkpoints" / args.checkpoint, "ComfyUI checkpoint")
    assert_file(comfy_dir / "models/controlnet" / args.controlnet, "ComfyUI ControlNet")
    get_json(args.url, "/system_stats")
    comfy_nodes = assert_comfy_nodes(args.url, args.background_removal_model)
    model_records = verify_models(comfy_dir, args.background_removal_model)

    output_dir = args.output_dir if args.output_dir.is_absolute() else ROOT / args.output_dir
    input_dir = output_dir / "inputs"
    control_dir = output_dir / "control-inputs"
    repair_mask_dir = output_dir / "repair-masks"
    raw_dir = output_dir / "raw-comfy"
    mask_dir = output_dir / "birefnet-masks"
    rgba_dir = output_dir / "comfy-rgba"
    candidate_dir = output_dir / "candidates"
    workflow_dir = output_dir / "workflows"
    for directory in (input_dir, control_dir, repair_mask_dir, raw_dir, mask_dir, rgba_dir, candidate_dir, workflow_dir, comfy_dir / "input"):
        directory.mkdir(parents=True, exist_ok=True)

    explicit_sources = parse_sources(args.source)
    asset_ids = args.asset or list(ASSETS)
    records: list[dict[str, Any]] = []
    deleted_temp_files: list[str] = []
    for asset_id in asset_ids:
        base_config = ASSETS[asset_id]
        config = effective_asset_config(base_config, args)
        source_path = choose_source(asset_id, explicit_sources)
        if args.view == "top-down":
            source_input = make_top_down_reference(asset_id, source_path, config)
        else:
            source_input = prepare_source_input(source_path, (args.width, args.height), config, use_source_crop=not args.no_source_crop)
        input_name = f"war_london_air_source_{args.run_id}_{asset_id}_input.png"
        comfy_input_path = comfy_dir / "input" / input_name
        artifact_input_path = input_dir / input_name
        source_input.save(comfy_input_path)
        source_input.save(artifact_input_path)
        mask_name = None
        control_name = None
        model_input_name = input_name
        repair_info: dict[str, Any] | None = None
        artifact_repair_mask_path: Path | None = None
        artifact_control_path: Path | None = None
        artifact_model_input_path: Path | None = None
        if args.flight_state and not args.repair_inpaint and config.get("repairZones"):
            repair_mask, repair_info = make_repair_mask(source_input, config, args.repair_grow, args.repair_feather)
            mask_name = f"war_london_air_source_{args.run_id}_{asset_id}_flight_mask.png"
            control_name = f"war_london_air_source_{args.run_id}_{asset_id}_flight_control.png"
            comfy_mask_path = comfy_dir / "input" / mask_name
            comfy_control_path = comfy_dir / "input" / control_name
            artifact_repair_mask_path = repair_mask_dir / mask_name
            artifact_control_path = control_dir / control_name
            repair_mask_rgb = Image.merge("RGB", (repair_mask, repair_mask, repair_mask))
            repair_mask_rgb.save(comfy_mask_path)
            repair_mask_rgb.save(artifact_repair_mask_path)
            control_input = make_control_input_without_repair_edges(source_input, repair_mask)
            control_input.save(comfy_control_path)
            control_input.save(artifact_control_path)
        if args.repair_inpaint:
            if not config.get("repairZones"):
                raise RuntimeError(f"{asset_id} has no repairZones configured for --repair-inpaint")
            repair_mask, repair_info = make_repair_mask(source_input, config, args.repair_grow, args.repair_feather)
            mask_name = f"war_london_air_source_{args.run_id}_{asset_id}_repair_mask.png"
            control_name = f"war_london_air_source_{args.run_id}_{asset_id}_control.png"
            model_input_name = f"war_london_air_source_{args.run_id}_{asset_id}_model_input.png"
            comfy_mask_path = comfy_dir / "input" / mask_name
            comfy_control_path = comfy_dir / "input" / control_name
            comfy_model_input_path = comfy_dir / "input" / model_input_name
            artifact_repair_mask_path = repair_mask_dir / mask_name
            artifact_control_path = control_dir / control_name
            artifact_model_input_path = input_dir / model_input_name
            repair_mask_rgb = Image.merge("RGB", (repair_mask, repair_mask, repair_mask))
            repair_mask_rgb.save(comfy_mask_path)
            repair_mask_rgb.save(artifact_repair_mask_path)
            control_input = make_control_input_without_repair_edges(source_input, repair_mask)
            control_input.save(comfy_control_path)
            control_input.save(artifact_control_path)
            control_input.save(comfy_model_input_path)
            control_input.save(artifact_model_input_path)

        prompt = make_prompt(asset_id, model_input_name, args, mask_name=mask_name, control_name=control_name)
        (workflow_dir / f"{asset_id}.json").write_text(json.dumps(prompt, indent=2, ensure_ascii=False))
        queued = post_json(args.url, "/prompt", {"prompt": prompt})
        prompt_id = queued["prompt_id"]
        history = wait_for_history(args.url, prompt_id, args.timeout_seconds)
        base_prefix = f"war_london_air_source_{args.run_id}_{asset_id}"
        raw_path = collect_image_by_prefix(comfy_dir, history, f"{base_prefix}_rgb")
        mask_path = collect_image_by_prefix(comfy_dir, history, f"{base_prefix}_birefnet_mask")
        rgba_path = collect_image_by_prefix(comfy_dir, history, f"{base_prefix}_rgba")
        raw_artifact_path = raw_dir / f"{asset_id}-comfy-rgb.png"
        mask_artifact_path = mask_dir / f"{asset_id}-birefnet-mask.png"
        rgba_artifact_path = rgba_dir / f"{asset_id}-comfy-rgba.png"
        shutil.copy2(raw_path, raw_artifact_path)
        shutil.copy2(mask_path, mask_artifact_path)
        shutil.copy2(rgba_path, rgba_artifact_path)
        if args.view == "top-down":
            candidate = normalize_top_down_comfy_rgba(rgba_path, config, asset_id)
        else:
            candidate = normalize_comfy_rgba(rgba_path, config)
        candidate_path = candidate_dir / config["runtime"]
        candidate.save(candidate_path)
        stats = alpha_stats(candidate)
        failed = validate_candidate(asset_id, stats, config)
        runtime_path = RUNTIME_DIR / config["runtime"]
        applied = False
        if args.apply:
            if failed:
                raise RuntimeError(f"{asset_id} failed transparent candidate gates, not applying: {failed}; stats={stats}")
            candidate.save(runtime_path)
            applied = True
        if not args.keep_comfy_temp:
            temp_paths = [comfy_input_path, raw_path, mask_path, rgba_path]
            if args.repair_inpaint or (args.flight_state and control_name):
                temp_paths.extend(
                    [
                        comfy_dir / "input" / (mask_name or ""),
                        comfy_dir / "input" / (control_name or ""),
                        comfy_dir / "input" / model_input_name,
                    ]
                )
            for temp_path in temp_paths:
                if safe_delete_comfy_temp(temp_path, comfy_dir):
                    deleted_temp_files.append(str(temp_path))
        record = {
            "asset": asset_id,
            "applied": applied,
            "candidate": project_path(candidate_path),
            "failedGates": failed,
            "comfyMask": project_path(mask_artifact_path),
            "comfyTransparent": project_path(rgba_artifact_path),
            "input": project_path(artifact_input_path),
            "promptId": prompt_id,
        "rawComfyOutput": project_path(raw_artifact_path),
        "rawStats": image_stats(raw_artifact_path),
        "runtimeAsset": project_path(runtime_path),
            "source": project_path(source_path),
        "sourceCrop": base_config.get("sourceCrop") if not args.no_source_crop and args.view != "top-down" else None,
        "view": args.view,
        "stats": stats,
        "thresholds": {"maxBBoxFillRatio": config.get("maxBBoxFillRatio", 0.48)},
        }
        if repair_info:
            record["repair" if args.repair_inpaint else "flightStateControl"] = {
                **(repair_info or {}),
                "controlInput": project_path(artifact_control_path) if artifact_control_path else None,
                "mask": project_path(artifact_repair_mask_path) if artifact_repair_mask_path else None,
                "modelInput": project_path(artifact_model_input_path) if artifact_model_input_path else None,
            }
        records.append(record)

    contact_sheet = make_contact_sheet(records, output_dir)
    report = {
        "checked_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "background_removal_model": str((comfy_dir / "models/background_removal" / args.background_removal_model)),
        "checkpoint": str((comfy_dir / "models/checkpoints" / args.checkpoint)),
        "comfy_nodes": comfy_nodes,
        "comfy_dir": str(comfy_dir),
        "contact_sheet": project_path(contact_sheet) if contact_sheet else None,
        "controlnet": str((comfy_dir / "models/controlnet" / args.controlnet)),
        "control_strength": args.control_strength,
        "control_end_percent": args.control_end_percent,
        "deleted_comfy_temp_files": deleted_temp_files,
        "denoise": args.denoise,
        "effective_generation_settings": effective_generation_settings(args),
        "apply": args.apply,
        "flight_state": args.flight_state,
        "keep_comfy_temp": args.keep_comfy_temp,
        "models": model_records,
        "output_dir": project_path(output_dir),
        "pipeline": pipeline_description(args),
        "repair_feather": args.repair_feather,
        "repair_grow": args.repair_grow,
        "repair_inpaint": args.repair_inpaint,
        "records": records,
        "run_id": args.run_id,
        "url": args.url,
        "view": args.view,
    }
    (output_dir / "metrics.json").write_text(json.dumps(report, indent=2, ensure_ascii=False))
    print(json.dumps({"output_dir": str(output_dir), "records": len(records), "apply": args.apply}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
