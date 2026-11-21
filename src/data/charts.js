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
      "Top and bottom landings are always required in addition; verify local ADA/IRC amendments.")];
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
      [["Cubic inches", "1,728"], ["Cubic yards", num(value("cubic-feet", { length: 1, width: 1, height: 1, unit: "ft", waste: 0 }, "Cubic yards"), 4)], ["Cubic meters", num(value("cubic-feet", { length: 1, width: 1, height: 1, unit: "ft", waste: 0 }, "Cubic meters"), 4)], ["US gallons", num(value("cubic-feet", { length: 1, width: 1, height: 1, unit: "ft", waste: 0 }, "US gallons"), 2)], ["Liters", num(value("cubic-feet", { length: 1, width: 1, height: 1, unit: "ft", waste: 0 }, "Liters"), 2)]], ""),
  ],
  "cubic-yard-calculator": c => {
    const depths = [2, 3, 4, 6];
    return [chart("chart", "By area & depth", "Cubic yards by area and depth",
      "Exact volume before any allowance. Find your area down the side and the depth across the top.",
      ["Area", ...depths.map(d => `${d} in deep`)],
      [100, 200, 300, 500, 1000, 2000].map(a => [num(a) + " ft²", ...depths.map(d => num(value("cubic-yard", { length: a, width: 1, depth: d, waste: 0 }, "Volume with allowance"), 2))]),
      "One cubic yard covers 324 ft² at 1 inch deep; divide 324 by the depth in inches for the coverage of a yard."),
    chart("coverage", "Coverage of 1 yd³", "How much area one cubic yard covers",
      "Read this when the material is sold by the yard and you want to know how far one load goes.",
      ["Depth", "Area covered by 1 yd³", "Square patch"],
      [1, 2, 3, 4, 5, 6, 8, 10, 12].map(d => [d + " in", num(324 / d, 1) + " ft²", "about " + num(Math.sqrt(324 / d), 1) + " × " + num(Math.sqrt(324 / d), 1) + " ft"]),
      "At 3 inches, typical for mulch and gravel paths, one yard covers 108 ft². At 4 inches, typical for a concrete slab, it covers 81 ft².")];
  },
  "feet-and-inches-calculator": c => [
    chart("chart", "Inches to decimal ft", "Inches to decimal feet & metric chart", "Quick reference for converting tape-measure inches (1–12 in) directly to decimal feet, centimeters and millimeters.",
      ["Inches", "Decimal feet", "Centimeters", "Millimeters"],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => [`${i} in`, num(i / 12, 4) + " ft", num(i * 2.54, 2) + " cm", num(i * 25.4, 1) + " mm"]),
      "Divide any inch reading by 12 for decimal feet (for example, 5 in = 0.4167 ft and 10 in = 0.8333 ft)."),
    chart("fractions", "Fractions chart", "Fractions of an inch in decimals & feet", "Every 1/16-inch mark on a standard US tape measure converted to decimal inches, decimal feet and millimeters.",
      ["Fraction", "Decimal inch", "Decimal feet", "Millimeters"],
      [[1, 16], [1, 8], [3, 16], [1, 4], [5, 16], [3, 8], [7, 16], [1, 2], [9, 16], [5, 8], [11, 16], [3, 4], [13, 16], [7, 8], [15, 16]].map(([a, b]) => [`${a}/${b} in`, num(a / b, 4), num((a / b) / 12, 5) + " ft", num((a / b) * 25.4, 2) + " mm"]), ""),
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
    ["Inside diameter", "Gallons per foot", "Liters per foot"],
    [12, 18, 24, 36, 48, 60, 72, 96].map(d => { const x = { shape: "cylinder", diameter: d, height: 12, length: 0, width: 0 };
      return [`${d} in`, num(value("tank-volume", x, "Capacity"), 1), num(value("tank-volume", x, "Liters"), 0)]; }),
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

  /* Previously chartless existing pages */
  "flooring-calculator": c => {
    const v = { ...c.example.values, boxCoverage: 20, waste: 10, price: 0 };
    return [chart("chart", "By room size", "Flooring and boxes needed by room size",
      "Includes 10% straight-lay waste and boxes at 20 ft² and 24 ft² per carton.",
      ["Room size", "Sq ft (+10%)", "20 ft² boxes", "24 ft² boxes"],
      [[10, 10], [10, 12], [12, 12], [12, 15], [14, 16], [16, 20]].map(([l, w]) => [
        size(l, w),
        num(value("flooring", { ...v, length: l, width: w }, "Flooring to buy")) + " ft²",
        num(value("flooring", { ...v, length: l, width: w, boxCoverage: 20 }, "Boxes to buy")),
        num(value("flooring", { ...v, length: l, width: w, boxCoverage: 24 }, "Boxes to buy")),
      ]),
      "Raise waste to 15% for diagonal or complex rooms.")];
  },
  "carpet-calculator": c => {
    const v = { ...c.example.values, rollWidth: 12, waste: 10, price: 0 };
    return [chart("chart", "By room size", "Carpet square yards by room size",
      "With 10% allowance, showing whether a standard 12-foot roll spans without a seam.",
      ["Room", "Area", "Carpet (+10%)", "12 ft roll seams"],
      [[10, 10], [10, 12], [12, 12], [12, 15], [14, 16], [16, 20]].map(([l, w]) => [
        size(l, w), num(l * w) + " ft²",
        num(value("carpet", { ...v, length: l, width: w }, "Carpet to order"), 1) + " yd²",
        num(value("carpet", { ...v, length: l, width: w }, "Seams")),
      ]),
      "Rooms wider than 12 ft in both directions need a seam or a 15-foot roll.")];
  },
  "wallpaper-calculator": c => {
    const v = { ...c.example.values, height: 8, rollWidth: 20.5, rollLength: 33, repeat: 0, trim: 4, waste: 10, price: 0 };
    return [chart("chart", "By room size", "Wallpaper double rolls by room size",
      "Standard 20.5 in × 33 ft US double rolls, 8-foot ceilings, 10% spare strips.",
      ["Room (perimeter)", "No repeat", "12 in repeat", "24 in repeat"],
      [[10, 10], [10, 12], [12, 12], [12, 14], [14, 16]].map(([l, w]) => {
        const per = 2 * (l + w);
        return [`${l}×${w} ft (${per} ft)`,
          num(value("wallpaper", { ...v, wallWidth: per, repeat: 0 }, "Rolls to buy")) + " rolls",
          num(value("wallpaper", { ...v, wallWidth: per, repeat: 12 }, "Rolls to buy")) + " rolls",
          num(value("wallpaper", { ...v, wallWidth: per, repeat: 24 }, "Rolls to buy")) + " rolls"];
      }),
      "Large pattern repeats reduce usable strips per roll; always enter your label's repeat.")];
  },
  "pool-volume-calculator": c => [
    chart("chart", "Common pools", "Gallons in common swimming pool sizes",
      "Estimated water volume assuming 4 ft depth for round above-ground pools and 4.75 ft average depth for rectangular inground pools.",
      ["Pool size", "Shape", "Avg depth", "Gallons"],
      [
        ["15 ft round", "Round", "4.0 ft", num(value("pool", { shape: "round", diameter: 15, shallow: 4, deep: 4 }, "Pool volume")) + " gal"],
        ["18 ft round", "Round", "4.0 ft", num(value("pool", { shape: "round", diameter: 18, shallow: 4, deep: 4 }, "Pool volume")) + " gal"],
        ["24 ft round", "Round", "4.0 ft", num(value("pool", { shape: "round", diameter: 24, shallow: 4, deep: 4 }, "Pool volume")) + " gal"],
        ["12 × 24 ft", "Rectangle", "4.5 ft", num(value("pool", { shape: "rectangle", length: 24, width: 12, shallow: 3.5, deep: 5.5 }, "Pool volume")) + " gal"],
        ["16 × 32 ft", "Rectangle", "4.75 ft", num(value("pool", { shape: "rectangle", length: 32, width: 16, shallow: 3.5, deep: 6 }, "Pool volume")) + " gal"],
        ["20 × 40 ft", "Rectangle", "5.5 ft", num(value("pool", { shape: "rectangle", length: 40, width: 20, shallow: 3.5, deep: 7.5 }, "Pool volume")) + " gal"],
      ],
      "Use actual water depth to the skimmer waterline, not wall height."),
  ],
  "linear-feet-calculator": c => [
    chart("chart", "Sq ft to linear ft", "Linear feet per 100 square feet by board width",
      "Based on actual exposed board face width, before cutting waste.",
      ["Actual board width", "Linear ft per 1 ft²", "Linear ft per 100 ft²"],
      [2.5, 3.5, 5.5, 7.25, 9.25, 11.25].map(w => [
        `${w} in`,
        num(value("linear-feet", { mode: "area", area: 1, boardWidth: w, waste: 0 }, "Linear feet"), 2) + " ft",
        num(value("linear-feet", { mode: "area", area: 100, boardWidth: w, waste: 0 }, "Linear feet"), 1) + " ft",
      ]),
      "Add 10% for end cuts and board defects."),
  ],
  "concrete-block-calculator": c => {
    const v = { ...c.example.values, waste: 5 };
    return [chart("chart", "By wall size", "Concrete blocks (8×8×16 CMU) by wall size",
      "Includes ⅜-inch mortar joints and 5% breakage allowance (1.125 blocks/ft² before waste).",
      ["Wall size", "Area", "Blocks (+5%)", "80 lb mortar bags"],
      [[10, 8], [20, 8], [25, 8], [30, 8], [40, 8], [50, 10]].map(([l, h]) => {
        const a = l * h;
        const blocks = value("brick", { ...v, area: a }, "Units to buy");
        return [`${l} × ${h} ft`, `${a} ft²`, num(blocks), num(value("mortar", { unitType: "block", units: blocks, bagSize: 80, waste: 0 }, "80 lb mortar bags"))];
      }),
      "Swap standard blocks for corner, half, or lintel units where needed.")];
  },
  "siding-calculator": c => [
    chart("chart", "By house size", "Siding for a single-story house by footprint",
      "9-ft walls and two gables on the short sides at a 6/12 roof pitch, before subtracting doors and windows; includes 10% waste. Vinyl is boxed at 2 squares (200 ft²) per carton.",
      ["House footprint", "Walls + gables", "Order (+10%)", "Siding squares", "2-sq vinyl boxes"],
      [[30, 20], [40, 25], [40, 30], [50, 30], [60, 30], [60, 40]].map(([l, w]) => {
        const v = { perimeter: 2 * (l + w), wallHeight: 9, gables: 2, gableBase: w, gableHeight: w / 4, doors: 0, windows: 0, doorArea: 20, windowArea: 15, waste: 10 };
        const gross = value("siding", v, "Wall area") + value("siding", v, "Gable area");
        const sq = value("siding", v, "Siding squares");
        return [`${l} × ${w} ft`, `${num(gross)} ft²`, `${num(gross * 1.1)} ft²`, num(sq, 1), num(Math.ceil(sq / 2))];
      }),
      "Subtract roughly 20 ft² per door and 15 ft² per window, and use 15% waste on homes with several gables or dormers."),
  ],
  "asphalt-driveway-cost": c => [costBySize(c, "Asphalt driveway cost by size", [[10, 20], [12, 40], [12, 50], [20, 30], [20, 40], [24, 50]],
    "New residential hot-mix asphalt at $6–$9/ft² including compacted gravel base, before old-pavement removal.")],
  "laminate-flooring-installation-cost": c => [costBySize(c, "Laminate flooring installed cost by room size", [[10, 12], [12, 15], [15, 20], [20, 25], [25, 40]],
    "Materials and installation labor at $5–$12/ft², before old-floor demolition and baseboards.")],

  /* Phase 4 Expansion Charts */
  "gutter-size-calculator": c => [
    chart("chart", "Sizing table", "Gutter size by roof area and rainfall rate",
      "6/12 roof pitch (1.10 multiplier) using SMACNA K-style capacity guidelines.",
      ["Roof area", "Moderate rain (4 in/hr)", "Heavy storm (6 in/hr)", "3×4 in downspouts (4 in/hr)"],
      [600, 1000, 1400, 1800, 2400].map(a => [
        `${num(a)} ft²`,
        `${value("gutter-size", { area: a, pitch: 6, rainfall: 4 }, "Recommended K-style gutter")} in`,
        `${value("gutter-size", { area: a, pitch: 6, rainfall: 6 }, "Recommended K-style gutter")} in`,
        num(value("gutter-size", { area: a, pitch: 6, rainfall: 4 }, "3 × 4 in downspouts needed")),
      ]),
      "Step up to 6-inch gutters wherever a steep roof valley dumps concentrated runoff."),
  ],
  "concrete-steps-calculator": c => [
    chart("chart", "By step count", "Concrete needed for 4-foot-wide steps",
      "7-inch risers, 11-inch treads, 36-inch top landing, including 10% waste.",
      ["Steps", "Total height", "Cubic yards", "80 lb bags"],
      [2, 3, 4, 5, 6].map(n => {
        const x = { stepCount: n, stepWidth: 4, riserHeight: 7, treadDepth: 11, platformDepth: 36, waste: 10 };
        return [`${n} steps`, `${n * 7} in`, num(value("concrete-steps", x, "Concrete needed"), 2) + " yd³", num(value("concrete-steps", x, "80 lb concrete bags"))];
      }),
      "Above 1 cubic yard, ready-mix delivery avoids cold joints."),
  ],
  "sonotube-calculator": c => [
    chart("chart", "Bags per tube", "Concrete per 4-foot-deep Sonotube (with 10% waste)",
      "Single round pier footing—multiply by total number of deck posts.",
      ["Tube diameter", "Cubic feet", "80 lb bags", "60 lb bags"],
      [8, 10, 12, 14, 16, 18].map(d => {
        const x = { diameter: d, depth: 4, tubes: 1, waste: 10 };
        return [`${d} in`, num(value("sonotube", x, "Total cubic feet"), 2) + " ft³", num(value("sonotube", x, "80 lb bags")), num(value("sonotube", x, "60 lb bags"))];
      }),
      "Extend footings below your local county frost line."),
  ],
  "fence-post-concrete-calculator": c => [
    chart("chart", "By post count", "50 lb fast-setting bags by post count",
      "4×4 wood posts in 10-inch diameter holes, 24 inches deep, with 10% extra.",
      ["Posts", "50 lb bags", "60 lb bags", "80 lb bags"],
      [5, 10, 15, 20, 25, 30].map(p => [
        `${p} posts`,
        num(value("fence-post-concrete", { posts: p, postType: "4x4", holeDiameter: 10, holeDepth: 24, bagSize: 50, waste: 10 }, "50 lb bags to buy")),
        num(value("fence-post-concrete", { posts: p, postType: "4x4", holeDiameter: 10, holeDepth: 24, bagSize: 60, waste: 10 }, "60 lb bags to buy")),
        num(value("fence-post-concrete", { posts: p, postType: "4x4", holeDiameter: 10, holeDepth: 24, bagSize: 80, waste: 10 }, "80 lb bags to buy")),
      ]),
      "Deep 30–36 inch frost-line holes need ~25–50% more bags."),
  ],
  "concrete-bag-calculator": c => [
    chart("chart", "By slab size", "80 lb and 60 lb concrete bags for 4-inch pads",
      "Includes 10% extra for uneven ground and spillage.",
      ["Pad size", "80 lb bags", "60 lb bags", "Cubic yards"],
      [[4, 4], [4, 8], [6, 8], [8, 8], [10, 10], [10, 12]].map(([l, w]) => {
        const x = { mode: "slab", length: l, width: w, thickness: 4, bagSize: 80, waste: 10 };
        return [size(l, w), num(value("concrete-bag", x, "80 lb bags")), num(value("concrete-bag", x, "60 lb bags")), num(value("concrete-bag", x, "Cubic yards"), 2) + " yd³"];
      }),
      "One full pallet holds 42 bags of 80 lb or 56 bags of 60 lb concrete."),
  ],
  "mortar-calculator": c => [
    chart("chart", "By unit count", "Mortar bags needed for bricks and CMU blocks",
      "Includes 10% allowance for standard ⅜-inch mortar joints.",
      ["Quantity", "Modular bricks (80 lb)", "Modular bricks (60 lb)", "8×8×16 CMU blocks (80 lb)"],
      [100, 250, 500, 1000, 2000].map(u => [
        num(u),
        num(value("mortar", { unitType: "brick", units: u, bagSize: 80, waste: 10 }, "80 lb mortar bags")) + " bags",
        num(value("mortar", { unitType: "brick", units: u, bagSize: 60, waste: 10 }, "60 lb mortar bags")) + " bags",
        num(value("mortar", { unitType: "block", units: u, bagSize: 80, waste: 10 }, "80 lb mortar bags")) + " bags",
      ]),
      "Use Type N above grade and Type S below grade or for structural block."),
  ],
  "self-leveling-concrete-calculator": c => [
    chart("chart", "By floor area", "50 lb self-leveling bags by area and depth",
      "Based on 25 ft² per 50 lb bag at ¼ inch deep, including 10% safety buffer.",
      ["Floor area", "⅛ in deep", "¼ in deep", "½ in deep"],
      [50, 100, 200, 300, 500].map(a => [
        `${num(a)} ft²`,
        num(value("self-leveling", { area: a, depth: 0.125, bagCoverage: 25, waste: 10 }, "50 lb bags to buy")) + " bags",
        num(value("self-leveling", { area: a, depth: 0.25, bagCoverage: 25, waste: 10 }, "50 lb bags to buy")) + " bags",
        num(value("self-leveling", { area: a, depth: 0.5, bagCoverage: 25, waste: 10 }, "50 lb bags to buy")) + " bags",
      ]),
      "Always roll floor primer before pouring self-leveling underlayment."),
  ],
  "plywood-calculator": c => [
    chart("chart", "By area", "4×8 plywood / OSB sheets by area",
      "Standard 32 ft² sheets, shown exact and with 10% cutting waste.",
      ["Surface area", "Exact sheets", "With 10% waste"],
      [100, 200, 400, 800, 1000, 1500, 2000].map(a => [
        `${num(a)} ft²`,
        num(value("plywood", { length: a, width: 1, sheetArea: 32, waste: 0 }, "Sheets to buy")),
        num(value("plywood", { length: a, width: 1, sheetArea: 32, waste: 10 }, "Sheets to buy")),
      ]),
      "Stagger end joints across joists or rafters and leave ⅛-inch spacing on sheathing."),
  ],
  "metal-roofing-calculator": c => [
    chart("chart", "By roof size", "36-inch metal roof panels by footprint (6/12 pitch)",
      "12-foot panels (36 ft² coverage each) including 10% waste.",
      ["Footprint", "Sloped area", "36\"×12 ft panels", "Screws"],
      [1000, 1500, 2000, 2500, 3000].map(a => {
        const x = { area: a, pitch: 6, panelWidth: 36, panelLength: 12, waste: 10 };
        return [`${num(a)} ft²`, `${num(value("metal-roofing", x, "Sloped roof area"))} ft²`, num(value("metal-roofing", x, "Metal panels to buy")), num(value("metal-roofing", x, "Fasteners (exposed-screw)"))];
      }),
      "Standing-seam 16-inch panels use concealed clips instead of exposed screws."),
  ],
  "baluster-spacing-calculator": c => [
    chart("chart", "Common railings", "Baluster count and exact gap by opening length",
      "Sized under the 4-inch IRC code limit for 1.5-inch wood 2×2 balusters and 0.75-inch metal balusters.",
      ["Opening", "Wood (1.5\") count & gap", "Metal (0.75\") count & gap"],
      [4, 5, 6, 7, 8].map(l => {
        const w = { length: l, balusterWidth: 1.5, maxGap: 4 };
        const m = { length: l, balusterWidth: 0.75, maxGap: 4 };
        return [`${l} ft (${l * 12} in)`,
          `${num(value("baluster-spacing", w, "Balusters needed"))} @ ${num(value("baluster-spacing", w, "Clear gap between balusters"), 2)}"`,
          `${num(value("baluster-spacing", m, "Balusters needed"))} @ ${num(value("baluster-spacing", m, "Clear gap between balusters"), 2)}"`];
      }),
      "Every clear gap stays strictly under 4.00 inches."),
  ],
  "wainscoting-calculator": c => [
    chart("chart", "By wall width", "Wainscoting clear panel width (3.5 in stiles)",
      "Full vertical stile at each wall edge.",
      ["Wall width", "4 panels", "5 panels", "6 panels"],
      [96, 120, 144, 168, 192].map(w => [
        `${w} in (${w / 12} ft)`,
        ...[4, 5, 6].map(p => num(value("wainscoting", { width: w, panels: p, stileWidth: 3.5, height: 36 }, "Clear panel width"), 2) + " in"),
      ]),
      "Target 18–28 inches per panel opening for classic dining-room proportions."),
  ],
  "baseboard-calculator": c => [
    chart("chart", "By room size", "Baseboard linear feet and 12-foot boards by room size",
      "Subtracts two 3-foot doorways and includes 10% corner-cut waste.",
      ["Room", "Perimeter", "Net + 10%", "12 ft boards"],
      [[10, 10], [10, 12], [12, 14], [14, 16], [16, 20]].map(([l, w]) => {
        const p = 2 * (l + w);
        const x = { length: p, doors: 2, doorWidth: 3, boardLength: 12, waste: 10 };
        return [size(l, w), `${p} ft`, num(value("baseboard", x, "Total linear feet with waste"), 1) + " ft", num(value("baseboard", x, "Trim boards to buy"))];
      }),
      "Use 16-foot stock on walls longer than 12 feet to eliminate mid-wall splices."),
  ],
  "crown-molding-calculator": c => [
    chart("chart", "By room size", "Crown molding 12-foot boards by room size",
      "Includes 4 corners and 15% miter/coping waste.",
      ["Room", "Perimeter", "Order (+15%)", "12 ft boards"],
      [[10, 10], [10, 12], [12, 14], [14, 16], [16, 20]].map(([l, w]) => {
        const p = 2 * (l + w);
        const x = { length: p, corners: 4, boardLength: 12, waste: 15 };
        return [size(l, w), `${p} ft`, num(value("crown-molding", x, "Linear feet with miter waste"), 1) + " ft", num(value("crown-molding", x, "Molding boards to buy"))];
      }),
      "Add 2 corners for every soffit or closet jog."),
  ],
  "deck-stain-calculator": c => [
    chart("chart", "By deck size", "Gallons of deck stain by deck size (floor only)",
      "Average semi-transparent stain at 200 ft²/gal.",
      ["Deck size", "1 coat", "2 coats"],
      [[10, 12], [12, 16], [14, 18], [16, 20], [20, 20]].map(([l, w]) => [
        `${l}×${w} ft (${l * w} ft²)`,
        num(value("deck-stain", { area: l * w, railLength: 0, coverage: 200, coats: 1 }, "Stain to buy")) + " gal",
        num(value("deck-stain", { area: l * w, railLength: 0, coverage: 200, coats: 2 }, "Stain to buy")) + " gal",
      ]),
      "Add 1–2 extra gallons when staining railings, spindles and stairs."),
  ],
  "exterior-paint-calculator": c => [
    chart("chart", "By wall area", "Exterior house paint gallons (2 coats + 10%)",
      "Comparing smooth fiber-cement/wood vs. textured stucco.",
      ["Net wall area", "Lap siding (300 ft²/gal)", "Stucco (200 ft²/gal)"],
      [1000, 1500, 2000, 2500, 3000].map(a => [
        `${num(a)} ft²`,
        num(value("exterior-paint", { area: a, openings: 0, coverage: 300, coats: 2, waste: 10 }, "Exterior paint to buy")) + " gal",
        num(value("exterior-paint", { area: a, openings: 0, coverage: 200, coats: 2, waste: 10 }, "Exterior paint to buy")) + " gal",
      ]),
      "Trim, fascia and doors are ordered separately in semi-gloss or satin."),
  ],
  "raised-bed-soil-calculator": c => [
    chart("chart", "Common beds", "Soil needed for popular raised garden beds (12 in deep)",
      "Cubic feet, bulk cubic yards, and 1.5 cu ft / 2 cu ft bags.",
      ["Bed size", "Cubic feet", "Cubic yards", "1.5 ft³ bags", "2 ft³ bags"],
      [[4, 4], [3, 6], [4, 8], [4, 10], [4, 12]].map(([w, l]) => {
        const x = { length: l, width: w, depth: 12, beds: 1, bagSize: 1.5 };
        return [`${w} × ${l} ft`, num(value("raised-bed", x, "Soil needed"), 0) + " ft³", num(value("raised-bed", x, "Cubic yards"), 2) + " yd³", num(value("raised-bed", x, "1.5 ft³ bags")), num(value("raised-bed", x, "2 ft³ bags equivalent"))];
      }),
      "Multiply by bed count if building multiple identical beds."),
  ],
  "grass-seed-calculator": c => [
    chart("chart", "Seeding rates", "Grass seed per 1,000 sq ft and per 5,000 sq ft",
      "Recommended pounds of pure seed (before 5% overlap margin).",
      ["Grass variety", "New lawn / 1,000 ft²", "Overseed / 1,000 ft²", "New 5,000 ft² lawn"],
      [
        ["Tall Fescue", "tall-fescue"], ["Kentucky Bluegrass", "kentucky-bluegrass"],
        ["Perennial Ryegrass", "perennial-rye"], ["Fine Fescue (shade)", "fine-fescue"],
        ["Bermuda", "bermuda"], ["Zoysia", "zoysia"],
      ].map(([label, key]) => [
        label,
        num(value("grass-seed", { area: 1000, grassType: key, jobType: "new", waste: 0 }, "Grass seed needed"), 1) + " lb",
        num(value("grass-seed", { area: 1000, grassType: key, jobType: "overseed", waste: 0 }, "Grass seed needed"), 1) + " lb",
        num(value("grass-seed", { area: 5000, grassType: key, jobType: "new", waste: 0 }, "Grass seed needed"), 0) + " lb",
      ]),
      "Check bag labels for coated seed, which requires higher total bag weight."),
  ],
  "cubic-yards-to-tons-calculator": c => [
    chart("chart", "Weight chart", "Cubic yards to tons for common bulk materials",
      "Loose delivered weights—multiply by your order volume.",
      ["Material", "1 yd³ in tons", "5 yd³ in tons", "10 yd³ in tons"],
      [
        ["Bark mulch", 800], ["Compost", 1000], ["Screened topsoil / fill dirt", 2000],
        ["Crushed stone #57 / dry sand", 2700], ["Gravel / pea gravel", 2800],
        ["Crusher run / road base", 3000], ["Wet sand", 3240], ["Hot-mix asphalt", 3915],
      ].map(([label, d]) => [
        label,
        num(value("yards-to-tons", { mode: "yd-to-ton", amount: 1, density: d }, "US tons"), 2) + " t",
        num(value("yards-to-tons", { mode: "yd-to-ton", amount: 5, density: d }, "US tons"), 1) + " t",
        num(value("yards-to-tons", { mode: "yd-to-ton", amount: 10, density: d }, "US tons"), 1) + " t",
      ]),
      "1 US short ton = 2,000 lb."),
  ],
  "btu-calculator": c => [
    chart("chart", "Room size chart", "Cooling BTU and mini-split size by square footage",
      "8-foot ceilings, moderate climate, average sun, 2 occupants (ENERGY STAR baseline).",
      ["Room size", "Cooling BTU", "AC tons", "Suggested mini-split"],
      [150, 250, 350, 500, 750, 1000, 1500].map(a => {
        const x = { area: a, ceilingHeight: 8, climate: 1.0, sun: 1.0, occupants: 2, kitchen: 0 };
        return [`${num(a)} ft²`, num(value("btu", x, "Cooling capacity needed")) + " BTU", num(value("btu", x, "AC tonnage"), 2) + " t", num(value("btu", x, "Suggested mini-split size")) + " BTU"];
      }),
      "Add 10% for sunny south/west rooms or 4,000 BTU for kitchens."),
  ],
  "firewood-calculator": c => [
    chart("chart", "Cord chart", "Firewood cord sizes at 16-inch log length",
      "A legal US full cord is 128 ft³ tightly stacked.",
      ["Stack (L × H × log)", "Volume", "Full cords", "Face cords"],
      [[8, 4, 16], [12, 4, 16], [16, 4, 16], [24, 4, 16], [8, 4, 48]].map(([l, h, log]) => {
        const x = { length: l, height: h, logLength: log };
        return [`${l} × ${h} ft (${log}\" logs)`, num(value("firewood", x, "Stacked volume"), 1) + " ft³", num(value("firewood", x, "Full cords"), 2), num(value("firewood", x, "Face cords (ricks)"), 2)];
      }),
      "Seasoned hardwood (oak, maple, ash) delivers ~20–24 million BTU per full cord."),
  ],
  "water-heater-size-calculator": c => [
    chart("chart", "Household guide", "Water heater size by household size",
      "Typical First Hour Rating (FHR) and tankless GPM at 55°F inlet water.",
      ["Household", "Peak FHR", "Typical tank", "Tankless GPM"],
      [[1, 1, 0], [2, 1, 1], [3, 2, 0], [4, 2, 1], [6, 2, 2]].map(([p, s, a]) => {
        const x = { people: p, showers: s, appliances: a, groundTemp: 55 };
        return [`${p} ${p === 1 ? "person" : "people"}`, num(value("water-heater", x, "Tank First Hour Rating (FHR)")) + " FHR", num(value("water-heater", x, "Typical storage tank size")) + " gal", num(value("water-heater", x, "Tankless flow needed"), 1) + " GPM"];
      }),
      "Gas tanks recover faster than electric tanks of the same gallon size."),
  ],
  "dehumidifier-size-calculator": c => [
    chart("chart", "Sizing chart", "Dehumidifier pint capacity by room size (2019 DOE standard)",
      "Recommended pints removed per 24 hours.",
      ["Area", "Moderately damp", "Very damp", "Wet"],
      [500, 1000, 1500, 2000, 2500].map(a => [
        `${num(a)} ft²`,
        num(value("dehumidifier", { area: a, dampness: "moderate" }, "Dehumidifier capacity")) + " pt",
        num(value("dehumidifier", { area: a, dampness: "very" }, "Dehumidifier capacity")) + " pt",
        num(value("dehumidifier", { area: a, dampness: "wet" }, "Dehumidifier capacity")) + " pt",
      ]),
      "For spaces over 1,500 ft², choose a unit with a gravity hose or built-in pump."),
  ],
  "bathroom-fan-cfm-calculator": c => [
    chart("chart", "CFM chart", "Bathroom exhaust fan CFM by room size (8 ft ceilings)",
      "Minimum HVI airflow and recommended duct size.",
      ["Bathroom", "Area", "Minimum CFM", "Duct diameter"],
      [[5, 8], [6, 9], [8, 10], [10, 10], [10, 12], [12, 14]].map(([w, l]) => {
        const x = { length: l, width: w, height: 8, fixtures: l * w > 100 ? 3 : 2, jettedTub: 0 };
        return [size(w, l), `${w * l} ft²`, num(value("bathroom-fan", x, "Minimum fan airflow")) + " CFM", num(value("bathroom-fan", x, "Recommended duct diameter")) + " in"];
      }),
      "Add 100 CFM for a jetted soaking tub in bathrooms larger than 100 ft²."),
  ],
  "acreage-calculator": c => [
    chart("chart", "Acre equivalents", "Common lot sizes in square feet, acres and perimeter",
      "Perimeter shown for a square parcel of each size.",
      ["Acreage", "Square feet", "Square dimension", "Perimeter"],
      [0.25, 0.5, 1, 2, 5, 10].map(ac => {
        const s = Math.sqrt(ac * 43560);
        return [`${ac} acre${ac === 1 ? "" : "s"}`, num(ac * 43560) + " ft²", `${num(s, 1)} × ${num(s, 1)} ft`, num(s * 4, 0) + " ft"];
      }),
      "Rectangular lots have longer perimeters than square lots of the same acreage."),
  ],
};

function chartsFor(c) {
  return BUILD[c.slug] ? BUILD[c.slug](c) : [];
}

module.exports = { chartsFor, CHART_PAGES: Object.keys(BUILD) };
