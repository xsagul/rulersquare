const { SITE, embedSnippet } = require("../layout");
const { slab, round, stair, curb, shapeSet } = require("../diagrams");
const { byline, authorRef, UPDATED } = require("../author");

function dim(label, name, defUnit, hint = "") {
  const units = [["in", "inches"], ["ft", "feet"], ["yd", "yards"], ["cm", "cm"], ["m", "meters"]];
  return `<div class="field">
  <label class="label" for="f-${name}">${label}${hint ? ` <span class="hint">${hint}</span>` : ""}</label>
  <div class="combo">
    <input id="f-${name}" type="number" inputmode="decimal" min="0.001" max="10000000" step="any" name="${name}" value="" required>
    <select name="${name}Unit" aria-label="${label} units">
      ${units.map(([v, t]) => `<option value="${v}"${v === defUnit ? " selected" : ""}>${t}</option>`).join("")}
    </select>
  </div>
</div>`;
}

function dimOpt(label, name, defUnit, hint = "") {
  const units = [["in", "inches"], ["ft", "feet"], ["yd", "yards"], ["cm", "cm"], ["m", "meters"]];
  return `<div class="field">
  <label class="label" for="f-${name}">${label}${hint ? ` <span class="hint">${hint}</span>` : ""}</label>
  <div class="combo">
    <input id="f-${name}" type="number" inputmode="decimal" min="0" max="10000000" step="any" name="${name}" value="">
    <select name="${name}Unit" aria-label="${label} units">
      ${units.map(([v, t]) => `<option value="${v}"${v === defUnit ? " selected" : ""}>${t}</option>`).join("")}
    </select>
  </div>
</div>`;
}

function one(label, name, value, unit, hint = "") {
  return `<div class="field">
  <label class="label" for="f-${name}">${label}${hint ? ` <span class="hint">${hint}</span>` : ""}</label>
  <div class="unit"><input id="f-${name}" type="number" inputmode="decimal" min="${name === "qty" || name === "stepCount" ? 1 : 0}" max="${name === "waste" ? 50 : 10000000}" step="${name === "qty" || name === "stepCount" ? 1 : "any"}" name="${name}" value="${value}"${name === "price" ? "" : " required"}><em>${unit}</em></div>
</div>`;
}

