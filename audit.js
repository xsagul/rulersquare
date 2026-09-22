/* Build-output audit for the things that most often break discovery after a
 * seemingly harmless template edit: canonicals, sitemap membership, internal
 * links, metadata, JSON-LD and social assets. Run with `npm run check`. */
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "dist");
const SITE = "https://rulersquare.com";
const failures = [];
const htmlFiles = [];

function fail(message) { failures.push(message); }
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(file); }
    else if (file.endsWith(".html")) { htmlFiles.push(file); }
  }
}
function routeFor(file) {
  const rel = path.relative(OUT, file).replaceAll("\\", "/");
  if (rel === "index.html") { return "/"; }
  if (rel.endsWith("/index.html")) { return "/" + rel.slice(0, -"index.html".length); }
  return "/" + rel;
}
function matches(html, regex) { return Array.from(html.matchAll(regex)); }

if (!fs.existsSync(OUT)) {
  console.error("dist is missing; run npm run build first");
  process.exit(1);
}

walk(OUT);
const routeToFile = new Map(htmlFiles.map(file => [routeFor(file), file]));
const seenTitles = new Map();
const seenDescriptions = new Map();
const indexableRoutes = new Set();

for (const file of htmlFiles) {
  const route = routeFor(file);
  const html = fs.readFileSync(file, "utf8");
  const titles = matches(html, /<title>([\s\S]*?)<\/title>/g);
  const descriptions = matches(html, /<meta name="description" content="([^"]*)">/g);
  const canonicals = matches(html, /<link rel="canonical" href="([^"]+)">/g);
  const h1s = matches(html, /<h1\b/g);
  const noindex = /<meta name="robots" content="[^"]*noindex/i.test(html);

  if (titles.length !== 1 || !titles[0][1].trim()) { fail(`${route}: needs one non-empty title`); }
  if (descriptions.length !== 1 || !descriptions[0][1].trim()) { fail(`${route}: needs one meta description`); }
  if (canonicals.length !== 1) { fail(`${route}: needs one canonical`); }
  if (h1s.length !== 1) { fail(`${route}: expected one h1, found ${h1s.length}`); }
  if (html.includes("VERSION")) { fail(`${route}: unresolved asset version token`); }
  // An options object passed in the `value` argument of a field factory
  // stringifies into the markup. A number input silently ignores it, so the
  // page looks right and the mistake survives until someone reads the HTML.
  if (html.includes("[object Object]")) { fail(`${route}: an object was stringified into the markup`); }
  // salariile.ro is the author's other calculator site. It belongs in the
  // Person schema's sameAs, which is how a byline becomes a checkable
  // identity, and in the about page's account of who maintains this. Anywhere
  // else it is a leak from the other codebase rather than a deliberate link.
  const prose = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  if (route !== "/about/" && /salariile\.ro/i.test(prose)) {
    fail(`${route}: salary-site reference outside the author schema`);
  }
  const ids = matches(html, /\bid="([^"]+)"/g).map(m => m[1]);
  const idSet = new Set(ids);
  if (ids.length !== idSet.size) { fail(`${route}: duplicate element IDs`); }
  for (const label of matches(html, /\bfor="([^"]+)"/g)) {
    if (!idSet.has(label[1])) fail(`${route}: label has no target ${label[1]}`);
  }
  for (const anchor of matches(html, /href="#([^"]+)"/g)) {
    if (!idSet.has(anchor[1])) fail(`${route}: missing section ${anchor[1]}`);
  }

  if (titles.length === 1) {
    const title = titles[0][1];
    if (seenTitles.has(title)) { fail(`${route}: duplicate title with ${seenTitles.get(title)}`); }
    seenTitles.set(title, route);
  }
  if (descriptions.length === 1 && !noindex) {
    const description = descriptions[0][1];
    if (seenDescriptions.has(description)) { fail(`${route}: duplicate description with ${seenDescriptions.get(description)}`); }
    seenDescriptions.set(description, route);
  }
  if (canonicals.length === 1 && canonicals[0][1] !== SITE + route) {
    fail(`${route}: canonical is ${canonicals[0][1]}`);
  }
  if (!noindex) { indexableRoutes.add(route); }

  for (const script of matches(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(script[1]); }
    catch (error) { fail(`${route}: invalid JSON-LD (${error.message})`); }
  }

  for (const link of matches(html, /(?:href|src)="(\/[^"]*)"/g)) {
    const target = link[1].split(/[?#]/)[0];
    if (!target || target === "/") { continue; }
    if (target.endsWith("/")) {
      if (!routeToFile.has(target)) { fail(`${route}: broken page link ${target}`); }
    } else {
      const asset = path.join(OUT, target.slice(1));
      if (!routeToFile.has(target) && !fs.existsSync(asset)) { fail(`${route}: missing asset ${target}`); }
    }
  }
}

