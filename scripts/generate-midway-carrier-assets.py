#!/usr/bin/env python3
from pathlib import Path
from statistics import median

from PIL import Image, ImageChops, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/assets/unit-icons/source/midway-models"
TARGET = ROOT / "public/assets/unit-icons"

CANVAS_SIZE = (900, 360)


ASSETS = {
    "enterprise": {
        "source": "midway-enterprise-academy-14409-walkaround.jpg",
        "crop": (40, 1010, 735, 1130),
        "mode": "background",
        "threshold": 18,
        "components": 3,
        "default_facing": "west"
    },
    "hornet": {
        "source": "midway-hornet-stephens-model-side.jpg",
        "crop": (210, 205, 1180, 420),
        "mode": "background",
        "components": 1,
        "threshold": 28,
        "default_facing": "west"
    },
    "yorktown": {
        "source": "midway-yorktown-academy-14229-walkaround.jpg",
        "crop": (0, 4760, 780, 5020),
        "mode": "background",
        "threshold": 24,
        "components": 3,
        "default_facing": "west"
    },
    "akagi": {
        "source": "midway-akagi-hasegawa-49227-model.jpg",
        "crop": (15, 175, 520, 390),
        "mode": "colored",
        "components": 1,
        "dark": 118,
        "saturation": 20,
        "default_facing": "east"
    },
    "kaga": {
        "source": "midway-kaga-wikimedia-sideview.jpg",
        "crop": (0, 85, 1638, 430),
        "mode": "dark",
        "components": 1,
        "threshold": 120,
        "default_facing": "east"
    },
    "soryu": {
        "source": "midway-soryu-wikimedia-1938.jpg",
        "crop": (0, 735, 3451, 1125),
        "mode": "dark",
        "threshold": 128,
        "components": 1,
        "default_facing": "east"
    },
    "hiryu": {
        "source": "midway-hiryu-aoshima-06655-model.jpg",
        "crop": (25, 140, 520, 350),
        "mode": "colored",
        "components": 1,
        "dark": 112,
        "saturation": 22,
        "default_facing": "east"
    }
}


def corner_background(image: Image.Image) -> tuple[int, int, int]:
    width, height = image.size
    samples = []
    for x0, y0 in ((0, 0), (width - 16, 0), (0, height - 16), (width - 16, height - 16)):
        region = image.crop((max(0, x0), max(0, y0), min(width, x0 + 16), min(height, y0 + 16))).convert("RGB")
        for y in range(region.height):
            for x in range(region.width):
                samples.append(region.getpixel((x, y)))
    return tuple(int(median(channel)) for channel in zip(*samples))


def background_mask(image: Image.Image, threshold: int) -> Image.Image:
    bg = Image.new("RGB", image.size, corner_background(image))
    diff = ImageChops.difference(image.convert("RGB"), bg).convert("L")
    return diff.point(lambda pixel: 255 if pixel > threshold else 0)


def dark_mask(image: Image.Image, threshold: int) -> Image.Image:
    gray = ImageOps.grayscale(image)
    return gray.point(lambda pixel: 255 if pixel < threshold else 0)


def colored_mask(image: Image.Image, saturation: int, dark: int) -> Image.Image:
    image = image.convert("RGB")
    mask = Image.new("L", image.size, 0)
    input_pixels = image.load()
    output_pixels = mask.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue = input_pixels[x, y]
            value = max(red, green, blue)
            chroma = value - min(red, green, blue)
            is_subject = (chroma >= saturation and value < 246) or value <= dark
            if is_subject:
                output_pixels[x, y] = 255
    return mask


def keep_largest_components(mask: Image.Image, count: int) -> Image.Image:
    if count <= 0:
        return mask

    mask = mask.convert("L")
    width, height = mask.size
    pixels = mask.load()
    visited = bytearray(width * height)
    components: list[tuple[int, list[tuple[int, int]]]] = []

    for y in range(height):
        for x in range(width):
            index = y * width + x
            if visited[index] or pixels[x, y] <= 8:
                continue

            stack = [(x, y)]
            visited[index] = 1
            points: list[tuple[int, int]] = []

            while stack:
                current_x, current_y = stack.pop()
                points.append((current_x, current_y))
                for next_x, next_y in (
                    (current_x - 1, current_y),
                    (current_x + 1, current_y),
                    (current_x, current_y - 1),
                    (current_x, current_y + 1)
                ):
                    if next_x < 0 or next_x >= width or next_y < 0 or next_y >= height:
                        continue
                    next_index = next_y * width + next_x
                    if visited[next_index] or pixels[next_x, next_y] <= 8:
                        continue
                    visited[next_index] = 1
                    stack.append((next_x, next_y))

            if len(points) > 80:
                components.append((len(points), points))

    selected = sorted(components, key=lambda item: item[0], reverse=True)[:count]
    result = Image.new("L", mask.size, 0)
    output = result.load()
    for _, points in selected:
        for x, y in points:
            output[x, y] = 255
    return result


def soften(mask: Image.Image) -> Image.Image:
    return mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.7))


def trim_to_mask(image: Image.Image, mask: Image.Image, pad: int = 10) -> tuple[Image.Image, Image.Image]:
    bbox = mask.getbbox()
    if not bbox:
        return image, mask

    left, top, right, bottom = bbox
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(image.width, right + pad)
    bottom = min(image.height, bottom + pad)
    box = (left, top, right, bottom)
    return image.crop(box), mask.crop(box)


def generate(name: str, config: dict[str, object]) -> None:
    source_path = SOURCE / str(config["source"])
    image = Image.open(source_path).convert("RGB").crop(config["crop"])
    image = ImageEnhance.Contrast(image).enhance(1.08)
    image = ImageEnhance.Sharpness(image).enhance(1.25)

    if config["mode"] == "dark":
        mask = dark_mask(image, int(config["threshold"]))
    elif config["mode"] == "colored":
        mask = colored_mask(image, int(config["saturation"]), int(config["dark"]))
    else:
        mask = background_mask(image, int(config["threshold"]))

    mask = keep_largest_components(mask, int(config.get("components", 1)))
    mask = soften(mask)
    image, mask = trim_to_mask(image, mask)

    image.thumbnail((840, 290), Image.Resampling.LANCZOS)
    mask = mask.resize(image.size, Image.Resampling.LANCZOS)

    rgba = image.convert("RGBA")
    rgba.putalpha(mask)

    canvas = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))
    canvas.alpha_composite(rgba, ((CANVAS_SIZE[0] - rgba.width) // 2, (CANVAS_SIZE[1] - rgba.height) // 2))

    png_path = TARGET / f"midway-{name}.png"
    webp_path = TARGET / f"midway-{name}.webp"
    canvas.save(png_path)
    canvas.save(webp_path, "WEBP", quality=88, method=6)

    alpha = canvas.getchannel("A")
    opaque = 0
    for y in range(alpha.height):
        for x in range(alpha.width):
            if alpha.getpixel((x, y)) > 8:
                opaque += 1
    ratio = opaque / (CANVAS_SIZE[0] * CANVAS_SIZE[1])
    print(f"{name}: {webp_path.relative_to(ROOT)} alpha_ratio={ratio:.3f}")


def main() -> None:
    TARGET.mkdir(parents=True, exist_ok=True)
    for name, config in ASSETS.items():
        generate(name, config)


if __name__ == "__main__":
    main()
