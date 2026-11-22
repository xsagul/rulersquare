const { SITE } = require("../layout");
const { ICONS } = require("../icons");
const { PROJ } = require("../data/projects");
const { TOOLS } = require("../data/tools");
const { COSTS } = require("../data/costs");
const { UPDATED } = require("../author");

const { GROUPS } = require("../data/groups");
const { ALL } = require("../data/catalog");

const BY_HREF = new Map(ALL.map(([href, title, desc]) => [href, [href, title, desc]]));
const COST_HREFS = new Set(COSTS.map(c => `/${c.slug}/`));
const itemOf = slug => BY_HREF.get(`/${slug}/`);
/* A hub section keeps the shape the rest of the site reads ({ name, items }),
 * plus the group record for the drawing and anchor. */
const section = (g, filter = () => true) => ({
  name: g.name, icon: g.id, group: g,
  items: g.items.map(itemOf).filter(Boolean).filter(filter),
});
const byIds = ids => ids.map(id => GROUPS.find(g => g.id === id));

const CATEGORIES = [
  {
    path: "/construction-calculators/", h1: "Construction Calculators", category: "construction",
    title: "Construction Calculators – Materials, Costs & Measurements | Ruler Square",
    description: "All Ruler Square construction and home-project calculators in 10 project groups: concrete, driveways, yard, decks, framing, roofing, interiors, home systems, measurements and budgets.",
    lede: "Every calculator, grouped by the project you are working on. Each group has the material quantities and the installed cost side by side.",
    intro: "Pick the project, then the calculator. Material calculators work out what to order and round up to whole bags, sheets or truckloads; cost calculators price the same job installed, with 2026 national benchmarks you can replace with local quotes.",
    groups: GROUPS.map(g => section(g)),
    outro: '<h2>Only need prices?</h2><p>The <a href="/cost-calculators/">project cost calculators</a> page lists every cost tool on one page.</p>',
  },
  {
    path: "/landscaping-calculators/", h1: "Landscaping Calculators", category: "landscaping",
    title: "Landscaping Calculators – Gravel, Soil, Mulch & Pavers | Ruler Square",
    description: "Free landscaping calculators for gravel, stone, sand, asphalt, mulch, topsoil, compost, sod, grass seed, pavers, retaining walls and pools, with driveway and yard costs.",
    lede: "Driveways, gravel and stone, and everything for the lawn, garden and patio.",
    intro: "Enter your area and depth to get cubic yards, US tons, retail bags and estimated truckloads. Every calculator lets you edit material density and compaction allowance.",
    groups: byIds(["driveways", "yard"]).map(g => section(g)),
    outro: '<h2>Quick cubic-yard coverage rule</h2><p>One cubic yard covers 162 ft² at 2 inches deep, 108 ft² at 3 inches deep, or 81 ft² at 4 inches deep.</p>',
  },
  {
    path: "/home-systems-calculators/", h1: "Home Systems & Energy Calculators", category: "systems",
    title: "Home Systems Calculators – HVAC, BTU & Power | Ruler Square",
    description: "Free home sizing calculators for room AC & heating BTU, mini-splits, firewood cords, backup generators, water heaters, dehumidifiers and bath fans.",
    lede: "Size heating, cooling, backup power, hot water and home ventilation accurately.",
    intro: "Size everyday home mechanical and energy systems using US DOE, ENERGY STAR, HVI and NIST guidelines—built for year-round renovations, winter prep and storm readiness.",
    groups: byIds(["systems"]).map(g => section(g)),
    outro: '<h2>Pairing system sizing with building envelope</h2><p>Upgrading attic insulation cuts cooling and heating loads before you buy new equipment—check our <a href="/insulation-calculator/">Insulation Calculator</a> and <a href="/spray-foam-insulation-cost/">Spray Foam Cost Calculator</a>.</p>',
  },
  {
    path: "/cost-calculators/", h1: "Project Cost Calculators", category: "cost",
    title: "Home Project Cost Calculators (2026) | Ruler Square",
    description: "Estimate 2026 installed home project costs for concrete, driveways, roofing, siding, flooring, decks, fences, yards, additions and contractor labor.",
    lede: "Every installed-cost calculator on one page, grouped by project.",
    intro: "Pick a material, finish tier or US state inside each calculator to start from current national benchmarks, then swap in your local contractor quotes and track demolition or fees separately.",
    groups: GROUPS.map(g => section(g, ([href]) => COST_HREFS.has(href) || g.id === "budgets")).filter(s => s.items.length),
    outro: '<h2>Compare quotes like for like</h2><p>Always verify whether a contractor quote includes tear-out, haul-away, subfloor or gravel base prep, permits and taxes before comparing two bids side by side.</p>',
  },
];

