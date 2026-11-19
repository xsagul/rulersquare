/* Inline SVG measurement diagrams. Inherit light/dark theme via currentColor and --accent. */

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

const label = items => `<g class="diagram-label" font-size="16">${items.map(([x, y, s, anchor]) =>
  `<text x="${x}" y="${y}"${anchor ? ` text-anchor="${anchor}"` : ""}>${esc(s)}</text>`).join("")}</g>`;

const outline = paths => `<g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round">${paths}</g>`;

function slab(opts) {
  const down = (opts && opts.vertical) || "thickness";
  const name = (opts && opts.name) || "slab";
  const mk = uid("dg");
  const A = [10, 110], B = [190, 110], C = [250, 60], D = [70, 60], t = 44;
  const [Ad, Bd, Cd] = [A, B, C].map(([x, y]) => [x, y + t]);
  return svg("0 0 340 215", `A ${name} showing length, width, and ${down}.`,
    arrows(mk, [
      [A[0], Ad[1] + 16, B[0], Ad[1] + 16],
      [100, A[1] + 7, 100, Ad[1] - 7],
      [Bd[0] + 12, Bd[1] + 9, Cd[0] + 12, Cd[1] + 9],
    ]) +
    outline(`<polygon points="${A} ${D} ${C} ${B}"/><polygon points="${A} ${B} ${Bd} ${Ad}"/><polygon points="${B} ${C} ${Cd} ${Bd}"/>`) +
    label([[100, 196, "length", "middle"], [100, 105, down, "middle"], [268, 112, "width"]]));
}

function area() {
  const mk = uid("dg");
  const A = [10, 130], B = [190, 130], C = [250, 70], D = [70, 70];
  return svg("0 0 340 190", "A rectangular area showing length and width.",
    arrows(mk, [
      [A[0], A[1] + 20, B[0], A[1] + 20],
      [B[0] + 14, B[1] + 10, C[0] + 14, C[1] + 10],
    ]) +
    outline(`<polygon points="${A} ${D} ${C} ${B}"/>`) +
    label([[100, 174, "length", "middle"], [270, 92, "width"]]));
}

function room() {
  const mk = uid("dg");
  return svg("0 0 340 220", "A room showing length, width, and wall height.",
    arrows(mk, [
      [25, 195, 195, 195],
      [212, 180, 265, 135],
      [278, 35, 278, 125],
    ]) +
    outline(`<polygon points="25,175 195,175 255,125 85,125"/><polyline points="25,175 25,85 85,35 255,35 255,125"/><line x1="85" y1="35" x2="85" y2="125"/>`) +
    label([[110, 214, "length", "middle"], [268, 168, "width"], [286, 86, "height"]]));
}

function wall(opts) {
  const across = (opts && opts.across) || "length";
  const mk = uid("dg");
  const x1 = 20, x2 = 250, y1 = 25, y2 = 150;
  return svg("0 0 340 205", `A wall showing ${across} and height.`,
    arrows(mk, [
      [x1, y2 + 20, x2, y2 + 20],
      [x2 + 22, y1, x2 + 22, y2],
    ]) +
    outline(`<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}"/>`) +
    label([[(x1 + x2) / 2, y2 + 45, across, "middle"], [x2 + 32, (y1 + y2) / 2 + 6, "height"]]));
}

function linear(opts) {
  const across = (opts && opts.across) || "length";
  const mk = uid("dg");
  const y = 95, x1 = 25, x2 = 265;
  const posts = [25, 105, 185, 265].map(x => `<line x1="${x}" y1="${y - 42}" x2="${x}" y2="${y}"/>`).join("");
  return svg("0 0 340 170", `A straight run showing total ${across}.`,
    arrows(mk, [[x1, y + 26, x2, y + 26]]) +
    outline(`${posts}<line x1="${x1 - 14}" y1="${y}" x2="${x2 + 14}" y2="${y}"/><line x1="${x1}" y1="${y - 30}" x2="${x2}" y2="${y - 30}"/>`) +
    label([[(x1 + x2) / 2, y + 52, across, "middle"]]));
}

function round(opts) {
  const down = (opts && opts.vertical) || "thickness";
  const mk = uid("dg");
  const cx = 140, cy = 95, rx = 115, ry = 36, t = 46;
  return svg("0 0 340 215", `A cylinder showing diameter and ${down}.`,
    arrows(mk, [
      [cx - rx, cy - 58, cx + rx, cy - 58],
      [cx + rx + 20, cy, cx + rx + 20, cy + t],
    ]) +
    outline(`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/><path d="M${cx - rx},${cy} v${t} a${rx},${ry} 0 0 0 ${rx * 2},0 v-${t}"/>`) +
    label([[cx, cy - 68, "diameter", "middle"], [cx + rx + 30, cy + t / 2 + 6, down]]));
}

