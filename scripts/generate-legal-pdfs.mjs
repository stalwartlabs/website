// Generates a PDF for every legal document under src/content/legal and writes
// the result to public/legal/<slug>.pdf, so the URL <slug>.pdf is served as
// a static asset by Cloudflare Pages alongside the HTML page at /legal/<slug>.
//
// Workflow:
//   1) The script runs `npm run build` if `dist/` is missing or stale (controlled
//      by the --skip-build flag for re-runs after a manual build).
//   2) It serves dist/ from a small in-process http server on a random port.
//   3) For each legal slug, it opens the page in headless Chromium, hides the
//      navigation chrome, applies the print stylesheet, replaces runs of
//      underscores with bordered placeholders for fillable fields, then prints
//      to PDF.
//   4) For documents that contain fillable fields (the reseller agreements),
//      the rendered PDF is post-processed with pdf-lib to overlay real AcroForm
//      text fields on top of the visual placeholders, so the recipient can
//      open the PDF in any reader and type their details.
//
// Run as `npm run pdfs` (which runs `node scripts/generate-legal-pdfs.mjs`).
// Pass --skip-build to skip the rebuild step (useful when iterating on this
// script itself). Pass --slug=foo to regenerate a single document.

import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import puppeteer from "puppeteer";
import { PDFDocument } from "pdf-lib";

const ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");
const DIST = join(ROOT, "dist");
const LEGAL_SRC = join(ROOT, "src", "content", "legal");
const PDF_OUT = join(ROOT, "public", "legal");

const args = new Set(process.argv.slice(2));
const skipBuild = args.has("--skip-build");
const onlySlug = [...args].find((a) => a.startsWith("--slug="))?.slice(7);

const A4 = {
  // PDF points (1pt = 1/72in). A4 = 210mm x 297mm.
  widthPt: 595.28,
  heightPt: 841.89,
};
// Margins applied during PDF generation. Source of truth in mm, with pt
// conversions for the coordinate maths below. Puppeteer's page.pdf() margin
// parameter does not accept "pt" units, so we hand it the mm form directly.
const MARGIN_MM = 20;
const MM_TO_PT = 72 / 25.4;
const MARGIN = {
  topPt: MARGIN_MM * MM_TO_PT,
  bottomPt: MARGIN_MM * MM_TO_PT,
  leftPt: MARGIN_MM * MM_TO_PT,
  rightPt: MARGIN_MM * MM_TO_PT,
};
// Puppeteer renders at 96 CSS px per inch. 1 CSS px = 0.75 pt.
const PX_TO_PT = 72 / 96;
const PT_TO_PX = 96 / 72;

// Origin used in PDFs for any link rewritten away from localhost.
const SITE_ORIGIN = process.env.SITE_ORIGIN || "https://stalw.art";

const PRINTABLE_HEIGHT_PT = A4.heightPt - MARGIN.topPt - MARGIN.bottomPt;
const PRINTABLE_HEIGHT_PX = PRINTABLE_HEIGHT_PT * PT_TO_PX;
const PRINTABLE_WIDTH_PT = A4.widthPt - MARGIN.leftPt - MARGIN.rightPt;
const PRINTABLE_WIDTH_PX = PRINTABLE_WIDTH_PT * PT_TO_PX;

function log(...m) {
  process.stdout.write(`[pdfs] ${m.join(" ")}\n`);
}
function warn(...m) {
  process.stderr.write(`[pdfs] WARN: ${m.join(" ")}\n`);
}

// ---- 1. Discover legal docs ---------------------------------------------------

function getLegalDocs() {
  const files = readdirSync(LEGAL_SRC).filter((f) => f.endsWith(".md"));
  return files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = readFileSync(join(LEGAL_SRC, file), "utf8");
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    const fm = fmMatch ? Object.fromEntries(
      fmMatch[1].split("\n").map((line) => {
        const i = line.indexOf(":");
        if (i === -1) return [line, ""];
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
      }),
    ) : {};
    return {
      slug,
      title: fm.title || slug,
      lastUpdated: fm.lastUpdated || "",
    };
  }).sort((a, b) => a.slug.localeCompare(b.slug));
}