/* The drawings in the first screen load at once and are decoded before the page is painted, so a
 * reload does not show the page without them and then blink them in; the rest stay lazy. */
const imgLoad = i => i < 2 ? `loading="eager" decoding="sync"${i === 0 ? ' fetchpriority="high"' : ""}` : 'loading="lazy" decoding="async"';
const IMG = (g, i = 9) => `<img class="g-draw" src="/assets/g-${g.img}.webp?v=VERSION" alt="${g.alt}" width="180" height="120" ${imgLoad(i)}>`;

/* One project group: drawing, name, then quantities and costs as two short lists. */
function groupSection(sec, i) {
  const qty = sec.items.filter(([href]) => !COST_HREFS.has(href));
  const cost = sec.items.filter(([href]) => COST_HREFS.has(href));
  const list = items => `<ul class="g-list">${items.map(([href, title]) =>
    `<li><a href="${href}">${title}</a></li>`).join("")}</ul>`;
  return `<section class="g-sec" id="${sec.group.id}">
  <div class="g-head">${IMG(sec.group, i)}<div><h2>${sec.name}</h2><p>${sec.group.blurb}</p></div></div>
  ${qty.length ? `${cost.length ? '<h3 class="g-sub">Materials &amp; layout</h3>' : ""}${list(qty)}` : ""}
  ${cost.length ? `<h3 class="g-sub">Installed costs</h3>${list(cost)}` : ""}
</section>`;
}

function categoryPage(cat) {
  const uniqueItems = new Set(cat.groups.flatMap(g => g.items.map(i => i[0]))).size;
  return {
    path: cat.path,
    title: cat.title,
    description: cat.description,
    crumbs: cat.h1,
    breadcrumbs: [{ name: "Home", href: "/" }, { name: cat.h1 }],
    category: cat.category,
    lastmod: UPDATED.iso,
    schema: [
      {
        "@context": "https://schema.org", "@type": "CollectionPage",
        name: cat.h1, url: SITE.url + cat.path, description: cat.description,
        dateModified: UPDATED.iso,
      },
      {
        "@context": "https://schema.org", "@type": "ItemList",
        itemListElement: cat.groups.flatMap(g => g.items).map(([href, name], i) => ({
          "@type": "ListItem", position: i + 1, name, url: SITE.url + href,
        })),
      },
      {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url + "/" },
          { "@type": "ListItem", position: 2, name: cat.h1, item: SITE.url + cat.path },
        ],
      },
    ],
    body: `
<h1>${cat.h1}</h1>
<p class="lede">${cat.lede}</p>

<div class="g-index">${cat.groups.map((sec, i) => groupSection(sec, i)).join("")}</div>

<div class="prose">
<h2>About these ${uniqueItems} calculators</h2>
<p>${cat.intro}</p>
${cat.outro}
</div>
`,
  };
}

function placeOf(href) {
  for (const cat of CATEGORIES) {
    const groupFound = cat.groups.find(g => g.items.some(i => i[0] === href));
    if (groupFound) return { cat, group: groupFound };
  }
  return null;
}

module.exports = CATEGORIES.map(categoryPage);
module.exports.CATEGORIES = CATEGORIES;
module.exports.placeOf = placeOf;
module.exports.COST_HREFS = COST_HREFS;
