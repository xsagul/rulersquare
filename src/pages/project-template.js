const { SITE, esc, embedSnippet } = require("../layout");
const { diagramFor } = require("../diagrams");
const { chartsFor } = require("../data/charts");
const { EXTRAS } = require("../data/extras");
const { byline, authorRef, UPDATED } = require("../author");

const UNIT_SETS = {
  length: [["in", "inches"], ["ft", "feet"], ["yd", "yards"], ["cm", "cm"], ["m", "meters"]],
  area: [["ft2", "sq feet"], ["in2", "sq inches"], ["yd2", "sq yards"], ["m2", "sq meters"]],
  volume: [["yd3", "cubic yards"], ["ft3", "cubic feet"], ["m3", "cubic meters"]],
};

const UNIT_DEFAULT = { length: "ft", area: "ft²", volume: "yd³" };
function baseUnit(f) {
  return String(f.unit || UNIT_DEFAULT[f.units] || "ft").replace("²", "2").replace("³", "3");
}

function field(f) {
  const attrs = `id="p-${f.name}" name="${f.name}"`;
  const positive = new Set([
    "length", "width", "height", "diameter", "thickness", "totalRise", "maxRiser",
    "treadDepth", "run", "unitLength", "unitHeight", "rollArea", "coverage",
    "pieces", "hours", "workers", "area", "cost", "stepWidth", "riserHeight",
    "stepCount", "depth", "tubes", "posts", "holeDiameter", "holeDepth",
    "units", "bagCoverage", "panelWidth", "panelLength", "boardLength",
    "runningWatts", "people", "amount", "logLength", "beds", "bagSize",
  ]);
  const minimum = positive.has(f.name) ? Math.max(0.001, f.min || 0) : (f.min ?? 0.001);
  const help = f.hint ? `<small class="field-help" id="help-${f.name}">${esc(f.hint)}</small>` : "";
  const ph = f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : "";
  const input = `<input ${attrs} type="number" inputmode="decimal" min="${minimum}" max="${f.max ?? 10000000}" step="${f.step ?? "any"}" value="${f.value ?? ""}"${ph}${f.optional ? "" : " required"}${f.hint ? ` aria-describedby="help-${f.name}"` : ""}>`;
  let control;
  if (f.options) {
    control = `<div class="select"><select ${attrs}>${f.options.map(([v, label]) => `<option value="${esc(v)}"${String(v) === String(f.value) ? " selected" : ""}>${esc(label)}</option>`).join("")}</select></div>`;
  } else if (f.units && UNIT_SETS[f.units]) {
    const base = baseUnit(f);
    control = `<div class="combo">${input}<select name="${f.name}Unit" aria-label="${esc(f.label)} units">${UNIT_SETS[f.units].map(([v, label]) => `<option value="${v}"${v === base ? " selected" : ""}>${esc(label)}</option>`).join("")}</select></div>`;
  } else {
    control = `<div class="unit">${input}<em>${esc(f.unit || "")}</em></div>`;
  }
  const showIf = f.showIf ? ` data-show-field="${esc(f.showIf[0])}" data-show-value="${esc(f.showIf[1])}"` : "";
  return `<div class="field"${showIf}><label class="label" for="p-${f.name}">${esc(f.label)}${f.optional && !f.hideOptional ? ' <span class="hint">(optional)</span>' : ""}</label>${control}${help}</div>`;
}

function fields(list) {
  const out = [];
  for (let i = 0; i < list.length; i++) {
    const g = list[i].group;
    if (!g) { out.push(field(list[i])); continue; }
    const items = [];
    while (i < list.length && list[i].group === g) { items.push(list[i]); i++; }
    i--;
    const cls = items.length >= 3 ? "field-triple" : "field-pair";
    const firstShow = items[0].showIf;
    const sameShow = firstShow && items.every(x => x.showIf && x.showIf[0] === firstShow[0] && x.showIf[1] === firstShow[1]);
    const showAttr = sameShow ? ` data-show-field="${esc(firstShow[0])}" data-show-value="${esc(firstShow[1])}"` : "";
    const run = items.map(x => field(sameShow ? { ...x, showIf: undefined } : x));
    out.push(`<div class="${cls}"${showAttr}>${run.join("")}</div>`);
  }
  return out.join("\n");
}

