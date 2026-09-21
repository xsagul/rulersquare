const { SITE } = require("../layout");
const { ICONS } = require("../icons");
const { AUTHOR, PERSON_ID, personSchema } = require("../author");

const table = (head, rows) => `<div class="table-wrap"><table>
  <thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead>
  <tbody>${rows.map(r => `<tr>${r.map((c, i) => i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
</table></div>`;

const CONCRETE = [
  ["/concrete-calculator/", "Concrete Calculator", "Cubic yards, bags and cost for slabs, footings and columns", "concrete", "concrete slab footing column bags ready-mix yards"],
  ["/asphalt-calculator/", "Asphalt Calculator", "Tons of hot mix for driveways and lots", "asphalt", "asphalt hot mix paving driveway blacktop tons overlay"],
  ["/square-footage-calculator/", "Square Footage Calculator", "Any shape, in sq ft, yards, meters and acres", "sqft", "square footage area room floor acres sq ft measure"],
];
const AGGREGATE = [
  ["/gravel-calculator/", "Gravel Calculator", "Tons and cubic yards for driveways and paths", "gravel", "gravel driveway pea stone aggregate tons yards"],
  ["/road-base-calculator/", "Road Base Calculator", "Crusher run with an adjustable allowance", "gravel", "road base crusher run aggregate abc"],
  ["/stone-calculator/", "Crushed Stone Calculator", "#57 stone and crusher run for bases and drainage", "stone", "crushed stone 57 crusher run paver base drainage"],
  ["/sand-calculator/", "Sand Calculator", "Bedding sand in cubic yards, tons or bags", "sand", "sand paver bedding sandbox concrete backfill"],
  ["/river-rock-calculator/", "River Rock Calculator", "Decorative beds and dry creek beds", "rock", "river rock decorative landscape stone dry creek"],
];
const SOIL = [
  ["/topsoil-calculator/", "Topsoil Calculator", "Lawns, garden beds and raised beds", "topsoil", "topsoil lawn garden raised bed soil"],
  ["/fill-dirt-calculator/", "Fill Dirt Calculator", "Grading, low spots and backfill", "dirt", "fill dirt grading backfill low spot subsoil"],
  ["/mulch-calculator/", "Mulch Calculator", "Cubic yards and bags for garden beds", "mulch", "mulch bark garden bed landscaping bags cubic yards"],
];
const PAY = [
  ["/paycheck-calculator/", "Paycheck Calculator", "Take-home pay after federal tax, FICA and 401(k)", "paycheck", "paycheck salary take home net pay gross to net tax withholding"],
  ["/texas-paycheck-calculator/", "Texas Paycheck Calculator", "No state income tax — federal and FICA only", "paycheck", "texas paycheck salary take home no state income tax"],
  ["/florida-paycheck-calculator/", "Florida Paycheck Calculator", "No state income tax — federal and FICA only", "paycheck", "florida paycheck salary take home no state income tax"],
  ["/salary-to-hourly-calculator/", "Salary to Hourly Calculator", "Any salary as an hourly rate, and back", "paycheck", "salary to hourly wage convert annual rate per hour"],
  ["/annual-income-calculator/", "Annual Income Calculator", "Yearly pay from any rate, with overtime", "paycheck", "annual income yearly salary gross earnings overtime"],
  ["/pay-rate-calculator/", "Pay Rate Calculator", "Hourly, weekly, biweekly, monthly and yearly", "paycheck", "pay rate wage weekly biweekly monthly convert period"],
];
const { PROJ } = require("../data/projects");
const { COSTS } = require("../data/costs");
const { TOOLS } = require("../data/tools");
const { CATEGORIES } = require("./categories");
// One icon per subject, rather than a single default across fifteen pages.
const KIND_ICON = {
  fence: "fence", deck: "deck", siding: "siding", drywall: "drywall",
  tile: "tile", paver: "paver", paint: "paint", roofing: "roofing",
  "retaining-wall": "wall", insulation: "insulation",
  "board-and-batten": "batten", grout: "trowel", thinset: "trowel",
  "cubic-yard": "cube", cost: "cost",
};
const NEW = [...PROJ, ...COSTS, ...TOOLS].map(c =>
  [`/${c.slug}/`, c.h1, c.lede, KIND_ICON[c.kind] || "sqft", `${c.h1} ${c.description}`]);
const ALL = [].concat(CONCRETE, AGGREGATE, SOIL, PAY, NEW);
module.exports = module.exports || {};


const cards = list => list.map(([href, title, desc, icon]) =>
  `<a class="card" href="${href}">${ICONS[icon]}<b>${title}</b><span>${desc}</span></a>`).join("\n  ");

/* The homepage is a directory of categories, not a list of calculators. Both
 * category leaders do this, and it is what makes a modest catalogue read as
 * organised rather than thin. */
const HUBS = [
  ["/construction-calculators/", "Construction", "concrete"],
  ["/landscaping-calculators/", "Landscaping", "mulch"],
  ["/cost-calculators/", "Project costs", "cost"],
  ["/pay-calculators/", "Pay & Taxes", "paycheck"],
].map(([path, name, icon]) => [path, name, icon, new Set(CATEGORIES.find(c => c.path === path).groups.flatMap(g => g.items.map(i => i[0]))).size]);

const POPULAR = [
  ["/concrete-calculator/", "Concrete Calculator", "concrete"],
  ["/gravel-calculator/", "Gravel Calculator", "gravel"],
  ["/square-footage-calculator/", "Square Footage Calculator", "sqft"],
  ["/mulch-calculator/", "Mulch Calculator", "mulch"],
  ["/paycheck-calculator/", "Paycheck Calculator", "paycheck"],
  ["/asphalt-calculator/", "Asphalt Calculator", "asphalt"],
  ["/fence-calculator/", "Fence Calculator", "sqft"],
  ["/concrete-slab-cost/", "Concrete Slab Cost", "concrete"],
];

const home = {
  path: "/",
  title: "Ruler Square – Free Material, Cost & Paycheck Calculators",
  description: "Free calculators for building materials, landscaping, project costs and take-home pay. Get clear estimates with formulas, examples and visible assumptions.",
  lastmod: "2026-09-22",
  // One @graph rather than separate blocks, so the site, the publisher and the
  // person behind it are linked by @id instead of merely co-present.
  schema: [{
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization", "@id": SITE.url + "/#organization", name: SITE.name,
        url: SITE.url + "/", logo: { "@type": "ImageObject", url: SITE.url + "/og.png" },
        email: SITE.email, founder: { "@id": PERSON_ID },
      },
      personSchema,
      {
        "@type": "WebSite", "@id": SITE.url + "/#website",
        url: SITE.url + "/", name: SITE.name, inLanguage: "en-US",
        publisher: { "@id": SITE.url + "/#organization" },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: SITE.url + "/?q={search_term_string}" },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  }],
  body: `
<section class="hero">
  <h1>Find your calculator</h1>
  <p class="lede">Materials, project costs and pay. ${ALL.length} free calculators with clear answers and the math behind them.</p>
  <div class="search">
    <label class="sr-only" for="q">Search calculators</label>
    ${ICONS.search}
    <input id="q" type="search" autocomplete="off" placeholder="Search calculators — try &quot;driveway&quot; or &quot;take home pay&quot;">
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

</div>
<section class="prose home-note">
<h2>Know what is in the estimate</h2>
<p>Use your measurements, check the assumptions and see a worked example. Material quantities are separate from installed costs. Pay estimates show which deductions are included.</p>
<p>No account is needed. Calculator inputs stay in your browser. Confirm an order with your supplier or compare the estimate with your actual pay statement.</p>
</section>
`,
  scripts: `<script src="/assets/search.js?v=VERSION" defer></script>`,
};

const about = {
  path: "/about/",
  title: "About Ruler Square — Who Maintains It",
  description: "Who builds and maintains Ruler Square, why it exists, how the figures are kept current, how it is funded, and the public log of corrections.",
  crumbs: "About",
  lastmod: "2026-09-22",
  schema: [
    {
      "@context": "https://schema.org", "@type": "AboutPage",
      url: SITE.url + "/about/", name: "About Ruler Square",
      mainEntity: { "@id": PERSON_ID },
      publisher: { "@id": SITE.url + "/#organization" },
    },
    { "@context": "https://schema.org", ...personSchema },
  ],
  body: `
<div class="prose">
<h1>About Ruler Square</h1>
<p class="lede">Independent calculators for material quantities, project budgets and estimated take-home pay.</p>

<h2>Who maintains the site</h2>
<p>${AUTHOR.name}, a full-stack developer. I build and maintain Ruler Square’s calculators, their formulas and the explanations on each page.</p>
<p>You can check who I am: <a href="${AUTHOR.sameAs[0]}" rel="me nofollow">LinkedIn</a>, <a href="${AUTHOR.sameAs[1]}" rel="me nofollow">GitHub</a>, <a href="${AUTHOR.sameAs[2]}" rel="me nofollow">dev.to</a>. The <a href="https://github.com/xsagul/rulersquare">site’s source code</a> is public, so you can inspect the arithmetic.</p>

<h2>Why the site exists</h2>
<p>Material estimating is arithmetic that anyone can do and almost nobody enjoys. The figures are not secret — a cubic yard is 27 cubic feet whoever you ask — but they are scattered across supplier PDFs, trade tables and half-remembered rules of thumb.</p>
<p>What made me build this rather than use what exists: most calculators give you a number and nothing else. You cannot see the density they assumed, whether compaction was included, or whether the price is for material or for installed work. When the answer is wrong you have no way of knowing why. Every page here shows its formula and lets you change the assumptions.</p>

<h2>How the calculations are kept current</h2>
<ul>
  <li>Tax constants are reviewed when the IRS and SSA publish the next year's figures, usually October and November.</li>
  <li>Price ranges carry the date they were last checked against their published source.</li>
  <li>Material densities are editable planning assumptions. Moisture and product differences matter; use your supplier’s figure.</li>
  <li>Automated tests check calculation engines, example inputs and unit conversions. A separate site audit checks metadata, links and sitemap coverage before deployment.</li>
</ul>
<p>The full detail is on the <a href="/methodology/">methodology page</a>, including what these calculators deliberately do not attempt.</p>

<h2>How the project is funded</h2>
<p>The calculators are free, with no paid tier, newsletter, account or lead form. Display advertising may support the site; our <a href="/privacy/">privacy policy</a> explains this. Calculator inputs are processed in your browser, not sent to us.</p>
<p>No page here is sponsored, and no supplier, contractor or manufacturer pays for a mention. Where a product or trade body is named it is because it is the source of a figure.</p>

<h2>Estimates, not engineering</h2>
<p>These calculators are for planning and buying materials. They do not replace a structural engineer, your local building code, a tax professional or your supplier's own advice. The paycheck pages estimate withholding; they are not tax advice.</p>

<h2>Found a mistake?</h2>
<p>Write to <a href="mailto:${SITE.email}">${SITE.email}</a>. If a figure does not match its stated source, that is a bug and it gets fixed. Corrections are logged below rather than quietly edited.</p>

<h2>Corrections and updates</h2>
<p class="note">Newest first. Substantive changes to a figure or a formula are listed here; wording and layout changes are not.</p>
${table(["Date", "Change"], [
  ["22 September 2026", "Fixed supplier-density and bag-size inputs, salary result display and example unit resets. Corrected ramp landings to use 30 inches of rise per run and clarified rebar stock estimates and vehicle payload limits."],
  ["21 September 2026", "Added a methodology page and this correction log. Published author identity and source attribution across the site."],
  ["21 September 2026", "Fixed rebar bar-direction labelling: bars running the length are spaced across the width, not along it. The total count was unaffected; the displayed breakdown was wrong."],
  ["21 September 2026", "Fixed the labour cost page, where the total was hidden whenever no optional price was entered."],
  ["21 September 2026", "Fixed unit selectors that were read as numbers, which made the feet-and-inches calculator add when subtract was selected."],
  ["21 September 2026", "Site launched with 53 calculators."],
])}
</div>
`,
};

const contact = {
  path: "/contact/",
  title: "Contact Ruler Square",
  description: "Get in touch with Ruler Square to report an error, suggest a calculator or ask a question.",
  crumbs: "Contact",
  lastmod: "2026-09-22",
  body: `
<div class="prose">
<h1>Contact</h1>
<p class="lede">Found an error, want a new calculator, or have a question about a result?</p>
<p>Email us at <a href="mailto:${SITE.email}">${SITE.email}</a>. We usually reply within two business days.</p>
</div>
`,
};

const privacy = {
  path: "/privacy/",
  title: "Privacy Policy | Ruler Square",
  description: "How Ruler Square handles your data.",
  crumbs: "Privacy Policy",
  lastmod: "2026-09-22",
  body: `
<div class="prose">
<h1>Privacy Policy</h1>
<p class="note">Last updated: September 21, 2026</p>
<h2>What you enter in our calculators</h2>
<p>Calculations run in your browser. The numbers you type into a calculator are not sent to us or stored.</p>
<h2>Information collected automatically</h2>
<p>Our hosting provider, Cloudflare, processes standard technical data such as IP address, browser type and the pages you request, to deliver the site and protect it from abuse.</p>
<h2>Analytics and advertising</h2>
<p>We may use analytics to understand which pages are useful, and we may show ads to keep the calculators free. If we do, those services may use cookies or similar technologies, and we will list them here with a link to their own privacy policies and, where required, ask for your consent.</p>
<h2>Email</h2>
<p>If you email us, we use your address and message only to reply.</p>
<h2>Contact</h2>
<p>Questions about this policy: <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
</div>
`,
};

const terms = {
  path: "/terms/",
  title: "Terms of Use | Ruler Square",
  description: "Terms of use for Ruler Square calculators and content.",
  crumbs: "Terms of Use",
  lastmod: "2026-09-22",
  body: `
<div class="prose">
<h1>Terms of Use</h1>
<p class="note">Last updated: September 21, 2026</p>
<p>Ruler Square provides free calculators and guides for planning construction and home projects. By using the site you agree to these terms.</p>
<h2>Estimates only</h2>
<p>Results are estimates based on the values you enter and on typical product data. Actual quantities and costs vary. Always confirm with your supplier, a qualified professional and your local building code before buying materials or starting work.</p>
<h2>No warranty</h2>
<p>The site is provided "as is", without warranties of any kind. We are not liable for losses resulting from the use of our calculators or content.</p>
<h2>Content</h2>
<p>You may link to our pages and share results. Please do not copy our calculators or text in bulk.</p>
<h2>Contact</h2>
<p><a href="mailto:${SITE.email}">${SITE.email}</a></p>
</div>
`,
};

const notFound = {
  path: "/404.html",
  title: "Page not found | Ruler Square",
  description: "This page does not exist.",
  robots: "noindex",
  noSitemap: true,
  body: `
<div class="prose">
<h1>Page not found</h1>
<p class="lede">That page doesn't exist, or it has moved.</p>
<p><a href="/">See all calculators</a></p>
</div>
`,
};

module.exports = [home, about, contact, privacy, terms, notFound];
module.exports.ALL = ALL;
