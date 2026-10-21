/* Measurement diagrams, as inline SVG.
 *
 * Inline rather than files: they are small, they cost no extra request, and
 * they inherit the page's colours, so one drawing works in both themes. The
 * strokes use currentColor and the labels our accent, which keeps them legible
 * on the dark background without shipping a second asset.
 *
 * The style is the one chosen in the A/B trial: dimension arrows with heads at
 * both ends and the field name spelled out, rather than single letters. It
 * reads as an instruction — go and measure this — which is what someone who
 * has never ordered concrete actually needs.
 *
 * They live in the results panel's empty state, not in the form. On a wide
 * layout that puts the drawing beside the fields, where calculator.net puts
 * its own. On a phone it falls under the Calculate button, which costs the
 * button nothing: a 157px drawing inside the form would push Calculate off the
 * first screen on most pages, undoing the work that got it there.
 */

/* An id repeated in one document is invalid, and for the arrow marker it is
 * ambiguous too: a second url(#...) would resolve to the first definition. */
let seq = 0;
const uid = prefix => prefix + "-" + (++seq);

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function svg(viewBox, title, inner) {
  return `<svg class="diagram diagram-dim" viewBox="${viewBox}" role="img" aria-label="${esc(title)}">${inner}</svg>`;
}

function arrows(mk, lines) {
  return `<defs><marker id="${mk}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="diagram-head"/></marker></defs>
  <g class="diagram-label" fill="none" stroke="currentColor" stroke-width="1.5">${lines.map(([x1, y1, x2, y2]) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-start="url(#${mk})" marker-end="url(#${mk})"/>`).join("")}</g>`;
}

const label = items => `<g class="diagram-label" font-size="17">${items.map(([x, y, s, anchor]) =>
  `<text x="${x}" y="${y}"${anchor ? ` text-anchor="${anchor}"` : ""}>${esc(s)}</text>`).join("")}</g>`;

const outline = paths => `<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round">${paths}</g>`;

/* ---------- A rectangular volume: length x width x depth ---------- */
/* Top face ABCD, front face A B B' A', right face B C C' B'. */
function slab(opts) {
  const down = (opts && opts.vertical) || "thickness";
  const name = (opts && opts.name) || "slab";
  const mk = uid("dg");
  const A = [10, 110], B = [190, 110], C = [250, 60], D = [70, 60], t = 44;
  const [Ad, Bd, Cd] = [A, B, C].map(([x, y]) => [x, y + t]);
  return svg("0 0 340 215", `A ${name} with its three measurements arrowed: length along the front, width running back, ${down} through the edge.`,
    arrows(mk, [
      [A[0], Ad[1] + 16, B[0], Ad[1] + 16],
      [100, A[1] + 7, 100, Ad[1] - 7],
      [Bd[0] + 12, Bd[1] + 9, Cd[0] + 12, Cd[1] + 9],
    ]) +
    outline(`<polygon points="${A} ${D} ${C} ${B}"/><polygon points="${A} ${B} ${Bd} ${Ad}"/><polygon points="${B} ${C} ${Cd} ${Bd}"/>`) +
    label([[100, 196, "length", "middle"], [100, 105, down, "middle"], [268, 112, "width"]]));
}

/* ---------- A flat area: length x width, nothing to dig ---------- */
function area() {
  const mk = uid("dg");
  const A = [10, 130], B = [190, 130], C = [250, 70], D = [70, 70];
  return svg("0 0 340 190", "A rectangular area with length arrowed along the front edge and width running back.",
    arrows(mk, [
      [A[0], A[1] + 20, B[0], A[1] + 20],
      [B[0] + 14, B[1] + 10, C[0] + 14, C[1] + 10],
    ]) +
    outline(`<polygon points="${A} ${D} ${C} ${B}"/>`) +
    label([[100, 174, "length", "middle"], [270, 92, "width"]]));
}

