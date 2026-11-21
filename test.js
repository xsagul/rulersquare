const { calc } = require("./src/assets/concrete.js");
let passed = 0;
const assert = (c, m) => { if (!c) { console.error("FAIL", m); process.exitCode = 1; } else { passed++; console.log("ok ", m); } };
process.on("exit", () => console.log(process.exitCode ? "SUITE FAILED" : "SUITE COMPLETE: " + passed + " assertions"));
// Each project page's example inputs are tested against independently recorded
// expected headline quantities. A missing expectation fails as the catalogue grows.
const exampleExpected = {
  "fence-calculator":193, "deck-calculator":29, "siding-calculator":1424.5,
  "drywall-calculator":17, "tile-calculator":130, "paver-calculator":594,
  "paint-calculator":2, "roofing-calculator":45, "retaining-wall-calculator":79,
  "insulation-calculator":21, "board-and-batten-calculator":19.8,
  "grout-calculator":2, "thinset-calculator":5, "cubic-yard-calculator":1,
  "concrete-cost-per-yard":[1110,1320], "concrete-slab-cost":[2600,4200],
  "concrete-patio-cost":[960,3456], "concrete-driveway-cost":[4000,16800],
  "construction-cost-calculator":[396000,616000], "deck-cost-calculator":[4800,9600],
  "fence-installation-cost":[3000,9000], "retaining-wall-cost":[3150,5850],
  "roof-replacement-cost":[6000,12000], "feet-and-inches-calculator":4,
  "cubic-feet-calculator":24, "board-foot-calculator":58.666666667,
  "roof-pitch-calculator":6, "stair-calculator":14, "brick-calculator":1509,
  "ramp-calculator":24, "framing-calculator":26, "rebar-calculator":20,
  "sod-calculator":2200, "markup-calculator":12000, "labor-cost-calculator":4368,
  "tank-volume-calculator":94.002980174,
  "carpet-installation-cost":[540,1980],
  "laminate-flooring-installation-cost":[1000,2400],
  "tile-installation-cost":[1200,2640],
  "drywall-installation-cost":[1500,3500],
  "interior-painting-cost":[1500,6000], "countertop-cost":[1400,5250],
  "home-addition-cost":[30000,90000], "asphalt-driveway-cost":[3600,5400],
  "epoxy-garage-floor-cost":[1080,4320], "deck-staining-cost":[504,1260],
  "stucco-cost":[9540,14490], "vinyl-siding-cost":[6000,24000],
  "metal-roof-cost":[14400,38400], "spray-foam-insulation-cost":[2750,7500],
  "sod-installation-cost":[4250,8750], "french-drain-cost":[1000,5000],
  "linear-feet-calculator":96, "pool-volume-calculator":18192.62337536,
  "wallpaper-calculator":10, "flooring-calculator":198,
  "carpet-calculator":22, "concrete-block-calculator":237,
  // Phase 4 expansion calculators
  "gutter-size-calculator":5,
  "concrete-steps-calculator":1.116975309,
  "sonotube-calculator":0.767944871,
  "fence-post-concrete-calculator":41,
  "concrete-bag-calculator":20,
  "mortar-calculator":16,
  "self-leveling-concrete-calculator":9,
  "plywood-calculator":7,
  "metal-roofing-calculator":52,
  "baluster-spacing-calculator":13,
  "wainscoting-calculator":25.625,
  "baseboard-calculator":5,
  "crown-molding-calculator":6,
  "deck-stain-calculator":5,
  "exterior-paint-calculator":12,
  "raised-bed-soil-calculator":32,
  "grass-seed-calculator":42,
  "cubic-yards-to-tons-calculator":7,
  "acreage-calculator":0.459136823,
  "btu-calculator":8000,
  "firewood-calculator":0.666666667,
  "generator-wattage-calculator":3900,
  "water-heater-size-calculator":88,
  "dehumidifier-size-calculator":35,
  "bathroom-fan-cfm-calculator":150,
};
for (const c of [...require("./src/data/projects").PROJ, ...require("./src/data/costs").COSTS, ...require("./src/data/tools").TOOLS]) {
  const result = require("./src/assets/project").calculate(c.kind, {...c.example.values, costUnit:c.costUnit});
  const expected = [].concat(exampleExpected[c.slug]);
  const actual = [].concat(result.rows[0].value);
  assert(expected.length === actual.length && actual.every((v,i) => Math.abs(v-expected[i]) < 0.00001), c.slug + ": published example headline");
  assert(result.rows.every(r => [].concat(r.value).every(Number.isFinite)), c.slug + ": all example outputs finite");
}
{
  const {calc:material} = require("./src/assets/material");
  const v = {areaFt2:108, depth:3, depthUnit:"in", density:2000, bagSize:3, material:"gravel", price:50, priceUnit:"ton"};
  const a = material("area",v), b = material("area",{...v,density:3000});
  assert(a.tons === 1 && b.tons === 1.5, "material: supplier density affects weight");
  assert(a.bags === 9 && material("area",{...v,bagSize:2}).bags === 14, "material: selected bag size affects count");
  assert(a.cost === 50 && b.cost === 75, "material: supplier density affects per-ton cost");
  const {calculate} = require("./src/assets/project");
  const landings = r => r.rows.find(x => x.label === "Intermediate landings by rise").value;
  assert(landings(calculate("ramp",{rise:30,slope:16,width:3})) === 0, "ramp: 40ft gentle run with 30in rise needs no intermediate landing by rise");
  assert(landings(calculate("ramp",{rise:31,slope:12,width:3})) === 1, "ramp: over 30in rise needs an intermediate landing");
  assert(landings(calculate("ramp",{rise:60,slope:16,width:3})) === 1, "ramp: landings depend on rise, not a fixed horizontal run");
  let invalidPrices = false;
  try { calculate("cost",{quantity:10,low:50,high:20}); } catch { invalidPrices = true; }
  assert(invalidPrices,"cost: reversed price range is rejected");
}
const close = (a, b, t = 0.01) => Math.abs(a - b) <= t;
// Worked example on page: 10x12 ft, 4 in, 10% waste
let r = calc("slab", { length: 10, lengthUnit: "ft", width: 12, widthUnit: "ft", thickness: 4, thicknessUnit: "in", qty: 1, waste: 10 });
assert(close(r.ft3, 40), "slab 40 ft3");
assert(close(r.yd3, 1.48), "slab 1.48 yd3 " + r.yd3.toFixed(3));
assert(close(r.ft3WithWaste, 44), "with waste 44 ft3");
assert(close(r.yd3WithWaste, 1.63), "1.63 yd3 " + r.yd3WithWaste.toFixed(3));
assert(r.bags.find(b => b.lb === 80).count === 74, "74 x 80lb");
assert(r.bags.find(b => b.lb === 60).count === 98, "98 x 60lb (44/0.45=97.8)");
assert(r.orderYd3 === 1.75, "order 1.75 yd3");
// Bags per yard table: exactly 27 ft3 -> 45/60/72/90
r = calc("slab", { length: 27, lengthUnit: "ft", width: 1, widthUnit: "ft", thickness: 12, thicknessUnit: "in", qty: 1, waste: 0 });
assert(close(r.yd3, 1, 1e-9), "1 yd3");
assert(JSON.stringify(r.bags.map(b => b.count)) === "[90,72,60,45]", "bags per yd " + r.bags.map(b=>b.count));
assert(r.orderYd3 === 1, "order exactly 1");
// Inches added to feet
r = calc("slab", { length: 10.5, lengthUnit: "ft", width: 10, widthUnit: "ft", thickness: 4, thicknessUnit: "in", qty: 1, waste: 0 });
assert(close(r.ft3, 35), "10.5x10x4in = 35 ft3");
// Footing 20ft x 12in x 12in = 20 ft3
r = calc("footing", { fLength: 20, fLengthUnit: "ft", fWidth: 12, fWidthUnit: "in", fDepth: 12, fDepthUnit: "in", qty: 1, waste: 0 });
assert(close(r.ft3, 20), "footing 20 ft3");
// Column FAQ example: 12in dia x 4 ft = 3.14 ft3
r = calc("column", { diameter: 12, diameterUnit: "in", height: 4, heightUnit: "ft", qty: 1, waste: 0 });
assert(close(r.ft3, 3.1416, 0.001), "column 3.14 ft3");
assert(close(r.yd3, 0.116, 0.001), "column 0.12 yd3");
// Qty multiplies
r = calc("column", { diameter: 12, diameterUnit: "in", height: 4, heightUnit: "ft", qty: 10, waste: 0 });
assert(close(r.ft3, 31.416, 0.01), "10 columns");
// Round slab 10ft dia x 4in = 26.18 ft3
r = calc("circle", { cDiameter: 10, cDiameterUnit: "ft", cThickness: 4, cThicknessUnit: "in", qty: 1, waste: 0 });
assert(close(r.ft3, 26.18, 0.01), "round slab");
// Cost
r = calc("slab", { length: 27, lengthUnit: "ft", width: 1, widthUnit: "ft", thickness: 12, thicknessUnit: "in", qty: 1, waste: 0, price: 150 });
assert(close(r.cost, 150), "cost 150");
// Bad input
r = calc("slab", { length: -5, lengthUnit: "ft", width: "abc", widthUnit: "ft", thickness: 4, thicknessUnit: "in" });
assert(r.ft3 === 0 && r.bags.every(b => b.count === 0) && r.orderYd3 === 0, "bad input -> 0");

