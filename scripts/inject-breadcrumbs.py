#!/usr/bin/env python3
"""
Inject WebUI breadcrumbs into documentation pages.

For every object in the schema reference (`docs/ref/object/*.md`), the page
starts with a line of the form:

    This object can be configured from the [WebUI](...) under <svg ...>...

This script extracts everything after "under " for each object, then scans
every markdown / MDX file under `docs/` (excluding `docs/ref/`) for paired
markers of the form:

    <!-- breadcrumb:Name --><!-- /breadcrumb:Name -->

and replaces the content **between** the two comments with the current
breadcrumb for that object. The markers themselves are preserved, so the
rewrite is idempotent: running the script again after a schema change
updates every consumer page in one go.

Usage:
    python3 scripts/inject-breadcrumbs.py              # rewrite in place
    python3 scripts/inject-breadcrumbs.py --dry-run    # report only
    python3 scripts/inject-breadcrumbs.py --clear      # empty every marker
                                                         (useful before a
                                                         clean rebuild)
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DOCS = REPO_ROOT / "docs"
REF_OBJECT = DOCS / "ref" / "object"

# The breadcrumb line in each ref/object/*.md page.
BREADCRUMB_LINE_RE = re.compile(
    r'^This object can be configured from the \[WebUI\]\([^)]+\) under (.+?)\s*$',
    re.MULTILINE,
)

# For objects with more than one WebUI location the schema concatenates the
# breadcrumbs without a separator, so "Settings › Network › Services" and
# "Settings › Network › General" end up looking like a single garbled chain.
# A new breadcrumb always starts with `<svg` directly preceded by the previous
# breadcrumb's trailing text (no whitespace), while `<svg` tags inside the
# same breadcrumb are always preceded by ` › `. We split on that boundary.
INTER_BREADCRUMB_RE = re.compile(r'(?<=\S)(?=<svg)')
BREADCRUMB_SEPARATOR = ", "

# Object name comes from the frontmatter `title:` field.
TITLE_RE = re.compile(r'^title:\s*(\S+)\s*$', re.MULTILINE)

# Marker pair in consumer pages.
MARKER_RE = re.compile(
    r'<!--\s*breadcrumb:(\w+)\s*-->(.*?)<!--\s*/breadcrumb:\1\s*-->',
    re.DOTALL,
)

EXCLUDE_PARTS = {"versioned_docs", "node_modules", "build", ".docusaurus"}


def load_breadcrumbs() -> dict[str, str]:
    """Return a mapping of object-name -> breadcrumb HTML."""
    mapping: dict[str, str] = {}
    no_title = no_breadcrumb = 0
    for f in sorted(REF_OBJECT.glob("*.md")):
        text = f.read_text(encoding="utf-8", errors="replace")
        title_m = TITLE_RE.search(text)
        if not title_m:
            no_title += 1
            continue
        name = title_m.group(1).strip()
        bc_m = BREADCRUMB_LINE_RE.search(text)
        if not bc_m:
            no_breadcrumb += 1
            continue
        raw = bc_m.group(1).strip()
        parts = [p.strip() for p in INTER_BREADCRUMB_RE.split(raw) if p.strip()]
        mapping[name] = BREADCRUMB_SEPARATOR.join(parts)
    if no_title:
        print(f"(skipped {no_title} ref file(s) with no title)", file=sys.stderr)
    if no_breadcrumb:
        print(f"(skipped {no_breadcrumb} ref file(s) with no breadcrumb line)", file=sys.stderr)
    return mapping


def should_scan(path: Path) -> bool:
    try:
        rel = path.relative_to(DOCS)
    except ValueError:
        return False
    if rel.parts and rel.parts[0] == "ref":
        return False
    return not any(part in EXCLUDE_PARTS for part in rel.parts)


def rewrite(text: str, breadcrumbs: dict[str, str], clear: bool,
            unknown: set[str]) -> tuple[str, int]:
    count = 0

    def repl(m: re.Match) -> str:
        nonlocal count
        name = m.group(1)
        if clear:
            rebuilt = f"<!-- breadcrumb:{name} --><!-- /breadcrumb:{name} -->"
        else:
            new_bc = breadcrumbs.get(name)
            if new_bc is None:
                unknown.add(name)
                return m.group(0)
            rebuilt = f"<!-- breadcrumb:{name} -->{new_bc}<!-- /breadcrumb:{name} -->"
        if rebuilt != m.group(0):
            count += 1
        return rebuilt

    return MARKER_RE.sub(repl, text), count


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--dry-run", action="store_true",
                    help="Report what would change without writing")
    ap.add_argument("--clear", action="store_true",
                    help="Empty the content between every marker pair "
                         "(useful before a clean rebuild); schema is ignored")
    opts = ap.parse_args()

    breadcrumbs = {} if opts.clear else load_breadcrumbs()
    if not opts.clear:
        print(f"Loaded breadcrumbs for {len(breadcrumbs)} objects.", file=sys.stderr)

    total_files = touched_files = total_replacements = 0
    unknown_objects: set[str] = set()

    candidates: list[Path] = []
    for ext in ("*.md", "*.mdx"):
        candidates.extend(DOCS.rglob(ext))

    for f in sorted(set(candidates)):
        if not should_scan(f):
            continue
        total_files += 1
        original = f.read_text(encoding="utf-8", errors="replace")
        new_text, count = rewrite(original, breadcrumbs, opts.clear, unknown_objects)
        if count == 0:
            continue
        touched_files += 1
        total_replacements += count
        rel = f.relative_to(REPO_ROOT)
        if opts.dry_run:
            print(f"[dry-run] {rel}: {count} replacement(s)")
        else:
            f.write_text(new_text, encoding="utf-8")
            print(f"{rel}: {count} replacement(s)")

    print("", file=sys.stderr)
    print(f"Scanned files: {total_files}", file=sys.stderr)
    print(f"Touched files: {touched_files}", file=sys.stderr)
    print(f"Replacements : {total_replacements}", file=sys.stderr)
    if unknown_objects:
        print("", file=sys.stderr)
        print("Objects referenced by breadcrumb markers but missing in the schema:",
              file=sys.stderr)
        for name in sorted(unknown_objects):
            print(f"  - {name}", file=sys.stderr)


if __name__ == "__main__":
    main()