function stair() {
  const mk = uid("dg");
  const steps = "M10,190 H20 V155 H70 V120 H120 V85 H170 V50 H250";
  return svg("0 0 340 215", "Stairs in profile showing total rise, riser, and tread.",
    arrows(mk, [
      [262, 50, 262, 190],
      [60, 122, 60, 153],
      [122, 75, 168, 75],
    ]) +
    outline(`<path d="${steps}"/><line x1="10" y1="190" x2="250" y2="190" stroke-dasharray="4 4"/>`) +
    label([[272, 126, "total rise"], [52, 144, "riser", "end"], [145, 66, "tread", "middle"]]));
}

function curb() {
  const mk = uid("dg");
  return svg("0 0 340 205", "Curb and gutter cross-section showing curb height, curb depth, gutter width, and flag thickness.",
    arrows(mk, [
      [30, 50, 30, 120],
      [48, 35, 92, 35],
      [94, 178, 240, 178],
      [256, 120, 256, 158],
    ]) +
    outline(`<polygon points="48,50 92,50 92,120 240,120 240,158 48,158"/>`) +
    label([[20, 90, "height", "end"], [70, 26, "curb", "middle"], [168, 198, "gutter width", "middle"], [264, 144, "flag"]]));
}

function pitch() {
  const mk = uid("dg");
  return svg("0 0 340 215", "Right triangle showing run along base and rise vertically.",
    arrows(mk, [
      [30, 192, 250, 192],
      [272, 62, 272, 168],
    ]) +
    outline(`<polygon points="30,170 250,170 250,60"/><path d="M238,170 V158 H250"/>`) +
    label([[140, 212, "run", "middle"], [282, 120, "rise"]]));
}

function ramp() {
  const mk = uid("dg");
  const A = [20, 170], B = [220, 170], C = [220, 120], off = [50, -40];
  const [Ab, Bb, Cb] = [A, B, C].map(([x, y]) => [x + off[0], y + off[1]]);
  return svg("0 0 340 200", "Ramp showing rise and width.",
    arrows(mk, [
      [208, 124, 208, 166],
      [B[0] + 12, B[1] + 9, Bb[0] + 12, Bb[1] + 9],
    ]) +
    outline(`<polygon points="${A} ${B} ${C}"/><polygon points="${B} ${Bb} ${Cb} ${C}"/><polygon points="${A} ${C} ${Cb} ${Ab}"/>`) +
    label([[198, 157, "rise", "end"], [292, 168, "width"]]));
}

function grid() {
  const mk = uid("dg");
  const x1 = 40, x2 = 250, y1 = 45, y2 = 175;
  const bars = [70, 100, 130, 160, 190, 220].map(x => `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"/>`).join("") +
    [75, 105, 135, 165].map(y => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/>`).join("");
  return svg("0 0 340 230", "Slab rebar grid showing length, width, and bar spacing.",
    arrows(mk, [
      [x1, y2 + 22, x2, y2 + 22],
      [x2 + 22, y1, x2 + 22, y2],
      [70, 32, 100, 32],
    ]) +
    outline(`<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}"/><g stroke-width="1" stroke-dasharray="2 3">${bars}</g>`) +
    label([[(x1 + x2) / 2, y2 + 47, "length", "middle"], [x2 + 32, (y1 + y2) / 2 + 6, "width"], [85, 22, "spacing", "middle"]]));
}

function gable() {
  const mk = uid("dg");
  return svg("0 0 340 240", "House exterior wall with triangular gable showing wall length, wall height, and gable peak.",
    arrows(mk, [
      [20, 210, 240, 210],
      [262, 92, 262, 190],
      [262, 32, 262, 88],
    ]) +
    outline(`<rect x="20" y="90" width="220" height="100"/><polyline points="20,90 130,30 240,90"/>`) +
    label([[130, 234, "wall length", "middle"], [272, 146, "height"], [272, 66, "peak"]]));
}

function battens(opts) {
  const lbl = (opts && opts.space) || "space";
  const across = (opts && opts.across) || "wall width";
  const mk = uid("dg");
  const x1 = 20, x2 = 250, y1 = 30, y2 = 170, w = 10;
  const at = [x1, 93, 167, x2 - w];
  return svg("0 0 340 225", `Vertical members at equal spacing showing ${across} and ${lbl}.`,
    arrows(mk, [
      [x1, y2 + 22, x2, y2 + 22],
      [x1 + w, 100, at[1], 100],
    ]) +
    outline(`<rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}"/>${at.map(x => `<rect x="${x}" y="${y1}" width="${w}" height="${y2 - y1}"/>`).join("")}`) +
    label([[(x1 + x2) / 2, y2 + 47, across, "middle"], [(x1 + w + at[1]) / 2, 90, lbl, "middle"]]));
}

