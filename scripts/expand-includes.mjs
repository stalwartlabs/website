#!/usr/bin/env node
/**
 * Inline shared partials into the docs that include them, in place.
 *
 * Source of truth: sibling `_<name>.md` files. The leading underscore makes
 * Astro's content collection loader ignore them, so they never become docs
 * pages of their own.
 *
 * Consumer files reference a partial by wrapping a region with paired
 * markers (HTML comments in `.md`, MDX-style braced comments in `.mdx`):
 *
 *     <!-- include:setup-wizard -->
 *       (regenerated from sibling _setup-wizard.md)
 *     <!-- /include:setup-wizard -->
 *
 * The script searches for partials relative to the consumer file: it walks
 * up the directory tree looking for a `_<name>.md`. The first match wins,
 * so the same marker can mean different things in different sections of
 * the site.
 *
 * The marker pair is preserved on every run, so the expansion is
 * idempotent: edit a partial, re-run the script, and every page that
 * references it picks up the change.
 *
 * Usage:
 *   node scripts/expand-includes.mjs              # rewrite in place
 *   node scripts/expand-includes.mjs --dry-run    # report what would change
 *   node scripts/expand-includes.mjs --check      # exit 1 if anything is stale
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = path.join(ROOT, "src/content/docs/docs");

const args = new Set(process.argv.slice(2));
const DRY = args.has("--dry-run");
const CHECK = args.has("--check");

const MARKER_HTML =
  /<!--\s*include:([\w./-]+)\s*-->[\s\S]*?<!--\s*\/include:\1\s*-->/g;
const MARKER_MDX =
  /\{\/\*\s*include:([\w./-]+)\s*\*\/\}[\s\S]*?\{\/\*\s*\/include:\1\s*\*\/\}/g;

const partialsCache = new Map();

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function findPartial(consumerDir, name) {
  let dir = consumerDir;
  while (true) {
    const candidate = path.join(dir, `_${name}.md`);
    if (await exists(candidate)) {
      if (!partialsCache.has(candidate)) {
        partialsCache.set(candidate, (await fs.readFile(candidate, "utf8")).trim());
      }
      return { path: candidate, content: partialsCache.get(candidate) };
    }
    const parent = path.dirname(dir);
    if (parent === dir || !dir.startsWith(DOCS)) return null;
    dir = parent;
  }
}

async function walk(dir, out = []) {
  for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
    if (ent.name.startsWith(".")) continue;
    if (ent.name === "node_modules") continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) await walk(full, out);
    else if (/\.mdx?$/.test(ent.name)) out.push(full);
  }
  return out;
}

let touched = 0;
let stale = 0;
let unknownPartials = new Set();

async function processFile(file) {
  const original = await fs.readFile(file, "utf8");
  const isMdx = file.endsWith(".mdx");
  const dir = path.dirname(file);
  let next = original;

  const re = isMdx ? MARKER_MDX : MARKER_HTML;
  const open = (n) =>
    isMdx ? `{/* include:${n} */}` : `<!-- include:${n} -->`;
  const close = (n) =>
    isMdx ? `{/* /include:${n} */}` : `<!-- /include:${n} -->`;

  // We also support consumers that haven't been wrapped yet but use the
  // marker placeholders alone; those are treated as empty regions.
  const replacements = [];
  let m;
  re.lastIndex = 0;
  while ((m = re.exec(next)) !== null) {
    replacements.push({ start: m.index, end: m.index + m[0].length, name: m[1] });
  }

  if (replacements.length === 0) return;

  // Build the new content from right to left so indices stay valid.
  for (const r of replacements.reverse()) {
    const partial = await findPartial(dir, r.name);
    if (!partial) {
      unknownPartials.add(r.name);
      continue;
    }
    const block =
      `${open(r.name)}\n${partial.content}\n${close(r.name)}`;
    next = next.slice(0, r.start) + block + next.slice(r.end);
  }

  if (next !== original) {
    if (CHECK) stale++;
    if (!DRY && !CHECK) await fs.writeFile(file, next);
    if (DRY) console.log(`[dry-run] ${path.relative(ROOT, file)}: would update`);
    else if (CHECK)
      console.log(`[stale]   ${path.relative(ROOT, file)}`);
    else console.log(`updated:  ${path.relative(ROOT, file)}`);
    touched++;
  }
}

const files = await walk(DOCS);
for (const f of files) await processFile(f);

console.log("");
console.log(`partials cached: ${partialsCache.size}`);
console.log(`files touched:   ${touched}`);
if (unknownPartials.size > 0) {
  console.log("");
  console.log("Unknown partial names referenced by include markers:");
  for (const n of [...unknownPartials].sort()) console.log(`  - ${n}`);
}

if (CHECK && stale > 0) {
  console.error("");
  console.error(`${stale} file(s) are out of sync with their partials.`);
  console.error("Run 'npm run includes' to regenerate.");
  process.exit(1);
}
