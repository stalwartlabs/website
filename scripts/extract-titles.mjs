#!/usr/bin/env node
/* Extract first H1 to frontmatter `title` for any doc that lacks one. */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = path.join(ROOT, "src/content/docs/docs");
const BLOG = path.join(ROOT, "src/content/docs/blog");

let added = 0;
let skipped = 0;
let noTitle = 0;

async function walk(dir, out = []) {
  for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) await walk(full, out);
    else if (/\.mdx?$/.test(ent.name)) out.push(full);
  }
  return out;
}

function splitFm(text) {
  if (!text.startsWith("---")) return { fm: null, body: text, fmLen: 0 };
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { fm: null, body: text, fmLen: 0 };
  return { fm: m[1], body: text.slice(m[0].length), fmLen: m[0].length };
}

async function process(file, { stripH1 }) {
  const original = await fs.readFile(file, "utf8");
  const { fm, body } = splitFm(original);

  if (fm != null && /^title:\s/m.test(fm)) {
    skipped++;
    return;
  }

  const h1Match = body.match(/^[ \t]*#[ \t]+(.+?)[ \t]*$/m);
  if (!h1Match) {
    noTitle++;
    return;
  }
  const title = h1Match[1].replace(/[`*_]/g, "").trim();
  const yamlValue = JSON.stringify(title);

  let newFm;
  if (fm == null) newFm = `title: ${yamlValue}`;
  else newFm = `${fm}\ntitle: ${yamlValue}`;

  let newBody = body;
  if (stripH1) {
    newBody = body.replace(/^[ \t]*#[ \t]+.+?[ \t]*\n+/m, "");
  }

  await fs.writeFile(file, `---\n${newFm}\n---\n${newBody}`);
  added++;
}

async function main() {
  for (const root of [DOCS, BLOG]) {
    if (!(await fs.stat(root).catch(() => null))) continue;
    const files = await walk(root);
    for (const f of files) await process(f, { stripH1: true });
  }
  console.log(`title added:   ${added}`);
  console.log(`already had:   ${skipped}`);
  console.log(`no H1 found:   ${noTitle}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
