const { SITE, esc } = require("../layout");

/* A field the visitor measures on site gets a unit selector; a field that is a
 * product spec or a trade constant keeps its fixed unit. Nominal lumber
 * thickness is always inches, so offering yards there would be noise. */
const UNIT_SETS = {
  length: [["in", "inches"], ["ft", "feet"], ["yd", "yards"], ["cm", "cm"], ["m", "metres"]],
  area: [["ft2", "sq feet"], ["in2", "sq inches"], ["yd2", "sq yards"], ["m2", "sq metres"]],
};

function field(f) {
  const attrs = `id="p-${f.name}" name="${f.name}"`;
  const help = f.hint ? `<small class="field-help" id="help-${f.name}">${esc(f.hint)}</small>` : "";
  const input = `<input ${attrs} type="number" inputmode="decimal" min="${f.min ?? 0.001}" max="${f.max ?? 10000000}" step="${f.step ?? "any"}" value="${f.value ?? ""}"${f.optional ? "" : " required"}${f.hint ? ` aria-describedby="help-${f.name}"` : ""}>`;
  let control;
  if (f.options) {
    control = `<div class="select"><select ${attrs}>${f.options.map(([v, label]) => `<option value="${v}"${v === f.value ? " selected" : ""}>${esc(label)}</option>`).join("")}</select></div>`;
  } else if (f.units && UNIT_SETS[f.units]) {
    // The engine still receives f.unit; the selector only says what was typed.
    const base = f.units === "area" ? (f.unit || "ft²").replace("²", "2") : (f.unit || "ft");
    control = `<div class="combo">${input}<select name="${f.name}Unit" aria-label="${esc(f.label)} units">${UNIT_SETS[f.units].map(([v, label]) => `<option value="${v}"${v === base ? " selected" : ""}>${esc(label)}</option>`).join("")}</select></div>`;
  } else {
    control = `<div class="unit">${input}<em>${esc(f.unit || "")}</em></div>`;
  }
  return `<div class="field"><label class="label" for="p-${f.name}">${esc(f.label)}${f.optional ? ' <span class="hint">(optional)</span>' : ""}</label>${control}${help}</div>`;
}
/* Which unit each measured field must reach the engine in. */
function unitBase(c) {
  const out = {};
  for (const f of [...(c.fields || []), ...(c.advanced || [])]) {
    if (!f.units) continue;
    out[f.name] = f.units === "area"
      ? (f.unit || "ft²").replace("²", "2")
      : (f.unit || "ft");
  }
  return Object.keys(out).length ? out : undefined;
}

/* Fields the visitor measures on site, by calculator. Everything absent from
 * this list keeps a fixed unit: nominal lumber sizes, pitch per 12 in, mortar
 * joints, package coverage and prices are not things you measure with a tape. */
const MEASURED = {
  "fence-calculator": ["length"],
  "deck-calculator": ["length", "width"],
  "siding-calculator": ["area", "openings"],
  "drywall-calculator": ["length", "width", "height", "openings"],
  "tile-calculator": ["length", "width"],
  "paver-calculator": ["length", "width"],
  "paint-calculator": ["length", "width", "height", "openings"],
  "roofing-calculator": ["area"],
  "retaining-wall-calculator": ["length", "height"],
  "insulation-calculator": ["area"],
  "board-and-batten-calculator": ["width", "height"],
  "grout-calculator": ["area"],
  "thinset-calculator": ["area"],
  "cubic-yard-calculator": ["length", "width"],
  "board-foot-calculator": ["length"],
  "stair-calculator": ["totalRise"],
  "brick-calculator": ["area"],
  "ramp-calculator": ["rise", "width"],
  "framing-calculator": ["length"],
  "rebar-calculator": ["length", "width"],
  "sod-calculator": ["area"],
  "tank-volume-calculator": ["diameter", "length", "width", "height"],
};
const AREA_FIELDS = new Set(["area", "openings"]);

