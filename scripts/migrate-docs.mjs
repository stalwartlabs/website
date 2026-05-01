#!/usr/bin/env node
/* eslint-disable no-console */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OLD = path.join(ROOT, ".old");
const DOCS_DST = path.join(ROOT, "src/content/docs/docs");
const BLOG_DST = path.join(ROOT, "src/content/docs/blog");
const VERSIONED_DST = path.join(DOCS_DST, "0.15");

const stats = {
  docsMoved: 0,
  blogMoved: 0,
  versionedMoved: 0,
  categoriesConverted: 0,
  generatedIndexes: 0,
  infoToNote: 0,
  truncateConverted: 0,
  blogRenamed: 0,
};

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function walk(dir, predicate = () => true) {
  const out = [];
  async function recurse(d) {
    const entries = await fs.readdir(d, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) {
        await recurse(full);
      } else if (predicate(full, ent)) {
        out.push(full);
      }
    }
  }
  await recurse(dir);
  return out;
}

function splitFrontmatter(text) {
  if (!text.startsWith("---")) return { fm: null, body: text };
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { fm: null, body: text };
  return { fm: m[1], body: m[2] };
}

function joinFrontmatter(fm, body) {
  if (fm == null) return body;
  return `---\n${fm}\n---\n${body}`;
}

function appendFrontmatter(fm, key, value) {
  const re = new RegExp(`^${key}:`, "m");
  if (re.test(fm)) return fm;
  const yamlValue =
    typeof value === "string" && !/^[\d.-]+$/.test(value)
      ? value.includes("\n") || value.includes(":") || value.includes("#")
        ? `|\n  ${value.split("\n").join("\n  ")}`
        : JSON.stringify(value)
      : value;
  return `${fm}\n${key}: ${yamlValue}`;
}

// ---------- Phase 1: move trees ----------

async function moveTree(src, dst, counter) {
  if (!(await exists(src))) {
    console.warn(`  skip: ${src} does not exist`);
    return;
  }
  await ensureDir(path.dirname(dst));
  await fs.rename(src, dst);
  const files = await walk(dst);
  stats[counter] = files.length;
  console.log(`  moved ${files.length} files to ${path.relative(ROOT, dst)}`);
}

// ---------- Phase 2: convert _category_.json -> _meta.yml ----------

async function convertCategories(rootDir) {
  const files = await walk(
    rootDir,
    (full) => path.basename(full) === "_category_.json",
  );
  for (const file of files) {
    const json = JSON.parse(await fs.readFile(file, "utf8"));
    const lines = [];
    if (json.label) lines.push(`label: ${JSON.stringify(json.label)}`);
    if (typeof json.position === "number") lines.push(`order: ${json.position}`);
    if (json.collapsed === true) lines.push(`collapsed: true`);
    const dir = path.dirname(file);
    const metaPath = path.join(dir, "_meta.yml");
    await fs.writeFile(metaPath, lines.join("\n") + "\n");

    if (json.link?.type === "generated-index") {
      await ensureGeneratedIndex(dir, json.label, json.link.description);
    }

    await fs.unlink(file);
    stats.categoriesConverted++;
  }
}

async function ensureGeneratedIndex(dir, label, description) {
  const existingIndex = ["index.md", "index.mdx"]
    .map((f) => path.join(dir, f))
    .find(async (p) => await exists(p));
  for (const candidate of ["index.md", "index.mdx"]) {
    if (await exists(path.join(dir, candidate))) return;
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });
  const children = entries
    .filter(
      (e) =>
        !e.name.startsWith("_") &&
        !e.name.startsWith(".") &&
        e.name !== "index.md" &&
        e.name !== "index.mdx",
    )
    .map((e) => {
      const slug = e.isDirectory() ? e.name : e.name.replace(/\.mdx?$/, "");
      const title = slug
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return { slug, title };
    });

  const fm = [
    "---",
    `title: ${JSON.stringify(label)}`,
    description ? `description: ${JSON.stringify(description)}` : null,
    "---",
  ]
    .filter(Boolean)
    .join("\n");

  const cardGrid = children
    .map(
      (c) =>
        `<LinkCard title=${JSON.stringify(c.title)} href=${JSON.stringify("./" + c.slug + "/")} />`,
    )
    .join("\n");

  const body = `import { LinkCard, CardGrid } from '@astrojs/starlight/components';\n\n${description ? description + "\n\n" : ""}<CardGrid>\n${cardGrid}\n</CardGrid>\n`;

  await fs.writeFile(path.join(dir, "index.mdx"), `${fm}\n\n${body}`);
  stats.generatedIndexes++;
  void existingIndex;
}

// ---------- Phase 3: in-place markdown transforms ----------

