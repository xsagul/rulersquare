const { calc } = require("./src/assets/concrete.js");
let passed = 0;
const assert = (c, m) => { if (!c) { console.error("FAIL", m); process.exitCode = 1; } else { passed++; console.log("ok ", m); } };
process.on("exit", () => console.log(process.exitCode ? "SUITE FAILED" : "SUITE COMPLETE: " + passed + " assertions"));
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

// ---------- US paycheck calculator, 2026 ----------
const pay = require("./src/assets/paycheck.js");
const T = require("./src/data/tax2026");

// $52,000 single, no state tax. Hand-checked against the 2026 tables.
let s = pay.calc({ gross: 2000, periodsPerYear: 26, status: "single", stateRatePct: 0 });
assert(close(s.annualGross, 52000, 1e-6), "paycheck: gross 52,000");
// 16,100 standard deduction -> 35,900 taxable
assert(close(s.taxableIncome, 35900, 1e-6), "paycheck: taxable 35,900");
// 10% x 12,400 = 1,240 ; 12% x 23,500 = 2,820
assert(close(s.federal, 4060, 0.01), "paycheck: federal 4,060 " + s.federal.toFixed(2));
assert(close(s.socialSecurity, 3224, 0.01), "paycheck: SS 3,224");
assert(close(s.medicare, 754, 0.01), "paycheck: medicare 754");
assert(close(s.annualNet, 43962, 0.01), "paycheck: net 43,962");
assert(close(s.perPeriodNet, 1690.85, 0.01), "paycheck: 1,690.85 per biweekly cheque");
assert(close(s.marginalRate, 0.12, 1e-9), "paycheck: marginal 12%");

// Social Security stops at the wage base; Medicare does not.
let hi = pay.calc({ gross: 300000, periodsPerYear: 1, status: "single", stateRatePct: 0 });
assert(close(hi.socialSecurity, T.FICA.socialSecurityWageBase * 0.062, 0.01), "paycheck: SS capped at wage base");
// 1.45% on all 300k, plus 0.9% on the 100k above the 200k threshold
assert(close(hi.medicare, 300000 * 0.0145 + 100000 * 0.009, 0.01), "paycheck: additional medicare surtax");

// Payroll withholding begins at $200,000 even for a married employee. The
// final joint-return threshold is reconciled later on Form 8959.
let hiMar = pay.calc({ gross: 225000, periodsPerYear: 1, status: "married", stateRatePct: 0 });
assert(close(hiMar.medicare, 225000 * 0.0145 + 25000 * 0.009, 0.01), "paycheck: married Medicare withholding starts at 200k");

// Married thresholds are wider, so the same gross keeps more.
let mar = pay.calc({ gross: 2000, periodsPerYear: 26, status: "married", stateRatePct: 0 });
assert(mar.annualNet > s.annualNet, "paycheck: married keeps more than single");
assert(close(mar.taxableIncome, 52000 - 32200, 1e-6), "paycheck: married standard deduction 32,200");

// A 401(k) cuts federal tax but not FICA — the usual payroll gotcha.
let k = pay.calc({ gross: 2000, periodsPerYear: 26, status: "single", stateRatePct: 0, pretax401kPct: 10 });
assert(close(k.socialSecurity, s.socialSecurity, 0.01), "paycheck: 401k does not reduce Social Security");
assert(k.federal < s.federal, "paycheck: 401k reduces federal tax");
assert(close(k.pretax401k, 5200, 0.01), "paycheck: 401k 10% of 52,000");
let kMax = pay.calc({ gross: 300000, periodsPerYear: 1, status: "single", stateRatePct: 0, pretax401kPct: 20 });
assert(close(kMax.pretax401k, T.RETIREMENT.employee401kLimit, 0.01), "paycheck: 401k capped at 2026 base limit");

// Section 125 style deductions reduce FICA too.
let sec125 = pay.calc({ gross: 2000, periodsPerYear: 26, status: "single", stateRatePct: 0, pretaxOtherPerPeriod: 100 });
assert(sec125.socialSecurity < s.socialSecurity, "paycheck: pre-tax health premiums do reduce FICA");

