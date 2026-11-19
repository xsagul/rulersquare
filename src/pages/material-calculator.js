const { SITE, esc, embedSnippet } = require("../layout");
const { MATERIALS, TRUCKS } = require("../data/materials");
const { slab, round, shapeSet } = require("../diagrams");
const { EXTRAS } = require("../data/extras");
const { byline, authorRef, UPDATED } = require("../author");

function weightTables(cfg, options) {
  const name = cfg.materialName || cfg.h1.replace(/ Calculator$/, "");
  const depths = [2, 3, 4, 6];
  return `<h2 id="tons-per-yard">How many tons in a yard of ${cfg.noun}?</h2>
<p>One cubic yard of ${cfg.noun} typically weighs <strong>${cfg.lowTons.toFixed(1)} to ${cfg.highTons.toFixed(1)} US tons</strong> (${cfg.lbPerYd3.toLocaleString("en-US")} lb/yd³ starting density), depending on moisture and aggregate size.</p>
<div class="table-wrap"><table><thead><tr><th scope="col">Material</th><th scope="col">Tons per yd³</th><th scope="col">Cubic yards per ton</th></tr></thead><tbody>${options.map(m => `<tr><th scope="row">${esc(m.name)}</th><td>${m.lowTons.toFixed(1)}–${m.highTons.toFixed(1)}</td><td>${(1 / m.highTons).toFixed(2)}–${(1 / m.lowTons).toFixed(2)}</td></tr>`).join("")}</tbody></table></div>
<h2 id="by-area">${esc(name)} needed by area and depth</h2>
<p>${cfg.lbPerYd3 < 1500 ? "Cubic yards" : "US tons"} needed at ${cfg.lbPerYd3.toLocaleString("en-US")} lb/yd³, before compaction or waste allowance.</p>
<div class="table-wrap"><table><thead><tr><th scope="col">Area</th>${depths.map(d => `<th scope="col">${d} in deep</th>`).join("")}</tr></thead><tbody>${[100, 200, 300, 500, 1000].map(a => `<tr><th scope="row">${a.toLocaleString("en-US")} ft²</th>${depths.map(d => cfg.lbPerYd3 < 1500 ? `<td>${(a * d / 324).toFixed(2)} yd³</td>` : `<td>${(a * d / 324 * cfg.lbPerYd3 / 2000).toFixed(1)} t</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function dim(label, name, unit) {
  return `<div class="field"><label class="label" for="f-${name}">${label}</label><div class="combo"><input id="f-${name}" name="${name}" type="number" inputmode="decimal" min="0.001" max="10000000" step="any" required><select name="${name}Unit" aria-label="${label} units">${[["in", "inches"], ["ft", "feet"], ["yd", "yards"], ["cm", "cm"], ["m", "meters"]].map(([v, t]) => `<option value="${v}"${v === unit ? " selected" : ""}>${t}</option>`).join("")}</select></div></div>`;
}

function one(label, name, value, unit, min = 0, max = 10000000) {
  return `<div class="field"><label class="label" for="f-${name}">${label}</label><div class="unit"><input id="f-${name}" name="${name}" type="number" inputmode="decimal" min="${min}" max="${max}" step="any" value="${value}" required><em>${unit}</em></div></div>`;
}

function relatedList(cfg) {
  const out = [];
  const seen = new Set([cfg.path]);
  for (const [href, label] of (cfg.related || [])) {
    if (seen.has(href)) continue;
    seen.add(href);
    out.push([href, label]);
  }
  const extra = [
    ["/cubic-yards-to-tons-calculator/", "Cubic Yards to Tons Converter"],
    ["/cubic-yard-calculator/", "Cubic Yard Calculator"],
    ["/square-footage-calculator/", "Square Footage Calculator"],
    ["/gravel-calculator/", "Gravel Calculator"],
    ["/mulch-calculator/", "Mulch Calculator"],
  ];
  for (const [href, label] of extra) {
    if (out.length >= 6) break;
    if (seen.has(href)) continue;
    seen.add(href);
    out.push([href, label]);
  }
  return out.slice(0, 6);
}

function materialPage(cfg) {
  const volumeFirst = ["mulch", "topsoil", "fill-dirt", "compost", "sand"].includes(cfg.material);
  const bags = cfg.material !== "asphalt";
  const options = MATERIALS.filter(m => (cfg.variants || [cfg.material]).includes(m.id));
  const tons = (cfg.lbPerYd3 / 2000).toFixed(2).replace(/\.?0+$/, "");
  const isConstruction = ["asphalt", "abc"].includes(cfg.material);
  const hub = isConstruction
    ? { h1: "Construction", path: "/construction-calculators/" }
    : { h1: "Landscaping", path: "/landscaping-calculators/" };
  const category = isConstruction ? "construction" : "landscaping";
  const faq = cfg.faq;
  const examplePayload = cfg.exampleValues || { shape: "rect", length: 20, width: 10, depth: cfg.defaultDepth || 3 };
  const presets = cfg.presets || [
    ["10×10 patio", { shape: "rect", length: 10, width: 10, depth: cfg.defaultDepth || 3 }],
    ["12×20 driveway", { shape: "rect", length: 20, width: 12, depth: cfg.defaultDepth || 4 }],
    ["500 ft² bed", { shape: "area", areaFt2: 500, depth: cfg.defaultDepth || 3 }],
  ];

  const truckTable = cfg.showTrucks
    ? `<h2 id="trucks">How much ${cfg.noun} fits in a pickup or dump truck?</h2><p>Weight—not bed volume—sets the limit for bulk stone and soil. A half-ton pickup usually hits payload around 0.7 to 1 cubic yard of rock or soil.</p><div class="table-wrap"><table><thead><tr><th scope="col">Vehicle</th><th scope="col">Typical load</th><th scope="col">Notes</th></tr></thead><tbody>${TRUCKS.map(r => `<tr><th scope="row">${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}</tbody></table></div>`
    : "";

  return {
    path: cfg.path,
    title: cfg.title,
    description: cfg.description,
    crumbs: cfg.h1,
    breadcrumbs: [
      { name: "Home", href: "/" },
      { name: hub.h1, href: hub.path },
      { name: cfg.h1 },
    ],
    lastmod: UPDATED.iso,
    category,
    isCalculator: true,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: cfg.h1,
        author: authorRef,
        dateModified: UPDATED.iso,
        url: SITE.url + cfg.path,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url + "/" },
          { "@type": "ListItem", position: 2, name: hub.h1, item: SITE.url + hub.path },
          { "@type": "ListItem", position: 3, name: cfg.h1, item: SITE.url + cfg.path },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      },
    ],
    scripts: '<script src="/assets/material.js?v=VERSION" defer></script>',
    body: `<h1>${cfg.h1}</h1><p class="lede">${cfg.lede}</p>
<form class="calc" id="material-form" novalidate>
  <div class="calc-inputs">
    <p class="calc-step">Your project</p>
    ${options.length > 1 ? `<div class="field"><label class="label" for="f-material">Material type</label><div class="select"><select id="f-material" name="material">${options.map(m => `<option value="${m.id}"${m.id === cfg.material ? " selected" : ""}>${esc(m.name)}</option>`).join("")}</select></div></div>` : `<input type="hidden" name="material" value="${cfg.material}">`}
    <fieldset class="tabs"><legend>Area shape</legend>${[["rect", "Rectangle"], ["circle", "Circle"], ["area", "Known area"]].map(([v, t]) => `<label><input type="radio" name="shape" value="${v}"${v === "rect" ? " checked" : ""}><span>${t}</span></label>`).join("")}</fieldset>
    <div class="shape" data-shape="rect">${dim("Length", "length", "ft")}${dim("Width", "width", "ft")}</div>
    <div class="shape" data-shape="circle" hidden>${dim("Diameter", "diameter", "ft")}</div>
    <div class="shape" data-shape="area" hidden>${one("Area", "areaFt2", "", "ft²", 0.001)}</div>
    ${dim(cfg.material === "asphalt" ? "Compacted thickness" : "Depth", "depth", "in")}
    <p class="field-help">${cfg.depthHint}</p>
    <details class="calc-options"><summary>Compaction, density &amp; optional cost</summary><div class="options-body">
      ${one(cfg.material === "asphalt" ? "Waste allowance" : "Compaction / extra allowance", "compaction", cfg.defaultCompaction, "%", 0, 50)}
      ${one("Density (lb per yd³)", "density", cfg.lbPerYd3, "lb/yd³", 1)}
      ${bags ? one("Bag size (if buying bags)", "bagSize", cfg.bagSize || 2, "ft³", 0.001) : ""}
      <div class="field"><label class="label" for="f-price">Material price <span class="hint">(optional)</span></label><div class="combo"><input id="f-price" name="price" type="number" inputmode="decimal" min="0" max="10000000" step="any"><select name="priceUnit" aria-label="Price units"><option value="ton"${!volumeFirst ? " selected" : ""}>$ per ton</option><option value="yd3"${volumeFirst ? " selected" : ""}>$ per yd³</option></select></div></div>
    </div></details>
    <button type="submit" class="btn-calc">Calculate</button>
    <div class="presets"><span class="presets-label">Quick fill:</span>${presets.map(([label, vals]) => `<button type="button" class="preset-chip" data-preset='${esc(JSON.stringify(vals))}'>${esc(label)}</button>`).join("")}</div>
    <div class="calc-actions"><button type="button" id="use-example" data-example='${esc(JSON.stringify(examplePayload))}'>Try an example</button><button type="button" id="reset-calc">Reset</button></div>
  </div>
  <section class="calc-results" aria-label="Your estimate" aria-live="polite" tabindex="-1">
    <p class="calc-step">Your estimate</p>
    <div class="empty-state" id="r-empty"><p>Enter your dimensions to see results live, or select <b>Calculate</b>.</p>${shapeSet([["rect", slab({ vertical: "depth" })], ["circle", round({ vertical: "depth" })], ["area", ""]])}</div>
    <div id="r-out" hidden>
      <p class="big">Estimated quantity<strong><span id="${volumeFirst ? "r-yd3" : "r-tons"}">0</span> ${volumeFirst ? "yd³" : "tons"}</strong></p>
      <p class="big-alt"><span id="${volumeFirst ? "r-tons" : "r-yd3"}">0</span> ${volumeFirst ? "US tons" : "cubic yards"}</p>
      <ul class="results-list">
        <li><span>Area covered</span><b id="r-area">—</b></li>
        <li><span>Volume</span><b><span id="r-ft3">0</span> ft³</b></li>
        ${bags ? '<li><span>Bags at selected size</span><b id="r-bags">—</b></li>' : ""}
        <li><span>Order in ½-yd steps</span><b id="r-order-yd3">—</b></li>
        <li><span>Order in ½-ton steps</span><b id="r-order-tons">—</b></li>
        <li><span>Coverage at this depth</span><b id="r-coverage">—</b></li>
        <li><span>Typical delivery</span><b id="r-truck">—</b></li>
      </ul>
      <div class="cost" id="r-cost-box" hidden>Estimated material cost: <b id="r-cost"></b></div>
      <p class="tip" id="r-tip"></p>
    </div>
  </section>
</form>
<noscript><p class="note">Enable JavaScript to calculate, or use the formula and tables below.</p></noscript>
${byline(UPDATED)}
${embedSnippet(cfg.path, cfg.h1)}
<nav class="jump-links" aria-label="On this page"><a href="#method">Formula</a><a href="#example">Example</a><a href="#tons-per-yard">Tons per yard</a><a href="#by-area">By area</a>${cfg.showTrucks ? '<a href="#trucks">Truckloads</a>' : ""}<a href="#questions">FAQs</a></nav>
<div class="prose">
<h2 id="method">How much ${cfg.noun} do you need?</h2><p>${cfg.intro}</p>
<div class="formula">Cubic yards = area (ft²) × depth (in) ÷ 324<br>US tons = cubic yards × density (${cfg.lbPerYd3.toLocaleString("en-US")} lb/yd³ ≈ ${tons} t/yd³) ÷ 2,000</div>
<h2 id="example">Example: ${cfg.example.label}</h2><p>${cfg.example.text}</p>
${weightTables(cfg, options)}${EXTRAS[cfg.path.replace(/\//g, "")] || ""}${truckTable}
<h2>Depth, ordering &amp; delivery tips</h2><p>${cfg.depthProse}</p>${cfg.orderingProse ? `<p>${cfg.orderingProse}</p>` : ""}
<h2 id="questions">Frequently asked questions</h2>${faq.map(([q, a]) => `<h3>${q}</h3><p>${a}</p>`).join("")}
<h2>Related calculators</h2><ul class="related-links">${relatedList(cfg).map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join("")}</ul>
<h2>References</h2><ul class="refs">${cfg.sources.map(([url, label]) => `<li><a href="${url}" rel="noopener">${label}</a></li>`).join("")}</ul><p class="note">One cubic yard covers 324 ft² at 1 in, 162 ft² at 2 in, 108 ft² at 3 in, or 81 ft² at 4 in. Confirm exact moisture-adjusted weight and delivery minimums with your local supplier. Updated ${UPDATED.text}.</p>
</div>`,
  };
}

module.exports = { materialPage, MATERIALS };
