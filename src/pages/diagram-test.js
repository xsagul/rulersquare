/* A/B trial for measurement diagrams. Temporary: not in the sitemap, not
 * indexable, not linked from anywhere. Delete this file and its entry in
 * build.js once a style is chosen. */
const { slabWireframe, slabDimensioned } = require("../diagrams");

const variant = (letter, name, source, svg, notes) => `
<section class="calc" style="display:block">
  <div class="calc-inputs">
    <p class="calc-step">Variant ${letter} — ${name}</p>
    <figure class="diagram-figure">${svg}<figcaption>As it would sit under the concrete calculator.</figcaption></figure>
  </div>
  <div class="calc-results">
    <p class="big" style="margin-bottom:10px">Modelled on ${source}</p>
    <ul class="results-list">${notes.map(([k, v]) => `<li><span>${k}</span><b>${v}</b></li>`).join("")}</ul>
  </div>
</section>`;

module.exports = {
  path: "/diagram-test/",
  title: "Diagram A/B — internal trial | Ruler Square",
  description: "Temporary internal comparison of two measurement diagram styles.",
  robots: "noindex, nofollow",
  noSitemap: true,
  crumbs: "Diagram trial",
  body: `
<h1>Diagram styles: A or B?</h1>
<p class="lede">Two ways to draw the same concrete slab. Pick one and it goes on every page.</p>

${variant("A", "Wireframe", "calculator.net", slabWireframe(), [
  ["Size on screen", "190px wide"],
  ["Labels", "l, w, t"],
  ["Hidden edges", "dashed"],
  ["Dimension arrows", "none"],
])}

${variant("B", "Dimensioned", "inchcalculator.com", slabDimensioned(), [
  ["Size on screen", "260px wide"],
  ["Labels", "written out"],
  ["Hidden edges", "not drawn"],
  ["Dimension arrows", "both ends"],
])}

<div class="prose">
<h2>Side by side, at the size they would really appear</h2>
<div style="display:flex;gap:28px;align-items:flex-end;flex-wrap:wrap;margin:16px 0 8px">
  <figure class="diagram-figure">${slabWireframe()}<figcaption>A</figcaption></figure>
  <figure class="diagram-figure">${slabDimensioned()}<figcaption>B</figcaption></figure>
</div>

<h2>What the choice actually decides</h2>
<p><strong>A is a key to the form.</strong> It tells you which box on screen is which edge of the slab, in the least space possible. It assumes you already know what you are measuring and only need the letters mapped. calculator.net puts one beside every shape and ranks first for the concrete queries.</p>
<p><strong>B is an instruction.</strong> The arrows and the spelled-out words say go and measure this, which is more use to someone who has never ordered concrete and is unsure whether thickness means the slab or the base under it. It costs roughly twice the height.</p>
<p class="note">Both drawings inherit the page colours, so they work on the dark theme without a second file, and both are inline SVG — no extra request, and they stay sharp at any size.</p>
</div>
`,
};