// ---------- Bulk material calculator ----------
const mat = require("./src/assets/material.js");
const m = mat.calc;

// Gravel worked example on the page: 20 x 10 ft, 4 in, 15% compaction.
let g = m("rect", { length: 20, lengthUnit: "ft", width: 10, widthUnit: "ft", depth: 4, depthUnit: "in", material: "gravel", compaction: 15 });
assert(close(g.areaFt2, 200), "gravel area 200 ft2");
assert(close(g.ft3, 66.67, 0.01), "gravel 66.67 ft3 " + g.ft3.toFixed(2));
assert(close(g.ft3Compacted, 76.67, 0.01), "gravel 76.67 ft3 compacted");
assert(close(g.yd3, 2.84, 0.01), "gravel 2.84 yd3 " + g.yd3.toFixed(3));
assert(close(g.tons, 3.98, 0.01), "gravel 3.98 tons " + g.tons.toFixed(3));
assert(g.orderYd3 === 3, "gravel order 3 yd3 (half-yard steps)");
assert(g.orderTons === 4, "gravel order 4 tons (half-ton steps)");

// One cubic yard spread 3 in deep covers 108 sq ft.
let c3 = m("area", { areaFt2: 108, depth: 3, depthUnit: "in", material: "gravel", compaction: 0 });
assert(close(c3.yd3, 1, 1e-9), "108 ft2 at 3 in = 1 yd3");
assert(close(c3.coverageFt2, 108, 1e-9), "coverage 108 ft2 per yd3");

// Density drives the tonnage: topsoil is a ton a yard, gravel is 1.4.
let t = m("area", { areaFt2: 108, depth: 3, depthUnit: "in", material: "topsoil", compaction: 0 });
assert(close(t.tons, 1.0, 1e-9), "topsoil 1.0 ton per yd3");
assert(close(c3.tons, 1.4, 1e-9), "gravel 1.4 tons per yd3");
let mu = m("area", { areaFt2: 108, depth: 3, depthUnit: "in", material: "mulch", compaction: 0 });
assert(close(mu.tons, 0.4, 1e-9), "mulch 0.4 tons per yd3");

// Circle: 12 ft across, 3 in deep -> pi * 6^2 = 113.1 ft2
let ci = m("circle", { diameter: 12, diameterUnit: "ft", depth: 3, depthUnit: "in", material: "gravel", compaction: 0 });
assert(close(ci.areaFt2, 113.10, 0.01), "circle 113.1 ft2 " + ci.areaFt2.toFixed(2));
assert(close(ci.yd3, 1.047, 0.001), "circle 1.047 yd3");

// Feet plus inches add up: 10 ft 6 in x 10 ft = 105 ft2
let fi = m("rect", { length: 10.5, lengthUnit: "ft", width: 10, widthUnit: "ft", depth: 3, depthUnit: "in", material: "gravel" });
assert(close(fi.areaFt2, 105, 1e-9), "10ft6in x 10ft = 105 ft2");

