from __future__ import annotations

import hashlib
import json
import math
import random
from pathlib import Path
from statistics import median
from typing import Iterable

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps
from rembg import new_session, remove


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "public/assets/unit-icons/source/britain-air"
OUTPUT_DIR = ROOT / "public/assets/unit-icons"
EVIDENCE_DIR = ROOT / "artifacts/london-air-segmentation-production-20260613"
CACHE_MODEL_DIR = ROOT / "engine-cache/models/segmentation"
ISNET_MODEL = CACHE_MODEL_DIR / "isnet-general-use.onnx"

EXPECTED_MODELS = {
    ISNET_MODEL: "fc16ebd8b0c10d971d3513d564d01e29",
}

ASSETS = [
    {
        "id": "britain-spitfire",
        "source": "602sqdn-spit1.jpg",
        "family": "singleFighter",
        "size": (720, 240),
        "cropPadding": (0.09, 0.2),
        "fitPadding": (92, 55),
        "flip": True,
        "tone": (78, 93, 82),
    },
    {
        "id": "britain-hurricane",
        "source": "hawker-hurricane-xii-canada-side.jpg",
        "family": "singleFighter",
        "size": (720, 240),
        "cropPadding": (0.1, 0.2),
        "fitPadding": (92, 55),
        "flip": True,
        "tone": (79, 91, 75),
    },
    {
        "id": "luftwaffe-bf109",
        "source": "messerschmitt-bf109e3.jpg",
        "family": "singleFighter",
        "size": (720, 240),
        "cropPadding": (0.12, 0.24),
        "fitPadding": (92, 55),
        "tone": (91, 88, 74),
    },
    {
        "id": "luftwaffe-bf110",
        "source": "messerschmitt-bf110b-1940-side.jpg",
        "family": "twinFighter",
        "size": (760, 240),
        "cropPadding": (0.06, 0.38),
        "fitPadding": (80, 55),
        "flip": True,
        "tone": (92, 89, 73),
    },
    {
        "id": "luftwaffe-do17",
        "source": "dornier-do17z-1942.jpg",
        "family": "bomber",
        "size": (780, 250),
        "cropPadding": (0.08, 0.16),
        "fitPadding": (102, 58),
        "maxBBoxFillRatio": 0.6,
        "alphaCut": 82,
        "alphaScale": 1.58,
        "tone": (90, 86, 72),
    },
    {
        "id": "luftwaffe-he111",
        "source": "heinkel-he111-battle-of-britain.jpg",
        "family": "bomber",
        "size": (780, 250),
        "alphaMode": "photoAssist",
        "brightness": 0.78,
        "colorBoost": 0.9,
        "cropPadding": (0.11, 0.2),
        "fitPadding": (102, 58),
        "tone": (93, 88, 73),
    },
]


def md5(path: Path) -> str:
    digest = hashlib.md5()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def verify_models() -> list[dict[str, object]]:
    records = []
    for path, checksum in EXPECTED_MODELS.items():
        if not path.exists():
            raise SystemExit(f"missing segmentation model: {path}")
        actual = md5(path)
        if actual != checksum:
            raise SystemExit(f"bad checksum for {path}: {actual}, expected {checksum}")
        records.append({"file": str(path.relative_to(ROOT)), "md5": actual, "size": path.stat().st_size})
    return records


def alpha_curve(mask: Image.Image, low: int = 34, high: int = 176) -> Image.Image:
    mask = mask.convert("L")
    return mask.point(lambda value: 0 if value < low else 255 if value > high else round((value - low) / (high - low) * 255))


def scan_subject_bbox(image: Image.Image, session) -> tuple[int, int, int, int] | None:
    max_side = 960
    scale = min(max_side / image.width, max_side / image.height, 1)
    scan = image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)
    mask = remove(scan, session=session, only_mask=True, post_process_mask=True).convert("L")
    hard = mask.point(lambda value: 255 if value > 60 else 0)
    bbox = hard.getbbox()
    if not bbox:
        return None
    x1, y1, x2, y2 = bbox
    return (
        math.floor(x1 / scale),
        math.floor(y1 / scale),
        math.ceil(x2 / scale),
        math.ceil(y2 / scale),
    )


