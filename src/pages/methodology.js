const { SITE } = require("../layout");
const { PERSON_ID, ORG_ID, personSchema, UPDATED } = require("../author");

const table = (head, rows) => `<div class="table-wrap"><table>
  <thead><tr>${head.map(h => `<th scope="col">${h}</th>`).join("")}</tr></thead>
  <tbody>${rows.map(r => `<tr>${r.map((c, i) => i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
</table></div>`;

module.exports = {
  path: "/methodology/",
  title: "Methodology – Formulas & Standards | Ruler Square",
  description: "How Ruler Square calculators compute building material quantities, home system sizes and 2026 US project cost estimates.",
  crumbs: "Methodology",
  breadcrumbs: [{ name: "Home", href: "/" }, { name: "Methodology" }],
  lastmod: UPDATED.iso,
  schema: [
    {
      "@context": "https://schema.org", "@type": "TechArticle",
      headline: "How Ruler Square Calculators Work",
      description: "Formulas, US standards, rounding rules and cost benchmarks.",
      url: SITE.url + "/methodology/",
      author: { "@id": ORG_ID },
      publisher: { "@id": ORG_ID },
      dateModified: UPDATED.iso,
    },
    { "@context": "https://schema.org", ...personSchema },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.url + "/" },
        { "@type": "ListItem", position: 2, name: "Methodology", item: SITE.url + "/methodology/" },
      ],
    },
  ],
  body: `
<h1>Methodology</h1>
<p class="lede">How our formulas, US standards, rounding rules and cost tiers work.</p>

<div class="prose">
<h2>Three transparent layers in every calculator</h2>
<p>Every calculator separates <strong>exact geometry</strong> (NIST US customary &amp; metric conversions), <strong>published material or code factors</strong> (bulk densities, bag yields, IRC/ADA/ENERGY STAR/SMACNA/HVI standards), and <strong>your editable inputs</strong> (dimensions, waste allowance, local rates). Nothing is locked in a black box.</p>

<h2>Where our default figures come from</h2>
${table(["Figure type", "Standard or source used"], [
  ["Geometry &amp; unit conversions", "Exact NIST definitions: 1 yd³ = 27 ft³, 1 acre = 43,560 ft², 1 board foot = 144 in³, 1 cord = 128 ft³, 1 US gallon = 231 in³."],
  ["Concrete, grout &amp; mortar yields", "Published manufacturer product datasheets (QUIKRETE, Custom Building Products, MAPEI) and ACI/CMHA standards."],
  ["Bulk stone, soil &amp; asphalt density", "NSSGA, NAPA and USDA NRCS typical loose/compacted bulk weights—editable to match your local quarry ticket."],
  ["Stairs, balusters, ramps &amp; framing", "International Residential Code (IRC), 2010 ADA Standards, and American Wood Council (AWC) references."],
  ["HVAC, water heating &amp; ventilation", "US DOE Energy Saver, EPA ENERGY STAR, SMACNA and Home Ventilating Institute (HVI) sizing guidelines."],
  ["Project cost ranges (2026)", "US national installed benchmarks broken down by finish/material tier and state, editable to match local bids."],
])}

<h2>Rounding up to real buying units</h2>
<p>Buying quantities always round <strong>up</strong>, never down—running half a bag or one sheet short mid-project costs far more in wasted trips or cold joints than buying an extra unit. Ready-mix concrete rounds to ¼-yard increments, bulk stone to ½-yard or ½-ton steps, and packaged goods to whole bags, sheets, boxes or rolls.</p>

<h2>Material price vs. installed cost</h2>
<p>Material calculators estimate quantities and optional bare material prices. Project cost calculators estimate installed contractor budgets covering both materials and labor, with demolition, haul-away, delivery fees and contingency kept on separate lines so you can compare quotes cleanly.</p>

<h2>Automated verification</h2>
<p>Every calculation engine runs identically in your browser and in our automated Node test suite. Every worked example and every reference table on the site is generated or asserted directly against the live calculation engine before deployment.</p>

<h2>Reporting an issue</h2>
<p>If you spot a formula error or outdated benchmark, email <a href="mailto:${SITE.email}">${SITE.email}</a>. Substantive fixes are documented on the <a href="/about/">About page</a>.</p>
</div>
`,
};
