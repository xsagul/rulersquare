/* Ruler Square — bulk material data.
 *
 * Weights are pounds per cubic yard of loose, delivered material. Aggregate
 * suppliers quote a range because moisture and gradation move the number, so
 * each entry carries the range we publish on the page and the mid figure the
 * calculator uses. Sources are listed on each page.
 */

const MATERIALS = [
  { id: "gravel",     name: "Gravel (¼\"–2\")",      lbPerYd3: 2800, lowTons: 1.4, highTons: 1.7 },
  { id: "pea-gravel", name: "Pea gravel",            lbPerYd3: 2800, lowTons: 1.3, highTons: 1.5 },
  { id: "crushed",    name: "Crushed stone (#57)",   lbPerYd3: 2700, lowTons: 1.3, highTons: 1.5 },
  { id: "river-rock", name: "River rock (2\"–6\")",  lbPerYd3: 2700, lowTons: 1.3, highTons: 1.5 },
  { id: "limestone",  name: "Crushed limestone",     lbPerYd3: 2700, lowTons: 1.3, highTons: 1.5 },
  { id: "abc",        name: "Crusher run / ABC",     lbPerYd3: 3000, lowTons: 1.4, highTons: 1.8 },
  { id: "sand",       name: "Sand (dry)",            lbPerYd3: 2700, lowTons: 1.3, highTons: 1.5 },
  { id: "sand-wet",   name: "Sand (wet)",            lbPerYd3: 3240, lowTons: 1.5, highTons: 1.8 },
  { id: "topsoil",    name: "Topsoil (screened)",    lbPerYd3: 2000, lowTons: 0.9, highTons: 1.3 },
  { id: "fill-dirt",  name: "Fill dirt",             lbPerYd3: 2000, lowTons: 1.0, highTons: 1.4 },
  { id: "mulch",      name: "Bark mulch",            lbPerYd3: 800,  lowTons: 0.3, highTons: 0.5 },
  { id: "riprap",     name: "Riprap",                lbPerYd3: 2700, lowTons: 1.3, highTons: 1.6 },
  { id: "asphalt",    name: "Asphalt (hot mix)",     lbPerYd3: 3915, lowTons: 1.9, highTons: 2.1 },
];

/* Typical compacted depths. Aggregate settles when it is plate-compacted, so a
 * driveway base ordered at its finished depth comes up short. */
const DEPTHS = [
  ["Walkway or garden path", "2–3 in", "Light foot traffic only."],
  ["Gravel driveway, top course", "3–4 in", "Over an existing compacted base."],
  ["New gravel driveway, total", "8–12 in", "Base course plus top course."],
  ["Paver or patio base", "4–6 in", "Crusher run, compacted in 2 in lifts."],
  ["French drain / drainage bed", "6–12 in", "Washed stone, no fines."],
  ["Decorative landscape beds", "2–3 in", "Deeper buries plants."],
];

/* What a vehicle can legally haul. Pickups run out of payload long before the
 * bed is full, which is the mistake most homeowners make. */
const TRUCKS = [
  ["½-ton pickup (F-150, Silverado 1500)", "1 yd³", "≈1.4 tons — at payload, not a full bed."],
  ["¾/1-ton pickup (F-250, F-350)", "1.5–2 yd³", "≈2–3 tons."],
  ["Single-axle dump truck", "5 yd³", "≈7 tons."],
  ["Tandem-axle dump truck", "10–12 yd³", "≈14–16 tons. The usual delivery."],
  ["Tri-axle dump truck", "15–18 yd³", "≈20–25 tons."],
];

/* Delivered price ranges, national, US dollars, 2026. Bulk material is heavy
 * and cheap, so haul distance moves these more than the rock does. */
const PRICES = [
  ["Gravel (¼\"–2\")", "$15–$75", "$25–$100"],
  ["Pea gravel", "$30–$55", "$45–$85"],
  ["Crushed stone (#57)", "$20–$65", "$30–$90"],
  ["River rock", "$45–$130", "$65–$180"],
  ["Crusher run / ABC", "$15–$40", "$20–$55"],
  ["Sand", "$15–$50", "$20–$70"],
  ["Topsoil (screened)", "$12–$55", "$15–$70"],
  ["Fill dirt", "$5–$25", "$7–$35"],
];

module.exports = { MATERIALS, DEPTHS, TRUCKS, PRICES };
