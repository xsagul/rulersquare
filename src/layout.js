const { ICONS } = require("./icons");

const SITE = {
  name: "Ruler Square",
  tagline: "Material & Cost Calculators",
  url: "https://rulersquare.com",
  email: "contact@rulersquare.com",
};

const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
  <path d="M4 4h7v17h17v7H4z" fill="var(--accent)"/>
  <path d="M8 8h2M8 12h2M8 16h2M14 24v2M18 24v2M22 24v2" stroke="var(--accent-ink)" stroke-width="1.6" stroke-linecap="square"/>
</svg>`;

const NAV = [
  ["/construction-calculators/", "Construction", "concrete"],
  ["/landscaping-calculators/", "Landscaping", "mulch"],
  ["/cost-calculators/", "Costs", "asphalt"],
  ["/pay-calculators/", "Pay", "paycheck"],
  ["/about/", "About", "info"],
];

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function layout(page) {
  const canonical = SITE.url + page.path;
  const nav = NAV.slice(0, 4).map(([href, label]) =>
    `<a href="${href}"${href === page.path ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  // The drawer repeats the links with icons, the way a phone menu reads best.
  const drawerNav = NAV.map(([href, label, icon]) =>
    `<a href="${href}"${href === page.path ? ' aria-current="page"' : ""}>${ICONS[icon] || ""}<span>${label}</span></a>`).join("");
  // Search lives in the bar on desktop and inside the menu panel on a phone.
  const search = `<div class="nav-search">
      <label class="sr-only" for="nav-q">Search calculators</label>
      <input id="nav-q" type="search" autocomplete="off" placeholder="Search calculators">
      <ul class="nav-hits" id="nav-hits" hidden></ul>
    </div>`;
  const schema = page.schema ? page.schema.map(s =>
    `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n") : "";
  const crumbs = page.crumbs ? `<p class="crumbs"><a href="/">Home</a> › ${esc(page.crumbs)}</p>` : "";
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
<meta property="og:image" content="${SITE.url}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Ruler Square — material, cost and pay calculators">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${SITE.url}/og.png">
<meta name="twitter:image:alt" content="Ruler Square — material, cost and pay calculators">
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
<aside class="nav-drawer" id="nav-panel" aria-label="Menu" aria-hidden="true">
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
    <span>© ${new Date().getFullYear()} ${SITE.name}. Estimates only — check quantities with your supplier.</span>
    <nav aria-label="Footer"><a href="/about/">About</a><a href="/methodology/">Methodology</a><a href="/contact/">Contact</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></nav>
  </div>
</footer>
<script>window.RS_INDEX=${JSON.stringify(page.index || [])};</script>
<script src="/assets/nav.js?v=${page.version}" defer></script>
${page.scripts || ""}
${page.dev ? `<script src="/assets/devtools.js?v=${page.version}" defer></script>` : ""}
</body>
</html>
`;
}

module.exports = { layout, SITE, LOGO, esc };