// ---- 2. Build (unless --skip-build) ------------------------------------------

function ensureBuild() {
  if (skipBuild) {
    if (!existsSync(DIST)) {
      throw new Error("--skip-build was passed but dist/ does not exist. Run `npm run build` first.");
    }
    log("Skipping build (--skip-build).");
    return;
  }
  log("Running `npm run build`...");
  const r = spawnSync("npm", ["run", "build"], { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) {
    throw new Error("Build failed. Aborting PDF generation.");
  }
}

// ---- 3. Serve dist/ on a local port ------------------------------------------

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".json": "application/json",
};

function startServer() {
  const server = createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath.endsWith("/")) urlPath += "index.html";
    let filePath = join(DIST, urlPath);
    // Try directory + index.html if no extension was hit.
    if (!extname(filePath) && existsSync(join(filePath, "index.html"))) {
      filePath = join(filePath, "index.html");
    } else if (!existsSync(filePath) && existsSync(filePath + "/index.html")) {
      filePath = filePath + "/index.html";
    }
    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }
    const ext = extname(filePath).toLowerCase();
    res.setHeader("content-type", MIME[ext] || "application/octet-stream");
    res.end(readFileSync(filePath));
  });
  return new Promise((resolveStart) => {
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      resolveStart({ server, port });
    });
  });
}

// ---- 4. Per-page render + PDF generation -------------------------------------

// Runs in the browser. Hides the marketing chrome, then walks all text nodes
// inside the article body looking for runs of >= 4 underscores. Each run is
// replaced by a span the same visual width as the original underscores, with a
// bottom border so it still reads as "fill in here". The span's bounding rect
// is captured (in CSS px, relative to the document top) so we can later overlay
// an AcroForm text field on it.
//
// Returns the captured rects and the document scroll height (CSS px) so the
// caller can compute which PDF page each rect lands on.
const PREP_PAGE_FN = `(printableHeightPx, siteOrigin) => {
  // Hide the marketing chrome so the PDF only contains the legal document.
  const chrome = [
    'header', 'footer',
    '.lf__nav',
    '.lf__back',
  ];
  for (const sel of chrome) {
    document.querySelectorAll(sel).forEach((el) => el.style.display = 'none');
  }
  // Make the article fill the page width.
  const article = document.querySelector('.lf__article');
  if (article) {
    article.style.maxWidth = 'none';
    article.style.width = '100%';
  }
  const layout = document.querySelector('.lf__layout');
  if (layout) {
    layout.style.gridTemplateColumns = '1fr';
    layout.style.display = 'block';
  }
  const section = document.querySelector('.lf');
  if (section) {
    section.style.padding = '0';
  }

  // Rewrite link hrefs so the PDF references the production site rather
  // than the localhost dev server. Internal absolute paths get prefixed
  // with the production origin; localhost absolute URLs get rebased onto
  // it; external URLs are left alone.
  document.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('/')) {
      a.setAttribute('href', siteOrigin + href);
    } else if (/^https?:\\/\\/(127\\.0\\.0\\.1|localhost)(:\\d+)?\\//.test(href)) {
      try {
        const u = new URL(href);
        a.setAttribute('href', siteOrigin + u.pathname + u.search + u.hash);
      } catch {}
    }
  });

  // Force a page break before any <h2> whose text starts with one of the
  // markers below. Captured y-positions of these breaks are returned so
  // toPdfCoords can attribute fillables on or after each marker to the
  // correct PDF page (the naive Math.floor(y / pageHeight) misattributes
  // them because the forced break shifts everything onto the next page).
  const PAGEBREAK_HEADINGS = ['SIGNATURES'];
  const breakStyle = document.createElement('style');
  breakStyle.textContent = '.pdf-pagebreak-before { break-before: page !important; page-break-before: always !important; }';
  document.head.appendChild(breakStyle);
  document.querySelectorAll('h2').forEach((h) => {
    const t = (h.textContent || '').trim().toUpperCase();
    if (PAGEBREAK_HEADINGS.some((m) => t.startsWith(m))) {
      h.classList.add('pdf-pagebreak-before');
    }
  });

  // Walk text nodes inside the article body and replace runs of underscores.
  const body = document.querySelector('.lf__body') || document.body;
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  const targets = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (/_{3,}/.test(node.nodeValue)) targets.push(node);
  }
  let counter = 0;
  for (const node of targets) {
    const text = node.nodeValue;
    const parts = text.split(/(_{3,})/g);
    const frag = document.createDocumentFragment();
    for (const part of parts) {
      if (/^_{3,}$/.test(part)) {
        const span = document.createElement('span');
        span.className = 'pdf-fillable';
        span.dataset.id = String(counter++);
        // Approximate width: each underscore ~0.55em in body font.
        // Use a non-breaking line so it stays inline at consistent height.
        span.textContent = ' '.repeat(part.length);
        // Visual style: bottom border like the original underscore run.
        span.style.display = 'inline-block';
        span.style.borderBottom = '1px solid #111';
        span.style.minWidth = Math.max(40, part.length * 7) + 'px';
        span.style.lineHeight = '1.4';
        span.style.verticalAlign = 'baseline';
        frag.appendChild(span);
      } else {
        frag.appendChild(document.createTextNode(part));
      }
    }
    node.parentNode.replaceChild(frag, node);
  }

  // Force layout so getBoundingClientRect is fresh.
  document.body.offsetHeight;

  const rects = [...document.querySelectorAll('.pdf-fillable')].map((el) => {
    const r = el.getBoundingClientRect();
    return {
      id: el.dataset.id,
      x: r.left + window.scrollX,
      y: r.top + window.scrollY,
      width: r.width,
      height: r.height,
    };
  });
  // Capture the y-position (document coords) of every forced page break
  // so toPdfCoords can shift fillables onto the right PDF page.
  //
  // Subtracting the element's top margin gives the "outer" top edge.
  // Chromium preserves the heading's top margin even when the heading
  // is the first element on a new page, so the printable area on the
  // new page starts at the outer-top in document coords (NOT the
  // border-box top that getBoundingClientRect() returns). Without this
  // adjustment, fillables below the heading land too high on the page
  // by exactly margin-top px.
  const breaks = [...document.querySelectorAll('.pdf-pagebreak-before')]
    .map((el) => {
      const rect = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const marginTop = parseFloat(cs.marginTop) || 0;
      return rect.top + window.scrollY - marginTop;
    })
    .sort((a, b) => a - b);
  return {
    rects,
    breaks,
    docHeight: document.documentElement.scrollHeight,
    docWidth: document.documentElement.scrollWidth,
    printableHeightPx,
  };
}`;

