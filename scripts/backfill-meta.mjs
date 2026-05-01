#!/usr/bin/env node
/* For every directory under src/content/docs/docs/ that doesn't already have
   a _meta.yml, write one with a title-cased label derived from the directory
   name. starlight-auto-sidebar reads these to label sidebar groups. */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = path.join(ROOT, "src/content/docs/docs");

const ACRONYMS = new Set([
  "api", "cli", "dns", "dkim", "dmarc", "spf", "arc", "imap", "smtp", "pop",
  "pop3", "jmap", "mta", "tls", "acme", "ldap", "sql", "ssl", "url", "rfc",
  "rfcs", "urn", "ai", "iam", "uri", "ssh", "tcp", "udp", "http", "https",
  "ipv4", "ipv6", "asn", "kafka", "redis", "s3", "fts", "rocksdb", "rocks",
  "fail2ban", "oauth", "oidc", "totp", "2fa",
]);

function titleCase(name) {
  return name
    .replace(/[-_]/g, " ")
    .split(/\s+/)
    .map((w) => {
      const lower = w.toLowerCase();
      if (ACRONYMS.has(lower)) return lower.toUpperCase();
      if (/^v?\d/.test(w)) return w; // leave version-like numbers alone
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

let written = 0;
let skipped = 0;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    if (ent.name.startsWith(".") || ent.name.startsWith("_")) continue;
    const full = path.join(dir, ent.name);
    const meta = path.join(full, "_meta.yml");
    try {
      await fs.access(meta);
      skipped++;
    } catch {
      const label = titleCase(ent.name);
      await fs.writeFile(meta, `label: ${JSON.stringify(label)}\n`);
      written++;
    }
    await walk(full);
  }
}

await walk(DOCS);
console.log(`backfilled: ${written}`);
console.log(`already had _meta.yml: ${skipped}`);
