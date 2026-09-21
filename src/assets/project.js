/* Quantity engines shared by the browser and automated tests. All dimensions
 * have explicit units in the page definition; costs are user-entered quotes. */
(function () {
  "use strict";
  const ceil = n => Math.ceil(n - 1e-9);
  const row = (label, value, unit = "", digits = 0) => ({ label, value, unit, digits });
  function calculate(kind, v) {
    const extra = 1 + (v.waste || 0) / 100;
    let area, needed, count, rows, note;
    switch (kind) {
      case "fence": {
        const sections = ceil(v.length / v.spacing);
        const pickets = ceil((v.length * 12 + v.gap) / (v.boardWidth + v.gap));
        rows = [row("Pickets to buy", ceil(pickets * extra), "pickets"), row("Posts for one straight run", sections + 1, "posts"), row("Horizontal rails", sections * v.rails, "rails"), row("Sections", sections), row("Even post spacing", v.length / sections, "ft", 2), row("Pickets before waste", pickets)];
        note = "Single straight run, excluding gates. Check rail lengths, corners, shared posts and local requirements before buying. Waste is added to pickets only.";
        break;
      }
      case "deck": {
        const boardRows = ceil((v.width * 12 + v.gap) / (v.boardWidth + v.gap));
        const perRow = ceil(v.length / v.boardLength);
        const base = boardRows * perRow;
        count = ceil(base * extra);
        rows = [row("Deck boards to buy", count, "boards"), row("Deck surface", v.length * v.width, "ft²", 1), row("Rows across the deck", boardRows), row("Stock boards per row", perRow), row("Boards before allowance", base), row("Board material cost", count * (v.price || 0), "$", 2)];
        note = "Boards run along the deck length. This conservative count does not reuse offcuts between rows. Framing, stairs, borders, fasteners and rails are not included.";
        break;
      }
      case "siding":
        area = v.area - v.openings;
        if (area <= 0) throw new Error("Openings must be smaller than the total wall area.");
        needed = area * extra;
        rows = [row("Siding to order", needed, "ft²", 1), row("Siding squares", needed / 100, "squares", 2), row("Net wall area", area, "ft²", 1), row("Material allowance", needed - area, "ft²", 1), row("Material cost", needed * (v.price || 0), "$", 2)];
        note = "Use the product’s exposed coverage after overlap. Trim, starter strips, soffits, flashing and labor are separate.";
        break;
      case "drywall":
        area = 2 * (v.length + v.width) * v.height + (v.ceiling === 1 ? v.length * v.width : 0) - v.openings;
        if (area <= 0) throw new Error("Openings must be smaller than the wall and ceiling area.");
        count = ceil(area * extra / v.sheetArea);
        rows = [row("Drywall sheets to buy", count, "sheets"), row("Net surface area", area, "ft²", 1), row("Area with waste", area * extra, "ft²", 1), row("Sheet coverage", v.sheetArea, "ft²"), row("Sheet material cost", count * (v.price || 0), "$", 2)];
        note = "One rectangular room and one layer of board. Check the sheet layout and required thickness or fire rating; tape, compound and fasteners are separate.";
        break;
      case "tile":
      case "paver": {
        area = v.length * v.width;
        const pieceArea = v.pieceLength * v.pieceWidth / 144;
        count = ceil(area * extra / pieceArea);
        rows = [row(kind === "tile" ? "Tiles to buy" : "Pavers to buy", count, kind === "tile" ? "tiles" : "pavers"), row("Project area", area, "ft²", 1), row("Area with waste", area * extra, "ft²", 1), row("Coverage per piece", pieceArea, "ft²", 3), row("Material cost", count * (v.price || 0), "$", 2)];
        if (kind === "tile" && v.boxCount > 0) rows.splice(1, 0, row("Whole boxes", ceil(count / v.boxCount), "boxes"));
        if (kind === "paver") rows.push(row("Base volume before compaction", area * v.baseDepth / 324, "yd³", 2), row("Bedding sand volume", area * v.sandDepth / 324, "yd³", 2));
        note = "Single-size rectangular pieces. Small joints are not deducted, leaving a conservative area estimate. Plan cuts and borders before ordering; mixed-size patterns need the supplier’s coverage chart.";
        break;
      }
      case "paint":
        area = 2 * (v.length + v.width) * v.height - v.openings;
        if (area <= 0) throw new Error("Openings must be smaller than the wall area.");
        needed = area * v.coats / v.coverage * extra;
        rows = [row("Whole gallons to buy", ceil(needed), "US gal"), row("Calculated paint", needed, "US gal", 2), row("Wall area", area, "ft²", 1), row("Coats", v.coats), row("Paint cost", ceil(needed) * (v.price || 0), "$", 2)];
        note = "Walls only, in one color. Ceiling, trim and primer are separate. Use the coverage on your paint label; rough or porous surfaces may need more.";
        break;
      case "roofing": {
        const factor = Math.sqrt(1 + Math.pow(v.pitch / 12, 2));
        area = v.area * factor;
        needed = area * extra;
        rows = [row("Shingle bundles to buy", ceil(needed / v.bundleCoverage), "bundles"), row("Sloped roof area", area, "ft²", 1), row("Roofing squares with waste", needed / 100, "squares", 2), row("Area with waste", needed, "ft²", 1), row("Pitch multiplier", factor, "×", 3), row("Shingle cost", ceil(needed / v.bundleCoverage) * (v.price || 0), "$", 2)];
        note = "Horizontal footprint must include overhangs. For an already measured sloped area use a pitch of 0. Starter, ridge caps, flashing and underlayment are separate.";
        break;
      }
      case "retaining-wall": {
        const courses = ceil(v.height * 12 / v.blockHeight) + v.buried;
        const perCourse = ceil(v.length * 12 / v.blockLength);
        count = courses * perCourse;
        rows = [row("Wall blocks to buy", ceil(count * extra), "blocks"), row("Blocks per course", perCourse), row("Courses including buried rows", courses), row("Cap pieces", ceil(v.length * 12 / v.capLength), "caps"), row("Exposed wall face", v.length * v.height, "ft²", 1), row("Block material cost", ceil(count * extra) * (v.price || 0), "$", 2)];
        note = "Straight, level wall; cap height is extra. This is a block count, not a structural design. Base, drainage, geogrid, excavation, steps and curves need a project-specific plan.";
        break;
      }
      case "insulation":
        needed = v.area * extra;
        count = ceil(needed / v.coverage);
        rows = [row("Packages to buy", count, "packages"), row("Area with allowance", needed, "ft²", 1), row("Purchased coverage", count * v.coverage, "ft²", 1), row("Material cost", count * (v.price || 0), "$", 2)];
        note = "Enter package coverage at your chosen R-value. For loose-fill insulation, use its bag chart at the target settled depth, not the bag’s physical volume.";
        break;
      case "board-and-batten": {
        const spaces = v.spaces;
        count = spaces + 1;
        const gap = (v.width - count * v.boardWidth) / spaces;
        if (gap <= 0) throw new Error("These battens do not fit. Reduce the number of spaces or the batten width.");
        rows = [row("Clear space between battens", gap, "in", 3), row("Battens including both ends", count, "battens"), row("Center-to-center spacing", gap + v.boardWidth, "in", 3), row("Vertical trim length", count * v.height / 12, "linear ft", 1)];
        note = "One full-width batten at each end. Mark from the same starting edge to avoid rounding drift. Height is the vertical batten cut length, excluding horizontal trim.";
        break;
      }
      case "grout":
      case "thinset":
        needed = v.area * extra;
        count = ceil(needed / v.coverage);
        rows = [row("Packages to buy", count, "packages"), row("Area with allowance", needed, "ft²", 1), row("Coverage per package", v.coverage, "ft²", 1), row("Purchased coverage", count * v.coverage, "ft²", 1), row("Material cost", count * (v.price || 0), "$", 2)];
        note = kind === "grout" ? "Use the maker’s coverage for your exact tile length, width, thickness and joint width. Cement grout, premixed grout and epoxy have different yields." : "Use the coverage range for your mortar and trowel. The lower end is a cautious estimate. Back-buttering and uneven substrates can increase use.";
        break;
      case "cubic-yard":
        needed = v.length * v.width * v.depth / 324 * extra;
        rows = [row("Volume with allowance", needed, "yd³", 2), row("Cubic feet", needed * 27, "ft³", 2), row("Cubic meters", needed * 0.764554857984, "m³", 2), row("Base volume", v.length * v.width * v.depth / 324, "yd³", 2), row("Material cost", needed * (v.price || 0), "$", 2)];
        note = "Volume does not tell you weight. Ask your supplier for the density before converting yards to tons or planning a load.";
        break;
      case "feet-inches": {
        // Carpenters add and subtract mixed measurements all day; the arithmetic
        // is trivial and getting it wrong by an inch is not.
        const a = v.aFeet * 12 + v.aInches, b = v.bFeet * 12 + v.bInches;
        const total = v.operation === "subtract" ? a - b : a + b;
        if (total < 0) throw new Error("The result is negative. Check which measurement is larger.");
        const ft = Math.floor(total / 12), inch = total - ft * 12;
        rows = [row("Result", ft, "ft " + inch.toFixed(3).replace(/\.?0+$/, "") + " in"), row("Total inches", total, "in", 3), row("Decimal feet", total / 12, "ft", 4), row("Yards", total / 36, "yd", 4), row("Centimetres", total * 2.54, "cm", 1), row("Metres", total * 0.0254, "m", 3)];
        note = "Exact arithmetic on the values entered. Fractions of an inch are shown as decimals; a tape measure reads sixteenths, so 0.0625 in is 1/16.";
        break;
      }
      case "cubic-feet": {
        const perFoot = { in: 1 / 12, ft: 1, yd: 3, cm: 0.032808399, m: 3.280839895 }[v.unit] || 1;
        const l = v.length * perFoot, w = v.width * perFoot, h = v.height * perFoot;
        needed = l * w * h * extra;
        rows = [row("Volume", needed, "ft³", 2), row("Cubic yards", needed / 27, "yd³", 3), row("Cubic metres", needed * 0.028316846592, "m³", 3), row("US gallons", needed * 7.48051948, "gal", 1), row("Litres", needed * 28.316846592, "L", 1), row("Volume before allowance", l * w * h, "ft³", 2)];
        note = "Volume only. Weight depends on what fills the space — ask your supplier for the density before converting to tons.";
        break;
      }
      case "board-foot": {
        // A board foot is 144 cubic inches of lumber, quoted on nominal size.
        const perPiece = v.thickness * v.width * (v.length * 12) / 144;
        needed = perPiece * v.pieces * extra;
        rows = [row("Board feet to buy", needed, "bf", 2), row("Board feet per piece", perPiece, "bf", 3), row("Board feet before waste", perPiece * v.pieces, "bf", 2), row("Linear feet", v.length * v.pieces, "ft", 1), row("Lumber cost", needed * (v.price || 0), "$", 2)];
        note = "Board feet use the nominal thickness and width a yard quotes, not the dressed size. A 2×4 is nominally 2 in by 4 in even though it measures 1.5 by 3.5.";
        break;
      }
      case "roof-pitch": {
        // Pitch is rise in inches over a 12-inch run, which is how every US
        // framing table, shingle spec and code reference states it.
        const angle = Math.atan(v.rise / 12) * 180 / Math.PI;
        const multiplier = Math.sqrt(v.rise * v.rise + 144) / 12;
        const rafter = v.run * multiplier;
        rows = [row("Pitch", v.rise, "in 12"), row("Angle", angle, "°", 2), row("Slope multiplier", multiplier, "", 4), row("Rafter length", rafter, "ft", 2), row("Total rise over this run", v.run * v.rise / 12, "ft", 2), row("Sloped area per ft² of footprint", multiplier, "ft²", 4)];
        note = "Rafter length is the sloped distance along the run entered, measured from the outside wall to the ridge. It excludes overhang, ridge board thickness and any birdsmouth cut.";
        break;
      }
      case "stair": {
        // Code caps riser height, so the riser count is forced by the rise.
        const risers = ceil(v.totalRise / v.maxRiser);
        const riser = v.totalRise / risers;
        const treads = risers - 1;
        const totalRun = treads * v.treadDepth;
        const stringer = Math.sqrt(v.totalRise * v.totalRise + totalRun * totalRun);
        rows = [row("Risers", risers), row("Actual riser height", riser, "in", 3), row("Treads", treads), row("Total run", totalRun / 12, "ft", 2), row("Stringer length", stringer / 12, "ft", 2), row("Rise plus run check", riser + v.treadDepth, "in", 2)];
        note = "Every riser in a flight must be within 3/8 in of the others, which is why the height is divided evenly rather than rounded. Confirm the riser and tread limits in your local code before cutting.";
        break;
      }
      case "brick": {
        // Units per square foot, from the face size plus the mortar joint.
        const faceFt2 = (v.unitLength + v.joint) * (v.unitHeight + v.joint) / 144;
        const base = v.area / faceFt2;
        count = ceil(base * extra);
        rows = [row("Units to buy", count, "units"), row("Units per ft²", 1 / faceFt2, "", 2), row("Units before waste", ceil(base), "units"), row("Wall area", v.area, "ft²", 1), row("Material cost", count * (v.price || 0), "$", 2)];
        note = "Counts single-wythe facing units for the area entered. Mortar, ties, lintels, corners and any second wythe are separate.";
        break;
      }
      case "ramp": {
        // ADA limits a ramp to 1:12; the run is a consequence of the rise.
        const runFt = v.rise / 12 * v.slope;
        const landings = Math.max(0, ceil(runFt / 30) - 1);
        rows = [row("Ramp run", runFt, "ft", 2), row("Sloped length", Math.sqrt(runFt * runFt + (v.rise / 12) * (v.rise / 12)), "ft", 2), row("Slope", 1 / v.slope * 100, "%", 2), row("Intermediate landings", landings), row("Decking area at this width", runFt * v.width, "ft²", 1)];
        note = "A 1:12 slope is the ADA maximum for a new ramp, with a 30 ft maximum run between landings. This sizes the geometry only — it is not a code review or a structural design.";
        break;
      }
      case "framing": {
        const studs = ceil(v.length * 12 / v.spacing) + 1;
        const corners = v.corners * 2;
        count = ceil((studs + corners) * extra);
        rows = [row("Studs to buy", count, "studs"), row("Studs on layout", studs), row("Extra corner and intersection studs", corners), row("Top and bottom plate", v.length * 3, "linear ft", 1), row("Lumber cost", count * (v.price || 0), "$", 2)];
        note = "One straight wall, with a double top plate and single bottom plate. Headers, cripples, blocking and openings are not counted.";
        break;
      }
      case "rebar": {
        // A bar running the length is one of a set spaced across the width.
        const alongLength = ceil(v.width * 12 / v.spacing) + 1;
        const alongWidth = ceil(v.length * 12 / v.spacing) + 1;
        const linear = alongLength * v.length + alongWidth * v.width;
        const barsNeeded = ceil(linear / v.barLength * extra);
        // #3 is 0.376 lb/ft and each size step adds about 0.29 lb/ft.
        const lbPerFt = { 3: 0.376, 4: 0.668, 5: 1.043, 6: 1.502, 7: 2.044, 8: 2.670 }[v.barSize] || 0.668;
        rows = [row("Bars to buy", barsNeeded, "bars"), row("Linear feet of rebar", linear * extra, "ft", 1), row("Bars running the length", alongLength), row("Bars running the width", alongWidth), row("Total weight", linear * extra * lbPerFt, "lb", 1), row("Rebar cost", barsNeeded * (v.price || 0), "$", 2)];
        note = "A single flat mat at the spacing entered, without laps, chairs or bends. Lap splices typically add 30 to 40 bar diameters at every joint.";
        break;
      }
      case "sod": {
        needed = v.area * extra;
        const rolls = ceil(needed / v.rollArea);
        rows = [row("Sod to buy", needed, "ft²", 1), row("Rolls or slabs", rolls, "rolls"), row("Pallets", ceil(rolls / v.perPallet), "pallets"), row("Area before waste", v.area, "ft²", 1), row("Sod cost", needed * (v.price || 0), "$", 2)];
        note = "Order by area and confirm the roll size with your supplier — slab and roll dimensions vary by region. Curved edges waste more than the default allowance.";
        break;
      }
      case "markup": {
        // Markup is on cost; margin is on price. Confusing them is the classic
        // way a contractor prices a job at a loss.
        const price = v.cost * (1 + v.markup / 100);
        const profit = price - v.cost;
        rows = [row("Price to quote", price, "$", 2), row("Profit", profit, "$", 2), row("Gross margin", profit / price * 100, "%", 2), row("Markup applied", v.markup, "%", 2), row("Margin needed for this markup", v.markup / (100 + v.markup) * 100, "%", 2)];
        note = "Markup is a percentage of your cost; margin is a percentage of the price you charge. A 50% markup is only a 33.3% margin.";
        break;
      }
      case "labor-cost": {
        const burdened = v.rate * (1 + v.burden / 100);
        const total = burdened * v.hours * v.workers;
        rows = [row("Total labor", total, "$", 2), row("Burdened hourly rate", burdened, "$", 2), row("Total crew hours", v.hours * v.workers, "hrs", 1), row("Base wages", v.rate * v.hours * v.workers, "$", 2), row("Burden added", total - v.rate * v.hours * v.workers, "$", 2)];
        note = "Burden covers payroll taxes, insurance and benefits on top of the wage. It commonly runs 25% to 40%; ask your bookkeeper for your real figure rather than using a default.";
        break;
      }
      case "tank-volume": {
        const ft3 = v.shape === "cylinder"
          ? Math.PI * Math.pow(v.diameter / 24, 2) * (v.height / 12)
          : (v.length / 12) * (v.width / 12) * (v.height / 12);
        const gal = ft3 * 7.48051948;
        rows = [row("Capacity", gal, "US gal", 1), row("Litres", ft3 * 28.316846592, "L", 1), row("Cubic feet", ft3, "ft³", 3), row("Imperial gallons", gal * 0.8326741846, "imp gal", 1), row("Water weight when full", gal * 8.345, "lb", 0)];
        note = "Full internal capacity from the dimensions entered. Usable volume is lower once you allow for fittings, freeboard and any inlet or outlet height.";
        break;
      }
      case "cost": {
        const quantity = v.quantity || v.length * v.width;
        if (v.high < v.low) throw new Error("The high unit price must be at least the low unit price.");
        const extras = (v.delivery || 0) + (v.removal || 0) + (v.other || 0);
        const low = quantity * v.low + extras;
        const high = quantity * v.high + extras;
        rows = [row("Planning range", [low * extra, high * extra], "$", 0), row("Measured quantity", quantity, v.costUnit || "ft²", 2), row("Work before extras", [quantity * v.low, quantity * v.high], "$", 0), row("Separate extras", extras, "$", 0), row("Contingency", v.waste || 0, "%")];
        note = "Range based on the unit rates shown, not a local bid. Add an extra only if the unit rate excludes it. Taxes are not added automatically.";
        break;
      }
      default: throw new Error("Unknown calculator.");
    }
    rows = rows.filter(r => !/cost$/i.test(r.label) || v.price > 0);
    if (rows.some(r => (Array.isArray(r.value) ? r.value : [r.value]).some(n => !Number.isFinite(n)))) throw new Error("Use smaller, valid numbers.");
    return { rows, note };
  }
  /* A measured field may carry a companion "<name>Unit" selector. Convert what
   * was typed into the unit the engine expects, then drop the selector key. */
  const TO_FT = { in: 1 / 12, ft: 1, yd: 3, cm: 0.032808399, m: 3.280839895 };
  const TO_FT2 = { in2: 1 / 144, ft2: 1, yd2: 9, m2: 10.763910417 };
  function convertUnits(values, unitBase) {
    Object.keys(values).forEach(k => {
      if (!/Unit$/.test(k)) { return; }
      const base = k.slice(0, -4);
      const chosen = values[k];
      const target = unitBase && unitBase[base];
      if (typeof values[base] === "number" && target && chosen) {
        const table = target in TO_FT2 ? TO_FT2 : TO_FT;
        if (table[chosen] && table[target]) {
          values[base] = values[base] * table[chosen] / table[target];
        }
      }
      delete values[k];
    });
    return values;
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { calculate, convertUnits };
  if (typeof document === "undefined") return;
  const form = document.getElementById("project-form");
  if (!form) return;
  const cfg = JSON.parse(document.getElementById("project-config").textContent);
  const output = document.getElementById("r-out");
  const empty = document.getElementById("r-empty");
  const error = document.getElementById("form-error");
  let calculated = false;
  function fmt(r) {
    const format = n => (r.unit === "$" ? "$" : "") + n.toLocaleString("en-US", { maximumFractionDigits: r.digits, minimumFractionDigits: r.digits });
    return (Array.isArray(r.value) ? r.value.map(format).join("–") : format(r.value)) + (r.unit && r.unit !== "$" ? " " + r.unit : "");
  }
  function update(report) {
    if (!calculated) return;
    const invalid = Array.from(form.querySelectorAll("input,select")).find(el => !el.checkValidity());
    output.hidden = true;
    empty.hidden = false;
    if (invalid) {
      if (report) {
        const details = invalid.closest("details");
        if (details) details.open = true;
        invalid.reportValidity();
      }
      error.textContent = "Enter valid measurements to see your estimate.";
      error.hidden = false;
      return;
    }
    const values = Object.fromEntries(new FormData(form));
    // Most fields are numeric, but some selects carry a word — an operation, a
    // unit, a shape. Coercing those to Number silently turns them into NaN.
    Object.keys(values).forEach(k => {
      const raw = values[k];
      values[k] = raw !== "" && isNaN(raw) ? raw : Number(raw);
    });
    convertUnits(values, cfg.unitBase);
    values.costUnit = cfg.costUnit;
    try {
      const result = calculate(cfg.kind, values);
      error.hidden = true;
      empty.hidden = true;
      output.hidden = false;
      document.getElementById("result-label").textContent = result.rows[0].label;
      document.getElementById("result-main").textContent = fmt(result.rows[0]);
      const list = document.getElementById("result-rows");
      list.replaceChildren();
      result.rows.slice(1).forEach(r => {
        const li = document.createElement("li");
        const label = document.createElement("span");
        const value = document.createElement("b");
        label.textContent = r.label; value.textContent = fmt(r);
        li.append(label, value); list.append(li);
      });
      document.getElementById("result-note").textContent = result.note;
      if (report && window.matchMedia("(max-width: 800px)").matches) document.getElementById("project-result").focus({ preventScroll: false });
    } catch (e) { error.textContent = e.message; error.hidden = false; }
  }
  form.addEventListener("submit", e => { e.preventDefault(); calculated = true; update(true); });
  form.addEventListener("input", () => update(false));
  form.addEventListener("change", () => update(false));
  document.getElementById("use-example").addEventListener("click", () => {
    Object.entries(cfg.example).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; });
    calculated = true; update(true);
  });
  document.getElementById("reset-calc").addEventListener("click", () => { form.reset(); calculated = false; output.hidden = true; empty.hidden = false; error.hidden = true; form.querySelector("input,select").focus(); });
})();
