/* Ruler Square — Concrete Calculator
 * Supports slabs, footings/walls, round columns, round slabs, steps/stairs, and curb & gutter.
 * Measurement inputs stay empty on load; computes live once required values are entered.
 */
(function (root) {
  "use strict";

  var FT3_PER_YD3 = 27;
  var M3_PER_FT3 = 0.028316846592;
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
  function len(v, name) {
    return num(v[name]) * (FT_PER[v[name + "Unit"]] || 1);
  }

  function volumeFt3(shape, v) {
    switch (shape) {
      case "slab":
        return len(v, "length") * len(v, "width") * len(v, "thickness");
      case "footing":
        return len(v, "fLength") * len(v, "fWidth") * len(v, "fDepth");
      case "column": {
        var r = len(v, "diameter") / 2;
        return Math.PI * r * r * len(v, "height");
      }
      case "circle": {
        var rc = len(v, "cDiameter") / 2;
        return Math.PI * rc * rc * len(v, "cThickness");
      }
      case "steps": {
        var n = Math.max(1, Math.floor(num(v.stepCount)));
        var w = len(v, "stepWidth");
        var rise = len(v, "riserHeight");
        var tread = len(v, "treadDepth");
        var plat = len(v, "platformDepth") || tread;
        var lower = tread * ((n - 1) * n / 2);
        return w * rise * (lower + plat * n);
      }
      case "curb": {
        var cLen = len(v, "curbLength");
        var cDepth = len(v, "curbDepth");
        var cHeight = len(v, "curbHeight");
        var gWidth = len(v, "gutterWidth");
        var flag = len(v, "flagThickness");
        return cLen * (cDepth * cHeight + (cDepth + gWidth) * flag);
      }
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
      weightLb: ft3w * 150,
      weightTons: ft3w * 150 / 2000,
      bags: BAGS.map(function (b) {
        return { lb: b.lb, count: ft3w > 0 ? Math.ceil(ft3w / b.yield - 1e-9) : 0 };
      }),
      orderYd3: yd3w > 0 ? Math.ceil(yd3w * 4 - 1e-9) / 4 : 0,
      cost: price > 0 ? yd3w * price : null
    };
  }

  var api = { calc: calc, volumeFt3: volumeFt3, BAGS: BAGS, FT_PER: FT_PER };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  if (typeof document === "undefined") { return; }

  function fmt(n, d) {
    return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  var form = document.getElementById("concrete-form");
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
    return c ? c.value : "slab";
  }
  function showShape(shape) {
    Array.prototype.forEach.call(form.querySelectorAll(".shape"), function (s) {
      var hide = s.getAttribute("data-shape") !== shape;
      s.hidden = hide;
      s.querySelectorAll("input,select").forEach(function (el) { el.disabled = hide; });
    });
    if (window.RSShowDiagram) { window.RSShowDiagram(shape); }
  }
  function set(id, text) { var el = document.getElementById(id); if (el) { el.textContent = text; } }

  var submitted = false;

  function renderResult(shape) {
    var empty = document.getElementById("r-empty");
    var out = document.getElementById("r-out");
    var err = form.querySelector(".form-error");
    if (err) { err.hidden = true; }
    if (empty) { empty.hidden = true; }
    if (out) { out.hidden = false; }

    var r = calc(shape, values());
    set("r-yd3", fmt(r.yd3WithWaste, 2));
    set("r-ft3", fmt(r.ft3WithWaste, 1));
    set("r-m3", fmt(r.m3WithWaste, 2));
    set("r-weight", r.weightLb > 0 ? fmt(r.weightLb, 0) + " lb (" + fmt(r.weightTons, 2) + " tons)" : "—");
    set("r-order", r.orderYd3 > 0 ? fmt(r.orderYd3, 2) + " yd³" : "—");
    r.bags.forEach(function (b) {
      set("r-bag" + b.lb, b.count ? fmt(b.count, 0) + " bags (" + fmt(b.count * b.lb, 0) + " lb)" : "—");
    });
    var costBox = document.getElementById("r-cost-box");
    if (costBox) {
      if (r.cost !== null && r.yd3WithWaste > 0) {
        costBox.hidden = false;
        set("r-cost", "$" + fmt(r.cost, 0));
      } else {
        costBox.hidden = true;
      }
    }
    var tip = document.getElementById("r-tip");
    if (tip) {
      tip.textContent = r.yd3WithWaste === 0 ? "" :
        r.yd3WithWaste < 1
          ? "Under 1 cubic yard — bagged mix is usually easier and avoids short-load delivery fees."
          : "Over 1 cubic yard — ready-mix truck delivery is typically cheaper and faster than mixing bags.";
    }
    if (window.RSInitResultTools) { window.RSInitResultTools(form); }
  }

  function update(report) {
    var shape = currentShape();
    showShape(shape);
    if (report === true) {
      submitted = true;
      if (!window.RSValidate(form, true)) { return; }
      renderResult(shape);
      return;
    }
    if (window.RSReadyToCalc && window.RSReadyToCalc(form)) {
      renderResult(shape);
    } else if (submitted) {
      window.RSValidate(form, false);
    } else {
      var out = document.getElementById("r-out");
      var empty = document.getElementById("r-empty");
      if (out) { out.hidden = true; }
      if (empty) { empty.hidden = false; }
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    update(true);
    var out = document.getElementById("r-out");
    if (out && !out.hidden && window.RSRevealResult) { window.RSRevealResult(form); }
  });
  form.addEventListener("input", function () { update(false); });
  form.addEventListener("change", function () { update(false); });

  var exBtn = document.getElementById("use-example");
  if (exBtn) {
    exBtn.addEventListener("click", function () {
      form.reset();
      var radio = form.querySelector('input[name="shape"][value="slab"]');
      if (radio) { radio.checked = true; }
      showShape("slab");
      form.elements.length.value = "10";
      form.elements.width.value = "12";
      form.elements.thickness.value = "4";
      form.elements.waste.value = "10";
      update(true);
    });
  }
  var resetBtn = document.getElementById("reset-calc");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      form.reset();
      submitted = false;
      showShape(currentShape());
      var out = document.getElementById("r-out");
      var empty = document.getElementById("r-empty");
      var err = form.querySelector(".form-error");
      if (out) { out.hidden = true; }
      if (empty) { empty.hidden = false; }
      if (err) { err.hidden = true; }
    });
  }
  form.addEventListener("click", function (e) {
    var chip = e.target.closest("[data-preset]");
    if (!chip) { return; }
    try {
      var data = JSON.parse(chip.getAttribute("data-preset"));
      form.reset();
      if (data.shape) {
        var r = form.querySelector('input[name="shape"][value="' + data.shape + '"]');
        if (r) { r.checked = true; }
      }
      showShape(currentShape());
      Object.keys(data).forEach(function (k) {
        if (k === "shape") { return; }
        var el = form.elements.namedItem(k);
        if (el) { el.value = data[k]; }
      });
      update(true);
    } catch (err) {}
  });

  showShape(currentShape());
  if (window.RSLoadQuery) {
    window.RSLoadQuery(form, function () { showShape(currentShape()); update(false); });
  }
})(this);
