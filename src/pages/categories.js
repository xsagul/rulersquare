const { SITE } = require("../layout");
const { ICONS } = require("../icons");
const { PROJ } = require("../data/projects");
const { TOOLS } = require("../data/tools");
const { COSTS } = require("../data/costs");
const entries = list => list.map(c => [`/${c.slug}/`, c.h1, c.lede]);
const material = (slug, title, desc) => [`/${slug}-calculator/`, title, desc];
const tools = [...PROJ, ...TOOLS];
const group = (name, icon, kinds) => ({name, icon, items:entries(tools.filter(c=>kinds.includes(c.kind)))});
const costGroup = (name, slugs) => ({name, icon:"cost", items:entries(COSTS.filter(c=>slugs.includes(c.slug)))});
const CATEGORIES = [
  {
    path:"/construction-calculators/", h1:"Construction Calculators",
    title:"Construction Calculators – Materials & Measurements | Ruler Square",
    description:"Calculate concrete, flooring, drywall, roofing, lumber and masonry quantities. Free tools with unit conversions, formulas and worked examples.",
    lede:"Measure the job. Work out what to buy.",
    intro:"Choose a material or measurement below. Each tool shows its units, formula and a worked example. Use product coverage and supplier measurements for your final order.",
    groups:[
      {name:"Concrete & masonry",icon:"concrete",items:[material("concrete","Concrete Calculator","Cubic yards and bags for slabs, footings and columns"),...entries(tools.filter(c=>["brick","rebar"].includes(c.kind)))]},
      group("Floors, walls & finishes","tile",["flooring","carpet","wallpaper","drywall","tile","paint","insulation","board-and-batten","grout","thinset"]),
      group("Lumber, framing & stairs","deck",["board-foot","framing","stair","ramp","deck","fence"]),
      group("Roofing & siding","roofing",["roofing","roof-pitch","siding"]),
      {name:"Driveways & base layers",icon:"gravel",items:[material("asphalt","Asphalt Calculator","Hot-mix asphalt in tons"),material("road-base","Road Base Calculator","Crusher run with a compaction allowance"),material("stone","Crushed Stone Calculator","Stone for bases and drainage")]},
      group("Measurements & conversions","sqft",["feet-inches","cubic-feet","cubic-yard","linear-feet","tank-volume"]),
    ],
    outro:'<h2>Quantity or installed cost?</h2><p>These tools estimate materials. For a budget including labor, use the <a href="/cost-calculators/">project cost calculators</a>. Quantities do not replace a structural design or a product installation plan.</p>',
  },
  {
    path:"/landscaping-calculators/",h1:"Landscaping Calculators",
    title:"Landscaping Calculators – Soil, Gravel, Patios & Pools | Ruler Square",
    description:"Estimate mulch, soil, sand, gravel, sod, pavers and retaining wall blocks. Calculate pool volume, with formulas and editable planning assumptions.",
    lede:"Plan the yard, from soil and stone to a patio or pool.",
    intro:"Measure the area and planned depth. Weight depends on moisture and density; replace the starting assumption with your supplier’s figure before ordering.",
    groups:[
      {name:"Soil & planting beds",icon:"mulch",items:[material("mulch","Mulch Calculator","Cubic yards and bags for garden beds"),material("topsoil","Topsoil Calculator","Soil for lawns and raised beds"),material("fill-dirt","Fill Dirt Calculator","Grading and backfill"),...entries(tools.filter(c=>c.kind==="sod"))]},
      {name:"Gravel, rock & sand",icon:"gravel",items:[material("gravel","Gravel Calculator","Driveways, paths and drainage"),material("river-rock","River Rock Calculator","Decorative beds and dry creek beds"),material("stone","Crushed Stone Calculator","Paver bases and drainage"),material("sand","Sand Calculator","Bedding sand and sandboxes")]},
      group("Patios, walls & pools","paver",["paver","retaining-wall","pool"]),
    ],
    outro:'<h2>A quick coverage check</h2><p>One cubic yard covers 108 square feet at 3 inches deep. Check the planned depth for your plants, soil or installation system before ordering. For installed budgets, see the <a href="/cost-calculators/">cost calculators</a>.</p>',
  },
  {
    path:"/cost-calculators/",h1:"Project Cost Calculators",
    title:"Project Cost Calculators – Home Improvement Budgets | Ruler Square",
    description:"Estimate flooring, painting, roofing, concrete and landscaping costs. Compare published US price ranges, local quotes, labor and excluded extras.",
    lede:"Start a budget. See the rate, scope and extras behind it.",
    intro:"Published US price ranges are starting references, not local quotes. Replace them with rates for your project and add delivery or removal only when the quote excludes them.",
    groups:[
      costGroup("Concrete & driveways",["concrete-cost-per-yard","concrete-slab-cost","concrete-patio-cost","concrete-driveway-cost","asphalt-driveway-cost"]),
      costGroup("Flooring & interior finishes",["carpet-installation-cost","laminate-flooring-installation-cost","tile-installation-cost","epoxy-garage-floor-cost","drywall-installation-cost","interior-painting-cost","countertop-cost"]),
      costGroup("Roofing, siding & insulation",["roof-replacement-cost","metal-roof-cost","stucco-cost","vinyl-siding-cost","spray-foam-insulation-cost"]),
      costGroup("Decks, fences & landscaping",["deck-cost-calculator","deck-staining-cost","fence-installation-cost","retaining-wall-cost","sod-installation-cost","french-drain-cost"]),
      costGroup("Building & additions",["construction-cost-calculator","home-addition-cost"]),
      group("Labor & quoting","cost",["labor-cost","markup"]),
    ],
    outro:'<h2>Compare like for like</h2><p>An installed price and a material-only price cover different work. Check preparation, labor, removal, delivery, cleanup and taxes before comparing quotes.</p>',
  },
];
// Area is shared across material projects and needs a direct home in the hub.
CATEGORIES[0].groups.find(g=>g.name==="Measurements & conversions").items.unshift(material("square-footage","Square Footage Calculator","Area for rectangles, circles and irregular spaces"));

function categoryPage(cat) {
  const allItems = cat.groups.reduce((n, g) => n + g.items.length, 0);
  return {
    path: cat.path,
    title: cat.title,
    description: cat.description,
    crumbs: cat.h1,
    lastmod: "2026-11-15",
    schema: [
      {
        "@context": "https://schema.org", "@type": "CollectionPage",
        name: cat.h1, url: SITE.url + cat.path, description: cat.description,
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

${cat.groups.map(g => `<section class="cat-group">
  <h2>${ICONS[g.icon]}${g.name}</h2>
  <div class="grid">
    ${g.items.map(([href, title, desc]) =>
      `<a class="card" href="${href}"><b>${title}</b><span>${desc}</span></a>`).join("\n    ")}
  </div>
</section>`).join("\n")}

<div class="prose">
<h2>About these ${allItems} calculators</h2>
<p>${cat.intro}</p>
${cat.outro}
</div>
`,
  };
}

/* Where a calculator sits in the hubs. The first hub that lists it wins, so a
 * page filed under two hubs takes its breadcrumb from the earlier one. */
function placeOf(href) {
  for (const cat of CATEGORIES) {
    const group = cat.groups.find(g => g.items.some(i => i[0] === href));
    if (group) return { cat, group };
  }
  return null;
}

module.exports = CATEGORIES.map(categoryPage);
module.exports.CATEGORIES = CATEGORIES;
module.exports.placeOf = placeOf;