/* ---------- A wall, seen square on: length x height ---------- */
function wall(opts) {
  const across = (opts && opts.across) || "length";
  const mk = uid("dg");
  const x1 = 20, x2 = 250, y1 = 25, y2 = 150;
  return svg("0 0 340 205", `A wall seen square on, with ${across} arrowed along the base and height up the side.`,
    arrows(mk, [
      [x1, y2 + 20, x2, y2 + 20],
      [x2 + 22, y1, x2 + 22, y2],
    ]) +
    outline(`<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}"/>`) +
    label([[(x1 + x2) / 2, y2 + 45, across, "middle"], [x2 + 32, (y1 + y2) / 2 + 6, "height"]]));
}

/* ---------- A straight run of fence: one length ---------- */
function linear(opts) {
  const across = (opts && opts.across) || "length";
  const mk = uid("dg");
  const y = 95, x1 = 25, x2 = 265;
  const posts = [25, 105, 185, 265].map(x => `<line x1="${x}" y1="${y - 42}" x2="${x}" y2="${y}"/>`).join("");
  return svg("0 0 340 170", `A straight run with its total ${across} arrowed along the ground.`,
    arrows(mk, [[x1, y + 26, x2, y + 26]]) +
    outline(`${posts}<line x1="${x1 - 14}" y1="${y}" x2="${x2 + 14}" y2="${y}"/><line x1="${x1}" y1="${y - 30}" x2="${x2}" y2="${y - 30}"/>`) +
    label([[(x1 + x2) / 2, y + 52, across, "middle"]]));
}

/* ---------- A round pour: diameter x depth ---------- */
function round(opts) {
  const down = (opts && opts.vertical) || "thickness";
  const mk = uid("dg");
  const cx = 140, cy = 95, rx = 115, ry = 36, t = 46;
  return svg("0 0 340 215", `A round pour with the diameter arrowed across the top and ${down} down the side.`,
    arrows(mk, [
      [cx - rx, cy - 58, cx + rx, cy - 58],
      [cx + rx + 20, cy, cx + rx + 20, cy + t],
    ]) +
    outline(`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/><path d="M${cx - rx},${cy} v${t} a${rx},${ry} 0 0 0 ${rx * 2},0 v-${t}"/>`) +
    label([[cx, cy - 68, "diameter", "middle"], [cx + rx + 30, cy + t / 2 + 6, down]]));
}

/* ---------- A flight of stairs in profile: total rise, riser, tread ---------- */
function stair() {
  const mk = uid("dg");
  const steps = "M10,190 H20 V155 H70 V120 H120 V85 H170 V50 H250";
  return svg("0 0 340 215", "A flight of stairs in profile, with the total rise arrowed from floor to floor, one riser and one tread.",
    arrows(mk, [
      [262, 50, 262, 190],
      [60, 122, 60, 153],
      [122, 75, 168, 75],
    ]) +
    outline(`<path d="${steps}"/><line x1="10" y1="190" x2="250" y2="190" stroke-dasharray="4 4"/>`) +
    label([[272, 126, "total rise"], [52, 144, "riser", "end"], [145, 66, "tread", "middle"]]));
}

/* ---------- A right triangle: rise over run ---------- */
function pitch() {
  const mk = uid("dg");
  return svg("0 0 340 215", "A right triangle with the run arrowed along the base and the rise up the vertical side.",
    arrows(mk, [
      [30, 192, 250, 192],
      [272, 62, 272, 168],
    ]) +
    outline(`<polygon points="30,170 250,170 250,60"/><path d="M238,170 V158 H250"/>`) +
    label([[140, 212, "run", "middle"], [282, 120, "rise"]]));
}