// Pricing: per ton wins when both are given.
let p1 = m("area", { areaFt2: 108, depth: 3, depthUnit: "in", material: "gravel", compaction: 0, price: 50, priceUnit: "ton" });
assert(close(p1.cost, 70, 1e-9), "1.4 tons x $50 = $70");
let p2 = m("area", { areaFt2: 108, depth: 3, depthUnit: "in", material: "gravel", compaction: 0, price: 40, priceUnit: "yd3" });
assert(close(p2.cost, 40, 1e-9), "1 yd3 x $40 = $40");
assert(m("area", { areaFt2: 108, depth: 3, depthUnit: "in", compaction: 0, price: 50 }).cost === 1.4 * 50, "price defaults to per ton");
assert(m("area", { areaFt2: 108, depth: 3, depthUnit: "in" }).cost === null, "no price -> null cost");

// Compaction is clamped to 0-50% and an unknown material falls back to gravel.
assert(close(m("area", { areaFt2: 108, depth: 3, depthUnit: "in", compaction: 999 }).yd3, 1.5, 1e-9), "compaction capped at 50%");
assert(close(m("area", { areaFt2: 108, depth: 3, depthUnit: "in", compaction: -20 }).yd3, 1, 1e-9), "negative compaction -> 0");
assert(m("area", { areaFt2: 108, depth: 3, depthUnit: "in", material: "unobtainium" }).material === "gravel", "unknown material -> gravel");

// Bad input yields zeros, not NaN.
let bad = m("rect", { length: -5, lengthUnit: "ft", width: "abc", widthUnit: "ft", depth: 3, depthUnit: "in" });
assert(bad.yd3 === 0 && bad.tons === 0 && bad.orderYd3 === 0 && bad.coverageFt2 === 27 * 4, "bad input -> 0");

// ---------- Square footage / area ----------
{
const area = require("./src/assets/area.js");

// L-shaped room from the worked example: 16x12 plus 8x6
let L = area.calc([{ shape: "rect", a: 16, b: 12, unit: "ft" }, { shape: "rect", a: 8, b: 6, unit: "ft" }], {});
assert(close(L.ft2, 240, 1e-9), "area: L-shape 240 ft2");
let Lw = area.calc([{ shape: "rect", a: 16, b: 12, unit: "ft" }, { shape: "rect", a: 8, b: 6, unit: "ft" }], { wastePct: 10, pricePerFt2: 4.5 });
assert(close(Lw.ft2WithWaste, 264, 1e-9), "area: +10% waste = 264 ft2");
assert(close(Lw.cost, 1188, 1e-9), "area: 264 x $4.50 = $1,188");

// Unit conversions are exact definitions.
let u = area.calc([{ shape: "rect", a: 30, b: 30, unit: "ft" }], {});
assert(close(u.yd2, 100, 1e-9), "area: 900 ft2 = 100 yd2");
assert(close(u.squares, 9, 1e-9), "area: 900 ft2 = 9 roofing squares");
let ac = area.calc([{ shape: "rect", a: 43560, b: 1, unit: "ft" }], {});
assert(close(ac.acres, 1, 1e-9), "area: 43,560 ft2 = 1 acre");
let mt = area.calc([{ shape: "rect", a: 1, b: 1, unit: "m" }], {});
assert(close(mt.ft2, 10.7639, 0.001), "area: 1 m2 = 10.7639 ft2");
let inch = area.calc([{ shape: "rect", a: 12, b: 12, unit: "in" }], {});
assert(close(inch.ft2, 1, 1e-9), "area: 144 in2 = 1 ft2");

// Shapes
let acirc = area.calc([{ shape: "circle", a: 10, unit: "ft" }], {});
assert(close(acirc.ft2, Math.PI * 25, 1e-9), "area: circle 10 ft diameter");
let tri = area.calc([{ shape: "triangle", a: 10, b: 6, unit: "ft" }], {});
assert(close(tri.ft2, 30, 1e-9), "area: triangle base 10 height 6 = 30");
let trap = area.calc([{ shape: "trapezoid", a: 10, b: 6, c: 4, unit: "ft" }], {});
assert(close(trap.ft2, 32, 1e-9), "area: trapezoid (10+6)x4/2 = 32");

// Quantity multiplies; junk input is ignored.
let q = area.calc([{ shape: "rect", a: 10, b: 10, unit: "ft", qty: 3 }], {});
assert(close(q.ft2, 300, 1e-9), "area: qty 3 multiplies");
let bad = area.calc([{ shape: "rect", a: "x", b: -4, unit: "ft" }], {});
assert(bad.ft2 === 0 && bad.cost === null, "area: bad input -> 0");
}

// ---------- Asphalt runs on the material engine ----------
let asp = m("rect", { length: 100, lengthUnit: "ft", width: 20, widthUnit: "ft", depth: 3, depthUnit: "in", material: "asphalt", compaction: 0 });
// 2,000 ft2 x 0.25 ft x 145 lb/ft3 / 2,000 = 36.25 tons
assert(close(asp.tons, 36.25, 0.01), "asphalt: 36.25 tons for 100x20 at 3 in");
assert(close(asp.yd3, 500 / 27, 0.001), "asphalt: 500 ft3 = 18.52 yd3");

