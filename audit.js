/* Build-output audit for the things that most often break discovery after a
 * seemingly harmless template edit: canonicals, sitemap membership, internal
 * links, metadata, JSON-LD, embeds, US English, empty inputs and social assets. */
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
  console.error("dist is missing; run node build.js first");
  process.exit(1);
}

walk(OUT);
const routeToFile = new Map(htmlFiles.map(file => [routeFor(file), file]));
const seenTitles = new Map();
const seenDescriptions = new Map();
const indexableRoutes = new Set();
const embedRoutes = new Set();
const inboundLinks = new Map();
const homeLinks = new Set();

const UK_SPELLING = /\b(colour|coloured|colours|centre|centres|labour|metres|metre|litres|litre|licence|minimise|levelling|storey|storeys|tyres|tyre|catalogue|grey)\b/i;
const COMPETITOR_LINK = /href="https?:\/\/(?:www\.)?(?:inchcalculator\.com|calculator\.net|calculatorsoup\.com|homedepot\.com|lowes\.com)/i;
const EMPTY_MEASUREMENT_NAMES = new Set([
  "length", "width", "area", "areaFt2", "diameter", "totalRise", "rise", "run",
  "quantity", "wallWidth", "cost", "rate", "hours", "runningWatts", "stepWidth",
  "amount", "posts", "units", "people", "fLength", "fWidth", "fDepth",
  "cDiameter", "cThickness", "curbLength", "curbDepth", "curbHeight",
  "gutterWidth", "flagThickness", "stepCount", "aFeet", "bFeet",
]);

for (const file of htmlFiles) {
  const route = routeFor(file);
  const isEmbed = route.startsWith("/embed/");
  const html = fs.readFileSync(file, "utf8");
  const titles = matches(html, /<title>([\s\S]*?)<\/title>/g);
  const descriptions = matches(html, /<meta name="description" content="([^"]*)">/g);
  const canonicals = matches(html, /<link rel="canonical" href="([^"]+)">/g);
  const h1s = matches(html, /<h1\b/g);
  const noindex = /<meta name="robots" content="[^"]*noindex/i.test(html);

  if (titles.length !== 1 || !titles[0][1].trim()) { fail(`${route}: needs one non-empty title`); }
  if (!isEmbed && (descriptions.length !== 1 || !descriptions[0][1].trim())) { fail(`${route}: needs one meta description`); }
  if (canonicals.length !== 1) { fail(`${route}: needs one canonical`); }
  if (h1s.length !== 1) { fail(`${route}: expected one h1, found ${h1s.length}`); }
  if (html.includes("VERSION")) { fail(`${route}: unresolved asset version token`); }
  if (html.includes("window.RS_INDEX=")) { fail(`${route}: inline RS_INDEX bloat detected (use /assets/search-index.json)`); }
  if (html.includes("[object Object]")) { fail(`${route}: an object was stringified into the markup`); }

  const prose = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, "");
  if (route !== "/about/" && /salariile\.ro/i.test(prose)) {
    fail(`${route}: salary-site reference outside /about/`);
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

  if (isEmbed) {
    embedRoutes.add(route);
    if (!noindex) { fail(`${route}: embed widget must be noindex`); }
    const parentRoute = route.slice("/embed".length);
    if (canonicals.length === 1 && canonicals[0][1] !== SITE + parentRoute) {
      fail(`${route}: embed canonical should point to ${SITE + parentRoute}, got ${canonicals[0][1]}`);
    }
  } else {
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

    const plainText = prose.replace(/<[^>]+>/g, " ");
    const ukMatch = plainText.match(UK_SPELLING);
    if (ukMatch) { fail(`${route}: UK spelling "${ukMatch[1]}" found in prose`); }
    if (COMPETITOR_LINK.test(prose)) { fail(`${route}: outbound link to direct calculator competitor`); }

    const relatedBlock = html.match(/<ul class="related-links">([\s\S]*?)<\/ul>/);
    if (relatedBlock) {
      const relLinks = matches(relatedBlock[1], /href="([^"]+)"/g).map(m => m[1]);
      if (new Set(relLinks).size !== relLinks.length) { fail(`${route}: duplicate links in related-links`); }
    }

    const formMatch = html.match(/<form class="calc"[\s\S]*?<\/form>/);
    if (formMatch) {
      for (const tag of matches(formMatch[0], /<input\b[^>]*>/g)) {
        const attrs = tag[0];
        if (!/type="number"/.test(attrs)) continue;
        const nameM = attrs.match(/\bname="([^"]+)"/);
        const valM = attrs.match(/\bvalue="([^"]*)"/);
        if (nameM && EMPTY_MEASUREMENT_NAMES.has(nameM[1]) && valM && valM[1].trim() !== "") {
          fail(`${route}: measurement input "${nameM[1]}" must start empty, found value="${valM[1]}"`);
        }
      }
    }
  }

  for (const script of matches(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(script[1]); }
    catch (error) { fail(`${route}: invalid JSON-LD (${error.message})`); }
  }

  const pageOutLinks = new Set();
  for (const link of matches(html, /(?:href|src)="(\/[^"]*)"/g)) {
    const target = link[1].split(/[?#]/)[0];
    if (!target || target === "/") { continue; }
    if (target.endsWith("/")) {
      if (!routeToFile.has(target)) { fail(`${route}: broken page link ${target}`); }
      else if (!isEmbed && !noindex && target !== route) {
        pageOutLinks.add(target);
        if (route === "/") homeLinks.add(target);
      }
    } else {
      const asset = path.join(OUT, target.slice(1));
      if (!routeToFile.has(target) && !fs.existsSync(asset)) { fail(`${route}: missing asset ${target}`); }
    }
  }
  for (const target of pageOutLinks) {
    inboundLinks.set(target, (inboundLinks.get(target) || 0) + 1);
  }
}