/* ---------- A ramp: its rise, and how wide it is ---------- */
function ramp() {
  const mk = uid("dg");
  const A = [20, 170], B = [220, 170], C = [220, 120], off = [50, -40];
  const [Ab, Bb, Cb] = [A, B, C].map(([x, y]) => [x + off[0], y + off[1]]);
  return svg("0 0 340 200", "A ramp seen from the side and above, with the rise arrowed at the high end and the width across it.",
    arrows(mk, [
      [208, 124, 208, 166],
      [B[0] + 12, B[1] + 9, Bb[0] + 12, Bb[1] + 9],
    ]) +
    outline(`<polygon points="${A} ${B} ${C}"/><polygon points="${B} ${Bb} ${Cb} ${C}"/><polygon points="${A} ${C} ${Cb} ${Ab}"/>`) +
    label([[198, 157, "rise", "end"], [292, 168, "width"]]));
}

/* ---------- A slab's rebar mat, seen from above ---------- */
function grid() {
  const mk = uid("dg");
  const x1 = 40, x2 = 250, y1 = 45, y2 = 175;
  const bars = [70, 100, 130, 160, 190, 220].map(x => `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"/>`).join("") +
    [75, 105, 135, 165].map(y => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/>`).join("");
  return svg("0 0 340 230", "A slab seen from above with its rebar grid, the length and width arrowed along the edges and the spacing between two bars.",
    arrows(mk, [
      [x1, y2 + 22, x2, y2 + 22],
      [x2 + 22, y1, x2 + 22, y2],
      [70, 32, 100, 32],
    ]) +
    outline(`<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}"/><g stroke-width="1" stroke-dasharray="2 3">${bars}</g>`) +
    label([[(x1 + x2) / 2, y2 + 47, "length", "middle"], [x2 + 32, (y1 + y2) / 2 + 6, "width"], [85, 22, "spacing", "middle"]]));
}

/* ---------- A house end with its gable: wall length, wall height, peak ---------- */
function gable() {
  const mk = uid("dg");
  return svg("0 0 340 240", "The end of a house: a rectangular wall with a triangular gable above it, with the wall length, the wall height and the height of the gable peak arrowed.",
    arrows(mk, [
      [20, 210, 240, 210],
      [262, 92, 262, 190],
      [262, 32, 262, 88],
    ]) +
    outline(`<rect x="20" y="90" width="220" height="100"/><polyline points="20,90 130,30 240,90"/>`) +
    label([[130, 234, "wall length", "middle"], [272, 146, "height"], [272, 66, "peak"]]));
}

/* ---------- Board and batten: the wall width and the space between battens ---------- */
function battens() {
  const mk = uid("dg");
  const x1 = 20, x2 = 250, y1 = 30, y2 = 170, w = 10;
  const at = [x1, 93, 167, x2 - w];
  return svg("0 0 340 225", "A wall with vertical battens at equal spacing, with the total wall width arrowed along the bottom and one space between battens arrowed.",
    arrows(mk, [
      [x1, y2 + 22, x2, y2 + 22],
      [x1 + w, 100, at[1], 100],
    ]) +
    outline(`<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}"/>${at.map(x => `<rect x="${x}" y="${y1}" width="${w}" height="${y2 - y1}"/>`).join("")}`) +
    label([[(x1 + x2) / 2, y2 + 47, "wall width", "middle"], [(x1 + w + at[1]) / 2, 90, "space", "middle"]]));
}

/* ---------- A roof seen end on: footprint width with the overhang, and pitch ---------- */
function roof() {
  const mk = uid("dg");
  const at = x => 50 + 78 * (x - 140) / 115;
  return svg("0 0 340 230", "The end of a house with a gable roof, with the footprint width arrowed from eave to eave including the overhang, and the pitch marked as a rise over a 12-inch run.",
    arrows(mk, [[25, 210, 255, 210]]) +
    outline(`<polyline points="50,111 50,190 230,190 230,111"/><polyline points="25,128 140,50 255,128"/>
      <g stroke-width="1.25" stroke-dasharray="3 3"><line x1="25" y1="128" x2="25" y2="200"/><line x1="255" y1="128" x2="255" y2="200"/></g>
      <path d="M190,${at(190)} H235 V${at(235)}" stroke-width="1.25"/>`) +
    label([[140, 230, "footprint width", "middle"], [212, at(190) - 8, "12", "middle"], [241, (at(190) + at(235)) / 2 + 6, "rise"]]));
}