async function renderOnePdf({ browser, baseUrl, doc, footerDate }) {
  const url = `${baseUrl}/legal/${doc.slug}`;
  const page = await browser.newPage();
  // Match A4 printable area at 96dpi so getBoundingClientRect numbers map
  // cleanly to PDF points after the print transform.
  await page.setViewport({
    width: Math.round(PRINTABLE_WIDTH_PX),
    height: Math.round(PRINTABLE_HEIGHT_PX),
    deviceScaleFactor: 1,
  });
  await page.emulateMediaType("print");
  // Force light colour scheme. The site picks dark by default in headless
  // Chromium (no OS preference reported), which would yield a black
  // background and pale text in the PDF.
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: "light" },
  ]);
  // Plant a stored theme preference before any client script can run, so
  // the inline `data-theme` setter in Base.astro picks "light".
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem("stalwart-theme", "light");
    } catch {}
  });
  await page.goto(url, { waitUntil: "networkidle0" });
  // Inject a print stylesheet that overrides the brand colour palette with
  // plain black-on-white. Works even if the cascade tries to re-introduce
  // greys via CSS variables, because we re-define those variables here.
  await page.addStyleTag({ content: PRINT_CSS });

  const captured = await page.evaluate(
    `(${PREP_PAGE_FN})(${PRINTABLE_HEIGHT_PX}, ${JSON.stringify(SITE_ORIGIN)})`,
  );
  if (captured.rects.length > 0) {
    log(`   captured ${captured.rects.length} fillable region(s)`);
  }

  // Print footer template uses Puppeteer's substitution placeholders.
  const headerTemplate = `<div></div>`;
  const footerTemplate = `
    <div style="font-size:8pt;color:#666;width:100%;padding:0 ${MARGIN.leftPt}pt;display:flex;justify-content:space-between;font-family:Helvetica,Arial,sans-serif;">
      <span>${escapeHtml(doc.title)} &middot; Stalwart Labs Ltd${footerDate ? " &middot; " + escapeHtml(footerDate) : ""}</span>
      <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
    </div>
  `;
  const pdfBytes = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: `${MARGIN_MM}mm`,
      bottom: `${MARGIN_MM}mm`,
      left: `${MARGIN_MM}mm`,
      right: `${MARGIN_MM}mm`,
    },
    displayHeaderFooter: true,
    headerTemplate,
    footerTemplate,
    preferCSSPageSize: false,
  });

  await page.close();

  // Post-process to add AcroForm fields if there were any fillables captured.
  if (captured.rects.length === 0) {
    return Buffer.from(pdfBytes);
  }
  return overlayFormFields(Buffer.from(pdfBytes), captured.rects, captured.breaks || []);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Print stylesheet: force everything to plain black on white, override the