const sitemap = fs.readFileSync(path.join(OUT, "sitemap.xml"), "utf8");
const { ALL } = require("./src/pages/other");
const { CATEGORIES } = require("./src/pages/categories");
const calculatorRoutes = new Set(ALL.map(item => item[0]));
for (const slug of ["paycheck-calculator", "texas-paycheck-calculator", "florida-paycheck-calculator", "salary-to-hourly-calculator", "annual-income-calculator", "pay-rate-calculator", "pay-calculators"]) {
  if (routeToFile.has(`/${slug}/`)) fail(`${slug}: retired pay page is still being built`);
}
const hubRoutes = new Set(CATEGORIES.flatMap(cat => cat.groups.flatMap(group => group.items.map(item => item[0]))));
for (const route of calculatorRoutes) {
  if (!routeToFile.has(route)) fail(`${route}: catalogue entry has no page`);
  if (!hubRoutes.has(route)) fail(`${route}: calculator missing from category hubs`);
  if (!embedRoutes.has("/embed" + route)) fail(`${route}: missing /embed widget page`);
  if (!homeLinks.has(route)) fail(`${route}: missing direct link from homepage directory`);
  const inCount = inboundLinks.get(route) || 0;
  if (inCount < 3) fail(`${route}: weak internal linking (${inCount} inbound links, need >= 3)`);
}
for (const route of hubRoutes) {
  if (!calculatorRoutes.has(route)) fail(`${route}: category entry missing from calculator catalogue`);
}

const searchIndexPath = path.join(OUT, "assets", "search-index.json");
if (!fs.existsSync(searchIndexPath)) {
  fail("assets/search-index.json is missing");
} else {
  const searchRoutes = new Set(JSON.parse(fs.readFileSync(searchIndexPath, "utf8")).map(item => item.u));
  if (searchRoutes.size !== calculatorRoutes.size || [...calculatorRoutes].some(route => !searchRoutes.has(route))) {
    fail("Search index and calculator catalogue differ");
  }
}

const homeHtml = fs.readFileSync(path.join(OUT, "index.html"), "utf8");
if (!homeHtml.includes(`${calculatorRoutes.size} free calculators`)) fail("Homepage calculator count is out of date");

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

const headers = fs.readFileSync(path.join(OUT, "_headers"), "utf8");
if (!headers.includes("/embed/*") || !headers.includes("frame-ancestors *")) {
  fail("_headers: missing /embed/* framing header");
}

function checkPng(name, width, height) {
  const p = path.join(OUT, name);
  if (!fs.existsSync(p)) { fail(`${name}: file missing`); return; }
  const png = fs.readFileSync(p);
  if (png.toString("ascii", 1, 4) !== "PNG") { fail(`${name}: not a PNG`); return; }
  if (png.readUInt32BE(16) !== width || png.readUInt32BE(20) !== height) {
    fail(`${name}: expected ${width}x${height}`);
  }
}
checkPng("favicon.png", 192, 192);
checkPng("og.png", 1200, 630);
checkPng("og-construction.png", 1200, 630);
checkPng("og-landscaping.png", 1200, 630);
checkPng("og-systems.png", 1200, 630);
checkPng("og-costs.png", 1200, 630);

if (failures.length) {
  console.error(`Site audit failed (${failures.length}):`);
  for (const message of failures) { console.error("- " + message); }
  process.exit(1);
}

const minInbound = Math.min(...[...calculatorRoutes].map(r => inboundLinks.get(r) || 0));
console.log(`Site audit passed: ${htmlFiles.length} HTML files (${indexableRoutes.size} indexable + ${embedRoutes.size} embeds), ${calculatorRoutes.size} calculators, min inbound links = ${minInbound}, 0 broken links, 0 UK spellings, all measurement inputs empty on load.`);
