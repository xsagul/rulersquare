const { SITE } = require("../layout");

function dim(label, name, defUnit, hint = "") {
  const units = [["in", "inches"], ["ft", "feet"], ["yd", "yards"], ["cm", "cm"], ["m", "meters"]];
  return `<div class="field">
  <label class="label" for="f-${name}">${label}${hint ? ` <span class="hint">${hint}</span>` : ""}</label>
  <div class="combo">
    <input id="f-${name}" type="number" inputmode="decimal" min="0" step="any" name="${name}" value="">
    <select name="${name}Unit" aria-label="${label} units">
      ${units.map(([v, t]) => `<option value="${v}"${v === defUnit ? " selected" : ""}>${t}</option>`).join("")}
    </select>
  </div>
</div>`;
}
function one(label, name, value, unit, hint = "") {
  return `<div class="field">
  <label class="label" for="f-${name}">${label}${hint ? ` <span class="hint">${hint}</span>` : ""}</label>
  <div class="unit"><input id="f-${name}" type="number" inputmode="decimal" min="0" step="any" name="${name}" value="${value}"><em>${unit}</em></div>
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
   "Ready-mix concrete runs roughly $140 to $190 per cubic yard for the material in 2026, before delivery. Short-load fees for orders under about 3 yards add $50 to $150, and fuel or environmental surcharges are common. Bagged concrete works out far more expensive per yard — around $250 to $300 once you have bought 45 bags of 80 lb mix."],
  ["How long does concrete take to cure?",
   "You can usually walk on a slab after 24 to 48 hours and drive a car on it after 7 days. Full design strength takes 28 days, which is the standard the mix is specified against. Keep the surface damp for the first week in hot weather — concrete that dries too fast is permanently weaker than concrete that cures slowly."],
  ["Do I need rebar or wire mesh in a slab?",
   "For a 4 inch patio or sidewalk, fibre mesh in the mix or a layer of welded wire is usually enough to control cracking. Driveways and anything carrying vehicle loads are normally reinforced with #3 or #4 rebar on 18 to 24 inch centres. Reinforcement does not stop concrete cracking — it holds the crack tight once it happens."],
];

module.exports = {
  path: "/concrete-calculator/",
  title: "Concrete Calculator – Cubic Yards, Bags & Cost | Ruler Square",
  description: "Free concrete calculator for slabs, footings, columns and round pads. Get cubic yards, how many 40, 50, 60 or 80 lb bags you need, and the cost.",
  crumbs: "Concrete Calculator",
  lastmod: "2026-09-21",
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
<p class="lede">Enter your dimensions to see how many cubic yards of concrete you need, how many bags to buy, and what it will cost.</p>

<form class="calc" id="concrete-form" novalidate>
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

    <div class="row3">
      ${one("Quantity", "qty", 1, "pcs")}
      ${one("Extra for waste", "waste", 10, "%")}
      ${one("Price", "price", "", "$/yd³", "")}
    </div>
    <p class="note">Price is optional. Enter your local ready-mix price per cubic yard to estimate the cost.</p>
    <button type="submit" class="btn-calc">Calculate</button>
  </div>
</form>

<div class="prose">
<h2>How to use the concrete calculator</h2>
<ol>
  <li>Pick the shape: a flat slab, a footing or wall, a round column (like a tube form), or a round slab.</li>
  <li>Enter the measurements. Lengths take feet plus inches; thickness and depth are in inches.</li>
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
<p>Ready-mix concrete costs roughly <strong>$140 to $190 per cubic yard</strong> for the material in 2026, but the delivered price is what matters, and several fees sit on top of it:</p>
${table(["Charge", "Typical cost", "When it applies"], [
  ["Ready-mix, per yard", "$140–$190", "The material itself, 3000–4000 psi mix."],
  ["Short-load fee", "$50–$150", "Orders under about 3 yards."],
  ["Delivery / fuel surcharge", "$20–$100", "Most suppliers, varies with distance."],
  ["Standby time", "$1–$3 per minute", "After the first 5–10 minutes of unloading."],
  ["Saturday or after-hours", "$50–$200", "Outside normal plant hours."],
])}
<p>That is why a single-yard pour can land near $400 all in, while five yards on the same truck costs perhaps $900. If you are close to a threshold, pouring a little more concrete is often cheaper per yard than pouring a little less.</p>
<p>Bagged concrete is far more expensive per yard — 45 bags of 80 lb mix at $6 each is around $270 per cubic yard, before you count your own time. It wins only on small jobs where the short-load fee would dominate.</p>

<h2>Common slab thicknesses</h2>
${table(["Project", "Typical thickness", "Reinforcement"], [
  ["Sidewalk, patio, shed floor", "4 in", "Fibre mesh or welded wire"],
  ["Driveway, passenger cars", "4–5 in", "Welded wire or #3 rebar"],
  ["Driveway, trucks or RVs", "5–6 in", "#4 rebar on 18 in centres"],
  ["Garage floor", "4–6 in", "Welded wire or #3 rebar"],
  ["Footing, frost depth", "8–12 in wide", "2 × #4 rebar continuous"],
])}
<p class="note">Your local building code and the load on the slab decide the final thickness. Footings must reach below the frost line, which varies from nothing in the south to 48 inches or more in northern states.</p>

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
  <li>Thickness and reinforcement guidance follows common residential practice; your local building code takes precedence.</li>
</ul>
</div>
`,
};
