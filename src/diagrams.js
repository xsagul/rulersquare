/* Measurement diagrams, as inline SVG.
 *
 * Inline rather than files: they are small, they cost no extra request, and
 * they inherit the page's colours, so one drawing works in both themes. The
 * strokes use currentColor and the labels our accent, which is what keeps them
 * legible on the dark background without shipping a second asset.
 *
 * Two styles are on trial here, drawn from how the category leaders do it:
 *
 *   A — calculator.net: a small wireframe, hidden edges dashed, single-letter
 *       labels, no arrows. Schematic. Reads as a key to the field names.
 *   B — inchcalculator: larger, no hidden edges, dimension arrows with heads
 *       at both ends and the field name spelled out. Reads as an instruction
 *       for what to go and measure.
 *
 * Both draw the same slab so the comparison is about the style, not the shape.
 */

/* Shared box geometry. Top face ABCD, front face A B B' A', right face B C C' B'.
 * D' is the hidden back-left corner. */
const BOX = {
  A: [10, 110], B: [190, 110], C: [250, 60], D: [70, 60],
  drop: 44,
};
const low = ([x, y]) => [x, y + BOX.drop];
const pts = arr => arr.map(p => p.join(",")).join(" ");

/* A page may carry the same drawing more than once, and an id repeated in one
 * document is both invalid and, for the arrow marker, ambiguous: the second
 * url(#...) would resolve to the first definition. Each call gets its own. */
let seq = 0;
const uid = prefix => prefix + "-" + (++seq);

/* A — calculator.net: wireframe, dashed hidden edges, single letters. */
function slabWireframe() {
  const t = uid("dg-wire");
  const { A, B, C, D } = BOX;
  const [Ad, Bd, Cd, Dd] = [A, B, C, D].map(low);
  return `<svg class="diagram diagram-wire" viewBox="0 0 300 185" role="img" aria-labelledby="${t}">
  <title id="${t}">A slab drawn as a wireframe box: l is the length along the front edge, w the width running back, t the thickness.</title>
  <g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">
    <polyline stroke-dasharray="3 3" points="${pts([D, Dd])}"/>
    <polyline stroke-dasharray="3 3" points="${pts([Ad, Dd, Cd])}"/>
    <polygon points="${pts([A, D, C, B])}"/>
    <polygon points="${pts([A, B, Bd, Ad])}"/>
    <polygon points="${pts([B, C, Cd, Bd])}"/>
  </g>
  <g class="diagram-label" font-size="22" font-style="italic" text-anchor="middle">
    <text x="100" y="162">l</text>
    <text x="228" y="140">w</text>
    <text x="268" y="93">t</text>
  </g>
</svg>`;
}

/* B — inchcalculator: dimension arrows and the field name written out. The
 * marker id is namespaced because several diagrams may share one page. */
function slabDimensioned() {
  const t = uid("dg-dim");
  const mk = uid("dg-arrow");
  const { A, B, C, D } = BOX;
  const [Ad, Bd, Cd] = [A, B, C].map(low);
  const arrow = (x1, y1, x2, y2) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-start="url(#${mk})" marker-end="url(#${mk})"/>`;
  return `<svg class="diagram diagram-dim" viewBox="0 0 340 205" role="img" aria-labelledby="${t}">
  <title id="${t}">A slab with its three measurements arrowed: length along the front, width running back, thickness through the edge.</title>
  <defs>
    <marker id="${mk}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor" class="diagram-label"/>
    </marker>
  </defs>
  <g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round">
    <polygon points="${pts([A, D, C, B])}"/>
    <polygon points="${pts([A, B, Bd, Ad])}"/>
    <polygon points="${pts([B, C, Cd, Bd])}"/>
  </g>
  <g class="diagram-label" fill="none" stroke="currentColor" stroke-width="1.5">
    ${arrow(A[0], Ad[1] + 16, B[0], Ad[1] + 16)}
    ${arrow(100, A[1] + 7, 100, Ad[1] - 7)}
    ${arrow(Bd[0] + 12, Bd[1] + 9, Cd[0] + 12, Cd[1] + 9)}
  </g>
  <g class="diagram-label" font-size="17">
    <text x="100" y="196" text-anchor="middle">length</text>
    <text x="100" y="105" text-anchor="middle">thickness</text>
    <text x="268" y="112">width</text>
  </g>
</svg>`;
}

module.exports = { slabWireframe, slabDimensioned };
