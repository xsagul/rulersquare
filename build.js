const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { layout, embedLayout, SITE, LOGO } = require("./src/layout");
const { ogImage, faviconImage } = require("./src/og");

// `node build.js --dev` adds the local-only helpers. The deploy build never
// passes it, so devtools.js is not copied and nothing references it.
const DEV = process.argv.includes("--dev");

const OUT = path.join(__dirname, "dist");
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });

const pages = [
  ...require("./src/pages/other"),
  require("./src/pages/concrete-calculator"),
  ...require("./src/pages/aggregates"),
  require("./src/pages/square-footage"),
  ...require("./src/pages/categories"),
  ...require("./src/pages/projects"),
  ...require("./src/pages/costs"),
  ...require("./src/pages/tools"),
  require("./src/pages/methodology"),
];

// The search index is derived from the built pages rather than a hand-kept
// list, so a new calculator is searchable the moment it is added. Served once
// as a cacheable JSON file instead of being inlined into every HTML page.
const NOT_SEARCHABLE = new Set([
  "/", "/about/", "/contact/", "/privacy/", "/terms/", "/404.html", "/methodology/",
  "/construction-calculators/", "/landscaping-calculators/",
  "/home-systems-calculators/", "/cost-calculators/",
]);
const ALL_META = new Map(require("./src/pages/other").ALL.map(item => [item[0], item[4] || ""]));
const SEARCH_INDEX = pages
  .filter(p => !NOT_SEARCHABLE.has(p.path) && !p.noSitemap)
  .map(p => ({
    u: p.path,
    t: (p.crumbs || p.title).replace(/\s*[|–-]\s*Ruler Square.*$/, ""),
    d: (p.description || "").slice(0, 110),
    k: [p.path.replace(/[/-]/g, " "), ALL_META.get(p.path)].filter(Boolean).join(" ").replace(/\s+/g, " ").trim(),
  }));
const searchJson = Buffer.from(JSON.stringify(SEARCH_INDEX));

// Copy assets and compute a cache-busting version from their contents + search index.
const hash = crypto.createHash("sha1");
for (const f of fs.readdirSync(path.join(__dirname, "src/assets")).sort()) {
  if (f === "devtools.js" && !DEV) { continue; }
  const buf = fs.readFileSync(path.join(__dirname, "src/assets", f));
  hash.update(buf);
  fs.writeFileSync(path.join(OUT, "assets", f), buf);
}
hash.update(searchJson);
fs.writeFileSync(path.join(OUT, "assets", "search-index.json"), searchJson);
const version = hash.digest("hex").slice(0, 8);

let embedCount = 0;
for (const p of pages) {
  const html = layout({ ...p, version, dev: DEV }).replace(/VERSION/g, version);
  const file = p.path.endsWith(".html")
    ? path.join(OUT, p.path)
    : path.join(OUT, p.path, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);

  if (p.isCalculator) {
    const embedHtml = embedLayout({ ...p, version });
    if (embedHtml) {
      const embedFile = path.join(OUT, "embed", p.path, "index.html");
      fs.mkdirSync(path.dirname(embedFile), { recursive: true });
      fs.writeFileSync(embedFile, embedHtml.replace(/VERSION/g, version));
      embedCount++;
    }
  }
}

// favicon
fs.writeFileSync(path.join(OUT, "favicon.svg"),
  LOGO.replace('aria-hidden="true" focusable="false"', 'xmlns="http://www.w3.org/2000/svg"')
      .replace(/var\(--accent\)/g, "#c2410c").replace(/var\(--accent-ink\)/g, "#ffffff"));

// Files served as-is from the site root: the IndexNow key, llms.txt.
for (const f of fs.readdirSync(path.join(__dirname, "src/public"))) {
  fs.copyFileSync(path.join(__dirname, "src/public", f), path.join(OUT, f));
}

// Per-category Open Graph cards (1200x630 PNG)
fs.writeFileSync(path.join(OUT, "og.png"), ogImage("BUILDING MATERIAL & COST CALCULATORS", "FREE US HOME PROJECT TOOLS"));
fs.writeFileSync(path.join(OUT, "og-construction.png"), ogImage("CONSTRUCTION & CONCRETE CALCULATORS", "RULER SQUARE CONSTRUCTION"));
fs.writeFileSync(path.join(OUT, "og-landscaping.png"), ogImage("LANDSCAPING SOIL & GRAVEL CALCULATORS", "RULER SQUARE LANDSCAPING"));
fs.writeFileSync(path.join(OUT, "og-systems.png"), ogImage("HVAC BTU POWER & WATER CALCULATORS", "RULER SQUARE HOME SYSTEMS"));
fs.writeFileSync(path.join(OUT, "og-costs.png"), ogImage("HOME PROJECT COST CALCULATORS", "US BENCHMARK BUDGETS"));

// Google Search supports raster favicons and recommends a multiple of 48 px.
fs.writeFileSync(path.join(OUT, "favicon.png"), faviconImage());

// sitemap + robots
// lastmod is declared per page, not stamped at build time: rebuilding the site
// is not a content change, and a sitemap that claims otherwise gets ignored.
const urls = pages.filter(p => !p.noSitemap)
  .map(p => `  <url><loc>${SITE.url}${p.path}</loc>${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ""}</url>`).join("\n");
fs.writeFileSync(path.join(OUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);

// Cloudflare's asset handler otherwise uses a temporary 307 when adding a
// trailing slash. These explicit permanent redirects reinforce one URL shape.
const redirects = pages
  .filter(p => p.path !== "/" && p.path.endsWith("/") && !p.noSitemap)
  .map(p => `${p.path.slice(0, -1)} ${p.path} 301`)
  .join("\n");
fs.writeFileSync(path.join(OUT, "_redirects"), redirects + "\n");

// Cloudflare headers: long cache for versioned assets, security basics,
// and frame-ancestors allowance on /embed/* widgets.
fs.writeFileSync(path.join(OUT, "_headers"), `/assets/*
  Cache-Control: public, max-age=31536000, immutable
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: camera=(), microphone=(), geolocation=()
/embed/*
  ! X-Frame-Options
  Content-Security-Policy: frame-ancestors *
`);

console.log(`Built ${pages.length} pages + ${embedCount} embed widgets, search-index ${(searchJson.length / 1024).toFixed(1)} KB, version ${version}${DEV ? " [DEV: translate button on]" : ""}`);