// site's coloured CSS variables, and remove drop-shadows / brand tints.
// Applied via addStyleTag after navigation so it has higher cascade weight
// than the brand stylesheet.
const PRINT_CSS = `
  :root, [data-theme="dark"], [data-theme="light"] {
    --background: #ffffff !important;
    --background-2: #ffffff !important;
    --surface: #ffffff !important;
    --surface-2: #f7f7f7 !important;
    --text: #000000 !important;
    --text-muted: #000000 !important;
    --text-dim: #333333 !important;
    --brand: #000000 !important;
    --brand-soft: transparent !important;
    --border: #000000 !important;
    --border-strong: #000000 !important;
    color-scheme: light !important;
  }
  html, body {
    background: #ffffff !important;
    color: #000000 !important;
  }
  /* Strip link styling so PDFs read like a printed contract: no blue/brand
     underlines, no underline rings; the URL itself remains visible. */
  a, a:visited, a:hover {
    color: #000000 !important;
    text-decoration-color: #000000 !important;
  }
  /* The article body uses --text-muted for paragraphs; the override above
     handles that, but force just in case any inline style sneaks in. */
  .lf__body, .lf__body p, .lf__body li, .lf__body td, .lf__body th,
  .lf__body strong, .lf__body em, .lf__body code, .lf__body blockquote {
    color: #000000 !important;
  }
  .lf__body code {
    background: #f3f3f3 !important;
    border-color: #cccccc !important;
  }
  .lf__body th, .lf__body td {
    border-color: #000000 !important;
  }
  .lf__body thead th {
    background: #f0f0f0 !important;
  }
`;

// ---- 5. AcroForm overlay -----------------------------------------------------

// Convert a fillable rect captured in CSS px (relative to the rendered
// document at PRINTABLE_WIDTH_PX width) to a PDF-page coordinate triple
// (page index, x in pt from left, y in pt from bottom, width/height in pt).
//
// Without forced page breaks Chromium roughly slices the document at
// multiples of PRINTABLE_HEIGHT_PX (with small adjustments for inline
// elements that would straddle a boundary). With forced page breaks
// (`break-before: page`), each break leaves the rest of the previous
// page blank and pushes subsequent content one page later. The math here
// accounts for that: each fillable's effective page is computed relative
// to the most recent forced break that precedes it.
function toPdfCoords(rect, breaks) {
  // Find the most recent forced break at or before rect.y. Anything
  // after that break is laid out as if its origin is the top of the
  // page that the break lands on.
  let breakY = 0;
  let breakPage = 0;
  for (const b of breaks) {
    if (b <= rect.y) {
      breakY = b;
      // Page that the break lands on: it's the page after the one the
      // break point would naturally fall into.
      breakPage = Math.floor(b / PRINTABLE_HEIGHT_PX) + 1;
    } else {
      break;
    }
  }
  // Distance from the break (or doc top, if no break) to the rect.
  let dy = rect.y - breakY;
  const bottomPx = dy + rect.height;
  // If the rect straddles a page boundary within the post-break flow,
  // snap to the next page (mirrors Chromium's "avoid breaking inline
  // elements across pages" behaviour).
  let extraPages = Math.floor(dy / PRINTABLE_HEIGHT_PX);
  const pageOfBottomWithinFlow = Math.floor((bottomPx - 0.01) / PRINTABLE_HEIGHT_PX);
  if (extraPages !== pageOfBottomWithinFlow) {
    extraPages = pageOfBottomWithinFlow;
    dy = extraPages * PRINTABLE_HEIGHT_PX;
  }
  const pageIndex = breakPage + extraPages;
  const yWithinPagePx = dy - extraPages * PRINTABLE_HEIGHT_PX;
  const xPt = MARGIN.leftPt + rect.x * PX_TO_PT;
  const widthPt = rect.width * PX_TO_PT;
  const heightPt = Math.max(12, rect.height * PX_TO_PT);
  // PDF y is measured from the bottom of the page.
  const yPtFromBottomOfPrintable = PRINTABLE_HEIGHT_PT - (yWithinPagePx * PX_TO_PT) - heightPt;
  const yPt = MARGIN.bottomPt + yPtFromBottomOfPrintable;
  return { pageIndex, xPt, yPt, widthPt, heightPt };
}