def padded_crop_box(image: Image.Image, bbox: tuple[int, int, int, int], x_pad_ratio: float, y_pad_ratio: float) -> tuple[int, int, int, int]:
    x1, y1, x2, y2 = bbox
    width = x2 - x1
    height = y2 - y1
    xpad = round(width * x_pad_ratio)
    ypad = round(height * y_pad_ratio)
    return (
        max(0, x1 - xpad),
        max(0, y1 - ypad),
        min(image.width, x2 + xpad),
        min(image.height, y2 + ypad),
    )


def edge_background(image: Image.Image) -> tuple[int, int, int]:
    pixels = image.load()
    samples = []
    for x in range(image.width):
        samples.append(pixels[x, 0])
        samples.append(pixels[x, image.height - 1])
    for y in range(image.height):
        samples.append(pixels[0, y])
        samples.append(pixels[image.width - 1, y])
    return tuple(round(median([sample[channel] for sample in samples])) for channel in range(3))


def luminance(pixel: tuple[int, int, int]) -> float:
    return pixel[0] * 0.2126 + pixel[1] * 0.7152 + pixel[2] * 0.0722


def saturation(pixel: tuple[int, int, int]) -> float:
    maximum = max(pixel)
    minimum = min(pixel)
    return 0 if maximum == 0 else (maximum - minimum) / maximum


def color_distance(left: tuple[int, int, int], right: tuple[int, int, int]) -> float:
    return sum((left[index] - right[index]) ** 2 for index in range(3)) ** 0.5


def scaled_points(width: int, height: int, points: Iterable[tuple[float, float]], scale: int) -> list[tuple[int, int]]:
    return [(round(x * width * scale), round(y * height * scale)) for x, y in points]


def build_envelope(size: tuple[int, int], family: str) -> Image.Image:
    width, height = size
    scale = 4
    mask = Image.new("L", (width * scale, height * scale), 0)
    draw = ImageDraw.Draw(mask)

    if family == "singleFighter":
        polygons = [
            [(0.06, 0.48), (0.18, 0.42), (0.72, 0.41), (0.92, 0.49), (0.84, 0.57), (0.18, 0.59), (0.06, 0.54)],
            [(0.39, 0.50), (0.56, 0.14), (0.70, 0.20), (0.56, 0.54)],
            [(0.39, 0.53), (0.60, 0.84), (0.70, 0.75), (0.56, 0.49)],
            [(0.11, 0.46), (0.22, 0.19), (0.34, 0.45)],
            [(0.11, 0.56), (0.34, 0.66), (0.23, 0.49)],
            [(0.84, 0.43), (0.98, 0.50), (0.84, 0.58)],
        ]
        ellipses = [(0.83, 0.43, 0.98, 0.58)]
    elif family == "twinFighter":
        polygons = [
            [(0.04, 0.48), (0.14, 0.42), (0.77, 0.40), (0.96, 0.49), (0.91, 0.58), (0.16, 0.60), (0.04, 0.54)],
            [(0.36, 0.50), (0.54, 0.12), (0.70, 0.20), (0.55, 0.54)],
            [(0.36, 0.53), (0.60, 0.86), (0.72, 0.77), (0.55, 0.49)],
            [(0.08, 0.46), (0.21, 0.18), (0.34, 0.45)],
            [(0.08, 0.56), (0.34, 0.67), (0.23, 0.49)],
        ]
        ellipses = [(0.41, 0.40, 0.53, 0.59), (0.58, 0.40, 0.70, 0.59), (0.88, 0.43, 0.99, 0.57)]
    else:
        polygons = [
            [(0.08, 0.51), (0.20, 0.47), (0.64, 0.42), (0.94, 0.47), (0.80, 0.55), (0.27, 0.60), (0.08, 0.56)],
            [(0.30, 0.50), (0.53, 0.28), (0.78, 0.32), (0.59, 0.53)],
            [(0.30, 0.56), (0.56, 0.72), (0.78, 0.66), (0.59, 0.51)],
            [(0.10, 0.50), (0.22, 0.32), (0.34, 0.50)],
            [(0.10, 0.58), (0.35, 0.64), (0.23, 0.52)],
        ]
        ellipses = [(0.54, 0.42, 0.65, 0.55), (0.81, 0.41, 0.95, 0.54)]

    for polygon in polygons:
        draw.polygon(scaled_points(width, height, polygon, scale), fill=255)
    for x1, y1, x2, y2 in ellipses:
        draw.ellipse(
            (
                round(x1 * width * scale),
                round(y1 * height * scale),
                round(x2 * width * scale),
                round(y2 * height * scale),
            ),
            fill=255,
        )

    return mask.resize(size, Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(1.1)).point(lambda value: 0 if value < 10 else value)