function roof() {
  const mk = uid("dg");
  const at = x => 50 + 78 * (x - 140) / 115;
  return svg("0 0 340 230", "House roof showing footprint width with overhangs and rise over 12-inch run.",
    arrows(mk, [[25, 210, 255, 210]]) +
    outline(`<polyline points="50,111 50,190 230,190 230,111"/><polyline points="25,128 140,50 255,128"/>
      <g stroke-width="1.25" stroke-dasharray="3 3"><line x1="25" y1="128" x2="25" y2="200"/><line x1="255" y1="128" x2="255" y2="200"/></g>
      <path d="M190,${at(190)} H235 V${at(235)}" stroke-width="1.25"/>`) +
    label([[140, 230, "footprint width", "middle"], [212, at(190) - 8, "12", "middle"], [241, (at(190) + at(235)) / 2 + 6, "rise"]]));
}

function pool() {
  const mk = uid("dg");
  return svg("0 0 340 205", "Pool cross-section showing length, shallow depth, and deep depth.",
    arrows(mk, [
      [25, 36, 255, 36],
      [25, 58, 25, 118],
      [268, 58, 268, 168],
    ]) +
    outline(`<polygon points="25,58 255,58 255,168 115,168 25,118"/>`) +
    label([[140, 26, "length", "middle"], [16, 94, "shallow", "end"], [276, 118, "deep"]]));
}

function areaShapes() {
  const mk = uid("dg");
  return svg("0 0 360 280", "Four shapes: rectangle, circle, triangle, and trapezoid.",
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

function shapeSet(shapes) {
  return shapes.map(([value, svgMarkup], i) =>
    `<div data-diagram="${value}"${i ? " hidden" : ""}>${svgMarkup}</div>`).join("");
}

const D = {
  "cubic-yard-calculator": () => slab({ vertical: "depth" }),
  "deck-calculator": area, "tile-calculator": area, "paver-calculator": area,
  "flooring-calculator": area, "carpet-calculator": area, "plywood-calculator": area,
  "acreage-calculator": area, "bathroom-fan-cfm-calculator": room,
  "drywall-calculator": room, "paint-calculator": room, "wallpaper-calculator": () => wall({ across: "total wall width" }),
  "concrete-slab-cost": area, "concrete-patio-cost": area, "concrete-driveway-cost": area,
  "asphalt-driveway-cost": area, "epoxy-garage-floor-cost": area, "deck-staining-cost": area,
  "carpet-installation-cost": area, "laminate-flooring-installation-cost": area,
  "tile-installation-cost": area, "home-addition-cost": area,
  "construction-cost-calculator": area, "deck-cost-calculator": area,
  "retaining-wall-calculator": wall,
  "retaining-wall-cost": () => wall({ across: "wall length" }),
  "fence-calculator": linear, "fence-installation-cost": linear, "french-drain-cost": () => linear({ across: "trench length" }),
  "framing-calculator": () => linear({ across: "wall length" }),
  "baseboard-calculator": () => linear({ across: "perimeter" }),
  "crown-molding-calculator": () => linear({ across: "perimeter" }),
  "brick-calculator": wall, "concrete-block-calculator": wall,
  "board-foot-calculator": () => slab({ name: "board" }),
  "cubic-feet-calculator": () => slab({ vertical: "height", name: "box" }),
  "raised-bed-soil-calculator": () => slab({ vertical: "depth", name: "raised bed" }),
  "firewood-calculator": () => slab({ vertical: "height", name: "wood stack" }),
  "stair-calculator": stair, "concrete-steps-calculator": stair,
  "roof-pitch-calculator": pitch,
  "ramp-calculator": ramp,
  "rebar-calculator": grid,
  "siding-calculator": gable, "exterior-paint-calculator": gable,
  "board-and-batten-calculator": () => battens(),
  "baluster-spacing-calculator": () => battens({ across: "opening length", space: "gap ≤ 4\"" }),
  "wainscoting-calculator": () => battens({ across: "wall width", space: "panel" }),
  "roofing-calculator": roof, "metal-roofing-calculator": roof, "gutter-size-calculator": roof,
  "sonotube-calculator": () => round({ vertical: "depth" }),
  "fence-post-concrete-calculator": () => round({ vertical: "hole depth" }),
  "concrete-bag-calculator": () => shapeSet([["slab", slab()], ["column", round({ vertical: "height" })]]),
  "pool-volume-calculator": pool,
  "tank-volume-calculator": () => shapeSet([["cylinder", round({ vertical: "height" })], ["rectangle", slab({ vertical: "height", name: "tank" })]]),
};

function diagramFor(slug) {
  return D[slug] ? D[slug]() : "";
}

module.exports = { slab, area, room, wall, linear, round, stair, curb, pitch, ramp, grid, gable, battens, roof, pool, areaShapes, diagramFor, shapeSet };
