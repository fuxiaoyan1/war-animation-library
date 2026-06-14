from __future__ import annotations

import argparse
import json
import math
import time
from pathlib import Path
from typing import Any

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps, ImageStat


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "public/assets/unit-icons/source/britain-air"
REFERENCE_DIR = SOURCE_DIR / "top-down-reference"
RUNTIME_DIR = ROOT / "public/assets/unit-icons"
DEFAULT_OUTPUT_DIR = ROOT / "artifacts/london-air-topdown-reference-icons-20260614"


ASSETS: dict[str, dict[str, Any]] = {
    "britain-spitfire": {
        "runtime": "britain-spitfire.png",
        "source": "top-down-reference/britain-spitfire-il2-spitfire-mkxiv-top.png",
        "size": (640, 560),
        "fitPadding": (88, 58),
        "rotate": -90,
        "brightness": 0.74,
        "contrast": 1.22,
        "color": 1.03,
        "markingPolicy": "raf",
        "note": "IL-2 Spitfire Mk.XIV top view reference with RAF markings; used as Spitfire planform/material proxy, not as a literal 1940 variant claim.",
    },
    "britain-hurricane": {
        "runtime": "britain-hurricane.png",
        "source": "top-down-reference/britain-hurricane-il2-hurricane-mkii-top.png",
        "size": (640, 560),
        "fitPadding": (84, 56),
        "rotate": -90,
        "brightness": 0.74,
        "contrast": 1.2,
        "color": 1.04,
        "markingPolicy": "raf",
        "note": "IL-2 Hurricane Mk.II top view reference; close to Battle of Britain Hurricane shape.",
    },
    "luftwaffe-bf109": {
        "runtime": "luftwaffe-bf109.png",
        "source": "top-down-reference/luftwaffe-bf109-il2-bf109-e7-top.png",
        "size": (620, 540),
        "fitPadding": (98, 74),
        "rotate": -90,
        "brightness": 0.74,
        "contrast": 1.22,
        "color": 0.96,
        "markingPolicy": "luftwaffe",
        "note": "IL-2 Bf 109 E-7 top view reference; same Battle of Britain Emil family planform.",
    },
    "luftwaffe-bf110": {
        "runtime": "luftwaffe-bf110.png",
        "source": "top-down-reference/luftwaffe-bf110-il2-bf110-e2-top.png",
        "size": (720, 600),
        "fitPadding": (80, 70),
        "rotate": -90,
        "brightness": 0.72,
        "contrast": 1.24,
        "color": 0.95,
        "markingPolicy": "luftwaffe",
        "note": "IL-2 Bf 110 E-2 top view reference; close enough to Battle of Britain Bf 110C/D silhouette.",
    },
    "luftwaffe-do17": {
        "runtime": "luftwaffe-do17.png",
        "source": "top-down-reference/luftwaffe-do17-hyperscale-airfix-plan-view.jpg",
        "size": (760, 620),
        "fitPadding": (92, 76),
        "rotate": -90,
        "brightness": 1.02,
        "contrast": 1.2,
        "color": 1.0,
        "do17PlanColorLift": True,
        "maskMode": "white-background-plan",
        "markingPolicy": "luftwaffe",
        "minLuminance": 62,
        "note": "Airfix Do 17Z plan-view painting guide used as the Do 17 planform source; annotations and white sheet background are removed.",
    },
    "luftwaffe-he111": {
        "runtime": "luftwaffe-he111.png",
        "source": "top-down-reference/luftwaffe-he111-il2-he111-h6-top.png",
        "size": (780, 660),
        "fitPadding": (88, 76),
        "rotate": -90,
        "brightness": 0.74,
        "contrast": 1.24,
        "color": 0.96,
        "markingPolicy": "luftwaffe",
        "note": "IL-2 He 111 H-6 top view reference; used as He 111 bomber icon source.",
    },
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build London air top-down unit icon candidates from high-quality top-view references.")
    parser.add_argument("--asset", action="append", choices=sorted(ASSETS), help="Asset id to process; repeatable. Defaults to all configured references.")
    parser.add_argument("--apply", action="store_true", help="Overwrite runtime PNGs after visual review.")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    return parser.parse_args()


def project_path(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def crop_alpha_subject(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    hard_alpha = alpha.point(lambda value: 255 if value > 12 else 0)
    bbox = hard_alpha.getbbox()
    if not bbox:
        raise RuntimeError("reference image has empty alpha")
    left, top, right, bottom = bbox
    margin_x = max(4, round((right - left) * 0.018))
    margin_y = max(4, round((bottom - top) * 0.018))
    bbox = (
        max(0, left - margin_x),
        max(0, top - margin_y),
        min(rgba.width, right + margin_x),
        min(rgba.height, bottom + margin_y),
    )
    return rgba.crop(bbox)


def remove_small_components(mask: Image.Image, min_area: int) -> Image.Image:
    mask = mask.convert("L")
    width, height = mask.size
    pixels = mask.load()
    seen: set[tuple[int, int]] = set()
    clean = Image.new("L", mask.size, 0)
    clean_pixels = clean.load()
    for start_y in range(height):
        for start_x in range(width):
            if pixels[start_x, start_y] == 0 or (start_x, start_y) in seen:
                continue
            stack = [(start_x, start_y)]
            seen.add((start_x, start_y))
            points: list[tuple[int, int]] = []
            while stack:
                x, y = stack.pop()
                points.append((x, y))
                for nx in (x - 1, x, x + 1):
                    for ny in (y - 1, y, y + 1):
                        if nx < 0 or ny < 0 or nx >= width or ny >= height or (nx, ny) in seen:
                            continue
                        if pixels[nx, ny] == 0:
                            continue
                        seen.add((nx, ny))
                        stack.append((nx, ny))
            if len(points) >= min_area:
                for x, y in points:
                    clean_pixels[x, y] = 255
    return clean


def make_white_background_plan_subject(image: Image.Image) -> Image.Image:
    rgb = image.convert("RGB")
    width, height = rgb.size
    mask = Image.new("L", rgb.size, 0)
    mask_pixels = mask.load()
    pixels = rgb.load()
    for y in range(height):
        for x in range(width):
            red, green, blue = pixels[x, y]
            mean = (red + green + blue) / 3
            chroma = max(red, green, blue) - min(red, green, blue)
            is_red_annotation = red > 150 and red - max(green, blue) > 55
            is_bottom_right_legend = x > width * 0.52 and y > height * 0.58
            if is_red_annotation or is_bottom_right_legend:
                continue
            if mean < 218 or chroma > 36:
                mask_pixels[x, y] = 255
    mask = mask.filter(ImageFilter.MedianFilter(3))
    mask = remove_small_components(mask, min_area=900)
    mask = mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.55))
    mask = mask.point(lambda value: 0 if value < 18 else min(255, round(value * 1.08)))
    rgba = rgb.convert("RGBA")
    rgba.putalpha(mask)
    return crop_alpha_subject(rgba)


def centered_fit(rgba: Image.Image, size: tuple[int, int], padding: tuple[int, int]) -> Image.Image:
    alpha = rgba.getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 12 else 0).getbbox()
    if not bbox:
        raise RuntimeError("empty alpha mask")
    subject = rgba.crop(bbox)
    max_width, max_height = size
    padding_x, padding_y = padding
    scale = min((max_width - padding_x * 2) / subject.width, (max_height - padding_y * 2) / subject.height)
    subject = subject.resize((max(1, round(subject.width * scale)), max(1, round(subject.height * scale))), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.alpha_composite(subject, ((max_width - subject.width) // 2, (max_height - subject.height) // 2))
    return canvas


def lift_transparent_rgb(rgba: Image.Image) -> Image.Image:
    result = rgba.copy()
    alpha = result.getchannel("A")
    neutral = Image.new("RGBA", result.size, (0, 0, 0, 0))
    neutral.alpha_composite(result)
    neutral.putalpha(alpha.point(lambda value: 0 if value <= 8 else value))
    return neutral


def restyle_icon(rgba: Image.Image, config: dict[str, Any]) -> Image.Image:
    alpha = rgba.getchannel("A").filter(ImageFilter.MedianFilter(3))
    alpha = alpha.point(lambda value: 0 if value <= 12 else min(255, round(value * 1.05)))
    neutral = Image.new("RGB", rgba.size, (214, 218, 211))
    rgb = neutral.copy()
    rgb.paste(rgba.convert("RGB"), mask=alpha)
    rgb = ImageOps.autocontrast(rgb, cutoff=0.25)
    rgb = ImageEnhance.Brightness(rgb).enhance(float(config.get("brightness", 0.74)))
    rgb = ImageEnhance.Contrast(rgb).enhance(float(config.get("contrast", 1.2)))
    rgb = ImageEnhance.Color(rgb).enhance(float(config.get("color", 1.0)))
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.26)
    min_luminance = config.get("minLuminance")
    if min_luminance is not None:
        min_value = float(min_luminance)
        rgb_pixels = rgb.load()
        alpha_pixels = alpha.load()
        for y in range(rgb.height):
            for x in range(rgb.width):
                if alpha_pixels[x, y] <= 16:
                    continue
                red, green, blue = rgb_pixels[x, y]
                luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722
                if luminance < min_value:
                    lift = min_value - luminance
                    rgb_pixels[x, y] = (
                        min(255, round(red + lift * 0.9)),
                        min(255, round(green + lift * 0.9)),
                        min(255, round(blue + lift * 0.9)),
                    )
    if config.get("do17PlanColorLift"):
        rgb_pixels = rgb.load()
        alpha_pixels = alpha.load()
        for y in range(rgb.height):
            for x in range(rgb.width):
                if alpha_pixels[x, y] <= 16:
                    continue
                red, green, blue = rgb_pixels[x, y]
                luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722
                if luminance < 78:
                    red = min(255, round(red + 12))
                    green = min(255, round(green + 14))
                    blue = min(255, round(blue + 8))
                if luminance < 150:
                    red = round(red * 0.96 + 8)
                    green = round(green * 1.02 + 9)
                    blue = round(blue * 0.88 + 5)
                rgb_pixels[x, y] = (
                    max(0, min(255, red)),
                    max(0, min(255, green)),
                    max(0, min(255, blue)),
                )
    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=0.75, percent=115, threshold=2))
    result = rgb.convert("RGBA")
    result.putalpha(alpha)
    if config.get("do17PlanColorLift"):
        highlight = Image.new("RGBA", result.size, (0, 0, 0, 0))
        highlight_pixels = highlight.load()
        alpha_pixels = alpha.load()
        width, height = result.size
        for y in range(height):
            for x in range(width):
                if alpha_pixels[x, y] <= 16:
                    continue
                nx = (x - width * 0.54) / (width * 0.22)
                ny = (y - height * 0.5) / (height * 0.42)
                value = max(0, 1 - (nx * nx * 1.8 + ny * ny * 0.35)) * 28
                if value > 1:
                    highlight_pixels[x, y] = (210, 220, 196, round(value))
        result = Image.alpha_composite(result, highlight)
    return result


