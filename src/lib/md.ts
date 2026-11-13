// Tiny inline-markdown renderer for content strings written in YAML.
// Supports: `code`, **bold**, *italic*, [text](url).
// Not a full markdown parser; intentionally small.

const ESC_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ESC_MAP[c]);
}

export function inlineMd(text: string): string {
  if (!text) return "";
  // 1. Extract code spans first so their contents aren't transformed.
  const codeSpans: string[] = [];
  let out = text.replace(/`([^`]+)`/g, (_, code) => {
    codeSpans.push(code);
    return `__INL_CODE_${codeSpans.length - 1}__`;
  });

  // 2. Escape HTML in the rest.
  out = escapeHtml(out);

  // 3. Links [label](url). Internal vs. external decides target.
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const isExternal = /^https?:/.test(href) || /^mailto:/.test(href);
    const target = isExternal ? ' target="_blank" rel="noopener"' : "";
    return `<a href="${escapeHtml(href)}"${target}>${label}</a>`;
  });

  // 4. Bold **text**.
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // 5. Italic *text* or _text_ (don't match inside words; require boundary).
  out = out.replace(
    /(^|[\s(])([*_])(?=\S)([^*_]+?)\2(?=$|[\s.,;:)!?])/g,
    "$1<em>$3</em>"
  );

  // 6. Restore code spans.
  out = out.replace(/__INL_CODE_(\d+)__/g, (_, i) => {
    const code = codeSpans[Number(i)];
    return `<code>${escapeHtml(code)}</code>`;
  });

  return out;
}

// Multi-paragraph rendering: split on blank lines, apply inline md per paragraph.
export function paragraphMd(text: string): string {
  if (!text) return "";
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${inlineMd(p)}</p>`)
    .join("\n");
}

// Highlight a substring of `text` with the brand gradient. Both args are plain text.
export function withHighlight(text: string, highlight?: string): string {
  if (!highlight) return escapeHtml(text);
  const idx = text.indexOf(highlight);
  if (idx < 0) return escapeHtml(text);
  const end = idx + highlight.length;
  const punct = /^[.!?]/.test(text.slice(end)) ? 1 : 0;
  const before = text.slice(0, idx);
  const marked = text.slice(idx, end + punct);
  const after = text.slice(end + punct);
  return `${escapeHtml(before)}<em class="hl">${escapeHtml(marked)}</em>${escapeHtml(after)}`;
}

function sentences(p: string): string[] {
  return p.split(/(?<=[.!?])\s+(?=[A-Za-z"(*[`])/);
}

export function storyMd(text: string): { stand: string; paras: string[] } {
  if (!text) return { stand: "", paras: [] };
  const blocks = text.split(/\n{2,}/).map((p) => p.trim().replace(/\s+/g, " ")).filter(Boolean);
  const first = sentences(blocks[0]);
  const stand = first.shift() ?? "";
  const rest = first.join(" ");
  const paras: string[] = [];
  if (rest.length > 420) {
    let acc = "";
    let i = 0;
    while (i < first.length && acc.length < rest.length / 2) acc += (acc ? " " : "") + first[i++];
    paras.push(acc, first.slice(i).join(" "));
  } else if (rest) {
    paras.push(rest);
  }
  paras.push(...blocks.slice(1));
  return { stand: inlineMd(stand), paras: paras.filter(Boolean).map(inlineMd) };
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\*\*/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
