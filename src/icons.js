/* Clean 24x24 architectural SVG icons (1.75px stroke + subtle duotone fill).
 * Inherit currentColor so they adapt to light/dark themes and category tints
 * with zero external font or icon-pack requests. */
const P = d =>
  `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

const ICONS = {
  // Isometric poured concrete slab / block
  concrete: P('<path d="M12 3 3 7.5 12 12l9-4.5Z" fill="currentColor" fill-opacity=".14"/><path d="M3 7.5v7L12 19l9-4.5v-7"/><path d="M12 12v7"/>'),
  // Faceted aggregate / gravel pile
  gravel: P('<path d="M4 19 8.5 11.5 13 15l3.5-4.5L20 19Z" fill="currentColor" fill-opacity=".14"/><path d="M2 19h20"/><path d="M8.5 11.5 11 19"/><circle cx="15" cy="7" r="1.2" fill="currentColor" stroke="none"/>'),
  // Crushed stone prism
  stone: P('<path d="M5 18 7.5 9.5 13 6l5.5 4.5L19 18Z" fill="currentColor" fill-opacity=".14"/><path d="M7.5 9.5 13 13l5.5-2.5M13 13v5M3 18h18"/>'),
  // Smooth sand dune + grain dots
  sand: P('<path d="M3 19c2.8-6.5 5.8-9.5 9-9.5s6.2 3 9 9.5Z" fill="currentColor" fill-opacity=".14"/><path d="M2 19h20"/><circle cx="10" cy="15.5" r=".9" fill="currentColor" stroke="none"/><circle cx="14.5" cy="16" r=".9" fill="currentColor" stroke="none"/><circle cx="12.2" cy="12.8" r=".9" fill="currentColor" stroke="none"/>'),
  // Topsoil & sprout
  topsoil: P('<rect x="3" y="16" width="18" height="4" rx="1.2" fill="currentColor" fill-opacity=".14"/><path d="M12 16V9"/><path d="M12 11c0-3 2.5-5 6-5 0 3-2.5 5-6 5Z" fill="currentColor" fill-opacity=".14"/><path d="M12 13c0-2.5-2-4-5-4 0 2.5 2 4 5 4Z"/>'),
  // Fill dirt grading level
  dirt: P('<path d="M3 19c2.5-4.5 5.5-7 9-7s6.5 2.5 9 7Z" fill="currentColor" fill-opacity=".14"/><path d="M2 19h20"/><path d="M4 9h16" stroke-dasharray="2.5 2.5"/><path d="M12 5v4m-2-2 2 2 2-2"/>'),
  // Paved roadway / asphalt
  asphalt: P('<path d="M6 4h12l3 16H3Z" fill="currentColor" fill-opacity=".12"/><path d="M12 6v3M12 12v3M12 18v2"/>'),
  // Square footage blueprint dimension box
  sqft: P('<rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" fill-opacity=".12"/><path d="M8 16 16 8"/><path d="M12 8h4v4M12 16H8v-4"/>'),
  // Smooth river stones
  rock: P('<rect x="3" y="13" width="10" height="7" rx="3.5" fill="currentColor" fill-opacity=".14"/><rect x="12" y="14" width="9" height="6" rx="3" fill="currentColor" fill-opacity=".14"/><rect x="8" y="7" width="8" height="6" rx="3"/>'),
  // Mulch & botanical leaf
  mulch: P('<path d="M12 20c5 0 8-3.5 8-9 0-3-1-5.5-2-7-4 0-8 1.5-10.5 4.5S5 15 6 19c1.8.7 3.8 1 6 1Z" fill="currentColor" fill-opacity=".14"/><path d="M6 19c2.5-4 6-7.5 11-11"/>'),
  // Precision angled carpenter ruler
  ruler: P('<path d="M16.5 3.5 20.5 7.5 7.5 20.5 3.5 16.5Z" fill="currentColor" fill-opacity=".14"/><path d="m14 6 2 2M11 9l1.5 1.5M8 12l2 2"/>'),
  // 3D Volume cube
  cube: P('<path d="M12 3 4 7.5v9L12 21l8-4.5v-9Z" fill="currentColor" fill-opacity=".12"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>'),
  // Cylinder liquid tank
  tank: P('<ellipse cx="12" cy="6" rx="7" ry="2.5" fill="currentColor" fill-opacity=".16"/><path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6"/><path d="M5 13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/>'),
  // Picket fence
  fence: P('<path d="M4 9h16M4 15h16"/><path d="M5 20V7l1.5-2.5L8 7v13M10.5 20V7L12 4.5 13.5 7v13M16 20V7l1.5-2.5L19 7v13" fill="currentColor" fill-opacity=".12"/>'),
  // Wood deck planks
  deck: P('<rect x="3" y="5" width="18" height="14" rx="2" fill="currentColor" fill-opacity=".12"/><path d="M3 9.7h18M3 14.3h18M9 5v4.7M15 9.7v4.6M11 14.3V19"/>'),
  // Horizontal lap siding
  siding: P('<rect x="3" y="4" width="18" height="16" rx="1.5" fill="currentColor" fill-opacity=".12"/><path d="M3 9.3h18M3 14.7h18"/>'),
  // Drywall / plywood sheet
  drywall: P('<path d="M6 3h9l4 4v14H6Z" fill="currentColor" fill-opacity=".12"/><path d="M15 3v4h4"/><path d="M9 12h6M9 16h4"/>'),
  // Floor & wall tile grid
  tile: P('<rect x="3.5" y="3.5" width="7" height="7" rx="1.2" fill="currentColor" fill-opacity=".14"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.2" fill="currentColor" fill-opacity=".14"/>'),
  // Patio pavers
  paver: P('<rect x="3" y="4" width="10" height="6.5" rx="1.2" fill="currentColor" fill-opacity=".14"/><rect x="15" y="4" width="6" height="6.5" rx="1.2"/><rect x="3" y="13.5" width="6" height="6.5" rx="1.2"/><rect x="11" y="13.5" width="10" height="6.5" rx="1.2" fill="currentColor" fill-opacity=".14"/>'),
  // Paint roller
  paint: P('<rect x="4" y="4" width="13" height="5" rx="1.5" fill="currentColor" fill-opacity=".16"/><path d="M17 6.5h2a1.5 1.5 0 0 1 1.5 1.5v1.5a1.5 1.5 0 0 1-1.5 1.5h-6.5a1.5 1.5 0 0 0-1.5 1.5V14"/><rect x="9.5" y="14" width="3" height="6" rx="1"/>'),
  // House roof
  roofing: P('<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 9.5V20h13V9.5" fill="currentColor" fill-opacity=".12"/><path d="M9.5 20v-5.5h5V20"/>'),
  // Brick / retaining wall running bond
  wall: P('<rect x="3" y="5" width="18" height="14" rx="1.5" fill="currentColor" fill-opacity=".12"/><path d="M3 9.7h18M3 14.3h18M12 5v4.7M8 9.7v4.6M16 9.7v4.6M12 14.3V19"/>'),
  // Batt insulation wave
  insulation: P('<rect x="4" y="3" width="16" height="18" rx="2" fill="currentColor" fill-opacity=".12"/><path d="M7 8c1.5-1.5 3.5-1.5 5 0s3.5 1.5 5 0M7 12.5c1.5-1.5 3.5-1.5 5 0s3.5 1.5 5 0M7 17c1.5-1.5 3.5-1.5 5 0s3.5 1.5 5 0"/>'),
  // Vertical board & batten / wainscoting
  batten: P('<rect x="3.5" y="4" width="17" height="16" rx="1.5" fill="currentColor" fill-opacity=".12"/><path d="M9 4v16M15 4v16"/>'),
  // Grout / mortar trowel
  trowel: P('<path d="M12 3 5 12.5 12 15l7-2.5Z" fill="currentColor" fill-opacity=".16"/><path d="M12 15v6M9.5 21h5"/>'),
  // Clean dollar badge for project costs
  cost: P('<circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity=".14"/><path d="M12 7v10"/><path d="M15 9.5c0-1.2-1.3-2-3-2s-3 .8-3 2c0 2.5 6 1.5 6 4 0 1.2-1.3 2-3 2s-3-.8-3-2"/>'),
  // Info circle
  info: P('<circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity=".12"/><path d="M12 11v5"/><circle cx="12" cy="8" r=".8" fill="currentColor" stroke="none"/>'),
  // Magnifying glass search
  search: P('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
  // HVAC climate thermometer / snowflake
  hvac: P('<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5 4.2 16.5"/><path d="m9.5 4.5 2.5 2 2.5-2M9.5 19.5l2.5-2 2.5 2"/><circle cx="12" cy="12" r="2.5" fill="currentColor" fill-opacity=".2"/>'),
  // Firewood flame
  firewood: P('<path d="M12 3.5c2.2 2.8 5.5 5.4 5.5 9.8a5.5 5.5 0 0 1-11 0c0-2 .9-3.8 2.2-5.2.3 1.4 1.3 2.1 2.3 2.1-.4-2.4-.2-4.7 1-6.7Z" fill="currentColor" fill-opacity=".16"/><path d="M5 20.5h14"/>'),
  // Generator lightning bolt
  bolt: P('<path d="M13 2.5 4.5 13.5h6.5L10 21.5l9.5-11H13Z" fill="currentColor" fill-opacity=".16"/>'),
  // Water droplet (water heater / dehumidifier / pool)
  water: P('<path d="M12 3.2C8.2 8.2 6 11.2 6 14.2a6 6 0 0 0 12 0c0-3-2.2-6-6-11Z" fill="currentColor" fill-opacity=".16"/><path d="M9.5 14.8a2.5 2.5 0 0 0 2.5 2.4"/>'),
  // Exhaust fan blades
  fan: P('<circle cx="12" cy="12" r="2.2" fill="currentColor" fill-opacity=".2"/><path d="M12 9.8V4.5a2.8 2.8 0 0 1 4.8 1.9M14.2 12h5.3a2.8 2.8 0 0 1-1.9 4.8M12 14.2v5.3a2.8 2.8 0 0 1-4.8-1.9M9.8 12H4.5a2.8 2.8 0 0 1 1.9-4.8"/>'),
  // Roof gutter & downspout
  gutter: P('<path d="M3 6h14v4H5a2 2 0 0 1-2-2Z" fill="currentColor" fill-opacity=".16"/><path d="M17 8h2v10l2 2"/>'),
  // Stepped stairs with stringer
  stairs: P('<path d="M4 20h16V6h-4v4h-4v4H8v4H4Z" fill="currentColor" fill-opacity=".14"/><path d="M4 20h4v-4h4v-4h4V8h4"/>'),
  // Raised garden bed planter
  garden: P('<rect x="3" y="13" width="18" height="7" rx="1.5" fill="currentColor" fill-opacity=".14"/><path d="M3 16.5h18"/><path d="M12 13V7"/><path d="M12 9.5c0-2.5 2-4 4.5-4 0 2.5-2 4-4.5 4Z"/><path d="M12 10.5c0-2-1.8-3.5-4-3.5 0 2 1.8 3.5 4 3.5Z"/>'),
};

module.exports = { ICONS };