function pickerHtml(picker) {
  if (!picker || !picker.length) return "";
  return `<div class="appliance-picker">
    <p class="appliance-picker-title">Quick appliance checklist (tap to add watts)</p>
    <div class="appliance-grid">${picker.map(([name, runW, surgeW]) =>
      `<button type="button" class="appliance-chip" data-appliance data-run="${runW}" data-surge="${surgeW}" aria-pressed="false">${esc(name)} <small>${runW}W${surgeW ? ` (+${surgeW}W)` : ""}</small></button>`).join("")}</div>
  </div>`;
}

function unitBase(c) {
  const out = {};
  for (const f of [...(c.fields || []), ...(c.advanced || [])]) {
    if (!f.units) continue;
    out[f.name] = baseUnit(f);
  }
  return Object.keys(out).length ? out : undefined;
}

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
  "cubic-yard-calculator": ["length", "width", "depth"],
  "board-foot-calculator": ["length"],
  "stair-calculator": ["totalRise"],
  "roof-pitch-calculator": ["run", "totalRise", "footprint:area"],
  "brick-calculator": ["area"],
  "ramp-calculator": ["rise", "width"],
  "framing-calculator": ["length"],
  "rebar-calculator": ["length", "width"],
  "sod-calculator": ["area"],
  "tank-volume-calculator": ["diameter", "length", "width", "height", "fillDepth"],
  "concrete-slab-cost": ["length", "width"],
  "concrete-patio-cost": ["length", "width"],
  "concrete-driveway-cost": ["length", "width"],
  "construction-cost-calculator": ["length", "width"],
  "deck-cost-calculator": ["length", "width"],
  "retaining-wall-cost": ["length", "width"],
  "fence-installation-cost": ["quantity:length"],
  "concrete-cost-per-yard": ["quantity:volume"],
  "roof-replacement-cost": ["quantity:area"],
  "carpet-installation-cost": ["length", "width"],
  "laminate-flooring-installation-cost": ["length", "width"],
  "tile-installation-cost": ["length", "width"],
  "home-addition-cost": ["length", "width"],
  "epoxy-garage-floor-cost": ["length", "width"],
  "deck-staining-cost": ["length", "width"],
  "asphalt-driveway-cost": ["length", "width"],
  "interior-painting-cost": ["quantity:area"],
  "drywall-installation-cost": ["quantity:area"],
  "countertop-cost": ["quantity:area"],
  "stucco-cost": ["quantity:area"],
  "vinyl-siding-cost": ["quantity:area"],
  "metal-roof-cost": ["quantity:area"],
  "spray-foam-insulation-cost": ["quantity:area"],
  "sod-installation-cost": ["quantity:area"],
  "french-drain-cost": ["quantity:length"],
  "linear-feet-calculator": ["length", "area"],
  "pool-volume-calculator": ["length", "width", "diameter", "shallow:length", "deep:length"],
  "wallpaper-calculator": ["wallWidth:length", "height"],
  "flooring-calculator": ["length", "width"],
  "carpet-calculator": ["length", "width"],
  "concrete-block-calculator": ["area"],
  // Phase 4 calculators
  "gutter-size-calculator": ["area"],
  "concrete-steps-calculator": ["stepWidth:length"],
  "sonotube-calculator": ["depth"],
  "concrete-bag-calculator": ["length", "width", "height"],
  "self-leveling-concrete-calculator": ["area"],
  "plywood-calculator": ["length", "width"],
  "metal-roofing-calculator": ["area"],
  "baluster-spacing-calculator": ["length"],
  "wainscoting-calculator": ["width", "height"],
  "baseboard-calculator": ["length"],
  "crown-molding-calculator": ["length"],
  "deck-stain-calculator": ["area", "railLength:length"],
  "exterior-paint-calculator": ["area", "openings"],
  "raised-bed-soil-calculator": ["length", "width"],
  "grass-seed-calculator": ["area"],
  "btu-calculator": ["area", "ceilingHeight:length"],
  "firewood-calculator": ["length", "height"],
  "dehumidifier-size-calculator": ["area"],
  "bathroom-fan-cfm-calculator": ["length", "width", "height"],
  "acreage-calculator": ["length", "width"],
};
const AREA_FIELDS = new Set(["area", "openings"]);
const VALID_UNIT = Object.fromEntries(Object.entries(UNIT_SETS).map(([k, set]) => [k, new Set(set.map(([v]) => v))]));

