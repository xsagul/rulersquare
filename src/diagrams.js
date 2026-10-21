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
  const mk = uid("dg");
  const A = [10, 110], B = [190, 110], C = [250, 60], D = [70, 60], t = 44;
  const [Ad, Bd, Cd] = [A, B, C].map(([x, y]) => [x, y + t]);
  return svg("0 0 340 215", `A slab with its three measurements arrowed: length along the front, width running back, ${down} through the edge.`,
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
  return svg("0 0 340 190", `A wall seen square on, with ${across} arrowed along the base and height up the side.`,
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

module.exports = { slab, area, wall, linear, round };

/* Which drawing belongs to which calculator. A page is listed only when the
 * drawing is unambiguously right for it: a wrong diagram is worse than none,
 * so a room with four walls, a sloped roof area or a multi-section area gets
 * nothing rather than a rectangle that misleads. */
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
