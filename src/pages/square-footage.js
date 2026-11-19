const { SITE, embedSnippet } = require("../layout");
const { areaShapes } = require("../diagrams");
const { byline, authorRef, UPDATED } = require("../author");

const table = (head, rows) => `<div class="table-wrap"><table>
  <thead><tr>${head.map(h => `<th scope="col">${h}</th>`).join("")}</tr></thead>
  <tbody>${rows.map(r => `<tr>${r.map((c, i) => i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
</table></div>`;

const faq = [
  ["How do I calculate square footage?",
   "Multiply length by width with both measurements in feet (for example, a 12 × 14 ft room equals 168 square feet). For irregular rooms, break the floor into rectangles, triangles, or circles and add each section together."],
  ["How do I find the square footage of an L-shaped room?",
   "Split the L into two non-overlapping rectangles, multiply length × width for each rectangle, and add the two areas. Click '+ Add another section' above to sum multiple rectangles automatically."],
  ["How many square feet are in a square yard?",
   "Nine square feet equal 1 square yard (3 ft × 3 ft). Divide square footage by 9 to convert to square yards when comparing carpet or turf quotes."],
  ["How do I convert square feet to acres?",
   "Divide square feet by 43,560. A quarter-acre lot is 10,890 square feet, and half an acre is 21,780 square feet."],
  ["How much extra square footage should I add for flooring?",
   "Add 10% for straight layouts in rectangular rooms, 15% for diagonal installations or rooms with many corners, and 20% for herringbone or chevron patterns."],
  ["What is a roofing square?",
   "One roofing square equals 100 square feet of roof surface. A 2,400 square foot sloped roof is 24 squares."],
];

module.exports = {
  path: "/square-footage-calculator/",
  title: "Square Footage Calculator – Sq Ft & Acres | Ruler Square",
  description: "Free square footage calculator for rooms, yards and irregular shapes. Combine rectangles, circles, triangles and trapezoids in sq ft, sq yd, m² and acres.",
  crumbs: "Square Footage Calculator",
  breadcrumbs: [
    { name: "Home", href: "/" },
    { name: "Construction", href: "/construction-calculators/" },
    { name: "Square Footage Calculator" },
  ],
  lastmod: UPDATED.iso,
  category: "construction",
  isCalculator: true,
  schema: [
    {
      "@context": "https://schema.org", "@type": "WebApplication",
      name: "Square Footage Calculator", url: SITE.url + "/square-footage-calculator/", author: authorRef,
      dateModified: UPDATED.iso,
      applicationCategory: "UtilitiesApplication", operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    },
    {
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.url + "/" },
        { "@type": "ListItem", position: 2, name: "Construction", item: SITE.url + "/construction-calculators/" },
        { "@type": "ListItem", position: 3, name: "Square Footage Calculator", item: SITE.url + "/square-footage-calculator/" },
      ],
    },
  ],
  scripts: `<script src="/assets/area.js?v=VERSION" defer></script>`,
  body: `
<h1>Square Footage Calculator</h1>
<p class="lede">Measure rooms, lots and irregular shapes in sq ft, sq yards, m² and acres.</p>

<template id="section-tpl">
  <div class="section">
    <div class="section-head">
      <button type="button" class="section-sign" data-sign="1" title="Toggle Add area or Subtract cutout">+ Add</button>
      <div class="select">
        <select data-f="shape" aria-label="Shape">
          <option value="rect">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="triangle">Triangle</option>
          <option value="trapezoid">Trapezoid</option>
        </select>
      </div>
      <div class="select">
        <select data-f="unit" aria-label="Units">
          <option value="ft">feet</option>
          <option value="in">inches</option>
          <option value="yd">yards</option>
          <option value="m">meters</option>
          <option value="cm">cm</option>
        </select>
      </div>
      <button type="button" class="section-remove" aria-label="Remove this section">&times;</button>
    </div>
    <div class="section-fields">
      <div class="field" data-w="a"><span class="label">Length</span><div class="unit"><input type="number" inputmode="decimal" min="0.001" step="any" data-f="a" value=""></div></div>
      <div class="field" data-w="b"><span class="label">Width</span><div class="unit"><input type="number" inputmode="decimal" min="0.001" step="any" data-f="b" value=""></div></div>
      <div class="field" data-w="c" hidden><span class="label">Height</span><div class="unit"><input type="number" inputmode="decimal" min="0.001" step="any" data-f="c" value=""></div></div>
      <div class="field"><span class="label">Qty</span><div class="unit"><input type="number" inputmode="numeric" min="1" step="1" data-f="qty" value="1"></div></div>
    </div>
  </div>
</template>

<form class="calc" id="area-form" novalidate>
  <div class="calc-inputs">
    <p class="calc-step">Your space</p>
    <div id="sections"></div>
    <button type="button" class="btn-secondary" id="add-section">+ Add another section</button>

    <details class="calc-options">
    <summary>Waste allowance &amp; price</summary>
    <div class="options-body row2">
      <div class="field">
        <label class="label" for="f-waste">Waste allowance</label>
        <div class="unit"><input id="f-waste" type="number" inputmode="decimal" min="0" max="50" step="any" name="wastePct" value=""><em>%</em></div>
      </div>
      <div class="field">
        <label class="label" for="f-price">Price</label>
        <div class="unit"><input id="f-price" type="number" inputmode="decimal" min="0" step="any" name="pricePerFt2" value=""><em>$/ft&sup2;</em></div>
      </div>
    </div>
    </details>
    <button type="submit" class="btn-calc">Calculate</button>
    <div class="calc-actions"><button type="button" id="use-example">Try an L-shaped room</button><button type="button" id="reset-calc">Reset</button></div>
  </div>

  <section class="calc-results" aria-label="Your estimate" aria-live="polite" tabindex="-1">
    <p class="calc-step">Your estimate</p>
    <div class="empty-state" id="r-empty"><p>Enter your dimensions to see total area live, or press <b>Calculate</b>.</p>${areaShapes()}</div>
    <div id="r-out" hidden>
    <p class="big">Total area<strong><span id="r-ft2">0</span> ft&sup2;</strong></p>
    <ul class="results-list">
      <li><span>Before waste allowance</span><b id="r-ft2-raw">—</b></li>
      <li><span>Square yards</span><b id="r-yd2">—</b></li>
      <li><span>Square meters</span><b id="r-m2">—</b></li>
      <li><span>Acres</span><b id="r-acres">—</b></li>
      <li><span>Roofing squares <span class="sub">(100 ft&sup2;)</span></span><b id="r-squares">—</b></li>
      <li><span>Perimeter <span class="sub">(added rectangles/circles)</span></span><b id="r-perim">—</b></li>
    </ul>
    <div class="cost" id="r-cost-box" hidden>Estimated cost: <b id="r-cost"></b></div>
    <p class="tip">Click <b>+ Add</b> on any section to switch it to <b>− Cutout</b> (subtract closets, islands or openings automatically).</p>
    </div>
  </section>
</form>
${byline(UPDATED)}
${embedSnippet("/square-footage-calculator/", "Square Footage Calculator")}
<nav class="jump-links" aria-label="On this page"><a href="#formula">Formulas</a><a href="#conversions">Conversions</a><a href="#waste">Waste guide</a><a href="#questions">FAQs</a></nav>

<div class="prose">
<h2 id="formula">How to calculate square footage</h2>
<p>Multiply length by width with both measurements in feet. For L-shaped rooms, bay windows, or irregular yards, split the space into simple shapes and add their areas.</p>
<div class="formula">Rectangle: length × width<br>Circle: π × (diameter ÷ 2)²<br>Triangle: base × height ÷ 2<br>Trapezoid: (side A + side B) × height ÷ 2</div>
<p><strong>Worked example (L-shaped living room):</strong> A 16 × 12 ft main space (192 ft²) plus an 8 × 6 ft leg (48 ft²) equals <strong>240 ft²</strong>. Adding 10% flooring waste gives 264 ft²; at $4.50/ft², material comes to $1,188.</p>

<h2 id="conversions">Square footage conversion table</h2>
${table(["Conversion", "Formula", "Example"], [
  ["Square feet to square yards", "divide by 9", "900 ft² = 100 yd²"],
  ["Square feet to square meters", "divide by 10.7639", "1,000 ft² = 92.9 m²"],
  ["Square feet to acres", "divide by 43,560", "10,890 ft² = 0.25 acres"],
  ["Square feet to roofing squares", "divide by 100", "2,400 ft² = 24 squares"],
  ["Square inches to square feet", "divide by 144", "1,728 in² = 12 ft²"],
])}

<h2 id="waste">How much extra to add for waste</h2>
${table(["Material or layout", "Recommended waste", "Why"], [
  ["Flooring, straight lay", "10%", "End cuts and last row"],
  ["Flooring, diagonal (45°)", "15%", "Angled offcuts rarely reuse"],
  ["Herringbone or chevron", "20%", "Repeated mitered cuts at both ends"],
  ["Standard grid tile", "10%", "Perimeter cuts and breakage"],
  ["Large-format tile", "15%", "Each broken tile loses more coverage"],
  ["Carpet", "10–20%", "Fixed 12 ft roll width and seam placement"],
  ["Sod or turf", "5–10%", "Trimming along curves and beds"],
])}

<h2>Tips for older or out-of-square rooms</h2>
<p>Measure both ends of long walls—if they differ by more than an inch, use the larger number so flooring or drywall reaches the widest point. Leave small columns and built-in islands in the total unless they are large; cutting around them creates offcuts anyway.</p>

<h2 id="questions">Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${q}</h3>\n<p>${a}</p>`).join("\n")}

<h2>Related calculators</h2>
<ul class="related-links">
  <li><a href="/flooring-calculator/">Flooring Calculator</a></li>
  <li><a href="/paint-calculator/">Paint Calculator</a></li>
  <li><a href="/cubic-yard-calculator/">Cubic Yard Calculator</a></li>
  <li><a href="/acreage-calculator/">Acreage Calculator</a></li>
  <li><a href="/tile-calculator/">Tile Calculator</a></li>
  <li><a href="/carpet-calculator/">Carpet Calculator</a></li>
</ul>

<h2>References</h2>
<ul class="refs">
  <li><a href="https://www.nist.gov/pml/owm" rel="noopener">NIST Office of Weights and Measures — exact area conversions</a></li>
</ul>
<p class="note">Exact definitions: 1 yd² = 9 ft², 1 acre = 43,560 ft², 1 m² = 10.7639 ft². Updated ${UPDATED.text}.</p>
</div>
`,
};