function markMeasured(c) {
  const names = MEASURED[c.slug];
  if (!names) return;
  const spec = {};
  for (const entry of names) {
    const [name, kind] = entry.split(":");
    spec[name] = kind || (AREA_FIELDS.has(name) ? "area" : "length");
  }
  for (const f of [...(c.fields || []), ...(c.advanced || [])]) {
    if (!spec[f.name] || f.options) continue;
    f.units = spec[f.name];
    if (!VALID_UNIT[f.units].has(baseUnit(f))) { f.unit = UNIT_DEFAULT[f.units]; }
  }
}

/* Strip direct SERP calculator competitors from outbound citations; mark
 * third-party consumer cost aggregators nofollow so PageRank stays clean. */
const SKIP_SOURCE = /(?:inchcalculator\.com|calculator\.net|calculatorsoup\.com|homedepot\.com|lowes\.com)/i;
const NOFOLLOW_SOURCE = /(?:fixr\.com|homeguide\.com|thisoldhouse\.com|concretenetwork\.com|todayshomeowner\.com|tileshop\.com)/i;

function renderSources(list) {
  const clean = (list || []).filter(([url]) => !SKIP_SOURCE.test(url));
  if (!clean.length) return "";
  return clean.map(([url, label]) => {
    const rel = NOFOLLOW_SOURCE.test(url) ? ' rel="nofollow noopener"' : ' rel="noopener"';
    return `<li><a href="${url}"${rel}>${esc(label)}</a></li>`;
  }).join("");
}

/* Build 6 unique contextual internal links: curated next steps first, then
 * neighboring calculators from the same hub group so no page is isolated. */
function relatedLinks(c, path) {
  const out = [];
  const seen = new Set([path]);
  for (const [slug, label] of (c.related || [])) {
    const href = slug.startsWith("/") ? slug : `/${slug}/`;
    if (seen.has(href)) continue;
    seen.add(href);
    out.push([href, label]);
  }
  try {
    const { placeOf } = require("./categories");
    const place = placeOf(path);
    if (place) {
      for (const [href, label] of place.group.items) {
        if (out.length >= 6) break;
        if (seen.has(href)) continue;
        seen.add(href);
        out.push([href, label]);
      }
      if (out.length < 6) {
        for (const g of place.cat.groups) {
          for (const [href, label] of g.items) {
            if (out.length >= 6) break;
            if (seen.has(href)) continue;
            seen.add(href);
            out.push([href, label]);
          }
        }
      }
    }
  } catch {}
  return out.slice(0, 6);
}

