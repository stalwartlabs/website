#!/usr/bin/env node
// MDX is stricter than Markdown: HTML comments break the parser. Convert
// <!-- ... --> to MDX-style braced comments only in .mdx files (plain .md
// files render HTML comments fine and are left alone). Also convert SVG
// kebab-case attributes to camelCase since JSX (which MDX uses for inline
// HTML) needs them in that form.
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = path.join(ROOT, "src/content/docs");

let edited = 0;
let commentsFixed = 0;

const SVG_KEBAB_ATTRS = [
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
];

const ATTR_REPLACEMENTS = SVG_KEBAB_ATTRS.map((kebab) => ({
  re: new RegExp(`\\b${kebab}=`, "g"),
  to:
    kebab.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) + "=",
}));

async function walk(dir, out = []) {
  for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) await walk(full, out);
    else if (full.endsWith(".mdx")) out.push(full);
  }
  return out;
}

async function processFile(file) {
  const original = await fs.readFile(file, "utf8");
  let text = original;

  // <!-- ... --> -> {/* ... */}, including multi-line.
  let local = 0;
  text = text.replace(/<!--([\s\S]*?)-->/g, (_match, inner) => {
    local++;
    return `{/*${inner.replace(/\*\//g, "* /")}*/}`;
  });

  for (const { re, to } of ATTR_REPLACEMENTS) {
    text = text.replace(re, to);
  }

  if (text !== original) {
    edited++;
    commentsFixed += local;
    await fs.writeFile(file, text);
  }
}

const files = await walk(TARGET);
for (const f of files) await processFile(f);

console.log(`files edited:    ${edited}`);
console.log(`comments fixed:  ${commentsFixed}`);
