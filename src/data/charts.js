/* Reference charts: the same calculator run over the sizes people actually
 * search for ("12x12 room", "6/12 pitch", "2x4x8"). Every cell comes from the
 * engine in src/assets/project.js, starting from the page's own worked-example
 * inputs, so a chart can never disagree with the calculator above it.
 *
 * The top-ranking pages for these terms carry exactly this kind of table
 * (research/serp-2026-10-22/report.md). Pages whose answer depends on one
 * product's published coverage — insulation, grout, thinset, siding — get no
 * chart: a generic table there would print numbers nobody's bag delivers.
 */
const { calculate } = require("../assets/project");

const value = (kind, v, label) => {
  const row = calculate(kind, v).rows.find(r => r.label === label);
  if (!row) throw new Error(`No "${label}" row for ${kind}`);
  return row.value;
};
const num = (n, d = 0) => Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const usd = n => "$" + num(Math.round(n));
const range = ([lo, hi]) => `${usd(lo)}–${usd(hi)}`;
const size = (l, w) => `${l} × ${w} ft`;

/* A chart is a titled table with a one-line lead and a note on what it leaves
 * out. `jump` is the short label in the on-page links. */
const chart = (id, jump, title, intro, head, rows, note) => ({ id, jump, title, intro, head, rows, note });

/* Installed-cost pages share one shape: sizes down the side, the page's
 * published low–high rate applied to each. */
function costBySize(c, title, sizes, note) {
  const v = { ...c.example.values, delivery: 0, removal: 0, other: 0, waste: 0 };
  return chart("by-size", "By size", title,
    `Installed budget at the page’s reference rate of $${num(c.low, 2)}–$${num(c.high, 2)} per ${c.costUnit}, before extras.`,
    ["Size", "Area", "Installed range"],
    sizes.map(([l, w]) => [size(l, w), num(l * w) + " ft²", range(value("cost", { ...v, length: l, width: w }, "Planning range"))]),
    note);
}