// ---------- New trade tools ----------
{
const { calculate } = require("./src/assets/project.js");
const val = (r, label) => r.rows.find(x => x.label === label).value;

// Feet and inches: 8'7" minus 3'11" = 4'8" = 56 in
let fi = calculate("feet-inches", { aFeet: 8, aInches: 7, bFeet: 3, bInches: 11, operation: "subtract" });
assert(close(val(fi, "Total inches"), 56, 1e-9), "feet-inches: 8'7\" - 3'11\" = 56 in");
assert(close(val(fi, "Decimal feet"), 56 / 12, 1e-9), "feet-inches: 4.667 decimal ft");
let fa = calculate("feet-inches", { aFeet: 2, aInches: 6, bFeet: 1, bInches: 9, operation: "add" });
assert(close(val(fa, "Total inches"), 51, 1e-9), "feet-inches: 2'6\" + 1'9\" = 51 in");

// Cubic feet: 4 x 3 x 2 ft = 24 ft3
let cf = calculate("cubic-feet", { length: 4, width: 3, height: 2, unit: "ft", waste: 0 });
assert(close(val(cf, "Volume"), 24, 1e-9), "cubic-feet: 24 ft3");
assert(close(val(cf, "Cubic yards"), 24 / 27, 1e-9), "cubic-feet: 0.889 yd3");
assert(close(val(cf, "US gallons"), 24 * 7.48051948, 0.01), "cubic-feet: 179.5 gallons");
let cfi = calculate("cubic-feet", { length: 12, width: 12, height: 12, unit: "in", waste: 0 });
assert(close(val(cfi, "Volume"), 1, 1e-9), "cubic-feet: 1728 in3 = 1 ft3");

// Board foot: 2x4x8 = 5.333 bf
let bf = calculate("board-foot", { thickness: 2, width: 4, length: 8, pieces: 1, waste: 0 });
assert(close(val(bf, "Board feet per piece"), 16 / 3, 0.001), "board-foot: 2x4x8 = 5.33 bf");
let bf10 = calculate("board-foot", { thickness: 2, width: 4, length: 8, pieces: 10, waste: 0 });
assert(close(val(bf10, "Board feet to buy"), 160 / 3, 0.001), "board-foot: 10 pieces = 53.3 bf");

// Roof pitch: 6/12 = 26.565 degrees, multiplier 1.1180
let rp = calculate("roof-pitch", { rise: 6, run: 14 });
assert(close(val(rp, "Angle"), 26.565, 0.01), "roof-pitch: 6/12 = 26.57 deg");
assert(close(val(rp, "Slope multiplier"), Math.sqrt(180) / 12, 1e-9), "roof-pitch: multiplier 1.1180");
assert(close(val(rp, "Rafter length"), 14 * Math.sqrt(180) / 12, 0.001), "roof-pitch: rafter 15.65 ft");
let rp45 = calculate("roof-pitch", { rise: 12, run: 10 });
assert(close(val(rp45, "Angle"), 45, 1e-9), "roof-pitch: 12/12 = exactly 45 deg");

// Stair: 108 in rise -> 14 risers at 7.714, 13 treads
let st = calculate("stair", { totalRise: 108, maxRiser: 7.75, treadDepth: 10 });
assert(val(st, "Risers") === 14, "stair: 108 in -> 14 risers");
assert(close(val(st, "Actual riser height"), 108 / 14, 1e-9), "stair: riser 7.714 in");
assert(val(st, "Treads") === 13, "stair: one fewer tread than riser");
assert(close(val(st, "Total run"), 130 / 12, 1e-9), "stair: run 10.83 ft");
assert(close(val(st, "Stringer length"), Math.sqrt(108 * 108 + 130 * 130) / 12, 0.001), "stair: stringer 14.08 ft");

// Brick: modular 7.625 x 2.25 with 3/8 joint = 6.86 per ft2
let br = calculate("brick", { area: 200, unitLength: 7.625, unitHeight: 2.25, joint: 0.375, waste: 0 });
assert(close(val(br, "Units per ft²"), 144 / (8 * 2.625), 0.01), "brick: 6.86 per ft2");
assert(val(br, "Units to buy") === Math.ceil(200 / ((8 * 2.625) / 144)), "brick: 1372 for 200 ft2");

// Ramp: 24 in rise at 1:12 = 24 ft run
let rm = calculate("ramp", { rise: 24, slope: 12, width: 3 });
assert(close(val(rm, "Ramp run"), 24, 1e-9), "ramp: 24 in at 1:12 = 24 ft");
assert(close(val(rm, "Slope"), 100 / 12, 0.01), "ramp: 8.33%");

// Framing: 24 ft at 16 in oc = 19 studs on layout
let fr = calculate("framing", { length: 24, spacing: 16, corners: 2, waste: 0 });
assert(val(fr, "Studs on layout") === 19, "framing: 24 ft at 16 oc = 19 studs");
assert(val(fr, "Extra corner and intersection studs") === 4, "framing: 2 corners = 4 extra");
assert(close(val(fr, "Top and bottom plate"), 72, 1e-9), "framing: 72 linear ft of plate");

// Rebar: 20 x 12 ft at 18 in = 10 + 15 bars, 380 linear ft
let rb = calculate("rebar", { length: 20, width: 12, spacing: 18, barSize: 4, barLength: 20, waste: 0 });
assert(val(rb, "Bars running the length") === 9, "rebar: 9 bars spaced across 12 ft");
assert(val(rb, "Bars running the width") === 15, "rebar: 15 bars spaced along 20 ft");
assert(close(val(rb, "Linear feet of rebar"), 360, 1e-9), "rebar: 9x20 + 15x12 = 360 linear ft");
assert(close(val(rb, "Total weight"), 360 * 0.668, 0.1), "rebar: #4 at 0.668 lb/ft");

// Sod: 2000 ft2 + 10% in 2.67 ft2 slabs
let sd = calculate("sod", { area: 2000, rollArea: 2.67, perPallet: 170, waste: 10 });
assert(close(val(sd, "Sod to buy"), 2200, 1e-9), "sod: 2200 ft2 with waste");
assert(val(sd, "Rolls or slabs") === Math.ceil(2200 / 2.67), "sod: 825 slabs");

// Markup vs margin: the classic confusion
let mk = calculate("markup", { cost: 10000, markup: 20 });
assert(close(val(mk, "Price to quote"), 12000, 1e-9), "markup: 20% on 10k = 12k");
assert(close(val(mk, "Gross margin"), 2000 / 12000 * 100, 0.01), "markup: 20% markup is 16.7% margin");
let mk50 = calculate("markup", { cost: 100, markup: 50 });
assert(close(val(mk50, "Gross margin"), 100 / 3, 0.01), "markup: 50% markup = 33.3% margin");

// Labor: burden turns a wage into a cost
let lb = calculate("labor-cost", { rate: 28, hours: 40, workers: 3, burden: 30 });
assert(close(val(lb, "Burdened hourly rate"), 36.4, 1e-9), "labor: $28 + 30% = $36.40");
assert(close(val(lb, "Total labor"), 36.4 * 120, 1e-9), "labor: $4,368 total");
assert(close(val(lb, "Base wages"), 3360, 1e-9), "labor: $3,360 in wages alone");

// Tank: 24 in cylinder, 48 in tall
let tk = calculate("tank-volume", { shape: "cylinder", diameter: 24, height: 48, length: 0, width: 0 });
assert(close(val(tk, "Cubic feet"), Math.PI * 1 * 4, 0.001), "tank: 12.57 ft3");
assert(close(val(tk, "Capacity"), Math.PI * 4 * 7.48051948, 0.1), "tank: 94 gallons");
let tkr = calculate("tank-volume", { shape: "rectangle", length: 12, width: 12, height: 12 });
assert(close(val(tkr, "Cubic feet"), 1, 1e-9), "tank: rectangular 12in cube = 1 ft3");

// A negative feet-inches result is rejected rather than silently wrong.
let threw = false;
try { calculate("feet-inches", { aFeet: 1, aInches: 0, bFeet: 5, bInches: 0, operation: "subtract" }); }
catch (e) { threw = true; }
assert(threw, "feet-inches: negative result throws");
}

