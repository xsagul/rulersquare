/* The 10 project groups (decided 21 Nov 2026, research/structura-2026-11-21.md).
 * One group = one project or material: quantity calculators and their cost
 * calculators live together. Every calculator belongs to exactly one group;
 * test.js checks that the groups cover the whole catalog with no duplicates.
 *
 * `hub` is the existing page that hosts the group's section (no new URLs:
 * Google has 49 pages still "discovered, not indexed", so list pages are not
 * multiplied). `img` is the group drawing, generated in ChatGPT Image from
 * one sheet so the set stays consistent, then checked dimension by dimension. */
const GROUPS = [
  {
    id: "concrete", name: "Concrete & Masonry", hub: "/construction-calculators/",
    img: "concrete", alt: "Concrete slab drawing with length, width and thickness dimensions",
    blurb: "Slabs, footings, columns, steps, block, brick and mortar.",
    items: ["concrete-calculator", "concrete-bag-calculator", "concrete-steps-calculator", "sonotube-calculator",
      "fence-post-concrete-calculator", "self-leveling-concrete-calculator", "rebar-calculator",
      "concrete-block-calculator", "brick-calculator", "mortar-calculator",
      "concrete-cost-per-yard", "concrete-slab-cost", "concrete-patio-cost"],
  },
  {
    id: "driveways", name: "Driveways, Gravel & Stone", hub: "/landscaping-calculators/",
    img: "driveways", alt: "Driveway cross-section with gravel, base and subgrade layers",
    blurb: "Bulk aggregate in yards and tons, asphalt and driveway budgets.",
    items: ["gravel-calculator", "pea-gravel-calculator", "stone-calculator", "river-rock-calculator",
      "decomposed-granite-calculator", "sand-calculator", "road-base-calculator", "asphalt-calculator",
      "cubic-yards-to-tons-calculator", "concrete-driveway-cost", "asphalt-driveway-cost"],
  },
  {
    id: "yard", name: "Lawn, Garden & Patio", hub: "/landscaping-calculators/",
    img: "yard", alt: "Raised garden bed drawing with length and height dimensions",
    blurb: "Soil, mulch, sod and seed, pavers, retaining walls and pools.",
    items: ["mulch-calculator", "topsoil-calculator", "compost-calculator", "fill-dirt-calculator",
      "raised-bed-soil-calculator", "sod-calculator", "grass-seed-calculator", "paver-calculator",
      "retaining-wall-calculator", "pool-volume-calculator",
      "sod-installation-cost", "retaining-wall-cost", "french-drain-cost"],
  },
  {
    id: "decks", name: "Decks & Fences", hub: "/construction-calculators/",
    img: "decks", alt: "Wood deck with railing, with length and width dimensions",
    blurb: "Deck boards, stain, fences, balusters and their installed costs.",
    items: ["deck-calculator", "deck-stain-calculator", "fence-calculator", "baluster-spacing-calculator",
      "deck-cost-calculator", "deck-staining-cost", "fence-installation-cost"],
  },
  {
    id: "framing", name: "Framing, Stairs & Trim", hub: "/construction-calculators/",
    img: "framing", alt: "Stair stringer drawing with rise and run dimensions",
    blurb: "Studs, lumber, plywood, stairs, ramps and interior trim.",
    items: ["framing-calculator", "board-foot-calculator", "plywood-calculator", "stair-calculator",
      "ramp-calculator", "board-and-batten-calculator", "wainscoting-calculator",
      "baseboard-calculator", "crown-molding-calculator"],
  },
  {
    id: "roofing", name: "Roofing & Siding", hub: "/construction-calculators/",
    img: "roofing", alt: "Gable roof drawing with the roof pitch angle marked",
    blurb: "Shingles, metal panels, pitch, gutters, siding and exterior paint.",
    items: ["roofing-calculator", "metal-roofing-calculator", "roof-pitch-calculator", "gutter-size-calculator",
      "siding-calculator", "exterior-paint-calculator",
      "roof-replacement-cost", "metal-roof-cost", "vinyl-siding-cost", "stucco-cost"],
  },
  {
    id: "interior", name: "Floors, Walls & Paint", hub: "/construction-calculators/",
    img: "interior", alt: "Floor tile layout drawing with length and width dimensions",
    blurb: "Flooring, tile, drywall, paint, wallpaper, insulation and install costs.",
    items: ["flooring-calculator", "carpet-calculator", "tile-calculator", "grout-calculator",
      "thinset-calculator", "drywall-calculator", "paint-calculator", "wallpaper-calculator",
      "insulation-calculator",
      "carpet-installation-cost", "laminate-flooring-installation-cost", "tile-installation-cost",
      "drywall-installation-cost", "interior-painting-cost", "countertop-cost",
      "epoxy-garage-floor-cost", "spray-foam-insulation-cost"],
  },
  {
    id: "systems", name: "Home Systems & Energy", hub: "/home-systems-calculators/",
    img: "systems", alt: "Tank water heater drawing with height and diameter dimensions",
    blurb: "AC and heating BTU, dehumidifiers, bath fans, generators, water heaters and firewood.",
    items: ["btu-calculator", "dehumidifier-size-calculator", "bathroom-fan-cfm-calculator",
      "generator-wattage-calculator", "water-heater-size-calculator", "firewood-calculator"],
  },
  {
    id: "measure", name: "Measurements & Conversions", hub: "/construction-calculators/",
    img: "measure", alt: "Tape measure drawing with a length dimension",
    blurb: "Feet and inches, square footage, cubic yards and feet, linear feet, tanks and acres.",
    items: ["feet-and-inches-calculator", "square-footage-calculator", "cubic-yard-calculator",
      "cubic-feet-calculator", "linear-feet-calculator", "tank-volume-calculator", "acreage-calculator"],
  },
  {
    id: "budgets", name: "Budgets & Contractor Tools", hub: "/construction-calculators/",
    img: "budgets", alt: "Clipboard with an estimate sheet",
    blurb: "Whole-project costs, additions, markup and labor rates.",
    items: ["construction-cost-calculator", "home-addition-cost", "markup-calculator", "labor-cost-calculator"],
  },
];

/* Desktop top bar: five words. The phone menu lists all ten groups. */
const NAV_GROUPS = [
  ["Concrete", "/construction-calculators/#concrete"],
  ["Yard & Driveway", "/landscaping-calculators/"],
  ["Building", "/construction-calculators/#decks"],
  ["Interior", "/construction-calculators/#interior"],
  ["Measure", "/construction-calculators/#measure"],
];

const groupHref = g => g.id === "systems" ? g.hub : `${g.hub}#${g.id}`;

module.exports = { GROUPS, NAV_GROUPS, groupHref };
