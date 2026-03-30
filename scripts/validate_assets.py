#!/usr/bin/env python3
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / 'assets' / 'data' / 'worlds' / 'wuxia'
REQUIRED = [
    'world.json', 'maps.json', 'events.json', 'npcs.json',
    'itemLibrary.json', 'equipmentLibrary.json', 'skills.json', 'enemies.json', 'announcements.json'
]


def main() -> int:
    missing = [name for name in REQUIRED if not (DATA_DIR / name).exists()]
    if missing:
        print('Missing files:', ', '.join(missing))
        return 1

    for name in REQUIRED:
        path = DATA_DIR / name
        try:
            with path.open('r', encoding='utf-8') as f:
                json.load(f)
        except Exception as exc:
            print(f'JSON validation failed: {path} -> {exc}')
            return 1

    print('Validation passed: all wuxia data files are valid JSON.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
