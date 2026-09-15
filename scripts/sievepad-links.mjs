import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { deflateRawSync, inflateRawSync } from "node:zlib";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COLLECTIONS = [
  { dir: path.join(ROOT, "src/content/docs/docs"), label: "Stalwart docs" },
  { dir: path.join(ROOT, "src/content/docs/blog"), label: "Stalwart blog" },
];
const ARCHIVED_VERSION_DIR = /^\d+\.\d+$/;
const SIEVEPAD_DIST = path.resolve(ROOT, "../sieve/web/dist");
const ENGINE_MODULE = "sieve_web.js";
const ENGINE_WASM = "sieve_web_bg.wasm";

const SIEVEPAD_URL = "https://sievepad.com/";
const WORKSPACE_VERSION = 1;
const MAIN_SCRIPT_NAME = "main";
const LINK_TEXT = "Try this script in Sievepad";
const LINK_LENGTH_LIMIT = 8000;
const NAME_LENGTH_LIMIT = 80;
const MESSAGE_NAME_LENGTH_LIMIT = 40;
const DEFAULT_MESSAGE_NAME = "message.eml";
const BLANK_MESSAGE = `From: Sender <sender@example.com>
To: Jane Doe <jane@example.org>
Subject: Hello from Sievepad
Date: Mon, 14 Sep 2026 10:00:00 +0000
Message-ID: <hello-1@example.com>
Content-Type: text/plain; charset="utf-8"

Hello! This is a test message.
`;

const COMMENT_SYNTAX = {
  ".md": { open: "<!--", close: "-->" },
  ".mdx": { open: "{/*", close: "*/}" },
};

const FENCE = /^(\s*)(`{3,}|~{3,})\s*([^\s`]*)/;
const HEADING = /^ {0,3}#{1,6}\s+(.+?)(?:\s+#+)?\s*$/;
const FRONTMATTER_TITLE = /^title:\s*(.+?)\s*$/;
const SUBJECT = /^subject:[ \t]*(.+)$/im;
const LINK_URL = /(?:href="|\]\()(https:\/\/[^")\s]+)/;
const SKIP = /^skip\b/;
const MENTIONS_SIEVE = /sieve/i;

const args = new Set(process.argv.slice(2));
const CHECK = args.has("--check");
const VERBOSE = args.has("--verbose");

class MarkerError extends Error {
  constructor(index, message) {
    super(message);
    this.line = index + 1;
  }
}

async function engineDirCandidates() {
  if (process.env.SIEVEPAD_ENGINE) return [process.env.SIEVEPAD_ENGINE];
  const assets = path.join(SIEVEPAD_DIST, "assets");
  const builds = existsSync(assets) ? await fs.readdir(assets) : [];
  return [path.join(SIEVEPAD_DIST, "pkg"), ...builds.map((build) => path.join(assets, build, "pkg"))];
}

async function loadEngine() {
  const dir = (await engineDirCandidates()).find(
    (candidate) => existsSync(path.join(candidate, ENGINE_MODULE)) && existsSync(path.join(candidate, ENGINE_WASM)),
  );
  if (!dir) return null;
  const { initSync, defaults, run } = await import(pathToFileURL(path.join(dir, ENGINE_MODULE)).href);
  initSync({ module: await fs.readFile(path.join(dir, ENGINE_WASM)) });
  return { run, defaults: defaults() };
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries
      .filter((entry) => !entry.name.startsWith("."))
      .map((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return ARCHIVED_VERSION_DIR.test(entry.name) ? [] : walk(full);
        return COMMENT_SYNTAX[path.extname(entry.name)] ? [full] : [];
      }),
  );
  return nested.flat();
}

function nextContentLine(lines, from) {
  let index = from;
  while (index < lines.length && !lines[index].trim()) index++;
  return index;
}

function closingFence(lines, from, marker) {
  const close = new RegExp(`^\\s*\\${marker[0]}{${marker.length},}\\s*$`);
  for (let index = from; index < lines.length; index++) {
    if (close.test(lines[index])) return index;
  }
  return lines.length;
}

function closingComment(lines, from, syntax) {
  for (let index = from; index < lines.length; index++) {
    if (lines[index].trim() === syntax.close) return index;
  }
  throw new MarkerError(from - 1, "sievepad marker is never closed");
}

