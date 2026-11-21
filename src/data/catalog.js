/* The catalog: every calculator as [href, title, short description, icon, search keywords].
 * Kept apart from the pages so hubs, the homepage and the search index read one list. */
const CONCRETE = [
  ["/concrete-calculator/", "Concrete Calculator", "Cubic yards, bags and cost for slabs, footings, columns, steps and curbs", "concrete", "concrete slab footing column steps curb bags ready-mix yards"],
  ["/asphalt-calculator/", "Asphalt Calculator", "Tons of hot mix for driveways and parking lots", "asphalt", "asphalt hot mix paving driveway blacktop tons overlay"],
  ["/square-footage-calculator/", "Square Footage Calculator", "Any shape, in sq ft, yards, meters and acres", "sqft", "square footage area room floor acres sq ft measure"],
];
const AGGREGATE = [
  ["/gravel-calculator/", "Gravel Calculator", "Tons and cubic yards for driveways and paths", "gravel", "gravel driveway aggregate tons yards truckloads"],
  ["/pea-gravel-calculator/", "Pea Gravel Calculator", "Tons, yards and bags for patios and walkways", "gravel", "pea gravel patio walkway dog run rounded stone tons bags"],
  ["/decomposed-granite-calculator/", "Decomposed Granite Calculator", "Compacted DG for patios and pathways", "stone", "decomposed granite dg pathway patio stabilized compacted tons yards"],
  ["/road-base-calculator/", "Road Base Calculator", "Crusher run with compaction allowance", "gravel", "road base crusher run aggregate abc driveway base"],
  ["/stone-calculator/", "Crushed Stone Calculator", "#57 stone and crusher run for bases and drainage", "stone", "crushed stone 57 crusher run paver base drainage"],
  ["/sand-calculator/", "Sand Calculator", "Bedding sand in cubic yards, tons or bags", "sand", "sand paver bedding sandbox concrete backfill"],
  ["/river-rock-calculator/", "River Rock Calculator", "Decorative beds and dry creek beds", "rock", "river rock decorative landscape stone dry creek"],
];
const SOIL = [
  ["/topsoil-calculator/", "Topsoil Calculator", "Lawns, garden beds and topdressing", "topsoil", "topsoil lawn garden soil yards bags"],
  ["/compost-calculator/", "Compost Calculator", "Garden amendments and lawn topdressing", "garden", "compost garden soil topdressing organic yards bags"],
  ["/fill-dirt-calculator/", "Fill Dirt Calculator", "Grading, low spots and dump truck loads", "dirt", "fill dirt grading backfill low spot subsoil truckloads"],
  ["/mulch-calculator/", "Mulch Calculator", "Cubic yards and bags for garden beds", "mulch", "mulch bark garden bed landscaping bags cubic yards"],
];

const { PROJ } = require("./projects");
const { COSTS } = require("./costs");
const { TOOLS } = require("./tools");

const KIND_ICON = {
  fence: "fence", deck: "deck", siding: "siding", drywall: "drywall",
  tile: "tile", paver: "paver", paint: "paint", "exterior-paint": "paint",
  "deck-stain": "paint", roofing: "roofing", "metal-roofing": "roofing",
  "retaining-wall": "wall", insulation: "insulation",
  "board-and-batten": "batten", wainscoting: "batten",
  grout: "trowel", thinset: "trowel", mortar: "trowel",
  "cubic-yard": "cube", "cubic-feet": "cube", "yards-to-tons": "cube",
  cost: "cost", "gutter-size": "gutter", stair: "stairs", "concrete-steps": "stairs",
  "baluster-spacing": "fence", sonotube: "concrete", "fence-post-concrete": "concrete",
  "concrete-bag": "concrete", "self-leveling": "concrete",
  "raised-bed": "garden", "grass-seed": "topsoil",
  btu: "hvac", firewood: "firewood", "generator-wattage": "bolt",
  "water-heater": "water", dehumidifier: "water", "bathroom-fan": "fan",
  "tank-volume": "tank", pool: "water",
};

const NEW = [...PROJ, ...COSTS, ...TOOLS].map(c =>
  [`/${c.slug}/`, c.h1, c.lede, KIND_ICON[c.kind] || "sqft", `${c.h1} ${c.slug.replace(/-/g, " ")}`]);
const ALL = [].concat(CONCRETE, AGGREGATE, SOIL, NEW);


module.exports = { ALL };
