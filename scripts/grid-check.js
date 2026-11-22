/* Grid check: on real pages, measures how far each line of text that sits on the
 * visible grid (no solid background behind it) is from a grid line.
 * Usage: node scripts/grid-check.js [baseUrl] [--verbose]
 * Needs Playwright + a Chromium-based browser (paths below are this machine's). */
const PW = process.env.PLAYWRIGHT || "C:/Users/Sorin/AppData/Local/Temp/codex-venit-f118699771a044bf97c5ca46565b173c/node_modules/playwright";
const EXE = process.env.BROWSER || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const { chromium, devices } = require(PW);
const base = process.argv.find(a => a.startsWith("http")) || "http://127.0.0.1:8787";
const verbose = process.argv.includes("--verbose");
const PAGES = ["/", "/mulch-calculator/", "/concrete-calculator/", "/fence-calculator/", "/carpet-installation-cost/",
  "/construction-calculators/", "/feet-and-inches-calculator/", "/square-footage-calculator/", "/about/", "/methodology/"];

async function check(page) {
  return page.evaluate(() => {
    const G = 24;
    const bodyCs = getComputedStyle(document.body);
    // y of the first horizontal grid line, from background-position-y
    const offs = parseFloat(bodyCs.backgroundPositionY.split(",")[0]) || 0;
    const solid = el => { for (let e = el; e && e !== document.body; e = e.parentElement) {
      const c = getComputedStyle(e).backgroundColor; if (c && c !== "rgba(0, 0, 0, 0)" && c !== "transparent") return true;
      if (getComputedStyle(e).backgroundImage !== "none" && e !== document.body) return true; } return false; };
    const out = [];
    const els = [...document.querySelectorAll("main *, footer *")].filter(el => {
      if (!el.offsetParent && getComputedStyle(el).position !== "fixed") return false;
      if (el.closest("[hidden], .sr-only, svg, .nav-drawer")) return false;
      return [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    });
    for (const el of els) {
      if (solid(el)) continue;
      // an inline wrapper keeps the probe on the text's line even in flex/grid containers
      const wrap = document.createElement("span");
      const probe = document.createElement("span");
      probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline;padding:0;margin:0;border:0";
      wrap.textContent = "​"; wrap.prepend(probe);
      const first = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim().length > 1);
      el.insertBefore(wrap, first);
      const y = probe.getBoundingClientRect().top + scrollY;
      wrap.remove();
      const lift = parseFloat(getComputedStyle(el).getPropertyValue("--lift")) || parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sit")) || 0; // writing sits on the line (--sit), titles above their underline (--lift); see style.css
      let d = ((y + lift - offs) % G + G) % G; if (d > G / 2) d -= G;
      const lh = getComputedStyle(el).lineHeight;
      const lhn = parseFloat(lh);
      // the desktop page title is 38/44 on purpose (style.css): only its first line has to be on a line
      const lhOk = (!isNaN(lhn) && Math.abs(lhn / G - Math.round(lhn / G)) < 0.01) || (el.matches("main h1") && lhn === 44);
      const text = first.textContent.trim().slice(0, 40);
      out.push({ tag: el.tagName.toLowerCase() + (el.className ? "." + String(el.className).split(" ")[0] : ""), d: Math.round(d * 10) / 10, lh, lhOk, text });
    }
    // drawn lines: a box's top edge sits on a grid line and its bottom stroke covers
    // one (bottom edge 1 px past a line for 24n+1 boxes, on the line for rows)
    const boxSel = { "main .calc": 1, "main details:not(.g-row)": 1, "main .formula": 1, "main .table-wrap": 1, "main .embed-box": 1, ".search input": 1, ".g-row": 0 };
    for (const [sel, bottomRem] of Object.entries(boxSel)) {
      for (const el of document.querySelectorAll(sel)) {
        if (!el.offsetParent) continue;
        if (el.matches("details") && el.closest(".calc")) continue;
        const r = el.getBoundingClientRect(); const t = r.top + scrollY - offs, bt = r.bottom + scrollY - offs;
        const tm = ((t % G) + G) % G, bm = (((bt - bottomRem) % G) + G) % G;
        const near = x => x < 0.6 || G - x < 0.6;
        out.push({ tag: "EDGE " + sel, d: 0, edge: `top ${Math.round(tm * 10) / 10} bottom ${Math.round(bm * 10) / 10}`, lh: "-", lhOk: near(tm) && near(bm), text: Math.round(r.height) + "px tall" });
      }
    }
    return out;
  });
}

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  let total = 0, bad = 0;
  // --all-sizes adds a small phone, tablets portrait/landscape and a narrow laptop
  const sizes = [["desktop", { viewport: { width: 1440, height: 900 } }], ["phone", { ...devices["iPhone 13"] }]];
  if (process.argv.includes("--all-sizes")) sizes.push(
    ["phone-se", { ...devices["iPhone SE"] }], ["tablet", { viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2 }],
    ["tablet-land", { viewport: { width: 1024, height: 768 }, deviceScaleFactor: 2 }], ["laptop", { viewport: { width: 1280, height: 720 } }]);
  for (const [label, ctx] of sizes) {
    const page = await b.newPage(ctx);
    // --fonts: swap in fonts with different metrics (as on a Mac or an iPhone) to prove
    // the alignment is measured, not tuned to this machine's fonts
    if (process.argv.includes("--fonts")) await page.route("**/style.css*", async route => {
      const res = await route.fetch(); const body = await res.text();
      route.fulfill({ response: res, body: body + ":root{--sans:Verdana,sans-serif;--serif:'Times New Roman',serif}" });
    });
    for (const path of PAGES) {
      await page.goto(base + path, { waitUntil: "load" });
      await page.waitForTimeout(300); // let grid.js re-run after the calculator scripts change heights
      const rows = await check(page);
      const off = rows.filter(r => Math.abs(r.d) > 2 || !r.lhOk);
      total += rows.length; bad += off.length;
      console.log(`${label.padEnd(11)} ${path.padEnd(34)} ${String(rows.length).padStart(3)} lines, ${String(off.length).padStart(3)} off`);
      if (verbose) off.slice(0, 12).forEach(r => console.log(`        ${r.tag.padEnd(22)} ${r.edge || "d=" + String(r.d).padStart(5) + " lh=" + String(r.lh).padEnd(7)} ${r.text}`));
    }
    await page.close();
  }
  await b.close();
  console.log(`GRID: ${total - bad}/${total} text lines and box edges on the grid (${Math.round((total - bad) / total * 100)}%)`);
  process.exitCode = 0;
})();