const sitemap = fs.readFileSync(path.join(OUT, "sitemap.xml"), "utf8");
const { ALL } = require("./src/pages/other");
const { CATEGORIES } = require("./src/pages/categories");
const calculatorRoutes = new Set(ALL.map(item => item[0]));
const hubRoutes = new Set(CATEGORIES.flatMap(cat => cat.groups.flatMap(group => group.items.map(item => item[0]))));
for (const route of calculatorRoutes) {
  if (!routeToFile.has(route)) fail(`${route}: catalogue entry has no page`);
  if (!hubRoutes.has(route)) fail(`${route}: calculator missing from category hubs`);
}
const homeHtml = fs.readFileSync(path.join(OUT, "index.html"), "utf8");
const searchMatch = homeHtml.match(/window\.RS_INDEX=([\s\S]*?);<\/script>/);
const searchRoutes = searchMatch ? new Set(JSON.parse(searchMatch[1]).map(item => item.u)) : new Set();
if (searchRoutes.size !== calculatorRoutes.size || [...calculatorRoutes].some(route => !searchRoutes.has(route))) fail("Search index and calculator catalogue differ");
if (!homeHtml.includes(`${calculatorRoutes.size} free calculators`)) fail("Homepage calculator count is out of date");
if (searchMatch && !JSON.parse(searchMatch[1]).some(item => item.u === "/paycheck-calculator/" && item.k.includes("take home"))) fail("Search index: take-home pay synonym missing");
const sitemapRoutes = new Set(matches(sitemap, /<loc>https:\/\/rulersquare\.com([^<]*)<\/loc>/g).map(m => m[1]));
for (const route of indexableRoutes) {
  if (!sitemapRoutes.has(route)) { fail(`${route}: indexable but absent from sitemap`); }
}
for (const route of sitemapRoutes) {
  if (!indexableRoutes.has(route)) { fail(`${route}: in sitemap but not indexable`); }
}

const robots = fs.readFileSync(path.join(OUT, "robots.txt"), "utf8");
if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) { fail("robots.txt: sitemap line missing"); }
if (!/User-agent: \*\s+Allow: \//m.test(robots)) { fail("robots.txt: Google is not explicitly allowed"); }

const redirects = fs.readFileSync(path.join(OUT, "_redirects"), "utf8");
for (const route of indexableRoutes) {
  if (route !== "/" && !redirects.includes(`${route.slice(0, -1)} ${route} 301`)) {
    fail(`${route}: permanent trailing-slash redirect missing`);
  }
}

function checkPng(name, width, height) {
  const png = fs.readFileSync(path.join(OUT, name));
  if (png.toString("ascii", 1, 4) !== "PNG") { fail(`${name}: not a PNG`); return; }
  if (png.readUInt32BE(16) !== width || png.readUInt32BE(20) !== height) {
    fail(`${name}: expected ${width}x${height}`);
  }
}
checkPng("favicon.png", 192, 192);
checkPng("og.png", 1200, 630);

if (failures.length) {
  console.error(`Site audit failed (${failures.length}):`);
  for (const message of failures) { console.error("- " + message); }
  process.exit(1);
}

console.log(`Site audit passed: ${htmlFiles.length} HTML pages, ${indexableRoutes.size} indexable URLs, no broken internal links.`);