async function transformMarkdown(rootDir, { isBlog }) {
  const files = await walk(rootDir, (full) =>
    /\.mdx?$/.test(path.basename(full)),
  );
  for (const file of files) {
    let text = await fs.readFile(file, "utf8");
    const original = text;

    // :::info -> :::note (Starlight has no info aside)
    const infoCount = (text.match(/:::info\b/g) || []).length;
    if (infoCount) {
      text = text.replace(/:::info\b/g, ":::note");
      stats.infoToNote += infoCount;
    }

    if (isBlog) {
      // <!-- truncate --> becomes excerpt frontmatter
      const truncIdx = text.indexOf("<!-- truncate -->");
      if (truncIdx !== -1) {
        const { fm, body } = splitFrontmatter(text);
        if (fm != null) {
          const beforeTrunc = body.slice(0, body.indexOf("<!-- truncate -->")).trim();
          const afterTrunc = body
            .slice(body.indexOf("<!-- truncate -->") + "<!-- truncate -->".length)
            .replace(/^\s*\n/, "");
          const newFm = appendFrontmatter(fm, "excerpt", beforeTrunc);
          text = joinFrontmatter(newFm, afterTrunc);
          stats.truncateConverted++;
        }
      }
    }

    if (text !== original) await fs.writeFile(file, text);
  }
}

// ---------- Phase 4: blog post renames + date frontmatter ----------

async function renameBlogPosts() {
  const entries = await fs.readdir(BLOG_DST, { withFileTypes: true });
  const dateRe = /^(\d{4}-\d{2}-\d{2})-(.+)$/;
  for (const ent of entries) {
    const m = ent.name.match(dateRe);
    if (!m) continue;
    const [, date, rest] = m;

    if (ent.isDirectory()) {
      const oldPath = path.join(BLOG_DST, ent.name);
      const newPath = path.join(BLOG_DST, rest);
      await fs.rename(oldPath, newPath);

      for (const indexName of ["index.mdx", "index.md"]) {
        const idx = path.join(newPath, indexName);
        if (await exists(idx)) {
          await injectDate(idx, date);
        }
      }
      stats.blogRenamed++;
    } else if (/\.mdx?$/.test(ent.name)) {
      const oldPath = path.join(BLOG_DST, ent.name);
      const newPath = path.join(BLOG_DST, rest);
      await fs.rename(oldPath, newPath);
      await injectDate(newPath, date);
      stats.blogRenamed++;
    }
  }
}

async function injectDate(file, date) {
  const text = await fs.readFile(file, "utf8");
  const { fm, body } = splitFrontmatter(text);
  if (fm == null) return;
  if (/^date:/m.test(fm)) return;
  const newFm = `${fm}\ndate: ${date}`;
  await fs.writeFile(file, joinFrontmatter(newFm, body));
}

// ---------- Phase 5: drop authors.yml (absorbed into config) ----------

async function removeAuthorsYml() {
  const f = path.join(BLOG_DST, "authors.yml");
  if (await exists(f)) {
    await fs.unlink(f);
    console.log(`  removed authors.yml (absorbed into starlight-blog config)`);
  }
}

// ---------- Phase 6: cleanup empty .old subdirs ----------

async function reportRemaining() {
  const remaining = [];
  for (const sub of ["docs", "blog"]) {
    const p = path.join(OLD, sub);
    if (await exists(p)) {
      const files = await walk(p, () => true);
      if (files.length) {
        remaining.push({ dir: p, count: files.length, files });
      }
    }
  }
  return remaining;
}

// ---------- Main ----------

async function main() {
  console.log("== Stalwart docs migration ==\n");

  console.log("[1/5] Moving docs/ -> src/content/docs/docs/");
  await moveTree(path.join(OLD, "docs"), DOCS_DST, "docsMoved");

  console.log("\n[2/5] Moving blog/ -> src/content/docs/blog/");
  await moveTree(path.join(OLD, "blog"), BLOG_DST, "blogMoved");

  console.log("\n[3/5] Moving versioned_docs/version-0.15 -> .../docs/0.15/");
  await moveTree(
    path.join(OLD, "versioned_docs/version-0.15"),
    VERSIONED_DST,
    "versionedMoved",
  );

  console.log("\n[4/5] Converting _category_.json -> _meta.yml");
  await convertCategories(DOCS_DST);

  console.log("\n[5/5] Markdown transforms (admonitions, truncate, blog dates)");
  await transformMarkdown(DOCS_DST, { isBlog: false });
  await transformMarkdown(BLOG_DST, { isBlog: true });
  await removeAuthorsYml();
  await renameBlogPosts();

  console.log("\n== Summary ==");
  for (const [k, v] of Object.entries(stats)) console.log(`  ${k}: ${v}`);

  const remaining = await reportRemaining();
  if (remaining.length) {
    console.log("\n!! Remaining files in .old/ (NOT migrated):");
    for (const r of remaining) {
      console.log(`  ${path.relative(ROOT, r.dir)}: ${r.count} files`);
      for (const f of r.files.slice(0, 10))
        console.log(`    - ${path.relative(ROOT, f)}`);
      if (r.files.length > 10) console.log(`    ... and ${r.files.length - 10} more`);
    }
    process.exitCode = 1;
  } else {
    console.log("\n✓ .old/docs and .old/blog are empty.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
