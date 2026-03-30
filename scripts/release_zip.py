#!/usr/bin/env python3
from pathlib import Path
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PACKAGE_JSON = ROOT / "package.json"
version = json.loads(PACKAGE_JSON.read_text(encoding="utf-8"))["version"]
OUT = ROOT.parent / f'{ROOT.name}-release-{version}.zip'

EXCLUDE_DIRS = {'.git', 'node_modules', '__pycache__'}
EXCLUDE_FILES = {OUT.name}

with zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED) as zf:
    for path in ROOT.rglob('*'):
        if any(part in EXCLUDE_DIRS for part in path.parts):
            continue
        if path.name in EXCLUDE_FILES:
            continue
        arcname = Path(ROOT.name) / path.relative_to(ROOT)
        zf.write(path, arcname)

print(f'Created {OUT}')