def edge_highlight(rgba: Image.Image) -> Image.Image:
    alpha = rgba.getchannel("A")
    edge = alpha.filter(ImageFilter.FIND_EDGES).filter(ImageFilter.GaussianBlur(0.6))
    edge = edge.point(lambda value: min(92, round(value * 0.38)))
    highlight = Image.new("RGBA", rgba.size, (235, 236, 220, 0))
    highlight.putalpha(edge)
    return Image.alpha_composite(rgba, highlight)


def enhance_do17_plan_icon(rgba: Image.Image) -> Image.Image:
    result = rgba.convert("RGBA")
    alpha = result.getchannel("A")
    width, height = result.size
    highlight = Image.new("RGBA", result.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(highlight, "RGBA")

    # Broad dorsal metal sheen over the long fuselage and wing roots.
    for index in range(34):
        opacity = max(0, 34 - index)
        draw.ellipse(
            (
                round(width * (0.44 - index * 0.003)),
                round(height * (0.2 + index * 0.006)),
                round(width * (0.76 + index * 0.002)),
                round(height * (0.8 - index * 0.006)),
            ),
            fill=(205, 214, 186, opacity),
        )
    # Engine nacelle highlights and propeller discs, kept subdued for map scale.
    for y in (0.38, 0.62):
        draw.ellipse(
            (round(width * 0.61), round(height * (y - 0.055)), round(width * 0.73), round(height * (y + 0.055))),
            fill=(190, 198, 176, 44),
        )
        draw.ellipse(
            (round(width * 0.7), round(height * (y - 0.09)), round(width * 0.78), round(height * (y + 0.09))),
            outline=(220, 224, 210, 78),
            width=2,
        )
    # Glazed nose should read at marker scale.
    draw.ellipse(
        (round(width * 0.72), round(height * 0.42), round(width * 0.84), round(height * 0.58)),
        fill=(116, 143, 145, 30),
        outline=(218, 226, 214, 90),
        width=2,
    )
    draw.line(
        (round(width * 0.75), round(height * 0.42), round(width * 0.82), round(height * 0.58)),
        fill=(226, 232, 218, 70),
        width=1,
    )

    highlight.putalpha(ImageChops.multiply(highlight.getchannel("A"), alpha))
    result = Image.alpha_composite(result, highlight)
    return result.filter(ImageFilter.UnsharpMask(radius=0.75, percent=125, threshold=2))


def build_icon(asset_id: str, config: dict[str, Any]) -> Image.Image:
    source_path = SOURCE_DIR / config["source"]
    if not source_path.exists():
        raise FileNotFoundError(source_path)
    source = Image.open(source_path).convert("RGBA")
    if config.get("maskMode") == "white-background-plan":
        subject = make_white_background_plan_subject(source)
    else:
        subject = crop_alpha_subject(source)
    rotate_degrees = int(config.get("rotate", 0))
    if rotate_degrees:
        subject = subject.rotate(rotate_degrees, expand=True, resample=Image.Resampling.BICUBIC)
    fitted = centered_fit(subject, tuple(config["size"]), tuple(config["fitPadding"]))
    styled = restyle_icon(fitted, config)
    styled = edge_highlight(styled)
    if config.get("do17PlanColorLift"):
        styled = enhance_do17_plan_icon(styled)
    return lift_transparent_rgb(styled)


def alpha_stats(image: Image.Image) -> dict[str, Any]:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    width, height = rgba.size
    values = list(alpha.tobytes())
    visible_points: list[tuple[int, int]] = []
    row_counts = [0 for _ in range(height)]
    column_counts = [0 for _ in range(width)]
    edge_values = []
    luminance_values: list[float] = []
    for y in range(height):
        for x in range(width):
            value = alpha.getpixel((x, y))
            if value > 16:
                visible_points.append((x, y))
                row_counts[y] += 1
                column_counts[x] += 1
                red, green, blue, _ = rgba.getpixel((x, y))
                luminance_values.append(red * 0.2126 + green * 0.7152 + blue * 0.0722)
            if x == 0 or y == 0 or x == width - 1 or y == height - 1:
                edge_values.append(value)
    if visible_points:
        xs = [point[0] for point in visible_points]
        ys = [point[1] for point in visible_points]
        bbox = [min(xs), min(ys), max(xs) - min(xs) + 1, max(ys) - min(ys) + 1]
        bbox_ratio = bbox[2] * bbox[3] / (width * height)
        opaque_pixels = sum(1 for value in values if value > 8)
        bbox_fill_ratio = opaque_pixels / (bbox[2] * bbox[3])
    else:
        bbox = [0, 0, 0, 0]
        bbox_ratio = 0
        bbox_fill_ratio = 0
    mean = sum(luminance_values) / len(luminance_values) if luminance_values else 0
    variance = sum((value - mean) ** 2 for value in luminance_values) / len(luminance_values) if luminance_values else 0
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
        "luminanceMean": mean,
        "luminanceStdDev": math.sqrt(variance),
        "maxColumnCoverage": max(column_counts) / height,
        "maxRowCoverage": max(row_counts) / width,
        "size": [width, height],
        "visiblePixels": len(luminance_values),
    }


