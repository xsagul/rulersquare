const { SITE } = require("../layout");
const { ICONS } = require("../icons");
const { PROJ } = require("../data/projects");
const { TOOLS } = require("../data/tools");
const { COSTS } = require("../data/costs");
const { UPDATED } = require("../author");

const entries = list => list.map(c => [`/${c.slug}/`, c.h1, c.lede]);
const material = (slug, title, desc) => [`/${slug}-calculator/`, title, desc];
const tools = [...PROJ, ...TOOLS];
const group = (name, icon, kinds) => ({ name, icon, items: entries(tools.filter(c => kinds.includes(c.kind))) });
const costGroup = (name, slugs) => ({ name, icon: "cost", items: entries(COSTS.filter(c => slugs.includes(c.slug))) });

const CATEGORIES = [
  {
    path: "/construction-calculators/", h1: "Construction Calculators", category: "construction",
    title: "Construction Calculators – Materials & Cuts | Ruler Square",
    description: "Free construction calculators for concrete, framing, stairs, drywall, tile, roofing, trim and lumber quantities with formulas and reference charts.",
    lede: "Measure the project and work out exact material quantities before you order.",
    intro: "Select a material or layout calculator below. Every tool computes live as you enter your dimensions, rounds order quantities up to whole packages, and lets you copy or print a clean job list.",
    groups: [
      {
        name: "Concrete & masonry", icon: "concrete",
        items: [
          material("concrete", "Concrete Calculator", "Yards, bags and cost for slabs, footings, columns, steps and curbs"),
          ...entries(tools.filter(c => ["concrete-bag", "concrete-steps", "sonotube", "fence-post-concrete", "self-leveling", "brick", "mortar", "rebar"].includes(c.kind))),
        ],
      },
      group("Floors, walls & finishes", "tile", ["flooring", "carpet", "wallpaper", "drywall", "tile", "grout", "thinset", "paint", "exterior-paint", "insulation"]),
      group("Carpentry, framing, decks & trim", "deck", ["framing", "board-foot", "plywood", "deck", "deck-stain", "fence", "stair", "baluster-spacing", "ramp", "board-and-batten", "wainscoting", "baseboard", "crown-molding"]),
      group("Roofing, siding & gutters", "roofing", ["roofing", "metal-roofing", "roof-pitch", "gutter-size", "siding"]),
      {
        name: "Driveways & base layers", icon: "gravel",
        items: [
          material("asphalt", "Asphalt Calculator", "Hot-mix asphalt in US tons"),
          material("road-base", "Road Base Calculator", "Crusher run with compaction"),
          material("stone", "Crushed Stone Calculator", "#57 stone and crusher run"),
        ],
      },
      group("Measurements & unit conversions", "sqft", ["feet-inches", "cubic-feet", "cubic-yard", "linear-feet", "tank-volume"]),
    ],
    outro: '<h2>Need installed budgets too?</h2><p>These tools estimate materials and layouts. To price labor and materials together, browse the <a href="/cost-calculators/">2026 project cost calculators</a>.</p>',
  },
  {
    path: "/landscaping-calculators/", h1: "Landscaping Calculators", category: "landscaping",
    title: "Landscaping Calculators – Soil, Gravel & Lawn | Ruler Square",
    description: "Free landscaping calculators for gravel, mulch, topsoil, compost, raised garden beds, sod, grass seed, pavers, retaining walls and pools.",
    lede: "Calculate bulk stone, soil, mulch, lawn seed, pavers and pool volume.",
    intro: "Enter your area and depth to get cubic yards, US tons, retail bags and estimated dump truck loads. Every calculator lets you edit material density and compaction allowance.",
    groups: [
      {
        name: "Soil, mulch & lawn", icon: "mulch",
        items: [
          material("mulch", "Mulch Calculator", "Cubic yards and 2 cu ft bags for beds"),
          material("topsoil", "Topsoil Calculator", "Screened soil for lawns and beds"),
          material("compost", "Compost Calculator", "Compost for gardens and lawn topdressing"),
          material("fill-dirt", "Fill Dirt Calculator", "Grading, low spots and backfill"),
          ...entries(tools.filter(c => ["raised-bed", "sod", "grass-seed"].includes(c.kind))),
        ],
      },
      {
        name: "Gravel, rock, sand & conversions", icon: "gravel",
        items: [
          material("gravel", "Gravel Calculator", "Driveways, paths and drainage"),
          material("pea-gravel", "Pea Gravel Calculator", "Patios, walkways and dog runs"),
          material("decomposed-granite", "Decomposed Granite Calculator", "Compacted DG paths and patios"),
          material("river-rock", "River Rock Calculator", "Landscape beds and dry creeks"),
          material("stone", "Crushed Stone Calculator", "#57 drainage and paver bases"),
          material("sand", "Sand Calculator", "Paver bedding and sandboxes"),
          ...entries(tools.filter(c => ["yards-to-tons", "acreage"].includes(c.kind))),
        ],
      },
      group("Patios, retaining walls & pools", "paver", ["paver", "retaining-wall", "pool"]),
    ],
    outro: '<h2>Quick cubic-yard coverage rule</h2><p>One cubic yard covers 162 ft² at 2 inches deep, 108 ft² at 3 inches deep, or 81 ft² at 4 inches deep. For installed budgets, see the <a href="/cost-calculators/">project cost calculators</a>.</p>',
  },
  {
    path: "/home-systems-calculators/", h1: "Home Systems & Energy Calculators", category: "systems",
    title: "Home Systems Calculators – HVAC, BTU & Power | Ruler Square",
    description: "Free home sizing calculators for room AC & heating BTU, mini-splits, firewood cords, backup generators, water heaters, dehumidifiers and bath fans.",
    lede: "Size heating, cooling, backup power, hot water and home ventilation accurately.",
    intro: "Size everyday home mechanical and energy systems using US DOE, ENERGY STAR, HVI and NIST guidelines—built for year-round renovations, winter prep and storm readiness.",
    groups: [
      group("Heating, cooling & ventilation", "hvac", ["btu", "dehumidifier", "bathroom-fan"]),
      group("Backup power, hot water & firewood", "bolt", ["generator-wattage", "water-heater", "firewood"]),
    ],
    outro: '<h2>Pairing system sizing with building envelope</h2><p>Upgrading attic insulation cuts cooling and heating loads before you buy new equipment—check our <a href="/insulation-calculator/">Insulation Calculator</a> and <a href="/spray-foam-insulation-cost/">Spray Foam Cost Calculator</a>.</p>',
  },
  {
    path: "/cost-calculators/", h1: "Project Cost Calculators", category: "cost",
    title: "Home Project Cost Calculators (2026) | Ruler Square",
    description: "Estimate 2026 installed home project costs for concrete, roofing, flooring, siding, fences, decks, painting and home additions.",
    lede: "Estimate 2026 installed project budgets with material tiers and clear extras.",
    intro: "Pick a material, finish tier or US state inside each calculator to start from current national benchmarks, then swap in your local contractor quotes and track demolition or fees separately.",
    groups: [
      costGroup("Concrete & driveways", ["concrete-cost-per-yard", "concrete-slab-cost", "concrete-patio-cost", "concrete-driveway-cost", "asphalt-driveway-cost"]),
      costGroup("Flooring & interior finishes", ["carpet-installation-cost", "laminate-flooring-installation-cost", "tile-installation-cost", "epoxy-garage-floor-cost", "drywall-installation-cost", "interior-painting-cost", "countertop-cost"]),
      costGroup("Roofing, siding & insulation", ["roof-replacement-cost", "metal-roof-cost", "stucco-cost", "vinyl-siding-cost", "spray-foam-insulation-cost"]),
      costGroup("Decks, fences & landscaping", ["deck-cost-calculator", "deck-staining-cost", "fence-installation-cost", "retaining-wall-cost", "sod-installation-cost", "french-drain-cost"]),
      costGroup("Building & additions", ["construction-cost-calculator", "home-addition-cost"]),
      group("Contractor pricing & labor", "cost", ["labor-cost", "markup"]),
    ],
    outro: '<h2>Compare quotes like for like</h2><p>Always verify whether a contractor quote includes tear-out, haul-away, subfloor or gravel base prep, permits and taxes before comparing two bids side by side.</p>',
  },
];

CATEGORIES[0].groups.find(g => g.name === "Measurements & unit conversions").items.unshift(
  material("square-footage", "Square Footage Calculator", "Area for rectangles, circles, triangles and irregular spaces")
);

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

${cat.groups.map(g => `<section class="cat-group" data-cat="${cat.category}">
  <h2><span class="ico-badge">${ICONS[g.icon] || ICONS.sqft}</span>${g.name}</h2>
  <div class="grid">
    ${g.items.map(([href, title, desc]) =>
      `<a class="card" href="${href}"><b>${title}</b><span>${desc}</span></a>`).join("\n    ")}
  </div>
</section>`).join("\n")}

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
