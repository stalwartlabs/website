#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = path.join(ROOT, "src/content/docs/docs");
const REF_OBJECT = path.join(DOCS, "ref/object");

const USAGE = `Fill default-value markers from the generated schema reference.

  <!-- default:Object.field -->...<!-- /default -->
  <!-- default:Object.Variant.field -->...<!-- /default -->
  <!-- default:Object.field as=enabled -->...<!-- /default -->
  {/* default:Object.field */}...{/* /default */}            (MDX)

Object is the title of a page in ref/object/. Variant is an @type value
("PostgreSql") or a nested type name ("PostgreSqlSettings"); it is required
when the field exists in several sections with different defaults.
as=enabled renders a Boolean as "enabled" or "disabled". An expression
default with no conditions renders in code, or as a value given as=enabled,
as=size (bytes), as=duration ("5m" or milliseconds) or as=rate ("[1, 1d]"),
since the schema does not say what it holds. Sets and lists of
strings render as a code list joined with "and", or with "or" given join=or.

Values are formatted for prose: durations in the largest exact unit,
sizes in KiB/MiB/GiB (MB/GB when only a decimal unit is exact), rates as "100 per minute", schedules as "daily at
04:00", strings, enum values and single-value expressions in code.
Expressions with conditions, maps, and sets or lists of anything other than
strings are refused: link the field instead.

Usage:
  node scripts/inject-defaults.mjs [files...]   rewrite in place
  node scripts/inject-defaults.mjs --dry-run    report what would change
  node scripts/inject-defaults.mjs --check      exit 1 if anything is stale
  node scripts/inject-defaults.mjs --audit      list prose that states a
                                                default without a marker

Any marker that cannot be resolved exits 1 in every mode.`;

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith("--")));
const targets = argv.filter((a) => !a.startsWith("--"));
if (flags.has("--help")) {
  console.log(USAGE);
  process.exit(0);
}
const DRY = flags.has("--dry-run");
const CHECK = flags.has("--check");
const AUDIT = flags.has("--audit");

const MARKER_HTML =
  /<!--\s*default:([\w.]+)((?:\s+\w+=\w+)*)\s*-->([\s\S]*?)<!--\s*\/default\s*-->/g;
const MARKER_MDX =
  /\{\/\*\s*default:([\w.]+)((?:\s+\w+=\w+)*)\s*\*\/\}([\s\S]*?)\{\/\*\s*\/default\s*\*\/\}/g;

