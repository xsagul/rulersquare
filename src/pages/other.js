const { SITE } = require("../layout");
const { ICONS } = require("../icons");
const { AUTHOR, PERSON_ID, ORG_ID, personSchema, UPDATED } = require("../author");

const table = (head, rows) => `<div class="table-wrap"><table>
  <thead><tr>${head.map(h => `<th scope="col">${h}</th>`).join("")}</tr></thead>
  <tbody>${rows.map(r => `<tr>${r.map((c, i) => i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
</table></div>`;

const CONCRETE = [
  ["/concrete-calculator/", "Concrete Calculator", "Cubic yards, bags and cost for slabs, footings, columns, steps and curbs", "concrete", "concrete slab footing column steps curb bags ready-mix yards"],
  ["/asphalt-calculator/", "Asphalt Calculator", "Tons of hot mix for driveways and parking lots", "asphalt", "asphalt hot mix paving driveway blacktop tons overlay"],
  ["/square-footage-calculator/", "Square Footage Calculator", "Any shape, in sq ft, yards, meters and acres", "sqft", "square footage area room floor acres sq ft measure"],
];
const AGGREGATE = [
  ["/gravel-calculator/", "Gravel Calculator", "Tons and cubic yards for driveways and paths", "gravel", "gravel driveway aggregate tons yards truckloads"],
  ["/pea-gravel-calculator/", "Pea Gravel Calculator", "Tons, yards and bags for patios and walkways", "gravel", "pea gravel patio walkway dog run rounded stone tons bags"],
  ["/decomposed-granite-calculator/", "Decomposed Granite Calculator", "Compacted DG for patios and pathways", "stone", "decomposed granite dg pathway patio stabilized compacted tons yards"],
  ["/road-base-calculator/", "Road Base Calculator", "Crusher run with compaction allowance", "gravel", "road base crusher run aggregate abc driveway base"],
  ["/stone-calculator/", "Crushed Stone Calculator", "#57 stone and crusher run for bases and drainage", "stone", "crushed stone 57 crusher run paver base drainage"],
  ["/sand-calculator/", "Sand Calculator", "Bedding sand in cubic yards, tons or bags", "sand", "sand paver bedding sandbox concrete backfill"],
  ["/river-rock-calculator/", "River Rock Calculator", "Decorative beds and dry creek beds", "rock", "river rock decorative landscape stone dry creek"],
];
const SOIL = [
  ["/topsoil-calculator/", "Topsoil Calculator", "Lawns, garden beds and topdressing", "topsoil", "topsoil lawn garden soil yards bags"],
  ["/compost-calculator/", "Compost Calculator", "Garden amendments and lawn topdressing", "garden", "compost garden soil topdressing organic yards bags"],
  ["/fill-dirt-calculator/", "Fill Dirt Calculator", "Grading, low spots and dump truck loads", "dirt", "fill dirt grading backfill low spot subsoil truckloads"],
  ["/mulch-calculator/", "Mulch Calculator", "Cubic yards and bags for garden beds", "mulch", "mulch bark garden bed landscaping bags cubic yards"],
];

const { PROJ } = require("../data/projects");
const { COSTS } = require("../data/costs");
const { TOOLS } = require("../data/tools");
const { CATEGORIES } = require("./categories");

const KIND_ICON = {
  fence: "fence", deck: "deck", siding: "siding", drywall: "drywall",
  tile: "tile", paver: "paver", paint: "paint", "exterior-paint": "paint",
  "deck-stain": "paint", roofing: "roofing", "metal-roofing": "roofing",
  "retaining-wall": "wall", insulation: "insulation",
  "board-and-batten": "batten", wainscoting: "batten",
  grout: "trowel", thinset: "trowel", mortar: "trowel",
  "cubic-yard": "cube", "cubic-feet": "cube", "yards-to-tons": "cube",
  cost: "cost", "gutter-size": "gutter", stair: "stairs", "concrete-steps": "stairs",
  "baluster-spacing": "fence", sonotube: "concrete", "fence-post-concrete": "concrete",
  "concrete-bag": "concrete", "self-leveling": "concrete",
  "raised-bed": "garden", "grass-seed": "topsoil",
  btu: "hvac", firewood: "firewood", "generator-wattage": "bolt",
  "water-heater": "water", dehumidifier: "water", "bathroom-fan": "fan",
  "tank-volume": "tank", pool: "water",
};

const NEW = [...PROJ, ...COSTS, ...TOOLS].map(c =>
  [`/${c.slug}/`, c.h1, c.lede, KIND_ICON[c.kind] || "sqft", `${c.h1} ${c.slug.replace(/-/g, " ")}`]);
const ALL = [].concat(CONCRETE, AGGREGATE, SOIL, NEW);

const HUBS = [
  ["/construction-calculators/", "Construction", "concrete"],
  ["/landscaping-calculators/", "Landscaping", "mulch"],
  ["/home-systems-calculators/", "Home Systems", "hvac"],
  ["/cost-calculators/", "Project Costs", "cost"],
].map(([path, name, icon]) => [
  path, name, icon,
  new Set(CATEGORIES.find(c => c.path === path).groups.flatMap(g => g.items.map(i => i[0]))).size,
]);

const POPULAR = [
  ["/concrete-calculator/", "Concrete Calculator", "concrete"],
  ["/gravel-calculator/", "Gravel Calculator", "gravel"],
  ["/square-footage-calculator/", "Square Footage Calculator", "sqft"],
  ["/mulch-calculator/", "Mulch Calculator", "mulch"],
  ["/raised-bed-soil-calculator/", "Raised Bed Soil Calculator", "garden"],
  ["/btu-calculator/", "BTU Calculator (AC & Heat)", "hvac"],
  ["/feet-and-inches-calculator/", "Feet & Inches Calculator", "ruler"],
  ["/concrete-slab-cost/", "Concrete Slab Cost (2026)", "cost"],
];

/* Every calculator listed once under its primary hub group so both visitors
 * and Googlebot reach any calculator in a single click from the homepage. */
function fullDirectory() {
  const seen = new Set();
  return CATEGORIES.map(cat => {
    const items = [];
    for (const g of cat.groups) {
      for (const [href, name] of g.items) {
        if (seen.has(href)) continue;
        seen.add(href);
        items.push([href, name]);
      }
    }
    return `<div>
      <h3><a href="${cat.path}">${cat.h1.replace(/ Calculators$/, "")} (${items.length})</a></h3>
      <ul>${items.map(([href, name]) => `<li><a href="${href}">${name}</a></li>`).join("")}</ul>
    </div>`;
  }).join("\n");
}

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
<section class="hero">
  <p class="eyebrow">US Home &amp; Trade Tools</p>
  <h1>Free Construction, Yard &amp; Home Cost Calculators</h1>
  <p class="lede">${ALL.length} free calculators for building materials, landscaping, HVAC &amp; power sizing, and 2026 project budgets. Instant math, worked examples and printable shopping lists.</p>
  <div class="search">
    <label class="sr-only" for="q">Search calculators</label>
    ${ICONS.search}
    <input id="q" type="search" autocomplete="off" placeholder="Search ${ALL.length} calculators — try &quot;concrete&quot;, &quot;btu&quot;, &quot;gutter&quot; or &quot;mulch&quot;">
  </div>
  <ul class="search-hits" id="hits" hidden></ul>
</section>

<div id="browse">
<div class="hubs">
  ${HUBS.map(([href, name, icon, n]) =>
    `<a class="hub" href="${href}">${ICONS[icon]}<b>${name}</b><span>${n} calculators</span></a>`).join("\n  ")}
</div>

<h2>Popular calculators</h2>
<div class="grid tight">
  ${POPULAR.map(([href, title, icon]) =>
    `<a class="card" href="${href}">${ICONS[icon]}<b>${title}</b></a>`).join("\n  ")}
</div>

<section class="directory-section">
  <h2>All ${ALL.length} calculators by category</h2>
  <div class="directory">
    ${fullDirectory()}
  </div>
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
