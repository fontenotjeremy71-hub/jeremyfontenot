#!/usr/bin/env python3
"""Create public-safe Azure Arc case-study screenshots from private captures."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def redact(image: Image.Image, box: tuple[int, int, int, int], label: str = "REDACTED") -> None:
    draw = ImageDraw.Draw(image)
    draw.rectangle(box, fill="#f4f6f8", outline="#5d6b7a", width=2)
    font = ImageFont.load_default(size=16)
    left, top, right, bottom = box
    text_box = draw.textbbox((0, 0), label, font=font)
    text_width = text_box[2] - text_box[0]
    text_height = text_box[3] - text_box[1]
    draw.text(
        (left + max(8, (right - left - text_width) / 2), top + max(4, (bottom - top - text_height) / 2)),
        label,
        fill="#263442",
        font=font,
    )


def build(
    source_dir: Path,
    output_dir: Path,
    source_name: str,
    output_name: str,
    crop: tuple[int, int, int, int],
    redactions: list[tuple[int, int, int, int]],
) -> None:
    source = source_dir / source_name
    if not source.is_file():
        raise FileNotFoundError(source)

    with Image.open(source) as raw:
        image = raw.convert("RGB").crop(crop)
        for box in redactions:
            redact(image, box)
        output_dir.mkdir(parents=True, exist_ok=True)
        destination = output_dir / output_name
        image.save(destination, "PNG", optimize=True)
        print(f"{destination.name}\t{image.width}x{image.height}\t{destination.stat().st_size}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source_dir", type=Path)
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()

    jobs = [
        (
            "powershell-hvhost01-validation-raw.png",
            "powershell-hvhost01-arc-services-public.png",
            (128, 390, 1536, 860),
            [],
        ),
        (
            "proxmox-vmm01-summary-raw.png",
            "proxmox-vmm01-summary-public.png",
            (448, 108, 1888, 478),
            [(158, 254, 350, 310)],
        ),
        (
            "proxmox-hvhost01-summary-raw.png",
            "proxmox-hvhost01-summary-public.png",
            (448, 108, 1888, 478),
            [(158, 254, 350, 310)],
        ),
        (
            "windows-admin-center-connections-extension-raw.png",
            "windows-admin-center-arc-connections-public.png",
            (28, 92, 1890, 342),
            [(980, 52, 1286, 242)],
        ),
        (
            "windows-admin-center-azure-account-raw.png",
            "windows-admin-center-azure-account-public.png",
            (290, 75, 1250, 375),
            [(38, 100, 500, 145), (38, 201, 590, 245)],
        ),
        (
            "azure-resource-group-raw.png",
            "azure-resource-group-public.png",
            (230, 50, 1560, 610),
            [(455, 188, 780, 222)],
        ),
        (
            "vmm01-arc-overview-raw.png",
            "vmm01-arc-overview-public.png",
            (230, 50, 1875, 555),
            [(455, 272, 790, 305)],
        ),
        (
            "hvhost01-arc-overview-raw.png",
            "hvhost01-arc-overview-public.png",
            (230, 50, 1875, 555),
            [(455, 272, 790, 305)],
        ),
        (
            "vmm01-sql-extension-raw.png",
            "vmm01-sql-extension-public.png",
            (230, 50, 1890, 390),
            [],
        ),
        (
            "vmm01-sql-instance-overview-raw.png",
            "vmm01-sql-instance-overview-public.png",
            (230, 50, 1885, 855),
            [(375, 347, 715, 383)],
        ),
        (
            "vmm01-sql-dps-status-raw.png",
            "vmm01-sql-dps-status-public.png",
            (495, 45, 1415, 850),
            [],
        ),
    ]

    for source_name, output_name, crop, redactions in jobs:
        build(args.source_dir, args.output_dir, source_name, output_name, crop, redactions)


if __name__ == "__main__":
    main()
