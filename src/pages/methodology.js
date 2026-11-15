const { SITE } = require("../layout");
const { AUTHOR, PERSON_ID, personSchema } = require("../author");

const table = (head, rows) => `<div class="table-wrap"><table>
  <thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead>
  <tbody>${rows.map(r => `<tr>${r.map((c, i) => i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
</table></div>`;

module.exports = {
  path: "/methodology/",
  title: "Methodology — How These Calculators Work | Ruler Square",
  description: "The formulas, data sources, rounding rules and declared limitations behind every Ruler Square calculator, and how each figure is kept current.",
  crumbs: "Methodology",
  lastmod: "2026-11-15",
  schema: [
    {
      "@context": "https://schema.org", "@type": "TechArticle",
      headline: "How Ruler Square calculators work",
      description: "Formulas, data sources, rounding rules and declared limitations.",
      url: SITE.url + "/methodology/",
      author: { "@id": PERSON_ID },
      publisher: { "@id": SITE.url + "/#organization" },
      dateModified: "2026-11-15",
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
<p class="lede">What each calculator does, where its numbers come from, and its limits.</p>

<div class="prose">
<h2>The general principle</h2>
<p>Every calculator here separates three things that most estimators blur together: <strong>geometry</strong>, which is exact; <strong>material properties</strong>, which are published ranges; and <strong>your assumptions</strong>, which are editable. The arithmetic is never the uncertain part. The density of gravel, the price of concrete and the depth you actually dig are.</p>
<p>That is why each page shows the formula it used and lets you change every assumption behind the answer. A calculator that hands you one confident number without telling you what it assumed is hiding the part you need to judge.</p>

<h2>Where each kind of figure comes from</h2>
${table(["Type of figure", "What is shown beside it"], [
  ["Geometry and unit conversion", "Exact definitions. 1 yd³ = 27 ft³, 1 acre = 43,560 ft², 1 board foot = 144 in³."],
  ["Material density", "An editable planning value. Use the bulk density from your supplier for the actual product."],
  ["Price range", "The published source and the date it was checked. Never our own survey."],
  ["Derived figure", "The assumption that produced it — compaction, waste, moisture, hours worked."],
])}
<p class="note">Price ranges are starting points, not local quotes. Defaults for density, waste and package coverage are assumptions, not certified product data.</p>

<h2>Material quantities</h2>
<p>Volume is area times depth, converted to whatever unit your supplier quotes in. Weight is volume times density, and density is the figure that moves: the same gravel weighs noticeably more wet than dry, and angular stone packs tighter than rounded.</p>
<div class="formula">Cubic yards = length (ft) × width (ft) × depth (in) ÷ 12 ÷ 27<br>Tons = cubic yards × pounds per cubic yard ÷ 2,000</div>
<p>Each material page shows its starting density in pounds per cubic yard and lets you replace it. Trade-body links provide background; they do not certify the chosen default or your delivery. Ask the supplier for the product’s loose or compacted bulk density and use the same basis for the volume.</p>

<h2>Cost ranges</h2>
<p>Cost pages use published third-party reference ranges, not our own pricing survey. Each page names its source and review date. A local quote can fall outside the range because of location, project size, finish, access or contractor minimums. Replace the starting rates with quotes for your actual scope.</p>
<p>The distinction that matters most on those pages is <strong>material price versus installed price</strong>. A per-yard concrete quote covers the ready-mix; a per-square-foot slab quote usually covers labour, forms and finishing too. Comparing one to the other is the single most common way a budget goes wrong, so every cost page states which it is showing and keeps excluded work as separate, visible line items.</p>

<h2>Room finishes and pool volume</h2>
<p>Flooring divides area plus waste by carton coverage, then rounds up to complete boxes. Cost uses the coverage actually purchased. Wallpaper counts full-height strips from a roll, adding a conservative full pattern repeat and trim to each strip. Carpet reports area plus allowance; an installer’s roll cut plan can require more.</p>
<p>Pool volume is water-surface area times average water depth. Rectangles use length times width; round and oval pools use circular and elliptical areas. The average of shallow and deep depths assumes an evenly sloping floor.</p>
<h2>Rounding</h2>
<p>Quantities round <em>up</em>, never to nearest. Running short mid-job costs more than ordering a little long: a second delivery of half a yard often costs nearly as much as the first full load, because you are paying for the truck rather than the material.</p>
<p>Buying estimates round up to displayed increments: quarter yards for ready-mix, half yards or tons for aggregate, and whole packages. Suppliers may use different increments. Calculations keep full precision internally; displayed measurements are rounded for readability. Rebar stock equivalents are lower bounds by total length, not cutting lists.</p>

<h2>How the calculations are tested</h2>
<p>Calculation engines run in the browser and in automated tests. Tests cover every page’s worked example, unit conversions and regression cases, so a published example cannot disagree with the calculator above it.</p>
<p>The pre-deployment checks also inspect every generated page for broken internal links, duplicate identifiers, metadata and sitemap coverage. Tests reduce errors; they do not replace professional review or guarantee that every possible input is correct.</p>

<h2>Declared limitations</h2>
<ul>
  <li><strong>These are estimates for planning and buying, not engineering.</strong> No page here designs a structure, verifies a load path, or replaces a local building code.</li>
  <li><strong>Price ranges are third-party national benchmarks.</strong> They are a starting point for a budget, not a quote, and not a substitute for two local bids.</li>
  <li><strong>Material densities are starting assumptions.</strong> The load you receive varies with moisture and gradation. Confirm with your supplier before ordering by weight.</li>
</ul>

<h2>How figures are kept current</h2>
<p>Price pages state when their sources were reviewed. Material defaults can be revised when better product information is available; they are not universal standards.</p>
<p>Corrections are logged publicly on the <a href="/about/">about page</a>. If you find a figure that does not match its source, write to <a href="mailto:${SITE.email}">${SITE.email}</a> — that is the fastest way to get it fixed.</p>

<h2>Who maintains this</h2>
<p>${SITE.name} is built and maintained by <a href="/about/">${AUTHOR.name}</a>, a full-stack developer. Personal profiles and contact details are on the about page.</p>
</div>
`,
};
