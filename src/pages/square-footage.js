const { SITE } = require("../layout");

const table = (head, rows) => `<div class="table-wrap"><table>
  <thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead>
  <tbody>${rows.map(r => `<tr>${r.map((c, i) => i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
</table></div>`;

const faq = [
  ["How do I calculate square footage?",
   "Multiply length by width, with both in feet. A room 12 feet by 14 feet is 168 square feet. For a space that is not a rectangle, split it into rectangles, triangles and circles, work out each one and add them together — that is what the sections above are for."],
  ["How do I find the square footage of an L-shaped room?",
   "Cut the L into two rectangles. Measure each one separately, calculate both areas and add them. Where you cut does not matter as long as the two pieces do not overlap and together they cover the whole floor."],
  ["How many square feet are in a square yard?",
   "Nine. A square yard is three feet by three feet. Carpet is often priced per square yard while the room is measured in square feet, so divide your square footage by 9 before you compare prices."],
  ["How do I convert square feet to acres?",
   "Divide by 43,560. A quarter-acre lot is 10,890 square feet; a full acre is roughly the size of an American football field without the end zones."],
  ["How much extra should I order for flooring?",
   "Ten percent for a straightforward rectangular room laid square to the walls. Fifteen percent for a room with lots of corners, or when laying at 45 degrees, because diagonal cuts waste more. Twenty percent for herringbone or any pattern with repeated angled cuts."],
  ["What is a roofing square?",
   "One hundred square feet. Roofers quote in squares rather than square feet, so a 2,400 square foot roof surface is 24 squares. The calculator shows both."],
];

module.exports = {
  path: "/square-footage-calculator/",
  title: "Square Footage Calculator – Area in Sq Ft, Yards & Acres | Ruler Square",
  description: "Free square footage calculator. Add rectangles, circles, triangles and trapezoids to measure any shape, with results in sq ft, sq yards, m² and acres.",
  crumbs: "Square Footage Calculator",
  lastmod: "2026-09-22",
  schema: [
    {
      "@context": "https://schema.org", "@type": "WebApplication",
      name: "Square Footage Calculator", url: SITE.url + "/square-footage-calculator/",
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
        { "@type": "ListItem", position: 2, name: "Square Footage Calculator", item: SITE.url + "/square-footage-calculator/" },
      ],
    },
  ],
  scripts: `<script src="/assets/area.js?v=VERSION" defer></script>`,
  body: `
<h1>Square Footage Calculator</h1>
<p class="lede">Measure any space, including rooms that are not simple rectangles. Add a section for each part and the calculator adds them up.</p>

<template id="section-tpl">
  <div class="section">
    <div class="section-head">
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
      <div class="field" data-w="a"><span class="label">Length</span><div class="unit"><input type="number" inputmode="decimal" min="0" step="any" data-f="a" value=""></div></div>
      <div class="field" data-w="b"><span class="label">Width</span><div class="unit"><input type="number" inputmode="decimal" min="0" step="any" data-f="b" value=""></div></div>
      <div class="field" data-w="c" hidden><span class="label">Height</span><div class="unit"><input type="number" inputmode="decimal" min="0" step="any" data-f="c" value=""></div></div>
      <div class="field"><span class="label">Qty</span><div class="unit"><input type="number" inputmode="numeric" min="1" step="1" data-f="qty" value="1"></div></div>
    </div>
  </div>
</template>

<form class="calc" id="area-form" novalidate>
  <div class="calc-inputs">
    <div id="sections"></div>
    <button type="button" class="btn-secondary" id="add-section">+ Add another section</button>

    <details class="calc-options">
    <summary>Waste allowance &amp; price</summary>
    <div class="options-body row3">
      <div class="field">
        <label class="label" for="f-waste">Waste allowance</label>
        <div class="unit"><input id="f-waste" type="number" inputmode="decimal" min="0" max="50" step="any" name="wastePct" value=""><em>%</em></div>
      </div>
      <div class="field">
        <label class="label" for="f-price">Price</label>
        <div class="unit"><input id="f-price" type="number" inputmode="decimal" min="0" step="any" name="pricePerFt2" value=""><em>$/ft&sup2;</em></div>
      </div>
    </div>
    <p class="note">Add 10–15% for flooring, more for diagonal or patterned layouts.</p>
    </details>
    <button type="submit" class="btn-calc">Calculate</button>
  </div>

  <div class="calc-results" aria-live="polite">
    <p class="empty-state" id="r-empty">Enter your measurements above and press <b>Calculate</b>.</p>
    <div id="r-out" hidden>
    <p class="big">Total area<strong><span id="r-ft2">0</span> ft&sup2;</strong></p>
    <ul class="results-list">
      <li><span>Before waste allowance</span><b id="r-ft2-raw">—</b></li>
      <li><span>Square yards</span><b id="r-yd2">—</b></li>
      <li><span>Square meters</span><b id="r-m2">—</b></li>
      <li><span>Acres</span><b id="r-acres">—</b></li>
      <li><span>Roofing squares <span class="sub">(100 ft&sup2;)</span></span><b id="r-squares">—</b></li>
    </ul>
    <div class="cost" id="r-cost-box" hidden>Estimated cost: <b id="r-cost"></b></div>
    <p class="tip">Add a section for each part of an irregular space. Areas are added together.</p>
    </div>
  </div>
</form>

<div class="prose">
<h2>How to calculate square footage</h2>
<p>Square footage is area, and for a rectangle it is simply length times width with both measurements in feet. The complication is that almost nothing you actually need to measure is a clean rectangle.</p>
<div class="formula">Rectangle: length (ft) × width (ft)<br>Circle: π × radius², where radius is half the diameter<br>Triangle: base × height ÷ 2<br>Trapezoid: (side A + side B) × height ÷ 2</div>
<p>For anything irregular, the method is always the same: break it into shapes you can measure, work out each one, add them up. An L-shaped room is two rectangles. A room with a bay window is a rectangle plus a half circle or a trapezoid. Use a separate section above for each piece.</p>

<h3>Worked example: an L-shaped living room</h3>
<p>The main part is 16 by 12 feet, and the leg of the L is 8 by 6 feet. That is 16 × 12 = 192 square feet plus 8 × 6 = 48 square feet, for 240 square feet total. If you are buying flooring at $4.50 a square foot with a 10% waste allowance, you need 264 square feet and the material comes to $1,188.</p>

<h2>Converting square feet</h2>
${table(["To convert", "Do this", "Example"], [
  ["Square feet to square yards", "divide by 9", "900 ft² = 100 yd²"],
  ["Square feet to square meters", "divide by 10.764", "1,000 ft² = 92.9 m²"],
  ["Square feet to acres", "divide by 43,560", "10,890 ft² = 0.25 acres"],
  ["Square feet to roofing squares", "divide by 100", "2,400 ft² = 24 squares"],
  ["Square inches to square feet", "divide by 144", "1,728 in² = 12 ft²"],
])}
<p class="note">Square units do not convert like linear ones. There are three feet in a yard but nine square feet in a square yard, because you are squaring the conversion factor.</p>

<h2>How much extra to buy</h2>
<p>Almost nothing gets installed with zero offcuts. How much to add depends on the material and the layout, not on how carefully you measure:</p>
${table(["Material or layout", "Add", "Why"], [
  ["Flooring, square to the walls", "10%", "End cuts and the last row."],
  ["Flooring, diagonal or 45°", "15%", "Every cut is angled, so offcuts are unusable."],
  ["Herringbone or chevron", "20%", "Repeated angled cuts at both ends."],
  ["Tile, standard grid", "10%", "Breakage plus perimeter cuts."],
  ["Tile, large format", "15%", "One broken tile wastes more area."],
  ["Carpet", "10–20%", "Roll width forces seam placement."],
  ["Sod or turf", "5–10%", "Trimming to curved edges."],
])}

<h2>Measuring rooms without straight walls</h2>
<p>Older houses are rarely square. Measure the length in two or three places rather than once — if the readings differ by more than an inch, use the largest, because flooring has to fit the widest point.</p>
<p>For a curved bay, a trapezoid is usually close enough: measure the wall behind it, the outer face of the bay, and the depth between them. The error against a true curve is under a percent, which the waste allowance absorbs.</p>
<p>Do not subtract small obstructions like columns or kitchen islands unless they are genuinely large. The material you would have saved usually ends up as offcuts anyway, and running short is far more expensive than a few spare boxes.</p>

<h2>Where square footage gets used</h2>
<ul>
  <li><strong>Flooring, tile and carpet:</strong> priced per square foot or square yard.</li>
  <li><strong>Paint:</strong> wall area, not floor area — measure perimeter times ceiling height.</li>
  <li><strong>Roofing:</strong> in squares of 100 square feet, on the sloped surface rather than the footprint.</li>
  <li><strong>Materials by depth:</strong> gravel, mulch, topsoil and concrete all start from area, then multiply by thickness.</li>
  <li><strong>Property listings:</strong> usually measured to the outside of exterior walls, which is why a listing figure is larger than what you can actually floor.</li>
</ul>

<h2>Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${q}</h3>\n<p>${a}</p>`).join("\n")}

<h2>Related calculators</h2>
<div class="grid">
  <a class="card" href="/concrete-calculator/"><b>Concrete Calculator</b><span>Turn area into cubic yards and bags</span></a>
  <a class="card" href="/gravel-calculator/"><b>Gravel Calculator</b><span>Area plus depth, in tons and yards</span></a>
  <a class="card" href="/asphalt-calculator/"><b>Asphalt Calculator</b><span>Tons of hot mix for any paved area</span></a>
  <a class="card" href="/mulch-calculator/"><b>Mulch Calculator</b><span>Beds by area and depth</span></a>
  <a class="card" href="/topsoil-calculator/"><b>Topsoil Calculator</b><span>Lawns and garden beds</span></a>
</div>

<h2>References</h2>
<ul class="refs">
  <li>All conversions are exact definitions: 1 yd² = 9 ft², 1 acre = 43,560 ft², 1 m² = 10.7639 ft².</li>
  <li>Waste allowances reflect common trade practice; your installer may quote differently for an unusual layout.</li>
</ul>
</div>
`,
};