function markMeasured(c) {
  const names = MEASURED[c.slug];
  if (!names) return;
  for (const f of [...(c.fields || []), ...(c.advanced || [])]) {
    if (names.includes(f.name) && !f.options) {
      f.units = AREA_FIELDS.has(f.name) ? "area" : "length";
    }
  }
}

function projectPage(c) {
  markMeasured(c);
  const path = `/${c.slug}/`;
  return {
    path, title: c.title + " | Ruler Square", description: c.description, crumbs: c.h1, lastmod: "2026-09-21",
    category: c.category || "construction",
    schema: [{"@context":"https://schema.org","@type":"WebApplication",name:c.h1,url:SITE.url+path,applicationCategory:"UtilitiesApplication",operatingSystem:"Any",offers:{"@type":"Offer",price:0,priceCurrency:"USD"}},
      {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Home",item:SITE.url+"/"},{"@type":"ListItem",position:2,name:"Construction",item:SITE.url+"/construction-calculators/"},{"@type":"ListItem",position:3,name:c.h1,item:SITE.url+path}]}],
    scripts: `<script type="application/json" id="project-config">${JSON.stringify({kind:c.kind,costUnit:c.costUnit,example:c.example.values,unitBase:unitBase(c)}).replace(/</g,"\\u003c")}</script><script src="/assets/project.js?v=VERSION" defer></script>`,
    body: `<h1>${esc(c.h1)}</h1><p class="lede">${esc(c.lede)}</p>
${c.context || ""}
<form class="calc" id="project-form" novalidate>
  <div class="calc-inputs">
    <p class="calc-step">Your project</p>
    ${c.fields.map(field).join("\n")}
    ${c.advanced?.length ? `<details class="calc-options"><summary>${esc(c.optionsLabel || "Waste, sizes & optional cost")}</summary><div class="options-body">${c.advanced.map(field).join("\n")}</div></details>` : ""}
    <p class="form-error" id="form-error" role="alert" hidden></p>
    <button class="btn-calc" type="submit">Calculate</button>
    <div class="calc-actions"><button type="button" id="use-example">Try an example</button><button type="button" id="reset-calc">Reset</button></div>
  </div>
  <section class="calc-results" id="project-result" tabindex="-1" aria-label="Your estimate" aria-live="polite">
    <p class="calc-step">Your estimate</p>
    <p class="empty-state" id="r-empty">Add your measurements, then select <b>Calculate</b>. Your result and buying quantities will appear here.</p>
    <div id="r-out" hidden><p class="big"><span id="result-label"></span><strong id="result-main"></strong></p><ul class="results-list" id="result-rows"></ul><p class="tip" id="result-note"></p></div>
  </section>
</form>
<noscript><p class="note">Turn on JavaScript to use the calculator. The formula and worked example below are available without it.</p></noscript>
<nav class="jump-links" aria-label="On this page"><a href="#method">How it works</a><a href="#example">Example</a><a href="#before-you-buy">Before you buy</a><a href="#questions">FAQs</a></nav>
<div class="prose">
  <h2 id="method">${esc(c.methodTitle)}</h2><p>${c.method}</p><div class="formula">${c.formula}</div>
  <h2 id="example">${esc(c.example.title)}</h2><p>${c.example.text}</p>
  <h2 id="before-you-buy">${esc(c.buyTitle || "Before you buy")}</h2>${c.buy}
  ${c.extra || ""}
  <h2 id="questions">Common questions</h2>${c.faq.map(([q,a])=>`<h3>${esc(q)}</h3><p>${a}</p>`).join("")}
  <h2>Related calculators</h2><div class="grid">${c.related.map(([slug,label])=>`<a class="card" href="/${slug}/"><b>${esc(label)}</b></a>`).join("")}</div>
  <h2>Sources & assumptions</h2><ul class="refs">${c.sources.map(([url,label])=>`<li><a href="${url}">${esc(label)}</a></li>`).join("")}</ul><p class="note">${esc(c.sourceNote || "Quantities use the geometry shown above. Default allowances are editable planning assumptions, not building specifications. Check the selected product and project requirements.")} Checked September 21, 2026.</p>
</div>`
  };
}
module.exports = { projectPage };
