/* Sections that answer the follow-up questions the top-ranking pages answer
 * and these pages did not (research/serp-2026-10-22/report.md). Each one is a
 * question someone searches, answered with a worked number, not padding.
 * Arithmetic here is checked against the engine in test.js.
 */
const { MATERIALS } = require("./materials");
const num = (n, d = 0) => Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const table = (head, rows) => `<div class="table-wrap"><table><thead><tr>${head.map(h => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${c}</td>` : `<th scope="row">${c}</th>`).join("")}</tr>`).join("")}</tbody></table></div>`;

/* Third-party price tables are quoted as published, with the source linked
 * under each one and the date it was read. They are kept apart from the
 * page's own arithmetic so a reader can tell a benchmark from a calculation. */
const CHECKED = "October 22, 2026";
const cite = (url, name) => `<p class="note">Source: <a href="${url}">${name}</a>, checked ${CHECKED}. National averages; local quotes vary.</p>`;
const HG = "https://homeguide.com/costs/";
const CN = "https://www.concretenetwork.com/";

const EXTRAS = {
  "concrete-driveway-cost": `
<h2 id="by-finish">Concrete driveway cost by finish</h2>
<p>The finish moves the price more than anything else on a driveway of a given size.</p>
${table(["Finish", "Installed, per ft²", "What it usually means"], [["Plain", "$5–$8", "Gray concrete, broom finish"], ["Basic decorative", "$8–$14", "One color method, exposed aggregate or a simple border"], ["Mid-range", "$14–$21", "Stamped patterns, two or more colors, contrasting borders"], ["High-end", "$21 and up", "Custom engraving, scoring and staining"]])}
${cite(CN + "concrete/concrete_driveways/cost.html", "Concrete Network, concrete driveway cost")}
<h2 id="removal">Removing the old driveway</h2>
<p>Tearing out and hauling away an existing driveway adds roughly $1 per square foot. On an 800 ft² driveway that is about $800 before the new pour. Resurfacing a sound driveway instead runs about $3–$10 per square foot.</p>
<h2 id="vs-asphalt">Concrete vs. asphalt driveway cost</h2>
<p>Asphalt installation averages about $3–$6 per square foot against $5–$8 for plain concrete, so asphalt is usually cheaper to put down. For tonnage on an asphalt driveway, use the <a href="/asphalt-calculator/">asphalt calculator</a>.</p>
<h2 id="size">Width and thickness</h2>
<p>A single-car driveway is typically 10–12 feet wide and a two-car driveway 20–24 feet. Four inches of concrete is the common thickness for passenger cars; driveways that carry trucks, RVs or equipment are usually poured thicker. Thickness changes the concrete volume directly — check it with the <a href="/concrete-calculator/">concrete calculator</a>.</p>`,

  "concrete-patio-cost": `
<h2 id="by-finish">Concrete patio cost by design</h2>
${table(["Design", "Installed, per ft²", "What it usually means"], [["Plain", "$5–$8", "No decorative finish or color"], ["Simple", "$8–$11", "One coloring method or decorative technique"], ["Custom", "$11–$18", "Two or three colors, or a contrasting border"], ["Elaborate", "$18 and up", "Borders, saw-cut designs, hand-applied color"]])}
<p>Concrete Network puts a typical 288 ft² patio at about $3,200, or roughly $11 per square foot. Resurfacing an existing patio runs about $3–$10 per square foot.</p>
${cite(CN + "concrete-patio/cost.html", "Concrete Network, concrete patio cost")}
<h2 id="vs-other">Concrete vs. pavers and decking</h2>
<p>The same source puts a paver patio at about $4–$20 per square foot depending on size and pattern, and a wood deck at $15–$40. For paver counts and base material, use the <a href="/paver-calculator/">paver calculator</a>.</p>`,

  "concrete-cost-per-yard": `
<h2 id="by-city">What ready-mix costs in different markets</h2>
${table(["Market", "Average per yard", "Typical range"], [["Chicago", "$183", "$170–$210"], ["Los Angeles", "$182", "$170–$200"], ["Lynchburg, VA", "$165", "$150–$180"]])}
<p>Some of these quotes included delivery or short-load fees. Mix strength, order size and delivery distance move the price.</p>
<h2 id="history">How the price per yard has changed</h2>
${table(["Year", "Average per yard"], [["2008", "$75"], ["2013", "$93"], ["2016", "$108"], ["2018", "$113"], ["2020", "$125"], ["2022", "$137"], ["2023", "$160"], ["2024", "$180"]])}
${cite(CN + "concrete-prices.html", "Concrete Network, concrete prices")}`,

  "concrete-slab-cost": `
<h2 id="includes">What a per-square-foot slab price includes</h2>
<p>The $6.50–$10.50 reference covers the concrete, its delivery and the labor to place and finish it. Site preparation, a gravel base, reinforcement, removal of an old slab and any engineering are the items most often quoted separately. Ask each contractor which of those are in their number before comparing two prices.</p>
${cite(CN + "concrete-prices.html", "Concrete Network, concrete prices")}
<h2 id="diy">Pouring it yourself</h2>
<p>Doing the work yourself saves the labor, not the concrete. The thickness table above shows the ready-mix alone for a 20 × 20 slab is roughly $800–$1,450, before forms, base gravel, reinforcement and tool rental. Above about a yard, ready-mix delivery is easier than mixing bags; under a yard, bags usually win.</p>`,

  "fence-installation-cost": `
<h2 id="by-material">Fence installation cost by material</h2>
${table(["Material", "Installed, per linear ft"], [["Wood", "$20–$50"], ["Vinyl", "$30–$60"], ["Composite", "$20–$85"], ["Aluminum", "$25–$75"], ["Metal", "$20–$85"], ["Chain-link", "$9–$30"], ["Wrought iron", "$50–$85"], ["Barbed wire", "$3–$6"]])}
<h2 id="by-style">By style and height</h2>
${table(["Fence", "Installed, per linear ft"], [["Privacy", "$25–$60"], ["Picket", "$20–$50"], ["Rail", "$15–$35"], ["6 ft tall", "$25–$60"], ["8 ft tall", "$50–$85"], ["Replacing an existing fence", "$30–$80"]])}
<p>Replacement costs more per foot than a new fence because the old one has to come out and be hauled away first.</p>
${cite(HG + "fence-installation-cost", "HomeGuide, fence installation cost")}`,

  "roof-replacement-cost": `
<h2 id="by-house">Roof replacement cost by house size</h2>
<p>Roof area is larger than floor area once slope and overhangs are counted. These figures pair a single-story home’s floor area with a typical roof size.</p>
${table(["House", "Typical roof", "Average cost to reroof"], [["1,000 ft²", "1,120 ft²", "$3,500–$6,700"], ["1,500 ft²", "1,675 ft²", "$5,000–$10,100"], ["1,800 ft²", "2,010 ft²", "$6,000–$12,000"], ["2,000 ft²", "2,235 ft²", "$6,700–$13,400"], ["2,500 ft²", "2,795 ft²", "$8,500–$16,800"], ["3,000 ft²", "3,355 ft²", "$10,100–$20,100"]])}
<h2 id="breakdown">Where the money goes, per square</h2>
${table(["Part of the job", "Cost per square (100 ft²)"], [["Old roof removal", "$100–$300"], ["Roofing materials", "$100–$250"], ["Labor", "$200–$350"], ["Total", "$400–$900"]])}
<h2 id="by-material">Material cost and lifespan</h2>
${table(["Roof covering", "Material per square", "Lifespan"], [["Asphalt 3-tab shingles", "$80–$130", "15–20 years"], ["Architectural shingles", "$100–$250", "20–30 years"], ["Metal", "$100–$800", "30–80+ years"], ["Wood shakes", "$300–$700", "25–30 years"], ["Tile", "$300–$2,500", "30–100+ years"], ["Slate", "$600–$1,600", "50–200+ years"]])}
${cite(HG + "roof-replacement-cost", "HomeGuide, roof replacement cost")}`,

  "deck-cost-calculator": `
<h2 id="by-material">Deck cost by material</h2>
${table(["Decking", "Installed, per ft²"], [["Pressure-treated pine", "$25–$50"], ["Cedar", "$30–$47"], ["Redwood", "$28–$54"], ["Composite", "$40–$80"], ["Trex composite", "$45–$70"], ["Ipe", "$50–$70"], ["Aluminum", "$100–$125"]])}
<h2 id="by-type">By type of deck</h2>
${table(["Deck", "Installed, per ft²"], [["Freestanding, no rails or stairs", "$20–$25"], ["Ground-level, attached", "$25–$30"], ["Elevated, attached", "$30–$50"], ["Second story", "$50–$60"], ["Multi-level", "$60–$100"]])}
<h2 id="labor">Materials vs. labor</h2>
<p>For a new pressure-treated deck, materials run about $14–$28 per square foot and labor $11–$22, roughly half each. Building it yourself saves the labor half, not the whole price.</p>
${cite(HG + "cost-to-build-a-deck", "HomeGuide, cost to build a deck")}`,

  "construction-cost-calculator": `
<h2 id="builder-vs-custom">Builder-grade vs. custom home</h2>
${table(["Home size", "Builder-grade", "Custom"], [["1,000 ft²", "$180,000–$280,000", "$280,000–$450,000"], ["1,500 ft²", "$270,000–$420,000", "$420,000–$675,000"], ["2,000 ft²", "$360,000–$560,000", "$560,000–$900,000"], ["2,500 ft²", "$450,000–$700,000", "$700,000–$1,125,000"], ["3,000 ft²", "$540,000–$840,000", "$840,000–$1,350,000"]])}
<h2 id="by-state">Cost to build per square foot, by state</h2>
<p>Enter your state’s range in the calculator above instead of the national default.</p>
${table(["State", "Builder-grade", "Custom"], [["Alabama", "$150–$300", "$300–$500"], ["Alaska", "$180–$300", "$300–$500"], ["Arizona", "$200–$300", "$300–$550"], ["Arkansas", "$150–$220", "$220–$300"], ["California", "$200–$400", "$400–$600"], ["Colorado", "$200–$300", "$300–$500"], ["Connecticut", "$230–$300", "$300–$500"], ["Delaware", "$200–$300", "$300–$500"], ["Florida", "$180–$250", "$250–$400"], ["Georgia", "$150–$270", "$270–$350"], ["Hawaii", "$250–$400", "$400–$750"], ["Idaho", "$150–$220", "$220–$350"], ["Illinois", "$250–$350", "$350–$550"], ["Indiana", "$150–$250", "$250–$350"], ["Iowa", "$175–$220", "$220–$400"], ["Kansas", "$150–$250", "$250–$350"], ["Kentucky", "$170–$280", "$280–$400"], ["Louisiana", "$170–$220", "$220–$300"], ["Maine", "$250–$350", "$350–$450"], ["Maryland", "$250–$350", "$350–$450"], ["Massachusetts", "$280–$350", "$350–$600"], ["Michigan", "$170–$260", "$260–$350"], ["Minnesota", "$230–$350", "$350–$500"], ["Mississippi", "$150–$200", "$200–$300"], ["Missouri", "$180–$300", "$300–$500"], ["Montana", "$220–$300", "$300–$400"], ["Nebraska", "$160–$250", "$250–$400"], ["Nevada", "$180–$280", "$280–$450"], ["New Hampshire", "$220–$300", "$300–$500"], ["New Jersey", "$200–$350", "$350–$600"], ["New Mexico", "$220–$280", "$280–$400"], ["New York", "$220–$300", "$300–$500"], ["North Carolina", "$180–$250", "$250–$450"], ["North Dakota", "$170–$250", "$250–$400"], ["Ohio", "$130–$220", "$220–$300"], ["Oklahoma", "$170–$200", "$200–$300"], ["Oregon", "$250–$350", "$350–$550"], ["Pennsylvania", "$200–$320", "$320–$450"], ["Rhode Island", "$180–$250", "$250–$400"], ["South Carolina", "$200–$250", "$250–$400"], ["South Dakota", "$180–$250", "$250–$400"], ["Tennessee", "$180–$250", "$250–$350"], ["Texas", "$180–$280", "$280–$400"], ["Utah", "$180–$280", "$280–$600"], ["Vermont", "$220–$300", "$300–$500"], ["Virginia", "$250–$325", "$325–$500"], ["Washington", "$220–$350", "$350–$550"], ["West Virginia", "$150–$200", "$200–$300"], ["Wisconsin", "$220–$350", "$350–$500"], ["Wyoming", "$220–$350", "$350–$500"]])}
${cite(HG + "cost-to-build-a-house", "HomeGuide, cost to build a house")}`,

  "retaining-wall-cost": `
<h2 id="by-material">Retaining wall cost by material</h2>
${table(["Material", "Installed, per ft² of face"], [["Vinyl", "$10–$20"], ["Concrete block", "$15–$40"], ["Wood or timber", "$15–$30"], ["Poured concrete", "$20–$45"], ["Natural stone", "$20–$95"], ["Brick", "$30–$60"], ["Steel", "$40–$150"]])}
<h2 id="by-type">By type of wall</h2>
${table(["Wall type", "Installed, per ft²", "Where it is used"], [["Segmental block", "$15–$35", "Shorter walls, up to about 3–4 ft without extra reinforcement"], ["Gravity", "$20–$50", "Short walls that hold soil by their own weight"], ["Cantilevered", "$40–$80", "Walls over about 4 ft; reinforced concrete, professionally designed"], ["Anchored", "$50–$150", "High walls and heavy loads"]])}
${cite(HG + "retaining-wall-cost", "HomeGuide, retaining wall cost")}`,

  "roof-pitch-calculator": `
<h2 id="degrees">Degrees to roof pitch</h2>
<p>An angle finder or phone app reads in degrees. Pitch is the rise over 12 inches of run, so it is 12 × tan(angle).</p>
${table(["Angle", "Pitch"], [5, 10, 15, 18.43, 20, 22.62, 25, 26.57, 30, 33.69, 35, 40, 45].map(a => [`${a}°`, `${num(12 * Math.tan(a * Math.PI / 180), 1)}/12`]))}
<h2 id="measure">How to measure roof pitch</h2>
<p><b>From the attic.</b> Hold a level horizontally against the underside of a rafter. Mark the level 12 inches from where it touches the rafter, then measure straight up from that mark to the rafter. That measurement is the rise: 6 inches means a 6/12 pitch.</p>
<p><b>On the roof.</b> Do the same on the shingles, with one end of the level touching the surface. Only do this on a roof you can stand on safely.</p>
<p><b>From the framing.</b> Measure the total rise from the top of the wall to the top of the ridge, and the run from the outside of the wall to the center of the ridge. Pitch = rise ÷ run × 12. A 7-foot rise over a 14-foot run is 7 ÷ 14 × 12 = 6/12.</p>
<h2 id="materials">What pitch decides</h2>
<p>Below 2/12 a roof is treated as low-slope and asphalt shingles are not rated for it. Between 2/12 and 4/12 the US residential code allows shingles only over a double layer of underlayment. Above about 8/12 most roofers price the work as steep, because it needs roof jacks or harnesses to stand on.</p>`,

  "cubic-feet-calculator": `
<h2 id="from-inches">How to calculate cubic feet from inches</h2>
<p>Multiply length × width × height in inches, then divide by 1,728, the number of cubic inches in a cubic foot. A 24 × 18 × 12-inch box is 5,184 cubic inches, and 5,184 ÷ 1,728 = 3 cubic feet.</p>
<p>Converting each side to feet first gives the same answer: 2 × 1.5 × 1 = 3 ft³. Do not divide the inch product by 12 — that converts only one of the three dimensions.</p>
<h2 id="other-units">From meters, centimeters or yards</h2>
${table(["Measured in", "Multiply the volume by", "Example"], [["Cubic meters", "35.3147", "2 m³ = 70.63 ft³"], ["Cubic centimeters", "÷ 28,317", "50,000 cm³ = 1.77 ft³"], ["Cubic yards", "27", "3 yd³ = 81 ft³"], ["Liters", "÷ 28.317", "100 L = 3.53 ft³"]])}
<h2 id="shapes">Cylinders and irregular spaces</h2>
<p><b>Cylinder:</b> π × radius² × height, all in feet. A round planter 2 feet across and 3 feet deep holds 3.1416 × 1² × 3 = 9.42 ft³.</p>
<p><b>L-shaped or stepped spaces:</b> split them into rectangles, work out each one and add them. A closet with a 4 × 3-ft section and a 2 × 2-ft alcove, both 8 ft high, is (12 + 4) × 8 = 128 ft³.</p>`,

  "cubic-yard-calculator": `
<h2 id="how">How to calculate cubic yards</h2>
<p>With every side in feet: length × width × height ÷ 27. With the depth in inches, which is how most projects are measured: length × width × depth ÷ 324. A 12 × 9-ft bed 3 inches deep is 12 × 9 × 3 ÷ 324 = 1 cubic yard.</p>
<p>From cubic feet, divide by 27. From cubic meters, multiply by 1.308.</p>
<h2 id="to-tons">Cubic yards to tons</h2>
<p>Volume does not tell you weight; the material does. These are the starting densities our material calculators use, which you can replace with your supplier’s figure.</p>
${table(["Material", "lb per yd³", "US tons per yd³"], MATERIALS.filter(m => m.lbPerYd3).map(m => [m.name, num(m.lbPerYd3), num(m.lbPerYd3 / 2000, 2)]))}`,

  "stair-calculator": `
<h2 id="code">Residential stair limits</h2>
<p>The International Residential Code, which most US jurisdictions adopt, sets these for a stairway in a home. Your local version may differ.</p>
${table(["Dimension", "Limit"], [["Riser height", "7¾ in maximum"], ["Tread depth", "10 in minimum"], ["Variation between risers or treads", "⅜ in maximum in one flight"], ["Headroom", "6 ft 8 in minimum"], ["Stair width", "36 in minimum"], ["Nosing", "¾–1¼ in where treads are under 11 in"]])}
<h2 id="measure">How to measure total rise</h2>
<p>Measure vertically from the finished surface of the lower floor to the finished surface of the upper floor, at the spot where the stair will land. Include flooring that is not yet installed: ¾-inch hardwood upstairs adds ¾ inch to the rise, and leaving it out makes the top step the odd one.</p>
<h2 id="comfort">A stair that is comfortable, not just legal</h2>
<p>A common check is that one riser plus one tread should come to about 17–18 inches. At a 7½-inch riser that suggests a 10–10½-inch tread. Steeper and shallower combinations are legal but tiring to climb.</p>`,

  "labor-cost-calculator": `
<h2 id="burden">What labor burden covers</h2>
<p>Burden is everything an employer pays on top of the wage. Some of it is fixed by federal law, the rest depends on your state, trade and benefits.</p>
${table(["Cost", "Typical amount"], [["Social Security and Medicare (employer share)", "7.65% of wages"], ["Federal unemployment tax", "0.6% of the first $7,000 per employee, after the usual state credit"], ["State unemployment tax", "Set by your state and your claims history"], ["Workers’ compensation", "Priced per $100 of payroll, by trade"], ["Health insurance, retirement, paid time off", "Whatever you offer"]])}
<p>Federal payroll taxes alone are about 8%. Roofing and framing crews often carry far more in workers’ compensation than an office does, which is why a single burden percentage across trades misleads.</p>
<h2 id="percentage">Labor cost percentage</h2>
<p>Labor cost ÷ revenue × 100. A job billed at $12,000 with $4,368 of burdened labor runs at 36.4% labor. Track it per job type: if it creeps up, either the estimate or the crew’s hours are off.</p>
<h2 id="billable">Paid hours are not billable hours</h2>
<p>Travel, material runs, setup and cleanup are paid but rarely billed by the hour. Estimate the hours a crew is on the clock, not only the hours on the task.</p>`,

  "feet-and-inches-calculator": `
<h2 id="add">How to add feet and inches by hand</h2>
<p>Add the inches, add the feet, then carry every 12 inches into a foot. 5 ft 9 in + 3 ft 7 in = 8 ft 16 in, and 16 inches is 1 ft 4 in, so the total is 9 ft 4 in.</p>
<h2 id="subtract">How to subtract</h2>
<p>If the inches you are taking away are larger, borrow a foot as 12 inches. 8 ft 7 in − 3 ft 11 in: borrow, so 7 ft 19 in − 3 ft 11 in = 4 ft 8 in.</p>
<h2 id="convert">Converting to decimals and metric</h2>
<p>Inches ÷ 12 gives decimal feet: 9 ft 4 in is 9 + 4 ÷ 12 = 9.333 ft. Total inches × 2.54 gives centimeters: 112 in × 2.54 = 284.5 cm.</p>`,

  "markup-calculator": `
<h2 id="formulas">Markup and margin formulas</h2>
<p><b>Markup</b> = (price − cost) ÷ cost × 100. <b>Margin</b> = (price − cost) ÷ price × 100. Same profit, different base: a $100 cost sold at $150 is a 50% markup but a 33.3% margin.</p>
<h2 id="margin-to-markup">Markup needed for a target margin</h2>
<p>If you know the margin you want to keep, this is the markup to apply to cost: markup = margin ÷ (1 − margin).</p>
${table(["Target margin", "Markup on cost"], [10, 15, 20, 25, 30, 35, 40, 50].map(m => [`${m}%`, `${num(m / (100 - m) * 100, 1)}%`]))}
<h2 id="mistake">The pricing mistake this prevents</h2>
<p>A contractor who needs a 30% margin and adds 30% to cost earns only 23.1%. On a $50,000 job that is about $3,450 short of plan.</p>`,

  "board-and-batten-calculator": `
<h2 id="sizes">Batten sizes</h2>
<p>Lumber is sold by nominal size; measure the actual width before you lay out.</p>
${table(["Nominal", "Actual width"], [["1×2", "1½ in"], ["1×3", "2½ in"], ["1×4", "3½ in"], ["1×6", "5½ in"]])}
<h2 id="layout">How to lay out the wall</h2>
<p>Measure the full width at the height the battens will run. Decide how many equal spaces you want — most walls look right with 12 to 24 inches between battens — and let the calculator work out the exact gap. Mark every batten from the same starting edge with a tape, not by stepping a spacer, so small errors do not add up across the wall.</p>
<p>Outlets and switches that land behind a batten need moving or a different spacing; check before you commit to one.</p>`,

  "rebar-calculator": `
<h2 id="sizes">Rebar sizes and weights</h2>
<p>A bar’s number is its diameter in eighths of an inch. Weights are the standard figures for US deformed bar.</p>
${table(["Bar", "Diameter", "Weight per ft"], [[3, "⅜ in", 0.376], [4, "½ in", 0.668], [5, "⅝ in", 1.043], [6, "¾ in", 1.502], [7, "⅞ in", 2.044], [8, "1 in", 2.67]].map(([n, d, w]) => [`#${n}`, d, `${w} lb`]))}
<h2 id="placement">Placement and cover</h2>
<p>Bars do their work only where the design puts them. Support them on chairs or blocks so they stay in the concrete rather than settling to the bottom. Concrete cast directly against the ground commonly needs 3 inches of cover over the steel. Laps where bars join are typically specified as a multiple of the bar diameter, so they add length this calculator does not count.</p>`,

  "drywall-calculator": `
<h2 id="sheet-sizes">Drywall sheet sizes</h2>
${table(["Sheet", "Covers", "Sheets per 1,000 ft²"], [[4, 8], [4, 10], [4, 12]].map(([w, l]) => [`${w} × ${l} ft`, `${w * l} ft²`, num(Math.ceil(1000 / (w * l)))]))}
<p>Longer sheets mean fewer joints to tape but are heavier and harder to get up stairs. Half-inch board is the usual choice for walls; ceilings and fire-rated walls often call for ⅝-inch.</p>
<h2 id="openings">Should you subtract doors and windows?</h2>
<p>For a quick count, no: the offcuts around openings are rarely reusable, so the area they remove is roughly what you waste cutting around them. Subtract only large openings such as a patio door or a wide archway.</p>`,

  "roofing-calculator": `
<h2 id="squares">Squares and bundles</h2>
<p>A roofing square is 100 ft² of roof surface. Most architectural and three-tab shingles come three bundles to the square, so a 25-square roof takes about 75 bundles before waste. Check the coverage printed on the bundle; some heavier shingles need four.</p>
<h2 id="waste">How much waste to allow</h2>
<p>A simple gable roof wastes the least, commonly 10%. Hips, valleys and dormers mean more cut shingles, often 15% or more. Starter strip and ridge cap are separate products sold by the linear foot.</p>`,

  "deck-calculator": `
<h2 id="gap">How far apart deck boards go</h2>
<p>Wood boards are commonly gapped about ⅛ to ¼ inch so water drains and the wood can move. Wet pressure-treated lumber shrinks as it dries and is often laid tight for that reason. Composite boards have the maker’s own spacing, which the warranty can depend on.</p>
<h2 id="lengths">Choosing board length</h2>
<p>Boards come in 12, 16 and 20-foot lengths. A board that spans the whole deck avoids butt joints; when that is not possible, stagger the joints and land each one on a joist.</p>`,

  "retaining-wall-calculator": `
<h2 id="courses">Courses and the buried row</h2>
<p>Divide the exposed height by the block height and round up for the visible courses, then add the buried course. Manufacturers commonly specify burying at least one course — often about a tenth of the wall height for taller walls. Check the instructions for your block.</p>
<h2 id="caps">Caps</h2>
<p>Cap units finish the top course and are counted by wall length, not area. They are usually glued with masonry adhesive rather than stacked loose.</p>`,
};

module.exports = { EXTRAS };