// ---------- Unit conversion on measured fields ----------
// Boundary cases for the new buying calculators: the quoted room area alone
// is not always the number of full packages a customer must purchase.
{
  const { calculate, convertUnits } = require("./src/assets/project");
  const value = (kind, v, label) => calculate(kind, v).rows.find(r => r.label === label).value;
  assert(close(value("linear-feet", {mode:"area",area:100,boardWidth:6,waste:10}, "Linear feet"), 220, 1e-9), "linear feet: 100 ft2 of 6-inch boards plus 10% needs 220 ft");
  const roundPool = {shape:"round",diameter:24,shallow:4,deep:4};
  assert(close(value("pool", roundPool, "Cubic feet"), 1809.557368, 1e-6), "pool: 24-foot round pool at 4-foot depth");
  assert(close(value("pool", {shape:"oval",length:24,width:12,shallow:3,deep:5}, "Cubic feet"), 904.778684, 1e-6), "pool: oval surface uses elliptical area and average depth");
  const paper = {wallWidth:44,height:8,rollWidth:20.5,rollLength:33,repeat:24,trim:4,waste:0};
  assert(value("wallpaper", paper, "Rolls to buy") === 9, "wallpaper: full-repeat allowance gives three full strips per roll");
  assert(value("wallpaper", {...paper,repeat:33}, "Rolls to buy") === 13, "wallpaper: a longer repeat crosses the whole-strip boundary");
  let rejected = false;
  try { calculate("wallpaper", {...paper,rollLength:8}); } catch (e) { rejected = /longer than the roll/.test(e.message); }
  assert(rejected, "wallpaper: a strip longer than the roll is rejected");
  const floor = {length:12,width:15,boxCoverage:20,waste:10,price:3};
  assert(value("flooring", floor, "Boxes to buy") === 10, "flooring: 198 ft2 rounds up to ten 20-ft2 boxes");
  assert(value("flooring", floor, "Material cost") === 600, "flooring: price covers 200 purchased ft2 rather than 198 needed");
  assert(close(value("flooring", {...floor,boxCoverage:0}, "Material cost"), 594, 1e-9), "flooring: without boxes price uses the allowance-adjusted area");
  assert(value("carpet", {length:12,width:15,rollWidth:12,waste:0}, "Seams") === 0, "carpet: rotating one roll width spans the room");
  assert(value("carpet", {length:13,width:15,rollWidth:12,waste:0}, "Seams") === 1, "carpet: both sides wider than the roll require a seam");
  const block = convertUnits({area:100/9,areaUnit:"yd2",unitLength:15.625,unitHeight:7.625,joint:0.375,waste:5}, {area:"ft2"});
  assert(value("brick", block, "Units to buy") === 119, "CMU: 100 ft2 in square yards orders 119 blocks with 5% spare");
}

// ---------- Unit conversion on measured fields ----------
{
const { convertUnits, calculate } = require("./src/assets/project.js");

// Lengths convert into whatever the engine expects.
assert(close(convertUnits({ length: 8, lengthUnit: "yd" }, { length: "ft" }).length, 24, 1e-9), "units: 8 yd -> 24 ft");
assert(close(convertUnits({ length: 24, lengthUnit: "in" }, { length: "ft" }).length, 2, 1e-9), "units: 24 in -> 2 ft");
assert(close(convertUnits({ rise: 2, riseUnit: "ft" }, { rise: "in" }).rise, 24, 1e-9), "units: 2 ft -> 24 in");
assert(close(convertUnits({ length: 1, lengthUnit: "m" }, { length: "ft" }).length, 3.280839895, 1e-6), "units: 1 m -> 3.2808 ft");

// Areas use the squared table, not the linear one.
assert(close(convertUnits({ area: 1, areaUnit: "yd2" }, { area: "ft2" }).area, 9, 1e-9), "units: 1 yd2 -> 9 ft2");
assert(close(convertUnits({ area: 1, areaUnit: "m2" }, { area: "ft2" }).area, 10.763910417, 1e-6), "units: 1 m2 -> 10.76 ft2");
assert(close(convertUnits({ area: 144, areaUnit: "in2" }, { area: "ft2" }).area, 1, 1e-9), "units: 144 in2 -> 1 ft2");

// The selector key is always removed, so it can never reach an engine.
assert(!("lengthUnit" in convertUnits({ length: 5, lengthUnit: "ft" }, { length: "ft" })), "units: selector key dropped");
assert(!("fooUnit" in convertUnits({ foo: 5, fooUnit: "ft" }, {})), "units: unknown field still drops its selector");

// An unmarked field is left alone.
let untouched = convertUnits({ spacing: 16 }, { length: "ft" });
assert(untouched.spacing === 16, "units: unmarked field untouched");

// End to end: the same wall in yards and feet gives the same stud count.
let ft = calculate("framing", convertUnits({ length: 24, lengthUnit: "ft", spacing: 16, corners: 0, waste: 0 }, { length: "ft" }));
let yd = calculate("framing", convertUnits({ length: 8, lengthUnit: "yd", spacing: 16, corners: 0, waste: 0 }, { length: "ft" }));
const studs = r => r.rows.find(x => x.label === "Studs on layout").value;
assert(studs(ft) === studs(yd) && studs(ft) === 19, "units: 24 ft and 8 yd both give 19 studs");
}

