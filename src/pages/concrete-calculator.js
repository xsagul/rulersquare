const { SITE } = require("../layout");

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
function one(label, name, value, unit, hint = "") {
  return `<div class="field">
  <label class="label" for="f-${name}">${label}${hint ? ` <span class="hint">${hint}</span>` : ""}</label>
  <div class="unit"><input id="f-${name}" type="number" inputmode="decimal" min="${name === "qty" ? 1 : 0}" max="${name === "waste" ? 50 : 10000000}" step="${name === "qty" ? 1 : "any"}" name="${name}" value="${value}"${name === "price" ? "" : " required"}><em>${unit}</em></div>
</div>`;
}
const table = (head, rows) => `<div class="table-wrap"><table>
  <thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead>
  <tbody>${rows.map(r => `<tr>${r.map((c, i) => i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
</table></div>`;

const faq = [
  ["How many bags of concrete are in a cubic yard?",
   "It depends on the bag size. A cubic yard is 27 cubic feet, so you need about 45 bags of 80 lb concrete (0.60 cu ft each), 60 bags of 60 lb (0.45 cu ft), 72 bags of 50 lb (0.375 cu ft) or 90 bags of 40 lb (0.30 cu ft)."],
  ["How much extra concrete should I order?",
   "Add 5% to 10% for spillage, uneven ground and forms that bow out. Use the higher end for footings and uneven subgrade, where the real depth is hard to control. Running out mid-pour leaves a cold joint, which is a permanent weak line through the slab."],
  ["Should I use bags or ready-mix?",
   "For small jobs under about one cubic yard, bags are usually easier. Above that, ready-mix delivery is usually cheaper and much faster than mixing dozens of bags by hand. Many suppliers sell in quarter- or half-yard steps and may charge a short-load fee for small orders."],
  ["How thick should a concrete slab be?",
   "Four inches is the common thickness for patios, sidewalks and shed floors. Driveways for passenger cars are usually 4 to 5 inches, and 5 to 6 inches for heavier vehicles. Check your local building code for your project."],
  ["How do I calculate concrete for a round column or tube?",
   "Multiply π × radius² × height, with everything in feet. For a 12 inch tube that is 4 feet tall: 3.1416 × 0.5² × 4 = 3.14 cubic feet, or about 0.12 cubic yards."],
  ["How much does a yard of concrete cost?",
   "The linked concrete cost guide uses a published $160–$195-per-yard starting range for ready-mix material. Delivery, short-load fees, tax and installation may be separate. Get a quote for the selected mix and location; the calculator does not assume a material price."],
  ["How long does concrete take to cure?",
   "Strength develops over time and depends on the mix, temperature and curing. A 28-day strength rating is not a universal permission to load a slab earlier. Follow the mix maker’s curing instructions and the contractor’s schedule for foot or vehicle traffic."],
  ["Do I need rebar or wire mesh in a slab?",
   "Use the project’s approved reinforcement plan. Fibers, welded wire and reinforcing bars are not automatically interchangeable. Loads, soil, slab thickness, joints and local requirements affect the design; this calculator only estimates concrete volume."],
];

module.exports = {
  path: "/concrete-calculator/",
  title: "Concrete Calculator – Cubic Yards, Bags & Cost | Ruler Square",
  description: "Free concrete calculator for slabs, footings, columns and round pads. Get cubic yards, how many 40, 50, 60 or 80 lb bags you need, and the cost.",
  crumbs: "Concrete Calculator",
  lastmod: "2026-09-22",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Concrete Calculator",
      url: SITE.url + "/concrete-calculator/",
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
        { "@type": "ListItem", position: 2, name: "Concrete Calculator", item: SITE.url + "/concrete-calculator/" },
      ],
    },
  ],
  scripts: `<script src="/assets/concrete.js?v=VERSION" defer></script>`,
  body: `
<h1>Concrete Calculator</h1>
<p class="lede">Cubic yards, bags and cost for your slab, footing or column.</p>

<form class="calc" id="concrete-form" novalidate>
  <div class="calc-inputs">
    <fieldset class="tabs">
      <legend>Shape</legend>
      <label><input type="radio" name="shape" value="slab" checked><span>Slab</span></label>
      <label><input type="radio" name="shape" value="footing"><span>Footing / wall</span></label>
      <label><input type="radio" name="shape" value="column"><span>Round column</span></label>
      <label><input type="radio" name="shape" value="circle"><span>Round slab</span></label>
    </fieldset>

    <div class="shape" data-shape="slab">
      ${dim("Length", "length", "ft")}
      ${dim("Width", "width", "ft")}
      ${dim("Thickness", "thickness", "in", "(4 in is typical for patios)")}
    </div>
    <div class="shape" data-shape="footing" hidden>
      ${dim("Total length", "fLength", "ft")}
      ${dim("Width", "fWidth", "in")}
      ${dim("Depth", "fDepth", "in")}
    </div>
    <div class="shape" data-shape="column" hidden>
      ${dim("Diameter", "diameter", "in")}
      ${dim("Height", "height", "ft")}
    </div>
    <div class="shape" data-shape="circle" hidden>
      ${dim("Diameter", "cDiameter", "ft")}
      ${dim("Thickness", "cThickness", "in")}
    </div>

    ${one("Quantity", "qty", 1, "pcs")}

    <details class="calc-options">
    <summary>Waste allowance &amp; price</summary>
    <div class="options-body row2">
      ${one("Extra for waste", "waste", 10, "%")}
      ${one("Price", "price", "", "$/yd³", "")}
    </div>
    <p class="note">The default allowance is 10%. Enter your local ready-mix price per cubic yard to estimate the cost.</p>
    </details>
    <button type="submit" class="btn-calc">Calculate</button>
  </div>

  <div class="calc-results" aria-live="polite">
    <p class="empty-state" id="r-empty">Enter your dimensions above and press <b>Calculate</b>.</p>
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
    <p class="tip">Results include the waste allowance. Bag counts use the typical yield printed on premixed bags.</p>
    </div>
  </div>
</form>

<div class="prose">
<h2>How to use the concrete calculator</h2>
<ol>
  <li>Pick the shape: a flat slab, a footing or wall, a round column (like a tube form), or a round slab.</li>
  <li>Enter each measurement and choose its unit. For example, 10 feet 6 inches can be entered as 10.5 feet or 126 inches.</li>
  <li>If you are pouring several identical pieces, like deck footings, set the quantity.</li>
  <li>Keep 5–10% extra for waste, and add your local price per cubic yard if you want a cost estimate.</li>
</ol>

<h2>The concrete formula</h2>
<p>Concrete is sold by volume. Work out the volume in cubic feet, then divide by 27 to get cubic yards. Every shape on this page comes down to the same two steps — find the volume, then convert.</p>
<div class="formula">Slab: length (ft) × width (ft) × thickness (in) ÷ 12 = cubic feet<br>Cubic yards = cubic feet ÷ 27</div>
<p>For a round column or tube form, the volume is π × radius² × height, with every measurement in feet. A round slab uses the same formula with the thickness in place of the height. Footings are just long, narrow slabs: total length × width × depth.</p>

<h3>Example: a 10 × 12 ft patio, 4 inches thick</h3>
<p>10 × 12 × 4 ÷ 12 = 40 cubic feet. That is 40 ÷ 27 = 1.48 cubic yards. With 10% extra, you need 44 cubic feet, or 1.63 cubic yards. In 80 lb bags, that is 44 ÷ 0.60 = 74 bags, so for a pour this size a ready-mix truck makes more sense.</p>

<h2>How many bags of concrete do I need?</h2>
<p>Each bag size fills a set volume once mixed. These are the typical yields printed on premixed concrete bags:</p>
${table(["Bag size", "Yield per bag", "Bags per cubic yard", "Bags per ½ yard"], [
  ["40 lb", "0.30 ft³", "90", "45"],
  ["50 lb", "0.375 ft³", "72", "36"],
  ["60 lb", "0.45 ft³", "60", "30"],
  ["80 lb", "0.60 ft³", "45", "23"],
])}
<p class="note">Check the yield on the bag you buy. Some mixes, like fast-setting or high-strength concrete, yield slightly different amounts.</p>
<p>Bags stop making sense somewhere around one cubic yard. Forty-five 80 lb bags is 3,600 pounds to carry, open and mix, and a mixer only handles two or three bags at a time — which means the first batch is setting while you are still mixing the tenth. For a continuous pour, that is how you end up with cold joints through the slab.</p>

<h2>How much does a yard of concrete cost?</h2>
<p>Use the <a href="/concrete-cost-per-yard/">concrete cost-per-yard calculator</a> for the published $160–$195 material starting range and its source. A local quote for your mix and order size may be outside that range.</p>
<p>Ask whether delivery, short-load fees, waiting time, weekend charges and tax are included. The optional price above calculates material only. For an installed budget, use the <a href="/concrete-slab-cost/">slab cost calculator</a>.</p>
<p>For a bagged-price comparison, 45 bags yielding 0.60 cubic foot each make one yard. If each bag costs $6, that is $270 in material; the $6 price is an example, not a current store quote.</p>

<h2>Use the thickness on your plans</h2>
<p>A volume estimate cannot choose a safe slab or footing design. Confirm thickness, mix strength, base preparation, joints and reinforcement with the approved plans or a qualified professional. Soil, frost, water and intended loads all matter.</p>
<p>A change from 4 to 6 inches increases concrete volume by 50%. Enter the actual planned thickness instead of treating the example as a specification.</p>

<h2>How much extra concrete to order</h2>
<p>The calculator defaults to 10%, which suits most slabs. Adjust it for the job:</p>
<ul>
  <li><strong>Slab on a prepared, level base: 5%.</strong> The depth is controlled by the forms, so there is little to go wrong.</li>
  <li><strong>Slab on uneven or soft subgrade: 10%.</strong> The low spots take more than you measured.</li>
  <li><strong>Footings and trenches: 10–15%.</strong> Trench walls slump and the real width is rarely the width you dug.</li>
  <li><strong>Anything on a slope, or forms that might bow: 15%.</strong></li>
</ul>
<p>Ordering short is the expensive mistake. A second truck for half a yard costs as much as several yards would have, and the joint where the first pour stopped setting is a permanent weakness in the slab.</p>

<h2>Frequently asked questions</h2>
${faq.map(([q, a]) => `<h3>${q}</h3>\n<p>${a}</p>`).join("\n")}

<h2>Related calculators</h2>
<div class="grid">
  <a class="card" href="/gravel-calculator/"><b>Gravel Calculator</b><span>Base course under a slab, in yards and tons</span></a>
  <a class="card" href="/stone-calculator/"><b>Crushed Stone Calculator</b><span>#57 stone and crusher run for bases</span></a>
  <a class="card" href="/sand-calculator/"><b>Sand Calculator</b><span>Bedding sand in yards, tons or bags</span></a>
  <a class="card" href="/fill-dirt-calculator/"><b>Fill Dirt Calculator</b><span>Grading and backfill before you pour</span></a>
</div>

<h2>References</h2>
<ul class="refs">
  <li>Bag yields are published by manufacturers; see the <a href="https://www.quikrete.com/pdfs/data_sheet-concrete%20mix%201101.pdf">QUIKRETE Concrete Mix product data sheet</a>.</li>
  <li>Volume conversions are standard geometry: 1 cubic yard = 27 cubic feet.</li>
  <li>Pricing reference and scope: <a href="/concrete-cost-per-yard/">Concrete cost per yard</a>, with a link to the published source.</li>
  <li>This is a volume estimate, not a thickness or reinforcement design.</li>
</ul>
</div>
`,
};