/* ---------- Every square footage shape, with what to measure on each ---------- */
function areaShapes() {
  const mk = uid("dg");
  return svg("0 0 360 280", "Four shapes with what to measure on each: a rectangle's length and width, a circle's diameter, a triangle's base and height, and a trapezoid's two parallel sides and height.",
    arrows(mk, [
      [15, 92, 100, 92], [114, 15, 114, 75],
      [202, 50, 278, 50],
      [15, 245, 95, 245], [108, 165, 108, 230],
      [205, 157, 265, 157], [185, 245, 285, 245], [300, 170, 300, 230],
    ]) +
    outline(`<rect x="15" y="15" width="85" height="60"/><circle cx="240" cy="50" r="38"/>
      <polygon points="15,230 95,230 55,165"/><polygon points="185,230 285,230 265,170 205,170"/>`) +
    label([[57, 112, "length", "middle"], [122, 50, "width"], [240, 108, "diameter", "middle"],
      [55, 266, "base", "middle"], [116, 202, "height"], [235, 150, "side A", "middle"], [235, 266, "side B", "middle"], [306, 205, "height"]]));
}

module.exports = { slab, area, wall, linear, round, stair, pitch, ramp, grid, gable, battens, roof, areaShapes };

/* Which drawing belongs to which calculator. A page is listed only when the
 * drawing is unambiguously right for it: a wrong diagram is worse than none,
 * so a room with four walls (drywall, paint) gets nothing rather than a
 * rectangle that misleads. Nor does a page whose only measurement is an area
 * already worked out (insulation, grout, thinset, sod): a length-by-width
 * drawing would point at fields that are not there. Where a field takes an
 * area that has to be measured a particular way — a wall with its gable, a
 * roof footprint with its overhang — the drawing shows that way. */
const D = {
  // length x width x depth
  "cubic-yard-calculator": () => slab({ vertical: "depth" }),
  // length x width, flat
  "deck-calculator": area, "tile-calculator": area, "paver-calculator": area,
  "concrete-slab-cost": area, "concrete-patio-cost": area,
  "concrete-driveway-cost": area, "construction-cost-calculator": area,
  "deck-cost-calculator": area,
  // length x exposed height
  "retaining-wall-calculator": wall,
  "retaining-wall-cost": () => wall({ across: "wall length" }),
  // one run
  "fence-calculator": linear, "fence-installation-cost": linear,
  "framing-calculator": () => linear({ across: "wall length" }),
  // length x height, seen square on
  "brick-calculator": wall,
  // a single solid: the board, or any box
  "board-foot-calculator": () => slab({ name: "board" }),
  "cubic-feet-calculator": () => slab({ vertical: "height", name: "box" }),
  // the shapes that need their own drawing
  "stair-calculator": stair,
  "roof-pitch-calculator": pitch,
  "ramp-calculator": ramp,
  "rebar-calculator": grid,
  "siding-calculator": gable,
  "board-and-batten-calculator": battens,
  "roofing-calculator": roof,
  "tank-volume-calculator": () => shapeSet([["cylinder", round({ vertical: "height" })], ["rectangle", slab({ vertical: "height", name: "tank" })]]),
};

function diagramFor(slug) {
  return D[slug] ? D[slug]() : "";
}

/* Pages with shape tabs carry every drawing and show the active one. The tabs
 * already exist; this only keeps the picture honest when the shape changes. */
function shapeSet(shapes) {
  return shapes.map(([value, svgMarkup], i) =>
    `<div data-diagram="${value}"${i ? " hidden" : ""}>${svgMarkup}</div>`).join("");
}

module.exports.diagramFor = diagramFor;
module.exports.shapeSet = shapeSet;
