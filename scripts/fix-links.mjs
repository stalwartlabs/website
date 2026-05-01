#!/usr/bin/env node
/* Strip .md/.mdx suffix from internal markdown links so Starlight can resolve them. */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARGETS = ["src/content/docs/docs", "src/content/docs/blog"].map((p) =>
  path.join(ROOT, p),
);

let edited = 0;
let totalReplacements = 0;

async function walk(dir, out = []) {
  for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) await walk(full, out);
    else if (/\.mdx?$/.test(ent.name)) out.push(full);
  }
  return out;
}

async function fixFile(file) {
  const original = await fs.readFile(file, "utf8");
  let text = original;

  // Markdown link target: ](/docs/.../foo.md) or ](/docs/.../foo.md#anchor)
  text = text.replace(
    /\]\((\/(?:docs|blog)\/[^)\s#]+?)\.mdx?(#[^)\s]*)?\)/g,
    (_m, p1, anchor) => `](${p1}${anchor || ""})`,
  );

  if (text !== original) {
    const count =
      (original.match(/\]\(\/(?:docs|blog)\/[^)\s#]+?\.mdx?(#[^)\s]*)?\)/g) ||
        [])
        .length;
    totalReplacements += count;
    edited++;
    await fs.writeFile(file, text);
  }
}

async function main() {
  for (const root of TARGETS) {
    if (!(await fs.stat(root).catch(() => null))) continue;
    const files = await walk(root);
    for (const f of files) await fixFile(f);
  }
  console.log(`files edited:       ${edited}`);
  console.log(`total replacements: ${totalReplacements}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
