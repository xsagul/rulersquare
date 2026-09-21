const { SITE } = require("../layout");
const { ICONS } = require("../icons");

/* Category pages sit between the homepage and the calculators, the way
 * inchcalculator groups Construction -> Concrete & Masonry -> a calculator.
 * Each one is a real hub: it carries its own copy and links every child. */

const CATEGORIES = [
  {
    path: "/construction-calculators/",
    h1: "Construction Calculators",
    title: "Construction Calculators – Concrete, Asphalt & Area | Ruler Square",
    description: "Free construction calculators for concrete, asphalt and square footage. Estimate materials and cost for slabs, driveways, footings and paving.",
    lede: "Estimate the materials a build needs, from a concrete slab to a paved driveway, with the formula shown on every page.",
    intro: "Construction estimating comes down to volume: work out the area, multiply by the thickness, convert to whatever unit your supplier quotes in. These calculators do that conversion and show the arithmetic, so you can sanity-check a quote rather than take it on faith.",
    groups: [
      {
        name: "Concrete & masonry", icon: "concrete",
        items: [
          ["/concrete-calculator/", "Concrete Calculator", "Cubic yards, 40–80 lb bags and cost for slabs, footings, columns and round pads"],
        ],
      },
      {
        name: "Driveways & paving", icon: "gravel",
        items: [
          ["/asphalt-calculator/", "Asphalt Calculator", "Tons of hot mix by area and thickness, with coverage and cost"],
          ["/gravel-calculator/", "Gravel Calculator", "Driveway gravel in tons, yards and truckloads, with compaction"],
          ["/stone-calculator/", "Crushed Stone Calculator", "#57 stone and crusher run for bases and drainage"],
        ],
      },
      {
        name: "Framing & carpentry", icon: "concrete",
        items: [
          ["/board-foot-calculator/", "Board Foot Calculator", "Lumber quantity and cost by board feet, on nominal sizes"],
          ["/framing-calculator/", "Framing Calculator", "Wall studs and plate stock at 12, 16 or 24 inch centres"],
          ["/stair-calculator/", "Stair Calculator", "Risers, treads, total run and stringer length from a total rise"],
          ["/ramp-calculator/", "Ramp Calculator", "ADA slope, run and landings for any rise"],
        ],
      },
      {
        name: "Roofing & masonry", icon: "asphalt",
        items: [
          ["/roof-pitch-calculator/", "Roof Pitch Calculator", "Angle, slope multiplier and rafter length from a pitch"],
          ["/brick-calculator/", "Brick Calculator", "Bricks or blocks for a wall, with the mortar joint counted"],
          ["/rebar-calculator/", "Rebar Calculator", "Slab mat bar count, linear feet and weight by bar size"],
          ["/road-base-calculator/", "Road Base Calculator", "Crusher run in tons and yards, with compaction"],
        ],
      },
      {
        name: "Measurement & conversion", icon: "sand",
        items: [
          ["/square-footage-calculator/", "Square Footage Calculator", "Any shape, in square feet, yards, meters, acres and roofing squares"],
          ["/feet-and-inches-calculator/", "Feet and Inches Calculator", "Add and subtract tape measurements without converting by hand"],
          ["/cubic-feet-calculator/", "Cubic Feet Calculator", "Volume in cubic feet, yards, metres, gallons and litres"],
          ["/tank-volume-calculator/", "Tank Volume Calculator", "Capacity in gallons and litres for round or rectangular tanks"],
        ],
      },
    ],
    outro: `<h2>Getting an estimate right</h2>
<p>Three things go wrong in almost every material estimate, and none of them is the arithmetic.</p>
<p><strong>The depth is not what you measured.</strong> Trench walls slump, subgrade has low spots, and forms bow out under the weight of wet concrete. That is what the waste and compaction allowances on each page are for — they are not padding, they are the difference between the ideal shape and the hole you actually dug.</p>
<p><strong>The units do not match the quote.</strong> Aggregate is sold by the yard at a landscape supplier and by the ton at a quarry. Asphalt is always tons. Concrete is always yards. Work out both figures before you phone around, or you cannot compare two prices.</p>
<p><strong>Running short costs more than ordering long.</strong> A second delivery of half a yard often costs nearly as much as the first full load, because you are paying for the truck and the driver rather than the material. On concrete it is worse: the joint where the first pour stopped setting is a permanent weakness.</p>`,
  },
  {
    path: "/landscaping-calculators/",
    h1: "Landscaping Calculators",
    title: "Landscaping Calculators – Mulch, Soil, Gravel & Rock | Ruler Square",
    description: "Free landscaping calculators for mulch, topsoil, fill dirt, gravel, river rock and sand. Get cubic yards, tons, bags and delivered cost.",
    lede: "Work out how much mulch, soil, stone or sand your yard needs, in the units your supplier actually quotes.",
    intro: "Everything in this group is sold by volume or weight and spread to a depth, so the method never changes: measure the area, pick a depth, convert. What changes is the weight per cubic yard, which runs from 800 pounds for bark mulch to 3,000 for crusher run — a factor of nearly four.",
    groups: [
      {
        name: "Beds & planting", icon: "topsoil",
        items: [
          ["/mulch-calculator/", "Mulch Calculator", "Cubic yards and 2 cu ft bags, with depth guidance by bed type"],
          ["/topsoil-calculator/", "Topsoil Calculator", "New lawns, garden beds and raised beds"],
          ["/fill-dirt-calculator/", "Fill Dirt Calculator", "Grading, low spots and structural backfill"],
          ["/sod-calculator/", "Sod Calculator", "Lawn area converted to rolls and pallets"],
        ],
      },
      {
        name: "Stone & gravel", icon: "gravel",
        items: [
          ["/gravel-calculator/", "Gravel Calculator", "Paths, driveways and drainage, in tons and yards"],
          ["/river-rock-calculator/", "River Rock Calculator", "Decorative beds and dry creek beds"],
          ["/stone-calculator/", "Crushed Stone Calculator", "Paver base and French drains"],
          ["/sand-calculator/", "Sand Calculator", "Paver bedding, sandboxes and backfill"],
        ],
      },
      {
        name: "Measurement", icon: "sand",
        items: [
          ["/square-footage-calculator/", "Square Footage Calculator", "Measure irregular beds and lawns by adding sections"],
        ],
      },
    ],
    outro: `<h2>How deep to spread it</h2>
<p>Depth is the number people guess at, and it moves the order more than anything else. Going from three inches to four adds a third to the load.</p>
<p><strong>Mulch: two to three inches.</strong> Deeper looks generous and slowly kills the plant. Water cannot get through a thick mat, and bark held against a stem keeps the bark permanently wet.</p>
<p><strong>Decorative stone: two to three inches.</strong> Enough to hide the fabric, not enough to bury the plants you are trying to show off.</p>
<p><strong>Topsoil for a new lawn: four to six inches.</strong> Less than four and the grass dries out in the first hot August, because there is not enough soil to hold water.</p>
<p><strong>Drainage beds: six to twelve inches</strong> of washed stone with no fines in it, so water moves through rather than over.</p>
<p>One more thing worth knowing before you order: a cubic yard spread three inches deep covers 108 square feet. Once that number is in your head you can check any quote in your head too.</p>`,
  },
  {
    path: "/pay-calculators/",
    h1: "Pay & Tax Calculators",
    title: "Paycheck & Tax Calculators – 2026 Take-Home Pay | Ruler Square",
    description: "Free 2026 paycheck calculators. Work out take-home pay after federal tax, Social Security, Medicare, state tax and 401(k) contributions.",
    lede: "See what actually reaches your account after federal tax, FICA, state tax and pre-tax deductions.",
    intro: "Gross pay is what you negotiated; take-home is what survives withholding. The gap is usually twenty to thirty percent, and most of it is predictable once you know which deductions come out before income tax is figured and which do not.",
    groups: [
      {
        name: "Take-home pay", icon: "paycheck",
        items: [
          ["/paycheck-calculator/", "Paycheck Calculator", "Any state, with the 2026 federal brackets and FICA shown"],
          ["/texas-paycheck-calculator/", "Texas Paycheck Calculator", "No state income tax — federal and FICA only"],
          ["/florida-paycheck-calculator/", "Florida Paycheck Calculator", "No state income tax — federal and FICA only"],
        ],
      },
      {
        name: "Wage & salary conversion", icon: "sqft",
        items: [
          ["/salary-to-hourly-calculator/", "Salary to Hourly Calculator", "Annual salary as an hourly rate, with part-time and unpaid leave"],
          ["/annual-income-calculator/", "Annual Income Calculator", "Yearly income from any rate, including overtime"],
          ["/pay-rate-calculator/", "Pay Rate Calculator", "Every pay period side by side, from one figure"],
        ],
      },
      {
        name: "Running the job", icon: "concrete",
        items: [
          ["/markup-calculator/", "Markup Calculator", "Turn cost into a quote price, and see the margin it really gives"],
          ["/labor-cost-calculator/", "Labor Cost Calculator", "Crew hours at a burdened rate, not just the wage"],
        ],
      },
    ],
    outro: `<h2>What comes out, and in what order</h2>
<p>The order matters more than the rates, because each step changes the base the next one is calculated on.</p>
<ol>
  <li><strong>Pre-tax deductions come out first.</strong> A traditional 401(k) reduces the wages your income tax is figured on. Section 125 health premiums reduce income tax <em>and</em> FICA.</li>
  <li><strong>The standard deduction comes off next</strong> — $16,100 single, $32,200 married filing jointly for 2026.</li>
  <li><strong>What is left runs through the brackets.</strong> Only the income inside each band pays that band's rate, which is why a raise into the 22% bracket never taxes your whole salary at 22%.</li>
  <li><strong>FICA is separate and flat</strong> — 6.2% Social Security up to the wage base, 1.45% Medicare with no ceiling, and it is charged on your gross whether or not you contribute to a 401(k).</li>
</ol>
<p>That last point catches people out every year. Putting ten percent into a traditional 401(k) does not cut your deductions by ten percent, because Social Security and Medicare are still taken on the full amount.</p>
<p class="note">These are estimates for planning. They are not tax advice, and they do not model every credit, local tax or W-4 adjustment.</p>`,
  },
];

