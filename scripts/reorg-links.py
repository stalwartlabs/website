#!/usr/bin/env python3
"""
Rewrite internal links after the v0.16 documentation reorganisation.

Idempotent: running twice produces the same result as running once.

Usage:
    python3 scripts/reorg-links.py            # rewrite in place
    python3 scripts/reorg-links.py --dry-run  # report what would change
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DOCS_ROOT = REPO_ROOT / "docs"

MAPPINGS: list[tuple[str, str]] = [
    # Email settings moved into docs/email/settings/
    ("/docs/email/imap",               "/docs/email/settings/imap"),
    ("/docs/email/jmap",               "/docs/email/settings/jmap"),
    ("/docs/email/ratelimit",          "/docs/email/settings/ratelimit"),
    ("/docs/email/maintenance",        "/docs/email/settings/maintenance"),
    # Principals decomposed
    ("/docs/auth/principals/api-key",      "/docs/auth/authentication/api-key"),
    ("/docs/auth/principals/oauth-client", "/docs/auth/oauth/oauth-client"),
    ("/docs/auth/principals/domain",       "/docs/domains/overview"),
    ("/docs/auth/principals/list",         "/docs/email/management/mailing-lists"),
    # WebUI restructure
    ("/docs/management/webui/selfservice", "/docs/management/webui/account-manager"),
    ("/docs/management/webui/update",      "/docs/applications/update"),
    # Management: maintenance subsection
    ("/docs/management/database",          "/docs/management/maintenance/database"),
    ("/docs/management/migration",         "/docs/management/maintenance/migration"),
    # DNS resolver moved under server/dns/
    ("/docs/mta/outbound/dns",             "/docs/server/dns/resolver"),
    # Fallback administrator concept removed, replaced by recovery administrator
    ("/docs/auth/authorization/administrator#fallback-administrator",
     "/docs/configuration/recovery-mode#recovery-administrator"),
    ("/docs/auth/authorization/administrator#best-practices",
     "/docs/configuration/recovery-mode#recovery-administrator"),
    ("/docs/auth/authorization/administrator#key-characteristics",
     "/docs/configuration/recovery-mode#recovery-administrator"),
]

EXCLUDE_RELATIVE = {Path("ref")}
EXCLUDE_ANY_PART = {"versioned_docs", "node_modules", "build", ".docusaurus"}


def should_scan(path: Path) -> bool:
    try:
        rel = path.relative_to(DOCS_ROOT)
    except ValueError:
        return False
    for ex in EXCLUDE_RELATIVE:
        if rel == ex or ex in rel.parents:
            return False
    return not any(part in EXCLUDE_ANY_PART for part in rel.parts)


def rewrite(text: str) -> tuple[str, list[tuple[str, str]]]:
    changes: list[tuple[str, str]] = []
    for old, new in MAPPINGS:
        pattern = re.compile(re.escape(old) + r'(?=[\s)#"\'>]|$|/[^a-z0-9_-])')
        def repl(m: re.Match) -> str:
            changes.append((old, new))
            return new
        text = pattern.sub(repl, text)
    return text, changes


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--dry-run", action="store_true",
                    help="Report changes without writing to files")
    opts = ap.parse_args()

    total_files = 0
    touched_files = 0
    total_rewrites = 0
    per_mapping: dict[tuple[str, str], int] = {m: 0 for m in MAPPINGS}

    for md in sorted(DOCS_ROOT.rglob("*.md")):
        if not should_scan(md):
            continue
        total_files += 1
        original = md.read_text(encoding="utf-8", errors="replace")
        rewritten, changes = rewrite(original)
        if not changes:
            continue
        touched_files += 1
        total_rewrites += len(changes)
        for ch in changes:
            per_mapping[ch] = per_mapping.get(ch, 0) + 1
        rel = md.relative_to(REPO_ROOT)
        if opts.dry_run:
            print(f"[dry-run] {rel}: {len(changes)} rewrite(s)")
        else:
            md.write_text(rewritten, encoding="utf-8")
            print(f"{rel}: {len(changes)} rewrite(s)")

    print()
    print(f"Scanned files : {total_files}")
    print(f"Touched files : {touched_files}")
    print(f"Rewrites      : {total_rewrites}")
    print()
    print("Per-mapping counts:")
    for (old, new), count in per_mapping.items():
        print(f"  {count:4d}  {old}  ->  {new}")


if __name__ == "__main__":
    main()