def build_photo_alpha(image: Image.Image, envelope: Image.Image) -> Image.Image:
    background = edge_background(image)
    background_luminance = luminance(background)
    background_saturation = saturation(background)
    pixels = image.load()
    envelope_pixels = envelope.load()
    alpha = Image.new("L", image.size, 0)
    alpha_pixels = alpha.load()

    for y in range(image.height):
        vertical_center_weight = 1 - min(1, abs((y + 0.5) / image.height - 0.52) / 0.52)
        for x in range(image.width):
            envelope_value = envelope_pixels[x, y]
            if envelope_value < 10:
                continue
            pixel = pixels[x, y]
            distance = color_distance(pixel, background)
            lum_delta = abs(luminance(pixel) - background_luminance)
            sat_delta = abs(saturation(pixel) - background_saturation) * 255
            score = max(distance, lum_delta * 1.35, sat_delta * 0.8)
            if score < 12:
                value = 0
            elif score < 42:
                value = round((score - 12) / 30 * 210)
            else:
                value = 255
            if vertical_center_weight > 0.68 and 0.05 < x / image.width < 0.96 and lum_delta > 6:
                value = max(value, 150)
            alpha_pixels[x, y] = min(envelope_value, value)

    alpha = alpha.filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.GaussianBlur(0.3))
    return alpha.point(lambda value: 0 if value < 18 else min(255, round(value * 1.18)))


def build_cutout_alpha(
    isnet_mask: Image.Image,
    envelope: Image.Image,
    photo_mask: Image.Image,
    family: str,
    config: dict[str, object],
) -> Image.Image:
    if config.get("alphaMode") == "photoAssist":
        alpha = ImageChops.lighter(
            ImageChops.multiply(isnet_mask, envelope.filter(ImageFilter.GaussianBlur(0.5))),
            ImageChops.multiply(photo_mask, envelope),
        )
        alpha = alpha.filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.GaussianBlur(0.22))
        return alpha.point(lambda value: 0 if value < 18 else min(255, round(value * 1.08)))

    alpha = ImageChops.multiply(isnet_mask, envelope)
    if family == "bomber":
        alpha = alpha.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(0.22))
        alpha_cut = int(config.get("alphaCut", 52))
        alpha_scale = float(config.get("alphaScale", 1.55))
        alpha = alpha.point(lambda value: 0 if value < alpha_cut else min(255, round((value - alpha_cut) * alpha_scale)))
    else:
        alpha = alpha.filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.GaussianBlur(0.22))
        alpha = alpha.point(lambda value: 0 if value < 42 else min(255, round((value - 42) * 1.45)))
    return alpha.point(lambda value: 0 if value < 18 else value)


def centered_fit(rgba: Image.Image, size: tuple[int, int], padding: tuple[int, int]) -> Image.Image:
    alpha = rgba.getchannel("A")
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


