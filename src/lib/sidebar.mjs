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

function readYaml(file) {
  // Tiny YAML reader: only supports scalar key: value pairs and `value`
  // strings (quoted or unquoted). Sufficient for our _meta.yml files.
  const out = {};
  const text = readFileSync(file, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([a-zA-Z_][\w-]*)\s*:\s*(.*?)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    } else if (v === "true") v = true;
    else if (v === "false") v = false;
    else if (/^-?\d+(?:\.\d+)?$/.test(v)) v = Number(v);
    out[m[1]] = v;
  }
  return out;
}

function readFrontmatter(file) {
  const text = readFileSync(file, "utf8");
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  return readYamlString(m[1]);
}

function readYamlString(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([a-zA-Z_][\w-]*)\s*:\s*(.*?)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
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
    // Archived docs (e.g. 0.15) live alongside current docs but get their
    // own per-version sidebar via VersionPicker; exclude from main sidebar.
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
      const order = typeof fm.sidebar?.order === "number" ? fm.sidebar.order : undefined;
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

  // Sort: explicit `order` from frontmatter first, then alphabetical by label.
  pages.sort((a, b) => {
    if (a.order != null && b.order != null) return a.order - b.order;
    if (a.order != null) return -1;
    if (b.order != null) return 1;
    return a.label.localeCompare(b.label);
  });
  subgroups.sort((a, b) => {
    if (a.order != null && b.order != null) return a.order - b.order;
    if (a.order != null) return -1;
    if (b.order != null) return 1;
    return a.label.localeCompare(b.label);
  });

  const indexEntry = (() => {
    for (const candidate of ["index.mdx", "index.md"]) {
      const p = path.join(dir, candidate);
      try {
        if (statSync(p).isFile()) {
          // Slugs in Starlight's sidebar config must not end with a slash;
          // index.* renders at the directory's URL. Top-level group has
          // empty slugPrefix and no slug entry needed.
          if (slugPrefix === "") return null;
          return { slug: `docs${slugPrefix}`, label };
        }
      } catch {}
    }
    return null;
  })();

  const entries = [];
  if (indexEntry) entries.push({ label: "Overview", slug: indexEntry.slug });
  entries.push(...pages.map((p) => ({ label: p.label, slug: p.slug })));
  entries.push(
    ...subgroups.map((g) => ({
      label: g.label,
      collapsed: g.collapsed,
      items: g.entries,
    })),
  );

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
  return entries;
}
