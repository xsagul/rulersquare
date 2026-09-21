/* Inline SVG icons. Drawn on a 24×24 grid, currentColor only, so they inherit
 * the accent and cost nothing extra to load. */
const P = (d, extra = "") =>
  `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}${extra}</svg>`;

const ICONS = {
  // Slab being poured off a chute
  concrete: P('<path d="M2 16h20v4H2z"/><path d="M6 16V9a3 3 0 0 1 3-3h4"/><path d="M13 3h6v6h-6z"/>'),
  // Loose angular stone
  gravel: P('<circle cx="7" cy="16" r="2.4"/><circle cx="13" cy="18" r="1.8"/><circle cx="17.5" cy="14.5" r="2.6"/><circle cx="11" cy="12" r="2"/><path d="M2 21h20"/>'),
  // Larger crushed rock
  stone: P('<path d="M4 18l3-7 5-2 5 3 3 6z"/><path d="M7 11l5 7M12 9l5 9"/><path d="M2 21h20"/>'),
  // Sand pile with grains
  sand: P('<path d="M3 19c3-6 6-9 9-9s6 3 9 9z"/><path d="M2 21h20"/><circle cx="9" cy="16" r=".5" fill="currentColor"/><circle cx="14" cy="17" r=".5" fill="currentColor"/><circle cx="12" cy="14" r=".5" fill="currentColor"/>'),
  // Sprout in a soil bed
  topsoil: P('<path d="M2 17h20v4H2z"/><path d="M12 17V9"/><path d="M12 11c0-2.2 1.8-4 4-4 0 2.2-1.8 4-4 4z"/><path d="M12 13c0-1.7-1.3-3-3-3 0 1.7 1.3 3 3 3z"/>'),
  // Graded fill with a level line
  dirt: P('<path d="M2 20h20"/><path d="M4 20c2-5 5-8 8-8s6 3 8 8"/><path d="M3 12h18" stroke-dasharray="3 2.5"/>'),
  // Paving roller over a finished mat
  asphalt: P('<path d="M2 20h20"/><path d="M3 16h18v4H3z"/><circle cx="8" cy="9" r="4"/><path d="M12 5h7v8h-7"/>'),
  // Measuring frame with a diagonal
  sqft: P('<path d="M3 3h18v18H3z"/><path d="M3 21 21 3"/><path d="M3 9h4M3 15h4M9 21v-4M15 21v-4"/>'),
  // Rounded stones
  rock: P('<path d="M2 21h20"/><ellipse cx="8" cy="16" rx="5" ry="4"/><ellipse cx="16.5" cy="17" rx="4" ry="3.2"/><ellipse cx="13" cy="10" rx="3.5" ry="2.8"/>'),
  // Mulch bed with a shoot
  mulch: P('<path d="M2 18h20v3H2z"/><path d="M4 18c1-1.6 2.4-1.6 3.4 0M9 18c1-1.6 2.4-1.6 3.4 0M14 18c1-1.6 2.4-1.6 3.4 0"/><path d="M12 15V8"/><path d="M12 10c0-2 1.6-3.5 3.5-3.5C15.5 8.5 13.9 10 12 10z"/>'),
  // Payslip with a currency line
  paycheck: P('<path d="M5 3h14v18l-2.3-1.6L14.4 21 12 19.4 9.6 21 7.3 19.4 5 21z"/><path d="M12 7.5v8"/><path d="M14.2 9.3c-.5-.7-1.3-1-2.2-1-1.2 0-2.1.6-2.1 1.6 0 2.3 4.4 1.2 4.4 3.5 0 1.1-1 1.7-2.3 1.7-1 0-1.8-.4-2.3-1.1"/>'),
  // Folding rule, for feet and inches
  ruler: P('<path d="M2.5 9h19v6h-19z"/><path d="M6 9v3M9.5 9v4M13 9v3M16.5 9v4M20 9v3"/>'),
  // Open box, for cubic volume
  cube: P('<path d="M12 2.8 21 7.4v9.2L12 21.2 3 16.6V7.4z"/><path d="M3 7.4 12 12l9-4.6M12 12v9.2"/>'),
  // Cylinder with a fill line, for tank capacity
  tank: P('<ellipse cx="12" cy="5.5" rx="7" ry="2.7"/><path d="M5 5.5v13c0 1.5 3.1 2.7 7 2.7s7-1.2 7-2.7v-13"/><path d="M5.4 13.5c1.2 1 3.7 1.7 6.6 1.7s5.4-.7 6.6-1.7"/>'),
  // Fence: pickets over two rails
  fence: P('<path d="M4 8h16M4 14h16"/><path d="M6 4v17M12 4v17M18 4v17"/><path d="m6 4 1.5 2M12 4l1.5 2M18 4l1.5 2"/>'),
  // Deck: boards with gaps
  deck: P('<path d="M3 6h18M3 10h18M3 14h18M3 18h18"/><path d="M6 6v12M18 6v12"/>'),
  // Siding: lapped courses
  siding: P('<path d="M3 7h18v3.5H3zM3 13.5h18V17H3z"/><path d="M3 4h18M3 20h18"/>'),
  // Drywall: a sheet with a cut corner
  drywall: P('<path d="M4 3h11l5 5v13H4z"/><path d="M15 3v5h5"/><path d="M8 13h8M8 17h5"/>'),
  // Tile: a grid
  tile: P('<path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"/>'),
  // Pavers: interlocking rectangles
  paver: P('<path d="M3 4h9v6H3zM14 4h7v6h-7zM3 12h7v8H3zM12 12h9v8h-9z"/>'),
  // Paint roller
  paint: P('<path d="M3 4h12v5H3z"/><path d="M15 6.5h4v4h-7v3"/><path d="M10 13.5h4v7h-4z"/>'),
  // Roof with a ridge
  roofing: P('<path d="m2 12 10-8 10 8"/><path d="M5 10.6V20h14v-9.4"/><path d="M9 20v-5h6v5"/>'),
  // Retaining wall: staggered blocks
  wall: P('<path d="M2 20h20"/><path d="M3 15h7v5H3zM10 15h8v5h-8zM5 10h8v5H5zM13 10h6v5h-6zM7 5h8v5H7z"/>'),
  // Insulation batt
  insulation: P('<path d="M4 3h16v18H4z"/><path d="M4 7.5c3 0 3 2.5 6 2.5s3-2.5 6-2.5 3 2.5 4 2.5M4 13.5c3 0 3 2.5 6 2.5s3-2.5 6-2.5 3 2.5 4 2.5"/>'),
  // Board and batten: vertical strips
  batten: P('<path d="M3 3h18v18H3z"/><path d="M8 3v18M13 3v18M18 3v18"/>'),
  // Trowel, for grout and thinset
  trowel: P('<path d="M3 14 12 4l9 10-9 3z"/><path d="M12 17v4"/><path d="M10 21h4"/>'),
  // Price tag, for cost pages
  cost: P('<path d="M20.5 12.5 12 21 3 12V3h9z"/><path d="M7.2 7.2v.1"/><path d="M13 10.5c-.4-.5-1-.8-1.7-.8-1 0-1.7.5-1.7 1.3 0 1.8 3.5 1 3.5 2.8 0 .9-.8 1.4-1.8 1.4-.8 0-1.4-.3-1.8-.9"/>'),
  // Circled i, for the About link
  info: P('<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.6v.1"/>'),
  // Magnifier for the search field
  search: P('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/>'),
};

module.exports = { ICONS };