def add_outline(rgba: Image.Image, color: tuple[int, int, int, int], radius: int = 3) -> Image.Image:
    alpha = rgba.getchannel("A")
    outer = alpha.filter(ImageFilter.MaxFilter(radius)).filter(ImageFilter.GaussianBlur(0.35))
    inner = alpha
    outline_alpha = ImageChops.subtract(outer, inner).point(lambda value: min(190, round(value * 1.8)))
    outline = Image.new("RGBA", rgba.size, color)
    outline.putalpha(outline_alpha)
    result = Image.alpha_composite(outline, rgba)
    result.putalpha(ImageChops.lighter(result.getchannel("A"), alpha))
    return result


def clamp_low_alpha(rgba: Image.Image, threshold: int = 16) -> Image.Image:
    result = rgba.copy()
    alpha = result.getchannel("A").point(lambda value: 0 if value <= threshold else value)
    result.putalpha(alpha)
    return result


def style_aircraft(rgba: Image.Image, tone: tuple[int, int, int], asset_id: str, config: dict[str, object]) -> Image.Image:
    alpha = rgba.getchannel("A")
    rgb = rgba.convert("RGB")
    rgb = ImageOps.autocontrast(rgb, cutoff=0.7)
    rgb = ImageEnhance.Color(rgb).enhance(float(config.get("colorBoost", 0.72)))
    rgb = ImageEnhance.Contrast(rgb).enhance(1.17)
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.42)
    rgb = ImageEnhance.Brightness(rgb).enhance(float(config.get("brightness", 1.0)))

    tint = Image.new("RGB", rgb.size, tone)
    rgb = Image.blend(rgb, tint, 0.12)
    noise = Image.new("L", rgb.size, 0)
    random_source = random.Random(asset_id)
    noise.putdata([random_source.randrange(0, 24) for _ in range(rgb.width * rgb.height)])
    noise_rgb = Image.merge("RGB", (noise, noise, noise))
    rgb = ImageChops.add(rgb, noise_rgb, scale=1.0, offset=-9)
    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=0.9, percent=130, threshold=2))

    styled = rgb.convert("RGBA")
    styled.putalpha(alpha.point(lambda value: 0 if value < 16 else value))
    return clamp_low_alpha(styled)


def alpha_stats(image: Image.Image) -> dict[str, object]:
    alpha = image.getchannel("A")
    width, height = image.size
    values = list(alpha.getdata())
    visible_points = []
    opaque_pixels = 0
    row_counts = [0 for _ in range(height)]
    column_counts = [0 for _ in range(width)]
    edge_values = []
    for y in range(height):
        for x in range(width):
            value = alpha.getpixel((x, y))
            if value > 8:
                opaque_pixels += 1
            if value > 16:
                visible_points.append((x, y))
                row_counts[y] += 1
                column_counts[x] += 1
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
        "maxColumnCoverage": max(column_counts) / height,
        "maxRowCoverage": max(row_counts) / width,
        "opaqueRatio": opaque_pixels / (width * height),
        "size": [width, height],
    }


def validate_asset(config: dict[str, object], stats: dict[str, object]) -> None:
    asset_id = str(config["id"])
    max_bbox_fill_ratio = float(config.get("maxBBoxFillRatio", 0.48))
    checks = [
        (stats["alphaRatio"] < 0.24, "alphaRatio"),
        (stats["opaqueRatio"] > 0.05, "opaqueRatio"),
        (stats["bboxRatio"] < 0.42, "bboxRatio"),
        (stats["bboxFillRatio"] < max_bbox_fill_ratio, "bboxFillRatio"),
        (stats["maxRowCoverage"] < 0.78, "maxRowCoverage"),
        (stats["maxColumnCoverage"] < 0.56, "maxColumnCoverage"),
        (stats["edgeVisibleRatio"] < 0.02, "edgeVisibleRatio"),
        (stats["cornerAlphaMax"] <= 8, "cornerAlphaMax"),
    ]
    failed = [name for ok, name in checks if not ok]
    if failed:
        raise RuntimeError(f"{asset_id} failed asset gates: {failed}; stats={stats}")


