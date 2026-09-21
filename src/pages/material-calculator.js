const { SITE, esc } = require("../layout");
const { MATERIALS } = require("../data/materials");

function dim(label, name, unit) {
  return `<div class="field"><label class="label" for="f-${name}">${label}</label><div class="combo"><input id="f-${name}" name="${name}" type="number" inputmode="decimal" min="0.001" max="10000000" step="any" required><select name="${name}Unit" aria-label="${label} units">${[["in","inches"],["ft","feet"],["yd","yards"],["cm","cm"],["m","meters"]].map(([v,t])=>`<option value="${v}"${v===unit?" selected":""}>${t}</option>`).join("")}</select></div></div>`;
}
function one(label,name,value,unit,min=0,max=10000000) {
  return `<div class="field"><label class="label" for="f-${name}">${label}</label><div class="unit"><input id="f-${name}" name="${name}" type="number" inputmode="decimal" min="${min}" max="${max}" step="any" value="${value}"><em>${unit}</em></div></div>`;
}
function materialPage(cfg) {
  const volumeFirst = ["mulch","topsoil","fill-dirt","sand"].includes(cfg.material);
  const bags = cfg.material !== "asphalt";
  const options = MATERIALS.filter(m => (cfg.variants || [cfg.material]).includes(m.id));
  const tons = cfg.lbPerYd3 / 2000;
  const faq = [...cfg.faq, [`How much area does one cubic yard of ${cfg.noun} cover?`, "One cubic yard covers 162 square feet at 2 inches deep, 108 at 3 inches or 81 at 4 inches, before any extra allowance."]];
  return {
    path: cfg.path, title: cfg.title, description: cfg.description, crumbs: cfg.h1, lastmod:"2026-09-21",
    schema:[{"@context":"https://schema.org","@type":"WebApplication",name:cfg.h1,url:SITE.url+cfg.path,applicationCategory:"UtilitiesApplication",operatingSystem:"Any",offers:{"@type":"Offer",price:0,priceCurrency:"USD"}}],
    scripts:'<script src="/assets/material.js?v=VERSION" defer></script>',
    body:`<h1>${cfg.h1}</h1><p class="lede">${cfg.lede}</p>
<form class="calc" id="material-form" novalidate>
  <div class="calc-inputs">
    ${options.length>1 ? `<div class="field"><label class="label" for="f-material">Material type</label><div class="select"><select id="f-material" name="material">${options.map(m=>`<option value="${m.id}"${m.id===cfg.material?" selected":""}>${esc(m.name)}</option>`).join("")}</select></div></div>` : `<input type="hidden" name="material" value="${cfg.material}">`}
    <fieldset class="tabs"><legend>Area shape</legend>${[["rect","Rectangle"],["circle","Circle"],["area","Known area"]].map(([v,t])=>`<label><input type="radio" name="shape" value="${v}"${v==="rect"?" checked":""}><span>${t}</span></label>`).join("")}</fieldset>
    <div class="shape" data-shape="rect">${dim("Length","length","ft")}${dim("Width","width","ft")}</div>
    <div class="shape" data-shape="circle" hidden>${dim("Diameter","diameter","ft")}</div>
    <div class="shape" data-shape="area" hidden>${one("Area","areaFt2","","ft²",0.001)}</div>
    ${dim(cfg.material==="asphalt"?"Compacted thickness":"Planned depth","depth","in")}
    <p class="field-help">${cfg.depthHint}</p>
    <details class="calc-options"><summary>Allowance, density &amp; optional cost</summary><div class="options-body">
      ${one(cfg.material==="asphalt"?"Extra material allowance":"Extra volume allowance","compaction",cfg.defaultCompaction,"%",0,50)}
      <p class="field-help">An editable planning allowance, not a guaranteed compaction factor.</p>
      ${one("Density from supplier","density",cfg.lbPerYd3,"lb/yd³",1)}
      ${bags ? one("Bag volume (if buying bags)","bagSize",cfg.bagSize||2,"ft³",0.001) : ""}
      <div class="field"><label class="label" for="f-price">Material price (optional)</label><div class="combo"><input id="f-price" name="price" type="number" inputmode="decimal" min="0" max="10000000" step="any"><select name="priceUnit" aria-label="Price units"><option value="ton"${!volumeFirst?" selected":""}>$ per ton</option><option value="yd3"${volumeFirst?" selected":""}>$ per yd³</option></select></div></div>
    </div></details>
    <button type="submit" class="btn-calc">Calculate</button>
  </div>
  <section class="calc-results" aria-label="Your estimate" aria-live="polite" tabindex="-1">
    <p class="empty-state" id="r-empty">Add your measurements, then select <b>Calculate</b>.</p>
    <div id="r-out" hidden>
      <p class="big">Estimated quantity<strong><span id="${volumeFirst?"r-yd3":"r-tons"}">0</span> ${volumeFirst?"yd³":"tons"}</strong></p>
      <p class="big-alt"><span id="${volumeFirst?"r-tons":"r-yd3"}">0</span> ${volumeFirst?"US tons":"cubic yards"}</p>
      <ul class="results-list">
        <li><span>Area covered</span><b id="r-area">—</b></li>
        <li><span>Volume</span><b><span id="r-ft3">0</span> ft³</b></li>
        ${bags?'<li><span>Bags at your selected size</span><b id="r-bags">—</b></li>':""}
        <li><span>Round up to ½ yard</span><b id="r-order-yd3">—</b></li>
        <li><span>Round up to ½ ton</span><b id="r-order-tons">—</b></li>
        <li><span>Coverage at this depth</span><b id="r-coverage">—</b></li>
      </ul>
      <div class="cost" id="r-cost-box" hidden>Material cost, before order rounding: <b id="r-cost"></b></div>
      <p class="tip" id="r-tip"></p>
    </div>
  </section>
</form>
<noscript><p>Enable JavaScript to calculate, or use the formula below.</p></noscript>
<nav class="jump-links" aria-label="On this page"><a href="#method">How it works</a><a href="#example">Example</a><a href="#coverage">Coverage</a><a href="#questions">FAQs</a></nav>
<div class="prose">
<h2 id="method">How much ${cfg.noun} do you need?</h2><p>${cfg.intro}</p>
<div class="formula">Cubic yards = area (ft²) × depth (in) ÷ 324<br>Adjusted yards = cubic yards × (1 + allowance % ÷ 100)<br>US tons = adjusted yards × density (lb/yd³) ÷ 2,000</div>
<p>The starting density is <b>${cfg.lbPerYd3.toLocaleString("en-US")} lb per cubic yard</b> (${tons} US tons). It is an editable planning assumption, not a measurement of your delivered material. Replace it with your supplier’s value.</p>
<h2 id="example">Example: ${cfg.example.label}</h2><p>${cfg.example.text}</p>
<h2 id="coverage">Coverage by depth</h2>
<div class="table-wrap"><table><thead><tr><th scope="col">Layer depth</th><th scope="col">Area per cubic yard</th></tr></thead><tbody>${[[1,324],[2,162],[3,108],[4,81],[6,54]].map(([d,a])=>`<tr><th scope="row">${d} in</th><td>${a} ft²</td></tr>`).join("")}</tbody></table></div>
<p class="note">Exact geometry before allowance. The table does not recommend a depth for your project.</p>
<h2>Depth and ordering</h2><p>${cfg.depthProse}</p>
<p>For weight-based quotes, use US short tons of 2,000 pounds. Confirm whether a supplier quotes loose or compacted volume. The displayed half-yard and half-ton rounding are examples of order increments, not rules every supplier uses.</p>
<h2>Cost and delivery</h2><p>Enter a local material quote per ton or per cubic yard. The estimate excludes delivery, labor, tax and minimum-load fees. It prices the calculated quantity before order rounding; ask the supplier to confirm the final order and bill.</p>
<p>Never judge a pickup’s capacity by bed volume. Check the vehicle’s payload label and remaining capacity after passengers, equipment and other cargo. Ask the supplier to arrange suitable delivery if the load is too heavy.</p>
<h2 id="questions">Common questions</h2>${faq.map(([q,a])=>`<h3>${q}</h3><p>${a}</p>`).join("")}
<h2>Related calculators</h2><div class="grid">${cfg.related.map(([href,label])=>`<a class="card" href="${href}"><b>${label}</b></a>`).join("")}</div>
<h2>Sources &amp; assumptions</h2><p class="note">Volume and coverage use the geometry above. Density and allowance are starting assumptions; confirm them for the selected material. Guidance: ${cfg.sources.map(([url,label])=>`<a href="${url}">${label}</a>`).join("; ")}. Checked September 21, 2026.</p>
</div>`
  };
}
module.exports = { materialPage, MATERIALS };
