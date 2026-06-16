#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import math
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[2]


DEFAULT_THRESHOLDS: dict[str, float] = {
    "maxAlphaRatio": 0.62,
    "maxBboxRatio": 0.92,
    "maxCornerAlpha": 8,
    "maxDarkVisibleRatio": 0.55,
    "maxEdgeVisibleRatio": 0.04,
    "minLuminanceMean": 35,
    "minLuminanceStdDev": 8,
    "minOpaqueRatio": 0.008,
    "minShortSidePx": 48,
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Audit source-backed unit assets before an animation first draft."
    )
    parser.add_argument("--spec", required=True, type=Path, help="Tactical terrain / animation spec JSON.")
    parser.add_argument("--pipeline", type=Path, help="Optional production-pipeline.json for context.")
    parser.add_argument("--out", required=True, type=Path, help="Output artifact directory.")
    parser.add_argument("--strict", action="store_true", help="Exit non-zero when unit asset warnings are present.")
    return parser.parse_args()


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_text(path: Path, value: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(value, encoding="utf-8")


def project_path(path: Path | None) -> str | None:
    if path is None:
        return None
    try:
        return str(path.resolve().relative_to(ROOT))
    except ValueError:
        return str(path)


def resolve_project_path(value: str | None) -> Path | None:
    if not value:
        return None
    path = Path(value)
    return path if path.is_absolute() else ROOT / path


def normalize_source(source: Any) -> dict[str, Any]:
    if isinstance(source, str):
        return {"path": source}
    if isinstance(source, dict):
        return dict(source)
    return {"invalid": source}


def visible_bbox(alpha: Image.Image, threshold: int = 16) -> tuple[int, int, int, int] | None:
    return alpha.point(lambda value: 255 if value > threshold else 0).getbbox()


def image_stats(path: Path) -> dict[str, Any]:
    image = Image.open(path)
    image = ImageOps.exif_transpose(image).convert("RGBA")
    alpha = image.getchannel("A")
    width, height = image.size
    alpha_values = list(alpha.tobytes())
    bbox = visible_bbox(alpha)
    visible_count = 0
    opaque_count = 0
    dark_count = 0
    light_count = 0
    luminance_sum = 0.0
    luminance_square_sum = 0.0
    edge_values: list[int] = []
    row_counts = [0 for _ in range(height)]
    column_counts = [0 for _ in range(width)]

    for y in range(height):
        for x in range(width):
            value = alpha.getpixel((x, y))
            if value > 8:
                opaque_count += 1
            if value > 16:
                red, green, blue, _ = image.getpixel((x, y))
                luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722
                luminance_sum += luminance
                luminance_square_sum += luminance * luminance
                visible_count += 1
                row_counts[y] += 1
                column_counts[x] += 1
                if luminance < 32:
                    dark_count += 1
                if luminance > 232:
                    light_count += 1
            if x == 0 or y == 0 or x == width - 1 or y == height - 1:
                edge_values.append(value)

    if bbox:
        left, top, right, bottom = bbox
        bbox_width = right - left
        bbox_height = bottom - top
        bbox_area = max(1, bbox_width * bbox_height)
        bbox_record = [left, top, bbox_width, bbox_height]
        bbox_ratio = bbox_area / max(1, width * height)
        bbox_fill_ratio = opaque_count / bbox_area
    else:
        bbox_record = [0, 0, 0, 0]
        bbox_ratio = 0
        bbox_fill_ratio = 0

    luminance_mean = luminance_sum / visible_count if visible_count else 0
    luminance_variance = max(0.0, luminance_square_sum / visible_count - luminance_mean * luminance_mean) if visible_count else 0
    corner_alpha = [
        alpha.getpixel((0, 0)),
        alpha.getpixel((width - 1, 0)),
        alpha.getpixel((0, height - 1)),
        alpha.getpixel((width - 1, height - 1)),
    ]

    return {
        "alphaRatio": sum(alpha_values) / (255 * width * height),
        "bbox": bbox_record,
        "bboxFillRatio": bbox_fill_ratio,
        "bboxRatio": bbox_ratio,
        "cornerAlphaMax": max(corner_alpha),
        "darkVisibleRatio": dark_count / visible_count if visible_count else 1,
        "edgeVisibleRatio": sum(1 for value in edge_values if value > 8) / max(1, len(edge_values)),
        "fileSize": path.stat().st_size,
        "lightVisibleRatio": light_count / visible_count if visible_count else 0,
        "luminanceMean": luminance_mean,
        "luminanceStdDev": math.sqrt(luminance_variance),
        "maxColumnCoverage": max(column_counts) / height if height else 0,
        "maxRowCoverage": max(row_counts) / width if width else 0,
        "opaqueRatio": opaque_count / max(1, width * height),
        "size": [width, height],
        "visiblePixels": visible_count,
    }


def merge_thresholds(package: dict[str, Any], asset: dict[str, Any]) -> dict[str, float]:
    merged = dict(DEFAULT_THRESHOLDS)
    for source in (package.get("qualityThresholds") or {}, asset.get("qualityThresholds") or {}):
        for key, value in source.items():
            if isinstance(value, (int, float)):
                merged[key] = float(value)
    return merged


def validate_stats(stats: dict[str, Any], thresholds: dict[str, float]) -> list[str]:
    checks = {
        "alphaRatio": stats["alphaRatio"] <= thresholds["maxAlphaRatio"],
        "bboxRatio": stats["bboxRatio"] <= thresholds["maxBboxRatio"],
        "cornerAlphaMax": stats["cornerAlphaMax"] <= thresholds["maxCornerAlpha"],
        "darkVisibleRatio": stats["darkVisibleRatio"] <= thresholds["maxDarkVisibleRatio"],
        "edgeVisibleRatio": stats["edgeVisibleRatio"] <= thresholds["maxEdgeVisibleRatio"],
        "luminanceMean": thresholds["minLuminanceMean"] <= stats["luminanceMean"],
        "luminanceStdDev": stats["luminanceStdDev"] >= thresholds["minLuminanceStdDev"],
        "opaqueRatio": stats["opaqueRatio"] >= thresholds["minOpaqueRatio"],
        "shortSidePx": min(stats["size"]) >= thresholds["minShortSidePx"],
    }
    return [name for name, passed in checks.items() if not passed]


def warning(code: str, message: str, severity: str = "warn", **extra: Any) -> dict[str, Any]:
    record = {"code": code, "message": message, "severity": severity}
    record.update(extra)
    return record


def derive_unit_asset_ids(spec: dict[str, Any]) -> dict[str, list[str]]:
    mapping: dict[str, list[str]] = {}
    for unit_set in spec.get("unitSets") or []:
        unit_id = unit_set.get("id")
        asset_id = unit_set.get("assetId") or unit_set.get("unitAssetId")
        if unit_id and asset_id:
            mapping.setdefault(str(asset_id), []).append(str(unit_id))
    return mapping


def audit_asset(package: dict[str, Any], asset: dict[str, Any], unit_set_ids: list[str]) -> dict[str, Any]:
    asset_id = str(asset.get("id") or "unnamed-asset")
    warnings: list[dict[str, Any]] = []
    sources = [normalize_source(source) for source in asset.get("sources") or []]
    normalized_sources = []

    if not sources:
        warnings.append(warning("ASSET_SOURCE_MISSING", f"{asset_id} has no traceable source reference.", assetId=asset_id))
    for source in sources:
        source_path = resolve_project_path(source.get("path"))
        source_record = {
            **source,
            "exists": bool(source_path and source_path.exists()),
            "projectPath": project_path(source_path),
        }
        if not source.get("path"):
            warnings.append(warning("ASSET_SOURCE_PATH_MISSING", f"{asset_id} source lacks a local path.", assetId=asset_id))
        elif not source_record["exists"]:
            warnings.append(
                warning("ASSET_SOURCE_FILE_MISSING", f"{asset_id} source file is missing: {source.get('path')}", assetId=asset_id)
            )
        if not source.get("url") and not source.get("reference"):
            warnings.append(
                warning(
                    "ASSET_SOURCE_REFERENCE_INCOMPLETE",
                    f"{asset_id} source {source.get('path', '<unknown>')} has no URL/reference note.",
                    "info",
                    assetId=asset_id,
                )
            )
        if not source.get("license") and not source.get("licenseStatus"):
            warnings.append(
                warning(
                    "ASSET_LICENSE_UNDECLARED",
                    f"{asset_id} source {source.get('path', '<unknown>')} has no license status.",
                    "info",
                    assetId=asset_id,
                )
            )
        normalized_sources.append(source_record)

    runtime_path = resolve_project_path(asset.get("runtime") or asset.get("runtimeAsset"))
    candidate_paths = [resolve_project_path(value.get("path") if isinstance(value, dict) else value) for value in asset.get("candidateArtifacts") or []]
    candidate_records = [{"path": project_path(path), "exists": bool(path and path.exists())} for path in candidate_paths]
    stats: dict[str, Any] | None = None
    failed_gates: list[str] = []
    thresholds = merge_thresholds(package, asset)

    if not runtime_path:
        warnings.append(warning("ASSET_RUNTIME_PATH_MISSING", f"{asset_id} has no runtime asset path.", assetId=asset_id))
    elif not runtime_path.exists():
        warnings.append(warning("ASSET_RUNTIME_FILE_MISSING", f"{asset_id} runtime asset is missing: {asset.get('runtime')}", assetId=asset_id))
    else:
        try:
            stats = image_stats(runtime_path)
            failed_gates = validate_stats(stats, thresholds)
            if failed_gates:
                warnings.append(
                    warning(
                        "ASSET_VISUAL_GATES_FAILED",
                        f"{asset_id} failed unit asset visual gates: {', '.join(failed_gates)}.",
                        assetId=asset_id,
                        value={"failedGates": failed_gates},
                    )
                )
        except Exception as exc:  # noqa: BLE001 - report corrupt assets as package warnings.
            warnings.append(warning("ASSET_IMAGE_READ_FAILED", f"{asset_id} could not be inspected: {exc}", assetId=asset_id))

    if not unit_set_ids and asset.get("required", True):
        warnings.append(
            warning(
                "ASSET_NOT_MAPPED_TO_UNIT_SET",
                f"{asset_id} is declared but no unitSet maps to it.",
                "info",
                assetId=asset_id,
            )
        )

    if runtime_path and not runtime_path.exists() and any(record["exists"] for record in candidate_records):
        readiness = "candidate-review-required"
    elif not runtime_path or not runtime_path.exists() or any(item["severity"] == "warn" for item in warnings):
        readiness = "not-ready-for-high-quality-first-draft"
    elif any(item["severity"] == "info" for item in warnings):
        readiness = "draftable-with-source-disclosure"
    else:
        readiness = "runtime-ready"

    return {
        "asset": asset_id,
        "candidateArtifacts": candidate_records,
        "eraReference": asset.get("eraReference"),
        "faction": asset.get("faction"),
        "failedGates": failed_gates,
        "kind": asset.get("kind"),
        "readiness": readiness,
        "runtimeAsset": project_path(runtime_path),
        "runtimeExists": bool(runtime_path and runtime_path.exists()),
        "sources": normalized_sources,
        "stats": stats,
        "thresholds": thresholds,
        "toolchain": asset.get("toolchain") or package.get("toolchain") or [],
        "unitSetIds": unit_set_ids,
        "warnings": warnings,
    }


def checker_background(size: tuple[int, int]) -> Image.Image:
    image = Image.new("RGB", size, (234, 233, 225))
    draw = ImageDraw.Draw(image)
    for y in range(0, size[1], 20):
        for x in range(0, size[0], 20):
            if (x // 20 + y // 20) % 2:
                draw.rectangle((x, y, x + 19, y + 19), fill=(202, 208, 199))
    return image


def make_contact_sheet(records: list[dict[str, Any]], out_dir: Path) -> str | None:
    runtime_records = [record for record in records if record.get("runtimeExists") and record.get("runtimeAsset")]
    if not runtime_records:
        return None
    cell_w = 260
    cell_h = 230
    columns = min(4, max(1, len(runtime_records)))
    rows = math.ceil(len(runtime_records) / columns)
    margin = 18
    label_h = 44
    sheet = Image.new("RGB", (columns * cell_w + (columns + 1) * margin, rows * cell_h + (rows + 1) * margin), (26, 30, 30))
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()
    for index, record in enumerate(runtime_records):
        col = index % columns
        row = index // columns
        x = margin + col * (cell_w + margin)
        y = margin + row * (cell_h + margin)
        tile = checker_background((cell_w, cell_h - label_h)).convert("RGBA")
        image = Image.open(ROOT / record["runtimeAsset"]).convert("RGBA")
        image.thumbnail((cell_w - 34, cell_h - label_h - 24), Image.Resampling.LANCZOS)
        tile.alpha_composite(image, ((tile.width - image.width) // 2, (tile.height - image.height) // 2))
        sheet.paste(tile.convert("RGB"), (x, y))
        label_y = y + cell_h - label_h
        draw.rectangle((x, label_y, x + cell_w, y + cell_h), fill=(35, 41, 40))
        failed = ",".join(record.get("failedGates") or [])
        title = str(record["asset"])[:36]
        subtitle = f"{record['readiness']}" if not failed else f"fail: {failed[:24]}"
        draw.text((x + 10, label_y + 8), title, fill=(236, 232, 216), font=font)
        draw.text((x + 10, label_y + 25), subtitle[:38], fill=(190, 204, 190), font=font)
    path = out_dir / "contact-sheet.png"
    sheet.save(path)
    return project_path(path)


def classify_package(records: list[dict[str, Any]], warnings: list[dict[str, Any]]) -> dict[str, Any]:
    warn_count = sum(1 for item in warnings if item.get("severity") == "warn")
    info_count = sum(1 for item in warnings if item.get("severity") == "info")
    missing_runtime = [record["asset"] for record in records if not record.get("runtimeExists")]
    failed_visual = [record["asset"] for record in records if record.get("failedGates")]
    if missing_runtime or failed_visual or warn_count:
        status = "not-ready-for-high-quality-first-draft"
    elif info_count:
        status = "draftable-with-source-disclosure"
    else:
        status = "runtime-assets-ready"
    return {
        "failedVisualAssetIds": failed_visual,
        "infoCount": info_count,
        "missingRuntimeAssetIds": missing_runtime,
        "status": status,
        "warningCount": warn_count,
    }


def build_markdown(report: dict[str, Any]) -> str:
    lines = [
        f"# Unit Asset Package: {report['battle'].get('title') or report['battle'].get('id') or 'unknown'}",
        "",
        f"Generated: {report['generatedAt']}",
        f"Status: `{report['readiness']['status']}`",
        f"Contact sheet: `{report['artifactPolicy'].get('contactSheet') or 'none'}`",
        "",
        "## Toolchain Contract",
        "",
        *(f"- {item}" for item in report.get("toolchainContract") or []),
        "",
        "## Assets",
        "",
        "| asset | faction | kind | unit sets | readiness | failed gates |",
        "|---|---|---|---|---|---|",
    ]
    for record in report["assets"]:
        lines.append(
            "| {asset} | {faction} | {kind} | {unit_sets} | {readiness} | {failed} |".format(
                asset=record["asset"],
                faction=record.get("faction") or "",
                kind=record.get("kind") or "",
                unit_sets=", ".join(record.get("unitSetIds") or []),
                readiness=record["readiness"],
                failed=", ".join(record.get("failedGates") or []),
            )
        )
    lines.extend(["", "## Warnings", ""])
    if report["warnings"]:
        for item in report["warnings"]:
            lines.append(f"- {item['severity'].upper()} {item['code']}: {item['message']}")
    else:
        lines.append("- None")
    lines.append("")
    return "\n".join(lines) + "\n"


def main() -> None:
    args = parse_args()
    spec_path = args.spec.resolve()
    spec = read_json(spec_path)
    package = spec.get("unitAssetPackage") or {}
    out_dir = args.out.resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    asset_mapping = derive_unit_asset_ids(spec)
    warnings: list[dict[str, Any]] = []
    declared_assets = package.get("assets") or []
    if not declared_assets:
        warnings.append(
            warning(
                "UNIT_ASSET_PACKAGE_MISSING",
                "Spec has no unitAssetPackage.assets; animation first draft lacks source-backed unit asset contract.",
            )
        )
    for unit_set in spec.get("unitSets") or []:
        if not (unit_set.get("assetId") or unit_set.get("unitAssetId")):
            warnings.append(
                warning(
                    "UNIT_SET_ASSET_MAPPING_MISSING",
                    f"unitSet {unit_set.get('id', '<unknown>')} has no assetId/unitAssetId.",
                    unitSetId=unit_set.get("id"),
                )
            )

    records = [audit_asset(package, asset, asset_mapping.get(str(asset.get("id")), [])) for asset in declared_assets]
    for record in records:
        warnings.extend(record["warnings"])
    contact_sheet = make_contact_sheet(records, out_dir)
    readiness = classify_package(records, warnings)
    report = {
        "artifactPolicy": {
            "contactSheet": contact_sheet,
            "embedInChat": False,
            "saveArtifactsOnly": True,
        },
        "assets": records,
        "battle": spec.get("battle") or {},
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "pipelineContext": project_path(args.pipeline.resolve()) if args.pipeline else None,
        "readiness": readiness,
        "sourceSpec": project_path(spec_path),
        "stage": "unit-asset-production-layer",
        "toolchainContract": package.get("toolchainContract")
        or [
            "collect era-specific visual references and record local source paths plus license or uncertainty",
            "generate candidates into artifacts before runtime application",
            "inspect candidate contact sheets manually; do not embed screenshots in chat",
            "apply candidates to runtime assets only after alpha, texture, scale, and faction-readability gates pass",
            "record browser evidence after runtime assets enter the animation",
        ],
        "warnings": warnings,
    }
    write_json(out_dir / "unit-asset-package.json", report)
    write_text(out_dir / "unit-asset-package.md", build_markdown(report))
    print(
        json.dumps(
            {
                "artifactDir": str(out_dir),
                "assets": len(records),
                "readiness": readiness,
                "warnings": len(warnings),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    if args.strict and readiness["status"] != "runtime-assets-ready":
        raise SystemExit(2)


if __name__ == "__main__":
    main()