def checker_background(size: tuple[int, int]) -> Image.Image:
    image = Image.new("RGB", size, (237, 235, 228))
    draw = ImageDraw.Draw(image)
    for y in range(0, size[1], 24):
        for x in range(0, size[0], 24):
            if (x // 24 + y // 24) % 2:
                draw.rectangle((x, y, x + 23, y + 23), fill=(209, 213, 207))
    return image


def build_asset(config: dict[str, object], session) -> dict[str, object]:
    source_path = SOURCE_DIR / str(config["source"])
    source = Image.open(source_path).convert("RGB")
    scan_bbox = scan_subject_bbox(source, session)
    if scan_bbox is None:
        raise RuntimeError(f"{config['id']} has no segmented subject in {source_path}")
    x_pad, y_pad = config["cropPadding"]
    crop_box = padded_crop_box(source, scan_bbox, x_pad, y_pad)
    cropped = source.crop(crop_box)
    if config.get("flip"):
        cropped = cropped.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    size = config["size"]
    working = cropped.resize(size, Image.Resampling.LANCZOS)

    isnet_mask = alpha_curve(remove(working, session=session, only_mask=True, post_process_mask=True), low=28, high=166)
    envelope = build_envelope(size, str(config["family"]))
    photo_mask = build_photo_alpha(working, envelope)
    alpha = build_cutout_alpha(isnet_mask, envelope, photo_mask, str(config["family"]), config)

    rgba = working.convert("RGBA")
    rgba.putalpha(alpha)
    fit_padding = config["fitPadding"]
    rgba = centered_fit(rgba, size, padding=fit_padding)
    rgba = style_aircraft(rgba, config["tone"], str(config["id"]), config)
    rgba = centered_fit(rgba, size, padding=fit_padding)
    rgba = clamp_low_alpha(rgba)

    output = OUTPUT_DIR / f"{config['id']}.png"
    output.parent.mkdir(parents=True, exist_ok=True)
    rgba.save(output)
    cropped.save(EVIDENCE_DIR / f"{config['id']}-source-crop.jpg", quality=92)
    alpha.save(EVIDENCE_DIR / f"{config['id']}-combined-alpha.png")
    rgba.save(EVIDENCE_DIR / f"{config['id']}-production.png")
    stats = alpha_stats(rgba)
    validate_asset(config, stats)
    return {
        "asset": config["id"],
        "source": str(source_path.relative_to(ROOT)),
        "output": str(output.relative_to(ROOT)),
        "cropBox": crop_box,
        "scanBBox": scan_bbox,
        **stats,
    }


def write_contact_sheet(records: list[dict[str, object]]) -> None:
    cells = []
    for record in records:
        asset_path = ROOT / str(record["output"])
        image = Image.open(asset_path).convert("RGBA")
        cell = checker_background((image.width, image.height + 38)).convert("RGBA")
        cell.alpha_composite(image, (0, 0))
        draw = ImageDraw.Draw(cell)
        draw.rectangle((0, image.height, cell.width, cell.height), fill=(30, 34, 32, 255))
        draw.text((14, image.height + 11), str(record["asset"]), fill=(238, 233, 218, 255))
        cells.append(cell.convert("RGB"))
    width = max(cell.width for cell in cells)
    height = sum(cell.height for cell in cells)
    sheet = Image.new("RGB", (width, height), (18, 20, 19))
    y = 0
    for cell in cells:
        sheet.paste(cell, ((width - cell.width) // 2, y))
        y += cell.height
    sheet.save(EVIDENCE_DIR / "aircraft-cutout-contact-sheet.png")


def main() -> None:
    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    model_records = verify_models()
    session = new_session("isnet-general-use")
    records = [build_asset(config, session) for config in ASSETS]
    write_contact_sheet(records)
    report = {
        "pipeline": "real-photo RGB + engine-cache isnet-general-use segmentation intersected with aircraft envelope alpha + style normalization; He 111 uses localized photo assist",
        "models": model_records,
        "assets": records,
    }
    (EVIDENCE_DIR / "metrics.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
