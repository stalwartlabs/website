/**
 * Build the Starlight sidebar config by walking src/content/docs/docs/ at
 * config-load time. Per-directory labels and ordering come from _meta.yml
 * files (the same shape the `starlight-auto-sidebar` plugin uses); per-file
 * labels come from the Markdown frontmatter `title:`. Used because the
 * starlight-auto-sidebar plugin produces an empty sidebar against Starlight
 * 0.38 / Astro 6.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const DOCS_ROOT = path.join(ROOT, "src/content/docs/docs");

// Tiny YAML reader: only supports scalar key: value pairs at the top level.
// Quoted strings, booleans, and numbers are coerced; everything else stays
// a string. Sufficient for our _meta.yml files and Docusaurus-style
// frontmatter (`title:`, `sidebar_position:`).
function parseYamlScalar(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([a-zA-Z_][\w-]*)\s*:\s*(.*?)\s*$/);
    if (!m) continue;
    let v = m[2];
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    } else if (v === "true") v = true;
    else if (v === "false") v = false;
    else if (/^-?\d+(?:\.\d+)?$/.test(v)) v = Number(v);
    out[m[1]] = v;
  }
  return out;
}

function readYaml(file) {
  return parseYamlScalar(readFileSync(file, "utf8"));
}

function readFrontmatter(file) {
  const text = readFileSync(file, "utf8");
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  return parseYamlScalar(m[1]);
}

// Mirror src/content.config.ts -> docsLoader's generateId so the sidebar
// references resolve to actual collection entries.
function slugSegment(seg) {
  return seg
    .toLowerCase()
    .replace(/[^a-z0-9.\-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(name) {
  const ACRONYMS = new Set([
    "api", "cli", "dns", "dkim", "dmarc", "spf", "arc", "imap", "smtp", "pop",
    "pop3", "jmap", "mta", "tls", "acme", "ldap", "sql", "ssl", "url", "rfc",
    "rfcs", "urn", "ai", "iam", "uri", "ssh", "tcp", "udp", "http", "https",
    "ipv4", "ipv6", "asn", "kafka", "redis", "s3", "fts", "rocksdb",
    "fail2ban", "oauth", "oidc", "totp", "2fa", "iprev", "ldif",
  ]);
  return name
    .replace(/[-_]/g, " ")
    .split(/\s+/)
    .map((w) => {
      const lower = w.toLowerCase();
      if (ACRONYMS.has(lower)) return lower.toUpperCase();
      if (/^v?\d/.test(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

function walkDir(dir, slugPrefix) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const subgroups = [];
  const pages = [];

  for (const ent of entries) {
    if (ent.name.startsWith(".")) continue;
    if (ent.name.startsWith("_") && ent.name !== "_meta.yml") {
      // partials and meta files: don't put in sidebar
      if (!ent.name.startsWith("_meta")) continue;
      continue;
    }
    // Archived versions (e.g. 0.15) are surfaced as separate top-level
    // groups appended after the current docs (see buildDocsSidebar).
    if (slugPrefix === "" && /^\d+\.\d+/.test(ent.name) && ent.isDirectory()) {
      continue;
    }
    const full = path.join(dir, ent.name);

    if (ent.isDirectory()) {
      const child = buildGroup(full, `${slugPrefix}/${slugSegment(ent.name)}`);
      if (child.entries.length > 0) subgroups.push(child);
    } else if (/\.mdx?$/.test(ent.name)) {
      const baseName = ent.name.replace(/\.mdx?$/, "");
      if (baseName === "index") continue; // index page is the group's landing
      const fm = readFrontmatter(full);
      const label = fm.title || titleCase(baseName);
      // Docusaurus convention: `sidebar_position: N` (flat key). Lower
      // values render higher in the sidebar.
      const order =
        typeof fm.sidebar_position === "number" ? fm.sidebar_position : undefined;
      pages.push({
        label,
        slug: `docs${slugPrefix}/${slugSegment(baseName)}`,
        order,
      });
    }
  }

  return { subgroups, pages };
}

function buildGroup(dir, slugPrefix) {
  const metaPath = path.join(dir, "_meta.yml");
  let meta = {};
  try {
    if (statSync(metaPath).isFile()) meta = readYaml(metaPath);
  } catch {}

  const dirName = path.basename(dir);
  const label = meta.label || titleCase(dirName);
  // Default groups to collapsed; opt-in to expanded with `collapsed: false`.
  const collapsed = meta.collapsed === false ? false : true;

  const { subgroups, pages } = walkDir(dir, slugPrefix);

  // Build the index entry (the directory's landing page) using its own
  // frontmatter title and `sidebar_position` so it sorts naturally with
  // siblings instead of being pinned to the top with a hardcoded "Overview".
  // Auto-generated landing pages (the CardGrid stubs the migration script
  // wrote where Docusaurus had `link.type: generated-index`) are rendered
  // at the directory URL but kept out of the sidebar; the directory's group
  // entry already covers them.
  const indexEntry = (() => {
    for (const candidate of ["index.mdx", "index.md"]) {
      const p = path.join(dir, candidate);
      try {
        if (statSync(p).isFile()) {
          if (slugPrefix === "") return null; // top-level wrapper has no link
          const text = readFileSync(p, "utf8");
          const isAutoGenerated = text.includes("@astrojs/starlight/components");
          if (isAutoGenerated) return null;
          const fm = readFrontmatter(p);
          return {
            label: fm.title || titleCase(dirName),
            slug: `docs${slugPrefix}`,
            order:
              typeof fm.sidebar_position === "number"
                ? fm.sidebar_position
                : undefined,
            kind: "page",
          };
        }
      } catch {}
    }
    return null;
  })();

  // Merge pages and subgroups into a single positional list. A subdirectory
  // with `_meta.yml: { order: 2 }` interleaves with sibling pages whose
  // `sidebar_position` is also 2-ish, instead of pages-first / subgroups-last.
  // Items without a position fall to the end, alphabetised among themselves.
  const taggedPages = pages.map((p) => ({ ...p, kind: "page" }));
  const taggedGroups = subgroups.map((g) => ({ ...g, kind: "group" }));
  const merged = [...taggedPages, ...taggedGroups];
  if (indexEntry) merged.unshift(indexEntry);

  merged.sort((a, b) => {
    const ao = a.order ?? Number.POSITIVE_INFINITY;
    const bo = b.order ?? Number.POSITIVE_INFINITY;
    if (ao !== bo) return ao - bo;
    return a.label.localeCompare(b.label);
  });

  const entries = merged.map((item) => {
    if (item.kind === "page") {
      return { label: item.label, slug: item.slug };
    }
    return {
      label: item.label,
      collapsed: item.collapsed,
      items: item.entries,
    };
  });

  return {
    label,
    collapsed,
    order: typeof meta.order === "number" ? meta.order : undefined,
    entries,
  };
}

export function buildDocsSidebar() {
  const root = buildGroup(DOCS_ROOT, "");
  // Drop the outer "Docs" wrapper; surface the top-level groups directly.
  // Pin FAQ to the bottom of the sidebar by convention.
  const entries = root.entries.slice();
  const faqIdx = entries.findIndex(
    (e) => e.slug === "docs/faq" || /^FAQ$/i.test(e.label ?? ""),
  );
  if (faqIdx > -1) {
    const [faq] = entries.splice(faqIdx, 1);
    entries.push(faq);
  }

  // Append archived versions (e.g. 0.15) as a single collapsed top-level
  // group so readers on a /docs/0.15/* page still see the v0.15 sidebar.
  // Starlight auto-expands the group that contains the active page, so on
  // current-version pages the v0.15 group stays collapsed and out of the way.
  for (const ent of readdirSync(DOCS_ROOT, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    if (!/^\d+\.\d+/.test(ent.name)) continue;
    const versionDir = path.join(DOCS_ROOT, ent.name);
    const built = buildGroup(versionDir, `/${slugSegment(ent.name)}`);
    entries.push({
      label: `v${ent.name} (archived)`,
      collapsed: true,
      items: built.entries,
    });
  }

  return entries;
}
