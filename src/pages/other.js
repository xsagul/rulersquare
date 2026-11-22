const { SITE } = require("../layout");
const { ICONS } = require("../icons");
const { AUTHOR, PERSON_ID, ORG_ID, personSchema, UPDATED } = require("../author");

const table = (head, rows) => `<div class="table-wrap"><table>
  <thead><tr>${head.map(h => `<th scope="col">${h}</th>`).join("")}</tr></thead>
  <tbody>${rows.map(r => `<tr>${r.map((c, i) => i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
</table></div>`;

const { ALL } = require("../data/catalog");
const { CATEGORIES } = require("./categories");

const { GROUPS } = require("../data/groups");
const { COST_HREFS } = require("./categories");
const BY_HREF = new Map(ALL.map(([href, title]) => [href, [href, title]]));

const home = {
  path: "/",
  title: "Ruler Square – Free Building Material & Cost Calculators",
  description: `Free US construction, landscaping, home systems and 2026 project cost calculators (${ALL.length} tools). Live estimates, formulas, charts and printable lists.`,
  lastmod: UPDATED.iso,
  schema: [{
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization", "@id": ORG_ID, name: SITE.name,
        url: SITE.url + "/", logo: { "@type": "ImageObject", url: SITE.url + "/og.png" },
        email: SITE.email, founder: { "@id": PERSON_ID },
      },
      personSchema,
      {
        "@type": "WebSite", "@id": SITE.url + "/#website",
        url: SITE.url + "/", name: SITE.name, inLanguage: "en-US",
        publisher: { "@id": ORG_ID },
      },
    ],
  }],
  body: `
<section class="home-top">
  <h1>Construction &amp; Home Project Calculators</h1>
  <p class="lede">${ALL.length} free calculators for materials, installed costs and measurements, grouped by project.</p>
  <div class="search">
    <label class="sr-only" for="q">Search calculators</label>
    ${ICONS.search}
    <input id="q" type="search" autocomplete="off" placeholder="Search ${ALL.length} calculators">
  </div>
  <ul class="search-hits" id="hits" hidden></ul>
</section>

<div id="browse">
<section class="home-groups" aria-labelledby="pg-title">
  <h2 id="pg-title">Project calculators</h2>
  ${GROUPS.map((g, gi) => {
    const items = g.items.map(s => BY_HREF.get(`/${s}/`)).filter(Boolean);
    const qty = items.filter(([h]) => !COST_HREFS.has(h));
    const cost = items.filter(([h]) => COST_HREFS.has(h));
    const ul = list => `<ul class="g-list">${list.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>`;
    return `<details class="g-row" id="g-${g.id}">
    <summary><img class="g-draw" src="/assets/g-${g.img}.webp?v=VERSION" alt="" width="180" height="120" ${gi < 4 ? `loading="eager" decoding="sync"${gi === 0 ? ' fetchpriority="high"' : ""}` : 'loading="lazy" decoding="async"'}><span class="g-name">${g.name}<small>${items.length} calculators</small></span><span class="g-chev" aria-hidden="true"></span></summary>
    <div class="g-body">
      ${qty.length ? `${cost.length ? '<h3 class="g-sub">Materials &amp; layout</h3>' : ""}${ul(qty)}` : ""}
      ${cost.length ? `<h3 class="g-sub">Installed costs</h3>${ul(cost)}` : ""}
    </div>
  </details>`;
  }).join("\n  ")}
  <p class="g-all"><a href="/construction-calculators/">All calculators on one page</a> · <a href="/cost-calculators/">All cost calculators</a></p>
</section>
</div>
`,
  scripts: `<script src="/assets/search.js?v=VERSION" defer></script>`,
};

const about = {
  path: "/about/",
  title: "About Ruler Square | Material & Cost Calculators",
  description: "How Ruler Square builds transparent, fast, ad-light construction, landscaping, home systems and cost calculators with open formulas.",
  crumbs: "About",
  breadcrumbs: [{ name: "Home", href: "/" }, { name: "About" }],
  lastmod: UPDATED.iso,
  schema: [
    {
      "@context": "https://schema.org", "@type": "AboutPage",
      url: SITE.url + "/about/", name: "About Ruler Square",
      mainEntity: { "@id": ORG_ID },
      publisher: { "@id": ORG_ID },
      dateModified: UPDATED.iso,
    },
    { "@context": "https://schema.org", ...personSchema },
  ],
  body: `
<div class="prose">
<h1>About Ruler Square</h1>
<p class="lede">Fast, transparent calculators for US building materials, landscaping, home systems and project budgets.</p>

<h2>Why Ruler Square exists</h2>
<p>Most online construction calculators give you a single mystery number with hidden assumptions—you cannot tell what gravel density, concrete bag yield, or labor scope went into the answer. Every Ruler Square calculator shows its exact formula, lets you adjust every density, coverage rate or price tier, and works directly in your browser with no account required.</p>

<h2>How calculations are verified</h2>
<ul>
  <li>Every calculator follows US standard definitions (NIST), model residential codes (IRC/ADA), and published trade manuals (ACI, AWC, SMACNA, HVI, ENERGY STAR, USDA NRCS).</li>
  <li>Every material order rounds <strong>up</strong> to whole bags, sheets, rolls or standard delivery increments so you do not run short mid-project.</li>
  <li>Automated tests check every calculation engine, unit conversion, worked example and reference table before deployment.</li>
</ul>
<p>See the full technical breakdown on our <a href="/methodology/">Methodology page</a>.</p>

<h2>Who builds and maintains it</h2>
<p>Ruler Square is built and maintained by ${AUTHOR.name}, a software engineer focused on fast, zero-bloat web calculators. The <a href="https://github.com/xsagul/rulersquare" rel="noopener">calculator source code</a> is public on GitHub so anyone can inspect the formulas.</p>

<h2>Independent &amp; free</h2>
<p>All ${ALL.length} calculators—including our embeddable website widgets—are free to use with no paywall, account signup or contractor lead-selling forms. Display advertising may support hosting and maintenance; see our <a href="/privacy/">Privacy Policy</a>.</p>

<h2>Changelog &amp; corrections</h2>
<p>Spotted an error or want a new calculator? Email <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
${table(["Date", "Update"], [
  ["November 22, 2026", "Reorganized every calculator into 10 project groups. Siding now works from wall and gable sizes with doors and windows; drywall adds screws, joint compound and tape; deck adds joist spacing, screws and hidden clips; retaining wall adds leveling-pad and drainage stone; fence adds post length, hole depth and concrete; tile counts the grout joint; board and batten lists every batten mark. New tables: soil weight and swell, fill dirt vs topsoil, mulch types, laminate AC ratings, cubic-yard coverage, carpet stairs and pad, drywall finish levels, slab cost by project, driveway surfaces compared. Fixed the concrete calculator's example button."],
  ["November 19, 2026", `Expanded catalog to ${ALL.length} calculators with a new Home Systems hub (BTU, firewood, generator, water heater, dehumidifier, bath fan) plus 22 construction, concrete, carpentry and yard tools. Added live auto-calculation, interactive material/state cost selectors, shareable links, print views and free embeddable widgets.`],
  ["November 15, 2026", "Focused the site on home construction, landscaping and project budgets; added 16 cost calculators and 6 room/finish tools."],
  ["September 21, 2026", "Initial launch of Ruler Square with automated unit tests and methodology documentation."],
])}
</div>
`,
};

const contact = {
  path: "/contact/",
  title: "Contact | Ruler Square",
  description: "Contact Ruler Square to report a calculation bug, request a new calculator or ask about embedding widgets.",
  crumbs: "Contact",
  breadcrumbs: [{ name: "Home", href: "/" }, { name: "Contact" }],
  lastmod: UPDATED.iso,
  body: `
<div class="prose">
<h1>Contact</h1>
<p class="lede">Found a bug, want a new calculator, or need help embedding a widget?</p>
<p>Email <a href="mailto:${SITE.email}">${SITE.email}</a>. We typically reply within two business days.</p>
</div>
`,
};

const privacy = {
  path: "/privacy/",
  title: "Privacy Policy | Ruler Square",
  description: "How Ruler Square handles browser calculator inputs, hosting logs, analytics and advertising.",
  crumbs: "Privacy Policy",
  breadcrumbs: [{ name: "Home", href: "/" }, { name: "Privacy Policy" }],
  lastmod: UPDATED.iso,
  body: `
<div class="prose">
<h1>Privacy Policy</h1>
<p class="note">Last updated: ${UPDATED.text}</p>
<h2>Calculator inputs</h2>
<p>All calculations run locally in your browser. Numbers you type into a calculator are not transmitted to or stored on our servers.</p>
<h2>Hosting &amp; technical logs</h2>
<p>Our hosting provider, Cloudflare, processes standard technical request data (such as IP address, browser user agent and requested URL) to deliver pages reliably and block abuse.</p>
<h2>Analytics and advertising</h2>
<p>We may use privacy-conscious analytics and display advertising (such as Google AdSense) to keep all calculators free. Where required by law, we provide consent controls and list third-party vendors here.</p>
<h2>Email</h2>
<p>If you email <a href="mailto:${SITE.email}">${SITE.email}</a>, we use your message solely to reply.</p>
</div>
`,
};

const terms = {
  path: "/terms/",
  title: "Terms of Use | Ruler Square",
  description: "Terms of use for Ruler Square calculators, reference charts and embeddable widgets.",
  crumbs: "Terms of Use",
  breadcrumbs: [{ name: "Home", href: "/" }, { name: "Terms of Use" }],
  lastmod: UPDATED.iso,
  body: `
<div class="prose">
<h1>Terms of Use</h1>
<p class="note">Last updated: ${UPDATED.text}</p>
<p>Ruler Square provides free calculators, tables and embeddable widgets for planning home and construction projects. By using the site, you agree to these terms.</p>
<h2>Planning estimates</h2>
<p>Results are planning estimates based on standard geometry and typical US product data. Always confirm quantities, structural designs, local building codes and written contractor bids before ordering materials or starting work.</p>
<h2>Widgets &amp; content</h2>
<p>You are welcome to link to our pages, share calculation URLs and embed our calculators on your website using our provided embed code with attribution. Please do not scrape or republish page text in bulk.</p>
<h2>No warranty</h2>
<p>The site is provided "as is" without warranties of any kind. Ruler Square is not liable for project losses or overages resulting from use of these tools.</p>
<h2>Contact</h2>
<p><a href="mailto:${SITE.email}">${SITE.email}</a></p>
</div>
`,
};

const notFound = {
  path: "/404.html",
  title: "Page Not Found | Ruler Square",
  description: "This page does not exist.",
  robots: "noindex",
  noSitemap: true,
  body: `
<div class="prose">
<h1>Page not found</h1>
<p class="lede">That page does not exist or has moved.</p>
<p><a href="/">Browse all calculators</a></p>
</div>
`,
};

module.exports = [home, about, contact, privacy, terms, notFound];
module.exports.ALL = ALL;