// Cost pages measure a tape-measured rectangle, so the same slab entered in
// feet, yards or meters must produce the same budget. The unit rate stays per
// square foot; only the measurement converts.
{
  const { convertUnits, calculate } = require("./src/assets/project.js");
  const base = { low: 6.5, high: 10.5, delivery: 0, removal: 0, other: 0, waste: 0, costUnit: "ft²" };
  const rate = v => calculate("cost", v).rows.find(r => r.label === "Planning range").value;
  const qty = v => calculate("cost", v).rows.find(r => r.label === "Measured quantity").value;
  const inFeet = convertUnits({ ...base, length: 20, lengthUnit: "ft", width: 20, widthUnit: "ft" }, { length: "ft", width: "ft" });
  const inYards = convertUnits({ ...base, length: 20 / 3, lengthUnit: "yd", width: 20 / 3, widthUnit: "yd" }, { length: "ft", width: "ft" });
  const inMeters = convertUnits({ ...base, length: 6.096, lengthUnit: "m", width: 6.096, widthUnit: "m" }, { length: "ft", width: "ft" });
  assert(close(qty(inFeet), 400, 1e-9), "cost units: 20 x 20 ft is 400 ft2");
  assert(close(qty(inYards), 400, 1e-6), "cost units: the same slab in yards is still 400 ft2");
  assert(close(qty(inMeters), 400, 1e-3), "cost units: the same slab in meters is still 400 ft2");
  assert(close(rate(inFeet)[0], 2600, 1e-9) && close(rate(inFeet)[1], 4200, 1e-9), "cost units: 400 ft2 at $6.50-$10.50 is $2,600-$4,200");
  assert(close(rate(inYards)[0], 2600, 1e-6), "cost units: yards give the same budget as feet");
  // A fence is priced per linear foot, so its quantity converts as a length.
  const fenceFt = convertUnits({ ...base, costUnit: "linear ft", quantity: 150, quantityUnit: "ft" }, { quantity: "ft" });
  const fenceYd = convertUnits({ ...base, costUnit: "linear ft", quantity: 50, quantityUnit: "yd" }, { quantity: "ft" });
  assert(close(qty(fenceFt), 150, 1e-9) && close(qty(fenceYd), 150, 1e-9), "cost units: 50 yd of fence is 150 linear ft");
  // A roof is priced per square foot, so its quantity converts as an area.
  const roofFt2 = convertUnits({ ...base, quantity: 2000, quantityUnit: "ft2" }, { quantity: "ft2" });
  const roofYd2 = convertUnits({ ...base, quantity: 2000 / 9, quantityUnit: "yd2" }, { quantity: "ft2" });
  assert(close(qty(roofFt2), 2000, 1e-9) && close(qty(roofYd2), 2000, 1e-6), "cost units: a roof in square yards converts to ft2");
  // Ready-mix is ordered by the cubic yard, but our own concrete calculator
  // reports cubic feet and cubic meters as well, so both must price the same
  // order. 6 yd³ = 162 ft³ = 4.5873 m³.
  const mix = { low: 160, high: 195, delivery: 0, removal: 0, other: 0, waste: 0, costUnit: "yd³" };
  const inYd3 = convertUnits({ ...mix, quantity: 6, quantityUnit: "yd3" }, { quantity: "yd3" });
  const inFt3 = convertUnits({ ...mix, quantity: 162, quantityUnit: "ft3" }, { quantity: "yd3" });
  const inM3 = convertUnits({ ...mix, quantity: 4.587302, quantityUnit: "m3" }, { quantity: "yd3" });
  assert(close(qty(inYd3), 6, 1e-9), "volume units: 6 yd3 stays 6 yd3");
  assert(close(qty(inFt3), 6, 1e-9), "volume units: 162 ft3 is 6 yd3");
  assert(close(qty(inM3), 6, 1e-4), "volume units: 4.5873 m3 is 6 yd3");
  assert(close(rate(inYd3)[0], 960, 1e-9) && close(rate(inYd3)[1], 1170, 1e-9), "volume units: 6 yd3 at $160-$195 is $960-$1,170");
  assert(close(rate(inFt3)[0], 960, 1e-9), "volume units: cubic feet give the same budget as cubic yards");
  // A volume target must not be converted with the area or length table.
  assert(close(convertUnits({ v: 1, vUnit: "m3" }, { v: "ft3" }).v, 35.314666721, 1e-6), "volume units: 1 m3 -> 35.3147 ft3");
  assert(close(convertUnits({ v: 1, vUnit: "yd3" }, { v: "ft3" }).v, 27, 1e-9), "volume units: 1 yd3 -> 27 ft3");

  // Depth reaches the cubic-yard engine in inches, because its formula divides
  // by 324 (12 x 27). Converting it to feet instead would be wrong by 12x.
  const bed = d => calculate("cubic-yard", convertUnits({ length: 12, width: 9, waste: 0, price: 0, ...d }, { length: "ft", width: "ft", depth: "in" }));
  const yards = r => r.rows.find(x => x.label === "Volume with allowance").value;
  assert(close(yards(bed({ depth: 3, depthUnit: "in" })), 1, 1e-9), "depth units: 12 x 9 ft at 3 in is 1 yd3");
  assert(close(yards(bed({ depth: 0.25, depthUnit: "ft" })), 1, 1e-9), "depth units: a quarter foot of depth is the same cubic yard");
  // A roof run is walked with a tape; the rise is defined per 12 inches of run.
  const roof = u => calculate("roof-pitch", convertUnits({ rise: 6, run: u.n, runUnit: u.u }, { run: "ft" }));
  const rafter = r => r.rows.find(x => x.label === "Rafter length").value;
  assert(close(rafter(roof({ n: 15, u: "ft" })), rafter(roof({ n: 5, u: "yd" })), 1e-9), "run units: 5 yd of run equals 15 ft");
  assert(close(rafter(roof({ n: 15, u: "ft" })), 16.7705, 1e-3), "run units: a 6/12 roof over 15 ft needs a 16.77 ft rafter");
}