const FIELD_RE = /^#####\s+`([^`]+)`\s*$/;
const SECTION_RE = /^(#{2,4})\s+(.+?)\s*$/;
const TYPE_LINE_RE = /^>\s*Type:\s*(.*?)\s*·\s*default:\s*`([^`]*)`/;

const UNITS_MS = [
  [86400000, "day"],
  [3600000, "hour"],
  [60000, "minute"],
  [1000, "second"],
  [1, "millisecond"],
];
const UNITS_BYTES = [
  [1073741824, "GiB"],
  [1048576, "MiB"],
  [1024, "KiB"],
];
const UNITS_DECIMAL_BYTES = [
  [1000000000, "GB"],
  [1000000, "MB"],
  [1000, "kB"],
];

function sectionName(text) {
  const variant = text.match(/^`@type:\s*"([^"]+)"`$/);
  if (variant) return variant[1];
  return text.replace(/`/g, "").trim();
}

function typeName(typeHtml) {
  const plain = typeHtml
    .replace(/<[^>]+>/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s*·\s*enterprise$/, "")
    .replace(/\?$/, "")
    .trim();
  return plain;
}

async function loadSchema() {
  const schema = new Map();
  for (const name of await fs.readdir(REF_OBJECT)) {
    if (!name.endsWith(".md")) continue;
    const text = await fs.readFile(path.join(REF_OBJECT, name), "utf8");
    const title = text.match(/^title:\s*"?([^"\n]+)"?\s*$/m);
    if (!title) continue;
    const fields = [];
    let part = null;
    let section = null;
    let field = null;
    for (const line of text.split("\n")) {
      const f = line.match(FIELD_RE);
      if (f) {
        field = part ? f[1] : null;
        continue;
      }
      const s = line.match(SECTION_RE);
      if (s) {
        field = null;
        if (s[1] === "##") {
          part = s[2] === "Fields" || s[2] === "Nested types" ? s[2] : null;
          section = null;
        } else if (part) {
          section = sectionName(s[2]);
        }
        continue;
      }
      if (!field) continue;
      const t = line.match(TYPE_LINE_RE);
      if (t) {
        fields.push({ section, field, type: typeName(t[1]), raw: t[2] });
        field = null;
      }
    }
    schema.set(title[1], fields);
  }
  return schema;
}

function plural(n, unit) {
  return `${n} ${unit}${n === 1 ? "" : "s"}`;
}

function formatDuration(ms) {
  if (ms === 0) return "0 seconds";
  for (const [size, unit] of UNITS_MS) {
    if (ms % size === 0) return plural(ms / size, unit);
  }
  return plural(ms, "millisecond");
}

function formatPeriod(ms) {
  for (const [size, unit] of UNITS_MS) {
    if (ms % size === 0) return ms === size ? unit : plural(ms / size, unit);
  }
  return plural(ms, "millisecond");
}

function formatSize(bytes) {
  for (const [size, unit] of UNITS_BYTES) {
    if (bytes >= size && bytes % size === 0) return `${bytes / size} ${unit}`;
  }
  for (const [size, unit] of UNITS_DECIMAL_BYTES) {
    if (bytes >= size && bytes % size === 0) return `${bytes / size} ${unit}`;
  }
  return plural(bytes, "byte");
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatCron(value) {
  const at = `${pad(value.hour ?? 0)}:${pad(value.minute ?? 0)}`;
  switch (value["@type"]) {
    case "Daily":
      return `daily at ${at}`;
    case "Hourly":
      return value.minute ? `hourly at ${value.minute} minutes past the hour` : "hourly, on the hour";
    case "Weekly":
      return `weekly on ${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][value.day] ?? `day ${value.day}`} at ${at}`;
    default:
      throw new Error(`schedule type ${value["@type"]} has no prose form`);
  }
}

function listOf(items, conjunction) {
  if (items.length < 3) return items.join(` ${conjunction} `);
  return `${items.slice(0, -1).join(", ")} ${conjunction} ${items.at(-1)}`;
}

function code(text) {
  return "`" + text + "`";
}

const EXPRESSION_MS = { ms: 1, s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000 };

function expressionMs(text) {
  if (/^\d+$/.test(text)) return Number(text);
  const m = text.match(/^(\d+)\s*(ms|s|m|h|d|w)$/);
  if (!m) throw new Error(`expression ${text} is not a duration`);
  return Number(m[1]) * EXPRESSION_MS[m[2]];
}

function formatExpression(text, as) {
  switch (as) {
    case undefined:
      return code(text);
    case "enabled":
      if (text !== "true" && text !== "false") throw new Error(`expression ${text} is not a Boolean`);
      return text === "true" ? "enabled" : "disabled";
    case "size":
      if (!/^\d+$/.test(text)) throw new Error(`expression ${text} is not a size in bytes`);
      return formatSize(Number(text));
    case "duration":
      return formatDuration(expressionMs(text));
    case "rate": {
      const m = text.match(/^\[\s*(\d+)\s*,\s*([^\]\s]+)\s*\]$/);
      if (!m) throw new Error(`expression ${text} is not a rate`);
      return `${m[1]} per ${formatPeriod(expressionMs(m[2]))}`;
    }
    default:
      throw new Error(`unknown option as=${as}`);
  }
}

function format(entry, options) {
  const { type, raw } = entry;
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error(`default ${raw} is not JSON`);
  }
  if (/^(List|Set)</.test(type)) {
    const items = Array.isArray(value) ? value : Object.keys(value ?? {});
    if (!items.length || !items.every((i) => typeof i === "string")) {
      throw new Error(`${type} default ${raw} has no prose form; link the field instead`);
    }
    return listOf(items.map(code), options.join === "or" ? "or" : "and");
  }
  if (/^Map</.test(type)) {
    throw new Error(`${type} defaults have no prose form; link the field instead`);
  }
  switch (type) {
    case "Duration":
      return formatDuration(value);
    case "Size":
      return formatSize(value);
    case "Rate":
      return `${value.count} per ${formatPeriod(value.period)}`;
    case "Cron":
      return formatCron(value);
    case "Boolean":
      if (options.as === "enabled") return value ? "enabled" : "disabled";
      return code(String(value));
    case "UnsignedInt":
    case "Integer":
    case "Float":
      return String(value);
    case "Expression":
      if (value.match && Object.keys(value.match).length) {
        throw new Error("conditional expressions have no prose form; link the field instead");
      }
      return formatExpression(String(value.else), options.as);
    default:
      if (typeof value === "string") return code(value);
      throw new Error(`${type} defaults have no prose form; link the field instead`);
  }
}

function resolve(schema, key, options) {
  const parts = key.split(".");
  if (parts.length < 2 || parts.length > 3) {
    throw new Error("expected Object.field or Object.Variant.field");
  }
  const [object, ...rest] = parts;
  const field = rest.pop();
  const section = rest[0];
  const fields = schema.get(object);
  if (!fields) throw new Error(`no object ${object} in ref/object`);
  const matches = fields.filter(
    (f) => f.field === field && (section === undefined || f.section === section),
  );
  if (!matches.length) {
    const where = section ? `${object}.${section}` : object;
    throw new Error(`${where} has no field ${field} with a default`);
  }
  const values = new Set(matches.map((m) => `${m.type}\0${m.raw}`));
  if (values.size > 1) {
    const sections = matches.map((m) => m.section ?? "(top level)").join(", ");
    throw new Error(`${field} has different defaults in ${sections}; name the variant`);
  }
  return format(matches[0], options);
}

function parseOptions(text) {
  const options = {};
  for (const pair of text.trim().split(/\s+/).filter(Boolean)) {
    const [k, v] = pair.split("=");
    const known = (k === "as" && ["enabled", "size", "duration", "rate"].includes(v)) || (k === "join" && (v === "and" || v === "or"));
    if (!known) throw new Error(`unknown option ${pair}`);
    options[k] = v;
  }
  return options;
}

async function walk(dir, out = []) {
  for (const ent of await fs.readdir(dir, { withFileTypes: true })) {
    if (ent.name.startsWith(".")) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (full !== path.join(DOCS, "ref")) await walk(full, out);
    } else if (/\.mdx?$/.test(ent.name)) out.push(full);
  }
  return out;
}

const AUDIT_RE =
  /\bby default\b|\bdefaults? (?:is|are|to)\b|\bdefault of\b|\(default\b|, default\b|\bdefault value\b/i;
const HAS_MARKER = /<!--\s*default:|\{\/\*\s*default:/;

function audit(file, text) {
  const hits = [];
  let fence = false;
  let fm = false;
  text.split("\n").forEach((line, i) => {
    if (i === 0 && line.trim() === "---") {
      fm = true;
      return;
    }
    if (fm) {
      if (line.trim() === "---") fm = false;
      return;
    }
    if (/^\s*```/.test(line)) {
      fence = !fence;
      return;
    }
    if (fence) return;
    if (HAS_MARKER.test(line)) return;
    if (AUDIT_RE.test(line)) hits.push(`${path.relative(ROOT, file)}:${i + 1}: ${line.trim().slice(0, 140)}`);
  });
  return hits;
}