async function overlayFormFields(pdfBytes, rects, breaks) {
  const pdf = await PDFDocument.load(pdfBytes);
  const form = pdf.getForm();
  const pages = pdf.getPages();
  let added = 0, skipped = 0;
  for (const rect of rects) {
    const { pageIndex, xPt, yPt, widthPt, heightPt } = toPdfCoords(rect, breaks);
    if (pageIndex < 0 || pageIndex >= pages.length) {
      skipped++;
      continue;
    }
    const page = pages[pageIndex];
    const fieldName = `field_${rect.id}`;
    try {
      const field = form.createTextField(fieldName);
      // addToPage MUST come before setFontSize / setText: pdf-lib only
      // creates the default-appearance dictionary at addToPage time, and
      // anything that touches /DA before that throws "No /DA entry".
      field.addToPage(page, {
        x: xPt,
        y: yPt,
        width: widthPt,
        height: heightPt,
        borderWidth: 0,
      });
      field.setText("");
      field.setFontSize(11);
      added++;
    } catch (err) {
      warn(`field ${fieldName} skipped: ${err.message}`);
      skipped++;
    }
  }
  log(`   overlay added ${added} AcroForm field(s); ${skipped} skipped`);
  // updateFieldAppearances must be false here: pdf-lib re-enters the
  // appearance generator on save and that path can fail silently on
  // PDFs whose fonts were rasterised by Chromium. We rely on the reader
  // to lay down appearances on first focus instead.
  // useObjectStreams: false keeps form objects in the cross-reference table
  // rather than inside compressed object streams. Some older PDF readers
  // miss form fields hidden in object streams, and the file size penalty
  // is small (<5%).
  pdf.setProducer("Stalwart Labs PDF generator");
  return Buffer.from(await pdf.save({ updateFieldAppearances: false, useObjectStreams: false }));
}

// ---- 6. Orchestration --------------------------------------------------------

async function main() {
  ensureBuild();

  if (!existsSync(PDF_OUT)) {
    mkdirSync(PDF_OUT, { recursive: true });
  }

  const { server, port } = await startServer();
  const baseUrl = `http://127.0.0.1:${port}`;
  log(`Static server: ${baseUrl}`);

  const browser = await puppeteer.launch({ headless: true });
  log("Chromium launched.");

  let docs = getLegalDocs();
  if (onlySlug) docs = docs.filter((d) => d.slug === onlySlug);
  if (docs.length === 0) {
    warn(`No legal documents matched ${onlySlug ? `--slug=${onlySlug}` : "(empty src/content/legal)"}`);
  }

  for (const doc of docs) {
    log(`-> ${doc.slug}`);
    const buf = await renderOnePdf({
      browser,
      baseUrl,
      doc,
      footerDate: doc.lastUpdated ? `Last updated ${doc.lastUpdated}` : "",
    });
    writeFileSync(join(PDF_OUT, `${doc.slug}.pdf`), buf);
  }

  await browser.close();
  server.close();
  log(`Done. ${docs.length} PDF(s) written to public/legal/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