const { PROJ } = require("../data/projects");
const { COSTS } = require("../data/costs");
const entries = list => list.map(c => [`/${c.slug}/`, c.h1, c.lede]);
CATEGORIES[0].title = "Construction Calculators – Materials & Home Projects | Ruler Square";
CATEGORIES[0].description = "Free calculators for concrete, roofing, drywall, siding, decks, fences, paint and tile. Estimate quantities with clear formulas and worked examples.";
CATEGORIES[0].intro = "Choose the material or project you need. Each calculator shows its units, assumptions and an example. Quantities are estimates, not structural designs.";
CATEGORIES[0].outro = `<h2>Quantity or installed cost?</h2><p>Material calculators estimate what to buy. For a budget that includes installation, use the <a href="/cost-calculators/">project cost calculators</a>. Keep delivery, removal and other exclusions visible when comparing quotes.</p>`;
CATEGORIES[0].groups.push({name:"Outdoor structures & exterior",icon:"sqft",items:entries(PROJ.filter(c=>["fence","deck","siding","roofing"].includes(c.kind)))},{name:"Interior projects",icon:"sqft",items:entries(PROJ.filter(c=>["drywall","tile","paint","insulation","board-and-batten","grout","thinset"].includes(c.kind)))});
CATEGORIES[0].groups.find(g=>g.name.startsWith("Measurement")).items.push(...entries(PROJ.filter(c=>c.kind==="cubic-yard")));
CATEGORIES[1].groups.push({name:"Patios & walls",icon:"stone",items:entries(PROJ.filter(c=>c.category==="landscaping"))});
CATEGORIES[1].intro = "Measure the area and the planned depth, then use the right material calculator. Weight depends on moisture and density; the default is a planning assumption you can replace with your supplier’s figure.";
CATEGORIES[1].outro = `<h2>A quick coverage check</h2><p>One cubic yard covers 108 square feet at 3 inches deep. A deeper layer needs more material. Check the planned depth for your plants, soil or installation system before ordering.</p><p>For patios and walls, quantities do not replace a base, drainage or structural design.</p>`;
CATEGORIES[2].lede = "Estimate take-home pay or convert wages between pay periods.";
CATEGORIES[2].intro = "The take-home tools use a simplified annual tax estimate. Actual payroll can differ with your W-4, state rules, credits, deductions and timing. Wage converters show gross pay before tax.";
CATEGORIES[2].groups[0].items[0][2] = "Federal and FICA estimate, with an optional user-entered state rate";
CATEGORIES.push({path:"/cost-calculators/",h1:"Project Cost Calculators",title:"Project Cost Calculators – Concrete, Fences & Roofing | Ruler Square",description:"Estimate concrete, fence, retaining wall and roof project budgets. Compare installed rates, material-only prices and excluded extras with transparent assumptions.",lede:"Build a budget with clear unit rates and separate extras.",intro:"Start with the published price reference, then replace it with local quotes for your exact scope. These tools do not generate contractor bids or ZIP-code-specific prices.",groups:[{name:"Concrete projects",icon:"concrete",items:entries(COSTS.filter(c=>c.slug.startsWith("concrete")))},{name:"Fences, walls & roofing",icon:"sqft",items:entries(COSTS.filter(c=>!c.slug.startsWith("concrete")))}],outro:`<h2>Compare like for like</h2><p>An installed price and a material-only price are not interchangeable. Check labor, preparation, removal, delivery, cleanup and taxes. Add a charge only when it is not already included in the base quote.</p>`});

function categoryPage(cat) {
  const allItems = cat.groups.reduce((n, g) => n + g.items.length, 0);
  return {
    path: cat.path,
    title: cat.title,
    description: cat.description,
    crumbs: cat.h1,
    lastmod: "2026-09-21",
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

module.exports = CATEGORIES.map(categoryPage);
module.exports.CATEGORIES = CATEGORIES;
