const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { layout, SITE, LOGO } = require("./src/layout");
const { ogImage, faviconImage } = require("./src/og");

// `node build.js --dev` adds the local-only helpers. The deploy build never
// passes it, so devtools.js is not copied and nothing references it.
const DEV = process.argv.includes("--dev");

const OUT = path.join(__dirname, "dist");
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });

// Copy assets and compute a cache-busting version from their contents.
const hash = crypto.createHash("sha1");
for (const f of fs.readdirSync(path.join(__dirname, "src/assets"))) {
  if (f === "devtools.js" && !DEV) { continue; }
  const buf = fs.readFileSync(path.join(__dirname, "src/assets", f));
  hash.update(buf);
  fs.writeFileSync(path.join(OUT, "assets", f), buf);
}
const version = hash.digest("hex").slice(0, 8);

const pages = [
  ...require("./src/pages/other"),
  require("./src/pages/concrete-calculator"),
  ...require("./src/pages/aggregates"),
  ...require("./src/pages/paychecks"),
  ...require("./src/pages/wages"),
  require("./src/pages/square-footage"),
  ...require("./src/pages/categories"),
  ...require("./src/pages/projects"),
  ...require("./src/pages/costs"),
  ...require("./src/pages/tools"),
  require("./src/pages/methodology"),
];

// The search index is derived from the built pages rather than a hand-kept
// list, so a new calculator is searchable the moment it is added.
const NOT_SEARCHABLE = new Set([
  "/", "/about/", "/contact/", "/privacy/", "/terms/", "/404.html", "/methodology/",
  "/construction-calculators/", "/landscaping-calculators/",
  "/pay-calculators/", "/cost-calculators/",
]);
const SEARCH_INDEX = pages
  .filter(p => !NOT_SEARCHABLE.has(p.path) && !p.noSitemap)
  .map(p => ({
    u: p.path,
    t: (p.crumbs || p.title).replace(/\s*[|–-]\s*Ruler Square.*$/, ""),
    d: (p.description || "").slice(0, 110),
    k: [p.path.replace(/[/-]/g, " "), p.description, (require("./src/pages/other").ALL.find(item => item[0] === p.path) || [])[4]].filter(Boolean).join(" ").replace(/[-–—]/g, " ").trim(),
  }));

for (const p of pages) {
  const html = layout({ ...p, version, dev: DEV, index: SEARCH_INDEX }).replace(/VERSION/g, version);
  const file = p.path.endsWith(".html")
    ? path.join(OUT, p.path)
    : path.join(OUT, p.path, "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

// favicon
fs.writeFileSync(path.join(OUT, "favicon.svg"),
  LOGO.replace('aria-hidden="true" focusable="false"', 'xmlns="http://www.w3.org/2000/svg"')
      .replace(/var\(--accent\)/g, "#c2410c").replace(/var\(--accent-ink\)/g, "#ffffff"));

// Open Graph card
fs.writeFileSync(path.join(OUT, "og.png"), ogImage());
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

// Cloudflare Pages headers: long cache for versioned assets, security basics.
fs.writeFileSync(path.join(OUT, "_headers"), `/assets/*
  Cache-Control: public, max-age=31536000, immutable
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: camera=(), microphone=(), geolocation=()
`);

console.log(`Built ${pages.length} pages, version ${version}${DEV ? " [DEV: translate button on]" : ""}`);
