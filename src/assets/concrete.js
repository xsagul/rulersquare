/* Ruler Square — Concrete Calculator */
(function (root) {
  "use strict";

  var FT3_PER_YD3 = 27;
  var M3_PER_FT3 = 0.028316846592;
  // Typical yields printed on premixed concrete bags (cubic feet per bag).
  var BAGS = [
    { lb: 40, yield: 0.30 },
    { lb: 50, yield: 0.375 },
    { lb: 60, yield: 0.45 },
    { lb: 80, yield: 0.60 }
  ];

  var FT_PER = { in: 1 / 12, ft: 1, yd: 3, cm: 0.032808399, m: 3.280839895 };

  function num(v) {
    var n = parseFloat(v);
    return isFinite(n) && n > 0 ? n : 0;
  }
  // One box plus a unit selector; see material.js for why.
  function len(v, name) {
    return num(v[name]) * (FT_PER[v[name + "Unit"]] || 1);
  }

  // Returns cubic feet for one piece of the given shape.
  function volumeFt3(shape, v) {
    switch (shape) {
      case "slab":    // length x width x thickness
        return len(v, "length") * len(v, "width") * len(v, "thickness");
      case "footing": // total length x width x depth
        return len(v, "fLength") * len(v, "fWidth") * len(v, "fDepth");
      case "column":  // round column / tube: diameter x height
        var r = len(v, "diameter") / 2;
        return Math.PI * r * r * len(v, "height");
      case "circle":  // round slab: diameter x thickness
        var rc = len(v, "cDiameter") / 2;
        return Math.PI * rc * rc * len(v, "cThickness");
      default:
        return 0;
    }
  }

  function calc(shape, v) {
    var qty = Math.max(1, Math.floor(num(v.qty)) || 1);
    var waste = Math.min(50, Math.max(0, parseFloat(v.waste) || 0));
    var ft3 = volumeFt3(shape, v) * qty;
    var ft3w = ft3 * (1 + waste / 100);
    var yd3w = ft3w / FT3_PER_YD3;
    var price = num(v.price);
    return {
      ft3: ft3,
      yd3: ft3 / FT3_PER_YD3,
      ft3WithWaste: ft3w,
      yd3WithWaste: yd3w,
      m3WithWaste: ft3w * M3_PER_FT3,
      bags: BAGS.map(function (b) {
        return { lb: b.lb, count: ft3w > 0 ? Math.ceil(ft3w / b.yield - 1e-9) : 0 };
      }),
      orderYd3: yd3w > 0 ? Math.ceil(yd3w * 4 - 1e-9) / 4 : 0, // quarter-yard steps
      cost: price > 0 ? yd3w * price : null
    };
  }

  var api = { calc: calc, volumeFt3: volumeFt3, BAGS: BAGS, FT_PER: FT_PER };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  if (typeof document === "undefined") { return; }

  // ---------- UI ----------
  function fmt(n, d) {
    return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  var form = document.getElementById("concrete-form");
  if (!form) { return; }

  function values() {
    var out = {};
    Array.prototype.forEach.call(form.elements, function (el) { if (el.name) { out[el.name] = el.value; } });
    return out;
  }
  function currentShape() {
    var c = form.querySelector('input[name="shape"]:checked');
    return c ? c.value : "slab";
  }
  function showShape(shape) {
    Array.prototype.forEach.call(document.querySelectorAll(".shape"), function (s) {
      s.hidden = s.getAttribute("data-shape") !== shape;
    });
  }
  function set(id, text) { var el = document.getElementById(id); if (el) { el.textContent = text; } }

  /* Nothing is computed until the visitor asks for it. */
  var calculated = false;

  function update(report) {
    var shape = currentShape();
    showShape(shape);
    if (!calculated) { return; }
    if (!window.RSValidate(form, report === true)) { return; }
    var empty = document.getElementById("r-empty");
    var out = document.getElementById("r-out");
    if (empty) { empty.hidden = true; }
    if (out) { out.hidden = false; }

    var r = calc(shape, values());
    set("r-yd3", fmt(r.yd3WithWaste, 2));
    set("r-ft3", fmt(r.ft3WithWaste, 1));
    set("r-m3", fmt(r.m3WithWaste, 2));
    set("r-order", r.orderYd3 > 0 ? fmt(r.orderYd3, 2) + " yd³" : "—");
    r.bags.forEach(function (b) { set("r-bag" + b.lb, b.count ? fmt(b.count, 0) + " bags" : "—"); });
    var costBox = document.getElementById("r-cost-box");
    if (r.cost !== null && r.yd3WithWaste > 0) {
      costBox.hidden = false;
      set("r-cost", "$" + fmt(r.cost, 0));
    } else {
      costBox.hidden = true;
    }

    var tip = document.getElementById("r-tip");
    if (tip) {
      tip.textContent = r.yd3WithWaste === 0 ? "" :
        r.yd3WithWaste < 1
          ? "Under 1 cubic yard, bagged concrete is usually the easier option."
          : "Over 1 cubic yard, ready-mix delivery is usually cheaper and faster than mixing bags.";
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
  showShape(currentShape());
})(this);