// Reference charts and the extra sections quote numbers; check them against
// the engine and against figures a reader can verify by hand.
{
  const { chartsFor, CHART_PAGES } = require("./src/data/charts");
  const { calculate } = require("./src/assets/project.js");
  const pages = [...require("./src/data/projects").PROJ, ...require("./src/data/costs").COSTS, ...require("./src/data/tools").TOOLS];
  const page = slug => pages.find(p => p.slug === slug);
  const cell = (slug, title, rowLabel, col) => {
    const t = chartsFor(page(slug)).find(x => x.title === title);
    return t.rows.find(r => r[0] === rowLabel)[col];
  };
  for (const slug of CHART_PAGES) {
    const charts = chartsFor(page(slug));
    assert(charts.length > 0 && charts.every(t => t.rows.length && t.rows.every(r => r.length === t.head.length && r.every(c => !/NaN|undefined|Infinity/.test(String(c))))), slug + ": charts render with no empty or invalid cells");
  }
  assert(cell("roof-pitch-calculator", "Roof pitch chart", "6/12", 1) === "26.57°", "chart: 6/12 is 26.57 degrees");
  assert(cell("roof-pitch-calculator", "Roof pitch chart", "12/12", 3) === "1.414", "chart: 12/12 multiplier is the square root of 2");
  assert(cell("board-foot-calculator", "Board feet in common lumber sizes", "2×4×8", 1) === "5.33", "chart: a 2x4x8 is 5.33 board feet");
  assert(cell("brick-calculator", "Bricks per square foot by size", "Modular brick", 2) === "6.86", "chart: modular brick is 6.86 per ft2 with a 3/8 joint");
  assert(cell("drywall-calculator", "How many sheets of drywall for a room", "12 × 12 ft", 1) === "14", "chart: 12x12 room, 8 ft walls, 10% waste is 14 sheets");
  assert(cell("concrete-cost-per-yard", "How many yards common pours take", "10 × 10 ft slab", 2) === "1.23 yd³", "chart: 10x10 slab at 4 in is 1.23 yd3");
  assert(cell("markup-calculator", "Markup vs margin", "50%", 1) === "33.3%", "chart: 50% markup is a 33.3% margin");
  assert(cell("stair-calculator", "Stair risers and run by total rise", "108 in", 1) === "14", "chart: 108 in rise at 7.75 max is 14 risers");

  const v = (kind, values, label) => calculate(kind, values).rows.find(r => r.label === label).value;
  assert(close(v("cubic-feet", { length: 24, width: 18, height: 12, unit: "in", waste: 0 }, "Volume"), 3, 1e-9), "extras: 24 x 18 x 12 in is 3 ft3");
  assert(close(v("labor-cost", { rate: 28, hours: 40, workers: 3, burden: 30 }, "Total labor"), 4368, 1e-9), "extras: the labor example is $4,368");
  assert(close(v("markup", { cost: 100, markup: 30 }, "Gross margin"), 23.0769, 1e-3), "extras: a 30% markup is a 23.1% margin");
  assert(close(v("cubic-yard", { length: 12, width: 9, depth: 3, waste: 0 }, "Volume with allowance"), 1, 1e-9), "extras: 12 x 9 ft at 3 in is 1 yd3");
}

