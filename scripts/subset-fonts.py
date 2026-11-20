#!/usr/bin/env python3
"""Subset the vendored Resolución fonts to the codepoints the site actually renders.

The full Geist Mono/Pixel files are 233 KB; the subset is ~87 KB (-63%) with byte-identical
advances for every kept glyph, so the metrics-matched fallback in src/styles/tokens.css keeps
working. Run this whenever public/fonts/*.woff2 changes and commit the result.

    python3 -m venv /tmp/ftvenv && /tmp/ftvenv/bin/pip install fonttools brotli
    /tmp/ftvenv/bin/python scripts/subset-fonts.py

Reads the ranges from scripts/font-subset.json (also read by tests/font-coverage.test.ts) and
fails when the subset would drop a glyph the original had or move an advance.
"""

import json
import pathlib
import shutil
import subprocess
import sys
import tempfile

from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONTS = ROOT / "public" / "fonts"
CONFIG = json.loads((ROOT / "scripts" / "font-subset.json").read_text("utf-8"))
UNICODES = CONFIG["unicodes"]


def codepoints(spec: str) -> set[int]:
    points: set[int] = set()
    for part in spec.split(","):
        start, _, end = part.strip().replace("U+", "").partition("-")
        points |= set(range(int(start, 16), int(end or start, 16) + 1))
    return points


def load(path: pathlib.Path):
    font = TTFont(path)
    return font, dict(font.getBestCmap())


def main() -> int:
    pyftsubset = shutil.which("pyftsubset") or "/tmp/ftvenv/bin/pyftsubset"
    wanted = codepoints(UNICODES)
    before = after = 0
    ok = True
    with tempfile.TemporaryDirectory() as tmp:
        for src in sorted(FONTS.glob("*.woff2")):
            dst = pathlib.Path(tmp) / src.name
            subprocess.run(
                [pyftsubset, str(src), f"--output-file={dst}", "--flavor=woff2",
                 f"--unicodes={UNICODES}", "--layout-features=*", "--no-hinting"],
                check=True,
                capture_output=True,
            )
            original, original_cmap = load(src)
            subset, subset_cmap = load(dst)
            dropped = sorted((wanted & set(original_cmap)) - set(subset_cmap))
            kept = [cp for cp in subset_cmap if cp in original_cmap]
            drift = [
                hex(cp)
                for cp in kept
                if original["hmtx"][original_cmap[cp]][0] != subset["hmtx"][subset_cmap[cp]][0]
            ]
            before += src.stat().st_size
            after += dst.stat().st_size
            print(
                f"{src.name:30} {src.stat().st_size:>7} -> {dst.stat().st_size:>6}  "
                f"glyphs {len(original_cmap):>4}->{len(subset_cmap):>3}  "
                f"dropped={len(dropped)} advance_drift={len(drift)}"
            )
            if dropped or drift:
                ok = False
                print(f"  dropped={dropped[:10]} drift={drift[:10]}", file=sys.stderr)
            else:
                shutil.move(dst, src)
    print(f"total {before} -> {after} bytes ({(after - before) / before:+.1%})")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
