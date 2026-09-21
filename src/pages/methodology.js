const { SITE } = require("../layout");
const { AUTHOR, PERSON_ID, personSchema } = require("../author");
const D = require("../data/tax2026");

const table = (head, rows) => `<div class="table-wrap"><table>
  <thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead>
  <tbody>${rows.map(r => `<tr>${r.map((c, i) => i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
</table></div>`;

const money = n => "$" + n.toLocaleString("en-US");

module.exports = {
  path: "/methodology/",
  title: "Methodology — How These Calculators Work | Ruler Square",
  description: "The formulas, data sources, rounding rules and declared limitations behind every Ruler Square calculator, and how each figure is kept current.",
  crumbs: "Methodology",
  lastmod: "2026-09-21",
  schema: [
    {
      "@context": "https://schema.org", "@type": "TechArticle",
      headline: "How Ruler Square calculators work",
      description: "Formulas, data sources, rounding rules and declared limitations.",
      url: SITE.url + "/methodology/",
      author: { "@id": PERSON_ID },
      publisher: { "@id": SITE.url + "/#organization" },
      dateModified: "2026-09-21",
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
<p class="lede">What every calculator on this site actually does, where its numbers come from, and what it deliberately does not attempt.</p>

<div class="prose">
<h2>The general principle</h2>
<p>Every calculator here separates three things that most estimators blur together: <strong>geometry</strong>, which is exact; <strong>material properties</strong>, which are published ranges; and <strong>your assumptions</strong>, which are editable. The arithmetic is never the uncertain part. The density of gravel, the price of concrete and the depth you actually dig are.</p>
<p>That is why each page shows the formula it used and lets you change every assumption behind the answer. A calculator that hands you one confident number without telling you what it assumed is hiding the part you need to judge.</p>

<h2>Where each kind of figure comes from</h2>
${table(["Type of figure", "What is shown beside it"], [
  ["Geometry and unit conversion", "Exact definitions. 1 yd³ = 27 ft³, 1 acre = 43,560 ft², 1 board foot = 144 in³."],
  ["Material density", "A published trade range, with the industry body cited on the page."],
  ["Tax rate or threshold", "The issuing authority, the document and the year it applies to."],
  ["Price range", "The published source and the date it was checked. Never our own survey."],
  ["Derived figure", "The assumption that produced it — compaction, waste, moisture, hours worked."],
])}
<p class="note">When a source does not support a single value, we publish the range rather than the midpoint. A national average presented as your local price is more misleading than a wide range declared honestly.</p>

<h2>Material quantities</h2>
<p>Volume is area times depth, converted to whatever unit your supplier quotes in. Weight is volume times density, and density is the figure that moves: the same gravel weighs noticeably more wet than dry, and angular stone packs tighter than rounded.</p>
<div class="formula">Cubic yards = length (ft) × width (ft) × depth (in) ÷ 12 ÷ 27<br>Tons = cubic yards × pounds per cubic yard ÷ 2,000</div>
<p>We publish the mid figure and the range on every material page. Aggregate and soil densities are cross-checked against published bulk density tables from the <a href="https://www.nssga.org/" rel="nofollow">National Stone, Sand &amp; Gravel Association</a>, the <a href="https://www.asphaltpavement.org/" rel="nofollow">National Asphalt Pavement Association</a> for hot mix, and <a href="https://www.nrcs.usda.gov/" rel="nofollow">USDA NRCS</a> soil resources.</p>

<h2>Take-home pay</h2>
<p>The paycheck pages annualise your gross, subtract pre-tax deductions and the standard deduction, run the remainder through the federal brackets, then add FICA separately. That is the order payroll actually uses, and the order matters more than the rates, because each step changes the base for the next.</p>
${table(["Figure", "Source", "Applies to"], [
  ["Federal brackets", "IRS Revenue Procedure 2025-32, issued 9 October 2025", "2026 tax year"],
  ["Standard deduction", "Same document — " + money(D.STANDARD_DEDUCTION.single) + " single, " + money(D.STANDARD_DEDUCTION.married) + " married filing jointly", "2026 tax year"],
  ["Social Security wage base", "Social Security Administration — " + money(D.FICA.socialSecurityWageBase), "2026"],
  ["FICA rates", "6.2% Social Security, 1.45% Medicare, 0.9% additional over the threshold", "2026"],
])}
<p>The bracket tables printed on those pages are generated from the same data the calculator runs on, so the page and the engine cannot drift apart.</p>

<h2>Cost ranges</h2>
<p>Cost pages use published third-party ranges, not our own pricing survey, and each page names its source and the date it was checked. Those ranges are national and broad on purpose: a driveway quote in rural Ohio and one in coastal California are both inside them.</p>
<p>The distinction that matters most on those pages is <strong>material price versus installed price</strong>. A per-yard concrete quote covers the ready-mix; a per-square-foot slab quote usually covers labour, forms and finishing too. Comparing one to the other is the single most common way a budget goes wrong, so every cost page states which it is showing and keeps excluded work as separate, visible line items.</p>

<h2>Rounding</h2>
<p>Quantities round <em>up</em>, never to nearest. Running short mid-job costs more than ordering a little long: a second delivery of half a yard often costs nearly as much as the first full load, because you are paying for the truck rather than the material.</p>
<p>Order quantities round to the increments suppliers actually sell in — quarter yards for ready-mix, half yards and half tons for aggregate, whole bags, whole bundles, whole pallets. Intermediate figures are shown unrounded so you can check the arithmetic.</p>

<h2>How the calculations are tested</h2>
<p>Every calculation engine is a plain module that runs identically in your browser and in an automated test suite. The suite currently holds <strong>148 assertions</strong> covering worked examples, unit conversions, edge cases and the specific mistakes that are easy to make — that a 401(k) does not reduce FICA, that Social Security stops at the wage base, that 26 biweekly cheques and 24 semi-monthly cheques describe the same salary differently.</p>
<p>The worked example printed on each page is checked against the engine, so if the two ever disagree the build fails rather than publishing a wrong example.</p>

<h2>Declared limitations</h2>
<ul>
  <li><strong>These are estimates for planning and buying, not engineering.</strong> No page here designs a structure, verifies a load path, or replaces a local building code.</li>
  <li><strong>The paycheck pages estimate withholding.</strong> They do not model every credit, local tax, W-4 adjustment or mid-year change, and they are not tax advice.</li>
  <li><strong>Price ranges are third-party national benchmarks.</strong> They are a starting point for a budget, not a quote, and not a substitute for two local bids.</li>
  <li><strong>Material densities are typical published figures.</strong> The load you actually receive varies with moisture and gradation. Confirm with your supplier before ordering by weight.</li>
  <li><strong>State income tax is user-entered</strong> on the general paycheck page. The dedicated state pages currently cover states with no wage income tax, where the rate is a verifiable zero rather than a table we would have to maintain.</li>
</ul>

<h2>How figures are kept current</h2>
<p>Tax constants are reviewed when the IRS and SSA publish the following year's figures, normally in October and November. Price ranges are reviewed against their published sources and carry the date they were last checked. Material densities change only when a standard does.</p>
<p>Corrections are logged publicly on the <a href="/about/">about page</a>. If you find a figure that does not match its source, write to <a href="mailto:${SITE.email}">${SITE.email}</a> — that is the fastest way to get it fixed.</p>

<h2>Who maintains this</h2>
<p>${SITE.name} is built and maintained by <a href="/about/">${AUTHOR.name}</a>, a full-stack developer who also runs <a href="https://salariile.ro/" rel="me">salariile.ro</a>, an independent Romanian salary and tax calculator. Independent means there is no company, no sponsor and no client whose products these pages are meant to sell.</p>
</div>
`,
};