// ---------- Upgraded & Phase 4 engines ----------
{
  const { calculate } = require("./src/assets/project.js");
  const val = (r, label) => r.rows.find(x => x.label === label).value;

  // Concrete calculator: steps & curb shapes
  const st = calc("steps", { stepCount: 3, stepWidth: 4, stepWidthUnit: "ft", riserHeight: 7, riserHeightUnit: "in", treadDepth: 11, treadDepthUnit: "in", platformDepth: 36, platformDepthUnit: "in", qty: 1, waste: 0 });
  assert(close(st.ft3, 27.4167, 0.01), "concrete steps: 3 steps x 4ft with 36in platform = 27.42 ft3");
  const cb = calc("curb", { curbLength: 100, curbLengthUnit: "ft", curbDepth: 6, curbDepthUnit: "in", curbHeight: 6, curbHeightUnit: "in", gutterWidth: 12, gutterWidthUnit: "in", flagThickness: 4, flagThicknessUnit: "in", qty: 1, waste: 0 });
  // Cross section: curb (6x6 = 36 in2) + gutter+flag (18x4 = 72 in2) = 108 in2 = 0.75 ft2 -> 75 ft3
  assert(close(cb.ft3, 75, 0.01), "concrete curb & gutter: 100 ft = 75 ft3");

  // Material calculator: new aggregate densities
  const pg = m("area", { areaFt2: 108, depth: 3, depthUnit: "in", material: "pea-gravel", compaction: 0 });
  assert(close(pg.tons, 1.4, 1e-9), "pea gravel: 1.4 tons/yd3");
  const dg = m("area", { areaFt2: 108, depth: 3, depthUnit: "in", material: "decomposed-granite", compaction: 0 });
  assert(close(dg.tons, 1.45, 1e-9), "decomposed granite: 1.45 tons/yd3");
  const cp = m("area", { areaFt2: 108, depth: 3, depthUnit: "in", material: "compost", compaction: 0 });
  assert(close(cp.tons, 0.5, 1e-9), "compost: 0.5 tons/yd3");

  // Grout tile+joint real geometry: 234 ft2 of 12x12x3/8 tile with 3/16 joint ~= 25 lb sanded grout
  const gr = calculate("grout", { mode: "tile", area: 234, tileLength: 12, tileWidth: 12, tileThickness: 0.375, jointWidth: 0.1875, groutType: "sanded", bagWeight: 25, waste: 0 });
  assert(close(val(gr, "Grout needed"), 25, 0.1), "grout tile mode: 234 ft2 12x12x3/8 at 3/16 joint ~= 25.0 lb");
  const gr200 = calculate("grout", { mode: "tile", area: 200, tileLength: 12, tileWidth: 12, tileThickness: 0.375, jointWidth: 0.1875, groutType: "sanded", bagWeight: 25, waste: 10 });
  assert(val(gr200, "25 lb bags to buy") === 1, "grout tile mode: 200 ft2 + 10% waste fits in 1 x 25 lb bag");

  // Tank volume partial liquid depth
  const tkp = calculate("tank-volume", { shape: "cylinder", diameter: 24, height: 48, fillDepth: 24 });
  assert(close(val(tkp, "Filled volume at liquid depth"), val(tkp, "Capacity") / 2, 0.01), "tank: half fill depth = half capacity");

  // Phase 4 edge & boundary tests
  assert(val(calculate("gutter-size", { area: 1500, pitch: 8, rainfall: 6 }), "Recommended K-style gutter") === 7, "gutter: heavy rain steep large roof -> 7 in");
  assert(val(calculate("gutter-size", { area: 1400, pitch: 6, rainfall: 4 }), "Recommended K-style gutter") === 6, "gutter: 1400 ft2 at 6/12 & 4 in/hr -> 6 in");
  const bal = calculate("baluster-spacing", { length: 6, balusterWidth: 1.5, maxGap: 4 });
  assert(val(bal, "Balusters needed") === 13 && close(val(bal, "Clear gap between balusters"), 3.75, 1e-6), "baluster: 72in opening -> 13 balusters @ 3.75in clear");
  assert(val(calculate("mortar", { unitType: "block", units: 130, bagSize: 80, waste: 0 }), "80 lb mortar bags") === 10, "mortar: 130 blocks = 10 x 80 lb bags");
  assert(close(val(calculate("grass-seed", { area: 4000, grassType: "tall-fescue", jobType: "overseed", waste: 0 }), "Grass seed needed"), 16, 1e-9), "grass-seed: overseed uses half rate (4 lb/1000 ft2)");
  assert(close(val(calculate("yards-to-tons", { mode: "ton-to-yd", amount: 7, density: 2800 }), "Cubic yards"), 5, 1e-9), "yards-to-tons: reverse 7 tons gravel = 5 yd3");
  assert(val(calculate("bathroom-fan", { length: 5, width: 8, height: 8, fixtures: 2, jettedTub: 0 }), "Minimum fan airflow") === 50, "bathroom-fan: 40 ft2 enforces 50 CFM HVI minimum");
  assert(val(calculate("bathroom-fan", { length: 12, width: 10, height: 8, fixtures: 3, jettedTub: 1 }), "Minimum fan airflow") === 250, "bathroom-fan: >100 ft2 adds 100 CFM for jetted tub");
  assert(close(val(calculate("acreage", { length: 435.6, width: 100 }), "Total acreage"), 1, 1e-6), "acreage: 435.6 x 100 ft = 1.0000 acre");

  // Competitor-parity & GSC-winner engine upgrades
  const fiFrac = calculate("feet-inches", { operation: "add", aFeet: 5, aInches: 3, aFrac: 0.375, bFeet: 2, bInches: 1, bFrac: 0.5 });
  assert(fiFrac.rows[0].value === 7 && fiFrac.rows[0].unit === "ft 4 7/8 in", "feet-inches fractions: 5' 3 3/8\" + 2' 1 1/2\" = 7 ft 4 7/8 in");
  const fiConv = calculate("feet-inches", { operation: "convert", aFeet: 0, aInches: 10, aFrac: 0 });
  assert(close(val(fiConv, "Decimal feet"), 10 / 12, 1e-6), "feet-inches convert: 10 in = 0.8333 decimal ft");
  const fiDiv = calculate("feet-inches", { operation: "divide", aFeet: 12, aInches: 6, aFrac: 0, factor: 3 });
  assert(close(val(fiDiv, "Total inches"), 50, 1e-9), "feet-inches divide: 12'6\" / 3 = 50 in");
  const fiMul = calculate("feet-inches", { operation: "multiply", aFeet: 2, aInches: 6, aFrac: 0, factor: 4 });
  assert(close(val(fiMul, "Total inches"), 120, 1e-9), "feet-inches multiply: 2'6\" x 4 = 120 in");

  const cw = calc("slab", { length: 10, lengthUnit: "ft", width: 12, widthUnit: "ft", thickness: 4, thicknessUnit: "in", qty: 1, waste: 10 });
  assert(close(cw.weightLb, 6600, 0.1) && close(cw.weightTons, 3.3, 0.01), "concrete weight: 44 ft3 = 6,600 lb (3.30 tons)");

  const areaMod = require("./src/assets/area.js");
  const cut = areaMod.calc([
    { shape: "rect", a: 16, b: 12, unit: "ft", sign: 1 },
    { shape: "rect", a: 4, b: 3, unit: "ft", sign: -1 },
  ], {});
  assert(close(cut.ft2, 180, 1e-9) && close(cut.perimeterFt, 56, 1e-9), "area cutout & perimeter: 16x12 minus 4x3 = 180 ft2, 56 ft perimeter");

  const rpRR = calculate("roof-pitch", { mode: "rise-run", totalRise: 7, run: 14, footprint: 2000 });
  assert(close(val(rpRR, "Pitch"), 6, 1e-6) && close(val(rpRR, "Slope percentage"), 50, 1e-6), "roof-pitch rise-run: 7 ft over 14 ft = 6/12 (50%)");
  assert(close(val(rpRR, "Sloped roof area"), 2000 * Math.sqrt(180) / 12, 0.1), "roof-pitch footprint: 2000 ft2 @ 6/12 = 2236.1 ft2");

  const st2 = calculate("stair", { totalRise: 108, maxRiser: 7.75, treadDepth: 10 });
  assert(val(st2, "2×12 stringer board to buy") === 16, "stair: 14.08 ft stringer recommends 16 ft 2x12 board");

  const costInst = calculate("cost", { length: 20, width: 20, low: 6.5, high: 10.5, costUnit: "ft²" });
  assert(costInst.rows.some(r => /Est\. labor/.test(r.label)), "cost: installed projects show labor/material split");
  const costYd = calculate("cost", { quantity: 6, low: 160, high: 195, costUnit: "yd³" });
  assert(!costYd.rows.some(r => /Est\. labor/.test(r.label)), "cost: ready-mix per yd3 omits labor split");
}

// The 10 project groups cover the whole catalog, each calculator exactly once.
{
  const { GROUPS } = require("./src/data/groups");
  const { ALL } = require("./src/data/catalog");
  const fs = require("fs");
  const inGroups = GROUPS.flatMap(g => g.items);
  const catalog = ALL.map(a => a[0].replace(/\//g, ""));
  assert(GROUPS.length === 10, "groups: there are 10 project groups");
  assert(new Set(inGroups).size === inGroups.length, "groups: no calculator is listed twice");
  assert(catalog.every(s => inGroups.includes(s)) && inGroups.every(s => catalog.includes(s)), "groups: every calculator is in exactly one group");
  assert(GROUPS.every(g => fs.existsSync(`./src/assets/g-${g.img}.webp`)), "groups: every group has its drawing");
}
