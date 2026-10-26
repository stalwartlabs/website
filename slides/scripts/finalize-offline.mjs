#!/usr/bin/env node
/*
 * Finalises the offline bundle:
 *
 *   1. Rewrites absolute image URLs ("/images/slides/...") to relative
 *      ones ("./images/slides/...") so the bundle works under file://
 *      and from any web-server path. The deck source uses absolute URLs
 *      so the live site can serve them at the URL root via Astro; that
 *      breaks under file://, so we fix it post-build for the offline
 *      output only.
 *
 *   2. Drops in tiny `serve.sh` / `serve.bat` helpers so the recipient
 *      can launch a local HTTP server with one command. Browsers refuse
 *      to load JS modules from file:// URLs for security reasons, so
 *      the deck must be served over HTTP, even locally.
 *
 *   3. Drops a README.txt next to them so the recipient knows what to
 *      do without ever seeing this script.
 *
 * Run: node scripts/finalize-offline.mjs <dist-dir>
 */

import { readdirSync, readFileSync, writeFileSync, statSync, chmodSync } from "node:fs";
import { join, extname } from "node:path";

const dir = process.argv[2];
if (!dir) {
  console.error("usage: finalize-offline.mjs <dist-dir>");
  process.exit(2);
}

// ---------------------------------------------------------------------------
// 1. Rewrite absolute /images/slides/ URLs to relative ./images/slides/ URLs
// ---------------------------------------------------------------------------

const TEXT_EXT = new Set([".html", ".js", ".mjs", ".cjs", ".css", ".json", ".svg", ".txt"]);
const NEEDLE = '"/images/slides/';
const REPLACEMENT = '"./images/slides/';

let touched = 0;
let total = 0;

function walk(d) {
  for (const name of readdirSync(d)) {
    const p = join(d, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (TEXT_EXT.has(extname(p))) {
      const before = readFileSync(p, "utf8");
      total++;
      if (!before.includes(NEEDLE)) continue;
      writeFileSync(p, before.split(NEEDLE).join(REPLACEMENT));
      touched++;
    }
  }
}
walk(dir);
console.log(`paths: rewrote ${NEEDLE}-prefixed URLs in ${touched}/${total} text files`);

// ---------------------------------------------------------------------------
// 2. Write serve helpers
// ---------------------------------------------------------------------------

const SERVE_SH = `#!/bin/sh
# Serve this presentation on http://localhost:8000.
# Browsers block JavaScript modules over file:// for security reasons,
# so the bundle has to be served over HTTP even locally.

cd "$(dirname "$0")"

if command -v python3 >/dev/null 2>&1; then
  echo "Serving on http://localhost:8000  (press Ctrl-C to stop)"
  python3 -m http.server 8000
elif command -v python >/dev/null 2>&1; then
  echo "Serving on http://localhost:8000  (press Ctrl-C to stop)"
  python -m http.server 8000
else
  echo "Python is not installed."
  echo "Install Python from https://www.python.org/, or run any other"
  echo "static web server in this directory and open it in a browser."
  exit 1
fi
`;

const SERVE_BAT = `@echo off
REM Serve this presentation on http://localhost:8000.
REM Browsers block JavaScript modules over file:// for security reasons,
REM so the bundle has to be served over HTTP even locally.

cd /d "%~dp0"

where python >nul 2>nul
if %errorlevel%==0 (
  echo Serving on http://localhost:8000  ^(press Ctrl-C to stop^)
  python -m http.server 8000
  goto :eof
)

where py >nul 2>nul
if %errorlevel%==0 (
  echo Serving on http://localhost:8000  ^(press Ctrl-C to stop^)
  py -3 -m http.server 8000
  goto :eof
)

echo Python is not installed.
echo Install Python from https://www.python.org/, or run any other
echo static web server in this directory and open it in a browser.
pause
exit /b 1
`;

const README = `Stalwart presentation
=====================

This folder is a self-contained Stalwart deck (no internet required).

How to view it
--------------

  macOS / Linux:    ./serve.sh
  Windows:          double-click serve.bat

Then open http://localhost:8000 in a browser.

To stop the server: press Ctrl-C in the terminal.
`;

function write(file, content, executable = false) {
  const path = join(dir, file);
  writeFileSync(path, content);
  if (executable) chmodSync(path, 0o755);
  console.log(`wrote ${path}`);
}

write("serve.sh", SERVE_SH, true);
write("serve.bat", SERVE_BAT);
write("README.txt", README);