const table = (head, rows) => `<div class="table-wrap"><table>
  <thead><tr>${head.map(h => `<th scope="col">${h}</th>`).join("")}</tr></thead>
  <tbody>${rows.map(r => `<tr>${r.map((c, i) => i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
</table></div>`;

const faq = [
  ["How many bags of concrete are in a cubic yard?",
   "One cubic yard (27 cubic feet) takes 45 bags of 80 lb concrete (0.60 ft³ each), 60 bags of 60 lb (0.45 ft³), 72 bags of 50 lb (0.375 ft³), or 90 bags of 40 lb concrete (0.30 ft³)."],
  ["How much extra concrete should I order?",
   "Order 5% to 10% extra for spillage, uneven subgrade, and forms that flex under wet weight. Use 10% to 15% for excavated footings and trenches where actual width runs wider than planned—running short mid-pour creates a weak cold joint."],
  ["When should I order ready-mix instead of bags?",
   "Under 1 cubic yard (fewer than 45 eighty-pound bags), bagged mix is usually easier and avoids ready-mix short-load fees. Over 1 cubic yard, a ready-mix truck is faster, produces a uniform pour without cold joints, and costs less per yard."],
  ["How thick should a concrete slab be?",
   "Pour 4 inches for patios, walkways, and shed pads; 4 to 5 inches for passenger-car driveways; and 5 to 6 inches for garages, RVs, or heavy trucks over a compacted 4-inch gravel base."],
  ["How long does concrete take to cure before walking or driving on it?",
   "Concrete is usually ready for light foot traffic after 24 to 48 hours, passenger cars after 7 days, and heavy trucks after 14 to 28 days. Concrete reaches its full rated compressive strength (such as 3,000 or 4,000 PSI) at 28 days under proper curing."],
  ["How much does a yard of concrete cost?",
   "Ready-mix concrete averages $160 to $195 per cubic yard for material in 2026, before short-load fees on orders under 5 yards. Installed concrete slabs (including labor, forms, base, and finishing) run $6.50 to $10.50 per square foot."],
  ["Do I need rebar or wire mesh in a concrete slab?",
   "Light residential patios and sidewalks often use 6×6 welded wire mesh or #3 rebar on 18-inch centers for crack control, while driveways, garage slabs, and load-bearing pads typically use #4 rebar on 16- to 18-inch grids supported on chairs."],
  ["How do I calculate concrete for a round column or Sonotube?",
   "Multiply π (3.1416) × radius² × height with all measurements in feet, then divide by 27 for cubic yards. A 12-inch tube (0.5 ft radius) that is 4 feet deep holds 3.14 cubic feet, or about six 80 lb bags."],
];

module.exports = {
  path: "/concrete-calculator/",
  title: "Concrete Calculator – Yards, Bags & Cost | Ruler Square",
  description: "Free concrete calculator for slabs, footings, columns, steps and curbs. Get cubic yards, 40/50/60/80 lb bag counts, and estimated cost instantly.",
  crumbs: "Concrete Calculator",
  breadcrumbs: [
    { name: "Home", href: "/" },
    { name: "Construction", href: "/construction-calculators/" },
    { name: "Concrete Calculator" },
  ],
  lastmod: UPDATED.iso,
  category: "construction",
  isCalculator: true,
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Concrete Calculator",
      url: SITE.url + "/concrete-calculator/",
      author: authorRef,
      dateModified: UPDATED.iso,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.url + "/" },
        { "@type": "ListItem", position: 2, name: "Construction", item: SITE.url + "/construction-calculators/" },
        { "@type": "ListItem", position: 3, name: "Concrete Calculator", item: SITE.url + "/concrete-calculator/" },
      ],
    },
  ],
  scripts: `<script src="/assets/concrete.js?v=VERSION" defer></script>`,
  body: `
<h1>Concrete Calculator</h1>
<p class="lede">Cubic yards, bag counts and ready-mix cost for slabs, footings, columns, steps and curbs.</p>

<form class="calc" id="concrete-form" novalidate>
  <div class="calc-inputs">
    <p class="calc-step">Your pour</p>
    <fieldset class="tabs">
      <legend>Shape</legend>
      <label><input type="radio" name="shape" value="slab" checked><span>Slab</span></label>
      <label><input type="radio" name="shape" value="footing"><span>Footing / wall</span></label>
      <label><input type="radio" name="shape" value="column"><span>Column / tube</span></label>
      <label><input type="radio" name="shape" value="circle"><span>Round slab</span></label>
      <label><input type="radio" name="shape" value="steps"><span>Steps</span></label>
      <label><input type="radio" name="shape" value="curb"><span>Curb &amp; gutter</span></label>
    </fieldset>

    <div class="shape" data-shape="slab">
      ${dim("Length", "length", "ft")}
      ${dim("Width", "width", "ft")}
      ${dim("Thickness", "thickness", "in", "(4 in typical for patios)")}
    </div>
    <div class="shape" data-shape="footing" hidden>
      ${dim("Total length", "fLength", "ft")}
      ${dim("Width", "fWidth", "in")}
      ${dim("Depth", "fDepth", "in")}
    </div>
    <div class="shape" data-shape="column" hidden>
      ${dim("Diameter", "diameter", "in")}
      ${dim("Height / depth", "height", "ft")}
    </div>
    <div class="shape" data-shape="circle" hidden>
      ${dim("Diameter", "cDiameter", "ft")}
      ${dim("Thickness", "cThickness", "in")}
    </div>
    <div class="shape" data-shape="steps" hidden>
      ${one("Number of steps", "stepCount", "", "steps")}
      ${dim("Step width", "stepWidth", "ft")}
      ${dim("Riser height", "riserHeight", "in", "(7 in typical)")}
      ${dim("Tread depth", "treadDepth", "in", "(11–12 in typical)")}
      ${dimOpt("Top platform depth", "platformDepth", "in", "(optional)")}
    </div>
    <div class="shape" data-shape="curb" hidden>
      ${dim("Total length", "curbLength", "ft")}
      ${dim("Curb depth (thickness)", "curbDepth", "in")}
      ${dim("Curb height", "curbHeight", "in")}
      ${dim("Gutter width", "gutterWidth", "in")}
      ${dim("Flag thickness", "flagThickness", "in")}
    </div>

    ${one("Quantity", "qty", 1, "pcs")}

    <details class="calc-options">
    <summary>Waste allowance &amp; price</summary>
    <div class="options-body row2">
      ${one("Waste allowance", "waste", 10, "%")}
      ${one("Price", "price", "", "$/yd³", "")}
    </div>
    </details>
    <button type="submit" class="btn-calc">Calculate</button>
    <div class="presets">
      <span class="presets-label">Quick fill:</span>
      <button type="button" class="preset-chip" data-preset='{"shape":"slab","length":10,"width":10,"thickness":4}'>10×10 patio</button>
      <button type="button" class="preset-chip" data-preset='{"shape":"slab","length":20,"width":20,"thickness":4}'>20×20 garage</button>
      <button type="button" class="preset-chip" data-preset='{"shape":"slab","length":24,"width":12,"thickness":4}'>12×24 driveway</button>
    </div>
    <div class="calc-actions"><button type="button" id="use-example">Try an example</button><button type="button" id="reset-calc">Reset</button></div>
  </div>

  <section class="calc-results" aria-label="Your estimate" aria-live="polite" tabindex="-1">
    <p class="calc-step">Your estimate</p>
    <div class="empty-state" id="r-empty"><p>Enter your dimensions to see cubic yards and bags live, or press <b>Calculate</b>.</p>${shapeSet([
      ["slab", slab()],
      ["footing", slab({ vertical: "depth" })],
      ["column", round({ vertical: "height" })],
      ["circle", round()],
      ["steps", stair()],
      ["curb", curb()],
    ])}</div>
    <div id="r-out" hidden>
    <p class="big">Concrete needed<strong><span id="r-yd3">0</span> yd³</strong></p>
    <ul class="results-list">
      <li><span>Cubic feet</span><b><span id="r-ft3">0</span> ft³</b></li>
      <li><span>Cubic meters</span><b><span id="r-m3">0</span> m³</b></li>
      <li><span>Order ready-mix <span class="sub">(¼ yd steps)</span></span><b id="r-order">—</b></li>
      <li><span>80 lb bags</span><b id="r-bag80">—</b></li>
      <li><span>60 lb bags</span><b id="r-bag60">—</b></li>
      <li><span>50 lb bags</span><b id="r-bag50">—</b></li>
      <li><span>40 lb bags</span><b id="r-bag40">—</b></li>
    </ul>
    <div class="cost" id="r-cost-box" hidden>Estimated concrete cost: <b id="r-cost"></b></div>
    <p class="tip" id="r-tip"></p>
    </div>
  </section>
</form>
${byline(UPDATED)}
${embedSnippet("/concrete-calculator/", "Concrete Calculator")}
<nav class="jump-links" aria-label="On this page"><a href="#formula">Formula</a><a href="#bags">Bags per yard</a><a href="#slab-chart">Common slabs</a><a href="#cost">Cost</a><a href="#waste">Waste</a><a href="#questions">FAQs</a></nav>

<div class="prose">
<h2 id="formula">The concrete formula</h2>
<p>Concrete is ordered by volume in cubic yards. Calculate cubic feet first, then divide by 27 (since 1 cubic yard = 3 × 3 × 3 = 27 ft³).</p>
<div class="formula">Slab: length (ft) × width (ft) × thickness (in) ÷ 12 ÷ 27 = cubic yards<br>Column / round pad: π × radius (ft)² × height (ft) ÷ 27 = cubic yards</div>
<p><strong>Worked example (10 × 12 ft patio, 4 in thick):</strong> 10 × 12 × 4 ÷ 12 = 40 ft³ = 1.48 yd³. Adding 10% waste brings the order to 44 ft³ (1.63 yd³, rounded up to <strong>1.75 yd³</strong> ready-mix, or 74 bags of 80 lb concrete).</p>

<h2 id="bags">How many bags of concrete are in a cubic yard?</h2>
<p>Premixed bags list their cured yield on the label. One cubic yard requires:</p>
${table(["Bag size", "Yield per bag", "Bags per cubic yard", "Bags per ½ yard"], [
  ["40 lb", "0.30 ft³", "90", "45"],
  ["50 lb", "0.375 ft³", "72", "36"],
  ["60 lb", "0.45 ft³", "60", "30"],
  ["80 lb", "0.60 ft³", "45", "23"],
])}
<p>Forty-five 80 lb bags weigh 3,600 pounds. For any continuous pour over about 1 cubic yard, ready-mix delivery avoids cold joints between hand-mixed batches and usually costs less than bags.</p>

<h2 id="slab-chart">Concrete needed for common slab sizes</h2>
<p>Volume in cubic yards and 80 lb bags at 4 inches thick, including 10% extra for waste.</p>
${table(["Slab size", "Area", "4 in thick (yd³)", "80 lb bags", "6 in thick (yd³)"], [
  ["10 × 10 ft", "100 ft²", "1.36 yd³", "62 bags", "2.04 yd³"],
  ["10 × 12 ft", "120 ft²", "1.63 yd³", "74 bags", "2.44 yd³"],
  ["12 × 12 ft", "144 ft²", "1.96 yd³", "88 bags", "2.93 yd³"],
  ["12 × 24 ft", "288 ft²", "3.91 yd³", "176 bags", "5.87 yd³"],
  ["20 × 20 ft", "400 ft²", "5.43 yd³", "245 bags", "8.15 yd³"],
  ["24 × 24 ft", "576 ft²", "7.82 yd³", "352 bags", "11.73 yd³"],
  ["30 × 40 ft", "1,200 ft²", "16.30 yd³", "734 bags", "24.44 yd³"],
])}

<h2 id="cost">How much does concrete cost in 2026?</h2>
<p>Ready-mix concrete averages <strong>$160 to $195 per cubic yard</strong> delivered for standard 3,000–4,000 PSI mix, though orders under 5 yards often add a $75–$150 short-load fee. For a full ready-mix delivery budget, use our <a href="/concrete-cost-per-yard/">concrete cost per yard calculator</a>. For a turnkey contractor quote including forms, base gravel, labor, and finishing, see the <a href="/concrete-slab-cost/">concrete slab cost calculator</a> ($6.50–$10.50/ft²).</p>

<h2 id="waste">How much extra concrete should you order?</h2>
<ul>
  <li><strong>Level, well-graded slab: 5%.</strong> Tight forms on compacted gravel hold close to exact volume.</li>
  <li><strong>Standard patio or garage slab: 10%.</strong> Covers minor low spots in the subgrade and chute loss.</li>
  <li><strong>Footings and trenches: 10–15%.</strong> Dug earth walls vary in width and consume extra mud.</li>
</ul>

<h2 id="questions">Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${q}</h3>\n<p>${a}</p>`).join("\n")}

<h2>Related calculators</h2>
<ul class="related-links">
  <li><a href="/concrete-bag-calculator/">Concrete Bag Calculator</a></li>
  <li><a href="/concrete-steps-calculator/">Concrete Steps Calculator</a></li>
  <li><a href="/sonotube-calculator/">Sonotube Concrete Calculator</a></li>
  <li><a href="/concrete-cost-per-yard/">Concrete Cost per Yard</a></li>
  <li><a href="/concrete-slab-cost/">Concrete Slab Cost Calculator</a></li>
  <li><a href="/rebar-calculator/">Rebar Calculator</a></li>
</ul>

<h2>References</h2>
<ul class="refs">
  <li><a href="https://www.quikrete.com/pdfs/data_sheet-concrete%20mix%201101.pdf" rel="noopener">QUIKRETE Concrete Mix 1101 Product Data Sheet (bag yields)</a></li>
  <li><a href="https://www.concrete.org/" rel="noopener">American Concrete Institute (ACI) — residential flatwork standards</a></li>
</ul>
<p class="note">Standard geometry: 1 cubic yard = 27 cubic feet. Verify mix PSI, thickness, and reinforcement with local building codes. Updated ${UPDATED.text}.</p>
</div>
`,
};
