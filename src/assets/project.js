/* Quantity, home-system, and cost engines shared by browser and automated tests.
 * Measurement inputs stay empty on load; once valid required values are entered,
 * calculations run live immediately and stay synced with URL query params. */
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
        // Posts: buried at least 2 ft or a third of the above-ground height, whichever
        // is more, then rounded up to a stock length. Concrete: the page's own rule of
        // two 50 lb bags per hole for a 6-ft privacy post, scaled by burial depth.
        const height = v.height || 6;
        const bury = Math.max(2, height / 3);
        const stock = [6, 8, 10, 12, 14, 16].find(L => L >= height + bury) || ceil(height + bury);
        const posts = sections + 1;
        rows = [
          row("Pickets to buy", ceil(pickets * extra), "pickets"),
          row("Posts for one straight run", posts, "posts"),
          row("Post length to buy", stock, "ft"),
          row("Hole depth", bury * 12, "in"),
          row("Fast-setting concrete, 50 lb bags", ceil(posts * 2 * bury / 2), "bags"),
          row("Horizontal rails", sections * v.rails, "rails"),
          row("Sections", sections),
          row("Even post spacing", v.length / sections, "ft", 2),
        ];
        note = "Straight run excluding gates. Gate posts need deeper holes and more concrete; fasteners and hardware are separate.";
        break;
      }
      case "deck": {
        const boardRows = ceil((v.width * 12 + v.gap) / (v.boardWidth + v.gap));
        const perRow = ceil(v.length / v.boardLength);
        const base = boardRows * perRow;
        count = ceil(base * extra);
        // Joists run across the boards, spaced along the deck length. Two screws per
        // board at every joist (≈350 per 100 ft² at 16 in on center, the rate the page
        // already states); hidden clips take one per board per joist instead.
        const joists = ceil(v.length * 12 / (v.joistSpacing || 16)) + 1;
        rows = [
          row("Deck boards to buy", count, "boards"),
          row("Deck surface", v.length * v.width, "ft²", 1),
          row("Rows across the deck", boardRows),
          row("Stock boards per row", perRow),
          row(`Joists at ${v.joistSpacing || 16} in on center`, joists, "joists"),
          row("Deck screws (2 per board at each joist)", 2 * boardRows * joists, "screws"),
          row("Or hidden clips (1 per board at each joist)", boardRows * joists, "clips"),
          row("Board material cost", count * (v.price || 0), "$", 2),
        ];
        note = "Surface boards running along the deck length. Beams, posts, footings, railings and stairs are separate; diagonal decking needs joists at 12 in on center.";
        break;
      }
      case "siding": {
        const walls = v.perimeter * v.wallHeight;
        const gables = (v.gables || 0) * 0.5 * (v.gableBase || 0) * (v.gableHeight || 0);
        const openings = (v.doors || 0) * (v.doorArea || 0) + (v.windows || 0) * (v.windowArea || 0);
        area = walls + gables - openings;
        if (area <= 0) throw new Error("Doors and windows must be smaller than the wall area.");
        needed = area * extra;
        const squares = needed / 100;
        rows = [
          row("Siding to order", needed, "ft²", 1),
          row("Siding squares", squares, "squares", 2),
          row("Vinyl boxes (2 squares each)", ceil(squares / 2), "boxes"),
          row("Wall area", walls, "ft²", 1),
          row("Gable area", gables, "ft²", 1),
          row("Doors and windows subtracted", openings, "ft²", 1),
          row("Material cost", needed * (v.price || 0), "$", 2),
        ];
        note = "Based on exposed coverage after overlap. Add starter strip, J-channel, corners and soffit separately.";
        break;
      }
      case "drywall":
        area = 2 * (v.length + v.width) * v.height + (v.ceiling === 1 ? v.length * v.width : 0) - v.openings;
        if (area <= 0) throw new Error("Openings must be smaller than the wall and ceiling area.");
        count = ceil(area * extra / v.sheetArea);
        // Accessories at the rates printed on the page (USG / CertainTeed guidance):
        // 35 screws and 35–40 ft of tape per 4×8 sheet, 1 gal of joint compound per
        // 100 ft² for a Level 4 finish. Scaled to the chosen sheet size.
        rows = [
          row("Drywall sheets to buy", count, "sheets"),
          row("Net surface area", area, "ft²", 1),
          row("Area with waste", area * extra, "ft²", 1),
          row("Screws (about 35 per 4×8 sheet)", ceil(count * 35 * v.sheetArea / 32), "screws"),
          row("Joint compound, Level 4 finish", ceil(area / 100), "gal"),
          row("Joint tape", ceil(count * 37.5 * v.sheetArea / 32), "ft"),
          row("Sheet material cost", count * (v.price || 0), "$", 2),
        ];
        note = "Single layer of drywall for one rectangular room. Add corner bead for outside corners; a Level 5 finish takes more compound.";
        break;
      case "tile":
      case "paver": {
        area = v.length * v.width;
        // Tile: each piece plus its grout joint is the repeating unit (3 of the top 4 count it).
        const joint = kind === "tile" ? (v.gap || 0) : 0;
        const pieceArea = (v.pieceLength + joint) * (v.pieceWidth + joint) / 144;
        count = ceil(area * extra / pieceArea);
        rows = [
          row(kind === "tile" ? "Tiles to buy" : "Pavers to buy", count, kind === "tile" ? "tiles" : "pavers"),
          row("Project area", area, "ft²", 1),
          row("Area with waste", area * extra, "ft²", 1),
          row("Coverage per piece", pieceArea, "ft²", 3),
          row("Material cost", count * (v.price || 0), "$", 2),
        ];
        if (kind === "tile" && v.boxCount > 0) rows.splice(1, 0, row("Whole boxes", ceil(count / v.boxCount), "boxes"));
        if (kind === "paver") {
          rows.push(
            row("Base volume before compaction", area * v.baseDepth / 324, "yd³", 2),
            row("Bedding sand volume", area * v.sandDepth / 324, "yd³", 2)
          );
        }
        note = kind === "tile"
          ? "Raise waste to 15% for diagonal layouts or large-format tile, and keep a spare box from the same dye lot."
          : "Add 15–20% compaction to base gravel when ordering crusher run; screed bedding sand loose at 1 inch.";
        break;
      }
      case "paint":
        area = 2 * (v.length + v.width) * v.height - v.openings;
        if (area <= 0) throw new Error("Openings must be smaller than the wall area.");
        needed = area * v.coats / v.coverage * extra;
        rows = [
          row("Whole gallons to buy", ceil(needed), "US gal"),
          row("Calculated paint", needed, "US gal", 2),
          row("Wall area", area, "ft²", 1),
          row("Coats", v.coats),
          row("Paint cost", ceil(needed) * (v.price || 0), "$", 2),
        ];
        note = "Walls only, one color. Primer, ceiling paint and trim enamel are calculated separately.";
        break;
      case "roofing": {
        const factor = Math.sqrt(1 + Math.pow(v.pitch / 12, 2));
        area = v.area * factor;
        needed = area * extra;
        rows = [
          row("Shingle bundles to buy", ceil(needed / v.bundleCoverage), "bundles"),
          row("Sloped roof area", area, "ft²", 1),
          row("Roofing squares with waste", needed / 100, "squares", 2),
          row("Area with waste", needed, "ft²", 1),
          row("Pitch multiplier", factor, "×", 3),
          row("Shingle cost", ceil(needed / v.bundleCoverage) * (v.price || 0), "$", 2),
        ];
        note = "Field shingles only. Order starter strip, ridge cap, underlayment, ice & water shield and drip edge separately.";
        break;
      }
      case "retaining-wall": {
        const courses = ceil(v.height * 12 / v.blockHeight) + v.buried;
        const perCourse = ceil(v.length * 12 / v.blockLength);
        count = courses * perCourse;
        // Stone the page already prescribes: a 6-in compacted leveling pad that runs
        // 6 in past the block front and back, and 12 in of clean #57 stone behind the
        // full wall height. #57 at 2,700 lb/yd³ (materials table).
        const depth = v.blockDepth || 12;
        const padYd3 = v.length * (depth + 12) / 12 * 0.5 / 27;
        const drainYd3 = v.length * 1 * (courses * v.blockHeight / 12) / 27;
        rows = [
          row("Wall blocks to buy", ceil(count * extra), "blocks"),
          row("Blocks per course", perCourse),
          row("Courses including buried rows", courses),
          row("Cap pieces", ceil(v.length * 12 / v.capLength), "caps"),
          row("Base pad stone (6 in deep)", padYd3, "yd³", 2),
          row("Drainage stone behind the wall (12 in)", drainYd3, "yd³", 2),
          row("Base + drainage stone by weight", (padYd3 + drainYd3) * 2700 / 2000, "tons", 2),
          row("Perforated drain pipe", v.length, "ft", 0),
          row("Exposed wall face", v.length * v.height, "ft²", 1),
          row("Block material cost", ceil(count * extra) * (v.price || 0), "$", 2),
        ];
        note = "Straight level wall; cap thickness adds to finished height. Walls over 3–4 ft usually need geogrid and an engineer.";
        break;
      }
      case "insulation":
        needed = v.area * extra;
        count = ceil(needed / v.coverage);
        rows = [
          row("Packages to buy", count, "packages"),
          row("Area with allowance", needed, "ft²", 1),
          row("Purchased coverage", count * v.coverage, "ft²", 1),
          row("Material cost", count * (v.price || 0), "$", 2),
        ];
        note = "Based on the selected coverage per package at your target R-value. Confirm the bag or batt coverage printed on your brand.";
        break;
      case "board-and-batten": {
        const spaces = v.spaces;
        count = spaces + 1;
        const gap = (v.width - count * v.boardWidth) / spaces;
        if (gap <= 0) throw new Error("These battens do not fit. Reduce the number of spaces or the batten width.");
        rows = [
          row("Clear space between battens", gap, "in", 3),
          row("Battens including both ends", count, "battens"),
          row("Center-to-center spacing", gap + v.boardWidth, "in", 3),
          row("Vertical trim length", count * v.height / 12, "linear ft", 1),
        ];
        // Where each batten goes (left edge, from the left wall), to the nearest 1/16 in;
        // the top results give this layout, not just the gap.
        const sixteenth = x => {
          const t = Math.round(x * 16), whole = Math.floor(t / 16), f = t % 16;
          if (!f) return String(whole);
          let n = f, d = 16; while (n % 2 === 0) { n /= 2; d /= 2; }
          return (whole ? whole + " " : "") + n + "/" + d;
        };
        const marks = Array.from({ length: count }, (_, i) => sixteenth(i * (gap + v.boardWidth)));
        note = `Mark the left edge of each batten at: ${marks.join(", ")} in from the left wall. Measure every mark from that same edge to prevent cumulative drift.`;
        break;
      }
      case "grout": {
        if (v.mode === "tile") {
          const L = v.tileLength, W = v.tileWidth, T = v.tileThickness, J = v.jointWidth;
          const ratio = ((L + J) * (W + J) - L * W) / ((L + J) * (W + J));
          const ft3 = v.area * ratio * T / 12;
          const density = { sanded: 112, unsanded: 100, epoxy: 95 }[v.groutType] || 112;
          const lbs = ft3 * density * extra;
          const bags25 = ceil(lbs / 25);
          const bags10 = ceil(lbs / 10);
          const bagWt = v.bagWeight || 25;
          const buyBags = ceil(lbs / bagWt);
          rows = [
            row("Grout needed", lbs, "lb", 1),
            row(bagWt + " lb bags to buy", buyBags, "bags"),
            row("25 lb bags equivalent", bags25, "bags"),
            row("10 lb bags equivalent", bags10, "bags"),
            row("Area with waste", v.area * extra, "ft²", 1),
            row("Material cost", buyBags * (v.price || 0), "$", 2),
          ];
          note = "Calculated from tile dimensions, thickness and joint width using standard cement grout density (~112 lb/ft³ sanded, 100 lb/ft³ unsanded).";
          break;
        }
        needed = v.area * extra;
        count = ceil(needed / v.coverage);
        rows = [
          row("Packages to buy", count, "packages"),
          row("Area with allowance", needed, "ft²", 1),
          row("Coverage per package", v.coverage, "ft²", 1),
          row("Purchased coverage", count * v.coverage, "ft²", 1),
          row("Material cost", count * (v.price || 0), "$", 2),
        ];
        note = "Uses your grout bag's stated coverage chart for your tile size and joint width.";
        break;
      }
      case "thinset":
        needed = v.area * extra;
        count = ceil(needed / v.coverage);
        rows = [
          row("Packages to buy", count, "bags"),
          row("Area with allowance", needed, "ft²", 1),
          row("Coverage per package", v.coverage, "ft²", 1),
          row("Purchased coverage", count * v.coverage, "ft²", 1),
          row("Material cost", count * (v.price || 0), "$", 2),
        ];
        note = "Coverage follows trowel notch size for a 50 lb bag. Add 15–20% if back-buttering large-format tile or skimming an uneven floor.";
        break;
      case "cubic-yard":
        needed = v.length * v.width * v.depth / 324 * extra;
        rows = [
          row("Volume with allowance", needed, "yd³", 2),
          row("Cubic feet", needed * 27, "ft³", 2),
          row("Cubic meters", needed * 0.764554857984, "m³", 2),
          row("Base volume", v.length * v.width * v.depth / 324, "yd³", 2),
          row("Material cost", needed * (v.price || 0), "$", 2),
        ];
        note = "1 cubic yard = 27 cubic feet = 0.765 cubic meters. Use the Cubic Yards to Tons calculator to convert volume to weight.";
        break;
      case "feet-inches": {
        const a = (v.aFeet || 0) * 12 + (v.aInches || 0) + (v.aFrac || 0);
        const b = (v.bFeet || 0) * 12 + (v.bInches || 0) + (v.bFrac || 0);
        const op = v.operation || "add";
        let total;
        if (op === "subtract") total = a - b;
        else if (op === "multiply") {
          const f = v.factor || 0;
          if (f <= 0) throw new Error("Enter a multiplier greater than 0.");
          total = a * f;
        } else if (op === "divide") {
          const f = v.factor || 0;
          if (f <= 0) throw new Error("Enter a divisor greater than 0.");
          total = a / f;
        } else if (op === "convert") total = a;
        else total = a + b;
        if (total < 0) throw new Error("The result is negative. Check which measurement is larger.");
        if (total === 0 && op === "convert") throw new Error("Enter feet, inches, or a fraction to convert.");
        const toFrac16 = rem => {
          const whole = Math.floor(rem + 1e-9);
          const s16 = Math.round((rem - whole) * 16);
          if (s16 === 0) return String(whole);
          if (s16 === 16) return String(whole + 1);
          let n = s16, d = 16;
          while (n % 2 === 0 && d > 1) { n /= 2; d /= 2; }
          return (whole ? whole + " " : "") + n + "/" + d;
        };
        let ft = Math.floor(total / 12 + 1e-9);
        let inch = Math.max(0, total - ft * 12);
        let fracStr = toFrac16(inch);
        if (fracStr === "12") { ft += 1; fracStr = "0"; }
        rows = [
          row("Result", ft, "ft " + fracStr + " in"),
          row("Decimal feet", total / 12, "ft", 4),
          row("Total inches", total, "in", 3),
          row("Yards", total / 36, "yd", 4),
          row("Centimeters", total * 2.54, "cm", 2),
          row("Meters", total * 0.0254, "m", 4),
        ];
        note = "Rounded to the nearest 1/16 inch for tape-measure marking; decimal feet and metric values are exact.";
        break;
      }
      case "cubic-feet": {
        const perFoot = { in: 1 / 12, ft: 1, yd: 3, cm: 0.032808399, m: 3.280839895 }[v.unit] || 1;
        const l = v.length * perFoot, w = v.width * perFoot, h = v.height * perFoot;
        needed = l * w * h * extra;
        rows = [
          row("Volume", needed, "ft³", 2),
          row("Cubic yards", needed / 27, "yd³", 3),
          row("Cubic meters", needed * 0.028316846592, "m³", 3),
          row("US gallons", needed * 7.48051948, "gal", 1),
          row("Liters", needed * 28.316846592, "L", 1),
          row("Volume before allowance", l * w * h, "ft³", 2),
        ];
        note = "1 cubic foot = 1,728 cubic inches = 7.48 US gallons. Filled with water, 1 ft³ weighs 62.4 lb.";
        break;
      }
      case "board-foot": {
        const perPiece = v.thickness * v.width * (v.length * 12) / 144;
        needed = perPiece * v.pieces * extra;
        rows = [
          row("Board feet to buy", needed, "bf", 2),
          row("Board feet per piece", perPiece, "bf", 3),
          row("Board feet before waste", perPiece * v.pieces, "bf", 2),
          row("Linear feet", v.length * v.pieces, "ft", 1),
          row("Lumber cost", needed * (v.price || 0), "$", 2),
        ];
        note = "Uses nominal lumber dimensions (e.g., 2×4, not dressed 1.5×3.5) the way US lumberyards price board feet.";
        break;
      }
      case "roof-pitch": {
        const isRiseRun = v.mode === "rise-run";
        const pitch12 = isRiseRun ? (v.totalRise / v.run) * 12 : v.rise;
        const totalRiseFt = isRiseRun ? v.totalRise : v.run * v.rise / 12;
        const angle = Math.atan(pitch12 / 12) * 180 / Math.PI;
        const slopePct = (pitch12 / 12) * 100;
        const multiplier = Math.sqrt(pitch12 * pitch12 + 144) / 12;
        const rafter = v.run * multiplier;
        rows = [
          row("Pitch", pitch12, "in 12", isRiseRun ? 2 : 0),
          row("Angle", angle, "°", 2),
          row("Slope percentage", slopePct, "%", 1),
          row("Slope multiplier", multiplier, "", 4),
          row("Rafter length", rafter, "ft", 2),
          row("Total rise over this run", totalRiseFt, "ft", 2),
        ];
        if (v.footprint > 0) {
          const slopedArea = v.footprint * multiplier;
          rows.push(
            row("Sloped roof area", slopedArea, "ft²", 0),
            row("Roofing squares", slopedArea / 100, "squares", 2)
          );
        }
        note = "Rafter length covers the horizontal run from wall plate to ridge center. Add eave overhang and adjust for half the ridge board thickness.";
        break;
      }
      case "stair": {
        const risers = ceil(v.totalRise / v.maxRiser);
        const riser = v.totalRise / risers;
        const treads = risers - 1;
        const totalRun = treads * v.treadDepth;
        const stringerIn = Math.sqrt(v.totalRise * v.totalRise + totalRun * totalRun);
        const stringerFt = stringerIn / 12;
        const stdBoards = [8, 10, 12, 14, 16, 18, 20];
        const boardToBuy = stdBoards.find(l => l >= stringerFt) || ceil(stringerFt);
        const comfort = 2 * riser + v.treadDepth;
        const ircOk = riser <= 7.751 && v.treadDepth >= 10;
        rows = [
          row("Risers", risers),
          row("Actual riser height", riser, "in", 3),
          row("Treads", treads),
          row("Total run", totalRun / 12, "ft", 2),
          row("Stringer length", stringerFt, "ft", 2),
          row("2×12 stringer board to buy", boardToBuy, "ft"),
          row("Comfort rule (2R + T)", comfort, "in", 2),
        ];
        note = (ircOk ? "Meets IRC R311.7 limits (≤7¾ in riser, ≥10 in tread). " : "Check IRC R311.7 limits (7¾ in max riser, 10 in min tread). ") + "Ideal comfort range for 2R + T is 24–25 in. Maintain at least 6 ft 8 in (80 in) vertical headroom.";
        break;
      }
      case "brick": {
        const faceFt2 = (v.unitLength + v.joint) * (v.unitHeight + v.joint) / 144;
        const base = v.area / faceFt2;
        count = ceil(base * extra);
        rows = [
          row("Units to buy", count, "units"),
          row("Units per ft²", 1 / faceFt2, "", 2),
          row("Units before waste", ceil(base), "units"),
          row("Wall area", v.area, "ft²", 1),
          row("Material cost", count * (v.price || 0), "$", 2),
        ];
        note = "Single-wythe wall count with mortar joints. Use the Mortar Calculator to estimate 80 lb mortar bags for these units.";
        break;
      }
      case "ramp": {
        const runFt = v.rise / 12 * v.slope;
        const landings = Math.max(0, ceil(v.rise / 30) - 1);
        const surface = Math.hypot(runFt, v.rise / 12);
        rows = [
          row("Ramp run", runFt, "ft", 2),
          row("Sloped length", surface, "ft", 2),
          row("Slope", 1 / v.slope * 100, "%", 2),
          row("Intermediate landings by rise", landings),
          row("Sloped surface, excluding landings", surface * v.width, "ft²", 1),
        ];
        note = (v.slope < 12 ? "Steeper than the ADA 1:12 maximum slope. " : "") + "ADA limits each continuous run to 30 inches of rise; allow 60×60 in minimum top, bottom and intermediate landings.";
        break;
      }
      case "framing": {
        const studs = ceil(v.length * 12 / v.spacing) + 1;
        const corners = v.corners * 2;
        count = ceil((studs + corners) * extra);
        rows = [
          row("Studs to buy", count, "studs"),
          row("Studs on layout", studs),
          row("Extra corner and intersection studs", corners),
          row("Top and bottom plate", v.length * 3, "linear ft", 1),
          row("Lumber cost", count * (v.price || 0), "$", 2),
        ];
        note = "Straight wall with double top plate and single bottom plate. Add headers, king studs and jack studs for doors and windows.";
        break;
      }
      case "rebar": {
        const alongLength = ceil(v.width * 12 / v.spacing) + 1;
        const alongWidth = ceil(v.length * 12 / v.spacing) + 1;
        const linear = alongLength * v.length + alongWidth * v.width;
        const barsNeeded = ceil(linear / v.barLength * extra);
        const lbPerFt = { 3: 0.376, 4: 0.668, 5: 1.043, 6: 1.502, 7: 2.044, 8: 2.670 }[v.barSize] || 0.668;
        rows = [
          row("Stock-bar equivalent by total length", barsNeeded, "bars"),
          row("Linear feet of rebar", linear * extra, "ft", 1),
          row("Bars running the length", alongLength),
          row("Bars running the width", alongWidth),
          row("Total weight", linear * extra * lbPerFt, "lb", 1),
          row("Minimum stock material cost", barsNeeded * (v.price || 0), "$", 2),
        ];
        note = "Single flat slab mat before lap splices (typically 30–40× bar diameter) and chair supports. Plan cuts against your stock bar length.";
        break;
      }
      case "sod": {
        needed = v.area * extra;
        const rolls = ceil(needed / v.rollArea);
        rows = [
          row("Sod to buy", needed, "ft²", 1),
          row("Rolls or slabs", rolls, "rolls"),
          row("Pallets", ceil(rolls / v.perPallet), "pallets"),
          row("Area before waste", v.area, "ft²", 1),
          row("Sod cost", needed * (v.price || 0), "$", 2),
        ];
        note = "Standard pallets hold 400–500 ft² depending on the farm. Install sod within 24 hours of delivery in warm weather.";
        break;
      }
      case "markup": {
        const price = v.cost * (1 + v.markup / 100);
        const profit = price - v.cost;
        rows = [
          row("Price to quote", price, "$", 2),
          row("Profit", profit, "$", 2),
          row("Gross margin", profit / price * 100, "%", 2),
          row("Markup applied", v.markup, "%", 2),
          row("Margin needed for this markup", v.markup / (100 + v.markup) * 100, "%", 2),
        ];
        note = "Markup applies to job cost; margin is your share of the selling price. A 50% markup produces a 33.3% gross margin.";
        break;
      }
      case "labor-cost": {
        const burdened = v.rate * (1 + v.burden / 100);
        const total = burdened * v.hours * v.workers;
        rows = [
          row("Total labor", total, "$", 2),
          row("Burdened hourly rate", burdened, "$", 2),
          row("Total crew hours", v.hours * v.workers, "hrs", 1),
          row("Base wages", v.rate * v.hours * v.workers, "$", 2),
          row("Burden added", total - v.rate * v.hours * v.workers, "$", 2),
        ];
        note = "Labor burden adds FICA, unemployment taxes, workers' comp and benefits on top of wages (typically 25–40%).";
        break;
      }
      case "tank-volume": {
        const ft3 = v.shape === "cylinder"
          ? Math.PI * Math.pow(v.diameter / 24, 2) * (v.height / 12)
          : (v.length / 12) * (v.width / 12) * (v.height / 12);
        const gal = ft3 * 7.48051948;
        rows = [
          row("Capacity", gal, "US gal", 1),
          row("Liters", ft3 * 28.316846592, "L", 1),
          row("Cubic feet", ft3, "ft³", 3),
          row("Imperial gallons", gal * 0.8326741846, "imp gal", 1),
          row("Water weight when full", gal * 8.345, "lb", 0),
        ];
        if (v.fillDepth > 0) {
          const fillH = Math.min(v.fillDepth, v.height);
          const fillGal = gal * (fillH / v.height);
          rows.splice(1, 0,
            row("Filled volume at liquid depth", fillGal, "US gal", 1),
            row("Filled water weight", fillGal * 8.345, "lb", 0)
          );
        }
        note = "Internal tank capacity. Water weighs 8.345 lb per US gallon — verify floor or stand load ratings before filling.";
        break;
      }
      case "linear-feet": {
        const fromArea = v.mode === "area";
        const base = fromArea ? v.area * 12 / v.boardWidth : v.pieces * v.length;
        needed = base * extra;
        rows = [
          row("Linear feet", needed, "ft", 1),
          row("Linear yards", needed / 3, "yd", 1),
          row("Linear meters", needed * 0.3048, "m", 1),
          row("Total inches", needed * 12, "in", 0),
          row("Before allowance", base, "ft", 1),
          row("Material cost", needed * (v.price || 0), "$", 2),
        ];
        note = fromArea
          ? "Uses installed face width (e.g., 5.5 in for a 1×6 board). Narrower boards require more linear feet per square foot."
          : "A linear foot measures length only (12 inches), regardless of width or thickness.";
        break;
      }
      case "pool": {
        const avg = (v.shallow + v.deep) / 2;
        const surface = v.shape === "round" ? Math.PI * Math.pow(v.diameter / 2, 2)
          : v.shape === "oval" ? Math.PI * v.length * v.width / 4
          : v.length * v.width;
        const ft3 = surface * avg;
        const gal = ft3 * 7.48051948;
        rows = [
          row("Pool volume", gal, "US gal", 0),
          row("Liters", ft3 * 28.316846592, "L", 0),
          row("Cubic feet", ft3, "ft³", 1),
          row("Average depth", avg, "ft", 2),
          row("Water surface", surface, "ft²", 1),
          row("Water weight", gal * 8.345, "lb", 0),
        ];
        note = "Measure water depth from pool floor to waterline, not wall height. Chemical labels are dosed per 10,000 gallons.";
        break;
      }
      case "wallpaper": {
        const strips = ceil(v.wallWidth * 12 / v.rollWidth);
        const stripLength = v.height * 12 + (v.repeat || 0) + (v.trim || 0);
        const perRoll = Math.floor(v.rollLength * 12 / stripLength + 1e-9);
        if (perRoll < 1) throw new Error("One strip is longer than the roll. Check the wall height and the roll length.");
        const withSpare = ceil(strips * extra);
        count = ceil(withSpare / perRoll);
        rows = [
          row("Rolls to buy", count, "rolls"),
          row("Strips to hang", strips, "strips"),
          row("Strips including spare", withSpare, "strips"),
          row("Full strips per roll", perRoll),
          row("Cut length per strip", stripLength / 12, "ft", 2),
          row("Wall area", v.wallWidth * v.height, "ft²", 1),
          row("Wallpaper cost", count * (v.price || 0), "$", 2),
        ];
        note = "Counts full-height strips across the total wall width. Buy every roll from the same batch number so color matches across seams.";
        break;
      }
      case "flooring": {
        area = v.length * v.width;
        needed = area * extra;
        const boxes = v.boxCoverage > 0 ? ceil(needed / v.boxCoverage) : 0;
        rows = [
          row("Flooring to buy", needed, "ft²", 1),
          row("Room area", area, "ft²", 1),
          row("Allowance for cuts", needed - area, "ft²", 1),
          row("Square yards", needed / 9, "yd²", 1),
          row("Material cost", (boxes ? boxes * v.boxCoverage : needed) * (v.price || 0), "$", 2),
        ];
        if (boxes) rows.splice(1, 0, row("Boxes to buy", boxes, "boxes"), row("Coverage in those boxes", boxes * v.boxCoverage, "ft²", 1));
        note = "Use 10% waste for straight lay, 15% for diagonal or herringbone. Keep one spare box for future plank repairs.";
        break;
      }
      case "carpet": {
        area = v.length * v.width;
        needed = area * extra;
        const drops = ceil(Math.min(v.length, v.width) / v.rollWidth);
        rows = [
          row("Carpet to order", needed / 9, "yd²", 1),
          row("Same in square feet", needed, "ft²", 1),
          row("Room area", area, "ft²", 1),
          row("Roll widths across the room", drops),
          row("Seams", drops - 1),
          row("Carpet cost", needed / 9 * (v.price || 0), "$", 2),
        ];
        note = "Order matching carpet pad for the same area. Rooms wider than 12 ft in both directions need a seam or a 15 ft roll.";
        break;
      }
      case "cost": {
        const quantity = v.quantity || v.length * v.width;
        if (v.high < v.low) throw new Error("The high unit price must be at least the low unit price.");
        const extras = (v.delivery || 0) + (v.removal || 0) + (v.other || 0);
        // Priced add-ons: counted items (stairs) or a per-area option (texture).
        const addonRows = [];
        let addLow = 0, addHigh = 0;
        (v.addons || []).forEach(a => {
          let lo = 0, hi = 0, label = a.label;
          if (a.options) {
            const o = a.options.find(o => o[0] === v[a.name]);
            if (!o || !o[3]) return;
            lo = quantity * o[2]; hi = quantity * o[3]; label = o[4] || a.label;
          } else {
            const count = v[a.name] || 0;
            if (!count) return;
            lo = count * a.low; hi = count * a.high; label = a.label + " (" + count + " " + a.unit + ")";
          }
          addLow += lo; addHigh += hi;
          addonRows.push(row(label, [lo, hi], "$", 0));
        });
        const workLow = quantity * v.low + addLow;
        const workHigh = quantity * v.high + addHigh;
        const low = workLow + extras;
        const high = workHigh + extras;
        rows = [
          row("Planning range", [low * extra, high * extra], "$", 0),
          row("Measured quantity", quantity, v.costUnit || "ft²", 2),
          row("Unit rate applied", [v.low, v.high], "$/" + (v.costUnit || "ft²"), 2),
          ...addonRows,
          row("Work before extras", [workLow, workHigh], "$", 0),
        ];
        const laborShare = v.costUnit === "yd³" ? 0 : (typeof v.laborShare === "number" ? v.laborShare : 0.5);
        if (laborShare > 0 && laborShare < 1) {
          const matPct = Math.round((1 - laborShare) * 100);
          const labPct = Math.round(laborShare * 100);
          rows.push(
            row(`Est. materials (~${matPct}%)`, [workLow * (1 - laborShare), workHigh * (1 - laborShare)], "$", 0),
            row(`Est. labor (~${labPct}%)`, [workLow * laborShare, workHigh * laborShare], "$", 0)
          );
        }
        rows.push(
          row("Separate extras", extras, "$", 0),
          row("Contingency", v.waste || 0, "%")
        );
        note = "Estimate from the rates above, before sales tax. Compare 2–3 itemized local bids with matching scope before signing.";
        break;
      }

      /* ========== NEW CALCULATORS (PHASE 4 EXPANSION) ========== */

      case "gutter-size": {
        const pitchFactor = v.pitch <= 3 ? 1.0 : v.pitch <= 5 ? 1.05 : v.pitch <= 8 ? 1.1 : v.pitch <= 11 ? 1.2 : 1.3;
        const effArea = v.area * pitchFactor;
        const flowIndex = effArea * v.rainfall;
        const gpm = effArea * v.rainfall * 0.0103896;
        const recSize = flowIndex <= 5520 ? 5 : flowIndex <= 7960 ? 6 : 7;
        const ds34 = ceil(flowIndex / 4800);
        const ds23 = ceil(flowIndex / 2400);
        rows = [
          row("Recommended K-style gutter", recSize, "in"),
          row("Adjusted drainage area", effArea, "ft²", 0),
          row("Peak runoff flow", gpm, "GPM", 1),
          row("3 × 4 in downspouts needed", ds34, "downspouts"),
          row("2 × 3 in downspouts needed", ds23, "downspouts"),
          row("Roof pitch factor", pitchFactor, "×", 2),
        ];
        note = "Sized to SMACNA drainage capacity using your roof area, pitch multiplier and peak 5-minute rainfall rate. Slope gutters 1/4 in per 10 ft toward downspouts.";
        break;
      }
      case "concrete-steps": {
        const n = Math.max(1, Math.floor(v.stepCount));
        const riseFt = v.riserHeight / 12;
        const treadFt = v.treadDepth / 12;
        const platFt = v.platformDepth > 0 ? v.platformDepth / 12 : treadFt;
        const ft3 = v.stepWidth * riseFt * (treadFt * ((n - 1) * n / 2) + platFt * n);
        const ft3w = ft3 * extra;
        const yd3 = ft3w / 27;
        rows = [
          row("Concrete needed", yd3, "yd³", 2),
          row("Cubic feet with waste", ft3w, "ft³", 1),
          row("80 lb concrete bags", ceil(ft3w / 0.60), "bags"),
          row("60 lb concrete bags", ceil(ft3w / 0.45), "bags"),
          row("Number of steps", n),
          row("Total stair height", n * v.riserHeight, "in", 1),
          row("Concrete cost", yd3 * (v.price || 0), "$", 2),
        ];
        note = "Solid-pour concrete steps including the top platform. Pour over a compacted 4-inch crushed stone base with #4 rebar dowels into the landing.";
        break;
      }
      case "sonotube": {
        const r = v.diameter / 24;
        const oneFt3 = Math.PI * r * r * v.depth;
        const ft3w = oneFt3 * v.tubes * extra;
        const yd3 = ft3w / 27;
        rows = [
          row("Concrete needed", yd3, "yd³", 2),
          row("80 lb bags", ceil(ft3w / 0.60), "bags"),
          row("60 lb bags", ceil(ft3w / 0.45), "bags"),
          row("50 lb bags", ceil(ft3w / 0.375), "bags"),
          row("Volume per tube", oneFt3, "ft³", 2),
          row("Total cubic feet", ft3w, "ft³", 1),
          row("Concrete cost", yd3 * (v.price || 0), "$", 2),
        ];
        note = "Round concrete column forms. Set footings below your local frost line and flare the base if required by your deck or porch plan.";
        break;
      }
      case "fence-post-concrete": {
        const holeArea = Math.PI * Math.pow(v.holeDiameter / 2, 2);
        const postArea = { "4x4": 12.25, "6x6": 30.25, "round4": 12.566, "steel2": 4.43 }[v.postType] || 12.25;
        const netArea = Math.max(4, holeArea - postArea);
        const oneFt3 = netArea * v.holeDepth / 1728;
        const totalFt3 = oneFt3 * v.posts * extra;
        const bagYield = { 50: 0.375, 60: 0.45, 80: 0.60 }[v.bagSize] || 0.375;
        const bags = ceil(totalFt3 / bagYield);
        rows = [
          row(v.bagSize + " lb bags to buy", bags, "bags"),
          row("Bags per post", oneFt3 / bagYield, "bags", 2),
          row("Total cubic feet", totalFt3, "ft³", 2),
          row("Total cubic yards", totalFt3 / 27, "yd³", 2),
          row("Total bag weight", bags * v.bagSize, "lb", 0),
          row("Concrete bag cost", bags * (v.price || 0), "$", 2),
        ];
        note = "Subtracts the post displacement from each cylindrical hole. Put 4–6 inches of gravel under wood posts for drainage and slope concrete away from the post.";
        break;
      }
      case "concrete-bag": {
        const ft3 = v.mode === "column"
          ? Math.PI * Math.pow(v.diameter / 24, 2) * v.height
          : v.length * v.width * (v.thickness / 12);
        const ft3w = ft3 * extra;
        const yieldMap = { 40: 0.30, 50: 0.375, 60: 0.45, 80: 0.60 };
        const bags = ceil(ft3w / (yieldMap[v.bagSize] || 0.60));
        rows = [
          row(v.bagSize + " lb bags to buy", bags, "bags"),
          row("80 lb bags", ceil(ft3w / 0.60), "bags"),
          row("60 lb bags", ceil(ft3w / 0.45), "bags"),
          row("50 lb bags", ceil(ft3w / 0.375), "bags"),
          row("Cubic yards", ft3w / 27, "yd³", 2),
          row("Total bag weight", bags * v.bagSize, "lb", 0),
          row("Material cost", bags * (v.price || 0), "$", 2),
        ];
        note = "45 bags of 80 lb concrete equal 1 cubic yard (3,600 lb). Above 1 cubic yard, ready-mix delivery usually saves time and money.";
        break;
      }
      case "mortar": {
        const perBag80 = v.unitType === "block" ? 13 : 35;
        const perBag60 = v.unitType === "block" ? 10 : 26;
        const rate = v.bagSize === 60 ? perBag60 : perBag80;
        const unitsWithWaste = v.units * extra;
        const bags = ceil(unitsWithWaste / rate);
        rows = [
          row(v.bagSize + " lb mortar bags", bags, "bags"),
          row("80 lb bags equivalent", ceil(unitsWithWaste / perBag80), "bags"),
          row("60 lb bags equivalent", ceil(unitsWithWaste / perBag60), "bags"),
          row("Masonry units covered", v.units, v.unitType === "block" ? "blocks" : "bricks"),
          row("Total mortar weight", bags * v.bagSize, "lb", 0),
          row("Mortar cost", bags * (v.price || 0), "$", 2),
        ];
        note = "Based on standard ⅜-inch mortar joints (Type N or Type S). One 80 lb bag lays ~35 modular bricks or ~13 standard 8×8×16 concrete blocks.";
        break;
      }
      case "self-leveling": {
        const covAtDepth = v.bagCoverage * (0.25 / v.depth);
        const areaWithWaste = v.area * extra;
        const bags = ceil(areaWithWaste / covAtDepth);
        const galPrimer = ceil(v.area / 300);
        rows = [
          row("50 lb bags to buy", bags, "bags"),
          row("Coverage per bag at this depth", covAtDepth, "ft²", 1),
          row("Area with allowance", areaWithWaste, "ft²", 1),
          row("Concrete primer needed", galPrimer, "gal"),
          row("Total weight", bags * 50, "lb", 0),
          row("Material cost", bags * (v.price || 0), "$", 2),
        ];
        note = "Standard 50 lb self-leveling underlayment covers ~25 ft² at ¼ inch deep (50 ft² at ⅛ in, 12.5 ft² at ½ in). Prime the subfloor before pouring.";
        break;
      }
      case "plywood": {
        area = v.length * v.width;
        needed = area * extra;
        count = ceil(needed / v.sheetArea);
        rows = [
          row("Sheets to buy", count, "sheets"),
          row("Area with waste", needed, "ft²", 1),
          row("Net surface area", area, "ft²", 1),
          row("Purchased sheet coverage", count * v.sheetArea, "ft²", 0),
          row("Material cost", count * (v.price || 0), "$", 2),
        ];
        note = "Standard 4×8 sheets cover 32 ft². Leave a ⅛-inch expansion gap between roof and wall sheathing panels and stagger end joints.";
        break;
      }
      case "metal-roofing": {
        const factor = Math.sqrt(1 + Math.pow(v.pitch / 12, 2));
        const sloped = v.area * factor;
        const orderArea = sloped * extra;
        const panelArea = (v.panelWidth / 12) * v.panelLength;
        const panels = ceil(orderArea / panelArea);
        const screws = ceil(orderArea * 0.8);
        rows = [
          row("Metal panels to buy", panels, "panels"),
          row("Sloped roof area", sloped, "ft²", 1),
          row("Area with waste", orderArea, "ft²", 1),
          row("Roofing squares", orderArea / 100, "squares", 2),
          row("Fasteners (exposed-screw)", screws, "screws"),
          row("Panel material cost", panels * (v.price || 0), "$", 2),
        ];
        note = "Uses exposed panel coverage width (36 in for standard ribbed/ag panels, 16 in for standing seam). Order ridge cap, eave trim and closure strips separately.";
        break;
      }
      case "baluster-spacing": {
        const lenIn = v.length * 12;
        if (lenIn <= v.maxGap) throw new Error("Opening length must be wider than the maximum gap.");
        const balusters = ceil((lenIn - v.maxGap) / (v.balusterWidth + v.maxGap));
        const spaces = balusters + 1;
        const clearGap = (lenIn - balusters * v.balusterWidth) / spaces;
        if (clearGap <= 0) throw new Error("Balusters are too wide to fit in this opening.");
        rows = [
          row("Balusters needed", balusters, "balusters"),
          row("Clear gap between balusters", clearGap, "in", 3),
          row("Center-to-center spacing", clearGap + v.balusterWidth, "in", 3),
          row("Equal open spaces", spaces),
          row("Opening length", lenIn, "in", 2),
        ];
        note = "IRC residential guard code limits open space so a 4-inch sphere cannot pass through. Measure every baluster from one post to avoid cumulative error.";
        break;
      }
      case "wainscoting": {
        const stiles = v.panels + 1;
        const clearW = (v.width - stiles * v.stileWidth) / v.panels;
        if (clearW <= 0) throw new Error("Too many panels for this wall width. Reduce panel count or stile width.");
        const stileFt = stiles * v.height / 12;
        const railFt = v.width * 2 / 12;
        const capFt = v.width / 12;
        rows = [
          row("Clear panel width", clearW, "in", 2),
          row("Vertical stiles", stiles, "stiles"),
          row("Center-to-center spacing", clearW + v.stileWidth, "in", 2),
          row("Vertical stile stock", stileFt, "linear ft", 1),
          row("Top & bottom rail stock", railFt, "linear ft", 1),
          row("Chair rail / cap molding", capFt, "linear ft", 1),
        ];
        note = "Includes full stiles at both wall ends plus continuous top and bottom rails. Add 10–15% extra trim stock for miter cuts.";
        break;
      }
      case "baseboard": {
        const net = v.length - v.doors * v.doorWidth;
        if (net <= 0) throw new Error("Door widths exceed the total room perimeter.");
        needed = net * extra;
        count = ceil(needed / v.boardLength);
        rows = [
          row("Trim boards to buy", count, "boards"),
          row("Total linear feet with waste", needed, "ft", 1),
          row("Net wall perimeter", net, "ft", 1),
          row("Purchased linear feet", count * v.boardLength, "ft", 0),
          row("Material cost", count * (v.price || 0), "$", 2),
        ];
        note = "Use longer 12–16 ft stock on long walls to reduce scarf joints. Cope inside corners for tighter seams than 45° miters.";
        break;
      }
      case "crown-molding": {
        const miterAllowance = v.corners * 0.5;
        needed = (v.length + miterAllowance) * extra;
        count = ceil(needed / v.boardLength);
        rows = [
          row("Molding boards to buy", count, "boards"),
          row("Linear feet with miter waste", needed, "ft", 1),
          row("Room perimeter", v.length, "ft", 1),
          row("Corner cut allowance", miterAllowance, "ft", 1),
          row("Material cost", count * (v.price || 0), "$", 2),
        ];
        note = "Includes 6 inches of extra length per corner for compound miters and coped joints, plus your percentage waste allowance.";
        break;
      }
      case "deck-stain": {
        const railArea = (v.railLength || 0) * 4;
        const totalSurface = v.area + railArea;
        const gal = totalSurface * v.coats / v.coverage;
        const whole = ceil(gal);
        rows = [
          row("Stain to buy", whole, "US gal"),
          row("Calculated stain", gal, "US gal", 2),
          row("Total stainable surface", totalSurface, "ft²", 0),
          row("Coats", v.coats),
          row("Stain cost", whole * (v.price || 0), "$", 2),
        ];
        note = "Dry, weathered wood absorbs noticeably more stain on the first coat (~150–200 ft²/gal). Allow 24–48 dry hours after washing before staining.";
        break;
      }
      case "exterior-paint": {
        area = v.area - (v.openings || 0);
        if (area <= 0) throw new Error("Openings must be smaller than the exterior wall area.");
        needed = area * v.coats / v.coverage * extra;
        const whole = ceil(needed);
        const primer = ceil(area / 300);
        rows = [
          row("Exterior paint to buy", whole, "US gal"),
          row("Calculated paint", needed, "US gal", 2),
          row("Net exterior wall area", area, "ft²", 0),
          row("Primer (1 coat, if needed)", primer, "US gal"),
          row("Paint cost", whole * (v.price || 0), "$", 2),
        ];
        note = "Rough stucco, cedar shakes and porous brick absorb more paint than smooth fiber cement or wood lap siding. Price trim and shutters separately.";
        break;
      }
      case "raised-bed": {
        const oneFt3 = v.length * v.width * (v.depth / 12);
        const ft3 = oneFt3 * v.beds;
        const yd3 = ft3 / 27;
        const bags = ceil(ft3 / v.bagSize);
        rows = [
          row("Soil needed", ft3, "ft³", 1),
          row("Cubic yards", yd3, "yd³", 2),
          row(v.bagSize + " ft³ bags", bags, "bags"),
          row("2 ft³ bags equivalent", ceil(ft3 / 2), "bags"),
          row("60% topsoil blend", ft3 * 0.6, "ft³", 1),
          row("30% compost / 10% aeration", ft3 * 0.4, "ft³", 1),
          row("Material cost", yd3 * (v.price || 0), "$", 2),
        ];
        note = "A classic vegetable bed mix is 60% screened topsoil, 30% finished compost and 10% perlite or coarse vermiculite. Above 1 yd³, bulk delivery usually beats bags.";
        break;
      }
      case "grass-seed": {
        const rates = {
          "tall-fescue": [8, 4],
          "kentucky-bluegrass": [3, 1.5],
          "perennial-rye": [8, 4],
          "fine-fescue": [5, 2.5],
          "bermuda": [2, 1],
          "zoysia": [2, 1],
          "sun-shade": [6, 3],
        };
        const pair = rates[v.grassType] || [6, 3];
        const rate = v.jobType === "overseed" ? pair[1] : pair[0];
        const lbs = (v.area / 1000) * rate * extra;
        rows = [
          row("Grass seed needed", lbs, "lb", 1),
          row("Seeding rate used", rate, "lb / 1,000 ft²", 1),
          row("5 lb bags", ceil(lbs / 5), "bags"),
          row("25 lb bags", ceil(lbs / 25), "bags"),
          row("Lawn area", v.area, "ft²", 0),
          row("Seed cost", lbs * (v.price || 0), "$", 2),
        ];
        note = "Broadcast half the seed north-south and half east-west for even coverage, then keep the top ½ inch of soil moist until germination.";
        break;
      }
      case "yards-to-tons": {
        const dens = v.density || 2800;
        const tonsPerYd = dens / 2000;
        if (v.mode === "ton-to-yd") {
          const yd3 = v.amount / tonsPerYd;
          rows = [
            row("Cubic yards", yd3, "yd³", 2),
            row("Cubic feet", yd3 * 27, "ft³", 1),
            row("Cubic meters", yd3 * 0.764554857984, "m³", 2),
            row("Weight entered", v.amount, "US tons", 2),
            row("Density used", dens, "lb/yd³", 0),
            row("Coverage at 3 in deep", yd3 * 108, "ft²", 0),
          ];
        } else {
          const tons = v.amount * tonsPerYd;
          rows = [
            row("US tons", tons, "tons", 2),
            row("Total weight", tons * 2000, "lb", 0),
            row("Metric tonnes", tons * 0.90718474, "t", 2),
            row("Cubic feet", v.amount * 27, "ft³", 1),
            row("Density used", dens, "lb/yd³", 0),
            row("Coverage at 3 in deep", v.amount * 108, "ft²", 0),
          ];
        }
        note = "1 US short ton = 2,000 lb. Wet sand and damp soil weigh 15–30% more per cubic yard than dry material.";
        break;
      }
      case "btu": {
        const ceilFactor = v.ceilingHeight / 8;
        const baseCool = Math.max(5000, v.area * 20);
        const occExtra = Math.max(0, (v.occupants || 2) - 2) * 600;
        const coolBtu = baseCool * ceilFactor * v.climate * v.sun + occExtra + (v.kitchen || 0);
        const roundedCool = ceil(coolBtu / 500) * 500;
        const tons = roundedCool / 12000;
        const heatFactor = v.climate === 1.15 ? 30 : v.climate === 0.9 ? 35 : v.climate === 1.25 ? 50 : 40;
        const heatBtu = ceil(v.area * heatFactor * ceilFactor / 1000) * 1000;
        const miniSplit = roundedCool <= 9000 ? 9000 : roundedCool <= 12000 ? 12000 : roundedCool <= 18000 ? 18000 : roundedCool <= 24000 ? 24000 : 36000;
        rows = [
          row("Cooling capacity needed", roundedCool, "BTU/hr", 0),
          row("AC tonnage", tons, "tons", 2),
          row("Suggested mini-split size", miniSplit, "BTU", 0),
          row("Estimated heating need", heatBtu, "BTU/hr", 0),
          row("Room volume", v.area * v.ceilingHeight, "ft³", 0),
        ];
        note = "Room-sizing estimate based on ENERGY STAR guidelines. Whole-home central HVAC should be sized with an ACCA Manual J load calculation.";
        break;
      }
      case "firewood": {
        const ft3 = v.length * v.height * (v.logLength / 12);
        const cords = ft3 / 128;
        const faceCords = (v.length * v.height) / 32;
        const btuM = cords * 22;
        const weight = cords * 3700;
        rows = [
          row("Full cords", cords, "cords", 2),
          row("Face cords (ricks)", faceCords, "face cords", 2),
          row("Stacked volume", ft3, "ft³", 1),
          row("Estimated seasoned hardwood heat", btuM, "million BTU", 1),
          row("Estimated seasoned hardwood weight", weight, "lb", 0),
        ];
        note = "A legal full cord is 128 ft³ tightly stacked (4 ft high × 8 ft long × 4 ft deep). A face cord (rick) is 4×8 ft at one log length (usually 16 in = ⅓ cord).";
        break;
      }
      case "generator-wattage": {
        const runW = v.runningWatts;
        const surgeW = runW + (v.largestSurge || 0);
        const recRun = ceil(runW * extra / 100) * 100;
        const recSurge = ceil(surgeW * extra / 100) * 100;
        const amps240 = recRun / 240;
        rows = [
          row("Recommended running watts", recRun, "W", 0),
          row("Recommended starting (surge) watts", recSurge, "W", 0),
          row("Base running load", runW, "W", 0),
          row("Peak starting load", surgeW, "W", 0),
          row("240V load current", amps240, "amps", 1),
        ];
        note = "Add the running watts of every item powered together, plus only the single largest motor starting surge (fridge, well pump, sump pump or AC).";
        break;
      }
      case "water-heater": {
        const fhr = v.people * 12 + v.showers * 15 + v.appliances * 10;
        const tankGal = fhr <= 52 ? 40 : fhr <= 67 ? 50 : fhr <= 82 ? 65 : 80;
        const gpm = v.showers * 2.5 + v.appliances * 1.5 + 0.5;
        const tempRise = 120 - v.groundTemp;
        const tanklessBtu = ceil(gpm * 500 * tempRise / 0.85 / 1000) * 1000;
        rows = [
          row("Tank First Hour Rating (FHR)", fhr, "gal/hr", 0),
          row("Typical storage tank size", tankGal, "gal", 0),
          row("Tankless flow needed", gpm, "GPM", 1),
          row("Temperature rise (to 120°F)", tempRise, "°F", 0),
          row("Gas tankless size needed", tanklessBtu, "BTU/hr", 0),
        ];
        note = "Match a storage tank's yellow EnergyGuide First Hour Rating (FHR) to your peak hour, or size a tankless unit to simultaneous GPM at your inlet water temperature.";
        break;
      }
      case "dehumidifier": {
        const table = {
          moderate: [22, 25, 30, 35, 45],
          very: [25, 30, 35, 45, 50],
          wet: [30, 35, 45, 50, 55],
          extreme: [35, 45, 50, 55, 70],
        };
        const tier = v.area <= 500 ? 0 : v.area <= 1000 ? 1 : v.area <= 1500 ? 2 : v.area <= 2000 ? 3 : 4;
        const basePints = (table[v.dampness] || table.moderate)[tier];
        const extraPints = v.area > 2500 ? ceil((v.area - 2500) / 500) * 8 : 0;
        const pints = basePints + extraPints;
        const drainTip = pints >= 45
          ? "For 45+ pint basements, pick a model with a continuous gravity hose or built-in condensate pump."
          : "A standard bucket or gravity drain hose fits this capacity.";
        rows = [
          row("Dehumidifier capacity", pints, "pints / day", 0),
          row("Water removed per day (max)", pints / 8, "US gal", 2),
          row("Old (pre-2019) rating equivalent", ceil(pints * 1.38), "pints / day", 0),
          row("Room area", v.area, "ft²", 0),
        ];
        note = "Capacities follow the post-2019 US DOE testing standard (65°F, 60% RH), where a modern 50-pint unit matches an older 70-pint label. " + drainTip;
        break;
      }
      case "bathroom-fan": {
        const roomArea = v.length * v.width;
        const ceilMult = v.height > 8 ? v.height / 8 : 1;
        const byArea = ceil(roomArea * ceilMult);
        const byFixtures = (v.fixtures || 2) * 50 + (v.jettedTub ? 100 : 0);
        const cfm = Math.max(50, roomArea > 100 ? Math.max(byArea, byFixtures) : byArea);
        const duct = cfm <= 100 ? 4 : 6;
        rows = [
          row("Minimum fan airflow", cfm, "CFM", 0),
          row("Bathroom area", roomArea, "ft²", 0),
          row("Room volume", roomArea * v.height, "ft³", 0),
          row("Recommended duct diameter", duct, "in", 0),
          row("Quiet noise target", 1.0, "sones or less", 1),
        ];
        note = "Follows HVI standards: at least 1 CFM per sq ft (50 CFM minimum), or 50 CFM per toilet/shower/tub + 100 CFM for a jetted tub in bathrooms over 100 ft².";
        break;
      }
      case "acreage": {
        const ft2 = v.length * v.width;
        const acres = ft2 / 43560;
        const perimeter = 2 * (v.length + v.width);
        rows = [
          row("Total acreage", acres, "acres", 4),
          row("Square feet", ft2, "ft²", 0),
          row("Square yards", ft2 / 9, "yd²", 1),
          row("Hectares", acres * 0.404685642, "ha", 4),
          row("Square meters", ft2 / 10.763910417, "m²", 1),
          row("Lot perimeter (fencing)", perimeter, "ft", 1),
        ];
        note = "1 acre = 43,560 square feet = 4,840 square yards (about 208.7 × 208.7 ft if square).";
        break;
      }
      default: throw new Error("Unknown calculator.");
    }
    rows = rows.filter(r => !/cost$/i.test(r.label) || v.price > 0);
    if (rows.some(r => (Array.isArray(r.value) ? r.value : [r.value]).some(n => typeof n === "number" && !Number.isFinite(n)))) {
      throw new Error("Use smaller, valid numbers.");
    }
    return { rows, note };
  }

  const TO_FT = { in: 1 / 12, ft: 1, yd: 3, cm: 0.032808399, m: 3.280839895 };
  const TO_FT2 = { in2: 1 / 144, ft2: 1, yd2: 9, m2: 10.763910417 };
  const TO_FT3 = { in3: 1 / 1728, ft3: 1, yd3: 27, m3: 35.314666721 };

  function convertUnits(values, unitBase) {
    Object.keys(values).forEach(k => {
      if (!/Unit$/.test(k)) { return; }
      const base = k.slice(0, -4);
      const chosen = values[k];
      const target = unitBase && unitBase[base];
      if (typeof values[base] === "number" && target && chosen) {
        const table = target in TO_FT3 ? TO_FT3 : (target in TO_FT2 ? TO_FT2 : TO_FT);
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
  let submitted = false;

  function syncFields() {
    form.querySelectorAll("[data-show-field]").forEach(field => {
      const control = form.elements.namedItem(field.dataset.showField);
      if (!control) return;
      const on = field.dataset.showValue.split("|").indexOf(control.value) !== -1;
      field.hidden = !on;
      field.querySelectorAll("input,select").forEach(el => { el.disabled = !on; });
    });
    if (cfg.kind === "tank-volume" && form.elements.shape) {
      const cylinder = form.elements.shape.value === "cylinder";
      if (window.RSShowDiagram) window.RSShowDiagram(form.elements.shape.value);
      ["diameter", "length", "width"].forEach(name => {
        const el = form.elements.namedItem(name);
        if (!el) return;
        const field = el.closest(".field");
        field.hidden = name === "diameter" ? !cylinder : cylinder;
        field.querySelectorAll("input,select").forEach(i => { i.disabled = field.hidden; });
      });
    }
    if ((cfg.kind === "pool" || cfg.kind === "concrete-bag") && form.elements.shape && window.RSShowDiagram) {
      window.RSShowDiagram(form.elements.shape.value);
    }
    if (cfg.kind === "concrete-bag" && form.elements.mode && window.RSShowDiagram) {
      window.RSShowDiagram(form.elements.mode.value);
    }
  }

  /* When a rate/spec selector (material, finish, state, trowel, R-value) changes,
   * automatically apply its mapped values into the editable numeric fields. */
  function applyPresetMap(sel) {
    if (!cfg.presetMaps || !sel || !sel.name || !cfg.presetMaps[sel.name]) return;
    const map = cfg.presetMaps[sel.name][sel.value];
    if (!map) return;
    Object.entries(map).forEach(([k, val]) => {
      const target = form.elements.namedItem(k);
      if (target) target.value = val;
    });
  }

  function fmt(r) {
    if (typeof r.value === "string") return r.value;
    const money = r.unit === "$" || r.unit.indexOf("$/") === 0;
    const per = r.unit.indexOf("$/") === 0 ? r.unit.slice(1) : "";
    const format = n => (money ? "$" : "") + n.toLocaleString("en-US", { maximumFractionDigits: r.digits, minimumFractionDigits: r.digits });
    const body = (Array.isArray(r.value) ? r.value.map(format).join("–") : format(r.value)) + per;
    return body + (r.unit && !money ? " " + r.unit : "");
  }

  function runCalc(report) {
    const invalid = Array.from(form.querySelectorAll("input,select")).find(el => !el.disabled && !el.closest("[hidden]") && !el.checkValidity());
    if (invalid) {
      output.hidden = true;
      empty.hidden = false;
      if (report) {
        const details = invalid.closest("details");
        if (details) details.open = true;
        invalid.reportValidity();
        error.textContent = "Enter valid measurements to see your estimate.";
        error.hidden = false;
      }
      return;
    }
    const values = Object.fromEntries(new FormData(form));
    Object.keys(values).forEach(k => {
      const raw = values[k];
      values[k] = raw !== "" && isNaN(raw) ? raw : Number(raw);
    });
    convertUnits(values, cfg.unitBase);
    values.costUnit = cfg.costUnit;
    if (typeof cfg.laborShare === "number") values.laborShare = cfg.laborShare;
    if (cfg.addons) values.addons = cfg.addons;
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
      const vis = document.getElementById("r-visual");
      if (vis && window.RSLiveDiagram) {
        const markup = window.RSLiveDiagram(cfg.kind, values, result);
        vis.innerHTML = markup;
        vis.hidden = !markup;
      }
      if (window.RSInitResultTools) window.RSInitResultTools(form);
      if (report && window.matchMedia("(max-width: 800px)").matches) {
        document.getElementById("project-result").focus({ preventScroll: false });
      }
    } catch (e) {
      output.hidden = true;
      empty.hidden = false;
      error.textContent = e.message;
      error.hidden = false;
    }
  }

  function update(report) {
    syncFields();
    if (report === true) {
      submitted = true;
      runCalc(true);
      return;
    }
    if (window.RSReadyToCalc && window.RSReadyToCalc(form)) {
      runCalc(false);
    } else if (submitted) {
      runCalc(false);
    } else {
      output.hidden = true;
      empty.hidden = false;
      error.hidden = true;
    }
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    update(true);
    if (!output.hidden && window.RSRevealResult) window.RSRevealResult(form);
  });
  form.addEventListener("input", () => update(false));
  form.addEventListener("change", e => {
    if (e.target && e.target.tagName === "SELECT") applyPresetMap(e.target);
    update(false);
  });

  const exBtn = document.getElementById("use-example");
  if (exBtn) {
    exBtn.addEventListener("click", () => {
      form.reset();
      Object.entries(cfg.example).forEach(([key, value]) => {
        const input = form.elements.namedItem(key);
        if (input) input.value = value;
      });
      update(true);
    });
  }
  const resetBtn = document.getElementById("reset-calc");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      form.reset();
      form.querySelectorAll("[data-appliance]").forEach(b => { b.classList.remove("on"); b.setAttribute("aria-pressed", "false"); });
      submitted = false;
      syncFields();
      output.hidden = true;
      empty.hidden = false;
      error.hidden = true;
      const first = form.querySelector("input:not([disabled]),select:not([disabled])");
      if (first) first.focus();
    });
  }
  form.addEventListener("click", e => {
    const app = e.target.closest("[data-appliance]");
    if (app) {
      app.classList.toggle("on");
      app.setAttribute("aria-pressed", app.classList.contains("on") ? "true" : "false");
      let totalRun = 0, maxSurge = 0;
      form.querySelectorAll("[data-appliance].on").forEach(b => {
        totalRun += Number(b.dataset.run) || 0;
        maxSurge = Math.max(maxSurge, Number(b.dataset.surge) || 0);
      });
      const rEl = form.elements.namedItem("runningWatts");
      const sEl = form.elements.namedItem("largestSurge");
      if (rEl) rEl.value = totalRun > 0 ? totalRun : "";
      if (sEl) sEl.value = maxSurge;
      update(false);
      return;
    }
    const chip = e.target.closest("[data-preset]");
    if (!chip) return;
    try {
      const data = JSON.parse(chip.getAttribute("data-preset"));
      form.reset();
      form.querySelectorAll("[data-appliance]").forEach(b => { b.classList.remove("on"); b.setAttribute("aria-pressed", "false"); });
      Object.entries(data).forEach(([k, val]) => {
        const input = form.elements.namedItem(k);
        if (input) input.value = val;
      });
      update(true);
    } catch {}
  });

  syncFields();
  if (window.RSLoadQuery) {
    window.RSLoadQuery(form, () => { syncFields(); update(false); });
  }
})();