const BUILD = {
  "concrete-slab-cost": c => [
    costBySize(c, "Concrete slab cost by size", [[10, 10], [12, 12], [16, 16], [20, 20], [24, 24], [30, 30], [30, 40]],
      "Plain slab at the published per-square-foot range. Thickened edges, reinforcement, removal and difficult access are outside it."),
    chart("by-thickness", "By thickness", "How thickness changes the concrete in a 20 × 20 slab",
      "Ready-mix volume for the same 400 ft² at common thicknesses, and what that concrete alone costs at $160–$195 per cubic yard.",
      ["Thickness", "Concrete", "Ready-mix only"],
      [4, 5, 6].map(t => { const yd = value("cubic-yard", { length: 20, width: 20, depth: t, waste: 0 }, "Volume with allowance");
        return [`${t} in`, num(yd, 2) + " yd³", range([yd * 160, yd * 195])]; }),
      "Material only, no allowance and no delivery. Labor and preparation do not scale with thickness the way concrete volume does."),
  ],
  "concrete-patio-cost": c => [costBySize(c, "Concrete patio cost by size", [[10, 10], [10, 12], [12, 12], [12, 16], [16, 16], [16, 20], [20, 20]],
    "The broad $5–$18 range spans plain to stamped finishes. A quote for one named finish will sit inside a much narrower band.")],
  "concrete-driveway-cost": c => [costBySize(c, "Concrete driveway cost by size", [[10, 20], [12, 24], [16, 20], [20, 20], [20, 24], [24, 24], [20, 40]],
    "A single-car driveway is commonly 10–12 ft wide and a double 20–24 ft. Removal of an old driveway is extra unless the rate includes it.")],
  "deck-cost-calculator": c => [costBySize(c, "Deck cost by size", [[10, 10], [10, 12], [12, 12], [12, 16], [16, 16], [16, 20], [20, 20]],
    "Pressure-treated, ground-level reference rate. Composite boards, height above grade, stairs and railings move the figure most.")],
  "construction-cost-calculator": c => {
    const v = { ...c.example.values, waste: 0 };
    return [chart("by-size", "By size", "Cost to build a house by size",
      `Construction at the reference $${num(c.low)}–$${num(c.high)} per square foot for a basic builder-grade home.`,
      ["Finished area", "Construction range"],
      [1000, 1500, 2000, 2500, 3000, 4000].map(a => [num(a) + " ft²", range(value("cost", { ...v, length: a, width: 1 }, "Planning range"))]),
      "Land, site preparation, utility connections and permits are not in these figures.")];
  },
  "concrete-cost-per-yard": c => {
    const v = { ...c.example.values, delivery: 0, removal: 0, other: 0, waste: 0 };
    const pours = [["10 × 10 ft slab", 10, 10, 4], ["12 × 12 ft slab", 12, 12, 4], ["20 × 20 ft slab", 20, 20, 4], ["24 × 24 ft slab", 24, 24, 4], ["20 × 20 ft slab", 20, 20, 6], ["12 × 60 ft driveway", 12, 60, 4]];
    return [
      chart("by-yards", "By yards", "Ready-mix cost by order size",
        `Concrete only, at $${c.low}–$${c.high} per cubic yard.`,
        ["Order", "Ready-mix range"],
        [1, 2, 3, 4, 5, 6, 8, 10].map(q => [`${q} yd³`, range(value("cost", { ...v, quantity: q }, "Planning range"))]),
        "Short-load fees on small orders and delivery can raise the effective price per yard. Installation is separate."),
      chart("by-pour", "Common pours", "How many yards common pours take",
        "Exact volume, then the same per-yard range. Order a little more: the volume below has no allowance for uneven ground.",
        ["Pour", "Thickness", "Concrete", "Ready-mix range"],
        pours.map(([name, l, w, t]) => { const yd = value("cubic-yard", { length: l, width: w, depth: t, waste: 0 }, "Volume with allowance");
          return [name, `${t} in`, num(yd, 2) + " yd³", range([yd * c.low, yd * c.high])]; }),
        "Suppliers usually sell in quarter- or half-yard steps; round the order up, not the geometry."),
    ];
  },
  "fence-installation-cost": c => {
    const v = { ...c.example.values, delivery: 0, removal: 0, other: 0, waste: 0 };
    const acre = 43560;
    const lots = [["¼-acre square lot", acre / 4], ["½-acre square lot", acre / 2], ["1-acre square lot", acre]];
    return [chart("by-length", "By length", "Fence installation cost by length",
      `New wood or vinyl fence at $${c.low}–$${c.high} per linear foot, before gates.`,
      ["Fence length", "Installed range"],
      [...[50, 100, 150, 200, 300].map(ft => [`${ft} ft`, range(value("cost", { ...v, quantity: ft }, "Planning range"))]),
        ...lots.map(([name, a]) => { const ft = 4 * Math.sqrt(a); return [`${name}, all four sides (${num(ft)} ft)`, range(value("cost", { ...v, quantity: ft }, "Planning range"))]; })],
      "Lot perimeters assume a perfect square; a long, narrow lot of the same area needs more fence.")];
  },
  "retaining-wall-cost": c => {
    const v = { ...c.example.values, delivery: 0, removal: 0, other: 0, waste: 0 };
    return [chart("by-size", "By size", "Retaining wall cost by length and height",
      `Exposed face area at $${c.low}–$${c.high} per square foot.`,
      ["Wall", "Face area", "Installed range"],
      [[10, 2], [20, 2], [20, 3], [30, 3], [50, 3], [50, 4]].map(([l, h]) => [`${l} ft long, ${h} ft high`, num(l * h) + " ft²", range(value("cost", { ...v, length: l, width: h }, "Planning range"))]),
      "Walls above about 4 ft commonly need engineering, which these rates do not include.")];
  },
  "roof-replacement-cost": c => {
    const v = { ...c.example.values, delivery: 0, removal: 0, other: 0, waste: 0 };
    return [chart("by-size", "By size", "Roof replacement cost by roof size",
      `Sloped roof area at $${c.low}–$${c.high} per square foot installed. One roofing square is 100 ft².`,
      ["Roof area", "Squares", "Installed range"],
      [1000, 1500, 1700, 2000, 2500, 3000].map(a => [num(a) + " ft²", num(a / 100), range(value("cost", { ...v, quantity: a }, "Planning range"))]),
      `Roof area, not floor area: a 1,500 ft² single-story home with 1-foot overhangs and a 6/12 roof has about ${num(Math.round(value("roofing", { area: 42 * 39.5, pitch: 6, waste: 0, bundleCoverage: 33.3333333333, price: 0 }, "Sloped roof area") / 50) * 50)} ft² of roof.`)];
  },

  "roof-pitch-calculator": c => [chart("chart", "Pitch chart", "Roof pitch chart",
    "Each pitch as an angle, a percent grade and the multiplier that turns a horizontal footprint into sloped roof area.",
    ["Pitch", "Angle", "Slope", "Multiplier"],
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(r => [`${r}/12`, num(value("roof-pitch", { rise: r, run: 12 }, "Angle"), 2) + "°", num(r / 12 * 100, 1) + "%", num(value("roof-pitch", { rise: r, run: 12 }, "Slope multiplier"), 3)]),
    "Below 2/12 most shingles are not rated; check the product’s minimum slope.")],
  "stair-calculator": c => {
    const v = c.example.values;
    return [chart("chart", "By rise", "Stair risers and run by total rise",
      `At a ${v.maxRiser}-inch maximum riser and ${v.treadDepth}-inch treads, the common residential limits.`,
      ["Total rise", "Risers", "Riser height", "Treads", "Total run"],
      [24, 36, 48, 60, 72, 84, 96, 108, 120].map(rise => { const x = { ...v, totalRise: rise };
        return [`${rise} in`, num(value("stair", x, "Risers")), num(value("stair", x, "Actual riser height"), 2) + " in", num(value("stair", x, "Treads")), num(value("stair", x, "Total run"), 2) + " ft"]; }),
      "Measure total rise from finished floor to finished floor. Your local code may set different limits.")];
  },
  "ramp-calculator": c => {
    const v = c.example.values;
    return [chart("chart", "By rise", "Ramp length by rise at 1:12",
      "The run each rise needs at the ADA 1:12 maximum slope, and the landings a straight ramp then requires.",
      ["Rise", "Ramp run", "Sloped length", "Intermediate landings"],
      [6, 12, 18, 24, 30, 36, 48].map(r => { const x = { ...v, rise: r, slope: 12 };
        return [`${r} in`, num(value("ramp", x, "Ramp run"), 1) + " ft", num(value("ramp", x, "Sloped length"), 2) + " ft", num(value("ramp", x, "Intermediate landings by rise"))]; }),
      "Top and bottom landings are always needed in addition. Geometry only, not a compliance check.")];
  },
  "board-foot-calculator": c => [chart("chart", "Common lumber", "Board feet in common lumber sizes",
    "One piece of each nominal size, the way a lumberyard quotes it.",
    ["Lumber", "Board feet"],
    [[1, 4, 8], [1, 6, 8], [2, 4, 8], [2, 4, 10], [2, 6, 8], [2, 6, 12], [2, 8, 12], [2, 10, 12], [2, 12, 16], [4, 4, 8], [6, 6, 8]].map(([t, w, l]) =>
      [`${t}×${w}×${l}`, num(value("board-foot", { thickness: t, width: w, length: l, pieces: 1, waste: 0 }, "Board feet per piece"), 2)]),
    "Nominal sizes: a 2×4 is counted as 2 × 4 in even though it measures 1½ × 3½.")],
  "cubic-feet-calculator": c => [
    chart("chart", "From inches", "Cubic feet of boxes measured in inches",
      "Common box and container sizes, converted from inches.",
      ["Box (L × W × H)", "Cubic feet", "US gallons"],
      [[12, 12, 12], [18, 18, 16], [24, 18, 18], [24, 24, 24], [36, 24, 24], [48, 40, 36]].map(([l, w, h]) => { const x = { length: l, width: w, height: h, unit: "in", waste: 0 };
        return [`${l} × ${w} × ${h} in`, num(value("cubic-feet", x, "Volume"), 2), num(value("cubic-feet", x, "US gallons"), 1)]; }),
      "A cubic foot is 12 × 12 × 12 inches, so divide cubic inches by 1,728."),
    chart("conversions", "Conversions", "One cubic foot in other units", "", ["Unit", "Equal to 1 ft³"],
      [["Cubic inches", "1,728"], ["Cubic yards", num(value("cubic-feet", { length: 1, width: 1, height: 1, unit: "ft", waste: 0 }, "Cubic yards"), 4)], ["Cubic metres", num(value("cubic-feet", { length: 1, width: 1, height: 1, unit: "ft", waste: 0 }, "Cubic metres"), 4)], ["US gallons", num(value("cubic-feet", { length: 1, width: 1, height: 1, unit: "ft", waste: 0 }, "US gallons"), 2)], ["Litres", num(value("cubic-feet", { length: 1, width: 1, height: 1, unit: "ft", waste: 0 }, "Litres"), 2)]], ""),
  ],
  "cubic-yard-calculator": c => {
    const depths = [2, 3, 4, 6];
    return [chart("chart", "By area & depth", "Cubic yards by area and depth",
      "Exact volume before any allowance. Find your area down the side and the depth across the top.",
      ["Area", ...depths.map(d => `${d} in deep`)],
      [100, 200, 300, 500, 1000, 2000].map(a => [num(a) + " ft²", ...depths.map(d => num(value("cubic-yard", { length: a, width: 1, depth: d, waste: 0 }, "Volume with allowance"), 2))]),
      "One cubic yard covers 324 ft² at 1 inch deep; divide 324 by the depth in inches for the coverage of a yard.")];
  },
  "feet-and-inches-calculator": c => [
    chart("chart", "Inches to feet", "Inches as decimal feet", "For entering a tape reading into anything that wants decimal feet.",
      ["Inches", "Decimal feet"],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => [`${i} in`, num(value("feet-inches", { aFeet: 0, aInches: i, operation: "add", bFeet: 0, bInches: 0 }, "Decimal feet"), 4)]), ""),
    chart("fractions", "Fractions", "Fractions of an inch as decimals", "The marks on a tape measure, in sixteenths.",
      ["Fraction", "Decimal inch"],
      [[1, 16], [1, 8], [3, 16], [1, 4], [5, 16], [3, 8], [7, 16], [1, 2], [9, 16], [5, 8], [11, 16], [3, 4], [13, 16], [7, 8], [15, 16]].map(([a, b]) => [`${a}/${b}`, num(a / b, 4)]), ""),
  ],
  "framing-calculator": c => {
    const v = { ...c.example.values, corners: 0, waste: 0 };
    return [chart("chart", "By wall length", "Studs per wall length",
      "Studs on layout for one straight wall with no openings, before corners and waste.",
      ["Wall length", "16 in on center", "24 in on center"],
      [8, 10, 12, 14, 16, 20, 24].map(l => [`${l} ft`, num(value("framing", { ...v, length: l, spacing: 16 }, "Studs on layout")), num(value("framing", { ...v, length: l, spacing: 24 }, "Studs on layout"))]),
      "Add two studs per corner or wall intersection, plus king, jack and cripple studs at every opening.")];
  },
  "rebar-calculator": c => {
    const v = { ...c.example.values, waste: 0 };
    return [chart("chart", "By slab size", "Rebar for common slab sizes",
      "Linear feet of bar for a single mat, both directions, at two common spacings.",
      ["Slab", "12 in grid", "18 in grid"],
      [[10, 10], [12, 12], [16, 16], [20, 20], [24, 24], [30, 30]].map(([l, w]) => [size(l, w), num(value("rebar", { ...v, length: l, width: w, spacing: 12 }, "Linear feet of rebar")) + " ft", num(value("rebar", { ...v, length: l, width: w, spacing: 18 }, "Linear feet of rebar")) + " ft"]),
      "No laps, bends or edge cover. Your plans set the spacing and bar size, not this table.")];
  },
  "brick-calculator": c => {
    const v = { ...c.example.values, waste: 0, area: 100 };
    const units = [["Modular brick", 7.625, 2.25], ["Standard brick", 8, 2.25], ["Queen brick", 7.625, 2.75], ["King brick", 9.625, 2.625], ["8 × 16 concrete block", 15.625, 7.625]];
    return [chart("chart", "Per square foot", "Bricks per square foot by size",
      "Single wythe, with a ⅜-inch mortar joint.",
      ["Unit", "Face size", "Per ft²", "Per 100 ft²"],
      units.map(([name, l, h]) => { const x = { ...v, unitLength: l, unitHeight: h, joint: 0.375 };
        return [name, `${l} × ${h} in`, num(value("brick", x, "Units per ft²"), 2), num(value("brick", x, "Units before waste"))]; }),
      "Face sizes are actual dimensions. Add 5–10% for breakage and cuts.")];
  },
  "sod-calculator": c => {
    const v = c.example.values;
    return [chart("chart", "By lawn size", "Sod rolls and pallets by lawn size",
      `Using ${v.rollArea} ft² rolls, ${v.perPallet} to a pallet, with a ${v.waste}% allowance for cuts.`,
      ["Lawn area", "Rolls", "Pallets"],
      [250, 500, 1000, 2000, 5000, 10000].map(a => [num(a) + " ft²", num(value("sod", { ...v, area: a }, "Rolls or slabs")), num(value("sod", { ...v, area: a }, "Pallets"))]),
      "Roll and pallet sizes vary by farm; check yours and recalculate.")];
  },
  "markup-calculator": c => [chart("chart", "Markup vs margin", "Markup vs margin",
    "The same profit stated two ways: as a share of your cost, and as a share of the price.",
    ["Markup", "Gross margin"],
    [10, 15, 20, 25, 30, 40, 50, 75, 100].map(m => [`${m}%`, num(value("markup", { cost: 100, markup: m }, "Gross margin"), 1) + "%"]),
    "To hit a target margin, markup = margin ÷ (1 − margin).")],
  "labor-cost-calculator": c => {
    const v = c.example.values;
    return [chart("chart", "Burdened rates", "Burdened hourly rate by wage",
      "What an hour of labor costs once payroll taxes, insurance and benefits are added.",
      ["Wage", "25% burden", "30% burden", "40% burden"],
      [18, 22, 25, 30, 35, 40, 50].map(w => [`$${w}/hr`, ...[25, 30, 40].map(b => "$" + num(value("labor-cost", { ...v, rate: w, burden: b }, "Burdened hourly rate"), 2))]),
      "Your real burden comes from your payroll and insurance costs, not this table.")];
  },
  "tank-volume-calculator": c => [chart("chart", "Gallons per foot", "Gallons per foot of height in round tanks",
    "Capacity of a vertical cylinder for every foot of depth.",
    ["Inside diameter", "Gallons per foot", "Litres per foot"],
    [12, 18, 24, 36, 48, 60, 72, 96].map(d => { const x = { shape: "cylinder", diameter: d, height: 12, length: 0, width: 0 };
      return [`${d} in`, num(value("tank-volume", x, "Capacity"), 1), num(value("tank-volume", x, "Litres"), 0)]; }),
    "Multiply by the liquid depth in feet. Horizontal tanks do not fill linearly.")],

  "drywall-calculator": c => {
    const v = { ...c.example.values, openings: 0 };
    return [chart("chart", "By room size", "How many sheets of drywall for a room",
      `4 × 8 sheets for a room with ${v.height}-foot walls, ${v.waste}% waste, no deduction for doors or windows.`,
      ["Room", "Walls only", "Walls and ceiling"],
      [[10, 10], [10, 12], [12, 12], [12, 14], [14, 16], [16, 20]].map(([l, w]) => [size(l, w), num(value("drywall", { ...v, length: l, width: w, ceiling: 0 }, "Drywall sheets to buy")), num(value("drywall", { ...v, length: l, width: w, ceiling: 1 }, "Drywall sheets to buy"))]),
      "4 × 12 sheets cut the count by about a third but are heavier to carry.")];
  },
  "paint-calculator": c => {
    const v = { ...c.example.values, openings: 0 };
    return [chart("chart", "By room size", "How much paint for a room",
      `Walls only, ${v.height}-foot ceilings, ${v.coats} coats at ${v.coverage} ft² per gallon, no deduction for doors or windows.`,
      ["Room", "Wall area", "Gallons"],
      [[10, 10], [10, 12], [12, 12], [12, 14], [14, 16], [16, 20]].map(([l, w]) => [size(l, w), num(value("paint", { ...v, length: l, width: w }, "Wall area")) + " ft²", num(value("paint", { ...v, length: l, width: w }, "Whole gallons to buy"))]),
      "Deduct about 20 ft² per door and 15 ft² per window, and check the coverage on your can.")];
  },
  "tile-calculator": c => {
    const v = { ...c.example.values, price: 0 };
    const tiles = [[12, 12], [12, 24], [24, 24], [6, 24], [3, 6]];
    return [chart("chart", "By tile size", "Tiles needed by area and tile size",
      `Whole tiles with a ${v.waste}% allowance for cuts and breakage.`,
      ["Area", ...tiles.map(([l, w]) => `${w} × ${l} in`)],
      [25, 50, 100, 150, 200].map(a => [num(a) + " ft²", ...tiles.map(([l, w]) => num(value("tile", { ...v, length: a, width: 1, pieceLength: l, pieceWidth: w, boxCount: 0 }, "Tiles to buy")))]),
      "Diagonal and herringbone layouts waste more; raise the allowance to 15%.")];
  },
  "paver-calculator": c => {
    const v = { ...c.example.values, price: 0 };
    const pavers = [[8, 4], [6, 6], [9, 6], [12, 12], [16, 16], [24, 24]];
    return [chart("chart", "Per 100 ft²", "Pavers per 100 square feet",
      `Whole pavers with a ${v.waste}% allowance, for each common size.`,
      ["Paver", "Per 100 ft²", "Per ft² before allowance"],
      pavers.map(([l, w]) => [`${w} × ${l} in`, num(value("paver", { ...v, length: 10, width: 10, pieceLength: l, pieceWidth: w }, "Pavers to buy")), num(144 / (l * w), 2)]),
      "Mixed-size patterns are sold by the square foot; use the manufacturer’s chart for those.")];
  },
  "deck-calculator": c => {
    const v = { ...c.example.values, price: 0 };
    return [chart("chart", "By deck size", "Deck boards for common deck sizes",
      `${v.boardLength}-foot boards, ${v.boardWidth} in wide with a ${v.gap}-inch gap, ${v.waste}% allowance. Boards run the length of the deck.`,
      ["Deck", "Boards"],
      [[10, 10], [12, 10], [12, 12], [16, 12], [16, 16], [20, 16], [20, 20]].map(([l, w]) => [size(l, w), num(value("deck", { ...v, length: l, width: w }, "Deck boards to buy"))]),
      "Surface boards only — framing, stairs, fascia and railings are separate.")];
  },
  "fence-calculator": c => {
    const v = c.example.values;
    return [chart("chart", "By fence length", "Posts, rails and pickets by fence length",
      `One straight run with posts every ${v.spacing} ft, ${v.rails} rails per section and ${v.boardWidth}-inch pickets set tight, ${v.waste}% extra pickets.`,
      ["Length", "Posts", "Rails", "Pickets"],
      [25, 50, 75, 100, 150, 200].map(l => { const x = { ...v, length: l };
        return [`${l} ft`, num(value("fence", x, "Posts for one straight run")), num(value("fence", x, "Horizontal rails")), num(value("fence", x, "Pickets to buy"))]; }),
      "Each corner and gate adds posts; a shared corner post serves both runs.")];
  },
  "retaining-wall-calculator": c => {
    const v = { ...c.example.values, waste: 0 };
    return [chart("chart", "By wall size", "Retaining wall blocks by wall size",
      `${v.blockLength} × ${v.blockHeight}-inch block face, with ${v.buried} buried course.`,
      ["Wall length", "2 ft high", "3 ft high", "4 ft high"],
      [10, 20, 30, 40, 50].map(l => [`${l} ft`, ...[2, 3, 4].map(h => num(value("retaining-wall", { ...v, length: l, height: h }, "Wall blocks to buy")))]),
      "Straight, level walls. Caps are counted separately; curves and steps change the count.")];
  },
  "roofing-calculator": c => {
    const v = { ...c.example.values, waste: 0 };
    const pitches = [4, 6, 8, 10];
    return [chart("chart", "By footprint & pitch", "Roofing squares by footprint and pitch",
      "Sloped roof area in squares (100 ft²) for a footprint measured with its overhangs, before waste.",
      ["Footprint", ...pitches.map(p => `${p}/12`)],
      [1000, 1500, 2000, 2500, 3000].map(a => [num(a) + " ft²", ...pitches.map(p => num(value("roofing", { ...v, area: a, pitch: p }, "Roofing squares with waste"), 1))]),
      "Add 10–15% waste for a simple gable and more for hips and valleys. Three bundles cover a square for most shingles.")];
  },
  "board-and-batten-calculator": c => {
    const v = c.example.values;
    const spaces = [4, 5, 6, 8];
    return [chart("chart", "By wall width", "Space between battens by wall width",
      `Clear gap for ${v.boardWidth}-inch battens with one at each end.`,
      ["Wall width", ...spaces.map(s => `${s} spaces`)],
      [72, 96, 120, 144, 168, 192].map(w => [`${w} in`, ...spaces.map(s => { try { return num(value("board-and-batten", { ...v, width: w, spaces: s }, "Clear space between battens"), 2) + " in"; } catch { return "–"; } })]),
      "Most layouts aim for 12–24 inches between battens. Pick the column that lands closest.")];
  },
};

function chartsFor(c) {
  return BUILD[c.slug] ? BUILD[c.slug](c) : [];
}

module.exports = { chartsFor, CHART_PAGES: Object.keys(BUILD) };