def make_contact_sheet(records: list[dict[str, Any]], output_dir: Path) -> Path:
    cell_w = 360
    cell_h = 260
    label_h = 24
    margin = 18
    sheet = Image.new("RGB", (margin * 3 + cell_w * 2, margin + len(records) * (cell_h + label_h + margin)), (31, 36, 37))
    from PIL import ImageDraw, ImageFont

    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    for row, record in enumerate(records):
        y = margin + row * (cell_h + label_h + margin)
        for column, (title, key) in enumerate((("top reference", "source"), ("candidate", "candidate"))):
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
    output_dir = args.output_dir if args.output_dir.is_absolute() else ROOT / args.output_dir
    candidate_dir = output_dir / "candidates"
    candidate_dir.mkdir(parents=True, exist_ok=True)
    asset_ids = args.asset or list(ASSETS)
    records: list[dict[str, Any]] = []
    for asset_id in asset_ids:
        config = ASSETS[asset_id]
        candidate = build_icon(asset_id, config)
        candidate_path = candidate_dir / config["runtime"]
        candidate.save(candidate_path)
        runtime_path = RUNTIME_DIR / config["runtime"]
        applied = False
        if args.apply:
            candidate.save(runtime_path)
            applied = True
        records.append(
            {
                "asset": asset_id,
                "applied": applied,
                "candidate": project_path(candidate_path),
                "note": config.get("note"),
                "runtimeAsset": project_path(runtime_path),
                "source": project_path(SOURCE_DIR / config["source"]),
                "stats": alpha_stats(candidate),
            }
        )
    contact_sheet = make_contact_sheet(records, output_dir)
    report = {
        "checked_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "apply": args.apply,
        "contact_sheet": project_path(contact_sheet),
        "output_dir": project_path(output_dir),
        "pipeline": "high-quality top-view references -> alpha crop -> rotate nose-right -> project sizing -> material contrast and edge highlight",
        "records": records,
    }
    (output_dir / "metrics.json").write_text(json.dumps(report, indent=2, ensure_ascii=False))
    print(json.dumps({"output_dir": str(output_dir), "records": len(records), "apply": args.apply}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