const schema = await loadSchema();
const files = targets.length ? targets.map((t) => path.resolve(t)) : await walk(DOCS);

let touched = 0;
let markers = 0;
const errors = [];
const auditHits = [];

for (const file of files) {
  const original = await fs.readFile(file, "utf8");
  if (AUDIT) {
    auditHits.push(...audit(file, original));
    continue;
  }
  const isMdx = file.endsWith(".mdx");
  const re = isMdx ? MARKER_MDX : MARKER_HTML;
  const next = original.replace(re, (whole, key, opts, _inner, offset) => {
    markers++;
    const open = isMdx ? `{/* default:${key}${opts} */}` : `<!-- default:${key}${opts} -->`;
    const close = isMdx ? "{/* /default */}" : "<!-- /default -->";
    try {
      return open + resolve(schema, key, parseOptions(opts)) + close;
    } catch (err) {
      const line = original.slice(0, offset).split("\n").length;
      errors.push(`${path.relative(ROOT, file)}:${line}: default:${key}: ${err.message}`);
      return whole;
    }
  });
  if (next === original) continue;
  touched++;
  const rel = path.relative(ROOT, file);
  if (CHECK) console.log(`[stale]   ${rel}`);
  else if (DRY) console.log(`[dry-run] ${rel}: would update`);
  else {
    await fs.writeFile(file, next);
    console.log(`updated:  ${rel}`);
  }
}

if (AUDIT) {
  for (const hit of auditHits) console.log(hit);
  console.log(`\n${auditHits.length} line(s) state a default without a marker`);
  process.exit(0);
}

console.log(`\nobjects loaded:  ${schema.size}`);
console.log(`markers found:   ${markers}`);
console.log(`files touched:   ${touched}`);

if (errors.length) {
  console.error("\nUnresolved default markers:");
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
if (CHECK && touched) {
  console.error(`\n${touched} file(s) hold stale defaults. Run 'npm run defaults' to regenerate.`);
  process.exit(1);
}