function chartHtml(t) {
  return `<h2 id="${t.id}">${esc(t.title)}</h2>${t.intro ? `<p>${esc(t.intro)}</p>` : ""}<div class="table-wrap"><table><thead><tr>${t.head.map(h => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${t.rows.map(r => `<tr>${r.map((cell, i) => i === 0 ? `<th scope="row">${esc(cell)}</th>` : `<td>${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>${t.note ? `<p class="note">${esc(t.note)}</p>` : ""}`;
}

function presetsHtml(presets) {
  if (!presets || !presets.length) return "";
  return `<div class="presets"><span class="presets-label">Quick fill:</span>${presets.map(([label, values]) =>
    `<button type="button" class="preset-chip" data-preset='${esc(JSON.stringify(values))}'>${esc(label)}</button>`).join("")}</div>`;
}

function projectPage(c) {
  markMeasured(c);
  const charts = chartsFor(c);
  const path = `/${c.slug}/`;
  const category = c.category || "construction";
  const hub = {
    construction: ["Construction", "construction-calculators"],
    landscaping: ["Landscaping", "landscaping-calculators"],
    systems: ["Home Systems", "home-systems-calculators"],
    cost: ["Project Costs", "cost-calculators"],
  }[category] || ["Construction", "construction-calculators"];
  const sourcesHtml = renderSources(c.sources);
  const fullTitle = c.title.includes("Ruler Square") ? c.title : `${c.title} | Ruler Square`;

  return {
    path,
    title: fullTitle,
    description: c.description,
    crumbs: c.h1,
    breadcrumbs: [
      { name: "Home", href: "/" },
      { name: hub[0], href: `/${hub[1]}/` },
      { name: c.h1 },
    ],
    lastmod: UPDATED.iso,
    category,
    isCalculator: true,
    schema: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: c.h1,
        author: authorRef,
        dateModified: UPDATED.iso,
        url: SITE.url + path,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url + "/" },
          { "@type": "ListItem", position: 2, name: hub[0], item: SITE.url + "/" + hub[1] + "/" },
          { "@type": "ListItem", position: 3, name: c.h1, item: SITE.url + path },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: c.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      },
    ],
    scripts: `<script type="application/json" id="project-config">${JSON.stringify({
      kind: c.kind,
      costUnit: c.costUnit,
      laborShare: c.laborShare,
      example: c.example.values,
      unitBase: unitBase(c),
      presetMaps: c.presetMaps,
    }).replace(/</g, "\\u003c")}</script><script src="/assets/project.js?v=VERSION" defer></script>`,
    body: `<h1>${esc(c.h1)}</h1><p class="lede">${esc(c.lede)}</p>
<form class="calc" id="project-form" novalidate>
  <div class="calc-inputs">
    <p class="calc-step">Your project</p>
    ${pickerHtml(c.picker)}
    ${fields(c.fields)}
    ${c.advanced?.length ? `<details class="calc-options"><summary>${esc(c.optionsLabel || "Waste, sizes & optional cost")}</summary><div class="options-body">${fields(c.advanced)}</div></details>` : ""}
    <p class="form-error" id="form-error" role="alert" hidden></p>
    <button class="btn-calc" type="submit">Calculate</button>
    ${presetsHtml(c.presets)}
    <div class="calc-actions"><button type="button" id="use-example">Try an example</button><button type="button" id="reset-calc">Reset</button></div>
  </div>
  <section class="calc-results" id="project-result" tabindex="-1" aria-label="Your estimate" aria-live="polite">
    <p class="calc-step">Your estimate</p>
    <div class="empty-state" id="r-empty"><p>Enter your measurements to see results live, or select <b>Calculate</b>.</p>${diagramFor(c.slug)}</div>
    <div id="r-out" hidden><p class="big"><span id="result-label"></span><strong id="result-main"></strong></p><ul class="results-list" id="result-rows"></ul><div class="live-visual" id="r-visual" hidden></div><p class="tip" id="result-note"></p></div>
  </section>
</form>
${c.context || ""}
<noscript><p class="note">Turn on JavaScript to use the calculator. The formula, tables and worked example below work without it.</p></noscript>
${byline(UPDATED)}
${embedSnippet(path, c.h1)}
<nav class="jump-links" aria-label="On this page"><a href="#method">Formula</a><a href="#example">Example</a>${charts.map(t => `<a href="#${t.id}">${esc(t.jump)}</a>`).join("")}<a href="#before-you-buy">${esc(c.buyJump || "Buying guide")}</a><a href="#questions">FAQs</a></nav>
<div class="prose">
  <h2 id="method">${esc(c.methodTitle)}</h2><p>${c.method}</p><div class="formula">${c.formula}</div>
  <h2 id="example">${esc(c.example.title)}</h2><p>${c.example.text}</p>
  ${charts.map(chartHtml).join("")}
  <h2 id="before-you-buy">${esc(c.buyTitle || "Before you buy")}</h2>${c.buy}
  ${c.extra || ""}${EXTRAS[c.slug] || ""}
  <h2 id="questions">Frequently asked questions</h2>${c.faq.map(([q, a]) => `<h3>${esc(q)}</h3><p>${a}</p>`).join("")}
  <h2>Related calculators</h2><ul class="related-links">${relatedLinks(c, path).map(([href, label]) => `<li><a href="${href}">${esc(label)}</a></li>`).join("")}</ul>
  ${sourcesHtml ? `<h2>References</h2><ul class="refs">${sourcesHtml}</ul>` : ""}<p class="note">${esc(c.sourceNote || "Formulas use standard US geometry and trade coverage rates. Verify product specs and local building codes before ordering.")} Updated ${UPDATED.text}.</p>
</div>`,
  };
}

module.exports = { projectPage };
