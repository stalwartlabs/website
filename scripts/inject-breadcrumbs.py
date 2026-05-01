#!/usr/bin/env python3
"""
Inject WebUI breadcrumbs into documentation pages.

For every object in the schema reference (`src/content/docs/docs/ref/object/*.md`),
the page starts with a line of the form:

    This object can be configured from the [WebUI](...) under <svg ...>...

This script extracts everything after "under " for each object, then scans
every Markdown / MDX file under `src/content/docs/docs/` (excluding the
archived `0.15/` snapshot and the `ref/` subtree itself) for paired markers
of the form:

    <!-- breadcrumb:Name --><!-- /breadcrumb:Name -->          (in .md)
    {/* breadcrumb:Name */}{/* /breadcrumb:Name */}           (in .mdx)

and replaces the content **between** the two comments with the current
breadcrumb for that object. The markers themselves are preserved, so the
rewrite is idempotent: running the script again after a schema change
updates every consumer page in one go.

When the consumer file is `.mdx` the script also rewrites the SVG attributes
inside the breadcrumb HTML to camelCase (`stroke-width` -> `strokeWidth`)
so they parse as JSX.

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
DOCS = REPO_ROOT / "src" / "content" / "docs" / "docs"
REF_OBJECT = DOCS / "ref" / "object"

# The breadcrumb line in each ref/object/*.md page.
BREADCRUMB_LINE_RE = re.compile(
    r'^This object can be configured from the \[WebUI\]\([^)]+\) under (.+?)\s*$',
    re.MULTILINE,
)

# Schema-generated pages concatenate breadcrumbs for objects accessible from
# multiple WebUI locations without a separator, e.g.
# "Settings › Network › Services<svg>...Settings › Network › General".
# A new breadcrumb always starts with `<svg` directly preceded by the
# previous breadcrumb's trailing text (no whitespace), while `<svg` tags
# inside the same breadcrumb are always preceded by ` › `. We split on that
# boundary.
INTER_BREADCRUMB_RE = re.compile(r'(?<=\S)(?=<svg)')
BREADCRUMB_SEPARATOR = ", "

# Object name comes from the frontmatter `title:` field.
TITLE_RE = re.compile(r'^title:\s*(\S+)\s*$', re.MULTILINE)

# Marker pair in consumer pages. Two flavours:
#   .md  -> <!-- breadcrumb:Name --> ... <!-- /breadcrumb:Name -->
#   .mdx -> {/* breadcrumb:Name */} ... {/* /breadcrumb:Name */}
MARKER_HTML = re.compile(
    r'<!--\s*breadcrumb:(\w+)\s*-->(.*?)<!--\s*/breadcrumb:\1\s*-->',
    re.DOTALL,
)
MARKER_MDX = re.compile(
    r'\{/\*\s*breadcrumb:(\w+)\s*\*/\}(.*?)\{/\*\s*/breadcrumb:\1\s*\*/\}',
    re.DOTALL,
)

# Directories under DOCS that the script should not touch.
EXCLUDED_DIR_PARTS = {"ref"}
EXCLUDED_VERSION_DIRS = re.compile(r"^\d+\.\d+")  # 0.15, 1.0, ...

# Kebab-case SVG attributes that need to become camelCase in MDX/JSX.
SVG_KEBAB_ATTRS = (
    "stroke-width",
    "stroke-linecap",
    "stroke-linejoin",
    "stroke-dasharray",
    "stroke-dashoffset",
    "stroke-miterlimit",
    "fill-rule",
    "clip-rule",
    "fill-opacity",
    "stroke-opacity",
    "text-anchor",
    "font-family",
    "font-size",
    "font-weight",
)


def kebab_to_camel(name: str) -> str:
    head, *rest = name.split("-")
    return head + "".join(p.capitalize() for p in rest)


def to_mdx_safe(html: str) -> str:
    out = html
    for attr in SVG_KEBAB_ATTRS:
        out = re.sub(rf"\b{re.escape(attr)}=", kebab_to_camel(attr) + "=", out)
    return out


def load_breadcrumbs() -> dict[str, str]:
    """Return a mapping of object-name -> breadcrumb HTML."""
    mapping: dict[str, str] = {}
    no_title = no_breadcrumb = 0
    if not REF_OBJECT.is_dir():
        print(f"warning: schema reference dir not found: {REF_OBJECT}",
              file=sys.stderr)
        return mapping
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
        print(f"(skipped {no_breadcrumb} ref file(s) with no breadcrumb line)",
              file=sys.stderr)
    return mapping


def should_scan(path: Path) -> bool:
    try:
        rel = path.relative_to(DOCS)
    except ValueError:
        return False
    parts = rel.parts
    if not parts:
        return False
    if parts[0] in EXCLUDED_DIR_PARTS:
        return False
    if EXCLUDED_VERSION_DIRS.match(parts[0]):
        return False
    return True


def rewrite(text: str, breadcrumbs: dict[str, str], clear: bool,
            unknown: set[str], is_mdx: bool) -> tuple[str, int]:
    count = 0
    pattern = MARKER_MDX if is_mdx else MARKER_HTML
    open_tpl = "{{/* breadcrumb:{name} */}}" if is_mdx else "<!-- breadcrumb:{name} -->"
    close_tpl = "{{/* /breadcrumb:{name} */}}" if is_mdx else "<!-- /breadcrumb:{name} -->"

    def repl(m: re.Match) -> str:
        nonlocal count
        name = m.group(1)
        opener = open_tpl.format(name=name)
        closer = close_tpl.format(name=name)
        if clear:
            rebuilt = opener + closer
        else:
            new_bc = breadcrumbs.get(name)
            if new_bc is None:
                unknown.add(name)
                return m.group(0)
            payload = to_mdx_safe(new_bc) if is_mdx else new_bc
            rebuilt = opener + payload + closer
        if rebuilt != m.group(0):
            count += 1
        return rebuilt

    return pattern.sub(repl, text), count


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
        print(f"Loaded breadcrumbs for {len(breadcrumbs)} objects.",
              file=sys.stderr)

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
        new_text, count = rewrite(
            original, breadcrumbs, opts.clear, unknown_objects,
            is_mdx=f.suffix == ".mdx",
        )
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
