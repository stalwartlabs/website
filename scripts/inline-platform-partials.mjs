#!/usr/bin/env node
/**
 * Inline `_setup-wizard.mdx` and `_next-steps.mdx` into each install
 * platform page so their headings show up in the right-hand table of
 * contents (Astro/MDX doesn't propagate headings from imported components).
 *
 * After inlining, convert the JSX-style {/* ... *\/ } comments back to
 * standard HTML comments and SVG camelCase attributes back to kebab-case,
 * then rename the file from .mdx to .md so the rest of the install pages
 * are uniform plain Markdown.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "src/content/docs/docs/install/platform");

const SVG_CAMEL_TO_KEBAB = [
  ["strokeWidth", "stroke-width"],
  ["strokeLinecap", "stroke-linecap"],
  ["strokeLinejoin", "stroke-linejoin"],
  ["strokeDasharray", "stroke-dasharray"],
  ["strokeDashoffset", "stroke-dashoffset"],
  ["strokeMiterlimit", "stroke-miterlimit"],
  ["fillRule", "fill-rule"],
  ["clipRule", "clip-rule"],
  ["fillOpacity", "fill-opacity"],
  ["strokeOpacity", "stroke-opacity"],
  ["textAnchor", "text-anchor"],
  ["fontFamily", "font-family"],
  ["fontSize", "font-size"],
  ["fontWeight", "font-weight"],
];

function mdxToMd(text) {
  // {/* ... */} -> <!-- ... -->
  let out = text.replace(/\{\/\*([\s\S]*?)\*\/\}/g, (_m, inner) => `<!--${inner}-->`);
  for (const [camel, kebab] of SVG_CAMEL_TO_KEBAB) {
    out = out.replace(new RegExp(`\\b${camel}=`, "g"), `${kebab}=`);
  }
  return out;
}

async function read(p) {
  return fs.readFile(p, "utf8");
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const setupWizard = mdxToMd(await read(path.join(DIR, "_setup-wizard.mdx")));
  const nextSteps = mdxToMd(await read(path.join(DIR, "_next-steps.mdx")));

  const platforms = ["linux", "docker", "windows"];

  for (const name of platforms) {
    const mdx = path.join(DIR, `${name}.mdx`);
    if (!(await exists(mdx))) continue;
    let text = await read(mdx);

    // Strip the `import ... from './_*.mdx';` lines.
    text = text.replace(/^import\s+\w+\s+from\s+['"]\.\/_[^'"]+['"];?\s*\n/gm, "");

    // Replace JSX placeholders with the partial's body.
    text = text.replace(/<SetupWizard\s*\/?>/g, setupWizard);
    text = text.replace(/<NextSteps\s*\/?>/g, nextSteps);

    // Convert any remaining MDX-only constructs (comments / camelCase attrs)
    // that came from the parent file's own body.
    text = mdxToMd(text);

    const md = path.join(DIR, `${name}.md`);
    await fs.writeFile(md, text);
    await fs.unlink(mdx);
    console.log(`inlined: ${name}.mdx -> ${name}.md`);
  }

  await fs.unlink(path.join(DIR, "_setup-wizard.mdx"));
  await fs.unlink(path.join(DIR, "_next-steps.mdx"));
  console.log("removed partials");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