function markerHead(line, syntax) {
  const opening = `${syntax.open} sievepad`;
  const trimmed = line.trim();
  if (!trimmed.startsWith(opening)) return null;
  const rest = trimmed.slice(opening.length);
  return rest === "" || /^\s/.test(rest) ? rest.trim() : null;
}

function isRegionClose(line, syntax) {
  return line?.trim() === `${syntax.open} /sievepad ${syntax.close}`;
}

function dedent(lines, indent) {
  return lines.map((line) => (line.startsWith(indent) ? line.slice(indent.length) : line.trimStart()));
}

function plainText(markdown) {
  return markdown.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[`*]/g, "").trim();
}

function unquote(value) {
  const quoted = /^(["'])(.*)\1$/.exec(value);
  return quoted ? quoted[2].replace(/\\(["\\])/g, "$1") : value;
}

function frontmatterEnd(lines) {
  if (lines[0]?.trim() !== "---") return 0;
  const end = lines.indexOf("---", 1);
  return end === -1 ? 0 : end + 1;
}

function frontmatterTitle(lines, end) {
  for (const line of lines.slice(1, end)) {
    const title = FRONTMATTER_TITLE.exec(line)?.[1];
    if (title) return unquote(title);
  }
  return null;
}

function workspaceName(label, title, heading) {
  const names = [[title, heading === title ? null : heading], [heading ?? title]]
    .map((parts) => parts.filter(Boolean))
    .map((parts) => (parts.length ? `${label}: ${parts.join(" › ")}` : label));
  return names.find((name) => name.length <= NAME_LENGTH_LIMIT) ?? names.at(-1).slice(0, NAME_LENGTH_LIMIT).trimEnd();
}

function parseSettings(text, index) {
  if (!text) return {};
  let settings;
  try {
    settings = JSON.parse(text);
  } catch (error) {
    throw new MarkerError(index, `invalid settings JSON: ${error.message}`);
  }
  if (settings === null || typeof settings !== "object" || Array.isArray(settings)) {
    throw new MarkerError(index, "sievepad settings must be a JSON object");
  }
  return settings;
}

function regionEnd(lines, from, syntax) {
  const first = nextContentLine(lines, from);
  if (isRegionClose(lines[first], syntax)) return { end: first + 1, link: null };
  const second = nextContentLine(lines, first + 1);
  if (isRegionClose(lines[second], syntax)) return { end: second + 1, link: LINK_URL.exec(lines[first])?.[1] ?? null };
  return { end: from, link: null };
}

function readRegion(lines, from, syntax, indent) {
  const start = nextContentLine(lines, from);
  const head = start < lines.length ? markerHead(lines[start], syntax) : null;
  if (head === null) return { kind: "absent", start: from, end: from };

  const singleLine = head.endsWith(syntax.close);
  const commentEnd = singleLine ? start : closingComment(lines, start + 1, syntax);
  const opening = singleLine ? head.slice(0, -syntax.close.length).trim() : head;
  const { end, link } = regionEnd(lines, commentEnd + 1, syntax);

  if (SKIP.test(opening)) {
    return { kind: "skip", start, end, comment: lines.slice(start, commentEnd + 1) };
  }
  const message = dedent(lines.slice(start + 1, commentEnd), indent);
  return {
    kind: "linked",
    start,
    end,
    settings: parseSettings(opening, start),
    message: message.some((line) => line.trim()) ? message : null,
    link,
  };
}

function scanPage(lines, syntax, label) {
  const examples = [];
  const orphans = [];
  let cursor = frontmatterEnd(lines);
  const title = frontmatterTitle(lines, cursor);
  let heading = null;

  while (cursor < lines.length) {
    const line = lines[cursor];
    const fence = FENCE.exec(line);
    if (!fence) {
      const text = HEADING.exec(line)?.[1];
      if (text) heading = plainText(text);
      if (markerHead(line, syntax) !== null) orphans.push(cursor + 1);
      cursor++;
      continue;
    }

    const [, indent, marker, lang] = fence;
    const close = closingFence(lines, cursor + 1, marker);
    if (lang.toLowerCase() !== "sieve" || close === lines.length) {
      cursor = close + 1;
      continue;
    }

    const region = readRegion(lines, close + 1, syntax, indent);
    examples.push({
      line: cursor + 1,
      indent,
      name: workspaceName(label, title, heading),
      source: `${dedent(lines.slice(cursor + 1, close), indent).join("\n")}\n`,
      region,
    });
    cursor = Math.max(region.end, close + 1);
  }
  return { examples, orphans };
}

function messageSource(message) {
  return message && `${message.join("\n").replace(/\n+$/, "")}\n`;
}

function messageName(source) {
  const subject = SUBJECT.exec(source.split("\n\n", 1)[0])?.[1] ?? "";
  const slug = subject
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, MESSAGE_NAME_LENGTH_LIMIT)
    .replace(/^-+|-+$/g, "");
  return slug ? `${slug}.eml` : DEFAULT_MESSAGE_NAME;
}

function workspaceFor(example, settings, message) {
  const source = messageSource(message);
  return {
    v: WORKSPACE_VERSION,
    name: example.name,
    scripts: [{ name: MAIN_SCRIPT_NAME, source: example.source }],
    messages: source ? [{ name: messageName(source), source }] : [],
    settings,
  };
}

function encodeLink(workspace) {
  const packed = deflateRawSync(Buffer.from(JSON.stringify(workspace), "utf8"), { level: 9 });
  return `${SIEVEPAD_URL}#w=${packed.toString("base64url")}`;
}

function decodeLink(link) {
  try {
    const token = new URLSearchParams(new URL(link).hash.slice(1)).get("w");
    return JSON.parse(inflateRawSync(Buffer.from(token, "base64url")).toString("utf8"));
  } catch {
    return null;
  }
}

function linkFor(workspace, existing) {
  const serialized = JSON.stringify(workspace);
  return existing && JSON.stringify(decodeLink(existing)) === serialized ? existing : encodeLink(workspace);
}

function describeEvent(event) {
  return [event.summary, ...event.detail.map(({ label, value }) => `${label}: ${value}`)].join(" | ");
}

function runWorkspace(engine, workspace) {
  let output;
  try {
    output = engine.run({
      scripts: workspace.scripts,
      message: workspace.messages[0]?.source ?? BLANK_MESSAGE,
      settings: { ...engine.defaults, ...workspace.settings },
      seenIds: [],
      now: Math.floor(Date.now() / 1000),
    });
  } catch (error) {
    return { problem: { line: 0, message: `settings rejected by the engine: ${error.message ?? error}` } };
  }
  const [diagnostic] = output.diagnostics;
  if (diagnostic) return { problem: { line: diagnostic.line, message: diagnostic.message } };
  if (output.error) {
    return { problem: { line: output.error.line ?? 0, message: `runtime error: ${output.error.message}` } };
  }
  return { events: output.events.map(describeEvent) };
}

function resolveWorkspace(engine, workspace) {
  const { noCapabilityCheck, ...settings } = workspace.settings;
  const strict = { ...workspace, settings };
  const strictRun = runWorkspace(engine, strict);
  if (!strictRun.problem) return { workspace: strict, events: strictRun.events };

  const relaxed = { ...workspace, settings: { noCapabilityCheck: true, ...settings } };
  const relaxedRun = runWorkspace(engine, relaxed);
  return relaxedRun.problem ? relaxedRun : { workspace: relaxed, events: relaxedRun.events };
}

function formatSettings(settings) {
  return Object.keys(settings).length ? JSON.stringify(settings, null, 1).replace(/\n\s*/g, " ") : "";
}

function renderRegion(indent, syntax, workspace, message, link) {
  const head = formatSettings(workspace.settings);
  const opening = `${indent}${syntax.open} sievepad${head && ` ${head}`}`;
  const comment = message
    ? [opening, ...message.map((line) => line && `${indent}${line}`), `${indent}${syntax.close}`]
    : [`${opening} ${syntax.close}`];
  return [
    ...comment,
    `${indent}<p><a href="${link}" target="_blank" rel="noopener">${LINK_TEXT}</a></p>`,
    `${indent}${syntax.open} /sievepad ${syntax.close}`,
  ];
}

function unchanged(replacement, lines, start, end) {
  return replacement.length === end - start && replacement.every((line, offset) => line === lines[start + offset]);
}

function planExample(example, lines, syntax, engine, report, file) {
  const { region } = example;
  const where = `${file}:${example.line}`;

  if (region.kind === "skip") {
    report.skipped++;
    return region.end - region.start === region.comment.length ? null : region.comment;
  }
  if (region.kind === "absent" && !engine) {
    report.unvalidated++;
    return null;
  }

  const authored = workspaceFor(example, region.settings ?? {}, region.message ?? null);
  const outcome = engine ? resolveWorkspace(engine, authored) : { workspace: authored, events: null };
  if (outcome.problem) {
    const reason = outcome.problem.message.replace(/\s+/g, " ");
    if (region.kind === "absent") {
      report.unlinked.push({ where, reason });
    } else {
      report.errors.push(`${file}:${example.line + outcome.problem.line}: ${reason}`);
    }
    return null;
  }

  const link = linkFor(outcome.workspace, region.link ?? null);
  if (link.length > LINK_LENGTH_LIMIT) {
    report.warnings.push(`${where}: link is ${link.length} characters, keep it under ${LINK_LENGTH_LIMIT}`);
  }
  report.linked.push({ where, events: outcome.events });

  const rendered = renderRegion(example.indent, syntax, outcome.workspace, region.message ?? null, link);
  if (region.kind === "absent") {
    return ["", ...rendered, ...(lines[region.start]?.trim() ? [""] : [])];
  }
  return unchanged(rendered, lines, region.start, region.end) ? null : rendered;
}

async function processFile(file, label, engine, report) {
  const syntax = COMMENT_SYNTAX[path.extname(file)];
  const relative = path.relative(ROOT, file);
  const original = await fs.readFile(file, "utf8");
  if (!MENTIONS_SIEVE.test(original)) return;
  const lines = original.split("\n");

  let page;
  try {
    page = scanPage(lines, syntax, label);
  } catch (error) {
    if (!(error instanceof MarkerError)) throw error;
    report.errors.push(`${relative}:${error.line}: ${error.message}`);
    return;
  }

  for (const line of page.orphans) {
    report.warnings.push(`${relative}:${line}: sievepad marker is not attached to a sieve code block`);
  }
  const edits = page.examples
    .map((example) => ({ region: example.region, lines: planExample(example, lines, syntax, engine, report, relative) }))
    .filter((edit) => edit.lines);
  if (!edits.length) return;

  for (const edit of edits.reverse()) {
    lines.splice(edit.region.start, edit.region.end - edit.region.start, ...edit.lines);
  }
  report.changedFiles.push(relative);
  if (!CHECK) await fs.writeFile(file, lines.join("\n"));
}

function printReport(report, engine) {
  for (const file of report.changedFiles) console.log(`${CHECK ? "stale:  " : "updated:"} ${file}`);
  if (VERBOSE) {
    for (const { where, events } of report.linked) {
      console.log(`linked   ${where}${events ? `  ->  ${events.join("; ")}` : ""}`);
    }
    for (const { where, reason } of report.unlinked) console.log(`no link  ${where}  (${reason})`);
  }
  for (const warning of report.warnings) console.warn(`warning: ${warning}`);
  for (const error of report.errors) console.error(`error: ${error}`);

  const counts = [
    `${report.linked.length} linked`,
    `${report.unlinked.length} not runnable in Sievepad`,
    `${report.skipped} skipped`,
  ];
  if (report.unvalidated) counts.push(`${report.unvalidated} without a marker, not validated`);
  console.log(`sievepad: ${counts.join(", ")}`);
  if (!engine) {
    console.log(
      `sievepad: engine not found under ${process.env.SIEVEPAD_ENGINE ?? SIEVEPAD_DIST} (set SIEVEPAD_ENGINE); links refreshed without validation`,
    );
  }
  if (CHECK && report.changedFiles.length) {
    console.error(`sievepad: ${report.changedFiles.length} file(s) out of date, run 'npm run sievepad'`);
  }
}

const engine = await loadEngine();
const report = {
  linked: [],
  unlinked: [],
  skipped: 0,
  unvalidated: 0,
  changedFiles: [],
  warnings: [],
  errors: [],
};

for (const { dir, label } of COLLECTIONS) {
  for (const file of (await walk(dir)).sort()) {
    await processFile(file, label, engine, report);
  }
}

printReport(report, engine);
if (report.errors.length || (CHECK && report.changedFiles.length)) process.exitCode = 1;
