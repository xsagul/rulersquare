/* Ruler Square — bulk material densities, depths, truck capacities, and price ranges.
 * Single source of truth for aggregate and soil calculators.
 */

const MATERIALS = [
  { id: "gravel",             name: "Gravel (¼\"–2\")",       lbPerYd3: 2800, lowTons: 1.4, highTons: 1.7 },
  { id: "pea-gravel",         name: "Pea gravel (⅜\")",       lbPerYd3: 2800, lowTons: 1.3, highTons: 1.5 },
  { id: "crushed",            name: "Crushed stone (#57)",    lbPerYd3: 2700, lowTons: 1.3, highTons: 1.5 },
  { id: "river-rock",         name: "River rock (1\"–3\")",   lbPerYd3: 2700, lowTons: 1.3, highTons: 1.5 },
  { id: "limestone",          name: "Crushed limestone",      lbPerYd3: 2700, lowTons: 1.3, highTons: 1.5 },
  { id: "abc",                name: "Crusher run / ABC",      lbPerYd3: 3000, lowTons: 1.4, highTons: 1.8 },
  { id: "decomposed-granite", name: "Decomposed granite",     lbPerYd3: 2900, lowTons: 1.4, highTons: 1.6 },
  { id: "sand",               name: "Sand (dry)",             lbPerYd3: 2700, lowTons: 1.3, highTons: 1.5 },
  { id: "sand-wet",           name: "Sand (wet)",             lbPerYd3: 3240, lowTons: 1.5, highTons: 1.8 },
  { id: "topsoil",            name: "Topsoil (screened)",     lbPerYd3: 2000, lowTons: 0.9, highTons: 1.3 },
  { id: "fill-dirt",          name: "Fill dirt",              lbPerYd3: 2000, lowTons: 1.0, highTons: 1.4 },
  { id: "compost",            name: "Compost (finished)",     lbPerYd3: 1000, lowTons: 0.4, highTons: 0.6 },
  { id: "mulch",              name: "Bark mulch",             lbPerYd3: 800,  lowTons: 0.3, highTons: 0.5 },
  { id: "riprap",             name: "Riprap",                 lbPerYd3: 2700, lowTons: 1.3, highTons: 1.6 },
  { id: "asphalt",            name: "Asphalt (hot mix)",      lbPerYd3: 3915, lowTons: 1.9, highTons: 2.1 },
];

const DEPTHS = [
  ["Walkway or garden path", "2–3 in", "Light foot traffic only."],
  ["Gravel driveway, top course", "3–4 in", "Over an existing compacted base."],
  ["New gravel driveway, total", "8–12 in", "Base course plus top course."],
  ["Paver or patio base", "4–6 in", "Crusher run, compacted in 2 in lifts."],
  ["French drain / drainage bed", "6–12 in", "Washed stone, no fines."],
  ["Decorative landscape beds", "2–3 in", "Deeper buries plants."],
];

const TRUCKS = [
  ["½-ton pickup (F-150, 1500)", "0.5–1 yd³", "≈0.7–1.4 tons — payload limit reached before bed is full."],
  ["¾/1-ton pickup (F-250, F-350)", "1.5–2 yd³", "≈2–3 tons."],
  ["Single-axle dump truck", "5 yd³", "≈7 tons."],
  ["Tandem-axle dump truck", "10–12 yd³", "≈14–16 tons (standard residential delivery)."],
  ["Tri-axle dump truck", "15–18 yd³", "≈20–25 tons."],
];

const PRICES = [
  ["Gravel (¼\"–2\")", "$15–$75", "$25–$100"],
  ["Pea gravel", "$30–$55", "$45–$85"],
  ["Crushed stone (#57)", "$20–$65", "$30–$90"],
  ["River rock", "$45–$130", "$65–$180"],
  ["Crusher run / ABC", "$15–$40", "$20–$55"],
  ["Decomposed granite", "$35–$65", "$50–$90"],
  ["Sand", "$15–$50", "$20–$70"],
  ["Topsoil (screened)", "$12–$55", "$15–$70"],
  ["Compost", "$25–$60", "$30–$70"],
  ["Fill dirt", "$5–$25", "$7–$35"],
];

module.exports = { MATERIALS, DEPTHS, TRUCKS, PRICES };
