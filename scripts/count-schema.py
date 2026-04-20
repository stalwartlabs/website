#!/usr/bin/env python3
"""
Count schema surface metrics for the Stalwart documentation:

  - configuration objects (total, singletons, non-singletons)
  - total fields (every `##### ` heading across docs/ref/object/*.md,
    which includes top-level fields for every variant of a multi-variant
    object plus every nested-type field)
  - UI screens (one form per singleton, one form + one list per non-
    singleton object)
  - permissions, metrics, and event types declared on the reference pages

Usage:
    python3 scripts/count-schema.py
"""
from __future__ import annotations

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
REF_ROOT = REPO_ROOT / "docs" / "ref"


def count_object_files() -> list[Path]:
    return sorted((REF_ROOT / "object").glob("*.md"))


def count_singletons_and_objects(index_text: str) -> tuple[int, int]:
    singletons = objects = 0
    for m in re.finditer(
        r'^\|\s*\[[^\]]+\]\([^)]+\)\s*\|\s*([^|]+?)\s*\|',
        index_text, re.MULTILINE,
    ):
        kind = m.group(1).strip()
        if "Singleton" in kind:
            singletons += 1
        elif "Object" in kind:
            objects += 1
    return singletons, objects


def count_fields(obj_files: list[Path]) -> int:
    pattern = re.compile(r'^#####\s+`', re.MULTILINE)
    return sum(len(pattern.findall(f.read_text())) for f in obj_files)


def count_table_rows(path: Path) -> int:
    """Count data rows across every markdown table in the file."""
    text = path.read_text()
    row_lines = 0
    separator_lines = 0
    for line in text.splitlines():
        if not line.startswith("|"):
            continue
        if re.match(r'^\|\s*[-:| ]+\|\s*$', line):
            separator_lines += 1
            continue
        row_lines += 1
    # Each separator sits immediately under its header row; subtract one
    # header per table so the result counts only data rows.
    return row_lines - separator_lines


def count_permissions(path: Path) -> int:
    """Permissions are listed as `- **`name`**: description` bullets."""
    return len(re.findall(r'^- \*\*`', path.read_text(), re.MULTILINE))


def main() -> None:
    obj_files = count_object_files()
    total_objects = len(obj_files)

    index_text = (REF_ROOT / "index.md").read_text()
    singletons, non_singleton_objects = count_singletons_and_objects(index_text)

    total_fields = count_fields(obj_files)
    ui_screens = singletons + 2 * non_singleton_objects

    permissions = count_permissions(REF_ROOT / "permissions.md")
    metrics = count_table_rows(REF_ROOT / "metrics.md")
    events = count_table_rows(REF_ROOT / "events.md")

    print(f"Object files              : {total_objects}")
    print(f"  Singletons              : {singletons}")
    print(f"  Objects (non-singleton) : {non_singleton_objects}")
    print(f"Fields (##### headings)   : {total_fields}")
    print(f"UI screens (forms + lists): {ui_screens}")
    print(f"  = {singletons} singleton forms + {non_singleton_objects} * 2 (form + list per object)")
    print(f"Permissions               : {permissions}")
    print(f"Metrics                   : {metrics}")
    print(f"Events                    : {events}")


if __name__ == "__main__":
    main()