// State rate applies to post-401k wages.
let tx = pay.calc({ gross: 2000, periodsPerYear: 26, status: "single", stateRatePct: 0 });
let ca = pay.calc({ gross: 2000, periodsPerYear: 26, status: "single", stateRatePct: 5 });
assert(close(tx.state, 0, 1e-9), "paycheck: no-tax state pays 0 state tax");
assert(close(ca.state, 2600, 0.01), "paycheck: 5% state on 52,000 = 2,600");

// Pay frequency changes the cheque, never the annual outcome.
let wk = pay.calc({ gross: 1000, periodsPerYear: 52, status: "single", stateRatePct: 0 });
let mo = pay.calc({ gross: 52000 / 12, periodsPerYear: 12, status: "single", stateRatePct: 0 });
assert(close(wk.annualNet, mo.annualNet, 0.01), "paycheck: frequency does not change annual net");

// Zero and junk input must not produce NaN.
let z = pay.calc({ gross: "abc", periodsPerYear: 26, status: "nonsense" });
assert(z.annualNet === 0 && z.federal === 0 && !isNaN(z.effectiveRate), "paycheck: bad input -> 0, no NaN");

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

// ---------- Wage and salary conversion ----------
{
const wage = require("./src/assets/wage.js");

// $65,000 a year at 40 h/week, all 52 weeks paid -> 2,080 hours
let sal = wage.calc({ amount: 65000, per: "year", hoursPerWeek: 40, daysPerWeek: 5 });
assert(close(sal.hoursPerYear, 2080, 1e-9), "wage: 2,080 hours a year");
assert(close(sal.hourly, 31.25, 0.001), "wage: $65k = $31.25/hr");
assert(close(sal.weekly, 1250, 0.01), "wage: $1,250 a week");
assert(close(sal.biweekly, 2500, 0.01), "wage: $2,500 every two weeks");
assert(close(sal.monthly, 65000 / 12, 0.01), "wage: monthly = annual/12");

// Unpaid leave shortens the paid year and lifts the real hourly rate.
let unpaid = wage.calc({ amount: 65000, per: "year", hoursPerWeek: 40, unpaidWeeks: 2 });
assert(close(unpaid.hoursPerYear, 2000, 1e-9), "wage: 2 unpaid weeks -> 2,000 hours");
assert(close(unpaid.hourly, 32.5, 0.001), "wage: real rate rises to $32.50");

// Hourly -> annual, with overtime at 1.5x
let hr = wage.calc({ amount: 22, per: "hour", hoursPerWeek: 40 });
assert(close(hr.annual, 45760, 0.01), "wage: $22/hr = $45,760");
let ot = wage.calc({ amount: 22, per: "hour", hoursPerWeek: 40, overtimeHours: 5, overtimeMult: 1.5 });
assert(close(ot.annual, 54340, 0.01), "wage: +5h OT = $54,340 " + ot.annual.toFixed(2));
assert(close(ot.overtimePay, 8580, 0.01), "wage: overtime worth $8,580");

// Biweekly (26) and semi-monthly (24) describe the same salary differently.
let wk = wage.calc({ amount: 1400, per: "week", hoursPerWeek: 40 });
assert(close(wk.annual, 72800, 0.01), "wage: $1,400/wk = $72,800");
assert(close(wk.biweekly, 2800, 0.01), "wage: biweekly $2,800");
assert(close(wk.semimonthly, 72800 / 24, 0.01), "wage: semi-monthly differs from biweekly");
assert(wk.semimonthly > wk.biweekly, "wage: 24 cheques are larger than 26");
assert(close(wk.hourly, 35, 0.001), "wage: $1,400/wk at 40h = $35/hr");

// Part-time uses the real divisor, not 2,080.
let pt = wage.calc({ amount: 32500, per: "year", hoursPerWeek: 25 });
assert(close(pt.hourly, 25, 0.001), "wage: part-time $32,500 at 25h = $25/hr");

// Day rate
let day = wage.calc({ amount: 400, per: "day", daysPerWeek: 5, hoursPerWeek: 40, unpaidWeeks: 4 });
assert(close(day.annual, 400 * 5 * 48, 0.01), "wage: $400/day over 48 paid weeks = $96,000");

// Junk input stays at zero.
let bad = wage.calc({ amount: "abc", per: "year" });
assert(bad.annual === 0 && bad.hourly === 0, "wage: bad input -> 0");
}

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
