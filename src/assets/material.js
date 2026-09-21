/* Ruler Square — bulk material calculator (gravel, stone, sand, topsoil, dirt).
 *
 * One engine drives every aggregate page. The page sets the default material;
 * the visitor can switch it. Shared with Node for the test suite.
 */
(function () {
  "use strict";

  var FT3_PER_YD3 = 27;
  var LB_PER_TON = 2000;
  var M3_PER_FT3 = 0.028316846592;

  var DENSITY = {
    "gravel": 2800, "pea-gravel": 2800, "crushed": 2700, "river-rock": 2700,
    "limestone": 2700, "abc": 3000, "sand": 2700, "sand-wet": 3240,
    "topsoil": 2000, "fill-dirt": 2000, "mulch": 800, "riprap": 2700,
    "asphalt": 3915
  };

  // One box plus a unit, rather than a feet box and an inches box. Two boxes
  // per dimension doubles what the visitor has to read and fill in.
  var FT_PER = { in: 1 / 12, ft: 1, yd: 3, cm: 0.032808399, m: 3.280839895 };

  function num(v) {
    var n = parseFloat(v);
    return isFinite(n) && n > 0 ? n : 0;
  }
  function len(v, name) {
    return num(v[name]) * (FT_PER[v[name + "Unit"]] || 1);
  }

  /* Square feet of ground the job covers. */
  function areaFt2(shape, v) {
    switch (shape) {
      case "rect":
        return len(v, "length") * len(v, "width");
      case "circle":
        var r = len(v, "diameter") / 2;
        return Math.PI * r * r;
      case "area":
        return num(v.areaFt2);
      default:
        return 0;
    }
  }

  function calc(shape, v) {
    var material = v.material && DENSITY[v.material] ? v.material : "gravel";
    var lbPerYd3 = num(v.density) || DENSITY[material];
    // Compaction is capped at 50%: past that the number is a guess, not an estimate.
    var compaction = Math.min(50, Math.max(0, parseFloat(v.compaction) || 0));

    var ft2 = areaFt2(shape, v);
    var depthFt = len(v, "depth");
    var ft3 = ft2 * depthFt;
    var ft3c = ft3 * (1 + compaction / 100);
    var yd3 = ft3c / FT3_PER_YD3;
    var tons = yd3 * lbPerYd3 / LB_PER_TON;

    // Suppliers sell in whole and half yards; round up so the job is covered.
    var orderYd3 = yd3 > 0 ? Math.ceil(yd3 * 2 - 1e-9) / 2 : 0;
    var orderTons = tons > 0 ? Math.ceil(tons * 2 - 1e-9) / 2 : 0;

    // A cubic yard spread 3 in deep covers 108 sq ft.
    var coverageFt2 = depthFt > 0 ? FT3_PER_YD3 / depthFt : 0;

    var price = num(v.price);
    var cost = null;
    if (price > 0) { cost = (v.priceUnit === "yd3" ? yd3 : tons) * price; }

    return {
      material: material,
      areaFt2: ft2,
      ft3: ft3,
      ft3Compacted: ft3c,
      yd3: yd3,
      m3: ft3c * M3_PER_FT3,
      tons: tons,
      lbs: tons * LB_PER_TON,
      orderYd3: orderYd3,
      orderTons: orderTons,
      coverageFt2: coverageFt2,
      bags: ft3c > 0 ? Math.ceil(ft3c / (num(v.bagSize) || 2) - 1e-9) : 0,
      density: lbPerYd3,
      bags2ft3: ft3c > 0 ? Math.ceil(ft3c / 2 - 1e-9) : 0,
      cost: cost
    };
  }

  var api = { calc: calc, areaFt2: areaFt2, DENSITY: DENSITY, FT_PER: FT_PER };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  if (typeof document === "undefined") { return; }

  // ---------- UI ----------
  function fmt(n, d) {
    return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  var form = document.getElementById("material-form");
  if (!form) { return; }

  function values() {
    var out = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (el.name && (el.type !== "radio" || el.checked)) { out[el.name] = el.value; }
    });
    return out;
  }
  function currentShape() {
    var c = form.querySelector('input[name="shape"]:checked');
    return c ? c.value : "rect";
  }
  function set(id, text) { var el = document.getElementById(id); if (el) { el.textContent = text; } }

  /* Nothing is computed until the visitor asks for it. Showing a figure for
   * dimensions they never typed is worse than showing nothing. */
  var calculated = false;

  function showShape() {
    var shape = currentShape();
    Array.prototype.forEach.call(document.querySelectorAll(".shape"), function (s) {
      s.hidden = s.getAttribute("data-shape") !== shape;
    });
    return shape;
  }

  function update(report) {
    var shape = showShape();
    if (!calculated) { return; }
    if (!window.RSValidate(form, report === true)) { return; }
    var empty = document.getElementById("r-empty");
    var out = document.getElementById("r-out");
    if (empty) { empty.hidden = true; }
    if (out) { out.hidden = false; }

    var r = calc(shape, values());
    set("r-tons", fmt(r.tons, 2));
    set("r-yd3", fmt(r.yd3, 2));
    set("r-ft3", fmt(r.ft3Compacted, 1));
    set("r-area", r.areaFt2 > 0 ? fmt(r.areaFt2, 0) + " ft²" : "—");
    set("r-order-yd3", r.orderYd3 > 0 ? fmt(r.orderYd3, 1) + " yd³" : "—");
    set("r-order-tons", r.orderTons > 0 ? fmt(r.orderTons, 1) + " tons" : "—");
    set("r-coverage", r.coverageFt2 > 0 ? fmt(r.coverageFt2, 0) + " ft² per yd³" : "—");
    set("r-bags", r.bags ? fmt(r.bags, 0) + " bags" : "—");

    var costBox = document.getElementById("r-cost-box");
    if (costBox) {
      if (r.cost !== null && r.yd3 > 0) {
        costBox.hidden = false;
        set("r-cost", "$" + fmt(r.cost, 0));
      } else {
        costBox.hidden = true;
      }
    }


    var tip = document.getElementById("r-tip");
    if (tip) {
      tip.textContent = "Estimated weight: " + fmt(r.lbs, 0) + " lb before order rounding. Confirm density and delivery with your supplier. A truck’s available payload, not its bed size, determines a safe load.";
    }
  }
  // Pressing Calculate is what starts it. After that, edits update live.
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    calculated = true;
    update(true);
  });
  form.addEventListener("input", update);
  form.addEventListener("change", update);
  showShape();
})();
