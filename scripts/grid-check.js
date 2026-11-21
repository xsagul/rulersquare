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
      let d = ((y - offs) % G + G) % G; if (d > G / 2) d -= G;
      const lh = getComputedStyle(el).lineHeight;
      const lhn = parseFloat(lh);
      const lhOk = !isNaN(lhn) && Math.abs(lhn / G - Math.round(lhn / G)) < 0.01;
      const text = first.textContent.trim().slice(0, 40);
      out.push({ tag: el.tagName.toLowerCase() + (el.className ? "." + String(el.className).split(" ")[0] : ""), d: Math.round(d * 10) / 10, lh, lhOk, text });
    }
    return out;
  });
}

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  let total = 0, bad = 0;
  for (const [label, ctx] of [["desktop", { viewport: { width: 1440, height: 900 } }], ["phone", { ...devices["iPhone 13"] }]]) {
    const page = await b.newPage(ctx);
    for (const path of PAGES) {
      await page.goto(base + path, { waitUntil: "load" });
      await page.waitForTimeout(300); // let grid.js re-run after the calculator scripts change heights
      const rows = await check(page);
      const off = rows.filter(r => Math.abs(r.d) > 2 || !r.lhOk);
      total += rows.length; bad += off.length;
      console.log(`${label.padEnd(7)} ${path.padEnd(34)} ${String(rows.length).padStart(3)} lines, ${String(off.length).padStart(3)} off`);
      if (verbose) off.slice(0, 12).forEach(r => console.log(`        ${r.tag.padEnd(22)} d=${String(r.d).padStart(5)} lh=${r.lh.padEnd(7)} ${r.text}`));
    }
    await page.close();
  }
  await b.close();
  console.log(`GRID: ${total - bad}/${total} text lines on the grid (${Math.round((total - bad) / total * 100)}%)`);
  process.exitCode = 0;
})();
