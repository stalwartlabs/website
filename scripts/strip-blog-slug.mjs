#!/usr/bin/env node
/* Remove the Docusaurus-style `slug:` field from blog frontmatter so Astro
   derives the URL from the filename, yielding /blog/<filename> as in Docusaurus. */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BLOG = path.join(ROOT, "src/content/docs/blog");

let stripped = 0;

async function walk(dir, out = []) {
  for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) await walk(full, out);
    else if (/\.mdx?$/.test(ent.name)) out.push(full);
  }
  return out;
}

async function main() {
  const files = await walk(BLOG);
  for (const f of files) {
    const text = await fs.readFile(f, "utf8");
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!m) continue;
    const fm = m[1];
    const newFm = fm.replace(/^slug:\s*[^\r\n]+\r?\n?/m, "");
    if (newFm === fm) continue;
    const rest = text.slice(m[0].length);
    await fs.writeFile(f, `---\n${newFm.replace(/\n+$/, "")}\n---\n${rest}`);
    stripped++;
  }
  console.log(`stripped slug from ${stripped} blog posts`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
