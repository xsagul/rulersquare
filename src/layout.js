const { ICONS } = require("./icons");

const SITE = {
  name: "Ruler Square",
  tagline: "Material, Home System & Project Cost Calculators",
  url: "https://rulersquare.com",
  email: "contact@rulersquare.com",
};

const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
  <path d="M4 4h7v17h17v7H4z" fill="var(--accent)"/>
  <path d="M8 8h2M8 12h2M8 16h2M14 24v2M18 24v2M22 24v2" stroke="var(--accent-ink)" stroke-width="1.6" stroke-linecap="square"/>
</svg>`;

const NAV = [
  ["/construction-calculators/", "Construction", "construction"],
  ["/landscaping-calculators/", "Landscaping", "mulch"],
  ["/home-systems-calculators/", "Home Systems", "hvac"],
  ["/cost-calculators/", "Costs", "cost"],
  ["/about/", "About", "info"],
];

const OG_BY_CAT = {
  construction: "/og-construction.png",
  landscaping: "/og-landscaping.png",
  systems: "/og-systems.png",
  cost: "/og-costs.png",
};

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderCrumbs(page) {
  if (page.breadcrumbs && page.breadcrumbs.length) {
    const parts = page.breadcrumbs.map((item, i) =>
      i < page.breadcrumbs.length - 1 && item.href
        ? `<a href="${item.href}">${esc(item.name)}</a>`
        : esc(item.name));
    return `<nav class="crumbs" aria-label="Breadcrumb">${parts.join(" › ")}</nav>`;
  }
  if (page.crumbs) {
    return `<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> › ${esc(page.crumbs)}</nav>`;
  }
  return "";
}

function layout(page) {
  const canonical = SITE.url + page.path;
  const ogImg = SITE.url + (page.ogImage || OG_BY_CAT[page.category] || "/og.png");
  const nav = NAV.map(([href, label]) =>
    `<a href="${href}"${href === page.path ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  const drawerNav = NAV.map(([href, label, icon]) =>
    `<a href="${href}"${href === page.path ? ' aria-current="page"' : ""}>${ICONS[icon] || ""}<span>${label}</span></a>`).join("");
  const search = `<div class="nav-search">
      <label class="sr-only" for="nav-q">Search calculators</label>
      ${ICONS.search}
      <input id="nav-q" type="search" autocomplete="off" placeholder="Search calculators">
      <ul class="nav-hits" id="nav-hits" hidden></ul>
    </div>`;
  const schema = page.schema ? page.schema.map(s =>
    `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n") : "";
  const crumbs = renderCrumbs(page);
  const isCalc = /id="(?:material|concrete|area|project)-form"/.test(page.body);
  return `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImg}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(page.title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${ogImg}">
<meta name="twitter:image:alt" content="${esc(page.title)}">
<meta name="theme-color" content="#c2410c">
<link rel="icon" href="/favicon.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="/favicon.png">
<link rel="stylesheet" href="/assets/style.css?v=${page.version}">
${page.robots ? `<meta name="robots" content="${page.robots}">` : ""}
${schema}
</head>
<body>
<a class="skip-link" href="#main-content">Skip to content</a>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/">${LOGO}<span>${SITE.name}</span></a>
    ${search}
    <nav class="nav" aria-label="Main">${nav}</nav>
    <button type="button" class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="nav-panel" aria-label="Open menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>
<div class="nav-backdrop" id="nav-backdrop" hidden></div>
<aside class="nav-drawer" id="nav-panel" role="dialog" aria-modal="true" aria-label="Menu" aria-hidden="true" inert>
  <div class="nav-drawer-head">
    <button type="button" class="nav-close" id="nav-close" aria-label="Close menu">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
  </div>
  <div class="nav-drawer-search">
    <label class="sr-only" for="drawer-q">Search calculators</label>
    ${ICONS.search}
    <input id="drawer-q" type="search" autocomplete="off" placeholder="Search calculators">
    <ul class="nav-hits" id="drawer-hits" hidden></ul>
  </div>
  <p class="nav-drawer-label">Calculators</p>
  <nav class="nav-drawer-links">${drawerNav}</nav>
</aside>
<main class="wrap" id="main-content">
${crumbs}
${page.body}
</main>
<footer class="site-footer">
  <div class="wrap">
    <span>© ${new Date().getFullYear()} ${SITE.name}. Planning estimates — verify quantities, specs and local codes before ordering or building.</span>
    <nav aria-label="Footer"><a href="/about/">About</a><a href="/methodology/">Methodology</a><a href="/contact/">Contact</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav>
  </div>
</footer>
<script>window.RS_INDEX_URL="/assets/search-index.json?v=${page.version}";</script>
<script src="/assets/nav.js?v=${page.version}" defer></script>
${isCalc ? `<script src="/assets/calc-ui.js?v=${page.version}" defer></script>` : ""}
${page.scripts || ""}
${page.dev ? `<script src="/assets/devtools.js?v=${page.version}" defer></script>` : ""}
</body>
</html>
`;
}

/* Lightweight frameless calculator view for third-party embeds. Marked noindex
 * so it never competes with the full page, while pointing canonical to the main URL. */
function embedLayout(page) {
  const canonical = SITE.url + page.path;
  const formMatch = page.body.match(/<form class="calc"[\s\S]*?<\/form>/);
  const tplMatch = page.body.match(/<template id="section-tpl">[\s\S]*?<\/template>/);
  const h1Match = page.body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const h1 = h1Match ? h1Match[1] : page.crumbs || page.title;
  if (!formMatch) return null;
  return `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(h1)} | ${SITE.name} Widget</title>
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${canonical}">
<link rel="stylesheet" href="/assets/style.css?v=${page.version}">
</head>
<body class="embed-page">
<main class="embed-wrap" id="main-content">
  <div class="embed-head">
    <h1>${h1}</h1>
    <a href="${canonical}" target="_blank" rel="noopener">Full guide &amp; tables ↗</a>
  </div>
  ${tplMatch ? tplMatch[0] : ""}
  ${formMatch[0]}
</main>
<script src="/assets/calc-ui.js?v=${page.version}" defer></script>
${page.scripts || ""}
</body>
</html>
`;
}

function embedSnippet(path, name) {
  const full = SITE.url + path;
  const embedUrl = SITE.url + "/embed" + path;
  const code = `<iframe src="${embedUrl}" width="100%" height="580" style="border:1px solid #dcd8cc;border-radius:10px" loading="lazy" title="${esc(name)}"></iframe>\n<p style="font-size:13px;margin:6px 0 0">Powered by <a href="${full}">${esc(name)} on Ruler Square</a></p>`;
  return `<details class="embed-box">
  <summary>Embed this calculator on your website (free)</summary>
  <p class="note">Copy the snippet below to add this calculator to a contractor site, blog or project guide. Inputs stay in the visitor’s browser.</p>
  <textarea class="embed-code" readonly rows="4" aria-label="Embed HTML code">${esc(code)}</textarea>
  <button type="button" class="btn-chip" data-copy-embed>Copy embed code</button>
</details>`;
}

module.exports = { layout, embedLayout, embedSnippet, SITE, LOGO, esc };
